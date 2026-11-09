'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { ChipStatus, type StatusPasokTani } from '../common/ChipStatus';
import type { KategoriProduk } from './Pesanan';

export interface LinimasaPelacakan {
  waktu: string;
  status: string;
  deskripsi: string;
  aktif?: boolean;
}

export interface PeristiwaJalurItem {
  kunci: string;
  judul: string;
  waktu: string;
  keterangan: string;
  selesai?: boolean;
  kini?: boolean;
  nomorResi?: string;
}

export interface ItemProdukDetail {
  id: string;
  nama: string;
  kategori?: KategoriProduk | string;
  jumlah: number;
  satuan: string;
  hargaSatuan: number;
  hargaTotal: number;
  grosir?: boolean;
  panenInfo?: string;
  thumbnailUrl?: string;
}

export interface InfoPetaniPesanan {
  nama: string;
  singkatan: string;
  terverifikasi: boolean;
  lokasi: string;
  waktuBalas: string;
  hrefChat?: string;
  hrefToko?: string;
}

export interface InfoPengirimanPesanan {
  kurir: string;
  layanan: string;
  nomorResi?: string;
  penerimaNama: string;
  penerimaTelepon: string;
  alamatLengkap: string;
}

export interface RincianPembayaranPesanan {
  statusDana: StatusPasokTani | string;
  subtotalProduk: number;
  ongkosKirim: number;
  biayaLayanan: number;
  totalDibayar: number;
  keteranganDana?: string;
}

export interface PesananDetailData {
  id: string;
  no: string;
  toko: string;
  tanggalPesanan: string;
  status: StatusPasokTani | string;
  items: ItemProdukDetail[];
  petani?: InfoPetaniPesanan;
  alamat?: InfoPengirimanPesanan;
  kurir?: {
    nama: string;
    layanan: string;
    noResi?: string;
    estimasiTiba?: string;
  };
  pembayaran?: RincianPembayaranPesanan;
  pelacakan?: LinimasaPelacakan[];
  komplainId?: string;
}

export interface PesananDetailProps {
  pesanan?: PesananDetailData;
  status?: StatusPasokTani | string;
  onKonfirmasiSelesai?: (pesananId: string) => void;
  onAjukanKomplain?: (pesananId: string) => void;
  onBeriUlasan?: (pesananId: string) => void;
  className?: string;
}

const DEFAULT_DETAIL: PesananDetailData = {
  id: 'PT-26110418',
  no: 'PT-26110418',
  toko: 'Kebun Mang Ujang',
  tanggalPesanan: 'Jum, 6 Nov 2026, 19.12 WIB',
  status: 'tiba',
  items: [
    {
      id: 'prod-tomat',
      nama: 'Tomat Merah Lembang',
      kategori: 'sayuran',
      jumlah: 12,
      satuan: 'kg',
      hargaSatuan: 12000,
      hargaTotal: 144000,
      grosir: true,
      panenInfo: 'Dari panen Kam, 5 Nov',
    },
    {
      id: 'prod-kol',
      nama: 'Kol Bulat Lembang',
      kategori: 'sayuran',
      jumlah: 16,
      satuan: 'kg',
      hargaSatuan: 8000,
      hargaTotal: 128000,
      grosir: true,
      panenInfo: 'Dari panen Jum, 6 Nov',
    },
  ],
  petani: {
    nama: 'Kebun Mang Ujang',
    singkatan: 'MU',
    terverifikasi: true,
    lokasi: 'Lembang, Kab. Bandung Barat',
    waktuBalas: 'balas chat dalam ±1 jam',
    hrefChat: '/obrolan/kebun-mang-ujang',
    hrefToko: '/toko/kebun-mang-ujang',
  },
  alamat: {
    kurir: 'J&T Cargo',
    layanan: 'Reguler Kilat Pertanian',
    nomorResi: 'JT-9823412091',
    penerimaNama: 'Dewi Lestari',
    penerimaTelepon: '0812-3456-7890',
    alamatLengkap:
      'Jl. Cihanjuang No. 128 RT 02/05, Kec. Parongpong, Kab. Bandung Barat, Jawa Barat 40559',
  },
  kurir: {
    nama: 'J&T Cargo',
    layanan: 'Reguler Kilat Pertanian',
    noResi: 'JT-9823412091',
    estimasiTiba: 'Min, 8 Nov 2026, 10.00 WIB',
  },
  pembayaran: {
    statusDana: 'dana-ditahan',
    subtotalProduk: 272000,
    ongkosKirim: 12000,
    biayaLayanan: 2720,
    totalDibayar: 286720,
    keteranganDana:
      'Dana aman di Pasok Tani. Uang diteruskan ke petani setelah kamu menekan Pesanan diterima atau batas waktu komplain berakhir.',
  },
  pelacakan: [
    {
      waktu: 'Min, 8 Nov, 10.24 WIB',
      status: 'Pesanan tiba di tujuan',
      deskripsi: 'Paket telah diterima oleh Ibu Dewi di alamat tujuan.',
      aktif: true,
    },
    {
      waktu: 'Min, 8 Nov, 07.15 WIB',
      status: 'Kurir mengantar paket',
      deskripsi: 'Paket dibawa oleh kurir J&T Cargo menuju alamat tujuan.',
    },
    {
      waktu: 'Sab, 7 Nov, 18.40 WIB',
      status: 'Tiba di hub distribusi Lembang',
      deskripsi: 'Paket telah disortir dan siap dikirimkan.',
    },
    {
      waktu: 'Jum, 6 Nov, 21.00 WIB',
      status: 'Diserahkan oleh petani',
      deskripsi: 'Hasil panen segar dikemas rapi dan diserahkan ke gerai kurir.',
    },
    {
      waktu: 'Jum, 6 Nov, 19.12 WIB',
      status: 'Pesanan terbayar dan terkonfirmasi',
      deskripsi: 'Pembayaran telah diverifikasi, petani menyiapkan barang.',
    },
  ],
};

