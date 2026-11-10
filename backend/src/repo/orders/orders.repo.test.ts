import { afterAll, describe, expect, test } from 'bun:test';
import { closeDb, getDb } from '../db';
import { CheckViolationError, UniqueViolationError, mapDbError } from '../errors';
import type { Executor } from '../executor';
import { withRollback } from '../test-utils';
import { insertProduct, receiveBatch, reserveStock, releaseReservation } from '../catalog/catalog.repo';
import { ensureFarmerProfile } from '../farmers/farmers.repo';
import { ensureUser } from '../identity/identity.repo';
import { listDistrictsForRegency, listRegencies } from '../identity/reference.repo';
import {
  completeOrder, convertReservation, findCheckoutForBuyer, findFeeSettingInEffect, findOrderForBuyer,
  findOrderForFarmer, findShipmentForParty, insertCheckout, insertFeeSetting, insertOrder,
  insertOrderItems, insertShipment, listActiveReservationsForOrder, listOrderItemsForParty,
  listOrdersForBuyer, listOrdersForFarmer, lockOverdueConfirmedOrders, lockUnpaidOrders,
  markShipmentArrived, setOrderStatus,
} from './orders.repo';

afterAll(closeDb);

/** Real neon_auth.user ids. users.id has a foreign key to them. Rolled back, so reuse is safe. */
async function authIds(trx: Executor, n: number): Promise<string[]> {
  const rows = await trx.selectFrom('neon_auth.user').select('id').orderBy('id').limit(n).execute();
  if (rows.length < n) throw new Error(`need ${n} neon_auth users, found ${rows.length}`);
  return rows.map((r) => r.id);
}

const DAY_MS = 24 * 60 * 60 * 1000;

async function consumer(trx: Executor, id: string) {
  return ensureUser(trx, { id, fullName: 'Pembeli Uji', role: 'consumer' });
}

async function farmer(trx: Executor, id: string) {
  await ensureUser(trx, { id, fullName: 'Pak Tani', role: 'farmer' });
  const regency = (await listRegencies(trx, 1))[0]!;
  const district = (await listDistrictsForRegency(trx, regency.code, 1))[0]!;
  return ensureFarmerProfile(trx, {
    userId: id,
    shopName: 'Tani Pesanan',
    slug: `toko-${id}`,
    regencyCode: regency.code,
    districtCode: district.code,
  });
}

/** A product with its own category, so the test owns it. */
async function product(trx: Executor, farmerId: string) {
  const slug = `kat-${crypto.randomUUID()}`;
  const cat = await trx.insertInto('categories').values({ slug, name: slug }).returning(['id']).executeTakeFirstOrThrow();
  return insertProduct(trx, {
    farmerId,
    categoryId: cat.id,
    slug: `uji-${crypto.randomUUID()}`,
    name: 'Bawang Merah',
    unit: 'kg',
    price: 30000,
  });
}

/** One fee version that is already in effect, so an order can point at it. */
async function feeSetting(trx: Executor, createdBy: string) {
  return insertFeeSetting(trx, {
    commissionPct: 3,
    serviceFeePct: 1,
    effectiveFrom: new Date(Date.now() - DAY_MS),
    createdBy,
  });
}

interface Fixture {
  buyerId: string;
  buyer2Id: string;
  farmerId: string;
  farmer2Id: string;
  productId: string;
  feeId: string;
}

/** Two buyers and two farmers, a product and a fee version. */
async function fixture(trx: Executor): Promise<Fixture> {
  const [buyerId, buyer2Id, farmerId, farmer2Id] = await authIds(trx, 4) as [string, string, string, string];
  await consumer(trx, buyerId);
  await consumer(trx, buyer2Id);
  await farmer(trx, farmerId);
  await farmer(trx, farmer2Id);
  const p = await product(trx, farmerId);
  const fee = await feeSetting(trx, buyerId);
  return { buyerId, buyer2Id, farmerId, farmer2Id, productId: p.id, feeId: fee.id };
}

