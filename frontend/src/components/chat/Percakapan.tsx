'use client';

import React, { useState, useRef } from 'react';
import { GelembungObrolan } from './GelembungObrolan';
import type {
  RoleChat,
  KeadaanKoneksi,
  PesanChat,
  BalasanCepatItem,
  PesanProdukContext,
  PesanPesananContext,
} from './types';

export interface PercakapanProps {
  peran?: RoleChat;
  keadaan?: KeadaanKoneksi;
  sheet?: boolean;
  sempit?: boolean;
  lawanNama?: string;
  lawanSub?: string;
  lawanOnline?: boolean;
  lawanTerverifikasi?: boolean;
  lawanAndalan?: boolean;
  menitTunggu?: number;
  hrefPesanan?: string;
  hrefKembali?: string;
  daftarPesan?: PesanChat[];
  pesanList?: PesanChat[];
  balasanCepatList?: BalasanCepatItem[];
  onKirim?: (teks: string, lampiran?: File) => Promise<void> | void;
  onBalasanCepat?: (teks: string) => void;
  onTempelProduk?: (produk: PesanProdukContext) => void;
  onTempelPesanan?: (pesanan: PesanPesananContext) => void;
  onSambungUlang?: () => void;
  onKirimUlang?: (pesanId: string) => void;
  onKirimUlangPesan?: (pesanId: string) => void;
  onHapusPesan?: (pesanId: string) => void;
  className?: string;
}

const BALASAN_CEPAT_DEFAULT: BalasanCepatItem[] = [
  { judul: 'Pesanan diproses', isi: 'Terima kasih sudah memesan. Pesanan Ibu kami proses hari ini.' },
  { judul: 'Stok dan panen', isi: 'Stok hari ini ready. Panen berikutnya Kamis, kabarnya kami tulis di Daftar Tunggu.' },
  { judul: 'Pengiriman', isi: 'Kami kirim lewat JNE Reguler. Resi menyusul setelah paket diserahkan ke kurir.' },
  { judul: 'Minta foto', isi: 'Boleh kirim foto produknya? Kami bantu cek.' },
  { judul: 'Ada masalah', isi: 'Mohon maaf atas ketidaknyamanannya. Silakan ajukan komplain lewat detail pesanan supaya dana aman dan tercatat.' },
  { judul: 'Harga grosir', isi: 'Harga grosir mulai 10 kg. Tangga harganya ada di halaman produk.' },
];

function getInitialMessages(
  keadaan: string,
  hrefPesanan: string
): PesanChat[] {
  return [
    { id: 'h1', jenis: 'hari', teks: 'Min, 8 Nov' },
    { id: 's1', jenis: 'sistem', teks: 'Obrolan dimulai dari pesanan PT-26110418.' },
    {
      id: 'm1',
      siapa: 'dewi',
      jenis: 'pesanan',
      waktu: '10.38',
      status: 'dibaca',
      pesanan: {
        no: 'PT-26110418',
        status: 'tiba',
        ringkas: 'Tomat 12 kg, Kol 16 kg · Rp 286.720',
        href: hrefPesanan,
      },
    },
    {
      id: 'm2',
      siapa: 'dewi',
      jenis: 'teks',
      teks: 'Pak, kol yang sampai ada beberapa yang layu di bagian luar. Boleh saya kirim foto?',
      waktu: '10.40',
      status: 'dibaca',
    },
    {
      id: 'm3',
      siapa: 'ujang',
      jenis: 'teks',
      teks: 'Boleh Bu Dewi, silakan. Tolong difoto dulu sebelum dibuang ya.',
      waktu: '11.05',
    },
    {
      id: 'm4',
      siapa: 'dewi',
      jenis: 'foto',
      teks: 'Ini fotonya, Pak.',
      waktu: '11.12',
      status: 'dibaca',
      jumlahFoto: 2,
    },
    { id: 'h2', jenis: 'hari', teks: 'Hari ini, Sen 9 Nov' },
    {
      id: 'm5',
      siapa: 'ujang',
      jenis: 'teks',
      teks: 'Bu Dewi, fotonya sudah saya lihat. Kolnya memang sempat tertahan di gudang JNE. Supaya tercatat dan dananya aman, tolong ajukan lewat komplain di detail pesanan ya.',
      waktu: '08.12',
    },
    {
      id: 'm6',
      siapa: 'dewi',
      jenis: 'produk',
      teks: 'Sekalian, kol ini ready lagi hari Rabu?',
      waktu: '09.20',
      status: 'dibaca',
      produk: {
        nama: 'Kol Bulat Lembang',
        harga: 'Rp 8.000/kg · grosir mulai 10 kg',
        href: '#',
      },
    },
    {
      id: 'm7',
      siapa: 'dewi',
      jenis: 'teks',
      teks: 'Oke Pak, saya ajukan komplainnya sekarang.',
      waktu: '09.28',
      status: keadaan === 'gagal' ? 'gagal' : (keadaan === 'putus' ? 'mengirim' : 'dibaca'),
    },
  ];
}

