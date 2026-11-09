import type { Executor } from '../executor';

/** Seeded reference data (regencies, districts). Centroids are not selected; add lngOf/latOf when needed. */

export const REGENCY_COLUMNS = ['code', 'name', 'slug', 'is_city'] as const;
export const DISTRICT_COLUMNS = ['code', 'regency_code', 'name'] as const;

/** Regencies in code order. `code` is the primary key, so the order is unique. */
export function listRegencies(db: Executor, limit: number) {
  return db.selectFrom('regencies')
    .select(REGENCY_COLUMNS)
    .orderBy('code', 'asc')
    .limit(limit)
    .execute();
}

/** Regency for a URL filter value such as `kabupaten-bandung`. */
export function findRegencyBySlug(db: Executor, slug: string) {
  return db.selectFrom('regencies')
    .select(REGENCY_COLUMNS)
    .where('slug', '=', slug)
    .executeTakeFirst();
}

/** Districts of one regency in code order. `code` is the primary key, so the order is unique. */
export function listDistrictsForRegency(db: Executor, regencyCode: string, limit: number) {
  return db.selectFrom('districts')
    .select(DISTRICT_COLUMNS)
    .where('regency_code', '=', regencyCode)
    .orderBy('code', 'asc')
    .limit(limit)
    .execute();
}
