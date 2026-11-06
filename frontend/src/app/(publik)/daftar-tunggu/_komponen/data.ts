import type { EntriLinimasa, JadwalPanen, StatusDaftarTunggu } from "@/lib/api/tipe";

/**
 * Urutkan terbaru di atas. Entri bertanggal sama: yang tercatat belakangan di array dianggap lebih baru
 * (data linimasa dan kabar lahan dicatat dari lama ke baru).
 */
export function terbaruDulu<T extends { tanggal: string }>(daftar: T[]): T[] {
  return daftar
    .map((item, i) => ({ item, i }))
    .sort((a, b) => b.item.tanggal.localeCompare(a.item.tanggal) || b.i - a.i)
    .map(({ item }) => item);
}

/** Alasan terbaru (Panen Tertunda / Gagal Panen) dari linimasa yang sudah diurutkan terbaru dulu. */
export function alasanTerbaru(linimasa: EntriLinimasa[]): string | null {
  return linimasa.find((e) => e.alasan)?.alasan ?? null;
}

export type BarisPenalti = "belum-ada" | "ada-perkiraan" | "setelah-panen" | "tertunda" | "gagal";

/** Baris tabel penalti pembatalan yang berlaku untuk keadaan daftar tunggu saat ini. */
export function barisPenaltiBerlaku(status: StatusDaftarTunggu, jadwal: JadwalPanen): BarisPenalti {
  if (status === "gagal-panen") return "gagal";
  if (status === "panen-tertunda") return "tertunda";
  if (status === "siap-panen") return "setelah-panen";
  if (jadwal.jenis === "belum-ada") return "belum-ada";
  return "ada-perkiraan";
}

/** "Kabupaten Garut" -> "Kab. Garut" untuk baris ringkas. */
export function wilayahRingkas(label: string): string {
  return label.replace("Kabupaten ", "Kab. ");
}