function IkonKategoriMini({ kat }: { kat?: string }) {
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

export function PesananDetail({
  pesanan = DEFAULT_DETAIL,
  status: statusProp,
  onKonfirmasiSelesai,
  onAjukanKomplain,
  onBeriUlasan,
  className = '',
}: PesananDetailProps) {
  const currentStatus = statusProp ?? pesanan.status;

  const [modalKonfirmasi, setModalKonfirmasi] = useState(false);
  const [modalBatal, setModalBatal] = useState(false);
  const [resiTersalin, setResiTersalin] = useState(false);
  const [pesanToast, setPesanToast] = useState('');

  const formatRp = (n: number): string =>
    'Rp ' + n.toLocaleString('id-ID');

  const noResi = pesanan.kurir?.noResi ?? pesanan.alamat?.nomorResi ?? 'JT-9823412091';

  const handleSalinResi = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(noResi).catch(() => {});
    }
    setResiTersalin(true);
    setTimeout(() => {
      setResiTersalin(false);
    }, 2500);
  };

  const handleTerimaPesanan = () => {
    onKonfirmasiSelesai?.(pesanan.id);
    setModalKonfirmasi(false);
    setPesanToast('Pesanan selesai. Dana diteruskan ke petani.');
  };

  const handleBatalkanPesanan = () => {
    setModalBatal(false);
    setPesanToast('Pesanan telah dibatalkan. Dana kembali ke Dompet.');
  };

  // Hero panel copy based on status
  const getPanelInfo = () => {
    switch (currentStatus) {
      case 'dikonfirmasi':
        return {
          judul: 'Pesanan dikonfirmasi petani',
          teks: 'Petani telah menyetujui pesananmu dan sedang mempersiapkan jadwal panen serta pengepakan.',
          adaBatas: false,
          batasJudul: '',
          batasTeks: '',
          latar: '#e0f2fe',
          garis: '1px solid #7dd3fc',
        };
      case 'diproses':
        return {
          judul: 'Pesanan sedang diproses',
          teks: 'Hasil panen segar sedang disortir dan dikemas dengan standar pasca-panen Pasok Tani.',
          adaBatas: false,
          batasJudul: '',
          batasTeks: '',
          latar: '#f6f8f5',
          garis: '1px solid #dee3da',
        };
      case 'dikirim':
        return {
          judul: 'Pesanan sedang dalam perjalanan',
          teks: 'Kurir mitra pertanian membawa pesananmu langsung dari kebun ke alamat tujuan.',
          adaBatas: false,
          batasJudul: '',
          batasTeks: '',
          latar: '#f3faf3',
          garis: '1px solid #a9cfae',
        };
      case 'selesai':
        return {
          judul: 'Pesanan selesai',
          teks: 'Pesanan telah diterima dan dana diteruskan ke petani. Terima kasih telah mendukung rantai pasok lokal!',
          adaBatas: false,
          batasJudul: '',
          batasTeks: '',
          latar: '#ffffff',
          garis: '1px solid #dee3da',
        };
      case 'dibatalkan':
        return {
          judul: 'Pesanan dibatalkan',
          teks: 'Pesanan ini telah dibatalkan dan seluruh dana transaksi telah dikembalikan ke saldo Dompet.',
          adaBatas: false,
          batasJudul: '',
          batasTeks: '',
          latar: '#fdecea',
          garis: '1px solid #f2b8b2',
        };
      case 'tiba':
      default:
        return {
          judul: 'Pesanan sudah tiba di alamatmu',
          teks: 'Paket telah tiba. Periksa kondisi fisik sayur dan kelengkapan produk sebelum mengonfirmasi.',
          adaBatas: true,
          batasJudul: 'Batas komplain: Rab, 11 Nov, 10.24 WIB (sisa 2 hari 1 jam)',
          batasTeks:
            'Setelah batas waktu lewat atau setelah kamu konfirmasi, dana otomatis diteruskan ke petani.',
          latar: '#fffdf5',
          garis: '1.5px solid #e9c75c',
        };
    }
  };

  const panel = getPanelInfo();

  return (
    <div className={`min-h-full bg-[#fcfbf6] font-sans text-[#173b2b] ${className}`}>
      <SiteHeader signedIn={true} cartCount={0} />

      <main className="max-w-[1200px] mx-auto px-4 py-4 md:py-7 md:px-6 md:pb-16 box-border">
        {/* Breadcrumb */}
        <nav aria-label="Remah roti" className="text-[13px] text-[#5a6b60] mb-2.5">
          <Link
            href="/pesanan"
            className="inline-flex items-center gap-1 min-h-8 text-[#157a4c] font-bold no-underline hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Pesanan saya
          </Link>
        </nav>

        {/* Title Header */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 mb-4">
          <h1 className="m-0 text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
            Pesanan {pesanan.no}
          </h1>
          <span className="text-xs text-[#5a6b60]">
            Dipesan {pesanan.tanggalPesanan}
          </span>
        </div>

        {/* Content Layout */}
        <div className="flex flex-wrap items-start gap-6">
          {/* Main Column */}
          <div className="flex-[999_1_560px] min-w-0 flex flex-col gap-4">
            {/* Status Hero Section */}
            <section
              aria-labelledby="judul-status"
              className="p-5 rounded-2xl flex flex-col gap-3"
              style={{ background: panel.latar, border: panel.garis }}
            >
              <ChipStatus status={currentStatus} />
              <div>
                <h2
                  id="judul-status"
                  className="m-0 text-xl md:text-2xl font-extrabold leading-snug"
                >
                  {panel.judul}
                </h2>
                <p className="mt-1.5 mb-0 text-sm md:text-[15px] leading-relaxed text-[#3f5247]">
                  {panel.teks}
                </p>
              </div>

              {/* Deadline Alert Box */}
              {panel.adaBatas && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#f3d7c6]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <p className="m-0 text-sm leading-relaxed text-[#173b2b]">
                    <strong className="text-[#9a3412]">{panel.batasJudul}</strong>
                    <br />
                    {panel.batasTeks}
                  </p>
                </div>
              )}

              {/* Action Buttons (Desktop) */}
              <div className="hidden md:flex flex-wrap items-center gap-2.5 pt-1">
                {currentStatus === 'tiba' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalKonfirmasi(true)}
                      className="min-h-12 px-5 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                    >
                      Pesanan diterima
                    </button>
                    <Link
                      href={`/pesanan/${pesanan.id}/komplain`}
                      onClick={() => onAjukanKomplain?.(pesanan.id)}
                      className="inline-flex items-center min-h-12 px-4 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold no-underline hover:bg-[#ebf2eb]"
                    >
                      Ajukan komplain
                    </Link>
                  </>
                )}

                {currentStatus === 'dikonfirmasi' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalBatal(true)}
                      className="min-h-12 px-4 rounded-xl border border-[#b42318] bg-white text-[#b42318] text-sm font-extrabold cursor-pointer hover:bg-[#fdecea]"
                    >
                      Batalkan pesanan
                    </button>
                    <Link
                      href={pesanan.petani?.hrefChat ?? '/obrolan'}
                      className="inline-flex items-center min-h-12 px-4 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold no-underline hover:bg-[#f6f8f5]"
                    >
                      Chat petani
                    </Link>
                  </>
                )}

                {currentStatus === 'selesai' && (
                  <>
                    <Link
                      href={`/pesanan/${pesanan.id}/ulasan`}
                      onClick={() => onBeriUlasan?.(pesanan.id)}
                      className="inline-flex items-center min-h-12 px-5 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold no-underline hover:bg-[#157a4c]"
                    >
                      Beri ulasan
                    </Link>
                    <Link
                      href="/keranjang"
                      className="inline-flex items-center min-h-12 px-4 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold no-underline hover:bg-[#ebf2eb]"
                    >
                      Beli lagi
                    </Link>
                  </>
                )}

                {(currentStatus === 'diproses' || currentStatus === 'dikirim') && (
                  <Link
                    href={pesanan.petani?.hrefChat ?? '/obrolan'}
                    className="inline-flex items-center min-h-12 px-5 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold no-underline hover:bg-[#ebf2eb]"
                  >
                    Chat petani
                  </Link>
                )}
              </div>

              {pesanToast && (
                <p aria-live="polite" className="m-0 text-sm font-bold text-[#157a4c]">
                  {pesanToast}
                </p>
              )}
            </section>

            {/* Shipment Tracking Timeline */}
            <section
              aria-labelledby="judul-jalur"
              className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 id="judul-jalur" className="m-0 text-base font-extrabold">
                    Dari lahan ke dapurmu
                  </h2>
                  <p className="m-0 text-xs text-[#5a6b60] mt-0.5">
                    {pesanan.kurir?.nama} ({pesanan.kurir?.layanan}) · Resi: {noResi}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSalinResi}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dee3da] bg-white text-[#173b2b] text-xs font-bold cursor-pointer hover:bg-[#f6f8f5]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  {resiTersalin ? 'Resi tersalin!' : 'Salin resi'}
                </button>
              </div>

              {/* Vertical Timeline List */}
              <ol className="list-none m-0 p-0 flex flex-col">
                {(pesanan.pelacakan ?? []).map((step, idx, arr) => {
                  const isFirst = idx === 0;
                  const isLast = idx === arr.length - 1;
                  return (
                    <li key={step.waktu + idx} className="flex items-start gap-3 relative pb-4">
                      {/* Vertical line indicator */}
                      {!isLast && (
                        <div
                          className="absolute left-[9px] top-4 bottom-0 w-[2px] bg-[#dee3da]"
                          aria-hidden="true"
                        />
                      )}

                      {/* Dot icon */}
                      <span
                        className={`relative z-10 w-5 h-5 rounded-full grid place-items-center shrink-0 ${
                          isFirst
                            ? 'bg-[#064e3b] text-white'
                            : 'bg-[#ebf2eb] text-[#5a6b60]'
                        }`}
                      >
                        {isFirst ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7d877e]" />
                        )}
                      </span>

                      {/* Step Text Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <p
                            className={`m-0 text-sm ${
                              isFirst
                                ? 'font-extrabold text-[#173b2b]'
                                : 'font-bold text-[#3f5247]'
                            }`}
                          >
                            {step.status}
                          </p>
                          <span className="text-xs text-[#5a6b60]">{step.waktu}</span>
                        </div>
                        <p className="mt-0.5 mb-0 text-xs text-[#5a6b60] leading-relaxed">
                          {step.deskripsi}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Ordered Items Breakdown */}
            <section
              aria-labelledby="judul-produk"
              className="border border-[#dee3da] rounded-2xl bg-white overflow-hidden"
            >
              <div className="p-4 border-b border-[#eef0eb]">
                <h2 id="judul-produk" className="m-0 text-base font-extrabold">
                  Produk ({pesanan.items.length})
                </h2>
              </div>

              <ul className="list-none m-0 p-0 divide-y divide-[#eef0eb]">
                {pesanan.items.map((item) => (
                  <li key={item.id} className="p-4 flex items-start gap-3">
                    <IkonKategoriMini kat={item.kategori} />
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <p className="m-0 text-sm font-bold text-[#173b2b]">
                        {item.nama}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#3f5247]">
                        <span>
                          {item.jumlah} {item.satuan} × {formatRp(item.hargaSatuan)}
                        </span>
                        {item.grosir && (
                          <span className="px-1.5 py-0.5 rounded bg-[#ebf2eb] text-[#064e3b] font-bold text-[11px]">
                            Harga grosir
                          </span>
                        )}
                      </div>
                      {item.panenInfo && (
                        <p className="m-0 text-xs text-[#157a4c] font-medium">
                          {item.panenInfo}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-extrabold text-[#173b2b]">
                      {formatRp(item.hargaTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="p-3.5 bg-[#fcfbf6] border-t border-[#eef0eb]">
                <Link
                  href="/keranjang"
                  className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#064e3b] no-underline hover:underline"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  Beli lagi produk yang sama
                </Link>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside
            aria-label="Info pesanan"
            className="flex-[1_1_340px] min-w-0 flex flex-col gap-4"
          >
            {/* Farmer Card */}
            <section
              aria-labelledby="judul-petani"
              className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
            >
              <h2 id="judul-petani" className="m-0 text-xs font-bold text-[#5a6b60]">
                Petani
              </h2>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="w-10 h-10 rounded-xl grid place-items-center bg-[#064e3b] text-white font-extrabold shrink-0"
                >
                  {pesanan.petani?.singkatan ?? 'PT'}
                </span>
                <div className="min-w-0">
                  <p className="m-0 flex items-center gap-1.5 text-sm font-extrabold">
                    <span>{pesanan.petani?.nama ?? pesanan.toko}</span>
                    {pesanan.petani?.terverifikasi && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#075985] text-white text-[11px] font-bold">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Terverifikasi
                      </span>
                    )}
                  </p>
                  <p className="m-0 text-xs text-[#3f5247] mt-0.5">
                    {pesanan.petani?.lokasi} · {pesanan.petani?.waktuBalas}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Link
                  href={pesanan.petani?.hrefChat ?? '/obrolan'}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 rounded-xl border border-[#064e3b] text-[#064e3b] text-xs font-extrabold no-underline hover:bg-[#ebf2eb]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                  </svg>
                  Chat petani
                </Link>
                <Link
                  href={pesanan.petani?.hrefToko ?? '#'}
                  className="flex-1 inline-flex items-center justify-center min-h-10 rounded-xl border border-[#dee3da] text-[#173b2b] text-xs font-bold no-underline hover:bg-[#f6f8f5]"
                >
                  Kunjungi toko
                </Link>
              </div>
            </section>

            {/* Shipping Address Card */}
            <section
              aria-labelledby="judul-kirim"
              className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2"
            >
              <h2 id="judul-kirim" className="m-0 text-xs font-bold text-[#5a6b60]">
                Pengiriman
              </h2>
              <div>
                <p className="m-0 text-sm font-extrabold text-[#173b2b]">
                  {pesanan.kurir?.nama} · {pesanan.kurir?.layanan}
                </p>
                <p className="m-0 text-xs font-bold text-[#3f5247] mt-1">
                  {pesanan.alamat?.penerimaNama} ({pesanan.alamat?.penerimaTelepon})
                </p>
                <p className="mt-0.5 mb-0 text-xs text-[#5a6b60] leading-relaxed">
                  {pesanan.alamat?.alamatLengkap}
                </p>
              </div>
            </section>

            {/* Payment Breakdown Card */}
            <section
              aria-labelledby="judul-bayar"
              className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 id="judul-bayar" className="m-0 text-xs font-bold text-[#5a6b60]">
                  Pembayaran
                </h2>
                <ChipStatus status={pesanan.pembayaran?.statusDana ?? 'dana-ditahan'} />
              </div>

              <dl className="m-0 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-[#5a6b60]">Subtotal produk</dt>
                  <dd className="m-0 font-medium text-[#173b2b]">
                    {formatRp(pesanan.pembayaran?.subtotalProduk ?? 0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#5a6b60]">Ongkos kirim</dt>
                  <dd className="m-0 font-medium text-[#173b2b]">
                    {formatRp(pesanan.pembayaran?.ongkosKirim ?? 0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#5a6b60]">Biaya layanan (1%)</dt>
                  <dd className="m-0 font-medium text-[#173b2b]">
                    {formatRp(pesanan.pembayaran?.biayaLayanan ?? 0)}
                  </dd>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#eef0eb] text-sm">
                  <dt className="font-extrabold text-[#173b2b]">Total dibayar</dt>
                  <dd className="m-0 font-extrabold text-[#064e3b]">
                    {formatRp(pesanan.pembayaran?.totalDibayar ?? 0)}
                  </dd>
                </div>
              </dl>

              {pesanan.pembayaran?.keteranganDana && (
                <p className="m-0 p-2.5 rounded-xl bg-[#fcfbf6] border border-[#eef0eb] text-[11px] leading-relaxed text-[#5a6b60]">
                  {pesanan.pembayaran.keteranganDana}
                </p>
              )}
            </section>

            {/* Help Links */}
            <section
              aria-label="Bantuan"
              className="p-4 rounded-2xl bg-[#ebf2eb] text-xs leading-relaxed"
            >
              <p className="m-0 font-bold text-[#064e3b]">Ada kendala pesanan?</p>
              <p className="mt-1 mb-2 text-[#3f5247]">
                Kunjungi Pusat Bantuan untuk panduan pembatalan, pengembalian dana, dan mediasi.
              </p>
              <Link
                href="/bantuan"
                className="font-bold text-[#064e3b] underline"
              >
                Kunjungi Pusat Bantuan
              </Link>
            </section>
          </aside>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        {currentStatus === 'tiba' && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white border-t border-[#dee3da] flex gap-2 shadow-lg">
            <Link
              href={`/pesanan/${pesanan.id}/komplain`}
              onClick={() => onAjukanKomplain?.(pesanan.id)}
              className="flex-1 inline-flex items-center justify-center min-h-12 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold no-underline hover:bg-[#f6f8f5]"
            >
              Ajukan komplain
            </Link>
            <button
              type="button"
              onClick={() => setModalKonfirmasi(true)}
              className="flex-[1.4] min-h-12 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
            >
              Pesanan diterima
            </button>
          </div>
        )}

        {/* Modal Konfirmasi Pesanan Diterima */}
        {modalKonfirmasi && (
          <div className="fixed inset-0 z-50 bg-[#173b2b]/50 flex justify-center items-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="judul-konfirmasi"
              className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5"
            >
              <h2
                id="judul-konfirmasi"
                className="m-0 text-lg font-extrabold leading-snug"
              >
                Pesanan sudah kamu cek?
              </h2>
              <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
                Setelah dikonfirmasi,{' '}
                {formatRp(pesanan.pembayaran?.totalDibayar ?? 0)} diteruskan ke{' '}
                {pesanan.toko} dan komplain tidak bisa diajukan lagi untuk pesanan ini.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTerimaPesanan}
                  className="min-h-12 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                >
                  Ya, pesanan sesuai
                </button>
                <button
                  type="button"
                  onClick={() => setModalKonfirmasi(false)}
                  className="min-h-12 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#f6f8f5]"
                >
                  Cek lagi dulu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Batalkan Pesanan */}
        {modalBatal && (
          <div className="fixed inset-0 z-50 bg-[#173b2b]/50 flex justify-center items-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="judul-batal"
              className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5"
            >
              <h2
                id="judul-batal"
                className="m-0 text-lg font-extrabold leading-snug"
              >
                Batalkan pesanan ini?
              </h2>
              <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
                Petani belum memproses, jadi pembatalan gratis.{' '}
                {formatRp(pesanan.pembayaran?.totalDibayar ?? 0)} langsung kembali ke
                saldo Dompet dan kuota dilepas untuk pembeli lain.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleBatalkanPesanan}
                  className="min-h-12 rounded-xl border-0 bg-[#b42318] text-white text-sm font-extrabold cursor-pointer hover:bg-[#8a1c12]"
                >
                  Ya, batalkan
                </button>
                <button
                  type="button"
                  onClick={() => setModalBatal(false)}
                  className="min-h-12 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#f6f8f5]"
                >
                  Tidak jadi
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

export default PesananDetail;
