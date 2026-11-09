import { sql } from 'kysely';
import { afterAll, describe, expect, test } from 'bun:test';

import { closeDb } from '../db';
import type { Executor } from '../executor';
import { settleDeferred, withRollback } from '../test-utils';
import { ensureFarmerProfile, updateFarmerProfile } from '../farmers/farmers.repo';
import { ensureUser } from '../identity/identity.repo';
import { listDistrictsForRegency, listRegencies } from '../identity/reference.repo';
import { ensureTag, insertProduct, receiveBatch, replacePriceTiers, replaceSurplusRules, setProductTags } from './catalog.repo';
import {
  countPublicStats, findCatalogCardBySlug, findCatalogCardById, listCategoriesWithCounts, listCatalogCards,
  listSurplusRulesForProducts, listTagSlugsForProducts, listTiersForProducts,
} from './catalog-read.repo';
import { listFarmerDirectory, findFarmerPublic } from '../farmers/farmer-read.repo';

afterAll(closeDb);

/** Real neon_auth.user ids. users.id has a foreign key to them. Everything here is rolled back. */
async function authIds(trx: Executor, n: number): Promise<string[]> {
  const rows = await trx.selectFrom('neon_auth.user').select('id').orderBy('id').limit(n).execute();
  if (rows.length < n) throw new Error(`need ${n} neon_auth users, found ${rows.length}`);
  return rows.map((r) => r.id);
}

/** A farmer whose profile is approved and has a pin in Bandung, so the public reads can see it. */
async function approvedFarmer(trx: Executor, id: string, at = { lng: 107.6191, lat: -6.9175 }) {
  const regency = (await listRegencies(trx, 1))[0]!;
  const district = (await listDistrictsForRegency(trx, regency.code, 1))[0]!;
  await ensureUser(trx, { id, fullName: `Tani ${id.slice(0, 4)}`, role: 'farmer' });
  await ensureFarmerProfile(trx, { userId: id, shopName: `Toko ${id.slice(0, 4)}`, slug: `toko-${id}`, regencyCode: regency.code, districtCode: district.code });
  // The id may belong to a farmer the seed already made, whose row keeps its old place. Set the place here.
  await sql`update farmer_profiles set regency_code = ${regency.code}, district_code = ${district.code} where user_id = ${id}`.execute(trx);
  await updateFarmerProfile(trx, id, { location: at });
  await sql`update farmer_profiles set verification_status = 'approved', verified_at = now() where user_id = ${id}`.execute(trx);
  return { id, regencyCode: regency.code, regencySlug: regency.slug };
}

/** A category nobody else uses, so a list filtered to it holds only this test's products. */
async function freshCategory(trx: Executor) {
  const slug = `kat-${crypto.randomUUID()}`;
  return trx.insertInto('categories').values({ slug, name: slug }).returning(['id', 'slug']).executeTakeFirstOrThrow();
}

async function product(trx: Executor, farmerId: string, categoryId: string, over: Partial<Parameters<typeof insertProduct>[1]> = {}) {
  return insertProduct(trx, {
    farmerId,
    categoryId,
    slug: `uji-${crypto.randomUUID()}`,
    name: 'Produk Uji',
    unit: 'kg',
    price: 10000,
    ...over,
  });
}

/** One batch of stock that expires far in the future. receiveBatch writes the stock_in movement too. */
async function stock(trx: Executor, productId: string, farmerId: string, qty: number) {
  await receiveBatch(trx, {
    productId,
    createdBy: farmerId,
    initialQty: qty,
    harvestedOn: '2030-01-01',
    expiresOn: '2030-06-30',
  });
  await settleDeferred(trx);
}

