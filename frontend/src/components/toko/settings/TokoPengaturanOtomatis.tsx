'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';

export type BatasBatalOtomatis = '12' | '24' | '48' | number | string;

export interface AturanOtomatisToko {
  batasAutoBatalJam: number | string;
  autoTerimaPesanan: boolean;
  batasStokKritisKg: number;
  notifikasiStokRendah: boolean;
  surplusAutoAktif: boolean;
}

export interface TokoPengaturanOtomatisProps {
  aturan?: AturanOtomatisToko;
  onSimpanAturan?: (aturan: AturanOtomatisToko) => void;
  terimaOtomatisAwal?: boolean;
  batasBatalAwal?: BatasBatalOtomatis;
  pesananAktifCount?: number;
  hrefPengaturan?: string;
  className?: string;
}

const DEFAULT_ATURAN: AturanOtomatisToko = {
  batasAutoBatalJam: '24',
  autoTerimaPesanan: true,
  batasStokKritisKg: 5,
  notifikasiStokRendah: true,
  surplusAutoAktif: true,
};

export function TokoPengaturanOtomatis({
  aturan = DEFAULT_ATURAN,
  onSimpanAturan,
  terimaOtomatisAwal,
  batasBatalAwal,
  pesananAktifCount = 3,
  hrefPengaturan = '/toko/pengaturan',
  className = '',
}: TokoPengaturanOtomatisProps) {
  const [autoTerima, setAutoTerima] = useState<boolean>(
    terimaOtomatisAwal ?? aturan.autoTerimaPesanan ?? true
  );
  const [batasBatal, setBatasBatal] = useState<string>(
    String(batasBatalAwal ?? aturan.batasAutoBatalJam ?? '24')
  );
  const [tersimpan, setTersimpan] = useState<boolean>(false);
  const [teksTersimpan, setTeksTersimpan] = useState<string>('');

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    setTersimpan(true);
    setTeksTersimpan(
      `Berlaku untuk pesanan baru. ${pesananAktifCount} pesanan yang sudah masuk tetap memakai batas ${batasBatal} jam.`
    );

    if (onSimpanAturan) {
      onSimpanAturan({
        ...aturan,
        autoTerimaPesanan: autoTerima,
        batasAutoBatalJam: batasBatal,
      });
    }
  };

  const batasOptions = [
    {
      id: '12',
      judul: '12 jam',
      batal: 'Sen, 04.30',
      ket: 'Untuk pesanan sayur daun yang harus segera dikirim.',
      peringatan:
        'Ini sebelum toko buka jam 05.30. Pesanan yang masuk sore bisa batal sebelum sempat kamu lihat.',
    },
    {
      id: '24',
      judul: '24 jam (disarankan)',
      batal: 'Sen, 16.30',
      ket: 'Cukup waktu untuk memetik dan mengemas di pagi hari berikutnya.',
    },
    {
      id: '48',
      judul: '48 jam',
      batal: 'Sel, 16.30',
      ket: 'Lebih longgar, tetapi pembeli menunggu lebih lama dan bisa ragu memesan.',
    },
  ];

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
                Pesanan otomatis
              </h1>
              <p className="mt-1.5 mb-0 text-[15px] leading-relaxed text-[#3f5247]">
                Atur apa yang terjadi saat pesanan dibayar, dan berapa lama pesanan boleh menunggu diproses.
              </p>
            </div>

            {/* Success Status Banner */}
            {tersimpan && (
              <p
                role="status"
                className="m-0 flex items-start gap-2.5 p-3 px-3.5 border-[1.5px] border-[#064e3b] rounded-xl bg-[#f3faf3] text-sm leading-relaxed text-[#173b2b]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#157a4c"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>
                  <strong>Disimpan.</strong> {teksTersimpan}
                </span>
              </p>
            )}

            {/* Two-Column Form Layout */}
            <div className="flex flex-wrap items-start gap-4.5">
              {/* Form Column */}
              <form
                onSubmit={handleSimpan}
                className="flex-[999_1_460px] min-w-0 m-0 flex flex-col gap-3.5"
              >
                {/* Card 1: Auto Accept */}
                <section
                  aria-labelledby="judul-terima-otomatis"
                  className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 id="judul-terima-otomatis" className="text-[17px] font-extrabold m-0">
                        Terima pesanan otomatis
                      </h2>
                      <p className="mt-1 mb-0 text-sm leading-relaxed text-[#3f5247]">
                        {autoTerima
                          ? 'Pesanan langsung masuk ke tab Perlu diproses begitu dibayar.'
                          : 'Pesanan menunggu kamu terima atau tolak di tab Pesanan baru.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoTerima}
                      aria-label="Terima pesanan otomatis"
                      onClick={() => setAutoTerima(!autoTerima)}
                      className="shrink-0 w-15 h-11 grid place-items-center bg-transparent border-0 cursor-pointer"
                    >
                      <span
                        aria-hidden="true"
                        className={`relative inline-block w-11 h-6.5 rounded-full ${
                          autoTerima ? 'bg-[#064e3b]' : 'bg-[#c9d2c6]'
                        }`}
                      >
                        <span
                          style={{ left: autoTerima ? '21px' : '3px' }}
                          className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm"
                        />
                      </span>
                    </button>
                  </div>

                  {/* 4-Step Process Roadmap */}
                  <ol className="list-none p-3 px-3.5 rounded-xl bg-[#f6f8f4] flex flex-col gap-1.5 text-[13px] leading-relaxed m-0">
                    <li className="flex gap-2.5 items-start">
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-[22px] h-[22px] rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold"
                      >
                        1
                      </span>
                      <span>
                        <strong>Pembeli membayar</strong>{' '}
                        <span className="text-[#3f5247]">· Dana ditahan Pasok Tani</span>
                      </span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-[22px] h-[22px] rounded-full grid place-items-center bg-[#064e3b] text-white text-xs font-extrabold"
                      >
                        2
                      </span>
                      <span>
                        <strong>
                          {autoTerima ? 'Diterima otomatis' : 'Kamu terima atau tolak'}
                        </strong>{' '}
                        <span className="text-[#3f5247]">
                          · {autoTerima ? 'Stok otomatis berkurang' : 'Dalam batas waktu konfirmasi'}
                        </span>
                      </span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-[22px] h-[22px] rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold"
                      >
                        3
                      </span>
                      <span>
                        <strong>Kamu tekan Proses</strong>{' '}
                        <span className="text-[#3f5247]">
                          · Setelah ini pembeli tidak bisa membatalkan gratis
                        </span>
                      </span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-[22px] h-[22px] rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold"
                      >
                        4
                      </span>
                      <span>
                        <strong>Atur pengiriman</strong>{' '}
                        <span className="text-[#3f5247]">
                          · Kurir, antar sendiri, atau ambil di lahan
                        </span>
                      </span>
                    </li>
                  </ol>
                </section>

                {/* Card 2: Auto Cancel Deadline */}
                <section
                  aria-labelledby="judul-batas-batal"
                  className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5"
                >
                  <fieldset className="border-0 p-0 m-0">
                    <legend id="judul-batas-batal" className="p-0 text-[17px] font-extrabold text-[#173b2b]">
                      Batal otomatis kalau belum diproses dalam
                    </legend>
                    <p className="mt-1 mb-2.5 text-[13px] leading-relaxed text-[#3f5247]">
                      Dihitung dari pembeli membayar. Contoh: pesanan dibayar Min, 16.30, saat toko sudah hampir tutup.
                    </p>

                    <div className="flex flex-col gap-2">
                      {batasOptions.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 px-3.5 rounded-xl border cursor-pointer ${
                            batasBatal === opt.id
                              ? 'border-[#064e3b] bg-[#f6f8f4]'
                              : 'border-[#dee3da] bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="batas-proses"
                            checked={batasBatal === opt.id}
                            onChange={() => setBatasBatal(opt.id)}
                            className="w-5 h-5 mt-0.5 accent-[#064e3b] shrink-0"
                          />
                          <span className="flex flex-col gap-0.5">
                            <strong className="text-base text-[#173b2b]">{opt.judul}</strong>
                            <span className="text-[13px] leading-relaxed text-[#3f5247]">
                              Batal otomatis <strong className="text-[#173b2b]">{opt.batal}</strong>. {opt.ket}
                            </span>
                            {opt.peringatan && batasBatal === opt.id && (
                              <span className="text-[13px] leading-relaxed font-bold text-[#92400e]">
                                {opt.peringatan}
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Warning notice */}
                  <p className="m-0 p-2.5 px-3 rounded-xl bg-[#fdecea] text-[13px] leading-relaxed text-[#8a1c12]">
                    Saat pesanan batal otomatis, pembeli langsung dapat pengembalian dana penuh ke Dompet dan stok dikembalikan. Tingkat penyelesaian pesananmu turun, syarat lencana Petani Andalan minimal{' '}
                    <span className="px-1.5 py-0.5 border border-dashed border-[#c2a032] rounded-md bg-[#fbf3d9] text-[#5c4500] font-bold">
                      95%
                    </span>
                    .
                  </p>
                </section>

                <button
                  type="submit"
                  className="min-h-14 rounded-xl bg-[#064e3b] text-white font-extrabold text-base border-0 cursor-pointer"
                >
                  Simpan
                </button>
              </form>

              {/* Aside Preview */}
              <aside
                aria-labelledby="judul-lihat-otomatis"
                className="flex-1 basis-[280px] min-w-0 p-[18px] rounded-2xl bg-[#ebf2eb] flex flex-col gap-2.5"
              >
                <h2 id="judul-lihat-otomatis" className="text-[15px] font-extrabold m-0">
                  Yang dilihat pembeli
                </h2>
                <div className="p-3.5 rounded-xl bg-white text-[13px] leading-relaxed flex flex-col gap-1">
                  <p className="m-0 font-extrabold text-sm text-[#173b2b]">Kebun Mang Ujang</p>
                  <p className="m-0 text-[#157a4c] font-bold">
                    Diproses paling lambat {batasBatal} jam setelah dibayar
                  </p>
                  <p className="m-0 text-[#3f5247]">
                    Bisa batal gratis sampai pesanan diproses.
                  </p>
                </div>
                <p className="m-0 text-xs leading-relaxed text-[#3f5247]">
                  Tampil di halaman produk dan checkout.
                </p>
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
