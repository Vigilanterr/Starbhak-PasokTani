'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AkunMenu } from '../layout';

export interface PemicuLangganan {
  stok?: boolean;
  harga?: boolean;
  surplus?: boolean;
  panen?: boolean;
  [key: string]: boolean | undefined;
}

export type FrekuensiLangganan = 'langsung' | 'harian' | 'mingguan';
export type FrekuensiKabar = FrekuensiLangganan;

export interface ItemLangganan {
  id: string;
  nama: string;
  ket: string;
  href?: string;
  pemicu: PemicuLangganan;
  frek: FrekuensiLangganan;
}

export type LanggananItem = ItemLangganan;
export type ItemLanggananKabar = ItemLangganan;

export interface LanggananProps {
  langgananList?: ItemLangganan[];
  daftarLangganan?: ItemLangganan[];
  kosong?: boolean;
  onUbahPemicu?: (id: string, pemicu: PemicuLangganan) => void;
  onTogglePemicu?: (id: string, pemicuKey: string, aktif: boolean) => void;
  onUbahFrekuensi?: (id: string, frek: FrekuensiLangganan) => void;
  onChangeFrekuensi?: (id: string, frek: FrekuensiLangganan) => void;
  onBerhentiIkuti?: (id: string) => void;
  onHapusLangganan?: (id: string) => void;
  onUndoBerhenti?: (item: ItemLangganan) => void;
  className?: string;
}

const DEFAULT_LANGGANAN_LIST: ItemLangganan[] = [
  {
    id: 'kol',
    nama: 'Kol Bulat Lembang',
    ket: 'Produk · Tani Makmur Lembang',
    href: '/produk/kol-lembang',
    pemicu: { stok: true, harga: true, surplus: true },
    frek: 'langsung',
  },
  {
    id: 'tomat',
    nama: 'Tomat Merah Lembang',
    ket: 'Produk · Kebun Sari Pangalengan',
    href: '/produk/tomat-merah-lembang',
    pemicu: { stok: true, harga: false, surplus: true },
    frek: 'harian',
  },
  {
    id: 'wortel',
    nama: 'Wortel Komitmen Lembang',
    ket: 'Komitmen · panen perkiraan 25 Nov',
    href: '/komitmen',
    pemicu: { panen: true, harga: true },
    frek: 'langsung',
  },
];

const LABEL_PEMICU: Record<string, { label: string; ket: string }> = {
  stok: {
    label: 'Stok baru',
    ket: 'Petani menambah stok setelah habis atau menipis.',
  },
  harga: {
    label: 'Harga turun',
    ket: 'Harga per kg lebih murah dari saat kamu mengikuti.',
  },
  surplus: {
    label: 'Masuk Surplus',
    ket: 'Produk dapat diskon karena mendekati kedaluwarsa.',
  },
  panen: {
    label: 'Panen Komitmen siap',
    ket: 'Hasil panen sudah diisi dan kamu perlu membayar sisanya.',
  },
};

