'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { KeranjangItem } from './KeranjangItem';
import type { ItemBahanKeranjang } from './KeranjangItem';
import type { StatusPasokTani } from '../common/ChipStatus';
import type { BahanAlternatifItem } from './KeranjangResepAlternatif';

export interface ResepDetailData {
  id: string;
  nama: string;
  catatan?: string;
  porsi?: string | number;
  items?: ItemBahanKeranjang[];
  alternatifList?: BahanAlternatifItem[];
  estimasiBarang?: number;
  terakhirDipesan?: string;
  status?: StatusPasokTani | string;
}

export interface SaranProduk {
  id: string;
  nama: string;
  toko: string;
  harga: number;
  satuan?: string;
  kategori?: string;
  panen?: string;
  stok?: number;
}

export interface KeranjangResepIsiProps {
  resep?: ResepDetailData;
  idResep?: string;
  namaResep?: string;
  catatanResep?: string;
  bahanList?: ItemBahanKeranjang[];
  saranProdukList?: SaranProduk[];
  modeKosong?: 'alt' | 'lewati';
  sheet?: boolean;
  onModeKosongChange?: (mode: 'alt' | 'lewati') => void;
  onCheckout?: (resepId?: string) => void;
  onTambahProduk?: (produkId: string) => void;
  onHapusBahan?: (id: string) => void;
  onUbahJumlah?: (id: string, jumlah: number) => void;
  onPilihBahan?: (id: string, dipilih: boolean) => void;
  onUbahItem?: (itemId: string, jumlah: number) => void;
  onHapusItem?: (itemId: string) => void;
  hrefDaftar?: string;
  hrefCheckout?: string;
  hrefAlt?: string;
  className?: string;
}

