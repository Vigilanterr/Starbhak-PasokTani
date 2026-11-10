"use client";

import { useId } from "react";
import { LABEL_SATUAN, rupiah } from "@/lib/format";
import { labelRentang, urutkanTingkat } from "./harga-produk";
import { useBeli } from "./konteks-beli";

/** Tabel harga grosir; baris yang sesuai jumlah pilihan pembeli ditandai (S11). */
export function TabelGrosir() {
  const { data, harga, tidakTersedia } = useBeli();
  const id = useId();
  const urut = urutkanTingkat(data.hargaGrosir);
  if (urut.length <= 1) return null;

  const s = LABEL_SATUAN[data.satuan];
  const dasar = urut[0]?.harga ?? data.harga;

  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-2xl border border-line bg-white">
      <h2 id={id} className="px-4 pt-4 text-sm font-semibold text-ink">
        Harga grosir
      </h2>
      <table className="mt-2 w-full text-sm">
        <caption className="sr-only">Harga per {s} berdasarkan jumlah pembelian</caption>
        <thead>
          <tr className="text-xs text-muted">
            <th scope="col" className="px-4 py-2 text-left font-medium">
              Jumlah
            </th>
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Harga per {s}
            </th>
          </tr>
        </thead>
        <tbody>
          {urut.map((t, n) => {
            const aktif = !tidakTersedia && n === harga.indeks;
            const hematPersen = Math.round((1 - t.harga / dasar) * 100);
            return (
              <tr
                key={t.minJumlah}
                aria-current={aktif ? "true" : undefined}
                className={`border-t border-line ${aktif ? "bg-mint/60 text-brand-900" : "text-ink"}`}
              >
                <th scope="row" className={`px-4 py-2.5 text-left ${aktif ? "font-bold" : "font-medium"}`}>
                  <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                    {labelRentang(urut, n, data.satuan)}
                    {aktif && (
                      <span className="rounded-full bg-brand-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                        Jumlahmu
                      </span>
                    )}
                  </span>
                </th>
                <td className={`px-4 py-2.5 text-right ${aktif ? "font-bold" : "font-semibold"}`}>
                  {rupiah(t.harga)}
                  {hematPersen > 0 && <span className="ml-1.5 text-xs font-medium text-brand-600">−{hematPersen}%</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-line bg-cream px-4 py-3 text-xs leading-snug text-muted">
        Harga otomatis menyesuaikan jumlah di keranjang.
        {data.hargaSurplus !== null && " Selama Surplus, berlaku harga termurah antara harga Surplus dan harga grosir."}
      </p>
    </section>
  );
}