export function Percakapan({
  peran = 'pembeli',
  keadaan = 'normal',
  sheet = false,
  sempit = false,
  lawanNama: lawanNamaProp,
  lawanSub: lawanSubProp,
  lawanOnline = true,
  lawanTerverifikasi = true,
  lawanAndalan = true,
  menitTunggu = 18,
  hrefPesanan = '/pesanan/PT-26110418',
  hrefKembali = '/obrolan',
  daftarPesan,
  pesanList: pesanListProp,
  balasanCepatList = BALASAN_CEPAT_DEFAULT,
  onKirim,
  onBalasanCepat,
  onTempelProduk,
  onTempelPesanan,
  onSambungUlang,
  onKirimUlang,
  onKirimUlangPesan,
  onHapusPesan,
  className = '',
}: PercakapanProps) {
  const petani = peran === 'petani';
  const sayaId = petani ? 'ujang' : 'dewi';

  const defaultNama = petani ? 'Dewi Lestari' : 'Kebun Mang Ujang';
  const namaLawan = lawanNamaProp ?? defaultNama;
  const inisial = namaLawan
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();

  const [isi, setIsi] = useState('');

  // Disconnection state tracking without effect
  const [putus, setPutus] = useState(keadaan === 'putus');
  const [prevKeadaan, setPrevKeadaan] = useState(keadaan);
  if (keadaan !== prevKeadaan) {
    setPrevKeadaan(keadaan);
    setPutus(keadaan === 'putus');
  }

  const [pulih, setPulih] = useState(false);
  const [menuLampir, setMenuLampir] = useState(false);
  const [panelCepat, setPanelCepat] = useState(sheet);

  // Message stream tracking without effect
  const incomingMessages = pesanListProp ?? daftarPesan;
  const [pesanList, setPesanList] = useState<PesanChat[]>(() =>
    incomingMessages ?? getInitialMessages(keadaan, hrefPesanan)
  );
  const [prevDaftarPesan, setPrevDaftarPesan] = useState(incomingMessages);
  if (incomingMessages !== prevDaftarPesan) {
    setPrevDaftarPesan(incomingMessages);
    if (incomingMessages) {
      setPesanList(incomingMessages);
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // SLA calculations for farmer role
  const overTarget = menitTunggu > 60;
  const sisaMenit = Math.max(0, 60 - menitTunggu);
  const teksTunggu = overTarget
    ? `Lewat target 1 jam (${Math.floor(menitTunggu / 60)} jam ${menitTunggu % 60} mnt)`
    : `${namaLawan.split(' ')[0] ?? 'Pembeli'} menunggu ${menitTunggu} mnt, sisa ${sisaMenit} mnt dari target 1 jam`;
  const warnaTunggu = overTarget ? '#8a1c12' : (sisaMenit <= 15 ? '#92400e' : '#3f5247');
  const warnaBar = overTarget ? '#b42318' : (sisaMenit <= 15 ? '#b45309' : '#157a4c');
  const lebarBar = `${Math.min(100, Math.round((menitTunggu / 60) * 100))}%`;

  const subLawan = lawanSubProp ?? (
    petani
      ? 'UMKM · Pesanan PT-26110418'
      : putus
      ? 'Terakhir aktif 09.30 · biasanya membalas dalam ±1 jam'
      : (lawanOnline ? 'Biasanya membalas dalam ±1 jam' : 'Tidak aktif')
  );

  const handleKirim = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const teksTrim = isi.trim();
    if (!teksTrim) return;

    const baruId = `b_${Date.now()}`;
    const sekarang = new Date();
    const jamStr = sekarang.getHours().toString().padStart(2, '0') + '.' + sekarang.getMinutes().toString().padStart(2, '0');

    const pesanBaru: PesanChat = {
      id: baruId,
      jenis: 'teks',
      siapa: sayaId,
      dari: 'saya',
      teks: teksTrim,
      waktu: jamStr,
      status: putus ? 'mengirim' : 'terkirim',
    };

    setPesanList((prev) => [...prev, pesanBaru]);
    setIsi('');
    setMenuLampir(false);

    if (onKirim) {
      await onKirim(teksTrim);
    }
  };

  const handlePilihCepat = (cIsi: string) => {
    setIsi((prev) => (prev ? `${prev} ${cIsi}` : cIsi));
    if (sempit) {
      setPanelCepat(false);
    }
    if (onBalasanCepat) {
      onBalasanCepat(cIsi);
    }
  };

  const handleTempelProdukDefault = () => {
    const pBaru: PesanProdukContext = {
      nama: 'Kol Bulat Lembang',
      harga: 'Rp 8.000/kg · grosir mulai 10 kg',
      href: '#',
    };
    const baru: PesanChat = {
      id: `prod_${Date.now()}`,
      jenis: 'produk',
      siapa: sayaId,
      dari: 'saya',
      teks: '',
      waktu: 'Baru saja',
      status: putus ? 'mengirim' : 'terkirim',
      produk: pBaru,
    };
    setPesanList((prev) => [...prev, baru]);
    setMenuLampir(false);
    if (onTempelProduk) {
      onTempelProduk(pBaru);
    }
  };

  const handleTempelPesananDefault = () => {
    const oBaru: PesanPesananContext = {
      no: 'PT-26110418',
      status: 'tiba',
      ringkas: 'Tomat 12 kg, Kol 16 kg · Rp 286.720',
      href: hrefPesanan,
    };
    const baru: PesanChat = {
      id: `ord_${Date.now()}`,
      jenis: 'pesanan',
      siapa: sayaId,
      dari: 'saya',
      teks: '',
      waktu: 'Baru saja',
      status: putus ? 'mengirim' : 'terkirim',
      pesanan: oBaru,
    };
    setPesanList((prev) => [...prev, baru]);
    setMenuLampir(false);
    if (onTempelPesanan) {
      onTempelPesanan(oBaru);
    }
  };

  const handleSambungSekarang = () => {
    setPutus(false);
    setPulih(true);
    setPesanList((prev) =>
      prev.map((m) =>
        m.status === 'mengirim' ? { ...m, status: 'terkirim' } : m
      )
    );
    if (onSambungUlang) {
      onSambungUlang();
    }
  };

  const handleKirimUlangInternal = (pTarget: PesanChat) => {
    const targetId = pTarget.id;
    if (!targetId) return;

    setPesanList((prev) =>
      prev.map((m) =>
        m.id === targetId ? { ...m, status: 'terkirim' } : m
      )
    );

    if (onKirimUlang) onKirimUlang(targetId);
    if (onKirimUlangPesan) onKirimUlangPesan(targetId);
  };

  const handleHapusInternal = (pTarget: PesanChat) => {
    const targetId = pTarget.id;
    if (!targetId) return;

    setPesanList((prev) => prev.filter((m) => m.id !== targetId));
    if (onHapusPesan) onHapusPesan(targetId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const baru: PesanChat = {
      id: `foto_${Date.now()}`,
      jenis: 'foto',
      siapa: sayaId,
      dari: 'saya',
      teks: 'Foto terlampir',
      waktu: 'Baru saja',
      status: putus ? 'mengirim' : 'terkirim',
      jumlahFoto: 1,
      fotoUrls: [url],
    };
    setPesanList((prev) => [...prev, baru]);
    if (onKirim) {
      onKirim('Foto terlampir', file);
    }
  };

  return (
    <section
      aria-label={`Percakapan dengan ${namaLawan}`}
      className={`box-border w-full flex flex-col bg-cream overflow-hidden font-sans text-ink ${
        sempit ? 'border-0 rounded-none' : 'border border-line rounded-2xl'
      } ${className}`}
    >
      {/* Header */}
      <header className="flex flex-col gap-2 p-3 sm:px-3.5 bg-white border-b border-line">
        <div className="flex items-center gap-2.5">
          {sempit && (
            <a
              href={hrefKembali}
              aria-label="Kembali ke daftar obrolan"
              className="shrink-0 w-11 h-11 grid place-items-center rounded-xl text-ink no-underline"
            >
              <svg
                className="w-[22px] h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </a>
          )}

          <span
            aria-hidden="true"
            className={`shrink-0 w-11 h-11 rounded-xl grid place-items-center text-sm font-extrabold ${
              petani ? 'bg-[#fbf3d9] text-[#5c4500]' : 'bg-brand-900 text-white'
            }`}
          >
            {inisial}
          </span>

          <div className="flex-1 min-w-0">
            <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <strong className="text-base font-extrabold">{namaLawan}</strong>
              {!petani && (
                <>
                  {lawanTerverifikasi && (
                    <span className="inline-flex items-center gap-[3px] px-1.5 rounded-md bg-[#075985] text-white text-xs leading-[18px] font-extrabold">
                      <svg
                        className="w-[11px] h-[11px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Terverifikasi
                    </span>
                  )}
                  {lawanAndalan && (
                    <span className="inline-flex items-center gap-[3px] px-1.5 rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs leading-[18px] font-extrabold">
                      <svg
                        className="w-[11px] h-[11px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                      </svg>
                      Petani Andalan
                    </span>
                  )}
                </>
              )}
            </p>
            <p className="m-0 mt-px flex items-center gap-1.5 text-xs text-[#3f5247]">
              <span
                aria-hidden="true"
                className={`shrink-0 w-2 h-2 rounded-full ${
                  putus ? 'bg-[#9aa79e]' : 'bg-[#15803d]'
                }`}
              />
              {subLawan}
            </p>
          </div>

          {!sempit && (
            <a
              href={hrefPesanan}
              className="shrink-0 inline-flex items-center min-h-[44px] px-3.5 border-[1.5px] border-line rounded-xl text-brand-900 text-sm font-extrabold no-underline"
            >
              Buka pesanan
            </a>
          )}
        </div>

        {/* Farmer 1-hour SLA tracker */}
        {petani && !putus && (
          <div className="flex flex-col gap-1">
            <p
              className="m-0 flex items-center gap-1.5 text-xs font-extrabold"
              style={{ color: warnaTunggu }}
            >
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
              {teksTunggu}
            </p>
            <span
              aria-hidden="true"
              className="block h-1.5 rounded-full bg-[#eef0eb] overflow-hidden"
            >
              <span
                className="block h-full"
                style={{ width: lebarBar, backgroundColor: warnaBar }}
              />
            </span>
          </div>
        )}

        {/* Disconnection Warning Banner */}
        {putus && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:px-3 rounded-xl bg-[#fef3c7] text-[#92400e]"
          >
            <p className="m-0 flex-1 min-w-[200px] text-[13px] leading-[1.45] font-bold">
              Sambungan terputus, menyambung ulang. Pesan yang kamu tulis menunggu dan terkirim otomatis begitu tersambung.
            </p>
            <button
              type="button"
              onClick={handleSambungSekarang}
              className="shrink-0 min-h-[44px] px-3.5 border-[1.5px] border-[#92400e] rounded-xl bg-white text-[#92400e] text-[13px] font-extrabold cursor-pointer"
            >
              Sambung sekarang
            </button>
          </div>
        )}

        {/* Reconnection Recovery Confirmation */}
        {pulih && (
          <p role="status" className="m-0 text-xs font-bold text-[#157a4c]">
            Tersambung lagi. Pesan yang menunggu sudah terkirim.
          </p>
        )}
      </header>

      {/* Message Stream */}
      <div
        ref={scrollRef}
        role="log"
        aria-label="Pesan"
        aria-live="polite"
        className="flex flex-col gap-2.5 p-3.5 bg-[#f6f8f4] box-border overflow-y-auto max-h-[640px]"
      >
        {pesanList.map((m, idx) => {
          // Normalize direction
          const dari = m.dari ?? (m.siapa === sayaId ? 'saya' : 'lawan');
          const pesanObj: PesanChat = {
            ...m,
            dari,
            status: dari === 'saya' ? m.status : undefined,
          };
          return (
            <GelembungObrolan
              key={m.id ?? idx}
              pesan={pesanObj}
              onKirimUlang={handleKirimUlangInternal}
              onHapus={handleHapusInternal}
            />
          );
        })}
      </div>

      {/* Context Attachment Drawer */}
      {menuLampir && (
        <div className="p-2.5 sm:px-3.5 bg-white border-t border-line flex flex-wrap gap-2 items-center">
          <span className="text-[13px] font-bold text-[#3f5247]">Tempel ke obrolan:</span>
          <button
            type="button"
            onClick={handleTempelProdukDefault}
            className="min-h-[44px] px-3.5 border-[1.5px] border-line rounded-full bg-white text-ink text-sm font-bold cursor-pointer"
          >
            Kol Bulat Lembang
          </button>
          <button
            type="button"
            onClick={handleTempelPesananDefault}
            className="min-h-[44px] px-3.5 border-[1.5px] border-line rounded-full bg-white text-ink text-sm font-bold cursor-pointer"
          >
            Pesanan PT-26110418
          </button>
        </div>
      )}

      {/* Quick Replies Panel (Farmer) */}
      {petani && panelCepat && (
        <div
          role="region"
          aria-label="Balasan cepat"
          className={`p-3 sm:px-3.5 pt-3 pb-2 bg-white border-t border-line flex flex-col gap-1.5 ${
            sempit
              ? 'rounded-t-2xl shadow-[0_-12px_32px_rgba(6,78,59,0.16)]'
              : 'rounded-none shadow-none'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="m-0 text-[15px] font-extrabold">Balasan cepat</h2>
            <button
              type="button"
              onClick={() => setPanelCepat(false)}
              className="min-h-[44px] px-3 border-0 bg-transparent text-[#3f5247] text-sm font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
          <p className="m-0 text-xs text-[#5a6b60]">
            Ketuk untuk menaruh teks di kotak pesan. Kamu masih bisa mengubahnya sebelum kirim.
          </p>
          <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
            {balasanCepatList.map((c, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => handlePilihCepat(c.isi)}
                  className="w-full box-border min-h-[48px] p-2 sm:px-3 border border-line rounded-xl bg-cream text-ink text-sm leading-[1.45] text-left cursor-pointer"
                >
                  <strong className="font-extrabold">{c.judul}</strong>
                  <br />
                  <span className="text-[#3f5247]">{c.isi}</span>
                </button>
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="self-start inline-flex items-center min-h-[44px] text-sm font-extrabold text-brand-900 no-underline"
          >
            Atur balasan cepat (maks. 10)
          </a>
        </div>
      )}

      {/* Hidden File Input for Photos */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Composer Form */}
      <form
        onSubmit={handleKirim}
        className={`bottom-0 z-4 flex items-end gap-2 p-2.5 sm:px-3.5 bg-white border-t border-line ${
          sempit ? 'sticky pb-[calc(10px+env(safe-area-inset-bottom,0px))]' : 'relative'
        }`}
      >
        <button
          type="button"
          aria-label="Lampirkan foto"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 w-11 h-11 grid place-items-center border-[1.5px] border-line rounded-xl bg-white text-ink cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Tempel produk atau pesanan"
          aria-expanded={menuLampir}
          onClick={() => {
            setMenuLampir(!menuLampir);
            setPanelCepat(false);
          }}
          className="shrink-0 w-11 h-11 grid place-items-center border-[1.5px] border-line rounded-xl bg-white text-ink cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>

        {petani && (
          <button
            type="button"
            aria-label="Balasan cepat"
            aria-expanded={panelCepat}
            onClick={() => {
              setPanelCepat(!panelCepat);
              setMenuLampir(false);
            }}
            className="shrink-0 w-11 h-11 grid place-items-center border-[1.5px] border-brand-900 rounded-xl bg-tint text-brand-900 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
          </button>
        )}

        <label htmlFor="tulis-pesan" className="sr-only">
          Tulis pesan
        </label>
        <textarea
          id="tulis-pesan"
          rows={1}
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          placeholder="Tulis pesan"
          className="flex-1 min-w-0 box-border min-h-[44px] max-h-[120px] p-2.5 sm:px-3 border-[1.5px] border-[#c9d2c6] rounded-xl text-ink font-sans text-[15px] leading-[1.4] resize-none"
        />

        <button
          type="submit"
          aria-label="Kirim pesan"
          className="shrink-0 min-w-[44px] h-11 px-3.5 border-0 rounded-xl bg-brand-900 text-white font-sans text-sm font-extrabold cursor-pointer"
        >
          Kirim
        </button>
      </form>
    </section>
  );
}
