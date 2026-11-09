import { sql } from 'kysely';
import type { Json, OrderStatus } from '../db.generated';
import type { Executor } from '../executor';
import { requireTransaction } from '../executor';

/**
 * Days are Jakarta days (WIB), as everywhere in the repo. A day is [00:00 WIB, next 00:00 WIB).
 * The text form 'YYYY-MM-DD' is passed through as a parameter, never spliced into SQL.
 */
function assertDay(day: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new RangeError(`Not a YYYY-MM-DD day: ${day}`);
  return day;
}

/** Matches one day. The column is typed as Date by codegen, so the comparison is cast in SQL. */
function dayIs(day: string) {
  return sql<boolean>`day = ${assertDay(day)}::date`;
}

function wibDayStart(day: string) {
  return sql<Date>`((${day}::date)::timestamp at time zone 'Asia/Jakarta')`;
}

function wibDayEnd(day: string) {
  return sql<Date>`((${day}::date + 1)::timestamp at time zone 'Asia/Jakarta')`;
}

/** Order statuses that mean the buyer has paid. awaiting_payment and cancelled are left out. */
export const PAID_ORDER_STATUSES: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'completed'];

// ---------- Daily stats ----------

export const DAILY_STATS_SELECT = [
  'product_daily_stats.product_id',
  sql<string>`product_daily_stats.day::text`.as('day'),
  'product_daily_stats.views',
  'product_daily_stats.add_to_carts',
  'product_daily_stats.subscriptions',
  'product_daily_stats.purchases',
  sql<string>`product_daily_stats.units_sold::text`.as('units_sold'),
  sql<string>`product_daily_stats.revenue::text`.as('revenue'),
] as const;

export interface ProductDayCounters {
  productId: string;
  views: number;
  addToCarts: number;
}

/**
 * Writes the Redis totals for one day. Redis holds the whole day's hash, so the values replace the row
 * and a rerun gives the same result. Pass one entry per product: a duplicate in one statement fails with
 * 21000. An empty list returns early, because an empty VALUES list is a syntax error.
 */
export async function flushProductDayCounters(db: Executor, day: string, rows: ProductDayCounters[]) {
  if (rows.length === 0) return;
  await db.insertInto('product_daily_stats')
    .values(rows.map((r) => ({
      product_id: r.productId,
      day: assertDay(day),
      views: r.views,
      add_to_carts: r.addToCarts,
    })))
    .onConflict((oc) => oc.columns(['product_id', 'day']).doUpdateSet({
      views: (eb) => eb.ref('excluded.views'),
      add_to_carts: (eb) => eb.ref('excluded.add_to_carts'),
    }))
    .execute();
}

/**
 * Recomputes purchases, units_sold and revenue for one Jakarta day from paid order items. The day's figures
 * are zeroed first, so an order cancelled after an earlier run leaves no stale count. Views and add_to_carts
 * are not touched. Requires a transaction.
 */
export async function rollupSalesForDay(db: Executor, day: string) {
  requireTransaction(db, 'rollupSalesForDay');
  assertDay(day);
  await db.updateTable('product_daily_stats')
    .set({ purchases: 0, units_sold: '0', revenue: 0 })
    .where(dayIs(day))
    .execute();
  await db.insertInto('product_daily_stats')
    .columns(['product_id', 'day', 'purchases', 'units_sold', 'revenue'])
    .expression((eb) => eb.selectFrom('order_items as oi')
      .innerJoin('orders as o', 'o.id', 'oi.order_id')
      .select([
        'oi.product_id',
        sql<string>`${day}::date`.as('day'),
        sql<number>`count(distinct oi.order_id)::int`.as('purchases'),
        sql<string>`sum(oi.quantity)`.as('units_sold'),
        sql<string>`sum(oi.line_subtotal)::bigint`.as('revenue'),
      ])
      .where('o.status', 'in', PAID_ORDER_STATUSES)
      .where('o.created_at', '>=', wibDayStart(day))
      .where('o.created_at', '<', wibDayEnd(day))
      .groupBy('oi.product_id'))
    .onConflict((oc) => oc.columns(['product_id', 'day']).doUpdateSet({
      purchases: (eb) => eb.ref('excluded.purchases'),
      units_sold: (eb) => eb.ref('excluded.units_sold'),
      revenue: (eb) => eb.ref('excluded.revenue'),
    }))
    .execute();
}

/**
 * Recomputes subscriptions for one Jakarta day: new product subscriptions created that day. Zeroed first,
 * like the sales rollup. Requires a transaction.
 */
