import { afterAll, describe, expect, test } from 'bun:test';
import { closeDb, getDb } from '../db';
import { CheckViolationError, UniqueViolationError, mapDbError } from '../errors';
import type { Executor } from '../executor';
import { withRollback } from '../test-utils';
import { insertProduct } from '../catalog/catalog.repo';
import { ensureFarmerProfile } from '../farmers/farmers.repo';
import { ensureUser } from '../identity/identity.repo';
import { listDistrictsForRegency, listRegencies } from '../identity/reference.repo';
import { insertWaitlist } from '../waitlist/waitlist.repo';
import {
  addAlternative, addCartItem, createRecipeCart, deleteRecipeCart, findCartForBuyer,
  getOrCreateTemporaryCart, listCartAlternatives, listCartItems, listRecipeCarts,
  removeCartItem, reorderAlternatives, setCartItemQuantity, updateRecipeCart,
} from './carts.repo';

afterAll(closeDb);

/** Real neon_auth.user ids. users.id has a foreign key to them. Rolled back, so reuse is safe. */
async function authIds(trx: Executor, n: number): Promise<string[]> {
  const rows = await trx.selectFrom('neon_auth.user').select('id').orderBy('id').limit(n).execute();
  if (rows.length < n) throw new Error(`need ${n} neon_auth users, found ${rows.length}`);
  return rows.map((r) => r.id);
}

async function buyer(trx: Executor, id: string) {
  return ensureUser(trx, { id, fullName: 'Pembeli Uji', role: 'consumer' });
}

async function farmer(trx: Executor, id: string) {
  await ensureUser(trx, { id, fullName: 'Pak Tani', role: 'farmer' });
  const regency = (await listRegencies(trx, 1))[0]!;
  const district = (await listDistrictsForRegency(trx, regency.code, 1))[0]!;
  return ensureFarmerProfile(trx, {
    userId: id,
    shopName: 'Tani Keranjang',
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

/** A wait list, used as a recipe ingredient in a cart. */
async function waitlist(trx: Executor, farmerId: string) {
  const slug = `kat-${crypto.randomUUID()}`;
  const cat = await trx.insertInto('categories').values({ slug, name: slug }).returning(['id']).executeTakeFirstOrThrow();
  const { id } = await insertWaitlist(trx, {
    farmerId,
    categoryId: cat.id,
    commodityName: 'Cabai Merah',
    unit: 'kg',
    estimatedUnitPrice: 40000,
  });
  return id;
}

describe('temporary cart', () => {
  test('getOrCreateTemporaryCart returns the same cart on every call', async () => {
    await withRollback(async (trx) => {
      const [buyerId] = await authIds(trx, 1);
      await buyer(trx, buyerId!);
      const first = await getOrCreateTemporaryCart(trx, buyerId!);
      const second = await getOrCreateTemporaryCart(trx, buyerId!);
      expect(second.id).toBe(first.id);
      expect(first.kind).toBe('temporary');
      expect(first.name).toBeNull();
    });
  });

  test('a second temporary cart for one buyer fails with carts_one_temporary', async () => {
    await withRollback(async (trx) => {
      const [buyerId] = await authIds(trx, 1);
      await buyer(trx, buyerId!);
      await getOrCreateTemporaryCart(trx, buyerId!);
      const err = await trx.insertInto('carts')
        .values({ buyer_id: buyerId!, kind: 'temporary' })
        .execute()
        .catch(mapDbError);
      expect(err).toBeInstanceOf(UniqueViolationError);
      expect((err as UniqueViolationError).constraint).toBe('carts_one_temporary');
    });
  });
});

describe('recipe carts', () => {
  test('createRecipeCart and findCartForBuyer read back the same cart, and not for another buyer', async () => {
    await withRollback(async (trx) => {
      const [buyerId, otherId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await buyer(trx, otherId!);
      const cart = await createRecipeCart(trx, { buyerId: buyerId!, name: 'Nasi Goreng', note: 'untuk 4 orang' });
      expect(cart.kind).toBe('recipe');
      expect((await findCartForBuyer(trx, cart.id, buyerId!))?.name).toBe('Nasi Goreng');
      expect(await findCartForBuyer(trx, cart.id, otherId!)).toBeUndefined();
    });
  });

  test('listRecipeCarts pages by id and leaves out the temporary cart', async () => {
    await withRollback(async (trx) => {
      const [buyerId] = await authIds(trx, 1);
      await buyer(trx, buyerId!);
      await getOrCreateTemporaryCart(trx, buyerId!);
      const a = await createRecipeCart(trx, { buyerId: buyerId!, name: 'Sayur Asem' });
      const b = await createRecipeCart(trx, { buyerId: buyerId!, name: 'Soto Ayam' });
      const c = await createRecipeCart(trx, { buyerId: buyerId!, name: 'Pepes Ikan' });

      // limit 2 returns up to 3 rows, so the third row shows another page exists.
      const page1 = await listRecipeCarts(trx, { buyerId: buyerId!, afterId: null, limit: 2 });
      expect(page1.map((r) => r.id)).toEqual([a.id, b.id, c.id]);

      const page2 = await listRecipeCarts(trx, { buyerId: buyerId!, afterId: b.id, limit: 2 });
      expect(page2.map((r) => r.id)).toEqual([c.id]);
    });
  });

  test('a recipe cart without a name fails with chk_recipe_name', async () => {
    await withRollback(async (trx) => {
      const [buyerId] = await authIds(trx, 1);
      await buyer(trx, buyerId!);
      const err = await trx.insertInto('carts')
        .values({ buyer_id: buyerId!, kind: 'recipe', name: null })
        .execute()
        .catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_recipe_name');
    });
  });

  test('updateRecipeCart renames only the owner recipe cart, never the temporary one', async () => {
    await withRollback(async (trx) => {
      const [buyerId, otherId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await buyer(trx, otherId!);
      const temp = await getOrCreateTemporaryCart(trx, buyerId!);
      const cart = await createRecipeCart(trx, { buyerId: buyerId!, name: 'Lama' });

      const renamed = await updateRecipeCart(trx, { buyerId: buyerId!, cartId: cart.id, name: 'Baru', note: 'catatan' });
      expect(renamed?.name).toBe('Baru');
      expect(renamed?.note).toBe('catatan');

      expect(await updateRecipeCart(trx, { buyerId: buyerId!, cartId: temp.id, name: 'Coba', note: null })).toBeUndefined();
      expect(await updateRecipeCart(trx, { buyerId: otherId!, cartId: cart.id, name: 'Curi', note: null })).toBeUndefined();
    });
  });

  test('deleteRecipeCart removes its items and alternatives with it', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const q = await product(trx, farmerId!);
      const cart = await createRecipeCart(trx, { buyerId: buyerId!, name: 'Sambal' });
      const item = await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 1 });
      await addAlternative(trx, { buyerId: buyerId!, cartItemId: item!.id, productId: q.id });

      expect(await deleteRecipeCart(trx, { buyerId: buyerId!, cartId: cart.id })).toEqual({ id: cart.id });
      const left = await trx.selectFrom('cart_items').select('id').where('cart_id', '=', cart.id).execute();
      const alts = await trx.selectFrom('cart_item_alternatives').select('id').where('cart_item_id', '=', item!.id).execute();
      expect(left).toHaveLength(0);
      expect(alts).toHaveLength(0);
    });
  });
});

