import { sql } from 'kysely';
import type { Executor } from '../executor';
import { distanceMeters, latOf, lngOf, point, withinMeters, type LngLat } from '../geo';
import type { ProductUnit } from '../db.generated';

/**
 * Public read models for the catalog pages. Each one is a single query: no per-row loops. Joins
 * restrict results to active products of approved farmers whose account is not deleted. Money and quantities
 * come back as strings (bigint and numeric). Dates come back as YYYY-MM-DD text.
 *
 * Joined column names are unique within each select, so the joins never make a name ambiguous.
 */

/** Today in Jakarta, from Postgres. The session time zone is GMT, so current_date is the wrong day before 07:00 WIB. */
const TODAY_WIB = sql<string>`(now() at time zone 'Asia/Jakarta')::date`;

export type CatalogSort = 'terlaris' | 'terbaru' | 'harga-asc' | 'harga-desc' | 'rating' | 'terdekat' | 'relevan';

export interface CatalogFilter {
  categorySlug?: string;
  regencySlug?: string;
  farmerId?: string;
  tagSlug?: string;
  surplusOnly?: boolean;
  inStockOnly?: boolean;
  priceMin?: number;
  priceMax?: number;
  excludeProductId?: string;
  /** Search hits in relevance order. Used with sort `relevan`. */
  ids?: string[];
  /** Origin for distance. Sorting by distance needs it; the radius is optional. */
  origin?: LngLat;
  radiusMeters?: number;
}

export interface CatalogCardRow {
  id: string;
  slug: string;
  name: string;
  unit: ProductUnit;
  price: string;
  min_order_qty: string;
  available_qty: string;
  sold_qty: string;
  rating_avg: string;
  rating_count: number;
  subscriber_count: number;
  surplus_enabled: boolean;
  surplus_floor_price: string | null;
  alt_names: string[];
  description: string | null;
  created_at: Date;
  farmer_id: string;
  farmer_name: string;
  farmer_shop_name: string;
  farmer_slug: string;
  farmer_rating: string;
  regency_slug: string;
  regency_name: string;
  district_name: string;
  lng: number | null;
  lat: number | null;
  category_slug: string;
  category_name: string;
  harvested_on: string | null;
  expires_on: string | null;
  days_left: number | null;
  distance_m: number | null;
  total: number;
}

/** Joins and visibility rules shared by every catalog read. */
function catalogBase(db: Executor) {
  return db.selectFrom('products')
    .innerJoin('categories', 'categories.id', 'products.category_id')
    .innerJoin('users', 'users.id', 'products.farmer_id')
    .innerJoin('farmer_profiles', 'farmer_profiles.user_id', 'products.farmer_id')
    .innerJoin('regencies', 'regencies.code', 'farmer_profiles.regency_code')
    .innerJoin('districts', 'districts.code', 'farmer_profiles.district_code')
    .leftJoin('product_batches', 'product_batches.id', 'products.current_batch_id')
    .where('products.status', '=', 'active')
    .where('users.deleted_at', 'is', null)
    .where('farmer_profiles.verification_status', '=', 'approved');
}

function applyFilter(q: ReturnType<typeof catalogBase>, f: CatalogFilter) {
  let out = q;
  if (f.categorySlug) out = out.where('categories.slug', '=', f.categorySlug);
  if (f.regencySlug) out = out.where('regencies.slug', '=', f.regencySlug);
  if (f.farmerId) out = out.where('products.farmer_id', '=', f.farmerId);
  if (f.excludeProductId) out = out.where('products.id', '!=', f.excludeProductId);
  if (f.surplusOnly) out = out.where('products.surplus_enabled', '=', true);
  if (f.inStockOnly) out = out.where('products.available_qty', '>', '0');
  if (f.priceMin !== undefined) out = out.where('products.price', '>=', String(f.priceMin));
  if (f.priceMax !== undefined) out = out.where('products.price', '<=', String(f.priceMax));
  if (f.tagSlug) {
    const tag = f.tagSlug;
    out = out.where(sql<boolean>`exists (
      select 1 from product_tags pt join tags t on t.id = pt.tag_id
      where pt.product_id = products.id and t.slug = ${tag})`);
  }
  if (f.ids) out = out.where('products.id', 'in', f.ids.length ? f.ids : ['00000000-0000-0000-0000-000000000000']);
  if (f.origin && f.radiusMeters !== undefined) {
    out = out.where(withinMeters('farmer_profiles.location', f.origin, f.radiusMeters));
  }
  return out;
}

