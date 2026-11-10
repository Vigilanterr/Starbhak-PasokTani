'use client';

import React, { useState } from 'react';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { NavBawah } from '../layout/NavBawah';
import { BarisNotifikasi } from '../common/BarisNotifikasi';
import type { ItemNotifikasi } from '../common/BarisNotifikasi';

export type TabNotifikasi = 'semua' | 'belum';

export interface NotifikasiGrupHari {
  judul: string;
  item: ItemNotifikasi[];
}
export type GrupNotifikasi = NotifikasiGrupHari;

export interface NotifikasiProps {
  kosong?: boolean;
  tindakanList?: ItemNotifikasi[];
  daftarAksi?: ItemNotifikasi[];
  grupHariList?: NotifikasiGrupHari[];
  daftarGrup?: NotifikasiGrupHari[];
  daftar?: ItemNotifikasi[];
  notifikasiList?: ItemNotifikasi[];
  onTandaiSemuaDibaca?: () => Promise<void> | void;
  onAksiNotifikasi?: (item?: ItemNotifikasi) => void;
  onBukaNotifikasi?: (item?: ItemNotifikasi) => void;
  onHapusSemua?: () => Promise<void> | void;
  className?: string;
}

const DEFAULT_AKSI: ItemNotifikasi[] = [
  {
    id: 'notif_act_1',
    ikon: 'paket',
    judul: 'Bayar pesanan PT-26110821 sebelum 14.52',
    isi: 'Total Rp 453.222. Lewat batas itu pesanan kedaluwarsa dan stok dilepas.',
    waktu: '13.52',
    tindakan: true,
    aksi: 'Bayar sekarang',
    href: '/bayar/PT-26110821',
  },
  {
    id: 'notif_act_2',
    ikon: 'paket',
    judul: 'Pesanan PT-26110806 tiba, konfirmasi penerimaan',
    isi: 'Dana belum diteruskan ke petani. Batas komplain 3 hari: sampai Kam, 12 Nov.',
    waktu: 'Kemarin, 16.40',
    tindakan: true,
    aksi: 'Konfirmasi atau komplain',
    href: '/pesanan/PT-26110806',
  },
  {
    id: 'notif_act_3',
    ikon: 'tunas',
    judul: 'Panen bawang merah mundur ke Rab, 25 Nov',
    isi: 'Kamu boleh batal tanpa potongan sampai petani mengisi hasil panen.',
    waktu: '08.05',
    tindakan: true,
    aksi: 'Pilih lanjut atau batal',
    href: '/komitmen/KM-26101908',
  },
];

const DEFAULT_GRUP: NotifikasiGrupHari[] = [
  {
    judul: 'Hari ini, Sen 9 Nov',
    item: [
      {
        id: 'notif_g1_1',
        ikon: 'tag',
        judul: 'Kol Bulat Lembang masuk Surplus',
        isi: 'Turun 30% sampai kedaluwarsa, Rp 6.300 per kg. Dari langgananmu.',
        waktu: '09.12',
        baru: true,
        href: '/keranjang',
      },
      {
        id: 'notif_g1_2',
        ikon: 'langganan',
        judul: 'Tomat Merah Lembang: stok baru 120 kg',
        isi: 'Dipanen kemarin di Kebun Mang Ujang.',
        waktu: '07.30',
        baru: true,
        href: '/keranjang',
      },
    ],
  },
  {
    judul: 'Kemarin, Min 8 Nov',
    item: [
      {
        id: 'notif_g2_1',
        ikon: 'truk',
        judul: 'Pesanan PT-26110805 dikirim',
        isi: 'Kurir reguler JNE. Pantau di detail pesanan.',
        waktu: '15.20',
        baru: false,
        href: '/pesanan/PT-26110805',
      },
      {
        id: 'notif_g2_2',
        ikon: 'tunas',
        judul: 'Kabar lahan: Beras Pandan Wangi',
        isi: 'Sawah Bu Eti: padi mulai menguning. Panen tetap 18 sampai 20 Nov.',
        waktu: '10.02',
        baru: false,
        href: '/ikuti',
      },
    ],
  },
  {
    judul: 'Sen, 2 Nov',
    item: [
      {
        id: 'notif_g3_1',
        ikon: 'dompet',
        judul: 'Rp 63.500 masuk ke Dompet',
        isi: 'Pesanan PT-26102207 ditolak petani. Dananya dikembalikan penuh.',
        waktu: '14.31',
        baru: false,
        href: '/dompet',
      },
    ],
  },
];

