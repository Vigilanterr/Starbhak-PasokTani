'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';

export interface RiwayatDanaItem {
  id: string;
  tanggal: string;
  jenis: 'masuk-saldo' | 'ditahan' | 'penarikan' | 'potongan' | string;
  noPesanan?: string;
  keterangan: string;
  jumlah: number;
  status: 'berhasil' | 'diproses' | 'ditolak' | string;
  pembeli?: string;
  st?: 'tiba' | 'diproses' | 'dikirim' | 'komplain' | 'baru' | 'selesai' | 'berhasil' | string;
  waktu?: string;
  potong?: number;
  terima?: number;
  nilai?: number;
  href?: string;
  dekat?: boolean;
  urgen?: boolean;
}

export interface KeuanganTokoData {
  saldoBisaDitarik: number;
  saldoDitahan: number;
  pesananDitahanCount: number;
  pesananDiprosesNilai?: number;
  pesananDiprosesCount?: number;
  pesananBelumDiprosesNilai?: number;
  pesananBelumDiprosesCount?: number;
  rekeningBank?: string;
  pemilikRekening?: string;
  totalPenarikanBulanIni?: number;
  riwayatDana?: RiwayatDanaItem[];
  daftarDitahan?: RiwayatDanaItem[];
  daftarMasuk?: RiwayatDanaItem[];
  daftarTarik?: RiwayatDanaItem[];
}

export interface TokoKeuanganProps {
  keuangan?: KeuanganTokoData;
  saldoBisaDitarik?: number;
  tabAwal?: 'ditahan' | 'masuk' | 'tarik' | string;
  hrefTarik?: string;
  hrefLaporan?: string;
  className?: string;
}

const DEFAULT_DITAHAN: RiwayatDanaItem[] = [
  { id: '1', noPesanan: 'PT-26110418', pembeli: 'Warung Dewi', keterangan: 'Tomat 12 kg, kol 16 kg', st: 'tiba', status: 'diproses', jenis: 'ditahan', jumlah: 272000, nilai: 272000, potong: 8160, terima: 263840, waktu: 'Masuk saldo paling lambat Rab, 11 Nov', tanggal: '2026-11-04', dekat: true, href: '/toko/pesanan/PT-26110418' },
  { id: '2', noPesanan: 'PT-26110714', pembeli: 'Asep Saepudin', keterangan: 'Kol 5 kg, GrabExpress hari ini', st: 'diproses', status: 'diproses', jenis: 'ditahan', jumlah: 45000, nilai: 45000, potong: 1350, terima: 43650, waktu: 'Perkiraan Rab, 11 Nov', tanggal: '2026-11-07', href: '/toko/pesanan/PT-26110714' },
  { id: '3', noPesanan: 'PT-26110605', pembeli: 'Hendra Gunawan', keterangan: 'Wortel 8 kg, tiba Sen, 9 Nov', st: 'dikirim', status: 'diproses', jenis: 'ditahan', jumlah: 88000, nilai: 88000, potong: 2640, terima: 85360, waktu: 'Perkiraan Kam, 12 Nov', tanggal: '2026-11-06', href: '/toko/pesanan/PT-26110605' },
  { id: '4', noPesanan: 'PT-26110703', pembeli: 'Warung Bu Enok', keterangan: 'Tomat 10 kg, penjemputan belum diatur', st: 'diproses', status: 'diproses', jenis: 'ditahan', jumlah: 120000, nilai: 120000, potong: 3600, terima: 116400, waktu: 'Setelah dikirim dan tiba', tanggal: '2026-11-07', href: '/toko/pesanan/PT-26110703' },
  { id: '5', noPesanan: 'PT-26110215', pembeli: 'Rudi Hartono', keterangan: 'Tomat 5 kg, sebagian lembek', st: 'komplain', status: 'diproses', jenis: 'ditahan', jumlah: 70000, nilai: 70000, potong: 2100, terima: 67900, waktu: 'Ditahan sampai komplain selesai', tanggal: '2026-11-02', urgen: true, href: '/toko/pesanan/PT-26110215' },
  { id: '6', noPesanan: 'PT-26110806', pembeli: 'Katering Sari Rasa', keterangan: 'Tomat 25 kg, diantar sendiri', st: 'baru', status: 'diproses', jenis: 'ditahan', jumlah: 300000, nilai: 300000, potong: 9000, terima: 291000, waktu: 'Proses sebelum Sen, 9 Nov, 07.30', tanggal: '2026-11-08', urgen: true, href: '/toko/pesanan/PT-26110806' },
  { id: '7', noPesanan: 'PT-26110809', pembeli: 'Rina Marlina', keterangan: 'Kol 3 kg, ambil di lahan', st: 'baru', status: 'diproses', jenis: 'ditahan', jumlah: 27000, nilai: 27000, potong: 810, terima: 26190, waktu: 'Proses sebelum Sen, 9 Nov, 10.05', tanggal: '2026-11-08', href: '/toko/pesanan/PT-26110809' },
  { id: '8', noPesanan: 'PT-26110821', pembeli: 'Warung Dewi', keterangan: 'Tomat 12 kg, kol 16 kg', st: 'baru', status: 'diproses', jenis: 'ditahan', jumlah: 272000, nilai: 272000, potong: 8160, terima: 263840, waktu: 'Proses sebelum Sen, 9 Nov, 13.41', tanggal: '2026-11-08', href: '/toko/pesanan/PT-26110821' },
];

