'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AuthHeader } from '../layout/AuthHeader';
import { AuthPanel } from '../layout/AuthPanel';

export type KeadaanMasuk = 'lanjut' | 'biasa' | 'salah';

export interface ItemTertunda {
  nama: string;
}

export interface MasukProps {
  keadaan?: KeadaanMasuk;
  redirectUrl?: string;
  itemTertunda?: ItemTertunda | string;
  emailAwal?: string;
  onSubmit?: (data: { email: string; kataSandi: string; ingat: boolean }) => Promise<void> | void;
  onGoogleLogin?: () => void;
  hrefLupa?: string;
  hrefDaftar?: string;
  className?: string;
}

export function Masuk({
  keadaan = 'biasa',
  itemTertunda,
  emailAwal,
  onSubmit,
  onGoogleLogin,
  hrefLupa = '/lupa-sandi',
  hrefDaftar = '/daftar',
  className = '',
}: MasukProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(
    emailAwal ?? (keadaan === 'salah' ? 'dewi.lestari@contoh.id' : '')
  );
  const [sandi, setSandi] = useState<string>('');
  const [lihat, setLihat] = useState<boolean>(false);
  const [ingat, setIngat] = useState<boolean>(true);
  const [coba, setCoba] = useState<boolean>(false);
  const [berhasil, setBerhasil] = useState<boolean>(false);

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

  const itemNama =
    typeof itemTertunda === 'string'
      ? itemTertunda
      : itemTertunda?.nama ?? 'Tomat Merah Lembang';

  const cekValidasi = (em: string, sd: string) => {
    const e: { email?: string; sandi?: string } = {};
    const t = String(em || '').trim();
    if (!t) {
      e.email = 'Isi alamat email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
      e.email = 'Format email belum benar. Contoh: nama@email.com';
    }
    if (!sd) {
      e.sandi = 'Isi kata sandi.';
    }
    return e;
  };

  const err = coba ? cekValidasi(email, sandi) : {};
  const galat: Array<{ href: string; pesan: string }> = [];
  if (err.email) galat.push({ href: '#masuk-email', pesan: err.email });
  if (err.sandi) galat.push({ href: '#masuk-sandi', pesan: err.sandi });

  const adaLanjut = keadaan === 'lanjut' && !berhasil;
  const adaGalatServer = keadaan === 'salah' && !coba;
  const adaRingkasan = galat.length > 0;
  const judulRingkasan =
    galat.length === 1
      ? 'Ada 1 isian yang perlu diperbaiki'
      : `Ada ${galat.length} isian yang perlu diperbaiki`;

  const pesanBerhasil =
    keadaan === 'lanjut'
      ? `Berhasil masuk. Membuka lagi ${itemNama}…`
      : 'Berhasil masuk. Membuka beranda…';

  const handleKirim = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = cekValidasi(email, sandi);
    const ok = Object.keys(errors).length === 0;
    setCoba(true);
    if (ok) {
      setBerhasil(true);
      if (onSubmit) {
        await onSubmit({ email, kataSandi: sandi, ingat });
      }
    }
  };

  return (
    <div
      ref={rootRef}
      className={`min-h-full bg-white font-sans text-ink ${className}`}
    >
      <AuthHeader ajakan="daftar" sempit={sempit} />

      <main className="flex items-start">
        <section
          aria-label="Formulir masuk"
          className="flex-1 min-w-0 flex justify-center px-5 py-2 pb-10 min-[900px]:px-12 min-[900px]:pt-10 min-[900px]:pb-16 box-border"
        >
          <div className="w-full max-w-[440px] flex flex-col gap-[18px]">
            <div>
              <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                Masuk ke Pasok Tani
              </h1>
              <p className="mt-2 text-[15px] leading-[1.55] text-[#3f5247]">
                Pembeli dan petani masuk dari halaman yang sama.
              </p>
            </div>

            {/* Aksi Tertunda Banner */}
            {adaLanjut && (
              <p className="m-0 flex items-start gap-2.5 p-3 px-3.5 rounded-xl bg-tint text-ink text-sm leading-[1.5]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#157a4c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 mt-px"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span>
                  Masuk dulu untuk menambahkan <strong>{itemNama}</strong> ke
                  keranjang. Setelah masuk, kamu kembali ke halaman produk itu.
                </span>
              </p>
            )}

            {/* Galat Server Banner */}
            {adaGalatServer && (
              <div
                role="alert"
                className="p-3 px-3.5 border-[1.5px] border-danger rounded-xl bg-danger-bg text-sm leading-[1.5] text-danger-ink"
              >
                <strong>Email atau kata sandi salah.</strong> Coba lagi, atau{' '}
                <Link
                  href={hrefLupa}
                  className="text-danger-ink font-extrabold underline"
                >
                  atur ulang kata sandi
                </Link>
                .
              </div>
            )}

            {/* Ringkasan Galat Form */}
            {adaRingkasan && (
              <div
                role="alert"
                className="p-3.5 px-4 border-[1.5px] border-danger rounded-xl bg-danger-bg"
              >
                <p className="m-0 mb-1.5 text-sm font-extrabold text-danger-ink">
                  {judulRingkasan}
                </p>
                <ul className="m-0 pl-[18px] text-sm leading-[1.6]">
                  {galat.map((g, idx) => (
                    <li key={idx}>
                      <a href={g.href} className="text-danger-ink font-bold">
                        {g.pesan}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Status Berhasil */}
            {berhasil && (
              <p
                role="status"
                className="m-0 flex items-center gap-2.5 p-3 px-3.5 rounded-xl bg-[#dcfce7] text-[#166534] text-sm font-bold"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {pesanBerhasil}
              </p>
            )}

            {/* Google OAuth Login Button */}
            <button
              type="button"
              onClick={onGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 min-h-[52px] border-[1.5px] border-[#c9d2c6] rounded-xl bg-white text-ink text-[15px] font-bold no-underline cursor-pointer hover:bg-cream"
            >
              <span
                aria-hidden="true"
                className="w-6 h-6 box-border rounded-full grid place-items-center border-[1.5px] border-[#3f5247] text-[13px] font-extrabold"
              >
                G
              </span>
              Masuk dengan Google
            </button>

            <div
              aria-hidden="true"
              className="flex items-center gap-3 text-[13px] text-[#5a6b60]"
            >
              <span className="flex-1 h-px bg-line" />
              atau pakai email
              <span className="flex-1 h-px bg-line" />
            </div>

            {/* Formulir Kredensial */}
            <form
              onSubmit={handleKirim}
              noValidate
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="masuk-email"
                  className="text-sm font-bold text-ink"
                >
                  Email
                </label>
                <input
                  id="masuk-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(err.email)}
                  aria-describedby={err.email ? 'masuk-email-galat' : undefined}
                  className={`h-[52px] box-border px-3.5 border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                    err.email ? 'border-danger' : 'border-field-border'
                  }`}
                />
                {err.email && (
                  <p
                    id="masuk-email-galat"
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
                    {err.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <label
                    htmlFor="masuk-sandi"
                    className="text-sm font-bold text-ink"
                  >
                    Kata sandi
                  </label>
                  <Link
                    href={hrefLupa}
                    className="inline-flex items-center min-h-8 text-[13px] font-bold text-[#157a4c] no-underline hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="masuk-sandi"
                    type={lihat ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={sandi}
                    onChange={(e) => setSandi(e.target.value)}
                    aria-invalid={Boolean(err.sandi)}
                    aria-describedby={
                      err.sandi ? 'masuk-sandi-galat' : undefined
                    }
                    className={`w-full h-[52px] box-border pl-3.5 pr-[120px] border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                      err.sandi ? 'border-danger' : 'border-field-border'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setLihat(!lihat)}
                    aria-controls="masuk-sandi"
                    className="absolute right-1.5 top-1.5 h-10 px-3 border-0 rounded-lg bg-tint text-brand-900 text-[13px] font-extrabold cursor-pointer"
                  >
                    {lihat ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
                {err.sandi && (
                  <p
                    id="masuk-sandi-galat"
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
                    {err.sandi}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2.5 min-h-11 text-[15px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={ingat}
                  onChange={(e) => setIngat(e.target.checked)}
                  className="w-5 h-5 m-0 accent-brand-900 cursor-pointer"
                />
                Tetap masuk di perangkat ini
              </label>

              <button
                type="submit"
                className="min-h-[52px] border-0 rounded-xl bg-brand-900 text-white text-base font-extrabold cursor-pointer hover:bg-brand-600"
              >
                Masuk
              </button>
            </form>

            <p className="mt-1 text-[15px] text-center text-[#3f5247]">
              Belum punya akun?{' '}
              <Link
                href={hrefDaftar}
                className="text-brand-900 font-extrabold no-underline hover:underline"
              >
                Daftar
              </Link>
            </p>
            <p className="m-0 text-[13px] text-center text-[#5a6b60]">
              Butuh bantuan?{' '}
              <Link
                href="/bantuan"
                className="text-[#157a4c] font-bold no-underline hover:underline"
              >
                Pusat Bantuan
              </Link>
            </p>
          </div>
        </section>

        {/* Desktop Hero Right Panel */}
        <div className="hidden min-[900px]:block flex-1 min-w-0 pr-6 pb-6 pt-2 box-border">
          <AuthPanel varian="umum" />
        </div>
      </main>
    </div>
  );
}

export default Masuk;
