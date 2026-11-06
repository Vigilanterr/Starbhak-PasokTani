/**
 * Hanya terima path internal untuk `?lanjut=` agar tidak jadi open redirect.
 * Contoh valid: `/pesanan/12`. Ditolak: `https://evil.test`, `//evil.test`, `/\evil`.
 */
export function pathAman(nilai: string | null | undefined): string | null {
  if (!nilai) return null;
  if (!nilai.startsWith("/") || nilai.startsWith("//") || nilai.includes("\\")) {
    return null;
  }
  return nilai;
}

/** Baca query string saat event handler berjalan (tanpa useSearchParams, agar halaman tetap statis). */
export function bacaParam(nama: string): string | null {
  return new URLSearchParams(window.location.search).get(nama);
}
