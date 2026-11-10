'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AuthHeader } from '../layout/AuthHeader';
import { AuthPanel } from '../layout/AuthPanel';

export interface ItemKecamatan {
  nama: string;
  kab: string;
}

export interface RegistrasiPetaniPayload {
  nama: string;
  email: string;
  kataSandi?: string;
  namaToko: string;
  kecamatan: string;
  kabupaten: string;
  lokasi?: ItemKecamatan;
  setuju: boolean;
}

export interface DaftarPetaniProps {
  lewatGoogle?: boolean;
  googleEmail?: string;
  dataAwal?: Partial<RegistrasiPetaniPayload>;
  daftarKecamatan?: ItemKecamatan[];
  onSubmit?: (data: RegistrasiPetaniPayload) => Promise<void> | void;
  onGoogleRegister?: () => void;
  hrefDaftar?: string;
  hrefMasuk?: string;
  hrefDasborToko?: string;
  className?: string;
}

const DEFAULT_KECAMATAN: ItemKecamatan[] = [
  { nama: 'Lembang', kab: 'Kab. Bandung Barat' },
  { nama: 'Parongpong', kab: 'Kab. Bandung Barat' },
  { nama: 'Cisarua', kab: 'Kab. Bandung Barat' },
  { nama: 'Cisarua', kab: 'Kab. Bogor' },
  { nama: 'Megamendung', kab: 'Kab. Bogor' },
  { nama: 'Pangalengan', kab: 'Kab. Bandung' },
  { nama: 'Ciwidey', kab: 'Kab. Bandung' },
  { nama: 'Pasirjambu', kab: 'Kab. Bandung' },
  { nama: 'Cikajang', kab: 'Kab. Garut' },
  { nama: 'Cisurupan', kab: 'Kab. Garut' },
  { nama: 'Bayongbong', kab: 'Kab. Garut' },
  { nama: 'Cigugur', kab: 'Kab. Kuningan' },
  { nama: 'Pacet', kab: 'Kab. Cianjur' },
  { nama: 'Cipanas', kab: 'Kab. Cianjur' },
  { nama: 'Argapura', kab: 'Kab. Majalengka' },
];

