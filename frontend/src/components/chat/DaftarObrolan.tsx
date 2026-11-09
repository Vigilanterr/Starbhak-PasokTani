'use client';

import React, { useState } from 'react';
import type { RoleChat, ObrolanListItem, RingkasanObrolan } from './types';

export type { RingkasanObrolan };

export interface DaftarObrolanProps {
  peran?: RoleChat;
  aktif?: string;
  sempit?: boolean;
  kosong?: boolean;
  lewat?: boolean;
  daftar?: ObrolanListItem[];
  obrolanList?: RingkasanObrolan[];
  onPilih?: (id: string) => void;
  onCari?: (query: string) => void;
  className?: string;
}

const DATA_PEMBELI_DEFAULT: ObrolanListItem[] = [
  {
    id: 'ujang',
    nama: 'Kebun Mang Ujang',
    sub: 'Pesanan PT-26110418',
    terakhir: 'Kamu: Oke Pak, saya ajukan komplainnya sekarang.',
    waktu: '09.28',
    belum: 0,
    cepat: true,
  },
  {
    id: 'cikajang',
    nama: 'Tani Cikajang',
    sub: 'Pesanan PT-26110714',
    terakhir: 'Cabai sudah dikirim, resi JNE menyusul sore ini.',
    waktu: 'Kemarin',
    belum: 1,
    cepat: true,
  },
  {
    id: 'jamur',
    nama: 'Kumbung Jamur Ciremai',
    sub: 'Pesanan PT-26110716',
    terakhir: 'Kamu: Boleh dibatalkan saja kalau belum diproses?',
    waktu: 'Sab',
    belum: 0,
    cepat: false,
  },
  {
    id: 'darma',
    nama: 'Sawah Pak Darma',
    sub: 'Pesanan PT-26102914',
    terakhir: 'Terima kasih Bu Dewi, berasnya semoga cocok.',
    waktu: '2 Nov',
    belum: 0,
    cepat: false,
  },
];

function getFarmerDefaultData(lewat: boolean): ObrolanListItem[] {
  return [
    {
      id: 'dewi',
      nama: 'Dewi Lestari',
      sub: 'UMKM · Pesanan PT-26110418',
      terakhir: 'Oke Pak, saya ajukan komplainnya sekarang.',
      waktu: '09.28',
      belum: 1,
      menit: 18,
      cepat: false,
    },
    {
      id: 'dadang',
      nama: 'Toko Sayur Mang Dadang',
      sub: 'UMKM · Pesanan PT-26110822',
      terakhir: 'Kol 20 kg besok pagi bisa ya Pak? Kami ambil sendiri.',
      waktu: lewat ? '08.20' : '08.48',
      belum: 2,
      menit: lewat ? 72 : 52,
      cepat: false,
    },
    {
      id: 'ampera',
      nama: 'RM Ampera Lembang',
      sub: 'Komitmen Wortel',
      terakhir: 'Kamu: Panen sekitar Kamis, kabar menyusul lewat Daftar Tunggu.',
      waktu: 'Kemarin',
      belum: 0,
      cepat: false,
    },
    {
      id: 'rina',
      nama: 'Rina Amalia',
      sub: 'Rumah tangga · Pesanan PT-26110809',
      terakhir: 'Kamu: Siap Bu, diambil Senin ya.',
      waktu: 'Jum',
      belum: 0,
      cepat: false,
    },
  ];
}

