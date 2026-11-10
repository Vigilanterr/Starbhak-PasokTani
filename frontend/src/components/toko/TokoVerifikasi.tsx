'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../layout';
import { UnggahFoto } from '../common';

export type StatusVerifikasiTipe = 'belum' | 'proses' | 'ditinjau' | 'ditolak' | 'terverifikasi';

export interface StatusVerifikasiPetani {
  status: StatusVerifikasiTipe;
  namaLengkap?: string;
  nik?: string;
  nomorHp?: string;
  fotoKtp?: string;
  fotoSelfieKtp?: string;
  dokumenLahan?: string;
  luasLahanM2?: number;
  lokasiLahan?: string;
  catatanPenolakan?: string;
  tanggalPengajuan?: string;
  saldoTersedia?: number | string;
}

export interface LangkahJalurVerifikasi {
  judul: string;
  waktu: string;
  ket: string;
  st: 'selesai' | 'kini' | 'gagal' | 'nanti';
}

export interface TokoVerifikasiProps {
  statusVerifikasi?: StatusVerifikasiPetani;
  onSubmitVerifikasi?: (data: FormData | Record<string, unknown>) => void;
  onMintaHapusData?: () => void;
  className?: string;
}

export function TokoVerifikasi({
  statusVerifikasi,
  onSubmitVerifikasi,
  onMintaHapusData,
  className = '',
}: TokoVerifikasiProps) {
  // Normalize status: 'proses' is treated as 'ditinjau'
  const initialStatus: StatusVerifikasiTipe =
    statusVerifikasi?.status === 'proses'
      ? 'ditinjau'
      : statusVerifikasi?.status ?? 'belum';

  const [status, setStatus] = useState<StatusVerifikasiTipe>(initialStatus);
  const [ktpStatus, setKtpStatus] = useState<'kosong' | 'siap' | 'buram'>(
    initialStatus === 'ditolak' ? 'buram' : 'kosong'
  );
  const [lahanStatus, setLahanStatus] = useState<string[]>(
    initialStatus === 'ditolak' ? ['siap', 'siap', 'kosong'] : ['kosong', 'kosong', 'kosong']
  );
  const [setuju, setSetuju] = useState(initialStatus === 'ditolak');
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [galatList, setGalatList] = useState<string[]>([]);
  const [pesanSukses, setPesanSukses] = useState('');

  const saldo = statusVerifikasi?.saldoTersedia ?? 'Rp 842.500';
  const lokasiToko = statusVerifikasi?.lokasiLahan ?? 'Lembang, Kab. Bandung Barat';

  const CHIP_CONFIG = {
    belum: {
      teks: 'Belum diverifikasi',
      badgeClass: 'bg-white text-[#3f5247] border border-dashed border-[#9aa79e]',
      dotClass: 'bg-[#c9d2c6]',
    },
    ditinjau: {
      teks: 'Sedang ditinjau',
      badgeClass: 'bg-[#e0f2fe] text-[#075985] border border-transparent',
      dotClass: 'bg-[#0369a1]',
    },
    proses: {
      teks: 'Sedang ditinjau',
      badgeClass: 'bg-[#e0f2fe] text-[#075985] border border-transparent',
      dotClass: 'bg-[#0369a1]',
    },
    ditolak: {
      teks: 'Perlu perbaikan',
      badgeClass: 'bg-[#fdecea] text-[#8a1c12] border border-transparent',
      dotClass: 'bg-[#b42318]',
    },
    terverifikasi: {
      teks: 'Terverifikasi',
      badgeClass: 'bg-[#075985] text-white border border-transparent',
      dotClass: 'bg-[#e9c75c]',
    },
  };

  const chip = CHIP_CONFIG[status] ?? CHIP_CONFIG.belum;

  const jalurDitinjau: LangkahJalurVerifikasi[] = [
    {
      judul: 'Dikirim',
      waktu: 'Min, 8 Nov, 14.10',
      ket: 'Foto KTP dan foto lahan diterima.',
      st: 'selesai',
    },
    {
      judul: 'Ditinjau tim',
      waktu: 'Perkiraan Sel, 10 Nov',
      ket: 'Tim mencocokkan nama, foto, dan lokasi lahan.',
      st: 'kini',
    },
    {
      judul: 'Hasil',
      waktu: 'Nanti',
      ket: 'Kabar lewat notifikasi dan email.',
      st: 'nanti',
    },
  ];

  const jalurDitolak: LangkahJalurVerifikasi[] = [
    {
      judul: 'Dikirim',
      waktu: 'Jum, 6 Nov, 10.15',
      ket: 'Foto KTP dan 2 foto lahan.',
      st: 'selesai',
    },
    {
      judul: 'Ditinjau tim',
      waktu: 'Sab, 7 Nov, 11.40',
      ket: 'Foto lahan diterima.',
      st: 'selesai',
    },
    {
      judul: 'Perlu perbaikan',
      waktu: 'Sab, 7 Nov, 11.40',
      ket: statusVerifikasi?.catatanPenolakan ?? 'Foto KTP terpotong: sudut kanan bawah tidak terlihat.',
      st: 'gagal',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (ktpStatus === 'kosong') {
      errors.push('Tambahkan foto KTP.');
    } else if (ktpStatus === 'buram') {
      errors.push('Foto KTP belum jelas. Ambil ulang.');
    }

    if (status === 'belum') {
      if (lahanStatus[0] !== 'siap') {
        errors.push('Tambahkan minimal 1 foto lahan.');
      }
      if (!setuju) {
        errors.push('Centang persetujuan pemakaian data.');
      }
    }

    if (errors.length > 0) {
      setGalatList(errors);
      return;
    }

    setGalatList([]);
    setStatus('ditinjau');
    setPesanSukses('Kiriman verifikasi berhasil dikirim. Sedang ditinjau.');

    if (onSubmitVerifikasi) {
      onSubmitVerifikasi({
        status: 'ditinjau',
        ktp: ktpStatus,
        lahan: lahanStatus,
      });
    }
  };

  const handleHapusData = () => {
    setStatus('belum');
    setKonfirmasiHapus(false);
    setPesanSukses('Data verifikasi telah dihapus sesuai permintaan.');
    if (onMintaHapusData) {
      onMintaHapusData();
    }
  };

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="pengaturan" terverifikasi={status === 'terverifikasi'} />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1040px]">
          <div className="flex flex-col gap-4">
            <Link
              href="/toko"
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-sm font-bold text-[#157a4c] hover:underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Beranda toko
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173b2b]">
                  Verifikasi petani
                </h1>
                <p className="mt-1 text-sm sm:text-base text-[#3f5247]">
                  Wajib sebelum tarik saldo pertama. Setelah lolos, tokomu dapat lencana Petani Terverifikasi.
                </p>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap ${chip.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${chip.dotClass}`} />
                {chip.teks}
              </span>
            </div>

            {pesanSukses && (
              <p aria-live="polite" className="text-sm font-bold text-[#157a4c]">
                {pesanSukses}
              </p>
            )}

            {galatList.length > 0 && (
              <div role="alert" className="p-3.5 sm:p-4 border-[1.5px] border-[#b42318] rounded-xl bg-[#fdecea]">
                <p className="font-extrabold text-[#8a1c12] text-sm mb-1.5">
                  Mohon lengkapi data verifikasi:
                </p>
                <ul className="list-disc pl-5 text-sm leading-relaxed text-[#8a1c12]">
                  {galatList.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-start gap-5">
              {/* Left Column: Form or Status Details */}
              <div className="w-full lg:flex-[999_1_460px] min-w-0 flex flex-col gap-4">
                {/* Timeline for ditinjau and ditolak */}
                {(status === 'ditinjau' || status === 'ditolak') && (
                  <section
                    aria-labelledby="judul-status"
                    className={`p-4 sm:p-5 rounded-2xl flex flex-col gap-3 ${
                      status === 'ditolak'
                        ? 'border-[1.5px] border-[#b42318] bg-[#fffaf6]'
                        : 'border border-[#075985] bg-white'
                    }`}
                  >
                    <h2
                      id="judul-status"
                      className={`text-lg font-extrabold ${
                        status === 'ditolak' ? 'text-[#8a1c12]' : 'text-[#075985]'
                      }`}
                    >
                      {status === 'ditolak' ? 'Verifikasi perlu perbaikan' : 'Verifikasi sedang ditinjau'}
                    </h2>
                    <p className="text-sm text-[#3f5247] leading-relaxed">
                      {status === 'ditolak'
                        ? 'Tim kami sudah memeriksa kirimanmu. Foto lahan diterima, silakan foto ulang KTP agar jelas.'
                        : 'Tim kami sedang mencocokkan data KTP dan lokasi kebunmu.'}
                    </p>

                    <ol className="list-none m-0 p-0">
                      {(status === 'ditolak' ? jalurDitolak : jalurDitinjau).map((step, idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        return (
                          <li key={idx} className="flex gap-3.5">
                            <div aria-hidden="true" className="shrink-0 w-6 flex flex-col items-center">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                                  step.st === 'selesai'
                                    ? 'bg-[#157a4c] text-white'
                                    : step.st === 'gagal'
                                    ? 'bg-[#b42318] text-white'
                                    : step.st === 'kini'
                                    ? 'bg-[#c2a032] text-white'
                                    : 'border border-[#c9d2c6] bg-white text-transparent'
                                }`}
                              >
                                {step.st === 'selesai' && '✓'}
                                {step.st === 'gagal' && '!'}
                                {step.st === 'kini' && '•'}
                              </span>
                              {!isLast && (
                                <span className="flex-1 min-h-[20px] border-l-2 border-dotted border-[#c9d2c6] my-1" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pb-3">
                              <p className="flex flex-wrap justify-between gap-1 text-sm">
                                <strong className={`font-bold ${step.st === 'gagal' ? 'text-[#8a1c12]' : 'text-[#173b2b]'}`}>
                                  {step.judul}
                                </strong>
                                <span className="text-xs text-[#5a6b60]">{step.waktu}</span>
                              </p>
                              <p className="mt-0.5 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                                {step.ket}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                )}

                {/* Sambil Menunggu Reassurance (Ditinjau State) */}
                {status === 'ditinjau' && (
                  <section aria-labelledby="judul-sambil" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2">
                    <h2 id="judul-sambil" className="text-base font-extrabold text-[#173b2b]">
                      Sambil menunggu
                    </h2>
                    <p className="text-sm text-[#3f5247] leading-relaxed">
                      Tokomu tetap bisa berjualan. Hasil penjualan terkumpul di saldo dan bisa ditarik setelah terverifikasi.
                    </p>
                    <Link
                      href="/toko"
                      className="self-start inline-flex items-center min-h-[46px] px-4 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold hover:bg-[#0f5132]"
                    >
                      Kembali ke beranda toko
                    </Link>
                  </section>
                )}

                {/* Terverifikasi Showcase Card */}
                {status === 'terverifikasi' && (
                  <section
                    aria-labelledby="judul-lencana"
                    className="p-5 sm:p-6 border-[1.5px] border-[#075985] rounded-2xl bg-white flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-[#075985] text-white"
                      >
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </span>
                      <div>
                        <h2 id="judul-lencana" className="text-xl font-extrabold text-[#173b2b]">
                          Petani Terverifikasi
                        </h2>
                        <p className="text-xs sm:text-sm text-[#3f5247]">
                          Sejak Rab, 21 Okt 2026
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#f3f7fa] flex flex-col gap-1.5">
                      <p className="text-xs font-bold text-[#3f5247]">Yang dilihat pembeli</p>
                      <p className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#173b2b]">
                        Kebun Mang Ujang{' '}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#075985] text-white text-xs font-bold">
                          ✓ Terverifikasi
                        </span>
                      </p>
                      <p className="text-xs text-[#3f5247]">
                        Muncul di kartu produk, halaman toko, dan obrolan. KTP-mu tidak pernah ditampilkan.
                      </p>
                    </div>

                    <ul className="list-none m-0 p-0 flex flex-col gap-2 text-sm text-[#173b2b]">
                      <li className="flex gap-2">
                        <span className="text-[#157a4c] font-bold">✓</span>
                        <span>Saldo bisa ditarik. Sekarang <strong>{saldo}</strong>.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#157a4c] font-bold">✓</span>
                        <span>Bisa membuka Daftar Tunggu dan menerima Komitmen prapanen.</span>
                      </li>
                    </ul>

                    <Link
                      href="/toko/keuangan/penarikan"
                      className="self-start inline-flex items-center min-h-[46px] px-5 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold hover:bg-[#0f5132]"
                    >
                      Tarik saldo
                    </Link>
                  </section>
                )}

                {/* Verification Form (Belum or Ditolak retry) */}
                {(status === 'belum' || status === 'ditolak') && (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Preparation checklist */}
                    {status === 'belum' && (
                      <section aria-labelledby="judul-siapkan" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                        <h2 id="judul-siapkan" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                          Siapkan dulu, sekitar 5 menit
                        </h2>
                        <ul className="list-none m-0 p-0 flex flex-col gap-2 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                          <li className="flex gap-2.5">
                            <span className="text-[#157a4c] font-bold">✓</span>
                            <span>KTP asli milikmu, bukan fotokopi.</span>
                          </li>
                          <li className="flex gap-2.5">
                            <span className="text-[#157a4c] font-bold">✓</span>
                            <span>Foto lahanmu, paling baik diambil langsung di lahan.</span>
                          </li>
                          <li className="flex gap-2.5">
                            <span className="text-[#157a4c] font-bold">✓</span>
                            <span>Nama di KTP harus sama dengan nama pemilik rekening untuk penarikan.</span>
                          </li>
                        </ul>
                      </section>
                    )}

                    {/* KTP Section */}
                    <section id="vf-ktp" aria-labelledby="judul-ktp" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                      <h2 id="judul-ktp" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                        {status === 'ditolak' ? 'Foto ulang KTP' : 'Foto KTP'}
                      </h2>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-[280px] shrink-0">
                          <UnggahFoto
                            bentuk="kartu"
                            label="Foto KTP"
                            wajib
                            status={ktpStatus}
                            pesanBuram={
                              ktpStatus === 'buram'
                                ? 'Ada silau di tengah, NIK tidak terbaca. Ambil ulang tanpa lampu langsung di atas KTP.'
                                : undefined
                            }
                            onPilih={() => setKtpStatus('siap')}
                            onUlang={() => setKtpStatus('siap')}
                            onHapus={() => setKtpStatus('kosong')}
                          />
                        </div>

                        <ul className="list-none m-0 p-0 flex flex-col gap-2 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                          <li className="flex gap-2">
                            <span className="text-[#157a4c] font-bold">✓</span>
                            <span>Letakkan di meja datar berwarna gelap.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#157a4c] font-bold">✓</span>
                            <span>Keempat sudut KTP masuk ke foto.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#157a4c] font-bold">✓</span>
                            <span>Cahaya terang tanpa silau lampu atau matahari.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#b42318] font-bold">✕</span>
                            <span>Bukan fotokopi atau foto dari layar HP lain.</span>
                          </li>
                          <li className="mt-1 text-xs text-[#5a6b60]">
                            Kamu tidak perlu mengetik NIK. Tim kami membacanya dari foto.
                          </li>
                        </ul>
                      </div>
                    </section>

                    {/* Farmland Photos (Only required when belum) */}
                    {status === 'belum' && (
                      <section id="vf-lahan" aria-labelledby="judul-lahan" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                        <div>
                          <h2 id="judul-lahan" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                            Foto lahan
                          </h2>
                          <p className="mt-1 text-xs sm:text-sm text-[#3f5247]">
                            Tanaman dan sekitarnya terlihat. Lokasi: {lokasiToko}.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3.5">
                          <div className="w-full sm:w-[260px] shrink-0">
                            <UnggahFoto
                              bentuk="lebar"
                              label="Foto lahan 1"
                              wajib
                              status={(lahanStatus[0] as 'kosong' | 'siap' | 'buram') || 'kosong'}
                              onPilih={() => setLahanStatus((prev) => ['siap', prev[1] ?? 'kosong', prev[2] ?? 'kosong'])}
                              onUlang={() => setLahanStatus((prev) => ['siap', prev[1] ?? 'kosong', prev[2] ?? 'kosong'])}
                              onHapus={() => setLahanStatus((prev) => ['kosong', prev[1] ?? 'kosong', prev[2] ?? 'kosong'])}
                            />
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2.5">
                            <UnggahFoto
                              bentuk="lebar"
                              label="Foto lahan 2"
                              ringkas
                              status={(lahanStatus[1] as 'kosong' | 'siap' | 'buram') || 'kosong'}
                              onPilih={() => setLahanStatus((prev) => [prev[0] ?? 'kosong', 'siap', prev[2] ?? 'kosong'])}
                              onUlang={() => setLahanStatus((prev) => [prev[0] ?? 'kosong', 'siap', prev[2] ?? 'kosong'])}
                              onHapus={() => setLahanStatus((prev) => [prev[0] ?? 'kosong', 'kosong', prev[2] ?? 'kosong'])}
                            />
                            <UnggahFoto
                              bentuk="lebar"
                              label="Foto lahan 3"
                              ringkas
                              status={(lahanStatus[2] as 'kosong' | 'siap' | 'buram') || 'kosong'}
                              onPilih={() => setLahanStatus((prev) => [prev[0] ?? 'kosong', prev[1] ?? 'kosong', 'siap'])}
                              onUlang={() => setLahanStatus((prev) => [prev[0] ?? 'kosong', prev[1] ?? 'kosong', 'siap'])}
                              onHapus={() => setLahanStatus((prev) => [prev[0] ?? 'kosong', prev[1] ?? 'kosong', 'kosong'])}
                            />
                          </div>
                        </div>
                      </section>
                    )}

                    {/* PDP Consent Checkbox */}
                    {status === 'belum' && (
                      <label id="vf-setuju" className="flex items-start gap-3 p-3.5 sm:p-4 border border-[#dee3da] rounded-xl bg-white text-xs sm:text-sm leading-relaxed cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setuju}
                          onChange={(e) => setSetuju(e.target.checked)}
                          className="w-5 h-5 mt-0.5 accent-[#064e3b]"
                        />
                        <span>
                          Saya setuju KTP dan foto lahan dipakai Pasok Tani hanya untuk verifikasi, seperti dijelaskan di{' '}
                          <a href="#vf-data" className="font-bold text-[#157a4c] underline">
                            Data kamu
                          </a>
                          .{' '}
                          <span className="px-1.5 py-0.5 rounded border border-dashed border-[#c2a032] bg-[#fbf3d9] text-[#5c4500] text-[11px] font-bold">
                            [Cek UU PDP]
                          </span>
                        </span>
                      </label>
                    )}

                    <button
                      type="submit"
                      className="min-h-[52px] rounded-xl bg-[#064e3b] text-white text-base font-extrabold hover:bg-[#0f5132]"
                    >
                      {status === 'ditolak' ? 'Kirim perbaikan KTP' : 'Kirim untuk verifikasi'}
                    </button>
                    <p className="text-center text-xs text-[#3f5247]">
                      Biasanya selesai dalam{' '}
                      <span className="px-1.5 py-0.5 rounded border border-dashed border-[#c2a032] bg-[#fbf3d9] text-[#5c4500] font-bold">
                        2 hari kerja
                      </span>
                      . Kabar dikirim lewat notifikasi dan email.
                    </p>
                  </form>
                )}
              </div>

              {/* Right Column (Aside): Data Privacy / UU PDP Disclosure */}
              <aside
                id="vf-data"
                aria-labelledby="judul-data"
                className="w-full lg:w-[320px] shrink-0 p-4 sm:p-5 rounded-2xl bg-[#ebf2eb] flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 id="judul-data" className="text-base font-extrabold text-[#173b2b] flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#064e3b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Data kamu
                  </h2>
                  <span className="px-1.5 py-0.5 rounded border border-dashed border-[#c2a032] bg-[#fbf3d9] text-[#5c4500] text-[11px] font-bold">
                    [Cek UU PDP]
                  </span>
                </div>

                <dl className="m-0 flex flex-col gap-2.5 text-xs sm:text-sm leading-relaxed text-[#173b2b]">
                  <div>
                    <dt className="font-extrabold text-[#173b2b]">Untuk apa</dt>
                    <dd className="mt-0.5 text-[#3f5247]">
                      Memastikan toko dijalankan petani sungguhan, dan pemilik toko sama dengan pemilik rekening penarikan.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-extrabold text-[#173b2b]">Siapa yang melihat</dt>
                    <dd className="mt-0.5 text-[#3f5247]">
                      Hanya tim verifikasi Pasok Tani. Pembeli hanya melihat lencana, tidak pernah KTP-mu.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-extrabold text-[#173b2b]">Berapa lama disimpan</dt>
                    <dd className="mt-0.5 text-[#3f5247]">
                      Foto KTP dihapus 90 hari setelah keputusan. Yang tetap disimpan hanya status hasil verifikasi dan 4 angka terakhir NIK secara terenkripsi.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-extrabold text-[#173b2b]">Hakmu</dt>
                    <dd className="mt-0.5 text-[#3f5247]">
                      Kamu bisa melihat, memperbaiki, atau minta hapus data ini kapan pun.
                    </dd>
                  </div>
                </dl>

                {status === 'terverifikasi' && (
                  <div className="pt-3 border-t border-[#c9dcc9] flex flex-col gap-2">
                    <p className="text-xs text-[#173b2b] leading-relaxed">
                      Tersimpan: hasil verifikasi dan NIK berakhiran 4821. Foto KTP dihapus otomatis 90 hari ke depan.
                    </p>
                    {!konfirmasiHapus ? (
                      <button
                        type="button"
                        onClick={() => setKonfirmasiHapus(true)}
                        className="self-start min-h-[40px] px-3.5 rounded-xl border border-[#f2b8b2] bg-white text-[#b42318] text-xs sm:text-sm font-extrabold hover:bg-[#fdecea]"
                      >
                        Minta hapus data verifikasi
                      </button>
                    ) : (
                      <div role="group" aria-label="Konfirmasi hapus data verifikasi" className="p-3 rounded-xl bg-[#fdecea] flex flex-col gap-2">
                        <p className="text-xs font-bold text-[#8a1c12] leading-snug">
                          Lencana dicabut dan saldo {saldo} tidak bisa ditarik sampai kamu verifikasi ulang. Lanjutkan?
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleHapusData}
                            className="min-h-[38px] px-3.5 rounded-lg bg-[#b42318] text-white text-xs font-extrabold hover:bg-[#8a1c12]"
                          >
                            Hapus data
                          </button>
                          <button
                            type="button"
                            onClick={() => setKonfirmasiHapus(false)}
                            className="min-h-[38px] px-3.5 rounded-lg border border-[#f2b8b2] bg-white text-[#173b2b] text-xs font-bold hover:bg-[#f6f8f4]"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </aside>
            </div>
          </div>
        </main>
      </div>

      <div className="lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="lainnya" />
      </div>
    </div>
  );
}

export default TokoVerifikasi;
