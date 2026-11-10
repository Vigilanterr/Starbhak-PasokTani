'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { AkunMenu } from '../layout/AkunMenu';
import { NavBawah } from '../layout/NavBawah';

export interface BuyerProfile {
  nama: string;
  email: string;
  hp: string;
  jenis: 'konsumen' | 'umkm';
  avatarUrl?: string;
  avatarInitial?: string;
}

export interface OrderStatusCounts {
  belumBayar: number;
  diproses: number;
  dikirim: number;
  perluKonfirmasi: number;
}

export interface AkunSummaryCard {
  judul: string;
  nilai: string;
  ket: string;
  href: string;
}

export interface PesananTerbaruSummary {
  id: string;
  nomorPesanan: string;
  namaToko: string;
  totalHarga: number;
  status: string;
  tanggal: string;
}

export interface AkunRingkasanData {
  user?: BuyerProfile;
  saldoDompet?: number | string;
  pesananBerjalanCount?: number;
  komitmenAktifCount?: number;
  resepCount?: number;
  langgananCount?: number;
  alamatCount?: number;
  pesananTerbaru?: PesananTerbaruSummary[];
}

export interface AkunProps {
  user?: BuyerProfile;
  saldoDompet?: number | string;
  statusPesananCounts?: OrderStatusCounts;
  summaryCards?: AkunSummaryCard[];
  data?: AkunRingkasanData;
  onLogout?: () => void;
  className?: string;
}

const DEFAULT_USER: BuyerProfile = {
  nama: 'Dewi Lestari',
  email: 'dewi.lestari@contoh.id',
  hp: '0812-3456-7890',
  jenis: 'umkm',
};

const DEFAULT_COUNTS: OrderStatusCounts = {
  belumBayar: 1,
  diproses: 1,
  dikirim: 1,
  perluKonfirmasi: 1,
};

const DEFAULT_CARDS: AkunSummaryCard[] = [
  {
    judul: 'Dompet',
    nilai: 'Rp 63.500',
    ket: 'Dari pengembalian pesanan PT-26102207. Bisa dipakai untuk Komitmen, atau membayar pesanan yang totalnya tertutup saldo.',
    href: '/dompet',
  },
  {
    judul: 'Komitmen pra-panen',
    nilai: '2 aktif',
    ket: 'Rp 180.000 ditahan untuk bawang merah dan beras. Panen paling cepat 18 Nov.',
    href: '/komitmen',
  },
  {
    judul: 'Alamat utama',
    nilai: 'Warung Dewi',
    ket: 'Cigadung, Cibeunying Kaler, Kota Bandung. 2 alamat tersimpan.',
    href: '/akun/alamat',
  },
  {
    judul: 'Keranjang Resep',
    nilai: '2 resep',
    ket: 'Nasi Goreng dan Sayur Asem. Terakhir dipesan Sen, 2 Nov.',
    href: '/keranjang-resep',
  },
  {
    judul: 'Langganan produk',
    nilai: '5 produk',
    ket: '2 kabar baru: kol masuk Surplus, tomat ada stok baru.',
    href: '/langganan',
  },
  {
    judul: 'Daftar Tunggu diikuti',
    nilai: '3 tanaman',
    ket: 'Jadwal panen bawang merah Cirebon mundur ke 25 Nov.',
    href: '/daftar-tunggu',
  },
];

