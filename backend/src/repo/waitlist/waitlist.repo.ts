import { sql } from 'kysely';
import type { Executor } from '../executor';
import { requireTransaction } from '../executor';
import { qty } from '../money';
import type {
  CommitmentStatus, ProductUnit, WaitlistEventType, WaitlistStatus,
} from '../db.generated';

// ---------- Wait list ----------

export const WAITLIST_COLUMNS = [
  'id', 'farmer_id', 'category_id', 'commodity_name', 'description', 'unit', 'status', 'schedule_type',
  'estimated_yield_qty', 'estimated_unit_price', 'final_unit_price', 'quota_qty', 'min_commit_qty',
  'committed_min_qty', 'commitment_count', 'follower_count', 'actual_harvest_qty', 'product_id',
  'failure_reason', 'first_estimate_set_at', 'penalty_free_until', 'created_at', 'updated_at',
] as const;

/** date columns come back as YYYY-MM-DD text, never as a Date (pg parses date as local midnight). */
export const WAITLIST_DATE_COLUMNS = [
  sql<string | null>`planted_on::text`.as('planted_on'),
  sql<string | null>`harvest_start::text`.as('harvest_start'),
  sql<string | null>`harvest_end::text`.as('harvest_end'),
] as const;

/** Public read. Buyers see every wait list, so no owner filter. */
export function findWaitlistById(db: Executor, waitlistId: string) {
  return db.selectFrom('waitlists')
    .select(WAITLIST_COLUMNS)
    .select(WAITLIST_DATE_COLUMNS)
    .where('id', '=', waitlistId)
    .executeTakeFirst();
}

/** Owner-scoped. A guessed id of another farmer's wait list returns nothing. */
export function findWaitlistForFarmer(db: Executor, waitlistId: string, farmerId: string) {
  return db.selectFrom('waitlists')
    .select(WAITLIST_COLUMNS)
    .select(WAITLIST_DATE_COLUMNS)
    .where('id', '=', waitlistId)
    .where('farmer_id', '=', farmerId)
    .executeTakeFirst();
}

export interface NewWaitlist {
  farmerId: string;
  categoryId: string;
  commodityName: string;
  unit: ProductUnit;
  estimatedUnitPrice: string | number | bigint;
  description?: string | null;
  minCommitQty?: string | number;
  quotaQty?: string | number | null;
}

/** Returns the id only. Read it back with findWaitlistById, which types the dates as text. */
export function insertWaitlist(db: Executor, w: NewWaitlist) {
  return db.insertInto('waitlists')
    .values({
      farmer_id: w.farmerId,
      category_id: w.categoryId,
      commodity_name: w.commodityName,
      unit: w.unit,
      estimated_unit_price: String(w.estimatedUnitPrice),
      description: w.description ?? null,
      min_commit_qty: w.minCommitQty === undefined ? undefined : qty(w.minCommitQty),
      quota_qty: w.quotaQty === undefined || w.quotaQty === null ? null : qty(w.quotaQty),
    })
    .returning('id')
    .executeTakeFirstOrThrow();
}

// ---------- Timeline (append-only events) ----------

export const EVENT_COLUMNS = [
  'id', 'waitlist_id', 'type', 'from_status', 'to_status', 'old_schedule', 'new_schedule',
  'title', 'body', 'reason', 'created_by', 'created_at',
] as const;

/**
 * Public timeline, newest first. Keyset on (created_at, id), so the (waitlist_id, created_at) index
 * serves both the filter and the sort (checked with EXPLAIN).
 *
 * The cursor is the id of the last row of the previous page, not its created_at: a JS Date keeps
 * milliseconds only, and created_at keeps microseconds, so a Date round trip would skip rows.
 * The cursor's created_at is read in SQL instead. Returns up to limit + 1 rows.
 */
export function listWaitlistTimeline(db: Executor, a: { waitlistId: string; beforeId: string | null; limit: number }) {
  let q = db.selectFrom('waitlist_events').select(EVENT_COLUMNS).where('waitlist_id', '=', a.waitlistId);
  if (a.beforeId) {
    const beforeId = a.beforeId;
    q = q.where((eb) => eb(
      eb.refTuple('created_at', 'id'),
      '<',
      eb.tuple(eb.selectFrom('waitlist_events').select('created_at').where('id', '=', beforeId), beforeId),
    ));
  }
  return q.orderBy('created_at', 'desc').orderBy('id', 'desc').limit(a.limit + 1).execute();
}

