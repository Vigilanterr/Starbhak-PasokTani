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
}

export interface SyaratPenarikanItem {
  id: 'verif' | 'rekening';
  judul: string;
  ok: boolean;
  ket: string;
  aksi?: string;
  href?: string;
}

export interface JalurPenarikanStep {
  judul: string;
  waktu: string;
  ket: string;
  st: 'selesai' | 'kini' | 'nanti';
}

export interface TokoPenarikanProps {
  saldoTersedia: number | string;
  syarat?: 'lengkap' | 'belum-ktp' | 'belum-rekening' | 'belumVerif' | 'belumRekening' | string;
  minimalPenarikan?: number;
  biayaAdmin?: number;
  rekeningTujuan?: RekeningBankToko;
  onTarikSaldo?: (jumlah: number, rekeningId: string) => void;
  onSubmitPenarikan?: (jumlah: number) => Promise<boolean> | void;
  hrefKeuangan?: string;
  hrefRekening?: string;
  hrefVerifikasi?: string;
  className?: string;
}

const DEFAULT_REKENING: RekeningBankToko = {
  id: 'rek-1',
  namaBank: 'BRI',
  nomorRekening: '••••3021',
  namaPemilik: 'UJANG',
  statusVerifikasi: 'terverifikasi',
};

function formatRupiah(nilai: number): string {
  return 'Rp ' + Math.round(nilai).toLocaleString('id-ID');
}