const DEFAULT_MASUK: RiwayatDanaItem[] = [
  { id: 'm1', noPesanan: 'PT-26110103', pembeli: 'Resto Sunda Nikmat', keterangan: 'Tomat 30 kg, Kol 20 kg', st: 'selesai', status: 'berhasil', jenis: 'masuk-saldo', jumlah: 485000, nilai: 500000, potong: 15000, terima: 485000, waktu: 'Sabtu, 7 Nov 14.30', tanggal: '2026-11-07', href: '/toko/pesanan/PT-26110103' },
  { id: 'm2', noPesanan: 'PT-26102812', pembeli: 'Bu Ani Lembang', keterangan: 'Wortel 15 kg', st: 'selesai', status: 'berhasil', jenis: 'masuk-saldo', jumlah: 160050, nilai: 165000, potong: 4950, terima: 160050, waktu: 'Jumat, 6 Nov 10.15', tanggal: '2026-11-06', href: '/toko/pesanan/PT-26102812' },
];

const DEFAULT_TARIK: RiwayatDanaItem[] = [
  { id: 't1', noPesanan: 'WD-26110301', keterangan: 'Ke BRI ••••3021 atas nama UJANG', st: 'berhasil', status: 'berhasil', jenis: 'penarikan', jumlah: 2100000, nilai: 2100000, potong: 0, terima: 2100000, waktu: 'Selasa, 3 Nov 11.20', tanggal: '2026-11-03' },
  { id: 't2', noPesanan: 'WD-26102001', keterangan: 'Ke BRI ••••3021 atas nama UJANG', st: 'berhasil', status: 'berhasil', jenis: 'penarikan', jumlah: 1850000, nilai: 1850000, potong: 0, terima: 1850000, waktu: 'Selasa, 20 Okt 09.45', tanggal: '2026-10-20' },
];

const DEFAULT_KEUANGAN: KeuanganTokoData = {
  saldoBisaDitarik: 842500,
  saldoDitahan: 1158180,
  pesananDitahanCount: 8,
  pesananDiprosesNilai: 577150,
  pesananDiprosesCount: 5,
  pesananBelumDiprosesNilai: 581030,
  pesananBelumDiprosesCount: 3,
  rekeningBank: 'BRI ••••3021',
  pemilikRekening: 'UJANG',
  totalPenarikanBulanIni: 3950000,
  daftarDitahan: DEFAULT_DITAHAN,
  daftarMasuk: DEFAULT_MASUK,
  daftarTarik: DEFAULT_TARIK,
};

function formatRupiah(nilai: number): string {
  return 'Rp ' + Math.round(nilai).toLocaleString('id-ID');
}

