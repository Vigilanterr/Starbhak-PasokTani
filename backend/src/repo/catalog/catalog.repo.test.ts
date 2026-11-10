import { sql } from 'kysely';
import { afterAll, describe, expect, test } from 'bun:test';

import { closeDb, getDb } from '../db';
import { CheckViolationError, UniqueViolationError, mapDbError } from '../errors';
import type { Executor } from '../executor';
import { settleDeferred, withRollback } from '../test-utils';
import { ensureFarmerProfile } from '../farmers/farmers.repo';
import { ensureUser } from '../identity/identity.repo';
import { listRegencies, listDistrictsForRegency } from '../identity/reference.repo';
import {
  adjustBatchOnHand, ensureTag, expireDueBatches, findCategoryBySlug, findEffectiveUnitPrice,
  findProductBySlug, findSurplusRuleFor, insertProduct, insertProductPhoto, listCatalog,
  listBatchesForProduct, listPriceTiers, listProductPhotos, lockBatchesForSurplusPass, lockFefoBatches, receiveBatch,
  releaseExpiredReservations, releaseReservation, replacePriceTiers, replaceSurplusRules,
  reserveStock, resolveSearchTerm, searchProducts, setBatchSurplusDiscount, setProductTags, upsertProductSubscription,
  deleteProductSubscription, findProductById, findBatchById,
} from './catalog.repo';

afterAll(closeDb);

/** Real neon_auth.user ids. users.id has a foreign key to them. Rolled back, so reuse is safe. */
async function authIds(trx: Executor, n: number): Promise<string[]> {
  const rows = await trx.selectFrom('neon_auth.user').select('id').orderBy('id').limit(n).execute();
  if (rows.length < n) throw new Error(`need ${n} neon_auth users, found ${rows.length}`);
  return rows.map((r) => r.id);
}

async function farmer(trx: Executor, id: string) {
  await ensureUser(trx, { id, fullName: 'Pak Tani', role: 'farmer' });
  const regency = (await listRegencies(trx, 1))[0]!;
  const district = (await listDistrictsForRegency(trx, regency.code, 1))[0]!;
  return ensureFarmerProfile(trx, {
    userId: id,
    shopName: 'Tani Uji',
    slug: `toko-${id}`,
    regencyCode: regency.code,
    districtCode: district.code,
  });
}

/** A fresh category, so a catalog query can filter to only this test's products. */
async function category(trx: Executor) {
  const slug = `kat-${crypto.randomUUID()}`;
  return trx.insertInto('categories').values({ slug, name: slug }).returning(['id']).executeTakeFirstOrThrow();
}

async function product(trx: Executor, farmerId: string, categoryId: string, over: Partial<Parameters<typeof insertProduct>[1]> = {}) {
  return insertProduct(trx, {
    farmerId,
    categoryId,
    slug: `uji-${crypto.randomUUID()}`,
    name: 'Produk Uji',
    unit: 'kg',
    price: 15000,
    ...over,
  });
}

/** A consumer, a checkout and an order item, so a stock reservation has its foreign key. */
async function orderItem(trx: Executor, buyerId: string, farmerId: string, productId: string) {
  const fee = await trx.insertInto('platform_fee_settings')
    .values({ commission_pct: 2, service_fee_pct: 1, effective_from: sql<Date>`now() - interval '1 day'`, created_by: buyerId })
    .returning('id')
    .executeTakeFirstOrThrow();
  const checkout = await trx.insertInto('checkouts')
    .values({ buyer_id: buyerId, goods_total: 15000, grand_total: 15000 })
    .returning('id')
    .executeTakeFirstOrThrow();
  const order = await trx.insertInto('orders')
    .values({
      code: `T-${crypto.randomUUID()}`,
      checkout_id: checkout.id,
      buyer_id: buyerId,
      farmer_id: farmerId,
      goods_subtotal: 15000,
      buyer_total: 15000,
      farmer_net: 14000,
      commission_pct: 2,
      service_fee_pct: 1,
      fee_setting_id: fee.id,
    })
    .returning('id')
    .executeTakeFirstOrThrow();
  return trx.insertInto('order_items')
    .values({
      order_id: order.id,
      product_id: productId,
      product_name: 'Produk Uji',
      unit: 'kg',
      quantity: '1',
      tier_unit_price: 15000,
      line_subtotal: 15000,
    })
    .returning('id')
    .executeTakeFirstOrThrow();
}

