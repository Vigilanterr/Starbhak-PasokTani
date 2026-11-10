import type {
  IkonKategori, Lencana, Satuan, StatusDaftarTunggu, TagProduk,
} from '../contract/tipe';
import type { ProductUnit, WaitlistEventType, WaitlistStatus } from '../repo/db.generated';

/**
 * Enum tables from the database to the contract (`contract/tipe.ts`). Each table is typed as a complete
 * Record, so adding a database value without a mapping fails the typecheck. The tests check every value.
 */

export const SATUAN_DARI_DB: Record<ProductUnit, Satuan> = {
  kg: 'kg',
  liter: 'liter',
  pack: 'pak',
  bunch: 'ikat',
  piece: 'buah',
};

/** Product tags the catalog shows. Other tags in the database stay out of the public response. */
export const TAG_DARI_DB: Partial<Record<string, TagProduk>> = {
  organik: 'organik',
  hidroponik: 'hidroponik',
  'bebas-pestisida': 'bebas-pestisida',
};

/** Badge codes in the badges table to the public badge names (S6). */
export const LENCANA_DARI_BADGE: Record<string, Lencana> = {
  new_farmer: 'petani-baru',
  verified_farmer: 'terverifikasi',
  power_farmer: 'petani-andalan',
  fast_response: 'respons-cepat',
  stock_always_updated: 'stok-selalu-baru',
  on_time_harvest: 'panen-tepat-waktu',
  surplus_hero: 'pahlawan-surplus',
};

export const STATUS_DAFTAR_DARI_DB: Record<WaitlistStatus, StatusDaftarTunggu> = {
  planting_scheduled: 'jadwal-tanam',
  planted: 'sudah-tanam',
  harvest_delayed: 'panen-tertunda',
  harvest_early: 'panen-lebih-awal',
  harvest_failed: 'gagal-panen',
  ready_to_harvest: 'siap-panen',
};

export const JENIS_LINIMASA_DARI_DB: Record<WaitlistEventType, 'status' | 'jadwal' | 'foto' | 'catatan'> = {
  status_change: 'status',
  schedule_change: 'jadwal',
  field_photo: 'foto',
  note: 'catatan',
};

/** Icon by category slug. Slugs are the ones in the categories table. */
export const IKON_DARI_KATEGORI: Record<string, IkonKategori> = {
  sayur: 'sayuran',
  buah: 'buah',
  rempah: 'rempah',
  'beras-padi': 'padi',
  umbi: 'umbi',
  jamur: 'jamur',
};

export function ikonDariKategori(slug: string): IkonKategori {
  return IKON_DARI_KATEGORI[slug] ?? 'sayuran';
}

/** Public badge name back to its database code, for the farmer filter. */
export function badgeDariLencana(lencana: Lencana): string | undefined {
  return Object.entries(LENCANA_DARI_BADGE).find(([, v]) => v === lencana)?.[0];
}

/** Contract status back to the database status, for the list filter. */
export function statusDbDari(status: StatusDaftarTunggu): WaitlistStatus | undefined {
  return (Object.entries(STATUS_DAFTAR_DARI_DB) as [WaitlistStatus, StatusDaftarTunggu][])
    .find(([, v]) => v === status)?.[0];
}
