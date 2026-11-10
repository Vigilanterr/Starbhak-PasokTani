'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { ChipStatus } from '../common/ChipStatus';

export interface ItemPesananBayar {
  toko: string;
  no: string;
  ringkas?: string;
  kirim?: string;
  jumlah: string | number;
}

export interface DataTagihan {
  id?: string;
  total?: number | string;
  metode?: 'qris' | 'va' | 'dompet' | string;
  bank?: 'bni' | 'bca' | 'mandiri' | 'bri' | 'permata' | 'cimb' | string;
  nomorVa?: string;
  qrCodeUrl?: string;
  kedaluwarsa?: string;
  sisaDetik?: number;
  keadaan?: 'menunggu' | 'lunas' | 'kedaluwarsa';
  status?: string;
  jumlahPesanan?: number;
  rincianToko?: string[];
  pesananList?: ItemPesananBayar[];
}

export type TagihanBayar = DataTagihan;

export interface BayarProps {
  tagihan?: DataTagihan;
  idPesanan?: string;
  total?: number | string;
  metode?: 'qris' | 'va';
  bank?: 'bni' | 'bca' | 'mandiri';
  batasWaktu?: string;
  detikSisa?: number;
  statusBawaan?: 'menunggu' | 'lunas' | 'kedaluwarsa';
  keadaan?: 'menunggu' | 'lunas' | 'kedaluwarsa';
  qrisUrl?: string;
  vaNumber?: string;
  pesananList?: ItemPesananBayar[];
  onCekStatus?: () => void;
  onGantiMetode?: () => void;
  onCheckoutUlang?: () => void;
  onKembaliKeranjang?: () => void;
  onLihatPesanan?: () => void;
  onBelanjaLagi?: () => void;
  onKonfirmasiLunas?: () => void;
  hrefCheckout?: string;
  hrefPesanan?: string;
  hrefKeranjang?: string;
  className?: string;
}

export function formatRupiah(n: number | string): string {
  if (typeof n === 'string') return n;
  const nb = '\u00a0';
  return 'Rp' + nb + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const defaultPesananList: ItemPesananBayar[] = [
  {
    toko: 'Kebun Mang Ujang',
    no: 'PT-26110821',
    ringkas: '2 produk · ongkir Rp 12.000',
    jumlah: 'Rp\u00a0284.000',
    kirim: 'Tiba Sel, 10 Nov',
  },
  {
    toko: 'Kumbung Jamur Ciremai',
    no: 'PT-26110822',
    ringkas: '1 produk · ongkir Rp 21.000',
    jumlah: 'Rp\u00a067.200',
    kirim: 'Tiba Sen, 9 Nov',
  },
  {
    toko: 'Tani Cikajang',
    no: 'PT-26110823',
    ringkas: '1 produk · ongkir Rp 14.000',
    jumlah: 'Rp\u00a098.000',
    kirim: 'Tiba Sel, 10 Nov',
  },
];

export const defaultTagihan: DataTagihan = {
  id: 'PT-TAGIHAN-261108',
  total: 'Rp\u00a0453.222',
  metode: 'qris',
  bank: 'bni',
  kedaluwarsa: 'Min, 8 Nov, 14.32 WIB',
  sisaDetik: 3552,
  keadaan: 'menunggu',
  pesananList: defaultPesananList,
};

// Generate 25x25 QR Matrix
function generateQrGrid(): Array<{ bg: string }> {
  const n = 25;
  let benih = 11;
  const acak = () => {
    benih = (benih * 9301 + 49297) % 233280;
    return benih / 233280;
  };
  const titikPola = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ];
  const grid: Array<{ bg: string }> = [];

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      let v = -1;
      for (const [r0, c0] of titikPola) {
        if (r0 !== undefined && c0 !== undefined && r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7) {
          const rr = r - r0;
          const cc = c - c0;
          v =
            rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4)
              ? 1
              : 0;
        }
      }
      if (v === -1) {
        for (const [r0, c0] of titikPola) {
          if (
            r0 !== undefined &&
            c0 !== undefined &&
            r >= r0 - 1 &&
            r <= r0 + 7 &&
            c >= c0 - 1 &&
            c <= c0 + 7
          ) {
            v = 0;
          }
        }
      }
      if (v === -1 && r === 6) v = c % 2 === 0 ? 1 : 0;
      if (v === -1 && c === 6) v = r % 2 === 0 ? 1 : 0;
      if (v === -1) v = acak() > 0.52 ? 1 : 0;
      grid.push({ bg: v ? '#173b2b' : '#ffffff' });
    }
  }
  return grid;
}

