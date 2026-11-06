import Link from "next/link";
import type { Kategori } from "@/lib/api/tipe";
import { angka } from "@/lib/format";
import { IKON_KATEGORI, WARNA_KATEGORI } from "../_komponen/foto-komoditas";
import { JudulBagian } from "../_komponen/judul-bagian";
import { KONTAINER } from "./kelas";

/** Pintasan kategori ke `/kategori/[slug]`: 3 kolom di ponsel, 6 kolom mulai tablet. */
export function GridKategori({ kategori }: { kategori: (Kategori & { jumlahProduk: number })[] }) {
  if (kategori.length === 0) return null;
  return (
    <section aria-labelledby="judul-kategori" className={`${KONTAINER} mt-10 md:mt-14`}>
      <JudulBagian id="judul-kategori" judul="Belanja per kategori" href="/produk" labelTautan="Semua produk" />
      <ul className="grid grid-cols-3 gap-2.5 sm:gap-3 md:grid-cols-6 md:gap-4">
        {kategori.map((k) => {
          const Ikon = IKON_KATEGORI[k.ikon];
          const warna = WARNA_KATEGORI[k.ikon];
          return (
            <li key={k.slug}>
              <Link
                href={`/kategori/${k.slug}`}
                className="group flex h-full flex-col items-center gap-2.5 rounded-2xl border border-line bg-white px-2 pt-4 pb-3.5 text-center no-underline transition-colors hover:border-brand-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 md:pt-5 md:pb-4"
              >
                <span aria-hidden className={`grid size-14 place-items-center rounded-full ${warna.latar} md:size-16`}>
                  <Ikon size={26} strokeWidth={1.5} className={warna.ikon} />
                </span>
                <span className="text-sm leading-tight font-semibold text-ink group-hover:text-brand-900">{k.nama}</span>
                <span className="mt-auto text-xs text-muted">{angka(k.jumlahProduk)} produk</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
