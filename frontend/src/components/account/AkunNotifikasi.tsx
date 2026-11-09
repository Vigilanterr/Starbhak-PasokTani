'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { AkunMenu } from '../layout/AkunMenu';
import { NavBawah } from '../layout/NavBawah';

export interface PreferensiNotifikasi {
  status: boolean;
  dompet: boolean;
  lahan: boolean;
  langganan: boolean;
  surplus: boolean;
  info: boolean;
}

export interface ChannelNotifikasiItem {
  id: keyof PreferensiNotifikasi;
  judul: string;
  isi: string;
  ikon: string;
  surplus?: boolean;
}

export interface AkunNotifikasiProps {
  sebagian?: boolean;
  preferensi?: Partial<PreferensiNotifikasi>;
  onChangePreferensi?: (p: PreferensiNotifikasi) => Promise<void> | void;
  onSimpan?: (preferensi: PreferensiNotifikasi) => Promise<void> | void;
  onToggle?: (id: keyof PreferensiNotifikasi, nyala: boolean) => void;
  className?: string;
}

const CHANNELS: ChannelNotifikasiItem[] = [
  {
    id: 'status',
    judul: 'Status pesanan',
    isi: 'Pesanan dikonfirmasi, dikirim, dan tiba.',
    ikon: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z',
  },
  {
    id: 'dompet',
    judul: 'Dompet',
    isi: 'Pengembalian dana masuk ke saldo.',
    ikon: 'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1',
  },
  {
    id: 'lahan',
    judul: 'Kabar lahan Komitmen',
    isi: 'Foto dan catatan perkembangan dari petani.',
    ikon: 'M7 20h10',
  },
  {
    id: 'langganan',
    judul: 'Stok baru dan harga turun',
    isi: 'Dari produk dan petani di Langganan.',
    ikon: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z',
  },
  {
    id: 'surplus',
    judul: 'Masuk Surplus',
    isi: 'Produk yang kamu ikuti dapat diskon kedaluwarsa.',
    ikon: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z',
    surplus: true,
  },
  {
    id: 'info',
    judul: 'Pengumuman Pasok Tani',
    isi: 'Fitur baru dan perubahan aturan.',
    ikon: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9',
  },
];

const DEFAULT_PREF: PreferensiNotifikasi = {
  status: true,
  dompet: true,
  lahan: true,
  langganan: true,
  surplus: true,
  info: true,
};

const SEBAGIAN_PREF: PreferensiNotifikasi = {
  status: true,
  dompet: true,
  lahan: false,
  langganan: true,
  surplus: false,
  info: false,
};

