'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { ChipStatus, type StatusPasokTani } from '../../common/ChipStatus';

export type TabStatusTokoPesanan =
  | 'baru'
  | 'diproses'
  | 'dikirim'
  | 'komplain'
  | 'selesai'
  | 'dibatalkan';

export interface ItemPesananToko {
  id: string;
  nama: string;
  jumlahKg: number;
  hargaSatuan: number;
  subtotal: number;
  foto?: string;
}

export interface PesananTokoItem {
  id: string;
  noPesanan?: string;
  no?: string;
  namaPembeli?: string;
  pembeli?: string;
  jenis?: string;
  teleponPembeli?: string;
  alamatKirim?: string;
  tanggal?: string;
  waktu?: string;
  batasProses?: string;
  batas?: string;
  batasPendek?: string;
  sisa?: string;
  status: TabStatusTokoPesanan | string;
  items?: ItemPesananToko[];
  produk?: string;
  totalHarga?: number;
  nilai?: number;
  ongkir?: number;
  kurir?: string;
  kirim?: string;
  kirimKet?: string;
  resi?: string;
  urgen?: boolean;
  ket?: string;
  ketUrgen?: boolean;
  tiba?: boolean;
  catatanPembeli?: string;
  aksi?: string;
  ambil?: string[];
  hrefDetail?: string;
  hrefAksi?: string;
}

export interface TokoPesananProps {
  pesananList?: PesananTokoItem[];
  tabAwal?: TabStatusTokoPesanan | string;
  onProsesPesanan?: (id: string | string[]) => void;
  onCetakLabel?: (ids: string[]) => void;
  className?: string;
}