describe('cart items', () => {
  test('adding the same product again adds to its quantity', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const cart = await getOrCreateTemporaryCart(trx, buyerId!);

      await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 1.5 });
      const merged = await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 2 });

      expect(Number(merged?.quantity)).toBe(3.5);
      const items = await listCartItems(trx, { buyerId: buyerId!, cartId: cart.id, limit: 10 });
      expect(items).toHaveLength(1);
    });
  });

  test('a wait list can be a cart line next to a product', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const w = await waitlist(trx, farmerId!);
      const cart = await createRecipeCart(trx, { buyerId: buyerId!, name: 'Nasi Goreng' });

      await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 1 });
      await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, waitlistId: w, quantity: 2 });
      const items = await listCartItems(trx, { buyerId: buyerId!, cartId: cart.id, limit: 10 });
      expect(items.map((i) => i.waitlist_id ?? i.product_id).sort()).toEqual([p.id, w].sort());
    });
  });

  test('a line must name exactly one target (chk_item_target)', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const w = await waitlist(trx, farmerId!);
      const cart = await getOrCreateTemporaryCart(trx, buyerId!);
      const err = await trx.insertInto('cart_items')
        .values({ cart_id: cart.id, product_id: p.id, waitlist_id: w, quantity: '1' })
        .execute()
        .catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_item_target');
    });
  });

  test('a quantity of zero is rejected with chk_item_qty', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const cart = await getOrCreateTemporaryCart(trx, buyerId!);
      const err = await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 0 }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_item_qty');
    });
  });

  test('another buyer cannot add to, change, remove or list this cart', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId, otherId] = await authIds(trx, 3);
      await buyer(trx, buyerId!);
      await buyer(trx, otherId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const cart = await getOrCreateTemporaryCart(trx, buyerId!);
      const item = await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 1 });

      expect(await addCartItem(trx, { buyerId: otherId!, cartId: cart.id, productId: p.id, quantity: 1 })).toBeUndefined();
      expect(await setCartItemQuantity(trx, { buyerId: otherId!, cartId: cart.id, itemId: item!.id, quantity: 9 })).toBeUndefined();
      expect(await removeCartItem(trx, { buyerId: otherId!, cartId: cart.id, itemId: item!.id })).toBeUndefined();
      expect(await listCartItems(trx, { buyerId: otherId!, cartId: cart.id, limit: 10 })).toHaveLength(0);
    });
  });

  test('the owner can set a quantity and remove a line', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const cart = await getOrCreateTemporaryCart(trx, buyerId!);
      const item = await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 1 });

      const updated = await setCartItemQuantity(trx, { buyerId: buyerId!, cartId: cart.id, itemId: item!.id, quantity: 4.25 });
      expect(Number(updated?.quantity)).toBe(4.25);

      expect(await removeCartItem(trx, { buyerId: buyerId!, cartId: cart.id, itemId: item!.id })).toEqual({ id: item!.id });
      expect(await listCartItems(trx, { buyerId: buyerId!, cartId: cart.id, limit: 10 })).toHaveLength(0);
    });
  });
});