export function TokoPenarikan({
  saldoTersedia = 842500,
  syarat = 'lengkap',
  minimalPenarikan = 10000,
  biayaAdmin = 0,
  rekeningTujuan = DEFAULT_REKENING,
  onTarikSaldo,
  onSubmitPenarikan,
  hrefKeuangan = '/toko/keuangan',
  hrefRekening = '/toko/pengaturan/rekening',
  hrefVerifikasi = '/toko/verifikasi',
  className = '',
}: TokoPenarikanProps) {
  const numericSaldo = typeof saldoTersedia === 'string'
    ? parseInt(saldoTersedia.replace(/\D/g, ''), 10) || 0
    : Number(saldoTersedia) || 0;

  const [inputJumlah, setInputJumlah] = useState<string>('');
  const [errorJumlah, setErrorJumlah] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [sudahDiajukan, setSudahDiajukan] = useState<boolean>(false);
  const [jumlahDitarik, setJumlahDitarik] = useState<number>(0);

  // Check eligibility status
  const isVerifOk = syarat !== 'belumVerif' && syarat !== 'belum-ktp';
  const isRekeningOk = syarat !== 'belumRekening' && syarat !== 'belum-rekening';
  const isEligible = isVerifOk && isRekeningOk;

  const validateInput = (val: string): { valid: boolean; num: number; err: string } => {
    const cleanDigits = val.replace(/[^0-9]/g, '');
    if (!cleanDigits) {
      return { valid: false, num: 0, err: 'Isi jumlah yang mau ditarik.' };
    }
    const num = parseInt(cleanDigits, 10);
    if (isNaN(num)) {
      return { valid: false, num: 0, err: 'Tulis angka saja, contoh 500000.' };
    }
    if (num < minimalPenarikan) {
      return { valid: false, num, err: `Minimal ${formatRupiah(minimalPenarikan)}.` };
    }
    if (num > numericSaldo) {
      return { valid: false, num, err: 'Lebih dari saldo yang bisa ditarik.' };
    }
    return { valid: true, num, err: '' };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleanDigits = raw.replace(/[^0-9]/g, '');
    if (!cleanDigits) {
      setInputJumlah('');
      setErrorJumlah('');
      return;
    }
    const num = parseInt(cleanDigits, 10);
    setInputJumlah(num.toLocaleString('id-ID'));
    if (errorJumlah) {
      const res = validateInput(cleanDigits);
      setErrorJumlah(res.err);
    }
  };

  const handleQuickFill = (amount: number) => {
    const capped = Math.min(amount, numericSaldo);
    setInputJumlah(capped.toLocaleString('id-ID'));
    setErrorJumlah('');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateInput(inputJumlah);
    if (!res.valid) {
      setErrorJumlah(res.err);
      return;
    }
    setErrorJumlah('');
    setShowModal(true);
  };

  const handleConfirmWithdraw = async () => {
    const res = validateInput(inputJumlah);
    if (!res.valid) {
      setErrorJumlah(res.err);
      setShowModal(false);
      return;
    }
    setJumlahDitarik(res.num);
    setShowModal(false);
    setSudahDiajukan(true);

    if (onSubmitPenarikan) {
      await onSubmitPenarikan(res.num);
    }
    if (onTarikSaldo) {
      onTarikSaldo(res.num, rekeningTujuan?.id ?? 'rek-1');
    }
  };

  const sisaSaldo = Math.max(0, numericSaldo - (jumlahDitarik || validateInput(inputJumlah).num));

  return (
    <div className={`relative min-h-full bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />
      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden min-[900px]:block w-[272px] shrink-0 p-5 pt-5 pb-6 pl-5">
          <TokoSamping aktif="keuangan" terverifikasi={isVerifOk} />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 min-[900px]:px-6 min-[900px]:py-5 min-[900px]:pb-12">
          <div className="max-w-[680px] flex flex-col gap-4">
            {/* Back link */}
            <Link
              href={hrefKeuangan}
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
              Keuangan
            </Link>

            {/* Page Header */}
            <div>
              <h1 className="text-2xl min-[900px]:text-[28px] font-extrabold tracking-tight leading-tight m-0">
                Tarik saldo
              </h1>
              <p className="mt-1.5 mb-0 text-[15px] text-[#3f5247]">
                Bisa ditarik{' '}
                <strong className="text-[#064e3b] text-[17px]">
                  {formatRupiah(numericSaldo)}
                </strong>
              </p>
            </div>

            {/* Syarat Penarikan Card */}
            <section
              aria-labelledby="judul-syarat-penarikan"
              className={`p-4 min-[900px]:px-[18px] border rounded-2xl bg-white flex flex-col gap-2.5 ${
                isEligible ? 'border-[#dee3da]' : 'border-[1.5px] border-[#f3d7c6]'
              }`}
            >
              <h2 id="judul-syarat-penarikan" className="text-[15px] font-extrabold m-0">
                {isEligible ? 'Syarat penarikan lengkap' : 'Lengkapi dulu sebelum menarik'}
              </h2>
              <ul className="flex flex-col gap-2 list-none p-0 m-0 text-sm">
                {/* Item 1: Verifikasi Petani */}
                <li className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3">
                  <span className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className={`shrink-0 w-[22px] h-[22px] rounded-full grid place-items-center text-white text-xs font-extrabold ${
                        isVerifOk ? 'bg-[#157a4c]' : 'bg-[#c2410c]'
                      }`}
                    >
                      {isVerifOk ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        '!'
                      )}
                    </span>
                    <span>
                      <strong>Petani Terverifikasi</strong>{' '}
                      <span className="text-[#3f5247]">
                        {isVerifOk ? 'sejak Rab, 21 Okt' : 'KTP dan foto lahan, sekitar 5 menit.'}
                      </span>
                    </span>
                  </span>
                  {!isVerifOk && (
                    <Link
                      href={hrefVerifikasi}
                      className="inline-flex items-center min-h-[40px] px-3.5 rounded-xl bg-[#064e3b] text-white text-[13px] font-extrabold no-underline"
                    >
                      Verifikasi
                    </Link>
                  )}
                </li>

                {/* Item 2: Rekening Bank */}
                <li className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3">
                  <span className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className={`shrink-0 w-[22px] h-[22px] rounded-full grid place-items-center text-white text-xs font-extrabold ${
                        isRekeningOk ? 'bg-[#157a4c]' : 'bg-[#c2410c]'
                      }`}
                    >
                      {isRekeningOk ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        '!'
                      )}
                    </span>
                    <span>
                      <strong>Rekening Bank</strong>{' '}
                      <span className="text-[#3f5247]">
                        {isRekeningOk
                          ? `${rekeningTujuan.namaBank} ${rekeningTujuan.nomorRekening}, cocok dengan KTP`
                          : 'Atas namamu sendiri, dicek langsung ke bank.'}
                      </span>
                    </span>
                  </span>
                  {!isRekeningOk && (
                    <Link
                      href={hrefRekening}
                      className="inline-flex items-center min-h-[40px] px-3.5 rounded-xl bg-[#064e3b] text-white text-[13px] font-extrabold no-underline"
                    >
                      Tambah rekening
                    </Link>
                  )}
                </li>
              </ul>
            </section>

            {/* Incomplete Locked Notice */}
            {!isEligible && (
              <p className="p-3.5 rounded-xl bg-[#f6f8f4] text-sm leading-relaxed text-[#3f5247] m-0">
                Saldomu aman dan terus bertambah dari pesanan yang selesai. Setelah syarat di atas lengkap, kamu bisa menariknya kapan saja.
              </p>
            )}

            {/* Withdrawal Form (when eligible and not submitted) */}
            {isEligible && !sudahDiajukan && (
              <form
                onSubmit={handleSubmitForm}
                className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3.5 m-0"
              >
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tr-jumlah" className="text-[15px] font-bold text-[#173b2b]">
                    Jumlah yang ditarik
                  </label>
                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute left-3.5 top-3.5 text-lg font-bold text-[#5a6b60]"
                    >
                      Rp
                    </span>
                    <input
                      id="tr-jumlah"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={inputJumlah}
                      onChange={handleInputChange}
                      placeholder="0"
                      aria-invalid={!!errorJumlah}
                      aria-describedby="tr-ket-bantuan"
                      className={`w-full h-14 pl-12 pr-3.5 border-[1.5px] rounded-xl bg-white text-[#173b2b] text-[22px] font-extrabold outline-none ${
                        errorJumlah ? 'border-[#b42318]' : 'border-[#7d877e]'
                      }`}
                    />
                  </div>
                  {/* Quick-fill chips */}
                  <div role="group" aria-label="Isi cepat" className="flex flex-wrap gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickFill(numericSaldo)}
                      className="min-h-[40px] px-3.5 rounded-full border border-[#dee3da] bg-[#f6f8f4] text-[#064e3b] text-sm font-extrabold cursor-pointer"
                    >
                      Semua, {formatRupiah(numericSaldo)}
                    </button>
                    {numericSaldo >= 500000 && (
                      <button
                        type="button"
                        onClick={() => handleQuickFill(500000)}
                        className="min-h-[40px] px-3.5 rounded-full border border-[#dee3da] bg-[#f6f8f4] text-[#064e3b] text-sm font-extrabold cursor-pointer"
                      >
                        Rp 500.000
                      </button>
                    )}
                  </div>
                  {/* Helper / Error note */}
                  <p
                    id="tr-ket-bantuan"
                    className={`text-[13px] m-0 ${
                      errorJumlah ? 'text-[#b42318] font-bold' : 'text-[#5a6b60]'
                    }`}
                  >
                    {errorJumlah || `Minimal ${formatRupiah(minimalPenarikan)}.`}
                  </p>
                </div>

                {/* Summary Description List */}
                <dl className="p-3 px-3.5 rounded-xl bg-[#f6f8f4] flex flex-col gap-2 text-sm m-0">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#3f5247]">Ke rekening</dt>
                    <dd className="m-0 text-right">
                      <strong>
                        {rekeningTujuan.namaBank} {rekeningTujuan.nomorRekening}
                      </strong>
                      <br />
                      <span className="text-[13px] text-[#3f5247]">
                        atas nama {rekeningTujuan.namaPemilik}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#3f5247]">Biaya transfer</dt>
                    <dd className="m-0 text-right font-medium">
                      {formatRupiah(biayaAdmin)}{' '}
                      <span className="px-1.5 py-0.5 border border-dashed border-[#c2a032] rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
                        sementara
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#3f5247]">Masuk rekening</dt>
                    <dd className="m-0 text-right">
                      Paling lambat 1 hari kerja{' '}
                      <span className="px-1.5 py-0.5 border border-dashed border-[#c2a032] rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
                        sementara
                      </span>
                    </dd>
                  </div>
                </dl>

                <button
                  type="submit"
                  className="min-h-[56px] rounded-xl bg-[#064e3b] text-white text-base font-extrabold cursor-pointer border-0"
                >
                  Lanjut
                </button>
                <Link
                  href={hrefRekening}
                  className="self-center inline-flex items-center min-h-[40px] text-[13px] font-bold text-[#157a4c] no-underline"
                >
                  Ganti rekening
                </Link>
              </form>
            )}

            {/* Status Tracker Card (when submitted) */}
            {sudahDiajukan && (
              <section
                role="status"
                aria-labelledby="judul-status-kirim"
                className="p-5 border-[1.5px] border-[#064e3b] rounded-2xl bg-white flex flex-col gap-3"
              >
                <h2 id="judul-status-kirim" className="text-xl font-extrabold m-0">
                  {formatRupiah(jumlahDitarik)} sedang dikirim ke {rekeningTujuan.namaBank} {rekeningTujuan.nomorRekening}
                </h2>
                <ol className="list-none p-0 m-0 flex flex-col">
                  {/* Step 1: Diajukan */}
                  <li className="flex gap-3.5">
                    <div
                      aria-hidden="true"
                      className="shrink-0 w-[22px] flex flex-col items-center"
                    >
                      <span className="w-[22px] h-[22px] rounded-full grid place-items-center bg-[#064e3b] text-white">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span className="flex-1 min-h-[22px] border-l-2 border-dotted border-[#064e3b] my-1" />
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="m-0 flex flex-wrap justify-between gap-2">
                        <strong className="text-sm text-[#064e3b]">Diajukan</strong>
                        <span className="text-xs text-[#5a6b60]">Hari ini, baru saja</span>
                      </p>
                      <p className="mt-1 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
                        Permintaan penarikan berhasil dicatat sistem.
                      </p>
                    </div>
                  </li>

                  {/* Step 2: Dikirim ke bank */}
                  <li className="flex gap-3.5">
                    <div
                      aria-hidden="true"
                      className="shrink-0 w-[22px] flex flex-col items-center"
                    >
                      <span className="w-[22px] h-[22px] rounded-full grid place-items-center bg-white border-2 border-[#157a4c]">
                        <span className="w-2 h-2 rounded-full bg-[#c2a032]" />
                      </span>
                      <span className="flex-1 min-h-[22px] border-l-2 border-dotted border-[#c9d2c6] my-1" />
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="m-0 flex flex-wrap justify-between gap-2">
                        <strong className="text-sm text-[#173b2b]">Dikirim ke bank</strong>
                        <span className="text-xs text-[#5a6b60]">Sedang diproses</span>
                      </p>
                      <p className="mt-1 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
                        Perintah transfer diteruskan ke jaringan perbankan.
                      </p>
                    </div>
                  </li>

                  {/* Step 3: Masuk rekening */}
                  <li className="flex gap-3.5">
                    <div
                      aria-hidden="true"
                      className="shrink-0 w-[22px] flex flex-col items-center"
                    >
                      <span className="w-[22px] h-[22px] rounded-full grid place-items-center bg-white border border-[#c9d2c6]" />
                    </div>
                    <div className="flex-1 pb-1">
                      <p className="m-0 flex flex-wrap justify-between gap-2">
                        <strong className="text-sm text-[#5a6b60]">Masuk rekening</strong>
                        <span className="text-xs text-[#5a6b60]">Paling lambat 1 hari kerja</span>
                      </p>
                      <p className="mt-1 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
                        Saldo tiba di rekening BRI ••••3021.
                      </p>
                    </div>
                  </li>
                </ol>
                <p className="text-[13px] leading-relaxed text-[#3f5247] m-0">
                  Penarikan berikutnya bisa diajukan setelah yang ini masuk rekening.
                </p>
                <Link
                  href={hrefKeuangan}
                  className="flex items-center justify-center min-h-[52px] rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline text-center mt-1"
                >
                  Kembali ke keuangan
                </Link>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal Dialog */}
      {showModal && (
        <div
          role="presentation"
          className="absolute inset-0 z-20 bg-[rgba(23,59,43,0.5)] flex justify-center items-start pt-28 min-[900px]:pt-36 px-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-judul-tarik"
            className="w-full max-w-[420px] p-6 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5 text-[#173b2b]"
          >
            <h2 id="modal-judul-tarik" className="text-[19px] font-extrabold leading-snug m-0">
              Tarik {inputJumlah ? `Rp ${inputJumlah}` : ''} ke {rekeningTujuan.namaBank} {rekeningTujuan.nomorRekening}?
            </h2>
            <p className="text-sm leading-relaxed text-[#3f5247] m-0">
              Atas nama {rekeningTujuan.namaPemilik}. Sisa saldo bisa ditarik jadi {formatRupiah(sisaSaldo)}. Penarikan tidak bisa dibatalkan setelah dikirim ke bank.
            </p>
            <div className="flex flex-col gap-2 mt-1">
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="min-h-[52px] rounded-xl bg-[#064e3b] text-white font-extrabold text-base border-0 cursor-pointer"
              >
                Ya, tarik {inputJumlah ? `Rp ${inputJumlah}` : ''}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="min-h-[48px] border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] font-bold text-[15px] cursor-pointer"
              >
                Periksa lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="min-[900px]:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="lainnya" />
      </div>
    </div>
  );
}
