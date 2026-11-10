import { sql, type UpdateObject } from 'kysely';
import type { Database } from '../db';
import type { Executor } from '../executor';
import { requireTransaction } from '../executor';
import { qty } from '../money';
import type { DeliveryMethod, OrderItemSource, OrderStatus, ProductUnit } from '../db.generated';

type Money = string | number | bigint;

// ---------- Platform fee settings ----------

export const FEE_SETTING_COLUMNS = [
  'id', 'commission_pct', 'service_fee_pct', 'penalty_platform_share_pct', 'effective_from', 'created_by', 'created_at',
] as const;

export interface NewFeeSetting {
  commissionPct: string | number;
  serviceFeePct: string | number;
  penaltyPlatformSharePct?: string | number;
  effectiveFrom: Date;
  createdBy: string;
}

/** Appends a fee version. Rates above the spec limits fail with CheckViolationError. effective_from is unique. */
export function insertFeeSetting(db: Executor, f: NewFeeSetting) {
  return db.insertInto('platform_fee_settings')
    .values({
      commission_pct: qty(f.commissionPct),
      service_fee_pct: qty(f.serviceFeePct),
      penalty_platform_share_pct: f.penaltyPlatformSharePct === undefined ? undefined : qty(f.penaltyPlatformSharePct),
      effective_from: f.effectiveFrom,
      created_by: f.createdBy,
    })
    .returning(FEE_SETTING_COLUMNS)
    .executeTakeFirstOrThrow();
}

/**
 * The fee version in effect now: the latest effective_from at or before Postgres now().
 * Future-dated versions are ignored. undefined when no version exists yet (see database/seeds).
 */
export function findFeeSettingInEffect(db: Executor) {
  return db.selectFrom('platform_fee_settings')
    .select(FEE_SETTING_COLUMNS)
    .where('effective_from', '<=', sql<Date>`now()`)
    .orderBy('effective_from', 'desc')
    .limit(1)
    .executeTakeFirst();
}

// ---------- Checkouts ----------

export const CHECKOUT_COLUMNS = [
  'id', 'buyer_id', 'source_cart_id', 'address_id', 'address_snapshot', 'goods_total', 'shipping_total',
  'service_fee_total', 'grand_total', 'created_at',
] as const;

export interface NewCheckout {
  buyerId: string;
  sourceCartId?: string | null;
  addressId?: string | null;
  /** Frozen copy of the address. Stored as jsonb, so it is stringified. */
  addressSnapshot?: object | null;
  goodsTotal: Money;
  shippingTotal?: Money;
  serviceFeeTotal?: Money;
  grandTotal: Money;
}

