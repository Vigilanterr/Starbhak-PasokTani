import { afterAll, describe, expect, test } from 'bun:test';
import { sql } from 'kysely';
import { closeDb, getDb } from '../db';
import type { Executor } from '../executor';
import { withRollback } from '../test-utils';
import { insertProduct, setProductPrice, upsertProductSubscription } from '../catalog/catalog.repo';
import { ensureFarmerProfile } from '../farmers/farmers.repo';
import { ensureUser } from '../identity/identity.repo';
import { listDistrictsForRegency, listRegencies } from '../identity/reference.repo';
import { insertFeeSetting, insertOrder, insertOrderItems, setOrderStatus } from '../orders/orders.repo';
import { changeWaitlistStatus, findWaitlistById, insertWaitlist } from '../waitlist/waitlist.repo';
import {
  findAdminOverview, findCounterDrift, findPlatformSetting, flushProductDayCounters, listAuditLogsForEntity,
  listPlatformSettings, listProductDailyStatsForFarmer, rankProductsBySales, rollupSalesForDay,
  rollupSubscriptionsForDay, upsertPlatformSetting,
} from './admin.repo';

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
    shopName: 'Tani Analitik',
    slug: `toko-${id}`,
    regencyCode: regency.code,
    districtCode: district.code,
  });
}

/** A product with its own category, so the test owns it. */
async function product(trx: Executor, farmerId: string, name: string) {
  const slug = `kat-${crypto.randomUUID()}`;
  const cat = await trx.insertInto('categories').values({ slug, name: slug }).returning(['id']).executeTakeFirstOrThrow();
  return insertProduct(trx, {
    farmerId,
    categoryId: cat.id,
    slug: `uji-${crypto.randomUUID()}`,
    name,
    unit: 'kg',
    price: 30000,
  });
}

interface Fixture {
  buyerId: string;
  farmerId: string;
  productId: string;
  product2Id: string;
  feeId: string;
}

/** One buyer, one farmer, two products and a fee version that is already in effect. */
async function fixture(trx: Executor): Promise<Fixture> {
  const [buyerId, farmerId] = await authIds(trx, 2) as [string, string];
  await consumer(trx, buyerId);
  await farmer(trx, farmerId);
  const p1 = await product(trx, farmerId, 'Cabai Rawit');
  const p2 = await product(trx, farmerId, 'Bayam');
  const fee = await insertFeeSetting(trx, {
    commissionPct: 3,
    serviceFeePct: 1,
    effectiveFrom: new Date(Date.now() - DAY_MS),
    createdBy: buyerId,
  });
  return { buyerId, farmerId, productId: p1.id, product2Id: p2.id, feeId: fee.id };
}

