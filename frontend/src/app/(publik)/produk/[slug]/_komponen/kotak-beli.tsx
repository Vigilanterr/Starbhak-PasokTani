"use client";

import Link from "next/link";
import { useId, type ChangeEvent } from "react";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { IkonInfo, IkonKeranjang, IkonKurang, IkonLonceng, IkonTambah } from "@/app/_komponen/ikon";
import { angka, LABEL_SATUAN, rupiah } from "@/lib/format";
import { useBeli } from "./konteks-beli";

const kelasNonaktif = "disabled:cursor-not-allowed disabled:opacity-45";

const kelasStepper =
  "grid size-11 shrink-0 cursor-pointer place-items-center text-brand-900 hover:bg-tint disabled:cursor-not-allowed disabled:text-[#b8bfb6] disabled:hover:bg-transparent focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand-600/45";

const LABEL_SUMBER = {
  dasar: null,
  grosir: "Harga grosir",
  surplus: "Harga Surplus",
} as const;

/** Kotak beli: jumlah, harga sesuai tingkat grosir/Surplus, subtotal, dan aksi (S2, S5, S11). */
export function KotakBeli() {
  const b = useBeli();
  const id = useId();
  const s = LABEL_SATUAN[b.data.satuan];
  const idJudul = `${id}-judul`;
  const idJumlah = `${id}-jumlah`;
  const idBatas = `${id}-batas`;

  if (b.tidakTersedia) {
    return (
      <section
        aria-labelledby={idJudul}
        className="rounded-2xl border border-line bg-white p-4 md:p-5 lg:sticky lg:top-4"
      >
        <h2 id={idJudul} className="text-lg font-bold tracking-tight text-brand-900">
          {b.data.habis ? "Stok sedang habis" : "Stok di bawah minimum pembelian"}
        </h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          {b.data.habis
            ? "Produk ini tetap bisa kamu langgani. Kami kabari begitu petani menambah stok baru."
            : `Stok tersisa ${angka(b.data.stok)} ${s}, sedangkan minimum pembelian ${angka(b.min)} ${s}. Langganan agar dikabari saat stok bertambah.`}
        </p>
        <button type="button" onClick={b.bukaLangganan} className={`${kelasTombolSitus("aksen")} mt-4 w-full gap-2`}>
          <IkonLonceng size={20} />
          Kabari saya saat stok kembali
        </button>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <button type="button" disabled className={`${kelasTombolSitus("garis")} px-3 text-[15px] ${kelasNonaktif}`}>
            Beli sekarang
          </button>
          <button type="button" disabled className={`${kelasTombolSitus("garis")} gap-1.5 px-3 text-[15px] ${kelasNonaktif}`}>
            <IkonKeranjang size={18} />
            Keranjang
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby={idJudul} className="rounded-2xl border border-line bg-white p-4 md:p-5 lg:sticky lg:top-4">
      <h2 id={idJudul} className="text-lg font-bold tracking-tight text-brand-900">
        Atur jumlah
      </h2>

      <div className="mt-3">
        <label htmlFor={idJumlah} className="text-sm font-semibold text-ink">
          Jumlah ({s})
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-field-border bg-white">
            <button
              type="button"
              onClick={() => b.ubahJumlah(b.jumlah - 1)}
              disabled={b.jumlah <= b.min}
              aria-label="Kurangi jumlah"
              aria-controls={idJumlah}
              className={kelasStepper}
            >
              <IkonKurang size={18} />
            </button>
            <input
              id={idJumlah}
              type="number"
              inputMode="numeric"
              min={b.min}
              max={b.maks}
              step={1}
              value={b.teks}
              onChange={(e: ChangeEvent<HTMLInputElement>) => b.ubahTeks(e.target.value)}
              onBlur={b.rapikan}
              aria-describedby={idBatas}
              className="h-11 w-18 border-x border-line bg-white text-center text-base font-semibold text-ink outline-none [appearance:textfield] focus-visible:bg-tint [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => b.ubahJumlah(b.jumlah + 1)}
              disabled={b.jumlah >= b.maks}
              aria-label="Tambah jumlah"
              aria-controls={idJumlah}
              className={kelasStepper}
            >
              <IkonTambah size={18} />
            </button>
          </div>
          <p id={idBatas} className="text-[13px] text-muted">
            Stok {angka(b.data.stok)} {s} · Min. {angka(b.min)} {s}
          </p>
        </div>
        <p aria-live="polite" className="text-[13px] font-medium text-[#9a3412]">
          {b.peringatan && <span className="mt-2 block">{b.peringatan}</span>}
        </p>
      </div>

      <dl className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-[15px]">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Harga satuan</dt>
          <dd className="text-right">
            {LABEL_SUMBER[b.harga.sumber] && (
              <span
                className={`mr-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  b.harga.sumber === "surplus" ? "bg-[#ffedd5] text-[#9a3412]" : "bg-mint text-brand-900"
                }`}
              >
                {LABEL_SUMBER[b.harga.sumber]}
              </span>
            )}
            <span className="font-semibold text-ink">{rupiah(b.harga.satuan)}</span>
            <span className="text-muted">/{s}</span>
          </dd>
        </div>
        {b.hemat > 0 && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted">Kamu hemat</dt>
            <dd className="font-semibold text-brand-600">{rupiah(b.hemat)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-semibold text-ink">Subtotal</dt>
          <dd aria-live="polite" className="text-[22px] font-bold tracking-tight text-brand-900">
            {rupiah(b.subtotal)}
          </dd>
        </div>
      </dl>
      <p className="mt-1 text-right text-xs text-muted">Belum termasuk ongkir, dihitung saat checkout.</p>

      <div className="mt-4 flex flex-col gap-2.5">
        {/* TODO: sambungkan ke checkout langsung (bawa jumlah) setelah sesi tersedia. */}
        <Link href={b.hrefMasuk} className={`${kelasTombolSitus("utama")} w-full`}>
          Beli sekarang
        </Link>
        <button type="button" onClick={b.bukaKeranjang} className={`${kelasTombolSitus("garis")} w-full gap-2`}>
          <IkonKeranjang size={20} />
          Tambah ke Keranjang
        </button>
        <button
          type="button"
          onClick={b.bukaLangganan}
          className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-line bg-white px-6 text-base font-semibold text-ink hover:bg-tint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
        >
          <IkonLonceng size={20} className="text-brand-600" />
          Langganan
        </button>
      </div>

      <p className="mt-3.5 flex items-start gap-2 text-xs leading-snug text-muted">
        <IkonInfo size={14} className="mt-px shrink-0" />
        Menambah ke keranjang belum mengunci stok. Stok baru dipesan untukmu saat checkout.
      </p>
    </section>
  );
}
