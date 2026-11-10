import { sql } from 'kysely';
import type { Executor } from '../executor';
import { distanceMeters, latOf, lngOf, point, type LngLat } from '../geo';

/**
 * Public farmer reads. Only approved farmers of live accounts are visible. Like the catalog, each read is one
 * query and returns no per-row lookups. Badges, hours and holidays are batched by the caller with `in`.
 */

export type DirectorySort = 'rating' | 'transaksi' | 'terbaru' | 'terdekat';

export interface FarmerDirectoryFilter {
  /** Free text over the shop name and the owner's name. */
  q?: string;
  regencySlug?: string;
  badgeCode?: string;
  near?: LngLat;
}

export interface FarmerCardRow {
  id: string;
  owner_name: string;
  shop_name: string;
  slug: string;
  rating_avg: string;
  rating_count: number;
  completed_order_count: number;
  avg_response_minutes: number | null;
  land_area_ha: string | null;
  created_at: Date;
  regency_slug: string;
  regency_name: string;
  district_name: string;
  lng: number | null;
  lat: number | null;
  product_count: number;
  waitlist_count: number;
  distance_m: number | null;
  total: number;
}

const FARMER_SELECT = [
  'farmer_profiles.user_id as id', 'users.full_name as owner_name', 'farmer_profiles.shop_name',
  'farmer_profiles.slug', 'farmer_profiles.rating_avg', 'farmer_profiles.rating_count',
  'farmer_profiles.completed_order_count', 'farmer_profiles.avg_response_minutes',
  'farmer_profiles.land_area_ha', 'farmer_profiles.created_at',
  'regencies.slug as regency_slug', 'regencies.name as regency_name', 'districts.name as district_name',
] as const;

function farmerBase(db: Executor) {
  return db.selectFrom('farmer_profiles')
    .innerJoin('users', 'users.id', 'farmer_profiles.user_id')
    .innerJoin('regencies', 'regencies.code', 'farmer_profiles.regency_code')
    .innerJoin('districts', 'districts.code', 'farmer_profiles.district_code')
    .where('farmer_profiles.verification_status', '=', 'approved')
    .where('users.deleted_at', 'is', null);
}

function farmerColumns(base: ReturnType<typeof farmerBase>, near: LngLat | undefined) {
  const q = base.select(FARMER_SELECT).select([
    lngOf('farmer_profiles.location').as('lng'),
    latOf('farmer_profiles.location').as('lat'),
    sql<number>`(select count(*)::int from products p
      where p.farmer_id = farmer_profiles.user_id and p.status = 'active')`.as('product_count'),
    sql<number>`(select count(*)::int from waitlists w
      where w.farmer_id = farmer_profiles.user_id and w.status <> 'ready_to_harvest')`.as('waitlist_count'),
  ]);
  return near
    ? q.select(distanceMeters('farmer_profiles.location', near).as('distance_m'))
    : q.select(sql<number | null>`null::float8`.as('distance_m'));
}