/** One order for 2 kg of the product, awaiting payment. Goods 60000, buyer total 60600. */
async function order(trx: Executor, f: Fixture, productId: string) {
  const o = await insertOrder(trx, {
    code: `T-${crypto.randomUUID()}`,
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
  await insertOrderItems(trx, o.id, [{
    productId,
    productName: 'Cabai Rawit',
    unit: 'kg',
    quantity: 2,
    tierUnitPrice: 30000,
    lineSubtotal: 60000,
  }]);
  return o;
}

async function advance(trx: Executor, orderId: string, from: Parameters<typeof setOrderStatus>[1]['from'], to: Parameters<typeof setOrderStatus>[1]['to']) {
  const row = await setOrderStatus(trx, { orderId, from, to, actorId: null });
  if (!row) throw new Error(`could not move ${orderId} from ${from} to ${to}`);
  return row;
}

/** Today in Jakarta, from Postgres, so the test uses the same day as the repo. */
async function wibToday(trx: Executor): Promise<string> {
  const r = await sql<{ d: string }>`select (now() at time zone 'Asia/Jakarta')::date::text as d`.execute(trx);
  return r.rows[0]!.d;
}

async function dayRow(trx: Executor, productId: string, day: string) {
  return trx.selectFrom('product_daily_stats')
    .select(['views', 'add_to_carts', 'subscriptions', 'purchases', 'units_sold', 'revenue'])
    .where('product_id', '=', productId)
    .where(sql<boolean>`day = ${day}::date`)
    .executeTakeFirstOrThrow();
}

/** Sets app.user_id for the audit triggers. transaction-local, as withActor does. */
async function setActor(trx: Executor, userId: string) {
  await sql`select set_config('app.user_id', ${userId}, true)`.execute(trx);
}

describe('daily stats', () => {
  test('a second flush replaces the day totals, and an empty list writes nothing', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    const day = await wibToday(trx);
    await flushProductDayCounters(trx, day, [{ productId: f.productId, views: 10, addToCarts: 3 }]);
    await flushProductDayCounters(trx, day, [{ productId: f.productId, views: 12, addToCarts: 4 }]);
    await flushProductDayCounters(trx, day, []);
    const rows = await listProductDailyStatsForFarmer(trx, {
      productId: f.productId, farmerId: f.farmerId, fromDay: day, toDay: day, limit: 10,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ views: 12, add_to_carts: 4 });
  }));

  test('the sales rollup counts paid orders only, and a cancelled order drops out on rerun', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    const day = await wibToday(trx);
    const paid = await order(trx, f, f.productId);
    await advance(trx, paid.id, 'awaiting_payment', 'confirmed');
    await order(trx, f, f.productId); // still awaiting payment, must not count
    await flushProductDayCounters(trx, day, [{ productId: f.productId, views: 7, addToCarts: 2 }]);

    await rollupSalesForDay(trx, day);
    let row = await dayRow(trx, f.productId, day);
    expect(row.purchases).toBe(1);
    expect(Number(row.units_sold)).toBe(2);
    expect(Number(row.revenue)).toBe(60000);
    expect(row.views).toBe(7);

    await setOrderStatus(trx, {
      orderId: paid.id, from: 'confirmed', to: 'cancelled', actorId: null, cancel: { reason: 'Uji', by: f.buyerId },
    });
    await rollupSalesForDay(trx, day);
    row = await dayRow(trx, f.productId, day);
    expect(row.purchases).toBe(0);
    expect(Number(row.units_sold)).toBe(0);
    expect(Number(row.revenue)).toBe(0);
    expect(row.views).toBe(7); // the Redis side is not touched by the rollup
  }));

  test('the sales rollup requires a transaction', () => withRollback(async (trx) => {
    const day = await wibToday(trx);
    await expect(rollupSalesForDay(getDb(), day)).rejects.toThrow(/inside a transaction/);
  }));

  test('the subscription rollup counts the day\'s new subscriptions, and a rerun does not double them', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    const day = await wibToday(trx);
    await upsertProductSubscription(trx, { userId: f.buyerId, productId: f.productId });
    await rollupSubscriptionsForDay(trx, day);
    await rollupSubscriptionsForDay(trx, day);
    expect((await dayRow(trx, f.productId, day)).subscriptions).toBe(1);
  }));

  test('the farmer funnel is owner-scoped, and the ranking puts the seller first and the idle product last', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    const day = await wibToday(trx);
    const paid = await order(trx, f, f.productId);
    await advance(trx, paid.id, 'awaiting_payment', 'confirmed');
    await rollupSalesForDay(trx, day);

    const mine = await listProductDailyStatsForFarmer(trx, {
      productId: f.productId, farmerId: f.farmerId, fromDay: day, toDay: day, limit: 10,
    });
    expect(mine).toHaveLength(1);
    const stranger = await listProductDailyStatsForFarmer(trx, {
      productId: f.productId, farmerId: f.buyerId, fromDay: day, toDay: day, limit: 10,
    });
    expect(stranger).toEqual([]);

    const best = await rankProductsBySales(trx, { farmerId: f.farmerId, fromDay: day, toDay: day, order: 'best', limit: 10 });
    expect(best[0]!.product_id).toBe(f.productId);
    expect(Number(best[0]!.units_sold)).toBe(2);

    const slow = await rankProductsBySales(trx, { farmerId: f.farmerId, fromDay: day, toDay: day, order: 'slow', limit: 10 });
    expect(slow[0]!.product_id).toBe(f.product2Id);
    expect(Number(slow[0]!.units_sold)).toBe(0);
  }));
});

describe('admin overview', () => {
  test('the figures move by exactly the new order and the new harvest delay', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    const window = {
      from: new Date(Date.now() - DAY_MS),
      to: new Date(Date.now() + DAY_MS),
      activeSince: new Date(Date.now() - DAY_MS),
    };
    const before = await findAdminOverview(trx, window);

    const paid = await order(trx, f, f.productId);
    await advance(trx, paid.id, 'awaiting_payment', 'confirmed');

    const cat = await trx.insertInto('categories').values({ slug: `kat-${crypto.randomUUID()}`, name: 'Sayur' })
      .returning(['id']).executeTakeFirstOrThrow();
    const { id: waitlistId } = await insertWaitlist(trx, {
      farmerId: f.farmerId,
      categoryId: cat.id,
      commodityName: 'Cabai Rawit',
      unit: 'kg',
      estimatedUnitPrice: 20000,
      quotaQty: 10,
    });
    const wl = await findWaitlistById(trx, waitlistId);
    await changeWaitlistStatus(trx, {
      waitlistId, from: wl!.status, to: 'harvest_delayed', title: 'Panen mundur', createdBy: f.farmerId, reason: 'Hujan deras',
    });

    const after = await findAdminOverview(trx, window);
    expect(Number(after.gmv) - Number(before.gmv)).toBe(60600);
    expect(after.paidOrders - before.paidOrders).toBe(1);
    expect(after.harvestOutcomes - before.harvestOutcomes).toBe(1);
    expect(after.harvestDelayed - before.harvestDelayed).toBe(1);
  }));
});

