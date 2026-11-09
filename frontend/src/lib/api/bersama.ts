/**
 * Nilai kecil yang dipakai komponen klien dan server. Sengaja tanpa kode server, agar aman diimpor
 * Client Component dan tidak membawa `katalog.ts` (yang memanggil backend) ke bundle klien.
 */

import { WILAYAH_JAWA_BARAT } from "@/lib/wilayah";
import type { JadwalPanen, Koordinat } from "./tipe";

/** Titik acuan default "dekat saya": pusat Kota Bandung. Backend memakai nilai yang sama. */
export const TITIK_DEFAULT: Koordinat = { lat: -6.9175, lng: 107.6191 };

export function labelWilayah(nilai: string): string {
  return WILAYAH_JAWA_BARAT.find((w) => w.nilai === nilai)?.label ?? nilai;
}

/** Tanggal paling awal dari jadwal panen, untuk pengurutan. `null` bila belum ada perkiraan. */
export function awalPanen(d: { jadwalPanen: JadwalPanen }): string | null {
  const j = d.jadwalPanen;
  if (j.jenis === "tanggal") return j.tanggal;
  if (j.jenis === "rentang") return j.mulai;
  return null;
}