const FAR_EXPIRY = '2030-06-30';
const FARTHER_EXPIRY = '2030-12-31';

describe('products', () => {
  test('insert and read back by slug keeps the price as a bigint string', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const created = await product(trx, farmerId!, cat.id, { slug: 'uji-slug', price: 15000 });
      const found = await findProductBySlug(trx, 'uji-slug');
      expect(found?.id).toBe(created.id);
      expect(found?.price).toBe('15000');
      expect(found?.available_qty).toBe('0.000');
    });
  });

  test('a duplicate slug fails with UniqueViolationError', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      await product(trx, farmerId!, cat.id, { slug: 'kembar' });
      const err = await product(trx, farmerId!, cat.id, { slug: 'kembar' }).catch(mapDbError);
      expect(err).toBeInstanceOf(UniqueViolationError);
      expect((err as UniqueViolationError).constraint).toBe('products_slug_key');
    });
  });

  test('a price tier that is not cheaper than the one below fails at settle with CheckViolationError', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id, { price: 15000 });
      await replacePriceTiers(trx, p.id, [{ minQty: 5, unitPrice: 15000 }]);
      const err = await settleDeferred(trx).then(() => undefined, mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).message).toMatch(/price tiers/);
    });
  });

  test('cheaper tiers pass, and the effective price follows the highest reached tier', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id, { price: 15000 });
      await replacePriceTiers(trx, p.id, [
        { minQty: 5, unitPrice: 14000 },
        { minQty: 10, unitPrice: 13000 },
      ]);
      await settleDeferred(trx);
      expect((await listPriceTiers(trx, p.id, 10)).map((t) => t.min_qty)).toEqual(['5.000', '10.000']);
      expect((await findEffectiveUnitPrice(trx, p.id, 1))?.unit_price).toBe('15000');
      expect((await findEffectiveUnitPrice(trx, p.id, 7))?.unit_price).toBe('14000');
      expect((await findEffectiveUnitPrice(trx, p.id, 10))?.unit_price).toBe('13000');
    });
  });

  test('catalog lists by price with keyset pages, and returns limit + 1 rows', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      await product(trx, farmerId!, cat.id, { price: 3000 });
      await product(trx, farmerId!, cat.id, { price: 1000 });
      await product(trx, farmerId!, cat.id, { price: 2000 });

      const first = await listCatalog(trx, { filter: { categoryId: cat.id }, sort: 'price', limit: 2 });
      expect(first.map((r) => r.price)).toEqual(['1000', '2000', '3000']);
      const last = first[1]!;
      const second = await listCatalog(trx, {
        filter: { categoryId: cat.id }, sort: 'price', limit: 2, after: { price: last.price, id: last.id },
      });
      expect(second.map((r) => r.price)).toEqual(['3000']);
    });
  });

  test('a draft product is not in the catalog but is still found by slug', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id, { slug: 'draf' });
      await trx.updateTable('products').set({ status: 'draft' }).where('id', '=', p.id).execute();
      const listed = await listCatalog(trx, { filter: { categoryId: cat.id }, sort: 'newest', limit: 10 });
      expect(listed.map((r) => r.id)).not.toContain(p.id);
      expect((await findProductBySlug(trx, 'draf'))?.status).toBe('draft');
    });
  });

  test('tags filter the catalog, and replacing them drops the old ones', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const a = await product(trx, farmerId!, cat.id);
      const organik = await ensureTag(trx, { slug: `organik-${cat.id}`, name: 'Organik' });
      const again = await ensureTag(trx, { slug: organik.slug, name: 'Lain' });
      expect(again.id).toBe(organik.id);
      expect(again.name).toBe('Organik');

      await setProductTags(trx, a.id, [organik.id, organik.id]);
      const tagged = await listCatalog(trx, { filter: { categoryId: cat.id, tagId: organik.id }, sort: 'newest', limit: 10 });
      expect(tagged.map((r) => r.id)).toEqual([a.id]);

      await setProductTags(trx, a.id, []);
      const cleared = await listCatalog(trx, { filter: { categoryId: cat.id, tagId: organik.id }, sort: 'newest', limit: 10 });
      expect(cleared).toEqual([]);
    });
  });

  test('search rewrites a synonym to its canonical term before full-text matching', async () => {
    await withRollback(async (trx) => {
      expect((await resolveSearchTerm(trx, 'Cabe')).term).toBe('cabai');
      expect((await resolveSearchTerm(trx, 'Tomat Ceri')).term).toBe('tomat ceri');

      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id, { name: 'Cabai Merah Uji', slug: 'cabai-uji' });
      const hits = await searchProducts(trx, 'cabe', 50);
      expect(hits.map((h) => h.id)).toContain(p.id);
    });
  });

  test('search falls back to trigram when full-text finds nothing', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id, { name: 'Bayam Hijau Segar', slug: 'bayam-uji' });
      const hits = await searchProducts(trx, 'bayam hijao', 50);
      expect(hits.map((h) => h.id)).toContain(p.id);
    });
  });

  test('surplus picks the most specific rule that applies', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      await replaceSurplusRules(trx, p.id, [
        { daysRemaining: 7, discountPct: 10 },
        { daysRemaining: 3, discountPct: 25 },
      ]);
      expect((await findSurplusRuleFor(trx, p.id, 2))?.discount_pct).toBe('25.00');
      expect((await findSurplusRuleFor(trx, p.id, 5))?.discount_pct).toBe('10.00');
      expect(await findSurplusRuleFor(trx, p.id, 9)).toBeUndefined();
    });
  });

  test('photos come back in position order', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      const first = await trx.insertInto('media_assets')
        .values({ owner_id: farmerId!, kind: 'product_photo', cloudinary_public_id: `uji/${crypto.randomUUID()}` })
        .returning('id')
        .executeTakeFirstOrThrow();
      const second = await trx.insertInto('media_assets')
        .values({ owner_id: farmerId!, kind: 'product_photo', cloudinary_public_id: `uji/${crypto.randomUUID()}` })
        .returning('id')
        .executeTakeFirstOrThrow();
      await insertProductPhoto(trx, { productId: p.id, mediaId: second.id, position: 2 });
      await insertProductPhoto(trx, { productId: p.id, mediaId: first.id, position: 1 });
      expect((await listProductPhotos(trx, p.id, 10)).map((x) => x.media_id)).toEqual([first.id, second.id]);
    });
  });

  test('a media asset can be a photo only once: UniqueViolationError on media_id', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      const media = await trx.insertInto('media_assets')
        .values({ owner_id: farmerId!, kind: 'product_photo', cloudinary_public_id: `uji/${crypto.randomUUID()}` })
        .returning('id')
        .executeTakeFirstOrThrow();
      await insertProductPhoto(trx, { productId: p.id, mediaId: media.id });
      const err = await insertProductPhoto(trx, { productId: p.id, mediaId: media.id }).catch(mapDbError);
      expect(err).toBeInstanceOf(UniqueViolationError);
      expect((err as UniqueViolationError).constraint).toBe('product_photos_media_id_key');
    });
  });

  test('subscribing twice counts once, and unsubscribing lowers the count', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await farmer(trx, farmerId!);
      await ensureUser(trx, { id: buyerId!, fullName: 'Pembeli', role: 'consumer' });
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      await upsertProductSubscription(trx, { userId: buyerId!, productId: p.id });
      const again = await upsertProductSubscription(trx, { userId: buyerId!, productId: p.id, onPriceDrop: false });
      expect(again.on_price_drop).toBe(false);
      expect((await findProductById(trx, p.id))?.subscriber_count).toBe(1);
      await deleteProductSubscription(trx, buyerId!, p.id);
      expect((await findProductById(trx, p.id))?.subscriber_count).toBe(0);
    });
  });
});

