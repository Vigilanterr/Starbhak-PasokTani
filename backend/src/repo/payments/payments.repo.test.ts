import { afterAll, describe, expect, test } from 'bun:test';
import { sql } from 'kysely';
import { closeDb, getDb } from '../db';
import { CheckViolationError, mapDbError } from '../errors';
import type { Executor } from '../executor';
import { settleDeferred, withRollback } from '../test-utils';
import { ensureFarmerProfile, insertBankAccount } from '../farmers/farmers.repo';
import { ensureUser } from '../identity/identity.repo';
import { listDistrictsForRegency, listRegencies } from '../identity/reference.repo';
import { insertCheckout, insertFeeSetting, insertOrder, insertShipment } from '../orders/orders.repo';
import {
  createPayment, findLedgerAccount, findPaymentForPayer, getOrCreateLedgerAccount, insertPayout, insertRefund,
  lockEscrowReleaseCandidates, listWalletHistory, markWebhookFailed, markWebhookProcessed,
  postLedgerTransaction, recordWebhookEvent, setEscrowStatus, setPayoutStatus, setPaymentStatus,
  setRefundStatus,
} from './payments.repo';

afterAll(closeDb);

const DAY_MS = 24 * 60 * 60 * 1000;

/** Real neon_auth.user ids. users.id has a foreign key to them. Rolled back, so reuse is safe. */
async function authIds(trx: Executor, n: number): Promise<string[]> {
  const rows = await trx.selectFrom('neon_auth.user').select('id').orderBy('id').limit(n).execute();
  if (rows.length < n) throw new Error(`need ${n} neon_auth users, found ${rows.length}`);
  return rows.map((r) => r.id);
}

async function consumer(trx: Executor, id: string) {
  return ensureUser(trx, { id, fullName: 'Pembeli Uji', role: 'consumer' });
}

async function farmer(trx: Executor, id: string) {
  await ensureUser(trx, { id, fullName: 'Pak Tani', role: 'farmer' });
  const regency = (await listRegencies(trx, 1))[0]!;
  const district = (await listDistrictsForRegency(trx, regency.code, 1))[0]!;
  return ensureFarmerProfile(trx, {
    userId: id,
    shopName: 'Tani Pembayaran',
    slug: `toko-${id}`,
    regencyCode: regency.code,
    districtCode: district.code,
  });
}

interface Fixture {
  buyerId: string;
  buyer2Id: string;
  farmerId: string;
  feeId: string;
  checkoutId: string;
}

/** Two buyers, one farmer, a fee version in effect, and a checkout of 60,600 for the first buyer. */
async function fixture(trx: Executor): Promise<Fixture> {
  const [buyerId, buyer2Id, farmerId] = await authIds(trx, 3) as [string, string, string];
  await consumer(trx, buyerId);
  await consumer(trx, buyer2Id);
  await farmer(trx, farmerId);
  // effective_from is unique, so jitter it to avoid collisions with other fee rows.
  const fee = await insertFeeSetting(trx, {
    commissionPct: 3,
    serviceFeePct: 1,
    effectiveFrom: new Date(Date.now() - DAY_MS - Math.floor(Math.random() * 1e9)),
    createdBy: buyerId,
  });
  const checkout = await insertCheckout(trx, { buyerId, goodsTotal: 60000, grandTotal: 60600 });
  return { buyerId, buyer2Id, farmerId, feeId: fee.id, checkoutId: checkout.id };
}

function paymentInput(f: Fixture, key: string, overrides: { payerId?: string; checkoutId?: string | null; commitmentId?: string | null } = {}) {
  return {
    payerId: overrides.payerId ?? f.buyerId,
    purpose: 'checkout' as const,
    checkoutId: overrides.checkoutId === undefined ? f.checkoutId : overrides.checkoutId,
    commitmentId: overrides.commitmentId ?? null,
    method: 'qris' as const,
    provider: 'midtrans',
    idempotencyKey: key,
    amount: 60600,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  };
}

/** The balance of one account as Postgres sees it now. */
async function balanceOf(trx: Executor, accountId: string): Promise<bigint> {
  const row = await trx.selectFrom('ledger_accounts').select('balance').where('id', '=', accountId).executeTakeFirstOrThrow();
  return BigInt(row.balance);
}

async function countWebhookRows(trx: Executor, providerEventId: string): Promise<number> {
  const row = await trx.selectFrom('payment_webhook_events')
    .select(sql<string>`count(*)::text`.as('n'))
    .where('provider_event_id', '=', providerEventId)
    .executeTakeFirstOrThrow();
  return Number(row.n);
}

// ---------- Payments ----------

