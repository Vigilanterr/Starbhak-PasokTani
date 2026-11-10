import Link from "next/link";
import type { Kategori } from "@/lib/api/tipe";
import { angka } from "@/lib/format";
import { IKON_KATEGORI, WARNA_KATEGORI } from "../../_komponen/foto-komoditas";

const kelasFokus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45";

/**
 * Rel chip kategori untuk berpindah kategori. Ponsel: gulir horizontal (snap); desktop: membungkus.
 * `aktif` = slug kategori halaman ini.
 */
export function RelKategori({ kategori, aktif, className = "" }: { kategori: Kategori[]; aktif?: string; className?: string }) {
  return (
    <nav aria-label="Kategori produk" className={`-mx-4 md:mx-0 ${className}`}>
      <ul className="flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 py-1.5 md:flex-wrap md:overflow-visible md:px-0">
        <li className="shrink-0 snap-start">
          <Link
            href="/produk"
            className={`inline-flex h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold whitespace-nowrap text-ink no-underline hover:border-brand-600 ${kelasFokus}`}
          >
            Semua produk
          </Link>
        </li>
        {kategori.map((k) => {
          const Ikon = IKON_KATEGORI[k.ikon];
          const dipilih = k.slug === aktif;
          return (
            <li key={k.slug} className="shrink-0 snap-start">
              <Link
                href={`/kategori/${k.slug}`}
                aria-current={dipilih ? "page" : undefined}
                className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap no-underline ${kelasFokus} ${
                  dipilih
                    ? "border-brand-900 bg-brand-900 text-white"
                    : "border-line bg-white text-ink hover:border-brand-600"
                }`}
              >
                <Ikon size={16} className={`shrink-0 ${dipilih ? "" : WARNA_KATEGORI[k.ikon].ikon}`} />
                {k.nama}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Kartu kategori (ikon berwarna, nama, jumlah produk), untuk ajakan di /cari. */
export function GridKategori({ kategori }: { kategori: (Kategori & { jumlahProduk: number })[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
      {kategori.map((k) => {
        const Ikon = IKON_KATEGORI[k.ikon];
        const warna = WARNA_KATEGORI[k.ikon];
        return (
          <li key={k.slug}>
            <Link
              href={`/kategori/${k.slug}`}
              className={`flex h-full flex-col items-start gap-3 rounded-2xl border border-line bg-white p-4 no-underline transition-shadow hover:shadow-[0_6px_24px_rgba(6,78,59,0.08)] ${kelasFokus}`}
            >
              <span className={`grid size-11 place-items-center rounded-xl ${warna.latar} ${warna.ikon}`}>
                <Ikon size={22} />
              </span>
              <span>
                <span className="block text-[15px] leading-snug font-semibold text-ink">{k.nama}</span>
                <span className="mt-0.5 block text-[13px] text-muted">{angka(k.jumlahProduk)} produk</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
