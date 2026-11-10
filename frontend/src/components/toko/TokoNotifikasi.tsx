'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../layout';
import { BarisNotifikasi } from '../common';
import type { IkonNotifikasi } from '../common/BarisNotifikasi';

export interface NotifikasiTokoItem {
  id: string;
  jenis: 'pesanan' | 'komitmen' | 'komplain' | 'dana' | 'stok' | string;
  ikon?: IkonNotifikasi | string;
  judul: string;
  isi: string;
  waktu: string;
  baru?: boolean;
  tindakan?: boolean;
  aksi?: string;
  href?: string;
  grupHari?: string;
}

export interface TokoNotifikasiProps {
  notifikasiList?: NotifikasiTokoItem[];
  kosong?: boolean;
  onTandaiSemuaDibaca?: () => void;
  className?: string;
}

const DEFAULT_NOTIFIKASI: NotifikasiTokoItem[] = [
  {
    id: 'n-act-1',
    jenis: 'pesanan',
    ikon: 'paket',
    judul: '3 pesanan perlu dikirim sebelum Sen, 9 Nov 13.41',
    isi: 'Lewat batas itu pesanan dibatalkan otomatis dan pembeli dikembalikan dananya.',
    waktu: '08.00',
    tindakan: true,
    baru: true,
    aksi: 'Buka pesanan masuk',
    href: '/toko/pesanan',
    grupHari: 'Hari ini, Sen 9 Nov',
  },
  {
    id: 'n-act-2',
    jenis: 'komitmen',
    ikon: 'tunas',
    judul: 'Wortel siap dipanen: isi hasil panen',
    isi: '6 pemegang Komitmen menunggu. Setelah hasil diisi, kuota dibagi sesuai urutan.',
    waktu: '07.10',
    tindakan: true,
    baru: true,
    aksi: 'Isi hasil panen',
    href: '/toko/daftar-tunggu/komitmen',
    grupHari: 'Hari ini, Sen 9 Nov',
  },
  {
    id: 'n-act-3',
    jenis: 'komplain',
    ikon: 'paket',
    judul: 'Komplain pesanan PT-26110418: sebagian kol layu',
    isi: 'Dewi melampirkan 2 foto. Dana pesanan ditahan sampai komplain selesai. Tanggapi sebelum Sel, 10 Nov 09.31.',
    waktu: '09.31',
    tindakan: true,
    baru: true,
    aksi: 'Tanggapi komplain',
    href: '/toko/pesanan/pt-26110418/komplain',
    grupHari: 'Hari ini, Sen 9 Nov',
  },
  {
    id: 'n-1',
    jenis: 'pesanan',
    ikon: 'paket',
    judul: 'Pesanan baru PT-26110822',
    isi: 'Toko Sayur Mang Dadang: kol bulat 20 kg, total Rp 140.000.',
    waktu: '09.40',
    baru: true,
    href: '/toko/pesanan/pt-26110822',
    grupHari: 'Hari ini, Sen 9 Nov',
  },
  {
    id: 'n-2',
    jenis: 'dana',
    ikon: 'uang',
    judul: 'Rp 212.000 bisa ditarik',
    isi: 'Pembeli mengonfirmasi penerimaan pesanan PT-26110702.',
    waktu: '08.52',
    baru: true,
    href: '/toko/keuangan',
    grupHari: 'Hari ini, Sen 9 Nov',
  },
  {
    id: 'n-3',
    jenis: 'komitmen',
    ikon: 'tunas',
    judul: 'Komitmen baru di Daftar Tunggu Wortel',
    isi: 'RM Ampera Lembang: 80 sampai 100 kg. Uang muka sudah ditahan.',
    waktu: '14.03',
    baru: false,
    href: '/toko/daftar-tunggu/komitmen',
    grupHari: 'Kemarin, Min 8 Nov',
  },
  {
    id: 'n-4',
    jenis: 'dana',
    ikon: 'uang',
    judul: 'Penarikan Rp 500.000 diproses',
    isi: 'Masuk ke rekening paling lambat Sel, 10 Nov (perkiraan sementara).',
    waktu: '10.30',
    baru: false,
    href: '/toko/keuangan/penarikan',
    grupHari: 'Kemarin, Min 8 Nov',
  },
  {
    id: 'n-5',
    jenis: 'pesanan',
    ikon: 'paket',
    judul: 'Stok Tomat Merah Lembang tinggal 6 kg',
    isi: 'Tambah stok supaya produk tetap bisa dipesan.',
    waktu: '16.45',
    baru: false,
    href: '/toko/produk/tomat/stok-baru',
    grupHari: 'Sab, 7 Nov',
  },
];

type KategoriTab = 'semua' | 'pesanan' | 'komitmen' | 'komplain' | 'dana';