describe('payments', () => {
  test('the same idempotency key returns the stored payment and creates nothing new', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const key = `pay-${crypto.randomUUID()}`;
      const first = await createPayment(trx, paymentInput(f, key));
      const second = await createPayment(trx, paymentInput(f, key));
      expect(first?.created).toBe(true);
      expect(second?.created).toBe(false);
      expect(second?.payment.id).toBe(first?.payment.id);
    });
  });

  test('a key that belongs to another payer returns undefined', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const key = `pay-${crypto.randomUUID()}`;
      await createPayment(trx, paymentInput(f, key));
      const other = await createPayment(trx, paymentInput(f, key, { payerId: f.buyer2Id }));
      expect(other).toBeUndefined();
    });
  });

  test('a payment with no target fails with chk_payment_target', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const err = await createPayment(trx, paymentInput(f, `pay-${crypto.randomUUID()}`, { checkoutId: null }))
        .catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_payment_target');
    });
  });

  test('a payment moves from pending to paid once, and a late repeat changes nothing', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const created = (await createPayment(trx, paymentInput(f, `pay-${crypto.randomUUID()}`)))!;
      const paid = await setPaymentStatus(trx, { paymentId: created.payment.id, from: 'pending', to: 'paid' });
      expect(paid?.status).toBe('paid');
      expect(paid?.paid_at).toBeInstanceOf(Date);

      const late = await setPaymentStatus(trx, { paymentId: created.payment.id, from: 'pending', to: 'expired' });
      expect(late).toBeUndefined();
      const stored = await findPaymentForPayer(trx, created.payment.id, f.buyerId);
      expect(stored?.status).toBe('paid');
    });
  });
});

// ---------- Webhook inbox ----------

describe('webhook inbox', () => {
  test('replaying a webhook changes nothing: one row and no second processing', async () => {
    await withRollback(async (trx) => {
      const eventId = `evt-${crypto.randomUUID()}`;
      const input = {
        provider: 'midtrans',
        providerEventId: eventId,
        eventType: 'settlement',
        payload: { order_id: 'X', status_code: '200' },
        signatureValid: true,
      };
      const first = await recordWebhookEvent(trx, input);
      const replay = await recordWebhookEvent(trx, input);
      expect(first).toBeDefined();
      expect(replay).toBeUndefined();
      expect(await countWebhookRows(trx, eventId)).toBe(1);

      expect(await markWebhookProcessed(trx, first!.id)).toBeDefined();
      expect(await markWebhookProcessed(trx, first!.id)).toBeUndefined();
    });
  });

  test('a failed run keeps the row for a retry and records the error', async () => {
    await withRollback(async (trx) => {
      const eventId = `evt-${crypto.randomUUID()}`;
      const row = (await recordWebhookEvent(trx, {
        provider: 'midtrans', providerEventId: eventId, eventType: 'settlement', payload: {}, signatureValid: true,
      }))!;
      await markWebhookFailed(trx, row.id, 'payment not found');
      const stored = await trx.selectFrom('payment_webhook_events')
        .select(['error', 'processed_at']).where('id', '=', row.id).executeTakeFirstOrThrow();
      expect(stored.error).toBe('payment not found');
      expect(stored.processed_at).toBeNull();
    });
  });
});

// ---------- Ledger ----------

