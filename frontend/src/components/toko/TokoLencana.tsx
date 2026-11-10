'use client';

import React from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../layout';

export type KeadaanLencana = 'hampir' | 'aktif' | 'baru' | 'belum';

export interface KriteriaLencanaItem {
  id?: string;
  nama: string;
  nilaiTeks: string;
  persen: number;
  target?: number | string;
  terpenuhi: boolean;
  keterangan: string;
  tanpaBatang?: boolean;
}

export interface TokoLencanaProps {
  kriteriaList?: KriteriaLencanaItem[];
  keadaan?: KeadaanLencana;
  onTutup?: () => void;
  className?: string;
}

const DEFAULT_KRITERIA_HAMPIR: KriteriaLencanaItem[] = [
  {
    id: 'k1',
    nama: 'Toko terverifikasi',
    nilaiTeks: 'Ya',
    persen: 100,
    target: 100,
    terpenuhi: true,
    keterangan: 'KTP dan lokasi kebun sudah diverifikasi.',
    tanpaBatang: true,
  },
  {
    id: 'k2',
    nama: 'Pesanan selesai tanpa dibatalkan petani, 30 hari',
    nilaiTeks: '97%',
    persen: 97,
    target: 95,
    terpenuhi: true,
    keterangan: 'Syarat minimal 95%.',
  },
  {
    id: 'k3',
    nama: 'Pesan dibalas dalam 1 jam, 30 hari',
    nilaiTeks: '92%',
    persen: 92,
    target: 90,
    terpenuhi: true,
    keterangan: 'Syarat minimal 90%. Hanya jam buka toko yang dihitung.',
  },
  {
    id: 'k4',
    nama: 'Rating rata-rata',
    nilaiTeks: '4,4 dari 5',
    persen: 88,
    target: 90,
    terpenuhi: false,
    keterangan: 'Syarat minimal 4,5. Perlu sekitar 18 ulasan bintang 5 lagi tanpa ulasan lebih rendah.',
  },
  {
    id: 'k5',
    nama: 'Komplain dari semua pesanan, 30 hari',
    nilaiTeks: '2%',
    persen: 40,
    target: 100,
    terpenuhi: true,
    keterangan: 'Syarat paling banyak 5%. Makin kecil makin baik.',
  },
  {
    id: 'k6',
    nama: 'Pesanan selesai, 30 hari',
    nilaiTeks: '41 pesanan',
    persen: 100,
    target: 73,
    terpenuhi: true,
    keterangan: 'Syarat minimal 30 pesanan supaya angkanya cukup bermakna.',
  },
];

const DEFAULT_KRITERIA_AKTIF: KriteriaLencanaItem[] = [
  {
    id: 'k1',
    nama: 'Toko terverifikasi',
    nilaiTeks: 'Ya',
    persen: 100,
    target: 100,
    terpenuhi: true,
    keterangan: 'KTP dan lokasi kebun sudah diverifikasi.',
    tanpaBatang: true,
  },
  {
    id: 'k2',
    nama: 'Pesanan selesai tanpa dibatalkan petani, 30 hari',
    nilaiTeks: '98%',
    persen: 98,
    target: 95,
    terpenuhi: true,
    keterangan: 'Syarat minimal 95%.',
  },
  {
    id: 'k3',
    nama: 'Pesan dibalas dalam 1 jam, 30 hari',
    nilaiTeks: '94%',
    persen: 94,
    target: 90,
    terpenuhi: true,
    keterangan: 'Syarat minimal 90%. Hanya jam buka toko yang dihitung.',
  },
  {
    id: 'k4',
    nama: 'Rating rata-rata',
    nilaiTeks: '4,6 dari 5',
    persen: 92,
    target: 90,
    terpenuhi: true,
    keterangan: 'Syarat minimal 4,5.',
  },
  {
    id: 'k5',
    nama: 'Komplain dari semua pesanan, 30 hari',
    nilaiTeks: '1%',
    persen: 20,
    target: 100,
    terpenuhi: true,
    keterangan: 'Syarat paling banyak 5%. Makin kecil makin baik.',
  },
  {
    id: 'k6',
    nama: 'Pesanan selesai, 30 hari',
    nilaiTeks: '52 pesanan',
    persen: 100,
    target: 58,
    terpenuhi: true,
    keterangan: 'Syarat minimal 30 pesanan.',
  },
];

