'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export type TabTokoNavBawah = 'beranda' | 'pesanan' | 'produk' | 'prapanen' | 'lainnya';

export interface TokoNavBawahProps {
  aktif?: TabTokoNavBawah;
  ruteAktif?: string;
  badgePesanan?: number;
  badgeObrolan?: number;
  saldoTarik?: string;
  statusVerifikasi?: string;
  badgeCounts?: Record<string, number>;
  onLogout?: () => void;
  className?: string;
}

export function TokoNavBawah({
  aktif: aktifProp,
  ruteAktif,
  badgePesanan = 3,
  badgeObrolan = 2,
  saldoTarik = 'Rp 842.500',
  statusVerifikasi = 'Terverifikasi',
  badgeCounts = {},
  onLogout,
  className = '',
}: TokoNavBawahProps) {
  const [bukaLainnya, setBukaLainnya] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resolve active tab
  let resolvedAktif: TabTokoNavBawah = aktifProp ?? 'beranda';
  if (ruteAktif) {
    if (ruteAktif.includes('pesanan')) resolvedAktif = 'pesanan';
    else if (ruteAktif.includes('produk') || ruteAktif.includes('stok')) resolvedAktif = 'produk';
    else if (ruteAktif.includes('prapanen') || ruteAktif.includes('daftar-tunggu')) resolvedAktif = 'prapanen';
    else if (
      ruteAktif.includes('keuangan') ||
      ruteAktif.includes('obrolan') ||
      ruteAktif.includes('ulasan') ||
      ruteAktif.includes('analitik') ||
      ruteAktif.includes('lencana') ||
      ruteAktif.includes('pengaturan') ||
      ruteAktif.includes('verifikasi')
    ) {
      resolvedAktif = 'lainnya';
    } else if (ruteAktif.includes('beranda') || ruteAktif === '/toko') {
      resolvedAktif = 'beranda';
    }
  }

  const pesananBadge = badgeCounts['pesanan'] ?? badgePesanan;
  const obrolanBadge = badgeCounts['obrolan'] ?? badgeObrolan;

  // Close popover on outside click or Escape
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setBukaLainnya(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setBukaLainnya(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const highlightedTab = bukaLainnya ? 'lainnya' : resolvedAktif;

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-0 left-0 right-0 z-40 w-full font-sans max-[899px]:block ${className}`}
    >
      {/* Expandable Popover Sheet for "Lainnya" */}
      {bukaLainnya && (
        <div
          id="toko-lainnya"
          className="absolute left-2 right-2 bottom-[calc(100%+8px)] box-border p-2 border border-line rounded-2xl bg-white shadow-[0_-12px_32px_rgba(6,78,59,0.16)] z-30"
        >
          <ul className="list-none m-0 p-0 grid grid-cols-2 gap-0.5">
            <li>
              <Link
                href="/toko/keuangan"
                className="flex flex-col justify-center min-h-[52px] px-3 py-1 rounded-[10px] text-ink no-underline hover:bg-tint/50"
              >
                <strong className="text-sm">Keuangan</strong>
                <span className="text-xs text-[#3f5247]">Bisa ditarik {saldoTarik}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/toko/obrolan"
                className="flex flex-col justify-center min-h-[52px] px-3 py-1 rounded-[10px] text-ink no-underline hover:bg-tint/50"
              >
                <strong className="text-sm">Obrolan</strong>
                <span className="text-xs text-[#9a3412] font-bold">
                  {obrolanBadge} belum dibaca
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/toko/ulasan"
                className="flex items-center min-h-[52px] px-3 rounded-[10px] text-ink text-sm font-bold no-underline hover:bg-tint/50"
              >
                Ulasan
              </Link>
            </li>
            <li>
              <Link
                href="/toko/analitik"
                className="flex items-center min-h-[52px] px-3 rounded-[10px] text-ink text-sm font-bold no-underline hover:bg-tint/50"
              >
                Analitik
              </Link>
            </li>
            <li>
              <Link
                href="/toko/lencana"
                className="flex items-center min-h-[52px] px-3 rounded-[10px] text-ink text-sm font-bold no-underline hover:bg-tint/50"
              >
                Lencana
              </Link>
            </li>
            <li>
              <Link
                href="/toko/pengaturan"
                className="flex items-center min-h-[52px] px-3 rounded-[10px] text-ink text-sm font-bold no-underline hover:bg-tint/50"
              >
                Pengaturan toko
              </Link>
            </li>
            <li>
              <Link
                href="/toko/verifikasi"
                className="flex flex-col justify-center min-h-[52px] px-3 py-1 rounded-[10px] text-ink no-underline hover:bg-tint/50"
              >
                <strong className="text-sm">Verifikasi</strong>
                <span className="text-xs text-[#157a4c] font-bold">{statusVerifikasi}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/petani/kebun-mang-ujang"
                className="flex items-center min-h-[52px] px-3 rounded-[10px] text-ink text-sm font-bold no-underline hover:bg-tint/50"
              >
                Lihat toko
              </Link>
            </li>
          </ul>

          <div className="flex justify-between items-center gap-2 mt-1.5 pt-2 px-1 border-t border-[#eef0eb]">
            <Link
              href="/bantuan/petani"
              className="inline-flex items-center min-h-11 px-2 text-[#3f5247] text-[13px] no-underline hover:underline"
            >
              Pusat Bantuan Petani
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="min-h-11 px-3 border-0 bg-transparent text-[#8a1c12] text-sm font-bold cursor-pointer hover:underline"
            >
              Keluar
            </button>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav
        aria-label="Menu toko"
        className="box-border w-full px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] bg-white border-t border-line shadow-[0_-6px_18px_rgba(23,59,43,0.06)]"
      >
        <ul className="list-none m-0 p-0 grid grid-cols-5">
          {/* 1. Beranda */}
          <li>
            <Link
              href="/toko"
              aria-current={resolvedAktif === 'beranda' ? 'page' : undefined}
              className={`min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-xs no-underline ${
                highlightedTab === 'beranda'
                  ? 'text-brand-900 font-extrabold'
                  : 'text-[#3f5247] font-semibold'
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-[52px] h-[30px] rounded-full grid place-items-center ${
                  highlightedTab === 'beranda' ? 'bg-mint text-brand-900' : 'bg-transparent text-[#3f5247]'
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </span>
              Beranda
            </Link>
          </li>

          {/* 2. Pesanan */}
          <li>
            <Link
              href="/toko/pesanan"
              aria-current={resolvedAktif === 'pesanan' ? 'page' : undefined}
              className={`relative min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-xs no-underline ${
                highlightedTab === 'pesanan'
                  ? 'text-brand-900 font-extrabold'
                  : 'text-[#3f5247] font-semibold'
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-[52px] h-[30px] rounded-full grid place-items-center ${
                  highlightedTab === 'pesanan' ? 'bg-mint text-brand-900' : 'bg-transparent text-[#3f5247]'
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                  <path d="M12 22V12" />
                  <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
                  <path d="m7.5 4.27 9 5.15" />
                </svg>
              </span>
              Pesanan
              {pesananBadge > 0 && (
                <span
                  aria-label={`${pesananBadge} pesanan baru`}
                  className="absolute top-0.5 left-[calc(50%+8px)] min-w-[18px] h-[18px] px-1 rounded-full bg-[#c2410c] text-white text-[11px] font-extrabold grid place-items-center border-2 border-white"
                >
                  {pesananBadge > 99 ? '99+' : pesananBadge}
                </span>
              )}
            </Link>
          </li>

          {/* 3. Produk */}
          <li>
            <Link
              href="/toko/produk"
              aria-current={resolvedAktif === 'produk' ? 'page' : undefined}
              className={`min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-xs no-underline ${
                highlightedTab === 'produk'
                  ? 'text-brand-900 font-extrabold'
                  : 'text-[#3f5247] font-semibold'
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-[52px] h-[30px] rounded-full grid place-items-center ${
                  highlightedTab === 'produk' ? 'bg-mint text-brand-900' : 'bg-transparent text-[#3f5247]'
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46" />
                  <path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z" />
                  <path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z" />
                </svg>
              </span>
              Produk
            </Link>
          </li>

          {/* 4. Pra-panen */}
          <li>
            <Link
              href="/toko/daftar-tunggu"
              aria-current={resolvedAktif === 'prapanen' ? 'page' : undefined}
              className={`min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-xs no-underline ${
                highlightedTab === 'prapanen'
                  ? 'text-brand-900 font-extrabold'
                  : 'text-[#3f5247] font-semibold'
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-[52px] h-[30px] rounded-full grid place-items-center ${
                  highlightedTab === 'prapanen' ? 'bg-mint text-brand-900' : 'bg-transparent text-[#3f5247]'
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 20h10" />
                  <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                  <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                  <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                </svg>
              </span>
              Pra-panen
            </Link>
          </li>

          {/* 5. Lainnya (Toggle Button) */}
          <li>
            <button
              type="button"
              aria-expanded={bukaLainnya}
              aria-controls="toko-lainnya"
              onClick={() => setBukaLainnya(!bukaLainnya)}
              className={`w-full min-h-[52px] flex flex-col items-center justify-center gap-0.5 border-0 bg-transparent text-xs cursor-pointer ${
                highlightedTab === 'lainnya'
                  ? 'text-brand-900 font-extrabold'
                  : 'text-[#3f5247] font-semibold'
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-[52px] h-[30px] rounded-full grid place-items-center ${
                  highlightedTab === 'lainnya' ? 'bg-mint text-brand-900' : 'bg-transparent text-[#3f5247]'
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </span>
              Lainnya
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default TokoNavBawah;
