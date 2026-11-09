import { sql } from 'kysely';
import type { Executor } from '../executor';
import { requireTransaction } from '../executor';
import type { HarvestScheduleType, WaitlistStatus } from '../db.generated';
import { qty } from '../money';

/**
 * Dev seed only. These writes set values the API never writes: a farmer's verified status, completed-order
 * counts, response time, and a wait list's stored state with no event trail. Nothing in src/routes or
 * src/services imports this file. scripts/seed-katalog.ts is the only caller, and it refuses production.
 *
 * Trigger-maintained counters (rating, follower and subscriber counts) are never written here.
 */

/** Auth users who have no users row yet. Read-only on neon_auth. */
export function listUnlinkedAuthUsers(db: Executor, limit: number) {
  return db.selectFrom('neon_auth.user')
    .select('id')
    .where('id', 'not in', (eb) => eb.selectFrom('users').select('id'))
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/** Consumers and UMKM who can follow wait lists in the demo. */
export function listDemoBuyers(db: Executor, limit: number) {
  return db.selectFrom('users')
    .select('id')
    .where('role', 'in', ['consumer', 'umkm'])
    .where('deleted_at', 'is', null)
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

export async function approveFarmerForDemo(db: Executor, userId: string): Promise<void> {
  requireTransaction(db, 'approveFarmerForDemo');
  await db.updateTable('farmer_profiles')
    .set({ verification_status: 'approved', verified_at: sql<Date>`now()` })
    .where('user_id', '=', userId)
    .execute();
}

/** Counters with no trigger: completed orders and average response time. */
export async function setFarmerDemoStats(db: Executor, userId: string, a: { completedOrders: number; avgResponseMinutes: number }): Promise<void> {
  requireTransaction(db, 'setFarmerDemoStats');
  await db.updateTable('farmer_profiles')
    .set({ completed_order_count: a.completedOrders, avg_response_minutes: a.avgResponseMinutes })
    .where('user_id', '=', userId)
    .execute();
}

/** sold_qty has no trigger, so the repo may set it. The demo sets it from the historic sales figure. */
export async function setProductSoldQty(db: Executor, productId: string, sold: number): Promise<void> {
  requireTransaction(db, 'setProductSoldQty');
  await db.updateTable('products').set({ sold_qty: qty(sold) }).where('id', '=', productId).execute();
}

export interface WaitlistDemoState {
  status: WaitlistStatus;
  scheduleType: HarvestScheduleType;
  plantedOn: string | null;
  harvestStart: string | null;
  harvestEnd: string | null;
  estimatedYieldQty: number | null;
  committedMinQty: number;
  failureReason: string | null;
}

/**
 * Stored state of a wait list after the demo timeline is written. The status and schedule columns are
 * normally moved by guarded transitions, and this skips that path on purpose. committed_min_qty has no trigger.
 */
export async function setWaitlistDemoState(db: Executor, waitlistId: string, s: WaitlistDemoState): Promise<void> {
  requireTransaction(db, 'setWaitlistDemoState');
  await db.updateTable('waitlists')
    .set({
      status: s.status,
      schedule_type: s.scheduleType,
      planted_on: s.plantedOn,
      harvest_start: s.harvestStart,
      harvest_end: s.harvestEnd,
      estimated_yield_qty: s.estimatedYieldQty === null ? null : qty(s.estimatedYieldQty),
      committed_min_qty: qty(s.committedMinQty),
      failure_reason: s.failureReason,
    })
    .where('id', '=', waitlistId)
    .execute();
}

/** Ids of the first wait lists, for the demo followers. */
export async function listWaitlistIdsForDemo(db: Executor, limit: number): Promise<string[]> {
  const rows = await db.selectFrom('waitlists').select('id').orderBy('id', 'asc').limit(limit).execute();
  return rows.map((r) => r.id);
}
