'use client';

import React from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../layout';
import { ChipStatus } from '../common';

export interface TugasTokoItem {
  id: string;
  ikon: 'pesanan' | 'komplain' | 'stok' | 'kedaluwarsa' | string;
  judul: string;
  ket: string;
  aksi: string;
  href: string;
  urgen?: boolean;
}

export interface LangkahAwalItem {
  id: string;
  judul: string;
  ket: string;
  selesai: boolean;
  aksi?: string;
  href?: string;
  utama?: boolean;
}

export interface PenjualanHarianItem {
  hari: string;
  nilai: number;
  tinggiPersen: number;
  isHariIni?: boolean;
}

export interface DaftarTungguSummaryData {
  id?: string;
  namaTanaman: string;
  status?: string;
  kuotaKg: number;
  terisiKg: number;
  sisaHari?: number;
  perkiraanPanen?: string;
  jumlahPengikut?: number;
  jumlahKomitmen?: number;
  hrefDetail?: string;
  hrefKabarLahan?: string;
}

export interface RingkasanTokoData {
  namaPetani?: string;
  namaToko?: string;
  statusBuka?: string;
  tanggalHariIni?: string;
  tokoBaru?: boolean;
  saldoBisaDitarik?: number | string;
  saldoTertahan?: number | string;
  pesananTertahanCount?: number;
  terjualMingguIni?: {
    total: number;
    totalMingguLalu: number;
    jumlahPesanan: number;
    jumlahDilihat: number;
    harian: PenjualanHarianItem[];
  };
  tugasList?: TugasTokoItem[];
  langkahAwalList?: LangkahAwalItem[];
  daftarTungguAktif?: DaftarTungguSummaryData | null;
}

export interface TokoProps {
  ringkasanToko?: RingkasanTokoData;
  tokoBaru?: boolean;
  className?: string;
}

const DEFAULT_LANGKAH_AWAL: LangkahAwalItem[] = [
  { id: 'l1', judul: 'Lengkapi profil toko', ket: 'Nama toko, foto profil, dan lokasi kebun di Lembang.', selesai: true, aksi: 'Ubah', href: '/toko/pengaturan/profil' },
  { id: 'l2', judul: 'Tambah produk pertama', ket: 'Foto asli dan tanggal panen membuat pembeli lebih percaya.', selesai: false, aksi: 'Tambah', href: '/toko/produk/baru', utama: true },
  { id: 'l3', judul: 'Atur rekening untuk penarikan', ket: 'Nama di rekening harus sama dengan nama pemilik toko.', selesai: false, aksi: 'Atur', href: '/toko/pengaturan/rekening' },
  { id: 'l4', judul: 'Kirim verifikasi KTP', ket: 'Wajib sebelum penarikan saldo pertama kali.', selesai: false, aksi: 'Verifikasi', href: '/toko/verifikasi' },
  { id: 'l5', judul: 'Atur jadwal buka toko', ket: 'Biar pembeli tahu kapan pesanan bisa diproses.', selesai: false, aksi: 'Atur', href: '/toko/pengaturan/jam-operasional' },
];

const DEFAULT_TUGAS: TugasTokoItem[] = [
  {
    id: 't1',
    ikon: 'pesanan',
    judul: '3 pesanan perlu dikirim',
    ket: 'Batas kirim paling cepat Sen, 9 Nov 13.41. Siapkan sayuran dan bungkus rapi.',
    aksi: 'Kirim pesanan',
    href: '/toko/pesanan',
    urgen: true,
  },
  {
    id: 't2',
    ikon: 'komplain',
    judul: 'Komplain pesanan PT-26110418',
    ket: 'Sebagian kol layu. Tanggapi sebelum Sel, 10 Nov 09.31.',
    aksi: 'Tanggapi',
    href: '/toko/pesanan/pt-26110418/komplain',
    urgen: true,
  },
  {
    id: 't3',
    ikon: 'stok',
    judul: 'Stok Kol Bulat tinggal 8 kg',
    ket: 'Di bawah batas minimum 10 kg. Tambah stok panen baru.',
    aksi: 'Tambah stok',
    href: '/toko/produk/kol/stok-baru',
    urgen: false,
  },
  {
    id: 't4',
    ikon: 'kedaluwarsa',
    judul: 'Bawang Daun kedaluwarsa besok',
    ket: 'Sisa 6 kg. Aktifkan diskon Surplus agar cepat laku.',
    aksi: 'Atur Surplus',
    href: '/toko/produk/bawang-daun/surplus',
    urgen: false,
  },
];

