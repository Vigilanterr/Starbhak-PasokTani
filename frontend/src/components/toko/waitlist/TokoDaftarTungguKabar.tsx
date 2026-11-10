'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { UnggahFoto } from '../../common/UnggahFoto';
import { JalurStatus, type JalurStatusItem } from '../../common/JalurStatus';

export interface DataTanamanKabar {
  nama: string;
  pengikut: number;
  hariLalu: number;
  terakhir: string;
}

export interface KabarLahanItem {
  id?: string;
  tanggal?: string;
  judul: string;
  waktu: string;
  ket: string;
  foto?: boolean;
  fotoList?: string[];
  kondisiTanaman?: 'subur' | 'normal' | 'waspada-hama';
}

export interface TokoDaftarTungguKabarProps {
  kampanyeId?: string;
  tanaman?: string;
  daftarTanaman?: Record<string, DataTanamanKabar>;
  riwayatKabar?: KabarLahanItem[];
  daftarKabar?: Record<string, KabarLahanItem[]>;
  onKirimKabar?: (kampanyeId: string, data: unknown) => void;
  className?: string;
}

const DEFAULT_DAFTAR_TANAMAN: Record<string, DataTanamanKabar> = {
  kentang: {
    nama: 'Kentang Granola',
    pengikut: 31,
    hariLalu: 6,
    terakhir: 'Min, 1 Nov',
  },
  cabai: {
    nama: 'Cabai Rawit Hijau',
    pengikut: 24,
    hariLalu: 16,
    terakhir: 'Kam, 22 Okt',
  },
  wortel: {
    nama: 'Wortel Lembang',
    pengikut: 18,
    hariLalu: 2,
    terakhir: 'Jum, 6 Nov',
  },
};

const DEFAULT_DAFTAR_KABAR: Record<string, JalurStatusItem[]> = {
  kentang: [
    {
      judul: 'Umbi mulai terbentuk',
      waktu: 'Min, 1 Nov',
      ket: 'Sebesar telur puyuh. Daun masih hijau segar dan bebas kutu daun.',
      foto: true,
      status: 'selesai',
    },
    {
      judul: 'Berbunga merata',
      waktu: 'Sen, 26 Okt',
      ket: 'Bunga bermekaran sempurna di petak bawah Cikole.',
      foto: true,
      status: 'selesai',
    },
    {
      judul: 'Pembumbunan kedua selesai',
      waktu: 'Sen, 12 Okt',
      ket: 'Tanah ditinggikan supaya umbi tidak kena sinar matahari langsung.',
      status: 'selesai',
    },
  ],
  cabai: [
    {
      judul: 'Bunga rontok setelah hujan',
      waktu: 'Kam, 22 Okt',
      ket: 'Hujan deras seminggu. Kami pasang mulsa tambahan dan bersihkan parit.',
      foto: true,
      status: 'peringatan',
    },
    {
      judul: 'Mulai berbunga',
      waktu: 'Sab, 3 Okt',
      ket: 'Tanaman setinggi lutut, daun lebat.',
      foto: true,
      status: 'selesai',
    },
  ],
  wortel: [
    {
      judul: 'Siap dicabut',
      waktu: 'Jum, 6 Nov',
      ket: 'Contoh cabutan sudah sebesar jari telunjuk orang dewasa dengan warna oranye cerah.',
      foto: true,
      status: 'selesai',
    },
  ],
};

