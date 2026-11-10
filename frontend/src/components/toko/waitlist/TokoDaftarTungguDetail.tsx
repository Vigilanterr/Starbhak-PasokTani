'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { ChipStatus, type StatusPasokTani } from '../../common/ChipStatus';
import { JalurStatus, type JalurStatusItem } from '../../common/JalurStatus';
import type { KampanyeDaftarTungguItem } from './TokoDaftarTunggu';

export type PilihanStatusTanaman = 'lebih-awal' | 'tertunda' | 'siap' | 'gagal';

export interface TahapPerjalananTanaman {
  urutan: number;
  namaTahap: string;
  selesai: boolean;
  aktif: boolean;
  tanggalPerkiraan: string;
  catatan?: string;
}

export interface KampanyeDaftarTungguDetailData extends KampanyeDaftarTungguItem {
  deskripsiLahan?: string;
  lokasiLahan?: string;
  tahapList?: TahapPerjalananTanaman[];
  totalKomitmenNominal?: number;
  uangMukaDitahan?: number;
}

export interface TokoDaftarTungguDetailProps {
  kampanye?: KampanyeDaftarTungguDetailData;
  pilihan?: string;
  onSimpanStatus?: (status: PilihanStatusTanaman, data: Record<string, unknown>) => void;
  className?: string;
}

const DEFAULT_DETAIL_KAMPANYE: KampanyeDaftarTungguDetailData = {
  id: 'kentang',
  namaTanaman: 'Kentang Granola',
  varietas: 'Granola Lembang',
  status: 'tertunda',
  sub: 'Lahan Cikole, sekitar 0,3 ha. Ditanam Sab, 29 Agu. Perkiraan panen 20–27 Nov 2026.',
  deskripsiLahan: 'Lahan Cikole, petak bawah',
  lokasiLahan: 'Kp. Cikole, Lembang, Kab. Bandung Barat',
  kuotaKg: 1500,
  min: 1090,
  maks: 1480,
  pengikut: 31,
  komitmen: 14,
  uangMukaDitahan: 5412000,
  totalKomitmenNominal: 18040000,
  hargaPerKg: 16500,
};

const DEFAULT_LINIMASA_STEPS: JalurStatusItem[] = [
  {
    judul: 'Penanaman bibit',
    waktu: '29 Agu 2026',
    ket: 'Bibit Kentang Granola ditanam di petak bawah Cikole seluas 0,3 ha.',
    status: 'selesai',
    foto: true,
  },
  {
    judul: 'Masa vegetatif & pembumbunan',
    waktu: '12 Okt 2026',
    ket: 'Pembumbunan kedua selesai, tanah ditinggikan agar umbi terlindung.',
    status: 'selesai',
  },
  {
    judul: 'Pembungaan merata',
    waktu: '26 Okt 2026',
    ket: 'Bunga bermekaran lebat menandakan fase pembentukan umbi dimulai.',
    status: 'selesai',
    foto: true,
  },
  {
    judul: 'Panen tertunda 10 hari',
    waktu: '1 Nov 2026',
    ket: 'Hujan berkepanjangan membuat tanah jenuh air. Pematangan umbi mundur.',
    status: 'peringatan',
  },
  {
    judul: 'Perkiraan panen baru',
    waktu: '20–27 Nov 2026',
    ket: 'Perkiraan panen raya kentang siap distribusi ke pemegang komitmen.',
    status: 'kini',
  },
];

