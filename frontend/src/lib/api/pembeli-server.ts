import { headers, cookies } from "next/headers";
import { bacaRespons, type Hasil } from "./pembeli";

/**
 * Membaca API pembeli dari komponen server, lewat binding antar-service (`BACKEND_INTERNAL_URL`).
 *
 * Cookie sesi diteruskan. Backend memeriksa sesi dengan origin dari `x-forwarded-host`, jadi host publik
 * ikut diteruskan; tanpa itu, Neon Auth menolak sesi yang sah. Tanpa cookie sesi, backend tidak dipanggil
 * dan hasilnya 401.
 */
export async function ambilPembeli<T>(path: string): Promise<Hasil<T>> {
  const jar = await cookies();
  const cookie = jar
    .getAll()
    .filter((c) => c.name.startsWith("__Secure-neon-auth."))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookie) return { ok: false, status: 401, kode: "unauthorized", pesan: "Silakan masuk terlebih dahulu" };

  const dasar = process.env.BACKEND_INTERNAL_URL;
  if (!dasar) throw new Error("BACKEND_INTERNAL_URL belum diatur");

  const h = await headers();
  const hostPublik = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";

  let res: Response;
  try {
    res = await fetch(new URL(`/api/v1${path}`, dasar), {
      headers: {
        cookie,
        ...(hostPublik ? { "x-forwarded-host": hostPublik, "x-forwarded-proto": proto } : {}),
      },
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, kode: "jaringan", pesan: "Layanan sedang tidak bisa dihubungi. Coba lagi." };
  }
  return bacaRespons<T>(res);
}