/** Directory page with the total in every row. */
export function listFarmerDirectory(db: Executor, a: {
  filter: FarmerDirectoryFilter;
  sort: DirectorySort;
  page: number;
  perPage: number;
}) {
  let base = farmerBase(db);
  const f = a.filter;
  if (f.regencySlug) base = base.where('regencies.slug', '=', f.regencySlug);
  if (f.q) {
    const like = `%${f.q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    base = base.where(sql<boolean>`(
      f_unaccent(farmer_profiles.shop_name) ilike f_unaccent(${like})
      or f_unaccent(users.full_name) ilike f_unaccent(${like}))`);
  }
  if (f.badgeCode) {
    const code = f.badgeCode;
    base = base.where(sql<boolean>`exists (
      select 1 from farmer_badges fb join badges b on b.id = fb.badge_id
      where fb.farmer_id = farmer_profiles.user_id and fb.revoked_at is null and b.code = ${code})`);
  }

  const withCols = farmerColumns(base, f.near).select(sql<number>`count(*) over()::int`.as('total'));
  const ordered = (() => {
    switch (a.sort) {
      case 'transaksi': return withCols.orderBy('farmer_profiles.completed_order_count', 'desc');
      case 'terbaru': return withCols.orderBy('farmer_profiles.created_at', 'desc');
      case 'terdekat':
        if (!f.near) throw new Error('terdekat needs a location');
        return withCols.orderBy(sql`farmer_profiles.location <-> ${point(f.near)}`);
      default: return withCols.orderBy('farmer_profiles.rating_avg', 'desc').orderBy('farmer_profiles.rating_count', 'desc');
    }
  })();
  return ordered
    .orderBy('farmer_profiles.user_id', 'asc')
    .limit(a.perPage)
    .offset((a.page - 1) * a.perPage)
    .execute() as Promise<FarmerCardRow[]>;
}

/** One approved farmer by user id, with the farm pin. */
export function findFarmerPublic(db: Executor, farmerId: string, near?: LngLat) {
  return farmerColumns(farmerBase(db), near)
    .where('farmer_profiles.user_id', '=', farmerId)
    .executeTakeFirst() as Promise<FarmerCardRow | undefined>;
}

/** Active badge codes of many farmers in one query. Revoked badges are left out. */
export function listBadgeCodesForFarmers(db: Executor, farmerIds: string[]) {
  if (farmerIds.length === 0) return Promise.resolve([] as { farmer_id: string; code: string }[]);
  return db.selectFrom('farmer_badges')
    .innerJoin('badges', 'badges.id', 'farmer_badges.badge_id')
    .select(['farmer_badges.farmer_id', 'badges.code'])
    .where('farmer_badges.farmer_id', 'in', farmerIds)
    .where('farmer_badges.revoked_at', 'is', null)
    .orderBy('farmer_badges.farmer_id', 'asc')
    .orderBy('badges.sort_order', 'asc')
    .execute();
}

/** Weekly hours of many farmers in one query. Times are HH:MM text. */
export function listOperatingHoursForFarmers(db: Executor, farmerIds: string[]) {
  if (farmerIds.length === 0) return Promise.resolve([] as { farmer_id: string; weekday: number; opens_at: string; closes_at: string }[]);
  return db.selectFrom('farmer_operating_hours')
    .select([
      'farmer_id', 'weekday',
      sql<string>`left(opens_at::text, 5)`.as('opens_at'),
      sql<string>`left(closes_at::text, 5)`.as('closes_at'),
    ])
    .where('farmer_id', 'in', farmerIds)
    .orderBy('farmer_id', 'asc')
    .orderBy('weekday', 'asc')
    .execute();
}

/**
 * Upcoming holiday start per farmer, earliest only, in one query. Jakarta today decides "upcoming",
 * so a holiday that started today still counts.
 */
export function listNextHolidayForFarmers(db: Executor, farmerIds: string[]) {
  if (farmerIds.length === 0) return Promise.resolve([] as { farmer_id: string; starts_on: string }[]);
  return db.selectFrom('farmer_holidays')
    .select([
      'farmer_id',
      sql<string>`min(lower(period))::text`.as('starts_on'),
    ])
    .where('farmer_id', 'in', farmerIds)
    .where(sql<boolean>`upper(period) > (now() at time zone 'Asia/Jakarta')::date`)
    .groupBy('farmer_id')
    .execute();
}

/** Distinct names of live products per farmer, for the commodity list. One query, capped per farmer in TS. */
export function listProductNamesForFarmers(db: Executor, farmerIds: string[]) {
  if (farmerIds.length === 0) return Promise.resolve([] as { farmer_id: string; name: string }[]);
  return db.selectFrom('products')
    .select(['farmer_id', 'name'])
    .where('farmer_id', 'in', farmerIds)
    .where('status', '=', 'active')
    .groupBy(['farmer_id', 'name'])
    .orderBy('farmer_id', 'asc')
    .orderBy('name', 'asc')
    .execute();
}