export interface NewWaitlistEvent {
  waitlistId: string;
  type: WaitlistEventType;
  title: string;
  createdBy: string;
  fromStatus?: WaitlistStatus | null;
  toStatus?: WaitlistStatus | null;
  oldSchedule?: unknown;
  newSchedule?: unknown;
  body?: string | null;
  reason?: string | null;
}

/**
 * Append-only: there is no update or delete for events. chk_reason_required fails with
 * CheckViolationError when harvest_delayed or harvest_failed has no reason.
 */
export function insertWaitlistEvent(db: Executor, e: NewWaitlistEvent) {
  return db.insertInto('waitlist_events')
    .values({
      waitlist_id: e.waitlistId,
      type: e.type,
      from_status: e.fromStatus ?? null,
      to_status: e.toStatus ?? null,
      old_schedule: e.oldSchedule === undefined || e.oldSchedule === null ? null : JSON.stringify(e.oldSchedule),
      new_schedule: e.newSchedule === undefined || e.newSchedule === null ? null : JSON.stringify(e.newSchedule),
      title: e.title,
      body: e.body ?? null,
      reason: e.reason ?? null,
      created_by: e.createdBy,
    })
    .returning(['id', 'created_at'])
    .executeTakeFirstOrThrow();
}

export interface EventMediaInput {
  mediaId: string;
  caption?: string | null;
  position?: number;
}

/** One multi-row insert. An empty list writes nothing. media_id is unique: one asset, one event. */
export async function insertEventMedia(db: Executor, eventId: string, items: EventMediaInput[]) {
  if (items.length === 0) return [];
  return db.insertInto('waitlist_media')
    .values(items.map((m) => ({
      event_id: eventId,
      media_id: m.mediaId,
      caption: m.caption ?? null,
      position: m.position ?? 0,
    })))
    .returning(['id', 'event_id', 'media_id', 'caption', 'position'])
    .execute();
}

