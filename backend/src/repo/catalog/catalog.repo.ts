import { sql, type UpdateObject } from 'kysely';
import type { Database } from '../db';
import type { Executor } from '../executor';
import { requireTransaction } from '../executor';
import { qty } from '../money';
import type { NotificationFrequency, ProductStatus, ProductUnit } from '../db.generated';

// ---------- Categories and tags ----------

export const CATEGORY_COLUMNS = ['id', 'parent_id', 'slug', 'name', 'icon', 'sort_order', 'is_active'] as const;

export function listActiveCategories(db: Executor, limit: number) {
  return db.selectFrom('categories')
    .select(CATEGORY_COLUMNS)
    .where('is_active', '=', true)
    .orderBy('sort_order', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

export function findCategoryBySlug(db: Executor, slug: string) {
  return db.selectFrom('categories').select(CATEGORY_COLUMNS).where('slug', '=', slug).executeTakeFirst();
}

/** Get-or-create by slug. A replay returns the existing tag and keeps its name. */
export async function ensureTag(db: Executor, t: { slug: string; name: string }) {
  await db.insertInto('tags')
    .values({ slug: t.slug, name: t.name })
    .onConflict((oc) => oc.column('slug').doNothing())
    .execute();
  return db.selectFrom('tags').select(['id', 'slug', 'name']).where('slug', '=', t.slug).executeTakeFirstOrThrow();
}

/**
 * Replaces the tags of a product. An empty list clears them. Duplicate ids are removed here,
 * because the primary key would reject them. Requires a transaction.
 */
export async function setProductTags(db: Executor, productId: string, tagIds: string[]) {
  requireTransaction(db, 'setProductTags');
  const unique = [...new Set(tagIds)];
  await db.deleteFrom('product_tags').where('product_id', '=', productId).execute();
  if (unique.length === 0) return [];
  return db.insertInto('product_tags')
    .values(unique.map((tagId) => ({ product_id: productId, tag_id: tagId })))
    .returning(['product_id', 'tag_id'])
    .execute();
}

// ---------- Products ----------

export const PRODUCT_COLUMNS = [
  'id', 'farmer_id', 'category_id', 'slug', 'name', 'alt_names', 'description', 'unit', 'price',
  'min_order_qty', 'status', 'low_stock_threshold', 'surplus_enabled', 'surplus_floor_price',
  'source_waitlist_id', 'available_qty', 'current_batch_id', 'rating_avg', 'rating_count',
  'sold_qty', 'subscriber_count', 'created_at', 'updated_at',
] as const;

/** Columns for cards and search hits. Stock and rating only, so no farmer-internal fields. */
export const PRODUCT_CARD_COLUMNS = [
  'id', 'slug', 'name', 'unit', 'price', 'min_order_qty', 'available_qty', 'rating_avg', 'rating_count',
  'surplus_enabled', 'surplus_floor_price',
] as const;

export function findProductById(db: Executor, productId: string) {
  return db.selectFrom('products').select(PRODUCT_COLUMNS).where('id', '=', productId).executeTakeFirst();
}

/** Any status: the service decides whether a draft or banned product is shown. */
export function findProductBySlug(db: Executor, slug: string) {
  return db.selectFrom('products').select(PRODUCT_COLUMNS).where('slug', '=', slug).executeTakeFirst();
}

/** Owner-scoped. A guessed id of another farmer's product returns nothing. */
export function findProductForFarmer(db: Executor, productId: string, farmerId: string) {
  return db.selectFrom('products')
    .select(PRODUCT_COLUMNS)
    .where('id', '=', productId)
    .where('farmer_id', '=', farmerId)
    .executeTakeFirst();
}

export interface NewProduct {
  farmerId: string;
  categoryId: string;
  slug: string;
  name: string;
  unit: ProductUnit;
  price: string | number | bigint;
  altNames?: string[];
  description?: string | null;
  minOrderQty?: string | number;
  lowStockThreshold?: string | number | null;
  surplusEnabled?: boolean;
  surplusFloorPrice?: string | number | bigint | null;
  sourceWaitlistId?: string | null;
}

/** A duplicate slug fails with UniqueViolationError (products_slug_key). Stock starts at zero. */
export function insertProduct(db: Executor, p: NewProduct) {
  return db.insertInto('products')
    .values({
      farmer_id: p.farmerId,
      category_id: p.categoryId,
      slug: p.slug,
      name: p.name,
      unit: p.unit,
      price: String(p.price),
      alt_names: p.altNames ?? [],
      description: p.description ?? null,
      min_order_qty: p.minOrderQty === undefined ? undefined : qty(p.minOrderQty),
      low_stock_threshold: p.lowStockThreshold === undefined || p.lowStockThreshold === null ? null : qty(p.lowStockThreshold),
      surplus_enabled: p.surplusEnabled ?? false,
      surplus_floor_price: p.surplusFloorPrice === undefined || p.surplusFloorPrice === null ? null : String(p.surplusFloorPrice),
      source_waitlist_id: p.sourceWaitlistId ?? null,
    })
    .returning(PRODUCT_COLUMNS)
    .executeTakeFirstOrThrow();
}

/**
 * Fields a farmer edits without an audit trail requirement. Price has its own function
 * (audited through withActor), and status goes through setProductStatus.
 */
export interface ProductDetailsPatch {
  name?: string;
  altNames?: string[];
  description?: string | null;
  categoryId?: string;
  minOrderQty?: string | number;
  lowStockThreshold?: string | number | null;
  surplusEnabled?: boolean;
  surplusFloorPrice?: string | number | bigint | null;
}

/** Owner-scoped. undefined when the product is not this farmer's. An empty patch reads it back. */
export async function updateProductDetails(db: Executor, farmerId: string, productId: string, p: ProductDetailsPatch) {
  const set: UpdateObject<Database, 'products'> = {};
  if (p.name !== undefined) set.name = p.name;
  if (p.altNames !== undefined) set.alt_names = p.altNames;
  if (p.description !== undefined) set.description = p.description;
  if (p.categoryId !== undefined) set.category_id = p.categoryId;
  if (p.minOrderQty !== undefined) set.min_order_qty = qty(p.minOrderQty);
  if (p.lowStockThreshold !== undefined) set.low_stock_threshold = p.lowStockThreshold === null ? null : qty(p.lowStockThreshold);
  if (p.surplusEnabled !== undefined) set.surplus_enabled = p.surplusEnabled;
  if (p.surplusFloorPrice !== undefined) set.surplus_floor_price = p.surplusFloorPrice === null ? null : String(p.surplusFloorPrice);

  if (Object.keys(set).length > 0) {
    const row = await db.updateTable('products').set(set)
      .where('id', '=', productId)
      .where('farmer_id', '=', farmerId)
      .returning('id')
      .executeTakeFirst();
    if (!row) return undefined;
  }
  return findProductForFarmer(db, productId, farmerId);
}

/**
 * Sets the base price. Run it through withActor: the audit trigger on products.price needs the actor.
 * The price-tier trigger checks at commit, so a price below an existing tier fails there.
 */
export function setProductPrice(db: Executor, farmerId: string, productId: string, price: string | number | bigint) {
  return db.updateTable('products')
    .set({ price: String(price) })
    .where('id', '=', productId)
    .where('farmer_id', '=', farmerId)
    .returning(['id', 'price'])
    .executeTakeFirst();
}

/** Guarded transition. undefined when the product is not in the `from` state. */
export function setProductStatus(db: Executor, a: { productId: string; from: ProductStatus; to: ProductStatus }) {
  return db.updateTable('products')
    .set({ status: a.to })
    .where('id', '=', a.productId)
    .where('status', '=', a.from)
    .returning(['id', 'status'])
    .executeTakeFirst();
}

// ---------- Catalog list ----------

export interface CatalogFilter {
  categoryId?: string;
  farmerId?: string;
  tagId?: string;
  surplusOnly?: boolean;
}

export interface CatalogCursor {
  price?: string;
  id: string;
}

/**
 * Active products. Sort `price` is ascending with keyset (price, id). Sort `newest` is descending by id,
 * which is UUIDv7 and so time order. Pass the last row of the previous page as `after`.
 * Returns up to limit + 1 rows: the extra row only tells the service that another page exists.
 */
export function listCatalog(db: Executor, a: {
  filter?: CatalogFilter;
  sort: 'price' | 'newest';
  after?: CatalogCursor | null;
  limit: number;
}) {
  const f = a.filter ?? {};
  let q = db.selectFrom('products').select(PRODUCT_CARD_COLUMNS).where('status', '=', 'active');
  if (f.categoryId) q = q.where('category_id', '=', f.categoryId);
  if (f.farmerId) q = q.where('farmer_id', '=', f.farmerId);
  if (f.surplusOnly) q = q.where('surplus_enabled', '=', true);
  if (f.tagId) {
    const tagId = f.tagId;
    q = q.where('id', 'in', (eb) => eb.selectFrom('product_tags').select('product_id').where('tag_id', '=', tagId));
  }

  if (a.sort === 'price') {
    if (a.after?.price !== undefined) {
      const { price, id } = { price: a.after.price, id: a.after.id };
      q = q.where((eb) => eb(eb.refTuple('price', 'id'), '>', eb.tuple(price, id)));
    }
    return q.orderBy('price', 'asc').orderBy('id', 'asc').limit(a.limit + 1).execute();
  }
  if (a.after) q = q.where('id', '<', a.after.id);
  return q.orderBy('id', 'desc').limit(a.limit + 1).execute();
}

// ---------- Search ----------

/**
 * Turns the user's text into the term full-text search will match: a synonym's canonical term when one
 * exists ("cabe" becomes "cabai"), otherwise the normalized text. Search terms are never parsed as tsquery.
 */
export function resolveSearchTerm(db: Executor, text: string) {
  return db.selectNoFrom(
    sql<string>`coalesce(
      (select canonical_term from search_synonyms where term = lower(f_unaccent(${text}))),
      lower(f_unaccent(${text}))
    )`.as('term'),
  ).executeTakeFirstOrThrow();
}

export function searchProductsFullText(db: Executor, term: string, limit: number) {
  const query = sql`plainto_tsquery('simple', f_unaccent(${term}))`;
  return db.selectFrom('products')
    .select(PRODUCT_CARD_COLUMNS)
    .where('status', '=', 'active')
    .where(sql<boolean>`search_vector @@ ${query}`)
    .orderBy(sql`ts_rank(search_vector, ${query})`, 'desc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/** Typo fallback. Uses the trigram index on name (products_name_trgm). */
export function searchProductsTrigram(db: Executor, text: string, limit: number) {
  return db.selectFrom('products')
    .select(PRODUCT_CARD_COLUMNS)
    .where('status', '=', 'active')
    .where(sql<boolean>`name % ${text}`)
    .orderBy(sql`similarity(name, ${text})`, 'desc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/**
 * Full-text first. Trigram runs only when that finds nothing. Two plain reads, so no transaction.
 */
export async function searchProducts(db: Executor, text: string, limit: number) {
  const { term } = await resolveSearchTerm(db, text);
  const hits = await searchProductsFullText(db, term, limit);
  if (hits.length > 0) return hits;
  return searchProductsTrigram(db, text, limit);
}

// ---------- Price tiers ----------

export interface PriceTierInput {
  minQty: string | number;
  unitPrice: string | number | bigint;
}

/**
 * Replaces all tiers. The "cheaper as quantity rises" rule is a deferred trigger, so a bad tier
 * fails at COMMIT (or at SET CONSTRAINTS ALL IMMEDIATE in a test) with CheckViolationError.
 * Requires a transaction.
 */
export async function replacePriceTiers(db: Executor, productId: string, tiers: PriceTierInput[]) {
  requireTransaction(db, 'replacePriceTiers');
  await db.deleteFrom('price_tiers').where('product_id', '=', productId).execute();
  if (tiers.length === 0) return [];
  return db.insertInto('price_tiers')
    .values(tiers.map((t) => ({
      product_id: productId,
      min_qty: qty(t.minQty),
      unit_price: String(t.unitPrice),
    })))
    .returning(['id', 'min_qty', 'unit_price'])
    .execute();
}

export function listPriceTiers(db: Executor, productId: string, limit: number) {
  return db.selectFrom('price_tiers')
    .select(['id', 'min_qty', 'unit_price'])
    .where('product_id', '=', productId)
    .orderBy('min_qty', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/** Unit price for a quantity: the highest tier whose min_qty is reached, otherwise the base price. */
export function findEffectiveUnitPrice(db: Executor, productId: string, quantity: string | number) {
  return db.selectFrom('products')
    .select(
      sql<string>`coalesce(
        (select t.unit_price from price_tiers t
          where t.product_id = products.id and t.min_qty <= ${qty(quantity)}::numeric
          order by t.min_qty desc limit 1),
        products.price)::text`.as('unit_price'),
    )
    .where('id', '=', productId)
    .executeTakeFirst();
}

// ---------- Surplus rules ----------

export interface SurplusRuleInput {
  daysRemaining: number;
  discountPct: string | number;
}

/** Replaces the rules of a product. Requires a transaction. Audited through withActor by the service. */
export async function replaceSurplusRules(db: Executor, productId: string, rules: SurplusRuleInput[]) {
  requireTransaction(db, 'replaceSurplusRules');
  await db.deleteFrom('surplus_rules').where('product_id', '=', productId).execute();
  if (rules.length === 0) return [];
  return db.insertInto('surplus_rules')
    .values(rules.map((r) => ({
      product_id: productId,
      days_remaining: r.daysRemaining,
      discount_pct: qty(r.discountPct),
    })))
    .returning(['id', 'days_remaining', 'discount_pct'])
    .execute();
}

export function listSurplusRules(db: Executor, productId: string, limit: number) {
  return db.selectFrom('surplus_rules')
    .select(['id', 'days_remaining', 'discount_pct'])
    .where('product_id', '=', productId)
    .orderBy('days_remaining', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/**
 * The rule that applies at daysLeft: a rule applies when daysLeft <= days_remaining, and the
 * smallest matching days_remaining is the most specific one.
 */
export function findSurplusRuleFor(db: Executor, productId: string, daysLeft: number) {
  return db.selectFrom('surplus_rules')
    .select(['id', 'days_remaining', 'discount_pct'])
    .where('product_id', '=', productId)
    .where('days_remaining', '>=', daysLeft)
    .orderBy('days_remaining', 'asc')
    .limit(1)
    .executeTakeFirst();
}

// ---------- Photos ----------

export interface NewProductPhoto {
  productId: string;
  mediaId: string;
  batchId?: string | null;
  caption?: string | null;
  position?: number;
}

/** media_id is unique: one media asset can only be a photo once. */
export function insertProductPhoto(db: Executor, p: NewProductPhoto) {
  return db.insertInto('product_photos')
    .values({
      product_id: p.productId,
      media_id: p.mediaId,
      batch_id: p.batchId ?? null,
      caption: p.caption ?? null,
      position: p.position ?? 0,
    })
    .returning(['id', 'product_id', 'batch_id', 'media_id', 'caption', 'position'])
    .executeTakeFirstOrThrow();
}

export function listProductPhotos(db: Executor, productId: string, limit: number) {
  return db.selectFrom('product_photos')
    .select(['id', 'batch_id', 'media_id', 'caption', 'position'])
    .where('product_id', '=', productId)
    .orderBy('position', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

// ---------- Subscriptions ----------

export interface ProductSubscriptionInput {
  userId: string;
  productId: string;
  onNewStock?: boolean;
  onPriceDrop?: boolean;
  onBackInStock?: boolean;
  frequency?: NotificationFrequency;
}

/**
 * Subscribe or update the choices. The subscriber_count trigger fires only on the first insert,
 * so repeated calls do not double count.
 */
export function upsertProductSubscription(db: Executor, s: ProductSubscriptionInput) {
  const values = {
    user_id: s.userId,
    product_id: s.productId,
    on_new_stock: s.onNewStock ?? true,
    on_price_drop: s.onPriceDrop ?? true,
    on_back_in_stock: s.onBackInStock ?? true,
    frequency: s.frequency ?? 'instant',
  };
  return db.insertInto('product_subscriptions')
    .values(values)
    .onConflict((oc) => oc.columns(['user_id', 'product_id']).doUpdateSet({
      on_new_stock: (eb) => eb.ref('excluded.on_new_stock'),
      on_price_drop: (eb) => eb.ref('excluded.on_price_drop'),
      on_back_in_stock: (eb) => eb.ref('excluded.on_back_in_stock'),
      frequency: (eb) => eb.ref('excluded.frequency'),
    }))
    .returning(['user_id', 'product_id', 'on_new_stock', 'on_price_drop', 'on_back_in_stock', 'frequency'])
    .executeTakeFirstOrThrow();
}

export function deleteProductSubscription(db: Executor, userId: string, productId: string) {
  return db.deleteFrom('product_subscriptions')
    .where('user_id', '=', userId)
    .where('product_id', '=', productId)
    .returning('product_id')
    .executeTakeFirst();
}

// ---------- Stock: batches ----------

export const BATCH_COLUMNS = [
  'id', 'product_id', 'batch_no', 'initial_qty', 'on_hand_qty', 'reserved_qty', 'status',
  'surplus_discount_pct', 'source_waitlist_id', 'expired_at', 'created_at',
] as const;

/** Dates come back as YYYY-MM-DD text, never as a Date (pg parses date as local midnight). */
export const BATCH_DATE_COLUMNS = [
  sql<string>`harvested_on::text`.as('harvested_on'),
  sql<string>`expires_on::text`.as('expires_on'),
] as const;

export function findBatchById(db: Executor, batchId: string) {
  return db.selectFrom('product_batches')
    .select(BATCH_COLUMNS)
    .select(BATCH_DATE_COLUMNS)
    .where('id', '=', batchId)
    .executeTakeFirst();
}

export function listBatchesForProduct(db: Executor, productId: string, limit: number) {
  return db.selectFrom('product_batches')
    .select(BATCH_COLUMNS)
    .select(BATCH_DATE_COLUMNS)
    .where('product_id', '=', productId)
    .orderBy('expires_on', 'asc')
    .orderBy('batch_no', 'asc')
    .limit(limit)
    .execute();
}

export interface NewBatch {
  productId: string;
  createdBy: string;
  initialQty: string | number;
  harvestedOn: string;
  expiresOn: string;
  sourceWaitlistId?: string | null;
}

/**
 * Receives a harvest: the batch and its stock_in movement in one transaction, so on_hand_qty always
 * equals the sum of movements. The product row is locked first, so batch_no (max + 1) cannot race.
 * Requires a transaction.
 */
export async function receiveBatch(db: Executor, b: NewBatch) {
  requireTransaction(db, 'receiveBatch');
  await db.selectFrom('products').select('id').where('id', '=', b.productId).forUpdate().executeTakeFirstOrThrow();
  const initial = qty(b.initialQty);
  const created = await db.insertInto('product_batches')
    .values({
      product_id: b.productId,
      batch_no: sql<number>`(select coalesce(max(batch_no), 0) + 1 from product_batches where product_id = ${b.productId})`,
      initial_qty: initial,
      on_hand_qty: initial,
      harvested_on: b.harvestedOn,
      expires_on: b.expiresOn,
      source_waitlist_id: b.sourceWaitlistId ?? null,
      created_by: b.createdBy,
    })
    .returning('id')
    .executeTakeFirstOrThrow();
  await db.insertInto('stock_movements')
    .values({ batch_id: created.id, type: 'stock_in', qty_delta: initial, actor_id: b.createdBy })
    .execute();
  return findBatchById(db, created.id);
}

/**
 * Manual correction of on_hand_qty with the reason the schema requires. The CHECKs decide:
 * going below zero fails chk_on_hand_nonneg, going below reserved fails chk_reserved_le_on_hand.
 * undefined when the batch does not exist. Requires a transaction.
 */
export async function adjustBatchOnHand(db: Executor, a: {
  batchId: string;
  delta: string | number;
  reason: string;
  actorId: string;
}) {
  requireTransaction(db, 'adjustBatchOnHand');
  const delta = qty(a.delta);
  const row = await db.updateTable('product_batches')
    .set((eb) => ({ on_hand_qty: eb('on_hand_qty', '+', delta) }))
    .where('id', '=', a.batchId)
    .returning('id')
    .executeTakeFirst();
  if (!row) return undefined;
  await db.insertInto('stock_movements')
    .values({ batch_id: a.batchId, type: 'manual_adjustment', qty_delta: delta, reason: a.reason, actor_id: a.actorId })
    .execute();
  return findBatchById(db, a.batchId);
}

/**
 * FEFO lock: sellable batches of a product, nearest expiry first, batch_no as tiebreak.
 * Expiry is judged in Jakarta time. Locks in a fixed order, so concurrent checkouts cannot deadlock.
 * Requires a transaction.
 */
export function lockFefoBatches(db: Executor, productId: string) {
  requireTransaction(db, 'lockFefoBatches');
  return db.selectFrom('product_batches')
    .select(['id', 'batch_no', 'on_hand_qty', 'reserved_qty', 'surplus_discount_pct'])
    .select(sql<string>`expires_on::text`.as('expires_on'))
    .where('product_id', '=', productId)
    .where('status', '=', 'active')
    .where(sql<boolean>`expires_on >= (now() at time zone 'Asia/Jakarta')::date`)
    .whereRef('on_hand_qty', '>', 'reserved_qty')
    .orderBy('expires_on', 'asc')
    .orderBy('batch_no', 'asc')
    .forUpdate()
    .execute();
}

/** Nightly job: sets or clears the cached surplus discount of an active batch. */
export function setBatchSurplusDiscount(db: Executor, batchId: string, pct: string | number | null) {
  return db.updateTable('product_batches')
    .set({ surplus_discount_pct: pct === null ? null : qty(pct) })
    .where('id', '=', batchId)
    .where('status', '=', 'active')
    .returning(['id', 'surplus_discount_pct'])
    .executeTakeFirst();
}

/**
 * Nightly job: marks active batches whose expiry date has passed (Jakarta time) as expired.
 * SKIP LOCKED lets several instances run safely. The status change fires refresh_product_stock.
 * Requires a transaction.
 */
export async function expireDueBatches(db: Executor, limit: number) {
  requireTransaction(db, 'expireDueBatches');
  const due = await db.selectFrom('product_batches')
    .select('id')
    .where('status', '=', 'active')
    .where(sql<boolean>`expires_on < (now() at time zone 'Asia/Jakarta')::date`)
    .orderBy('expires_on', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute();
  if (due.length === 0) return [];
  return db.updateTable('product_batches')
    .set({ status: 'expired', expired_at: sql<Date>`now()` })
    .where('id', 'in', due.map((d) => d.id))
    .returning(['id', 'product_id'])
    .execute();
}

// ---------- Stock: reservations ----------

/**
 * Holds qty on a batch for an order item. The batch update is one statement, so the
 * chk_reserved_le_on_hand CHECK rejects an over-reservation with CheckViolationError.
 * Expired or non-active batches are not reservable, even if the nightly job is late.
 * undefined when the batch is not sellable. Requires a transaction.
 */
export async function reserveStock(db: Executor, a: {
  batchId: string;
  orderItemId: string;
  quantity: string | number;
  ttlMinutes?: number;
}) {
  requireTransaction(db, 'reserveStock');
  const quantity = qty(a.quantity);
  const batch = await db.updateTable('product_batches')
    .set((eb) => ({ reserved_qty: eb('reserved_qty', '+', quantity) }))
    .where('id', '=', a.batchId)
    .where('status', '=', 'active')
    .where(sql<boolean>`expires_on >= (now() at time zone 'Asia/Jakarta')::date`)
    .returning('id')
    .executeTakeFirst();
  if (!batch) return undefined;
  return db.insertInto('stock_reservations')
    .values({
      batch_id: a.batchId,
      order_item_id: a.orderItemId,
      qty: quantity,
      expires_at: sql<Date>`now() + make_interval(mins => ${a.ttlMinutes ?? 60})`,
    })
    .returning(['id', 'batch_id', 'qty', 'expires_at'])
    .executeTakeFirstOrThrow();
}

/** Releases an active hold and gives its qty back to the batch. undefined when it is not active. */
export async function releaseReservation(db: Executor, reservationId: string) {
  requireTransaction(db, 'releaseReservation');
  const r = await db.updateTable('stock_reservations')
    .set({ status: 'released', resolved_at: sql<Date>`now()` })
    .where('id', '=', reservationId)
    .where('status', '=', 'active')
    .returning(['id', 'batch_id', 'qty'])
    .executeTakeFirst();
  if (!r) return undefined;
  await db.updateTable('product_batches')
    .set((eb) => ({ reserved_qty: eb('reserved_qty', '-', r.qty) }))
    .where('id', '=', r.batch_id)
    .execute();
  return r;
}

/**
 * Sweeper: claims up to limit expired active holds with SKIP LOCKED, releases them, then gives the
 * qty back batch by batch in sorted batch_id order. Requires a transaction.
 */
export async function releaseExpiredReservations(db: Executor, limit: number) {
  requireTransaction(db, 'releaseExpiredReservations');
  const claimed = await db.updateTable('stock_reservations')
    .set({ status: 'released', resolved_at: sql<Date>`now()` })
    .where('id', 'in', (eb) => eb.selectFrom('stock_reservations').select('id')
      .where('status', '=', 'active')
      .where('expires_at', '<', sql<Date>`now()`)
      .orderBy('expires_at', 'asc')
      .orderBy('id', 'asc')
      .limit(limit)
      .forUpdate()
      .skipLocked())
    .returning(['id', 'batch_id', 'qty'])
    .execute();
  const sorted = [...claimed].sort((x, y) => (x.batch_id < y.batch_id ? -1 : x.batch_id > y.batch_id ? 1 : 0));
  for (const r of sorted) {
    await db.updateTable('product_batches')
      .set((eb) => ({ reserved_qty: eb('reserved_qty', '-', r.qty) }))
      .where('id', '=', r.batch_id)
      .execute();
  }
  return sorted;
}
