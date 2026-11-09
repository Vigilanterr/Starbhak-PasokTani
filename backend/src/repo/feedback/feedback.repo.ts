import { sql, type UpdateObject } from 'kysely';
import type { Database } from '../db';
import type { Executor } from '../executor';
import type { ComplaintReason, ComplaintStatus, ModerationStatus, ReportStatus } from '../db.generated';

type Money = string | number | bigint;

// ---------- Reviews ----------

export const REVIEW_COLUMNS = [
  'id', 'order_item_id', 'product_id', 'farmer_id', 'buyer_id', 'rating', 'comment', 'status',
  'reply_body', 'replied_at', 'created_at', 'updated_at',
] as const;

export interface NewReview {
  orderItemId: string;
  buyerId: string;
  rating: number;
  comment?: string | null;
}

/**
 * Writes the buyer's review of one order item. product_id and farmer_id are copied from the order, not passed in,
 * so a review always points at the item's own product and farmer. The buyer filter is in the same INSERT ... SELECT.
 * Returns undefined when the item is not this buyer's, or was already reviewed (order_item_id is unique, so the
 * conflict is DO NOTHING). The two cases look the same from here. Whether the order is completed is the service's rule.
 */
export function insertReview(db: Executor, r: NewReview) {
  return db.insertInto('reviews')
    .columns(['order_item_id', 'product_id', 'farmer_id', 'buyer_id', 'rating', 'comment'])
    .expression((eb) => eb.selectFrom('order_items')
      .innerJoin('orders', 'orders.id', 'order_items.order_id')
      .select([
        'order_items.id as order_item_id',
        'order_items.product_id',
        'orders.farmer_id',
        'orders.buyer_id',
        sql<number>`${r.rating}::smallint`.as('rating'),
        sql<string | null>`${r.comment ?? null}::text`.as('comment'),
      ])
      .where('order_items.id', '=', r.orderItemId)
      .where('orders.buyer_id', '=', r.buyerId))
    .onConflict((oc) => oc.column('order_item_id').doNothing())
    .returning(REVIEW_COLUMNS)
    .executeTakeFirst();
}

/** Published reviews of a product, newest first. Keyset on (created_at, id); pass the last id as afterId. */
export function listPublishedReviewsForProduct(db: Executor, a: { productId: string; afterId: string | null; limit: number }) {
  let q = db.selectFrom('reviews').select(REVIEW_COLUMNS)
    .where('product_id', '=', a.productId)
    .where('status', '=', 'published');
  if (a.afterId) q = q.where(sql<boolean>`(created_at, id) < (select created_at, id from reviews where id = ${a.afterId}::uuid)`);
  return q.orderBy('created_at', 'desc').orderBy('id', 'desc').limit(a.limit + 1).execute();
}

/** Published reviews of a farmer, newest first. Same keyset as listPublishedReviewsForProduct. */
export function listPublishedReviewsForFarmer(db: Executor, a: { farmerId: string; afterId: string | null; limit: number }) {
  let q = db.selectFrom('reviews').select(REVIEW_COLUMNS)
    .where('farmer_id', '=', a.farmerId)
    .where('status', '=', 'published');
  if (a.afterId) q = q.where(sql<boolean>`(created_at, id) < (select created_at, id from reviews where id = ${a.afterId}::uuid)`);
  return q.orderBy('created_at', 'desc').orderBy('id', 'desc').limit(a.limit + 1).execute();
}

/**
 * The farmer's one reply. Guarded on farmer_id and reply_body IS NULL, so someone else's review, or a second
 * reply, returns undefined and writes nothing.
 */
export function replyToReview(db: Executor, a: { reviewId: string; farmerId: string; body: string }) {
  return db.updateTable('reviews')
    .set({ reply_body: a.body, replied_at: sql<Date>`now()` })
    .where('id', '=', a.reviewId)
    .where('farmer_id', '=', a.farmerId)
    .where('reply_body', 'is', null)
    .returning(REVIEW_COLUMNS)
    .executeTakeFirst();
}

/**
 * Moderation (publish or hide). Guarded on the source state, so a stale admin action writes nothing.
 * The rating trigger recomputes the product and farmer averages when status changes.
 */
export function setReviewModeration(db: Executor, a: { reviewId: string; from: ModerationStatus; to: ModerationStatus }) {
  return db.updateTable('reviews')
    .set({ status: a.to })
    .where('id', '=', a.reviewId)
    .where('status', '=', a.from)
    .returning(REVIEW_COLUMNS)
    .executeTakeFirst();
}

