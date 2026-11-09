import { sql, type RawBuilder } from 'kysely';
import type { Executor } from '../executor';
import { requireTransaction } from '../executor';
import type {
  EscrowStatus, Json, LedgerAccountType, LedgerTxnKind, PaymentMethod, PaymentPurpose, PaymentStatus,
  PayoutStatus, RefundStatus,
} from '../db.generated';

type Money = string | number | bigint;

// ---------- Payments ----------

export const PAYMENT_COLUMNS = [
  'id', 'payer_id', 'purpose', 'checkout_id', 'commitment_id', 'method', 'provider', 'provider_ref',
  'idempotency_key', 'amount', 'status', 'va_bank', 'va_number', 'qr_string', 'expires_at', 'paid_at', 'created_at',
] as const;

export interface NewPayment {
  payerId: string;
  purpose: PaymentPurpose;
  /** Exactly one of checkoutId or commitmentId (chk_payment_target). */
  checkoutId?: string | null;
  commitmentId?: string | null;
  method: PaymentMethod;
  provider: string;
  providerRef?: string | null;
  idempotencyKey: string;
  amount: Money;
  expiresAt: Date;
  vaBank?: string | null;
  vaNumber?: string | null;
  qrString?: string | null;
}

/**
 * Creates a payment, or returns the one already stored under the same idempotency key.
 * `created` is false on a replay. A key that belongs to another payer returns undefined, and the
 * service decides the answer. A replay with different fields still returns the stored row, so the
 * service compares the amount itself if it needs to.
 */
export async function createPayment(db: Executor, p: NewPayment) {
  const created = await db.insertInto('payments')
    .values({
      payer_id: p.payerId,
      purpose: p.purpose,
      checkout_id: p.checkoutId ?? null,
      commitment_id: p.commitmentId ?? null,
      method: p.method,
      provider: p.provider,
      provider_ref: p.providerRef ?? null,
      idempotency_key: p.idempotencyKey,
      amount: String(p.amount),
      expires_at: p.expiresAt,
      va_bank: p.vaBank ?? null,
      va_number: p.vaNumber ?? null,
      qr_string: p.qrString ?? null,
    })
    .onConflict((oc) => oc.column('idempotency_key').doNothing())
    .returning(PAYMENT_COLUMNS)
    .executeTakeFirst();
  if (created) return { payment: created, created: true };

  const existing = await db.selectFrom('payments')
    .select(PAYMENT_COLUMNS)
    .where('idempotency_key', '=', p.idempotencyKey)
    .where('payer_id', '=', p.payerId)
    .executeTakeFirst();
  return existing ? { payment: existing, created: false } : undefined;
}

/** Owner-scoped read. A guessed payment id of another payer returns nothing. */
export function findPaymentForPayer(db: Executor, paymentId: string, payerId: string) {
  return db.selectFrom('payments').select(PAYMENT_COLUMNS).where('id', '=', paymentId).where('payer_id', '=', payerId).executeTakeFirst();
}

/**
 * Guarded status change. paid_at is set by Postgres when the new status is paid.
 * undefined means the payment was not in `from`, so a late webhook changes nothing.
 */
export function setPaymentStatus(db: Executor, a: { paymentId: string; from: PaymentStatus; to: PaymentStatus }) {
  const set: { status: PaymentStatus; paid_at?: RawBuilder<Date> } = { status: a.to };
  if (a.to === 'paid') set.paid_at = sql<Date>`now()`;
  return db.updateTable('payments')
    .set(set)
    .where('id', '=', a.paymentId)
    .where('status', '=', a.from)
    .returning(PAYMENT_COLUMNS)
    .executeTakeFirst();
}

// ---------- Webhook inbox ----------

export interface NewWebhookEvent {
  provider: string;
  providerEventId: string;
  eventType: string;
  payload: Json;
  signatureValid: boolean;
}

/**
 * Stores a gateway callback once, under the unique (provider, provider_event_id).
 * undefined means a replay: nothing was written, so the caller must not process it again.
 */
export function recordWebhookEvent(db: Executor, e: NewWebhookEvent) {
  return db.insertInto('payment_webhook_events')
    .values({
      provider: e.provider,
      provider_event_id: e.providerEventId,
      event_type: e.eventType,
      payload: JSON.stringify(e.payload),
      signature_valid: e.signatureValid,
    })
    .onConflict((oc) => oc.columns(['provider', 'provider_event_id']).doNothing())
    .returning('id')
    .executeTakeFirst();
}

/** Marks an inbox row processed. Only the first call sets processed_at, so a repeat changes nothing. */
export function markWebhookProcessed(db: Executor, webhookId: string) {
  return db.updateTable('payment_webhook_events')
    .set({ processed_at: sql<Date>`now()`, error: null })
    .where('id', '=', webhookId)
    .where('processed_at', 'is', null)
    .returning('id')
    .executeTakeFirst();
}

