'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../layout';
import { KartuAngka, Grafik } from '../common';
import type { DataGrafikItem } from '../common/Grafik';

export interface CorongPenjualanData {
  pengunjung: number;
  lihatProduk: number;
  tambahKeranjang: number;
  checkout: number;
  bayar: number;
}

export interface ProdukAnalitikItem {
  id?: string;
  nama: string;
  terjualKg: number;
  pendapatan?: number | string;
  foto?: string;
  terjualLaluKg?: number;
  stokKg?: number;
  dilihatCount?: number;
  saran?: string;
}

export interface DataAnalitikToko {
  periode?: '7' | '30' | '90' | string;
  bandingTeks?: string;
  corong?: CorongPenjualanData;
  produkTerlaris?: ProdukAnalitikItem[];
  produkKurangLaku?: ProdukAnalitikItem[];
}

export interface TokoAnalitikProps {
  dataAnalitik?: DataAnalitikToko;
  kosong?: boolean;
  periode?: '7' | '30' | '90';
  className?: string;
}

const DATA_7_HARI = {
  banding: 'dibanding 26 Okt sampai 1 Nov',
  corongJudul: 'Pengunjung dan pesanan, 2 sampai 8 Nov',
  kartu: [
    { label: 'Pendapatan', nilai: 'Rp 4.280.000', ubah: 12, baik: true },
    { label: 'Pesanan', nilai: '18', ubah: 13, baik: true },
    { label: 'Dilihat', nilai: '1.240', ubah: 8, baik: true },
    { label: 'Dari dilihat jadi dibeli', nilai: '1,5%', ubah: 15, baik: true },
  ],
  corong: [
    { label: 'Produk dilihat', nilai: 1240, teks: '1.240' },
    { label: 'Masuk keranjang', nilai: 96, teks: '96 · 7,7%' },
    { label: 'Dibeli', nilai: 18, teks: '18 pesanan · 18,8%' },
    { label: 'Berlangganan', nilai: 5, teks: '5 di antaranya · 27,8%', geser: 18 },
  ] as DataGrafikItem[],
  laris: [
    { label: 'Tomat Merah Lembang', nilai: 212, lalu: 190, teks: '212 kg' },
    { label: 'Kol Bulat Lembang', nilai: 188, lalu: 205, teks: '188 kg' },
    { label: 'Wortel Brastagi', nilai: 96, lalu: 70, teks: '96 kg' },
  ] as DataGrafikItem[],
  sepi: [
    { label: 'Cabai Rawit Merah', nilai: 14, lalu: 30, teks: '14 kg', ket: 'Dilihat 310 kali, 4% masuk keranjang. Stok 46 kg.' },
    { label: 'Buncis Lembang', nilai: 9, lalu: 12, teks: '9 kg', ket: 'Dilihat 140 kali. Stok 31 kg.' },
  ] as DataGrafikItem[],
  saran: 'Banyak yang melihat tetapi hanya 7,7% memasukkan ke keranjang. Cek foto utama dan harga per kg dibanding petani lain.',
};

const DATA_30_HARI = {
  banding: 'dibanding 10 Sep sampai 9 Okt',
  corongJudul: 'Pengunjung dan pesanan, 10 Okt sampai 8 Nov',
  kartu: [
    { label: 'Pendapatan', nilai: 'Rp 16.940.000', ubah: 6, baik: true },
    { label: 'Pesanan', nilai: '71', ubah: 4, baik: true },
    { label: 'Dilihat', nilai: '5.120', ubah: -3, baik: true },
    { label: 'Dari dilihat jadi dibeli', nilai: '1,4%', ubah: 8, baik: true },
  ],
  corong: [
    { label: 'Produk dilihat', nilai: 5120, teks: '5.120' },
    { label: 'Masuk keranjang', nilai: 402, teks: '402 · 7,9%' },
    { label: 'Dibeli', nilai: 71, teks: '71 pesanan · 17,7%' },
    { label: 'Berlangganan', nilai: 19, teks: '19 di antaranya · 26,8%', geser: 18 },
  ] as DataGrafikItem[],
  laris: [
    { label: 'Tomat Merah Lembang', nilai: 810, lalu: 760, teks: '810 kg' },
    { label: 'Kol Bulat Lembang', nilai: 742, lalu: 700, teks: '742 kg' },
    { label: 'Wortel Brastagi', nilai: 330, lalu: 380, teks: '330 kg' },
  ] as DataGrafikItem[],
  sepi: [
    { label: 'Cabai Rawit Merah', nilai: 52, lalu: 70, teks: '52 kg', ket: 'Dilihat 1.280 kali, 4% masuk keranjang.' },
    { label: 'Buncis Lembang', nilai: 31, lalu: 29, teks: '31 kg', ket: 'Dilihat 610 kali.' },
  ] as DataGrafikItem[],
  saran: 'Dilihat turun 3% dibanding 30 hari sebelumnya, sementara pesanan naik. Pembeli yang datang makin tepat sasaran.',
};

