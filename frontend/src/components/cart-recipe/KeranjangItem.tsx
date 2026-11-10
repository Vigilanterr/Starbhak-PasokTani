'use client';

import React, { useState } from 'react';

export interface TingkatHargaGrosir {
  min: number;
  harga: number;
}

export interface AlternatifSingkat {
  nama: string;
  harga: number;
  toko?: string;
}

export interface ItemBahanKeranjang {
  id: string;
  nama: string;
  kategori?: 'sayuran' | 'jamur' | 'rempah' | string;
  panen?: string;
  satuan?: string;
  stok: number;
  harga?: number;
  hargaAsli?: number;
  diskon?: string | number;
  tingkat?: TingkatHargaGrosir[];
  jumlah?: number;
  kedaluwarsa?: string;
  catatan?: string;
  alt?: AlternatifSingkat[];
}

export type ItemKeranjangData = ItemBahanKeranjang;
export type KeranjangItemData = ItemBahanKeranjang;

export interface KeranjangItemProps {
  item?: ItemBahanKeranjang;
  jumlah?: number;
  dipilih?: boolean;
  onUbah?: ((id: string, jumlah: number) => void) | ((jumlah: number) => void);
  onPilih?: ((id: string, dipilih: boolean) => void) | ((dipilih: boolean) => void);
  onHapus?: (id?: string) => void;
  ketHabis?: string;
  tanpaIngat?: boolean;
  className?: string;
}

