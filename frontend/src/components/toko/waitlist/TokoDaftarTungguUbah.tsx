'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import type { KampanyeDaftarTungguDetailData } from './TokoDaftarTungguDetail';

export interface TokoDaftarTungguUbahProps {
  kampanyeId?: string;
  kampanye?: KampanyeDaftarTungguDetailData;
  onSimpan?: (kampanyeId: string, data: unknown) => void;
  className?: string;
}

const DEFAULT_UBAH_KAMPANYE: KampanyeDaftarTungguDetailData = {
  id: 'kentang',
  namaTanaman: 'Kentang Granola',
  varietas: 'Granola Lembang',
  sub: 'Lahan Cikole · petak bawah',
  kuotaKg: 1500,
  min: 1090,
  maks: 1480,
  pengikut: 31,
  komitmen: 14,
  tanggalTanam: 'Sab, 29 Agu 2026',
  hargaPerKg: 16500,
  deskripsiLahan: 'petak bawah',
};

export function TokoDaftarTungguUbah({
  kampanyeId = 'kentang',
  kampanye = DEFAULT_UBAH_KAMPANYE,
  onSimpan,
  className = '',
}: TokoDaftarTungguUbahProps) {
  const [petak, setPetak] = useState<string>(kampanye.deskripsiLahan ?? 'petak bawah');
  const [catatan, setCatatan] = useState<string>(
    'Bibit G2 bersertifikasi ditanam di Cikole dengan pupuk kandang matang.'
  );
  const [terimaBaru, setTerimaBaru] = useState<boolean>(true);
  const [harga, setHarga] = useState<string>(String(kampanye.hargaPerKg ?? 16500));
  const [kuota, setKuota] = useState<string>(String(kampanye.kuotaKg ?? 1500));
  const [minimal, setMinimal] = useState<string>('10');

  const [pesanGalat, setPesanGalat] = useState<string>('');
  const [pesanSukses, setPesanSukses] = useState<string>('');

  const minKomitmenTerkunci = kampanye.min ?? 1090;

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    setPesanGalat('');

    const kuotaNum = parseInt(kuota.replace(/\D/g, ''), 10);
    const hargaNum = parseInt(harga.replace(/\D/g, ''), 10);

    if (isNaN(hargaNum) || hargaNum < 1000) {
      setPesanGalat('Harga per kg minimal Rp 1.000.');
      return;
    }

    if (isNaN(kuotaNum) || kuotaNum < minKomitmenTerkunci) {
      setPesanGalat(
        `Kuota tidak boleh kurang dari ${minKomitmenTerkunci.toLocaleString(
          'id-ID'
        )} kg yang sudah dipesan minimal.`
      );
      return;
    }

    const payload = {
      petak,
      catatan,
      terimaBaru,
      harga: hargaNum,
      kuota: kuotaNum,
      minimal: parseInt(minimal.replace(/\D/g, ''), 10) || 10,
    };

    setPesanSukses('Perubahan data tanaman berhasil disimpan.');
    onSimpan?.(kampanyeId, payload);
  };

  return (
    <div className={`relative min-h-screen bg-[#fcfbf6] font-['Plus_Jakarta_Sans',sans-serif] text-[#173b2b] ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-none w-[272px] p-5 pr-0 pb-6">
          <TokoSamping aktif="prapanen" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-5 md:py-5 md:px-6 md:pb-12">
          <div className="max-w-[720px] flex flex-col gap-4">
            {/* Back link */}
            <Link
              href={`/toko/daftar-tunggu/${kampanyeId}`}
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-sm font-bold text-[#157a4c] hover:underline"
            >
              <svg
                width="16"
                height="16"
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
              <span>{kampanye.namaTanaman}</span>
            </Link>

            {/* Header info */}
            <div>
              <h1 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#173b2b]">
                Ubah data tanaman
              </h1>
              <p className="mt-1 mb-0 text-xs sm:text-sm text-[#3f5247]">
                Untuk jadwal panen dan status, pakai halaman masing-masing supaya pembeli dikabari.
              </p>
            </div>

            {/* Notification messages */}
            {pesanSukses && (
              <p aria-live="polite" className="m-0 p-3.5 px-4 rounded-xl border border-[#157a4c] bg-[#f3faf3] text-sm text-[#064e3b] font-bold">
                {pesanSukses}
              </p>
            )}

            {pesanGalat && (
              <p role="alert" className="m-0 p-3.5 px-4 rounded-xl border border-[#b42318] bg-[#fdecea] text-sm text-[#8a1c12] font-bold">
                {pesanGalat}
              </p>
            )}

            {/* Form */}
            <form onSubmit={handleSimpan} className="flex flex-col gap-4">
              {/* Section 1: Data Tanaman */}
              <section
                aria-labelledby="judul-data-tanaman"
                className="p-4 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-4"
              >
                <h2 id="judul-data-tanaman" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                  Data tanaman
                </h2>

                {/* Locked Commodity */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#173b2b]">Komoditas</span>
                  <div className="flex items-center gap-2 min-h-[48px] px-3.5 rounded-xl bg-[#f6f8f4] text-sm sm:text-base font-extrabold text-[#173b2b]">
                    {/* Padlock Icon */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#5a6b60"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>{kampanye.namaTanaman}</span>
                  </div>
                  <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                    Terkunci karena sudah ada {kampanye.komitmen ?? 14} Komitmen. Untuk tanaman lain,
                    buat Daftar Tunggu baru.
                  </p>
                </div>

                {/* Locked Plant Date */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#173b2b]">Tanggal tanam</span>
                  <p className="m-0 text-sm text-[#173b2b]">
                    {kampanye.tanggalTanam ?? 'Sab, 29 Agu 2026'}.{' '}
                    <Link
                      href={`/toko/daftar-tunggu/${kampanyeId}/jadwal-panen`}
                      className="text-[#157a4c] font-bold hover:underline"
                    >
                      Ubah di Jadwal panen
                    </Link>
                  </p>
                </div>

                {/* Plot Location Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ub-petak" className="text-xs font-bold text-[#173b2b]">
                    Petak lahan <span className="font-normal text-[#5a6b60]">(opsional)</span>
                  </label>
                  <input
                    id="ub-petak"
                    type="text"
                    value={petak}
                    onChange={(e) => setPetak(e.target.value)}
                    className="h-11 px-3.5 rounded-xl border border-[#c9d2c6] text-sm text-[#173b2b] bg-white focus:outline-[#157a4c]"
                  />
                  <p className="m-0 text-xs text-[#5a6b60]">
                    Membantu membedakan petak tanam di lahan Cikole.
                  </p>
                </div>

                {/* Buyer Notes */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ub-catatan" className="text-xs font-bold text-[#173b2b]">
                    Catatan untuk pembeli <span className="font-normal text-[#5a6b60]">(opsional)</span>
                  </label>
                  <textarea
                    id="ub-catatan"
                    rows={3}
                    maxLength={200}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="p-3 rounded-xl border border-[#c9d2c6] text-sm text-[#173b2b] bg-white focus:outline-[#157a4c] resize-y"
                  />
                  <span className="text-[11px] text-[#5a6b60] text-right">
                    {catatan.length}/200 karakter
                  </span>
                </div>
              </section>

              {/* Section 2: Komitmen */}
              <section
                aria-labelledby="judul-komitmen"
                className="p-4 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-4"
              >
                <h2 id="judul-komitmen" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                  Komitmen
                </h2>

                {/* Toggle Accept Commitments */}
                <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#f6f8f4] cursor-pointer">
                  <span className="flex flex-col">
                    <strong className="text-sm font-bold text-[#173b2b]">
                      Terima Komitmen baru
                    </strong>
                    <span className="text-xs text-[#5a6b60]">
                      {terimaBaru
                        ? 'Pembeli dapat memesan kuota komitmen tambahan.'
                        : 'Komitmen baru ditutup sementara, komitmen lama tetap aktif.'}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={terimaBaru}
                    onChange={(e) => setTerimaBaru(e.target.checked)}
                    className="w-5 h-5 accent-[#064e3b] cursor-pointer"
                  />
                </label>

                {/* Price Input */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="ub-harga" className="text-xs font-bold text-[#173b2b]">
                    Harga per kg <span className="text-[#b42318]">*</span>
                  </label>
                  <div className="relative max-w-[240px]">
                    <span className="absolute left-3 top-3 text-sm font-bold text-[#5a6b60]">
                      Rp
                    </span>
                    <input
                      id="ub-harga"
                      type="text"
                      inputMode="numeric"
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b] bg-white"
                    />
                  </div>
                  <p className="m-0 text-xs text-[#5a6b60]">
                    Hanya berlaku untuk komitmen baru yang masuk setelah ini.
                  </p>
                </div>

                {/* Quota & Minimum per Commitment */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[140px] max-w-[200px] flex flex-col gap-1">
                    <label htmlFor="ub-kuota" className="text-xs font-bold text-[#173b2b]">
                      Kuota total (kg) <span className="text-[#b42318]">*</span>
                    </label>
                    <input
                      id="ub-kuota"
                      type="text"
                      inputMode="numeric"
                      value={kuota}
                      onChange={(e) => setKuota(e.target.value)}
                      className="h-11 px-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b] bg-white"
                    />
                    <p className="m-0 text-[11px] text-[#5a6b60]">
                      Min {minKomitmenTerkunci.toLocaleString('id-ID')} kg sudah dipesan.
                    </p>
                  </div>

                  <div className="flex-1 min-w-[140px] max-w-[200px] flex flex-col gap-1">
                    <label htmlFor="ub-minimal" className="text-xs font-bold text-[#173b2b]">
                      Minimal per pesanan (kg) <span className="text-[#b42318]">*</span>
                    </label>
                    <input
                      id="ub-minimal"
                      type="text"
                      inputMode="numeric"
                      value={minimal}
                      onChange={(e) => setMinimal(e.target.value)}
                      className="h-11 px-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b] bg-white"
                    />
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="submit"
                  className="min-h-[46px] px-6 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                >
                  Simpan perubahan
                </button>
                <Link
                  href={`/toko/daftar-tunggu/${kampanyeId}`}
                  className="inline-flex items-center justify-center min-h-[46px] px-4.5 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold hover:bg-[#f6f8f4]"
                >
                  Batal
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <div className="block lg:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="prapanen" />
      </div>
    </div>
  );
}