export function Akun({
  user: userProp,
  saldoDompet = 'Rp 63.500',
  statusPesananCounts = DEFAULT_COUNTS,
  summaryCards = DEFAULT_CARDS,
  data,
  onLogout,
  className = '',
}: AkunProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof window === 'undefined' || !window.ResizeObserver) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSempit(entry.contentRect.width < 900);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const currentUser = data?.user ?? userProp ?? DEFAULT_USER;
  const initial =
    currentUser.avatarInitial ??
    (currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : 'D');
  const roleLabel =
    currentUser.jenis === 'umkm' ? 'Pembeli UMKM' : 'Rumah Tangga';

  const resolvedSaldo =
    typeof saldoDompet === 'number'
      ? `Rp ${saldoDompet.toLocaleString('id-ID')}`
      : String(saldoDompet);

  const statusList = [
    {
      label: 'Belum bayar',
      jumlah: statusPesananCounts.belumBayar,
      latar: '#fffdf5',
      warnaAngka: '#92400e',
      href: '/pesanan?status=belum-bayar',
    },
    {
      label: 'Diproses',
      jumlah: statusPesananCounts.diproses,
      latar: '#f6f8f4',
      warnaAngka: '#173b2b',
      href: '/pesanan?status=diproses',
    },
    {
      label: 'Dikirim',
      jumlah: statusPesananCounts.dikirim,
      latar: '#f6f8f4',
      warnaAngka: '#166534',
      href: '/pesanan?status=dikirim',
    },
    {
      label: 'Perlu konfirmasi',
      jumlah: statusPesananCounts.perluKonfirmasi,
      latar: '#f3faf3',
      warnaAngka: '#064e3b',
      href: '/pesanan?status=perlu-konfirmasi',
    },
  ];

  const grupMenuMobile = [
    {
      judul: 'Belanja',
      item: [
        {
          label: 'Komitmen pra-panen',
          ket: `${data?.komitmenAktifCount ?? 2} aktif`,
          href: '/komitmen',
          urgen: false,
        },
        {
          label: 'Daftar Tunggu diikuti',
          ket: '1 jadwal berubah',
          href: '/daftar-tunggu',
          urgen: true,
        },
        {
          label: 'Keranjang Resep',
          ket: `${data?.resepCount ?? 2} resep`,
          href: '/keranjang-resep',
          urgen: false,
        },
        {
          label: 'Langganan produk',
          ket: `${data?.langgananCount ?? 5} produk`,
          href: '/langganan',
          urgen: false,
        },
      ],
    },
    {
      judul: 'Akun',
      item: [
        {
          label: 'Dompet',
          ket: resolvedSaldo,
          href: '/dompet',
          urgen: false,
        },
        {
          label: 'Alamat pengiriman',
          ket: `${data?.alamatCount ?? 2} alamat`,
          href: '/akun/alamat',
          urgen: false,
        },
        {
          label: 'Profil',
          ket: '',
          href: '/akun/profil',
          urgen: false,
        },
        {
          label: 'Pengaturan notifikasi',
          ket: '',
          href: '/akun/notifikasi',
          urgen: false,
        },
        {
          label: 'Keamanan',
          ket: '',
          href: '/akun/keamanan',
          urgen: false,
        },
      ],
    },
    {
      judul: 'Lainnya',
      item: [
        {
          label: 'Pusat Bantuan',
          ket: '',
          href: '/bantuan',
          urgen: false,
        },
        {
          label: 'Kebijakan privasi',
          ket: '',
          href: '/bantuan/kebijakan-privasi',
          urgen: false,
        },
        {
          label: 'Syarat dan ketentuan',
          ket: '',
          href: '/bantuan/syarat-ketentuan',
          urgen: false,
        },
      ],
    },
  ];

  return (
    <div
      ref={rootRef}
      className={`min-h-full bg-cream font-sans text-ink ${className}`}
    >
      <SiteHeader
        active="beranda"
        signedIn={true}
        user={{
          nama: currentUser.nama,
          email: currentUser.email,
          hp: currentUser.hp,
          jenis: currentUser.jenis,
        }}
        cartCount={0}
      />

      <main className="max-w-[1200px] mx-auto px-4 py-4 min-[900px]:px-6 min-[900px]:py-7 min-[900px]:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Desktop Left Sidebar */}
          {!sempit && (
            <div className="flex-[0_0_272px] min-w-0">
              <AkunMenu
                aktif="ringkasan"
                namaUser={currentUser.nama}
                peranUser={roleLabel}
                initialUser={initial}
                saldoDompet={resolvedSaldo}
                onLogout={onLogout}
              />
            </div>
          )}

          {/* Main Dashboard Column */}
          <div className="flex-[999_1_560px] min-w-0 max-w-[820px] flex flex-col gap-4">
            <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
              Akun saya
            </h1>

            {/* Profil Summary Box */}
            <section
              aria-label="Profil"
              className="flex flex-wrap items-center gap-3.5 p-4.5 px-5 border border-line rounded-2xl bg-white"
            >
              <span
                aria-hidden="true"
                className="shrink-0 w-14 h-14 rounded-full grid place-items-center bg-brand-900 text-white text-xl font-extrabold"
              >
                {initial}
              </span>
              <div className="flex-[1_1_200px] min-w-0">
                <p className="m-0 flex flex-wrap items-center gap-2 text-lg font-extrabold text-ink">
                  {currentUser.nama}
                  <span className="px-2 py-0.5 rounded-full bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
                    {roleLabel}
                  </span>
                </p>
                <p className="m-0 mt-0.5 text-[13px] text-[#3f5247]">
                  {currentUser.email} · {currentUser.hp}
                </p>
              </div>
              <Link
                href="/akun/profil"
                className="shrink-0 inline-flex items-center min-h-11 px-4 border border-line rounded-xl text-brand-900 text-sm font-extrabold no-underline hover:bg-cream"
              >
                Ubah profil
              </Link>
            </section>

            {/* Pesanan Status Section */}
            <section
              aria-labelledby="judul-status-pesanan"
              className="p-4.5 px-5 border border-line rounded-2xl bg-white"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2
                  id="judul-status-pesanan"
                  className="m-0 text-[17px] font-extrabold text-ink"
                >
                  Pesanan
                </h2>
                <Link
                  href="/pesanan"
                  className="inline-flex items-center gap-1 min-h-10 text-[#157a4c] text-sm font-bold no-underline hover:underline"
                >
                  Semua pesanan
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </div>

              <ul className="list-none m-0 p-0 grid grid-cols-4 gap-2">
                {statusList.map((sp, idx) => (
                  <li key={idx}>
                    <Link
                      href={sp.href}
                      style={{ backgroundColor: sp.latar }}
                      className="flex flex-col items-center gap-1.5 min-h-[88px] p-3 px-1 box-border rounded-xl text-ink no-underline text-center hover:opacity-90"
                    >
                      <span
                        style={{ color: sp.warnaAngka }}
                        className="text-2xl font-extrabold leading-none"
                      >
                        {sp.jumlah}
                      </span>
                      <span className="text-xs font-bold leading-[1.3] text-ink">
                        {sp.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Desktop 6 Summary Cards */}
            {!sempit && (
              <div className="grid grid-cols-2 gap-4">
                {summaryCards.map((k, idx) => (
                  <Link
                    key={idx}
                    href={k.href}
                    className="flex flex-col gap-2 p-4.5 px-5 border border-line rounded-2xl bg-white text-ink no-underline hover:border-brand-900"
                  >
                    <span className="flex items-center justify-between gap-2 text-[15px] font-extrabold">
                      {k.judul}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#157a4c"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                    <span className="text-xl font-extrabold text-brand-900">
                      {k.nilai}
                    </span>
                    <span className="text-[13px] leading-[1.5] text-[#3f5247]">
                      {k.ket}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Navigation List (<900px) */}
            {sempit && (
              <div className="flex flex-col gap-4">
                {grupMenuMobile.map((gm, gIdx) => (
                  <section key={gIdx} aria-label={gm.judul}>
                    <h2 className="m-0 mb-2 ml-1 text-[13px] font-bold text-[#5a6b60]">
                      {gm.judul}
                    </h2>
                    <ul className="list-none m-0 p-0 border border-line rounded-2xl bg-white overflow-hidden">
                      {gm.item.map((mi, iIdx) => (
                        <li
                          key={iIdx}
                          className={iIdx > 0 ? 'border-t border-[#eef0eb]' : ''}
                        >
                          <Link
                            href={mi.href}
                            className="flex items-center gap-3 min-h-14 px-4 text-ink no-underline hover:bg-cream"
                          >
                            <span className="flex-1 min-w-0 text-[15px] font-bold">
                              {mi.label}
                            </span>
                            {mi.ket && (
                              <span
                                className={`shrink-0 text-[13px] font-semibold ${
                                  mi.urgen ? 'text-[#9a3412]' : 'text-[#5a6b60]'
                                }`}
                              >
                                {mi.ket}
                              </span>
                            )}
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#7d877e"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              className="shrink-0"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}

                <button
                  type="button"
                  onClick={onLogout}
                  className="min-h-[52px] border border-line rounded-2xl bg-white text-danger-ink text-[15px] font-extrabold cursor-pointer hover:bg-danger-bg"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Nav on Mobile */}
      {sempit && (
        <div className="sticky bottom-0 z-10 mt-6">
          <NavBawah aktif="akun" />
        </div>
      )}

      {/* Desktop SiteFooter */}
      {!sempit && <SiteFooter />}
    </div>
  );
}

export default Akun;
