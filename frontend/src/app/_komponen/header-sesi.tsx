import type { Keranjang } from "@/lib/api/tipe";
import { ambilPembeli } from "@/lib/api/pembeli-server";
import { HeaderSitus, type SesiHeader } from "./header-situs";

/**
 * Header yang tahu keadaan masuk. Satu panggilan ke backend: GET /keranjang. 401 berarti tamu. 403 berarti sudah
 * masuk tetapi bukan pembeli (petani, atau belum mengisi profil), jadi tidak ada jumlah keranjang.
 */
export async function HeaderSesi() {
  const r = await ambilPembeli<Keranjang>("/keranjang");
  let sesi: SesiHeader | null = null;
  if (r.ok) sesi = { keranjang: r.data.baris.length };
  else if (r.status !== 401 && r.status !== 0) sesi = { keranjang: null };
  return <HeaderSitus sesi={sesi} />;
}