export async function rollupSubscriptionsForDay(db: Executor, day: string) {
  requireTransaction(db, 'rollupSubscriptionsForDay');
  assertDay(day);
  await db.updateTable('product_daily_stats')
    .set({ subscriptions: 0 })
    .where(dayIs(day))
    .execute();
  await db.insertInto('product_daily_stats')
    .columns(['product_id', 'day', 'subscriptions'])
    .expression((eb) => eb.selectFrom('product_subscriptions')
      .select([
        'product_subscriptions.product_id',
        sql<string>`${day}::date`.as('day'),
        sql<number>`count(*)::int`.as('subscriptions'),
      ])
      .where('product_subscriptions.created_at', '>=', wibDayStart(day))
      .where('product_subscriptions.created_at', '<', wibDayEnd(day))
      .groupBy('product_subscriptions.product_id'))
    .onConflict((oc) => oc.columns(['product_id', 'day']).doUpdateSet({
      subscriptions: (eb) => eb.ref('excluded.subscriptions'),
    }))
    .execute();
}

/** One product's daily rows, oldest first, for the farmer who owns it. Any other user gets an empty list. */
export function listProductDailyStatsForFarmer(db: Executor, a: {
  productId: string;
  farmerId: string;
  fromDay: string;
  toDay: string;
  limit: number;
}) {
  return db.selectFrom('product_daily_stats')
    .select(DAILY_STATS_SELECT)
    .where('product_daily_stats.product_id', '=', a.productId)
    .where(sql<boolean>`exists (
      select 1 from products p where p.id = product_daily_stats.product_id and p.farmer_id = ${a.farmerId}::uuid)`)
    .where(sql<boolean>`product_daily_stats.day >= ${assertDay(a.fromDay)}::date`)
    .where(sql<boolean>`product_daily_stats.day <= ${assertDay(a.toDay)}::date`)
    .orderBy('product_daily_stats.day', 'asc')
    .limit(a.limit)
    .execute();
}

/**
 * The farmer's products ranked by units sold in the window. Products with no sales are included at zero, so
 * slow sellers show up. Ties are broken by product id.
 */
export function rankProductsBySales(db: Executor, a: {
  farmerId: string;
  fromDay: string;
  toDay: string;
  order: 'best' | 'slow';
  limit: number;
}) {
  const from = assertDay(a.fromDay);
  const to = assertDay(a.toDay);
  return db.selectFrom('products as p')
    .leftJoin('product_daily_stats as s', (join) => join
      .onRef('s.product_id', '=', 'p.id')
      .on(sql<boolean>`s.day >= ${from}::date`)
      .on(sql<boolean>`s.day <= ${to}::date`))
    .select([
      'p.id as product_id',
      'p.name',
      sql<string>`coalesce(sum(s.units_sold), 0)::text`.as('units_sold'),
      sql<string>`coalesce(sum(s.revenue), 0)::text`.as('revenue'),
    ])
    .where('p.farmer_id', '=', a.farmerId)
    .groupBy(['p.id', 'p.name'])
    .orderBy(sql`coalesce(sum(s.units_sold), 0)`, a.order === 'best' ? 'desc' : 'asc')
    .orderBy('p.id', 'asc')
    .limit(a.limit)
    .execute();
}

// ---------- Admin overview ----------

export interface AdminOverviewWindow {
  /** Start of the window, inclusive. */
  from: Date;
  /** End of the window, exclusive. */
  to: Date;
  /** A user counts as active when last_seen_at is at or after this time. */
  activeSince: Date;
}

export interface AdminOverview {
  /** Sum of buyer_total for paid orders created in the window, in rupiah. */
  gmv: string;
  paidOrders: number;
  activeUsers: number;
  /** Sum of all escrow account balances, in rupiah. */
  escrowBalance: string;
  /** Harvest status changes in the window that reached an outcome (ready, early, delayed or failed). */
  harvestOutcomes: number;
  /** Of those, the ones that moved to harvest_delayed. The share is delayed / outcomes, computed by the caller. */
  harvestDelayed: number;
}

/**
 * Admin dashboard figures, read from the operational tables. Each figure is one aggregate, so the query
 * never returns a row per order or per user.
 */