export function insertCheckout(db: Executor, c: NewCheckout) {
  return db.insertInto('checkouts')
    .values({
      buyer_id: c.buyerId,
      source_cart_id: c.sourceCartId ?? null,
      address_id: c.addressId ?? null,
      address_snapshot: c.addressSnapshot == null ? null : JSON.stringify(c.addressSnapshot),
      goods_total: String(c.goodsTotal),
      shipping_total: c.shippingTotal === undefined ? undefined : String(c.shippingTotal),
      service_fee_total: c.serviceFeeTotal === undefined ? undefined : String(c.serviceFeeTotal),
      grand_total: String(c.grandTotal),
    })
    .returning(CHECKOUT_COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Owner-scoped. A guessed checkout id of another buyer returns nothing. */
export function findCheckoutForBuyer(db: Executor, checkoutId: string, buyerId: string) {
  return db.selectFrom('checkouts')
    .select(CHECKOUT_COLUMNS)
    .where('id', '=', checkoutId)
    .where('buyer_id', '=', buyerId)
    .executeTakeFirst();
}

// ---------- Orders ----------

export const ORDER_COLUMNS = [
  'id', 'code', 'checkout_id', 'buyer_id', 'farmer_id', 'status', 'escrow_status', 'goods_subtotal',
  'shipping_fee', 'service_fee', 'commission_fee', 'buyer_total', 'farmer_net', 'commission_pct',
  'service_fee_pct', 'fee_setting_id', 'payment_due_at', 'respond_by', 'confirmed_at', 'completed_at',
  'cancelled_at', 'cancel_reason', 'cancelled_by', 'created_at', 'updated_at',
] as const;

export interface NewOrder {
  code: string;
  checkoutId: string | null;
  buyerId: string;
  farmerId: string;
  goodsSubtotal: Money;
  shippingFee?: Money;
  serviceFee?: Money;
  commissionFee?: Money;
  /** Must equal goodsSubtotal + shippingFee + serviceFee (chk_buyer_total). */
  buyerTotal: Money;
  farmerNet: Money;
  commissionPct: string | number;
  serviceFeePct: string | number;
  feeSettingId: string;
  paymentDueAt?: Date | null;
  respondBy?: Date | null;
}

/** One order per farmer. The fee rates and fee_setting_id are a snapshot, so later fee changes never reach it. */
export function insertOrder(db: Executor, o: NewOrder) {
  return db.insertInto('orders')
    .values({
      code: o.code,
      checkout_id: o.checkoutId,
      buyer_id: o.buyerId,
      farmer_id: o.farmerId,
      goods_subtotal: String(o.goodsSubtotal),
      shipping_fee: o.shippingFee === undefined ? undefined : String(o.shippingFee),
      service_fee: o.serviceFee === undefined ? undefined : String(o.serviceFee),
      commission_fee: o.commissionFee === undefined ? undefined : String(o.commissionFee),
      buyer_total: String(o.buyerTotal),
      farmer_net: String(o.farmerNet),
      commission_pct: qty(o.commissionPct),
      service_fee_pct: qty(o.serviceFeePct),
      fee_setting_id: o.feeSettingId,
      payment_due_at: o.paymentDueAt ?? null,
      respond_by: o.respondBy ?? null,
    })
    .returning(ORDER_COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Owner-scoped read as the buyer. */
export function findOrderForBuyer(db: Executor, orderId: string, buyerId: string) {
  return db.selectFrom('orders').select(ORDER_COLUMNS).where('id', '=', orderId).where('buyer_id', '=', buyerId).executeTakeFirst();
}

/** Owner-scoped read as the farmer. farmer_id is the farmer's user id. */
export function findOrderForFarmer(db: Executor, orderId: string, farmerId: string) {
  return db.selectFrom('orders').select(ORDER_COLUMNS).where('id', '=', orderId).where('farmer_id', '=', farmerId).executeTakeFirst();
}

/**
 * Keyset filter on (created_at, id) that takes the cursor as the id of the last row seen. Postgres reads
 * that row's created_at itself. A JS Date would keep milliseconds only, and the microseconds of the stored
 * value would then drop rows at ties. The cursor id is not owner-checked, but it only ever compares
 * within the caller's own filter, so a foreign id yields nothing extra.
 */
function afterCursor(db: Executor, afterId: string) {
  return sql<boolean>`(created_at, id) < (select created_at, id from orders where id = ${afterId}::uuid)`;
}

/**
 * The buyer's orders, newest first, by (created_at, id). Matches orders_buyer_id_created_at_idx.
 * Pass the id of the last row of the previous page as `afterId`. Returns up to limit + 1 rows.
 */
export function listOrdersForBuyer(db: Executor, a: { buyerId: string; status?: OrderStatus; afterId: string | null; limit: number }) {
  let q = db.selectFrom('orders').select(ORDER_COLUMNS).where('buyer_id', '=', a.buyerId);
  if (a.status) q = q.where('status', '=', a.status);
  if (a.afterId) q = q.where(afterCursor(db, a.afterId));
  return q.orderBy('created_at', 'desc').orderBy('id', 'desc').limit(a.limit + 1).execute();
}

/** The farmer's orders, newest first. Same keyset as listOrdersForBuyer. Matches orders_farmer_id_status_created_at_idx. */
export function listOrdersForFarmer(db: Executor, a: { farmerId: string; status?: OrderStatus; afterId: string | null; limit: number }) {
  let q = db.selectFrom('orders').select(ORDER_COLUMNS).where('farmer_id', '=', a.farmerId);
  if (a.status) q = q.where('status', '=', a.status);
  if (a.afterId) q = q.where(afterCursor(db, a.afterId));
  return q.orderBy('created_at', 'desc').orderBy('id', 'desc').limit(a.limit + 1).execute();
}

/**
 * Guarded status change plus its append-only history row. Requires a transaction.
 * The UPDATE checks the source state, so a stale caller gets undefined and no history row is written.
 * Timestamps follow the target state: confirmed sets confirmed_at (and respond_by when given),
 * completed sets completed_at, cancelled sets cancelled_at with the reason and actor.
 * The audit trigger on orders.status records the change. Services call this through withActor.
 */
export async function setOrderStatus(db: Executor, a: {
  orderId: string;
  from: OrderStatus;
  to: OrderStatus;
  actorId: string | null;
  note?: string | null;
  respondBy?: Date | null;
  cancel?: { reason: string; by: string };
}) {
  requireTransaction(db, 'setOrderStatus');
  const set: UpdateObject<Database, 'orders'> = { status: a.to };
  if (a.to === 'confirmed') {
    set.confirmed_at = sql<Date>`now()`;
    if (a.respondBy !== undefined) set.respond_by = a.respondBy;
  }
  if (a.to === 'completed') set.completed_at = sql<Date>`now()`;
  if (a.to === 'cancelled') {
    set.cancelled_at = sql<Date>`now()`;
    set.cancel_reason = a.cancel?.reason ?? null;
    set.cancelled_by = a.cancel?.by ?? null;
  }

  const row = await db.updateTable('orders')
    .set(set)
    .where('id', '=', a.orderId)
    .where('status', '=', a.from)
    .returning(['id', 'status', 'buyer_id', 'farmer_id'])
    .executeTakeFirst();
  if (!row) return undefined;

  await db.insertInto('order_status_history')
    .values({ order_id: a.orderId, from_status: a.from, to_status: a.to, actor_id: a.actorId, note: a.note ?? null })
    .execute();
  return row;
}

/**
 * Completes a shipped order and updates the two counters that have no trigger: sold_qty on each product
 * (summed per product, locked in product_id order) and the farmer's completed_order_count.
 * Counters move only when the status change happened, so a replay changes nothing. Requires a transaction.
 */
export async function completeOrder(db: Executor, a: { orderId: string; from: OrderStatus; actorId: string | null }) {
  requireTransaction(db, 'completeOrder');
  const done = await setOrderStatus(db, { orderId: a.orderId, from: a.from, to: 'completed', actorId: a.actorId });
  if (!done) return undefined;

  const sold = await db.selectFrom('order_items')
    .select('product_id')
    .select(sql<string>`sum(quantity)::text`.as('qty'))
    .where('order_id', '=', a.orderId)
    .groupBy('product_id')
    .orderBy('product_id', 'asc')
    .execute();
  for (const s of sold) {
    await db.updateTable('products')
      .set((eb) => ({ sold_qty: eb('sold_qty', '+', s.qty) }))
      .where('id', '=', s.product_id)
      .execute();
  }

  await db.updateTable('farmer_profiles')
    .set((eb) => ({ completed_order_count: eb('completed_order_count', '+', 1) }))
    .where('user_id', '=', done.farmer_id)
    .execute();
  return done;
}

// ---------- Order items ----------

export const ORDER_ITEM_COLUMNS = [
  'id', 'order_id', 'product_id', 'source', 'commitment_id', 'substituted_for_product_id', 'product_name',
  'unit', 'quantity', 'tier_unit_price', 'line_subtotal',
] as const;

export interface NewOrderItem {
  productId: string;
  source?: OrderItemSource;
  commitmentId?: string | null;
  substitutedForProductId?: string | null;
  /** Snapshot of the product name at checkout. */
  productName: string;
  unit: ProductUnit;
  quantity: string | number;
  tierUnitPrice: Money;
  lineSubtotal: Money;
}

/**
 * Inserts the lines of one order in a single statement. An empty list returns early, because an
 * empty VALUES list is a syntax error. chk_order_item_qty rejects a quantity of zero or less.
 */
export async function insertOrderItems(db: Executor, orderId: string, items: NewOrderItem[]) {
  if (items.length === 0) return [];
  return db.insertInto('order_items')
    .values(items.map((i) => ({
      order_id: orderId,
      product_id: i.productId,
      source: i.source ?? 'direct',
      commitment_id: i.commitmentId ?? null,
      substituted_for_product_id: i.substitutedForProductId ?? null,
      product_name: i.productName,
      unit: i.unit,
      quantity: qty(i.quantity),
      tier_unit_price: String(i.tierUnitPrice),
      line_subtotal: String(i.lineSubtotal),
    })))
    .returning(ORDER_ITEM_COLUMNS)
    .execute();
}

/**
 * The lines of one order, for either party. The order must belong to userId as buyer or farmer,
 * so a guessed order id returns no lines.
 */
export function listOrderItemsForParty(db: Executor, a: { orderId: string; userId: string; limit: number }) {
  return db.selectFrom('order_items')
    .select(ORDER_ITEM_COLUMNS)
    .where('order_id', 'in', partyOrderIds(db, a.orderId, a.userId))
    .orderBy('id', 'asc')
    .limit(a.limit)
    .execute();
}

/** Subquery: the order id, only when userId is its buyer or its farmer. Used as a filter. */
function partyOrderIds(db: Executor, orderId: string, userId: string) {
  return db.selectFrom('orders')
    .select('id')
    .where('id', '=', orderId)
    .where(sql<boolean>`(buyer_id = ${userId}::uuid or farmer_id = ${userId}::uuid)`);
}

// ---------- Stock on sale ----------

export const ALLOCATION_COLUMNS = [
  'id', 'order_item_id', 'batch_id', 'qty', 'unit_price', 'surplus_discount_pct', 'line_amount',
] as const;

export interface ConvertReservation {
  reservationId: string;
  actorId: string | null;
  /** Price per unit from this batch, after tier and Surplus discounts. Computed by the service. */
  unitPrice: Money;
  surplusDiscountPct: string | number | null;
  lineAmount: Money;
}

/**
 * Turns an active hold into a sale: the reservation becomes converted, the batch loses the qty from
 * both on_hand_qty and reserved_qty, a 'sale' stock movement is written, and the allocation is recorded.
 * The CHECKs on product_batches reject an impossible state. undefined when the hold is not active.
 * Requires a transaction.
 */
export async function convertReservation(db: Executor, a: ConvertReservation) {
  requireTransaction(db, 'convertReservation');
  const hold = await db.updateTable('stock_reservations')
    .set({ status: 'converted', resolved_at: sql<Date>`now()` })
    .where('id', '=', a.reservationId)
    .where('status', '=', 'active')
    .returning(['batch_id', 'order_item_id', 'qty'])
    .executeTakeFirst();
  if (!hold) return undefined;

  await db.updateTable('product_batches')
    .set((eb) => ({
      on_hand_qty: eb('on_hand_qty', '-', hold.qty),
      reserved_qty: eb('reserved_qty', '-', hold.qty),
    }))
    .where('id', '=', hold.batch_id)
    .execute();

  await db.insertInto('stock_movements')
    .values({
      batch_id: hold.batch_id,
      type: 'sale',
      qty_delta: `-${hold.qty}`,
      order_item_id: hold.order_item_id,
      actor_id: a.actorId,
    })
    .execute();

  return db.insertInto('order_item_allocations')
    .values({
      order_item_id: hold.order_item_id,
      batch_id: hold.batch_id,
      qty: hold.qty,
      unit_price: String(a.unitPrice),
      surplus_discount_pct: a.surplusDiscountPct === null ? null : qty(a.surplusDiscountPct),
      line_amount: String(a.lineAmount),
    })
    .returning(ALLOCATION_COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Active holds of one order, for releasing them when it is cancelled. */
export function listActiveReservationsForOrder(db: Executor, orderId: string, limit: number) {
  return db.selectFrom('stock_reservations')
    .innerJoin('order_items', 'order_items.id', 'stock_reservations.order_item_id')
    .select(['stock_reservations.id', 'stock_reservations.batch_id', 'stock_reservations.qty'])
    .where('order_items.order_id', '=', orderId)
    .where('stock_reservations.status', '=', 'active')
    .orderBy('stock_reservations.id', 'asc')
    .limit(limit)
    .execute();
}

// ---------- Shipments ----------

export const SHIPMENT_COLUMNS = [
  'id', 'order_id', 'method', 'courier_code', 'courier_service', 'tracking_number', 'weight_grams',
  'distance_km', 'shipping_fee', 'scheduled_for', 'shipped_at', 'arrived_at', 'received_confirmed_at',
  'auto_release_at', 'created_at',
] as const;

export interface NewShipment {
  orderId: string;
  method: DeliveryMethod;
  courierCode?: string | null;
  courierService?: string | null;
  trackingNumber?: string | null;
  weightGrams?: number | null;
  distanceKm?: string | number | null;
  shippingFee?: Money;
  scheduledFor?: Date | null;
}

/** One shipment per order (UNIQUE order_id). A second insert fails with UniqueViolationError. */
export function insertShipment(db: Executor, s: NewShipment) {
  return db.insertInto('shipments')
    .values({
      order_id: s.orderId,
      method: s.method,
      courier_code: s.courierCode ?? null,
      courier_service: s.courierService ?? null,
      tracking_number: s.trackingNumber ?? null,
      weight_grams: s.weightGrams ?? null,
      distance_km: s.distanceKm === null || s.distanceKm === undefined ? null : qty(s.distanceKm),
      shipping_fee: s.shippingFee === undefined ? undefined : String(s.shippingFee),
      scheduled_for: s.scheduledFor ?? null,
    })
    .returning(SHIPMENT_COLUMNS)
    .executeTakeFirstOrThrow();
}

/** The shipment of one order, for either party. undefined for a stranger. */
export function findShipmentForParty(db: Executor, orderId: string, userId: string) {
  return db.selectFrom('shipments')
    .select(SHIPMENT_COLUMNS)
    .where('order_id', 'in', partyOrderIds(db, orderId, userId))
    .executeTakeFirst();
}

/**
 * Records arrival and starts the 3-day window: auto_release_at = now() + 3 days, computed by Postgres.
 * Guarded on arrived_at IS NULL, so a second call changes nothing and returns undefined.
 */
export function markShipmentArrived(db: Executor, orderId: string) {
  return db.updateTable('shipments')
    .set({ arrived_at: sql<Date>`now()`, auto_release_at: sql<Date>`now() + interval '3 days'` })
    .where('order_id', '=', orderId)
    .where('arrived_at', 'is', null)
    .returning(SHIPMENT_COLUMNS)
    .executeTakeFirst();
}

// ---------- Jobs ----------

/**
 * Auto-cancel of unpaid orders: awaiting_payment rows past payment_due_at, claimed with SKIP LOCKED.
 * The WHERE repeats the partial index predicate (orders_payment_due). Requires a transaction.
 */
export function lockUnpaidOrders(db: Executor, limit: number) {
  requireTransaction(db, 'lockUnpaidOrders');
  return db.selectFrom('orders')
    .select(['id', 'buyer_id', 'farmer_id', 'status', 'checkout_id'])
    .where('status', '=', 'awaiting_payment')
    .where('payment_due_at', '<', sql<Date>`now()`)
    .orderBy('payment_due_at', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute();
}

/**
 * Auto-cancel of confirmed orders the farmer did not process in time: confirmed rows past respond_by.
 * The WHERE repeats the partial index predicate (orders_respond_by). Requires a transaction.
 */
export function lockOverdueConfirmedOrders(db: Executor, limit: number) {
  requireTransaction(db, 'lockOverdueConfirmedOrders');
  return db.selectFrom('orders')
    .select(['id', 'buyer_id', 'farmer_id', 'status'])
    .where('status', '=', 'confirmed')
    .where('respond_by', '<', sql<Date>`now()`)
    .orderBy('respond_by', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute();
}