/** An order for one farmer with one line: 2 kg at 30,000. Goods 60,000, service fee 600, buyer pays 60,600. */
async function placeOrder(trx: Executor, f: Fixture, o: {
  farmerId: string;
  checkoutId?: string | null;
  paymentDueAt?: Date | null;
  respondBy?: Date | null;
}) {
  const order = await insertOrder(trx, {
    code: `T-${crypto.randomUUID()}`,
    checkoutId: o.checkoutId ?? null,
    buyerId: f.buyerId,
    farmerId: o.farmerId,
    goodsSubtotal: 60000,
    serviceFee: 600,
    commissionFee: 1800,
    buyerTotal: 60600,
    farmerNet: 58200,
    commissionPct: 3,
    serviceFeePct: 1,
    feeSettingId: f.feeId,
    paymentDueAt: o.paymentDueAt ?? null,
    respondBy: o.respondBy ?? null,
  });
  const [item] = await insertOrderItems(trx, order.id, [{
    productId: f.productId,
    productName: 'Bawang Merah',
    unit: 'kg',
    quantity: 2,
    tierUnitPrice: 30000,
    lineSubtotal: 60000,
  }]);
  return { order, item: item! };
}

async function advance(trx: Executor, orderId: string, from: Parameters<typeof setOrderStatus>[1]['from'], to: Parameters<typeof setOrderStatus>[1]['to'], actorId: string | null = null) {
  const row = await setOrderStatus(trx, { orderId, from, to, actorId });
  if (!row) throw new Error(`could not move ${orderId} from ${from} to ${to}`);
  return row;
}

describe('platform fee settings', () => {
  test('findFeeSettingInEffect ignores a future-dated version', async () => {
    await withRollback(async (trx) => {
      const [buyerId] = await authIds(trx, 1);
      await consumer(trx, buyerId!);
      const past = await insertFeeSetting(trx, {
        commissionPct: 2, serviceFeePct: 1, effectiveFrom: new Date(Date.now() - 2 * DAY_MS), createdBy: buyerId!,
      });
      const future = await insertFeeSetting(trx, {
        commissionPct: 5, serviceFeePct: 2, effectiveFrom: new Date(Date.now() + 30 * DAY_MS), createdBy: buyerId!,
      });
      const current = await findFeeSettingInEffect(trx);
      expect(current).toBeDefined();
      expect(current!.id).not.toBe(future.id);
      expect(current!.effective_from.getTime()).toBeGreaterThanOrEqual(past.effective_from.getTime());
    });
  });

  test('commission above 5% fails with chk_commission_max', async () => {
    await withRollback(async (trx) => {
      const [buyerId] = await authIds(trx, 1);
      await consumer(trx, buyerId!);
      const err = await insertFeeSetting(trx, {
        commissionPct: 6, serviceFeePct: 1, effectiveFrom: new Date(Date.now() - 3 * DAY_MS), createdBy: buyerId!,
      }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_commission_max');
    });
  });

  test('two versions with the same effective_from fail with UniqueViolationError', async () => {
    await withRollback(async (trx) => {
      const [buyerId] = await authIds(trx, 1);
      await consumer(trx, buyerId!);
      const at = new Date(Date.now() - 4 * DAY_MS);
      await insertFeeSetting(trx, { commissionPct: 3, serviceFeePct: 1, effectiveFrom: at, createdBy: buyerId! });
      const err = await insertFeeSetting(trx, { commissionPct: 3, serviceFeePct: 1, effectiveFrom: at, createdBy: buyerId! }).catch(mapDbError);
      expect(err).toBeInstanceOf(UniqueViolationError);
      expect((err as UniqueViolationError).constraint).toBe('platform_fee_settings_effective_from_idx');
    });
  });
});

describe('checkout and orders', () => {
  test('one checkout holds one order per farmer, and each party sees only its own', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const checkout = await insertCheckout(trx, {
        buyerId: f.buyerId,
        addressSnapshot: { line: 'Jl. Uji 1', city: 'Kota Uji' },
        goodsTotal: 120000,
        serviceFeeTotal: 1200,
        grandTotal: 121200,
      });
      const a = await placeOrder(trx, f, { farmerId: f.farmerId, checkoutId: checkout.id });
      const b = await placeOrder(trx, f, { farmerId: f.farmer2Id, checkoutId: checkout.id });

      const snap = (await findCheckoutForBuyer(trx, checkout.id, f.buyerId))!;
      expect(snap.address_snapshot).toEqual({ line: 'Jl. Uji 1', city: 'Kota Uji' });

      expect(await findOrderForBuyer(trx, a.order.id, f.buyerId)).toBeDefined();
      expect(await findOrderForBuyer(trx, b.order.id, f.buyerId)).toBeDefined();
      expect(await findOrderForFarmer(trx, a.order.id, f.farmerId)).toBeDefined();
      expect(await findOrderForFarmer(trx, a.order.id, f.farmer2Id)).toBeUndefined();

      expect(await findOrderForBuyer(trx, a.order.id, f.buyer2Id)).toBeUndefined();
      expect(await findCheckoutForBuyer(trx, checkout.id, f.buyer2Id)).toBeUndefined();
      expect(await listOrderItemsForParty(trx, { orderId: a.order.id, userId: f.buyerId, limit: 10 })).toHaveLength(1);
      expect(await listOrderItemsForParty(trx, { orderId: a.order.id, userId: f.buyer2Id, limit: 10 })).toEqual([]);
    });
  });

  test('buyer_total that does not add up fails with chk_buyer_total', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const err = await insertOrder(trx, {
        code: `T-${crypto.randomUUID()}`,
        checkoutId: null,
        buyerId: f.buyerId,
        farmerId: f.farmerId,
        goodsSubtotal: 60000,
        serviceFee: 600,
        buyerTotal: 60000,
        farmerNet: 58200,
        commissionPct: 3,
        serviceFeePct: 1,
        feeSettingId: f.feeId,
      }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_buyer_total');
    });
  });

  test('an order line with zero quantity fails with chk_order_item_qty', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const order = await placeOrder(trx, f, { farmerId: f.farmerId });
      const err = await insertOrderItems(trx, order.order.id, [{
        productId: f.productId, productName: 'Bawang Merah', unit: 'kg', quantity: 0, tierUnitPrice: 30000, lineSubtotal: 0,
      }]).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_order_item_qty');
    });
  });

  test('an empty list of lines inserts nothing and returns []', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const order = await placeOrder(trx, f, { farmerId: f.farmerId });
      expect(await insertOrderItems(trx, order.order.id, [])).toEqual([]);
    });
  });

  test('orders list newest first, and keyset pages do not overlap', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const o1 = await placeOrder(trx, f, { farmerId: f.farmerId });
      const o2 = await placeOrder(trx, f, { farmerId: f.farmerId });
      const o3 = await placeOrder(trx, f, { farmerId: f.farmerId });

      const page1 = await listOrdersForBuyer(trx, { buyerId: f.buyerId, afterId: null, limit: 2 });
      expect(page1.map((r) => r.id)).toEqual([o3.order.id, o2.order.id, o1.order.id]);

      const page2 = await listOrdersForBuyer(trx, { buyerId: f.buyerId, afterId: page1[1]!.id, limit: 2 });
      expect(page2.map((r) => r.id)).toEqual([o1.order.id]);

      const seller = await listOrdersForFarmer(trx, { farmerId: f.farmerId, afterId: null, limit: 10 });
      expect(seller.map((r) => r.id)).toEqual([o3.order.id, o2.order.id, o1.order.id]);
      expect(await listOrdersForFarmer(trx, { farmerId: f.farmer2Id, afterId: null, limit: 10 })).toEqual([]);
    });
  });
});

