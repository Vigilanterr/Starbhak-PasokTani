/**
 * Panggilan API pembeli (alamat, keranjang) dari browser. Aman dipakai di komponen klien: tidak mengimpor
 * `next/headers`. Pembacaan dari server ada di `pembeli-server.ts`.
 *
 * Bentuk respons mengikuti backend: `{ success, data }` atau `{ success: false, error: { code, message, fields? } }`.
 */

export type Galat = {
  ok: false;
  /** 0 bila jaringan putus. */
  status: number;
  /** Kode stabil dari backend, mis. `unauthorized`, `validation_failed`, `out_of_stock`. */
  kode: string;
  pesan: string;
  fields?: Record<string, string>;
};

export type Hasil<T> = { ok: true; data: T } | Galat;

const PESAN_GAGAL = "Terjadi kesalahan, coba lagi.";

/** Membaca respons backend menjadi `Hasil`. Dipakai di klien dan di server. */
export async function bacaRespons<T>(res: Response): Promise<Hasil<T>> {
  const body = (await res.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; error: { code: string; message?: string; fields?: Record<string, string> } }
    | null;
  if (res.ok && body?.success) return { ok: true, data: body.data };
  const galat = body && !body.success ? body.error : undefined;
  return {
    ok: false,
    status: res.status,
    kode: galat?.code ?? "gagal",
    pesan: galat?.message ?? PESAN_GAGAL,
    fields: galat?.fields,
  };
}

/** Satu permintaan dari browser ke `/api/v1` yang sama asal (Vercel meneruskannya ke backend). */
export async function kirimPembeli<T>(
  metode: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<Hasil<T>> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method: metode,
      credentials: "same-origin",
      headers: body !== undefined ? { "content-type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, status: 0, kode: "jaringan", pesan: "Koneksi terputus. Periksa internet Anda, lalu coba lagi." };
  }
  return bacaRespons<T>(res);
}
