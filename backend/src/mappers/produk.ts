import type { Lencana, ProdukTampil, RingkasPetani, SurplusAktif } from '../contract/tipe';
import type { CatalogCardRow, PhotoRow } from '../repo/catalog/catalog-read.repo';
import { ikonDariKategori, SATUAN_DARI_DB, TAG_DARI_DB } from './enum';
import { lencanaDari } from './petani';
import { angka, koordinat, rupiah, srcFoto, tanggalJakarta } from './util';

/** Rows that hang off a product, already grouped by product id. */
export interface ProdukHidrasi {
  tags: string[];
  tiers: { min_qty: string; unit_price: string }[];
  rules: { days_remaining: number; discount_pct: string }[];
  photos: PhotoRow[];
}

export const KOSONG_HIDRASI: ProdukHidrasi = { tags: [], tiers: [], rules: [], photos: [] };

export function ringkasPetaniDari(row: {
  farmer_id: string; farmer_name: string; farmer_shop_name: string; regency_slug: string;
  regency_name: string; district_name: string; farmer_rating: string; lat: number | null; lng: number | null;
}, lencana: Lencana[]): RingkasPetani {
  return {
    id: row.farmer_id,
    nama: row.farmer_name,
    namaToko: row.farmer_shop_name,
    kabupaten: row.regency_slug,
    kecamatan: row.district_name,
    lencana,
    rating: angka(row.farmer_rating),
    lokasi: koordinat(row.lat, row.lng),
    labelWilayah: row.regency_name,
  };
}

/**
 * One product in the contract shape. The Surplus result and distance are computed by the service and passed in,
 * so this file stays a plain transform.
 */
export function produkTampil(
  row: CatalogCardRow,
  h: ProdukHidrasi,
  surplus: SurplusAktif | null,
  jarakKm: number | null,
  badgeCodes: string[],
): ProdukTampil {
  const stok = angka(row.available_qty);
  const harga = rupiah(row.price);
  const petani = ringkasPetaniDari(row, lencanaDari(badgeCodes));
  return {
    id: row.id,
    slug: row.slug,
    nama: row.name,
    namaLain: row.alt_names ?? [],
    kategori: row.category_slug,
    petaniId: row.farmer_id,
    harga,
    satuan: SATUAN_DARI_DB[row.unit],
    stok,
    minPembelian: angka(row.min_order_qty),
    deskripsi: row.description ?? '',
    tag: h.tags.map((t) => TAG_DARI_DB[t]).filter((t): t is NonNullable<typeof t> => t !== undefined),
    tanggalPanen: row.harvested_on ?? '',
    tanggalKedaluwarsa: row.expires_on ?? '',
    fotoStok: h.photos.map((f) => ({
      src: srcFoto(f.public_id),
      diunggah: f.uploaded_on,
      keterangan: f.caption ?? '',
    })),
    hargaGrosir: [
      { minJumlah: 1, harga },
      ...h.tiers.map((t) => ({ minJumlah: angka(t.min_qty), harga: rupiah(t.unit_price) })),
    ],
    aturanSurplus: h.rules.map((r) => ({ sisaHari: r.days_remaining, diskonPersen: angka(r.discount_pct) })),
    hargaMinimumSurplus: row.surplus_floor_price === null ? null : rupiah(row.surplus_floor_price),
    rating: angka(row.rating_avg),
    jumlahUlasan: row.rating_count,
    terjual: angka(row.sold_qty),
    pelanggan: row.subscriber_count,
    dibuat: tanggalJakarta(row.created_at),
    petani,
    namaKategori: row.category_name,
    ikonKategori: ikonDariKategori(row.category_slug),
    sisaHari: row.days_left ?? 0,
    surplusAktif: surplus,
    hargaEfektif: surplus?.hargaSurplus ?? harga,
    habis: stok <= 0,
    jarakKm,
  };
}

/** Distance in km, one decimal, as the catalog shows it. Null when no origin or no pin. */
export function jarakKmDari(meter: number | null): number | null {
  if (meter === null || meter === undefined) return null;
  return Math.round(meter / 100) / 10;
}