/**
 * Ordering. Sold-out products always sort last, as the public catalog shows them there. The price sort uses the
 * base price, not the Surplus price, which the service computes per request.
 */
function applySort(q: ReturnType<typeof cardColumns>, sort: CatalogSort, from: LngLat | undefined, ids: string[] = []) {
  // Sold-out products come first in the ordering, so they sort last whatever the sort key.
  const inStockFirst = q.orderBy(sql`(products.available_qty > 0) desc`);
  const sorted = (() => {
    switch (sort) {
      case 'relevan': return inStockFirst.orderBy(sql`array_position(${ids}::uuid[], products.id)`);
      case 'harga-asc': return inStockFirst.orderBy('products.price', 'asc');
      case 'harga-desc': return inStockFirst.orderBy('products.price', 'desc');
      case 'rating': return inStockFirst.orderBy('products.rating_avg', 'desc').orderBy('products.rating_count', 'desc');
      case 'terbaru': return inStockFirst.orderBy(sql`product_batches.harvested_on desc nulls last`);
      case 'terdekat':
        if (!from) throw new Error('terdekat needs a location');
        return inStockFirst.orderBy(sql`farmer_profiles.location <-> ${point(from)}`);
      default: return inStockFirst.orderBy('products.sold_qty', 'desc');
    }
  })();
  return sorted.orderBy('products.id', 'asc');
}

/**
 * One page of cards with the total in every row (count(*) over()). An empty result means the page is past
 * the end or nothing matches: the service then decides which, using page 1.
 */
export function listCatalogCards(db: Executor, a: {
  filter?: CatalogFilter;
  sort: CatalogSort;
  page: number;
  perPage: number;
}) {
  const from = a.filter?.origin;
  const withCols = cardColumns(applyFilter(catalogBase(db), a.filter ?? {}), from);
  return applySort(withCols, a.sort, from, a.filter?.ids)
    .limit(a.perPage)
    .offset((a.page - 1) * a.perPage)
    .execute() as Promise<CatalogCardRow[]>;
}

/** The card select, applied to a base query that already has its filters. */
function cardColumns(base: ReturnType<typeof catalogBase>, from: LngLat | undefined) {
  const q = base.select([
    'products.id', 'products.slug', 'products.name', 'products.unit', 'products.price',
    'products.min_order_qty', 'products.available_qty', 'products.sold_qty', 'products.rating_avg',
    'products.rating_count', 'products.subscriber_count', 'products.surplus_enabled',
    'products.surplus_floor_price', 'products.alt_names', 'products.description', 'products.created_at',
    'products.farmer_id', 'users.full_name as farmer_name', 'farmer_profiles.shop_name as farmer_shop_name',
    'farmer_profiles.slug as farmer_slug', 'farmer_profiles.rating_avg as farmer_rating',
    'regencies.slug as regency_slug', 'regencies.name as regency_name', 'districts.name as district_name',
    'categories.slug as category_slug', 'categories.name as category_name',
    lngOf('farmer_profiles.location').as('lng'),
    latOf('farmer_profiles.location').as('lat'),
    sql<string | null>`product_batches.harvested_on::text`.as('harvested_on'),
    sql<string | null>`product_batches.expires_on::text`.as('expires_on'),
    sql<number | null>`product_batches.expires_on - ${TODAY_WIB}`.as('days_left'),
    sql<number>`count(*) over()::int`.as('total'),
  ]);
  return from
    ? q.select(distanceMeters('farmer_profiles.location', from).as('distance_m'))
    : q.select(sql<number | null>`null::float8`.as('distance_m'));
}

/** One active product by id, for the related-products lookup. */
export function findCatalogCardById(db: Executor, id: string) {
  return cardColumns(catalogBase(db), undefined)
    .where('products.id', '=', id)
    .executeTakeFirst() as Promise<CatalogCardRow | undefined>;
}

/** One active product by slug. Drafts, banned and inactive products are not found. */
export function findCatalogCardBySlug(db: Executor, slug: string) {
  return cardColumns(catalogBase(db), undefined)
    .where('products.slug', '=', slug)
    .executeTakeFirst() as Promise<CatalogCardRow | undefined>;
}

