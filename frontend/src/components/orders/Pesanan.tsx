'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { AkunMenu } from '../layout/AkunMenu';
import { NavBawah } from '../layout/NavBawah';
import { ChipStatus, type StatusPasokTani } from '../common/ChipStatus';

export type TabStatusPesanan =
  | 'semua'
  | 'menunggu-bayar'
  | 'diproses'
  | 'dikirim'
  | 'tiba'
  | 'selesai'
  | 'komplain'
  | 'dibatalkan';

export type KategoriProduk = 'sayuran' | 'jamur' | 'rempah' | 'beras' | 'umbi';

export interface ItemRingkasanPesanan {
  id: string;
  nama: string;
  kategori?: string;
  jumlah: number;
  satuan?: string;
  harga: number;
  foto?: string;
}

export interface PesananItem {
  id: string;
  no: string;
  toko: string;
  tanggal: string;
  status: StatusPasokTani | string;
  kat?: KategoriProduk | string;
  produk: string;
  jumlahProduk: string | number;
  lain?: number;
  keterangan: string;
  warnaKet?: string;
  urgen?: boolean;
  total: string | number;
  hrefDetail?: string;
  hrefUtama?: string;
  hrefSekunder?: string;
  utama?: string;
  sekunder?: string;
  items?: ItemRingkasanPesanan[];
  adaKonfirmasi?: boolean;
}

export interface GrupBayarMenunggu {
  jumlahPesanan: number;
  daftarToko: string;
  jumlahProduk: number;
  total: string | number;
  batasWaktu: string;
  sisaWaktu: string;
  hrefBayar: string;
}

export interface PesananProps {
  pesananList?: PesananItem[];
  kosong?: boolean;
  filterAwal?: TabStatusPesanan;
  onKonfirmasiDiterima?: (pesananId: string) => void;
  onBatalkanPesanan?: (pesananId: string) => void;
  className?: string;
}

const DEFAULT_PESANAN_LIST: PesananItem[] = [
  {
    id: 'PT-26110418',
    no: 'PT-26110418',
    toko: 'Kebun Mang Ujang',
    tanggal: 'Jum, 6 Nov 2026',
    status: 'tiba',
    kat: 'sayuran',
    produk: 'Tomat Merah Lembang',
    jumlahProduk: '12 kg',
    lain: 1,
    keterangan: 'Batas konfirmasi/komplain: Rab, 11 Nov, 10.24 WIB (sisa 2 hari)',
    urgen: true,
    total: 'Rp 272.000',
    hrefDetail: '/pesanan/PT-26110418',
    hrefSekunder: '/pesanan/PT-26110418/komplain',
    hrefUtama: '/pesanan/PT-26110418',
    sekunder: 'Ajukan komplain',
    utama: 'Pesanan diterima',
  },
  {
    id: 'PT-26110716',
    no: 'PT-26110716',
    toko: 'Jamur Barokah',
    tanggal: 'Sab, 7 Nov 2026',
    status: 'dikonfirmasi',
    kat: 'jamur',
    produk: 'Jamur Tiram Segar',
    jumlahProduk: '3 kg',
    keterangan: 'Petani sedang menyiapkan kemasan panen pagi',
    urgen: false,
    total: 'Rp 61.600',
    hrefDetail: '/pesanan/PT-26110716',
    sekunder: 'Batalkan',
    utama: 'Lihat detail',
    hrefUtama: '/pesanan/PT-26110716',
  },
  {
    id: 'PT-26110111',
    no: 'PT-26110111',
    toko: 'Rempah Nusantara',
    tanggal: 'Sel, 3 Nov 2026',
    status: 'dikirim',
    kat: 'rempah',
    produk: 'Jahe Merah Super',
    jumlahProduk: '5 kg',
    keterangan: 'Kurir sedang dalam perjalanan ke alamat penerima',
    urgen: false,
    total: 'Rp 145.000',
    hrefDetail: '/pesanan/PT-26110111',
    hrefSekunder: '/obrolan/toko-rempah',
    sekunder: 'Chat petani',
    utama: 'Lacak',
    hrefUtama: '/pesanan/PT-26110111',
  },
  {
    id: 'PT-26110204',
    no: 'PT-26110204',
    toko: 'Lumbung Beras Cianjur',
    tanggal: 'Rab, 4 Nov 2026',
    status: 'selesai',
    kat: 'beras',
    produk: 'Beras Pandan Wangi Super',
    jumlahProduk: '25 kg',
    keterangan: 'Pesanan selesai pada Sen, 9 Nov 2026',
    urgen: false,
    total: 'Rp 375.000',
    hrefDetail: '/pesanan/PT-26110204',
    hrefSekunder: '/pesanan/PT-26110204/ulasan',
    sekunder: 'Beri ulasan',
    utama: 'Beli lagi',
    hrefUtama: '/keranjang',
  },
  {
    id: 'PT-26102805',
    no: 'PT-26102805',
    toko: 'Kebun Umbi Garut',
    tanggal: 'Kam, 29 Okt 2026',
    status: 'dibatalkan',
    kat: 'umbi',
    produk: 'Ubi Madu Cilembu',
    jumlahProduk: '10 kg',
    keterangan: 'Pesanan dibatalkan. Dana telah dikembalikan ke saldo Dompet.',
    urgen: false,
    total: 'Rp 95.000',
    hrefDetail: '/pesanan/PT-26102805',
    sekunder: 'Lihat detail',
    hrefSekunder: '/pesanan/PT-26102805',
    utama: 'Beli lagi',
    hrefUtama: '/keranjang',
  },
];

