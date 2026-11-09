'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AuthHeader } from '../layout/AuthHeader';
import { AuthPanel } from '../layout/AuthPanel';

export interface LupaSandiProps {
  terkirim?: boolean;
  emailAwal?: string;
  jedaDetik?: number;
  onSubmit?: (email: string) => Promise<boolean | void> | void;
  onKirimUlang?: (email?: string) => Promise<void> | void;
  hrefMasuk?: string;
  className?: string;
}

export function LupaSandi({
  terkirim: terkirimProp = false,
  emailAwal = '',
  jedaDetik = 42,
  onSubmit,
  onKirimUlang,
  hrefMasuk = '/masuk',
  className = '',
}: LupaSandiProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(emailAwal);
  const [coba, setCoba] = useState<boolean>(false);
  const [terkirim, setTerkirim] = useState<boolean>(terkirimProp);
  const [jeda, setJeda] = useState<number>(jedaDetik);
  const [ulang, setUlang] = useState<boolean>(false);

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

  useEffect(() => {
    if (jeda <= 0) return;
    const timer = setInterval(() => {
      setJeda((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [jeda]);

  const cekEmail = (em: string) => {
    const t = String(em || '').trim();
    if (!t) return 'Isi alamat email akunmu.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
      return 'Format email belum benar. Contoh: nama@email.com';
    }
    return '';
  };

  const pesanGalat = coba ? cekEmail(email) : '';
  const emailTampil = String(email || '').trim() || 'dewi.lestari@contoh.id';
  const masihJeda = jeda > 0;
  const duaDigit = (x: number) => (x < 10 ? `0${x}` : `${x}`);
  const labelUlang = masihJeda
    ? `Kirim ulang dalam ${Math.floor(jeda / 60)}:${duaDigit(jeda % 60)}`
    : 'Kirim ulang tautan';

  const handleKirim = async (e: React.FormEvent) => {
    e.preventDefault();
    const galat = cekEmail(email);
    setCoba(true);
    if (!galat) {
      setTerkirim(true);
      setJeda(60);
      if (onSubmit) {
        await onSubmit(email);
      }
    }
  };

  const handleKirimUlang = async () => {
    if (masihJeda) return;
    setJeda(60);
    setUlang(true);
    if (onKirimUlang) {
      await onKirimUlang(email);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`min-h-full bg-white font-sans text-ink ${className}`}
    >
      <AuthHeader ajakan="masuk" sempit={sempit} />

      <main className="flex items-start">
        <section
          aria-label="Atur ulang kata sandi"
          className="flex-1 min-w-0 flex justify-center px-5 py-2 pb-10 min-[900px]:px-12 min-[900px]:pt-10 min-[900px]:pb-16 box-border"
        >
          <div className="w-full max-w-[440px] flex flex-col gap-[18px]">
            <Link
              href={hrefMasuk}
              className="self-start inline-flex items-center gap-1 min-h-9 text-[#157a4c] text-sm font-bold no-underline hover:underline"
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
              Kembali ke halaman masuk
            </Link>

            {!terkirim ? (
              <>
                <div>
                  <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                    Lupa kata sandi?
                  </h1>
                  <p className="mt-2 text-[15px] leading-[1.55] text-[#3f5247]">
                    Masukkan email akunmu. Kami kirim tautan untuk membuat kata
                    sandi baru.
                  </p>
                </div>

                <form
                  onSubmit={handleKirim}
                  noValidate
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="lupa-email"
                      className="text-sm font-bold text-ink"
                    >
                      Email
                    </label>
                    <input
                      id="lupa-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck="false"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(pesanGalat)}
                      aria-describedby={
                        pesanGalat ? 'lupa-email-galat' : undefined
                      }
                      className={`h-[52px] box-border px-3.5 border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                        pesanGalat ? 'border-danger' : 'border-field-border'
                      }`}
                    />
                    {pesanGalat && (
                      <p
                        id="lupa-email-galat"
                        role="alert"
                        className="m-0 flex items-start gap-1.5 text-[13px] leading-[1.45] font-semibold text-danger"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0 mt-0.5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" x2="12" y1="8" y2="12" />
                          <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                        {pesanGalat}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="min-h-[52px] border-0 rounded-xl bg-brand-900 text-white text-base font-extrabold cursor-pointer hover:bg-brand-600"
                  >
                    Kirim tautan
                  </button>
                </form>

                <p className="m-0 p-3 px-3.5 rounded-xl bg-cream text-[13px] leading-[1.55] text-[#3f5247]">
                  Daftar lewat Google? Akunmu tidak memakai kata sandi.{' '}
                  <Link
                    href={hrefMasuk}
                    className="text-[#157a4c] font-bold no-underline hover:underline"
                  >
                    Masuk dengan Google
                  </Link>{' '}
                  saja.
                </p>
              </>
            ) : (
              <>
                <div role="status" className="flex flex-col gap-3.5">
                  <span
                    aria-hidden="true"
                    className="w-14 h-14 rounded-full grid place-items-center bg-tint text-brand-900"
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                    Cek email kamu
                  </h1>
                  <p className="m-0 text-[15px] leading-[1.6] text-[#3f5247]">
                    Kalau <strong className="text-ink">{emailTampil}</strong>{' '}
                    terdaftar, tautan untuk membuat kata sandi baru sudah dikirim.
                    Tautan berlaku 1 jam dan hanya bisa dipakai sekali.
                  </p>
                  <p className="m-0 text-sm leading-[1.55] text-[#3f5247]">
                    Belum masuk dalam beberapa menit? Cek folder spam atau promosi.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleKirimUlang}
                    disabled={masihJeda}
                    className={`min-h-[52px] border-[1.5px] rounded-xl bg-white text-[15px] font-extrabold font-mono tabular-nums cursor-pointer ${
                      masihJeda
                        ? 'border-line text-[#5a6b60] cursor-not-allowed'
                        : 'border-brand-900 text-brand-900 hover:bg-cream'
                    }`}
                  >
                    {labelUlang}
                  </button>
                  <p
                    aria-live="polite"
                    className="m-0 min-h-[18px] text-[13px] font-bold text-[#157a4c]"
                  >
                    {ulang
                      ? 'Tautan baru dikirim. Pakai tautan dari email terbaru.'
                      : ''}
                  </p>
                </div>

                <Link
                  href={hrefMasuk}
                  className="flex items-center justify-center min-h-[52px] rounded-xl bg-brand-900 text-white text-base font-extrabold no-underline hover:bg-brand-600"
                >
                  Kembali ke halaman masuk
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

export default LupaSandi;
