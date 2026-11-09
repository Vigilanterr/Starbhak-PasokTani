/**
 * API katalog publik. Setiap fungsi membaca backend (`/api/v1`) lewat `BACKEND_INTERNAL_URL`, binding
 * antar-service di Vercel. Pembacaan tidak di-cache dan hanya terjadi saat permintaan (di dalam Suspense),
 * jadi `next build` tidak memanggil backend. Cache dapat ditambahkan nanti tanpa mengubah pemanggil.
 *
 * Bentuk data mengikuti `tipe.ts`. Surplus, jarak, dan pencarian fuzzy dihitung di backend.
 */

import { connection } from "next/server";
import { TANGGAL_ACUAN } from "./acuan";
import type {
  DaftarTungguTampil,
  FilterProduk,
  HasilCari,
  HasilHalaman,
  Kategori,
  Koordinat,
  Lencana,
  PetaniTampil,
  ProdukTampil,
  StatusDaftarTunggu,
  Ulasan,
} from "./tipe";

export { TANGGAL_ACUAN };
export { TITIK_DEFAULT, awalPanen, labelWilayah } from "./bersama";

/** Ukuran halaman default katalog produk. Sama dengan backend. */
const PER_HALAMAN = 12;
/** Batas wajar untuk daftar tanpa paging di UI (petani dan daftar tunggu). */
const BATAS_DAFTAR = 60;

export type RingkasanUlasan = {
  rata: number;
  total: number;
  /** Jumlah ulasan per bintang, indeks 0 = bintang 1. */
  sebaran: [number, number, number, number, number];
  denganFoto: number;
};

export type FilterPetani = {
  q?: string;
  kabupaten?: string;
  lencana?: Lencana;
  urut?: "rating" | "transaksi" | "terbaru" | "terdekat";
  titik?: Koordinat;
};

export type FilterDaftarTunggu = {
  status?: StatusDaftarTunggu;
  kategori?: string;
  kabupaten?: string;
  /** Hanya yang masih bisa dikomitmen (belum penuh, belum gagal/siap). */
  bisaKomitmen?: boolean;
  urut?: "populer" | "panen-terdekat" | "terbaru";
};

// ---------------------------------------------------------------------------
// Pemanggil backend
// ---------------------------------------------------------------------------

type Parameter = Record<string, string | number | boolean | undefined>;

function alamat(path: string, parameter?: Parameter): string {
  const dasar = process.env.BACKEND_INTERNAL_URL;
  if (!dasar) throw new Error("BACKEND_INTERNAL_URL belum diatur");
  const url = new URL(`/api/v1${path}`, dasar);
  for (const [k, v] of Object.entries(parameter ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  return url.toString();
}

/**
 * Data dari backend. Status di `kosongJika` (404 untuk detail, dan 400 untuk id yang bentuknya salah) menjadi
 * `null`. Kegagalan lain dilempar.
 */
async function ambil<T>(path: string, parameter?: Parameter, kosongJika: number[] = [404]): Promise<T | null> {
  // Permintaan saat runtime saja: membuat pemanggilan ditunda saat prerender, dan BACKEND_INTERNAL_URL baru ada saat runtime.
  await connection();
  const res = await fetch(alamat(path, parameter), { cache: "no-store" });
  if (kosongJika.includes(res.status)) return null;
  const json = (await res.json()) as { success: boolean; data?: T; error?: { message: string } };
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error?.message ?? `Backend menjawab ${res.status}`);
  }
  return json.data;
}

/** Filter produk ke parameter kueri backend. `titik` menjadi `lat` dan `lng`. */
function parameterProduk(f: FilterProduk): Parameter {
  return {
    kategori: f.kategori,
    kabupaten: f.kabupaten,
    organik: f.organik,
    surplus: f.surplus,
    tersedia: f.tersedia,
    petaniId: f.petaniId,
    hargaMin: f.hargaMin,
    hargaMax: f.hargaMax,
    lat: f.titik?.lat,
    lng: f.titik?.lng,
    radiusKm: f.radiusKm,
    urut: f.urut,
    halaman: f.halaman,
    perHalaman: f.perHalaman ?? PER_HALAMAN,
  };
}

// ---------------------------------------------------------------------------
// Kategori
// ---------------------------------------------------------------------------

export async function ambilKategori(): Promise<(Kategori & { jumlahProduk: number })[]> {
  return (await ambil<(Kategori & { jumlahProduk: number })[]>("/categories")) ?? [];
}

export async function ambilKategoriBySlug(slug: string): Promise<Kategori | null> {
  return ambil<Kategori>(`/categories/${encodeURIComponent(slug)}`, undefined, [400, 404]);
}

// ---------------------------------------------------------------------------
// Produk
// ---------------------------------------------------------------------------

/** Daftar produk dengan filter, urutan, dan halaman (`/produk`, `/surplus`, `/kategori/[slug]`). */
export async function ambilProduk(f: FilterProduk = {}): Promise<HasilHalaman<ProdukTampil>> {
  const hasil = await ambil<HasilHalaman<ProdukTampil>>("/products", parameterProduk(f));
  return hasil ?? { item: [], total: 0, halaman: 1, jumlahHalaman: 1 };
}

