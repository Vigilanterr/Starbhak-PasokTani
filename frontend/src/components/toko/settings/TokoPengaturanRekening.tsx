'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';

export interface RekeningBankToko {
  id?: string;
  namaBank: string;
  kodeBank?: string;
  nomorRekening: string;
  namaPemilik: string;
  statusVerifikasi?: 'terverifikasi' | 'menunggu' | 'gagal' | string;
  rekeningUtama?: boolean;
  singkat?: string;
  terakhirDipakai?: string;
}

export type HasilCekRekening = 'cocok' | 'beda' | 'tidakAda' | 'dorman' | 'gangguan';

export interface TokoPengaturanRekeningProps {
  rekening?: RekeningBankToko;
  status?: 'lengkap' | 'belum' | string;
  statusAwal?: 'ada' | 'belum';
  emailVerifikasi?: string;
  onSimpanRekening?: (rekening: RekeningBankToko) => void;
  onCekRekening?: (bankId: string, nomor: string) => Promise<{ hasil: HasilCekRekening; namaBank?: string }>;
  onKirimOtp?: () => Promise<boolean>;
  hrefPengaturan?: string;
  className?: string;
}

const DEFAULT_REKENING: RekeningBankToko = {
  id: 'rek-1',
  namaBank: 'BRI',
  singkat: 'BRI',
  nomorRekening: '••••3021',
  namaPemilik: 'UJANG',
  statusVerifikasi: 'terverifikasi',
  terakhirDipakai: 'Penarikan terakhir Rp 2.100.000, Sel, 3 Nov. Berhasil.',
};

const BANK_POPULER = [
  'BRI',
  'bjb',
  'BNI',
  'Mandiri',
  'BCA',
  'BSI',
  'CIMB Niaga',
  'Permata',
  'BTN',
  'SeaBank',
];