const DEFAULT_PESANAN_LIST: PesananTokoItem[] = [
  {
    id: 'sari',
    no: 'PT-26110806',
    noPesanan: 'PT-26110806',
    pembeli: 'Katering Sari Rasa',
    namaPembeli: 'Katering Sari Rasa',
    jenis: 'UMKM',
    waktu: 'Min, 8 Nov, 07.30',
    status: 'baru',
    produk: 'Tomat Merah Lembang 25 kg',
    kirim: 'Diantar sendiri',
    kirimKet: 'Sen, 9 Nov, 06.00–09.00',
    nilai: 300000,
    totalHarga: 300000,
    batas: 'Sen, 9 Nov, 07.30',
    batasPendek: 'Sen 07.30',
    sisa: '17 jam lagi',
    ambil: [
      'Tomat Merah Lembang 18 kg dari batch panen 5 Nov',
      'Tomat Merah Lembang 7 kg dari batch panen 7 Nov',
    ],
  },
  {
    id: 'rina',
    no: 'PT-26110809',
    noPesanan: 'PT-26110809',
    pembeli: 'Rina Marlina',
    namaPembeli: 'Rina Marlina',
    jenis: 'Rumah tangga',
    waktu: 'Min, 8 Nov, 10.05',
    status: 'baru',
    produk: 'Kol Bulat Lembang 3 kg',
    kirim: 'Ambil di lahan',
    kirimKet: 'mulai Sen, 9 Nov',
    nilai: 27000,
    totalHarga: 27000,
    batas: 'Sen, 9 Nov, 10.05',
    batasPendek: 'Sen 10.05',
    sisa: '20 jam lagi',
    ambil: ['Kol Bulat Lembang 3 kg dari batch panen 6 Nov'],
  },
  {
    id: 'dewi',
    no: 'PT-26110821',
    noPesanan: 'PT-26110821',
    pembeli: 'Dewi Lestari',
    namaPembeli: 'Dewi Lestari',
    jenis: 'UMKM, Warung Dewi',
    waktu: 'Min, 8 Nov, 13.41',
    status: 'baru',
    produk: 'Tomat Merah Lembang 12 kg, Kol Bulat Lembang 16 kg',
    kirim: 'Kurir reguler JNE',
    kirimKet: 'dijemput setelah diproses',
    nilai: 272000,
    totalHarga: 272000,
    batas: 'Sen, 9 Nov, 13.41',
    batasPendek: 'Sen 13.41',
    sisa: '23 jam lagi',
    ambil: [
      'Tomat Merah Lembang 12 kg dari batch panen 7 Nov',
      'Kol Bulat Lembang 16 kg dari batch panen 6 Nov',
    ],
  },
  {
    id: 'asep',
    no: 'PT-26110714',
    noPesanan: 'PT-26110714',
    pembeli: 'Asep Saepudin',
    namaPembeli: 'Asep Saepudin',
    jenis: 'Rumah tangga',
    waktu: 'Sab, 7 Nov, 16.20',
    status: 'diproses',
    produk: 'Kol Bulat Lembang 5 kg',
    kirim: 'Kurir instan GrabExpress',
    kirimKet: 'kurir datang hari ini 15.30',
    nilai: 45000,
    totalHarga: 45000,
    ket: 'Kemas sebelum kurir datang.',
    aksi: 'Lihat resi',
  },
  {
    id: 'enok',
    no: 'PT-26110703',
    noPesanan: 'PT-26110703',
    pembeli: 'Warung Bu Enok',
    namaPembeli: 'Warung Bu Enok',
    jenis: 'UMKM',
    waktu: 'Sab, 7 Nov, 09.12',
    status: 'diproses',
    produk: 'Tomat Merah Lembang 10 kg',
    kirim: 'Kurir reguler JNE',
    kirimKet: 'penjemputan belum diatur',
    nilai: 120000,
    totalHarga: 120000,
    ket: 'Atur penjemputan atau antar ke agen JNE.',
    ketUrgen: true,
    aksi: 'Atur pengiriman',
  },
  {
    id: 'dewi2',
    no: 'PT-26110418',
    noPesanan: 'PT-26110418',
    pembeli: 'Dewi Lestari',
    namaPembeli: 'Dewi Lestari',
    jenis: 'UMKM, Warung Dewi',
    waktu: 'Jum, 6 Nov, 19.12',
    status: 'dikirim',
    tiba: true,
    produk: 'Tomat Merah Lembang 12 kg, Kol Bulat Lembang 16 kg',
    kirim: 'JNE0123456789',
    kirimKet: 'tiba Min, 8 Nov, 10.24',
    nilai: 272000,
    totalHarga: 272000,
    ket: 'Dana Rp 263.840 diteruskan otomatis Rab, 11 Nov kalau tidak ada komplain.',
    aksi: 'Lihat detail',
  },
  {
    id: 'hendra',
    no: 'PT-26110605',
    noPesanan: 'PT-26110605',
    pembeli: 'Hendra Gunawan',
    namaPembeli: 'Hendra Gunawan',
    jenis: 'Rumah tangga',
    waktu: 'Jum, 6 Nov, 08.40',
    status: 'dikirim',
    produk: 'Wortel Lembang 8 kg',
    kirim: 'JNE0123456712',
    kirimKet: 'dalam perjalanan, tiba Sen, 9 Nov',
    nilai: 88000,
    totalHarga: 88000,
    aksi: 'Lacak',
  },
  {
    id: 'rudi',
    no: 'PT-26110215',
    noPesanan: 'PT-26110215',
    pembeli: 'Rudi Hartono',
    namaPembeli: 'Rudi Hartono',
    jenis: 'Rumah tangga',
    waktu: 'Sel, 3 Nov, 11.05',
    status: 'komplain',
    produk: 'Tomat Merah Lembang 5 kg',
    kirim: 'Kurir reguler JNE',
    kirimKet: 'tiba Kam, 5 Nov',
    nilai: 70000,
    totalHarga: 70000,
    ket: 'Sebagian tomat lembek, 3 foto bukti. Tanggapi dalam 22 jam. Dana ditahan sampai selesai.',
    ketUrgen: true,
    aksi: 'Tanggapi',
  },
  {
    id: 'enok2',
    no: 'PT-26110301',
    noPesanan: 'PT-26110301',
    pembeli: 'Warung Bu Enok',
    namaPembeli: 'Warung Bu Enok',
    jenis: 'UMKM',
    waktu: 'Sel, 3 Nov, 08.15',
    status: 'selesai',
    produk: 'Tomat Merah Lembang 10 kg',
    kirim: 'Kurir reguler JNE',
    kirimKet: 'selesai Jum, 6 Nov',
    nilai: 120000,
    totalHarga: 120000,
    ket: 'Dana Rp 116.400 sudah diteruskan ke saldo.',
    aksi: 'Lihat detail',
  },
  {
    id: 'sari2',
    no: 'PT-26103118',
    noPesanan: 'PT-26103118',
    pembeli: 'Katering Sari Rasa',
    namaPembeli: 'Katering Sari Rasa',
    jenis: 'UMKM',
    waktu: 'Sab, 31 Okt, 07.02',
    status: 'selesai',
    produk: 'Kol Bulat Lembang 20 kg',
    kirim: 'Diantar sendiri',
    kirimKet: 'selesai Rab, 4 Nov',
    nilai: 140000,
    totalHarga: 140000,
    ket: 'Dana Rp 135.800 sudah diteruskan ke saldo.',
    aksi: 'Lihat detail',
  },
  {
    id: 'lina',
    no: 'PT-26110501',
    noPesanan: 'PT-26110501',
    pembeli: 'Lina Marlina',
    namaPembeli: 'Lina Marlina',
    jenis: 'Rumah tangga',
    waktu: 'Kam, 5 Nov, 18.30',
    status: 'dibatalkan',
    produk: 'Brokoli Lembang 2 kg',
    kirim: 'Kurir reguler JNE',
    kirimKet: 'tidak jadi dikirim',
    nilai: 48000,
    totalHarga: 48000,
    ket: 'Dibatalkan pembeli sebelum diproses. Stok sudah dikembalikan.',
    aksi: 'Lihat detail',
  },
];

