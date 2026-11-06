import Image from "next/image";
import Link from "next/link";
import { kelasTombolSitus } from "../../_komponen/tombol";
import { KONTAINER } from "../_beranda/kelas";

export function HeroLanding() {
  return (
    <section aria-labelledby="judul-hero" className={`${KONTAINER} grid items-center gap-8 py-10 md:grid-cols-2 md:py-16`}>
      <div>
        <h1 id="judul-hero" className="text-[34px] leading-[1.12] font-bold tracking-tight text-brand-900 md:text-[52px]">
          Menghubungkan Hasil Panen dengan Kebutuhan Pasar.
        </h1>
        <p className="mt-5 max-w-130 text-base leading-relaxed text-ink md:text-lg">
          Platform digital yang mengintegrasikan manajemen hasil pertanian dan akses pasar, membantu petani mengelola
          panen, menemukan pembeli, serta membangun rantai distribusi yang lebih efisien.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/daftar" className={`${kelasTombolSitus("utama")} rounded-full`}>
            Mulai Sekarang
          </Link>
          <Link href="/#cara-kerja" className={`${kelasTombolSitus("garis")} rounded-full`}>
            Pelajari Cara Kerja
          </Link>
        </div>
        <p className="mt-6 flex items-center gap-3 text-sm text-ink">
          <span aria-hidden className="grid h-10 min-w-10 place-items-center rounded-full bg-brand-900 px-2 text-xs font-bold text-white">
            99+
          </span>
          Dipercaya oleh ratusan petani dan pasar di Indonesia
        </p>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-120">
        <Image src="/images/landingpage/hero/Padi.png" alt="Bulir padi dan karung beras hasil panen" fill priority sizes="(min-width: 768px) 480px, 90vw" className="object-contain" />
      </div>
    </section>
  );
}
