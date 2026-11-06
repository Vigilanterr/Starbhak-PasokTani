"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { kelasTombolSitus } from "./tombol";

// Bagian landing (/#...) + katalog produk.
const NAV = [
  { label: "Tentang", href: "/#tentang" },
  { label: "Fitur", href: "/#fitur" },
  { label: "Cara Kerja", href: "/#cara-kerja" },
  { label: "Produk", href: "/produk" },
  { label: "Kontak", href: "/#kontak" },
];

function LogoSitus() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap no-underline">
      <Image src="/images/logo/color-logo-pasoktani.png" alt="" width={40} height={37} priority className="h-9 w-auto" />
      <span className="text-lg font-bold text-brand-900">Pasok Tani</span>
    </Link>
  );
}

// Di bawah breakpoint lg, navigasi diciutkan menjadi menu hamburger agar header tidak meluap.
export function HeaderSitus() {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <header className="relative border-b border-line bg-cream">
      <div className="flex items-center justify-between gap-4 px-4 py-3 lg:grid lg:min-h-21.5 lg:grid-cols-[1fr_auto_1fr] lg:px-15 lg:py-0">
        <LogoSitus />

        <nav
          id="navigasi-utama"
          aria-label="Navigasi utama"
          className={`${
            terbuka ? "absolute inset-x-0 top-full z-10 border-b border-line bg-cream px-4 pb-3 shadow-sm" : "hidden"
          } lg:static lg:block lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          <ul className="flex flex-col whitespace-nowrap lg:flex-row lg:items-center lg:gap-8 xl:gap-12">
            {NAV.map((n) => (
              <li key={n.label}>
                <Link
                  href={n.href}
                  onClick={() => setTerbuka(false)}
                  className="block py-3 text-[17px] font-medium text-ink no-underline hover:text-brand-600 lg:py-0"
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="sm:hidden">
              <Link href="/masuk" onClick={() => setTerbuka(false)} className="block py-3 text-[17px] font-medium text-ink no-underline hover:text-brand-600">
                Masuk
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2 lg:justify-self-end">
          <Link href="/masuk" className={`${kelasTombolSitus("garis")} hidden whitespace-nowrap sm:inline-flex`}>
            Masuk
          </Link>
          <Link href="/daftar" className={`${kelasTombolSitus("aksen")} whitespace-nowrap`}>
            Daftar
          </Link>
          <button
            type="button"
            aria-label={terbuka ? "Tutup menu" : "Buka menu"}
            aria-expanded={terbuka}
            aria-controls="navigasi-utama"
            onClick={() => setTerbuka((v) => !v)}
            className="grid size-12 cursor-pointer place-items-center rounded-[10px] text-ink hover:bg-tint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {terbuka ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
