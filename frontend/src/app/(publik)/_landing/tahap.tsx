import Link from "next/link";
import type { ReactNode } from "react";
import { KONTAINER } from "../_beranda/kelas";
import { Ikon } from "./ikon";

type Props = {
  id: string;
  nomor: number;
  eyebrow: string;
  judul: string;
  isi: string;
  latar: string;
  latarHex: string;
  awal?: boolean;
  akhir?: boolean;
  pinKuning?: boolean;
  tautan?: { label: string; href: string };
  atas?: ReactNode;
  children?: ReactNode;
};

/** Satu tahap pada garis "jalur panen": nomor di garis putus-putus, lalu judul dan isinya. */
export function Tahap({ id, nomor, eyebrow, judul, isi, latar, latarHex, awal, akhir, pinKuning, tautan, atas, children }: Props) {
  return (
    <section aria-labelledby={id} className={latar}>
      {atas && <div className={KONTAINER}>{atas}</div>}
      <div className={`${KONTAINER} grid grid-cols-[36px_minmax(0,1fr)] gap-x-3.5 md:grid-cols-[64px_minmax(0,1fr)] md:gap-x-8`}>
        <div className="relative">
          {!awal && <span aria-hidden="true" className="absolute top-0 left-1/2 h-[66px] -translate-x-1/2 border-l-[3px] border-dashed border-[#c2a032]" />}
          {!akhir && <span aria-hidden="true" className="absolute top-[66px] bottom-0 left-1/2 -translate-x-1/2 border-l-[3px] border-dashed border-[#c2a032]" />}
          <span
            aria-hidden="true"
            style={{ boxShadow: `0 0 0 4px ${latarHex}` }}
            className={`relative mx-auto mt-12 grid size-9 place-items-center rounded-full text-[15px] font-extrabold md:size-11 md:text-lg ${pinKuning ? "bg-[#e9c75c] text-[#10291e]" : "bg-brand-900 text-white"}`}
          >
            {nomor}
          </span>
        </div>
        <div className="min-w-0 pt-12 pb-14 md:pt-18 md:pb-18">
          <p className="m-0 text-[13px] font-extrabold tracking-[0.08em] text-[#157a4c] uppercase">{eyebrow}</p>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="min-w-0 max-w-[660px]">
              <h2 id={id} className="mt-1.5 text-[30px] leading-[1.05] font-extrabold tracking-[-0.02em] text-[#10291e] md:text-[44px]">
                {judul}
              </h2>
              <p className="mt-3 text-[17px] text-[#4d5f54]">{isi}</p>
            </div>
            {tautan && (
              <Link href={tautan.href} className="inline-flex min-h-11 items-center gap-2 text-base font-bold text-brand-900 underline-offset-4 hover:underline">
                {tautan.label}
                <Ikon nama="panah" ukuran={18} />
              </Link>
            )}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
