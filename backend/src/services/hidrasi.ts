import type { Executor } from '../repo/executor';
import { listBadgeCodesForFarmers, listNextHolidayForFarmers, listOperatingHoursForFarmers, listProductNamesForFarmers } from '../repo/farmers/farmer-read.repo';
import type { PetaniHidrasi } from '../mappers/petani';

/**
 * Batch loaders. Each one runs one query for a whole list of ids and groups the result in memory, so a page of
 * 60 farmers costs the same number of queries as a page of 1. Nothing here loops over the database.
 */

export function groupBy<T>(rows: T[], key: (r: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const r of rows) {
    const k = key(r);
    const bucket = out.get(k);
    if (bucket) bucket.push(r);
    else out.set(k, [r]);
  }
  return out;
}

/** Hydration for a page of farmers: badges, commodities (at most six), weekly hours and the next holiday. */
export async function hidrasiPetani(db: Executor, farmerIds: string[]): Promise<Map<string, PetaniHidrasi>> {
  const [badges, produk, jam, libur] = await Promise.all([
    listBadgeCodesForFarmers(db, farmerIds),
    listProductNamesForFarmers(db, farmerIds),
    listOperatingHoursForFarmers(db, farmerIds),
    listNextHolidayForFarmers(db, farmerIds),
  ]);
  const badgeOf = groupBy(badges, (b) => b.farmer_id);
  const produkOf = groupBy(produk, (p) => p.farmer_id);
  const jamOf = groupBy(jam, (j) => j.farmer_id);
  const liburOf = new Map(libur.map((l) => [l.farmer_id, l.starts_on]));
  const out = new Map<string, PetaniHidrasi>();
  for (const id of farmerIds) {
    out.set(id, {
      lencana: (badgeOf.get(id) ?? []).map((b) => b.code),
      komoditas: [...new Set((produkOf.get(id) ?? []).map((p) => p.name))].slice(0, 6),
      jam: jamOf.get(id) ?? [],
      libur: liburOf.get(id) ?? null,
    });
  }
  return out;
}
