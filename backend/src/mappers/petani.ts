import type { Lencana, Petani, PetaniTampil } from '../contract/tipe';
import type { FarmerCardRow } from '../repo/farmers/farmer-read.repo';
import { LENCANA_DARI_BADGE } from './enum';
import { angka, jamOperasional, koordinat, tanggalJakarta } from './util';

/** Badge codes to public badge names, dropping codes the contract does not show. */
export function lencanaDari(codes: string[]): Lencana[] {
  return codes.map((c) => LENCANA_DARI_BADGE[c]).filter((l): l is Lencana => l !== undefined);
}

export interface PetaniHidrasi {
  lencana: string[];
  komoditas: string[];
  jam: { weekday: number; opens_at: string; closes_at: string }[];
  libur: string | null;
}

export const KOSONG_PETANI_HIDRASI: PetaniHidrasi = { lencana: [], komoditas: [], jam: [], libur: null };

/** Farmer in the contract shape. Distance comes from the service, so this stays a plain transform. */
export function petaniTampil(row: FarmerCardRow, h: PetaniHidrasi): PetaniTampil {
  const lokasi = koordinat(row.lat, row.lng);
  const petani: Petani = {
    id: row.id,
    nama: row.owner_name,
    namaToko: row.shop_name,
    kabupaten: row.regency_slug,
    kecamatan: row.district_name,
    deskripsi: '',
    bergabung: tanggalJakarta(row.created_at),
    lencana: lencanaDari(h.lencana),
    rating: angka(row.rating_avg),
    jumlahUlasan: row.rating_count,
    jumlahTransaksi: row.completed_order_count,
    komoditas: h.komoditas,
    lokasi,
    responMenit: row.avg_response_minutes ?? 0,
    luasLahanHa: angka(row.land_area_ha),
    jamOperasional: jamOperasional(h.jam),
    libur: h.libur,
  };
  return {
    ...petani,
    labelWilayah: row.regency_name,
    jumlahProduk: row.product_count,
    jumlahDaftarTunggu: row.waitlist_count,
    jarakKm: null,
  };
}