/** Pencarian (`/cari?q=`): toleran salah ketik, sinonim, dan nama daerah (S3). */
export async function cariProduk(q: string, f: FilterProduk = {}): Promise<HasilCari> {
  const hasil = await ambil<HasilCari>("/search", { q, ...parameterProduk(f) });
  return hasil ?? { item: [], total: 0, halaman: 1, jumlahHalaman: 1, dimaknai: null, saran: [] };
}

export async function ambilProdukBySlug(slug: string): Promise<ProdukTampil | null> {
  return ambil<ProdukTampil>(`/products/${encodeURIComponent(slug)}`, undefined, [400, 404]);
}

/** Produk lain dari kategori yang sama (detail produk). */
export async function ambilProdukTerkait(produk: Pick<ProdukTampil, "id">, jumlah = 4): Promise<ProdukTampil[]> {
  const hasil = await ambil<ProdukTampil[]>(`/products/${produk.id}/related`, undefined, [400, 404]);
  return (hasil ?? []).slice(0, jumlah);
}

// ---------------------------------------------------------------------------
// Ulasan
// ---------------------------------------------------------------------------

export async function ambilUlasanProduk(produkId: string): Promise<{ item: Ulasan[]; ringkasan: RingkasanUlasan }> {
  const hasil = await ambil<{ item: Ulasan[]; ringkasan: RingkasanUlasan }>(`/products/${produkId}/reviews`, undefined, [400, 404]);
  return hasil ?? { item: [], ringkasan: { rata: 0, total: 0, sebaran: [0, 0, 0, 0, 0], denganFoto: 0 } };
}

export async function ambilUlasanPetani(
  petaniId: string,
  jumlah?: number,
): Promise<{ item: (Ulasan & { namaProduk: string; slugProduk: string })[]; ringkasan: RingkasanUlasan }> {
  const hasil = await ambil<{ item: (Ulasan & { namaProduk: string; slugProduk: string })[]; ringkasan: RingkasanUlasan }>(
    `/farmers/${petaniId}/reviews`,
    undefined,
    [400, 404],
  );
  const kosong = { item: [], ringkasan: { rata: 0, total: 0, sebaran: [0, 0, 0, 0, 0] as RingkasanUlasan["sebaran"], denganFoto: 0 } };
  if (!hasil) return kosong;
  return { item: hasil.item.slice(0, jumlah ?? hasil.item.length), ringkasan: hasil.ringkasan };
}

// ---------------------------------------------------------------------------
// Petani
// ---------------------------------------------------------------------------

/** Direktori petani. Mengembalikan satu halaman (paling banyak 60), tanpa kontrol halaman di UI. */
export async function ambilPetani(f: FilterPetani = {}): Promise<PetaniTampil[]> {
  const hasil = await ambil<HasilHalaman<PetaniTampil>>("/farmers", {
    q: f.q,
    kabupaten: f.kabupaten,
    lencana: f.lencana,
    urut: f.urut,
    lat: f.titik?.lat,
    lng: f.titik?.lng,
    perHalaman: BATAS_DAFTAR,
  });
  return hasil?.item ?? [];
}

export async function ambilPetaniById(id: string): Promise<PetaniTampil | null> {
  return ambil<PetaniTampil>(`/farmers/${id}`, undefined, [400, 404]);
}

/** Produk dan daftar tunggu milik satu petani (profil petani). */
export async function ambilKatalogPetani(
  petaniId: string,
): Promise<{ produk: ProdukTampil[]; daftarTunggu: DaftarTungguTampil[] }> {
  const [produk, daftarTunggu] = await Promise.all([
    ambil<ProdukTampil[]>(`/farmers/${petaniId}/products`, undefined, [400, 404]),
    ambil<DaftarTungguTampil[]>(`/farmers/${petaniId}/waitlists`, undefined, [400, 404]),
  ]);
  return { produk: produk ?? [], daftarTunggu: daftarTunggu ?? [] };
}

// ---------------------------------------------------------------------------
// Daftar Tunggu
// ---------------------------------------------------------------------------

export async function ambilDaftarTunggu(f: FilterDaftarTunggu = {}): Promise<DaftarTungguTampil[]> {
  const hasil = await ambil<HasilHalaman<DaftarTungguTampil>>("/waitlists", {
    status: f.status,
    kategori: f.kategori,
    kabupaten: f.kabupaten,
    bisaKomitmen: f.bisaKomitmen,
    urut: f.urut,
    perHalaman: BATAS_DAFTAR,
  });
  return hasil?.item ?? [];
}

export async function ambilDaftarTungguById(id: string): Promise<DaftarTungguTampil | null> {
  return ambil<DaftarTungguTampil>(`/waitlists/${id}`, undefined, [400, 404]);
}

// ---------------------------------------------------------------------------
// Beranda
// ---------------------------------------------------------------------------

export type Beranda = {
  terlaris: ProdukTampil[];
  baruPanen: ProdukTampil[];
  surplus: ProdukTampil[];
  daftarTungguPopuler: DaftarTungguTampil[];
  kategori: (Kategori & { jumlahProduk: number })[];
  statistik: { petani: number; produk: number; wilayah: number; daftarTunggu: number };
};

export async function ambilBeranda(): Promise<Beranda> {
  const hasil = await ambil<Beranda>("/home");
  if (!hasil) throw new Error("Data beranda tidak tersedia dari backend");
  return hasil;
}
