import type { FilterDaftarTunggu } from "@/lib/api/katalog";
import type { StatusDaftarTunggu } from "@/lib/api/tipe";
import type { ParamUrl } from "@/lib/filter-produk";

export type UrutanDaftarTunggu = NonNullable<FilterDaftarTunggu["urut"]>;

export const LABEL_URUTAN_DAFTAR_TUNGGU: Record<UrutanDaftarTunggu, string> = {
  populer: "Paling diikuti",
  "panen-terdekat": "Panen terdekat",
  terbaru: "Terbaru",
};

const URUTAN: UrutanDaftarTunggu[] = ["populer", "panen-terdekat", "terbaru"];

/** Urutan chip status di halaman daftar: mengikuti alur tanam, cabang di belakang. */
export const URUTAN_CHIP_STATUS: StatusDaftarTunggu[] = [
  "jadwal-tanam",
  "sudah-tanam",
  "panen-lebih-awal",
  "panen-tertunda",
  "siap-panen",
  "gagal-panen",
];

function satu(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Query string `/daftar-tunggu` -> `FilterDaftarTunggu`.
 * Parameter: `status`, `kategori`, `komitmen=1`, `urut` (populer | panen-terdekat | terbaru).
 */
export function bacaFilterDaftarTunggu(p: ParamUrl): FilterDaftarTunggu {
  const status = satu(p.status);
  const urut = satu(p.urut);
  return {
    status: URUTAN_CHIP_STATUS.find((s) => s === status),
    kategori: satu(p.kategori)?.trim() || undefined,
    bisaKomitmen: satu(p.komitmen) === "1" || undefined,
    urut: URUTAN.find((u) => u === urut),
  };
}

/** Kebalikan `bacaFilterDaftarTunggu`: URL lengkap, nilai kosong dibuang. */
export function hrefDaftarTunggu(f: FilterDaftarTunggu): string {
  const q = new URLSearchParams();
  if (f.status) q.set("status", f.status);
  if (f.kategori) q.set("kategori", f.kategori);
  if (f.bisaKomitmen) q.set("komitmen", "1");
  if (f.urut) q.set("urut", f.urut);
  const qs = q.toString();
  return qs ? `/daftar-tunggu?${qs}` : "/daftar-tunggu";
}