/** Media for a page of events. An empty list returns early without a query. */
export async function listMediaForEvents(db: Executor, eventIds: string[], limit: number) {
  if (eventIds.length === 0) return [];
  return db.selectFrom('waitlist_media')
    .select(['id', 'event_id', 'media_id', 'caption', 'position'])
    .where('event_id', 'in', eventIds)
    .orderBy('event_id', 'asc')
    .orderBy('position', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/**
 * Guarded status change plus its timeline event. undefined when the wait list is not in `from`.
 * failureReason is written only when given, because chk_failed_reason needs it for harvest_failed.
 * Requires a transaction.
 */
export async function changeWaitlistStatus(db: Executor, a: {
  waitlistId: string;
  from: WaitlistStatus;
  to: WaitlistStatus;
  title: string;
  createdBy: string;
  body?: string | null;
  reason?: string | null;
  failureReason?: string | null;
}) {
  requireTransaction(db, 'changeWaitlistStatus');
  const row = await db.updateTable('waitlists')
    .set({ status: a.to, failure_reason: a.failureReason })
    .where('id', '=', a.waitlistId)
    .where('status', '=', a.from)
    .returning(['id', 'status'])
    .executeTakeFirst();
  if (!row) return undefined;
  const event = await insertWaitlistEvent(db, {
    waitlistId: a.waitlistId,
    type: 'status_change',
    fromStatus: a.from,
    toStatus: a.to,
    title: a.title,
    createdBy: a.createdBy,
    body: a.body,
    reason: a.reason,
  });
  return { ...row, event };
}

// ---------- Followers ----------

/** undefined when the user already follows. ON CONFLICT writes nothing, so the count trigger does not fire. */
export function followWaitlist(db: Executor, userId: string, waitlistId: string) {
  return db.insertInto('waitlist_followers')
    .values({ user_id: userId, waitlist_id: waitlistId })
    .onConflict((oc) => oc.columns(['user_id', 'waitlist_id']).doNothing())
    .returning(['user_id', 'waitlist_id'])
    .executeTakeFirst();
}

/** undefined when the user did not follow. The count trigger runs only on a real delete. */
export function unfollowWaitlist(db: Executor, userId: string, waitlistId: string) {
  return db.deleteFrom('waitlist_followers')
    .where('user_id', '=', userId)
    .where('waitlist_id', '=', waitlistId)
    .returning('waitlist_id')
    .executeTakeFirst();
}

// ---------- Commitments ----------

export const COMMITMENT_COLUMNS = [
  'id', 'waitlist_id', 'buyer_id', 'qty_min', 'qty_max', 'unit_price_estimate', 'held_amount',
  'had_estimate_at_commit', 'status', 'allocated_qty', 'remainder_amount', 'remainder_due_at',
  'remainder_paid_at', 'penalty_amount', 'cancelled_at', 'cancel_reason', 'order_id', 'created_at', 'updated_at',
] as const;

/** Owner-scoped. A guessed commitment id of another buyer returns nothing. */
export function findCommitmentForBuyer(db: Executor, commitmentId: string, buyerId: string) {
  return db.selectFrom('commitments')
    .select(COMMITMENT_COLUMNS)
    .where('id', '=', commitmentId)
    .where('buyer_id', '=', buyerId)
    .executeTakeFirst();
}

export interface NewCommitment {
  waitlistId: string;
  buyerId: string;
  qtyMin: string | number;
  qtyMax: string | number;
  unitPriceEstimate: string | number | bigint;
  heldAmount: string | number | bigint;
  hadEstimateAtCommit: boolean;
}

/**
 * Commit to a wait list. The quota is an atomic increment: the CHECK chk_quota_not_exceeded raises
 * CheckViolationError when committed_min_qty would pass quota_qty, and the insert never runs.
 * The concurrent commits serialize on the waitlist row lock. undefined when the wait list does not exist.
 * Requires a transaction.
 */
export async function commitToWaitlist(db: Executor, c: NewCommitment) {
  requireTransaction(db, 'commitToWaitlist');
  const waitlist = await db.updateTable('waitlists')
    .set((eb) => ({ committed_min_qty: eb('committed_min_qty', '+', qty(c.qtyMin)) }))
    .where('id', '=', c.waitlistId)
    .returning(['id', 'committed_min_qty', 'quota_qty'])
    .executeTakeFirst();
  if (!waitlist) return undefined;

  const commitment = await db.insertInto('commitments')
    .values({
      waitlist_id: c.waitlistId,
      buyer_id: c.buyerId,
      qty_min: qty(c.qtyMin),
      qty_max: qty(c.qtyMax),
      unit_price_estimate: String(c.unitPriceEstimate),
      held_amount: String(c.heldAmount),
      had_estimate_at_commit: c.hadEstimateAtCommit,
    })
    .returning(COMMITMENT_COLUMNS)
    .executeTakeFirstOrThrow();
  return { waitlist, commitment };
}

/**
 * Remainder job: commitments awaiting the remainder whose 48-hour window has passed.
 * Claims rows with SKIP LOCKED, so two runs never take the same row. The WHERE repeats the partial
 * index predicate (commitments_remainder_due). Requires a transaction.
 */
export function lockOverdueRemainders(db: Executor, limit: number) {
  requireTransaction(db, 'lockOverdueRemainders');
  return db.selectFrom('commitments')
    .select(COMMITMENT_COLUMNS)
    .where('status', '=', 'awaiting_remainder')
    .where('remainder_due_at', '<=', sql<Date>`now()`)
    .orderBy('remainder_due_at', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute();
}

/**
 * Allocation order when the harvest is short: earliest remainder payer first. Rows without a payment
 * time (nulls) come last. One status per call, so the index order (status, remainder_paid_at) holds.
 */
export function listCommitmentsInAllocationOrder(db: Executor, a: {
  waitlistId: string;
  status: CommitmentStatus;
  limit: number;
}) {
  return db.selectFrom('commitments')
    .select(COMMITMENT_COLUMNS)
    .where('waitlist_id', '=', a.waitlistId)
    .where('status', '=', a.status)
    .orderBy('remainder_paid_at', sql`asc nulls last`)
    .orderBy('id', 'asc')
    .limit(a.limit)
    .execute();
}
