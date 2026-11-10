'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../../layout';

export type TabProdukToko = 'aktif' | 'habis' | 'nonaktif' | string;

export interface ProdukTokoItem {
  id: string;
  nama: string;
  kategori: 'sayuran' | 'umbi' | 'rempah' | 'buah' | string;
  harga: number;
  satuan: string;
  stokTotal: number;
  stokKritis?: boolean;
  aktif?: boolean;
  adaSurplus?: boolean;
  adaGrosir?: boolean;
  foto?: string;
  tanggalPanenTerakhir?: string;
  jumlahBatch?: number;
  grosirInfo?: string;
  batasStokRendah?: number;
  batchInfo?: string;
  batchUrgen?: boolean;
  jumlahDilihat7Hari?: number;
  tampil?: boolean;
  keterangan?: string;
}

export interface TokoProdukProps {
  produkList?: ProdukTokoItem[];
  kosong?: boolean;
  tabAwal?: TabProdukToko;
  onCari?: (keyword: string) => void;
  onFilterKategori?: (kategori: string) => void;
  onToggleTampil?: (id: string, tampil: boolean) => void;
  className?: string;
}

const DEFAULT_PRODUK_LIST: ProdukTokoItem[] = [
  {
    id: 'tomat',
    nama: 'Tomat Merah Lembang',
    kategori: 'sayuran',
    harga: 14000,
    satuan: 'kg',
    stokTotal: 31,
    grosirInfo: 'Grosir mulai Rp 12.000',
    batchInfo: '1 batch, kedaluwarsa 14 Nov',
    jumlahDilihat7Hari: 120,
    tampil: true,
    aktif: true,
    adaGrosir: true,
  },
  {
    id: 'kol',
    nama: 'Kol Bulat Lembang',
    kategori: 'sayuran',
    harga: 9000,
    satuan: 'kg',
    stokTotal: 8,
    batasStokRendah: 10,
    stokKritis: true,
    grosirInfo: 'Grosir mulai Rp 8.000',
    batchInfo: '1 batch, kedaluwarsa 13 Nov',
    jumlahDilihat7Hari: 96,
    tampil: true,
    aktif: true,
    adaGrosir: true,
    adaSurplus: true,
  },
  {
    id: 'daun',
    nama: 'Bawang Daun Lembang',
    kategori: 'sayuran',
    harga: 16000,
    satuan: 'kg',
    stokTotal: 6,
    batchInfo: 'Kedaluwarsa besok. Belum ada aturan Surplus.',
    batchUrgen: true,
    jumlahDilihat7Hari: 41,
    tampil: true,
    aktif: true,
  },
  {
    id: 'wortel',
    nama: 'Wortel Brastagi Curah',
    kategori: 'umbi',
    harga: 11000,
    satuan: 'kg',
    stokTotal: 0,
    batchInfo: 'Habis sejak Sab, 7 Nov',
    jumlahDilihat7Hari: 78,
    tampil: true,
    aktif: false,
  },
  {
    id: 'cabai',
    nama: 'Cabai Rawit Merah Domba',
    kategori: 'rempah',
    harga: 42000,
    satuan: 'kg',
    stokTotal: 46,
    batchInfo: 'Disembunyikan sementara oleh petani',
    jumlahDilihat7Hari: 14,
    tampil: false,
    aktif: false,
  },
];

