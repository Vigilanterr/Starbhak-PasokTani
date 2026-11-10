/**
 * API katalog publik (SEMENTARA): membaca data tiruan dari `src/data/*.json`.
 *
 * TODO: ganti isi setiap fungsi dengan `fetch` ke backend. Tanda tangan fungsi dan tipe
 * kembaliannya sengaja dibuat async agar halaman tidak perlu diubah saat backend tersedia.
 * Perhitungan Surplus, jarak, dan pencarian fuzzy nantinya dilakukan di backend.
 */

import daftarTungguJson from "@/data/daftar-tunggu.json";
import kategoriJson from "@/data/kategori.json";
import petaniJson from "@/data/petani.json";
import produkJson from "@/data/produk.json";
import ulasanJson from "@/data/ulasan.json";
import { WILAYAH_JAWA_BARAT } from "@/lib/wilayah";
import { selisihHari } from "@/lib/format";
import { TANGGAL_ACUAN } from "./acuan";
import { cocokkan, normal } from "./fuzzy";
import type {
  DaftarTunggu,
  DaftarTungguTampil,
  FilterProduk,
  HasilCari,
  HasilHalaman,
  Kategori,
  Koordinat,
  Lencana,
  Petani,
  PetaniTampil,
  Produk,
  ProdukTampil,
  RingkasPetani,
  StatusDaftarTunggu,
  SurplusAktif,
  Ulasan,
} from "./tipe";

// JSON diketik longgar oleh TypeScript; bentuknya dijaga oleh tipe di `tipe.ts`.
const KATEGORI = kategoriJson as unknown as Kategori[];
const PETANI = petaniJson as unknown as Petani[];
const PRODUK = produkJson as unknown as Produk[];
const ULASAN = ulasanJson as unknown as Ulasan[];
const DAFTAR_TUNGGU = daftarTungguJson as unknown as DaftarTunggu[];

export { TANGGAL_ACUAN };

/** Titik acuan default "dekat saya": pusat Kota Bandung. */
export const TITIK_DEFAULT: Koordinat = { lat: -6.9175, lng: 107.6191 };

const PER_HALAMAN = 12;

// ---------------------------------------------------------------------------
// Utilitas internal
// ---------------------------------------------------------------------------

export function labelWilayah(nilai: string): string {
  return WILAYAH_JAWA_BARAT.find((w) => w.nilai === nilai)?.label ?? nilai;
}

function jarakKm(a: Koordinat, b: Koordinat): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

function kategoriDari(slug: string): Kategori {
  return KATEGORI.find((k) => k.slug === slug) ?? { slug, nama: slug, deskripsi: "", ikon: "sayuran" };
}

function ringkasPetani(id: string): RingkasPetani {
  const p = PETANI.find((x) => x.id === id);
  if (!p) throw new Error(`Petani ${id} tidak ditemukan di data tiruan`);
  const { nama, namaToko, kabupaten, kecamatan, lencana, rating, lokasi } = p;
  return { id, nama, namaToko, kabupaten, kecamatan, lencana, rating, lokasi, labelWilayah: labelWilayah(kabupaten) };
}

function hitungSurplus(p: Produk, sisaHari: number): SurplusAktif | null {
  if (p.stok <= 0 || sisaHari < 0 || p.aturanSurplus.length === 0) return null;
  // Aturan dengan ambang terkecil yang masih terpenuhi = diskon terbesar.
  const berlaku = p.aturanSurplus
    .filter((a) => sisaHari <= a.sisaHari)
    .sort((a, b) => a.sisaHari - b.sisaHari)[0];
  if (!berlaku) return null;
  const harga = Math.round((p.harga * (100 - berlaku.diskonPersen)) / 100 / 100) * 100;
  return {
    diskonPersen: berlaku.diskonPersen,
    hargaSurplus: Math.max(harga, p.hargaMinimumSurplus ?? 0),
  };
}

