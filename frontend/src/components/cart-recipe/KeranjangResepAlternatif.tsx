'use client';

import React, { useState } from 'react';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';

export interface OpsiAlternatif {
  id: string;
  nama: string;
  toko: string;
  harga: number;
  stok?: number;
  selisihHarga?: number;
}
export type ItemAlternatif = OpsiAlternatif;

export interface BahanUtama {
  id: string;
  nama: string;
  toko: string;
  harga: number;
  ket?: string;
  habis?: boolean;
  surplus?: boolean;
}
export type ProdukUtamaResep = BahanUtama;

export interface BahanAlternatifItem {
  id: string;
  bahanId?: string;
  namaBahan?: string;
  tabLabel?: string;
  utama: BahanUtama;
  alternatif: OpsiAlternatif[];
  saranList?: OpsiAlternatif[];
  urutanAktif?: string[];
}
export type BahanAlternatifTab = BahanAlternatifItem;

export interface KeranjangResepAlternatifProps {
  alternatifList?: BahanAlternatifItem[];
  bahanAktif?: string;
  bahanAktifId?: string;
  onSimpanUrutan?: (bahanId: string, urutanBaru: string[]) => void;
  onUbahUrutan?: (bahanId: string, itemIds: string[]) => void;
  onTambahAlternatif?: (bahanId: string, itemId: string) => void;
  onHapusAlternatif?: (bahanId: string, itemId: string) => void;
  onPilihBahanTab?: (id: string) => void;
  onSelesai?: () => void;
  onTutup?: () => void;
  hrefIsi?: string;
  namaResep?: string;
  className?: string;
}