function formatRupiah(n?: number): string {
  if (typeof n !== 'number') return 'Rp 0';
  return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function TokoDaftarTungguDetail({
  kampanye = DEFAULT_DETAIL_KAMPANYE,
  pilihan,
  onSimpanStatus,
  className = '',
}: TokoDaftarTungguDetailProps) {
  const modalGagalId = useId();

  const [statusPilihan, setStatusPilihan] = useState<PilihanStatusTanaman>(
    (pilihan as PilihanStatusTanaman) ?? 'tertunda'
  );
  const [alasanPilihan, setAlasanPilihan] = useState<string>('cuaca');
  const [tanggalAwal, setTanggalAwal] = useState<string>('2026-11-20');
  const [tanggalAkhir, setTanggalAkhir] = useState<string>('2026-11-27');
  const [penjelasan, setPenjelasan] = useState<string>(
    'Hujan deras terus-menerus di Cikole membuat tanah basah. Umbi perlu waktu lebih lama agar tidak busuk saat dipanen.'
  );
  const [bukaModalGagal, setBukaModalGagal] = useState<boolean>(false);
  const [pesanSukses, setPesanSukses] = useState<string>('');

  const minKg = kampanye.min ?? 1090;
  const maxKg = kampanye.maks ?? 1480;
  const kuota = kampanye.kuotaKg ?? 1500;
  const minPct = Math.min(100, Math.round((minKg / kuota) * 100));
  const maxPct = Math.min(100, Math.round((maxKg / kuota) * 100));

  const handlePakaiContohKalimat = () => {
    if (statusPilihan === 'lebih-awal') {
      setPenjelasan(
        'Sinar matahari cukup dan pupuk bekerja sangat baik. Tanaman kentang siap panen lebih awal dengan ukuran umbi prima.'
      );
    } else if (statusPilihan === 'tertunda') {
      setPenjelasan(
        'Curah hujan tinggi menyebabkan tanah becek. Panen diundur agar kadar air umbi pas dan tidak mudah busuk saat pengiriman.'
      );
    } else if (statusPilihan === 'siap') {
      setPenjelasan(
        'Umbi sudah matang sempurna dan daun mulai mengering alami. Panen akan segera dimulai dalam 1-2 hari ini.'
      );
    }
  };

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusPilihan === 'gagal') {
      setBukaModalGagal(true);
      return;
    }

    setPesanSukses(
      `Status tanaman berhasil diperbarui jadi "${
        statusPilihan === 'lebih-awal'
          ? 'Panen Lebih Awal'
          : statusPilihan === 'tertunda'
          ? 'Panen Tertunda'
          : 'Siap Panen'
      }". Semua pengikut telah dikabari.`
    );

    onSimpanStatus?.(statusPilihan, {
      alasan: alasanPilihan,
      awal: tanggalAwal,
      akhir: tanggalAkhir,
      penjelasan,
    });
  };

  const handleKonfirmasiGagal = () => {
    setBukaModalGagal(false);
    setPesanSukses(
      `Tanaman telah ditandai gagal panen. ${kampanye.komitmen ?? 14} komitmen dibatalkan dan uang muka ${formatRupiah(
        kampanye.uangMukaDitahan ?? 5412000
      )} telah dikembalikan penuh.`
    );
    onSimpanStatus?.('gagal', { alasan: alasanPilihan, penjelasan });
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
              href="/toko/daftar-tunggu"
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
              <span>Daftar Tunggu</span>
            </Link>

            {/* Header info */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
                <h1 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#173b2b]">
                  {kampanye.namaTanaman}
                </h1>
                <ChipStatus status={kampanye.status as StatusPasokTani} />
              </div>

              <p className="m-0 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                {kampanye.sub ?? 'Lahan Cikole, petak bawah.'}
              </p>

              {/* Submodule Quick Navigation */}
              <nav aria-label="Kelola tanaman" className="flex flex-wrap gap-2 mt-1">
                <Link
                  href={`/toko/daftar-tunggu/${kampanye.id}/jadwal-panen`}
                  className="inline-flex items-center min-h-[40px] px-3.5 rounded-xl border border-[#dee3da] bg-white text-xs sm:text-sm font-extrabold text-[#064e3b] hover:bg-[#f6f8f4]"
                >
                  Jadwal panen
                </Link>
                <Link
                  href={`/toko/daftar-tunggu/${kampanye.id}/kabar-lahan`}
                  className="inline-flex items-center min-h-[40px] px-3.5 rounded-xl border border-[#dee3da] bg-white text-xs sm:text-sm font-extrabold text-[#064e3b] hover:bg-[#f6f8f4]"
                >
                  Kabar lahan
                </Link>
                <Link
                  href={`/toko/daftar-tunggu/${kampanye.id}/ubah`}
                  className="inline-flex items-center min-h-[40px] px-3.5 rounded-xl border border-[#dee3da] bg-white text-xs sm:text-sm font-extrabold text-[#064e3b] hover:bg-[#f6f8f4]"
                >
                  Ubah data
                </Link>
              </nav>
            </div>

            {/* Notification message */}
            {pesanSukses && (
              <p aria-live="polite" className="m-0 p-3.5 px-4 rounded-xl border border-[#157a4c] bg-[#f3faf3] text-sm text-[#064e3b] font-bold">
                {pesanSukses}
              </p>
            )}

            {/* Metric Summary Cards Grid (4 columns) */}
            <dl className="m-0 grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="p-3 sm:p-3.5 rounded-2xl border border-[#dee3da] bg-white">
                <dt className="text-xs text-[#3f5247]">Pengikut</dt>
                <dd className="m-0 mt-0.5 text-xl sm:text-2xl font-extrabold text-[#173b2b]">
                  {kampanye.pengikut ?? 31}
                </dd>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl border border-[#dee3da] bg-white">
                <dt className="text-xs text-[#3f5247]">Komitmen</dt>
                <dd className="m-0 mt-0.5 text-xl sm:text-2xl font-extrabold text-[#173b2b]">
                  {kampanye.komitmen ?? 14}
                </dd>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl border border-[#dee3da] bg-white">
                <dt className="text-xs text-[#3f5247]">Dipesan minimal</dt>
                <dd className="m-0 mt-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-[#173b2b]">
                    {minKg.toLocaleString('id-ID')} kg
                  </span>{' '}
                  <span className="text-[11px] text-[#5a6b60]">dari {kuota.toLocaleString('id-ID')} kg</span>
                  <span
                    aria-hidden="true"
                    className="relative mt-2 block h-2 rounded-full bg-[#ebf2eb] overflow-hidden"
                  >
                    <span
                      className="absolute left-0 top-0 bottom-0 bg-[repeating-linear-gradient(135deg,#e9d79a_0_4px,#f4e9c4_4px_8px)]"
                      style={{ width: `${maxPct}%` }}
                    />
                    <span
                      className="absolute left-0 top-0 bottom-0 rounded-full bg-[#c2a032]"
                      style={{ width: `${minPct}%` }}
                    />
                  </span>
                </dd>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl border border-[#dee3da] bg-white">
                <dt className="text-xs text-[#3f5247] flex items-center gap-1">
                  <span>Uang muka ditahan</span>
                  <span className="px-1 py-0.2 border border-dashed border-[#c2a032] rounded bg-[#fbf3d9] text-[#5c4500] text-[10px] font-bold">
                    30%
                  </span>
                </dt>
                <dd className="m-0 mt-0.5 text-base sm:text-lg font-extrabold text-[#173b2b]">
                  {formatRupiah(kampanye.uangMukaDitahan ?? 5412000)}
                </dd>
              </div>
            </dl>

            {/* Two Column Layout: Status Switcher & Buyer Timeline */}
            <div className="flex flex-wrap lg:flex-nowrap items-start gap-4.5">
              {/* Left Column: Form Ganti Status */}
              <form
                onSubmit={handleSimpan}
                aria-labelledby="judul-ganti"
                className="flex-1 min-w-0 p-4 sm:p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-4 w-full"
              >
                <div>
                  <h2 id="judul-ganti" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Ganti status
                  </h2>
                  <p className="mt-1 mb-0 text-xs text-[#3f5247] leading-relaxed">
                    Semua pengikut dikabari dan perubahannya masuk linimasa yang dilihat pembeli.
                  </p>
                </div>

                {/* Stage Selection Radios */}
                <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                  <legend className="m-0 mb-1.5 text-xs font-bold text-[#173b2b]">
                    Status baru <span className="text-[#b42318]">*</span>
                  </legend>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        id: 'lebih-awal' as PilihanStatusTanaman,
                        judul: 'Panen Lebih Awal',
                        ket: 'Matang lebih cepat dari jadwal semula.',
                      },
                      {
                        id: 'tertunda' as PilihanStatusTanaman,
                        judul: 'Panen Tertunda',
                        ket: 'Perlu waktu tambahan karena cuaca/perawatan.',
                      },
                      {
                        id: 'siap' as PilihanStatusTanaman,
                        judul: 'Siap Panen',
                        ket: 'Tanaman siap dicabut dan ditimbang.',
                      },
                      {
                        id: 'gagal' as PilihanStatusTanaman,
                        judul: 'Gagal Panen',
                        ket: 'Tanaman rusak, uang muka dikembalikan.',
                      },
                    ].map((op) => {
                      const isChecked = statusPilihan === op.id;
                      const isGagal = op.id === 'gagal';
                      return (
                        <label
                          key={op.id}
                          className={`flex items-start gap-2.5 min-h-[44px] p-3 rounded-xl border cursor-pointer ${
                            isChecked
                              ? isGagal
                                ? 'border-2 border-[#b42318] bg-[#fffafa]'
                                : 'border-2 border-[#064e3b] bg-[#f3faf3]'
                              : 'border-[#dee3da] bg-white hover:bg-[#fafbf9]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="status-tanaman"
                            checked={isChecked}
                            onChange={() => setStatusPilihan(op.id)}
                            className={`w-5 h-5 mt-0.5 ${isGagal ? 'accent-[#b42318]' : 'accent-[#064e3b]'}`}
                          />
                          <span className="flex flex-col gap-0.5">
                            <strong
                              className={`text-sm ${
                                isGagal && isChecked ? 'text-[#b42318]' : 'text-[#173b2b]'
                              }`}
                            >
                              {op.judul}
                            </strong>
                            <span className="text-xs text-[#3f5247] leading-tight">{op.ket}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Conditional Reason Selector (for 'lebih-awal' or 'tertunda') */}
                {(statusPilihan === 'lebih-awal' || statusPilihan === 'tertunda') && (
                  <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                    <legend className="m-0 mb-1.5 text-xs font-bold text-[#173b2b]">
                      Penyebab <span className="text-[#b42318]">*</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'cuaca', label: 'Cuaca ekstrem / hujan deras' },
                        { id: 'hama', label: 'Serangan hama / penyakit' },
                        { id: 'bibit', label: 'Bibit atau pupuk terlambat' },
                        { id: 'bencana', label: 'Bencana alam' },
                        { id: 'lainnya', label: 'Faktor alam lainnya' },
                      ].map((al) => (
                        <label
                          key={al.id}
                          className={`inline-flex items-center gap-2 min-h-[38px] px-3 rounded-full text-xs font-bold cursor-pointer border ${
                            alasanPilihan === al.id
                              ? 'border-[#064e3b] bg-[#064e3b] text-white'
                              : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="alasan-status"
                            checked={alasanPilihan === al.id}
                            onChange={() => setAlasanPilihan(al.id)}
                            className="sr-only"
                          />
                          <span>{al.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {/* Conditional Date Range Inputs (for 'lebih-awal' or 'tertunda') */}
                {(statusPilihan === 'lebih-awal' || statusPilihan === 'tertunda') && (
                  <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                    <legend className="m-0 mb-1.5 text-xs font-bold text-[#173b2b]">
                      Perkiraan panen baru <span className="text-[#b42318]">*</span>
                    </legend>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1 min-w-[160px] max-w-[220px] flex flex-col gap-1">
                        <label htmlFor="panen-awal" className="text-xs text-[#5a6b60]">
                          Paling cepat
                        </label>
                        <input
                          id="panen-awal"
                          type="date"
                          value={tanggalAwal}
                          onChange={(e) => setTanggalAwal(e.target.value)}
                          className="h-11 px-3 rounded-xl border border-[#dee3da] bg-white text-sm font-bold text-[#173b2b]"
                        />
                      </div>
                      <div className="flex-1 min-w-[160px] max-w-[220px] flex flex-col gap-1">
                        <label htmlFor="panen-akhir" className="text-xs text-[#5a6b60]">
                          Paling lambat
                        </label>
                        <input
                          id="panen-akhir"
                          type="date"
                          value={tanggalAkhir}
                          onChange={(e) => setTanggalAkhir(e.target.value)}
                          className="h-11 px-3 rounded-xl border border-[#dee3da] bg-white text-sm font-bold text-[#173b2b]"
                        />
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* Explanation Textarea with sample helper */}
                {statusPilihan !== 'gagal' && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="penjelasan-status" className="text-xs font-bold text-[#173b2b]">
                        Penjelasan untuk pembeli <span className="text-[#b42318]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handlePakaiContohKalimat}
                        className="text-xs font-bold text-[#157a4c] hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        Pakai contoh kalimat
                      </button>
                    </div>
                    <textarea
                      id="penjelasan-status"
                      rows={3}
                      value={penjelasan}
                      onChange={(e) => setPenjelasan(e.target.value)}
                      placeholder="Jelaskan kondisi lapangan agar pengikut memahami perkembangan tanaman..."
                      className="w-full p-3 rounded-xl border border-[#dee3da] text-sm text-[#173b2b] bg-white focus:outline-[#157a4c] resize-y"
                    />
                  </div>
                )}

                {/* Buyer Impact Preview Box */}
                <div className="p-3.5 px-4 rounded-xl bg-[#f6f8f4] text-xs leading-relaxed text-[#3f5247] flex flex-col gap-1 border border-transparent">
                  <strong className="text-[#173b2b]">Dampak ke pembeli:</strong>
                  {statusPilihan === 'lebih-awal' ? (
                    <p className="m-0">
                      Pengikut dan pemegang Komitmen mendapat notifikasi panen lebih awal. Pelunasan
                      tagihan akan dimajukan sesuai jadwal baru.
                    </p>
                  ) : statusPilihan === 'tertunda' ? (
                    <p className="m-0">
                      Jika penundaan melebihi 7 hari kalender, pemegang Komitmen berhak membatalkan
                      pesanan tanpa penalti dan menerima pengembalian uang muka 100%.
                    </p>
                  ) : statusPilihan === 'siap' ? (
                    <p className="m-0">
                      Status tanaman berpindah ke Siap Panen. Kamu dapat langsung mengisi hasil panen
                      untuk mengalokasikan kuota wortel ke pembeli.
                    </p>
                  ) : (
                    <p className="m-0 text-[#b42318]">
                      Tindakan ini tidak dapat dibatalkan. Seluruh uang muka di escrow akan
                      dikembalikan penuh kepada {kampanye.komitmen ?? 14} pemegang Komitmen.
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className={`min-h-[48px] px-6 rounded-xl text-white text-sm font-extrabold cursor-pointer border-0 ${
                    statusPilihan === 'gagal'
                      ? 'bg-[#b42318] hover:bg-[#912018]'
                      : 'bg-[#064e3b] hover:bg-[#053d2e]'
                  }`}
                >
                  {statusPilihan === 'gagal' ? 'Tandai gagal panen' : 'Simpan status'}
                </button>
              </form>

              {/* Right Aside: Linimasa untuk Pembeli */}
              <aside
                aria-label="Linimasa perjalanan tanaman"
                className="w-full lg:w-[320px] flex-none p-4 sm:p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
              >
                <div>
                  <h2 className="m-0 text-base font-extrabold text-[#173b2b]">
                    Linimasa untuk pembeli
                  </h2>
                  <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                    Urutan tahapan yang tampil di halaman etalase tanaman.
                  </p>
                </div>

                <JalurStatus langkah={DEFAULT_LINIMASA_STEPS} />
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <div className="block lg:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="prapanen" />
      </div>

      {/* Failure Confirmation Modal */}
      {bukaModalGagal && (
        <div className="fixed inset-0 z-50 bg-[#173b2b]/50 flex justify-center items-start pt-20 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalGagalId}
            className="w-full max-w-[460px] p-5.5 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5"
          >
            <h2 id={modalGagalId} className="m-0 text-lg font-extrabold text-[#b42318]">
              Tandai gagal panen {kampanye.namaTanaman}?
            </h2>

            <p className="m-0 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
              Tindakan ini tidak bisa dibatalkan. Uang muka sebesar{' '}
              <strong className="text-[#173b2b]">
                {formatRupiah(kampanye.uangMukaDitahan ?? 5412000)}
              </strong>{' '}
              yang saat ini ditahan di rekening escrow akan dikembalikan penuh kepada{' '}
              {kampanye.komitmen ?? 14} pemegang Komitmen.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleKonfirmasiGagal}
                className="min-h-[46px] border-0 rounded-xl bg-[#b42318] text-white text-sm font-extrabold cursor-pointer hover:bg-[#912018]"
              >
                Ya, tandai gagal panen
              </button>
              <button
                type="button"
                onClick={() => setBukaModalGagal(false)}
                className="min-h-[46px] border border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#f6f8f4]"
              >
                Periksa lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