export function Langganan({
  langgananList,
  daftarLangganan,
  kosong = false,
  onUbahPemicu,
  onTogglePemicu,
  onUbahFrekuensi,
  onChangeFrekuensi,
  onBerhentiIkuti,
  onHapusLangganan,
  onUndoBerhenti,
  className = '',
}: LanggananProps) {
  const initialItems = kosong
    ? []
    : langgananList ?? daftarLangganan ?? DEFAULT_LANGGANAN_LIST;

  const [items, setItems] = useState<ItemLangganan[]>(initialItems);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [undoItem, setUndoItem] = useState<ItemLangganan | null>(null);

  const handleToggleTrigger = (itemId: string, triggerKey: string) => {
    let changedItemName = '';
    let nextStatus = false;

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          changedItemName = it.nama;
          const currentVal = !!it.pemicu[triggerKey];
          nextStatus = !currentVal;
          const updatedPemicu: PemicuLangganan = {
            ...it.pemicu,
            [triggerKey]: nextStatus,
          };
          onUbahPemicu?.(itemId, updatedPemicu);
          onTogglePemicu?.(itemId, triggerKey, nextStatus);
          return {
            ...it,
            pemicu: updatedPemicu,
          };
        }
        return it;
      })
    );

    const triggerLabel = LABEL_PEMICU[triggerKey]?.label ?? triggerKey;
    const actionLabel = nextStatus ? 'dinyalakan' : 'dimatikan';
    setStatusMessage(
      `${triggerLabel} ${actionLabel} untuk ${changedItemName}. Tersimpan.`
    );
  };

  const handleSelectFrequency = (itemId: string, newFrek: FrekuensiLangganan) => {
    let changedItemName = '';

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          changedItemName = it.nama;
          onUbahFrekuensi?.(itemId, newFrek);
          onChangeFrekuensi?.(itemId, newFrek);
          return {
            ...it,
            frek: newFrek,
          };
        }
        return it;
      })
    );

    const frekLabel = newFrek === 'langsung' ? 'Langsung' : 'Ringkasan harian';
    setStatusMessage(
      `Frekuensi diubah ke ${frekLabel} untuk ${changedItemName}. Tersimpan.`
    );
  };

  const handleBerhenti = (it: ItemLangganan) => {
    setItems((prev) => prev.filter((x) => x.id !== it.id));
    setUndoItem(it);
    setStatusMessage('');
    onBerhentiIkuti?.(it.id);
    onHapusLangganan?.(it.id);
  };

  const handleUndo = () => {
    if (undoItem) {
      const restored = undoItem;
      setItems((prev) => [restored, ...prev]);
      setUndoItem(null);
      setStatusMessage(`Kembali mengikuti ${restored.nama}.`);
      onUndoBerhenti?.(restored);
    }
  };

  const totalEmpty = items.length === 0;

  return (
    <div className={`relative min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-2 md:py-7 md:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Desktop Navigation Sidebar */}
          <div className="hidden md:block flex-none w-[272px]">
            <AkunMenu aktif="langganan" />
          </div>

          {/* Main Column */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Mobile Back Link */}
            <Link
              href="/akun"
              className="md:hidden self-start inline-flex items-center gap-1 min-h-[44px] text-[#157a4c] text-sm font-bold no-underline hover:underline"
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
              Akun
            </Link>

            {/* Title Block */}
            <div>
              <h1 className="m-0 text-[28px] md:text-[34px] font-extrabold leading-tight tracking-tight">
                Langganan
              </h1>
              <p className="m-0 mt-1.5 max-w-[62ch] text-[15px] leading-normal text-[#3f5247]">
                Pilih kabar apa yang kamu mau dari tiap produk atau petani yang kamu ikuti. Kabar muncul di{' '}
                <Link href="/notifikasi" className="text-[#157a4c] font-bold no-underline hover:underline">
                  Notifikasi
                </Link>
                .
              </p>
            </div>

            {/* Live Status Feedback Banner */}
            <p
              role="status"
              aria-live="polite"
              className="m-0 min-h-[22px] text-[13px] font-bold text-[#157a4c]"
            >
              {statusMessage}
            </p>

            {/* Empty State */}
            {totalEmpty && (
              <div className="p-5 md:p-[22px] border-[1.5px] border-dashed border-[#a9cfae] rounded-2xl bg-white flex flex-col items-start gap-2.5">
                <p className="m-0 text-base font-extrabold text-[#173b2b]">
                  Belum ada yang diikuti
                </p>
                <p className="m-0 max-w-[56ch] text-sm leading-relaxed text-[#3f5247]">
                  Buka halaman produk atau petani, lalu pilih Ikuti. Kamu bisa dikabari saat stok baru, harga turun, masuk Surplus, atau panen Komitmen siap.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center min-h-[48px] px-[18px] rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline hover:bg-[#157a4c]"
                >
                  Cari produk
                </Link>
              </div>
            )}

            {/* Subscriptions List */}
            {!totalEmpty && (
              <ul className="m-0 p-0 list-none flex flex-col gap-3.5">
                {items.map((d) => {
                  const idJudul = `lg-${d.id}`;
                  const triggerKeys = Object.keys(d.pemicu);
                  const hasPanen = triggerKeys.includes('panen');
                  const isPanenActive = !!d.pemicu.panen;
                  const isDailyDigest = d.frek === 'harian';
                  const showPanenWarning = hasPanen && isPanenActive && isDailyDigest;

                  return (
                    <li key={d.id}>
                      <section
                        aria-labelledby={idJudul}
                        className="p-4 md:px-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                      >
                        {/* Card Header */}
                        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                          <div className="min-w-0">
                            <h2
                              id={idJudul}
                              className="m-0 text-[17px] font-extrabold text-[#173b2b]"
                            >
                              <Link
                                href={d.href ?? '#'}
                                className="text-[#173b2b] no-underline hover:underline"
                              >
                                {d.nama}
                              </Link>
                            </h2>
                            <p className="m-0 mt-0.5 text-[13px] text-[#5a6b60]">
                              {d.ket}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleBerhenti(d)}
                            aria-label={`Berhenti mengikuti ${d.nama}`}
                            className="min-h-[44px] px-3 border border-[#dee3da] rounded-xl bg-white text-[#8a1c12] text-sm font-extrabold cursor-pointer hover:bg-[#fff5f5]"
                          >
                            Berhenti ikuti
                          </button>
                        </div>

                        {/* Fieldset 1: Triggers (Kabari saya saat) */}
                        <fieldset className="m-0 p-0 border-0 min-w-0">
                          <legend className="p-0 mb-1 text-[13px] font-extrabold text-[#173b2b]">
                            Kabari saya saat
                          </legend>
                          <div className="flex flex-col">
                            {triggerKeys.map((k) => {
                              const info = LABEL_PEMICU[k] ?? {
                                label: k,
                                ket: 'Kabar untuk pembaruan ini.',
                              };
                              const isChecked = !!d.pemicu[k];

                              return (
                                <label
                                  key={k}
                                  className="flex items-center gap-3 min-h-[48px] cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleTrigger(d.id, k)}
                                    className="shrink-0 w-6 h-6 m-0 rounded accent-[#064e3b]"
                                  />
                                  <span className="flex flex-col">
                                    <span className="text-[15px] font-bold text-[#173b2b]">
                                      {info.label}
                                    </span>
                                    <span className="text-xs leading-tight text-[#5a6b60]">
                                      {info.ket}
                                    </span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>

                        {/* Fieldset 2: Frequency (Seberapa sering) */}
                        <fieldset className="m-0 p-0 border-0 min-w-0">
                          <legend className="p-0 mb-1 text-[13px] font-extrabold text-[#173b2b]">
                            Seberapa sering
                          </legend>
                          <div className="flex flex-wrap gap-2">
                            {/* Langsung radio */}
                            <label
                              className={`flex-1 basis-[200px] flex items-start gap-2.5 min-h-[48px] p-2.5 px-3 box-border rounded-xl cursor-pointer border ${
                                d.frek === 'langsung'
                                  ? 'border-[1.5px] border-[#064e3b] bg-[#f3faf3]'
                                  : 'border border-[#dee3da] bg-white hover:bg-[#f6f8f4]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`frek-${d.id}`}
                                checked={d.frek === 'langsung'}
                                onChange={() => handleSelectFrequency(d.id, 'langsung')}
                                className="shrink-0 w-[22px] h-[22px] mt-0.5 m-0 accent-[#064e3b]"
                              />
                              <span className="flex flex-col">
                                <span className="text-[15px] font-bold text-[#173b2b]">
                                  Langsung
                                </span>
                                <span className="text-xs leading-tight text-[#5a6b60]">
                                  Kabar dikirim begitu terjadi.
                                </span>
                              </span>
                            </label>

                            {/* Harian radio */}
                            <label
                              className={`flex-1 basis-[200px] flex items-start gap-2.5 min-h-[48px] p-2.5 px-3 box-border rounded-xl cursor-pointer border ${
                                d.frek === 'harian'
                                  ? 'border-[1.5px] border-[#064e3b] bg-[#f3faf3]'
                                  : 'border border-[#dee3da] bg-white hover:bg-[#f6f8f4]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`frek-${d.id}`}
                                checked={d.frek === 'harian'}
                                onChange={() => handleSelectFrequency(d.id, 'harian')}
                                className="shrink-0 w-[22px] h-[22px] mt-0.5 m-0 accent-[#064e3b]"
                              />
                              <span className="flex flex-col">
                                <span className="text-[15px] font-bold text-[#173b2b]">
                                  Ringkasan harian
                                </span>
                                <span className="text-xs leading-tight text-[#5a6b60]">
                                  Satu kabar gabungan tiap pagi jam 07.00.
                                </span>
                              </span>
                            </label>
                          </div>

                          {/* Harvest readiness notice if daily digest is picked */}
                          {showPanenWarning && (
                            <p className="m-0 mt-2 text-xs leading-normal text-[#92400e] font-bold">
                              Kabar Panen Komitmen siap tetap dikirim langsung, karena ada batas waktu bayar sisa.
                            </p>
                          )}
                        </fieldset>
                      </section>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Undo Toast Banner */}
            {undoItem && (
              <p
                role="status"
                className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 p-2.5 px-3.5 rounded-xl bg-[#173b2b] text-white text-sm"
              >
                <span>Berhenti mengikuti {undoItem.nama}.</span>
                <button
                  type="button"
                  onClick={handleUndo}
                  className="min-h-[44px] px-2 border-0 bg-transparent text-[#e9c75c] text-sm font-extrabold cursor-pointer hover:underline"
                >
                  Batalkan
                </button>
              </p>
            )}

            {/* Bottom Informational Note */}
            <p className="m-0 text-[13px] leading-relaxed text-[#3f5247]">
              Kabar hanya muncul di aplikasi dan web. Tidak ada email atau WhatsApp. Atur jenis kabar lain di{' '}
              <Link
                href="/akun/notifikasi"
                className="text-[#157a4c] font-bold no-underline hover:underline"
              >
                Atur notifikasi
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Langganan;