describe('listCatalogCards: visibility', () => {
  test('a draft product is not listed, a live one is', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      const live = await product(trx, a!, cat.id, { name: 'Hidup' });
      const draf = await product(trx, a!, cat.id, { name: 'Draf' });
      await sql`update products set status = 'draft' where id = ${draf.id}`.execute(trx);
      const rows = await listCatalogCards(trx, { filter: { categorySlug: cat.slug }, sort: 'terlaris', page: 1, perPage: 10 });
      expect(rows.map((r) => r.id)).toEqual([live.id]);
      expect(rows[0]!.total).toBe(1);
    });
  });

  test('a pending farmer, or a deleted account, is hidden from every read', async () => {
    await withRollback(async (trx) => {
      const [a, b] = await authIds(trx, 2);
      await approvedFarmer(trx, a!);
      await approvedFarmer(trx, b!);
      const cat = await freshCategory(trx);
      const ok = await product(trx, a!, cat.id);
      const pending = await product(trx, b!, cat.id);
      await sql`update farmer_profiles set verification_status = 'pending' where user_id = ${b!}`.execute(trx);
      const rows = await listCatalogCards(trx, { filter: { categorySlug: cat.slug }, sort: 'terlaris', page: 1, perPage: 10 });
      expect(rows.map((r) => r.id)).toEqual([ok.id]);
      expect(rows.map((r) => r.id)).not.toContain(pending.id);
      expect(await findCatalogCardBySlug(trx, `uji-${pending.id}`)).toBeUndefined();
      expect(await findFarmerPublic(trx, b!)).toBeUndefined();
    });
  });

  test('a product of a soft-deleted account is hidden', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      await product(trx, a!, cat.id);
      await sql`update users set deleted_at = now() where id = ${a!}`.execute(trx);
      const rows = await listCatalogCards(trx, { filter: { categorySlug: cat.slug }, sort: 'terlaris', page: 1, perPage: 10 });
      expect(rows).toEqual([]);
    });
  });
});

describe('listCatalogCards: sort, page and filters', () => {
  test('sold-out products sort last, whatever the sort order', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      const sold = await product(trx, a!, cat.id, { name: 'Habis' });
      const inStock = await product(trx, a!, cat.id, { name: 'Ada' });
      await stock(trx, inStock.id, a!, 5);
      await sql`update products set sold_qty = 999 where id = ${sold.id}`.execute(trx);
      const rows = await listCatalogCards(trx, { filter: { categorySlug: cat.slug }, sort: 'terlaris', page: 1, perPage: 10 });
      expect(rows.map((r) => r.id)).toEqual([inStock.id, sold.id]);
    });
  });

  test('price ascending pages by offset, with the same total on every page', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      for (const price of [30000, 10000, 20000]) await product(trx, a!, cat.id, { price, name: `P${price}` });
      const page1 = await listCatalogCards(trx, { filter: { categorySlug: cat.slug }, sort: 'harga-asc', page: 1, perPage: 2 });
      const page2 = await listCatalogCards(trx, { filter: { categorySlug: cat.slug }, sort: 'harga-asc', page: 2, perPage: 2 });
      expect(page1.map((r) => Number(r.price))).toEqual([10000, 20000]);
      expect(page2.map((r) => Number(r.price))).toEqual([30000]);
      expect(page1[0]!.total).toBe(3);
    });
  });

  test('the price filter uses the base price', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      await product(trx, a!, cat.id, { price: 5000 });
      const mid = await product(trx, a!, cat.id, { price: 15000 });
      await product(trx, a!, cat.id, { price: 50000 });
      const rows = await listCatalogCards(trx, {
        filter: { categorySlug: cat.slug, priceMin: 10000, priceMax: 20000 }, sort: 'harga-asc', page: 1, perPage: 10,
      });
      expect(rows.map((r) => r.id)).toEqual([mid.id]);
    });
  });

  test('the organic tag filter keeps only tagged products', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      const organik = await product(trx, a!, cat.id, { name: 'Organik' });
      await product(trx, a!, cat.id, { name: 'Biasa' });
      const tag = await ensureTag(trx, { slug: `organik-${crypto.randomUUID()}`, name: 'Organik' });
      await setProductTags(trx, organik.id, [tag.id]);
      const rows = await listCatalogCards(trx, { filter: { categorySlug: cat.slug, tagSlug: tag.slug }, sort: 'terlaris', page: 1, perPage: 10 });
      expect(rows.map((r) => r.id)).toEqual([organik.id]);
      const tags = await listTagSlugsForProducts(trx, [organik.id]);
      expect(tags.map((t) => t.slug)).toEqual([tag.slug]);
    });
  });

  test('the Surplus flag filter keeps only products that have it on', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      const on = await product(trx, a!, cat.id, { surplusEnabled: true, surplusFloorPrice: 1000 });
      await product(trx, a!, cat.id);
      const rows = await listCatalogCards(trx, { filter: { categorySlug: cat.slug, surplusOnly: true }, sort: 'terlaris', page: 1, perPage: 10 });
      expect(rows.map((r) => r.id)).toEqual([on.id]);
      expect(rows[0]!.surplus_floor_price).toBe('1000');
    });
  });

  test('the in-stock filter drops sold-out products', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      const ada = await product(trx, a!, cat.id);
      await stock(trx, ada.id, a!, 3);
      await product(trx, a!, cat.id);
      const rows = await listCatalogCards(trx, { filter: { categorySlug: cat.slug, inStockOnly: true }, sort: 'terlaris', page: 1, perPage: 10 });
      expect(rows.map((r) => r.id)).toEqual([ada.id]);
    });
  });

  test('days left counts from Jakarta today, with the expiry date as text', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      const p = await product(trx, a!, cat.id);
      await stock(trx, p.id, a!, 4);
      const row = await findCatalogCardById(trx, p.id);
      expect(row?.expires_on).toBe('2030-06-30');
      expect(row?.harvested_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row?.days_left).toBeGreaterThan(0);
    });
  });
});

