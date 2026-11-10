'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { JalurStatus, type JalurStatusItem } from '../../common/JalurStatus';

export interface RiwayatJadwalItem {
  judul: string;
  waktu: string;
  ket: string;
  status: 'selesai' | 'kini' | 'peringatan';
  label?: string;
  lama?: string;
}

export interface TokoDaftarTungguJadwalProps {
  kampanyeId?: string;
  namaTanaman?: string;
  jadwalLama?: string;
  isian?: Record<string, string>;
  riwayat?: RiwayatJadwalItem[];
  onUbahJadwal?: (kampanyeId: string, jadwalBaru: string, alasan: string) => void;
  className?: string;
}

const DEFAULT_RIWAYAT_JADWAL: JalurStatusItem[] = [
  {
    judul: 'Target awal saat tanam',
    waktu: '29 Agu 2026',
    ket: 'Perkiraan panen 10–17 Nov 2026 (sekitar 75–80 hari masa tanam).',
    status: 'selesai',
  },
  {
    judul: 'Jadwal diundur 10 hari',
    waktu: '1 Nov 2026',
    ket: 'Perkiraan panen baru: 20–27 Nov 2026. Alasan: Hujan deras terus-menerus membuat tanah jenuh air.',
    status: 'kini',
    lama: '10–17 Nov 2026',
  },
];