export function TokoDaftarTungguKabar({
  kampanyeId = 'kentang',
  tanaman: tanamanProp,
  daftarTanaman = DEFAULT_DAFTAR_TANAMAN,
  riwayatKabar,
  daftarKabar,
  onKirimKabar,
  className = '',
}: TokoDaftarTungguKabarProps) {
  const [selectedCropKey, setSelectedCropKey] = useState<string>(tanamanProp ?? kampanyeId);
  const [tahapTanaman, setTahapTanaman] = useState<string>('umbi');
  const [cerita, setCerita] = useState<string>(
    'Pagi ini kami cek umbi kentang di petak bawah. Rata-rata umbi makin padat dan bebas hama boleng.'
  );
  const [kabariPengikut, setKabariPengikut] = useState<boolean>(true);
  const [statusFoto, setStatusFoto] = useState<'kosong' | 'siap'>('siap');

  const [pesanGalat, setPesanGalat] = useState<string>('');
  const [pesanSukses, setPesanSukses] = useState<string>('');

  const currentCrop = daftarTanaman[selectedCropKey] ?? {
    nama: 'Kentang Granola',
    pengikut: 31,
    hariLalu: 6,
    terakhir: 'Min, 1 Nov',
  };

  const currentRiwayat: JalurStatusItem[] =
    (riwayatKabar as JalurStatusItem[]) ??
    (daftarKabar?.[selectedCropKey] as JalurStatusItem[]) ??
    DEFAULT_DAFTAR_KABAR[selectedCropKey] ??
    DEFAULT_DAFTAR_KABAR['kentang'] ??
    [];

  const isWarningOverdue = currentCrop.hariLalu > 14;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPesanGalat('');

    if (statusFoto === 'kosong') {
      setPesanGalat('Tambahkan foto lahan dulu agar pengikut dapat melihat perkembangan nyata.');
      return;
    }

    const payload = {
      tanamanKey: selectedCropKey,
      namaTanaman: currentCrop.nama,
      tahap: tahapTanaman,
      cerita,
      kabariPengikut,
      fotoSiap: true,
    };

    setPesanSukses(
      `Kabar lahan baru untuk ${currentCrop.nama} berhasil dikirim${
        kabariPengikut ? ` dan diberitahukan ke ${currentCrop.pengikut} pengikut` : ''
      }.`
    );

    onKirimKabar?.(selectedCropKey, payload);
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
              href={`/toko/daftar-tunggu/${selectedCropKey}`}
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
              <span>{currentCrop.nama}</span>
            </Link>

            {/* Title */}
            <div>
              <h1 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#173b2b]">
                Kabar lahan
              </h1>
              <p className="mt-1 mb-0 text-xs sm:text-sm text-[#3f5247] max-w-[65ch]">
                Foto dari lahan membuat pengikut percaya panennya nyata. Cukup satu foto dan satu kalimat.
              </p>
            </div>

            {/* Crop Selector Pills */}
            <div role="group" aria-label="Pilih tanaman" className="flex flex-wrap gap-2">
              {Object.entries(daftarTanaman).map(([key, t]) => {
                const isSelected = selectedCropKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedCropKey(key);
                      setPesanSukses('');
                      setPesanGalat('');
                    }}
                    className={`min-h-[42px] px-4 rounded-full text-xs sm:text-sm font-extrabold cursor-pointer border ${
                      isSelected
                        ? 'border-[#064e3b] bg-[#064e3b] text-white'
                        : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                    }`}
                  >
                    {t.nama}
                  </button>
                );
              })}
            </div>

            {/* Overdue Frequency Reminder Banner */}
            <div
              className={`p-3 px-3.5 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                isWarningOverdue
                  ? 'border-[#fcd34d] bg-[#fef3c7] text-[#92400e]'
                  : 'border-transparent bg-[#f6f8f4] text-[#3f5247]'
              }`}
            >
              <strong>Kabar terakhir {currentCrop.hariLalu} hari lalu ({currentCrop.terakhir}).</strong>{' '}
              {isWarningOverdue
                ? 'Sudah lebih dari 2 minggu tanpa pembaruan. Pengikut sangat membutuhkan kabar perkembangan tanamanmu.'
                : 'Kirim kabar secara berkala setiap 1-2 minggu agar pembeli tetap antusias.'}
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

            {/* Two Column Layout: New Field Log Form & Previous Logs */}
            <div className="flex flex-wrap lg:flex-nowrap items-start gap-4.5">
              {/* Left Column: Form Kabar Baru */}
              <form
                onSubmit={handleSubmit}
                aria-labelledby="judul-kabar-baru"
                className="flex-1 min-w-0 p-4 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-4 w-full"
              >
                <h2 id="judul-kabar-baru" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                  Kabar baru untuk {currentCrop.nama}
                </h2>

                {/* Photo Uploader */}
                <div className="flex flex-col gap-1.5 max-w-[440px]">
                  <UnggahFoto
                    status={statusFoto}
                    bentuk="lebar"
                    label="Foto lahan"
                    wajib={true}
                    ukuran="Foto asli dari kamera HP atau galeri"
                    ket="Ambil dari dekat dan dari jauh bergantian untuk memperlihatkan kondisi tanaman."
                    onPilih={() => setStatusFoto('siap')}
                    onHapus={() => setStatusFoto('kosong')}
                  />
                  {statusFoto === 'siap' && (
                    <span className="text-[11px] text-[#5a6b60]">
                      Diambil hari ini, 06.40 WIB. Tanggal ini yang akan tampil ke pembeli.
                    </span>
                  )}
                </div>

                {/* Tahap Tanaman Radio Selector */}
                <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                  <legend className="text-xs font-bold text-[#173b2b] mb-1">
                    Tahap tanaman <span className="font-normal text-[#5a6b60]">(opsional)</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'tumbuh', label: 'Tumbuh vegetatif' },
                      { id: 'berbunga', label: 'Mulai berbunga' },
                      { id: 'umbi', label: 'Umbi / buah terbentuk' },
                      { id: 'hampir', label: 'Hampir panen' },
                      { id: 'masalah', label: 'Ada tantangan cuaca' },
                    ].map((tp) => (
                      <label
                        key={tp.id}
                        className={`inline-flex items-center gap-2 min-h-[36px] px-3 rounded-full text-xs font-bold cursor-pointer border ${
                          tahapTanaman === tp.id
                            ? 'border-[#064e3b] bg-[#064e3b] text-white'
                            : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="kb-tahap"
                          checked={tahapTanaman === tp.id}
                          onChange={() => setTahapTanaman(tp.id)}
                          className="sr-only"
                        />
                        <span>{tp.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Narrative Caption */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="kb-cerita" className="text-xs font-bold text-[#173b2b]">
                    Cerita singkat <span className="font-normal text-[#5a6b60]">(opsional)</span>
                  </label>
                  <textarea
                    id="kb-cerita"
                    rows={3}
                    maxLength={200}
                    value={cerita}
                    onChange={(e) => setCerita(e.target.value)}
                    placeholder="Apa yang terlihat di foto? Ceritakan kondisi cuaca atau perawatan..."
                    className="p-3 rounded-xl border border-[#c9d2c6] text-sm text-[#173b2b] bg-white focus:outline-[#157a4c] resize-y"
                  />
                  <span className="text-[11px] text-[#5a6b60] text-right">
                    {cerita.length}/200 karakter
                  </span>
                </div>

                {/* Broadcast Checkbox */}
                <label className="flex items-start gap-3 p-3 rounded-xl bg-[#f6f8f4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kabariPengikut}
                    onChange={(e) => setKabariPengikut(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-[#064e3b] cursor-pointer"
                  />
                  <span className="flex flex-col">
                    <strong className="text-xs sm:text-sm font-bold text-[#173b2b]">
                      Kabari {currentCrop.pengikut} pengikut lewat notifikasi
                    </strong>
                    <span className="text-[11px] text-[#5a6b60] leading-relaxed">
                      Bila tidak dicentang, kabar tetap tampil di linimasa etalase tanaman tanpa
                      mengirimkan lonceng notifikasi ke ponsel pembeli.
                    </span>
                  </span>
                </label>

                <button
                  type="submit"
                  className="min-h-[48px] px-6 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                >
                  Kirim kabar
                </button>
              </form>

              {/* Right Column: Riwayat Kabar Sebelumnya */}
              <aside
                aria-label="Kabar lahan sebelumnya"
                className="w-full lg:w-[320px] flex-none p-4 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
              >
                <div>
                  <h2 className="m-0 text-base font-extrabold text-[#173b2b]">
                    Kabar sebelumnya
                  </h2>
                  <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                    Catatan perkembangan lapangan untuk {currentCrop.nama}.
                  </p>
                </div>

                <JalurStatus langkah={currentRiwayat} ringkas={true} />
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