describe('ledger', () => {
  test('a system account with a null owner is unique, so get-or-create returns the same row', async () => {
    await withRollback(async (trx) => {
      const a = await getOrCreateLedgerAccount(trx, { ownerId: null, type: 'escrow' });
      const b = await getOrCreateLedgerAccount(trx, { ownerId: null, type: 'escrow' });
      expect(b.id).toBe(a.id);
      expect((await findLedgerAccount(trx, { ownerId: null, type: 'escrow' }))?.id).toBe(a.id);
    });
  });

  test('a balanced posting moves both balances once it commits, and not before', async () => {
    await withRollback(async (trx) => {
      const clearing = await getOrCreateLedgerAccount(trx, { ownerId: null, type: 'payment_clearing' });
      const escrow = await getOrCreateLedgerAccount(trx, { ownerId: null, type: 'escrow' });
      const clearingBefore = await balanceOf(trx, clearing.id);
      const escrowBefore = await balanceOf(trx, escrow.id);

      const txn = await postLedgerTransaction(trx, {
        kind: 'payment_received',
        idempotencyKey: `pay-in-${crypto.randomUUID()}`,
        entries: [
          { accountId: clearing.id, amount: -101000 },
          { accountId: escrow.id, amount: 101000 },
        ],
      });
      expect(txn).toBeDefined();
      expect(await balanceOf(trx, escrow.id)).toBe(escrowBefore);

      await settleDeferred(trx);
      expect(await balanceOf(trx, escrow.id)).toBe(escrowBefore + 101000n);
      expect(await balanceOf(trx, clearing.id)).toBe(clearingBefore - 101000n);
    });
  });

  test('an unbalanced posting fails at commit with a CheckViolationError naming the imbalance', async () => {
    const err = await withRollback(async (trx) => {
      const clearing = await getOrCreateLedgerAccount(trx, { ownerId: null, type: 'payment_clearing' });
      const escrow = await getOrCreateLedgerAccount(trx, { ownerId: null, type: 'escrow' });
      await postLedgerTransaction(trx, {
        kind: 'payment_received',
        idempotencyKey: `bad-${crypto.randomUUID()}`,
        entries: [
          { accountId: clearing.id, amount: -101000 },
          { accountId: escrow.id, amount: 100000 },
        ],
      });
      await settleDeferred(trx);
    }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(CheckViolationError);
    expect((err as CheckViolationError).message).toMatch(/unbalanced/);
  });

  test('replaying a ledger idempotency key writes no entries and moves no balance twice', async () => {
    await withRollback(async (trx) => {
      const clearing = await getOrCreateLedgerAccount(trx, { ownerId: null, type: 'payment_clearing' });
      const escrow = await getOrCreateLedgerAccount(trx, { ownerId: null, type: 'escrow' });
      const escrowBefore = await balanceOf(trx, escrow.id);
      const input = {
        kind: 'payment_received' as const,
        idempotencyKey: `replay-${crypto.randomUUID()}`,
        entries: [
          { accountId: clearing.id, amount: -50000 },
          { accountId: escrow.id, amount: 50000 },
        ],
      };
      expect(await postLedgerTransaction(trx, input)).toBeDefined();
      expect(await postLedgerTransaction(trx, input)).toBeUndefined();
      await settleDeferred(trx);
      expect(await balanceOf(trx, escrow.id)).toBe(escrowBefore + 50000n);
    });
  });

  test('a posting with no entries is refused', async () => {
    await withRollback(async (trx) => {
      await expect(postLedgerTransaction(trx, {
        kind: 'adjustment', idempotencyKey: `none-${crypto.randomUUID()}`, entries: [],
      })).rejects.toThrow(/at least one entry/);
    });
  });

  test('postLedgerTransaction and the escrow lock outside a transaction throw', async () => {
    const posting = await postLedgerTransaction(getDb(), {
      kind: 'adjustment', idempotencyKey: `outside-${crypto.randomUUID()}`, entries: [{ accountId: crypto.randomUUID(), amount: 1 }],
    }).catch((e: unknown) => e);
    expect((posting as Error).message).toMatch(/must run inside a transaction/);
    expect(() => lockEscrowReleaseCandidates(getDb(), 10)).toThrow(/must run inside a transaction/);
  });

  test('wallet history is newest first, keyset pages do not overlap, and another owner sees nothing', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const clearing = await getOrCreateLedgerAccount(trx, { ownerId: null, type: 'payment_clearing' });
      const wallet = await getOrCreateLedgerAccount(trx, { ownerId: f.buyerId, type: 'buyer_wallet' });
      for (const amount of [10000, 20000, 30000]) {
        await postLedgerTransaction(trx, {
          kind: 'payment_received',
          idempotencyKey: `wallet-${crypto.randomUUID()}`,
          description: `Top up ${amount}`,
          entries: [
            { accountId: clearing.id, amount: -amount },
            { accountId: wallet.id, amount },
          ],
        });
      }
      await settleDeferred(trx);

      const firstPage = await listWalletHistory(trx, { accountId: wallet.id, ownerId: f.buyerId, afterId: null, limit: 2 });
      expect(firstPage).toHaveLength(3); // limit + 1 means a next page exists
      const shown = firstPage.slice(0, 2);
      const secondPage = await listWalletHistory(trx, {
        accountId: wallet.id, ownerId: f.buyerId, afterId: shown[1]!.id, limit: 2,
      });
      expect(secondPage).toHaveLength(1);

      const ids = [...shown, ...secondPage].map((r) => r.id);
      expect(new Set(ids).size).toBe(3);
      expect(shown[0]!.created_at.getTime()).toBeGreaterThanOrEqual(shown[1]!.created_at.getTime());
      expect(shown[0]!.kind).toBe('payment_received');

      const stranger = await listWalletHistory(trx, { accountId: wallet.id, ownerId: f.buyer2Id, afterId: null, limit: 10 });
      expect(stranger).toEqual([]);
    });
  });
});

// ---------- Escrow ----------