export function TokoLencana({
  kriteriaList,
  keadaan = 'hampir',
  onTutup,
  className = '',
}: TokoLencanaProps) {
  const resolvedKeadaan: KeadaanLencana =
    keadaan === 'belum' ? 'baru' : keadaan;

  const resolvedKriteria =
    kriteriaList ??
    (resolvedKeadaan === 'aktif'
      ? DEFAULT_KRITERIA_AKTIF
      : DEFAULT_KRITERIA_HAMPIR);

  const KARTU_STATUS = {
    hampir: {
      judul: 'Tinggal satu syarat lagi',
      chip: 'Progres November',
      chipBg: 'bg-[#fbf3d9] text-[#5c4500]',
      teks: 'Rating tokomu 4,4 dari syarat minimal 4,5. Syarat lainnya sudah terpenuhi. Tingkatkan kualitas layanan untuk segera meraih Petani Andalan.',
      border: 'border-[#dee3da]',
      bg: 'bg-white',
      badgeColor: 'bg-[#a8862a]',
    },
    aktif: {
      judul: 'Petani Andalan',
      chip: 'Aktif sejak 1 Okt 2026',
      chipBg: 'bg-[#ebf2eb] text-[#064e3b]',
      teks: 'Selamat! Tokomu memenuhi semua syarat standar Petani Andalan. Lencana ini tampil di kartu produk dan toko untuk meningkatkan kepercayaan pembeli.',
      border: 'border-[#157a4c]',
      bg: 'bg-[#f6f8f4]',
      badgeColor: 'bg-[#064e3b]',
    },
    baru: {
      judul: 'Belum mulai, tokomu masih baru',
      chip: 'Toko Baru',
      chipBg: 'bg-[#e0f2fe] text-[#075985]',
      teks: 'Penilaian dimulai setelah tokomu menyelesaikan 30 pesanan. Terus layani pembeli dengan ramah dan tepat waktu.',
      border: 'border-[#dee3da]',
      bg: 'bg-white',
      badgeColor: 'bg-[#5a6b60]',
    },
  };

  const kartu = KARTU_STATUS[resolvedKeadaan === 'baru' ? 'baru' : resolvedKeadaan];

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="lencana" />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[860px]">
          <div className="flex flex-col gap-4">
            {onTutup && (
              <button
                type="button"
                onClick={onTutup}
                className="self-start inline-flex items-center gap-1 text-sm font-bold text-[#157a4c] hover:underline"
              >
                ← Kembali
              </button>
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173b2b]">
                Lencana
              </h1>
              <p className="mt-1 text-sm sm:text-base text-[#3f5247]">
                Petani Andalan adalah tanda untuk toko yang konsisten mengirim, cepat membalas, dan dipercaya pembeli.
              </p>
            </div>

            {/* Top Badge Status Card */}
            <section
              aria-labelledby="judul-status"
              className={`p-4 sm:p-5 rounded-2xl border ${kartu.border} ${kartu.bg} flex flex-wrap sm:flex-nowrap items-center gap-4`}
            >
              <span
                aria-hidden="true"
                className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-white ${kartu.badgeColor}`}
              >
                <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>

              <div className="flex-1 min-w-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-extrabold ${kartu.chipBg}`}>
                  {kartu.chip}
                </span>
                <h2 id="judul-status" className="mt-1 text-lg sm:text-xl font-extrabold text-[#173b2b]">
                  {kartu.judul}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                  {kartu.teks}
                </p>
              </div>
            </section>

            {/* Criteria List Card */}
            <section
              aria-labelledby="judul-syarat"
              className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-4"
            >
              <div>
                <h2 id="judul-syarat" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                  Syarat dan progres bulan ini
                </h2>
                <p className="mt-1 text-xs text-[#5a6b60]">
                  Garis hitam vertikal di batang = batas minimum syarat.
                </p>
              </div>

              <ul className="list-none m-0 p-0 flex flex-col gap-4">
                {resolvedKriteria.map((item, idx) => {
                  const targetNum = typeof item.target === 'number'
                    ? item.target
                    : Number(item.target) || 90;
                  const clampedProgress = Math.max(0, Math.min(100, item.persen));
                  const clampedTarget = Math.max(0, Math.min(100, targetNum));

                  return (
                    <li key={item.id ?? idx} className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex items-start gap-2 text-sm sm:text-base font-bold text-[#173b2b]">
                          <span
                            aria-hidden="true"
                            className={`shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-xs font-extrabold ${
                              item.terpenuhi
                                ? 'bg-[#064e3b] text-white'
                                : 'border-2 border-[#a8862a] text-[#a8862a] bg-white'
                            }`}
                          >
                            {item.terpenuhi ? '✓' : '!'}
                          </span>
                          <span>{item.nama}</span>
                        </p>
                        <strong className="shrink-0 text-sm sm:text-base font-extrabold tabular-nums">
                          {item.nilaiTeks}
                        </strong>
                      </div>

                      {!item.tanpaBatang && (
                        <div
                          aria-hidden="true"
                          className="relative h-2.5 ml-7 rounded-full bg-[#eef0eb]"
                        >
                          <div
                            className={`h-full rounded-full ${
                              item.terpenuhi ? 'bg-[#157a4c]' : 'bg-[#a8862a]'
                            }`}
                            style={{ width: `${clampedProgress}%` }}
                          />
                          <span
                            className="absolute -top-0.5 w-0.5 h-3.5 bg-[#173b2b]"
                            style={{ left: `${clampedTarget}%` }}
                          />
                        </div>
                      )}

                      <p className="ml-7 text-xs text-[#3f5247] leading-relaxed">
                        <strong
                          className={item.terpenuhi ? 'text-[#0f5132]' : 'text-[#7a5d00]'}
                        >
                          {item.terpenuhi ? 'Terpenuhi.' : 'Belum terpenuhi.'}
                        </strong>{' '}
                        {item.keterangan}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <Link
                href="/toko/ulasan"
                className="self-start inline-flex items-center min-h-[40px] text-xs sm:text-sm font-extrabold text-[#064e3b] hover:underline"
              >
                Lihat ulasan pembeli
              </Link>
            </section>

            {/* Benefits Disclosure Card */}
            <section
              aria-labelledby="judul-manfaat"
              className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5"
            >
              <h2 id="judul-manfaat" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                Apa yang berubah kalau lencana aktif
              </h2>
              <ul className="pl-5 list-disc text-xs sm:text-sm text-[#3f5247] leading-relaxed flex flex-col gap-1.5">
                <li>Lencana tampil di kartu produk, halaman tokomu, dan kepala obrolan pembeli.</li>
                <li>Pembeli bisa menyaring toko dengan lencana Petani Andalan di pencarian.</li>
                <li>Tidak ada potongan biaya layanan yang berbeda. Lencana murni tanda kepercayaan pembeli.</li>
              </ul>

              <h3 className="mt-2 text-sm sm:text-base font-extrabold text-[#173b2b]">
                Kalau syarat tidak terpenuhi
              </h3>
              <p className="text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                Kamu dapat peringatan 7 hari sebelum akhir bulan. Lencana dicabut kalau satu syarat tidak terpenuhi dua bulan berturut-turut, dan dapat diraih kembali di bulan berikutnya.
              </p>
            </section>
          </div>
        </main>
      </div>

      <div className="lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="lainnya" />
      </div>
    </div>
  );
}

export default TokoLencana;