describe('counter reconciliation', () => {
  test('fresh data shows no drift for its entities', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    const paid = await order(trx, f, f.productId);
    await advance(trx, paid.id, 'awaiting_payment', 'confirmed');
    const drift = await findCounterDrift(trx, 10_000);
    expect(drift.filter((d) => d.entityId === f.productId || d.entityId === f.farmerId)).toEqual([]);
  }));

  test('completing an order without completeOrder leaves sold_qty and completed_order_count behind', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    const paid = await order(trx, f, f.productId);
    await advance(trx, paid.id, 'awaiting_payment', 'confirmed');
    await advance(trx, paid.id, 'confirmed', 'processing');
    await advance(trx, paid.id, 'processing', 'shipped');
    await advance(trx, paid.id, 'shipped', 'completed'); // status only, no counters

    const drift = await findCounterDrift(trx, 10_000);
    const sold = drift.find((d) => d.check === 'products.sold_qty' && d.entityId === f.productId);
    expect(sold).toBeDefined();
    expect(Number(sold!.cached)).toBe(0);
    expect(Number(sold!.actual)).toBe(2);

    const done = drift.find((d) => d.check === 'farmer_profiles.completed_order_count' && d.entityId === f.farmerId);
    expect(done).toEqual({ check: 'farmer_profiles.completed_order_count', entityId: f.farmerId, cached: '0', actual: '1' });
  }));
});

describe('audit', () => {
  test('a price change is audited with its actor and old and new values', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    await setActor(trx, f.buyerId);
    await setProductPrice(trx, f.farmerId, f.productId, 45000);
    await setProductPrice(trx, f.farmerId, f.productId, 50000);

    const rows = await listAuditLogsForEntity(trx, { entityType: 'products', entityId: f.productId, afterId: null, limit: 10 });
    expect(rows).toHaveLength(2);
    const [newest, oldest] = rows as [typeof rows[number], typeof rows[number]];
    expect(newest).toMatchObject({ action: 'update', actor_id: f.buyerId, entity_type: 'products' });
    expect(newest.old_values).toEqual({ price: 45000 });
    expect(newest.new_values).toEqual({ price: 50000 });
    expect(oldest.old_values).toEqual({ price: 30000 });
  }));

  test('pages do not overlap when two rows share a timestamp', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    await setActor(trx, f.buyerId);
    await setProductPrice(trx, f.farmerId, f.productId, 45000);
    await setProductPrice(trx, f.farmerId, f.productId, 50000);

    const first = await listAuditLogsForEntity(trx, { entityType: 'products', entityId: f.productId, afterId: null, limit: 1 });
    const page1 = first.slice(0, 1);
    expect(page1).toHaveLength(1);
    expect(first[1]!.created_at).toEqual(first[0]!.created_at); // one transaction, one now()

    const second = await listAuditLogsForEntity(trx, {
      entityType: 'products', entityId: f.productId, afterId: page1[0]!.id, limit: 1,
    });
    const page2 = second.slice(0, 1);
    expect(page2).toHaveLength(1);
    expect(page2[0]!.id).not.toBe(page1[0]!.id);
    expect(page2[0]!.id).toBe(first[1]!.id);
  }));

  test('a fee version insert is audited under platform_fee_settings', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    await setActor(trx, f.buyerId);
    const fee = await insertFeeSetting(trx, {
      commissionPct: 2,
      serviceFeePct: 1,
      effectiveFrom: new Date(Date.now() - 2 * DAY_MS),
      createdBy: f.buyerId,
    });
    const rows = await listAuditLogsForEntity(trx, {
      entityType: 'platform_fee_settings', entityId: fee.id, afterId: null, limit: 10,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ action: 'insert', actor_id: f.buyerId });
    expect(rows[0]!.new_values).toMatchObject({ commission_pct: 2 });
  }));
});

describe('platform settings', () => {
  test('an upsert replaces the value of one key and keeps one row', () => withRollback(async (trx) => {
    const f = await fixture(trx);
    const key = `uji_${crypto.randomUUID().replaceAll('-', '_')}`;
    await upsertPlatformSetting(trx, { key, value: 60, updatedBy: f.buyerId });
    const second = await upsertPlatformSetting(trx, { key, value: { hours: 90 }, updatedBy: null });

    expect(second.value).toEqual({ hours: 90 });
    expect(second.updated_by).toBeNull();
    expect((await findPlatformSetting(trx, key))?.value).toEqual({ hours: 90 });
    const all = await listPlatformSettings(trx, 1000);
    expect(all.filter((r) => r.key === key)).toHaveLength(1);
  }));

  test('an unknown key returns undefined', () => withRollback(async (trx) => {
    expect(await findPlatformSetting(trx, `tidak_ada_${crypto.randomUUID()}`)).toBeUndefined();
  }));
});