function tampilkanProduk(p: Produk, titik?: Koordinat): ProdukTampil {
  const petani = ringkasPetani(p.petaniId);
  const kategori = kategoriDari(p.kategori);
  const sisaHari = selisihHari(TANGGAL_ACUAN, p.tanggalKedaluwarsa);
  // Batch yang lewat kedaluwarsa mengurangi stok publik (S7): produk tetap tampil sebagai Habis.
  const stok = sisaHari < 0 ? 0 : p.stok;
  const surplusAktif = hitungSurplus({ ...p, stok }, sisaHari);
  return {
    ...p,
    stok,
    petani,
    namaKategori: kategori.nama,
    ikonKategori: kategori.ikon,
    sisaHari,
    surplusAktif,
    hargaEfektif: surplusAktif?.hargaSurplus ?? p.harga,
    habis: stok <= 0,
    jarakKm: titik ? jarakKm(titik, petani.lokasi) : null,
  };
}

function tampilkanDaftarTunggu(d: DaftarTunggu): DaftarTungguTampil {
  const kategori = kategoriDari(d.kategori);
  const persenKuota = d.kuota ? Math.min(100, Math.round((d.terkomitmen / d.kuota) * 100)) : null;
  return {
    ...d,
    petani: ringkasPetani(d.petaniId),
    namaKategori: kategori.nama,
    ikonKategori: kategori.ikon,
    persenKuota,
    kuotaPenuh: d.kuota !== null && d.terkomitmen >= d.kuota,
  };
}

function tampilkanPetani(p: Petani, titik?: Koordinat): PetaniTampil {
  return {
    ...p,
    labelWilayah: labelWilayah(p.kabupaten),
    jumlahProduk: PRODUK.filter((x) => x.petaniId === p.id).length,
    jumlahDaftarTunggu: DAFTAR_TUNGGU.filter((x) => x.petaniId === p.id && x.status !== "siap-panen").length,
    jarakKm: titik ? jarakKm(titik, p.lokasi) : null,
  };
}

function halamankan<T>(semua: T[], halaman = 1, perHalaman = PER_HALAMAN): HasilHalaman<T> {
  const jumlahHalaman = Math.max(1, Math.ceil(semua.length / perHalaman));
  const h = Math.min(Math.max(1, halaman), jumlahHalaman);
  return { item: semua.slice((h - 1) * perHalaman, h * perHalaman), total: semua.length, halaman: h, jumlahHalaman };
}

function saringDanUrutkan(daftar: ProdukTampil[], f: FilterProduk, skor?: Map<string, number>): ProdukTampil[] {
  let hasil = daftar.filter((p) => {
    if (f.kategori && p.kategori !== f.kategori) return false;
    if (f.kabupaten && p.petani.kabupaten !== f.kabupaten) return false;
    if (f.organik && !p.tag.includes("organik")) return false;
    if (f.surplus && !p.surplusAktif) return false;
    if (f.tersedia && p.habis) return false;
    if (f.petaniId && p.petaniId !== f.petaniId) return false;
    if (f.hargaMin !== undefined && p.hargaEfektif < f.hargaMin) return false;
    if (f.hargaMax !== undefined && p.hargaEfektif > f.hargaMax) return false;
    if (f.radiusKm !== undefined && p.jarakKm !== null && p.jarakKm > f.radiusKm) return false;
    return true;
  });

  const urut = f.urut ?? (skor ? "relevan" : "terlaris");
  const banding: Record<NonNullable<FilterProduk["urut"]>, (a: ProdukTampil, b: ProdukTampil) => number> = {
    relevan: (a, b) => (skor?.get(b.id) ?? 0) - (skor?.get(a.id) ?? 0) || b.terjual - a.terjual,
    terlaris: (a, b) => b.terjual - a.terjual,
    terbaru: (a, b) => b.tanggalPanen.localeCompare(a.tanggalPanen) || b.terjual - a.terjual,
    "harga-asc": (a, b) => a.hargaEfektif - b.hargaEfektif,
    "harga-desc": (a, b) => b.hargaEfektif - a.hargaEfektif,
    rating: (a, b) => b.rating - a.rating || b.jumlahUlasan - a.jumlahUlasan,
    terdekat: (a, b) => (a.jarakKm ?? 0) - (b.jarakKm ?? 0),
  };
  hasil = [...hasil].sort(banding[urut]);
  // Produk habis tetap tampil, tetapi di urutan bawah.
  return hasil.sort((a, b) => Number(a.habis) - Number(b.habis));
}