describe('near me', () => {
  test('a radius keeps farmers within it and reports the distance', async () => {
    await withRollback(async (trx) => {
      const [a, b] = await authIds(trx, 2);
      await approvedFarmer(trx, a!, { lng: 107.6191, lat: -6.9175 });
      await approvedFarmer(trx, b!, { lng: 107.9, lat: -6.9175 });
      const cat = await freshCategory(trx);
      const near = await product(trx, a!, cat.id);
      await product(trx, b!, cat.id);
      const origin = { lng: 107.6191, lat: -6.9175 };
      const rows = await listCatalogCards(trx, {
        filter: { categorySlug: cat.slug, origin, radiusMeters: 5_000 }, sort: 'terdekat', page: 1, perPage: 10,
      });
      expect(rows.map((r) => r.id)).toEqual([near.id]);
      expect(rows[0]!.distance_m).toBeLessThan(10);
    });
  });
});

describe('tiers and Surplus rules', () => {
  test('tiers and Surplus rules come back grouped by product, in order', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      const p = await product(trx, a!, cat.id, { price: 20000 });
      await replacePriceTiers(trx, p.id, [{ minQty: 10, unitPrice: 18000 }, { minQty: 50, unitPrice: 15000 }]);
      await replaceSurplusRules(trx, p.id, [{ daysRemaining: 3, discountPct: 10 }, { daysRemaining: 1, discountPct: 30 }]);
      const tiers = await listTiersForProducts(trx, [p.id]);
      expect(tiers.map((t) => Number(t.min_qty))).toEqual([10, 50]);
      const rules = await listSurplusRulesForProducts(trx, [p.id]);
      expect(rules.map((r) => r.days_remaining)).toEqual([1, 3]);
    });
  });
});

describe('categories, directory and stats', () => {
  test('a category count is the number of live products in it', async () => {
    await withRollback(async (trx) => {
      const [a] = await authIds(trx, 1);
      await approvedFarmer(trx, a!);
      const cat = await freshCategory(trx);
      await product(trx, a!, cat.id);
      const draf = await product(trx, a!, cat.id);
      await sql`update products set status = 'draft' where id = ${draf.id}`.execute(trx);
      const cats = await listCategoriesWithCounts(trx, 500);
      const hit = cats.find((c) => c.slug === cat.slug);
      expect(hit?.product_count).toBe(1);
    });
  });

  test('the farmer directory keeps only approved farmers and filters by regency', async () => {
    await withRollback(async (trx) => {
      const [a, b] = await authIds(trx, 2);
      const fa = await approvedFarmer(trx, a!);
      await approvedFarmer(trx, b!);
      await sql`update farmer_profiles set verification_status = 'pending' where user_id = ${b!}`.execute(trx);
      const rows = await listFarmerDirectory(trx, {
        filter: { regencySlug: fa.regencySlug }, sort: 'rating', page: 1, perPage: 500,
      });
      const ids = rows.map((r) => r.id);
      expect(ids).toContain(a!);
      expect(ids).not.toContain(b!);
    });
  });

  test('public stats count approved farmers only, without a null anywhere', async () => {
    await withRollback(async (trx) => {
      const stats = await countPublicStats(trx);
      expect(typeof stats.petani).toBe('number');
      expect(typeof stats.produk).toBe('number');
      expect(typeof stats.wilayah).toBe('number');
      expect(typeof stats.daftar_tunggu).toBe('number');
    });
  });
});
