import type { FilterProduk, UrutanProduk } from "./api/tipe";
import { LABEL_URUTAN } from "./label";

/** Bentuk `searchParams` dari Next.js. */
export type ParamUrl = Record<string, string | string[] | undefined>;

function satu(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function bilangan(v: string | undefined): number | undefined {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Ubah query string menjadi `FilterProduk`. Nama parameter (lihat docs/frontend/routes.md):
 * `q`, `kategori`, `kabupaten`, `organik=1`, `surplus=1`, `tersedia=1`, `harga-min`, `harga-max`,
 * `urut`, `halaman`, `lat`, `lng`, `radius`.
 */
export function bacaFilterProduk(p: ParamUrl): FilterProduk {
  const urut = satu(p.urut);
  const lat = bilangan(satu(p.lat));
  const lng = bilangan(satu(p.lng));
  return {
    q: satu(p.q)?.trim() || undefined,
    kategori: satu(p.kategori) || undefined,
    kabupaten: satu(p.kabupaten) || undefined,
    organik: satu(p.organik) === "1" || undefined,
    surplus: satu(p.surplus) === "1" || undefined,
    tersedia: satu(p.tersedia) === "1" || undefined,
    hargaMin: bilangan(satu(p["harga-min"])),
    hargaMax: bilangan(satu(p["harga-max"])),
    urut: urut && urut in LABEL_URUTAN ? (urut as UrutanProduk) : undefined,
    halaman: bilangan(satu(p.halaman)),
    titik: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    radiusKm: bilangan(satu(p.radius)),
  };
}

/** Kebalikan `bacaFilterProduk`: menyusun query string (tanpa `?`). Nilai kosong dibuang. */
export function keQueryString(f: FilterProduk): string {
  const q = new URLSearchParams();
  if (f.q) q.set("q", f.q);
  if (f.kategori) q.set("kategori", f.kategori);
  if (f.kabupaten) q.set("kabupaten", f.kabupaten);
  if (f.organik) q.set("organik", "1");
  if (f.surplus) q.set("surplus", "1");
  if (f.tersedia) q.set("tersedia", "1");
  if (f.hargaMin !== undefined) q.set("harga-min", String(f.hargaMin));
  if (f.hargaMax !== undefined) q.set("harga-max", String(f.hargaMax));
  if (f.urut) q.set("urut", f.urut);
  if (f.titik) {
    q.set("lat", String(f.titik.lat));
    q.set("lng", String(f.titik.lng));
  }
  if (f.radiusKm !== undefined) q.set("radius", String(f.radiusKm));
  if (f.halaman && f.halaman > 1) q.set("halaman", String(f.halaman));
  return q.toString();
}

/** Path + query, mis. `hrefFilter("/produk", { ...filter, halaman: 2 })`. */
export function hrefFilter(path: string, f: FilterProduk): string {
  const qs = keQueryString(f);
  return qs ? `${path}?${qs}` : path;
}
