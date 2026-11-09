import { sql } from 'kysely';
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

/**
 * District by name inside one regency, ignoring case. Names repeat across regencies, so the regency is part of the
 * match. The sign-up form types the name, and this turns it into the code. undefined means no such district here.
 */
export function findDistrictByName(db: Executor, regencyCode: string, name: string) {
  return db.selectFrom('districts')
    .select(DISTRICT_COLUMNS)
    .where('regency_code', '=', regencyCode)
    .where(sql<boolean>`lower(name) = lower(${name})`)
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
