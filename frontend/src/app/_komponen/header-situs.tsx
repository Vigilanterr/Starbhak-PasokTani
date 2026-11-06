"use client";

import Link from "next/link";
import { useState } from "react";
import { kelasTombolSitus } from "./tombol";

// Tautan beranda menunjuk ke bagian halaman utama (landing) yang belum dibuat.
const NAV = [
  { label: "Beranda", href: "/" },
  { label: "Fitur", href: "/#fitur" },
  { label: "Tentang", href: "/#tentang" },
  { label: "Testimoni", href: "/#testimoni" },
  { label: "Kontak", href: "/#kontak" },
];

// TODO: ganti placeholder dengan logo Pasok Tani setelah aset logo tersedia.
function LogoSitus() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3 whitespace-nowrap no-underline">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#d9d9d9] text-[11px] text-ink">
        Logo
      </span>
      <span className="text-lg font-medium text-muted">Pasok Tani</span>
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
          <ul className="flex flex-col whitespace-nowrap lg:flex-row lg:items-center lg:gap-10 xl:gap-14">
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
          </ul>
        </nav>

        <div className="flex items-center gap-2 lg:justify-self-end">
          <Link href="/masuk" className={`${kelasTombolSitus("aksen")} whitespace-nowrap`}>
            Masuk
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
