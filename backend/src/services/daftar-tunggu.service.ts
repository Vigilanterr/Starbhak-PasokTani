import type { DaftarTungguTampil, HasilHalaman } from '../contract/tipe';
import { notFound } from '../lib/app-error';
import { statusDbDari } from '../mappers/enum';
import { daftarTungguTampil, entriDari, kabarDari } from '../mappers/daftar-tunggu';
import type { Executor } from '../repo/executor';
import { listBadgeCodesForFarmers } from '../repo/farmers/farmer-read.repo';
import { withTransaction } from '../repo/executor';
import {
  findWaitlistById, followWaitlist, listWaitlistTimeline, unfollowWaitlist,
} from '../repo/waitlist/waitlist.repo';
import {
  findWaitlistPublic, listPublicEventMedia, listWaitlistCards, listWaitlistCardsForFarmer,
  type WaitlistCardRow, type WaitlistSort,
} from '../repo/waitlist/waitlist-read.repo';
import { groupBy } from './hidrasi';
import type { StatusDaftarTunggu } from '../contract/tipe';

export interface DaftarTungguQuery {
  status?: StatusDaftarTunggu;
  kategori?: string;
  kabupaten?: string;
  bisaKomitmen?: boolean;
  urut?: 'populer' | 'panen-terdekat' | 'terbaru';
  halaman: number;
  perHalaman: number;
}

const URUT_DB: Record<NonNullable<DaftarTungguQuery['urut']>, WaitlistSort> = {
  populer: 'populer',
  'panen-terdekat': 'panen-terdekat',
  terbaru: 'terbaru',
};

/** Timeline rows shown on the detail page. Newest first from the database, reversed by the caller. */
const MAKS_LINIMASA = 50;
const MAKS_FOTO = 100;

/**
 * Cards in the contract shape. The timeline is filled only for one wait list (the detail page): the list views
 * leave it empty, so a page of cards costs the same queries whatever the page size.
 */
export async function tampilkanDaftar(
  db: Executor,
  rows: WaitlistCardRow[],
  opsi: { linimasa: boolean },
): Promise<DaftarTungguTampil[]> {
  if (rows.length === 0) return [];
  const farmerIds = [...new Set(rows.map((r) => r.farmer_id))];
  const badges = await listBadgeCodesForFarmers(db, farmerIds);
  const badgeOf = groupBy(badges, (b) => b.farmer_id);

  if (!opsi.linimasa) {
    return rows.map((r) => daftarTungguTampil(r, (badgeOf.get(r.farmer_id) ?? []).map((b) => b.code), [], []));
  }

  // Detail: one wait list, so one timeline query and one photo query.
  const [row] = rows;
  const events = (await listWaitlistTimeline(db, { waitlistId: row!.id, beforeId: null, limit: MAKS_LINIMASA }))
    .slice(0, MAKS_LINIMASA)
    .reverse();
  const foto = await listPublicEventMedia(db, events.filter((e) => e.type === 'field_photo').map((e) => e.id), MAKS_FOTO);
  const fotoOf = groupBy(foto, (f) => f.event_id);
  const kabar = events.flatMap((e) => kabarDari(e, fotoOf.get(e.id) ?? []));
  return rows.map((r) => daftarTungguTampil(
    r,
    (badgeOf.get(r.farmer_id) ?? []).map((b) => b.code),
    events.map(entriDari),
    kabar,
  ));
}

export async function daftarTunggu(db: Executor, q: DaftarTungguQuery): Promise<HasilHalaman<DaftarTungguTampil>> {
  const rows = await listWaitlistCards(db, {
    filter: {
      status: q.status ? statusDbDari(q.status) : undefined,
      categorySlug: q.kategori,
      regencySlug: q.kabupaten,
      stillOpen: q.bisaKomitmen,
    },
    sort: URUT_DB[q.urut ?? 'populer'],
    page: q.halaman,
    perPage: q.perHalaman,
  });
  const total = rows[0]?.total ?? 0;
  return {
    item: await tampilkanDaftar(db, rows, { linimasa: false }),
    total,
    halaman: q.halaman,
    jumlahHalaman: Math.max(1, Math.ceil(total / q.perHalaman)),
  };
}

export async function detailDaftarTunggu(db: Executor, id: string): Promise<DaftarTungguTampil> {
  const row = await findWaitlistPublic(db, id);
  if (!row) throw notFound('Daftar tunggu');
  const [item] = await tampilkanDaftar(db, [row], { linimasa: true });
  return item!;
}

/** Wait lists of one farmer that are not yet ready to harvest, for the farmer page. */
export async function daftarTungguPetani(db: Executor, farmerId: string): Promise<DaftarTungguTampil[]> {
  const rows = await listWaitlistCardsForFarmer(db, farmerId, 50);
  return tampilkanDaftar(db, rows.filter((r) => r.status !== 'ready_to_harvest'), { linimasa: false });
}

/**
 * Follows a wait list. Idempotent: following twice leaves one follow, and the count trigger fires once.
 * Any signed-in buyer may follow, so the route checks only the role.
 */
export function ikutiDaftarTunggu(db: Executor, buyerId: string, waitlistId: string): Promise<{ mengikuti: true }> {
  return withTransaction(db, async (trx) => {
    if (!(await findWaitlistById(trx, waitlistId))) throw notFound('Daftar tunggu');
    await followWaitlist(trx, buyerId, waitlistId); // undefined when already following: nothing to do
    return { mengikuti: true as const };
  });
}

/** Stops following. Idempotent, so a repeat returns the same answer. */
export function berhentiIkutiDaftarTunggu(db: Executor, buyerId: string, waitlistId: string): Promise<{ mengikuti: false }> {
  return withTransaction(db, async (trx) => {
    await unfollowWaitlist(trx, buyerId, waitlistId);
    return { mengikuti: false as const };
  });
}
