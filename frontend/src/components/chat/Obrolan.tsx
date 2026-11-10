'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { NavBawah } from '../layout/NavBawah';
import { DaftarObrolan } from './DaftarObrolan';
import type { RoleChat, ObrolanListItem } from './types';

export interface ObrolanProps {
  kosong?: boolean;
  peran?: RoleChat;
  daftar?: ObrolanListItem[];
  onPilih?: (id: string) => void;
  onPilihObrolan?: (id: string) => void;
  className?: string;
}

export function Obrolan({
  kosong = false,
  peran = 'pembeli',
  daftar,
  onPilih,
  onPilihObrolan,
  className = '',
}: ObrolanProps) {
  const [isMobile, setIsMobile] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkWidth = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 900);
      }
    };

    checkWidth();

    if (rootRef.current && typeof window !== 'undefined' && 'ResizeObserver' in window) {
      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setIsMobile(entry.contentRect.width < 900);
        }
      });
      ro.observe(rootRef.current);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', checkWidth);
      return () => window.removeEventListener('resize', checkWidth);
    }
  }, []);

  const handlePilih = (id: string) => {
    if (onPilih) onPilih(id);
    if (onPilihObrolan) onPilihObrolan(id);
  };

  return (
    <div
      ref={rootRef}
      className={`relative min-h-screen bg-cream font-sans text-ink flex flex-col justify-between ${className}`}
    >
      <div>
        <SiteHeader signedIn={true} cartCount={0} />

        <main className="max-w-[1200px] mx-auto px-4 pt-4 pb-0 md:px-6 md:pt-7 md:pb-16 box-border">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 mb-4">
            <h1 className="m-0 text-[28px] md:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
              Obrolan
            </h1>
            <p className="m-0 text-[13px] text-[#5a6b60]">
              Hanya dengan petani dari pesananmu atau halaman produk. Pesan baru tampil langsung.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-full md:w-[400px] md:shrink-0 min-w-0 box-border">
              <DaftarObrolan
                peran={peran}
                aktif=""
                sempit={isMobile}
                kosong={kosong}
                daftar={daftar}
                onPilih={handlePilih}
              />
            </div>

            <section
              aria-label="Percakapan"
              className="hidden md:flex flex-1 min-w-0 min-h-[520px] box-border p-8 border-[1.5px] border-dashed border-[#c9d2c6] rounded-2xl bg-white flex-col items-center justify-center gap-2.5 text-center"
            >
              <span
                aria-hidden="true"
                className="w-14 h-14 rounded-full grid place-items-center bg-[#ebf2eb] text-[#157a4c]"
              >
                <svg
                  className="w-[26px] h-[26px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </span>
              <h2 className="m-0 text-lg font-extrabold text-ink">Pilih percakapan</h2>
              <p className="m-0 max-w-[36ch] text-sm leading-[1.55] text-[#3f5247]">
                Percakapan terbuka di sini. Kartu produk dan pesanan di dalam obrolan membawamu langsung ke halamannya.
              </p>
            </section>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="block md:hidden sticky bottom-0 z-5 mt-6">
        <NavBawah aktif="akun" />
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <SiteFooter />
      </div>
    </div>
  );
}
