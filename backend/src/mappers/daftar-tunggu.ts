import type {
  DaftarTunggu, DaftarTungguTampil, EntriLinimasa, JadwalPanen, KabarLahan, RingkasPetani,
} from '../contract/tipe';
import type { WaitlistCardRow } from '../repo/waitlist/waitlist-read.repo';
import type { WaitlistEventType } from '../repo/db.generated';
import { ikonDariKategori, JENIS_LINIMASA_DARI_DB, SATUAN_DARI_DB, STATUS_DAFTAR_DARI_DB } from './enum';
import { angka, rupiah, srcFoto, tanggalJakarta } from './util';
import { ringkasPetaniDari } from './produk';
import { lencanaDari } from './petani';

/** One timeline row, as the repo returns it. */
export interface EventRow {
  id: string;
  type: WaitlistEventType;
  title: string | null;
  body: string | null;
  reason: string | null;
  created_at: Date;
}

/** Schedule from the harvest columns. The shape follows the schedule type, as the database check requires. */
export function jadwalPanenDari(row: Pick<WaitlistCardRow, 'schedule_type' | 'harvest_start' | 'harvest_end'>): JadwalPanen {
  if (row.schedule_type === 'exact_date' && row.harvest_start) return { jenis: 'tanggal', tanggal: row.harvest_start };
  if (row.schedule_type === 'date_range' && row.harvest_start && row.harvest_end) {
    return { jenis: 'rentang', mulai: row.harvest_start, selesai: row.harvest_end };
  }
  return { jenis: 'belum-ada' };
}

/** Timeline entry, newest first from the database. The caller reverses it for display. */
export function entriDari(e: EventRow): EntriLinimasa {
  return {
    tanggal: tanggalJakarta(e.created_at),
    jenis: JENIS_LINIMASA_DARI_DB[e.type],
    judul: e.title ?? '',
    isi: e.body ?? '',
    ...(e.reason ? { alasan: e.reason } : {}),
  };
}

export function kabarDari(e: EventRow, foto: { public_id: string; caption: string | null }[]): KabarLahan[] {
  if (e.type !== 'field_photo') return [];
  return foto.map((f) => ({
    tanggal: tanggalJakarta(e.created_at),
    keterangan: f.caption ?? e.body ?? '',
    src: srcFoto(f.public_id),
  }));
}

/** Wait list in the contract shape. The timeline and photos are passed in by the service. */
export function daftarTungguTampil(
  row: WaitlistCardRow,
  badgeCodes: string[],
  linimasa: EntriLinimasa[],
  kabar: KabarLahan[],
): DaftarTungguTampil {
  const kuota = row.quota_qty === null ? null : angka(row.quota_qty);
  const terkomitmen = angka(row.committed_min_qty);
  const petani: RingkasPetani = ringkasPetaniDari({
    farmer_id: row.farmer_id,
    farmer_name: row.owner_name,
    farmer_shop_name: row.shop_name,
    regency_slug: row.regency_slug,
    regency_name: row.regency_name,
    district_name: row.district_name,
    farmer_rating: row.farmer_rating,
    lat: row.lat,
    lng: row.lng,
  }, lencanaDari(badgeCodes));
  const dasar: DaftarTunggu = {
    id: row.id,
    komoditas: row.commodity_name,
    kategori: row.category_slug,
    petaniId: row.farmer_id,
    deskripsi: row.description ?? '',
    status: STATUS_DAFTAR_DARI_DB[row.status],
    tanggalTanam: row.planted_on,
    jadwalPanen: jadwalPanenDari(row),
    perkiraanHasil: angka(row.estimated_yield_qty),
    satuan: SATUAN_DARI_DB[row.unit],
    hargaPerkiraan: rupiah(row.estimated_unit_price),
    kuota,
    terkomitmen,
    jumlahKomitmen: row.commitment_count,
    pengikut: row.follower_count,
    minKomitmen: angka(row.min_commit_qty),
    linimasa,
    kabarLahan: kabar,
    produkSlug: row.product_slug,
    dibuat: tanggalJakarta(row.created_at),
  };
  return {
    ...dasar,
    petani,
    namaKategori: row.category_name,
    ikonKategori: ikonDariKategori(row.category_slug),
    persenKuota: kuota ? Math.min(100, Math.round((terkomitmen / kuota) * 100)) : null,
    kuotaPenuh: kuota !== null && terkomitmen >= kuota,
  };
}

