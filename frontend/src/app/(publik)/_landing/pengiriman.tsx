import Image from "next/image";
import Link from "next/link";
import { PENGIRIMAN_JALUR } from "./data-jalur";
import { Ikon } from "./ikon";
import { Tahap } from "./tahap";

export function BagianPengiriman() {
  return (
    <Tahap
      id="judul-pengiriman"
      nomor={5}
      eyebrow="Pengiriman"
      judul="Sampai ke dapur Anda"
      isi="Melayani seluruh Jawa Barat. Ongkir dihitung dari jarak dan berat, dan terlihat sebelum Anda membayar."
      latar="bg-[#f4f2ea]"
      latarHex="#f4f2ea"
      akhir
      pinKuning
    >
      <div className="mt-7 flex flex-wrap items-center gap-8 md:gap-16">
        <div className="min-w-0 flex-[1_1_380px]">
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {PENGIRIMAN_JALUR.map((p) => (
              <li key={p.judul} className="flex items-start gap-3.5">
                <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[#157a4c]">
                  <Ikon nama={p.ikon} ukuran={22} />
                </span>
                <span>
                  <b className="block text-base text-[#10291e]">{p.judul}</b>
                  <span className="text-sm text-[#4d5f54]">{p.isi}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link href="/belanja" className="group mt-7 inline-flex h-14 items-center gap-4 rounded-full bg-brand-900 pr-2 pl-7 text-[17px] font-bold text-white no-underline">
            Mulai belanja
            <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-[#e9c75c] text-brand-900 transition-transform group-hover:translate-x-1">
              <Ikon nama="panah" ukuran={20} />
            </span>
          </Link>
        </div>
        <figure className="m-0 min-w-0 flex-[1_1_380px] max-w-[560px]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px]">
            <Image src="/images/landingpage/pengiriman/kurir-antar-paket.png" alt="Kurir menyerahkan paket kepada pembeli di depan rumah" fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
          </div>
        </figure>
      </div>
    </Tahap>
  );
}