export function formatRupiah(n: number): string {
  const nb = '\u00a0';
  return 'Rp' + nb + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const defaultBahanAlternatifList: BahanAlternatifItem[] = [
  {
    id: 'daun',
    bahanId: 'daun',
    namaBahan: 'Bawang daun',
    tabLabel: 'Bawang daun',
    utama: {
      id: 'daun-utama',
      nama: 'Bawang Daun Cikajang',
      toko: 'Tani Cikajang',
      harga: 16000,
      ket: 'Stok habis',
      habis: true,
    },
    alternatif: [
      {
        id: 'pangalengan',
        nama: 'Bawang Daun Pangalengan',
        toko: 'Tani Pangalengan',
        harga: 17000,
        stok: 25,
      },
      {
        id: 'lembang',
        nama: 'Daun Bawang Lembang',
        toko: 'Kebun Mang Ujang',
        harga: 15500,
        stok: 40,
      },
    ],
    saranList: [
      {
        id: 'garut',
        nama: 'Bawang Daun Garut',
        toko: 'Tani Samarang',
        harga: 16500,
        stok: 12,
      },
    ],
  },
  {
    id: 'jamur',
    bahanId: 'jamur',
    namaBahan: 'Jamur tiram',
    tabLabel: 'Jamur tiram',
    utama: {
      id: 'jamur-utama',
      nama: 'Jamur Tiram Putih',
      toko: 'Kumbung Jamur Ciremai',
      harga: 15400,
      ket: 'Stok tinggal 4 kg, harga Surplus',
      surplus: true,
    },
    alternatif: [
      {
        id: 'kancing',
        nama: 'Jamur Kancing Putih',
        toko: 'Kumbung Jamur Ciremai',
        harga: 24000,
        stok: 9,
      },
      {
        id: 'merang',
        nama: 'Jamur Merang',
        toko: 'Jamur Subang Makmur',
        harga: 28000,
        stok: 6,
      },
    ],
    saranList: [
      {
        id: 'kuping',
        nama: 'Jamur Kuping',
        toko: 'Kumbung Jamur Ciremai',
        harga: 32000,
        stok: 3,
      },
    ],
  },
  {
    id: 'cabai',
    bahanId: 'cabai',
    namaBahan: 'Cabai merah',
    tabLabel: 'Cabai merah',
    utama: {
      id: 'cabai-utama',
      nama: 'Cabai Merah Keriting',
      toko: 'Tani Cikajang',
      harga: 42000,
      ket: 'Stok 60 kg',
    },
    alternatif: [
      {
        id: 'besar',
        nama: 'Cabai Merah Besar',
        toko: 'Tani Cikajang',
        harga: 38000,
        stok: 30,
      },
    ],
    saranList: [
      {
        id: 'cabai-lembang',
        nama: 'Cabai Merah Keriting Lembang',
        toko: 'Kebun Mang Ujang',
        harga: 44000,
        stok: 15,
      },
    ],
  },
  {
    id: 'tomat',
    bahanId: 'tomat',
    namaBahan: 'Tomat',
    tabLabel: 'Tomat',
    utama: {
      id: 'tomat-utama',
      nama: 'Tomat Merah Lembang',
      toko: 'Kebun Mang Ujang',
      harga: 14000,
      ket: 'Stok 120 kg',
    },
    alternatif: [],
    saranList: [
      {
        id: 'ranti',
        nama: 'Tomat Ranti',
        toko: 'Kebun Mang Ujang',
        harga: 20000,
        stok: 12,
      },
      {
        id: 'hijau',
        nama: 'Tomat Hijau',
        toko: 'Kebun Mang Ujang',
        harga: 9000,
        stok: 40,
      },
    ],
  },
];

export function KeranjangResepAlternatif({
  alternatifList = defaultBahanAlternatifList,
  bahanAktif: bahanAktifProp,
  bahanAktifId,
  onSimpanUrutan,
  onUbahUrutan,
  onTambahAlternatif,
  onHapusAlternatif,
  onPilihBahanTab,
  onSelesai,
  onTutup,
  hrefIsi = '/keranjang-resep/1',
  namaResep = 'Nasi Goreng Kampung',
  className = '',
}: KeranjangResepAlternatifProps) {
  const initialBahanId = bahanAktifProp ?? bahanAktifId ?? alternatifList[0]?.id ?? 'daun';
  const [tabAktifId, setTabAktifId] = useState<string>(initialBahanId);

  // Maintain local state for reordering and deletion per bahan
  const [dataPerBahan, setDataPerBahan] = useState<Record<string, {
    alternatif: OpsiAlternatif[];
    saranList: OpsiAlternatif[];
  }>>(() => {
    const init: Record<string, { alternatif: OpsiAlternatif[]; saranList: OpsiAlternatif[] }> = {};
    for (const b of alternatifList) {
      init[b.id] = {
        alternatif: [...b.alternatif],
        saranList: b.saranList ? [...b.saranList] : [],
      };
    }
    return init;
  });

  const [pesan, setPesan] = useState<string>('');
  const [undo, setUndo] = useState<{ bahanId: string; item: OpsiAlternatif; idx: number } | null>(null);
  const [seretIdx, setSeretIdx] = useState<number | null>(null);

  const bahanSekarang =
    alternatifList.find((b) => b.id === tabAktifId) ?? alternatifList[0] ?? defaultBahanAlternatifList[0]!;

  const stateBahan = dataPerBahan[bahanSekarang.id] ?? {
    alternatif: bahanSekarang.alternatif,
    saranList: bahanSekarang.saranList ?? [],
  };

  const daftarAlternatif = stateBahan.alternatif;
  const daftarSaran = stateBahan.saranList;
  const isPenuh = daftarAlternatif.length >= 3;

  const handlePilihTab = (id: string) => {
    setTabAktifId(id);
    setPesan('');
    setUndo(null);
    onPilihBahanTab?.(id);
  };

  const pindahUrutan = (dari: number, ke: number) => {
    const list = [...daftarAlternatif];
    const itemDipindah = list[dari];
    if (!itemDipindah) return;
    list.splice(dari, 1);
    list.splice(ke, 0, itemDipindah);

    setDataPerBahan((prev) => ({
      ...prev,
      [bahanSekarang.id]: {
        ...prev[bahanSekarang.id]!,
        alternatif: list,
      },
    }));

    setPesan(`${itemDipindah.nama} dipindah ke urutan ${ke + 1} dari ${list.length}.`);
    setSeretIdx(null);

    const ids = list.map((x) => x.id);
    onSimpanUrutan?.(bahanSekarang.id, ids);
    onUbahUrutan?.(bahanSekarang.id, ids);
  };

  const handleHapus = (idx: number) => {
    const itemDihapus = daftarAlternatif[idx];
    if (!itemDihapus) return;
    const list = [...daftarAlternatif];
    list.splice(idx, 1);

    setDataPerBahan((prev) => ({
      ...prev,
      [bahanSekarang.id]: {
        alternatif: list,
        saranList: [itemDihapus, ...(prev[bahanSekarang.id]?.saranList ?? [])],
      },
    }));

    setUndo({ bahanId: bahanSekarang.id, item: itemDihapus, idx });
    setPesan(`${itemDihapus.nama} dihapus dari alternatif.`);

    const ids = list.map((x) => x.id);
    onHapusAlternatif?.(bahanSekarang.id, itemDihapus.id);
    onSimpanUrutan?.(bahanSekarang.id, ids);
    onUbahUrutan?.(bahanSekarang.id, ids);
  };

  const handleUrungkan = () => {
    if (!undo || undo.bahanId !== bahanSekarang.id) return;
    const list = [...daftarAlternatif];
    const targetIdx = Math.min(undo.idx, list.length);
    list.splice(targetIdx, 0, undo.item);

    const saranFiltered = daftarSaran.filter((s) => s.id !== undo.item.id);

    setDataPerBahan((prev) => ({
      ...prev,
      [bahanSekarang.id]: {
        alternatif: list,
        saranList: saranFiltered,
      },
    }));

    setPesan(`${undo.item.nama} dikembalikan.`);
    setUndo(null);

    const ids = list.map((x) => x.id);
    onSimpanUrutan?.(bahanSekarang.id, ids);
    onUbahUrutan?.(bahanSekarang.id, ids);
  };

  const handleTambahSaran = (itemSaran: OpsiAlternatif) => {
    if (isPenuh) return;
    const listBaru = [...daftarAlternatif, itemSaran];
    const saranFiltered = daftarSaran.filter((s) => s.id !== itemSaran.id);

    setDataPerBahan((prev) => ({
      ...prev,
      [bahanSekarang.id]: {
        alternatif: listBaru,
        saranList: saranFiltered,
      },
    }));

    setPesan(`${itemSaran.nama} ditambahkan di urutan ${listBaru.length}.`);
    onTambahAlternatif?.(bahanSekarang.id, itemSaran.id);

    const ids = listBaru.map((x) => x.id);
    onSimpanUrutan?.(bahanSekarang.id, ids);
    onUbahUrutan?.(bahanSekarang.id, ids);
  };

  const hitungSelisih = (hargaAlternatif: number) => {
    const selisih = hargaAlternatif - bahanSekarang.utama.harga;
    if (selisih > 0) {
      return { teks: `+${formatRupiah(selisih)}/kg lebih mahal`, warna: 'text-[#92400e]' };
    }
    if (selisih < 0) {
      return { teks: `${formatRupiah(-selisih)}/kg lebih murah`, warna: 'text-[#157a4c]' };
    }
    return { teks: 'Harga sama', warna: 'text-[#3f5247]' };
  };

  const hitungStok = (stok?: number) => {
    if (stok === undefined) return { teks: '', warna: 'text-[#3f5247]' };
    if (stok <= 10) {
      return { teks: `Stok tinggal ${stok} kg`, warna: 'text-[#92400e]' };
    }
    return { teks: `Stok ${stok} kg`, warna: 'text-[#157a4c]' };
  };

  return (
    <div
      className={`relative min-h-screen bg-[#fcfbf6] font-sans text-[#173b2b] ${className}`}
    >
      <SiteHeader cartCount={5} />

      <main className="max-w-[1200px] mx-auto px-4 py-3 md:px-6 md:pt-5 md:pb-16 box-border">
        <div className="max-w-[760px] mx-auto flex flex-col gap-4">
          <a
            href={hrefIsi}
            onClick={(e) => {
              if (onSelesai || onTutup) {
                e.preventDefault();
                (onSelesai ?? onTutup)?.();
              }
            }}
            className="self-start inline-flex items-center gap-1 min-h-11 text-[#157a4c] text-sm font-bold no-underline hover:underline"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            {namaResep}
          </a>

          <div>
            <h1 className="m-0 text-[28px] md:text-[34px] leading-tight font-extrabold tracking-tight">
              Alternatif bahan
            </h1>
            <p className="mt-1.5 mb-0 text-[15px] leading-relaxed text-[#3f5247]">
              Atur urutan. Alternatif teratas dipakai lebih dulu kalau bahan utama kosong atau kurang.
            </p>
          </div>

          {/* Horizontal Tabs */}
          <div
            role="group"
            aria-label="Pilih bahan"
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {alternatifList.map((tab) => {
              const isAktif = tab.id === tabAktifId;
              const count = (dataPerBahan[tab.id]?.alternatif ?? tab.alternatif).length;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isAktif}
                  onClick={() => handlePilihTab(tab.id)}
                  className={`shrink-0 min-h-11 px-3.5 border rounded-full font-sans text-sm font-bold cursor-pointer ${
                    isAktif
                      ? 'border-[#064e3b] bg-[#064e3b] text-white'
                      : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                  }`}
                >
                  {tab.tabLabel ?? tab.namaBahan} ({count})
                </button>
              );
            })}
          </div>

          {/* Primary Product Card */}
          <section
            aria-labelledby="judul-utama"
            className="p-3.5 md:p-4 border border-[#dee3da] rounded-2xl bg-white"
          >
            <h2 id="judul-utama" className="mt-0 mb-1.5 text-[13px] font-extrabold text-[#157a4c]">
              Produk utama
            </h2>
            <div className="flex flex-wrap items-baseline justify-between gap-1 gap-x-3">
              <p className="m-0 text-base font-extrabold">{bahanSekarang.utama.nama}</p>
              <p
                className={`m-0 text-base font-extrabold ${
                  bahanSekarang.utama.surplus ? 'text-[#c2410c]' : 'text-[#173b2b]'
                }`}
              >
                {formatRupiah(bahanSekarang.utama.harga)}
                <span className="text-xs font-medium text-[#5a6b60]">/kg</span>
              </p>
            </div>
            <p className="mt-0.5 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
              {bahanSekarang.utama.toko} ·{' '}
              <span
                className={`font-bold ${
                  bahanSekarang.utama.habis ? 'text-[#8a1c12]' : 'text-[#157a4c]'
                }`}
              >
                {bahanSekarang.utama.ket}
              </span>
            </p>
          </section>

          {/* Alternatives Priority Section */}
          <section aria-labelledby="judul-urutan" className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="judul-urutan" className="m-0 text-[17px] font-extrabold">
                Urutan alternatif{' '}
                <span className="font-semibold text-[#5a6b60]">
                  ({daftarAlternatif.length} dari 3)
                </span>
              </h2>
              <span className="text-xs text-[#5a6b60]">Tersimpan otomatis</span>
            </div>
            <p className="m-0 text-[13px] leading-relaxed text-[#3f5247]">
              Seret baris lewat gagang di kanan, atau pakai tombol Naikkan dan Turunkan. Keduanya sama
              hasilnya.
            </p>

            {daftarAlternatif.length === 0 && (
              <div className="p-4.5 border-1.5 border-dashed border-[#a9cfae] rounded-2xl bg-white flex flex-col gap-1.5">
                <p className="m-0 text-base font-extrabold">Belum ada alternatif</p>
                <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
                  Kalau {bahanSekarang.utama.nama} kosong, bahan ini dilewati saat checkout. Tambah
                  satu alternatif dari saran di bawah.
                </p>
              </div>
            )}

            <ol className="list-none m-0 p-0 flex flex-col gap-2.5">
              {daftarAlternatif.map((altItem, idx) => {
                const diAtas = idx === 0;
                const diBawah = idx === daftarAlternatif.length - 1;
                const stokInfo = hitungStok(altItem.stok);
                const selisihInfo = hitungSelisih(altItem.harga);
                const isSedangDiseret = seretIdx === idx;

                return (
                  <li
                    key={altItem.id}
                    draggable
                    onDragStart={(e) => {
                      try {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(idx));
                      } catch {
                        // ignore
                      }
                      setSeretIdx(idx);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (seretIdx !== null && seretIdx !== idx) {
                        pindahUrutan(seretIdx, idx);
                      }
                      setSeretIdx(null);
                    }}
                    onDragEnd={() => setSeretIdx(null)}
                    className={`p-3 md:p-3.5 border border-[#dee3da] rounded-xl bg-white flex flex-col gap-2 ${
                      isSedangDiseret ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-7 h-7 rounded-full grid place-items-center bg-[#064e3b] text-white text-[13px] font-extrabold"
                      >
                        {idx + 1}
                      </span>
                      <div className="grow min-w-0">
                        <p className="m-0 text-[15px] font-extrabold">
                          <span className="sr-only">Urutan {idx + 1}: </span>
                          {altItem.nama}
                        </p>
                        <p className="mt-0.5 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
                          {altItem.toko} ·{' '}
                          <span className={`font-bold ${stokInfo.warna}`}>{stokInfo.teks}</span>
                        </p>
                        <p className="mt-0.5 mb-0 text-sm font-extrabold">
                          {formatRupiah(altItem.harga)}
                          <span className="text-xs font-medium text-[#5a6b60]">/kg</span>{' '}
                          <span className={`text-xs font-bold ${selisihInfo.warna}`}>
                            {selisihInfo.teks}
                          </span>
                        </p>
                      </div>

                      {/* 6-dot drag handle */}
                      <span
                        aria-hidden="true"
                        title="Seret untuk mengubah urutan"
                        className="shrink-0 w-7 h-11 grid place-items-center text-[#7d877e] cursor-grab"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="9" cy="12" r="1" />
                          <circle cx="9" cy="5" r="1" />
                          <circle cx="9" cy="19" r="1" />
                          <circle cx="15" cy="12" r="1" />
                          <circle cx="15" cy="5" r="1" />
                          <circle cx="15" cy="19" r="1" />
                        </svg>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#eef0eb]">
                      <button
                        type="button"
                        onClick={() => pindahUrutan(idx, idx - 1)}
                        disabled={diAtas}
                        aria-label={`Naikkan ${altItem.nama} ke urutan ${idx}`}
                        className={`inline-flex items-center gap-1.5 min-h-11 px-3.5 border border-[#c9d2c6] rounded-xl bg-white font-sans text-sm font-bold cursor-pointer disabled:cursor-not-allowed ${
                          diAtas ? 'text-[#9aa79e]' : 'text-[#064e3b] hover:bg-[#f6f8f4]'
                        }`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                        Naikkan
                      </button>

                      <button
                        type="button"
                        onClick={() => pindahUrutan(idx, idx + 1)}
                        disabled={diBawah}
                        aria-label={`Turunkan ${altItem.nama} ke urutan ${idx + 2}`}
                        className={`inline-flex items-center gap-1.5 min-h-11 px-3.5 border border-[#c9d2c6] rounded-xl bg-white font-sans text-sm font-bold cursor-pointer disabled:cursor-not-allowed ${
                          diBawah ? 'text-[#9aa79e]' : 'text-[#064e3b] hover:bg-[#f6f8f4]'
                        }`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                        Turunkan
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHapus(idx)}
                        aria-label={`Hapus ${altItem.nama} dari alternatif`}
                        className="inline-flex items-center gap-1.5 min-h-11 px-3.5 border-0 rounded-xl bg-transparent text-[#8a1c12] font-sans text-sm font-bold cursor-pointer ml-auto hover:bg-[#fee4e2]"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>

            {pesan && (
              <p
                role="status"
                aria-live="polite"
                className="m-0 min-h-5 text-[13px] font-bold text-[#157a4c]"
              >
                {pesan}
              </p>
            )}

            {undo && undo.bahanId === bahanSekarang.id && (
              <div
                role="status"
                className="flex items-center justify-between gap-2 py-1 px-3.5 rounded-xl bg-[#173b2b] text-white text-sm"
              >
                <span>{undo.item.nama} dihapus.</span>
                <button
                  type="button"
                  onClick={handleUrungkan}
                  className="min-h-11 px-3 border-0 rounded-lg bg-transparent text-[#e9c75c] font-sans text-sm font-extrabold cursor-pointer hover:underline"
                >
                  Urungkan
                </button>
              </div>
            )}
          </section>

          {/* Suggestions Section */}
          <section
            aria-labelledby="judul-saran"
            className="p-3.5 md:p-4 border border-[#dee3da] rounded-2xl bg-white"
          >
            <h2 id="judul-saran" className="mt-0 mb-1 text-[15px] font-extrabold">
              Saran produk serupa
            </h2>

            {isPenuh && (
              <p className="mt-0 mb-2 text-[13px] leading-relaxed text-[#92400e] font-semibold">
                Sudah 3 alternatif, batas maksimal. Hapus satu kalau mau menambah yang lain.
              </p>
            )}

            {!isPenuh && daftarSaran.length === 0 && (
              <p className="mt-0 mb-2 text-[13px] leading-relaxed text-[#3f5247]">
                Tidak ada saran lain untuk bahan ini.
              </p>
            )}

            <ul className="list-none m-0 p-0 flex flex-col">
              {daftarSaran.map((sr) => (
                <li
                  key={sr.id}
                  className="flex items-center gap-2.5 py-2.5 border-t border-[#eef0eb]"
                >
                  <div className="grow min-w-0 text-[13px] leading-snug text-[#3f5247]">
                    <strong className="block text-sm text-[#173b2b]">{sr.nama}</strong>
                    {sr.toko} · {formatRupiah(sr.harga)}/kg · stok {sr.stok ?? 0} kg
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTambahSaran(sr)}
                    disabled={isPenuh}
                    className={`shrink-0 min-h-11 px-4 border-1.5 rounded-xl bg-white font-sans text-sm font-extrabold cursor-pointer disabled:cursor-not-allowed ${
                      isPenuh
                        ? 'border-[#c9d2c6] text-[#9aa79e]'
                        : 'border-[#064e3b] text-[#064e3b] hover:bg-[#ebf2eb]'
                    }`}
                  >
                    Tambah
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <p className="m-0 flex gap-2 text-[13px] leading-relaxed text-[#3f5247]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span>
              Pengganti tidak dipasang diam-diam. Di checkout kamu melihat nama, harga, dan
              selisihnya, lalu bisa menerima atau melewati bahan itu.
            </span>
          </p>

          <a
            href={hrefIsi}
            onClick={(e) => {
              if (onSelesai || onTutup) {
                e.preventDefault();
                (onSelesai ?? onTutup)?.();
              }
            }}
            className="flex items-center justify-center min-h-13 rounded-xl bg-[#064e3b] text-white text-base font-extrabold no-underline hover:bg-[#053d2e]"
          >
            Selesai
          </a>
        </div>
      </main>

      <div className="mt-8 hidden lg:block">
        <SiteFooter />
      </div>
    </div>
  );
}

export default KeranjangResepAlternatif;