const DEFAULT_GRUP_BAYAR: GrupBayarMenunggu = {
  jumlahPesanan: 3,
  daftarToko: 'Sayur Segar Lembang, Beras Makmur, Rempah Wangi',
  jumlahProduk: 7,
  total: 'Rp 348.000',
  batasWaktu: '23.59 WIB',
  sisaWaktu: 'sisa 4 jam 20 mnt',
  hrefBayar: '/bayar',
};

function IkonKategori({ kat }: { kat?: string }) {
  switch (kat) {
    case 'jamur':
      return (
        <span
          role="img"
          aria-label="Kategori Jamur"
          className="flex-none w-14 h-14 rounded-xl grid place-items-center bg-[#ece8e1] text-[#6b5e4f]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3C7 3 3 6.5 3 10.5c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5C21 6.5 17 3 12 3Z" />
            <path d="M9 12v6.5a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5V12" />
          </svg>
        </span>
      );
    case 'rempah':
      return (
        <span
          role="img"
          aria-label="Kategori Rempah"
          className="flex-none w-14 h-14 rounded-xl grid place-items-center bg-[#fbe3df] text-[#b42318]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17.5 6.5c-3.5-.5-7 1.5-8.6 5.4C7.6 15.2 5.3 17.6 2.5 19c4.2 1.6 10.2.6 13.6-3.6 2.3-2.8 2.9-6 1.4-8.9Z" />
            <path d="M17.5 6.5c.2-1.8 1.4-3.2 3.5-3.5" />
          </svg>
        </span>
      );
    case 'beras':
      return (
        <span
          role="img"
          aria-label="Kategori Beras"
          className="flex-none w-14 h-14 rounded-xl grid place-items-center bg-[#f6efd9] text-[#7a5a00]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 22 16 8" />
            <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
            <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
            <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
            <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
          </svg>
        </span>
      );
    case 'umbi':
      return (
        <span
          role="img"
          aria-label="Kategori Umbi"
          className="flex-none w-14 h-14 rounded-xl grid place-items-center bg-[#f3e4da] text-[#9a3412]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46" />
            <path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z" />
            <path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z" />
          </svg>
        </span>
      );
    case 'sayuran':
    default:
      return (
        <span
          role="img"
          aria-label="Kategori Sayuran"
          className="flex-none w-14 h-14 rounded-xl grid place-items-center bg-[#e3f1df] text-[#2f7a3e]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        </span>
      );
  }
}

