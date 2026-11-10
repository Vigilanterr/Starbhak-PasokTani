import Image from "next/image";
import Link from "next/link";
import { KONTAINER } from "../_beranda/kelas";
import { CABANG_JALUR } from "./data-jalur";
import { Ikon } from "./ikon";

export function BagianCabang() {
  return (
    <section aria-label="Untuk usaha dan petani" className="bg-white">
      <div className={`${KONTAINER} grid gap-6 py-18 md:grid-cols-2`}>
        {CABANG_JALUR.map((c) => (
          <Link key={c.href} href={c.href} className="flex flex-wrap overflow-hidden rounded-[28px] border border-[#e3e8df] bg-white text-[#173b2b] no-underline transition-transform hover:-translate-y-1">
            <span className="relative min-h-[200px] flex-[1_1_200px] max-h-[280px]">
              <Image src={c.foto} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </span>
            <span className="flex min-w-0 flex-[1_1_260px] flex-col gap-2.5 p-6.5">
              <b className="text-[26px] leading-tight font-extrabold text-[#10291e]">{c.judul}</b>
              <span className="text-[15px] text-[#4d5f54]">{c.isi}</span>
              <span className="mt-auto inline-flex items-center gap-2 pt-2 text-base font-bold text-brand-900">
                {c.aksi}
                <Ikon nama="panah" ukuran={18} />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
