import { sql } from 'kysely';
import type { Executor } from '../executor';
import { latOf, lngOf } from '../geo';
import type { ProductUnit, WaitlistStatus } from '../db.generated';

/**
 * Public wait list reads. Wait lists of approved farmers of live accounts only. The timeline and its
 * photos come from the existing listWaitlistTimeline and listMediaForEvents, extended here with the public id.
 */

export type WaitlistSort = 'populer' | 'panen-terdekat' | 'terbaru';

export interface WaitlistFilter {
  status?: WaitlistStatus;
  categorySlug?: string;
  regencySlug?: string;
  /** Not yet ready, failed, or full. */
  stillOpen?: boolean;
}

export interface WaitlistCardRow {
  id: string;
  farmer_id: string;
  owner_name: string;
  shop_name: string;
  farmer_slug: string;
  regency_slug: string;
  regency_name: string;
  district_name: string;
  farmer_rating: string;
  lng: number | null;
  lat: number | null;
  category_name: string;
  commodity_name: string;
  description: string | null;
  category_slug: string;
  unit: ProductUnit;
  status: WaitlistStatus;
  schedule_type: string;
  planted_on: string | null;
  harvest_start: string | null;
  harvest_end: string | null;
  estimated_yield_qty: string | null;
  estimated_unit_price: string;
  quota_qty: string | null;
  committed_min_qty: string;
  min_commit_qty: string;
  commitment_count: number;
  follower_count: number;
  failure_reason: string | null;
  product_slug: string | null;
  created_at: Date;
  total: number;
}

const WAITLIST_SELECT = [
  'waitlists.id', 'waitlists.farmer_id', 'users.full_name as owner_name',
  'farmer_profiles.shop_name', 'farmer_profiles.slug as farmer_slug',
  'regencies.slug as regency_slug', 'regencies.name as regency_name',
  'farmer_profiles.rating_avg as farmer_rating', 'districts.name as district_name',
  'waitlists.commodity_name', 'waitlists.description', 'categories.slug as category_slug',
  'categories.name as category_name',
  lngOf('farmer_profiles.location').as('lng'),
  latOf('farmer_profiles.location').as('lat'),
  'waitlists.unit', 'waitlists.status', 'waitlists.schedule_type',
  sql<string | null>`waitlists.planted_on::text`.as('planted_on'),
  sql<string | null>`waitlists.harvest_start::text`.as('harvest_start'),
  sql<string | null>`waitlists.harvest_end::text`.as('harvest_end'),
  'waitlists.estimated_yield_qty', 'waitlists.estimated_unit_price', 'waitlists.quota_qty',
  'waitlists.committed_min_qty', 'waitlists.min_commit_qty', 'waitlists.commitment_count',
  'waitlists.follower_count', 'waitlists.failure_reason', 'products.slug as product_slug',
  'waitlists.created_at',
] as const;

function waitlistBase(db: Executor) {
  return db.selectFrom('waitlists')
    .innerJoin('farmer_profiles', 'farmer_profiles.user_id', 'waitlists.farmer_id')
    .innerJoin('users', 'users.id', 'waitlists.farmer_id')
    .innerJoin('regencies', 'regencies.code', 'farmer_profiles.regency_code')
    .innerJoin('districts', 'districts.code', 'farmer_profiles.district_code')
    .innerJoin('categories', 'categories.id', 'waitlists.category_id')
    .leftJoin('products', 'products.id', 'waitlists.product_id')
    .where('farmer_profiles.verification_status', '=', 'approved')
    .where('users.deleted_at', 'is', null);
}

/** One page with the total in every row. */
export function listWaitlistCards(db: Executor, a: {
  filter: WaitlistFilter;
  sort: WaitlistSort;
  page: number;
  perPage: number;
}) {
  let q = waitlistBase(db);
  const f = a.filter;
  if (f.status) q = q.where('waitlists.status', '=', f.status);
  if (f.categorySlug) q = q.where('categories.slug', '=', f.categorySlug);
  if (f.regencySlug) q = q.where('regencies.slug', '=', f.regencySlug);
  if (f.stillOpen) {
    q = q.where('waitlists.status', 'not in', ['harvest_failed', 'ready_to_harvest'])
      .where(sql<boolean>`(waitlists.quota_qty is null or waitlists.committed_min_qty < waitlists.quota_qty)`);
  }
  const withCols = q.select(WAITLIST_SELECT).select(sql<number>`count(*) over()::int`.as('total'));
  const ordered = (() => {
    switch (a.sort) {
      case 'terbaru': return withCols.orderBy('waitlists.created_at', 'desc');
      case 'panen-terdekat': return withCols.orderBy(sql`waitlists.harvest_start asc nulls last`);
      default: return withCols.orderBy('waitlists.follower_count', 'desc');
    }
  })();
  return ordered
    .orderBy('waitlists.id', 'asc')
    .limit(a.perPage)
    .offset((a.page - 1) * a.perPage)
    .execute() as Promise<WaitlistCardRow[]>;
}

export function findWaitlistPublic(db: Executor, waitlistId: string) {
  return waitlistBase(db)
    .select(WAITLIST_SELECT)
    .where('waitlists.id', '=', waitlistId)
    .executeTakeFirst() as Promise<WaitlistCardRow | undefined>;
}

/** Wait lists of one farmer, for the farmer profile. Same visibility as the directory. */
export function listWaitlistCardsForFarmer(db: Executor, farmerId: string, limit: number) {
  return waitlistBase(db)
    .select(WAITLIST_SELECT)
    .select(sql<number>`count(*) over()::int`.as('total'))
    .where('waitlists.farmer_id', '=', farmerId)
    .orderBy('waitlists.status', 'asc')
    .orderBy('waitlists.id', 'asc')
    .limit(limit)
    .execute() as Promise<WaitlistCardRow[]>;
}

/** Ready photos of many timeline events, with the public id. The `local:` form is demo data. */
export function listPublicEventMedia(db: Executor, eventIds: string[], limit: number) {
  if (eventIds.length === 0) return Promise.resolve([] as { event_id: string; position: number; caption: string | null; public_id: string }[]);
  return db.selectFrom('waitlist_media')
    .innerJoin('media_assets', 'media_assets.id', 'waitlist_media.media_id')
    .select([
      'waitlist_media.event_id', 'waitlist_media.position', 'waitlist_media.caption',
      'media_assets.cloudinary_public_id as public_id',
    ])
    .where('waitlist_media.event_id', 'in', eventIds)
    .where('media_assets.status', '=', 'ready')
    .orderBy('waitlist_media.event_id', 'asc')
    .orderBy('waitlist_media.position', 'asc')
    .orderBy('waitlist_media.id', 'asc')
    .limit(limit)
    .execute();
}