export function TokoPengaturanRekening({
  rekening = DEFAULT_REKENING,
  status = 'lengkap',
  statusAwal = 'ada',
  emailVerifikasi = 'uj***@gmail.com',
  onSimpanRekening,
  onCekRekening,
  onKirimOtp,
  hrefPengaturan = '/toko/pengaturan',
  className = '',
}: TokoPengaturanRekeningProps) {
  const adaRekeningAwal = (status === 'lengkap' || statusAwal === 'ada') && !!rekening;

  const [formBuka, setFormBuka] = useState<boolean>(!adaRekeningAwal);
  const [bankTerpilih, setBankTerpilih] = useState<string>('');
  const [cariBank, setCariBank] = useState<string>('');
  const [nomorInput, setNomorInput] = useState<string>('');
  const [hasilCek, setHasilCek] = useState<HasilCekRekening | null>(null);
  const [namaHasil, setNamaHasil] = useState<string>('');
  const [otpTerkirim, setOtpTerkirim] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [galat, setGalat] = useState<string>('');
  const [tersimpan, setTersimpan] = useState<boolean>(false);
  const [activeRekening, setActiveRekening] = useState<RekeningBankToko | undefined>(
    adaRekeningAwal ? rekening : undefined
  );

  const bankListFiltered = BANK_POPULER.filter((b) =>
    b.toLowerCase().includes(cariBank.toLowerCase())
  );

  const handleCekRekening = async () => {
    const cleanNum = nomorInput.replace(/\D/g, '');
    if (!bankTerpilih) {
      setGalat('Pilih bank terlebih dahulu.');
      return;
    }
    if (cleanNum.length < 8) {
      setGalat('Nomor rekening minimal 8 angka.');
      return;
    }
    setGalat('');

    if (onCekRekening) {
      const res = await onCekRekening(bankTerpilih, cleanNum);
      setHasilCek(res.hasil);
      setNamaHasil(res.namaBank ?? 'UJANG');
      return;
    }

    // Default simulation logic matching design
    if (cleanNum.endsWith('99')) {
      setHasilCek('beda');
      setNamaHasil('SITI AMINAH');
    } else if (cleanNum.endsWith('00')) {
      setHasilCek('tidakAda');
      setNamaHasil('');
    } else if (cleanNum.endsWith('88')) {
      setHasilCek('dorman');
      setNamaHasil('');
    } else {
      setHasilCek('cocok');
      setNamaHasil('UJANG');
    }
  };

  const handleKirimOtp = async () => {
    setOtpTerkirim(true);
    setGalat('');
    if (onKirimOtp) {
      await onKirimOtp();
    }
  };

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankTerpilih) {
      setGalat('Pilih bank terlebih dahulu.');
      return;
    }
    if (!nomorInput) {
      setGalat('Isi nomor rekening.');
      return;
    }
    if (hasilCek !== 'cocok') {
      setGalat('Cek rekening dan pastikan nama cocok dengan KTP.');
      return;
    }
    if (!otpTerkirim || otpInput.trim().length !== 6) {
      setGalat('Masukkan 6 angka kode dari email.');
      return;
    }

    const masked = nomorInput.length > 4 ? `••••${nomorInput.slice(-4)}` : nomorInput;
    const newRekening: RekeningBankToko = {
      id: `rek-${Date.now()}`,
      namaBank: bankTerpilih,
      singkat: bankTerpilih.slice(0, 4).toUpperCase(),
      nomorRekening: masked,
      namaPemilik: namaHasil || 'UJANG',
      statusVerifikasi: 'terverifikasi',
      terakhirDipakai: 'Baru ditambahkan. Siap dipakai setelah 24 jam.',
    };

    setActiveRekening(newRekening);
    setTersimpan(true);
    setFormBuka(false);
    setGalat('');

    if (onSimpanRekening) {
      onSimpanRekening(newRekening);
    }
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
          <div className="max-w-[760px] flex flex-col gap-4">
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
                Rekening bank
              </h1>
              <p className="mt-1.5 mb-0 text-[15px] leading-relaxed text-[#3f5247]">
                Tempat saldo dikirim saat kamu menarik. Wajib sebelum tarik saldo pertama, dan harus atas namamu sendiri.
              </p>
            </div>

            {/* Success Alert */}
            {tersimpan && (
              <div
                role="status"
                className="p-3 px-3.5 border-[1.5px] border-[#064e3b] rounded-xl bg-[#f3faf3] text-sm leading-relaxed text-[#173b2b]"
              >
                <strong>Rekening disimpan.</strong> Penarikan ke rekening ini bisa mulai 24 jam setelah diganti{' '}
                <span className="px-1.5 py-0.5 border border-dashed border-[#c2a032] rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
                  sementara
                </span>
                . Kami kirim email pemberitahuan ke {emailVerifikasi}.
              </div>
            )}

            {/* Existing Account Display Card */}
            {activeRekening && !formBuka && (
              <section
                aria-labelledby="judul-rekening-aktif"
                className="p-[18px] border-[1.5px] border-[#064e3b] rounded-2xl bg-white flex flex-col gap-3"
              >
                <h2 id="judul-rekening-aktif" className="text-xs font-bold text-[#5a6b60] m-0">
                  Rekening penarikan
                </h2>
                <div className="flex items-center gap-3.5">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-12 h-12 rounded-xl grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-sm font-extrabold"
                  >
                    {activeRekening.singkat ?? activeRekening.namaBank}
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-lg font-extrabold text-[#173b2b]">
                      {activeRekening.namaBank} {activeRekening.nomorRekening}
                    </p>
                    <p className="mt-0.5 mb-0 text-sm text-[#3f5247]">
                      Atas nama{' '}
                      <strong className="text-[#173b2b]">{activeRekening.namaPemilik}</strong>
                    </p>
                  </div>
                </div>
                <p className="m-0 flex items-center gap-2 text-sm font-bold text-[#157a4c]">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Cocok dengan nama di KTP
                </p>
                {activeRekening.terakhirDipakai && (
                  <p className="m-0 text-[13px] text-[#3f5247]">
                    {activeRekening.terakhirDipakai}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setFormBuka(true)}
                  className="self-start min-h-[48px] px-4.5 border-[1.5px] border-[#064e3b] rounded-xl bg-white text-[#064e3b] font-extrabold text-[15px] cursor-pointer"
                >
                  Ganti rekening
                </button>
              </section>
            )}

            {/* Add / Change Form */}
            {formBuka && (
              <form
                onSubmit={handleSimpan}
                className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-4 m-0"
              >
                <h2 className="text-[17px] font-extrabold m-0">
                  {activeRekening ? 'Ganti rekening' : 'Tambah rekening'}
                </h2>

                {galat && (
                  <p
                    role="alert"
                    className="p-2.5 px-3 border-[1.5px] border-[#b42318] rounded-xl bg-[#fdecea] text-sm font-bold text-[#8a1c12] m-0"
                  >
                    {galat}
                  </p>
                )}

                {/* Step 1: Bank Selection */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rk-bank" className="text-[15px] font-bold text-[#173b2b]">
                    1. Bank <span aria-hidden="true" className="text-[#b42318]">*</span>
                  </label>
                  {bankTerpilih ? (
                    <div className="flex items-center justify-between gap-2.5 min-h-[52px] p-2 pl-3.5 border-[1.5px] border-[#157a4c] rounded-xl bg-[#f3faf3]">
                      <strong className="text-[15px]">{bankTerpilih}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setBankTerpilih('');
                          setHasilCek(null);
                        }}
                        className="min-h-[40px] px-3 border border-[#a9cfae] rounded-lg bg-white text-[#064e3b] text-[13px] font-extrabold cursor-pointer"
                      >
                        Ganti
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        id="rk-bank"
                        type="search"
                        value={cariBank}
                        onChange={(e) => setCariBank(e.target.value)}
                        placeholder="Ketik nama bank"
                        autoComplete="off"
                        className="h-13 px-3.5 border-[1.5px] border-[#064e3b] rounded-xl bg-white text-[#173b2b] text-base outline-none"
                      />
                      <p className="m-0 text-xs font-bold text-[#5a6b60]">Pilihan bank populer</p>
                      <div role="group" aria-label="Pilihan bank" className="flex flex-wrap gap-1.5">
                        {bankListFiltered.map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => {
                              setBankTerpilih(bank);
                              setCariBank('');
                              setHasilCek(null);
                            }}
                            className="min-h-[44px] px-3.5 border border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-sm font-bold cursor-pointer"
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Step 2: Nomor Rekening */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rk-nomor" className="text-[15px] font-bold text-[#173b2b]">
                    2. Nomor rekening <span aria-hidden="true" className="text-[#b42318]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      id="rk-nomor"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={nomorInput}
                      onChange={(e) => {
                        setNomorInput(e.target.value.replace(/\D/g, ''));
                        setHasilCek(null);
                      }}
                      placeholder="Contoh: 001201003021503"
                      className="flex-1 basis-[220px] min-w-0 h-13 px-3.5 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-lg font-bold tracking-wider outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCekRekening}
                      className="min-h-13 px-4.5 border-[1.5px] border-[#064e3b] rounded-xl bg-white text-[#064e3b] font-extrabold text-[15px] cursor-pointer"
                    >
                      Cek rekening
                    </button>
                  </div>

                  {/* Live Inquiry Result Card */}
                  {hasilCek && (
                    <div
                      aria-live="polite"
                      className={`mt-1 p-3 px-3.5 rounded-xl border text-sm leading-relaxed ${
                        hasilCek === 'cocok'
                          ? 'bg-[#f3faf3] border-[#a9cfae]'
                          : hasilCek === 'beda' || hasilCek === 'tidakAda' || hasilCek === 'dorman'
                          ? 'bg-[#fdecea] border-[#f2b8b2]'
                          : 'bg-[#fffdf5] border-[#fbf3d9]'
                      }`}
                    >
                      {namaHasil && (
                        <>
                          <p className="m-0 text-xs text-[#3f5247]">Nama di bank</p>
                          <p className="m-0 mb-1 text-[17px] font-extrabold tracking-wide">
                            {namaHasil}
                          </p>
                        </>
                      )}
                      {hasilCek === 'cocok' && (
                        <p className="m-0 font-bold text-[#157a4c]">
                          Cocok dengan nama di KTP.
                        </p>
                      )}
                      {hasilCek === 'beda' && (
                        <p className="m-0 font-bold text-[#b42318]">
                          Tidak cocok dengan nama di KTP. Pakai rekening atas namamu sendiri.
                        </p>
                      )}
                      {hasilCek === 'tidakAda' && (
                        <p className="m-0 font-bold text-[#b42318]">
                          Rekening tidak ditemukan di bank ini. Periksa kembali nomornya.
                        </p>
                      )}
                      {hasilCek === 'dorman' && (
                        <p className="m-0 font-bold text-[#b42318]">
                          Rekening ini tidak aktif (dormant) menurut bank. Aktifkan dulu di bank.
                        </p>
                      )}
                      {hasilCek === 'gangguan' && (
                        <p className="m-0 font-bold text-[#92400e]">
                          Pengecekan ke bank sedang gangguan sementara. Coba beberapa saat lagi.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 3: Kode dari Email */}
                {hasilCek === 'cocok' && (
                  <div className="flex flex-col gap-1.5">
                    <p className="m-0 text-[15px] font-bold text-[#173b2b]">
                      3. Kode dari email
                    </p>
                    <p className="m-0 text-[13px] leading-relaxed text-[#3f5247]">
                      Untuk memastikan yang mengganti rekening memang kamu.
                    </p>
                    {!otpTerkirim ? (
                      <button
                        type="button"
                        onClick={handleKirimOtp}
                        className="self-start min-h-[48px] px-4 border-[1.5px] border-[#064e3b] rounded-xl bg-white text-[#064e3b] font-extrabold text-[15px] cursor-pointer"
                      >
                        Kirim kode ke {emailVerifikasi}
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <label htmlFor="rk-kode" className="text-xs text-[#3f5247]">
                          Kode 6 angka dikirim ke {emailVerifikasi}. Berlaku 10 menit.
                        </label>
                        <input
                          id="rk-kode"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="w-48 h-13 px-3.5 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[22px] font-extrabold tracking-[0.3em] outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleKirimOtp}
                          className="self-start min-h-[40px] px-1 bg-transparent border-0 text-[#157a4c] font-extrabold text-[13px] cursor-pointer"
                        >
                          Kirim ulang kode
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-wrap-reverse gap-2.5 pt-1">
                  {activeRekening && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormBuka(false);
                        setGalat('');
                      }}
                      className="flex-1 basis-[140px] min-h-13 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] font-bold text-[15px] cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-[2_1_220px] min-h-13 rounded-xl bg-[#064e3b] text-white font-extrabold text-base border-0 cursor-pointer"
                  >
                    Simpan rekening
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Security Notice */}
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#f6f8f4] text-xs leading-relaxed text-[#3f5247]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#157a4c] mt-0.5"
                aria-hidden="true"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>
                Nama pemilik dicek langsung ke bank. Pasok Tani tidak pernah meminta PIN, kata sandi m-banking, atau kode OTP bank.
              </span>
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
