import { sql } from 'kysely';
import type { Executor } from '../executor';
import { requireTransaction } from '../executor';
import { qty } from '../money';

// ---------- Carts ----------

export const CART_COLUMNS = [
  'id', 'buyer_id', 'kind', 'name', 'note', 'last_checkout_at', 'checkout_count', 'created_at', 'updated_at',
] as const;

export const CART_ITEM_COLUMNS = ['id', 'cart_id', 'product_id', 'waitlist_id', 'quantity', 'position', 'added_at'] as const;

export const ALTERNATIVE_COLUMNS = ['id', 'cart_item_id', 'product_id', 'priority'] as const;

/** The subquery that proves a cart belongs to the buyer. Used as a filter, so a wrong owner matches nothing. */
function ownedCart(db: Executor, cartId: string, buyerId: string) {
  return db.selectFrom('carts').select('id').where('id', '=', cartId).where('buyer_id', '=', buyerId);
}

/** The cart item row joined to its cart, filtered on the owner. */
function ownedItem(db: Executor, itemId: string, buyerId: string) {
  return db.selectFrom('cart_items')
    .innerJoin('carts', 'carts.id', 'cart_items.cart_id')
    .select('cart_items.id')
    .where('cart_items.id', '=', itemId)
    .where('carts.buyer_id', '=', buyerId);
}

/**
 * The buyer's temporary cart, created on first use. carts_one_temporary is a partial unique index,
 * so the conflict target repeats its predicate. A replayed insert returns no row, and the select reads the existing one.
 */
export async function getOrCreateTemporaryCart(db: Executor, buyerId: string) {
  const created = await db.insertInto('carts')
    .values({ buyer_id: buyerId, kind: 'temporary' })
    .onConflict((oc) => oc.column('buyer_id').where('kind', '=', 'temporary').doNothing())
    .returning(CART_COLUMNS)
    .executeTakeFirst();
  if (created) return created;
  return db.selectFrom('carts')
    .select(CART_COLUMNS)
    .where('buyer_id', '=', buyerId)
    .where('kind', '=', 'temporary')
    .executeTakeFirstOrThrow();
}

/** Owner-scoped read of any cart, temporary or recipe. */
export function findCartForBuyer(db: Executor, cartId: string, buyerId: string) {
  return db.selectFrom('carts').select(CART_COLUMNS).where('id', '=', cartId).where('buyer_id', '=', buyerId).executeTakeFirst();
}

export interface NewRecipeCart {
  buyerId: string;
  name: string;
  note?: string | null;
}

/** A recipe cart needs a name (chk_recipe_name), so the caller must pass one. */
export function createRecipeCart(db: Executor, c: NewRecipeCart) {
  return db.insertInto('carts')
    .values({ buyer_id: c.buyerId, kind: 'recipe', name: c.name, note: c.note ?? null })
    .returning(CART_COLUMNS)
    .executeTakeFirstOrThrow();
}

/**
 * The buyer's recipe carts, by id ascending. Keyset: pass the last id of the previous page as afterId.
 * Returns up to limit + 1 rows so the caller can tell whether a next page exists.
 */
export function listRecipeCarts(db: Executor, a: { buyerId: string; afterId: string | null; limit: number }) {
  let q = db.selectFrom('carts')
    .select(CART_COLUMNS)
    .where('buyer_id', '=', a.buyerId)
    .where('kind', '=', 'recipe');
  if (a.afterId) q = q.where('id', '>', a.afterId);
  return q.orderBy('id', 'asc').limit(a.limit + 1).execute();
}

/** Renames a recipe cart. A temporary cart never matches (kind filter), so its name cannot be set. */
export function updateRecipeCart(db: Executor, a: { buyerId: string; cartId: string; name: string; note: string | null }) {
  return db.updateTable('carts')
    .set({ name: a.name, note: a.note })
    .where('id', '=', a.cartId)
    .where('buyer_id', '=', a.buyerId)
    .where('kind', '=', 'recipe')
    .returning(CART_COLUMNS)
    .executeTakeFirst();
}

/** Deletes a recipe cart. Its items and alternatives go with it (ON DELETE CASCADE). The temporary cart cannot be deleted here. */
export function deleteRecipeCart(db: Executor, a: { buyerId: string; cartId: string }) {
  return db.deleteFrom('carts')
    .where('id', '=', a.cartId)
    .where('buyer_id', '=', a.buyerId)
    .where('kind', '=', 'recipe')
    .returning('id')
    .executeTakeFirst();
}

// ---------- Items ----------

/** A cart line is either a product or a wait list (a recipe ingredient that checks out as a Commit). chk_item_target enforces exactly one. */
export type CartItemTarget = { productId: string } | { waitlistId: string };

export type AddCartItem = CartItemTarget & { buyerId: string; cartId: string; quantity: string | number };

/**
 * Adds a line, or adds to the quantity if the cart already holds that product or wait list.
 * One statement: the row is selected from carts with the owner filter, then inserted. If the buyer
 * does not own the cart, the select returns no row, nothing is written, and the result is undefined.
 * Adding to a cart reserves no stock. chk_item_qty rejects a quantity of zero or less with CheckViolationError.
 */
