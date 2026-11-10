import type { DaftarTungguTampil, HasilHalaman, Lencana, PetaniTampil, ProdukTampil } from '../contract/tipe';
import { notFound } from '../lib/app-error';
import { badgeDariLencana } from '../mappers/enum';
import { petaniTampil } from '../mappers/petani';
import { ringkasanDari, ulasanTampil } from '../mappers/ulasan';
import { hidrasiPetani } from './hidrasi';
import { tampilkanProduk, TITIK_DEFAULT } from './katalog.service';
import { daftarTungguPetani } from './daftar-tunggu.service';
import type { Executor } from '../repo/executor';
import {
  findFarmerPublic, listFarmerDirectory, type DirectorySort, type FarmerCardRow,
} from '../repo/farmers/farmer-read.repo';
import { listPublicReviews, summarizePublicReviews } from '../repo/feedback/review-read.repo';
import { listCatalogCards } from '../repo/catalog/catalog-read.repo';
import { jarakKmDari } from '../mappers/produk';

export interface PetaniQuery {
  q?: string;
  kabupaten?: string;
  lencana?: Lencana;
  urut?: 'rating' | 'transaksi' | 'terbaru' | 'terdekat';
  titik?: { lat: number; lng: number };
  halaman: number;
  perHalaman: number;
}

/** Farmers as cards. Distance is computed only when there is an origin. */
async function tampilkanPetani(db: Executor, rows: FarmerCardRow[], titik?: { lat: number; lng: number }): Promise<PetaniTampil[]> {
  if (rows.length === 0) return [];
  const hidrasi = await hidrasiPetani(db, rows.map((r) => r.id));
  return rows.map((r) => {
    const item = petaniTampil(r, hidrasi.get(r.id)!);
    return { ...item, jarakKm: titik ? jarakKmDari(r.distance_m) : null };
  });
}

export async function daftarPetani(db: Executor, q: PetaniQuery): Promise<HasilHalaman<PetaniTampil>> {
  const sort: DirectorySort = q.urut ?? 'rating';
  const titik = q.titik ?? (sort === 'terdekat' ? TITIK_DEFAULT : undefined);
  const badge = q.lencana ? badgeDariLencana(q.lencana) : undefined;
  if (q.lencana && !badge) return { item: [], total: 0, halaman: 1, jumlahHalaman: 1 };
  const page = (halaman: number) => listFarmerDirectory(db, {
    filter: { q: q.q, regencySlug: q.kabupaten, badgeCode: badge, near: titik },
    sort,
    page: halaman,
    perPage: q.perHalaman,
  });

  let halaman = q.halaman;
  let rows = await page(halaman);
  if (rows.length === 0 && halaman > 1) {
    halaman = 1;
    rows = await page(1);
  }
  const total = rows[0]?.total ?? 0;
  return {
    item: await tampilkanPetani(db, rows, titik),
    total,
    halaman,
    jumlahHalaman: Math.max(1, Math.ceil(total / q.perHalaman)),
  };
}

/** One approved farmer. Anything else is not found. */
export async function detailPetani(db: Executor, id: string): Promise<PetaniTampil> {
  const row = await findFarmerPublic(db, id);
  if (!row) throw notFound('Petani');
  const [item] = await tampilkanPetani(db, [row]);
  return item!;
}

/** Live products of one farmer, best sellers first, sold-out last. */
export async function produkPetani(db: Executor, id: string): Promise<ProdukTampil[]> {
  const row = await findFarmerPublic(db, id);
  if (!row) throw notFound('Petani');
  const rows = await listCatalogCards(db, { filter: { farmerId: id }, sort: 'terlaris', page: 1, perPage: 60 });
  return tampilkanProduk(db, rows);
}

/** Open wait lists of one farmer. */
export async function daftarTungguPetaniPublik(db: Executor, id: string): Promise<DaftarTungguTampil[]> {
  const row = await findFarmerPublic(db, id);
  if (!row) throw notFound('Petani');
  return daftarTungguPetani(db, id);
}

/** Latest published reviews of the farmer, with the product each one is for, and the summary. */
export async function ulasanPetani(db: Executor, id: string) {
  const row = await findFarmerPublic(db, id);
  if (!row) throw notFound('Petani');
  const [rows, ringkas] = await Promise.all([
    listPublicReviews(db, { by: 'farmer', id, limit: 50 }),
    summarizePublicReviews(db, { by: 'farmer', id }),
  ]);
  return {
    item: rows.map((r) => ({
      ...ulasanTampil(r),
      namaProduk: r.product_name,
      slugProduk: r.product_slug,
    })),
    ringkasan: ringkasanDari(ringkas),
  };
}