export function DaftarPetani({
  lewatGoogle = false,
  googleEmail = 'ujang.tani@gmail.com',
  dataAwal,
  daftarKecamatan = DEFAULT_KECAMATAN,
  onSubmit,
  onGoogleRegister,
  hrefDaftar = '/daftar',
  hrefMasuk = '/masuk',
  hrefDasborToko = '/toko',
  className = '',
}: DaftarPetaniProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);

  const [nama, setNama] = useState<string>(
    dataAwal?.nama ?? (lewatGoogle ? 'Ujang Suherman' : '')
  );
  const [email, setEmail] = useState<string>(
    dataAwal?.email ?? (lewatGoogle ? googleEmail : '')
  );
  const [sandi, setSandi] = useState<string>(dataAwal?.kataSandi ?? '');
  const [lihat, setLihat] = useState<boolean>(false);
  const [toko, setToko] = useState<string>(dataAwal?.namaToko ?? '');
  const [cari, setCari] = useState<string>('');
  const [lokasi, setLokasi] = useState<ItemKecamatan | null>(
    dataAwal?.lokasi ??
      (dataAwal?.kecamatan && dataAwal?.kabupaten
        ? { nama: dataAwal.kecamatan, kab: dataAwal.kabupaten }
        : null)
  );
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

  const q = String(cari || '').trim().toLowerCase();
  const saran = daftarKecamatan
    .filter(
      (x) =>
        q.length >= 2 &&
        (x.nama.toLowerCase().startsWith(q) || x.kab.toLowerCase().includes(q))
    )
    .slice(0, 5);

  const cekValidasi = (d: {
    nama: string;
    email: string;
    sandi: string;
    toko: string;
    lokasi: ItemKecamatan | null;
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
    if (!String(d.toko || '').trim()) e.toko = 'Isi nama toko atau lahan.';
    if (!d.lokasi) e.lokasi = 'Pilih kecamatan lahan dari daftar.';
    if (!d.setuju) e.setuju = 'Centang persetujuan untuk melanjutkan.';
    return e;
  };

  const payload: RegistrasiPetaniPayload = {
    nama,
    email: lewatGoogle ? googleEmail : email,
    kataSandi: lewatGoogle ? undefined : sandi,
    namaToko: toko,
    kecamatan: lokasi ? lokasi.nama : '',
    kabupaten: lokasi ? lokasi.kab : '',
    lokasi: lokasi ?? undefined,
    setuju,
  };

  const err = coba ? cekValidasi({ nama, email, sandi, toko, lokasi, setuju }) : {};
  const urutan: Array<[string, string]> = [
    ['nama', '#petani-nama'],
    ['email', '#petani-email'],
    ['sandi', '#petani-sandi'],
    ['toko', '#petani-toko'],
    ['lokasi', '#petani-lokasi'],
    ['setuju', '#petani-setuju'],
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

  const handleKirim = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = cekValidasi({ nama, email, sandi, toko, lokasi, setuju });
    const ok = Object.keys(errors).length === 0;
    setCoba(true);
    if (ok) {
      setBerhasil(true);
      if (onSubmit) {
        await onSubmit(payload);
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
          aria-label="Formulir daftar petani"
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
                    Daftar sebagai petani
                  </h1>
                  <p className="mt-2 text-[15px] leading-[1.55] text-[#3f5247]">
                    Gratis. Tokomu langsung aktif setelah daftar.
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
                      Terhubung dengan Google sebagai <strong>{googleEmail}</strong>.
                      Tinggal isi data toko.
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

                  <h2 className="m-0 mt-1 text-base font-extrabold text-ink">
                    Akun
                  </h2>

                  {/* Nama Lengkap */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="petani-nama"
                      className="text-sm font-bold text-ink"
                    >
                      Nama lengkap{' '}
                      <span aria-hidden="true" className="text-danger">
                        *
                      </span>
                    </label>
                    <input
                      id="petani-nama"
                      type="text"
                      autoComplete="name"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      aria-invalid={Boolean(err.nama)}
                      aria-describedby={
                        err.nama ? 'petani-nama-galat' : undefined
                      }
                      className={`h-[52px] box-border px-3.5 border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                        err.nama ? 'border-danger' : 'border-field-border'
                      }`}
                    />
                    {err.nama && (
                      <p
                        id="petani-nama-galat"
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
                          htmlFor="petani-email"
                          className="text-sm font-bold text-ink"
                        >
                          Email{' '}
                          <span aria-hidden="true" className="text-danger">
                            *
                          </span>
                        </label>
                        <input
                          id="petani-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck="false"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-invalid={Boolean(err.email)}
                          aria-describedby={
                            err.email ? 'petani-email-galat' : undefined
                          }
                          className={`h-[52px] box-border px-3.5 border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                            err.email ? 'border-danger' : 'border-field-border'
                          }`}
                        />
                        {err.email && (
                          <p
                            id="petani-email-galat"
                            className="m-0 text-[13px] font-semibold text-danger"
                          >
                            {err.email}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="petani-sandi"
                          className="text-sm font-bold text-ink"
                        >
                          Kata sandi{' '}
                          <span aria-hidden="true" className="text-danger">
                            *
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            id="petani-sandi"
                            type={lihat ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={sandi}
                            onChange={(e) => setSandi(e.target.value)}
                            aria-invalid={Boolean(err.sandi)}
                            aria-describedby="petani-sandi-ket petani-sandi-galat"
                            className={`w-full h-[52px] box-border pl-3.5 pr-[120px] border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                              err.sandi ? 'border-danger' : 'border-field-border'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setLihat(!lihat)}
                            aria-controls="petani-sandi"
                            className="absolute right-1.5 top-1.5 h-10 px-3 border-0 rounded-lg bg-tint text-brand-900 text-[13px] font-extrabold cursor-pointer"
                          >
                            {lihat ? 'Sembunyikan' : 'Tampilkan'}
                          </button>
                        </div>
                        <p
                          id="petani-sandi-ket"
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
                            id="petani-sandi-galat"
                            className="m-0 text-[13px] font-semibold text-danger"
                          >
                            {err.sandi}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <h2 className="m-0 mt-2 text-base font-extrabold text-ink">
                    Toko
                  </h2>

                  {/* Nama Toko */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="petani-toko"
                      className="text-sm font-bold text-ink"
                    >
                      Nama toko atau lahan{' '}
                      <span aria-hidden="true" className="text-danger">
                        *
                      </span>
                    </label>
                    <input
                      id="petani-toko"
                      type="text"
                      autoComplete="organization"
                      placeholder="Contoh: Kebun Mang Ujang"
                      value={toko}
                      onChange={(e) => setToko(e.target.value)}
                      aria-invalid={Boolean(err.toko)}
                      aria-describedby="petani-toko-ket petani-toko-galat"
                      className={`h-[52px] box-border px-3.5 border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                        err.toko ? 'border-danger' : 'border-field-border'
                      }`}
                    />
                    <span id="petani-toko-ket" className="text-xs text-[#5a6b60]">
                      Tampil di halaman toko dan di setiap produkmu.
                    </span>
                    {err.toko && (
                      <p
                        id="petani-toko-galat"
                        className="m-0 text-[13px] font-semibold text-danger"
                      >
                        {err.toko}
                      </p>
                    )}
                  </div>

                  {/* Kecamatan Lahan Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="petani-lokasi"
                      className="text-sm font-bold text-ink"
                    >
                      Kecamatan lahan{' '}
                      <span aria-hidden="true" className="text-danger">
                        *
                      </span>
                    </label>

                    {lokasi ? (
                      <div className="flex items-center justify-between gap-2.5 min-h-[52px] p-2 pl-3.5 box-border border-[1.5px] border-[#157a4c] rounded-xl bg-[#f3faf3]">
                        <span className="text-[15px] leading-[1.4]">
                          <strong>{lokasi.nama}</strong>, {lokasi.kab}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setLokasi(null);
                            setCari('');
                          }}
                          className="shrink-0 min-h-9 px-3 border border-[#a9cfae] rounded-lg bg-white text-brand-900 text-[13px] font-extrabold cursor-pointer hover:bg-cream"
                        >
                          Ganti
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#5a6b60"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="absolute left-3.5 top-[17px]"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                          <input
                            id="petani-lokasi"
                            type="search"
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                            placeholder="Ketik nama kecamatan"
                            aria-invalid={Boolean(err.lokasi)}
                            aria-describedby="petani-lokasi-ket petani-lokasi-galat"
                            className={`w-full h-[52px] box-border pl-10 pr-3.5 border-[1.5px] rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c] ${
                              err.lokasi
                                ? 'border-danger'
                                : 'border-field-border'
                            }`}
                          />
                        </div>

                        {saran.length > 0 && (
                          <ul
                            aria-label="Pilihan kecamatan"
                            className="list-none m-0 p-1 border border-line rounded-xl bg-white shadow-[0_10px_24px_rgba(6,78,59,0.08)]"
                          >
                            {saran.map((sr, idx) => (
                              <li key={idx}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLokasi(sr);
                                    setCari(sr.nama);
                                  }}
                                  className="w-full min-h-[52px] flex flex-col items-start justify-center gap-px px-2.5 py-1.5 border-0 rounded-lg bg-transparent text-ink text-left cursor-pointer hover:bg-tint"
                                >
                                  <span className="text-[15px] font-extrabold">
                                    {sr.nama}
                                  </span>
                                  <span className="text-xs text-[#5a6b60]">
                                    {sr.kab}, Jawa Barat
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}

                    <span
                      id="petani-lokasi-ket"
                      className="text-xs leading-[1.5] text-[#5a6b60]"
                    >
                      Kecamatan di Jawa Barat. Dipakai untuk ongkos kirim dan
                      pencarian petani terdekat.
                    </span>
                    {err.lokasi && (
                      <p
                        id="petani-lokasi-galat"
                        className="m-0 text-[13px] font-semibold text-danger"
                      >
                        {err.lokasi}
                      </p>
                    )}
                  </div>

                  {/* Persetujuan */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-start gap-2.5 text-sm leading-[1.55] cursor-pointer">
                      <input
                        id="petani-setuju"
                        type="checkbox"
                        checked={setuju}
                        onChange={(e) => setSetuju(e.target.checked)}
                        aria-invalid={Boolean(err.setuju)}
                        className="shrink-0 w-5 h-5 mt-0.5 accent-brand-900 cursor-pointer"
                      />
                      <span>
                        Saya setuju dengan{' '}
                        <Link
                          href="/bantuan/syarat-ketentuan"
                          className="text-[#157a4c] font-bold no-underline hover:underline"
                        >
                          Syarat dan Ketentuan Petani
                        </Link>{' '}
                        serta{' '}
                        <Link
                          href="/bantuan/kebijakan-privasi"
                          className="text-[#157a4c] font-bold no-underline hover:underline"
                        >
                          Kebijakan Privasi
                        </Link>
                        .{' '}
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
                    Buat akun petani
                  </button>
                </form>

                {/* Diminta Nanti Section */}
                <section
                  aria-labelledby="judul-nanti"
                  className="p-4 px-4.5 border border-line rounded-2xl bg-cream"
                >
                  <h2
                    id="judul-nanti"
                    className="m-0 mb-3 text-[15px] font-extrabold text-ink"
                  >
                    Diminta nanti, saat dibutuhkan
                  </h2>
                  <ul className="list-none m-0 p-0 flex flex-col gap-3">
                    <li className="flex items-start gap-2.5 text-sm leading-[1.5] text-ink">
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
                        className="shrink-0 mt-0.5"
                      >
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>
                        <strong>Nomor HP dan alamat lahan</strong>
                        <br />
                        Sebelum pesanan pertama dikirim.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm leading-[1.5] text-ink">
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
                        className="shrink-0 mt-0.5"
                      >
                        <path d="M16 10h2" />
                        <path d="M16 14h2" />
                        <path d="M6.17 15a3 3 0 0 1 5.66 0" />
                        <circle cx="9" cy="11" r="2" />
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                      </svg>
                      <span>
                        <strong>KTP dan foto lahan</strong>
                        <br />
                        Sebelum pencairan dana pertama. Memberi lencana Petani
                        Terverifikasi.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm leading-[1.5] text-ink">
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
                        className="shrink-0 mt-0.5"
                      >
                        <line x1="3" x2="21" y1="22" y2="22" />
                        <line x1="6" x2="6" y1="18" y2="11" />
                        <line x1="10" x2="10" y1="18" y2="11" />
                        <line x1="14" x2="14" y1="18" y2="11" />
                        <line x1="18" x2="18" y1="18" y2="11" />
                        <polygon points="12 2 20 7 4 7" />
                      </svg>
                      <span>
                        <strong>Rekening bank</strong>
                        <br />
                        Sebelum pencairan dana pertama.
                      </span>
                    </li>
                  </ul>
                </section>
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
                  Toko {String(toko).trim() || 'kamu'} sudah aktif.
                </h1>
                <p className="m-0 text-sm leading-[1.55] text-[#3f5247]">
                  Lokasi: {lokasi?.nama ?? ''}, {lokasi?.kab ?? ''}. Langkah berikutnya:
                </p>
                <ol className="m-0 pl-5 flex flex-col gap-1.5 text-sm leading-[1.5] text-ink">
                  <li>Tambah produk pertama dengan foto stok asli.</li>
                  <li>Isi nomor HP dan alamat lahan sebelum pengiriman pertama.</li>
                  <li>Verifikasi KTP dan foto lahan sebelum pencairan dana.</li>
                </ol>
                <Link
                  href={hrefDasborToko}
                  className="flex items-center justify-center min-h-[52px] rounded-xl bg-brand-900 text-white text-base font-extrabold no-underline hover:bg-brand-600"
                >
                  Buka dasbor toko
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
          <AuthPanel varian="petani" />
        </div>
      </main>
    </div>
  );
}

export default DaftarPetani;
