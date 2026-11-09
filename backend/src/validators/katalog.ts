import { z } from 'zod';
import { PER_HALAMAN_DEFAULT, PER_HALAMAN_MAKS } from '../services/katalog.service';

/**
 * Query strings for the public catalog. Numbers arrive as text and are coerced. Booleans are the text
 * "true" or "false". Each schema matches the filter names of the contract (`FilterProduk` and friends).
 */

const bool = z.enum(['true', 'false']).transform((v) => v === 'true');
const teksPendek = (max: number) => z.string().trim().min(1).max(max);
const uuid = z.string().uuid();

const halaman = z.coerce.number().int().min(1).max(10_000).default(1);
const perHalaman = z.coerce.number().int().min(1).max(PER_HALAMAN_MAKS).default(PER_HALAMAN_DEFAULT);

const titikDari = (v: { lat?: number; lng?: number }) =>
  v.lat !== undefined && v.lng !== undefined ? { lat: v.lat, lng: v.lng } : undefined;

const lat = z.coerce.number().min(-90).max(90).optional();
const lng = z.coerce.number().min(-180).max(180).optional();

const URUTAN_PRODUK = ['relevan', 'terlaris', 'terbaru', 'harga-asc', 'harga-desc', 'rating', 'terdekat'] as const;

const filterProduk = {
  kategori: teksPendek(60).optional(),
  kabupaten: teksPendek(60).optional(),
  organik: bool.optional(),
  surplus: bool.optional(),
  tersedia: bool.optional(),
  petaniId: uuid.optional(),
  hargaMin: z.coerce.number().int().min(0).optional(),
  hargaMax: z.coerce.number().int().min(0).optional(),
  lat,
  lng,
  radiusKm: z.coerce.number().positive().max(500).optional(),
  halaman,
  perHalaman,
};

export const produkQuery = z
  .object({ ...filterProduk, urut: z.enum(URUTAN_PRODUK).optional() })
  .transform(({ lat: la, lng: ln, ...rest }) => ({ ...rest, titik: titikDari({ lat: la, lng: ln }) }));

export const cariQuery = z
  .object({
    q: teksPendek(100),
    ...filterProduk,
    urut: z.enum(URUTAN_PRODUK).optional(),
  })
  .transform(({ lat: la, lng: ln, q, ...rest }) => ({ ...rest, teks: q, titik: titikDari({ lat: la, lng: ln }) }));

export const petaniQuery = z
  .object({
    q: teksPendek(100).optional(),
    kabupaten: teksPendek(60).optional(),
    lencana: z.enum(['petani-baru', 'terverifikasi', 'petani-andalan', 'respons-cepat', 'stok-selalu-baru', 'panen-tepat-waktu', 'pahlawan-surplus']).optional(),
    urut: z.enum(['rating', 'transaksi', 'terbaru', 'terdekat']).optional(),
    lat,
    lng,
    halaman,
    perHalaman,
  })
  .transform(({ lat: la, lng: ln, ...rest }) => ({ ...rest, titik: titikDari({ lat: la, lng: ln }) }));

export const daftarTungguQuery = z.object({
  status: z.enum(['jadwal-tanam', 'sudah-tanam', 'panen-tertunda', 'panen-lebih-awal', 'gagal-panen', 'siap-panen']).optional(),
  kategori: teksPendek(60).optional(),
  kabupaten: teksPendek(60).optional(),
  bisaKomitmen: bool.optional(),
  urut: z.enum(['populer', 'panen-terdekat', 'terbaru']).optional(),
  halaman,
  perHalaman,
});

export const idParam = uuid;
export const slugParam = teksPendek(120);
