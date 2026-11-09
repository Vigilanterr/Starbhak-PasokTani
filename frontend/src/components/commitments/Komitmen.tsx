'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChipStatus, StatusPasokTani } from '../common';
import { AkunMenu } from '../layout';

export type TabKomitmen = 'aktif' | 'selesai' | 'batal';

export interface ItemKomitmen {
  id?: string;
  nomor?: string;
  tab?: TabKomitmen | string;
  nama: string;
  petani: string;
  status: StatusPasokTani | string;
  labelChip?: string;
  jumlah: string;
  harga: string | number;
  dana: string | number;
  labelDana?: string;
  urut: string;
  labelUrut?: string;
  langkah: string;
  urgen?: boolean;
  aksi?: string;
  href?: string;
}

export type KomitmenListItem = ItemKomitmen;

export interface KomitmenProps {
  komitmenList?: ItemKomitmen[];
  tabAktif?: TabKomitmen;
  tabAwal?: TabKomitmen;
  uangMukaDitahan?: string;
  kosong?: boolean;
  onPilihTab?: (tab: TabKomitmen) => void;
  onKlikAksi?: (item: ItemKomitmen) => void;
  className?: string;
}

const DEFAULT_KOMITMEN_LIST: ItemKomitmen[] = [
  {
    id: 'KM-26101908',
    tab: 'aktif',
    nama: 'Bawang Merah Bima',
    petani: 'Kebun Pak Darsono, Cirebon',
    nomor: 'KM-26101908',
    status: 'tertunda',
    jumlah: '10 sampai 15 kg',
    harga: 'Rp 30.000/kg',
    dana: 'Rp 135.000',
    urut: 'ke-5 dari 9',
    langkah: 'Panen mundur 9 hari ke Rab, 25 Nov. Kamu boleh batal tanpa potongan sampai hasil panen diisi.',
    urgen: true,
    aksi: 'Pilih lanjut atau batal',
    href: '/komitmen/KM-26101908',
  },
  {
    id: 'KM-26102204',
    tab: 'aktif',
    nama: 'Beras Pandan Wangi',
    petani: 'Sawah Bu Eti, Cianjur',
    nomor: 'KM-26102204',
    status: 'ditanam',
    jumlah: '5 sampai 10 kg',
    harga: 'Rp 15.000/kg',
    dana: 'Rp 45.000',
    urut: 'ke-6 dari 11',
    langkah: 'Perkiraan panen 18 sampai 20 Nov. Setelah hasil diisi, bayar sisa dalam 48 jam.',
    urgen: false,
    aksi: 'Lihat',
    href: '/komitmen/KM-26102204',
  },
  {
    id: 'KM-26090311',
    tab: 'selesai',
    nama: 'Cabai Merah Keriting',
    petani: 'Kebun Pak Darsono, Cirebon',
    nomor: 'KM-26090311',
    status: 'selesai',
    labelChip: 'Diterima',
    jumlah: '12 kg diterima',
    harga: 'Rp 35.000/kg',
    dana: 'Rp 420.000',
    labelDana: 'Nilai barang',
    urut: '12 dari 10 sampai 15 kg',
    labelUrut: 'Dapat',
    langkah: 'Diterima Sel, 13 Okt.',
    urgen: false,
    aksi: 'Lihat ringkasan',
    href: '/komitmen/KM-26090311',
  },
];