describe('status and completion', () => {
  test('a stale from-state changes nothing and writes no history', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { order } = await placeOrder(trx, f, { farmerId: f.farmerId });
      const stale = await setOrderStatus(trx, {
        orderId: order.id, from: 'confirmed', to: 'processing', actorId: f.farmerId,
      });
      expect(stale).toBeUndefined();
      const history = await trx.selectFrom('order_status_history').select('id').where('order_id', '=', order.id).execute();
      expect(history).toHaveLength(0);
      expect((await findOrderForBuyer(trx, order.id, f.buyerId))!.status).toBe('awaiting_payment');
    });
  });

  test('a valid change sets the timestamp and writes one history row', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { order } = await placeOrder(trx, f, { farmerId: f.farmerId });
      const respondBy = new Date(Date.now() + DAY_MS);
      await setOrderStatus(trx, {
        orderId: order.id, from: 'awaiting_payment', to: 'confirmed', actorId: f.farmerId, respondBy,
      });
      const row = (await findOrderForBuyer(trx, order.id, f.buyerId))!;
      expect(row.status).toBe('confirmed');
      expect(row.confirmed_at).toBeInstanceOf(Date);
      expect(row.respond_by!.getTime()).toBe(respondBy.getTime());

      const history = await trx.selectFrom('order_status_history')
        .select(['from_status', 'to_status', 'actor_id'])
        .where('order_id', '=', order.id)
        .execute();
      expect(history).toEqual([{ from_status: 'awaiting_payment', to_status: 'confirmed', actor_id: f.farmerId }]);
    });
  });

  test('cancelling records the reason and the actor', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { order } = await placeOrder(trx, f, { farmerId: f.farmerId });
      await setOrderStatus(trx, {
        orderId: order.id,
        from: 'awaiting_payment',
        to: 'cancelled',
        actorId: f.buyerId,
        cancel: { reason: 'Berubah pikiran', by: f.buyerId },
      });
      const row = (await findOrderForBuyer(trx, order.id, f.buyerId))!;
      expect(row.status).toBe('cancelled');
      expect(row.cancelled_at).toBeInstanceOf(Date);
      expect(row.cancel_reason).toBe('Berubah pikiran');
      expect(row.cancelled_by).toBe(f.buyerId);
    });
  });

  test('setOrderStatus outside a transaction throws', async () => {
    const error = await setOrderStatus(getDb(), {
      orderId: '00000000-0000-0000-0000-000000000000',
      from: 'awaiting_payment',
      to: 'confirmed',
      actorId: null,
    }).catch((e: unknown) => e);
    expect((error as Error).message).toMatch(/must run inside a transaction/);
  });

  test('completing a shipped order moves sold_qty and the farmer count once', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { order } = await placeOrder(trx, f, { farmerId: f.farmerId });
      await advance(trx, order.id, 'awaiting_payment', 'confirmed', f.farmerId);
      await advance(trx, order.id, 'confirmed', 'processing', f.farmerId);
      await advance(trx, order.id, 'processing', 'shipped', f.farmerId);

      const done = await completeOrder(trx, { orderId: order.id, from: 'shipped', actorId: f.farmerId });
      expect(done?.status).toBe('completed');

      const p = await trx.selectFrom('products').select('sold_qty').where('id', '=', f.productId).executeTakeFirstOrThrow();
      expect(Number(p.sold_qty)).toBe(2);
      const fp = await trx.selectFrom('farmer_profiles').select('completed_order_count').where('user_id', '=', f.farmerId).executeTakeFirstOrThrow();
      expect(fp.completed_order_count).toBe(1);

      const replay = await completeOrder(trx, { orderId: order.id, from: 'shipped', actorId: f.farmerId });
      expect(replay).toBeUndefined();
      const p2 = await trx.selectFrom('products').select('sold_qty').where('id', '=', f.productId).executeTakeFirstOrThrow();
      expect(Number(p2.sold_qty)).toBe(2);
      const fp2 = await trx.selectFrom('farmer_profiles').select('completed_order_count').where('user_id', '=', f.farmerId).executeTakeFirstOrThrow();
      expect(fp2.completed_order_count).toBe(1);
    });
  });
});