export function TokoAnalitik({
  dataAnalitik,
  kosong = false,
  periode: periodeProp = '7',
  className = '',
}: TokoAnalitikProps) {
  const [periodePilihan, setPeriodePilihan] = useState<'7' | '30' | '90'>(
    (dataAnalitik?.periode as '7' | '30' | '90') ?? periodeProp
  );

  const activePeriod = periodePilihan === '30' ? '30' : '7';
  const data = activePeriod === '30' ? DATA_30_HARI : DATA_7_HARI;

  // Use props data if supplied, otherwise fallback to mock data
  const banding = dataAnalitik?.bandingTeks ?? data.banding;

  const larisData: DataGrafikItem[] = dataAnalitik?.produkTerlaris
    ? dataAnalitik.produkTerlaris.map((p) => ({
        label: p.nama,
        nilai: p.terjualKg,
        lalu: p.terjualLaluKg ?? 0,
        teks: `${p.terjualKg} kg`,
      }))
    : data.laris;

  const sepiData: DataGrafikItem[] = dataAnalitik?.produkKurangLaku
    ? dataAnalitik.produkKurangLaku.map((p) => ({
        label: p.nama,
        nilai: p.terjualKg ?? p.stokKg ?? 0,
        lalu: p.terjualLaluKg ?? 0,
        teks: `${p.terjualKg ?? p.stokKg ?? 0} kg`,
        ket: p.saran ?? `Dilihat ${p.dilihatCount ?? 0} kali. Stok ${p.stokKg ?? 0} kg.`,
      }))
    : data.sepi;

  const corongData: DataGrafikItem[] = dataAnalitik?.corong
    ? [
        { label: 'Produk dilihat', nilai: dataAnalitik.corong.lihatProduk, teks: String(dataAnalitik.corong.lihatProduk) },
        { label: 'Masuk keranjang', nilai: dataAnalitik.corong.tambahKeranjang, teks: `${dataAnalitik.corong.tambahKeranjang}` },
        { label: 'Dibeli', nilai: dataAnalitik.corong.bayar, teks: `${dataAnalitik.corong.bayar} pesanan` },
      ]
    : data.corong;

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="analitik" />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[980px]">
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173b2b]">
                Analitik
              </h1>
              <p className="mt-1 text-sm sm:text-base text-[#3f5247]">
                Seberapa sering produkmu dilihat, dimasukkan keranjang, dan dibeli.
              </p>
            </div>

            {kosong ? (
              <section
                aria-labelledby="judul-kosong"
                className="p-8 sm:p-10 border-[1.5px] border-dashed border-[#c9d2c6] rounded-2xl bg-white text-center flex flex-col items-center gap-2.5"
              >
                <h2 id="judul-kosong" className="text-lg sm:text-xl font-extrabold text-[#173b2b]">
                  Belum ada data
                </h2>
                <p className="max-w-[460px] text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                  Angka muncul setelah produkmu dilihat pembeli. Toko baru biasanya butuh beberapa hari. Foto yang jelas dan harga yang pas mempercepatnya.
                </p>
                <Link
                  href="/toko/produk"
                  className="mt-2 inline-flex items-center min-h-[48px] px-5 rounded-xl bg-[#064e3b] text-white text-sm sm:text-base font-extrabold hover:bg-[#0f5132]"
                >
                  Cek produk saya
                </Link>
              </section>
            ) : (
              <>
                {/* Period Selector Tabs */}
                <div role="group" aria-label="Periode" className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={activePeriod === '7'}
                    onClick={() => setPeriodePilihan('7')}
                    className={`min-h-[42px] px-4 rounded-full text-xs sm:text-sm font-bold border ${
                      activePeriod === '7'
                        ? 'border-[#064e3b] bg-[#064e3b] text-white'
                        : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                    }`}
                  >
                    7 hari terakhir
                  </button>
                  <button
                    type="button"
                    aria-pressed={activePeriod === '30'}
                    onClick={() => setPeriodePilihan('30')}
                    className={`min-h-[42px] px-4 rounded-full text-xs sm:text-sm font-bold border ${
                      activePeriod === '30'
                        ? 'border-[#064e3b] bg-[#064e3b] text-white'
                        : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                    }`}
                  >
                    30 hari terakhir
                  </button>
                </div>

                {/* 4 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {data.kartu.map((k, idx) => (
                    <KartuAngka
                      key={idx}
                      label={k.label}
                      nilai={k.nilai}
                      perubahan={k.ubah}
                      baikJikaNaik={k.baik}
                      periode={banding}
                    />
                  ))}
                </div>

                {/* Funnel Section */}
                <section
                  aria-labelledby="judul-corong"
                  className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2"
                >
                  <h2 id="judul-corong" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Dari dilihat sampai dibeli
                  </h2>
                  <p className="text-xs sm:text-sm text-[#3f5247] leading-relaxed mb-2">
                    Panjang batang = jumlah orang atau pesanan. Persen di bawahnya dihitung dari langkah sebelumnya.
                  </p>
                  <Grafik
                    judul={data.corongJudul}
                    data={corongData}
                    satuan=""
                  />
                  <p className="mt-2 p-3 rounded-xl bg-[#f6f7f2] text-xs sm:text-sm text-[#173b2b] leading-relaxed">
                    {data.saran}
                  </p>
                </section>

                {/* Top Sellers vs Slow Sellers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <section
                    aria-labelledby="judul-laris"
                    className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white"
                  >
                    <h2 id="judul-laris" className="text-base sm:text-lg font-extrabold text-[#173b2b] mb-2.5">
                      Paling laku
                    </h2>
                    <Grafik
                      judul="Terjual (kg), garis hitam/emas = periode sebelumnya"
                      data={larisData}
                      satuan="kg"
                    />
                  </section>

                  <section
                    aria-labelledby="judul-sepi"
                    className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white"
                  >
                    <h2 id="judul-sepi" className="text-base sm:text-lg font-extrabold text-[#173b2b] mb-2.5">
                      Kurang laku
                    </h2>
                    <Grafik
                      judul="Terjual (kg), garis hitam/emas = periode sebelumnya"
                      data={sepiData}
                      satuan="kg"
                    />
                    <Link
                      href="/toko/produk"
                      className="inline-flex items-center min-h-[40px] mt-2 text-xs sm:text-sm font-extrabold text-[#064e3b] hover:underline"
                    >
                      Ubah harga atau stok →
                    </Link>
                  </section>
                </div>
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

export default TokoAnalitik;