export function Notifikasi({
  kosong = false,
  tindakanList,
  daftarAksi,
  grupHariList,
  daftarGrup,
  daftar,
  notifikasiList,
  onTandaiSemuaDibaca,
  onAksiNotifikasi,
  onBukaNotifikasi,
  className = '',
}: NotifikasiProps) {
  const [tab, setTab] = useState<TabNotifikasi>('semua');
  const [terbaca, setTerbaca] = useState(false);
  const [pesanFeedback, setPesanFeedback] = useState('');

  // Source resolution
  const aksiList = kosong ? [] : (tindakanList ?? daftarAksi ?? DEFAULT_AKSI);

  let rawGroups: NotifikasiGrupHari[] = [];
  if (!kosong) {
    const list = notifikasiList ?? daftar ?? [];
    if (grupHariList ?? daftarGrup) {
      rawGroups = grupHariList ?? daftarGrup ?? [];
    } else if (list.length > 0) {
      // Group flat list
      rawGroups = [{ judul: 'Notifikasi', item: list }];
    } else {
      rawGroups = DEFAULT_GRUP;
    }
  }

  // Count unread
  const unreadFeedCount = rawGroups.reduce((acc, g) => {
    return acc + g.item.filter((n) => n.baru && !terbaca).length;
  }, 0);
  const totalUnread = aksiList.length + unreadFeedCount;

  const handleTandaiSemua = async () => {
    setTerbaca(true);
    setPesanFeedback(
      'Semua kabar ditandai dibaca. Yang perlu tindakan tetap di atas.'
    );
    if (onTandaiSemuaDibaca) {
      await onTandaiSemuaDibaca();
    }
  };

  const filteredGroups = rawGroups
    .map((g) => ({
      judul: g.judul,
      item: g.item
        .filter((n) => (tab === 'semua' ? true : n.baru && !terbaca))
        .map((n) => ({
          ...n,
          baru: terbaca ? false : n.baru,
        })),
    }))
    .filter((g) => g.item.length > 0);

  const teksRingkas = kosong
    ? 'Belum ada kabar.'
    : `${totalUnread} belum dibaca, ${aksiList.length} perlu tindakan.`;

  return (
    <div
      className={`relative min-h-screen bg-cream font-sans text-ink flex flex-col justify-between ${className}`}
    >
      <div>
        <SiteHeader active="beranda" signedIn={true} cartCount={5} />

        <main className="max-w-[1200px] mx-auto px-4 pt-2 md:px-6 md:pt-7 pb-0 box-border">
          <div className="max-w-[760px] mx-auto flex flex-col gap-4">
            {/* Title and Settings Link */}
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-2.5">
              <div>
                <h1 className="m-0 text-[28px] md:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                  Notifikasi
                </h1>
                <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#3f5247]">
                  {teksRingkas}
                </p>
              </div>
              <a
                href="/akun/notifikasi"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 border-[1.5px] border-brand-900 rounded-xl text-brand-900 text-sm font-extrabold no-underline"
              >
                <svg
                  className="w-[18px] h-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                  <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                </svg>
                Atur notifikasi
              </a>
            </div>

            {/* Empty State */}
            {kosong && (
              <div className="p-[22px] border-[1.5px] border-dashed border-[#a9cfae] rounded-2xl bg-white flex flex-col items-start gap-2.5">
                <p className="m-0 text-base font-extrabold text-ink">
                  Belum ada notifikasi
                </p>
                <p className="m-0 max-w-[56ch] text-sm leading-[1.55] text-[#3f5247]">
                  Kabar pesanan, Komitmen, Dompet, dan produk langgananmu muncul di sini. Yang perlu tindakan selalu di paling atas.
                </p>
                <a
                  href="/langganan"
                  className="inline-flex items-center min-h-[48px] px-[18px] rounded-xl bg-brand-900 text-white text-[15px] font-extrabold no-underline"
                >
                  Lihat langganan produk
                </a>
              </div>
            )}

            {/* Notification Feeds */}
            {!kosong && (
              <>
                {/* Filter and Mark Read Actions */}
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <div
                    role="group"
                    aria-label="Saring notifikasi"
                    className="flex gap-2 overflow-x-auto pb-0.5"
                  >
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
                      Belum dibaca ({totalUnread})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleTandaiSemua}
                    disabled={terbaca}
                    style={{ color: terbaca ? '#9aa79e' : '#064e3b' }}
                    className="min-h-[44px] px-3 border-0 rounded-xl bg-transparent font-sans text-sm font-extrabold cursor-pointer"
                  >
                    Tandai semua dibaca
                  </button>
                </div>

                {pesanFeedback && (
                  <p
                    role="status"
                    className="m-0 min-h-0 text-[13px] font-bold text-[#157a4c]"
                  >
                    {pesanFeedback}
                  </p>
                )}

                {/* Section 1: Urgent Actionable Cards */}
                {aksiList.length > 0 && (
                  <section
                    aria-labelledby="judul-tindakan"
                    className="flex flex-col gap-2.5"
                  >
                    <h2
                      id="judul-tindakan"
                      className="m-0 text-[15px] font-extrabold text-ink"
                    >
                      Perlu tindakan{' '}
                      <span className="font-semibold text-[#5a6b60]">
                        ({aksiList.length})
                      </span>
                    </h2>
                    <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                      {aksiList.map((item, idx) => (
                        <li key={item.id ?? idx}>
                          <BarisNotifikasi
                            item={{ ...item, tindakan: true }}
                            onAksi={onAksiNotifikasi}
                            onKlik={onBukaNotifikasi}
                          />
                        </li>
                      ))}
                    </ul>
                    <p className="m-0 text-xs leading-[1.5] text-[#5a6b60]">
                      Kartu ini hilang sendiri setelah tindakannya selesai.
                    </p>
                  </section>
                )}

                {/* Section 2: Chronological Feeds */}
                {filteredGroups.map((g, gIdx) => (
                  <section
                    key={gIdx}
                    aria-label={g.judul}
                    className="flex flex-col gap-1.5"
                  >
                    <h2 className="m-0 mt-2 text-[13px] font-extrabold text-[#5a6b60]">
                      {g.judul}
                    </h2>
                    <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
                      {g.item.map((n, nIdx) => (
                        <li key={n.id ?? nIdx}>
                          <BarisNotifikasi
                            item={n}
                            onKlik={onBukaNotifikasi}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}

                {tab === 'belum' && filteredGroups.length === 0 && (
                  <p className="m-0 p-3.5 border-[1.5px] border-dashed border-[#c9d2c6] rounded-xl text-sm text-[#3f5247]">
                    Semua notifikasi lain sudah dibaca.
                  </p>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block mt-8">
        <SiteFooter />
      </div>

      {/* Mobile Bottom Nav */}
      <div className="block md:hidden sticky bottom-0 z-5 mt-6">
        <NavBawah aktif="beranda" />
      </div>
    </div>
  );
}
