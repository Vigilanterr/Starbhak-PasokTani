'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AuthHeader } from '../layout/AuthHeader';
import { AuthPanel } from '../layout/AuthPanel';

export type KeadaanAturUlang = 'form' | 'kedaluwarsa' | 'berhasil';

export interface AturUlangSandiProps {
  keadaan?: KeadaanAturUlang;
  email?: string;
  token?: string;
  onSubmit?: (kataSandiBaru: string) => Promise<boolean | void> | void;
  hrefLupa?: string;
  hrefMasuk?: string;
  hrefBeranda?: string;
  className?: string;
}

export function AturUlangSandi({
  keadaan: keadaanProp = 'form',
  email = 'dewi.lestari@contoh.id',
  onSubmit,
  hrefLupa = '/lupa-sandi',
  hrefMasuk = '/masuk',
  className = '',
}: AturUlangSandiProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);
  const [sandi, setSandi] = useState<string>('');
  const [lihat, setLihat] = useState<boolean>(false);
  const [coba, setCoba] = useState<boolean>(false);
  const [selesai, setSelesai] = useState<boolean>(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof window === 'undefined' || !window.ResizeObserver) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSempit(entry.contentRect.width < 900);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  let k: KeadaanAturUlang = keadaanProp;
  if (k === 'form' && selesai) {
    k = 'berhasil';
  }

  const cekSandi = (sd: string) => {
    const n = String(sd || '').length;
    if (!n) return 'Isi kata sandi baru.';
    if (n < 8) return `Kata sandi minimal 8 karakter. Sekarang baru ${n}.`;
    return '';
  };

  const pesan = coba ? cekSandi(sandi) : '';
  const n = sandi.length;
  const cukup = n >= 8;

  const handleKirim = async (e: React.FormEvent) => {
    e.preventDefault();
    const galat = cekSandi(sandi);
    setCoba(true);
    if (!galat) {
      setSelesai(true);
      if (onSubmit) {
        await onSubmit(sandi);
      }
    }
  };

  return (
    <div
      ref={rootRef}
      className={`min-h-full bg-white font-sans text-ink ${className}`}
    >
      <AuthHeader ajakan="" sempit={sempit} />

      <main className="flex items-start">
        <section
          aria-label="Kata sandi baru"
          className="flex-1 min-w-0 flex justify-center px-5 py-4 pb-10 min-[900px]:px-12 min-[900px]:pt-12 min-[900px]:pb-16 box-border"
        >
          <div className="w-full max-w-[440px] flex flex-col gap-[18px]">
            {k === 'form' && (
              <>
                <div>
                  <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                    Buat kata sandi baru
                  </h1>
                  <p className="mt-2 text-[15px] leading-[1.55] text-[#3f5247]">
                    Untuk akun <strong className="text-ink">{email}</strong>.
                  </p>
                </div>

                <form
                  onSubmit={handleKirim}
                  noValidate
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="baru-sandi"
                      className="text-sm font-bold text-ink"
                    >
                      Kata sandi baru
                    </label>
                    <div className="relative">
                      <input
                        id="baru-sandi"
                        type={lihat ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={sandi}
                        onChange={(e) => setSandi(e.target.value)}
                        aria-invalid={Boolean(pesan)}
                        aria-describedby="baru-sandi-ket baru-sandi-galat"
                        className={`w-full h-[52px] box-border pl-3.5 pr-[120px] border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                          pesan ? 'border-danger' : 'border-field-border'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setLihat(!lihat)}
                        aria-controls="baru-sandi"
                        className="absolute right-1.5 top-1.5 h-10 px-3 border-0 rounded-lg bg-tint text-brand-900 text-[13px] font-extrabold cursor-pointer"
                      >
                        {lihat ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </div>

                    <p
                      id="baru-sandi-ket"
                      className={`m-0 flex items-center gap-1.5 text-[13px] font-semibold ${
                        cukup ? 'text-[#157a4c]' : 'text-[#5a6b60]'
                      }`}
                    >
                      {cukup ? (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="8" />
                        </svg>
                      )}
                      {cukup
                        ? 'Minimal 8 karakter'
                        : n > 0
                        ? `Minimal 8 karakter, kurang ${8 - n} lagi`
                        : 'Minimal 8 karakter. Boleh ditempel dari pengelola kata sandi.'}
                    </p>

                    {pesan && (
                      <p
                        id="baru-sandi-galat"
                        role="alert"
                        className="m-0 text-[13px] font-semibold text-danger"
                      >
                        {pesan}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="min-h-[52px] border-0 rounded-xl bg-brand-900 text-white text-base font-extrabold cursor-pointer hover:bg-brand-600"
                  >
                    Simpan kata sandi
                  </button>

                  <p className="m-0 text-[13px] leading-[1.5] text-[#5a6b60]">
                    Setelah disimpan, semua perangkat yang masih masuk ikut
                    dikeluarkan. Kamu masuk lagi dengan kata sandi baru.
                  </p>
                </form>
              </>
            )}

            {k === 'kedaluwarsa' && (
              <>
                <div className="flex flex-col gap-3.5">
                  <span
                    aria-hidden="true"
                    className="w-14 h-14 rounded-full grid place-items-center bg-[#fff1ea] text-[#c2410c]"
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </span>
                  <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                    Tautan ini sudah tidak berlaku
                  </h1>
                  <p className="m-0 text-[15px] leading-[1.6] text-[#3f5247]">
                    Tautan atur ulang berlaku 1 jam dan hanya bisa dipakai sekali.
                    Minta tautan baru untuk melanjutkan.
                  </p>
                </div>

                <Link
                  href={hrefLupa}
                  className="flex items-center justify-center min-h-[52px] rounded-xl bg-brand-900 text-white text-base font-extrabold no-underline hover:bg-brand-600"
                >
                  Kirim tautan baru
                </Link>

                <Link
                  href={hrefMasuk}
                  className="flex items-center justify-center min-h-12 text-brand-900 text-[15px] font-bold no-underline hover:underline"
                >
                  Kembali ke halaman masuk
                </Link>
              </>
            )}

            {k === 'berhasil' && (
              <>
                <div role="status" className="flex flex-col gap-3.5">
                  <span
                    aria-hidden="true"
                    className="w-14 h-14 rounded-full grid place-items-center bg-brand-900 text-white"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                    Kata sandi diperbarui
                  </h1>
                  <p className="m-0 text-[15px] leading-[1.6] text-[#3f5247]">
                    Masuk dengan kata sandi barumu. Perangkat yang tadinya masih
                    masuk sudah dikeluarkan.
                  </p>
                </div>

                <Link
                  href={hrefMasuk}
                  className="flex items-center justify-center min-h-[52px] rounded-xl bg-brand-900 text-white text-base font-extrabold no-underline hover:bg-brand-600"
                >
                  Masuk
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Desktop Hero Panel */}
        <div className="hidden min-[900px]:block flex-1 min-w-0 pr-6 pb-6 pt-2 box-border">
          <AuthPanel varian="umum" />
        </div>
      </main>
    </div>
  );
}

export default AturUlangSandi;
