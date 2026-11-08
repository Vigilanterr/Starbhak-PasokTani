import Image from "next/image";
import Link from "next/link";
import { KATEGORI_JALUR, PRODUK_BARU, rupiah } from "./data-jalur";
import { Tahap } from "./tahap";

export function BagianBaruDipanen() {
  return (
    <Tahap
      id="judul-baru-dipanen"
      nomor={1}
      eyebrow="Panen"
      judul="Baru dipanen di Jawa Barat"
      isi="Diurutkan dari tanggal panen terbaru. Foto di setiap kartu adalah foto stok yang sedang dijual."
      latar="bg-[#f4f2ea]"
      latarHex="#f4f2ea"
      awal
      tautan={{ label: "Lihat semua produk", href: "/produk" }}
      atas={
        <nav aria-label="Kategori" className="relative -top-12 -mb-12">
          <ul className="flex flex-wrap items-center gap-2.5 rounded-3xl bg-white p-3.5 shadow-[0_10px_30px_rgba(16,41,30,0.08)]">
            <li className="w-full px-2 text-[13px] font-extrabold tracking-[0.06em] text-[#4d5f54] uppercase sm:w-auto">Kategori</li>
            {KATEGORI_JALUR.map((k) => (
              <li key={k.nama} className="min-w-0">
                <Link href="/kategori" className="flex min-h-12 items-center gap-2.5 rounded-full bg-[#f4f2ea] py-1 pr-4 pl-1 text-[15px] font-bold text-[#173b2b] no-underline">
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
                    <Image src={k.foto} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                  <span className="min-w-0">{k.nama}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      }
    >
      <ul aria-label="Produk baru dipanen" className="m-0 mt-7 grid list-none grid-cols-2 gap-x-3 gap-y-7 p-0 md:grid-cols-3 md:gap-x-4 lg:grid-cols-5">
        {PRODUK_BARU.map((it) => (
          <li key={it.nama} className="min-w-0">
            <Link href="/produk" className="group flex flex-col gap-2 text-[#173b2b] no-underline">
              <span className="relative aspect-square overflow-hidden rounded-[20px] bg-white transition-transform group-hover:-translate-y-1">
                <Image src={it.foto} alt="" fill sizes="(min-width: 1024px) 220px, 45vw" className="object-cover" />
                {it.diskon && <span className="absolute top-2.5 left-2.5 rounded-full bg-[#e9c75c] px-2.5 py-1 text-xs font-extrabold text-[#10291e]">{it.diskon}</span>}
              </span>
              <span className="text-[15px] font-bold leading-snug">{it.nama}</span>
              <span className="text-[13px] text-[#4d5f54]">{it.lokasi}</span>
              <span className="text-sm">
                <b className="font-extrabold text-brand-900">
                  {rupiah(it.harga)}
                  <span className="font-medium text-[#4d5f54]">/{it.satuan}</span>
                </b>
                {it.hargaAsli && <s className="ml-2 text-[13px] text-[#4d5f54]">{rupiah(it.hargaAsli)}</s>}
              </span>
              <span className="text-xs text-[#4d5f54]">{it.panen}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Tahap>
  );
}