export function TokoDaftarTungguJadwal({
  kampanyeId = 'kentang',
  namaTanaman = 'Kentang Granola',
  jadwalLama = '10–17 Nov 2026',
  isian,
  riwayat,
  onUbahJadwal,
  className = '',
}: TokoDaftarTungguJadwalProps) {
  const [jenisOpsi, setJenisOpsi] = useState<'rentang' | 'tanggal'>(
    (isian?.jenis as 'rentang' | 'tanggal') ?? 'rentang'
  );
  const [awal, setAwal] = useState<string>(isian?.awal ?? '2026-11-20');
  const [akhir, setAkhir] = useState<string>(isian?.akhir ?? '2026-11-27');
  const [alasan, setAlasan] = useState<string>(
    isian?.alasan ?? 'Hujan lebat di kawasan Cikole menyebabkan tanah tergenang. Umbi perlu penambahan waktu pematangan agar kualitas maksimal.'
  );

  const [pesanGalat, setPesanGalat] = useState<string>('');
  const [pesanSukses, setPesanSukses] = useState<string>('');

  const displayRiwayat: JalurStatusItem[] = riwayat ?? DEFAULT_RIWAYAT_JADWAL;

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    setPesanGalat('');

    if (alasan.trim().length < 20) {
      setPesanGalat('Isi alasan perubahan minimal 20 karakter agar pengikut dan admin memahami alasan penundaan.');
      return;
    }

    if (!awal || (jenisOpsi === 'rentang' && !akhir)) {
      setPesanGalat('Isi tanggal perkiraan panen dengan lengkap.');
      return;
    }

    const jadwalBaruTeks = jenisOpsi === 'rentang' ? `${awal} – ${akhir}` : awal;
    setPesanSukses(`Jadwal panen ${namaTanaman} berhasil diperbarui. Semua pengikut telah dikabari.`);

    onUbahJadwal?.(kampanyeId, jadwalBaruTeks, alasan);
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
          <div className="max-w-[1040px] flex flex-col gap-4">
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
              <span>{namaTanaman}</span>
            </Link>

            {/* Header info */}
            <div>
              <h1 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#173b2b]">
                Jadwal panen
              </h1>
              <p className="mt-1 mb-0 text-xs sm:text-sm text-[#3f5247]">
                Perkiraan sekarang: <strong className="text-[#173b2b]">{jadwalLama}</strong>
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

            {/* Two Column Layout: Reschedule Form & Audit History */}
            <div className="flex flex-wrap lg:flex-nowrap items-start gap-4.5">
              {/* Form Ubah Perkiraan */}
              <form
                onSubmit={handleSimpan}
                aria-labelledby="judul-ubah-jadwal"
                className="flex-1 min-w-0 p-4 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-4 w-full"
              >
                <div>
                  <h2 id="judul-ubah-jadwal" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Ubah perkiraan panen
                  </h2>
                  <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                    Setiap perubahan masuk linimasa dan semua pengikut dikabari. Jadwal lama tetap terlihat dicoret.
                  </p>
                </div>

                {/* Range vs Single Date Radios */}
                <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                  <legend className="text-xs font-bold text-[#173b2b] mb-1">
                    Format perkiraan baru <span className="text-[#b42318]">*</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'rentang' as const, label: 'Rentang tanggal (Rekomendasi)' },
                      { id: 'tanggal' as const, label: 'Satu tanggal pasti' },
                    ].map((op) => (
                      <label
                        key={op.id}
                        className={`inline-flex items-center gap-2 min-h-[38px] px-3.5 rounded-full text-xs font-bold cursor-pointer border ${
                          jenisOpsi === op.id
                            ? 'border-[#064e3b] bg-[#064e3b] text-white'
                            : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="jd-jenis"
                          checked={jenisOpsi === op.id}
                          onChange={() => setJenisOpsi(op.id)}
                          className="sr-only"
                        />
                        <span>{op.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex-1 min-w-[150px] max-w-[200px] flex flex-col gap-1">
                      <label htmlFor="jd-awal" className="text-xs text-[#5a6b60]">
                        {jenisOpsi === 'rentang' ? 'Paling cepat' : 'Tanggal panen'}
                      </label>
                      <input
                        id="jd-awal"
                        type="date"
                        value={awal}
                        onChange={(e) => setAwal(e.target.value)}
                        className="h-11 px-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b]"
                      />
                    </div>
                    {jenisOpsi === 'rentang' && (
                      <div className="flex-1 min-w-[150px] max-w-[200px] flex flex-col gap-1">
                        <label htmlFor="jd-akhir" className="text-xs text-[#5a6b60]">
                          Paling lambat
                        </label>
                        <input
                          id="jd-akhir"
                          type="date"
                          value={akhir}
                          onChange={(e) => setAkhir(e.target.value)}
                          className="h-11 px-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b]"
                        />
                      </div>
                    )}
                  </div>
                </fieldset>

                {/* Reason Textarea */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="jd-alasan" className="text-xs font-bold text-[#173b2b]">
                    Alasan perubahan <span className="text-[#b42318]">*</span>
                  </label>
                  <p className="m-0 text-xs text-[#5a6b60]">
                    Tulis apa yang terjadi di lahan, apa yang kamu lakukan, dan perkiraan kabar berikutnya.
                  </p>
                  <textarea
                    id="jd-alasan"
                    rows={3}
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    placeholder="Minimal 20 karakter penjelasan..."
                    className="p-3 rounded-xl border border-[#c9d2c6] text-sm text-[#173b2b] bg-white focus:outline-[#157a4c] resize-y"
                  />
                  <span className="text-[11px] text-[#5a6b60] text-right">
                    {alasan.length} karakter (min 20)
                  </span>
                </div>

                {/* Buyer View Preview Card */}
                <div className="p-3.5 px-4 rounded-xl bg-[#fef7e6] border border-[#f3d7c6] flex flex-col gap-2">
                  <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-[#92400e]">
                    Yang Dilihat Pembeli
                  </h3>
                  <div>
                    <p className="m-0 text-sm font-extrabold text-[#173b2b]">
                      Perkiraan panen {jenisOpsi === 'rentang' ? `${awal} – ${akhir}` : awal}
                    </p>
                    <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                      Semula <s>{jadwalLama}</s>
                    </p>
                  </div>
                  <ul className="m-0 pl-4 list-disc text-xs text-[#3f5247] flex flex-col gap-1">
                    <li>Status tanaman otomatis beralih ke Panen Tertunda.</li>
                    <li>
                      Mundur lebih dari 7 hari: Pemegang Komitmen berhak membatalkan pesanan tanpa penalti
                      dan uang mukanya kembali 100%.
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="min-h-[48px] px-6 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                >
                  Simpan dan kabari pengikut
                </button>
              </form>

              {/* Right Column: Riwayat Jadwal */}
              <aside
                aria-label="Riwayat audit jadwal panen"
                className="w-full lg:w-[320px] flex-none p-4 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
              >
                <div>
                  <h2 className="m-0 text-base font-extrabold text-[#173b2b]">
                    Riwayat jadwal
                  </h2>
                  <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                    Riwayat bersifat permanen dan dilihat pembeli di etalase tanaman.
                  </p>
                </div>

                <JalurStatus langkah={displayRiwayat} ringkas={true} />
              </aside>
            </div>
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
