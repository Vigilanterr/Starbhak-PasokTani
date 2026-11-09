/**
 * Lapisan akses API autentikasi.
 *
 * `masuk`, `daftar` dan `masukDenganGoogle` memakai Neon Auth. Sisanya masih stub.
 */

import { authClient } from "@/lib/auth/client";

export type Hasil = { ok: true } | { ok: false };

export async function masuk(input: {
  email: string;
  kataSandi: string;
}): Promise<Hasil> {
  const { error } = await authClient.signIn.email({
    email: input.email,
    password: input.kataSandi,
  });
  return error ? { ok: false } : { ok: true };
}

/** Mulai alur OAuth Google (Neon Auth). Browser dialihkan ke Google lalu kembali ke beranda. */
export async function masukDenganGoogle(): Promise<void> {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: `${window.location.origin}/`,
  });
}

/**
 * Daftar dengan email + kata sandi lewat Neon Auth (Managed Better Auth).
 * Field peran/toko/wilayah belum dikirim: Neon Auth hanya menyimpan nama + email,
 * data profil itu perlu disimpan terpisah di backend.
 */
export async function daftar(input: {
  peran: "konsumen" | "umkm" | "petani";
  nama: string;
  email: string;
  kataSandi: string;
  namaToko?: string;
  wilayah?: string;
  kecamatan?: string;
}): Promise<Hasil> {
  const { error } = await authClient.signUp.email({
    name: input.nama,
    email: input.email,
    password: input.kataSandi,
  });
  return error ? { ok: false } : { ok: true };
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