export async function findAdminOverview(db: Executor, w: AdminOverviewWindow): Promise<AdminOverview> {
  const gmv = await db.selectFrom('orders')
    .select(sql<string>`coalesce(sum(buyer_total), 0)::bigint::text`.as('gmv'))
    .select(sql<number>`count(*)::int`.as('paid_orders'))
    .where('status', 'in', PAID_ORDER_STATUSES)
    .where('created_at', '>=', w.from)
    .where('created_at', '<', w.to)
    .executeTakeFirstOrThrow();

  const users = await db.selectFrom('users')
    .select(sql<number>`count(*)::int`.as('active_users'))
    .where('deleted_at', 'is', null)
    .where('last_seen_at', '>=', w.activeSince)
    .executeTakeFirstOrThrow();

  const escrow = await db.selectFrom('ledger_accounts')
    .select(sql<string>`coalesce(sum(balance), 0)::bigint::text`.as('escrow_balance'))
    .where('type', '=', 'escrow')
    .executeTakeFirstOrThrow();

  const harvest = await db.selectFrom('waitlist_events')
    .select(sql<number>`count(*) filter (where to_status in ('ready_to_harvest', 'harvest_early', 'harvest_delayed', 'harvest_failed'))::int`.as('outcomes'))
    .select(sql<number>`count(*) filter (where to_status = 'harvest_delayed')::int`.as('delayed'))
    .where('type', '=', 'status_change')
    .where('created_at', '>=', w.from)
    .where('created_at', '<', w.to)
    .executeTakeFirstOrThrow();

  return {
    gmv: gmv.gmv,
    paidOrders: gmv.paid_orders,
    activeUsers: users.active_users,
    escrowBalance: escrow.escrow_balance,
    harvestOutcomes: harvest.outcomes,
    harvestDelayed: harvest.delayed,
  };
}

// ---------- Counter reconciliation ----------

export interface CounterDrift {
  /** Which cached column was compared, e.g. products.sold_qty. */
  check: string;
  entityId: string;
  cached: string;
  actual: string;
}

/**
 * Each check selects only the rows where the cached value differs from the source. Trigger-maintained counters
 * should never drift; the repo-maintained ones (sold_qty, completed_order_count, committed_min_qty) can.
 * committed_min_qty is not checked: the Commit service owns it and its release rule is not in the schema.
 */
const DRIFT_CHECKS = [
  `select 'products.available_qty' as check_name, p.id as entity_id, p.available_qty::text as cached, coalesce(b.qty, 0)::text as actual
   from products p
   left join (select product_id, sum(on_hand_qty - reserved_qty) as qty from product_batches where status = 'active' group by product_id) b
     on b.product_id = p.id
   where p.available_qty <> coalesce(b.qty, 0)`,
  `select 'products.subscriber_count', p.id, p.subscriber_count::text, coalesce(s.n, 0)::text
   from products p
   left join (select product_id, count(*) as n from product_subscriptions group by product_id) s on s.product_id = p.id
   where p.subscriber_count <> coalesce(s.n, 0)`,
  `select 'products.sold_qty', p.id, p.sold_qty::text, coalesce(x.qty, 0)::text
   from products p
   left join (select oi.product_id, sum(oi.quantity) as qty from order_items oi
              join orders o on o.id = oi.order_id where o.status = 'completed' group by oi.product_id) x
     on x.product_id = p.id
   where p.sold_qty <> coalesce(x.qty, 0)`,
  `select 'products.rating_count', p.id, p.rating_count::text, coalesce(r.n, 0)::text
   from products p
   left join (select product_id, count(*) as n from reviews where status = 'published' group by product_id) r
     on r.product_id = p.id
   where p.rating_count <> coalesce(r.n, 0)`,
  `select 'products.rating_avg', p.id, p.rating_avg::text, coalesce(r.avg, 0)::text
   from products p
   left join (select product_id, round(avg(rating), 2) as avg from reviews where status = 'published' group by product_id) r
     on r.product_id = p.id
   where p.rating_avg <> coalesce(r.avg, 0)`,
  `select 'farmer_profiles.completed_order_count', f.user_id, f.completed_order_count::text, coalesce(o.n, 0)::text
   from farmer_profiles f
   left join (select farmer_id, count(*) as n from orders where status = 'completed' group by farmer_id) o
     on o.farmer_id = f.user_id
   where f.completed_order_count <> coalesce(o.n, 0)`,
  `select 'farmer_profiles.rating_count', f.user_id, f.rating_count::text, coalesce(r.n, 0)::text
   from farmer_profiles f
   left join (select farmer_id, count(*) as n from reviews where status = 'published' group by farmer_id) r
     on r.farmer_id = f.user_id
   where f.rating_count <> coalesce(r.n, 0)`,
  `select 'farmer_profiles.rating_avg', f.user_id, f.rating_avg::text, coalesce(r.avg, 0)::text
   from farmer_profiles f
   left join (select farmer_id, round(avg(rating), 2) as avg from reviews where status = 'published' group by farmer_id) r
     on r.farmer_id = f.user_id
   where f.rating_avg <> coalesce(r.avg, 0)`,
  `select 'waitlists.follower_count', w.id, w.follower_count::text, coalesce(f.n, 0)::text
   from waitlists w
   left join (select waitlist_id, count(*) as n from waitlist_followers group by waitlist_id) f
     on f.waitlist_id = w.id
   where w.follower_count <> coalesce(f.n, 0)`,
  `select 'waitlists.commitment_count', w.id, w.commitment_count::text, coalesce(c.n, 0)::text
   from waitlists w
   left join (select waitlist_id, count(*) as n from commitments where commitment_is_live(status) group by waitlist_id) c
     on c.waitlist_id = w.id
   where w.commitment_count <> coalesce(c.n, 0)`,
  `select 'ledger_accounts.balance', la.id, la.balance::text, coalesce(e.amt, 0)::text
   from ledger_accounts la
   left join (select account_id, sum(amount) as amt from ledger_entries group by account_id) e
     on e.account_id = la.id
   where la.balance <> coalesce(e.amt, 0)`,
];

