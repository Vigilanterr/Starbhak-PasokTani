'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { ChipStatus, type StatusPasokTani } from '../../common/ChipStatus';
import type { PesananTokoItem } from './TokoPesanan';

export type StatusDetailPesanan =
  | 'baru'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'komplain'
  | 'dibatalkan'
  | 'ditolak';

export interface ItemSiapkanBarang {
  id: string;
  nama: string;
  batchInfo: string;
  jumlah: string;
  fotoPlaceholder?: string;
}

export interface OpsiSerahKurir {
  id: 'pagi' | 'siang' | 'agen';
  judul: string;
  ket: string;
}

export interface PeristiwaPesanan {
  judul: string;
  waktu: string;
  ket: string;
  selesai?: boolean;
  kini?: boolean;
}

export interface PesananTokoDetailData extends PesananTokoItem {
  metodeBayar?: string;
  waktuBayar?: string;
  slipPackingUrl?: string;
  riwayatStatus?: { status: string; waktu: string; catatan?: string }[];
  pembeliInfo?: {
    nama: string;
    inisial?: string;
    tipe: string;
    riwayat: string;
  };
  alamatInfo?: {
    label: string;
    penerima: string;
    telepon: string;
    alamatLengkap: string;
    patokan?: string;
  };
  keuanganInfo?: {
    nilaiProduk: number;
    persenKomisi?: number;
    komisi: number;
    totalTerima: number;
    ongkir: number;
  };
}

export interface TokoPesananDetailProps {
  pesanan?: PesananTokoDetailData;
  status?: string;
  onUpdateResi?: (resi: string) => void;
  onProsesPesanan?: () => void;
  onTolakPesanan?: (alasan: string) => void;
  onBuatResi?: (opsiSerah: string) => void;
  onCetakLabel?: () => void;
  className?: string;
}

const DEFAULT_DETAIL_PESANAN: PesananTokoDetailData = {
  id: 'PT-26110821',
  no: 'PT-26110821',
  noPesanan: 'PT-26110821',
  pembeli: 'Dewi Lestari',
  namaPembeli: 'Dewi Lestari',
  jenis: 'UMKM, Warung Dewi',
  status: 'baru',
  waktuBayar: 'Min, 8 Nov, 13.41',
  metodeBayar: 'QRIS',
  kurir: 'Kurir reguler JNE',
  kirim: 'Kurir reguler JNE',
  kirimKet: 'dijemput setelah diproses',
  totalHarga: 272000,
  nilai: 272000,
  ongkir: 18000,
  catatanPembeli: 'Tolong pilihkan tomat yang merah tua dan padat, mau langsung dipakai masak besok pagi.',
  pembeliInfo: {
    nama: 'Dewi Lestari',
    inisial: 'D',
    tipe: 'UMKM, Warung Dewi',
    riwayat: 'Pesanan ke-3 dari tokomu',
  },
  alamatInfo: {
    label: 'Alamat pengiriman',
    penerima: 'Dewi Lestari (Warung Dewi)',
    telepon: '0812-3456-7890',
    alamatLengkap: 'Jl. Surya Kencana No. 42, RT 02/RW 05, Cikole, Lembang, Kab. Bandung Barat 40391',
    patokan: 'Pagar hijau seberang lapangan bola',
  },
  keuanganInfo: {
    nilaiProduk: 272000,
    persenKomisi: 3,
    komisi: 8160,
    totalTerima: 263840,
    ongkir: 18000,
  },
};

const DEFAULT_ITEMS_SIAPKAN: ItemSiapkanBarang[] = [
  {
    id: 'tomat',
    nama: 'Tomat Merah Lembang',
    batchInfo: 'Dari batch panen 7 Nov, kedaluwarsa 14 Nov',
    jumlah: '12 kg',
  },
  {
    id: 'kol',
    nama: 'Kol Bulat Lembang',
    batchInfo: 'Dari batch panen 6 Nov, kedaluwarsa 20 Nov',
    jumlah: '16 kg',
  },
];

