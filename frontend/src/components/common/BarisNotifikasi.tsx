import React from 'react';

export type IkonNotifikasi = 'tag' | 'paket' | 'truk' | 'tunas' | 'dompet' | 'uang' | 'langganan';

export interface ItemNotifikasi {
  id?: string;
  ikon?: IkonNotifikasi;
  judul: string;
  isi: string;
  waktu: string;
  baru?: boolean;
  tindakan?: boolean;
  aksi?: string;
  href?: string;
}

export interface BarisNotifikasiProps {
  item?: ItemNotifikasi;
  notifikasi?: ItemNotifikasi;
  ikon?: IkonNotifikasi;
  judul?: string;
  isi?: string;
  waktu?: string;
  baru?: boolean;
  tindakan?: boolean;
  aksi?: string;
  href?: string;
  onAksi?: (item?: ItemNotifikasi) => void;
  onKlik?: (item?: ItemNotifikasi) => void;
  className?: string;
}

const DEFAULT_ITEM: ItemNotifikasi = {
  ikon: 'tag',
  judul: 'Kol Bulat Lembang masuk Surplus',
  isi: 'Harga Rp 4.500/kg, hemat 45% dari harga reguler. Panen 2 hari lalu.',
  waktu: '10 menit lalu',
  baru: true,
  tindakan: false,
  href: '#',
};

function renderSemanticIcon(ikon: IkonNotifikasi) {
  switch (ikon) {
    case 'tag':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
          <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
        </svg>
      );
    case 'paket':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.29 7 12 12l8.71-5M12 22V12" />
        </svg>
      );
    case 'truk':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M14 9h4l3 3v5a1 1 0 0 1-1 1h-2" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
      );
    case 'tunas':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 20h10" />
          <path d="M10 20c5.5-2.5.8-6.4 3-10" />
          <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z" />
          <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4.3 1-4.9 2z" />
        </svg>
      );
    case 'dompet':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </svg>
      );
    case 'uang':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="12" x="2" y="6" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    case 'langganan':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      );
  }
}

function getIconTheme(ikon: IkonNotifikasi) {
  switch (ikon) {
    case 'tag':
      return { bg: '#fff1ea', text: '#c2410c' };
    case 'paket':
    case 'truk':
      return { bg: '#ebf2eb', text: '#157a4c' };
    case 'tunas':
    case 'uang':
      return { bg: '#dcfce7', text: '#15803d' };
    case 'dompet':
      return { bg: '#e0f2fe', text: '#075985' };
    case 'langganan':
      return { bg: '#fef3c7', text: '#92400e' };
  }
}

export function BarisNotifikasi({
  item: itemProp,
  notifikasi,
  ikon: ikonProp,
  judul: judulProp,
  isi: isiProp,
  waktu: waktuProp,
  baru: baruProp,
  tindakan: tindakanProp,
  aksi: aksiProp,
  href: hrefProp,
  onAksi,
  onKlik,
  className = '',
}: BarisNotifikasiProps) {
  const baseItem = itemProp ?? notifikasi ?? DEFAULT_ITEM;

  const resolvedItem: ItemNotifikasi = {
    id: baseItem.id,
    ikon: ikonProp ?? baseItem.ikon ?? 'tag',
    judul: judulProp ?? baseItem.judul,
    isi: isiProp ?? baseItem.isi,
    waktu: waktuProp ?? baseItem.waktu,
    baru: baruProp !== undefined ? baruProp : baseItem.baru,
    tindakan: tindakanProp !== undefined ? tindakanProp : baseItem.tindakan,
    aksi: aksiProp ?? baseItem.aksi,
    href: hrefProp ?? baseItem.href ?? '#',
  };

  const isUrgent = resolvedItem.tindakan === true;

  if (isUrgent) {
    return (
      <div
        className={`box-border p-3.5 sm:p-4 border-[1.5px] border-[#e9c75c] rounded-[14px] bg-[#fffdf5] flex flex-col gap-2.5 font-sans text-ink ${className}`}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="shrink-0 w-9 h-9 rounded-full grid place-items-center bg-[#fef3c7] text-[#92400e]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-xs font-extrabold text-[#92400e]">
              Perlu tindakan · {resolvedItem.waktu}
            </p>
            <p className="m-0 mt-0.5 text-[15px] leading-[1.4] font-extrabold text-ink">
              {resolvedItem.judul}
            </p>
            <p className="m-0 mt-1 text-sm leading-[1.5] text-[#3f5247]">
              {resolvedItem.isi}
            </p>
          </div>
        </div>

        <div className="self-start">
          {onAksi ? (
            <button
              type="button"
              onClick={() => onAksi(resolvedItem)}
              className="inline-flex items-center min-h-[44px] px-[18px] rounded-xl bg-brand-900 text-white text-sm font-extrabold border-0 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#157a4c]"
            >
              {resolvedItem.aksi ?? 'Buka tindakan'}
            </button>
          ) : (
            <a
              href={resolvedItem.href}
              className="inline-flex items-center min-h-[44px] px-[18px] rounded-xl bg-brand-900 text-white text-sm font-extrabold no-underline focus-visible:outline-3 focus-visible:outline-[#157a4c]"
            >
              {resolvedItem.aksi ?? 'Buka tindakan'}
            </a>
          )}
        </div>
      </div>
    );
  }

  const iconTheme = getIconTheme(resolvedItem.ikon ?? 'tag');

  const content = (
    <>
      <span
        aria-hidden="true"
        className="shrink-0 w-9 h-9 rounded-full grid place-items-center"
        style={{ backgroundColor: iconTheme.bg, color: iconTheme.text }}
      >
        {renderSemanticIcon(resolvedItem.ikon ?? 'tag')}
      </span>

      <div className="flex-1 min-w-0">
        <p
          className={`m-0 text-[15px] leading-[1.4] ${
            resolvedItem.baru ? 'font-extrabold text-ink' : 'font-semibold text-ink'
          }`}
        >
          {resolvedItem.judul}
        </p>
        <p className="m-0 mt-0.5 text-sm leading-[1.5] text-[#3f5247]">
          {resolvedItem.isi}
        </p>
        <p className="m-0 mt-1 text-xs text-[#5a6b60]">
          {resolvedItem.waktu}
        </p>
      </div>

      {resolvedItem.baru && (
        <span
          className="shrink-0 relative w-2.5 h-2.5 mt-1.5 rounded-full bg-[#157a4c]"
          title="Belum dibaca"
        >
          <span className="sr-only">Belum dibaca</span>
        </span>
      )}
    </>
  );

  const containerClasses = `box-border flex items-start gap-3 p-3 sm:py-3 sm:px-3.5 rounded-[14px] text-ink no-underline text-left w-full border-0 focus-visible:outline-3 focus-visible:outline-[#157a4c] ${
    resolvedItem.baru ? 'bg-[#f3faf3]' : 'bg-transparent'
  } ${className}`;

  if (onKlik) {
    return (
      <button
        type="button"
        onClick={() => onKlik(resolvedItem)}
        className={`${containerClasses} cursor-pointer`}
      >
        {content}
      </button>
    );
  }

  return (
    <a href={resolvedItem.href} className={containerClasses}>
      {content}
    </a>
  );
}

export default BarisNotifikasi;
