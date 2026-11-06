"use client";

import Link from "next/link";
import { IkonKeranjang, IkonLonceng } from "@/app/_komponen/ikon";
import { angka, LABEL_SATUAN, rupiah } from "@/lib/format";
import { useBeli } from "./konteks-beli";

const kelasTombol =
  "inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] px-4 text-[15px] font-semibold no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45";

/**
 * Bilah aksi bawah untuk ponsel/tablet. Memakai `sticky bottom-0` sebagai anak terakhir pembungkus halaman
 * (bukan `fixed`), jadi di ujung halaman bilah berhenti di atas footer dan tidak menutupi konten apa pun.
 */
export function BilahAksiSeluler() {
  const b = useBeli();
  const s = LABEL_SATUAN[b.data.satuan];

  return (
    <div className="sticky bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-6px_20px_rgba(6,78,59,0.07)] backdrop-blur-sm md:px-6 lg:hidden">
      <div className="mx-auto flex max-w-300 items-center gap-2.5">
        {b.tidakTersedia ? (
          <>
            <p className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-danger-ink">
                {b.data.habis ? "Stok habis" : "Stok belum cukup"}
              </span>
              <span className="block truncate text-xs text-muted">Langganan untuk dikabari</span>
            </p>
            <button type="button" onClick={b.bukaLangganan} className={`${kelasTombol} bg-accent text-white hover:bg-accent-hover`}>
              <IkonLonceng size={18} />
              Kabari saya
            </button>
          </>
        ) : (
          <>
            <p className="min-w-0 flex-1">
              <span className="block truncate text-[17px] leading-tight font-bold text-brand-900">
                {rupiah(b.harga.satuan)}
                <span className="text-xs font-medium text-muted">/{s}</span>
              </span>
              <span className="block truncate text-xs text-muted">
                {angka(b.jumlah)} {s} · {rupiah(b.subtotal)}
              </span>
            </p>
            <button
              type="button"
              onClick={b.bukaKeranjang}
              className={`${kelasTombol} border-[1.5px] border-brand-900 bg-white px-3 text-brand-900 hover:bg-tint`}
            >
              <IkonKeranjang size={18} />
              Keranjang
            </button>
            {/* TODO: sambungkan ke checkout langsung setelah sesi tersedia. */}
            <Link href={b.hrefMasuk} className={`${kelasTombol} bg-brand-900 px-5 text-white hover:bg-[#053f30]`}>
              Beli
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
