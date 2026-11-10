'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../../layout';
import type { TierGrosirItem } from './TokoHargaGrosir';

export interface BatchAktifDetail {
  tanggalPanen?: string;
  tanggalKedaluwarsa?: string;
  sisaHari?: number;
  masukKg?: number;
  terjualKg?: number;
  dipesanKg?: number;
  susutKg?: number;
  tersediaKg?: number;
  catatanPesanan?: string;
}

export interface MetrikPenjualanProduk {
  label: string;
  kini: string;
  lalu: string;
  ubah: string;
  warnaUbah: string;
  lebarKini: string;
  lebarLalu: string;
}

export interface UlasanProdukItem {
  id: string;
  nama: string;
  bintang: number;
  tanggal: string;
  isi: string;
  balasan?: string;
}


export interface ProdukTokoDetailData {
  id: string;
  nama: string;
  kategori: string;
  deskripsi?: string;
  harga: number;
  satuan: string;
  stokTotal: number;
  batasStokRendah?: number;
  fotoList?: string[];
  minimalBeli?: number;
  maksimalBeli?: number;
  status?: 'aktif' | 'habis' | 'draft' | 'nonaktif' | string;
  tampil?: boolean;
  batchAktif?: BatchAktifDetail;
  analitikSingkat?: {
    dilihat7Hari: number;
    terjual7HariKg: number;
    pendapatan7Hari: number;
  };
  metrik7Hari?: MetrikPenjualanProduk[];
  metrik30Hari?: MetrikPenjualanProduk[];
  ulasan?: UlasanProdukItem[];
  hargaGrosir?: TierGrosirItem[];
  tingkatGrosir?: { minJumlah: number; harga: number }[];
  aturanSurplus?: unknown;
  aturanSurplusTeks?: string;
  jumlahPelanggan?: { total: number; umkm: number; rumahTangga: number };
}

export interface TokoProdukDetailProps {
  produk?: ProdukTokoDetailData;
  className?: string;
}

const DEFAULT_PRODUK: ProdukTokoDetailData = {
  id: 'kol',
  nama: 'Kol Bulat Lembang',
  kategori: 'sayuran',
  deskripsi: 'Kol segar langsung dari kebun Lembang. Padat dan manis.',
  harga: 9000,
  satuan: 'kg',
  stokTotal: 8,
  batasStokRendah: 10,
  tampil: true,
  batchAktif: {
    tanggalPanen: 'Jum, 6 Nov',
    tanggalKedaluwarsa: 'Jum, 13 Nov',
    sisaHari: 5,
    masukKg: 50,
    terjualKg: 16,
    dipesanKg: 24,
    susutKg: 2,
    tersediaKg: 8,
    catatanPesanan: '24 kg dipesan untuk 3 pesanan yang belum dikirim, termasuk PT-26110821 (Warung Dewi). Diskon Surplus mulai Sel, 10 Nov.',
  },
  metrik7Hari: [
    { label: 'Dilihat', kini: '96', lalu: '84', ubah: '+14%', warnaUbah: 'text-[#157a4c]', lebarKini: '80%', lebarLalu: '70%' },
    { label: 'Masuk keranjang', kini: '34 kg', lalu: '28 kg', ubah: '+21%', warnaUbah: 'text-[#157a4c]', lebarKini: '65%', lebarLalu: '54%' },
    { label: 'Terjual', kini: '28 kg', lalu: '22 kg', ubah: '+27%', warnaUbah: 'text-[#157a4c]', lebarKini: '56%', lebarLalu: '44%' },
    { label: 'Pendapatan kotor', kini: 'Rp 246.000', lalu: 'Rp 198.000', ubah: '+24%', warnaUbah: 'text-[#157a4c]', lebarKini: '75%', lebarLalu: '60%' },
  ],
  metrik30Hari: [
    { label: 'Dilihat', kini: '410', lalu: '380', ubah: '+8%', warnaUbah: 'text-[#157a4c]', lebarKini: '85%', lebarLalu: '78%' },
    { label: 'Masuk keranjang', kini: '162 kg', lalu: '150 kg', ubah: '+8%', warnaUbah: 'text-[#157a4c]', lebarKini: '70%', lebarLalu: '65%' },
    { label: 'Terjual', kini: '144 kg', lalu: '136 kg', ubah: '+6%', warnaUbah: 'text-[#157a4c]', lebarKini: '64%', lebarLalu: '60%' },
    { label: 'Pendapatan kotor', kini: 'Rp 1.280.000', lalu: 'Rp 1.190.000', ubah: '+8%', warnaUbah: 'text-[#157a4c]', lebarKini: '80%', lebarLalu: '74%' },
  ],
  ulasan: [
    {
      id: 'u1',
      nama: 'Ibu Ratna (Catering Bandung)',
      bintang: 5,
      tanggal: 'Sen, 2 Nov 2026',
      isi: 'Kolnya padat dan segar banget. Cocok buat pesanan capcay katering. Pengiriman cepat.',
      balasan: 'Terima kasih banyak Ibu Ratna! Panen berikutnya siap hari Jumat ya.',
    },
    {
      id: 'u2',
      nama: 'Warung Bu Joko',
      bintang: 5,
      tanggal: 'Kam, 29 Okt 2026',
      isi: 'Harga grosir 10 kg sangat membantu usaha warung. Kualitas kol bagus tidak ada ulat.',
    },
    {
      id: 'u3',
      nama: 'Budi Hartono',
      bintang: 4,
      tanggal: 'Min, 25 Okt 2026',
      isi: 'Pengiriman agak terlambat sedikit karena hujan, tapi sayurnya tetap segar.',
      balasan: 'Mohon maaf atas keterlambatan kurir karena cuaca buruk kemarin Pak. Kami pastikan packing selalu aman.',
    },
  ],
  hargaGrosir: [
    { minBeliKg: 10, hargaPerKg: 8000 },
    { minBeliKg: 20, hargaPerKg: 7000 },
  ],
  aturanSurplusTeks: '3 hari sebelum batas jual 10%, 2 hari 25%, 1 hari 40%.',
  jumlahPelanggan: { total: 3, umkm: 2, rumahTangga: 1 },
};

