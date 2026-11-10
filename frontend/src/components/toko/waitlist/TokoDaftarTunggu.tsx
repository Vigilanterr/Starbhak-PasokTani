'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { ChipStatus, type StatusPasokTani } from '../../common/ChipStatus';

export interface KampanyeDaftarTungguItem {
  id: string;
  namaTanaman: string;
  varietas?: string;
  sub?: string;
  status?: 'ditanam' | 'tertunda' | 'siap' | 'jadwal-tanam' | 'selesai' | string;
  labelChip?: string;
  foto?: string;
  tab?: 'aktif' | 'selesai';
  kuotaKg: number;
  terkumpulKg?: number;
  persentaseKuota?: number;
  jumlahPemegang?: number;
  pengikut?: number;
  komitmen?: number;
  min?: number;
  maks?: number;
  tanggalTanam?: string;
  estimasiPanen?: string;
  teksJalur?: string;
  persen?: number;
  hargaPerKg?: number;
  dpPerKg?: number;
  tahap?: 'pendaftaran' | 'penanaman' | 'perawatan' | 'panen' | 'distribusi' | 'selesai' | string;
  perluTindakan?: boolean;
  pesanTindakan?: string;
  kabar?: string;
  kabarLama?: boolean;
  berubah?: boolean;
  labelUbah?: string;
  semula?: string;
  hrefKelola?: string;
  hrefKabar?: string;
}

export interface ItemTindakanDaftarTunggu {
  id: string;
  judul: string;
  ket: string;
  aksi: string;
  href: string;
}

export interface TokoDaftarTungguProps {
  kampanyeList?: KampanyeDaftarTungguItem[];
  kosong?: boolean;
  className?: string;
}

const DEFAULT_KAMPANYE_LIST: KampanyeDaftarTungguItem[] = [
  {
    id: 'kentang',
    namaTanaman: 'Kentang Granola',
    varietas: 'Granola Lembang',
    sub: 'Lahan Cikole · petak bawah, sekitar 0,3 ha',
    status: 'tertunda',
    tab: 'aktif',
    kuotaKg: 1500,
    pengikut: 31,
    komitmen: 14,
    min: 1090,
    maks: 1480,
    tanggalTanam: '29 Agu',
    estimasiPanen: '20–27 Nov',
    teksJalur: 'Ditanam 29 Agu · Panen 20–27 Nov (sekitar 2 minggu lagi)',
    persen: 75,
    berubah: true,
    labelUbah: 'Panen tertunda 10 hari.',
    semula: '10–17 Nov',
    kabar: 'Kabar lahan terakhir 6 hari lalu',
    kabarLama: false,
    perluTindakan: false,
    hrefKelola: '/toko/daftar-tunggu/kentang',
    hrefKabar: '/toko/daftar-tunggu/kentang/kabar-lahan',
  },
  {
    id: 'wortel',
    namaTanaman: 'Wortel Lembang',
    varietas: 'Kuroda',
    sub: 'Lahan Cikole · petak atas',
    status: 'siap',
    tab: 'aktif',
    kuotaKg: 400,
    pengikut: 18,
    komitmen: 6,
    min: 300,
    maks: 420,
    tanggalTanam: '15 Agu',
    estimasiPanen: 'Siap panen hari ini',
    teksJalur: 'Ditanam 15 Agu · Siap panen hari ini',
    persen: 100,
    kabar: 'Kabar lahan terakhir 2 hari lalu',
    kabarLama: false,
    perluTindakan: true,
    pesanTindakan: 'Wortel siap panen. Isi hasil panen untuk menghitung pembagian ke 6 pemegang Komitmen.',
    hrefKelola: '/toko/daftar-tunggu/wortel/komitmen',
    hrefKabar: '/toko/daftar-tunggu/wortel/kabar-lahan',
  },
  {
    id: 'cabai',
    namaTanaman: 'Cabai Rawit Hijau',
    varietas: 'Bara',
    sub: 'Lahan Jayagiri · 0,2 ha',
    status: 'ditanam',
    tab: 'aktif',
    kuotaKg: 600,
    pengikut: 24,
    komitmen: 9,
    min: 340,
    maks: 550,
    tanggalTanam: '10 Sep',
    estimasiPanen: '5–15 Des',
    teksJalur: 'Ditanam 10 Sep · Perkiraan panen 5–15 Des',
    persen: 50,
    kabar: 'Kabar lahan terakhir 16 hari lalu (perlu update)',
    kabarLama: true,
    perluTindakan: true,
    pesanTindakan: 'Sudah lebih dari 2 minggu belum ada kabar lahan untuk Cabai Rawit Hijau.',
    hrefKelola: '/toko/daftar-tunggu/cabai',
    hrefKabar: '/toko/daftar-tunggu/cabai/kabar-lahan',
  },
  {
    id: 'tomat-kemarin',
    namaTanaman: 'Tomat Beef Martha',
    varietas: 'Martha F1',
    sub: 'Lahan Cikole · Greenhouse 1',
    status: 'selesai',
    tab: 'selesai',
    kuotaKg: 800,
    pengikut: 42,
    komitmen: 19,
    min: 780,
    maks: 800,
    tanggalTanam: '10 Jul',
    estimasiPanen: 'Selesai 25 Okt',
    teksJalur: 'Panen selesai 25 Okt · Alokasi 100% terpenuhi',
    persen: 100,
    kabar: 'Kampanye panen selesai',
    kabarLama: false,
    hrefKelola: '/toko/daftar-tunggu/tomat-kemarin',
    hrefKabar: '/toko/daftar-tunggu/tomat-kemarin/kabar-lahan',
  },
];