describe('stock', () => {
  test('FEFO returns the batch with the nearest expiry first, even when it was received later', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      const later = await receiveBatch(trx, {
        productId: p.id, createdBy: farmerId!, initialQty: 10, harvestedOn: '2030-01-01', expiresOn: FARTHER_EXPIRY,
      });
      const sooner = await receiveBatch(trx, {
        productId: p.id, createdBy: farmerId!, initialQty: 4, harvestedOn: '2030-01-01', expiresOn: FAR_EXPIRY,
      });
      expect(later?.batch_no).toBe(1);
      expect(sooner?.batch_no).toBe(2);
      expect(sooner?.expires_on).toBe(FAR_EXPIRY);

      const fefo = await lockFefoBatches(trx, p.id);
      expect(fefo.map((b) => b.id)).toEqual([sooner!.id, later!.id]);
      expect(fefo[0]!.expires_on).toBe(FAR_EXPIRY);
    });
  }, 30_000);

  test('receiving stock writes a stock_in movement equal to on_hand_qty', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      const batch = await receiveBatch(trx, {
        productId: p.id, createdBy: farmerId!, initialQty: '7.5', harvestedOn: '2030-01-01', expiresOn: FAR_EXPIRY,
      });
      const moves = await trx.selectFrom('stock_movements').select(['type', 'qty_delta'])
        .where('batch_id', '=', batch!.id).execute();
      expect(moves).toEqual([{ type: 'stock_in', qty_delta: '7.500' }]);
      expect((await findProductById(trx, p.id))?.available_qty).toBe('7.500');
    });
  }, 30_000);

  test('reserved_qty cannot pass on_hand_qty: CheckViolationError on chk_reserved_le_on_hand', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await farmer(trx, farmerId!);
      await ensureUser(trx, { id: buyerId!, fullName: 'Pembeli', role: 'consumer' });
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      const batch = await receiveBatch(trx, {
        productId: p.id, createdBy: farmerId!, initialQty: 5, harvestedOn: '2030-01-01', expiresOn: FAR_EXPIRY,
      });
      const item = await orderItem(trx, buyerId!, farmerId!, p.id);
      const err = await reserveStock(trx, { batchId: batch!.id, orderItemId: item.id, quantity: 6 }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_reserved_le_on_hand');
    });
  }, 30_000);

  test('reserve then release returns the qty to the batch', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await farmer(trx, farmerId!);
      await ensureUser(trx, { id: buyerId!, fullName: 'Pembeli', role: 'consumer' });
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      const batch = await receiveBatch(trx, {
        productId: p.id, createdBy: farmerId!, initialQty: 5, harvestedOn: '2030-01-01', expiresOn: FAR_EXPIRY,
      });
      const item = await orderItem(trx, buyerId!, farmerId!, p.id);
      const hold = await reserveStock(trx, { batchId: batch!.id, orderItemId: item.id, quantity: 3 });
      expect((await findBatchById(trx, batch!.id))?.reserved_qty).toBe('3.000');
      expect(hold?.qty).toBe('3.000');

      const released = await releaseReservation(trx, hold!.id);
      expect(released?.qty).toBe('3.000');
      expect((await findBatchById(trx, batch!.id))?.reserved_qty).toBe('0.000');
      expect(await releaseReservation(trx, hold!.id)).toBeUndefined();
    });
  }, 30_000);

  test('the sweeper releases only expired holds and gives back their qty once', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await farmer(trx, farmerId!);
      await ensureUser(trx, { id: buyerId!, fullName: 'Pembeli', role: 'consumer' });
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      const batch = await receiveBatch(trx, {
        productId: p.id, createdBy: farmerId!, initialQty: 5, harvestedOn: '2030-01-01', expiresOn: FAR_EXPIRY,
      });
      const item = await orderItem(trx, buyerId!, farmerId!, p.id);
      const hold = await reserveStock(trx, { batchId: batch!.id, orderItemId: item.id, quantity: 2 });
      await trx.updateTable('stock_reservations')
        .set({ expires_at: sql<Date>`now() - interval '1 minute'` })
        .where('id', '=', hold!.id)
        .execute();

      const swept = await releaseExpiredReservations(trx, 100);
      expect(swept.map((r) => r.id)).toEqual([hold!.id]);
      expect((await findBatchById(trx, batch!.id))?.reserved_qty).toBe('0.000');
      expect(await releaseExpiredReservations(trx, 100)).toEqual([]);
    });
  }, 30_000);

  test('a manual adjustment below the reserved qty fails with chk_reserved_le_on_hand', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await farmer(trx, farmerId!);
      await ensureUser(trx, { id: buyerId!, fullName: 'Pembeli', role: 'consumer' });
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      const batch = await receiveBatch(trx, {
        productId: p.id, createdBy: farmerId!, initialQty: 5, harvestedOn: '2030-01-01', expiresOn: FAR_EXPIRY,
      });
      const item = await orderItem(trx, buyerId!, farmerId!, p.id);
      await reserveStock(trx, { batchId: batch!.id, orderItemId: item.id, quantity: 4 });
      const err = await adjustBatchOnHand(trx, { batchId: batch!.id, delta: -2, reason: 'busuk', actorId: farmerId! })
        .catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_reserved_le_on_hand');
    });
  }, 30_000);

  test('the surplus pass claims only batches whose discount differs from their rule, and a rerun finds no work', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      await replaceSurplusRules(trx, p.id, [
        { daysRemaining: 3, discountPct: 25 },
        { daysRemaining: 7, discountPct: 10 },
      ]);
      const { rows: [today] } = await sql<{ d: string }>`select (now() at time zone 'Asia/Jakarta')::date::text as d`.execute(trx);
      const inDays = async (n: number) => {
        const r = await sql<{ d: string }>`select (${today!.d}::date + ${n}::int)::text as d`.execute(trx);
        return r.rows[0]!.d;
      };
      const batch = async (n: number) => (await receiveBatch(trx, {
        productId: p.id, createdBy: farmerId!, initialQty: 5, harvestedOn: '2020-01-01', expiresOn: await inDays(n),
      }))!;
      const near = await batch(2);
      const mid = await batch(5);
      const noRule = await batch(30); // no rule applies and nothing cached, so no work
      const stale = await batch(40); // no rule applies but a discount is cached, so it must clear
      await setBatchSurplusDiscount(trx, stale.id, 15);

      const claimed = (await lockBatchesForSurplusPass(trx, 10_000)).filter((b) => b.product_id === p.id);
      expect(claimed.map((b) => [b.id, b.target_discount_pct])).toEqual([
        [near.id, '25.00'], [mid.id, '10.00'], [stale.id, null],
      ]);
      expect(claimed.map((b) => b.id)).not.toContain(noRule.id);

      for (const b of claimed) await setBatchSurplusDiscount(trx, b.id, b.target_discount_pct);
      expect((await lockBatchesForSurplusPass(trx, 10_000)).filter((b) => b.product_id === p.id)).toEqual([]);
    });
  }, 30_000);

  test('the surplus pass requires a transaction', () => {
    expect(() => lockBatchesForSurplusPass(getDb(), 1)).toThrow(/inside a transaction/);
  });

  test('the expiry job marks due batches expired and they leave the FEFO lock', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const cat = await category(trx);
      const p = await product(trx, farmerId!, cat.id);
      const batch = await receiveBatch(trx, {
        productId: p.id, createdBy: farmerId!, initialQty: 5, harvestedOn: '2020-01-01', expiresOn: '2020-02-01',
      });
      const expired = await expireDueBatches(trx, 100);
      expect(expired.map((r) => r.id)).toContain(batch!.id);
      expect((await lockFefoBatches(trx, p.id)).map((b) => b.id)).not.toContain(batch!.id);
      expect((await listBatchesForProduct(trx, p.id, 10))[0]?.status).toBe('expired');
    });
  }, 30_000);
});

describe('category', () => {
  test('findCategoryBySlug finds a seeded category', async () => {
    await withRollback(async (trx) => {
      expect((await findCategoryBySlug(trx, 'sayur'))?.name).toBe('Sayur');
    });
  });
});