export function Pesanan({
  pesananList = DEFAULT_PESANAN_LIST,
  kosong = false,
  filterAwal = 'semua',
  onKonfirmasiDiterima,
  onBatalkanPesanan,
  className = '',
}: PesananProps) {
  const searchInputId = useId();
  const periodSelectId = useId();

  const [filterAktif, setFilterAktif] = useState<TabStatusPesanan>(filterAwal);
  const [kataKunci, setKataKunci] = useState('');
  const [periode, setPeriode] = useState('3 bulan terakhir');
  const [pesanToast, setPesanToast] = useState('');
  const [konfirmasiId, setKonfirmasiId] = useState<string | null>(null);
  const [tanyaBatalId, setTanyaBatalId] = useState<string | null>(null);

  // Group status helper
  const matchesTab = (orderStatus: string, tab: TabStatusPesanan): boolean => {
    if (tab === 'semua') return true;
    if (tab === 'menunggu-bayar') return orderStatus === 'menunggu-bayar';
    if (tab === 'diproses') return orderStatus === 'diproses' || orderStatus === 'dikonfirmasi';
    if (tab === 'dikirim') return orderStatus === 'dikirim';
    if (tab === 'tiba') return orderStatus === 'tiba';
    if (tab === 'selesai') return orderStatus === 'selesai';
    if (tab === 'komplain') return orderStatus.startsWith('komplain');
    if (tab === 'dibatalkan') return orderStatus === 'dibatalkan' || orderStatus === 'batal-diajukan';
    return false;
  };

  const tabs: { id: TabStatusPesanan; label: string }[] = [
    { id: 'semua', label: 'Semua' },
    { id: 'menunggu-bayar', label: 'Belum bayar' },
    { id: 'diproses', label: 'Diproses' },
    { id: 'dikirim', label: 'Dikirim' },
    { id: 'tiba', label: 'Tiba' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'dibatalkan', label: 'Dibatalkan' },
  ];

  // Counts for tabs
  const getTabCount = (tabId: TabStatusPesanan): number => {
    if (kosong) return 0;
    return pesananList.filter((item) => matchesTab(item.status, tabId)).length;
  };

  const filteredOrders = kosong
    ? []
    : pesananList.filter((item) => {
        const matchesStatus = matchesTab(item.status, filterAktif);
        if (!matchesStatus) return false;
        if (!kataKunci.trim()) return true;
        const q = kataKunci.toLowerCase();
        return (
          item.no.toLowerCase().includes(q) ||
          item.toko.toLowerCase().includes(q) ||
          item.produk.toLowerCase().includes(q)
        );
      });

  const tampilGrupBayar =
    !kosong &&
    (filterAktif === 'semua' || filterAktif === 'menunggu-bayar') &&
    pesananList.some((p) => p.status === 'menunggu-bayar');

  const handleTerimaPesanan = (id: string, no: string, toko: string) => {
    onKonfirmasiDiterima?.(id);
    setKonfirmasiId(null);
    setPesanToast(`Pesanan ${no} selesai. Dana diteruskan ke ${toko}.`);
  };

  const handleBatalPesanan = (id: string, no: string, total: string | number) => {
    onBatalkanPesanan?.(id);
    setTanyaBatalId(null);
    setPesanToast(`Pesanan ${no} dibatalkan. ${total} sudah kembali ke Dompet.`);
  };

  return (
    <div className={`min-h-full bg-[#fcfbf6] font-sans text-[#173b2b] ${className}`}>
      <SiteHeader signedIn={true} cartCount={0} />

      <main className="max-w-[1200px] mx-auto px-4 py-4 md:py-7 md:px-6 md:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Akun menu for desktop */}
          <div className="hidden lg:block w-[272px] shrink-0">
            <AkunMenu aktif="pesanan" />
          </div>

          {/* Main content column */}
          <div className="flex-1 min-w-0 flex flex-col gap-3.5">
            <h1 className="m-0 text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              Pesanan saya
            </h1>

            {/* Search and Period Bar */}
            <div className="flex flex-wrap gap-2.5">
              <form
                role="search"
                onSubmit={(e) => e.preventDefault()}
                className="relative flex-[999_1_280px] m-0"
              >
                <label htmlFor={searchInputId} className="sr-only">
                  Cari pesanan
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
                  className="absolute left-3.5 top-[15px]"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  id={searchInputId}
                  type="search"
                  value={kataKunci}
                  onChange={(e) => setKataKunci(e.target.value)}
                  placeholder="Cari produk, petani, atau nomor pesanan"
                  className="w-full h-12 box-border pl-10 pr-3 border-[1.5px] border-[#7d877e] rounded-xl bg-white text-[#173b2b] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
                />
              </form>

              <div className="flex-[1_1_180px] relative">
                <label htmlFor={periodSelectId} className="sr-only">
                  Periode
                </label>
                <select
                  id={periodSelectId}
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  className="w-full h-12 box-border px-3 border-[1.5px] border-[#7d877e] rounded-xl bg-white text-[#173b2b] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
                >
                  <option value="3 bulan terakhir">3 bulan terakhir</option>
                  <option value="Bulan ini">Bulan ini</option>
                  <option value="Tahun ini">Tahun ini</option>
                  <option value="Semua waktu">Semua waktu</option>
                </select>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div
              role="group"
              aria-label="Saring menurut status"
              className="flex gap-2 overflow-x-auto pb-0.5"
            >
              {tabs.map((tab) => {
                const isSelected = filterAktif === tab.id;
                const count = getTabCount(tab.id);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setFilterAktif(tab.id);
                      setPesanToast('');
                    }}
                    className={`shrink-0 inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-full text-sm font-bold border cursor-pointer ${
                      isSelected
                        ? 'border-[#064e3b] bg-[#064e3b] text-white'
                        : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f5]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`min-w-5 px-1.5 box-border rounded-full text-xs font-extrabold text-center ${
                        isSelected
                          ? 'bg-[#e9c75c] text-[#173b2b]'
                          : 'bg-[#ebf2eb] text-[#064e3b]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Feedback Toast */}
            {pesanToast && (
              <p aria-live="polite" className="m-0 text-sm font-bold text-[#157a4c]">
                {pesanToast}
              </p>
            )}

            {/* Global Empty State */}
            {kosong && (
              <div className="p-8 border border-dashed border-[#dee3da] rounded-2xl bg-white text-center flex flex-col items-center gap-3">
                <span
                  role="img"
                  aria-label="Kotak kosong"
                  className="w-16 h-16 rounded-2xl grid place-items-center bg-[#ebf2eb] text-[#064e3b]"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                    <path d="M12 22V12" />
                    <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
                  </svg>
                </span>
                <h2 className="m-0 text-lg font-extrabold">Belum ada pesanan</h2>
                <p className="m-0 text-sm text-[#5a6b60] max-w-md">
                  Temukan sayur, buah, beras, dan rempah segar langsung dari petani lokal terbaik.
                </p>
                <Link
                  href="/"
                  className="mt-2 inline-flex items-center justify-center min-h-11 px-5 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold no-underline hover:bg-[#157a4c]"
                >
                  Mulai belanja
                </Link>
              </div>
            )}

            {/* Filtered Empty State */}
            {!kosong && filteredOrders.length === 0 && !tampilGrupBayar && (
              <div className="p-6 border border-dashed border-[#dee3da] rounded-2xl bg-white text-center flex flex-col items-center gap-2">
                <p className="m-0 text-base font-bold text-[#173b2b]">
                  Tidak ada pesanan dengan status ini dalam {periode.toLowerCase()}.
                </p>
                <p className="m-0 text-sm text-[#5a6b60]">
                  Gunakan pencarian lain atau pilih tab status yang berbeda.
                </p>
              </div>
            )}

            {/* List of Orders */}
            {!kosong && (filteredOrders.length > 0 || tampilGrupBayar) && (
              <ul className="list-none m-0 p-0 flex flex-col gap-3">
                {/* Batch Payment Banner */}
                {tampilGrupBayar && (
                  <li className="p-4 border-[1.5px] border-[#e9c75c] rounded-2xl bg-[#fffdf5] flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <ChipStatus status="menunggu-bayar" />
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9a3412]">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        Bayar sebelum {DEFAULT_GRUP_BAYAR.batasWaktu} ({DEFAULT_GRUP_BAYAR.sisaWaktu})
                      </span>
                    </div>

                    <div>
                      <p className="m-0 text-sm font-bold text-[#173b2b]">
                        {DEFAULT_GRUP_BAYAR.jumlahPesanan} pesanan dalam satu pembayaran
                      </p>
                      <p className="m-0 text-xs text-[#5a6b60] mt-0.5">
                        {DEFAULT_GRUP_BAYAR.daftarToko} · {DEFAULT_GRUP_BAYAR.jumlahProduk} produk
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f4e2b0]">
                      <span className="text-xs text-[#3f5247]">
                        Total{' '}
                        <strong className="text-base text-[#173b2b]">
                          {DEFAULT_GRUP_BAYAR.total}
                        </strong>
                      </span>
                      <Link
                        href={DEFAULT_GRUP_BAYAR.hrefBayar}
                        className="inline-flex items-center justify-center min-h-10 px-4 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold no-underline hover:bg-[#157a4c]"
                      >
                        Bayar sekarang
                      </Link>
                    </div>
                  </li>
                )}

                {/* Individual Order Cards */}
                {filteredOrders.map((order) => {
                  const showConfirm = konfirmasiId === order.id;
                  const showCancel = tanyaBatalId === order.id;

                  return (
                    <li
                      key={order.id}
                      className="border border-[#dee3da] rounded-2xl bg-white overflow-hidden flex flex-col"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 border-b border-[#eef0eb] bg-white">
                        <div className="flex flex-wrap items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6b60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                            <path d="M2 7h20" />
                          </svg>
                          <span className="font-extrabold text-sm text-[#064e3b]">
                            {order.toko}
                          </span>
                          <span className="text-xs text-[#5a6b60]">
                            · {order.tanggal} · {order.no}
                          </span>
                        </div>
                        <ChipStatus status={order.status} />
                      </div>

                      {/* Card Body */}
                      <div className="p-3.5 flex items-start gap-3">
                        <IkonKategori kat={order.kat} />
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <p className="m-0 text-sm font-bold text-[#173b2b]">
                            {order.produk} · {order.jumlahProduk}
                          </p>
                          {order.lain && order.lain > 0 ? (
                            <p className="m-0 text-xs text-[#5a6b60]">
                              +{order.lain} produk lain
                            </p>
                          ) : null}
                          <p
                            className={`m-0 text-xs leading-relaxed mt-1 ${
                              order.urgen
                                ? 'text-[#173b2b] font-bold'
                                : 'text-[#3f5247] font-medium'
                            }`}
                          >
                            {order.keterangan}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-[#fcfbf6] border-t border-[#eef0eb]">
                        <span className="text-xs text-[#3f5247]">
                          Total{' '}
                          <strong className="text-base text-[#173b2b]">
                            {order.total}
                          </strong>
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Secondary action */}
                          {order.sekunder === 'Batalkan' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setTanyaBatalId(order.id);
                                setKonfirmasiId(null);
                              }}
                              className="inline-flex items-center min-h-11 px-3.5 rounded-xl border-0 bg-transparent text-[#b42318] text-sm font-bold cursor-pointer hover:bg-[#fdecea]"
                            >
                              {order.sekunder}
                            </button>
                          ) : order.sekunder && order.hrefSekunder ? (
                            <Link
                              href={order.hrefSekunder}
                              className="inline-flex items-center min-h-11 px-3.5 rounded-xl text-[#064e3b] text-sm font-bold no-underline hover:bg-[#ebf2eb]"
                            >
                              {order.sekunder}
                            </Link>
                          ) : null}

                          {/* Primary action */}
                          {order.utama === 'Pesanan diterima' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setKonfirmasiId(order.id);
                                setTanyaBatalId(null);
                              }}
                              className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                            >
                              {order.utama}
                            </button>
                          ) : (
                            <Link
                              href={order.hrefUtama ?? order.hrefDetail ?? `/pesanan/${order.id}`}
                              className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold no-underline hover:bg-[#ebf2eb]"
                            >
                              {order.utama ?? 'Lihat detail'}
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Inline Confirmation Box (Received) */}
                      {showConfirm && (
                        <div
                          role="group"
                          aria-label="Konfirmasi pesanan diterima"
                          className="flex flex-col gap-2.5 p-3.5 bg-[#f3faf3] border-t border-[#a9cfae]"
                        >
                          <p className="m-0 text-sm leading-relaxed text-[#173b2b]">
                            <strong>Sudah cek isinya?</strong> Setelah dikonfirmasi, dana {order.total} diteruskan ke {order.toko} dan komplain tidak bisa diajukan lagi.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleTerimaPesanan(order.id, order.no, order.toko)}
                              className="min-h-10 px-4 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                            >
                              Ya, pesanan sesuai
                            </button>
                            <button
                              type="button"
                              onClick={() => setKonfirmasiId(null)}
                              className="min-h-10 px-3.5 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#f6f8f5]"
                            >
                              Cek lagi dulu
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Inline Cancellation Box (Cancel) */}
                      {showCancel && (
                        <div
                          role="group"
                          aria-label="Konfirmasi batalkan pesanan"
                          className="flex flex-col gap-2.5 p-3.5 bg-[#fdecea] border-t border-[#f2b8b2]"
                        >
                          <p className="m-0 text-sm leading-relaxed text-[#173b2b]">
                            <strong>Batalkan pesanan ini?</strong> Petani belum memproses, jadi pembatalan gratis. Dana {order.total} langsung kembali ke saldo Dompet.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleBatalPesanan(order.id, order.no, order.total)}
                              className="min-h-10 px-4 rounded-xl border-0 bg-[#b42318] text-white text-sm font-extrabold cursor-pointer hover:bg-[#8a1c12]"
                            >
                              Ya, batalkan
                            </button>
                            <button
                              type="button"
                              onClick={() => setTanyaBatalId(null)}
                              className="min-h-10 px-3.5 rounded-xl border border-[#f2b8b2] bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#fcfbf6]"
                            >
                              Tidak jadi
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>

      <NavBawah aktif="pesanan" />
      <SiteFooter />
    </div>
  );
}

export default Pesanan;
