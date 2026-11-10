'use client';

import React from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { DaftarObrolan } from '../../chat/DaftarObrolan';
import type { ObrolanListItem } from '../../chat/types';

export interface ObrolanTokoItem {
  id: string;
  namaLawan: string;
  fotoLawan?: string;
  pesanTerakhir: string;
  waktu: string;
  belumDibacaCount: number;
  topikTerkait?: string;
  noPesanan?: string;
  statusBalasCepat?: boolean;
}

export interface TokoObrolanProps {
  obrolanList?: ObrolanTokoItem[];
  kosong?: boolean;
  lewat?: boolean;
  persentaseBalas1Jam?: number;
  targetBatasPersen?: number;
  syaratAndalanTerpenuhi?: boolean;
  hrefAturJam?: string;
  onPilihPercakapan?: (id: string) => void;
  className?: string;
}

const DEFAULT_OBROLAN_LIST: ObrolanTokoItem[] = [
  {
    id: 'dewi',
    namaLawan: 'Warung Dewi',
    pesanTerakhir: 'Pak Ujang, tomat yang 12 kg kemarin masih ada stok untuk besok?',
    waktu: '11.08',
    belumDibacaCount: 2,
    topikTerkait: 'Pesanan PT-26110418',
    noPesanan: 'PT-26110418',
    statusBalasCepat: true,
  },
  {
    id: 'katering-sari',
    namaLawan: 'Katering Sari Rasa',
    pesanTerakhir: 'Bisa minta tolong diantar jam 7 pagi sebelum kami mulai masak?',
    waktu: '10.35',
    belumDibacaCount: 1,
    topikTerkait: 'Pesanan PT-26110806',
    noPesanan: 'PT-26110806',
    statusBalasCepat: true,
  },
  {
    id: 'asep',
    namaLawan: 'Asep Saepudin',
    pesanTerakhir: 'Terima kasih mang, kol sudah sampai segar semua.',
    waktu: 'Kemarin',
    belumDibacaCount: 0,
    topikTerkait: 'Pesanan PT-26110714',
    noPesanan: 'PT-26110714',
    statusBalasCepat: false,
  },
];

export function TokoObrolan({
  obrolanList = DEFAULT_OBROLAN_LIST,
  kosong = false,
  lewat = false,
  persentaseBalas1Jam = 92,
  targetBatasPersen = 90,
  syaratAndalanTerpenuhi = true,
  hrefAturJam = '/toko/pengaturan/jam-operasional',
  onPilihPercakapan,
  className = '',
}: TokoObrolanProps) {
  const isKosong = kosong || obrolanList.length === 0;

  // Convert obrolanList to DaftarObrolan format
  const mappedList: ObrolanListItem[] = obrolanList.map((item) => ({
    id: item.id,
    nama: item.namaLawan,
    sub: item.topikTerkait ?? (item.noPesanan ? `Pesanan ${item.noPesanan}` : ''),
    terakhir: item.pesanTerakhir,
    waktu: item.waktu,
    belum: item.belumDibacaCount,
    cepat: item.statusBalasCepat,
    avatarUrl: item.fotoLawan,
  }));

  const subtitleText = isKosong
    ? 'Belum ada pesan.'
    : lewat
    ? '2 percakapan menunggu balasan, 1 sudah lewat target 1 jam.'
    : '2 percakapan menunggu balasan. Yang paling lama sudah 52 menit.';

  return (
    <div className={`relative min-h-full bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas notif={5} obrolan={2} />
      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden min-[900px]:block w-[272px] shrink-0 p-5 pt-5 pb-6 pl-5">
          <TokoSamping aktif="obrolan" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 min-[900px]:px-6 min-[900px]:py-5 min-[900px]:pb-12">
          <div className="max-w-[1000px] flex flex-col gap-4">
            {/* Header */}
            <div>
              <h1 className="text-2xl min-[900px]:text-[28px] font-extrabold tracking-tight leading-tight m-0">
                Obrolan
              </h1>
              <p className="mt-1.5 mb-0 text-[15px] leading-relaxed text-[#3f5247]">
                {subtitleText}
              </p>
            </div>

            {/* SLA Target Performance Banner */}
            <section
              aria-labelledby="judul-target-balas"
              className="p-4 min-[900px]:px-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 min-[640px]:gap-3">
                <h2 id="judul-target-balas" className="text-[17px] font-extrabold m-0">
                  Target: balas dalam 1 jam
                </h2>
                {syaratAndalanTerpenuhi && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs font-extrabold leading-normal">
                    <svg
                      width="11"
                      height="11"
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
                    Syarat Petani Andalan: terpenuhi
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="m-0 flex justify-between gap-3 text-sm">
                  <span>Pesan dibalas dalam 1 jam, 30 hari terakhir</span>
                  <strong className="tabular-nums font-extrabold">{persentaseBalas1Jam}%</strong>
                </p>
                <span
                  aria-hidden="true"
                  className="relative block h-2.5 rounded-full bg-[#eef0eb]"
                >
                  <span
                    style={{ width: `${persentaseBalas1Jam}%` }}
                    className="block h-full rounded-full bg-[#157a4c]"
                  />
                  <span
                    style={{ left: `${targetBatasPersen}%` }}
                    className="absolute -top-1 w-0.5 h-4 bg-[#173b2b]"
                  />
                </span>
                <p className="m-0 text-xs leading-relaxed text-[#5a6b60]">
                  Garis hitam = batas syarat, {targetBatasPersen}% (sementara). Ini salah satu syarat Petani Andalan; syarat lain ada di halaman Lencana. Hanya jam buka toko yang dihitung; saat Toko Libur atau di luar jam buka, hitungan berhenti. Balasan otomatis tidak dihitung.
                </p>
              </div>

              <Link
                href={hrefAturJam}
                className="self-start inline-flex items-center min-h-[44px] text-sm font-extrabold text-[#064e3b] no-underline"
              >
                Atur jam buka toko
              </Link>
            </section>

            {/* Main Split Content */}
            <div className="flex items-start gap-6">
              {/* Left Column: DaftarObrolan */}
              <div className="w-full min-[900px]:w-[400px] shrink-0 min-w-0">
                <DaftarObrolan
                  peran="petani"
                  aktif=""
                  kosong={isKosong}
                  lewat={lewat}
                  daftar={mappedList}
                  onPilih={onPilihPercakapan}
                />
              </div>

              {/* Right Column: Empty Placeholder (Desktop) */}
              <section
                aria-label="Percakapan"
                className="hidden min-[900px]:flex flex-1 min-w-0 min-h-[420px] p-8 border-[1.5px] border-dashed border-[#c9d2c6] rounded-2xl bg-white flex-col items-center justify-center text-center gap-2.5"
              >
                <h2 className="text-lg font-extrabold m-0">Pilih percakapan</h2>
                <p className="text-sm leading-relaxed text-[#3f5247] max-w-[36ch] m-0">
                  Yang menunggu paling lama ada di atas bar waktunya. Gunakan balasan cepat untuk pertanyaan yang sering datang.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="min-[900px]:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="lainnya" />
      </div>
    </div>
  );
}