describe('stock on sale', () => {
  test('a hold becomes a sale once: the batch shrinks, a movement and an allocation are written', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const batch = await receiveBatch(trx, {
        productId: f.productId, createdBy: f.farmerId, initialQty: 10, harvestedOn: '2026-11-01', expiresOn: '2030-12-31',
      });
      const { order, item } = await placeOrder(trx, f, { farmerId: f.farmerId });
      const hold = await reserveStock(trx, { batchId: batch!.id, orderItemId: item.id, quantity: 4 });
      expect(hold).toBeDefined();

      const open = await listActiveReservationsForOrder(trx, order.id, 10);
      expect(open.map((r) => r.id)).toEqual([hold!.id]);

      const sale = await convertReservation(trx, {
        reservationId: hold!.id, actorId: f.farmerId, unitPrice: 30000, surplusDiscountPct: null, lineAmount: 120000,
      });
      expect(sale).toBeDefined();
      expect(Number(sale!.qty)).toBe(4);

      const after = (await trx.selectFrom('product_batches').select(['on_hand_qty', 'reserved_qty']).where('id', '=', batch!.id).executeTakeFirstOrThrow());
      expect(Number(after.on_hand_qty)).toBe(6);
      expect(Number(after.reserved_qty)).toBe(0);

      const moves = await trx.selectFrom('stock_movements').select(['type', 'qty_delta']).where('order_item_id', '=', item.id).execute();
      expect(moves.map((m) => ({ type: m.type, qty: Number(m.qty_delta) }))).toEqual([{ type: 'sale', qty: -4 }]);

      expect(await listActiveReservationsForOrder(trx, order.id, 10)).toEqual([]);
      expect(await convertReservation(trx, {
        reservationId: hold!.id, actorId: f.farmerId, unitPrice: 30000, surplusDiscountPct: null, lineAmount: 120000,
      })).toBeUndefined();
    });
  });

  test('a released hold cannot be converted', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const batch = await receiveBatch(trx, {
        productId: f.productId, createdBy: f.farmerId, initialQty: 10, harvestedOn: '2026-11-01', expiresOn: '2030-12-31',
      });
      const { item } = await placeOrder(trx, f, { farmerId: f.farmerId });
      const hold = await reserveStock(trx, { batchId: batch!.id, orderItemId: item.id, quantity: 3 });
      await releaseReservation(trx, hold!.id);
      const result = await convertReservation(trx, {
        reservationId: hold!.id, actorId: f.farmerId, unitPrice: 30000, surplusDiscountPct: null, lineAmount: 90000,
      });
      expect(result).toBeUndefined();
    });
  });

  test('convertReservation outside a transaction throws', async () => {
    const error = await convertReservation(getDb(), {
      reservationId: '00000000-0000-0000-0000-000000000000',
      actorId: null,
      unitPrice: 1,
      surplusDiscountPct: null,
      lineAmount: 1,
    }).catch((e: unknown) => e);
    expect((error as Error).message).toMatch(/must run inside a transaction/);
  });
});