const DEFAULT_TINDAKAN_LIST: ItemTindakanDaftarTunggu[] = [
  {
    id: 'wortel-panen',
    judul: 'Wortel siap panen.',
    ket: 'Isi hasil panen layak jual untuk membagi kuota ke 6 pemegang Komitmen.',
    aksi: 'Isi hasil panen',
    href: '/toko/daftar-tunggu/wortel/komitmen',
  },
  {
    id: 'cabai-kabar',
    judul: 'Cabai Rawit Hijau belum ada kabar baru.',
    ket: 'Sudah lebih dari 14 hari sejak kabar terakhir. Pengikut butuh kabar perkembangan.',
    aksi: 'Kirim kabar lahan',
    href: '/toko/daftar-tunggu/cabai/kabar-lahan',
  },
];

export function TokoDaftarTunggu({
  kampanyeList = DEFAULT_KAMPANYE_LIST,
  kosong = false,
  className = '',
}: TokoDaftarTungguProps) {
  const [tabAktif, setTabAktif] = useState<'aktif' | 'selesai'>('aktif');

  const isActuallyEmpty = kosong || kampanyeList.length === 0;

  const activeCrops = kampanyeList.filter((c) => (c.tab ?? 'aktif') === 'aktif');
  const completedCrops = kampanyeList.filter((c) => c.tab === 'selesai');
  const filteredCrops = tabAktif === 'aktif' ? activeCrops : completedCrops;

  return (
    <div className={`relative min-h-screen bg-[#fcfbf6] font-['Plus_Jakarta_Sans',sans-serif] text-[#173b2b] ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-none w-[272px] p-5 pr-0 pb-6">
          <TokoSamping aktif="prapanen" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-5 md:py-5 md:px-6 md:pb-12">
          <div className="max-w-[1040px] flex flex-col gap-4.5">
            {/* Header with Title and Create Button */}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex-1 min-w-[280px]">
                <h1 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#173b2b]">
                  Daftar Tunggu
                </h1>
                <p className="mt-1.5 mb-0 text-sm text-[#3f5247] max-w-[65ch] leading-relaxed">
                  Tanaman yang belum dipanen. Pembeli bisa mengikuti kabarnya dan memesan lebih dulu
                  lewat Komitmen.
                </p>
              </div>

              {!isActuallyEmpty && (
                <Link
                  href="/toko/daftar-tunggu/baru"
                  className="inline-flex items-center gap-2 min-h-[46px] px-4.5 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold hover:bg-[#053d2e]"
                >
                  {/* Plus Icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Buat Daftar Tunggu</span>
                </Link>
              )}
            </div>

            {/* Empty State */}
            {isActuallyEmpty ? (
              <section
                aria-labelledby="judul-kosong"
                className="p-7 px-5 border-[1.5px] border-dashed border-[#a9cfae] rounded-2xl bg-white flex flex-col items-start gap-3"
              >
                {/* Seedling large SVG */}
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#157a4c"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 20h10" />
                  <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                  <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                  <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                </svg>
                <h2 id="judul-kosong" className="m-0 text-xl font-extrabold text-[#173b2b]">
                  Belum ada Daftar Tunggu
                </h2>
                <p className="m-0 max-w-[56ch] text-sm leading-relaxed text-[#3f5247]">
                  Catat tanaman yang sedang atau akan kamu tanam. Pembeli yang tertarik bisa
                  mengikuti kabarnya, dan setelah ditanam kamu bisa membuka Komitmen supaya hasil panen
                  sudah ada pembelinya.
                </p>
                <Link
                  href="/toko/daftar-tunggu/baru"
                  className="inline-flex items-center min-h-[46px] px-4.5 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold hover:bg-[#053d2e]"
                >
                  Buat Daftar Tunggu pertama
                </Link>
              </section>
            ) : (
              <>
                {/* Perlu Tindakan Alert Banner (if any) */}
                <section
                  aria-labelledby="judul-tindakan"
                  className="p-4 px-4.5 rounded-2xl border-[1.5px] border-[#f3d7c6] bg-[#fffaf6] flex flex-col gap-2.5"
                >
                  <h2 id="judul-tindakan" className="m-0 text-sm font-extrabold text-[#173b2b]">
                    Perlu tindakan
                  </h2>
                  <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                    {DEFAULT_TINDAKAN_LIST.map((t) => (
                      <li
                        key={t.id}
                        className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f3e3d6]"
                      >
                        <p className="flex-1 min-w-[280px] m-0 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                          <strong className="text-[#173b2b]">{t.judul}</strong> {t.ket}
                        </p>
                        <Link
                          href={t.href}
                          className="inline-flex items-center min-h-[38px] px-3.5 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-xs font-extrabold hover:bg-[#f6f8f4]"
                        >
                          {t.aksi}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Filter Tabs: Aktif / Selesai */}
                <div role="tablist" className="flex gap-2 border-b border-[#dee3da] pb-1">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tabAktif === 'aktif'}
                    onClick={() => setTabAktif('aktif')}
                    className={`min-h-[40px] px-4 rounded-xl text-sm font-bold cursor-pointer border-0 ${
                      tabAktif === 'aktif'
                        ? 'bg-[#064e3b] text-white'
                        : 'bg-transparent text-[#3f5247] hover:bg-[#ebf2eb]'
                    }`}
                  >
                    Aktif ({activeCrops.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tabAktif === 'selesai'}
                    onClick={() => setTabAktif('selesai')}
                    className={`min-h-[40px] px-4 rounded-xl text-sm font-bold cursor-pointer border-0 ${
                      tabAktif === 'selesai'
                        ? 'bg-[#064e3b] text-white'
                        : 'bg-transparent text-[#3f5247] hover:bg-[#ebf2eb]'
                    }`}
                  >
                    Selesai ({completedCrops.length})
                  </button>
                </div>

                {/* Crop Campaign Cards Grid (2 columns on md/lg) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCrops.map((c) => {
                    const minKg = c.min ?? 1090;
                    const maxKg = c.maks ?? 1480;
                    const kuota = c.kuotaKg;
                    const minPct = Math.min(100, Math.round((minKg / kuota) * 100));
                    const maxPct = Math.min(100, Math.round((maxKg / kuota) * 100));
                    const progressPersen = c.persen ?? 60;

                    return (
                      <div
                        key={c.id}
                        className="p-4 sm:p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
                      >
                        {/* Title & Status */}
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="m-0 text-lg font-extrabold text-[#173b2b]">
                              {c.namaTanaman}
                            </h3>
                            <ChipStatus status={c.status as StatusPasokTani} ukuran="kecil" />
                          </div>
                          {c.sub && <p className="mt-1 mb-0 text-xs text-[#5a6b60]">{c.sub}</p>}
                        </div>

                        {/* Progress Timeline */}
                        <div>
                          <div
                            aria-hidden="true"
                            className="relative h-[22px] flex items-center"
                          >
                            <span className="absolute left-0 right-0 top-2.5 border-t-2 border-dotted border-[#c9d2c6]" />
                            <span
                              className="absolute left-0 top-2.5 border-t-2 border-dotted border-[#c2a032]"
                              style={{ width: `${progressPersen}%` }}
                            />
                            <span
                              className="absolute top-1.5 w-4 h-4 rounded-full bg-[#064e3b] grid place-items-center -ml-2"
                              style={{ left: `${progressPersen}%` }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#e9c75c]" />
                            </span>
                          </div>
                          <p className="mt-0.5 mb-0 text-xs text-[#3f5247]">{c.teksJalur}</p>
                        </div>

                        {/* Schedule change notice if any */}
                        {c.berubah && (
                          <p className="m-0 text-xs leading-relaxed text-[#92400e]">
                            <strong>{c.labelUbah}</strong> Semula <s>{c.semula}</s>
                          </p>
                        )}

                        {/* Metrics: Followers & Commitments */}
                        <dl className="m-0 grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 px-3 rounded-xl bg-[#f6f8f4]">
                            <dt className="text-[#3f5247]">Pengikut</dt>
                            <dd className="m-0 mt-0.5 text-base font-extrabold text-[#173b2b]">
                              {c.pengikut ?? 0}
                            </dd>
                          </div>
                          <div className="p-2.5 px-3 rounded-xl bg-[#f6f8f4]">
                            <dt className="text-[#3f5247]">Komitmen</dt>
                            <dd className="m-0 mt-0.5 text-base font-extrabold text-[#173b2b]">
                              {c.komitmen ?? 0}
                            </dd>
                          </div>
                        </dl>

                        {/* Dual Quota Progress Bar */}
                        <div>
                          <p className="m-0 mb-1.5 flex justify-between text-xs">
                            <span className="font-extrabold text-[#173b2b]">
                              Dipesan min {minKg.toLocaleString('id-ID')} kg
                            </span>
                            <span className="text-[#3f5247]">dari kuota {kuota.toLocaleString('id-ID')} kg</span>
                          </p>
                          <div
                            aria-hidden="true"
                            className="relative h-2.5 rounded-full bg-[#ebf2eb] overflow-hidden"
                          >
                            {/* Striped additional bar */}
                            <span
                              className="absolute left-0 top-0 bottom-0 bg-[repeating-linear-gradient(135deg,#e9d79a_0_4px,#f4e9c4_4px_8px)]"
                              style={{ width: `${maxPct}%` }}
                            />
                            {/* Solid gold min bar */}
                            <span
                              className="absolute left-0 top-0 bottom-0 rounded-full bg-[#c2a032]"
                              style={{ width: `${minPct}%` }}
                            />
                          </div>
                          <p className="mt-1.5 mb-0 text-[11px] text-[#5a6b60]">
                            Maks {maxKg.toLocaleString('id-ID')} kg kalau panen melimpah
                          </p>
                        </div>

                        {/* Field log status */}
                        <p
                          className={`m-0 text-xs ${
                            c.kabarLama ? 'text-[#b42318] font-bold' : 'text-[#5a6b60]'
                          }`}
                        >
                          {c.kabar}
                        </p>

                        {/* Action buttons */}
                        <div className="mt-auto pt-2 flex flex-wrap gap-2">
                          <Link
                            href={c.hrefKelola ?? `/toko/daftar-tunggu/${c.id}`}
                            className="flex-1 min-w-[120px] inline-flex items-center justify-center min-h-[42px] px-3.5 rounded-xl bg-[#064e3b] text-white text-xs sm:text-sm font-extrabold hover:bg-[#053d2e]"
                          >
                            {c.status === 'siap' ? 'Isi hasil panen' : 'Kelola status'}
                          </Link>

                          <Link
                            href={c.hrefKabar ?? `/toko/daftar-tunggu/${c.id}/kabar-lahan`}
                            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3.5 rounded-xl border border-[#dee3da] bg-white text-[#064e3b] text-xs sm:text-sm font-extrabold hover:bg-[#f6f8f4]"
                          >
                            {/* Camera icon */}
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
                              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                              <circle cx="12" cy="13" r="3" />
                            </svg>
                            <span>Kabar lahan</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="m-0 text-xs leading-relaxed text-[#5a6b60]">
                  Garis emas tebal adalah jumlah minimal yang sudah pasti dipesan. Garis berarsir
                  adalah tambahan sampai jumlah maksimal, dipenuhi kalau hasil panen cukup.
                </p>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <div className="block lg:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="prapanen" />
      </div>
    </div>
  );
}