describe('alternatives', () => {
  test('addAlternative outside a transaction throws', async () => {
    const error = await addAlternative(getDb(), {
      buyerId: '00000000-0000-0000-0000-000000000000',
      cartItemId: '00000000-0000-0000-0000-000000000000',
      productId: '00000000-0000-0000-0000-000000000000',
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toMatch(/must run inside a transaction/);
  });

  test('alternatives are appended with priorities 1, 2, and a repeat product fails', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const a = await product(trx, farmerId!);
      const b = await product(trx, farmerId!);
      const cart = await getOrCreateTemporaryCart(trx, buyerId!);
      const item = await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 1 });

      const first = await addAlternative(trx, { buyerId: buyerId!, cartItemId: item!.id, productId: a.id });
      const second = await addAlternative(trx, { buyerId: buyerId!, cartItemId: item!.id, productId: b.id });
      expect([first?.priority, second?.priority]).toEqual([1, 2]);

      const err = await addAlternative(trx, { buyerId: buyerId!, cartItemId: item!.id, productId: a.id }).catch(mapDbError);
      expect(err).toBeInstanceOf(UniqueViolationError);
    });
  });

  test('another buyer cannot add an alternative to this item', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId, otherId] = await authIds(trx, 3);
      await buyer(trx, buyerId!);
      await buyer(trx, otherId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const a = await product(trx, farmerId!);
      const cart = await getOrCreateTemporaryCart(trx, buyerId!);
      const item = await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 1 });
      expect(await addAlternative(trx, { buyerId: otherId!, cartItemId: item!.id, productId: a.id })).toBeUndefined();
    });
  });

  test('reorderAlternatives swaps two priorities in one statement (deferred unique)', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const a = await product(trx, farmerId!);
      const b = await product(trx, farmerId!);
      const cart = await getOrCreateTemporaryCart(trx, buyerId!);
      const item = await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 1 });
      const altA = await addAlternative(trx, { buyerId: buyerId!, cartItemId: item!.id, productId: a.id });
      const altB = await addAlternative(trx, { buyerId: buyerId!, cartItemId: item!.id, productId: b.id });

      const reordered = await reorderAlternatives(trx, {
        buyerId: buyerId!,
        cartItemId: item!.id,
        orderedIds: [altB!.id, altA!.id],
      });
      expect(reordered?.map((r) => r.id)).toEqual([altB!.id, altA!.id]);
      expect(reordered?.map((r) => r.priority)).toEqual([1, 2]);

      const listed = await listCartAlternatives(trx, { buyerId: buyerId!, cartId: cart.id, limit: 10 });
      expect(listed.map((r) => r.product_id)).toEqual([b.id, a.id]);
    });
  });

  test('reorderAlternatives with a wrong id set writes nothing and returns undefined', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const a = await product(trx, farmerId!);
      const b = await product(trx, farmerId!);
      const cart = await getOrCreateTemporaryCart(trx, buyerId!);
      const item = await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 1 });
      const altA = await addAlternative(trx, { buyerId: buyerId!, cartItemId: item!.id, productId: a.id });
      const altB = await addAlternative(trx, { buyerId: buyerId!, cartItemId: item!.id, productId: b.id });

      // Missing one id, and a duplicated id: both refused.
      expect(await reorderAlternatives(trx, { buyerId: buyerId!, cartItemId: item!.id, orderedIds: [altB!.id] })).toBeUndefined();
      expect(await reorderAlternatives(trx, { buyerId: buyerId!, cartItemId: item!.id, orderedIds: [altB!.id, altB!.id] })).toBeUndefined();

      const listed = await listCartAlternatives(trx, { buyerId: buyerId!, cartId: cart.id, limit: 10 });
      expect(listed.map((r) => r.id)).toEqual([altA!.id, altB!.id]);
      expect(listed.map((r) => r.priority)).toEqual([1, 2]);
    });
  });

  test('listCartAlternatives returns nothing to another buyer', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId, otherId] = await authIds(trx, 3);
      await buyer(trx, buyerId!);
      await buyer(trx, otherId!);
      await farmer(trx, farmerId!);
      const p = await product(trx, farmerId!);
      const a = await product(trx, farmerId!);
      const cart = await getOrCreateTemporaryCart(trx, buyerId!);
      const item = await addCartItem(trx, { buyerId: buyerId!, cartId: cart.id, productId: p.id, quantity: 1 });
      await addAlternative(trx, { buyerId: buyerId!, cartItemId: item!.id, productId: a.id });

      expect(await listCartAlternatives(trx, { buyerId: buyerId!, cartId: cart.id, limit: 10 })).toHaveLength(1);
      expect(await listCartAlternatives(trx, { buyerId: otherId!, cartId: cart.id, limit: 10 })).toHaveLength(0);
    });
  });
});