const DEFAULT_HARIAN: PenjualanHarianItem[] = [
  { hari: 'Sen', nilai: 142000, tinggiPersen: 56 },
  { hari: 'Sel', nilai: 98000, tinggiPersen: 38 },
  { hari: 'Rab', nilai: 210000, tinggiPersen: 82 },
  { hari: 'Kam', nilai: 176000, tinggiPersen: 69 },
  { hari: 'Jum', nilai: 254000, tinggiPersen: 100 },
  { hari: 'Sab', nilai: 236000, tinggiPersen: 93 },
  { hari: 'Min', nilai: 168000, tinggiPersen: 66, isHariIni: true },
];

export function Toko({
  ringkasanToko,
  tokoBaru: tokoBaruProp,
  className = '',
}: TokoProps) {
  const data: RingkasanTokoData = {
    namaPetani: ringkasanToko?.namaPetani ?? 'Pak Ujang',
    namaToko: ringkasanToko?.namaToko ?? 'Kebun Mang Ujang',
    statusBuka: ringkasanToko?.statusBuka ?? 'Toko buka sampai 17.00.',
    tanggalHariIni: ringkasanToko?.tanggalHariIni ?? 'Minggu, 8 Nov 2026',
    tokoBaru: tokoBaruProp ?? ringkasanToko?.tokoBaru ?? false,
    saldoBisaDitarik: ringkasanToko?.saldoBisaDitarik ?? 'Rp 842.500',
    saldoTertahan: ringkasanToko?.saldoTertahan ?? 'Rp 212.000',
    pesananTertahanCount: ringkasanToko?.pesananTertahanCount ?? 2,
    tugasList: ringkasanToko?.tugasList ?? DEFAULT_TUGAS,
    langkahAwalList: ringkasanToko?.langkahAwalList ?? DEFAULT_LANGKAH_AWAL,
    daftarTungguAktif: ringkasanToko?.daftarTungguAktif !== undefined ? ringkasanToko.daftarTungguAktif : {
      namaTanaman: 'Kentang Granola',
      kuotaKg: 1500,
      terisiKg: 1090,
      sisaHari: 24,
      perkiraanPanen: 'Perkiraan panen 2 sampai 6 Des. 31 orang mengikuti, 14 sudah ber-Komitmen.',
      jumlahPengikut: 31,
      jumlahKomitmen: 14,
      hrefDetail: '/toko/daftar-tunggu/kentang-granola',
      hrefKabarLahan: '/toko/daftar-tunggu/kentang-granola/kabar-lahan',
    },
    terjualMingguIni: ringkasanToko?.terjualMingguIni ?? {
      total: 1284000,
      totalMingguLalu: 1087000,
      jumlahPesanan: 14,
      jumlahDilihat: 312,
      harian: DEFAULT_HARIAN,
    },
  };

  const isNewStore = Boolean(data.tokoBaru);
  const langkahList = data.langkahAwalList ?? [];
  const tugasList = data.tugasList ?? [];
  const terjual = data.terjualMingguIni;
  const harianList = terjual?.harian ?? DEFAULT_HARIAN;

  const selesaiCount = langkahList.filter((l) => l.selesai).length;
  const totalLangkah = langkahList.length || 5;
  const progressPercent = Math.round((selesaiCount / totalLangkah) * 100);

  const saldoTeks = typeof data.saldoBisaDitarik === 'number'
    ? `Rp ${data.saldoBisaDitarik.toLocaleString('id-ID')}`
    : String(data.saldoBisaDitarik || 'Rp 0');

  const tertahanTeks = typeof data.saldoTertahan === 'number'
    ? `Rp ${data.saldoTertahan.toLocaleString('id-ID')}`
    : String(data.saldoTertahan || 'Rp 0');

  const formattedTotalMinggu = terjual
    ? `Rp ${terjual.total.toLocaleString('id-ID')}`
    : 'Rp 0';

  const formattedMingguLalu = terjual
    ? `Rp ${terjual.totalMingguLalu.toLocaleString('id-ID')}`
    : 'Rp 0';

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas
        namaToko={data.namaToko}
        statusBuka={data.statusBuka}
        namaPetani={data.namaPetani}
      />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="beranda" namaToko={data.namaToko} />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1080px]">
          <div className="flex flex-col gap-5">
            {/* Greeting Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173b2b]">
                Selamat siang, {data.namaPetani}
              </h1>
              <p className="mt-1 text-sm text-[#3f5247]">
                {data.tanggalHariIni}. {data.statusBuka}
              </p>
            </div>

            {/* Onboarding Checklist (if new store) */}
            {isNewStore && (
              <section
                aria-labelledby="judul-siapkan"
                className="p-5 border-[1.5px] border-[#064e3b] rounded-2xl bg-white flex flex-col gap-3.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="judul-siapkan" className="text-lg font-extrabold text-[#173b2b]">
                    Siapkan tokomu
                  </h2>
                  <span className="text-xs sm:text-sm font-bold text-[#157a4c]">
                    {selesaiCount} dari {totalLangkah} selesai
                  </span>
                </div>

                <div aria-hidden="true" className="h-2 rounded-full bg-[#ebf2eb] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#157a4c]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <ol className="list-none m-0 p-0 flex flex-col gap-2.5">
                  {langkahList.map((la) => (
                    <li
                      key={la.id}
                      className={`flex items-start gap-3 p-3 sm:p-3.5 border border-[#dee3da] rounded-xl ${
                        la.selesai ? 'bg-[#f6f8f4]' : 'bg-white'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                          la.selesai ? 'bg-[#157a4c]' : 'border-2 border-[#dee3da] bg-transparent text-transparent'
                        }`}
                      >
                        {la.selesai && (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm sm:text-base font-bold ${la.selesai ? 'line-through text-[#5a6b60]' : 'text-[#173b2b]'}`}>
                          {la.judul}
                        </p>
                        <p className="mt-0.5 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                          {la.ket}
                        </p>
                      </div>
                      {la.aksi && la.href && (
                        <Link
                          href={la.href}
                          className={`shrink-0 inline-flex items-center justify-center min-h-[38px] px-3.5 rounded-lg text-xs sm:text-sm font-extrabold ${
                            la.utama
                              ? 'bg-[#064e3b] text-white hover:bg-[#0f5132]'
                              : 'border border-[#dee3da] bg-white text-[#064e3b] hover:bg-[#f6f8f4]'
                          }`}
                        >
                          {la.aksi}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Split layout: Action Tasks (Left) + Financial/Stats Aside (Right) */}
            <div className="flex flex-col lg:flex-row items-start gap-5">
              {/* Task Queue */}
              <section
                aria-labelledby="judul-tugas"
                className="w-full lg:flex-[999_1_440px] flex flex-col gap-2.5 min-w-0"
              >
                <h2 id="judul-tugas" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                  Perlu dikerjakan
                </h2>

                {tugasList.length > 0 ? (
                  <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                    {tugasList.map((t) => {
                      const isUrgent = Boolean(t.urgen);
                      return (
                        <li
                          key={t.id}
                          className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-2xl border ${
                            isUrgent
                              ? 'border-[#f3d7c6] bg-[#fffaf6]'
                              : 'border-[#dee3da] bg-white'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                              isUrgent
                                ? 'bg-[#ffeedd] text-[#c2410c]'
                                : 'bg-[#ebf2eb] text-[#157a4c]'
                            }`}
                          >
                            {t.ikon === 'pesanan' && (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                                <path d="M12 22V12" />
                                <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
                              </svg>
                            )}
                            {t.ikon === 'komplain' && (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                            )}
                            {t.ikon === 'stok' && (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 20h10" />
                                <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                                <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                              </svg>
                            )}
                            {t.ikon === 'kedaluwarsa' && (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                            )}
                          </span>

                          <div className="flex-1 min-w-[200px]">
                            <p className="text-sm sm:text-base font-extrabold text-[#173b2b] leading-snug">
                              {t.judul}
                            </p>
                            <p
                              className={`mt-0.5 text-xs sm:text-sm leading-relaxed ${
                                isUrgent ? 'text-[#9a3412] font-semibold' : 'text-[#3f5247]'
                              }`}
                            >
                              {t.ket}
                            </p>
                          </div>

                          <Link
                            href={t.href}
                            className={`shrink-0 inline-flex items-center justify-center min-h-[42px] px-4 rounded-xl text-xs sm:text-sm font-extrabold ${
                              isUrgent
                                ? 'bg-[#064e3b] text-white hover:bg-[#0f5132]'
                                : 'border border-[#dee3da] bg-white text-[#064e3b] hover:bg-[#f6f8f4]'
                            }`}
                          >
                            {t.aksi}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="p-4 border border-dashed border-[#c9d2c6] rounded-2xl bg-white text-sm text-[#3f5247]">
                    Belum ada yang perlu dikerjakan. Pesanan baru dan stok yang menipis akan muncul di sini.
                  </p>
                )}
              </section>

              {/* Right Sidebar: Balance, Sales Chart, Waitlist Progress */}
              <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
                {/* Balance Card */}
                <section
                  aria-labelledby="judul-saldo"
                  className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5"
                >
                  <h2 id="judul-saldo" className="text-xs sm:text-sm font-bold text-[#5a6b60]">
                    Saldo bisa ditarik
                  </h2>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
                    {saldoTeks}
                  </p>
                  <p className="text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                    {tertahanTeks} tertahan dari {data.pesananTertahanCount ?? 2} pesanan aktif.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Link
                      href="/toko/keuangan/penarikan"
                      className="flex-1 inline-flex items-center justify-center min-h-[42px] rounded-xl bg-[#064e3b] text-white text-sm font-extrabold hover:bg-[#0f5132]"
                    >
                      Tarik saldo
                    </Link>
                    <Link
                      href="/toko/keuangan"
                      className="inline-flex items-center justify-center min-h-[42px] px-4 rounded-xl border border-[#dee3da] text-[#064e3b] text-sm font-bold hover:bg-[#f6f8f4]"
                    >
                      Riwayat
                    </Link>
                  </div>
                </section>

                {/* Sales Chart Card */}
                <section
                  aria-labelledby="judul-minggu"
                  className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                >
                  <h2 id="judul-minggu" className="text-xs sm:text-sm font-bold text-[#5a6b60]">
                    Terjual minggu ini
                  </h2>
                  <div>
                    <p className="text-xl sm:text-2xl font-extrabold text-[#173b2b]">
                      {formattedTotalMinggu}
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#157a4c]">
                      Naik dari {formattedMingguLalu} minggu lalu
                    </p>
                  </div>

                  {/* 7-day mini bar chart */}
                  <div
                    role="img"
                    aria-label="Penjualan mingguan"
                    className="grid grid-cols-7 gap-1.5 items-end h-24 pt-2"
                  >
                    {harianList.map((item, idx) => {
                      const isToday = Boolean(item.isHariIni);
                      const barColor = isToday ? 'bg-[#064e3b]' : 'bg-[#a9cfae]';
                      const safeHeight = Math.max(8, Math.min(100, item.tinggiPersen || 20));

                      return (
                        <div key={idx} className="flex flex-col items-center justify-end h-full gap-1">
                          <span
                            className={`w-full rounded-t-sm ${barColor}`}
                            style={{ height: `${safeHeight}%` }}
                          />
                          <span className="text-[11px] font-bold text-[#5a6b60]">
                            {item.hari}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <p className="p-2.5 rounded-xl bg-[#f6f8f4] text-xs text-[#3f5247]">
                      <strong className="block text-base text-[#173b2b]">
                        {terjual?.jumlahPesanan ?? 14}
                      </strong>
                      pesanan
                    </p>
                    <p className="p-2.5 rounded-xl bg-[#f6f8f4] text-xs text-[#3f5247]">
                      <strong className="block text-base text-[#173b2b]">
                        {terjual?.jumlahDilihat ?? 312}
                      </strong>
                      kali dilihat
                    </p>
                  </div>
                </section>

                {/* Waitlist Quota Progress Card */}
                {data.daftarTungguAktif && (
                  <section
                    aria-labelledby="judul-dt"
                    className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h2 id="judul-dt" className="text-xs sm:text-sm font-bold text-[#5a6b60]">
                        Daftar Tunggu
                      </h2>
                      <ChipStatus status={data.daftarTungguAktif.status ?? 'ditanam'} />
                    </div>

                    <p className="text-base font-extrabold text-[#173b2b]">
                      <Link
                        href={data.daftarTungguAktif.hrefDetail ?? '/toko/daftar-tunggu'}
                        className="hover:underline underline-offset-2"
                      >
                        {data.daftarTungguAktif.namaTanaman}
                      </Link>
                    </p>

                    <p className="text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                      {data.daftarTungguAktif.perkiraanPanen ?? 'Perkiraan panen segera.'}
                    </p>

                    <div>
                      <div className="flex justify-between gap-2 text-xs mb-1.5">
                        <span className="font-bold text-[#173b2b]">
                          Minimal {data.daftarTungguAktif.terisiKg.toLocaleString('id-ID')} kg
                        </span>
                        <span className="text-[#3f5247]">
                          dari kuota {data.daftarTungguAktif.kuotaKg.toLocaleString('id-ID')} kg
                        </span>
                      </div>
                      <div aria-hidden="true" className="h-2 rounded-full bg-[#ebf2eb] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#c2a032]"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (data.daftarTungguAktif.terisiKg / (data.daftarTungguAktif.kuotaKg || 1)) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Link
                      href={data.daftarTungguAktif.hrefKabarLahan ?? '/toko/daftar-tunggu/kabar-lahan'}
                      className="self-start inline-flex items-center gap-1 min-h-[36px] text-xs sm:text-sm font-bold text-[#157a4c] hover:underline"
                    >
                      Kabari pengikut
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </section>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="beranda" />
      </div>
    </div>
  );
}

export default Toko;