function formatRupiah(n?: number): string {
  if (typeof n !== 'number') return 'Rp 0';
  return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function TokoPesanan({
  pesananList = DEFAULT_PESANAN_LIST,
  tabAwal = 'baru',
  onProsesPesanan,
  onCetakLabel,
  className = '',
}: TokoPesananProps) {
  const dialogTitleId = useId();
  const [tabAktif, setTabAktif] = useState<string>(tabAwal);
  const [diprosesState, setDiprosesState] = useState<Record<string, boolean>>({});
  const [pilihState, setPilihState] = useState<Record<string, boolean>>({});
  const [dialogTarget, setDialogTarget] = useState<string | null>(null);
  const [pesanNotif, setPesanNotif] = useState<string>('');

  const mergedList = pesananList.map((item) => {
    if (item.status === 'baru' && diprosesState[item.id]) {
      return {
        ...item,
        status: 'diproses',
        kirimKet: item.kirim === 'Kurir reguler JNE' ? 'penjemputan belum diatur' : (item.kirimKet ?? ''),
        ket: 'Baru diproses. Langkah berikutnya: atur pengiriman.',
        ketUrgen: true,
        aksi: 'Atur pengiriman',
      };
    }
    return item;
  });

  const tabDefs: { id: TabStatusTokoPesanan; label: string }[] = [
    { id: 'baru', label: 'Baru' },
    { id: 'diproses', label: 'Diproses' },
    { id: 'dikirim', label: 'Dikirim' },
    { id: 'komplain', label: 'Komplain' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'dibatalkan', label: 'Dibatalkan' },
  ];

  const counts: Record<string, number> = {};
  for (const t of tabDefs) {
    counts[t.id] = mergedList.filter((o) => o.status === t.id).length;
  }

  const filteredOrders = mergedList.filter((o) => o.status === tabAktif);
  const selectedInCurrentTab = filteredOrders.filter((o) => pilihState[o.id]);
  const isAllSelected = filteredOrders.length > 0 && selectedInCurrentTab.length === filteredOrders.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setPilihState({});
    } else {
      const nextPilih: Record<string, boolean> = {};
      for (const o of filteredOrders) {
        nextPilih[o.id] = true;
      }
      setPilihState(nextPilih);
    }
  };

  const handleToggleSelect = (id: string) => {
    setPilihState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTabChange = (t: string) => {
    setTabAktif(t);
    setPilihState({});
    setPesanNotif('');
  };

  const handleOpenProcessDialog = (id: string) => {
    setDialogTarget(id);
  };

  const handleConfirmProcess = () => {
    if (!dialogTarget) return;

    if (dialogTarget === 'massal') {
      const ids = selectedInCurrentTab.filter((o) => o.status === 'baru').map((o) => o.id);
      setDiprosesState((prev) => {
        const next = { ...prev };
        for (const id of ids) {
          next[id] = true;
        }
        return next;
      });
      setPilihState({});
      setPesanNotif(`${ids.length} pesanan berhasil diproses. Kemas barang sekarang.`);
      onProsesPesanan?.(ids);
    } else {
      setDiprosesState((prev) => ({ ...prev, [dialogTarget]: true }));
      const order = mergedList.find((o) => o.id === dialogTarget);
      const no = order?.no ?? order?.noPesanan ?? dialogTarget;
      setPesanNotif(`Pesanan ${no} diproses. Kemas barang sekarang.`);
      onProsesPesanan?.(dialogTarget);
    }
    setDialogTarget(null);
  };

  const handleCancelSelect = () => {
    setPilihState({});
  };

  const handleMassAction = () => {
    if (tabAktif === 'baru') {
      setDialogTarget('massal');
    } else {
      const ids = selectedInCurrentTab.map((o) => o.id);
      setPesanNotif(`Label untuk ${ids.length} pesanan siap dicetak.`);
      onCetakLabel?.(ids);
    }
  };

  // Determine modal dialog content
  const dialogOrder = dialogTarget && dialogTarget !== 'massal'
    ? mergedList.find((o) => o.id === dialogTarget)
    : null;

  const batchOrdersToProcess = dialogTarget === 'massal'
    ? selectedInCurrentTab.filter((o) => o.status === 'baru')
    : [];

  const emptyTexts: Record<string, string> = {
    baru: 'Belum ada pesanan baru. Pesanan yang sudah dibayar muncul di sini.',
    diproses: 'Tidak ada pesanan yang sedang diproses.',
    dikirim: 'Tidak ada pesanan dalam perjalanan.',
    komplain: 'Tidak ada komplain. Pertahankan.',
    selesai: 'Belum ada pesanan selesai.',
    dibatalkan: 'Tidak ada pesanan dibatalkan.',
  };

  return (
    <div className={`relative min-h-screen bg-[#fcfbf6] font-['Plus_Jakarta_Sans',sans-serif] text-[#173b2b] ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-none w-[272px] p-5 pr-0 pb-6">
          <TokoSamping aktif="pesanan" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-5 md:py-5 md:px-6 md:pb-12">
          <div className="max-w-[1120px] flex flex-col gap-3.5">
            {/* Header info */}
            <div>
              <h1 className="m-0 text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-[#173b2b]">
                Pesanan masuk
              </h1>
              <p className="mt-1.5 mb-0 text-xs sm:text-sm text-[#3f5247]">
                Pesanan baru batal otomatis kalau tidak diproses dalam 24 jam.{' '}
                <Link href="/toko/pengaturan" className="text-[#157a4c] font-bold hover:underline">
                  Ubah pengaturan
                </Link>
              </p>
            </div>

            {/* Filter Status Tabs */}
            <div
              role="group"
              aria-label="Saring menurut status"
              className="flex gap-2 overflow-x-auto pb-1"
            >
              {tabDefs.map((tb) => {
                const isActive = tb.id === tabAktif;
                const count = counts[tb.id] ?? 0;
                const isUrgentTab = tb.id === 'baru' || tb.id === 'komplain';
                return (
                  <button
                    key={tb.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleTabChange(tb.id)}
                    className={`flex-none inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full text-sm font-bold cursor-pointer border ${
                      isActive
                        ? 'border-[#064e3b] bg-[#064e3b] text-white'
                        : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                    }`}
                  >
                    <span>{tb.label}</span>
                    <span
                      className={`min-w-[20px] px-1.5 py-0.5 rounded-full text-xs font-extrabold text-center ${
                        isActive
                          ? 'bg-[#e9c75c] text-[#173b2b]'
                          : isUrgentTab
                          ? 'bg-[#fff1ea] text-[#9a3412]'
                          : 'bg-[#ebf2eb] text-[#064e3b]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live polite feedback message */}
            {pesanNotif && (
              <p aria-live="polite" className="m-0 text-sm font-bold text-[#157a4c]">
                {pesanNotif}
              </p>
            )}

            {/* Selection action bar */}
            {selectedInCurrentTab.length > 0 && (
              <div
                role="group"
                aria-label="Aksi untuk pesanan terpilih"
                className="flex flex-wrap items-center gap-2.5 p-2.5 px-3.5 rounded-xl bg-[#064e3b] text-white"
              >
                <span className="flex-1 text-sm font-bold">
                  {selectedInCurrentTab.length} pesanan dipilih
                </span>
                <button
                  type="button"
                  onClick={handleMassAction}
                  className="min-h-[40px] px-4 rounded-lg bg-[#d5f6d5] text-[#064e3b] text-sm font-extrabold cursor-pointer border-0 hover:bg-[#c2efc2]"
                >
                  {tabAktif === 'baru'
                    ? `Proses (${selectedInCurrentTab.length})`
                    : `Cetak label (${selectedInCurrentTab.length})`}
                </button>
                <button
                  type="button"
                  onClick={handleCancelSelect}
                  className="min-h-[40px] px-3 rounded-lg border border-[#a9cfae] bg-transparent text-white text-sm font-bold cursor-pointer hover:bg-white/10"
                >
                  Batal pilih
                </button>
              </div>
            )}

            {/* Empty state */}
            {filteredOrders.length === 0 && (
              <div className="p-7 px-5 border border-dashed border-[#c9d2c6] rounded-2xl bg-white text-center text-sm text-[#3f5247]">
                {emptyTexts[tabAktif] ?? 'Tidak ada pesanan.'}
              </div>
            )}

            {/* Mobile Card List */}
            {filteredOrders.length > 0 && (
              <div className="block lg:hidden">
                <ul className="list-none m-0 p-0 flex flex-col gap-3">
                  {filteredOrders.map((o) => {
                    const no = o.no ?? o.noPesanan ?? o.id;
                    const pembeli = o.pembeli ?? o.namaPembeli ?? 'Pembeli';
                    const harga = o.nilai ?? o.totalHarga ?? 0;
                    const isSelected = !!pilihState[o.id];
                    const isBaru = o.status === 'baru';

                    return (
                      <li
                        key={o.id}
                        className={`border rounded-2xl bg-white overflow-hidden ${
                          isSelected ? 'border-[#064e3b] ring-1 ring-[#064e3b]' : 'border-[#dee3da]'
                        }`}
                      >
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <ChipStatus status={o.status as StatusPasokTani} />
                            <span className="text-xs text-[#5a6b60] font-mono">{no}</span>
                          </div>

                          <p className="m-0 text-base font-extrabold text-[#173b2b]">
                            {pembeli}{' '}
                            {o.jenis && (
                              <span className="text-xs font-semibold text-[#5a6b60]">{o.jenis}</span>
                            )}
                          </p>

                          <p className="m-0 text-sm leading-snug text-[#173b2b]">{o.produk}</p>

                          {o.kirim && (
                            <p className="m-0 flex items-start gap-1.5 text-xs text-[#3f5247]">
                              {/* Inline Truck Icon */}
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#157a4c"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                className="flex-none mt-0.5"
                              >
                                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                                <path d="M15 18H9" />
                                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                                <circle cx="17" cy="18" r="2" />
                                <circle cx="7" cy="18" r="2" />
                              </svg>
                              <span>
                                <strong className="text-[#173b2b]">{o.kirim}</strong>
                                {o.kirimKet ? `, ${o.kirimKet}` : ''}
                              </span>
                            </p>
                          )}

                          {o.batas && (
                            <p className="m-0 flex items-center gap-1.5 text-xs font-bold text-[#9a3412]">
                              {/* Inline Clock Icon */}
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                className="flex-none"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                              <span>
                                Proses sebelum {o.batas}
                                {o.sisa ? `, ${o.sisa}` : ''}
                              </span>
                            </p>
                          )}

                          {o.ket && (
                            <p
                              className={`m-0 text-xs leading-relaxed ${
                                o.ketUrgen ? 'text-[#9a3412] font-bold' : 'text-[#3f5247]'
                              }`}
                            >
                              {o.ket}
                            </p>
                          )}
                        </div>

                        {/* Bottom action row */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 px-4 bg-[#fcfbf6] border-t border-[#eef0eb]">
                          <span className="text-xs text-[#3f5247]">
                            Nilai produk{' '}
                            <strong className="text-base text-[#173b2b]">
                              {formatRupiah(harga)}
                            </strong>
                          </span>

                          <div className="flex items-center gap-2">
                            <Link
                              href={o.hrefDetail ?? `/toko/pesanan/${o.id}`}
                              className="inline-flex items-center min-h-[40px] px-3 rounded-xl text-[#064e3b] text-sm font-bold hover:bg-[#064e3b]/5"
                            >
                              Detail
                            </Link>

                            {isBaru && (
                              <button
                                type="button"
                                onClick={() => handleOpenProcessDialog(o.id)}
                                className="inline-flex items-center min-h-[40px] px-4 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                              >
                                Proses
                              </button>
                            )}

                            {o.aksi && !isBaru && (
                              <Link
                                href={o.hrefAksi ?? o.hrefDetail ?? `/toko/pesanan/${o.id}`}
                                className="inline-flex items-center min-h-[40px] px-3 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-xs font-bold hover:bg-[#f6f8f4]"
                              >
                                {o.aksi}
                              </Link>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Desktop Table View */}
            {filteredOrders.length > 0 && (
              <div className="hidden lg:block overflow-x-auto border border-[#dee3da] rounded-2xl bg-white">
                <div role="table" aria-label="Daftar pesanan" className="min-w-[980px]">
                  {/* Table Header */}
                  <div
                    role="row"
                    className="grid grid-cols-[48px_132px_1.1fr_1.5fr_1.3fr_112px_1fr_176px] items-center column-gap-3 py-2 px-4 bg-[#fcfbf6] border-b border-[#dee3da] text-xs font-extrabold text-[#3f5247]"
                  >
                    <div role="columnheader">
                      <label className="w-10 h-10 grid place-items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          aria-label="Pilih semua pesanan di tab ini"
                          className="w-4 h-4 m-0 accent-[#064e3b] cursor-pointer"
                        />
                      </label>
                    </div>
                    <div role="columnheader">Pesanan</div>
                    <div role="columnheader">Pembeli</div>
                    <div role="columnheader">Produk</div>
                    <div role="columnheader">Pengiriman</div>
                    <div role="columnheader">Nilai produk</div>
                    <div role="columnheader">Status</div>
                    <div role="columnheader" className="text-right pr-2">Aksi</div>
                  </div>

                  {/* Table Rows */}
                  {filteredOrders.map((o) => {
                    const no = o.no ?? o.noPesanan ?? o.id;
                    const pembeli = o.pembeli ?? o.namaPembeli ?? 'Pembeli';
                    const harga = o.nilai ?? o.totalHarga ?? 0;
                    const isSelected = !!pilihState[o.id];
                    const isBaru = o.status === 'baru';

                    return (
                      <div
                        key={o.id}
                        role="row"
                        className={`grid grid-cols-[48px_132px_1.1fr_1.5fr_1.3fr_112px_1fr_176px] items-center column-gap-3 py-2.5 px-4 border-t border-[#eef0eb] text-sm leading-snug ${
                          isSelected ? 'bg-[#f3faf3]' : 'bg-white hover:bg-[#fafbf9]'
                        }`}
                      >
                        {/* Checkbox */}
                        <div role="cell">
                          <label className="w-10 h-10 grid place-items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(o.id)}
                              aria-label={`Pilih ${no}`}
                              className="w-4 h-4 m-0 accent-[#064e3b] cursor-pointer"
                            />
                          </label>
                        </div>

                        {/* Order No & Time */}
                        <div role="cell">
                          <Link
                            href={o.hrefDetail ?? `/toko/pesanan/${o.id}`}
                            className="block font-extrabold text-[#064e3b] hover:underline"
                          >
                            {no}
                          </Link>
                          {o.waktu && <span className="text-xs text-[#5a6b60]">{o.waktu}</span>}
                        </div>

                        {/* Buyer */}
                        <div role="cell">
                          <strong className="block font-extrabold text-[#173b2b]">{pembeli}</strong>
                          {o.jenis && <span className="text-xs text-[#5a6b60]">{o.jenis}</span>}
                        </div>

                        {/* Produce */}
                        <div role="cell" className="text-[#173b2b] pr-2">
                          {o.produk}
                        </div>

                        {/* Shipping */}
                        <div role="cell">
                          <strong className="block font-bold text-[#173b2b]">{o.kirim}</strong>
                          {o.kirimKet && <span className="text-xs text-[#3f5247]">{o.kirimKet}</span>}
                        </div>

                        {/* Price */}
                        <div role="cell" className="font-extrabold text-[#173b2b] whitespace-nowrap">
                          {formatRupiah(harga)}
                        </div>

                        {/* Status / Deadline */}
                        <div role="cell">
                          {o.batasPendek ? (
                            <div>
                              <span className="block text-xs font-extrabold text-[#9a3412]">
                                Proses sebelum {o.batasPendek}
                              </span>
                              {o.sisa && <span className="text-xs text-[#9a3412]">{o.sisa}</span>}
                            </div>
                          ) : (
                            <ChipStatus status={o.status as StatusPasokTani} ukuran="kecil" />
                          )}
                        </div>

                        {/* Actions */}
                        <div role="cell" className="flex justify-end gap-1.5">
                          {isBaru && (
                            <button
                              type="button"
                              onClick={() => handleOpenProcessDialog(o.id)}
                              className="min-h-[38px] px-3.5 rounded-lg bg-[#064e3b] text-white text-xs font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                            >
                              Proses
                            </button>
                          )}

                          {o.aksi && !isBaru && (
                            <Link
                              href={o.hrefAksi ?? o.hrefDetail ?? `/toko/pesanan/${o.id}`}
                              className="inline-flex items-center min-h-[38px] px-3 rounded-lg border border-[#064e3b] text-[#064e3b] text-xs font-extrabold hover:bg-[#f3faf3] whitespace-nowrap"
                            >
                              {o.aksi}
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <div className="block lg:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="pesanan" />
      </div>

      {/* Process Order Confirmation Modal */}
      {dialogTarget && (
        <div className="fixed inset-0 z-50 bg-[#173b2b]/50 flex justify-center items-start pt-20 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="w-full max-w-[460px] p-5.5 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5"
          >
            <h2 id={dialogTitleId} className="m-0 text-lg font-extrabold text-[#173b2b]">
              {dialogTarget === 'massal'
                ? `Proses ${batchOrdersToProcess.length} pesanan?`
                : `Proses pesanan ${dialogOrder?.no ?? dialogOrder?.noPesanan ?? dialogTarget}?`}
            </h2>

            <div>
              <p className="m-0 mb-2 text-sm font-extrabold text-[#173b2b]">Siapkan barang ini</p>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                {dialogTarget === 'massal'
                  ? batchOrdersToProcess.flatMap((o) =>
                      (o.ambil ?? [o.produk ?? 'Produk pesanan']).map((item, idx) => (
                        <li
                          key={`${o.id}-${idx}`}
                          className="flex items-start gap-2.5 p-2.5 px-3 rounded-xl bg-[#f6f8f4] text-xs sm:text-sm text-[#173b2b]"
                        >
                          {/* Inline Checkmark Icon */}
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#157a4c"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="flex-none mt-0.5"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          <span>
                            <strong>{o.pembeli ?? o.namaPembeli}:</strong> {item}
                          </span>
                        </li>
                      ))
                    )
                  : (dialogOrder?.ambil ?? [dialogOrder?.produk ?? 'Produk pesanan']).map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 px-3 rounded-xl bg-[#f6f8f4] text-xs sm:text-sm text-[#173b2b]"
                      >
                        {/* Inline Checkmark Icon */}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#157a4c"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="flex-none mt-0.5"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
              </ul>
              <p className="mt-2 mb-0 text-xs text-[#5a6b60]">
                Batch yang paling dulu kedaluwarsa dipakai lebih dulu.
              </p>
            </div>

            <p className="m-0 p-2.5 px-3 rounded-xl bg-[#fff1ea] text-xs leading-relaxed text-[#9a3412] font-bold">
              Setelah diproses, pembeli tidak bisa membatalkan lagi. Kalau stok tidak cukup, tolak
              dari halaman detail.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmProcess}
                className="min-h-[46px] border-0 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#053d2e]"
              >
                {dialogTarget === 'massal'
                  ? `Proses ${batchOrdersToProcess.length} pesanan`
                  : 'Proses pesanan'}
              </button>
              <button
                type="button"
                onClick={() => setDialogTarget(null)}
                className="min-h-[46px] border border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#f6f8f4]"
              >
                Nanti dulu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
