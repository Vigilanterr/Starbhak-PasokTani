'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';

export interface JamBukaHarian {
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu' | string;
  buka: boolean;
  jamMulai: string;
  jamSelesai: string;
}

export interface HariLiburNasional {
  id: string;
  nama: string;
  iso: string;
  status: 'buka' | 'libur' | '';
}

export interface LiburKustom {
  dari: string;
  sampai: string;
  alasan?: string;
}

export interface JadwalOperasionalToko {
  modeLibur: boolean;
  alasanLibur?: string;
  tanggalMulaiLibur?: string;
  tanggalSelesaiLibur?: string;
  jamHarian: JamBukaHarian[];
  liburKustomList?: LiburKustom[];
  liburNasionalList?: HariLiburNasional[];
}

export interface TokoPengaturanJamProps {
  jadwal?: JadwalOperasionalToko;
  onSimpanJadwal?: (jadwal: JadwalOperasionalToko) => void;
  hrefPengaturan?: string;
  className?: string;
}

const DEFAULT_JAM_HARIAN: JamBukaHarian[] = [
  { hari: 'Senin', buka: true, jamMulai: '05:30', jamSelesai: '17:00' },
  { hari: 'Selasa', buka: true, jamMulai: '05:30', jamSelesai: '17:00' },
  { hari: 'Rabu', buka: true, jamMulai: '05:30', jamSelesai: '17:00' },
  { hari: 'Kamis', buka: true, jamMulai: '05:30', jamSelesai: '17:00' },
  { hari: 'Jumat', buka: true, jamMulai: '05:30', jamSelesai: '17:00' },
  { hari: 'Sabtu', buka: true, jamMulai: '05:30', jamSelesai: '17:00' },
  { hari: 'Minggu', buka: true, jamMulai: '07:00', jamSelesai: '17:00' },
];

const DEFAULT_LIBUR_NASIONAL: HariLiburNasional[] = [
  { id: 'natal', nama: 'Hari Raya Natal', iso: '25 Des 2026', status: '' },
  { id: 'tahun-baru', nama: 'Tahun Baru 2027', iso: '1 Jan 2027', status: '' },
];

const DEFAULT_LIBUR_KUSTOM: LiburKustom[] = [
  { dari: '2026-11-20', sampai: '2026-11-22', alasan: 'Hajatan keluarga di Subang' },
];

const DEFAULT_JADWAL: JadwalOperasionalToko = {
  modeLibur: false,
  jamHarian: DEFAULT_JAM_HARIAN,
  liburNasionalList: DEFAULT_LIBUR_NASIONAL,
  liburKustomList: DEFAULT_LIBUR_KUSTOM,
};

