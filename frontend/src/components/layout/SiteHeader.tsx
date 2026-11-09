'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export interface BuyerProfile {
  id?: string;
  nama: string;
  email?: string;
  hp?: string;
  jenis?: 'konsumen' | 'umkm';
  avatarUrl?: string;
  avatarInitial?: string;
}

export type TabSiteHeader = 'beranda' | 'belanja' | 'kategori' | 'fitur' | 'keranjang';

export interface SiteHeaderProps {
  active?: TabSiteHeader;
  forceOpen?: '' | 'kategori' | 'fitur';
  forceMobile?: boolean;
  forceDrawer?: boolean;
  forceSection?: '' | 'kategori' | 'fitur';
  signedIn?: boolean;
  user?: BuyerProfile | null;
  cartCount?: number;
  keranjangCount?: number;
  notifCount?: number;
  unreadNotifCount?: number;
  unreadChatCount?: number;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  className?: string;
}

export function SiteHeader({
  active = 'beranda',
  forceOpen,
  forceMobile = false,
  forceDrawer,
  forceSection,
  signedIn = false,
  user,
  cartCount,
  keranjangCount,
  notifCount,
  unreadNotifCount,
  unreadChatCount = 0,
  onSearch,
  onLogout,
  className = '',
}: SiteHeaderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [buka, setBuka] = useState<'' | 'kategori' | 'fitur' | null>(null);
  const [laci, setLaci] = useState(false);
  const [bagianLaci, setBagianLaci] = useState<'' | 'kategori' | 'fitur'>('kategori');
  const [query, setQuery] = useState('');

  // Effective state respecting force props
  const effectiveBuka = forceOpen !== undefined ? (forceOpen === '' ? null : forceOpen) : buka;
  const effectiveLaci = forceDrawer !== undefined ? forceDrawer : laci;
  const effectiveBagian = forceSection !== undefined ? forceSection : bagianLaci;

  // Cart count resolution
  const totalCart = keranjangCount !== undefined ? keranjangCount : (cartCount !== undefined ? cartCount : 3);
  const totalNotif = unreadNotifCount !== undefined ? unreadNotifCount : (notifCount !== undefined ? notifCount : 5);
  const hasNotifications = totalNotif > 0 || unreadChatCount > 0;

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setBuka(null);
        setLaci(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setBuka(null);
        setLaci(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const userName = user?.nama ?? 'Dewi';
  const userInitial = user?.avatarInitial ?? (userName ? userName[0]?.toUpperCase() : 'D');
  const userRole = user?.jenis === 'umkm' ? 'UMKM' : 'Konsumen';

  const isCartActive = active === 'keranjang';
  const isBelanjaActive = active === 'belanja';

  return (
    <header
      ref={rootRef}
      className={`relative z-30 font-sans text-ink bg-cream border-b border-line ${className}`}
    >
      {/* Top Announcement Bar - hidden on mobile / forceMobile */}
      {!forceMobile && (
        <div className="hidden min-[960px]:block bg-tint border-b border-line">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-9 flex items-center justify-between gap-4 text-[13px] text-[#3f5247]">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Melayani pengiriman di seluruh Jawa Barat
            </span>
            <span className="flex items-center gap-5 shrink-0">
              <Link
                href="/petani"
                className="inline-flex items-center gap-1.5 text-brand-900 font-bold no-underline whitespace-nowrap hover:underline"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 20h10" />
                  <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                  <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                  <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                </svg>
                Jual di Pasok Tani
              </Link>
              <Link
                href="/bantuan"
                className="text-[#3f5247] no-underline whitespace-nowrap hover:underline"
              >
                Pusat Bantuan
              </Link>
            </span>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div
        className={`max-w-[1200px] mx-auto px-4 md:px-8 flex items-center gap-2 ${
          forceMobile ? 'h-16' : 'h-16 min-[960px]:h-[72px]'
        }`}
      >
        {/* Brand Logo Link */}
        <Link
          href="/"
          aria-label="Pasok Tani, ke beranda"
          className="shrink-0 inline-flex items-center gap-2.5 mr-3 no-underline"
        >
          {/* Logo Mark */}
          <span className="w-[35px] h-[35px] rounded-lg bg-brand-900 text-white grid place-items-center font-extrabold text-lg">
            🌱
          </span>
          <span className="text-[19px] font-extrabold tracking-tight text-brand-900 whitespace-nowrap">
            Pasok Tani
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        {!forceMobile && (
          <nav
            aria-label="Navigasi utama"
            className="hidden min-[960px]:flex items-center flex-1 min-w-0"
          >
            <ul className="list-none m-0 p-0 flex items-center gap-0.5">
              <li>
                <Link
                  href="/produk"
                  className={`h-11 inline-flex items-center px-3 rounded-[10px] text-ink text-[15px] font-semibold underline-offset-8 ${
                    isBelanjaActive ? 'underline decoration-2' : 'no-underline'
                  }`}
                >
                  Belanja
                </Link>
              </li>

              {/* Kategori Dropdown Trigger */}
              <li className="relative">
                <button
                  type="button"
                  aria-expanded={effectiveBuka === 'kategori'}
                  aria-controls="menu-kategori"
                  onClick={() => setBuka(effectiveBuka === 'kategori' ? null : 'kategori')}
                  className={`h-11 inline-flex items-center gap-1.5 px-3 rounded-[10px] text-ink text-[15px] font-semibold cursor-pointer border-0 ${
                    effectiveBuka === 'kategori' ? 'bg-tint' : 'bg-transparent'
                  }`}
                >
                  Kategori
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={effectiveBuka === 'kategori' ? 'rotate-180' : ''}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Kategori Megamenu Panel */}
                {effectiveBuka === 'kategori' && (
                  <div
                    id="menu-kategori"
                    className="absolute top-full left-0 pt-2.5 w-[min(880px,calc(100vw-48px))] z-50"
                  >
                    <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.95fr)] gap-6 p-6 bg-white border border-line rounded-[18px] shadow-[0_18px_48px_rgba(6,78,59,0.16)]">
                      {/* Column 1: Categories */}
                      <div className="min-w-0">
                        <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-wider text-[#5a6b60]">
                          Kategori
                        </p>
                        <ul className="list-none m-0 p-0 grid grid-cols-2 gap-0.5">
                          {[
                            { name: 'Sayuran', href: '/kategori/sayuran', bg: '#e3f1df', color: '#2f7a3e' },
                            { name: 'Buah', href: '/kategori/buah', bg: '#fde9d9', color: '#c2541c' },
                            { name: 'Bumbu & Rempah', href: '/kategori/bumbu-rempah', bg: '#fbe3df', color: '#b42318' },
                            { name: 'Beras & Biji', href: '/kategori/beras-biji', bg: '#f5eed6', color: '#8a6d1c' },
                            { name: 'Umbi-umbian', href: '/kategori/umbi', bg: '#f3e7da', color: '#8b5a2b' },
                            { name: 'Jamur', href: '/kategori/jamur', bg: '#ece8e1', color: '#6b5e4f' },
                          ].map((cat) => (
                            <li key={cat.name}>
                              <Link
                                href={cat.href}
                                className="flex items-center gap-2.5 min-h-11 px-2 py-1 rounded-[10px] text-ink text-sm font-semibold no-underline hover:bg-tint/60"
                              >
                                <span
                                  className="w-[30px] h-[30px] rounded-lg shrink-0 grid place-items-center text-xs font-extrabold"
                                  style={{ backgroundColor: cat.bg, color: cat.color }}
                                >
                                  🌱
                                </span>
                                {cat.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 2: Explore */}
                      <div className="min-w-0">
                        <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-wider text-[#5a6b60]">
                          Jelajahi
                        </p>
                        <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
                          <li>
                            <Link
                              href="/surplus"
                              className="flex gap-2.5 p-2 rounded-[10px] text-ink no-underline hover:bg-tint/60"
                            >
                              <span className="w-5 h-5 text-[#c2410c] shrink-0 mt-0.5">
                                🏷️
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-bold">Produk Surplus</span>
                                <span className="block text-[13px] leading-[1.4] text-[#5a6b60]">
                                  Diskon menjelang kedaluwarsa
                                </span>
                              </span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/daftar-tunggu"
                              className="flex gap-2.5 p-2 rounded-[10px] text-ink no-underline hover:bg-tint/60"
                            >
                              <span className="w-5 h-5 text-[#157a4c] shrink-0 mt-0.5">
                                📅
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-bold">Daftar Tunggu</span>
                                <span className="block text-[13px] leading-[1.4] text-[#5a6b60]">
                                  Hasil panen yang belum dipanen
                                </span>
                              </span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/petani"
                              className="flex gap-2.5 p-2 rounded-[10px] text-ink no-underline hover:bg-tint/60"
                            >
                              <span className="w-5 h-5 text-[#157a4c] shrink-0 mt-0.5">
                                👨‍🌾
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-bold">Direktori petani</span>
                                <span className="block text-[13px] leading-[1.4] text-[#5a6b60]">
                                  Profil, lencana, dan ulasan
                                </span>
                              </span>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Column 3: Newly Harvested */}
                      <div className="min-w-0 flex flex-col gap-2.5 p-4 rounded-[14px] bg-tint">
                        <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-brand-900">
                          Baru dipanen
                        </p>
                        <ul className="list-none m-0 p-0 flex flex-col gap-2 text-[13px]">
                          <li>
                            <Link
                              href="/produk/tomat-merah-lembang"
                              className="flex justify-between gap-2 text-ink no-underline hover:underline"
                            >
                              <span className="font-semibold truncate">Tomat Merah Lembang</span>
                              <span className="font-bold text-brand-900 shrink-0">Rp 14.000</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/produk/pakcoy-hidroponik-arcamanik"
                              className="flex justify-between gap-2 text-ink no-underline hover:underline"
                            >
                              <span className="font-semibold truncate">Pakcoy Hidroponik</span>
                              <span className="font-bold text-brand-900 shrink-0">Rp 22.000</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/produk/jamur-tiram-putih-kuningan"
                              className="flex justify-between gap-2 text-ink no-underline hover:underline"
                            >
                              <span className="font-semibold truncate">Jamur Tiram Putih</span>
                              <span className="font-bold text-[#c2410c] shrink-0">Rp 15.400</span>
                            </Link>
                          </li>
                        </ul>
                        <Link
                          href="/produk?urut=terbaru"
                          className="mt-auto inline-flex items-center gap-1.5 min-h-9 text-[13px] font-bold text-brand-900 no-underline hover:underline"
                        >
                          Lihat yang baru dipanen →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </li>

              {/* Fitur Dropdown Trigger */}
              <li className="relative">
                <button
                  type="button"
                  aria-expanded={effectiveBuka === 'fitur'}
                  aria-controls="menu-fitur"
                  onClick={() => setBuka(effectiveBuka === 'fitur' ? null : 'fitur')}
                  className={`h-11 inline-flex items-center gap-1.5 px-3 rounded-[10px] text-ink text-[15px] font-semibold cursor-pointer border-0 ${
                    effectiveBuka === 'fitur' ? 'bg-tint' : 'bg-transparent'
                  }`}
                >
                  Fitur
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={effectiveBuka === 'fitur' ? 'rotate-180' : ''}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Fitur Megamenu Panel */}
                {effectiveBuka === 'fitur' && (
                  <div
                    id="menu-fitur"
                    className="absolute top-full left-0 pt-2.5 w-[600px] z-50"
                  >
                    <div className="p-3 bg-white border border-line rounded-[18px] shadow-[0_18px_48px_rgba(6,78,59,0.16)]">
                      <ul className="list-none m-0 p-0 grid grid-cols-2 gap-0.5">
                        {[
                          { title: 'Foto stok asli', desc: 'Foto stok yang dijual, bertanggal panen.' },
                          { title: 'Komitmen pra-panen', desc: 'Amankan stok sebelum panen tiba.' },
                          { title: 'Keranjang Resep', desc: 'Daftar bahan per menu, pesan ulang mingguan.' },
                          { title: 'Diskon Surplus', desc: 'Diskon bertingkat, kurangi pangan terbuang.' },
                          { title: 'Lencana petani', desc: 'Tanda petani terverifikasi dan andal.' },
                          { title: 'Langganan produk', desc: 'Kabar stok baru atau harga turun.' },
                          { title: 'Pembayaran aman', desc: 'Dana ditahan sampai pesanan diterima.' },
                          { title: 'Pengiriman', desc: 'Kurir, antar sendiri, atau ambil di lahan.' },
                        ].map((item) => (
                          <li key={item.title}>
                            <Link
                              href="/pasok-tani"
                              className="flex gap-2.5 p-2 rounded-xl text-ink no-underline hover:bg-tint/60"
                            >
                              <span className="w-5 h-5 text-[#157a4c] shrink-0 mt-0.5">
                                ✨
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-bold">{item.title}</span>
                                <span className="block text-[13px] leading-[1.4] text-[#5a6b60]">
                                  {item.desc}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 pt-3 px-2.5 border-t border-line">
                        <Link
                          href="/pasok-tani"
                          className="inline-flex items-center gap-1.5 min-h-9 text-sm font-bold text-brand-900 no-underline hover:underline"
                        >
                          Lihat cara kerja lengkap →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        )}

        {/* Spacer on mobile */}
        {forceMobile && <span className="flex-1" />}

        {/* Desktop Search Bar (Wide) */}
        {!forceMobile && (
          <form
            role="search"
            onSubmit={handleSearchSubmit}
            className="relative hidden min-[1200px]:block flex-[0_1_260px] min-w-[160px] m-0"
          >
            <label htmlFor="cari-header" className="sr-only">
              Cari produk
            </label>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5a6b60"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute left-3.5 top-3"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="cari-header"
              type="search"
              placeholder="Cari cabai, beras…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-3 border-[1.5px] border-field-border rounded-xl bg-white text-ink text-[15px] focus:outline-none focus:border-brand-900"
            />
          </form>
        )}

        {/* Compact Search Button (Medium screens) */}
        {!forceMobile && (
          <Link
            href="/cari"
            aria-label="Cari produk"
            className="hidden max-[1199px]:min-[960px]:grid shrink-0 w-11 h-11 place-items-center border border-line rounded-xl bg-white text-ink no-underline"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
        )}

        {/* Guest Auth Buttons (Desktop) */}
        {!forceMobile && !signedIn && (
          <div className="hidden min-[960px]:flex items-center gap-2 ml-1 shrink-0">
            <Link
              href="/masuk"
              className="h-11 inline-flex items-center px-[18px] border-[1.5px] border-brand-900 rounded-xl bg-white text-brand-900 text-[15px] font-bold no-underline whitespace-nowrap hover:bg-cream"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="h-11 inline-flex items-center px-[18px] rounded-xl bg-brand-900 text-white text-[15px] font-bold no-underline whitespace-nowrap hover:bg-[#0a5d47]"
            >
              Daftar
            </Link>
          </div>
        )}

        {/* Signed-in Quick Actions (Desktop) */}
        {!forceMobile && signedIn && (
          <div className="hidden min-[960px]:flex items-center gap-2 ml-1 shrink-0">
            {/* Cart Icon Button */}
            <Link
              href="/keranjang"
              aria-label={`Keranjang, ${totalCart} barang`}
              aria-current={isCartActive ? 'page' : undefined}
              className={`relative shrink-0 w-11 h-11 grid place-items-center rounded-xl no-underline ${
                isCartActive
                  ? 'border-2 border-brand-900 bg-mint text-brand-900'
                  : 'border border-line bg-white text-ink'
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {totalCart > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#c2410c] text-white text-[11px] font-extrabold grid place-items-center border-2 border-cream"
                >
                  {totalCart > 99 ? '99+' : totalCart}
                </span>
              )}
            </Link>

            {/* Notification Bell Button */}
            <Link
              href="/notifikasi"
              aria-label={`Notifikasi, ${totalNotif} belum dibaca`}
              className="relative shrink-0 w-11 h-11 grid place-items-center border border-line rounded-xl bg-white text-ink no-underline"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
              </svg>
              {hasNotifications && (
                <span
                  aria-hidden="true"
                  className="absolute top-2.25 right-2.5 w-2 h-2 rounded-full bg-[#c2410c] border-2 border-white"
                />
              )}
            </Link>

            {/* User Profile Pill */}
            <Link
              href="/akun"
              aria-label={`Akun saya, ${userName}`}
              className="shrink-0 h-11 inline-flex items-center gap-2 pl-1 pr-3 border border-line rounded-full bg-white text-ink text-sm font-bold no-underline hover:bg-cream"
            >
              <span
                aria-hidden="true"
                className="w-[34px] h-[34px] rounded-full grid place-items-center bg-brand-900 text-white text-[13px] font-extrabold"
              >
                {userInitial}
              </span>
              {userName}
            </Link>
          </div>
        )}

        {/* Mobile Cart Button (when signed in) */}
        {(forceMobile || true) && (
          <div className={`${forceMobile ? 'block' : 'min-[960px]:hidden'} shrink-0`}>
            {signedIn && (
              <Link
                href="/keranjang"
                aria-label={`Keranjang, ${totalCart} barang`}
                aria-current={isCartActive ? 'page' : undefined}
                className={`relative shrink-0 w-11 h-11 grid place-items-center rounded-xl no-underline mr-1 ${
                  isCartActive
                    ? 'border-2 border-brand-900 bg-mint text-brand-900'
                    : 'border border-line bg-white text-ink'
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                {totalCart > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#c2410c] text-white text-[11px] font-extrabold grid place-items-center border-2 border-cream"
                  >
                    {totalCart > 99 ? '99+' : totalCart}
                  </span>
                )}
              </Link>
            )}
          </div>
        )}

        {/* Mobile Hamburger Drawer Toggle Button */}
        <div className={`${forceMobile ? 'block' : 'min-[960px]:hidden'} shrink-0`}>
          <button
            type="button"
            aria-expanded={effectiveLaci}
            aria-controls="laci-menu"
            aria-label={effectiveLaci ? 'Tutup menu' : 'Buka menu'}
            onClick={() => setLaci(!effectiveLaci)}
            className={`w-11 h-11 grid place-items-center border-0 rounded-xl cursor-pointer text-ink ${
              effectiveLaci ? 'bg-tint' : 'bg-transparent'
            }`}
          >
            {effectiveLaci ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {effectiveLaci && (
        <div
          id="laci-menu"
          className="absolute top-full left-0 right-0 max-h-[calc(100vh-64px)] overflow-y-auto px-4 md:px-8 pt-4 pb-6 bg-cream border-b border-line shadow-[0_18px_32px_rgba(6,78,59,0.12)] z-40"
        >
          {/* Mobile Search Form */}
          <form
            role="search"
            onSubmit={handleSearchSubmit}
            className="relative mb-3"
          >
            <label htmlFor="cari-laci" className="sr-only">
              Cari produk
            </label>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5a6b60"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute left-3.5 top-3.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="cari-laci"
              type="search"
              placeholder="Cari cabai, beras, tomat…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-3 border-[1.5px] border-field-border rounded-xl bg-white text-ink text-base focus:outline-none focus:border-brand-900"
            />
          </form>

          {/* Mobile Main Nav */}
          <nav aria-label="Menu utama">
            <ul className="list-none m-0 p-0 flex flex-col">
              <li className="border-b border-line">
                <Link
                  href="/produk"
                  className="flex items-center min-h-[52px] px-1 text-ink text-base font-bold no-underline"
                >
                  Belanja
                </Link>
              </li>

              {/* Kategori Accordion */}
              <li className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={effectiveBagian === 'kategori'}
                  aria-controls="laci-kategori"
                  onClick={() => setBagianLaci(effectiveBagian === 'kategori' ? '' : 'kategori')}
                  className="w-full min-h-[52px] flex items-center justify-between px-1 border-0 bg-transparent text-ink text-base font-bold cursor-pointer"
                >
                  Kategori
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={effectiveBagian === 'kategori' ? 'rotate-180' : ''}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {effectiveBagian === 'kategori' && (
                  <ul
                    id="laci-kategori"
                    className="list-none m-0 pb-3 grid grid-cols-2 gap-x-3 gap-y-0.5"
                  >
                    <li><Link href="/surplus" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Produk Surplus</Link></li>
                    <li><Link href="/daftar-tunggu" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Daftar Tunggu</Link></li>
                    <li><Link href="/petani" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Direktori petani</Link></li>
                    <li><Link href="/kategori/sayuran" className="flex items-center min-h-11 px-2 text-[#3f5247] text-[15px] no-underline">Sayuran</Link></li>
                    <li><Link href="/kategori/buah" className="flex items-center min-h-11 px-2 text-[#3f5247] text-[15px] no-underline">Buah</Link></li>
                    <li><Link href="/kategori/bumbu-rempah" className="flex items-center min-h-11 px-2 text-[#3f5247] text-[15px] no-underline">Bumbu & Rempah</Link></li>
                    <li><Link href="/kategori/beras-biji" className="flex items-center min-h-11 px-2 text-[#3f5247] text-[15px] no-underline">Beras & Biji</Link></li>
                    <li><Link href="/kategori/umbi" className="flex items-center min-h-11 px-2 text-[#3f5247] text-[15px] no-underline">Umbi-umbian</Link></li>
                    <li><Link href="/kategori/jamur" className="flex items-center min-h-11 px-2 text-[#3f5247] text-[15px] no-underline">Jamur</Link></li>
                  </ul>
                )}
              </li>

              {/* Fitur Accordion */}
              <li className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={effectiveBagian === 'fitur'}
                  aria-controls="laci-fitur"
                  onClick={() => setBagianLaci(effectiveBagian === 'fitur' ? '' : 'fitur')}
                  className="w-full min-h-[52px] flex items-center justify-between px-1 border-0 bg-transparent text-ink text-base font-bold cursor-pointer"
                >
                  Fitur
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={effectiveBagian === 'fitur' ? 'rotate-180' : ''}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {effectiveBagian === 'fitur' && (
                  <ul
                    id="laci-fitur"
                    className="list-none m-0 pb-3 grid grid-cols-2 gap-x-3 gap-y-0.5"
                  >
                    <li><Link href="/pasok-tani" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Foto stok asli</Link></li>
                    <li><Link href="/pasok-tani" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Komitmen pra-panen</Link></li>
                    <li><Link href="/pasok-tani" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Keranjang Resep</Link></li>
                    <li><Link href="/pasok-tani" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Diskon Surplus</Link></li>
                    <li><Link href="/pasok-tani" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Lencana petani</Link></li>
                    <li><Link href="/pasok-tani" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Langganan produk</Link></li>
                    <li><Link href="/pasok-tani" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Pembayaran aman</Link></li>
                    <li><Link href="/pasok-tani" className="flex items-center min-h-11 px-2 text-ink text-[15px] font-semibold no-underline">Pengiriman</Link></li>
                  </ul>
                )}
              </li>
            </ul>
          </nav>

          {/* Quick secondary links */}
          <div className="flex flex-col mt-2">
            <Link
              href="/petani"
              className="flex items-center gap-2 min-h-11 px-1 text-brand-900 text-[15px] font-bold no-underline"
            >
              🌱 Jual di Pasok Tani
            </Link>
            <Link
              href="/bantuan"
              className="flex items-center min-h-11 px-1 text-[#3f5247] text-[15px] no-underline"
            >
              Pusat Bantuan
            </Link>
          </div>

          {/* Guest Auth Action Row */}
          {!signedIn && (
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <Link
                href="/masuk"
                className="h-12 flex items-center justify-center border-[1.5px] border-brand-900 rounded-xl bg-white text-brand-900 text-base font-bold no-underline"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="h-12 flex items-center justify-center rounded-xl bg-brand-900 text-white text-base font-bold no-underline"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Signed-in Account Options in Drawer */}
          {signedIn && (
            <div className="mt-3 pt-2 border-t border-line">
              <p className="my-2 mx-1 flex items-center gap-2.5 text-[15px] font-extrabold text-ink">
                <span
                  aria-hidden="true"
                  className="w-[34px] h-[34px] rounded-full grid place-items-center bg-brand-900 text-white text-[13px] font-extrabold"
                >
                  {userInitial}
                </span>
                {userName} · {userRole}
              </p>
              <ul className="list-none m-0 p-0 grid grid-cols-2 gap-x-3 gap-y-0.5">
                <li><Link href="/pesanan" className="flex items-center min-h-11 px-1 text-ink text-[15px] font-semibold no-underline">Pesanan saya</Link></li>
                <li><Link href="/keranjang-resep" className="flex items-center min-h-11 px-1 text-ink text-[15px] font-semibold no-underline">Keranjang Resep</Link></li>
                <li><Link href="/notifikasi" className="flex items-center min-h-11 px-1 text-ink text-[15px] font-semibold no-underline">Notifikasi</Link></li>
                <li><Link href="/akun" className="flex items-center min-h-11 px-1 text-ink text-[15px] font-semibold no-underline">Akun</Link></li>
              </ul>
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 w-full h-12 border-[1.5px] border-line rounded-xl bg-white text-[#8a1c12] text-[15px] font-bold cursor-pointer"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default SiteHeader;