export function formatRupiah(n: number): string {
  const nb = '\u00a0';
  return 'Rp' + nb + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const defaultKeranjangItem: ItemBahanKeranjang = {
  id: 'tomat',
  nama: 'Tomat Merah Lembang',
  kategori: 'sayuran',
  panen: 'Dipanen kemarin',
  satuan: 'kg',
  stok: 120,
  harga: 14000,
  tingkat: [
    { min: 1, harga: 14000 },
    { min: 10, harga: 12000 },
  ],
  jumlah: 8,
};

export function KeranjangItem({
  item = defaultKeranjangItem,
  jumlah: jumlahProp,
  dipilih: dipilihProp,
  onUbah,
  onPilih,
  onHapus,
  ketHabis = 'Tidak ikut checkout',
  tanpaIngat = false,
  className = '',
}: KeranjangItemProps) {
  const [localJumlah, setLocalJumlah] = useState<number>(item.jumlah ?? 1);
  const [localDipilih, setLocalDipilih] = useState<boolean>(true);
  const [ingat, setIngat] = useState<boolean>(false);

  const currentJumlah = jumlahProp ?? localJumlah;
  const habis = !(item.stok > 0);
  const isDipilih = habis ? false : (dipilihProp ?? localDipilih);

  const surplus = !!item.diskon;
  const satuan = item.satuan || 'kg';

  const tingkat: TingkatHargaGrosir[] =
    item.tingkat && item.tingkat.length > 0
      ? [...item.tingkat].sort((a, b) => a.min - b.min)
      : [{ min: 1, harga: item.harga ?? 0 }];

  let aktifTier: TingkatHargaGrosir = tingkat[0] ?? { min: 1, harga: item.harga ?? 0 };
  for (const t of tingkat) {
    if (currentJumlah >= t.min) {
      aktifTier = t;
    }
  }

  const hargaSatuan = surplus ? (item.harga ?? 0) : aktifTier.harga;
  const eceran = surplus ? (item.hargaAsli ?? item.harga ?? 0) : (tingkat[0]?.harga ?? item.harga ?? 0);
  const tierBerikut = surplus ? null : tingkat.find((t) => t.min > currentJumlah && t.min <= item.stok);
  const hemat = (eceran - hargaSatuan) * currentJumlah;

  const warnaKategori = {
    sayuran: { latar: 'bg-[#e3f1df]', teks: 'text-[#2f7a3e]' },
    jamur: { latar: 'bg-[#ece8e1]', teks: 'text-[#6b5e4f]' },
    rempah: { latar: 'bg-[#fbe3df]', teks: 'text-[#b42318]' },
  };

  const styleKategori =
    item.kategori && item.kategori in warnaKategori
      ? warnaKategori[item.kategori as keyof typeof warnaKategori]
      : warnaKategori.sayuran;

  const isSegar = /kemarin|hari ini/i.test(item.panen || '');

  const ubahJumlah = (nilaiBaru: number) => {
    const batasi = Math.max(1, Math.min(item.stok, nilaiBaru));
    if (onUbah) {
      if (onUbah.length <= 1) {
        (onUbah as (v: number) => void)(batasi);
      } else {
        (onUbah as (id: string, v: number) => void)(item.id, batasi);
      }
    } else {
      setLocalJumlah(batasi);
    }
  };

  const togglePilih = () => {
    if (habis) return;
    const nilaiBaru = !isDipilih;
    if (onPilih) {
      if (onPilih.length <= 1) {
        (onPilih as (p: boolean) => void)(nilaiBaru);
      } else {
        (onPilih as (id: string, p: boolean) => void)(item.id, nilaiBaru);
      }
    } else {
      setLocalDipilih(nilaiBaru);
    }
  };

  const hapusItem = () => {
    onHapus?.(item.id);
  };

  const diMin = currentJumlah <= 1;
  const diMaks = currentJumlah >= item.stok;

  return (
    <div
      className={`flex items-start gap-2.5 p-3.5 pl-1 bg-white font-sans text-[#173b2b] box-border ${className}`}
    >
      <label className="shrink-0 w-11 h-11 grid place-items-center mt-3.5 cursor-pointer">
        <input
          type="checkbox"
          checked={isDipilih}
          disabled={habis}
          onChange={togglePilih}
          aria-label={`Pilih ${item.nama}`}
          className="w-5 h-5 m-0 accent-[#064e3b] cursor-pointer disabled:cursor-not-allowed"
        />
      </label>

      <div
        className={`shrink-0 w-[72px] h-[72px] rounded-xl grid place-items-center ${styleKategori.latar} ${styleKategori.teks} ${
          habis ? 'opacity-45' : 'opacity-100'
        }`}
      >
        {item.kategori === 'jamur' ? (
          <svg
            role="img"
            aria-label={`Placeholder foto ${item.nama}`}
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3C7 3 3 6.5 3 10.5c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5C21 6.5 17 3 12 3Z" />
            <path d="M9 12v6.5a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5V12" />
            <path d="M9 7h.01M14 6h.01M16.5 9h.01" />
          </svg>
        ) : item.kategori === 'rempah' ? (
          <svg
            role="img"
            aria-label={`Placeholder foto ${item.nama}`}
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.5 6.5c-3.5-.5-7 1.5-8.6 5.4C7.6 15.2 5.3 17.6 2.5 19c4.2 1.6 10.2.6 13.6-3.6 2.3-2.8 2.9-6 1.4-8.9Z" />
            <path d="M17.5 6.5c.2-1.8 1.4-3.2 3.5-3.5" />
            <path d="M15 7c.3-.9 1.2-1.6 2.5-.5" />
          </svg>
        ) : (
          <svg
            role="img"
            aria-label={`Placeholder foto ${item.nama}`}
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        )}
      </div>

      <div className="grow min-w-0 flex flex-col gap-2">
        <div className="flex items-start gap-1">
          <div className="grow min-w-0 flex flex-col gap-0.5 pt-0.5">
            <h3 className="m-0 text-[15px] leading-snug font-bold line-clamp-2">
              <a
                href="#"
                className={`no-underline hover:underline ${
                  habis ? 'text-[#5a6b60]' : 'text-[#173b2b]'
                }`}
              >
                {item.nama}
              </a>
            </h3>

            {item.panen && (
              <p
                className={`m-0 flex items-center gap-1 text-xs leading-normal font-semibold ${
                  habis ? 'text-[#5a6b60]' : isSegar ? 'text-[#157a4c]' : 'text-[#5a6b60]'
                }`}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="M7 20h10" />
                  <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                  <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                  <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                </svg>
                <span className="whitespace-nowrap">{item.panen}</span>
              </p>
            )}

            {surplus && item.kedaluwarsa && (
              <p className="m-0 flex items-center gap-1 text-xs leading-normal font-bold text-[#c2410c]">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>{item.kedaluwarsa}</span>
              </p>
            )}

            {!habis && item.stok <= 10 && (
              <p className="m-0 flex items-center gap-1 text-xs leading-normal font-bold text-[#92400e]">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
                <span>
                  Stok tinggal {item.stok} {satuan}
                </span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={hapusItem}
            aria-label={`Hapus ${item.nama} dari keranjang`}
            title="Hapus"
            className="shrink-0 w-11 h-11 -mt-1.5 -mr-1 p-0 border-0 rounded-xl bg-transparent text-[#5a6b60] hover:text-[#b42318] grid place-items-center cursor-pointer"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </div>

        {!habis ? (
          <>
            <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={`text-[15px] font-extrabold whitespace-nowrap ${
                  surplus ? 'text-[#c2410c]' : 'text-[#064e3b]'
                }`}
              >
                {formatRupiah(hargaSatuan)}
                <span className="text-xs font-medium text-[#5a6b60]">/{satuan}</span>
              </span>
              {eceran > hargaSatuan && (
                <s className="text-xs text-[#5a6b60] whitespace-nowrap">
                  {formatRupiah(eceran)}
                </s>
              )}
              {!surplus && aktifTier !== tingkat[0] && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#d5f6d5] text-[#064e3b] text-xs leading-4 font-extrabold whitespace-nowrap">
                  Grosir ≥{aktifTier.min} {satuan}
                </span>
              )}
              {surplus && item.diskon && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#c2410c] text-white text-xs leading-4 font-extrabold whitespace-nowrap">
                  Surplus {item.diskon}
                </span>
              )}
            </p>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div
                role="group"
                aria-label={`Jumlah ${item.nama}`}
                className="inline-flex items-center border border-[#dee3da] rounded-xl bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => ubahJumlah(currentJumlah - 1)}
                  disabled={diMin}
                  aria-label={`Kurangi 1 ${satuan}`}
                  className={`w-11 h-11 p-0 border-0 bg-transparent grid place-items-center cursor-pointer disabled:cursor-not-allowed ${
                    diMin ? 'text-[#b8c2bb]' : 'text-[#064e3b]'
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <output
                  aria-live="polite"
                  className="min-w-14 text-center text-[15px] font-extrabold text-[#173b2b] whitespace-nowrap"
                >
                  {currentJumlah}{' '}
                  <span className="text-xs font-semibold text-[#5a6b60]">{satuan}</span>
                </output>
                <button
                  type="button"
                  onClick={() => ubahJumlah(currentJumlah + 1)}
                  disabled={diMaks}
                  aria-label={`Tambah 1 ${satuan}`}
                  className={`w-11 h-11 p-0 border-0 bg-transparent grid place-items-center cursor-pointer disabled:cursor-not-allowed ${
                    diMaks ? 'text-[#b8c2bb]' : 'text-[#064e3b]'
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-end gap-px ml-auto">
                <span className="text-base font-extrabold text-[#173b2b] whitespace-nowrap">
                  {formatRupiah(hargaSatuan * currentJumlah)}
                </span>
                {hemat > 0 && (
                  <span className="text-xs font-bold text-[#157a4c] whitespace-nowrap">
                    Hemat {formatRupiah(hemat)}
                  </span>
                )}
              </div>
            </div>

            {tierBerikut && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[#ebf2eb] text-xs leading-snug text-[#0f6b41]">
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
                  className="shrink-0"
                >
                  <path d="m22 7-8.5 8.5-5-5L2 17" />
                  <path d="M16 7h6v6" />
                </svg>
                <span className="grow min-w-0">
                  Tambah <strong>{tierBerikut.min - currentJumlah} {satuan}</strong> lagi, harga
                  jadi <strong>{formatRupiah(tierBerikut.harga)}/{satuan}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => ubahJumlah(tierBerikut.min)}
                  className="shrink-0 min-h-8 px-2.5 border border-[#157a4c] rounded-full bg-white text-[#064e3b] text-xs font-extrabold cursor-pointer whitespace-nowrap hover:bg-[#ebf2eb]"
                >
                  Jadikan {tierBerikut.min} {satuan}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="py-1 px-2.5 rounded-md bg-[#f1f1ee] text-[#3f5247] text-xs font-extrabold">
                Stok habis
              </span>
              <span className="text-xs text-[#5a6b60]">{ketHabis}</span>
            </div>
            {!tanpaIngat && (
              <button
                type="button"
                onClick={() => setIngat(!ingat)}
                aria-pressed={ingat}
                className={`self-start inline-flex items-center gap-1.5 min-h-10 px-3.5 border rounded-xl font-sans text-[13px] font-bold cursor-pointer ${
                  ingat
                    ? 'border-[#157a4c] bg-[#ebf2eb] text-[#064e3b]'
                    : 'border-[#dee3da] bg-white text-[#064e3b] hover:bg-[#f6f8f4]'
                }`}
              >
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
                >
                  <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                  <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                </svg>
                {ingat ? 'Kamu akan diberi tahu' : 'Beri tahu saat stok ada'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default KeranjangItem;