describe('escrow release', () => {
  /** An order with a shipment. The test sets the escrow state and the release time it needs. */
  async function heldOrder(trx: Executor, f: Fixture, o: { escrow: 'held' | 'disputed'; releaseInPast: boolean; confirmed?: boolean }) {
    const order = await insertOrder(trx, {
      code: `E-${crypto.randomUUID()}`,
      checkoutId: null,
      buyerId: f.buyerId,
      farmerId: f.farmerId,
      goodsSubtotal: 60000,
      serviceFee: 600,
      commissionFee: 1800,
      buyerTotal: 60600,
      farmerNet: 58200,
      commissionPct: 3,
      serviceFeePct: 1,
      feeSettingId: f.feeId,
    });
    await insertShipment(trx, { orderId: order.id, method: 'courier_regular' });
    await trx.updateTable('orders').set({ escrow_status: o.escrow }).where('id', '=', order.id).execute();
    const release = o.releaseInPast ? sql<Date>`now() - interval '1 hour'` : sql<Date>`now() + interval '3 days'`;
    await trx.updateTable('shipments')
      .set({
        arrived_at: sql<Date>`now() - interval '4 days'`,
        auto_release_at: release,
        received_confirmed_at: o.confirmed ? sql<Date>`now()` : null,
      })
      .where('order_id', '=', order.id)
      .execute();
    return order;
  }

  test('only held orders past auto_release_at with no confirmation are candidates', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const due = await heldOrder(trx, f, { escrow: 'held', releaseInPast: true });
      const disputed = await heldOrder(trx, f, { escrow: 'disputed', releaseInPast: true });
      const notYet = await heldOrder(trx, f, { escrow: 'held', releaseInPast: false });
      const confirmed = await heldOrder(trx, f, { escrow: 'held', releaseInPast: true, confirmed: true });

      const ids = (await lockEscrowReleaseCandidates(trx, 500)).map((r) => r.id);
      expect(ids).toContain(due.id);
      expect(ids).not.toContain(disputed.id);
      expect(ids).not.toContain(notYet.id);
      expect(ids).not.toContain(confirmed.id);
    });
  });

  test('escrow moves from held to released once', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const order = await heldOrder(trx, f, { escrow: 'held', releaseInPast: true });
      expect(await setEscrowStatus(trx, { orderId: order.id, from: 'held', to: 'released' })).toBeDefined();
      expect(await setEscrowStatus(trx, { orderId: order.id, from: 'held', to: 'released' })).toBeUndefined();
    });
  });
});

// ---------- Refunds and payouts ----------

describe('refunds', () => {
  test('a refund must name one target (chk_refund_target)', async () => {
    await withRollback(async (trx) => {
      const err = await insertRefund(trx, { amount: 60600, reason: 'Barang rusak' }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_refund_target');
    });
  });

  test('a refund completes once, and a stale status change writes nothing', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const order = await insertOrder(trx, {
        code: `R-${crypto.randomUUID()}`, checkoutId: null, buyerId: f.buyerId, farmerId: f.farmerId,
        goodsSubtotal: 60000, serviceFee: 600, commissionFee: 1800, buyerTotal: 60600, farmerNet: 58200,
        commissionPct: 3, serviceFeePct: 1, feeSettingId: f.feeId,
      });
      const refund = await insertRefund(trx, { orderId: order.id, amount: 60600, reason: 'Barang rusak' });
      expect(refund.to_wallet).toBe(true);
      expect(refund.status).toBe('pending');

      const done = await setRefundStatus(trx, { refundId: refund.id, from: 'pending', to: 'completed' });
      expect(done?.completed_at).toBeInstanceOf(Date);
      expect(await setRefundStatus(trx, { refundId: refund.id, from: 'pending', to: 'failed' })).toBeUndefined();
    });
  });
});

describe('payouts', () => {
  test('a zero payout fails with chk_payout_amount', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const bank = await insertBankAccount(trx, {
        farmerId: f.farmerId, bankCode: 'BCA', accountNumberEnc: Buffer.from('ciphertext-test'),
        accountNumberLast4: '1234', accountHolderName: 'Pak Tani', isPrimary: true,
      });
      const err = await insertPayout(trx, { farmerId: f.farmerId, bankAccountId: bank.id, amount: 0 }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_payout_amount');
    });
  });

  test('a payout moves requested, processing, completed, and a stale step writes nothing', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const bank = await insertBankAccount(trx, {
        farmerId: f.farmerId, bankCode: 'BCA', accountNumberEnc: Buffer.from('ciphertext-test'),
        accountNumberLast4: '1234', accountHolderName: 'Pak Tani', isPrimary: true,
      });
      const payout = await insertPayout(trx, { farmerId: f.farmerId, bankAccountId: bank.id, amount: 97000 });
      expect(payout.status).toBe('requested');

      const processing = await setPayoutStatus(trx, {
        payoutId: payout.id, from: 'requested', to: 'processing', providerRef: 'disb-1',
      });
      expect(processing?.provider_ref).toBe('disb-1');
      const completed = await setPayoutStatus(trx, { payoutId: payout.id, from: 'processing', to: 'completed' });
      expect(completed?.completed_at).toBeInstanceOf(Date);
      expect(await setPayoutStatus(trx, { payoutId: payout.id, from: 'requested', to: 'failed', failureReason: 'x' })).toBeUndefined();
    });
  });
});
