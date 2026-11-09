'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AuthHeader } from '../layout/AuthHeader';
import { AuthPanel } from '../layout/AuthPanel';

export type JenisPembeli = 'rumah' | 'umkm';

export interface OpsiJenisPembeli {
  id: JenisPembeli;
  judul: string;
  ket: string;
}

export interface RegistrasiPembeliPayload {
  nama: string;
  email: string;
  kataSandi?: string;
  jenis: JenisPembeli;
  setuju: boolean;
}

export interface DaftarPembeliProps {
  lewatGoogle?: boolean;
  googleEmail?: string;
  dataAwal?: Partial<RegistrasiPembeliPayload>;
  onSubmit?: (data: RegistrasiPembeliPayload) => Promise<void> | void;
  onGoogleRegister?: () => void;
  hrefDaftar?: string;
  hrefMasuk?: string;
  hrefBeranda?: string;
  className?: string;
}

const DAFTAR_JENIS: OpsiJenisPembeli[] = [
  {
    id: 'rumah',
    judul: 'Rumah tangga',
    ket: 'Belanja untuk kebutuhan dapur sendiri.',
  },
  {
    id: 'umkm',
    judul: 'UMKM atau usaha kuliner',
    ket: 'Warung, katering, atau kedai. Dapat Keranjang Resep untuk belanja rutin.',
  },
];