describe('shipments', () => {
  test('a second shipment for one order fails with UniqueViolationError', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { order } = await placeOrder(trx, f, { farmerId: f.farmerId });
      await insertShipment(trx, { orderId: order.id, method: 'pickup', shippingFee: 0 });
      const err = await insertShipment(trx, { orderId: order.id, method: 'pickup', shippingFee: 0 }).catch(mapDbError);
      expect(err).toBeInstanceOf(UniqueViolationError);
      expect((err as UniqueViolationError).constraint).toBe('shipments_order_id_key');
    });
  });

  test('arrival starts a 3-day window once, and only the parties can read the shipment', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { order } = await placeOrder(trx, f, { farmerId: f.farmerId });
      await insertShipment(trx, { orderId: order.id, method: 'courier_regular', courierCode: 'jne', shippingFee: 12000 });

      const arrived = await markShipmentArrived(trx, order.id);
      expect(arrived).toBeDefined();
      const window = arrived!.auto_release_at!.getTime() - arrived!.arrived_at!.getTime();
      expect(window).toBe(3 * DAY_MS);

      expect(await markShipmentArrived(trx, order.id)).toBeUndefined();
      expect(await findShipmentForParty(trx, order.id, f.buyerId)).toBeDefined();
      expect(await findShipmentForParty(trx, order.id, f.farmerId)).toBeDefined();
      expect(await findShipmentForParty(trx, order.id, f.buyer2Id)).toBeUndefined();
    });
  });
});

describe('jobs', () => {
  test('unpaid orders: only awaiting_payment rows past their due time are claimed', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const overdue = await placeOrder(trx, f, { farmerId: f.farmerId, paymentDueAt: new Date(Date.now() - 3600_000) });
      const notYet = await placeOrder(trx, f, { farmerId: f.farmerId, paymentDueAt: new Date(Date.now() + 3600_000) });
      const paid = await placeOrder(trx, f, { farmerId: f.farmerId, paymentDueAt: new Date(Date.now() - 3600_000) });
      await advance(trx, paid.order.id, 'awaiting_payment', 'confirmed', null);

      const claimed = await lockUnpaidOrders(trx, 100);
      const ours = new Set([overdue.order.id, notYet.order.id, paid.order.id]);
      expect(claimed.filter((r) => ours.has(r.id)).map((r) => r.id)).toEqual([overdue.order.id]);
    });
  });

  test('overdue confirmed orders: only confirmed rows past respond_by are claimed', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const late = await placeOrder(trx, f, { farmerId: f.farmerId });
      await advance(trx, late.order.id, 'awaiting_payment', 'confirmed', null);
      await trx.updateTable('orders').set({ respond_by: new Date(Date.now() - 3600_000) }).where('id', '=', late.order.id).execute();

      const onTime = await placeOrder(trx, f, { farmerId: f.farmerId });
      await setOrderStatus(trx, {
        orderId: onTime.order.id, from: 'awaiting_payment', to: 'confirmed', actorId: null,
        respondBy: new Date(Date.now() + 3600_000),
      });

      const unpaid = await placeOrder(trx, f, { farmerId: f.farmerId, paymentDueAt: new Date(Date.now() + 3600_000) });

      const claimed = await lockOverdueConfirmedOrders(trx, 100);
      const ours = new Set([late.order.id, onTime.order.id, unpaid.order.id]);
      expect(claimed.filter((r) => ours.has(r.id)).map((r) => r.id)).toEqual([late.order.id]);
    });
  });

  test('job claims outside a transaction throw', async () => {
    expect(() => lockUnpaidOrders(getDb(), 10)).toThrow(/must run inside a transaction/);
    expect(() => lockOverdueConfirmedOrders(getDb(), 10)).toThrow(/must run inside a transaction/);
  });
});