const DEFAULT_OPSI_SERAH: OpsiSerahKurir[] = [
  {
    id: 'pagi',
    judul: 'Kurir jemput pagi',
    ket: 'Sen, 9 Nov, antara 09.00–12.00 di lahan Cikole.',
  },
  {
    id: 'siang',
    judul: 'Kurir jemput siang',
    ket: 'Sen, 9 Nov, antara 13.00–16.00 di lahan Cikole.',
  },
  {
    id: 'agen',
    judul: 'Antar ke agen JNE terdekat',
    ket: 'Antar ke agen JNE Lembang paling lambat Sen, 9 Nov, 17.00.',
  },
];

function formatRupiah(n?: number): string {
  if (typeof n !== 'number') return 'Rp 0';
  return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function TokoPesananDetail({
  pesanan = DEFAULT_DETAIL_PESANAN,
  status: statusProp,
  onUpdateResi,
  onProsesPesanan,
  onTolakPesanan,
  onBuatResi,
  onCetakLabel,
  className = '',
}: TokoPesananDetailProps) {
  const modalProsesId = useId();
  const modalTolakId = useId();

  const [currentStatus, setCurrentStatus] = useState<StatusDetailPesanan>(
    (statusProp ?? pesanan.status ?? 'baru') as StatusDetailPesanan
  );
  const [bukaProsesDialog, setBukaProsesDialog] = useState<boolean>(false);
  const [bukaTolakDialog, setBukaTolakDialog] = useState<boolean>(false);
  const [alasanTolak, setAlasanTolak] = useState<string>('stok-habis');
  const [opsiSerahPilihan, setOpsiSerahPilihan] = useState<'pagi' | 'siang' | 'agen'>('pagi');
  const [nomorResi, setNomorResi] = useState<string>(pesanan.resi ?? '');
  const [labelTercetak, setLabelTercetak] = useState<boolean>(false);
  const [pesanNotif, setPesanNotif] = useState<string>('');

  const noPesanan = pesanan.no ?? pesanan.noPesanan ?? pesanan.id;
  const pembeli = pesanan.pembeliInfo ?? {
    nama: pesanan.pembeli ?? pesanan.namaPembeli ?? 'Dewi Lestari',
    inisial: 'D',
    tipe: pesanan.jenis ?? 'UMKM',
    riwayat: 'Pesanan dari toko ini',
  };
  const alamat = pesanan.alamatInfo ?? {
    label: 'Alamat pengiriman',
    penerima: pembeli.nama,
    telepon: pesanan.teleponPembeli ?? '0812-3456-7890',
    alamatLengkap: pesanan.alamatKirim ?? 'Jl. Surya Kencana No. 42, Lembang',
    patokan: 'Patokan alamat pengiriman',
  };
  const keuangan = pesanan.keuanganInfo ?? {
    nilaiProduk: pesanan.nilai ?? pesanan.totalHarga ?? 272000,
    persenKomisi: 3,
    komisi: 8160,
    totalTerima: 263840,
    ongkir: pesanan.ongkir ?? 18000,
  };

  const handleProses = () => {
    setCurrentStatus('diproses');
    setBukaProsesDialog(false);
    setPesanNotif('Pesanan berhasil diproses. Silakan siapkan barang dan serahkan ke kurir.');
    onProsesPesanan?.();
  };

  const handleTolak = () => {
    setCurrentStatus('ditolak');
    setBukaTolakDialog(false);
    setPesanNotif('Pesanan telah ditolak. Dana dikembalikan ke pembeli.');
    onTolakPesanan?.(alasanTolak);
  };

  const handleBuatResi = () => {
    const generatedResi = 'JNE0123459876';
    setNomorResi(generatedResi);
    setPesanNotif('Resi pengiriman berhasil dibuat lewat Biteship.');
    onBuatResi?.(opsiSerahPilihan);
    onUpdateResi?.(generatedResi);
  };

  const handleCetak = () => {
    setLabelTercetak(true);
    setPesanNotif('Label pengiriman siap dicetak.');
    onCetakLabel?.();
  };

  // Timeline events based on status
  const timelineEvents: PeristiwaPesanan[] = [
    {
      judul: 'Pesanan dibuat',
      waktu: 'Min, 8 Nov, 13.38',
      ket: 'Pembeli membuat pesanan dari etalase tokomu.',
      selesai: true,
    },
    {
      judul: `Pembayaran diterima lewat ${pesanan.metodeBayar ?? 'QRIS'}`,
      waktu: pesanan.waktuBayar ?? 'Min, 8 Nov, 13.41',
      ket: `Dana ${formatRupiah(keuangan.nilaiProduk)} disimpan aman di rekening bersama PasokTani.`,
      selesai: true,
    },
    ...(currentStatus === 'ditolak'
      ? [
          {
            judul: 'Pesanan ditolak oleh petani',
            waktu: 'Min, 8 Nov, 14.10',
            ket: 'Pesanan dibatalkan dan dana dikembalikan penuh ke pembeli.',
            selesai: true,
          },
        ]
      : [
          {
            judul: 'Pesanan diproses petani',
            waktu: currentStatus !== 'baru' ? 'Min, 8 Nov, 14.05' : 'Menunggu tindakan',
            ket: currentStatus !== 'baru'
              ? 'Barang sedang disiapkan sesuai alokasi batch FEFO.'
              : 'Proses pesanan sebelum batas 24 jam.',
            selesai: currentStatus !== 'baru',
            kini: currentStatus === 'baru',
          },
          {
            judul: 'Resi pengiriman dibuat',
            waktu: nomorResi ? 'Min, 8 Nov, 14.30' : 'Menunggu diproses',
            ket: nomorResi
              ? `Kurir JNE dijadwalkan menjemput dengan resi ${nomorResi}.`
              : 'Dibuat otomatis lewat Biteship setelah barang siap.',
            selesai: !!nomorResi,
            kini: currentStatus === 'diproses' && !nomorResi,
          },
          {
            judul: 'Barang diserahkan ke kurir',
            waktu: currentStatus === 'dikirim' || currentStatus === 'selesai' ? 'Sen, 9 Nov, 10.15' : 'Menunggu penjemputan',
            ket: 'Kurir menjemput barang di lahan untuk pengantaran.',
            selesai: currentStatus === 'dikirim' || currentStatus === 'selesai',
            kini: currentStatus === 'diproses' && !!nomorResi,
          },
          {
            judul: 'Pesanan tiba di pembeli',
            waktu: currentStatus === 'selesai' ? 'Sen, 9 Nov, 16.40' : 'Perkiraan Sen, 9 Nov',
            ket: 'Pembeli memeriksa barang yang diterima.',
            selesai: currentStatus === 'selesai',
            kini: currentStatus === 'dikirim',
          },
          {
            judul: 'Dana diteruskan ke saldo petani',
            waktu: currentStatus === 'selesai' ? 'Kam, 12 Nov' : '3 hari setelah tiba',
            ket: `Dana bersih ${formatRupiah(keuangan.totalTerima)} diteruskan otomatis kalau tidak ada komplain.`,
            selesai: currentStatus === 'selesai',
          },
        ]),
  ];

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
          <div className="max-w-[1100px] flex flex-col gap-3.5">
            {/* Back link */}
            <Link
              href="/toko/pesanan"
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-sm font-bold text-[#157a4c] hover:underline"
            >
              {/* Back chevron icon */}
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
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Pesanan masuk</span>
            </Link>

            {/* Title row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
              <h1 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#173b2b]">
                {noPesanan}
              </h1>
              <ChipStatus status={currentStatus as StatusPasokTani} />
              <span className="text-xs sm:text-sm text-[#5a6b60]">
                Dibayar {pesanan.waktuBayar ?? 'Min, 8 Nov, 13.41'} lewat {pesanan.metodeBayar ?? 'QRIS'}
              </span>
            </div>

            {/* Notification banner */}
            {pesanNotif && (
              <p aria-live="polite" className="m-0 text-sm font-bold text-[#157a4c]">
                {pesanNotif}
              </p>
            )}

            {/* Two Column Grid */}
            <div className="flex flex-wrap lg:flex-nowrap items-start gap-4.5">
              {/* Left Column (flex-1) */}
              <div className="flex-1 min-w-0 flex flex-col gap-3.5 w-full">
                {/* 1. Status Alert Panel */}
                <section
                  aria-labelledby="judul-status"
                  className={`p-4.5 rounded-2xl flex flex-col gap-2.5 border-[1.5px] ${
                    currentStatus === 'baru'
                      ? 'border-[#f3d7c6] bg-[#fffaf6]'
                      : currentStatus === 'diproses'
                      ? 'border-[#064e3b] bg-[#f3faf3]'
                      : currentStatus === 'dikirim'
                      ? 'border-[#b9e6fe] bg-[#f0f9ff]'
                      : currentStatus === 'ditolak'
                      ? 'border-[#fecdca] bg-[#fffbfa]'
                      : 'border-[#a9cfae] bg-[#f3faf3]'
                  }`}
                >
                  <h2 id="judul-status" className="m-0 text-lg sm:text-xl font-extrabold text-[#173b2b]">
                    {currentStatus === 'baru'
                      ? 'Pesanan baru, perlu diproses'
                      : currentStatus === 'diproses'
                      ? 'Pesanan sedang diproses'
                      : currentStatus === 'dikirim'
                      ? 'Pesanan dalam perjalanan'
                      : currentStatus === 'ditolak'
                      ? 'Pesanan ditolak'
                      : 'Pesanan selesai'}
                  </h2>

                  <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
                    {currentStatus === 'baru'
                      ? 'Pembeli sudah membayar. Proses pesanan sebelum Sen, 9 Nov, 13.41 (23 jam lagi) supaya tidak batal otomatis.'
                      : currentStatus === 'diproses'
                      ? 'Kemas produk sesuai panduan batch di bawah. Setelah selesai, atur serah terima dengan kurir.'
                      : currentStatus === 'dikirim'
                      ? `Barang sedang diantar oleh ${pesanan.kurir ?? 'JNE'}. Pantau perjalanan lewat resi.`
                      : currentStatus === 'ditolak'
                      ? 'Kamu menolak pesanan ini. Pembeli telah menerima pengembalian dana penuh.'
                      : 'Pesanan telah selesai diterima pembeli. Dana diteruskan ke saldo petani.'}
                  </p>

                  {/* Desktop Action Buttons for 'baru' */}
                  {currentStatus === 'baru' && (
                    <div className="hidden sm:flex flex-wrap gap-2.5 mt-1">
                      <button
                        type="button"
                        onClick={() => setBukaProsesDialog(true)}
                        className="min-h-[48px] px-6 rounded-xl bg-[#064e3b] text-white text-sm sm:text-base font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                      >
                        Proses pesanan
                      </button>
                      <button
                        type="button"
                        onClick={() => setBukaTolakDialog(true)}
                        className="min-h-[48px] px-4.5 rounded-xl border-[1.5px] border-[#b42318] bg-white text-[#b42318] text-sm sm:text-base font-extrabold cursor-pointer hover:bg-[#fffafa]"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </section>

                {/* 2. Siapkan Barang Section */}
                <section
                  aria-labelledby="judul-siapkan"
                  className="p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-2.5"
                >
                  <div className="flex flex-col">
                    <h2 id="judul-siapkan" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                      Siapkan barang
                    </h2>
                    <p className="m-0 text-xs text-[#3f5247]">
                      Batch yang paling dulu kedaluwarsa dipakai lebih dulu (FEFO).
                    </p>
                  </div>

                  <ul className="list-none m-0 p-0 divide-y divide-[#eef0eb]">
                    {DEFAULT_ITEMS_SIAPKAN.map((it) => (
                      <li key={it.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            role="img"
                            aria-label={`Placeholder foto ${it.nama}`}
                            className="flex-none w-12 h-12 rounded-xl grid place-items-center bg-[#e3f1df] text-[#2f7a3e]"
                          >
                            {/* Sprout seedling placeholder SVG */}
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                            </svg>
                          </span>
                          <div className="flex flex-col">
                            <strong className="text-sm sm:text-base font-extrabold text-[#173b2b]">
                              {it.nama}
                            </strong>
                            <span className="text-xs text-[#5a6b60]">{it.batchInfo}</span>
                          </div>
                        </div>
                        <span className="text-base sm:text-lg font-extrabold text-[#173b2b] whitespace-nowrap">
                          {it.jumlah}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Buyer Notes Callout */}
                  {pesanan.catatanPembeli && (
                    <div className="mt-1 flex items-start gap-2 p-2.5 px-3 rounded-xl bg-[#fbf3d9] text-xs leading-relaxed text-[#5c4500]">
                      {/* Chat bubble icon */}
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
                        className="flex-none mt-0.5"
                      >
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                      </svg>
                      <span>
                        <strong>Catatan pembeli:</strong> &ldquo;{pesanan.catatanPembeli}&rdquo;
                      </span>
                    </div>
                  )}
                </section>

                {/* 3. Pengiriman Section */}
                <section
                  aria-labelledby="judul-pengiriman"
                  className="p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
                >
                  <h2 id="judul-pengiriman" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Pengiriman
                  </h2>

                  {currentStatus === 'baru' ? (
                    <p className="m-0 text-sm text-[#3f5247]">
                      Metode pengiriman:{' '}
                      <strong className="text-[#173b2b]">{pesanan.kurir ?? 'Kurir reguler JNE'}</strong>.
                      Pengiriman dan nomor resi diatur setelah kamu menekan tombol &ldquo;Proses pesanan&rdquo;.
                    </p>
                  ) : nomorResi ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 px-3.5 rounded-xl bg-[#f6f8f4]">
                        <div>
                          <p className="m-0 text-xs text-[#5a6b60]">
                            Nomor resi{' '}
                            <span className="px-1.5 py-0.5 border border-dashed border-[#c2a032] rounded bg-[#fbf3d9] text-[#5c4500] font-bold">
                              Biteship
                            </span>
                          </p>
                          <p className="mt-0.5 mb-0 text-lg sm:text-xl font-extrabold tracking-wide text-[#173b2b]">
                            {nomorResi}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCetak}
                          className="min-h-[44px] px-4 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold cursor-pointer hover:bg-[#f6f8f4]"
                        >
                          {labelTercetak ? 'Cetak ulang label' : 'Cetak label alamat'}
                        </button>
                      </div>
                      <p className="m-0 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                        {opsiSerahPilihan === 'agen'
                          ? 'Antar paket ke agen JNE Lembang terdekat sebelum pukul 17.00.'
                          : 'Tempelkan label pada kardus atau karung. Kurir akan menjemput paket di lokasi tokomu.'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="m-0 text-sm text-[#3f5247]">
                        Pilih jadwal penyerahan barang ke kurir{' '}
                        <strong className="text-[#173b2b]">{pesanan.kurir ?? 'JNE'}</strong>:
                      </p>

                      <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                        <legend className="sr-only">Opsi serah kurir</legend>
                        {DEFAULT_OPSI_SERAH.map((op) => (
                          <label
                            key={op.id}
                            className={`flex items-start gap-3 p-3 px-3.5 rounded-xl border cursor-pointer ${
                              opsiSerahPilihan === op.id
                                ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                                : 'border-[#dee3da] bg-white hover:bg-[#fafbf9]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="serah-kurir"
                              checked={opsiSerahPilihan === op.id}
                              onChange={() => setOpsiSerahPilihan(op.id)}
                              className="w-5 h-5 mt-0.5 accent-[#064e3b]"
                            />
                            <span className="flex flex-col gap-0.5">
                              <span className="text-sm font-extrabold text-[#173b2b]">{op.judul}</span>
                              <span className="text-xs text-[#3f5247]">{op.ket}</span>
                            </span>
                          </label>
                        ))}
                      </fieldset>

                      <button
                        type="button"
                        onClick={handleBuatResi}
                        className="self-start min-h-[46px] px-5 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                      >
                        Buat resi dan label
                      </button>

                      <p className="m-0 text-xs text-[#5a6b60]">
                        Resi langsung dibuat oleh kurir lewat Biteship, juga untuk penjemputan terjadwal.
                      </p>
                    </div>
                  )}
                </section>

                {/* 4. Riwayat Pesanan Timeline */}
                <section
                  aria-labelledby="judul-riwayat"
                  className="p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
                >
                  <h2 id="judul-riwayat" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Riwayat pesanan
                  </h2>

                  <ol className="list-none m-0 p-0 flex flex-col">
                    {timelineEvents.map((e, idx) => {
                      const isLast = idx === timelineEvents.length - 1;
                      return (
                        <li key={idx} className="flex gap-3.5">
                          {/* Dot and Line Column */}
                          <div
                            aria-hidden="true"
                            className="flex-none w-5.5 flex flex-col items-center"
                          >
                            <span
                              className={`w-5.5 h-5.5 rounded-full grid place-items-center text-white ${
                                e.selesai
                                  ? 'bg-[#157a4c]'
                                  : e.kini
                                  ? 'border-2 border-[#c2a032] bg-white'
                                  : 'border border-[#c9d2c6] bg-white'
                              }`}
                            >
                              {e.selesai ? (
                                /* Tiny Checkmark */
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              ) : e.kini ? (
                                <span className="w-2 h-2 rounded-full bg-[#c2a032]" />
                              ) : null}
                            </span>
                            {!isLast && (
                              <span
                                className={`flex-1 min-h-[22px] border-l-2 border-dotted my-1 ${
                                  e.selesai ? 'border-[#157a4c]' : 'border-[#c9d2c6]'
                                }`}
                              />
                            )}
                          </div>

                          {/* Content Column */}
                          <div className="flex-1 min-w-0 pb-3.5">
                            <div className="flex flex-wrap justify-between items-baseline gap-1">
                              <strong
                                className={`text-sm ${
                                  e.kini ? 'text-[#c2a032] font-extrabold' : 'text-[#173b2b]'
                                }`}
                              >
                                {e.judul}
                              </strong>
                              <span className="text-xs text-[#5a6b60]">{e.waktu}</span>
                            </div>
                            <p className="mt-0.5 mb-0 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                              {e.ket}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              </div>

              {/* Right Aside (320px) */}
              <aside
                aria-label="Info pesanan"
                className="w-full lg:w-[320px] flex-none flex flex-col gap-3.5"
              >
                {/* Pembeli Card */}
                <section
                  aria-labelledby="judul-pembeli"
                  className="p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-2.5"
                >
                  <h2 id="judul-pembeli" className="m-0 text-xs font-bold text-[#5a6b60]">
                    Pembeli
                  </h2>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex-none w-10 h-10 rounded-full grid place-items-center bg-[#064e3b] text-white font-extrabold text-base"
                    >
                      {pembeli.inisial ?? 'P'}
                    </span>
                    <div className="flex flex-col">
                      <strong className="text-sm sm:text-base font-extrabold text-[#173b2b]">
                        {pembeli.nama}
                      </strong>
                      <span className="text-xs text-[#5a6b60]">{pembeli.tipe}</span>
                    </div>
                  </div>
                  <p className="m-0 text-xs text-[#3f5247]">{pembeli.riwayat}</p>

                  <Link
                    href={`/toko/obrolan?user=${encodeURIComponent(pembeli.nama)}`}
                    className="inline-flex items-center justify-center gap-2 min-h-[40px] px-3.5 rounded-xl border border-[#dee3da] bg-white text-xs font-bold text-[#064e3b] hover:bg-[#f6f8f4]"
                  >
                    {/* Chat message icon */}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                    <span>Chat pembeli</span>
                  </Link>
                </section>

                {/* Alamat Tujuan Card */}
                <section
                  aria-labelledby="judul-alamat"
                  className="p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-2"
                >
                  <h2 id="judul-alamat" className="m-0 text-xs font-bold text-[#5a6b60]">
                    Alamat tujuan
                  </h2>
                  <p className="m-0 text-sm font-extrabold text-[#173b2b]">{alamat.penerima}</p>
                  <p className="m-0 text-xs text-[#5a6b60]">{alamat.telepon}</p>
                  <p className="m-0 text-xs leading-relaxed text-[#3f5247]">{alamat.alamatLengkap}</p>
                  {alamat.patokan && (
                    <p className="m-0 text-xs text-[#5a6b60] italic">Patokan: {alamat.patokan}</p>
                  )}
                </section>

                {/* Uang dari Pesanan Breakdown */}
                <section
                  aria-labelledby="judul-keuangan"
                  className="p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 id="judul-keuangan" className="m-0 text-xs font-bold text-[#5a6b60]">
                      Uang dari pesanan
                    </h2>
                    <ChipStatus
                      status={currentStatus === 'selesai' ? 'dana-diteruskan' : 'dana-ditahan'}
                      ukuran="kecil"
                    />
                  </div>

                  <dl className="m-0 flex flex-col gap-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <dt className="text-[#3f5247]">Nilai produk</dt>
                      <dd className="m-0 font-bold text-[#173b2b]">
                        {formatRupiah(keuangan.nilaiProduk)}
                      </dd>
                    </div>

                    <div className="flex justify-between items-center text-xs text-[#5a6b60]">
                      <dt>Komisi PasokTani ({keuangan.persenKomisi ?? 3}%)</dt>
                      <dd className="m-0">-{formatRupiah(keuangan.komisi)}</dd>
                    </div>

                    <div className="pt-2 border-t border-[#eef0eb] flex justify-between items-baseline">
                      <dt className="font-extrabold text-[#173b2b]">Total diterima petani</dt>
                      <dd className="m-0 text-base font-extrabold text-[#157a4c]">
                        {formatRupiah(keuangan.totalTerima)}
                      </dd>
                    </div>

                    <div className="flex justify-between items-center text-xs text-[#5a6b60] pt-1">
                      <dt>Ongkir (dibayar pembeli ke kurir)</dt>
                      <dd className="m-0">{formatRupiah(keuangan.ongkir)}</dd>
                    </div>
                  </dl>

                  <p className="mt-1 mb-0 text-[11px] leading-relaxed text-[#5a6b60]">
                    Dana diteruskan otomatis 3 hari setelah barang tiba kalau tidak ada komplain dari
                    pembeli.
                  </p>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sticky Action Bar for 'baru' */}
      {currentStatus === 'baru' && (
        <div className="block sm:hidden sticky bottom-0 z-20 p-3 bg-white border-t border-[#dee3da] shadow-lg">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBukaProsesDialog(true)}
              className="flex-1 min-h-[46px] rounded-xl bg-[#064e3b] text-white text-sm font-extrabold border-0 cursor-pointer"
            >
              Proses pesanan
            </button>
            <button
              type="button"
              onClick={() => setBukaTolakDialog(true)}
              className="min-h-[46px] px-4 rounded-xl border border-[#b42318] bg-white text-[#b42318] text-sm font-extrabold cursor-pointer"
            >
              Tolak
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Nav (when not in sticky action bar mode or for navigation) */}
      <div className="block lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="pesanan" />
      </div>

      {/* Modal Dialog: Proses Pesanan */}
      {bukaProsesDialog && (
        <div className="fixed inset-0 z-50 bg-[#173b2b]/50 flex justify-center items-start pt-20 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalProsesId}
            className="w-full max-w-[460px] p-5.5 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5"
          >
            <h2 id={modalProsesId} className="m-0 text-lg font-extrabold text-[#173b2b]">
              Proses pesanan {noPesanan}?
            </h2>

            <div>
              <p className="m-0 mb-2 text-sm font-extrabold text-[#173b2b]">Siapkan barang ini</p>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                {DEFAULT_ITEMS_SIAPKAN.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-start gap-2.5 p-2.5 px-3 rounded-xl bg-[#f6f8f4] text-xs sm:text-sm text-[#173b2b]"
                  >
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
                      {it.nama} {it.jumlah} ({it.batchInfo})
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 mb-0 text-xs text-[#5a6b60]">
                Batch yang paling dulu kedaluwarsa dipakai lebih dulu.
              </p>
            </div>

            <p className="m-0 p-2.5 px-3 rounded-xl bg-[#fff1ea] text-xs leading-relaxed text-[#9a3412] font-bold">
              Setelah diproses, {pembeli.nama} tidak bisa membatalkan lagi. Kalau stok tidak cukup,
              tolak pesanan ini.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleProses}
                className="min-h-[46px] border-0 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#053d2e]"
              >
                Proses pesanan
              </button>
              <button
                type="button"
                onClick={() => setBukaProsesDialog(false)}
                className="min-h-[46px] border border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#f6f8f4]"
              >
                Nanti dulu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: Tolak Pesanan */}
      {bukaTolakDialog && (
        <div className="fixed inset-0 z-50 bg-[#173b2b]/50 flex justify-center items-start pt-20 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTolakId}
            className="w-full max-w-[460px] p-5.5 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5"
          >
            <h2 id={modalTolakId} className="m-0 text-lg font-extrabold text-[#b42318]">
              Tolak pesanan {noPesanan}?
            </h2>

            <p className="m-0 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
              Menolak pesanan akan mengembalikan dana penuh ke pembeli dan mempengaruhi performa toko.
              Pilih alasan penolakan:
            </p>

            <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
              <legend className="sr-only">Alasan penolakan pesanan</legend>
              {[
                { id: 'stok-habis', label: 'Stok hasil panen tidak cukup' },
                { id: 'waktu-lewat', label: 'Tidak sanggup memenuhi waktu pengiriman' },
                { id: 'alamat-jauh', label: 'Alamat pengiriman di luar jangkauan kurir' },
                { id: 'lainnya', label: 'Alasan operasional lainnya' },
              ].map((al) => (
                <label
                  key={al.id}
                  className="flex items-center gap-2.5 p-2 px-3 rounded-xl border border-[#dee3da] bg-white cursor-pointer hover:bg-[#f6f8f4]"
                >
                  <input
                    type="radio"
                    name="alasan-tolak"
                    checked={alasanTolak === al.id}
                    onChange={() => setAlasanTolak(al.id)}
                    className="w-4 h-4 accent-[#b42318]"
                  />
                  <span className="text-xs sm:text-sm font-bold text-[#173b2b]">{al.label}</span>
                </label>
              ))}
            </fieldset>

            <p className="m-0 p-2.5 px-3 rounded-xl bg-[#fff1ea] text-xs leading-relaxed text-[#9a3412]">
              Tingkat penyelesaian tokomu akan turun bila menolak pesanan yang sudah dibayar.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleTolak}
                className="min-h-[46px] border-0 rounded-xl bg-[#b42318] text-white text-sm font-extrabold cursor-pointer hover:bg-[#912018]"
              >
                Ya, tolak pesanan
              </button>
              <button
                type="button"
                onClick={() => setBukaTolakDialog(false)}
                className="min-h-[46px] border border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#f6f8f4]"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
