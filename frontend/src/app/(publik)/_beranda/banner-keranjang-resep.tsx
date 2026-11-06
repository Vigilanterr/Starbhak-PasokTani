import Link from "next/link";
import { angka, LABEL_SATUAN } from "@/lib/format";
import { IkonKembalikan, IkonKeranjang, IkonToko } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { IKON_KATEGORI, WARNA_KATEGORI } from "../_komponen/foto-komoditas";
import { BERANDA } from "./data-beranda";
import { KONTAINER } from "./kelas";

/** Pintasan Keranjang Resep yang menonjol untuk pembeli UMKM (S5). */
export function BannerKeranjangResep() {
  const { langkah, contoh } = BERANDA.keranjangResep;
  return (
    <section aria-labelledby="judul-keranjang-resep" className={`${KONTAINER} mt-12 md:mt-16`}>
      <div className="relative isolate overflow-hidden rounded-3xl bg-mint px-5 py-8 md:px-10 md:py-11 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center lg:gap-14 lg:px-14">
        <span aria-hidden className="pointer-events-none absolute -right-20 -bottom-24 -z-10 size-80 rounded-full bg-white/45" />
        <span aria-hidden className="pointer-events-none absolute -top-16 left-1/3 -z-10 size-40 rounded-full bg-white/30" />

        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-[13px] font-semibold text-brand-900">
            <IkonToko size={14} />
            Untuk UMKM: warung, katering, dan kedai
          </p>
          <h2
            id="judul-keranjang-resep"
            className="mt-4 text-[26px] leading-tight font-bold tracking-tight text-brand-900 md:text-[32px]"
          >
            Simpan belanjaan per menu, pesan ulang tiap minggu
          </h2>
          <p className="mt-3 max-w-140 text-base leading-relaxed text-ink">
            Dengan Keranjang Resep, isi keranjang tetap tersimpan setelah checkout. Minggu depan kamu tidak perlu
            menyusun daftar belanja dari awal.
          </p>
          <ol className="mt-6 flex flex-col gap-3">
            {langkah.map((l, i) => (
              <li key={l} className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-900 text-sm font-bold text-mint">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-[15px] leading-snug text-ink">{l}</span>
              </li>
            ))}
          </ol>
          <Link href="/keranjang-resep" className={`${kelasTombolSitus("utama")} mt-7 gap-2`}>
            <IkonKeranjang size={18} />
            Buat Keranjang Resep
          </Link>
        </div>

        <figure className="mt-9 rounded-2xl bg-white p-4 shadow-[0_12px_32px_rgba(6,78,59,0.12)] md:p-5 lg:mt-0">
          <figcaption className="flex items-center gap-3">
            <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-tint text-brand-900">
              <IkonKeranjang size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="sr-only">Contoh Keranjang Resep: </span>
              <span className="block text-base font-bold text-ink">{contoh.nama}</span>
              <span className="block text-[13px] text-muted">
                {contoh.bahan.length} bahan · {contoh.keterangan}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-brand-900">Tersimpan</span>
          </figcaption>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {contoh.bahan.map((b) => {
              const Ikon = IKON_KATEGORI[b.ikon];
              const warna = WARNA_KATEGORI[b.ikon];
              return (
                <li key={b.nama} className="flex items-center gap-3 py-3">
                  <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-lg ${warna.latar}`}>
                    <Ikon size={20} strokeWidth={1.5} className={warna.ikon} />
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] font-medium text-ink">{b.nama}</span>
                  <span className="text-[15px] font-semibold text-brand-900">
                    {angka(b.jumlah)} {LABEL_SATUAN[b.satuan]}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-[13px] font-medium text-brand-900">
            <IkonKembalikan size={16} className="shrink-0 text-brand-600" />
            Minggu depan: pesan ulang semua bahan dalam satu checkout
          </p>
        </figure>
      </div>
    </section>
  );
}