export function TokoKeuangan({
  keuangan = DEFAULT_KEUANGAN,
  saldoBisaDitarik: saldoBisaDitarikProp,
  tabAwal = 'ditahan',
  hrefTarik = '/toko/keuangan/penarikan',
  hrefLaporan = '/toko/keuangan/laporan',
  className = '',
}: TokoKeuanganProps) {
  const [activeTab, setActiveTab] = useState<'ditahan' | 'masuk' | 'tarik'>(
    (tabAwal === 'masuk' || tabAwal === 'tarik' ? tabAwal : 'ditahan')
  );

  const saldoTersedia = saldoBisaDitarikProp ?? keuangan.saldoBisaDitarik ?? 0;
  const totalDitahan = keuangan.saldoDitahan ?? 0;
  const countDitahan = keuangan.pesananDitahanCount ?? 8;
  const diprosesNilai = keuangan.pesananDiprosesNilai ?? 577150;
  const diprosesCount = keuangan.pesananDiprosesCount ?? 5;
  const belumDiprosesNilai = keuangan.pesananBelumDiprosesNilai ?? 581030;
  const belumDiprosesCount = keuangan.pesananBelumDiprosesCount ?? 3;
  const bankInfo = keuangan.rekeningBank ?? 'BRI ••••3021';
  const ownerInfo = keuangan.pemilikRekening ?? 'UJANG';

  const listDitahan = keuangan.daftarDitahan ?? DEFAULT_DITAHAN;
  const listMasuk = keuangan.daftarMasuk ?? DEFAULT_MASUK;
  const listTarik = keuangan.daftarTarik ?? DEFAULT_TARIK;

  const currentList =
    activeTab === 'ditahan'
      ? listDitahan
      : activeTab === 'masuk'
      ? listMasuk
      : listTarik;

  // Percentage for split bar
  const totalProses = diprosesNilai + belumDiprosesNilai;
  const persenProses = totalProses > 0 ? (diprosesNilai / totalProses) * 100 : 50;

  const renderBadgeStatus = (st?: string) => {
    switch (st) {
      case 'tiba':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#064e3b] text-white text-xs font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e9c75c]" aria-hidden="true" />
            Tiba, perlu konfirmasi
          </span>
        );
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ebf2eb] text-[#173b2b] text-xs font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#157a4c]" aria-hidden="true" />
            Diproses
          </span>
        );
      case 'dikirim':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" aria-hidden="true" />
            Dikirim
          </span>
        );
      case 'komplain':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdecea] text-[#8a1c12] text-xs font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b42318]" aria-hidden="true" />
            Dalam komplain
          </span>
        );
      case 'baru':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fff1ea] text-[#9a3412] text-xs font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" aria-hidden="true" />
            Belum diproses
          </span>
        );
      case 'selesai':
      case 'berhasil':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" aria-hidden="true" />
            {activeTab === 'tarik' ? 'Berhasil' : 'Masuk saldo'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f6f8f4] text-[#3f5247] text-xs font-extrabold">
            Diproses
          </span>
        );
    }
  };

  return (
    <div className={`min-h-full bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />
      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden min-[900px]:block w-[272px] shrink-0 p-5 pt-5 pb-6 pl-5">
          <TokoSamping aktif="keuangan" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 min-[900px]:px-6 min-[900px]:py-5 min-[900px]:pb-12">
          <div className="max-w-[1120px] flex flex-col gap-4">
            {/* Header Row */}
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2.5">
              <h1 className="text-2xl min-[900px]:text-3xl font-extrabold tracking-tight">
                Keuangan
              </h1>
              <Link
                href={hrefLaporan}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 border border-[#dee3da] rounded-xl bg-white text-[#064e3b] text-sm font-extrabold no-underline"
              >
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
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M10 9H8" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                </svg>
                Laporan dan CSV
              </Link>
            </div>

            {/* Top KPI Cards */}
            <div className="flex flex-wrap gap-4">
              {/* Bisa ditarik Card */}
              <section
                aria-labelledby="judul-saldo-bisa"
                className="flex-1 basis-[300px] min-w-0 p-5 border-[1.5px] border-[#064e3b] rounded-2xl bg-white flex flex-col gap-2.5"
              >
                <h2 id="judul-saldo-bisa" className="text-sm font-bold text-[#3f5247]">
                  Bisa ditarik
                </h2>
                <p className="text-[34px] font-extrabold text-[#064e3b] tracking-tight leading-none whitespace-nowrap">
                  {formatRupiah(saldoTersedia)}
                </p>
                <p className="text-[13px] text-[#3f5247]">
                  Ke {bankInfo} atas nama {ownerInfo}
                </p>
                <Link
                  href={hrefTarik}
                  className="flex items-center justify-center min-h-[52px] mt-1 rounded-xl bg-[#064e3b] text-white text-base font-extrabold no-underline text-center"
                >
                  Tarik saldo
                </Link>
              </section>

              {/* Ditahan Card */}
              <section
                aria-labelledby="judul-saldo-tahan"
                className="flex-[2_1_380px] min-w-0 p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h2 id="judul-saldo-tahan" className="text-sm font-bold text-[#3f5247]">
                    Ditahan dari {countDitahan} pesanan
                  </h2>
                  <p className="text-2xl font-extrabold whitespace-nowrap">
                    {formatRupiah(totalDitahan)}
                  </p>
                </div>
                {/* Split Progress Bar */}
                <div
                  role="img"
                  aria-label={`${formatRupiah(diprosesNilai)} dari ${diprosesCount} pesanan sudah diproses, ${formatRupiah(belumDiprosesNilai)} dari ${belumDiprosesCount} pesanan belum diproses`}
                  className="flex h-[14px] rounded-full overflow-hidden bg-[#eef0eb]"
                >
                  <span
                    style={{ width: `${persenProses}%` }}
                    className="bg-[#064e3b]"
                  />
                  <span
                    style={{ width: `${100 - persenProses}%` }}
                    className="bg-[#a9cfae] border-l-2 border-white"
                  />
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-[13px] leading-relaxed list-none p-0 m-0">
                  <li className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-2.5 h-2.5 mt-1 rounded-[3px] bg-[#064e3b]"
                    />
                    <span>
                      <strong>{formatRupiah(diprosesNilai)}</strong>, {diprosesCount} pesanan sudah diproses. Masuk saldo saat pembeli konfirmasi terima, atau otomatis 3 hari setelah tiba tanpa komplain.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-2.5 h-2.5 mt-1 rounded-[3px] bg-[#a9cfae]"
                    />
                    <span>
                      <strong>{formatRupiah(belumDiprosesNilai)}</strong>, {belumDiprosesCount} pesanan belum diproses. Pembeli masih bisa membatalkan.
                    </span>
                  </li>
                </ul>
              </section>
            </div>

            {/* History Section */}
            <section aria-labelledby="judul-riwayat-dana" className="flex flex-col gap-3">
              <h2 id="judul-riwayat-dana" className="sr-only">
                Riwayat dana
              </h2>
              {/* Tab Filters */}
              <div role="group" aria-label="Pilih daftar" className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={activeTab === 'ditahan'}
                  onClick={() => setActiveTab('ditahan')}
                  className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-full font-sans text-sm font-extrabold cursor-pointer ${
                    activeTab === 'ditahan'
                      ? 'border-[1.5px] border-[#064e3b] bg-[#064e3b] text-white'
                      : 'border border-[#dee3da] bg-white text-[#173b2b]'
                  }`}
                >
                  Ditahan
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === 'ditahan'
                        ? 'bg-[#e9c75c] text-[#173b2b]'
                        : 'bg-[#ebf2eb] text-[#064e3b]'
                    }`}
                  >
                    {listDitahan.length}
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === 'masuk'}
                  onClick={() => setActiveTab('masuk')}
                  className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-full font-sans text-sm font-extrabold cursor-pointer ${
                    activeTab === 'masuk'
                      ? 'border-[1.5px] border-[#064e3b] bg-[#064e3b] text-white'
                      : 'border border-[#dee3da] bg-white text-[#173b2b]'
                  }`}
                >
                  Masuk saldo
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === 'masuk'
                        ? 'bg-[#e9c75c] text-[#173b2b]'
                        : 'bg-[#ebf2eb] text-[#064e3b]'
                    }`}
                  >
                    {listMasuk.length}
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === 'tarik'}
                  onClick={() => setActiveTab('tarik')}
                  className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-full font-sans text-sm font-extrabold cursor-pointer ${
                    activeTab === 'tarik'
                      ? 'border-[1.5px] border-[#064e3b] bg-[#064e3b] text-white'
                      : 'border border-[#dee3da] bg-white text-[#173b2b]'
                  }`}
                >
                  Penarikan
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === 'tarik'
                        ? 'bg-[#e9c75c] text-[#173b2b]'
                        : 'bg-[#ebf2eb] text-[#064e3b]'
                    }`}
                  >
                    {listTarik.length}
                  </span>
                </button>
              </div>

              {/* Tab description */}
              <p className="text-[13px] leading-relaxed text-[#3f5247]">
                {activeTab === 'ditahan' &&
                  'Pesanan yang sudah dibayar pembeli. Dana disimpan aman di Pasok Tani sampai pesanan selesai.'}
                {activeTab === 'masuk' &&
                  'Dana yang sudah masuk ke saldo dan siap kamu tarik ke rekening bank.'}
                {activeTab === 'tarik' &&
                  'Riwayat penarikan dana dari saldo Pasok Tani ke rekening bankmu.'}
              </p>

              {/* Desktop Table View */}
              <div className="hidden min-[900px]:block overflow-x-auto border border-[#dee3da] rounded-2xl bg-white">
                <div role="table" aria-label="Riwayat Keuangan" className="min-w-[860px]">
                  <div
                    role="row"
                    className="grid grid-cols-[1.6fr_1.5fr_110px_120px_130px_1.3fr] gap-x-3.5 p-3 px-4 border-b border-[#dee3da] bg-[#fcfbf6] text-xs font-extrabold text-[#3f5247]"
                  >
                    <div role="columnheader">
                      {activeTab === 'tarik' ? 'Tujuan' : 'Nomor / Pembeli'}
                    </div>
                    <div role="columnheader">Status</div>
                    <div role="columnheader">
                      {activeTab === 'tarik' ? 'Jumlah' : 'Nilai barang'}
                    </div>
                    <div role="columnheader">
                      {activeTab === 'tarik' ? 'Biaya transfer' : 'Komisi 3%'}
                    </div>
                    <div role="columnheader">
                      {activeTab === 'tarik' ? 'Diterima' : 'Kamu terima'}
                    </div>
                    <div role="columnheader">
                      {activeTab === 'ditahan' ? 'Perkiraan masuk' : 'Waktu'}
                    </div>
                  </div>

                  {currentList.map((item, idx) => {
                    const rowNilai = item.nilai ?? item.jumlah ?? 0;
                    const rowPotong = item.potong ?? Math.round(rowNilai * 0.03);
                    const rowTerima = item.terima ?? (rowNilai - rowPotong);
                    return (
                      <div
                        key={item.id || idx}
                        role="row"
                        className={`grid grid-cols-[1.6fr_1.5fr_110px_120px_130px_1.3fr] gap-x-3.5 items-start p-3 px-4 ${
                          idx > 0 ? 'border-t border-[#eef0eb]' : ''
                        } text-sm leading-normal`}
                      >
                        <div role="cell">
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="font-extrabold text-[#173b2b] no-underline hover:underline"
                            >
                              {item.noPesanan ?? item.id}
                            </Link>
                          ) : (
                            <span className="font-extrabold text-[#173b2b]">
                              {item.noPesanan ?? item.id}
                            </span>
                          )}
                          <span className="block text-[13px] text-[#3f5247]">
                            {item.pembeli ? `${item.pembeli} · ` : ''}
                            {item.keterangan}
                          </span>
                        </div>
                        <div role="cell">{renderBadgeStatus(item.st)}</div>
                        <div role="cell" className="tabular-nums font-medium">
                          {formatRupiah(rowNilai)}
                        </div>
                        <div role="cell" className="tabular-nums text-[#3f5247]">
                          {formatRupiah(rowPotong)}
                        </div>
                        <div role="cell" className="tabular-nums font-extrabold">
                          {formatRupiah(rowTerima)}
                        </div>
                        <div
                          role="cell"
                          className={`text-[13px] ${
                            item.urgen
                              ? 'text-[#9a3412] font-bold'
                              : 'text-[#3f5247]'
                          }`}
                        >
                          {item.waktu ?? item.tanggal}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Card View */}
              <ul className="min-[900px]:hidden flex flex-col gap-2.5 list-none p-0 m-0">
                {currentList.map((item, idx) => {
                  const rowNilai = item.nilai ?? item.jumlah ?? 0;
                  const rowPotong = item.potong ?? Math.round(rowNilai * 0.03);
                  const rowTerima = item.terima ?? (rowNilai - rowPotong);
                  return (
                    <li
                      key={item.id || idx}
                      className="p-3.5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-baseline gap-2">
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="font-extrabold text-[15px] text-[#173b2b] no-underline"
                          >
                            {item.noPesanan ?? item.id}
                          </Link>
                        ) : (
                          <strong className="text-[15px] text-[#173b2b]">
                            {item.noPesanan ?? item.id}
                          </strong>
                        )}
                        <strong className="text-[15px] tabular-nums whitespace-nowrap">
                          {formatRupiah(rowTerima)}
                        </strong>
                      </div>
                      <p className="text-[13px] text-[#3f5247] m-0">
                        {item.pembeli ? `${item.pembeli} · ` : ''}
                        {item.keterangan}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#3f5247]">
                        {renderBadgeStatus(item.st)}
                        <span>
                          Nilai: {formatRupiah(rowNilai)} · Komisi: {formatRupiah(rowPotong)}
                        </span>
                      </div>
                      <p
                        className={`text-[13px] m-0 ${
                          item.urgen
                            ? 'text-[#9a3412] font-bold'
                            : 'text-[#3f5247]'
                        }`}
                      >
                        {item.waktu ?? item.tanggal}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Bottom Note */}
            <p className="flex items-start gap-2 text-[13px] leading-relaxed text-[#3f5247] mt-2 mb-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#157a4c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>
                Yang kamu terima = nilai barang dikurangi komisi Pasok Tani{' '}
                <span className="px-1.5 py-0.5 border border-dashed border-[#c2a032] rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
                  3%
                </span>
                . Ongkir kurir dibayar pembeli dan tidak masuk saldo.
              </span>
            </p>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="min-[900px]:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="lainnya" />
      </div>
    </div>
  );
}