/** Tag slugs of many products in one query. */
export function listTagSlugsForProducts(db: Executor, productIds: string[]) {
  if (productIds.length === 0) return Promise.resolve([] as { product_id: string; slug: string }[]);
  return db.selectFrom('product_tags')
    .innerJoin('tags', 'tags.id', 'product_tags.tag_id')
    .select(['product_tags.product_id', 'tags.slug'])
    .where('product_tags.product_id', 'in', productIds)
    .orderBy('tags.slug', 'asc')
    .execute();
}

/** Price tiers of many products in one query, cheapest quantity first. */
export function listTiersForProducts(db: Executor, productIds: string[]) {
  if (productIds.length === 0) return Promise.resolve([] as { product_id: string; min_qty: string; unit_price: string }[]);
  return db.selectFrom('price_tiers')
    .select(['product_id', 'min_qty', 'unit_price'])
    .where('product_id', 'in', productIds)
    .orderBy('product_id', 'asc')
    .orderBy('min_qty', 'asc')
    .orderBy('id', 'asc')
    .execute();
}

/** Surplus rules of many products in one query. */
export function listSurplusRulesForProducts(db: Executor, productIds: string[]) {
  if (productIds.length === 0) return Promise.resolve([] as { product_id: string; days_remaining: number; discount_pct: string }[]);
  return db.selectFrom('surplus_rules')
    .select(['product_id', 'days_remaining', 'discount_pct'])
    .where('product_id', 'in', productIds)
    .orderBy('product_id', 'asc')
    .orderBy('days_remaining', 'asc')
    .execute();
}

/** Ready photos of many products. The Cloudinary public id (or a `local:` path in demo data) is the only image reference. */
export function listPhotosForProducts(db: Executor, productIds: string[]) {
  if (productIds.length === 0) return Promise.resolve([] as PhotoRow[]);
  return db.selectFrom('product_photos')
    .innerJoin('media_assets', 'media_assets.id', 'product_photos.media_id')
    .select([
      'product_photos.product_id', 'product_photos.position', 'product_photos.caption',
      'media_assets.cloudinary_public_id as public_id',
      sql<string>`(product_photos.created_at at time zone 'Asia/Jakarta')::date::text`.as('uploaded_on'),
    ])
    .where('product_photos.product_id', 'in', productIds)
    .where('media_assets.status', '=', 'ready')
    .orderBy('product_photos.product_id', 'asc')
    .orderBy('product_photos.position', 'asc')
    .orderBy('product_photos.id', 'asc')
    .execute();
}

export interface PhotoRow {
  product_id: string;
  position: number;
  caption: string | null;
  public_id: string;
  uploaded_on: string;
}

/** Active categories with the number of live products in each. One query. */
export function listCategoriesWithCounts(db: Executor, limit: number) {
  return db.selectFrom('categories')
    .select([
      'categories.id', 'categories.slug', 'categories.name', 'categories.description',
      'categories.icon', 'categories.sort_order',
      sql<number>`(
        select count(*)::int from products p
        join users u on u.id = p.farmer_id
        join farmer_profiles fp on fp.user_id = p.farmer_id
        where p.category_id = categories.id and p.status = 'active'
          and u.deleted_at is null and fp.verification_status = 'approved'
      )`.as('product_count'),
    ])
    .where('categories.is_active', '=', true)
    .orderBy('categories.sort_order', 'asc')
    .orderBy('categories.id', 'asc')
    .limit(limit)
    .execute();
}

/** Counts for the home page statistics. One query. */
export function countPublicStats(db: Executor) {
  return db.selectNoFrom([
    sql<number>`(
      select count(*)::int from farmer_profiles fp join users u on u.id = fp.user_id
      where fp.verification_status = 'approved' and u.deleted_at is null)`.as('petani'),
    sql<number>`(
      select count(*)::int from products p
      join users u on u.id = p.farmer_id
      join farmer_profiles fp on fp.user_id = p.farmer_id
      where p.status = 'active' and u.deleted_at is null and fp.verification_status = 'approved')`.as('produk'),
    sql<number>`(
      select count(distinct fp.regency_code)::int from farmer_profiles fp join users u on u.id = fp.user_id
      where fp.verification_status = 'approved' and u.deleted_at is null)`.as('wilayah'),
    sql<number>`(
      select count(*)::int from waitlists w
      join farmer_profiles fp on fp.user_id = w.farmer_id
      join users u on u.id = w.farmer_id
      where fp.verification_status = 'approved' and u.deleted_at is null)`.as('daftar_tunggu'),
  ]).executeTakeFirstOrThrow();
}