/**
 * Read-only nightly check: every cached counter against its source, up to `limit` differences. Writes nothing;
 * the job alerts on any row it returns.
 */
export async function findCounterDrift(db: Executor, limit: number): Promise<CounterDrift[]> {
  const result = await sql<{ check_name: string; entity_id: string; cached: string; actual: string }>`
    select check_name, entity_id, cached, actual
    from (${sql.raw(DRIFT_CHECKS.join(' union all '))}) d
    limit ${limit}`.execute(db);
  return result.rows.map((r) => ({
    check: r.check_name,
    entityId: r.entity_id,
    cached: r.cached,
    actual: r.actual,
  }));
}

// ---------- Audit ----------

export const AUDIT_COLUMNS = [
  'id', 'created_at', 'actor_id', 'action', 'entity_type', 'entity_id', 'old_values', 'new_values', 'ip_address',
] as const;

/**
 * Audit rows for one entity, newest first. Keyset on (created_at, id); pass the last row's id as afterId,
 * because a JS Date keeps milliseconds and would drop rows that share a microsecond. Fetches limit + 1.
 * An unknown afterId returns no rows.
 */
export function listAuditLogsForEntity(db: Executor, a: {
  entityType: string;
  entityId: string;
  afterId: string | null;
  limit: number;
}) {
  let q = db.selectFrom('audit_logs')
    .select(AUDIT_COLUMNS)
    .where('entity_type', '=', a.entityType)
    .where('entity_id', '=', a.entityId);
  if (a.afterId) {
    q = q.where(sql<boolean>`(audit_logs.created_at, audit_logs.id) < (
      select al.created_at, al.id from audit_logs al where al.id = ${a.afterId}::uuid)`);
  }
  return q.orderBy('created_at', 'desc').orderBy('id', 'desc').limit(a.limit + 1).execute();
}

// ---------- Platform settings ----------

export const PLATFORM_SETTING_COLUMNS = ['key', 'value', 'updated_by', 'updated_at'] as const;

export function findPlatformSetting(db: Executor, key: string) {
  return db.selectFrom('platform_settings')
    .select(PLATFORM_SETTING_COLUMNS)
    .where('key', '=', key)
    .executeTakeFirst();
}

export function listPlatformSettings(db: Executor, limit: number) {
  return db.selectFrom('platform_settings')
    .select(PLATFORM_SETTING_COLUMNS)
    .orderBy('key', 'asc')
    .limit(limit)
    .execute();
}

/**
 * Sets one key. The value is stored as JSON, so scalars, arrays and objects all work. updated_at is set by the
 * trigger, so it is not written here. Pass the actor's id so the change shows who made it.
 */
export function upsertPlatformSetting(db: Executor, a: { key: string; value: Json; updatedBy: string | null }) {
  return db.insertInto('platform_settings')
    .values({ key: a.key, value: JSON.stringify(a.value), updated_by: a.updatedBy })
    .onConflict((oc) => oc.column('key').doUpdateSet({
      value: (eb) => eb.ref('excluded.value'),
      updated_by: (eb) => eb.ref('excluded.updated_by'),
    }))
    .returning(PLATFORM_SETTING_COLUMNS)
    .executeTakeFirstOrThrow();
}
