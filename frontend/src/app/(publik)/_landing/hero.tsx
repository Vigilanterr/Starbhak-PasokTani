import Image from "next/image";
import Link from "next/link";
import { kelasTombolSitus } from "../../_komponen/tombol";
import { KONTAINER } from "../_beranda/kelas";

const POIN = ["Daftar gratis", "Untuk petani dan UMKM", "Area awal: Jawa Barat"];

export function HeroLanding() {
  return (
    <section aria-labelledby="judul-hero" className={`${KONTAINER} grid items-center gap-8 py-10 md:grid-cols-2 md:py-16`}>
      <div>
        <h1 id="judul-hero" className="text-[34px] leading-[1.12] font-bold tracking-tight text-brand-900 md:text-[52px]">
          Menghubungkan Hasil Panen dengan Kebutuhan Pasar.
        </h1>
        <p className="mt-5 max-w-130 text-base leading-relaxed text-ink md:text-lg">
          Petani menampilkan hasil panen dengan harga dan jumlah yang jelas. UMKM menemukan pasokan bahan baku langsung
          dari sumbernya. Rantai distribusi jadi lebih pendek dan terencana.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/daftar" className={`${kelasTombolSitus("utama")} rounded-full`}>
            Mulai Sekarang
          </Link>
          <Link href="/#cara-kerja" className={`${kelasTombolSitus("garis")} rounded-full`}>
            Pelajari Cara Kerja
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink">
          {POIN.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-accent">
                <path d="M5 12l4 4L19 6" />
              </svg>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-120">
        <Image src="/images/landingpage/hero/Padi.png" alt="Bulir padi dan karung beras hasil panen" fill priority sizes="(min-width: 768px) 480px, 90vw" className="object-contain" />
      </div>
    </section>
  );
}
