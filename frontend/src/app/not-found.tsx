import type { Metadata } from "next";
import Link from "next/link";
import { IkonDaun } from "./(auth)/_komponen/ikon";
import { FooterSitus } from "./_komponen/footer-situs";
import { HeaderSitus } from "./_komponen/header-situs";
import { kelasTombolSitus } from "./_komponen/tombol";

export const metadata: Metadata = { title: "Halaman tidak ditemukan" };

// not-found dirender di dalam root layout (bukan (publik)), jadi header dan footer dipasang di sini.
export default function NotFound() {
  return (
    <>
      {/* Header + main mengisi tepat satu layar penuh; hanya footer yang boleh berada di luar layar. */}
      <div className="flex min-h-dvh flex-col">
        <HeaderSitus />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-[clamp(24px,6vh,96px)] text-center">
          <p
            aria-hidden
            className="text-[clamp(88px,min(22vh,34vw),200px)] leading-none font-extrabold tracking-tight text-tint select-none"
          >
            404
          </p>
          <IkonDaun size={32} className="mt-[clamp(8px,2vh,20px)] text-brand-600 short:hidden" />
          <h1 className="mt-[clamp(8px,2vh,16px)] text-3xl font-bold tracking-tight text-brand-900 md:text-4xl">
            Halaman ini belum panen
          </h1>
          <p className="mt-3 max-w-135 text-base leading-relaxed text-muted md:text-[17px]">
            Halaman yang kamu cari tidak ditemukan atau sudah dipindahkan. Coba kembali ke beranda atau kunjungi pusat
            bantuan.
          </p>
          <div className="mt-[clamp(16px,4vh,32px)] flex flex-wrap justify-center gap-3">
            <Link href="/" className={kelasTombolSitus("utama")}>
              Kembali ke Beranda
            </Link>
            <Link href="/bantuan" className={kelasTombolSitus("garis")}>
              Pusat Bantuan
            </Link>
          </div>
        </main>
      </div>
      <FooterSitus />
    </>
  );
}