export function TokoPengaturanJam({
  jadwal = DEFAULT_JADWAL,
  onSimpanJadwal,
  hrefPengaturan = '/toko/pengaturan',
  className = '',
}: TokoPengaturanJamProps) {
  const [jamList, setJamList] = useState<JamBukaHarian[]>(jadwal.jamHarian ?? DEFAULT_JAM_HARIAN);
  const [liburNasional, setLiburNasional] = useState<HariLiburNasional[]>(
    jadwal.liburNasionalList ?? DEFAULT_LIBUR_NASIONAL
  );
  const [liburKustom, setLiburKustom] = useState<LiburKustom[]>(
    jadwal.liburKustomList ?? DEFAULT_LIBUR_KUSTOM
  );

  const [tglMulaiLibur, setTglMulaiLibur] = useState<string>('');
  const [tglAkhirLibur, setTglAkhirLibur] = useState<string>('');
  const [alasanLiburInput, setAlasanLiburInput] = useState<string>('');
  const [galatJam, setGalatJam] = useState<string>('');
  const [galatLibur, setGalatLibur] = useState<string>('');
  const [pesanSukses, setPesanSukses] = useState<string>('');

  const toggleHariBuka = (idx: number) => {
    setJamList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, buka: !item.buka } : item))
    );
  };

  const handleTimeChange = (idx: number, field: 'jamMulai' | 'jamSelesai', val: string) => {
    setJamList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleSalinSenin = () => {
    const senin = jamList[0];
    if (!senin) return;
    setJamList((prev) =>
      prev.map((item) =>
        item.buka ? { ...item, jamMulai: senin.jamMulai, jamSelesai: senin.jamSelesai } : item
      )
    );
    setPesanSukses('Jam operasional hari buka disamakan dengan Senin.');
  };

  const handleSimpanJam = (e: React.FormEvent) => {
    e.preventDefault();
    const bukaCount = jamList.filter((d) => d.buka).length;
    if (bukaCount === 0) {
      setGalatJam('Pilih minimal 1 hari buka. Untuk tutup lama, pakai Libur di bawah.');
      return;
    }

    const invalidDay = jamList.find((d) => d.buka && d.jamMulai >= d.jamSelesai);
    if (invalidDay) {
      setGalatJam(`Jam tutup hari ${invalidDay.hari} harus setelah jam buka.`);
      return;
    }

    setGalatJam('');
    setPesanSukses('Jam buka mingguan berhasil disimpan.');

    if (onSimpanJadwal) {
      onSimpanJadwal({
        ...jadwal,
        jamHarian: jamList,
        liburNasionalList: liburNasional,
        liburKustomList: liburKustom,
      });
    }
  };

  const handleSetLiburNasional = (id: string, st: 'buka' | 'libur') => {
    setLiburNasional((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: st } : item))
    );
    setPesanSukses('Status libur nasional diperbarui.');
  };

  const handleTambahLibur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tglMulaiLibur || !tglAkhirLibur) {
      setGalatLibur('Pilih tanggal mulai dan tanggal akhir libur.');
      return;
    }
    if (tglAkhirLibur < tglMulaiLibur) {
      setGalatLibur('Tanggal akhir libur harus setelah tanggal mulai.');
      return;
    }

    const selisihHari = (Date.parse(tglAkhirLibur) - Date.parse(tglMulaiLibur)) / 86400000;
    if (selisihHari > 30) {
      setGalatLibur('Libur maksimal 30 hari. Untuk berhenti lebih lama, sembunyikan produk.');
      return;
    }

    setLiburKustom((prev) => [
      ...prev,
      { dari: tglMulaiLibur, sampai: tglAkhirLibur, alasan: alasanLiburInput.trim() },
    ]);
    setTglMulaiLibur('');
    setTglAkhirLibur('');
    setAlasanLiburInput('');
    setGalatLibur('');
    setPesanSukses('Jadwal libur berhasil ditambahkan.');
  };

  const handleHapusLibur = (idx: number) => {
    setLiburKustom((prev) => prev.filter((_, i) => i !== idx));
    setPesanSukses('Jadwal libur dihapus.');
  };

  return (
    <div className={`min-h-full bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />
      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden min-[900px]:block w-[272px] shrink-0 p-5 pt-5 pb-6 pl-5">
          <TokoSamping aktif="pengaturan" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 min-[900px]:px-6 min-[900px]:py-5 min-[900px]:pb-12">
          <div className="max-w-[1040px] flex flex-col gap-4">
            {/* Back link */}
            <Link
              href={hrefPengaturan}
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-[#157a4c] text-sm font-bold no-underline"
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
              Pengaturan toko
            </Link>

            {/* Header */}
            <div>
              <h1 className="text-2xl min-[900px]:text-[28px] font-extrabold tracking-tight leading-tight m-0">
                Jam buka dan libur
              </h1>
              <p className="mt-1.5 mb-0 inline-flex items-center gap-2 text-[15px] font-bold text-[#157a4c]">
                <span className="w-2 h-2 rounded-full bg-[#15803d]" aria-hidden="true" />
                Hari ini Minggu, buka 07.00–17.00. Sekarang buka.
              </p>
            </div>

            {pesanSukses && (
              <p aria-live="polite" className="m-0 text-sm font-bold text-[#157a4c]">
                {pesanSukses}
              </p>
            )}

            {/* Two-Column Form Layout */}
            <div className="flex flex-wrap items-start gap-4.5">
              {/* Left Column: Weekly hours & Vacations */}
              <div className="flex-[999_1_460px] min-w-0 flex flex-col gap-3.5">
                {/* Weekly Hours Card */}
                <form
                  onSubmit={handleSimpanJam}
                  className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3 m-0"
                >
                  <div>
                    <h2 className="text-[17px] font-extrabold m-0">Jam buka mingguan</h2>
                    <p className="mt-1 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
                      Pembeli tetap bisa memesan di luar jam buka. Pesanan itu diproses saat toko buka lagi.
                    </p>
                  </div>

                  {galatJam && (
                    <p role="alert" className="p-2.5 px-3 rounded-xl bg-[#fdecea] text-sm font-bold text-[#8a1c12] m-0">
                      {galatJam}
                    </p>
                  )}

                  <ul className="list-none p-0 m-0 flex flex-col">
                    {jamList.map((d, idx) => (
                      <li
                        key={d.hari}
                        className={`flex flex-wrap items-center gap-2 min-[640px]:gap-3.5 py-2.5 ${
                          idx > 0 ? 'border-t border-[#eef0eb]' : ''
                        }`}
                      >
                        <span className="w-[74px] shrink-0 text-[15px] font-extrabold text-[#173b2b]">
                          {d.hari}
                        </span>

                        {/* Toggle switch */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={d.buka}
                          aria-label={`Buka hari ${d.hari}`}
                          onClick={() => toggleHariBuka(idx)}
                          className="shrink-0 inline-flex items-center gap-2 min-h-[44px] px-1 bg-transparent border-0 cursor-pointer"
                        >
                          <span
                            aria-hidden="true"
                            className={`relative inline-block w-10 h-6 rounded-full ${
                              d.buka ? 'bg-[#064e3b]' : 'bg-[#c9d2c6]'
                            }`}
                          >
                            <span
                              style={{ left: d.buka ? '19px' : '3px' }}
                              className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm"
                            />
                          </span>
                          <span className="min-w-[44px] text-left text-sm font-bold text-[#173b2b]">
                            {d.buka ? 'Buka' : 'Tutup'}
                          </span>
                        </button>

                        {/* Time Inputs */}
                        {d.buka ? (
                          <div className="flex-1 basis-[220px] flex items-center gap-2">
                            <input
                              type="time"
                              value={d.jamMulai}
                              onChange={(e) => handleTimeChange(idx, 'jamMulai', e.target.value)}
                              aria-label={`Jam mulai hari ${d.hari}`}
                              className="flex-1 min-w-0 h-11 px-2.5 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[15px] outline-none"
                            />
                            <span aria-hidden="true" className="text-[#5a6b60] text-sm">
                              sampai
                            </span>
                            <input
                              type="time"
                              value={d.jamSelesai}
                              onChange={(e) => handleTimeChange(idx, 'jamSelesai', e.target.value)}
                              aria-label={`Jam selesai hari ${d.hari}`}
                              className="flex-1 min-w-0 h-11 px-2.5 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[15px] outline-none"
                            />
                          </div>
                        ) : (
                          <span className="flex-1 basis-[220px] text-sm text-[#5a6b60]">
                            Tutup seharian
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={handleSalinSenin}
                    className="self-start min-h-[44px] px-3.5 border border-[#a9cfae] rounded-xl bg-white text-[#064e3b] font-extrabold text-sm cursor-pointer"
                  >
                    Samakan semua hari buka dengan Senin
                  </button>

                  <button
                    type="submit"
                    className="min-h-13 rounded-xl bg-[#064e3b] text-white font-extrabold text-base border-0 cursor-pointer"
                  >
                    Simpan jam buka
                  </button>
                </form>

                {/* Vacation & Holiday Section */}
                <section
                  aria-labelledby="judul-libur-toko"
                  className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                >
                  <div>
                    <h2 id="judul-libur-toko" className="text-[17px] font-extrabold m-0">
                      Libur
                    </h2>
                    <p className="mt-1 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
                      Saat libur, produk tetap terlihat dengan label Toko Libur tetapi tidak bisa dipesan. Pesanan yang sudah masuk tetap harus diproses.
                    </p>
                  </div>

                  {/* National Holidays */}
                  <div className="flex flex-col gap-2">
                    <p className="m-0 text-sm font-extrabold text-[#92400e]">
                      Pastikan hari libur nasional
                    </p>
                    {liburNasional.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3 border border-[#dee3da] rounded-xl bg-[#fffdf5]"
                      >
                        <p className="m-0 text-sm">
                          <strong>{item.nama}</strong>, {item.iso}{' '}
                          <span className="text-[13px] font-bold text-[#157a4c]">
                            {item.status ? `(${item.status})` : '(belum dipastikan)'}
                          </span>
                        </p>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            aria-pressed={item.status === 'buka'}
                            onClick={() => handleSetLiburNasional(item.id, 'buka')}
                            className={`min-h-[40px] px-3 rounded-lg text-[13px] font-extrabold cursor-pointer ${
                              item.status === 'buka'
                                ? 'bg-[#064e3b] text-white border-0'
                                : 'border border-[#dee3da] bg-white text-[#173b2b]'
                            }`}
                          >
                            Buka biasa
                          </button>
                          <button
                            type="button"
                            aria-pressed={item.status === 'libur'}
                            onClick={() => handleSetLiburNasional(item.id, 'libur')}
                            className={`min-h-[40px] px-3 rounded-lg text-[13px] font-extrabold cursor-pointer ${
                              item.status === 'libur'
                                ? 'bg-[#064e3b] text-white border-0'
                                : 'border border-[#dee3da] bg-white text-[#173b2b]'
                            }`}
                          >
                            Libur
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Existing Custom Vacations List */}
                  {liburKustom.length > 0 && (
                    <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                      {liburKustom.map((l, idx) => (
                        <li
                          key={idx}
                          className="flex flex-wrap items-center justify-between gap-1.5 p-2.5 px-3 rounded-xl bg-[#fff1ea]"
                        >
                          <span className="text-sm">
                            <strong className="text-[#9a3412]">
                              Libur {l.dari} sampai {l.sampai}
                            </strong>{' '}
                            <span className="text-[#3f5247]">{l.alasan}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleHapusLibur(idx)}
                            aria-label={`Hapus libur ${l.dari}`}
                            className="min-h-[40px] px-3 border border-[#f2b8b2] rounded-lg bg-white text-[#b42318] text-[13px] font-bold cursor-pointer"
                          >
                            Hapus
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Add Vacation Form */}
                  <form
                    onSubmit={handleTambahLibur}
                    className="pt-3 border-t border-[#eef0eb] flex flex-col gap-2.5 m-0"
                  >
                    <p className="m-0 text-sm font-extrabold text-[#173b2b]">
                      Tambah libur lain
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="lb-dari" className="text-[13px] font-bold text-[#173b2b]">
                          Mulai libur
                        </label>
                        <input
                          id="lb-dari"
                          type="date"
                          value={tglMulaiLibur}
                          onChange={(e) => setTglMulaiLibur(e.target.value)}
                          className="h-12 px-3 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[15px] outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="lb-sampai" className="text-[13px] font-bold text-[#173b2b]">
                          Hari terakhir libur
                        </label>
                        <input
                          id="lb-sampai"
                          type="date"
                          value={tglAkhirLibur}
                          onChange={(e) => setTglAkhirLibur(e.target.value)}
                          className="h-12 px-3 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[15px] outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="lb-alasan" className="text-[13px] font-bold text-[#173b2b]">
                        Keterangan{' '}
                        <span className="font-normal text-[#5a6b60]">(opsional, tampil ke pembeli)</span>
                      </label>
                      <input
                        id="lb-alasan"
                        type="text"
                        value={alasanLiburInput}
                        onChange={(e) => setAlasanLiburInput(e.target.value)}
                        placeholder="Contoh: hajatan keluarga"
                        className="h-12 px-3 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[15px] outline-none"
                      />
                    </div>
                    {galatLibur && (
                      <p role="alert" className="m-0 text-[13px] font-bold text-[#b42318]">
                        {galatLibur}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="self-start min-h-[48px] px-4.5 border-[1.5px] border-[#064e3b] rounded-xl bg-white text-[#064e3b] font-extrabold text-[15px] cursor-pointer"
                    >
                      Tambah libur
                    </button>
                  </form>
                </section>
              </div>

              {/* Aside Preview */}
              <aside
                aria-labelledby="judul-lihat-jadwal"
                className="flex-1 basis-[280px] min-w-0 bg-[#ebf2eb] rounded-2xl p-[18px] flex flex-col gap-2.5"
              >
                <h2 id="judul-lihat-jadwal" className="text-[15px] font-extrabold m-0">
                  Yang dilihat pembeli
                </h2>
                <div className="p-3.5 rounded-xl bg-white flex flex-col gap-2 text-sm leading-relaxed">
                  <strong className="text-base text-[#173b2b]">Kebun Mang Ujang</strong>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#157a4c]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                    Buka sampai 17.00
                  </span>
                  <div className="pt-2 border-t border-[#eef0eb] flex flex-col gap-1 text-xs text-[#3f5247]">
                    <div className="flex justify-between">
                      <span>Senin – Sabtu</span>
                      <strong className="text-[#173b2b]">05.30 – 17.00</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Minggu</span>
                      <strong className="text-[#173b2b]">07.00 – 17.00</strong>
                    </div>
                  </div>
                </div>
              </aside>
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
