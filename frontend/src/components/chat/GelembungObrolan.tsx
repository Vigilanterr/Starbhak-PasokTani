'use client';

import React from 'react';
import { ChipStatus } from '../common/ChipStatus';
import type { PesanChat, StatusKirimPesan } from './types';

export interface GelembungObrolanProps {
  pesan?: PesanChat;
  onKirimUlang?: (pesan: PesanChat) => void;
  onHapus?: (pesan: PesanChat) => void;
  className?: string;
}

const DEFAULT_PESAN: PesanChat = {
  jenis: 'teks',
  dari: 'saya',
  teks: 'Pak, kolnya masih ada besok?',
  waktu: '10.40',
  status: 'dibaca',
};

const TEKS_STATUS: Record<StatusKirimPesan, string> = {
  mengirim: 'Mengirim',
  terkirim: 'Terkirim',
  dibaca: 'Dibaca',
  gagal: 'Gagal terkirim',
};

const WARNA_STATUS: Record<StatusKirimPesan, string> = {
  mengirim: '#3f5247',
  terkirim: '#3f5247',
  dibaca: '#157a4c',
  gagal: '#b42318',
};

export function GelembungObrolan({
  pesan = DEFAULT_PESAN,
  onKirimUlang,
  onHapus,
  className = '',
}: GelembungObrolanProps) {
  const p = pesan ?? DEFAULT_PESAN;
  const saya = (p.dari ?? 'saya') === 'saya';
  const jenis = p.jenis ?? 'teks';
  const st = p.status;
  const gagal = saya && st === 'gagal';

  const isHari = jenis === 'hari';
  const isSistem = jenis === 'sistem';
  const isBiasa = !isHari && !isSistem;
  const isFoto = jenis === 'foto';
  const isProduk = jenis === 'produk';
  const isPesanan = jenis === 'pesanan';
  const adaTeks = Boolean(p.teks && isBiasa);

  const teksStatus = (st && TEKS_STATUS[st]) ? TEKS_STATUS[st] : '';
  const warnaStatus = (st && WARNA_STATUS[st]) ? WARNA_STATUS[st] : '#3f5247';

  // Photo list generation
  const jumlahFoto = p.jumlahFoto ?? (p.fotoList?.length ?? (p.fotoUrls?.length ?? 2));
  const fotoItems = Array.from({ length: jumlahFoto }, (_, i) => ({
    label: `Placeholder foto kiriman ${i + 1}`,
    url: p.fotoUrls?.[i] ?? p.fotoList?.[i],
  }));

  const handleKirimUlang = () => {
    if (p.ulang) {
      p.ulang();
    } else if (onKirimUlang) {
      onKirimUlang(p);
    }
  };

  const handleHapus = () => {
    if (p.hapus) {
      p.hapus();
    } else if (onHapus) {
      onHapus(p);
    }
  };

  return (
    <div
      className={`flex flex-col gap-1 font-sans text-ink ${
        isHari || isSistem
          ? 'items-stretch'
          : saya
          ? 'items-end'
          : 'items-start'
      } ${className}`}
    >
      {/* Date separator */}
      {isHari && (
        <p className="self-center mt-2 mb-0 px-3 py-0.5 rounded-full bg-[#eef0eb] text-[#3f5247] text-xs font-bold">
          {p.teks}
        </p>
      )}

      {/* System event notice */}
      {isSistem && (
        <p className="self-center max-w-[92%] my-1 text-center text-xs leading-[1.5] text-[#3f5247]">
          {p.teks}
        </p>
      )}

      {/* Regular message content */}
      {isBiasa && (
        <>
          <div
            className={`max-w-[min(82%,520px)] box-border p-2.5 sm:px-3.5 flex flex-col gap-2 ${
              saya
                ? 'rounded-[16px_16px_4px_16px]'
                : 'rounded-[16px_16px_16px_4px]'
            } ${
              gagal
                ? 'bg-danger-bg text-ink border-[1.5px] border-danger'
                : saya
                ? 'bg-brand-900 text-white border border-brand-900'
                : 'bg-white text-ink border border-line'
            }`}
          >
            {/* Photos Grid */}
            {isFoto && (
              <div className="grid grid-cols-2 gap-1.5">
                {fotoItems.map((f, i) => (
                  <span
                    key={i}
                    role="img"
                    aria-label={f.label}
                    className="aspect-square rounded-[10px] grid place-items-center bg-[#e3f1df] text-[#2f7a3e] overflow-hidden"
                  >
                    {f.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.url} alt={f.label} className="w-full h-full object-cover" />
                    ) : (
                      <svg
                        className="w-[30px] h-[30px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                      </svg>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Embedded Product Card */}
            {isProduk && p.produk && (
              <a
                href={p.produk.href}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white text-ink border border-line no-underline"
              >
                <span
                  role="img"
                  aria-label={`Placeholder foto ${p.produk.nama}`}
                  className="shrink-0 w-12 h-12 rounded-[10px] grid place-items-center bg-[#e3f1df] text-[#2f7a3e] overflow-hidden"
                >
                  {p.produk.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.produk.fotoUrl} alt={p.produk.nama} className="w-full h-full object-cover" />
                  ) : (
                    <svg
                      className="w-[22px] h-[22px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0 flex flex-col gap-px">
                  <strong className="text-sm font-extrabold">{p.produk.nama}</strong>
                  <span className="text-[13px] text-[#3f5247]">{p.produk.harga}</span>
                  <span className="text-xs font-extrabold text-brand-900">Lihat produk</span>
                </span>
              </a>
            )}

            {/* Embedded Order Card */}
            {isPesanan && p.pesanan && (
              <a
                href={p.pesanan.href}
                className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-white text-ink border border-line no-underline"
              >
                <span className="flex items-center justify-between gap-2">
                  <strong className="text-sm font-extrabold">Pesanan {p.pesanan.no}</strong>
                  <ChipStatus status={p.pesanan.status} />
                </span>
                <span className="text-[13px] text-[#3f5247]">{p.pesanan.ringkas}</span>
                <span className="text-xs font-extrabold text-brand-900">Buka pesanan</span>
              </a>
            )}

            {/* Message Text */}
            {adaTeks && (
              <p className="m-0 whitespace-pre-wrap break-words text-[15px] leading-[1.5]">
                {p.teks}
              </p>
            )}
          </div>

          {/* Timestamp and delivery status indicator */}
          <p
            className={`m-0 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs ${
              saya ? 'justify-end' : 'justify-start'
            }`}
            style={{
              color: warnaStatus,
              fontWeight: gagal ? 800 : 600,
            }}
          >
            <span className="text-[#5a6b60] font-medium">{p.waktu ?? ''}</span>
            {saya && st && (
              <span className="inline-flex items-center gap-1">
                {st === 'mengirim' && (
                  <svg
                    className="w-[13px] h-[13px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                )}
                {st === 'terkirim' && (
                  <svg
                    className="w-[13px] h-[13px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
                {st === 'dibaca' && (
                  <svg
                    className="w-[15px] h-[15px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 7 17l-5-5" />
                    <path d="m22 10-7.5 7.5L13 16" />
                  </svg>
                )}
                {st === 'gagal' && (
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                )}
                <span>{teksStatus}</span>
              </span>
            )}
          </p>

          {/* Retry & Delete Buttons if Failed */}
          {gagal && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleKirimUlang}
                className="min-h-[44px] px-4 border-0 rounded-xl bg-brand-900 text-white text-sm font-extrabold cursor-pointer"
              >
                Kirim ulang
              </button>
              <button
                type="button"
                onClick={handleHapus}
                className="min-h-[44px] px-3.5 border-[1.5px] border-line rounded-xl bg-white text-danger text-sm font-bold cursor-pointer"
              >
                Hapus pesan
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