export function DaftarPembeli({
  lewatGoogle = false,
  googleEmail = 'dewi.lestari@gmail.com',
  dataAwal,
  onSubmit,
  onGoogleRegister,
  hrefDaftar = '/daftar',
  hrefMasuk = '/masuk',
  hrefBeranda = '/',
  className = '',
}: DaftarPembeliProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);

  const [nama, setNama] = useState<string>(
    dataAwal?.nama ?? (lewatGoogle ? 'Dewi Lestari' : '')
  );
  const [email, setEmail] = useState<string>(
    dataAwal?.email ?? (lewatGoogle ? googleEmail : '')
  );
  const [sandi, setSandi] = useState<string>(dataAwal?.kataSandi ?? '');
  const [lihat, setLihat] = useState<boolean>(false);
  const [jenis, setJenis] = useState<JenisPembeli | null>(dataAwal?.jenis ?? null);
  const [setuju, setSetuju] = useState<boolean>(dataAwal?.setuju ?? false);
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

  const cekValidasi = (d: {
    nama: string;
    email: string;
    sandi: string;
    jenis: JenisPembeli | null;
    setuju: boolean;
  }) => {
    const e: Record<string, string> = {};
    if (!String(d.nama || '').trim()) e.nama = 'Isi nama lengkap.';
    if (!lewatGoogle) {
      const t = String(d.email || '').trim();
      if (!t) e.email = 'Isi alamat email.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
        e.email = 'Format email belum benar. Contoh: nama@email.com';
      }
      const n = String(d.sandi || '').length;
      if (!n) e.sandi = 'Isi kata sandi.';
      else if (n < 8) {
        e.sandi = `Kata sandi minimal 8 karakter. Sekarang baru ${n}.`;
      }
    }
    if (!d.jenis) e.jenis = 'Pilih jenis pembeli.';
    if (!d.setuju) e.setuju = 'Centang persetujuan untuk melanjutkan.';
    return e;
  };

  const err = coba ? cekValidasi({ nama, email, sandi, jenis, setuju }) : {};
  const urutan: Array<[string, string]> = [
    ['nama', '#daftar-nama'],
    ['email', '#daftar-email'],
    ['sandi', '#daftar-sandi'],
    ['jenis', '#daftar-jenis-rumah'],
    ['setuju', '#daftar-setuju'],
  ];

  const galat = urutan
    .filter(([k]) => err[k] !== undefined)
    .map(([k, href]) => ({ href, pesan: err[k] ?? '' }));

  const adaRingkasan = galat.length > 0;
  const judulRingkasan =
    galat.length === 1
      ? 'Ada 1 isian yang perlu diperbaiki'
      : `Ada ${galat.length} isian yang perlu diperbaiki`;

  const nSandi = sandi.length;
  const sandiCukup = nSandi >= 8;
  const namaDepan = String(nama).trim().split(' ')[0] || 'kamu';

  const teksBerhasil =
    jenis === 'umkm'
      ? 'Keranjang Resep sudah ada di menu bawah untuk belanja rutin usahamu. Nomor HP dan alamat diminta saat checkout pertama.'
      : 'Nomor HP dan alamat diminta saat checkout pertama.';

  const handleKirim = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = cekValidasi({ nama, email, sandi, jenis, setuju });
    const ok = Object.keys(errors).length === 0;
    setCoba(true);
    if (ok && jenis) {
      setBerhasil(true);
      if (onSubmit) {
        await onSubmit({
          nama,
          email: lewatGoogle ? googleEmail : email,
          kataSandi: lewatGoogle ? undefined : sandi,
          jenis,
          setuju,
        });
      }
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
          aria-label="Formulir daftar pembeli"
          className="flex-1 min-w-0 flex justify-center px-5 py-2 pb-10 min-[900px]:px-12 min-[900px]:pt-8 min-[900px]:pb-16 box-border"
        >
          <div className="w-full max-w-[440px] flex flex-col gap-[18px]">
            <Link
              href={hrefDaftar}
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
              Pilih peran lain
            </Link>

            {!berhasil && (
              <>
                <div>
                  <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                    Daftar sebagai pembeli
                  </h1>
                  <p className="mt-2 text-[15px] leading-[1.55] text-[#3f5247]">
                    Gratis, tanpa dokumen usaha.
                  </p>
                </div>

                {lewatGoogle ? (
                  <p
                    role="status"
                    className="m-0 flex items-start gap-2.5 p-3 px-3.5 rounded-xl bg-[#e0f2fe] text-[#0c4a6e] text-sm leading-[1.5]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="shrink-0 mt-px"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>
                      Terhubung dengan Google sebagai{' '}
                      <strong>{googleEmail}</strong>. Tinggal pilih jenis
                      pembeli.
                    </span>
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onGoogleRegister}
                      className="w-full flex items-center justify-center gap-2.5 min-h-[52px] border-[1.5px] border-[#c9d2c6] rounded-xl bg-white text-ink text-[15px] font-bold no-underline cursor-pointer hover:bg-cream"
                    >
                      <span
                        aria-hidden="true"
                        className="w-6 h-6 box-border rounded-full grid place-items-center border-[1.5px] border-[#3f5247] text-[13px] font-extrabold"
                      >
                        G
                      </span>
                      Daftar dengan Google
                    </button>
                    <div
                      aria-hidden="true"
                      className="flex items-center gap-3 text-[13px] text-[#5a6b60]"
                    >
                      <span className="flex-1 h-px bg-line" />
                      atau pakai email
                      <span className="flex-1 h-px bg-line" />
                    </div>
                  </>
                )}

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

                <form
                  onSubmit={handleKirim}
                  noValidate
                  className="flex flex-col gap-4"
                >
                  <p className="m-0 text-[13px] text-[#5a6b60]">
                    Tanda{' '}
                    <span
                      aria-hidden="true"
                      className="text-danger font-extrabold"
                    >
                      *
                    </span>{' '}
                    wajib diisi.
                  </p>

                  {/* Nama Lengkap */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="daftar-nama"
                      className="text-sm font-bold text-ink"
                    >
                      Nama lengkap{' '}
                      <span aria-hidden="true" className="text-danger">
                        *
                      </span>
                    </label>
                    <input
                      id="daftar-nama"
                      type="text"
                      autoComplete="name"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      aria-invalid={Boolean(err.nama)}
                      aria-describedby={
                        err.nama ? 'daftar-nama-galat' : undefined
                      }
                      className={`h-[52px] box-border px-3.5 border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                        err.nama ? 'border-danger' : 'border-field-border'
                      }`}
                    />
                    {err.nama && (
                      <p
                        id="daftar-nama-galat"
                        className="m-0 text-[13px] font-semibold text-danger"
                      >
                        {err.nama}
                      </p>
                    )}
                  </div>

                  {!lewatGoogle && (
                    <>
                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="daftar-email"
                          className="text-sm font-bold text-ink"
                        >
                          Email{' '}
                          <span aria-hidden="true" className="text-danger">
                            *
                          </span>
                        </label>
                        <input
                          id="daftar-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck="false"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-invalid={Boolean(err.email)}
                          aria-describedby={
                            err.email ? 'daftar-email-galat' : undefined
                          }
                          className={`h-[52px] box-border px-3.5 border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                            err.email ? 'border-danger' : 'border-field-border'
                          }`}
                        />
                        {err.email && (
                          <p
                            id="daftar-email-galat"
                            className="m-0 text-[13px] font-semibold text-danger"
                          >
                            {err.email}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="daftar-sandi"
                          className="text-sm font-bold text-ink"
                        >
                          Kata sandi{' '}
                          <span aria-hidden="true" className="text-danger">
                            *
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            id="daftar-sandi"
                            type={lihat ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={sandi}
                            onChange={(e) => setSandi(e.target.value)}
                            aria-invalid={Boolean(err.sandi)}
                            aria-describedby="daftar-sandi-ket daftar-sandi-galat"
                            className={`w-full h-[52px] box-border pl-3.5 pr-[120px] border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                              err.sandi ? 'border-danger' : 'border-field-border'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setLihat(!lihat)}
                            aria-controls="daftar-sandi"
                            className="absolute right-1.5 top-1.5 h-10 px-3 border-0 rounded-lg bg-tint text-brand-900 text-[13px] font-extrabold cursor-pointer"
                          >
                            {lihat ? 'Sembunyikan' : 'Tampilkan'}
                          </button>
                        </div>
                        <p
                          id="daftar-sandi-ket"
                          className={`m-0 flex items-center gap-1.5 text-[13px] font-semibold ${
                            sandiCukup ? 'text-[#157a4c]' : 'text-[#5a6b60]'
                          }`}
                        >
                          {sandiCukup ? (
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
                          {sandiCukup
                            ? 'Minimal 8 karakter'
                            : nSandi > 0
                            ? `Minimal 8 karakter, kurang ${8 - nSandi} lagi`
                            : 'Minimal 8 karakter. Boleh ditempel dari pengelola kata sandi.'}
                        </p>
                        {err.sandi && (
                          <p
                            id="daftar-sandi-galat"
                            className="m-0 text-[13px] font-semibold text-danger"
                          >
                            {err.sandi}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {lewatGoogle && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-bold text-ink">Email</span>
                      <p className="m-0 flex flex-wrap items-center justify-between gap-2 min-h-[52px] px-3.5 py-2 box-border border border-line rounded-xl bg-cream text-[15px]">
                        {googleEmail}
                        <span className="px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#075985] text-xs font-bold">
                          Dari Google
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Jenis Pembeli Fieldset */}
                  <fieldset className="m-0 p-0 border-0">
                    <legend className="p-0 mb-2 text-sm font-bold text-ink">
                      Jenis pembeli{' '}
                      <span aria-hidden="true" className="text-danger">
                        *
                      </span>
                    </legend>
                    <div className="flex flex-col gap-2">
                      {DAFTAR_JENIS.map((j) => {
                        const isSelected = jenis === j.id;
                        return (
                          <label
                            key={j.id}
                            className={`flex items-start gap-2.5 p-3.5 rounded-xl cursor-pointer ${
                              isSelected
                                ? 'border-2 border-brand-900 bg-[#f3faf3]'
                                : err.jenis
                                ? 'border-[1.5px] border-danger bg-white'
                                : 'border border-line bg-white'
                            }`}
                          >
                            <input
                              id={`daftar-jenis-${j.id}`}
                              type="radio"
                              name="jenis-pembeli"
                              checked={isSelected}
                              onChange={() => setJenis(j.id)}
                              className="shrink-0 w-5 h-5 mt-px accent-brand-900 cursor-pointer"
                            />
                            <span className="flex flex-col gap-0.5">
                              <span className="text-[15px] font-extrabold text-ink">
                                {j.judul}
                              </span>
                              <span className="text-[13px] leading-[1.5] text-[#3f5247]">
                                {j.ket}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {err.jenis && (
                      <p className="mt-1.5 m-0 text-[13px] font-semibold text-danger">
                        {err.jenis}
                      </p>
                    )}
                  </fieldset>

                  {/* Persetujuan */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-start gap-2.5 text-sm leading-[1.55] cursor-pointer">
                      <input
                        id="daftar-setuju"
                        type="checkbox"
                        checked={setuju}
                        onChange={(e) => setSetuju(e.target.checked)}
                        aria-invalid={Boolean(err.setuju)}
                        className="shrink-0 w-5 h-5 mt-px accent-brand-900 cursor-pointer"
                      />
                      <span>
                        Saya setuju dengan{' '}
                        <Link
                          href="/bantuan/syarat-ketentuan"
                          className="text-[#157a4c] font-bold no-underline hover:underline"
                        >
                          Syarat dan Ketentuan
                        </Link>{' '}
                        serta{' '}
                        <Link
                          href="/bantuan/kebijakan-privasi"
                          className="text-[#157a4c] font-bold no-underline hover:underline"
                        >
                          Kebijakan Privasi
                        </Link>
                        , termasuk cara Pasok Tani memakai data saya untuk
                        pesanan.{' '}
                        <span aria-hidden="true" className="text-danger">
                          *
                        </span>
                      </span>
                    </label>
                    {err.setuju && (
                      <p className="m-0 text-[13px] font-semibold text-danger">
                        {err.setuju}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="min-h-[52px] border-0 rounded-xl bg-brand-900 text-white text-base font-extrabold cursor-pointer hover:bg-brand-600"
                  >
                    Buat akun pembeli
                  </button>
                  <p className="m-0 text-[13px] leading-[1.5] text-[#5a6b60]">
                    Nomor HP dan alamat baru diminta saat checkout pertama.
                  </p>
                </form>
              </>
            )}

            {berhasil && (
              <div
                role="status"
                className="p-5.5 border-[1.5px] border-brand-900 rounded-2xl bg-[#f3faf3] flex flex-col gap-3"
              >
                <span
                  aria-hidden="true"
                  className="w-12 h-12 rounded-full grid place-items-center bg-brand-900 text-white"
                >
                  <svg
                    width="24"
                    height="24"
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
                <h1 className="m-0 text-2xl font-extrabold leading-[1.2] text-ink">
                  Akunmu sudah aktif, {namaDepan}.
                </h1>
                <p className="m-0 text-sm leading-[1.55] text-[#3f5247]">
                  {teksBerhasil}
                </p>
                <Link
                  href={hrefBeranda}
                  className="flex items-center justify-center min-h-[52px] rounded-xl bg-brand-900 text-white text-base font-extrabold no-underline hover:bg-brand-600"
                >
                  Mulai belanja
                </Link>
              </div>
            )}

            <p className="mt-1 text-[15px] text-center text-[#3f5247]">
              Sudah punya akun?{' '}
              <Link
                href={hrefMasuk}
                className="text-brand-900 font-extrabold no-underline hover:underline"
              >
                Masuk
              </Link>
            </p>
          </div>
        </section>

        {/* Desktop Hero Panel */}
        <div className="hidden min-[900px]:block flex-1 min-w-0 pr-6 pb-6 pt-2 box-border">
          <AuthPanel varian="pembeli" />
        </div>
      </main>
    </div>
  );
}

export default DaftarPembeli;