export function TokoNotifikasi({
  notifikasiList,
  kosong: kosongProp,
  onTandaiSemuaDibaca,
  className = '',
}: TokoNotifikasiProps) {
  const [tabAktif, setTabAktif] = useState<KategoriTab>('semua');
  const [daftarNotif, setDaftarNotif] = useState<NotifikasiTokoItem[]>(
    notifikasiList ?? DEFAULT_NOTIFIKASI
  );

  const rawList = notifikasiList ?? daftarNotif;
  const isKosong = Boolean(kosongProp || rawList.length === 0);

  const unreadCount = rawList.filter((item) => item.baru).length;
  const actionRequiredCount = rawList.filter((item) => item.tindakan).length;

  const handleTandaiSemua = () => {
    setDaftarNotif((prev) => prev.map((item) => ({ ...item, baru: false })));
    if (onTandaiSemuaDibaca) {
      onTandaiSemuaDibaca();
    }
  };

  // Filter items by active category
  const filteredList = tabAktif === 'semua'
    ? rawList
    : rawList.filter((item) => item.jenis === tabAktif);

  // Split into actionable vs standard grouped by day
  const tindakanItems = filteredList.filter((item) => item.tindakan);
  const standardItems = filteredList.filter((item) => !item.tindakan);

  // Group standard items by grupHari
  const groupedHari: Record<string, NotifikasiTokoItem[]> = {};
  for (const item of standardItems) {
    const hari = item.grupHari || 'Lainnya';
    if (!groupedHari[hari]) {
      groupedHari[hari] = [];
    }
    groupedHari[hari]?.push(item);
  }

  const hariKeys = Object.keys(groupedHari);

  const tabs: { key: KategoriTab; label: string; count?: number }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'pesanan', label: 'Pesanan' },
    { key: 'komitmen', label: 'Komitmen' },
    { key: 'komplain', label: 'Komplain' },
    { key: 'dana', label: 'Dana' },
  ];

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas notif={unreadCount} />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="beranda" />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[760px]">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173b2b]">
                Notifikasi
              </h1>
              <p className="mt-1 text-sm sm:text-base text-[#3f5247]">
                {unreadCount > 0
                  ? `${unreadCount} belum dibaca, ${actionRequiredCount} perlu tindakan.`
                  : 'Semua notifikasi sudah dibaca.'}
              </p>
            </div>

            {isKosong ? (
              <div className="p-6 border-[1.5px] border-dashed border-[#a9cfae] rounded-2xl bg-white flex flex-col items-start gap-2.5">
                <p className="text-base font-extrabold text-[#173b2b]">Belum ada kabar</p>
                <p className="max-w-prose text-sm text-[#3f5247] leading-relaxed">
                  Pesanan baru, Komitmen, komplain, dan pencairan dana muncul di sini begitu ada.
                </p>
                <Link
                  href="/toko/pesanan"
                  className="inline-flex items-center justify-center min-h-[48px] px-5 rounded-xl bg-[#064e3b] text-white text-sm sm:text-base font-extrabold hover:bg-[#0f5132]"
                >
                  Buka pesanan masuk
                </Link>
              </div>
            ) : (
              <>
                {/* Filter tabs and Mark All Read CTA */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div
                    role="group"
                    aria-label="Saring jenis kabar"
                    className="flex gap-2 overflow-x-auto pb-1"
                  >
                    {tabs.map((tb) => {
                      const isActive = tabAktif === tb.key;
                      return (
                        <button
                          key={tb.key}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => setTabAktif(tb.key)}
                          className={`shrink-0 min-h-[42px] px-4 rounded-full text-xs sm:text-sm font-bold border ${
                            isActive
                              ? 'bg-[#064e3b] text-white border-[#064e3b]'
                              : 'bg-white text-[#173b2b] border-[#dee3da] hover:bg-[#f6f8f4]'
                          }`}
                        >
                          {tb.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleTandaiSemua}
                    disabled={unreadCount === 0}
                    className={`min-h-[40px] px-3 rounded-lg text-xs sm:text-sm font-extrabold bg-transparent ${
                      unreadCount === 0
                        ? 'text-[#5a6b60] opacity-50 cursor-not-allowed'
                        : 'text-[#064e3b] hover:underline'
                    }`}
                  >
                    Tandai semua dibaca
                  </button>
                </div>

                {/* Perlu Tindakan Section */}
                {tindakanItems.length > 0 && (
                  <section aria-labelledby="judul-tindakan" className="flex flex-col gap-2.5">
                    <h2 id="judul-tindakan" className="text-sm sm:text-base font-extrabold text-[#173b2b]">
                      Perlu tindakan{' '}
                      <span className="font-semibold text-[#5a6b60]">({tindakanItems.length})</span>
                    </h2>
                    <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                      {tindakanItems.map((item) => (
                        <li key={item.id}>
                          <BarisNotifikasi
                            item={{
                              id: item.id,
                              ikon: (item.ikon as IkonNotifikasi) || 'paket',
                              judul: item.judul,
                              isi: item.isi,
                              waktu: item.waktu,
                              baru: item.baru,
                              tindakan: true,
                              aksi: item.aksi,
                              href: item.href,
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Grouped by Day */}
                {hariKeys.length > 0 ? (
                  hariKeys.map((hariKey) => {
                    const itemsInDay = groupedHari[hariKey] ?? [];
                    return (
                      <section key={hariKey} aria-label={hariKey} className="flex flex-col gap-1.5 pt-2">
                        <h2 className="text-xs sm:text-sm font-extrabold text-[#5a6b60]">
                          {hariKey}
                        </h2>
                        <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                          {itemsInDay.map((item) => (
                            <li key={item.id}>
                              <BarisNotifikasi
                                item={{
                                  id: item.id,
                                  ikon: (item.ikon as IkonNotifikasi) || 'paket',
                                  judul: item.judul,
                                  isi: item.isi,
                                  waktu: item.waktu,
                                  baru: item.baru,
                                  tindakan: false,
                                  aksi: item.aksi,
                                  href: item.href,
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })
                ) : (
                  tindakanItems.length === 0 && (
                    <p className="p-4 border-[1.5px] border-dashed border-[#c9d2c6] rounded-xl text-sm text-[#3f5247]">
                      Tidak ada kabar jenis ini.
                    </p>
                  )
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <div className="lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="lainnya" />
      </div>
    </div>
  );
}

export default TokoNotifikasi;