export function AkunNotifikasi({
  sebagian = false,
  preferensi: preferensiProp,
  onChangePreferensi,
  onSimpan,
  onToggle,
  className = '',
}: AkunNotifikasiProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const [pref, setPref] = useState<PreferensiNotifikasi>(() => {
    const base = sebagian ? SEBAGIAN_PREF : DEFAULT_PREF;
    return { ...base, ...preferensiProp };
  });

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof window === 'undefined' || !window.ResizeObserver) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSempit(entry.contentRect.width < 900);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const totalAktif = CHANNELS.filter((c) => pref[c.id]).length;

  const handleToggle = async (id: keyof PreferensiNotifikasi, judul: string) => {
    const currentVal = pref[id];
    const nextVal = !currentVal;
    const updated = { ...pref, [id]: nextVal };
    setPref(updated);
    setStatusMsg(`${judul} ${nextVal ? 'dinyalakan.' : 'dimatikan.'} Tersimpan.`);

    onToggle?.(id, nextVal);
    if (onChangePreferensi) {
      await onChangePreferensi(updated);
    }
    if (onSimpan) {
      await onSimpan(updated);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative min-h-full bg-cream font-sans text-ink ${className}`}
    >
      <SiteHeader active="beranda" signedIn={true} cartCount={5} />

      <main className="max-w-[1200px] mx-auto px-4 py-4 min-[900px]:px-6 min-[900px]:py-7 min-[900px]:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Desktop Left Sidebar */}
          {!sempit && (
            <div className="flex-[0_0_272px] min-w-0">
              <AkunMenu aktif="notifikasi" />
            </div>
          )}

          {/* Main Column */}
          <div className="flex-[999_1_560px] min-w-0 max-w-[760px] flex flex-col gap-4">
            {sempit && (
              <Link
                href="/akun"
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
                Akun
              </Link>
            )}

            <div>
              <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                Atur notifikasi
              </h1>
              <p className="mt-1.5 max-w-[62ch] text-[15px] leading-[1.5] text-[#3f5247]">
                Semua jenis kabar menyala sejak awal. Matikan yang tidak kamu
                perlukan. Kabar muncul di{' '}
                <Link
                  href="/notifikasi"
                  className="text-[#157a4c] font-bold no-underline hover:underline"
                >
                  Notifikasi
                </Link>{' '}
                dan lonceng, tanpa email atau WhatsApp.
              </p>
            </div>

            <p
              role="status"
              aria-live="polite"
              className="m-0 min-h-[22px] text-[13px] font-bold text-[#157a4c]"
            >
              {statusMsg}
            </p>

            {/* Selalu Menyala (Mandatory Safety) */}
            <section
              aria-labelledby="judul-wajib"
              className="p-4 px-4.5 border-[1.5px] border-[#e9c75c] rounded-2xl bg-[#fffdf5] flex flex-col gap-2.5"
            >
              <div className="flex items-center gap-2.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#92400e"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <h2
                  id="judul-wajib"
                  className="m-0 text-base font-extrabold text-ink"
                >
                  Selalu menyala
                </h2>
              </div>
              <p className="m-0 text-[13px] leading-[1.5] text-[#3f5247]">
                Kabar yang butuh tindakanmu sebelum ada batas waktu. Kalau
                dimatikan, kamu bisa kehilangan pesanan atau dana.
              </p>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                <li className="flex items-start gap-2.5 text-sm leading-[1.5]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#157a4c"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 mt-1"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>
                    <strong className="text-ink">
                      Pembayaran dengan batas waktu.
                    </strong>{' '}
                    <span className="text-[#3f5247]">
                      Pesanan dibatalkan otomatis kalau tidak dibayar.
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm leading-[1.5]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#157a4c"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 mt-1"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>
                    <strong className="text-ink">
                      Pesanan tiba, perlu konfirmasi.
                    </strong>{' '}
                    <span className="text-[#3f5247]">
                      Dana baru diteruskan ke petani setelah kamu konfirmasi atau
                      batas waktu lewat.
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm leading-[1.5]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#157a4c"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 mt-1"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>
                    <strong className="text-ink">
                      Panen Komitmen siap atau berubah jadwal.
                    </strong>{' '}
                    <span className="text-[#3f5247]">
                      Ada batas bayar sisa dan hak memilih.
                    </span>
                  </span>
                </li>
              </ul>
            </section>

            {/* Bisa Kamu Atur Section */}
            <section
              aria-labelledby="judul-pilih"
              className="border border-line rounded-2xl bg-white overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5 p-3.5 px-4 border-b border-[#eef0eb]">
                <h2
                  id="judul-pilih"
                  className="m-0 text-base font-extrabold text-ink"
                >
                  Bisa kamu atur
                </h2>
                <p className="m-0 text-[13px] font-bold text-[#3f5247]">
                  {totalAktif} dari {CHANNELS.length} menyala
                </p>
              </div>

              <ul className="list-none m-0 p-0">
                {CHANNELS.map((ch, idx) => {
                  const on = pref[ch.id];
                  const idJudul = `nt-j-${ch.id}`;
                  const idKet = `nt-k-${ch.id}`;
                  return (
                    <li
                      key={ch.id}
                      className={idx > 0 ? 'border-t border-[#eef0eb]' : ''}
                    >
                      <div className="flex items-center gap-3 p-3 px-4">
                        <span
                          aria-hidden="true"
                          className={`shrink-0 w-9 h-9 rounded-full grid place-items-center ${
                            ch.surplus
                              ? 'bg-[#fff1ea] text-[#c2410c]'
                              : 'bg-tint text-[#157a4c]'
                          }`}
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
                            <path d={ch.ikon} />
                          </svg>
                        </span>

                        <div className="flex-1 min-w-0">
                          <p
                            id={idJudul}
                            className="m-0 text-[15px] font-extrabold text-ink"
                          >
                            {ch.judul}
                          </p>
                          <p
                            id={idKet}
                            className="mt-0.5 m-0 text-[13px] leading-[1.5] text-[#3f5247]"
                          >
                            {ch.isi}
                          </p>
                        </div>

                        {/* Switch toggle with ZERO ANIMATIONS */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={on}
                          aria-labelledby={idJudul}
                          aria-describedby={idKet}
                          onClick={() => handleToggle(ch.id, ch.judul)}
                          className="shrink-0 relative w-14 h-11 p-0 border-0 bg-transparent cursor-pointer"
                        >
                          {/* Track */}
                          <span
                            aria-hidden="true"
                            style={{
                              backgroundColor: on ? '#157a4c' : '#9aa79e',
                            }}
                            className="absolute left-1 top-2.5 w-12 h-6 rounded-full"
                          />
                          {/* Thumb - instantaneous position change */}
                          <span
                            aria-hidden="true"
                            style={{
                              left: on ? '31px' : '7px',
                            }}
                            className="absolute top-[13px] w-4.5 h-4.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                          />
                          <span className="sr-only">
                            {on ? 'Nyala' : 'Mati'}
                          </span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <p className="m-0 text-[13px] leading-[1.55] text-[#3f5247]">
              Ingin kabar per produk atau petani, termasuk ringkasan harian?
              Atur di{' '}
              <Link
                href="/langganan"
                className="text-[#157a4c] font-bold no-underline hover:underline"
              >
                Langganan
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Nav on Mobile */}
      {sempit && (
        <div className="sticky bottom-0 z-10 mt-6">
          <NavBawah aktif="akun" />
        </div>
      )}

      {/* Desktop SiteFooter */}
      {!sempit && <SiteFooter />}
    </div>
  );
}

export default AkunNotifikasi;