export function Bayar({
  tagihan = defaultTagihan,
  idPesanan,
  total: totalProp,
  metode: metodeProp,
  bank: bankProp,
  batasWaktu: batasWaktuProp,
  detikSisa: detikSisaProp,
  statusBawaan,
  keadaan: keadaanProp,
  qrisUrl,
  vaNumber,
  pesananList: pesananListProp,
  onCekStatus,
  onGantiMetode,
  onCheckoutUlang,
  onKembaliKeranjang,
  onLihatPesanan,
  onBelanjaLagi,
  onKonfirmasiLunas,
  hrefCheckout = '/checkout',
  hrefPesanan = '/pesanan',
  hrefKeranjang = '/keranjang',
  className = '',
}: BayarProps) {
  const metodeEfektif = metodeProp ?? (tagihan.metode === 'va' ? 'va' : 'qris');
  const bankEfektif = bankProp ?? (tagihan.bank as 'bni' | 'bca' | 'mandiri') ?? 'bni';
  const totalTeks: string = formatRupiah(totalProp ?? tagihan.total ?? 'Rp\u00a0453.222');
  const batasWaktu = batasWaktuProp ?? tagihan.kedaluwarsa ?? 'Min, 8 Nov, 14.32 WIB';
  const kodePesanan = idPesanan ?? tagihan.id ?? 'PT-TAGIHAN-261108';
  const urlGambarQr = qrisUrl ?? tagihan.qrCodeUrl;

  const [sisaDetik, setSisaDetik] = useState<number>(
    detikSisaProp ?? tagihan.sisaDetik ?? 3552
  );

  const initialKeadaan =
    keadaanProp ?? statusBawaan ?? tagihan.keadaan ?? 'menunggu';
  const [keadaanLokal, setKeadaanLokal] = useState<'menunggu' | 'lunas' | 'kedaluwarsa'>(
    initialKeadaan
  );

  const [tersalinKey, setTersalinKey] = useState<string>('');
  const [tersimpanQr, setTersimpanQr] = useState<boolean>(false);
  const [kanalTerbuka, setKanalTerbuka] = useState<number>(0);

  // Timer ticker
  useEffect(() => {
    if (keadaanLokal !== 'menunggu') return;
    const interval = setInterval(() => {
      setSisaDetik((prev) => {
        if (prev <= 1) {
          setKeadaanLokal('kedaluwarsa');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [keadaanLokal]);

  const padDua = (n: number) => (n < 10 ? '0' : '') + n;
  const menitSisa = Math.floor(sisaDetik / 60);
  const detikSisaAngka = sisaDetik % 60;
  const sisaTeks = `${padDua(menitSisa)}:${padDua(detikSisaAngka)}`;

  const handleSalin = (kunci: string, teks: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(teks);
      }
    } catch {
      // ignore
    }
    setTersalinKey(kunci);
    setTimeout(() => {
      setTersalinKey('');
    }, 2500);
  };

  const handleCekStatus = () => {
    setKeadaanLokal('lunas');
    onCekStatus?.();
    onKonfirmasiLunas?.();
  };

  const qrGrid = generateQrGrid();
  const daftarPesanan = pesananListProp ?? tagihan.pesananList ?? defaultPesananList;

  const vaConfigs = {
    bni: {
      judul: 'BNI Virtual Account',
      catatan: 'Bisa dibayar dari bank apa pun',
      warnaCatatan: 'text-[#157a4c]',
      kolom: [
        {
          kunci: 'va',
          label: 'Nomor Virtual Account',
          nilai: vaNumber ?? '9888 0812 3456 7890',
          salinTeks: (vaNumber ?? '9888081234567890').replace(/\s+/g, ''),
          ukuran: 'text-2xl',
          spasi: 'tracking-wider',
          aria: 'Salin nomor Virtual Account',
        },
        {
          kunci: 'jumlah',
          label: 'Jumlah transfer',
          nilai: totalTeks,
          salinTeks: totalTeks.replace(/[^0-9]/g, ''),
          ukuran: 'text-[22px]',
          spasi: 'tracking-normal',
          aria: 'Salin jumlah transfer',
          info: 'Transfer tepat sesuai jumlah ini. Jumlah lain ditolak bank.',
        },
      ],
      kanal: [
        {
          nama: 'BNI Mobile Banking',
          langkah: [
            'Buka BNI Mobile Banking dan masuk.',
            'Pilih Transfer, lalu Virtual Account Billing.',
            'Masukkan nomor Virtual Account di atas.',
            `Cek nama Pasok Tani dan jumlah ${totalTeks}, lalu masukkan PIN.`,
          ],
        },
        {
          nama: 'ATM BNI',
          langkah: [
            'Masukkan kartu dan PIN.',
            'Pilih Menu Lain, Transfer, lalu Virtual Account Billing.',
            'Masukkan nomor Virtual Account.',
            'Cek detail tagihan, lalu pilih Ya.',
          ],
        },
        {
          nama: 'Dari bank lain',
          langkah: [
            'Buka m-banking bankmu, pilih Transfer antarbank atau online.',
            'Pilih Bank BNI sebagai bank tujuan.',
            'Masukkan nomor Virtual Account sebagai nomor rekening tujuan.',
            `Isi jumlah tepat ${totalTeks}, cek nama Pasok Tani, lalu kirim.`,
          ],
        },
      ],
    },
    bca: {
      judul: 'BCA Virtual Account',
      catatan: 'Hanya dari rekening BCA. Dari bank lain, pilih BNI, BRI, Permata, atau CIMB Niaga.',
      warnaCatatan: 'text-[#92400e]',
      kolom: [
        {
          kunci: 'va',
          label: 'Nomor Virtual Account',
          nilai: vaNumber ?? '1234 5081 2345 6789',
          salinTeks: (vaNumber ?? '1234508123456789').replace(/\s+/g, ''),
          ukuran: 'text-2xl',
          spasi: 'tracking-wider',
          aria: 'Salin nomor Virtual Account',
        },
        {
          kunci: 'jumlah',
          label: 'Jumlah transfer',
          nilai: totalTeks,
          salinTeks: totalTeks.replace(/[^0-9]/g, ''),
          ukuran: 'text-[22px]',
          spasi: 'tracking-normal',
          aria: 'Salin jumlah transfer',
          info: 'Jumlah otomatis terisi saat nomor VA dimasukkan.',
        },
      ],
      kanal: [
        {
          nama: 'BCA mobile',
          langkah: [
            'Buka BCA mobile, pilih m-Transfer.',
            'Pilih BCA Virtual Account.',
            'Masukkan nomor Virtual Account.',
            'Cek nama Pasok Tani dan jumlah, lalu masukkan PIN.',
          ],
        },
        {
          nama: 'myBCA',
          langkah: [
            'Buka myBCA, pilih Transfer.',
            'Pilih Virtual Account, lalu masukkan nomor VA.',
            'Cek detail tagihan, lalu konfirmasi.',
          ],
        },
        {
          nama: 'ATM BCA',
          langkah: [
            'Masukkan kartu dan PIN.',
            'Pilih Transaksi Lainnya, Transfer, lalu ke Rek BCA Virtual Account.',
            'Masukkan nomor VA, cek detail, lalu pilih Ya.',
          ],
        },
      ],
    },
    mandiri: {
      judul: 'Mandiri Bill Payment',
      catatan: 'Hanya dari rekening Mandiri. Isi dua kode di bawah.',
      warnaCatatan: 'text-[#92400e]',
      kolom: [
        {
          kunci: 'biller',
          label: 'Kode perusahaan',
          nilai: '70012',
          salinTeks: '70012',
          ukuran: 'text-2xl',
          spasi: 'tracking-wider',
          aria: 'Salin kode perusahaan',
        },
        {
          kunci: 'bill',
          label: 'Kode bayar',
          nilai: vaNumber ?? '8901 2345 6789',
          salinTeks: (vaNumber ?? '890123456789').replace(/\s+/g, ''),
          ukuran: 'text-2xl',
          spasi: 'tracking-wider',
          aria: 'Salin kode bayar',
          info: `Jumlah tagihan ${totalTeks} muncul setelah kode dimasukkan.`,
        },
      ],
      kanal: [
        {
          nama: 'Livin’ by Mandiri',
          langkah: [
            'Buka Livin’, pilih Bayar, lalu E-Commerce atau Multipayment.',
            'Cari penyedia dengan kode perusahaan 70012.',
            'Masukkan kode bayar.',
            'Cek nama Pasok Tani dan jumlah, lalu masukkan PIN.',
          ],
        },
        {
          nama: 'ATM Mandiri',
          langkah: [
            'Masukkan kartu dan PIN.',
            'Pilih Bayar/Beli, Lainnya, lalu Multi Payment.',
            'Masukkan kode perusahaan 70012, lalu kode bayar.',
            'Cek detail tagihan, lalu konfirmasi.',
          ],
        },
      ],
    },
  };

  const vaAktif = vaConfigs[bankEfektif] ?? vaConfigs.bni;
  const namaMetodeTeks = metodeEfektif === 'qris' ? 'QRIS' : vaAktif.judul;

  return (
    <div
      className={`min-h-screen bg-[#fcfbf6] font-sans text-[#173b2b] ${className}`}
    >
      <SiteHeader active="keranjang" cartCount={0} />

      <main className="max-w-[1200px] mx-auto px-4 py-4 md:px-6 md:pt-7 md:pb-16 box-border">
        {/* Breadcrumb Steps */}
        <ol
          aria-label="Langkah belanja"
          className="list-none m-0 mb-3 p-0 flex items-center gap-2 text-[13px] text-[#5a6b60]"
        >
          <li className="flex items-center gap-1.5 text-[#157a4c] font-bold">
            <span
              aria-hidden="true"
              className="w-5 h-5 rounded-full grid place-items-center bg-[#157a4c] text-white"
            >
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
            </span>
            Keranjang
          </li>
          <li aria-hidden="true" className="w-5 h-px bg-[#c9d2c6]" />
          <li className="flex items-center gap-1.5 text-[#157a4c] font-bold">
            <span
              aria-hidden="true"
              className="w-5 h-5 rounded-full grid place-items-center bg-[#157a4c] text-white"
            >
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
            </span>
            Checkout
          </li>
          <li aria-hidden="true" className="w-5 h-px bg-[#c9d2c6]" />
          <li
            aria-current="step"
            className="flex items-center gap-1.5 text-[#173b2b] font-extrabold"
          >
            <span
              aria-hidden="true"
              className="w-5 h-5 rounded-full grid place-items-center bg-[#064e3b] text-white text-[11px]"
            >
              3
            </span>
            Bayar
          </li>
        </ol>

        {/* State 1: Menunggu Pembayaran */}
        {keadaanLokal === 'menunggu' && (
          <>
            <h1 className="m-0 mb-1.5 text-[26px] md:text-[34px] leading-tight font-extrabold tracking-tight">
              Selesaikan pembayaran
            </h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3.5 mb-4.5">
              <p className="m-0 flex items-center gap-2 text-[15px] font-bold">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c2410c"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Bayar sebelum {batasWaktu}
              </p>
              <span
                role="timer"
                className="inline-flex items-center min-h-7.5 px-3 rounded-full bg-[#fff1ea] text-[#9a3412] text-sm font-extrabold tabular-nums"
              >
                Sisa {sisaTeks}
              </span>
            </div>

            <div className="flex flex-wrap items-start gap-6">
              {/* Left Column: QRIS or VA details */}
              <div className="grow min-w-0 flex flex-col gap-4" style={{ flex: '999 1 560px' }}>
                {metodeEfektif === 'qris' ? (
                  <section
                    aria-labelledby="judul-qris"
                    className="p-5 border border-[#dee3da] rounded-2xl bg-white"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-1.5 gap-x-3 mb-4">
                      <h2 id="judul-qris" className="m-0 text-lg font-extrabold">
                        Bayar dengan QRIS
                      </h2>
                      <span className="text-[13px] text-[#5a6b60]">
                        Penerima: Pasok Tani · NMID{' '}
                        <span className="px-1.5 border border-dashed border-[#c2a032] rounded bg-[#fbf3d9] text-[#5c4500] font-bold">
                          [NMID]
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-start gap-6">
                      {/* QR matrix box */}
                      <div className="shrink-0 flex flex-col items-center gap-2.5 mx-auto md:mx-0">
                        <div className="p-3.5 border border-[#dee3da] rounded-2xl bg-white shadow-xs">
                          <div className="flex justify-between items-center mb-2 text-[13px] font-extrabold tracking-wide">
                            <span>QRIS</span>
                            <span className="font-semibold tracking-normal text-[#5a6b60]">
                              Pasok Tani
                            </span>
                          </div>
                          {urlGambarQr ? (
                            <Image
                              src={urlGambarQr}
                              alt={`Kode QRIS untuk pesanan ${kodePesanan}`}
                              width={225}
                              height={225}
                              unoptimized
                              className="w-[225px] h-[225px] object-contain"
                            />
                          ) : (
                            <div
                              role="img"
                              aria-label={`Kode QRIS contoh untuk membayar ${totalTeks} ke Pasok Tani (${kodePesanan})`}
                              className="grid grid-cols-[repeat(25,minmax(0,1fr))] w-[225px] h-[225px] md:w-[225px] md:h-[225px]"
                            >
                              {qrGrid.map((sel, idx) => (
                                <span
                                  key={idx}
                                  style={{ backgroundColor: sel.bg }}
                                  className="block w-full h-full"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="px-2 py-0.5 border border-dashed border-[#c2a032] rounded bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
                          Contoh QR. QR asli dibuat Midtrans per transaksi.
                        </span>
                      </div>

                      {/* Instructions */}
                      <div className="grow min-w-0 flex flex-col gap-3.5">
                        <div>
                          <p className="m-0 text-[13px] text-[#5a6b60]">
                            Nominal yang tampil di aplikasimu
                          </p>
                          <p className="mt-0.5 mb-0 text-[28px] font-extrabold text-[#064e3b] tracking-tight whitespace-nowrap">
                            {totalTeks}
                          </p>
                        </div>

                        {/* Mobile Save Button */}
                        <div className="md:hidden flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setTersimpanQr(true)}
                            className="flex items-center justify-center gap-2 min-h-13 border-0 rounded-xl bg-[#064e3b] text-white text-base font-extrabold cursor-pointer hover:bg-[#053d2e]"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" x2="12" y1="15" y2="3" />
                            </svg>
                            {tersimpanQr ? 'QR tersimpan di galeri' : 'Simpan QR ke galeri'}
                          </button>
                          {tersimpanQr && (
                            <p
                              aria-live="polite"
                              className="m-0 min-h-4.5 text-[13px] font-bold text-[#157a4c]"
                            >
                              Tersimpan. Buka aplikasi pembayaranmu, lalu unggah dari galeri.
                            </p>
                          )}
                        </div>

                        <div>
                          <h3 className="mt-0 mb-2 text-[15px] font-extrabold">
                            Pindai dengan HP kamu
                          </h3>
                          <ol className="m-0 p-0 list-none flex flex-col gap-2">
                            <li className="flex gap-2.5 text-sm leading-relaxed">
                              <span
                                aria-hidden="true"
                                className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold"
                              >
                                1
                              </span>
                              <span>Buka aplikasi e-wallet atau m-banking di HP kamu.</span>
                            </li>
                            <li className="flex gap-2.5 text-sm leading-relaxed">
                              <span
                                aria-hidden="true"
                                className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold"
                              >
                                2
                              </span>
                              <span>Pilih Scan atau Bayar QRIS.</span>
                            </li>
                            <li className="flex gap-2.5 text-sm leading-relaxed">
                              <span
                                aria-hidden="true"
                                className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold"
                              >
                                3
                              </span>
                              <span>Arahkan kamera ke QR di layar ini.</span>
                            </li>
                            <li className="flex gap-2.5 text-sm leading-relaxed">
                              <span
                                aria-hidden="true"
                                className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold"
                              >
                                4
                              </span>
                              <span>Cek nominal dan nama Pasok Tani, lalu masukkan PIN.</span>
                            </li>
                          </ol>
                        </div>

                        <p className="m-0 text-[13px] leading-relaxed text-[#5a6b60]">
                          Bisa dari GoPay, OVO, DANA, ShopeePay, LinkAja, dan aplikasi m-banking
                          yang mendukung QRIS.
                        </p>
                      </div>
                    </div>
                  </section>
                ) : (
                  <section
                    aria-labelledby="judul-va"
                    className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-4"
                  >
                    <div>
                      <h2 id="judul-va" className="m-0 text-lg font-extrabold">
                        {vaAktif.judul}
                      </h2>
                      <p
                        className={`mt-1 mb-0 inline-flex items-center gap-1.5 text-[13px] font-bold ${vaAktif.warnaCatatan}`}
                      >
                        {vaAktif.catatan}
                      </p>
                    </div>

                    {vaAktif.kolom.map((kol) => (
                      <div
                        key={kol.kunci}
                        className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 px-4 border border-[#dee3da] rounded-xl bg-[#fcfbf6]"
                      >
                        <div className="min-w-0">
                          <p className="m-0 text-[13px] text-[#5a6b60]">{kol.label}</p>
                          <p
                            className={`mt-0.5 mb-0 font-extrabold tabular-nums text-[#173b2b] whitespace-nowrap ${kol.ukuran} ${kol.spasi}`}
                          >
                            {kol.nilai}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSalin(kol.kunci, kol.salinTeks)}
                          aria-label={kol.aria}
                          className="shrink-0 inline-flex items-center gap-1.5 min-h-11 px-3.5 border-1.5 border-[#064e3b] rounded-xl bg-white text-[#064e3b] font-sans text-sm font-extrabold cursor-pointer hover:bg-[#ebf2eb]"
                        >
                          {tersalinKey === kol.kunci ? (
                            <>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                              Tersalin
                            </>
                          ) : (
                            <>
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
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                              Salin
                            </>
                          )}
                        </button>

                        {'info' in kol && (
                          <p className="basis-full m-0 text-xs text-[#5a6b60]">
                            {kol.info}
                          </p>
                        )}
                      </div>
                    ))}

                    {tersalinKey && (
                      <p
                        aria-live="polite"
                        className="-mt-1.5 mb-0 min-h-4.5 text-[13px] font-bold text-[#157a4c]"
                      >
                        {tersalinKey === 'va'
                          ? 'Nomor Virtual Account tersalin.'
                          : tersalinKey === 'jumlah'
                          ? 'Jumlah transfer tersalin.'
                          : 'Tersalin.'}
                      </p>
                    )}

                    <div>
                      <h3 className="mt-0 mb-2 text-[15px] font-extrabold">Cara transfer</h3>
                      <ul className="list-none m-0 p-0 border border-[#dee3da] rounded-xl overflow-hidden">
                        {vaAktif.kanal.map((kn, idx) => {
                          const isBuka = kanalTerbuka === idx;
                          return (
                            <li
                              key={kn.nama}
                              className={idx === 0 ? '' : 'border-t border-[#dee3da]'}
                            >
                              <button
                                type="button"
                                aria-expanded={isBuka}
                                onClick={() => setKanalTerbuka(isBuka ? -1 : idx)}
                                className="w-full min-h-13 flex items-center justify-between gap-2.5 px-4 border-0 bg-white text-[#173b2b] font-sans text-[15px] font-bold text-left cursor-pointer hover:bg-[#f6f8f4]"
                              >
                                {kn.nama}
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                  className="shrink-0"
                                  style={{
                                    transform: isBuka ? 'rotate(180deg)' : 'none',
                                  }}
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </button>
                              {isBuka && (
                                <ol className="m-0 p-0 px-4 pb-4 pl-11 text-sm leading-relaxed text-[#3f5247]">
                                  {kn.langkah.map((step, sIdx) => (
                                    <li key={sIdx} className="mb-1">
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </section>
                )}

                {/* Status sync alert banner */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 px-4 rounded-xl bg-[#ebf2eb]">
                  <p className="m-0 flex items-center gap-2.5 text-sm leading-snug">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#157a4c"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                    <span>Menunggu pembayaran. Halaman ini berubah sendiri setelah pembayaran masuk.</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleCekStatus}
                    className="inline-flex items-center min-h-11 px-3.5 border border-[#a9cfae] rounded-xl bg-white text-[#064e3b] font-sans text-sm font-extrabold cursor-pointer hover:bg-[#f6f8f4]"
                  >
                    Cek status
                  </button>
                </div>
              </div>

              {/* Right Summary Aside */}
              <aside
                aria-label="Rincian pembayaran"
                className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4"
              >
                <div className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                  <h2 className="m-0 text-[17px] font-extrabold">Rincian pembayaran</h2>
                  <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                    {daftarPesanan.map((ps) => (
                      <li
                        key={ps.no}
                        className="flex justify-between gap-3 text-sm leading-snug"
                      >
                        <span className="min-w-0">
                          <strong className="block font-bold">{ps.toko}</strong>
                          <span className="text-xs text-[#5a6b60]">
                            {ps.no} {ps.ringkas ? `· ${ps.ringkas}` : ''}
                          </span>
                        </span>
                        <span className="shrink-0 font-bold whitespace-nowrap">
                          {formatRupiah(ps.jumlah)}
                        </span>
                      </li>
                    ))}
                    <li className="flex justify-between gap-3 text-sm text-[#5a6b60]">
                      <span>Biaya layanan (1%)</span>
                      <span className="whitespace-nowrap">Rp 4.022</span>
                    </li>
                  </ul>

                  <div className="flex items-baseline justify-between gap-3 pt-3 border-t border-dashed border-[#dee3da]">
                    <span className="text-[15px] font-bold">Total</span>
                    <span className="text-xl font-extrabold text-[#064e3b] whitespace-nowrap">
                      {totalTeks}
                    </span>
                  </div>

                  <Link
                    href={hrefCheckout}
                    onClick={(e) => {
                      if (onGantiMetode) {
                        e.preventDefault();
                        onGantiMetode();
                      }
                    }}
                    className="inline-flex items-center justify-center min-h-11 border border-[#dee3da] rounded-xl text-[#064e3b] text-sm font-extrabold no-underline hover:bg-[#ebf2eb]"
                  >
                    Ganti metode pembayaran
                  </Link>

                  <p className="m-0 text-xs leading-relaxed text-[#5a6b60]">
                    Ganti metode tidak menambah waktu bayar. Stok tetap disisihkan sampai 14.32 WIB.
                  </p>
                </div>

                <p className="m-0 flex gap-2 px-1 text-xs leading-relaxed text-[#5a6b60]">
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
                    className="shrink-0 mt-0.5"
                  >
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>
                    Uangmu ditahan Pasok Tani dan baru diteruskan ke petani setelah kamu menerima
                    pesanan.
                  </span>
                </p>
              </aside>
            </div>
          </>
        )}

        {/* State 2: Lunas */}
        {keadaanLokal === 'lunas' && (
          <section
            aria-labelledby="judul-lunas"
            className="max-w-[680px] mx-auto mt-2 p-5.5 md:p-8 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-4.5"
          >
            <div className="flex flex-col items-center gap-2.5 text-center">
              <span
                aria-hidden="true"
                className="w-16 h-16 rounded-full grid place-items-center bg-[#064e3b] text-white"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h1
                id="judul-lunas"
                className="m-0 text-[26px] md:text-[34px] leading-tight font-extrabold tracking-tight"
              >
                Pembayaran diterima
              </h1>
              <p className="m-0 text-[15px] text-[#3f5247]">
                {totalTeks} lewat {namaMetodeTeks} · Min, 8 Nov, 13.41 WIB
              </p>
            </div>

            <div>
              <h2 className="mt-0 mb-2 text-[15px] font-extrabold">
                {daftarPesanan.length} pesanan diteruskan ke petani
              </h2>
              <ul className="list-none m-0 p-0 border border-[#dee3da] rounded-xl overflow-hidden">
                {daftarPesanan.map((ps, idx) => (
                  <li
                    key={ps.no}
                    className={`flex flex-wrap items-center justify-between gap-1.5 gap-x-3 p-3 px-3.5 ${
                      idx === 0 ? '' : 'border-t border-[#dee3da]'
                    }`}
                  >
                    <span className="min-w-0">
                      <strong className="block text-sm">{ps.toko}</strong>
                      <span className="text-xs text-[#5a6b60]">
                        {ps.no} {ps.kirim ? `· ${ps.kirim}` : ''}
                      </span>
                    </span>
                    <ChipStatus status="dikonfirmasi" />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mt-0 mb-2 text-[15px] font-extrabold">Yang terjadi selanjutnya</h2>
              <ol className="m-0 p-0 list-none flex flex-col gap-2">
                <li className="flex gap-2.5 text-sm leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold"
                  >
                    1
                  </span>
                  <span>
                    Petani menyiapkan pesananmu. Berubah pikiran? Kamu bisa membatalkan gratis
                    sampai petani mulai memproses.
                  </span>
                </li>
                <li className="flex gap-2.5 text-sm leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold"
                  >
                    2
                  </span>
                  <span>Saat tiba, cek isinya lalu tekan Pesanan diterima.</span>
                </li>
                <li className="flex gap-2.5 text-sm leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold"
                  >
                    3
                  </span>
                  <span>
                    Ada yang rusak atau tidak sesuai? Ajukan komplain paling lambat 3 hari setelah
                    tiba. Dana petani ditahan sampai urusan selesai.
                  </span>
                </li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <Link
                href={hrefPesanan}
                onClick={(e) => {
                  if (onLihatPesanan) {
                    e.preventDefault();
                    onLihatPesanan();
                  }
                }}
                className="grow basis-48 flex items-center justify-center min-h-13 rounded-xl bg-[#064e3b] text-white text-base font-extrabold no-underline hover:bg-[#053d2e]"
              >
                Lihat pesanan
              </Link>
              <Link
                href="/produk"
                onClick={(e) => {
                  if (onBelanjaLagi) {
                    e.preventDefault();
                    onBelanjaLagi();
                  }
                }}
                className="grow basis-40 flex items-center justify-center min-h-13 border-1.5 border-[#064e3b] rounded-xl bg-white text-[#064e3b] text-base font-extrabold no-underline hover:bg-[#ebf2eb]"
              >
                Belanja lagi
              </Link>
            </div>
          </section>
        )}

        {/* State 3: Kedaluwarsa */}
        {keadaanLokal === 'kedaluwarsa' && (
          <section
            aria-labelledby="judul-habis"
            className="max-w-[640px] mx-auto mt-2 p-5.5 md:p-8 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-4"
          >
            <div className="flex flex-col items-center gap-2.5 text-center">
              <span
                aria-hidden="true"
                className="w-16 h-16 rounded-full grid place-items-center bg-[#fff1ea] text-[#c2410c]"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              <h1
                id="judul-habis"
                className="m-0 text-[26px] md:text-[34px] leading-tight font-extrabold tracking-tight"
              >
                Waktu pembayaran habis
              </h1>
              <p className="m-0 max-w-[460px] text-[15px] leading-relaxed text-[#3f5247]">
                Pesanan dibatalkan otomatis dan stok yang disisihkan sudah dilepas. Belum ada uang
                yang terpotong.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <Link
                href={hrefCheckout}
                onClick={(e) => {
                  if (onCheckoutUlang) {
                    e.preventDefault();
                    onCheckoutUlang();
                  }
                }}
                className="grow basis-48 flex items-center justify-center min-h-13 rounded-xl bg-[#064e3b] text-white text-base font-extrabold no-underline hover:bg-[#053d2e]"
              >
                Checkout ulang
              </Link>
              <Link
                href={hrefKeranjang}
                onClick={(e) => {
                  if (onKembaliKeranjang) {
                    e.preventDefault();
                    onKembaliKeranjang();
                  }
                }}
                className="grow basis-40 flex items-center justify-center min-h-13 border-1.5 border-[#064e3b] rounded-xl bg-white text-[#064e3b] text-base font-extrabold no-underline hover:bg-[#ebf2eb]"
              >
                Kembali ke keranjang
              </Link>
            </div>

            <p className="m-0 text-[13px] leading-relaxed text-[#5a6b60] text-center">
              Checkout ulang memakai produk yang sama. Harga dan stok dicek lagi. Terlanjur transfer
              setelah batas waktu?{' '}
              <a href="#" className="text-[#157a4c] font-bold no-underline hover:underline">
                Hubungi Pusat Bantuan
              </a>{' '}
              dengan bukti transfer.
            </p>
          </section>
        )}
      </main>

      <div className="mt-8 hidden lg:block">
        <SiteFooter />
      </div>
    </div>
  );
}

export default Bayar;