export function addCartItem(db: Executor, a: AddCartItem) {
  const isProduct = 'productId' in a;
  const source = db.selectFrom('carts')
    .select([
      'carts.id as cart_id',
      sql<string | null>`${isProduct ? a.productId : null}::uuid`.as('product_id'),
      sql<string | null>`${isProduct ? null : a.waitlistId}::uuid`.as('waitlist_id'),
      sql<string>`${qty(a.quantity)}::numeric`.as('quantity'),
    ])
    .where('carts.id', '=', a.cartId)
    .where('carts.buyer_id', '=', a.buyerId);

  return db.insertInto('cart_items')
    .columns(['cart_id', 'product_id', 'waitlist_id', 'quantity'])
    .expression(source)
    .onConflict((oc) => (isProduct
      ? oc.columns(['cart_id', 'product_id']).doUpdateSet({ quantity: sql`cart_items.quantity + excluded.quantity` })
      : oc.columns(['cart_id', 'waitlist_id']).doUpdateSet({ quantity: sql`cart_items.quantity + excluded.quantity` })))
    .returning(CART_ITEM_COLUMNS)
    .executeTakeFirst();
}

/** Sets a line's quantity. undefined when the item is not in the buyer's cart. */
export function setCartItemQuantity(db: Executor, a: { buyerId: string; cartId: string; itemId: string; quantity: string | number }) {
  return db.updateTable('cart_items')
    .set({ quantity: qty(a.quantity) })
    .where('id', '=', a.itemId)
    .where('cart_id', 'in', ownedCart(db, a.cartId, a.buyerId))
    .returning(CART_ITEM_COLUMNS)
    .executeTakeFirst();
}

/** Removes a line from the buyer's cart. Its alternatives go with it (ON DELETE CASCADE). */
export function removeCartItem(db: Executor, a: { buyerId: string; cartId: string; itemId: string }) {
  return db.deleteFrom('cart_items')
    .where('id', '=', a.itemId)
    .where('cart_id', 'in', ownedCart(db, a.cartId, a.buyerId))
    .returning('id')
    .executeTakeFirst();
}

/** The lines of one cart in display order. Carts are small, so a plain limit is enough. */
export function listCartItems(db: Executor, a: { buyerId: string; cartId: string; limit: number }) {
  return db.selectFrom('cart_items')
    .select(CART_ITEM_COLUMNS)
    .where('cart_id', 'in', ownedCart(db, a.cartId, a.buyerId))
    .orderBy('position', 'asc')
    .orderBy('id', 'asc')
    .limit(a.limit)
    .execute();
}

// ---------- Alternatives ----------

/**
 * Every alternative product of one cart, in one query, ordered by item then priority.
 * The limit caps total rows, so the caller passes a bound that covers the cart's items.
 */
export function listCartAlternatives(db: Executor, a: { buyerId: string; cartId: string; limit: number }) {
  return db.selectFrom('cart_item_alternatives')
    .select(ALTERNATIVE_COLUMNS)
    .where('cart_item_id', 'in', db.selectFrom('cart_items').select('id').where('cart_id', 'in', ownedCart(db, a.cartId, a.buyerId)))
    .orderBy('cart_item_id', 'asc')
    .orderBy('priority', 'asc')
    .orderBy('id', 'asc')
    .limit(a.limit)
    .execute();
}

/**
 * Appends an alternative at the end of the priority list. Requires a transaction.
 * The item row is locked first, so two adds to the same item run one after the other and get distinct priorities.
 * A product already listed for this item fails with UniqueViolationError.
 * undefined when the item is not in the buyer's cart.
 */
export async function addAlternative(db: Executor, a: { buyerId: string; cartItemId: string; productId: string }) {
  requireTransaction(db, 'addAlternative');
  const item = await ownedItem(db, a.cartItemId, a.buyerId).forUpdate('cart_items').executeTakeFirst();
  if (!item) return undefined;

  return db.insertInto('cart_item_alternatives')
    .values({
      cart_item_id: a.cartItemId,
      product_id: a.productId,
      priority: sql<number>`(select coalesce(max(priority), 0) + 1 from cart_item_alternatives where cart_item_id = ${a.cartItemId})`,
    })
    .returning(ALTERNATIVE_COLUMNS)
    .executeTakeFirstOrThrow();
}

/**
 * Sets the priorities of one item's alternatives to the given order, 1 first. Requires a transaction.
 * The ids must be exactly this item's alternatives, each once. Otherwise nothing is written and undefined is returned.
 *
 * Priority is unique per item but deferrable (cart_item_alternatives_priority_key), so a swap is one
 * UPDATE and the check runs at COMMIT. An ON CONFLICT upsert cannot target that constraint (55000).
 */
export async function reorderAlternatives(db: Executor, a: { buyerId: string; cartItemId: string; orderedIds: string[] }) {
  requireTransaction(db, 'reorderAlternatives');
  if (new Set(a.orderedIds).size !== a.orderedIds.length) return undefined;

  const item = await ownedItem(db, a.cartItemId, a.buyerId).forUpdate('cart_items').executeTakeFirst();
  if (!item) return undefined;

  const current = await db.selectFrom('cart_item_alternatives')
    .select('id')
    .where('cart_item_id', '=', a.cartItemId)
    .execute();
  const existing = new Set(current.map((r) => r.id));
  if (existing.size !== a.orderedIds.length || a.orderedIds.some((id) => !existing.has(id))) return undefined;

  const priorities = a.orderedIds.map((_, i) => i + 1);
  await sql`
    update cart_item_alternatives as alt
    set priority = v.priority
    from unnest(${a.orderedIds}::uuid[], ${priorities}::smallint[]) as v(id, priority)
    where alt.id = v.id and alt.cart_item_id = ${a.cartItemId}
  `.execute(db);

  return db.selectFrom('cart_item_alternatives')
    .select(ALTERNATIVE_COLUMNS)
    .where('cart_item_id', '=', a.cartItemId)
    .orderBy('priority', 'asc')
    .execute();
}
