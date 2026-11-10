'use client';

import React, { useRef } from 'react';

export type StatusUnggah = 'kosong' | 'mengunggah' | 'siap' | 'buram' | 'gagal';
export type BentukUnggah = 'persegi' | 'kartu' | 'lebar';

export interface UnggahFotoProps {
  status?: StatusUnggah;
  bentuk?: BentukUnggah;
  ringkas?: boolean;
  wajib?: boolean;
  persen?: number;
  label?: string;
  ket?: string;
  ukuran?: string;
  pesanBuram?: string;
  fotoUrl?: string;
  maksFoto?: number;
  fotoList?: string[];
  onChange?: (urls: string[]) => void;
  onPilih?: (file?: File) => void;
  onUlang?: () => void;
  onHapus?: () => void;
  className?: string;
}

export function UnggahFoto({
  status: statusProp,
  bentuk = 'persegi',
  ringkas = false,
  wajib = true,
  persen = 60,
  label,
  ket,
  ukuran = 'Maksimal 5 MB, JPG/PNG',
  pesanBuram = 'Foto agak buram. Pastikan tulisan terbaca jelas.',
  fotoUrl,
  maksFoto = 1,
  fotoList,
  onChange,
  onPilih,
  onUlang,
  onHapus,
  className = '',
}: UnggahFotoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive active image and status: if statusProp provided use it, otherwise if activeFoto exists -> 'siap', else 'kosong'
  const activeFoto = fotoUrl ?? (fotoList && fotoList.length > 0 ? fotoList[0] : undefined);
  const status: StatusUnggah = statusProp ?? (activeFoto ? 'siap' : 'kosong');

  const handlePilihClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    onPilih?.();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPilih?.(file);
      if (onChange) {
        onChange([URL.createObjectURL(file)]);
      }
    }
  };

  // Determine aspect ratio class & styles
  let rasioClass = 'aspect-square';
  let tinggiMin = ringkas ? '88px' : '180px';
  if (bentuk === 'kartu') {
    rasioClass = 'aspect-[1.586/1]';
    tinggiMin = ringkas ? '88px' : '140px';
  } else if (bentuk === 'lebar') {
    rasioClass = 'aspect-[4/3]';
    tinggiMin = ringkas ? '88px' : '160px';
  }

  const clampedPersen = Math.min(Math.max(persen, 0), 100);

  // Border & background based on status
  let borderClass = 'border border-line';
  if (status === 'buram') {
    borderClass = 'border-2 border-[#b45309]';
  } else if (status === 'gagal') {
    borderClass = 'border-2 border-[#b42318]';
  }

  // Render mock illustrations if no fotoUrl
  const renderMockGraphic = () => {
    if (activeFoto) {
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={activeFoto}
          alt={label ?? 'Foto unggahan'}
          className="w-full h-full object-cover"
        />
      );
    }

    if (bentuk === 'kartu') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#dbe6ee] p-4">
          <div className="w-3/4 max-w-[200px] h-24 bg-[#f4f8fb] rounded-lg shadow-sm p-3 flex gap-3 items-center border border-[#c5d4e0]">
            <div className="w-12 h-14 bg-[#b8cad8] rounded shrink-0 flex items-center justify-center text-[#556977]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-2.5 bg-[#8da2b2] rounded w-full" />
              <div className="h-2 bg-[#b8cad8] rounded w-4/5" />
              <div className="h-2 bg-[#b8cad8] rounded w-2/3" />
            </div>
          </div>
        </div>
      );
    }

    if (bentuk === 'lebar') {
      return (
        <div className="w-full h-full flex flex-col justify-end bg-[#dfeee6] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#dfeee6] via-[#c2ded0] to-[#7fb27d]" />
          <div className="relative z-10 p-3 flex justify-between items-end">
            <span className="text-xs font-bold text-[#173b2b] bg-white/80 px-2 py-0.5 rounded">Lahan Kebun</span>
          </div>
        </div>
      );
    }

    // Persegi default
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#e3f1df]">
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2f7a3e"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
        <span className="text-xs font-bold text-[#2f7a3e] mt-2">Foto Produk Asli</span>
      </div>
    );
  };

  return (
    <div className={`w-full font-sans text-ink ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Label & Requirement indicator */}
      {label && (
        <label className="block text-sm font-bold text-ink mb-1.5">
          {label} {!wajib && <span className="text-xs font-normal text-[#5a6b60]">(opsional)</span>}
        </label>
      )}

      {/* Empty State: Dashed Button */}
      {status === 'kosong' && (
        <button
          type="button"
          onClick={handlePilihClick}
          aria-label={label ?? 'Unggah foto'}
          className={`w-full ${rasioClass} box-border flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-[1.5px] border-dashed border-[#a9cfae] bg-[#f6f8f4] text-brand-900 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#157a4c]`}
          style={{ minHeight: tinggiMin }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          <span className="text-sm font-extrabold text-brand-900">
            {label ? `Pilih ${label}` : 'Pilih Foto'}
          </span>
          <span className="text-xs font-semibold text-[#3f5247]">Dari kamera atau galeri</span>
          {ukuran && <span className="text-[11px] text-[#5a6b60]">{ukuran}{maksFoto > 1 ? ` · Maksimal ${maksFoto} foto` : ''}</span>}
        </button>
      )}

      {/* Non-empty states: Preview Container */}
      {status !== 'kosong' && (
        <div className="flex flex-col gap-2">
          <div
            role="img"
            aria-label={label ?? 'Pratinjau foto'}
            className={`relative w-full ${rasioClass} rounded-xl overflow-hidden bg-[#eef0eb] ${borderClass}`}
            style={{ minHeight: tinggiMin }}
          >
            {renderMockGraphic()}

            {/* Top Right Status Badge */}
            {status === 'siap' && (
              <span
                aria-label="Foto siap"
                className="absolute top-2.5 right-2.5 w-[26px] h-[26px] rounded-full grid place-items-center bg-brand-900 text-white border-2 border-white shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            )}

            {status === 'buram' && (
              <span
                aria-label="Peringatan foto buram"
                className="absolute top-2.5 right-2.5 w-[26px] h-[26px] rounded-full grid place-items-center bg-[#b45309] text-white font-extrabold text-sm border-2 border-white shadow-sm"
              >
                !
              </span>
            )}

            {status === 'gagal' && (
              <span
                aria-label="Unggah gagal"
                className="absolute top-2.5 right-2.5 w-[26px] h-[26px] rounded-full grid place-items-center bg-[#b42318] text-white font-extrabold text-sm border-2 border-white shadow-sm"
              >
                !
              </span>
            )}

            {/* Progress bar at bottom for uploading */}
            {status === 'mengunggah' && (
              <div className="absolute left-0 right-0 bottom-0 h-2 bg-black/20">
                <div
                  className="h-full bg-brand-900"
                  style={{ width: `${clampedPersen}%` }}
                />
              </div>
            )}
          </div>

          {/* Feedback & Actions below preview */}
          {status === 'mengunggah' && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-[#3f5247] font-semibold">
                Mengirim {clampedPersen}%. Boleh lanjut isi yang lain.
              </span>
              <button
                type="button"
                onClick={onHapus ?? onUlang}
                className="text-[#b42318] font-bold p-0 border-0 bg-transparent cursor-pointer hover:underline"
              >
                Batalkan
              </button>
            </div>
          )}

          {status === 'siap' && (
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-xs font-bold text-[#157a4c] flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Terkirim. {ukuran ?? 'Foto siap'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePilihClick}
                  className="px-2.5 py-1 text-xs font-bold text-brand-900 border border-line rounded-lg bg-white cursor-pointer hover:bg-cream"
                >
                  Ganti
                </button>
                <button
                  type="button"
                  onClick={onHapus}
                  className="px-2 py-1 text-xs font-bold text-[#b42318] border-0 bg-transparent cursor-pointer hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          )}

          {status === 'buram' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#fef3c7] mt-1">
              <span className="text-xs font-bold text-[#92400e]">
                {pesanBuram}
              </span>
              <button
                type="button"
                onClick={handlePilihClick}
                className="px-3 py-1.5 text-xs font-extrabold text-white bg-brand-900 rounded-lg border-0 cursor-pointer shrink-0"
              >
                Ambil ulang
              </button>
            </div>
          )}

          {status === 'gagal' && (
            <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-[#fdecea] mt-1">
              <div>
                <p className="m-0 text-xs font-bold text-[#b42318]">
                  Gagal terkirim karena sinyal putus. Foto masih ada di HP-mu.
                </p>
                <p className="m-0 text-[11px] text-[#5a6b60]">
                  Dikirim lagi otomatis saat sinyal kembali.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onUlang ?? handlePilihClick}
                  className="px-3 py-1 text-xs font-extrabold text-white bg-brand-900 rounded-lg border-0 cursor-pointer"
                >
                  Coba lagi
                </button>
                <button
                  type="button"
                  onClick={onHapus}
                  className="px-2 py-1 text-xs font-bold text-[#b42318] border-0 bg-transparent cursor-pointer hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {ket && <p className="mt-1 text-xs text-[#5a6b60]">{ket}</p>}
    </div>
  );
}

export default UnggahFoto;