export function TokoProduk({
  produkList,
  kosong = false,
  tabAwal = 'aktif',
  onCari,
  onToggleTampil,
  className = '',
}: TokoProdukProps) {
  const [tab, setTab] = useState<TabProdukToko>(tabAwal);
  const [keyword, setKeyword] = useState('');
  const [tampilMap, setTampilMap] = useState<Record<string, boolean>>({});
  const [pesanAksi, setPesanAksi] = useState('');

  const rawDaftar = produkList ?? DEFAULT_PRODUK_LIST;
  const isAllEmpty = kosong || rawDaftar.length === 0;

  const countAktif = rawDaftar.filter((p) => p.stokTotal > 0 && (tampilMap[p.id] ?? p.tampil ?? true)).length;
  const countHabis = rawDaftar.filter((p) => p.stokTotal === 0).length;
  const countNonaktif = rawDaftar.filter((p) => (tampilMap[p.id] !== undefined ? !tampilMap[p.id] : p.tampil === false)).length;

  const handleToggle = (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setTampilMap((prev) => ({ ...prev, [id]: newVal }));
    const p = rawDaftar.find((item) => item.id === id);
    const nama = p?.nama ?? 'Produk';
    setPesanAksi(newVal ? `${nama} kini ditampilkan di toko.` : `${nama} kini disembunyikan dari toko.`);

    if (onToggleTampil) {
      onToggleTampil(id, newVal);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    if (onCari) {
      onCari(e.target.value);
    }
  };

  // Filter based on active tab and keyword
  const filtered = rawDaftar.filter((p) => {
    const isTampil = tampilMap[p.id] !== undefined ? tampilMap[p.id] : (p.tampil ?? true);

    if (tab === 'aktif') {
      if (p.stokTotal === 0 || !isTampil) return false;
    } else if (tab === 'habis') {
      if (p.stokTotal > 0) return false;
    } else if (tab === 'nonaktif') {
      if (isTampil) return false;
    }

    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      return p.nama.toLowerCase().includes(q) || p.kategori.toLowerCase().includes(q);
    }

    return true;
  });

  const getKategoriColor = (kat: string) => {
    switch (kat) {
      case 'sayuran':
        return { bg: 'bg-[#e3f1df]', text: 'text-[#2f7a3e]' };
      case 'umbi':
        return { bg: 'bg-[#f3e4da]', text: 'text-[#9a3412]' };
      case 'rempah':
        return { bg: 'bg-[#fbe3df]', text: 'text-[#b42318]' };
      case 'buah':
        return { bg: 'bg-[#fde8ec]', text: 'text-[#9f1239]' };
      default:
        return { bg: 'bg-[#ebf2eb]', text: 'text-[#157a4c]' };
    }
  };

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="produk" />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1120px]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173b2b]">
                Produk dan stok
              </h1>
              <Link
                href="/toko/produk/baru"
                className="inline-flex items-center gap-2 min-h-[46px] px-4 sm:px-5 rounded-xl bg-[#064e3b] text-white text-sm sm:text-base font-extrabold hover:bg-[#0f5132]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Tambah produk
              </Link>
            </div>

            {isAllEmpty ? (
              <div className="p-10 border border-[#dee3da] rounded-2xl bg-white flex flex-col items-center gap-3 text-center">
                <span
                  aria-hidden="true"
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-[#ebf2eb] text-[#157a4c]"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 20h10" />
                    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                  </svg>
                </span>
                <h2 className="text-xl font-extrabold text-[#173b2b]">Belum ada produk</h2>
                <p className="max-w-[380px] text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                  Tambahkan hasil panen pertamamu. Foto stok asli dan tanggal panen membuat pembeli lebih percaya.
                </p>
                <Link
                  href="/toko/produk/baru"
                  className="mt-1 inline-flex items-center min-h-[46px] px-5 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold hover:bg-[#0f5132]"
                >
                  Tambah produk pertama
                </Link>
              </div>
            ) : (
              <>
                {/* Search & Tabs */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 min-w-[240px]">
                    <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-[#5a6b60]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                      type="search"
                      placeholder="Cari produk"
                      value={keyword}
                      onChange={handleSearchChange}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#7d877e] bg-white text-sm text-[#173b2b] placeholder:text-[#5a6b60]"
                    />
                  </div>

                  <div role="group" aria-label="Saring produk" className="flex gap-2 overflow-x-auto pb-0.5">
                    <button
                      type="button"
                      aria-pressed={tab === 'aktif'}
                      onClick={() => setTab('aktif')}
                      className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full text-xs sm:text-sm font-bold border ${
                        tab === 'aktif'
                          ? 'border-[#064e3b] bg-[#064e3b] text-white'
                          : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                      }`}
                    >
                      Aktif
                      <span className={`px-1.5 py-0.2 rounded-full text-xs font-extrabold ${tab === 'aktif' ? 'bg-white text-[#064e3b]' : 'bg-[#ebf2eb] text-[#173b2b]'}`}>
                        {countAktif}
                      </span>
                    </button>

                    <button
                      type="button"
                      aria-pressed={tab === 'habis'}
                      onClick={() => setTab('habis')}
                      className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full text-xs sm:text-sm font-bold border ${
                        tab === 'habis'
                          ? 'border-[#064e3b] bg-[#064e3b] text-white'
                          : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                      }`}
                    >
                      Habis
                      <span className={`px-1.5 py-0.2 rounded-full text-xs font-extrabold ${tab === 'habis' ? 'bg-white text-[#064e3b]' : 'bg-[#ebf2eb] text-[#173b2b]'}`}>
                        {countHabis}
                      </span>
                    </button>

                    <button
                      type="button"
                      aria-pressed={tab === 'nonaktif'}
                      onClick={() => setTab('nonaktif')}
                      className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full text-xs sm:text-sm font-bold border ${
                        tab === 'nonaktif'
                          ? 'border-[#064e3b] bg-[#064e3b] text-white'
                          : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                      }`}
                    >
                      Disembunyikan
                      <span className={`px-1.5 py-0.2 rounded-full text-xs font-extrabold ${tab === 'nonaktif' ? 'bg-white text-[#064e3b]' : 'bg-[#ebf2eb] text-[#173b2b]'}`}>
                        {countNonaktif}
                      </span>
                    </button>
                  </div>
                </div>

                {pesanAksi && (
                  <p aria-live="polite" className="text-sm font-bold text-[#157a4c]">
                    {pesanAksi}
                  </p>
                )}

                {/* Mobile: Card View */}
                <div className="lg:hidden flex flex-col gap-3">
                  {filtered.map((p) => {
                    const isTampil: boolean = (tampilMap[p.id] ?? p.tampil) ?? true;
                    const colors = getKategoriColor(p.kategori);
                    const isStokRendah = p.stokTotal > 0 && (p.stokKritis || (p.batasStokRendah && p.stokTotal <= p.batasStokRendah));

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-2xl border bg-white flex flex-col gap-3 ${
                          isStokRendah ? 'border-[#f3d7c6]' : 'border-[#dee3da]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                            </svg>
                          </span>
                          <div className="flex-1 min-w-0">
                            <Link href={`/toko/produk/${p.id}`} className="font-extrabold text-base text-[#173b2b] hover:underline">
                              {p.nama}
                            </Link>
                            <p className="text-xs sm:text-sm mt-0.5">
                              <strong>Rp {p.harga.toLocaleString('id-ID')}</strong>/{p.satuan}{' '}
                              {p.grosirInfo && (
                                <span className="text-xs font-bold text-[#157a4c] ml-1">
                                  {p.grosirInfo}
                                </span>
                              )}
                            </p>
                            <p className={`text-xs font-extrabold mt-1 ${isStokRendah ? 'text-[#92400e]' : p.stokTotal === 0 ? 'text-[#b42318]' : 'text-[#173b2b]'}`}>
                              {p.stokTotal === 0 ? 'Stok habis' : `Tersedia ${p.stokTotal} ${p.satuan}`}
                            </p>
                            {p.batchInfo && (
                              <p className={`text-xs mt-0.5 ${p.batchUrgen ? 'text-[#b42318] font-bold' : 'text-[#3f5247]'}`}>
                                {p.batchInfo}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-[#f0f2ed]">
                          <Link
                            href={`/toko/produk/${p.id}/stok-baru`}
                            className="flex-1 inline-flex items-center justify-center min-h-[40px] px-3 rounded-xl bg-[#ebf2eb] border border-[#064e3b] text-[#064e3b] text-xs font-extrabold hover:bg-[#d8e6d8]"
                          >
                            + Tambah stok
                          </Link>
                          <Link
                            href={`/toko/produk/${p.id}/ubah`}
                            className="inline-flex items-center justify-center min-h-[40px] px-3.5 rounded-xl border border-[#dee3da] text-xs font-bold text-[#173b2b] hover:bg-[#f6f8f4]"
                          >
                            Ubah
                          </Link>
                          {/* Visibility Toggle Switch */}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isTampil}
                            aria-label={`Tampilkan ${p.nama} di toko`}
                            onClick={() => handleToggle(p.id, isTampil)}
                            className="shrink-0 w-12 h-10 flex items-center justify-center bg-transparent cursor-pointer"
                          >
                            <span
                              className={`relative block w-10 h-6 rounded-full ${
                                isTampil ? 'bg-[#064e3b]' : 'bg-[#c9d2c6]'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow ${
                                  isTampil ? 'left-4.5' : 'left-0.5'
                                }`}
                              />
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="p-6 text-center border border-dashed border-[#dee3da] rounded-2xl bg-white text-sm text-[#3f5247]">
                      Tidak ada produk yang cocok dengan saringan.
                    </p>
                  )}
                </div>

                {/* Desktop: Table View */}
                <div className="hidden lg:block overflow-x-auto border border-[#dee3da] rounded-2xl bg-white">
                  <div role="table" aria-label="Daftar produk" className="min-w-[900px]">
                    <div
                      role="row"
                      className="grid grid-cols-[2.1fr_1fr_1.6fr_96px_92px_220px] items-center gap-3.5 px-4 py-3 border-b border-[#dee3da] bg-[#fcfbf6] text-xs font-extrabold text-[#3f5247]"
                    >
                      <div role="columnheader">Produk</div>
                      <div role="columnheader">Stok</div>
                      <div role="columnheader">Batch</div>
                      <div role="columnheader">Dilihat 7 hari</div>
                      <div role="columnheader">Tampil</div>
                      <div role="columnheader" className="text-right">Aksi</div>
                    </div>

                    {filtered.map((p, idx) => {
                      const isTampil: boolean = (tampilMap[p.id] ?? p.tampil) ?? true;
                      const colors = getKategoriColor(p.kategori);
                      const isStokRendah = p.stokTotal > 0 && (p.stokKritis || (p.batasStokRendah && p.stokTotal <= p.batasStokRendah));

                      return (
                        <div
                          key={p.id}
                          role="row"
                          className={`grid grid-cols-[2.1fr_1fr_1.6fr_96px_92px_220px] items-center gap-3.5 px-4 py-3 text-sm border-t ${
                            idx === 0 ? 'border-transparent' : 'border-[#eef0eb]'
                          }`}
                        >
                          <div role="cell" className="flex items-center gap-3 min-w-0">
                            <span
                              aria-hidden="true"
                              className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 12" />
                              </svg>
                            </span>
                            <div className="min-w-0">
                              <Link href={`/toko/produk/${p.id}`} className="font-extrabold text-[#173b2b] hover:underline block truncate">
                                {p.nama}
                              </Link>
                              <span className="text-xs text-[#3f5247]">
                                Rp {p.harga.toLocaleString('id-ID')}/{p.satuan}
                              </span>
                              {p.grosirInfo && (
                                <span className="text-xs font-bold text-[#157a4c] ml-1.5">
                                  {p.grosirInfo}
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            role="cell"
                            className={`font-extrabold ${
                              isStokRendah ? 'text-[#92400e]' : p.stokTotal === 0 ? 'text-[#b42318]' : 'text-[#173b2b]'
                            }`}
                          >
                            {p.stokTotal === 0 ? 'Stok habis' : `${p.stokTotal} ${p.satuan}`}
                          </div>

                          <div role="cell" className={`text-xs ${p.batchUrgen ? 'text-[#b42318] font-bold' : 'text-[#3f5247]'}`}>
                            {p.batchInfo ?? '-'}
                          </div>

                          <div role="cell" className="font-bold text-[#173b2b]">
                            {p.jumlahDilihat7Hari ?? 0}
                          </div>

                          <div role="cell">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isTampil}
                              aria-label={`Tampilkan ${p.nama} di toko`}
                              onClick={() => handleToggle(p.id, isTampil)}
                              className="w-12 h-10 flex items-center justify-center bg-transparent cursor-pointer"
                            >
                              <span
                                className={`relative block w-10 h-6 rounded-full ${
                                  isTampil ? 'bg-[#064e3b]' : 'bg-[#c9d2c6]'
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow ${
                                    isTampil ? 'left-4.5' : 'left-0.5'
                                  }`}
                                />
                              </span>
                            </button>
                          </div>

                          <div role="cell" className="flex justify-end gap-2">
                            <Link
                              href={`/toko/produk/${p.id}/stok-baru`}
                              className="inline-flex items-center min-h-[36px] px-3 rounded-lg border border-[#064e3b] bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold hover:bg-[#d8e6d8]"
                            >
                              Tambah stok
                            </Link>
                            <Link
                              href={`/toko/produk/${p.id}/ubah`}
                              className="inline-flex items-center min-h-[36px] px-3 rounded-lg border border-[#dee3da] text-xs font-bold text-[#173b2b] hover:bg-[#f6f8f4]"
                            >
                              Ubah
                            </Link>
                          </div>
                        </div>
                      );
                    })}

                    {filtered.length === 0 && (
                      <div className="p-8 text-center text-sm text-[#3f5247]">
                        Tidak ada produk yang cocok dengan saringan.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <div className="lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="produk" />
      </div>
    </div>
  );
}

export default TokoProduk;