/** Records why processing failed and leaves processed_at empty, so the row stays visible for a retry. */
export function markWebhookFailed(db: Executor, webhookId: string, error: string) {
  return db.updateTable('payment_webhook_events')
    .set({ error })
    .where('id', '=', webhookId)
    .where('processed_at', 'is', null)
    .returning('id')
    .executeTakeFirst();
}

// ---------- Ledger accounts ----------

export const LEDGER_ACCOUNT_COLUMNS = ['id', 'owner_id', 'type', 'balance', 'created_at'] as const;

/**
 * One row per wallet or system account. ledger_accounts is unique on (owner_id, type) NULLS NOT DISTINCT,
 * so a system account (owner null) is also unique. Returns the stored row. balance is the cached total,
 * so it reflects entries only after the posting transaction has committed.
 */
export async function getOrCreateLedgerAccount(db: Executor, a: { ownerId: string | null; type: LedgerAccountType }) {
  const created = await db.insertInto('ledger_accounts')
    .values({ owner_id: a.ownerId, type: a.type })
    .onConflict((oc) => oc.columns(['owner_id', 'type']).doNothing())
    .returning(LEDGER_ACCOUNT_COLUMNS)
    .executeTakeFirst();
  if (created) return created;
  return accountQuery(db, a).executeTakeFirstOrThrow();
}

/** The owner's wallet or system account of one type, read only. undefined when none exists yet. */
export function findLedgerAccount(db: Executor, a: { ownerId: string | null; type: LedgerAccountType }) {
  return accountQuery(db, a).executeTakeFirst();
}

function accountQuery(db: Executor, a: { ownerId: string | null; type: LedgerAccountType }) {
  const q = db.selectFrom('ledger_accounts').select(LEDGER_ACCOUNT_COLUMNS).where('type', '=', a.type);
  return a.ownerId === null ? q.where('owner_id', 'is', null) : q.where('owner_id', '=', a.ownerId);
}

// ---------- Ledger postings ----------

export interface LedgerEntryInput {
  accountId: string;
  /** Signed: positive credits the account, negative debits it. Zero is rejected (chk_entry_nonzero). */
  amount: Money;
}

export interface NewLedgerTransaction {
  kind: LedgerTxnKind;
  idempotencyKey: string;
  description?: string | null;
  orderId?: string | null;
  commitmentId?: string | null;
  paymentId?: string | null;
  refundId?: string | null;
  payoutId?: string | null;
  entries: LedgerEntryInput[];
}

/**
 * Writes one ledger transaction and all its entries. Requires a transaction.
 *
 * The entries go in one multi-row INSERT, so the deferred balance trigger sees them all at once.
 * The sum-to-zero check and the balance update run at COMMIT, so an unbalanced posting fails there
 * with a CheckViolationError whose message contains "unbalanced". Run this through withTransaction,
 * which maps that error. A replay of the idempotency key returns undefined and writes no entries.
 */
export async function postLedgerTransaction(db: Executor, t: NewLedgerTransaction) {
  requireTransaction(db, 'postLedgerTransaction');
  if (t.entries.length === 0) throw new Error('postLedgerTransaction needs at least one entry');

  const txn = await db.insertInto('ledger_transactions')
    .values({
      kind: t.kind,
      idempotency_key: t.idempotencyKey,
      description: t.description ?? null,
      order_id: t.orderId ?? null,
      commitment_id: t.commitmentId ?? null,
      payment_id: t.paymentId ?? null,
      refund_id: t.refundId ?? null,
      payout_id: t.payoutId ?? null,
    })
    .onConflict((oc) => oc.column('idempotency_key').doNothing())
    .returning('id')
    .executeTakeFirst();
  if (!txn) return undefined;

  await db.insertInto('ledger_entries')
    .values(t.entries.map((e) => ({ transaction_id: txn.id, account_id: e.accountId, amount: String(e.amount) })))
    .execute();
  return txn;
}

/**
 * The owner's wallet history, newest first, by (created_at, id). Matches ledger_entries (account_id, created_at).
 * Owner-scoped through the account, so another owner's account id returns nothing.
 * Pass the id of the last row of the previous page as `afterId`. Returns up to limit + 1 rows.
 */
export function listWalletHistory(db: Executor, a: { accountId: string; ownerId: string; afterId: string | null; limit: number }) {
  let q = db.selectFrom('ledger_entries as e')
    .innerJoin('ledger_transactions as t', 't.id', 'e.transaction_id')
    .innerJoin('ledger_accounts as acc', 'acc.id', 'e.account_id')
    .select([
      'e.id', 'e.amount', 'e.created_at', 't.kind', 't.description',
      't.order_id', 't.commitment_id', 't.payment_id', 't.refund_id', 't.payout_id',
    ])
    .where('e.account_id', '=', a.accountId)
    .where('acc.owner_id', '=', a.ownerId);
  if (a.afterId) {
    q = q.where(sql<boolean>`(e.created_at, e.id) < (select created_at, id from ledger_entries where id = ${a.afterId}::uuid)`);
  }
  return q.orderBy('e.created_at', 'desc').orderBy('e.id', 'desc').limit(a.limit + 1).execute();
}