export function TokoProdukDetail({
  produk,
  className = '',
}: TokoProdukDetailProps) {
  const p: ProdukTokoDetailData = produk ?? DEFAULT_PRODUK;
  const [periode, setPeriode] = useState<'7' | '30'>('7');
  const [tampil, setTampil] = useState<boolean>(p.tampil ?? true);
  const [pesan, setPesan] = useState('');

  const handleToggle = () => {
    const nextVal = !tampil;
    setTampil(nextVal);
    setPesan(nextVal ? 'Produk kini tampil di toko.' : 'Produk kini disembunyikan dari toko.');
  };

  const isLowStock = p.stokTotal <= (p.batasStokRendah ?? 10);
  const batch = p.batchAktif ?? DEFAULT_PRODUK.batchAktif!;
  const metrik = periode === '30'
    ? p.metrik30Hari ?? DEFAULT_PRODUK.metrik30Hari!
    : p.metrik7Hari ?? DEFAULT_PRODUK.metrik7Hari!;
  const ulasanList = p.ulasan ?? DEFAULT_PRODUK.ulasan!;
  const pelanggan = p.jumlahPelanggan ?? { total: 3, umkm: 2, rumahTangga: 1 };

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="produk" />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1120px]">
          <div className="flex flex-col gap-4">
            <Link
              href="/toko/produk"
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-xs sm:text-sm font-bold text-[#157a4c] hover:underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Produk dan stok
            </Link>

            {/* Product Header */}
            <div className="flex flex-wrap items-center justify-between gap-3.5">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  aria-hidden="true"
                  className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center bg-[#e3f1df] text-[#2f7a3e]"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#173b2b]">
                    {p.nama}
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm">
                    <strong>Rp {p.harga.toLocaleString('id-ID')}</strong> per {p.satuan}, {p.kategori}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#157a4c]">
                    <span className={`w-2 h-2 rounded-full ${tampil ? 'bg-[#157a4c]' : 'bg-[#9aa79e]'}`} />
                    {tampil ? 'Tampil di toko' : 'Disembunyikan dari toko'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/toko/produk/${p.id}/ubah`}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-xs sm:text-sm font-extrabold hover:bg-[#f6f8f4]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                  </svg>
                  Ubah produk
                </Link>

                <button
                  type="button"
                  role="switch"
                  aria-checked={tampil}
                  onClick={handleToggle}
                  className="inline-flex items-center gap-2 min-h-[40px] px-3 rounded-xl border border-[#dee3da] bg-white text-xs sm:text-sm font-bold text-[#173b2b] hover:bg-[#f6f8f4]"
                >
                  <span className={`relative block w-8 h-5 rounded-full ${tampil ? 'bg-[#064e3b]' : 'bg-[#c9d2c6]'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow ${tampil ? 'left-3.5' : 'left-0.5'}`} />
                  </span>
                  Tampil
                </button>
              </div>
            </div>

            {pesan && (
              <p aria-live="polite" className="text-sm font-bold text-[#157a4c]">
                {pesan}
              </p>
            )}

            {/* Low stock alert banner */}
            {isLowStock && (
              <section
                aria-labelledby="judul-perhatian"
                className="p-4 sm:p-4.5 rounded-2xl border-[1.5px] border-[#f3d7c6] bg-[#fffaf6] flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <h2 id="judul-perhatian" className="text-base font-extrabold text-[#9a3412]">
                    Stok {p.stokTotal} {p.satuan}, di bawah batas {p.batasStokRendah ?? 10} {p.satuan}
                  </h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-[#3f5247]">
                    {pelanggan.total} pelanggan dapat kabar otomatis begitu stok baru masuk.
                  </p>
                </div>
                <Link
                  href={`/toko/produk/${p.id}/stok-baru`}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[#064e3b] text-white text-xs sm:text-sm font-extrabold hover:bg-[#0f5132]"
                >
                  + Tambah stok
                </Link>
              </section>
            )}

            {/* Split layout: Batch details & Analytics (Left) + Pricing Aside (Right) */}
            <div className="flex flex-col lg:flex-row items-start gap-4">
              {/* Left Column */}
              <div className="w-full lg:flex-[999_1_480px] min-w-0 flex flex-col gap-4">
                {/* Batch Aktif Breakdown */}
                <section
                  aria-labelledby="judul-batch"
                  className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 id="judul-batch" className="text-base font-extrabold text-[#173b2b]">
                      Batch aktif
                    </h2>
                    <Link
                      href={`/toko/produk/${p.id}/stok`}
                      className="text-xs sm:text-sm font-bold text-[#157a4c] hover:underline"
                    >
                      Semua batch dan riwayat →
                    </Link>
                  </div>

                  <div className="p-3.5 border border-[#eef0eb] rounded-xl flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-1 text-xs sm:text-sm">
                      <p className="font-extrabold text-[#173b2b]">
                        Panen {batch.tanggalPanen ?? 'Jum, 6 Nov'}
                      </p>
                      <p className="font-bold text-[#3f5247]">
                        Layak jual sampai {batch.tanggalKedaluwarsa ?? 'Jum, 13 Nov'} ({batch.sisaHari ?? 5} hari lagi)
                      </p>
                    </div>

                    {/* Segmented Stacked Progress Bar */}
                    <div
                      role="img"
                      aria-label="Rincian stok batch"
                      className="flex h-3.5 rounded-full overflow-hidden bg-[#eef0eb]"
                    >
                      <span style={{ width: '32%' }} className="bg-[#064e3b]" />
                      <span style={{ width: '48%' }} className="bg-[#157a4c] border-l-2 border-white" />
                      <span style={{ width: '4%' }} className="bg-[#9aa79e] border-l-2 border-white" />
                      <span style={{ width: '16%' }} className="bg-[#d5f6d5] border-l-2 border-white" />
                    </div>

                    {/* Legend */}
                    <ul className="list-none m-0 p-0 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <li className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#064e3b]" />
                        <span>Terjual <strong>{batch.terjualKg ?? 16} kg</strong></span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#157a4c]" />
                        <span>Dipesan <strong>{batch.dipesanKg ?? 24} kg</strong></span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#9aa79e]" />
                        <span>Susut <strong>{batch.susutKg ?? 2} kg</strong></span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#d5f6d5] border border-[#a9cfae]" />
                        <span>Tersedia <strong>{batch.tersediaKg ?? 8} kg</strong></span>
                      </li>
                    </ul>

                    {batch.catatanPesanan && (
                      <p className="text-xs text-[#3f5247] leading-relaxed mt-1">
                        {batch.catatanPesanan}
                      </p>
                    )}
                  </div>
                </section>

                {/* Sales Metrics Section */}
                <section
                  aria-labelledby="judul-angka"
                  className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 id="judul-angka" className="text-base font-extrabold text-[#173b2b]">
                      Penjualan {p.nama}
                    </h2>
                    <div role="group" aria-label="Periode" className="flex p-0.5 rounded-xl bg-[#eef0eb]">
                      <button
                        type="button"
                        aria-pressed={periode === '7'}
                        onClick={() => setPeriode('7')}
                        className={`min-h-[34px] px-3 rounded-lg text-xs font-extrabold ${
                          periode === '7' ? 'bg-white text-[#173b2b] shadow-xs' : 'text-[#5a6b60]'
                        }`}
                      >
                        7 hari
                      </button>
                      <button
                        type="button"
                        aria-pressed={periode === '30'}
                        onClick={() => setPeriode('30')}
                        className={`min-h-[34px] px-3 rounded-lg text-xs font-extrabold ${
                          periode === '30' ? 'bg-white text-[#173b2b] shadow-xs' : 'text-[#5a6b60]'
                        }`}
                      >
                        30 hari
                      </button>
                    </div>
                  </div>

                  <dl className="m-0 grid grid-cols-2 gap-4">
                    {metrik.map((m, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <dt className="text-xs font-bold text-[#3f5247]">{m.label}</dt>
                        <dd className="m-0 flex items-baseline gap-2">
                          <strong className="text-lg font-extrabold text-[#173b2b]">{m.kini}</strong>
                          <span className={`text-xs font-bold ${m.warnaUbah}`}>{m.ubah}</span>
                        </dd>
                        <dd className="m-0 flex flex-col gap-1 py-1" aria-hidden="true">
                          <span className="block h-2 rounded-full bg-[#064e3b]" style={{ width: m.lebarKini }} />
                          <span className="block h-2 rounded-full bg-[#c9d2c6]" style={{ width: m.lebarLalu }} />
                        </dd>
                        <dd className="m-0 text-[11px] text-[#5a6b60]">Sebelumnya {m.lalu}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                {/* Reviews Section */}
                <section
                  aria-labelledby="judul-ulasan"
                  className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 id="judul-ulasan" className="text-base font-extrabold text-[#173b2b]">
                      Ulasan <span className="text-xs font-bold text-[#3f5247] ml-1">4,8 dari 5 · {ulasanList.length} ulasan</span>
                    </h2>
                    <Link href="/toko/ulasan" className="text-xs sm:text-sm font-bold text-[#157a4c] hover:underline">
                      Semua ulasan →
                    </Link>
                  </div>

                  <ul className="list-none m-0 p-0 flex flex-col">
                    {ulasanList.map((u, i) => (
                      <li key={u.id} className={`py-3 flex flex-col gap-1 text-xs sm:text-sm ${i > 0 ? 'border-t border-[#eef0eb]' : ''}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="flex text-[#c2a032] font-bold">
                            {'★'.repeat(u.bintang)}
                          </span>
                          <strong className="font-bold text-[#173b2b]">{u.nama}</strong>
                          <span className="text-xs text-[#5a6b60]">{u.tanggal}</span>
                        </div>
                        <p className="text-[#173b2b] leading-relaxed">{u.isi}</p>
                        {u.balasan && (
                          <div className="p-2.5 rounded-lg bg-[#f6f8f4] text-xs text-[#3f5247] leading-relaxed">
                            <strong className="text-[#173b2b]">Balasanmu:</strong> {u.balasan}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Right Column (Aside): Price Tiers, Surplus, and Customers */}
              <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
                {/* Price & Wholesale Card */}
                <section
                  aria-labelledby="judul-harga"
                  className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5"
                >
                  <h2 id="judul-harga" className="text-base font-extrabold text-[#173b2b]">
                    Harga
                  </h2>
                  <ol className="list-none m-0 p-0 flex flex-col gap-1.5 text-xs sm:text-sm">
                    <li className="flex justify-between gap-2">
                      <span>1 {p.satuan} ke atas</span>
                      <strong>Rp {p.harga.toLocaleString('id-ID')}</strong>
                    </li>
                    {p.hargaGrosir?.map((hg, idx) => (
                      <li key={idx} className="flex justify-between gap-2">
                        <span>{hg.minBeliKg ?? hg.min} {p.satuan} ke atas</span>
                        <strong>Rp {(hg.hargaPerKg ?? hg.harga ?? 0).toLocaleString('id-ID')}</strong>
                      </li>
                    ))}
                  </ol>
                  <Link
                    href={`/toko/produk/${p.id}/harga-grosir`}
                    className="self-start text-xs sm:text-sm font-bold text-[#157a4c] hover:underline"
                  >
                    Ubah harga grosir →
                  </Link>

                  <div className="pt-2.5 border-t border-[#eef0eb] flex flex-col gap-1">
                    <p className="text-xs sm:text-sm font-extrabold text-[#9a3412]">
                      Diskon Surplus
                    </p>
                    <p className="text-xs text-[#3f5247] leading-relaxed">
                      {p.aturanSurplusTeks ?? '3 hari sebelum batas jual 10%, 2 hari 25%, 1 hari 40%.'}
                    </p>
                    <Link
                      href={`/toko/produk/${p.id}/surplus`}
                      className="self-start text-xs sm:text-sm font-bold text-[#157a4c] hover:underline"
                    >
                      Ubah Surplus →
                    </Link>
                  </div>
                </section>

                {/* Followers / Customers Card */}
                <section
                  aria-labelledby="judul-pelanggan"
                  className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2"
                >
                  <h2 id="judul-pelanggan" className="text-base font-extrabold text-[#173b2b]">
                    {pelanggan.total} pelanggan
                  </h2>
                  <p className="text-xs text-[#3f5247] leading-relaxed">
                    Mereka dapat kabar otomatis tiap kali stok {p.nama} bertambah.
                  </p>
                  <ul className="list-none m-0 p-0 flex flex-col gap-1.5 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2/3 rounded-full bg-[#064e3b]" />
                      <span>{pelanggan.umkm} usaha (UMKM)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-1/3 rounded-full bg-[#157a4c]" />
                      <span>{pelanggan.rumahTangga} rumah tangga</span>
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="produk" />
      </div>
    </div>
  );
}

export default TokoProdukDetail;