// ---------------------------------------------------------------------------
// Kategori
// ---------------------------------------------------------------------------

export async function ambilKategori(): Promise<(Kategori & { jumlahProduk: number })[]> {
  return KATEGORI.map((k) => ({ ...k, jumlahProduk: PRODUK.filter((p) => p.kategori === k.slug).length }));
}

export async function ambilKategoriBySlug(slug: string): Promise<Kategori | null> {
  return KATEGORI.find((k) => k.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Produk
// ---------------------------------------------------------------------------

/** Daftar produk dengan filter, urutan, dan halaman (`/produk`, `/surplus`, `/kategori/[slug]`). */
export async function ambilProduk(f: FilterProduk = {}): Promise<HasilHalaman<ProdukTampil>> {
  const titik = f.titik ?? (f.urut === "terdekat" || f.radiusKm !== undefined ? TITIK_DEFAULT : undefined);
  const semua = PRODUK.map((p) => tampilkanProduk(p, titik));
  return halamankan(saringDanUrutkan(semua, { ...f, titik }), f.halaman, f.perHalaman);
}

/** Pencarian fuzzy (`/cari?q=`): toleran salah ketik dan nama daerah (S3). */
export async function cariProduk(q: string, f: FilterProduk = {}): Promise<HasilCari> {
  const titik = f.titik ?? (f.urut === "terdekat" || f.radiusKm !== undefined ? TITIK_DEFAULT : undefined);
  const kueri = normal(q);
  if (!kueri) return { ...halamankan<ProdukTampil>([]), dimaknai: null, saran: [] };

  const skor = new Map<string, number>();
  let dimaknai: string | null = null;
  for (const p of PRODUK) {
    const kategori = kategoriDari(p.kategori);
    const petani = PETANI.find((x) => x.id === p.petaniId);
    const hasil = cocokkan(kueri, [p.nama, ...p.namaLain], [kategori.nama, petani?.namaToko ?? ""]);
    if (hasil) {
      skor.set(p.id, hasil.skor);
      if (!dimaknai && hasil.dimaknai) dimaknai = hasil.dimaknai;
    }
  }

  const cocok = PRODUK.filter((p) => skor.has(p.id)).map((p) => tampilkanProduk(p, titik));
  const urut = saringDanUrutkan(cocok, { ...f, titik }, skor);
  const saran =
    urut.length === 0
      ? [...PRODUK].sort((a, b) => b.terjual - a.terjual).slice(0, 5).map((p) => p.nama.split(" ").slice(0, 2).join(" "))
      : [];
  return { ...halamankan(urut, f.halaman, f.perHalaman), dimaknai, saran: [...new Set(saran)] };
}

export async function ambilProdukBySlug(slug: string): Promise<ProdukTampil | null> {
  const p = PRODUK.find((x) => x.slug === slug);
  return p ? tampilkanProduk(p) : null;
}

/** Untuk `generateStaticParams`. */
export async function ambilSemuaSlugProduk(): Promise<string[]> {
  return PRODUK.map((p) => p.slug);
}

/** Produk lain dari kategori yang sama (detail produk). */
export async function ambilProdukTerkait(produk: Pick<Produk, "id" | "kategori">, jumlah = 4): Promise<ProdukTampil[]> {
  return PRODUK.filter((p) => p.kategori === produk.kategori && p.id !== produk.id)
    .map((p) => tampilkanProduk(p))
    .sort((a, b) => Number(a.habis) - Number(b.habis) || b.terjual - a.terjual)
    .slice(0, jumlah);
}

// ---------------------------------------------------------------------------
// Ulasan
// ---------------------------------------------------------------------------

export type RingkasanUlasan = {
  rata: number;
  total: number;
  /** Jumlah ulasan per bintang, indeks 0 = bintang 1. */
  sebaran: [number, number, number, number, number];
  denganFoto: number;
};

function ringkas(daftar: Ulasan[]): RingkasanUlasan {
  const sebaran: RingkasanUlasan["sebaran"] = [0, 0, 0, 0, 0];
  for (const u of daftar) sebaran[u.bintang - 1] = (sebaran[u.bintang - 1] ?? 0) + 1;
  const total = daftar.length;
  const rata = total ? Math.round((daftar.reduce((s, u) => s + u.bintang, 0) / total) * 10) / 10 : 0;
  return { rata, total, sebaran, denganFoto: daftar.filter((u) => u.adaFoto).length };
}

export async function ambilUlasanProduk(produkId: string): Promise<{ item: Ulasan[]; ringkasan: RingkasanUlasan }> {
  const item = ULASAN.filter((u) => u.produkId === produkId).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  return { item, ringkasan: ringkas(item) };
}

export async function ambilUlasanPetani(
  petaniId: string,
  jumlah?: number,
): Promise<{ item: (Ulasan & { namaProduk: string; slugProduk: string })[]; ringkasan: RingkasanUlasan }> {
  const semua = ULASAN.filter((u) => u.petaniId === petaniId).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const item = semua.slice(0, jumlah ?? semua.length).map((u) => {
    const p = PRODUK.find((x) => x.id === u.produkId);
    return { ...u, namaProduk: p?.nama ?? "", slugProduk: p?.slug ?? "" };
  });
  return { item, ringkasan: ringkas(semua) };
}

// ---------------------------------------------------------------------------
// Petani
// ---------------------------------------------------------------------------

export type FilterPetani = {
  q?: string;
  kabupaten?: string;
  lencana?: Lencana;
  urut?: "rating" | "transaksi" | "terbaru" | "terdekat";
  titik?: Koordinat;
};

export async function ambilPetani(f: FilterPetani = {}): Promise<PetaniTampil[]> {
  const titik = f.titik ?? (f.urut === "terdekat" ? TITIK_DEFAULT : undefined);
  const kueri = f.q ? normal(f.q) : "";
  const hasil = PETANI.filter((p) => {
    if (f.kabupaten && p.kabupaten !== f.kabupaten) return false;
    if (f.lencana && !p.lencana.includes(f.lencana)) return false;
    if (kueri && !cocokkan(kueri, [p.namaToko, p.nama, ...p.komoditas], [p.kecamatan, labelWilayah(p.kabupaten)]))
      return false;
    return true;
  }).map((p) => tampilkanPetani(p, titik));

  const urut = f.urut ?? "rating";
  return hasil.sort((a, b) => {
    if (urut === "transaksi") return b.jumlahTransaksi - a.jumlahTransaksi;
    if (urut === "terbaru") return b.bergabung.localeCompare(a.bergabung);
    if (urut === "terdekat") return (a.jarakKm ?? 0) - (b.jarakKm ?? 0);
    return b.rating - a.rating || b.jumlahUlasan - a.jumlahUlasan;
  });
}

export async function ambilPetaniById(id: string): Promise<PetaniTampil | null> {
  const p = PETANI.find((x) => x.id === id);
  return p ? tampilkanPetani(p) : null;
}

export async function ambilSemuaIdPetani(): Promise<string[]> {
  return PETANI.map((p) => p.id);
}

/** Produk dan daftar tunggu milik satu petani (profil petani). */
export async function ambilKatalogPetani(
  petaniId: string,
): Promise<{ produk: ProdukTampil[]; daftarTunggu: DaftarTungguTampil[] }> {
  return {
    produk: PRODUK.filter((p) => p.petaniId === petaniId)
      .map((p) => tampilkanProduk(p))
      .sort((a, b) => Number(a.habis) - Number(b.habis) || b.terjual - a.terjual),
    daftarTunggu: DAFTAR_TUNGGU.filter((d) => d.petaniId === petaniId && d.status !== "siap-panen").map(
      tampilkanDaftarTunggu,
    ),
  };
}

// ---------------------------------------------------------------------------
// Daftar Tunggu
// ---------------------------------------------------------------------------

export type FilterDaftarTunggu = {
  status?: StatusDaftarTunggu;
  kategori?: string;
  kabupaten?: string;
  /** Hanya yang masih bisa dikomitmen (belum penuh, belum gagal/siap). */
  bisaKomitmen?: boolean;
  urut?: "populer" | "panen-terdekat" | "terbaru";
};

/** Tanggal paling awal dari jadwal panen, untuk pengurutan. `null` bila belum ada perkiraan. */
export function awalPanen(d: Pick<DaftarTunggu, "jadwalPanen">): string | null {
  const j = d.jadwalPanen;
  if (j.jenis === "tanggal") return j.tanggal;
  if (j.jenis === "rentang") return j.mulai;
  return null;
}

export async function ambilDaftarTunggu(f: FilterDaftarTunggu = {}): Promise<DaftarTungguTampil[]> {
  const hasil = DAFTAR_TUNGGU.map(tampilkanDaftarTunggu).filter((d) => {
    if (f.status && d.status !== f.status) return false;
    if (f.kategori && d.kategori !== f.kategori) return false;
    if (f.kabupaten && d.petani.kabupaten !== f.kabupaten) return false;
    if (f.bisaKomitmen && (d.kuotaPenuh || d.status === "gagal-panen" || d.status === "siap-panen")) return false;
    return true;
  });
  const urut = f.urut ?? "populer";
  return hasil.sort((a, b) => {
    if (urut === "terbaru") return b.dibuat.localeCompare(a.dibuat);
    if (urut === "panen-terdekat") {
      const x = awalPanen(a) ?? "9999";
      const y = awalPanen(b) ?? "9999";
      return x.localeCompare(y);
    }
    return b.pengikut - a.pengikut;
  });
}

export async function ambilDaftarTungguById(id: string): Promise<DaftarTungguTampil | null> {
  const d = DAFTAR_TUNGGU.find((x) => x.id === id);
  return d ? tampilkanDaftarTunggu(d) : null;
}

export async function ambilSemuaIdDaftarTunggu(): Promise<string[]> {
  return DAFTAR_TUNGGU.map((d) => d.id);
}

// ---------------------------------------------------------------------------
// Beranda
// ---------------------------------------------------------------------------

export async function ambilBeranda() {
  const semua = PRODUK.map((p) => tampilkanProduk(p));
  const tersedia = semua.filter((p) => !p.habis);
  return {
    terlaris: [...tersedia].sort((a, b) => b.terjual - a.terjual).slice(0, 8),
    baruPanen: [...tersedia].sort((a, b) => b.tanggalPanen.localeCompare(a.tanggalPanen)).slice(0, 8),
    surplus: tersedia
      .filter((p) => p.surplusAktif)
      .sort((a, b) => (b.surplusAktif?.diskonPersen ?? 0) - (a.surplusAktif?.diskonPersen ?? 0))
      .slice(0, 8),
    daftarTungguPopuler: DAFTAR_TUNGGU.map(tampilkanDaftarTunggu)
      .filter((d) => d.status !== "gagal-panen" && d.status !== "siap-panen")
      .sort((a, b) => b.pengikut - a.pengikut)
      .slice(0, 4),
    kategori: await ambilKategori(),
    statistik: {
      petani: PETANI.length,
      produk: PRODUK.length,
      wilayah: new Set(PETANI.map((p) => p.kabupaten)).size,
      daftarTunggu: DAFTAR_TUNGGU.length,
    },
  };
}