export const REVIEW_PHOTO_COLUMNS = ['id', 'review_id', 'media_id', 'position'] as const;

/**
 * Attaches photos to a review in the order given (position 0, 1, ...). One statement. Only media owned by the
 * review's buyer is inserted, so a foreign asset is dropped and the result can be shorter than the input.
 * The service compares the lengths. media_id is unique, so one asset cannot be attached twice.
 * An empty list writes nothing.
 */
export async function insertReviewPhotos(db: Executor, reviewId: string, mediaIds: string[]) {
  if (mediaIds.length === 0) return [];
  const result = await sql<{ id: string; review_id: string; media_id: string; position: number }>`
    insert into review_photos (review_id, media_id, position)
    select r.id, x.media_id, (x.n - 1)::smallint
    from unnest(${mediaIds}::uuid[]) with ordinality as x(media_id, n)
    join reviews r on r.id = ${reviewId}::uuid
    join media_assets m on m.id = x.media_id and m.owner_id = r.buyer_id
    order by x.n
    returning id, review_id, media_id, position
  `.execute(db);
  return result.rows;
}

/** Photos for a page of reviews. An empty list returns early without a query. */
export async function listPhotosForReviews(db: Executor, reviewIds: string[], limit: number) {
  if (reviewIds.length === 0) return [];
  return db.selectFrom('review_photos')
    .select(REVIEW_PHOTO_COLUMNS)
    .where('review_id', 'in', reviewIds)
    .orderBy('review_id', 'asc')
    .orderBy('position', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

// ---------- Complaints ----------

export const COMPLAINT_COLUMNS = [
  'id', 'order_id', 'buyer_id', 'reason', 'description', 'status', 'requested_amount', 'resolved_amount',
  'mediator_id', 'resolution_note', 'opened_at', 'resolved_at',
] as const;

const TERMINAL_COMPLAINT_STATUSES: readonly ComplaintStatus[] = ['resolved_full_refund', 'resolved_partial_refund', 'rejected'];

/**
 * Who may see a complaint and its thread: the buyer, the farmer of the order, and the assigned mediator.
 * Written against the `complaints` table name, so it works as a filter in any query over that table.
 */
function complaintParty(userId: string) {
  return sql<boolean>`(complaints.buyer_id = ${userId}::uuid
    or complaints.mediator_id = ${userId}::uuid
    or exists (select 1 from orders o where o.id = complaints.order_id and o.farmer_id = ${userId}::uuid))`;
}

export interface NewComplaint {
  orderId: string;
  buyerId: string;
  reason: ComplaintReason;
  description: string;
  requestedAmount?: Money | null;
}

/**
 * Opens a complaint on the buyer's own order. The owner filter is in the INSERT ... SELECT, so a guessed order id
 * of another buyer writes nothing and returns undefined. The 3-day window and the escrow change to 'disputed'
 * belong to the service (escrow through setEscrowStatus, in the same withActor transaction).
 * Nothing in the schema stops a second active complaint on one order. See the checklist in Plan.md.
 */
export function openComplaint(db: Executor, c: NewComplaint) {
  return db.insertInto('complaints')
    .columns(['order_id', 'buyer_id', 'reason', 'description', 'requested_amount'])
    .expression((eb) => eb.selectFrom('orders')
      .select([
        'orders.id as order_id',
        sql<string>`${c.buyerId}::uuid`.as('buyer_id'),
        sql<ComplaintReason>`${c.reason}::complaint_reason`.as('reason'),
        sql<string>`${c.description}::text`.as('description'),
        sql<string | null>`${c.requestedAmount == null ? null : String(c.requestedAmount)}::bigint`.as('requested_amount'),
      ])
      .where('orders.id', '=', c.orderId)
      .where('orders.buyer_id', '=', c.buyerId))
    .returning(COMPLAINT_COLUMNS)
    .executeTakeFirst();
}

/** A complaint, visible only to its parties (see complaintParty). */
export function findComplaintForParty(db: Executor, complaintId: string, userId: string) {
  return db.selectFrom('complaints')
    .select(COMPLAINT_COLUMNS)
    .where('id', '=', complaintId)
    .where(complaintParty(userId))
    .executeTakeFirst();
}

/** The buyer's complaints, newest first. Keyset on (opened_at, id). */
export function listComplaintsForBuyer(db: Executor, a: { buyerId: string; afterId: string | null; limit: number }) {
  let q = db.selectFrom('complaints').select(COMPLAINT_COLUMNS).where('buyer_id', '=', a.buyerId);
  if (a.afterId) q = q.where(sql<boolean>`(opened_at, id) < (select opened_at, id from complaints where id = ${a.afterId}::uuid)`);
  return q.orderBy('opened_at', 'desc').orderBy('id', 'desc').limit(a.limit + 1).execute();
}

/** The farmer's complaints (orders they fulfil), newest first. Same keyset as listComplaintsForBuyer. */
export function listComplaintsForFarmer(db: Executor, a: { farmerId: string; afterId: string | null; limit: number }) {
  let q = db.selectFrom('complaints').select(COMPLAINT_COLUMNS)
    .where('order_id', 'in', (eb) => eb.selectFrom('orders').select('id').where('farmer_id', '=', a.farmerId));
  if (a.afterId) q = q.where(sql<boolean>`(opened_at, id) < (select opened_at, id from complaints where id = ${a.afterId}::uuid)`);
  return q.orderBy('opened_at', 'desc').orderBy('id', 'desc').limit(a.limit + 1).execute();
}

/**
 * The admin queue: oldest first, so the longest-waiting complaint comes up first. Optional status filter.
 * Keyset on (opened_at, id) ascending. Matches complaints_status_opened_at_idx.
 */
export function listComplaintQueue(db: Executor, a: { status?: ComplaintStatus; afterId: string | null; limit: number }) {
  let q = db.selectFrom('complaints').select(COMPLAINT_COLUMNS);
  if (a.status) q = q.where('status', '=', a.status);
  if (a.afterId) q = q.where(sql<boolean>`(opened_at, id) > (select opened_at, id from complaints where id = ${a.afterId}::uuid)`);
  return q.orderBy('opened_at', 'asc').orderBy('id', 'asc').limit(a.limit + 1).execute();
}

export interface ComplaintStatusChange {
  complaintId: string;
  from: ComplaintStatus;
  to: ComplaintStatus;
  mediatorId?: string | null;
  resolvedAmount?: Money | null;
  resolutionNote?: string | null;
}

/**
 * Guarded status change. undefined when the complaint is not in `from`. Terminal states (resolved_* and rejected)
 * set resolved_at with now(). Other fields are written only when given. Refund rows are the service's job
 * (insertRefund in payments, with complaintId).
 */
export function setComplaintStatus(db: Executor, a: ComplaintStatusChange) {
  const set: UpdateObject<Database, 'complaints'> = { status: a.to };
  if (a.mediatorId !== undefined) set.mediator_id = a.mediatorId;
  if (a.resolvedAmount != null) set.resolved_amount = String(a.resolvedAmount);
  if (a.resolutionNote !== undefined) set.resolution_note = a.resolutionNote;
  if (TERMINAL_COMPLAINT_STATUSES.includes(a.to)) set.resolved_at = sql<Date>`now()`;
  return db.updateTable('complaints')
    .set(set)
    .where('id', '=', a.complaintId)
    .where('status', '=', a.from)
    .returning(COMPLAINT_COLUMNS)
    .executeTakeFirst();
}

// ---------- Complaint thread ----------

export const COMPLAINT_MESSAGE_COLUMNS = ['id', 'complaint_id', 'sender_id', 'body', 'created_at'] as const;

/**
 * Posts to a complaint thread. Only a party can post (buyer, farmer, mediator), checked in the INSERT ... SELECT.
 * undefined when the sender is not a party, and nothing is written.
 */
export function insertComplaintMessage(db: Executor, m: { complaintId: string; senderId: string; body: string }) {
  return db.insertInto('complaint_messages')
    .columns(['complaint_id', 'sender_id', 'body'])
    .expression((eb) => eb.selectFrom('complaints')
      .select([
        sql<string>`${m.complaintId}::uuid`.as('complaint_id'),
        sql<string>`${m.senderId}::uuid`.as('sender_id'),
        sql<string>`${m.body}::text`.as('body'),
      ])
      .where('complaints.id', '=', m.complaintId)
      .where(complaintParty(m.senderId)))
    .returning(COMPLAINT_MESSAGE_COLUMNS)
    .executeTakeFirst();
}

/**
 * Attaches the uploader's own media to a complaint as evidence, in one INSERT ... SELECT. A non-party writes
 * nothing, foreign media is dropped, and media already attached is skipped, so a replay changes nothing.
 * Returns the rows written. An empty list returns early.
 */
export async function insertComplaintEvidence(db: Executor, a: { complaintId: string; uploaderId: string; mediaIds: string[] }) {
  if (a.mediaIds.length === 0) return [];
  return db.insertInto('complaint_evidence')
    .columns(['complaint_id', 'media_id'])
    .expression((eb) => eb.selectFrom('complaints')
      .innerJoin('media_assets as m', (join) => join
        .on('m.owner_id', '=', a.uploaderId)
        .on(sql<boolean>`m.id = any(${a.mediaIds}::uuid[])`))
      .select(['complaints.id as complaint_id', 'm.id as media_id'])
      .where('complaints.id', '=', a.complaintId)
      .where(complaintParty(a.uploaderId)))
    .onConflict((oc) => oc.column('media_id').doNothing())
    .returning(['id', 'complaint_id', 'media_id'])
    .execute();
}

/** Evidence on one complaint, oldest first (UUIDv7 ids are time ordered), for a party only. A non-party gets an empty list. */
export function listComplaintEvidence(db: Executor, a: { complaintId: string; viewerId: string; limit: number }) {
  return db.selectFrom('complaint_evidence')
    .select(['id', 'complaint_id', 'media_id'])
    .where('complaint_id', 'in', (eb) => eb.selectFrom('complaints')
      .select('id')
      .where('id', '=', a.complaintId)
      .where(complaintParty(a.viewerId)))
    .orderBy('id', 'asc')
    .limit(a.limit)
    .execute();
}

/**
 * The thread in order (oldest first), for a party only. A non-party gets an empty list. Keyset on (created_at, id).
 * Matches complaint_messages_complaint_id_created_at_idx.
 */
export function listComplaintMessages(db: Executor, a: { complaintId: string; viewerId: string; afterId: string | null; limit: number }) {
  let q = db.selectFrom('complaint_messages')
    .select(COMPLAINT_MESSAGE_COLUMNS)
    .where('complaint_id', 'in', (eb) => eb.selectFrom('complaints')
      .select('id')
      .where('id', '=', a.complaintId)
      .where(complaintParty(a.viewerId)));
  if (a.afterId) q = q.where(sql<boolean>`(created_at, id) > (select created_at, id from complaint_messages where id = ${a.afterId}::uuid)`);
  return q.orderBy('created_at', 'asc').orderBy('id', 'asc').limit(a.limit + 1).execute();
}

// ---------- Reports ----------

export const REPORT_COLUMNS = [
  'id', 'reporter_id', 'product_id', 'farmer_id', 'review_id', 'reason', 'details', 'status',
  'handled_by', 'handled_at', 'created_at',
] as const;

export interface NewReport {
  reporterId: string;
  productId?: string;
  farmerId?: string;
  reviewId?: string;
  reason: string;
  details?: string | null;
}

/**
 * Files a report. Exactly one target (product, farmer or review) is required. The exclusive-arc CHECK decides:
 * zero or two targets fail with CheckViolationError (chk_report_target).
 */
export function insertReport(db: Executor, r: NewReport) {
  return db.insertInto('reports')
    .values({
      reporter_id: r.reporterId,
      product_id: r.productId ?? null,
      farmer_id: r.farmerId ?? null,
      review_id: r.reviewId ?? null,
      reason: r.reason,
      details: r.details ?? null,
    })
    .returning(REPORT_COLUMNS)
    .executeTakeFirstOrThrow();
}

/**
 * Admin triage. Guarded on the source state. handled_by is set on every move, and handled_at only when the report
 * is closed (actioned or dismissed). undefined when the report is not in `from`.
 */
export function setReportStatus(db: Executor, a: { reportId: string; from: ReportStatus; to: ReportStatus; handledBy: string }) {
  const closed = a.to === 'actioned' || a.to === 'dismissed';
  const set: UpdateObject<Database, 'reports'> = { status: a.to, handled_by: a.handledBy };
  if (closed) set.handled_at = sql<Date>`now()`;
  return db.updateTable('reports')
    .set(set)
    .where('id', '=', a.reportId)
    .where('status', '=', a.from)
    .returning(REPORT_COLUMNS)
    .executeTakeFirst();
}

/**
 * The admin report queue, oldest first, optional status filter. Keyset on (created_at, id) ascending.
 * Matches reports_status_created_at_idx.
 */
export function listReportQueue(db: Executor, a: { status?: ReportStatus; afterId: string | null; limit: number }) {
  let q = db.selectFrom('reports').select(REPORT_COLUMNS);
  if (a.status) q = q.where('status', '=', a.status);
  if (a.afterId) q = q.where(sql<boolean>`(created_at, id) > (select created_at, id from reports where id = ${a.afterId}::uuid)`);
  return q.orderBy('created_at', 'asc').orderBy('id', 'asc').limit(a.limit + 1).execute();
}