export function DaftarObrolan({
  peran = 'pembeli',
  aktif = '',
  sempit = false,
  kosong = false,
  lewat = false,
  daftar,
  obrolanList,
  onPilih,
  onCari,
  className = '',
}: DaftarObrolanProps) {
  const petani = peran === 'petani';
  const [tab, setTab] = useState<'semua' | 'belum'>('semua');
  const [q, setQ] = useState('');

  const labelCari = petani ? 'Cari pembeli' : 'Cari petani';
  const sumberData = kosong
    ? []
    : obrolanList ?? daftar ?? (petani ? getFarmerDefaultData(lewat) : DATA_PEMBELI_DEFAULT);

  const queryBersih = q.toLowerCase().trim();
  const filteredList = sumberData.filter((item) => {
    const unread = (item.belum ?? item.unreadCount ?? 0) > 0;
    if (tab === 'belum' && !unread) return false;
    if (queryBersih && !(item.nama ?? '').toLowerCase().includes(queryBersih)) return false;
    return true;
  });

  const jmlBelum = sumberData.filter(
    (item) => (item.belum ?? item.unreadCount ?? 0) > 0
  ).length;

  const judulKosong = petani ? 'Belum ada pesan dari pembeli' : 'Belum ada obrolan';
  const isiKosong = petani
    ? 'Pesan dari pembeli masuk di sini. Targetmu membalas dalam 1 jam, dan hanya jam buka toko yang dihitung.'
    : 'Mulai dari tombol Chat petani di halaman produk atau detail pesanan. Obrolan terhubung ke produk dan pesanannya.';
  const aksiKosong = petani ? 'Buka pesanan masuk' : 'Lihat pesanan saya';
  const hrefKosong = petani
    ? (sempit ? '/toko/pesanan' : '/toko/pesanan')
    : (sempit ? '/pesanan' : '/pesanan');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQ(val);
    if (onCari) onCari(val);
  };

  return (
    <div
      className={`box-border w-full flex flex-col gap-3 font-sans text-ink ${className}`}
    >
      {/* Search Input and Filter Tabs */}
      <div className="flex flex-col gap-2.5">
        <label htmlFor="cari-obrolan" className="sr-only">
          {labelCari}
        </label>
        <div className="relative">
          <svg
            className="w-[18px] h-[18px] absolute left-3.5 top-[13px] text-[#5a6b60]"
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
          <input
            id="cari-obrolan"
            type="search"
            value={q}
            onChange={handleSearchChange}
            placeholder={labelCari}
            className="w-full box-border min-h-[44px] pl-10 pr-3.5 border-[1.5px] border-line rounded-xl bg-white text-ink font-sans text-[15px] focus:outline-none focus:border-field-border"
          />
        </div>

        <div role="group" aria-label="Saring obrolan" className="flex gap-2">
          <button
            type="button"
            aria-pressed={tab === 'semua'}
            onClick={() => setTab('semua')}
            className={`shrink-0 min-h-[44px] px-3.5 rounded-full font-bold text-sm cursor-pointer ${
              tab === 'semua'
                ? 'border border-brand-900 bg-brand-900 text-white'
                : 'border border-line bg-white text-ink'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            aria-pressed={tab === 'belum'}
            onClick={() => setTab('belum')}
            className={`shrink-0 min-h-[44px] px-3.5 rounded-full font-bold text-sm cursor-pointer ${
              tab === 'belum'
                ? 'border border-brand-900 bg-brand-900 text-white'
                : 'border border-line bg-white text-ink'
            }`}
          >
            Belum dibaca ({jmlBelum})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {kosong && (
        <div className="p-5 md:p-6 border-[1.5px] border-dashed border-[#a9cfae] rounded-2xl bg-white flex flex-col items-start gap-2.5">
          <p className="m-0 text-base font-extrabold text-ink">{judulKosong}</p>
          <p className="m-0 text-sm leading-[1.55] text-[#3f5247]">{isiKosong}</p>
          <a
            href={hrefKosong}
            className="inline-flex items-center min-h-[48px] px-[18px] rounded-xl bg-brand-900 text-white text-[15px] font-extrabold no-underline"
          >
            {aksiKosong}
          </a>
        </div>
      )}

      {/* Search No Results */}
      {!kosong && filteredList.length === 0 && (
        <p className="m-0 p-3.5 border-[1.5px] border-dashed border-[#c9d2c6] rounded-xl text-sm text-[#3f5247]">
          Tidak ada obrolan yang cocok.
        </p>
      )}

      {/* Thread Rows */}
      {!kosong && (
        <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
          {filteredList.map((o) => {
            const isAktif = o.id === aktif;
            const unreadCount = o.belum ?? o.unreadCount ?? 0;
            const hasUnread = unreadCount > 0;

            const inisial =
              o.inisial ??
              (o.nama ?? 'Pengguna')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((x) => x[0] ?? '')
                .join('')
                .toUpperCase();

            // Farmer SLA calculation
            const tunggu = petani && o.menit !== undefined && hasUnread;
            const over = Boolean(tunggu && (o.menit ?? 0) > 60);
            const sisa = Math.max(0, 60 - (o.menit ?? 0));
            const teksTunggu = over
              ? `Lewat target 1 jam (${Math.floor((o.menit ?? 0) / 60)} jam ${(o.menit ?? 0) % 60} mnt)`
              : `Menunggu ${o.menit ?? 0} mnt, sisa ${sisa} mnt dari target 1 jam`;
            const warnaTunggu = over ? '#8a1c12' : sisa <= 15 ? '#92400e' : '#3f5247';
            const warnaBar = over ? '#b42318' : sisa <= 15 ? '#b45309' : '#157a4c';
            const lebarTunggu = `${Math.min(100, Math.round(((o.menit ?? 0) / 60) * 100))}%`;

            const itemHref =
              o.href ??
              (petani
                ? sempit
                  ? `/toko/obrolan/${o.id}`
                  : `/toko/obrolan/${o.id}`
                : sempit
                ? `/obrolan/${o.id}`
                : `/obrolan/${o.id}`);

            return (
              <li key={o.id}>
                <a
                  href={itemHref}
                  aria-current={isAktif ? 'page' : undefined}
                  onClick={(e) => {
                    if (onPilih) {
                      e.preventDefault();
                      onPilih(o.id);
                    }
                  }}
                  className={`box-border flex items-start gap-3 p-3 rounded-[14px] text-ink no-underline cursor-pointer ${
                    isAktif
                      ? 'bg-tint'
                      : hasUnread
                      ? 'bg-[#f3faf3]'
                      : 'bg-transparent hover:bg-[#f6f8f4]'
                  }`}
                >
                  {/* Avatar Initials */}
                  <span
                    aria-hidden="true"
                    className={`shrink-0 w-11 h-11 rounded-xl grid place-items-center text-sm font-extrabold ${
                      petani ? 'bg-[#fbf3d9] text-[#5c4500]' : 'bg-brand-900 text-white'
                    }`}
                  >
                    {inisial}
                  </span>

                  {/* Thread details */}
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="flex items-baseline justify-between gap-2">
                      <strong className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-extrabold">
                        {o.nama ?? 'Pengguna'}
                      </strong>
                      <span className="shrink-0 text-xs text-[#5a6b60]">{o.waktu}</span>
                    </span>

                    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                      <span className="text-xs text-[#3f5247]">{o.sub}</span>
                      {o.cepat && !petani && (
                        <span className="inline-flex items-center gap-[3px] px-1.5 rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs leading-[18px] font-extrabold">
                          <svg
                            className="w-[11px] h-[11px]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                          </svg>
                          Petani Andalan
                        </span>
                      )}
                    </span>

                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm ${
                          hasUnread ? 'font-extrabold text-ink' : 'font-medium text-[#3f5247]'
                        }`}
                      >
                        {o.terakhir}
                      </span>
                      {hasUnread && (
                        <span className="shrink-0 min-w-[22px] h-[22px] box-border px-1.5 rounded-full bg-[#c2410c] text-white text-xs font-extrabold grid place-items-center">
                          {unreadCount}
                          <span className="sr-only">pesan belum dibaca</span>
                        </span>
                      )}
                    </span>

                    {/* Merchant 1-Hour SLA Timer */}
                    {tunggu && (
                      <span className="flex flex-col gap-1 mt-1">
                        <span
                          className="flex items-center gap-1.5 text-xs font-extrabold"
                          style={{ color: warnaTunggu }}
                        >
                          <svg
                            className="w-[13px] h-[13px]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          {teksTunggu}
                        </span>
                        <span
                          aria-hidden="true"
                          className="block h-1.5 rounded-full bg-[#eef0eb] overflow-hidden"
                        >
                          <span
                            className="block h-full"
                            style={{
                              width: lebarTunggu,
                              backgroundColor: warnaBar,
                            }}
                          />
                        </span>
                      </span>
                    )}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