export function formatRupiah(n: number): string {
  const nb = '\u00a0';
  return 'Rp' + nb + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const defaultResepData: ResepDetailData = {
  id: 'nasi-goreng-kampung',
  nama: 'Nasi Goreng Kampung',
  catatan: 'Untuk 40 porsi, Warung Dewi',
  porsi: 40,
  items: [
    {
      id: 'cabai',
      nama: 'Cabai Merah Keriting',
      kategori: 'rempah',
      panen: 'Dipanen 3 hari lalu',
      satuan: 'kg',
      stok: 60,
      tingkat: [
        { min: 1, harga: 42000 },
        { min: 5, harga: 40000 },
      ],
      alt: [{ nama: 'Cabai Merah Besar', harga: 38000 }],
      jumlah: 2,
    },
    {
      id: 'jamur',
      nama: 'Jamur Tiram Putih',
      kategori: 'jamur',
      panen: 'Dipanen kemarin',
      satuan: 'kg',
      stok: 4,
      harga: 15400,
      hargaAsli: 22000,
      diskon: '−30%',
      kedaluwarsa: 'Kedaluwarsa 2 hari lagi',
      alt: [
        { nama: 'Jamur Kancing Putih', harga: 24000 },
        { nama: 'Jamur Merang', harga: 28000 },
      ],
      jumlah: 3,
    },
    {
      id: 'tomat',
      nama: 'Tomat Merah Lembang',
      kategori: 'sayuran',
      panen: 'Dipanen kemarin',
      satuan: 'kg',
      stok: 120,
      tingkat: [
        { min: 1, harga: 14000 },
        { min: 10, harga: 12000 },
      ],
      alt: [],
      jumlah: 3,
    },
    {
      id: 'daun',
      nama: 'Bawang Daun Cikajang',
      kategori: 'sayuran',
      panen: 'Dipanen 5 hari lalu',
      satuan: 'kg',
      stok: 0,
      tingkat: [{ min: 1, harga: 16000 }],
      alt: [
        { nama: 'Bawang Daun Pangalengan', harga: 17000 },
        { nama: 'Daun Bawang Lembang', harga: 15500 },
      ],
      jumlah: 1,
    },
  ],
};

export const defaultSaranProduk: SaranProduk[] = [
  {
    id: 'seledri',
    nama: 'Seledri Lembang',
    toko: 'Kebun Mang Ujang',
    kategori: 'sayuran',
    panen: 'Dipanen hari ini',
    satuan: 'kg',
    stok: 30,
    harga: 18000,
  },
  {
    id: 'jeruk',
    nama: 'Daun Jeruk Purut',
    toko: 'Tani Cikajang',
    kategori: 'rempah',
    panen: 'Dipanen 2 hari lalu',
    satuan: 'kg',
    stok: 5,
    harga: 30000,
  },
];

export function KeranjangResepIsi({
  resep = defaultResepData,
  idResep,
  namaResep,
  catatanResep,
  bahanList,
  saranProdukList = defaultSaranProduk,
  modeKosong: modeKosongProp,
  sheet: sheetProp = false,
  onModeKosongChange,
  onCheckout,
  onTambahProduk,
  onHapusBahan,
  onUbahJumlah,
  onPilihBahan,
  onUbahItem,
  onHapusItem,
  hrefDaftar = '/keranjang-resep',
  hrefCheckout = '/checkout',
  hrefAlt = '/keranjang-resep/1/alternatif',
  className = '',
}: KeranjangResepIsiProps) {
  const judul = namaResep ?? resep.nama;
  const deskripsi = catatanResep ?? resep.catatan;
  const initialItems = bahanList ?? resep.items ?? defaultResepData.items ?? [];

  const [items, setItems] = useState<ItemBahanKeranjang[]>(initialItems);
  const [jumlahMap, setJumlahMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const it of initialItems) {
      map[it.id] = it.jumlah ?? 1;
    }
    return map;
  });

  const [pilihMap, setPilihMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const it of initialItems) {
      map[it.id] = true;
    }
    return map;
  });

  const [dihapusMap, setDihapusMap] = useState<Record<string, boolean>>({});
  const [undoId, setUndoId] = useState<string | null>(null);
  const [mode, setMode] = useState<'alt' | 'lewati'>(modeKosongProp ?? 'alt');
  const [sheetBuka, setSheetBuka] = useState<boolean>(sheetProp);
  const [saranList, setSaranList] = useState<SaranProduk[]>(saranProdukList);

  const handleUbahJumlah = (id: string, val: number) => {
    setJumlahMap((prev) => ({ ...prev, [id]: val }));
    onUbahJumlah?.(id, val);
    onUbahItem?.(id, val);
  };

  const handlePilihItem = (id: string, val: boolean) => {
    setPilihMap((prev) => ({ ...prev, [id]: val }));
    onPilihBahan?.(id, val);
  };

  const handleHapusItem = (id: string) => {
    setDihapusMap((prev) => ({ ...prev, [id]: true }));
    setUndoId(id);
    onHapusBahan?.(id);
    onHapusItem?.(id);
  };

  const handleUrungkan = () => {
    if (!undoId) return;
    setDihapusMap((prev) => ({ ...prev, [undoId]: false }));
    setUndoId(null);
  };

  const handleModeChange = (newMode: 'alt' | 'lewati') => {
    setMode(newMode);
    onModeKosongChange?.(newMode);
  };

  const handleTambahSaran = (sr: SaranProduk) => {
    const baru: ItemBahanKeranjang = {
      id: sr.id,
      nama: sr.nama,
      kategori: sr.kategori ?? 'sayuran',
      panen: sr.panen ?? 'Dipanen hari ini',
      satuan: sr.satuan ?? 'kg',
      stok: sr.stok ?? 20,
      harga: sr.harga,
      tingkat: [{ min: 1, harga: sr.harga }],
      alt: [],
      jumlah: 1,
    };
    setItems((prev) => [...prev, baru]);
    setJumlahMap((prev) => ({ ...prev, [sr.id]: 1 }));
    setPilihMap((prev) => ({ ...prev, [sr.id]: true }));
    setDihapusMap((prev) => ({ ...prev, [sr.id]: false }));
    setSaranList((prev) => prev.filter((x) => x.id !== sr.id));
    onTambahProduk?.(sr.id);
  };

  const hargaDariItem = (it: ItemBahanKeranjang, q: number): number => {
    if (it.diskon && it.harga) return it.harga;
    const t =
      it.tingkat && it.tingkat.length > 0
        ? [...it.tingkat].sort((a, b) => a.min - b.min)
        : [{ min: 1, harga: it.harga ?? 0 }];
    let a = t[0] ?? { min: 1, harga: it.harga ?? 0 };
    for (const x of t) {
      if (q >= x.min) a = x;
    }
    return a.harga;
  };

  const aktifItems = items.filter((it) => !dihapusMap[it.id]);

  let total = 0;
  let nBahan = 0;
  let nGanti = 0;
  let nLewat = 0;

  for (const it of aktifItems) {
    const q = jumlahMap[it.id] ?? 1;
    const isDipilih = pilihMap[it.id] ?? true;
    const isHabis = it.stok <= 0;

    if (!isHabis) {
      if (isDipilih) {
        total += hargaDariItem(it, q) * q;
        nBahan += 1;
      }
    } else if (mode === 'alt' && it.alt && it.alt.length > 0) {
      const altFirst = it.alt[0];
      if (altFirst) {
        total += altFirst.harga * q;
        nBahan += 1;
        nGanti += 1;
      }
    } else {
      nLewat += 1;
    }
  }

  const terhapusItem = undoId ? items.find((x) => x.id === undoId) : null;
  const bisaCheckout = nBahan > 0;

  return (
    <div
      className={`relative min-h-screen bg-[#fcfbf6] font-sans text-[#173b2b] ${className}`}
    >
      <SiteHeader cartCount={5} />

      <main className="max-w-[1200px] mx-auto px-4 py-2 md:px-6 md:pt-5 md:pb-16 box-border">
        <Link
          href={hrefDaftar}
          className="inline-flex items-center gap-1 min-h-11 text-[#157a4c] text-sm font-bold no-underline hover:underline"
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
          Keranjang Resep
        </Link>

        <h1 className="mt-1 mb-1 text-[28px] md:text-[36px] leading-tight font-extrabold tracking-tight">
          {judul}
        </h1>
        {deskripsi && (
          <p className="mt-0 mb-4.5 text-[15px] text-[#3f5247]">{deskripsi}</p>
        )}

        <div className="flex flex-wrap items-start gap-6">
          {/* Main Ingredient Section */}
          <div className="grow min-w-0 flex flex-col gap-3.5" style={{ flex: '999 1 560px' }}>
            <section
              aria-label="Bahan resep"
              className="border border-[#dee3da] rounded-2xl bg-white overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 px-4 py-1.5 bg-[#d5f6d5] border-b border-[#a9cfae]">
                <h2 className="m-0 text-sm font-extrabold">
                  Bahan{' '}
                  <span className="font-semibold text-[#3f5247]">({aktifItems.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setSheetBuka(true)}
                  className="inline-flex items-center gap-1.5 min-h-11 px-3 border-0 rounded-xl bg-transparent text-[#064e3b] font-sans text-sm font-extrabold cursor-pointer hover:bg-[#c2edc2]"
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
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Tambah produk
                </button>
              </div>

              <ul className="list-none m-0 p-0">
                {aktifItems.map((it, idx) => {
                  const q = jumlahMap[it.id] ?? 1;
                  const habis = it.stok <= 0;
                  const isDipilih = habis ? false : (pilihMap[it.id] ?? true);
                  const a0 = it.alt && it.alt.length > 0 ? it.alt[0] : null;

                  let strip = '';
                  let warnaStrip = 'text-[#3f5247]';
                  let latarStrip = 'bg-[#f6f8f4]';
                  let aksiAlt = 'Atur alternatif';

                  if (habis && mode === 'alt' && a0) {
                    strip = `Diganti saat checkout: ${a0.nama}, ${formatRupiah(a0.harga)}/kg. ${q} kg = ${formatRupiah(a0.harga * q)}.`;
                    warnaStrip = 'text-[#92400e]';
                    latarStrip = 'bg-[#fef3c7]';
                    aksiAlt = `Atur alternatif (${it.alt?.length ?? 0})`;
                  } else if (habis && mode === 'alt') {
                    strip = 'Stok habis dan belum ada alternatif, jadi bahan ini dilewati.';
                    warnaStrip = 'text-[#92400e]';
                    latarStrip = 'bg-[#fef3c7]';
                    aksiAlt = 'Tambah alternatif';
                  } else if (habis) {
                    strip = 'Dilewati saat checkout, sesuai pilihanmu.';
                    warnaStrip = 'text-[#92400e]';
                    latarStrip = 'bg-[#fef3c7]';
                    aksiAlt = `Atur alternatif (${it.alt?.length ?? 0})`;
                  } else if (it.alt && it.alt.length > 0) {
                    strip = `Alternatif: ${it.alt.length} produk, dipakai kalau stok kurang.`;
                    aksiAlt = `Atur alternatif (${it.alt.length})`;
                  } else {
                    strip = 'Belum ada alternatif.';
                    aksiAlt = 'Tambah alternatif';
                  }

                  const ketHabis =
                    mode === 'alt' && a0
                      ? 'Diganti saat checkout'
                      : 'Dilewati saat checkout';

                  return (
                    <li
                      key={it.id}
                      className={idx === 0 ? '' : 'border-t border-[#eef0eb]'}
                    >
                      <KeranjangItem
                        item={it}
                        jumlah={q}
                        dipilih={isDipilih}
                        onUbah={(_id, val) => handleUbahJumlah(it.id, val)}
                        onPilih={(_id, val) => handlePilihItem(it.id, val)}
                        onHapus={() => handleHapusItem(it.id)}
                        ketHabis={ketHabis}
                        tanpaIngat={true}
                      />
                      <div
                        className={`flex flex-wrap items-center justify-between gap-1 gap-x-3 mx-3 mb-3 p-1 pl-3 rounded-xl ${latarStrip}`}
                      >
                        <p
                          className={`grow min-w-[220px] m-0 py-1.5 text-[13px] leading-snug font-semibold ${warnaStrip}`}
                        >
                          {strip}
                        </p>
                        <Link
                          href={hrefAlt}
                          className="shrink-0 inline-flex items-center min-h-11 px-2.5 text-[#064e3b] text-[13px] font-extrabold underline hover:text-[#053d2e]"
                        >
                          {aksiAlt}
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {terhapusItem && dihapusMap[undoId!] && (
              <div
                role="status"
                className="flex items-center justify-between gap-2 py-1 px-3.5 rounded-xl bg-[#173b2b] text-white text-sm"
              >
                <span>{terhapusItem.nama} dihapus dari resep.</span>
                <button
                  type="button"
                  onClick={handleUrungkan}
                  className="min-h-11 px-3 border-0 rounded-lg bg-transparent text-[#e9c75c] font-sans text-sm font-extrabold cursor-pointer hover:underline"
                >
                  Urungkan
                </button>
              </div>
            )}
          </div>

          {/* Right Sticky Summary Aside */}
          <aside
            aria-labelledby="judul-ringkasan"
            className="w-full lg:w-[380px] shrink-0 sticky top-4 flex flex-col gap-3.5 p-4.5 md:p-5 border border-[#dee3da] rounded-2xl bg-white box-border"
          >
            <h2 id="judul-ringkasan" className="m-0 text-[17px] font-extrabold">
              Ringkasan resep
            </h2>

            <fieldset className="m-0 p-0 border-0 min-w-0 flex flex-col gap-1">
              <legend className="p-0 mb-1 text-sm font-extrabold">
                Kalau bahan kosong
              </legend>
              <label className="flex items-start gap-1 min-h-11 cursor-pointer">
                <span className="w-11 h-11 shrink-0 grid place-items-center">
                  <input
                    type="radio"
                    name="kosong-aksi"
                    checked={mode === 'alt'}
                    onChange={() => handleModeChange('alt')}
                    className="w-5 h-5 m-0 accent-[#064e3b]"
                  />
                </span>
                <span className="pt-2.5 text-sm leading-snug">
                  <strong>Pakai alternatif pertama yang ada</strong>
                  <span className="block text-[13px] text-[#3f5247]">
                    Kamu melihat penggantinya di checkout.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-1 min-h-11 cursor-pointer">
                <span className="w-11 h-11 shrink-0 grid place-items-center">
                  <input
                    type="radio"
                    name="kosong-aksi"
                    checked={mode === 'lewati'}
                    onChange={() => handleModeChange('lewati')}
                    className="w-5 h-5 m-0 accent-[#064e3b]"
                  />
                </span>
                <span className="pt-2.5 text-sm leading-snug">
                  <strong>Lewati bahan itu</strong>
                  <span className="block text-[13px] text-[#3f5247]">
                    Tidak ikut checkout.
                  </span>
                </span>
              </label>
            </fieldset>

            <dl className="m-0 pt-3 border-t border-[#eef0eb] flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#3f5247]">Bahan ikut checkout</dt>
                <dd className="m-0 font-bold">{nBahan}</dd>
              </div>

              {nGanti > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#92400e] font-semibold">Diganti alternatif</dt>
                  <dd className="m-0 font-bold text-[#92400e]">{nGanti}</dd>
                </div>
              )}

              {nLewat > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#92400e] font-semibold">Kosong, dilewati</dt>
                  <dd className="m-0 font-bold text-[#92400e]">{nLewat}</dd>
                </div>
              )}

              <div className="flex justify-between items-baseline gap-3 pt-2 border-t border-[#eef0eb]">
                <dt className="font-extrabold">Estimasi barang</dt>
                <dd className="m-0 text-xl font-extrabold text-[#064e3b]">
                  {formatRupiah(total)}
                </dd>
              </div>
            </dl>

            <p className="m-0 text-xs leading-relaxed text-[#5a6b60]">
              Belum termasuk ongkos kirim dan biaya layanan 1%. Harga akhir dihitung di checkout dari
              stok saat itu.
            </p>

            {/* Desktop Checkout CTA */}
            <div className="hidden lg:block">
              {bisaCheckout ? (
                <Link
                  href={hrefCheckout}
                  onClick={(e) => {
                    if (onCheckout) {
                      e.preventDefault();
                      onCheckout(idResep ?? resep.id);
                    }
                  }}
                  className="flex items-center justify-center min-h-13 rounded-xl bg-[#064e3b] text-white text-base font-extrabold no-underline hover:bg-[#053d2e]"
                >
                  Checkout grup ({nBahan} bahan)
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="flex items-center justify-center min-h-13 rounded-xl bg-[#8a9a90] text-white text-base font-extrabold cursor-not-allowed"
                >
                  Pilih bahan dulu
                </span>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Sticky Bottom Summary Bar */}
      <div className="lg:hidden sticky bottom-0 z-10 mt-6 flex items-center gap-3 p-2.5 px-4 bg-white border-t border-[#dee3da] shadow-md">
        <div className="grow min-w-0">
          <p className="m-0 text-xs text-[#3f5247]">Estimasi barang</p>
          <p className="m-0 text-lg font-extrabold text-[#064e3b]">{formatRupiah(total)}</p>
        </div>
        {bisaCheckout ? (
          <Link
            href={hrefCheckout}
            onClick={(e) => {
              if (onCheckout) {
                e.preventDefault();
                onCheckout(idResep ?? resep.id);
              }
            }}
            className="shrink-0 inline-flex items-center justify-center min-h-12 px-4.5 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline"
          >
            Checkout grup ({nBahan})
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="shrink-0 inline-flex items-center min-h-12 px-4.5 rounded-xl bg-[#8a9a90] text-white text-[15px] font-extrabold cursor-not-allowed"
          >
            Pilih bahan dulu
          </span>
        )}
      </div>

      <div className="mt-8 hidden lg:block">
        <SiteFooter />
      </div>

      {/* Modal Drawer: Tambah produk ke resep */}
      {sheetBuka && (
        <div className="fixed inset-0 z-20 bg-[#173b2b]/50 flex justify-center items-start pt-24 md:pt-36 px-4 box-border">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-tambah"
            className="w-full max-w-[460px] p-5 rounded-2xl bg-white shadow-2xl flex flex-col gap-3 box-border"
          >
            <div>
              <h2 id="judul-tambah" className="mt-0 mb-1 text-lg font-extrabold">
                Tambah produk ke resep
              </h2>
              <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
                Saran dari bahan yang sering dipakai bersama bahan resep ini.
              </p>
            </div>

            <ul className="list-none m-0 p-0 flex flex-col">
              {saranList.map((sr) => (
                <li
                  key={sr.id}
                  className="flex items-center gap-2.5 py-2.5 border-t border-[#eef0eb]"
                >
                  <div className="grow min-w-0 text-[13px] leading-snug text-[#3f5247]">
                    <strong className="block text-sm text-[#173b2b]">{sr.nama}</strong>
                    {sr.toko} · {formatRupiah(sr.harga)}/kg
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTambahSaran(sr)}
                    className="shrink-0 min-h-11 px-4 border-1.5 border-[#064e3b] rounded-xl bg-white text-[#064e3b] font-sans text-sm font-extrabold cursor-pointer hover:bg-[#ebf2eb]"
                  >
                    Tambah
                  </button>
                </li>
              ))}
            </ul>

            {saranList.length === 0 && (
              <p className="m-0 text-sm text-[#3f5247]">Semua saran sudah ada di resep ini.</p>
            )}

            <Link
              href="/produk"
              className="flex items-center min-h-11 text-[#157a4c] text-sm font-bold no-underline hover:underline"
            >
              Cari produk lain di Pasok Tani
            </Link>

            <button
              type="button"
              onClick={() => setSheetBuka(false)}
              className="min-h-12 border-0 rounded-xl bg-[#064e3b] text-white font-sans text-[15px] font-extrabold cursor-pointer hover:bg-[#053d2e]"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KeranjangResepIsi;