// ---------- Escrow ----------

/**
 * Escrow auto-release candidates: orders still held whose shipment is unconfirmed and past auto_release_at.
 * Disputed orders are excluded by escrow_status, because a complaint sets it to disputed.
 * The EXISTS repeats the partial index predicate (shipments_auto_release). Requires a transaction.
 */
export function lockEscrowReleaseCandidates(db: Executor, limit: number) {
  requireTransaction(db, 'lockEscrowReleaseCandidates');
  return db.selectFrom('orders')
    .select(['id', 'code', 'buyer_id', 'farmer_id', 'buyer_total', 'farmer_net', 'commission_fee', 'service_fee'])
    .where('escrow_status', '=', 'held')
    .where(sql<boolean>`exists (
      select 1 from shipments s
      where s.order_id = orders.id
        and s.received_confirmed_at is null
        and s.auto_release_at < now()
    )`)
    .orderBy('id', 'asc')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute();
}

/** Guarded escrow status change. undefined when the order was not in `from`. */
export function setEscrowStatus(db: Executor, a: { orderId: string; from: EscrowStatus; to: EscrowStatus }) {
  return db.updateTable('orders')
    .set({ escrow_status: a.to })
    .where('id', '=', a.orderId)
    .where('escrow_status', '=', a.from)
    .returning(['id', 'escrow_status'])
    .executeTakeFirst();
}

// ---------- Refunds ----------

export const REFUND_COLUMNS = [
  'id', 'order_id', 'commitment_id', 'complaint_id', 'amount', 'reason', 'to_wallet', 'status',
  'approved_by', 'created_at', 'completed_at',
] as const;

export interface NewRefund {
  /** Exactly one of orderId or commitmentId (chk_refund_target). */
  orderId?: string | null;
  commitmentId?: string | null;
  complaintId?: string | null;
  amount: Money;
  reason: string;
  toWallet?: boolean;
  approvedBy?: string | null;
}

export function insertRefund(db: Executor, r: NewRefund) {
  return db.insertInto('refunds')
    .values({
      order_id: r.orderId ?? null,
      commitment_id: r.commitmentId ?? null,
      complaint_id: r.complaintId ?? null,
      amount: String(r.amount),
      reason: r.reason,
      to_wallet: r.toWallet,
      approved_by: r.approvedBy ?? null,
    })
    .returning(REFUND_COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Guarded status change. completed_at is set by Postgres when the refund completes. */
export function setRefundStatus(db: Executor, a: { refundId: string; from: RefundStatus; to: RefundStatus }) {
  const set: { status: RefundStatus; completed_at?: RawBuilder<Date> } = { status: a.to };
  if (a.to === 'completed') set.completed_at = sql<Date>`now()`;
  return db.updateTable('refunds')
    .set(set)
    .where('id', '=', a.refundId)
    .where('status', '=', a.from)
    .returning(REFUND_COLUMNS)
    .executeTakeFirst();
}

// ---------- Payouts ----------

export const PAYOUT_COLUMNS = [
  'id', 'farmer_id', 'bank_account_id', 'amount', 'status', 'provider_ref', 'failure_reason',
  'requested_at', 'completed_at',
] as const;

/**
 * Records a payout request. The farmer's balance is debited by the service in the same transaction,
 * through postLedgerTransaction. This query does not check verification or the bank account owner.
 */
export function insertPayout(db: Executor, p: { farmerId: string; bankAccountId: string; amount: Money }) {
  return db.insertInto('payouts')
    .values({ farmer_id: p.farmerId, bank_account_id: p.bankAccountId, amount: String(p.amount) })
    .returning(PAYOUT_COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Guarded status change. completed_at is set by Postgres when the payout completes. */
export function setPayoutStatus(db: Executor, a: {
  payoutId: string;
  from: PayoutStatus;
  to: PayoutStatus;
  providerRef?: string | null;
  failureReason?: string | null;
}) {
  const set: {
    status: PayoutStatus;
    provider_ref?: string | null;
    failure_reason?: string | null;
    completed_at?: RawBuilder<Date>;
  } = { status: a.to };
  if (a.providerRef !== undefined) set.provider_ref = a.providerRef;
  if (a.failureReason !== undefined) set.failure_reason = a.failureReason;
  if (a.to === 'completed') set.completed_at = sql<Date>`now()`;
  return db.updateTable('payouts')
    .set(set)
    .where('id', '=', a.payoutId)
    .where('status', '=', a.from)
    .returning(PAYOUT_COLUMNS)
    .executeTakeFirst();
}
