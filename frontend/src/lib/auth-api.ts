/**
 * Lapisan akses API autentikasi.
 *
 * `masuk`, `daftar` dan `masukDenganGoogle` memakai Neon Auth. Sisanya masih stub.
 */

import { authClient } from "@/lib/auth/client";

export type Hasil = { ok: true } | { ok: false };

/** Peran yang bisa dipilih saat daftar (sama dengan `PERAN_DAFTAR` di backend). */
export type PeranDaftar = "konsumen" | "umkm" | "petani";

/** Profil dari backend (`/api/v1/me`). Sesi Neon Auth dibaca di backend lewat cookie yang sama. */
export type Profil = {
  id: string;
  email: string;
  nama: string;
  peran: PeranDaftar | "admin";
  telepon: string | null;
  toko: { nama: string; slug: string; kodeKabupaten: string; kodeKecamatan: string; statusVerifikasi: string } | null;
};

export type HasilProfil =
  | { ok: true; profil: Profil }
  | { ok: false; kode: string; fields?: Record<string, string> };

/** Permintaan ke backend lewat jalur yang sama dengan halaman (Vercel meneruskan /api/v1 ke service backend). */
const API = "/api/v1";

async function panggilApi(path: string, init?: RequestInit): Promise<HasilProfil> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      credentials: "same-origin",
      headers: { "content-type": "application/json", ...init?.headers },
    });
  } catch {
    return { ok: false, kode: "jaringan" };
  }
  const body = (await res.json().catch(() => null)) as
    | { success: true; data: Profil }
    | { success: false; error: { code: string; fields?: Record<string, string> } }
    | null;
  if (res.ok && body?.success) return { ok: true, profil: body.data };
  return { ok: false, kode: body && !body.success ? body.error.code : "gagal", fields: body && !body.success ? body.error.fields : undefined };
}

/** Profil orang yang sedang masuk. `onboarding_required` berarti profil belum dibuat. */
export function ambilProfil(): Promise<HasilProfil> {
  return panggilApi("/me");
}

export type InputLengkapi = {
  peran: PeranDaftar;
  nama: string;
  telepon?: string;
  namaToko?: string;
  wilayah?: string;
  kecamatan?: string;
};

/** Membuat profil setelah sign-in pertama. Aman diulang: panggilan kedua tidak mengubah apa pun. */
export function lengkapiProfil(input: InputLengkapi): Promise<HasilProfil> {
  return panggilApi("/me/onboarding", { method: "POST", body: JSON.stringify(input) });
}

export async function masuk(input: {
  email: string;
  kataSandi: string;
}): Promise<Hasil> {
  // Dibungkus try: bila Neon Auth melempar error (bukan mengembalikannya), form tetap bisa dikirim ulang.
  try {
    const { error } = await authClient.signIn.email({
      email: input.email,
      password: input.kataSandi,
    });
    return error ? { ok: false } : { ok: true };
  } catch {
    return { ok: false };
  }
}

/** Mulai alur OAuth Google (Neon Auth). Browser dialihkan ke Google lalu kembali ke beranda. */
export async function masukDenganGoogle(): Promise<void> {
  await authClient.signIn.social({
    provider: "google",
    // Halaman ini memeriksa profil: akun baru diarahkan ke formulir, akun lama langsung ke beranda.
    callbackURL: `${window.location.origin}/daftar/lengkapi`,
  });
}

/**
 * Daftar dengan email + kata sandi lewat Neon Auth (Managed Better Auth), lalu membuat profil di backend.
 * Neon Auth hanya menyimpan nama dan email. Peran dan data toko disimpan di `users` lewat /me/onboarding.
 * Bila belum ada sesi (misalnya verifikasi email), profil dibuat di /daftar/lengkapi saat masuk nanti.
 */
export async function daftar(input: {
  peran: PeranDaftar;
  nama: string;
  email: string;
  kataSandi: string;
  namaToko?: string;
  wilayah?: string;
  kecamatan?: string;
}): Promise<Hasil> {
  // Dibungkus try: tombol "Buat akun" tidak boleh macet dalam status mengirim bila Neon Auth melempar error.
  try {
    const { error } = await authClient.signUp.email({
      name: input.nama,
      email: input.email,
      password: input.kataSandi,
    });
    if (error) return { ok: false };
  } catch {
    return { ok: false };
  }

  await lengkapiProfil({
    peran: input.peran,
    nama: input.nama,
    ...(input.namaToko ? { namaToko: input.namaToko } : {}),
    ...(input.wilayah ? { wilayah: input.wilayah } : {}),
    ...(input.kecamatan ? { kecamatan: input.kecamatan } : {}),
  });
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
