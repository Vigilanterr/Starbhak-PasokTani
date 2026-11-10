/**
 * Lapisan akses API autentikasi.
 *
 * TODO: sambungkan ke backend (belum ada). Sampai saat itu setiap fungsi di sini
 * hanya stub supaya alur UI bisa dijalankan:
 *  - `masuk` selalu gagal (menampilkan state galat pada halaman Masuk).
 *  - sisanya selalu berhasil.
 */

export type Hasil = { ok: true } | { ok: false };

export async function masuk(input: {
  email: string;
  kataSandi: string;
}): Promise<Hasil> {
  void input;
  return { ok: false };
}

export async function masukDenganGoogle(): Promise<void> {
  // TODO: mulai alur OAuth Google.
}

export async function daftar(input: {
  peran: "konsumen" | "umkm" | "petani";
  nama: string;
  email: string;
  kataSandi: string;
  namaToko?: string;
  wilayah?: string;
  kecamatan?: string;
}): Promise<Hasil> {
  void input;
  return { ok: true };
}

/** Respons sengaja sama baik email terdaftar maupun tidak (mencegah user enumeration). */
export async function mintaAturUlangKataSandi(input: {
  email: string;
}): Promise<Hasil> {
  void input;
  return { ok: true };
}

export async function aturUlangKataSandi(input: {
  token: string;
  kataSandi: string;
}): Promise<Hasil> {
  void input;
  return { ok: true };
}