export function Komitmen({
  komitmenList = DEFAULT_KOMITMEN_LIST,
  tabAktif: tabAktifProp,
  tabAwal = 'aktif',
  uangMukaDitahan,
  kosong = false,
  onPilihTab,
  onKlikAksi,
  className = '',
}: KomitmenProps) {
  const [internalTab, setInternalTab] = useState<TabKomitmen>(tabAwal);
  const activeTab = tabAktifProp ?? internalTab;

  const dataList = kosong ? [] : komitmenList;

  const countForTab = (t: TabKomitmen) =>
    dataList.filter((item) => (item.tab ?? 'aktif') === t).length;

  const itemsInActiveTab = dataList.filter(
    (item) => (item.tab ?? 'aktif') === activeTab
  );

  const totalEmpty = dataList.length === 0;

  const handleTabSelect = (tabId: TabKomitmen) => {
    setInternalTab(tabId);
    onPilihTab?.(tabId);
  };

  const tabs: Array<{ id: TabKomitmen; label: string }> = [
    { id: 'aktif', label: 'Aktif' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'batal', label: 'Dibatalkan' },
  ];

  const ringkasText = uangMukaDitahan
    ? `Uang muka ${uangMukaDitahan} ditahan untuk ${countForTab('aktif')} Komitmen aktif.`
    : totalEmpty
    ? 'Belum ada Komitmen.'
    : `Uang muka Rp 180.000 ditahan untuk ${countForTab('aktif')} Komitmen aktif.`;

  return (
    <div className={`relative min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-7 md:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Desktop Navigation Sidebar */}
          <div className="hidden md:block flex-none w-[272px]">
            <AkunMenu aktif="komitmen" />
          </div>

          {/* Main Column */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Header row */}
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-2.5">
              <div>
                <h1 className="m-0 text-[28px] md:text-[34px] font-extrabold leading-tight tracking-tight">
                  Komitmen saya
                </h1>
                <p className="m-0 mt-1.5 text-[15px] text-[#3f5247]">
                  {ringkasText}
                </p>
              </div>
              <Link
                href="/ikuti"
                className="inline-flex items-center min-h-[44px] px-4 border-[1.5px] border-[#064e3b] rounded-xl text-[#064e3b] text-sm font-extrabold no-underline bg-white hover:bg-[#f3faf3]"
              >
                Daftar Tunggu diikuti
              </Link>
            </div>

            {/* How Commitments Work Guide Box */}
            <section
              aria-labelledby="judul-cara"
              className="p-4 md:px-[18px] border border-[#dee3da] rounded-2xl bg-white"
            >
              <h2
                id="judul-cara"
                className="m-0 mb-3 text-[15px] font-extrabold text-[#173b2b]"
              >
                Cara Komitmen bekerja
              </h2>
              <ol className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-3 gap-3">
                <li className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-[26px] h-[26px] rounded-full grid place-items-center bg-[#064e3b] text-white text-[13px] font-extrabold"
                  >
                    1
                  </span>
                  <span className="text-[13px] leading-normal text-[#3f5247]">
                    <strong className="block text-sm text-[#173b2b]">
                      Uang muka 30%
                    </strong>
                    Dari jumlah paling banyak, ditahan Pasok Tani. Harga dikunci.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-[26px] h-[26px] rounded-full grid place-items-center bg-[#064e3b] text-white text-[13px] font-extrabold"
                  >
                    2
                  </span>
                  <span className="text-[13px] leading-normal text-[#3f5247]">
                    <strong className="block text-sm text-[#173b2b]">
                      Panen, bayar sisa
                    </strong>
                    Petani mengisi hasil. Kamu bayar sisanya dalam 48 jam.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-[26px] h-[26px] rounded-full grid place-items-center bg-[#064e3b] text-white text-[13px] font-extrabold"
                  >
                    3
                  </span>
                  <span className="text-[13px] leading-normal text-[#3f5247]">
                    <strong className="block text-sm text-[#173b2b]">
                      Dikirim
                    </strong>
                    Paling lambat 3 hari setelah lunas. Jadwal bisa diubah 1 kali gratis.
                  </span>
                </li>
              </ol>
            </section>

            {/* Filter Tab Group */}
            <div
              role="group"
              aria-label="Saring Komitmen"
              className="flex gap-2 overflow-x-auto pb-0.5"
            >
              {tabs.map((t) => {
                const isSelected = activeTab === t.id;
                const count = countForTab(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleTabSelect(t.id)}
                    className={`shrink-0 min-h-[44px] px-3.5 rounded-full text-sm font-bold cursor-pointer ${
                      isSelected
                        ? 'border border-[#064e3b] bg-[#064e3b] text-white'
                        : 'border border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                    }`}
                  >
                    {t.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Empty State */}
            {itemsInActiveTab.length === 0 && (
              <div className="p-5 md:p-[22px] border-[1.5px] border-dashed border-[#a9cfae] rounded-2xl bg-white flex flex-col items-start gap-2.5">
                <p className="m-0 text-base font-extrabold text-[#173b2b]">
                  {totalEmpty
                    ? 'Belum ada Komitmen'
                    : 'Tidak ada Komitmen di sini'}
                </p>
                <p className="m-0 max-w-[56ch] text-sm leading-relaxed text-[#3f5247]">
                  {totalEmpty
                    ? 'Komitmen adalah pesanan sebelum panen. Ikuti tanaman di Daftar Tunggu, lalu pilih Buat Komitmen supaya kebagian hasil panennya.'
                    : 'Komitmen yang dibatalkan akan muncul di sini, lengkap dengan uang yang dikembalikan.'}
                </p>
                {totalEmpty && (
                  <Link
                    href="/ikuti"
                    className="inline-flex items-center min-h-[48px] px-[18px] rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline hover:bg-[#157a4c]"
                  >
                    Lihat Daftar Tunggu
                  </Link>
                )}
              </div>
            )}

            {/* Cards List */}
            {itemsInActiveTab.length > 0 && (
              <ul className="m-0 p-0 list-none flex flex-col gap-3.5">
                {itemsInActiveTab.map((k, idx) => {
                  const isUrgent = !!k.urgen;
                  const itemKey = k.id ?? k.nomor ?? `km-${idx}`;
                  const hrefLink = k.href ?? `/komitmen/${itemKey}`;

                  return (
                    <li
                      key={itemKey}
                      className={`p-4 md:p-[18px] rounded-2xl flex flex-col gap-3 ${
                        isUrgent
                          ? 'border-[1.5px] border-[#e9c75c] bg-[#fffdf5]'
                          : 'border border-[#dee3da] bg-white'
                      }`}
                    >
                      {/* Top Row: Name, Merchant, Status Chip */}
                      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                        <div className="min-w-0">
                          <h2 className="m-0 text-lg font-extrabold text-[#173b2b]">
                            {k.nama}
                          </h2>
                          <p className="m-0 mt-0.5 text-[13px] text-[#3f5247]">
                            {k.petani}. {k.nomor}
                          </p>
                        </div>
                        <ChipStatus
                          status={k.status}
                          label={k.labelChip}
                        />
                      </div>

                      {/* 4-Column Metric Grid */}
                      <dl className="m-0 grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="p-2 md:px-3 rounded-xl bg-[#f6f8f4]">
                          <dt className="text-xs text-[#3f5247]">Jumlah</dt>
                          <dd className="m-0 text-sm md:text-[15px] font-extrabold text-[#173b2b]">
                            {k.jumlah}
                          </dd>
                        </div>
                        <div className="p-2 md:px-3 rounded-xl bg-[#f6f8f4]">
                          <dt className="text-xs text-[#3f5247]">Harga dikunci</dt>
                          <dd className="m-0 text-sm md:text-[15px] font-extrabold text-[#173b2b]">
                            {k.harga}
                          </dd>
                        </div>
                        <div className="p-2 md:px-3 rounded-xl bg-[#f6f8f4]">
                          <dt className="text-xs text-[#3f5247]">
                            {k.labelDana ?? 'Uang muka ditahan'}
                          </dt>
                          <dd className="m-0 text-sm md:text-[15px] font-extrabold text-[#173b2b]">
                            {k.dana}
                          </dd>
                        </div>
                        <div className="p-2 md:px-3 rounded-xl bg-[#f6f8f4]">
                          <dt className="text-xs text-[#3f5247]">
                            {k.labelUrut ?? 'Urutan'}
                          </dt>
                          <dd className="m-0 text-sm md:text-[15px] font-extrabold text-[#173b2b]">
                            {k.urut}
                          </dd>
                        </div>
                      </dl>

                      {/* Card Footer: Step Instruction and Action CTA */}
                      <div className="flex flex-wrap items-center justify-between gap-x-3.5 gap-y-2">
                        <p
                          className={`flex-1 basis-[300px] m-0 text-sm leading-relaxed ${
                            isUrgent
                              ? 'text-[#92400e] font-bold'
                              : 'text-[#3f5247] font-medium'
                          }`}
                        >
                          {k.langkah}
                        </p>
                        {onKlikAksi ? (
                          <button
                            type="button"
                            onClick={() => onKlikAksi(k)}
                            className={`shrink-0 inline-flex items-center min-h-[44px] px-4 rounded-xl border-[1.5px] border-[#064e3b] text-sm font-extrabold cursor-pointer ${
                              isUrgent
                                ? 'bg-[#064e3b] text-white hover:bg-[#157a4c]'
                                : 'bg-white text-[#064e3b] hover:bg-[#f3faf3]'
                            }`}
                          >
                            {k.aksi ?? 'Lihat'}
                          </button>
                        ) : (
                          <Link
                            href={hrefLink}
                            className={`shrink-0 inline-flex items-center min-h-[44px] px-4 rounded-xl border-[1.5px] border-[#064e3b] text-sm font-extrabold no-underline ${
                              isUrgent
                                ? 'bg-[#064e3b] text-white hover:bg-[#157a4c]'
                                : 'bg-white text-[#064e3b] hover:bg-[#f3faf3]'
                            }`}
                          >
                            {k.aksi ?? 'Lihat'}
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Komitmen;
