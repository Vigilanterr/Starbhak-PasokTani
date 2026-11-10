'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { AkunMenu } from '../layout/AkunMenu';

export interface AkunKeamananProps {
  email?: string;
  googleTerhubung?: boolean;
  googleEmail?: string;
  emailGoogle?: string;
  terakhirDiubah?: string;
  pesananBerjalanCount?: number;
  komitmenAktifCount?: number;
  saldoDompet?: number | string;
  onToggleGoogle?: () => Promise<void> | void;
  onSubmitUbahSandi?: (
    sandiLama: string,
    sandiBaru: string
  ) => Promise<boolean | void> | void;
  onKeluarPerangkatLain?: () => Promise<void> | void;
  onKeluarSemuaPerangkat?: () => Promise<void> | void;
  onAjukanHapusAkun?: () => Promise<void> | void;
  className?: string;
}

export function AkunKeamanan({
  email = 'dewi.lestari@contoh.id',
  googleTerhubung: googleTerhubungProp = true,
  googleEmail,
  emailGoogle,
  pesananBerjalanCount = 3,
  komitmenAktifCount = 2,
  saldoDompet = 'Rp 63.500',
  onToggleGoogle,
  onSubmitUbahSandi,
  onKeluarPerangkatLain,
  onKeluarSemuaPerangkat,
  onAjukanHapusAkun,
  className = '',
}: AkunKeamananProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);

  const [lihatLama, setLihatLama] = useState<boolean>(false);
  const [lihatBaru, setLihatBaru] = useState<boolean>(false);
  const [google, setGoogle] = useState<boolean>(googleTerhubungProp);
  const [sandiLama, setSandiLama] = useState<string>('');
  const [sandiBaru, setSandiBaru] = useState<string>('');
  const [pesanSandi, setPesanSandi] = useState<string>('');
  const [pesanPerangkat, setPesanPerangkat] = useState<string>('');

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

  const resolvedGoogleEmail =
    googleEmail ?? emailGoogle ?? 'dewi.lestari@gmail.com';
  const ketGoogle = google
    ? `Terhubung sebagai ${resolvedGoogleEmail}`
    : 'Belum terhubung';
  const labelGoogle = google ? 'Putuskan' : 'Hubungkan';
  const warnaGoogle = google ? 'text-danger-ink' : 'text-brand-900';

  const resolvedSaldo =
    typeof saldoDompet === 'number'
      ? `Rp ${saldoDompet.toLocaleString('id-ID')}`
      : String(saldoDompet);

  const handleToggleGoogle = async () => {
    setGoogle(!google);
    if (onToggleGoogle) {
      await onToggleGoogle();
    }
  };

  const handleSimpanSandi = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanSandi('Kata sandi diperbarui.');
    if (onSubmitUbahSandi) {
      await onSubmitUbahSandi(sandiLama, sandiBaru);
    }
  };

  const handleKeluarLain = async () => {
    setPesanPerangkat('Semua perangkat lain sudah dikeluarkan.');
    if (onKeluarPerangkatLain) await onKeluarPerangkatLain();
    if (onKeluarSemuaPerangkat) await onKeluarSemuaPerangkat();
  };

  return (
    <div
      ref={rootRef}
      className={`min-h-full bg-cream font-sans text-ink ${className}`}
    >
      <SiteHeader active="beranda" signedIn={true} cartCount={0} />

      <main className="max-w-[1200px] mx-auto px-4 py-4 min-[900px]:px-6 min-[900px]:py-7 min-[900px]:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Desktop Left Sidebar */}
          {!sempit && (
            <div className="flex-[0_0_272px] min-w-0">
              <AkunMenu aktif="keamanan" />
            </div>
          )}

          {/* Main Column */}
          <div className="flex-[999_1_560px] min-w-0 max-w-[720px] flex flex-col gap-4">
            {sempit && (
              <Link
                href="/akun"
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
                Akun
              </Link>
            )}

            <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
              Keamanan
            </h1>

            {/* Cara Masuk */}
            <section
              aria-labelledby="judul-masuk"
              className="p-5 border border-line rounded-2xl bg-white flex flex-col gap-3"
            >
              <div>
                <h2
                  id="judul-masuk"
                  className="m-0 text-[17px] font-extrabold text-ink"
                >
                  Cara masuk
                </h2>
                <p className="mt-1 text-[13px] text-[#5a6b60]">
                  Kamu bisa masuk dengan salah satu cara ini.
                </p>
              </div>

              <ul className="list-none m-0 p-0 border border-line rounded-xl overflow-hidden">
                <li className="flex flex-wrap items-center gap-2.5 p-3.5 px-4">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-9 h-9 rounded-xl grid place-items-center bg-tint text-brand-900"
                  >
                    <svg
                      width="18"
                      height="18"
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
                  <span className="flex-[1_1_180px] min-w-0">
                    <strong className="block text-[15px] font-extrabold text-ink">
                      Email dan kata sandi
                    </strong>
                    <span className="text-[13px] text-[#3f5247]">{email}</span>
                  </span>
                  <span className="px-2 py-px rounded-full bg-[#dcfce7] text-[#166534] text-xs font-bold">
                    Aktif
                  </span>
                </li>

                <li className="flex flex-wrap items-center gap-2.5 p-3.5 px-4 border-t border-[#eef0eb]">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-9 h-9 rounded-xl grid place-items-center bg-tint text-brand-900 text-[15px] font-extrabold"
                  >
                    G
                  </span>
                  <span className="flex-[1_1_180px] min-w-0">
                    <strong className="block text-[15px] font-extrabold text-ink">
                      Google
                    </strong>
                    <span className="text-[13px] text-[#3f5247]">
                      {ketGoogle}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleGoogle}
                    className={`min-h-10 px-3.5 border border-line rounded-xl bg-white text-sm font-extrabold cursor-pointer hover:bg-cream ${warnaGoogle}`}
                  >
                    {labelGoogle}
                  </button>
                </li>
              </ul>
            </section>

            {/* Ubah Kata Sandi */}
            <section
              aria-labelledby="judul-sandi"
              className="p-5 border border-line rounded-2xl bg-white"
            >
              <form
                onSubmit={handleSimpanSandi}
                className="flex flex-col gap-4"
              >
                <h2
                  id="judul-sandi"
                  className="m-0 text-[17px] font-extrabold text-ink"
                >
                  Ubah kata sandi
                </h2>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="sandi-lama"
                    className="text-sm font-bold text-ink"
                  >
                    Kata sandi saat ini
                  </label>
                  <div className="relative">
                    <input
                      id="sandi-lama"
                      type={lihatLama ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={sandiLama}
                      onChange={(e) => setSandiLama(e.target.value)}
                      className="w-full h-12 box-border pl-3.5 pr-14 border-[1.5px] border-field-border rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
                    />
                    <button
                      type="button"
                      onClick={() => setLihatLama(!lihatLama)}
                      aria-pressed={lihatLama}
                      aria-label="Tampilkan kata sandi saat ini"
                      className="absolute right-0.5 top-0.5 w-11 h-11 grid place-items-center border-0 rounded-lg bg-transparent text-[#3f5247] cursor-pointer"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                  <Link
                    href="/lupa-sandi"
                    className="self-start min-h-8 inline-flex items-center text-[#157a4c] text-[13px] font-bold no-underline hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="sandi-baru"
                    className="text-sm font-bold text-ink"
                  >
                    Kata sandi baru
                  </label>
                  <div className="relative">
                    <input
                      id="sandi-baru"
                      type={lihatBaru ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={sandiBaru}
                      onChange={(e) => setSandiBaru(e.target.value)}
                      aria-describedby="sandi-ket"
                      className="w-full h-12 box-border pl-3.5 pr-14 border-[1.5px] border-field-border rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
                    />
                    <button
                      type="button"
                      onClick={() => setLihatBaru(!lihatBaru)}
                      aria-pressed={lihatBaru}
                      aria-label="Tampilkan kata sandi baru"
                      className="absolute right-0.5 top-0.5 w-11 h-11 grid place-items-center border-0 rounded-lg bg-transparent text-[#3f5247] cursor-pointer"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                  <span
                    id="sandi-ket"
                    className="text-xs leading-[1.5] text-[#5a6b60]"
                  >
                    Minimal 8 karakter. Boleh ditempel dari pengelola kata sandi.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="submit"
                    className="min-h-12 px-5.5 border-0 rounded-xl bg-brand-900 text-white text-[15px] font-extrabold cursor-pointer hover:bg-brand-600"
                  >
                    Simpan kata sandi
                  </button>
                  {pesanSandi && (
                    <p
                      aria-live="polite"
                      className="m-0 text-sm font-bold text-[#157a4c]"
                    >
                      {pesanSandi}
                    </p>
                  )}
                </div>
              </form>
            </section>

            {/* Perangkat Lain */}
            <section
              aria-labelledby="judul-perangkat"
              className="p-5 border border-line rounded-2xl bg-white flex flex-col gap-2.5"
            >
              <h2
                id="judul-perangkat"
                className="m-0 text-[17px] font-extrabold text-ink"
              >
                Perangkat lain
              </h2>
              <p className="m-0 text-sm leading-[1.55] text-[#3f5247]">
                Pernah masuk di HP atau komputer orang lain? Keluarkan semua
                sesi lain. Kamu tetap masuk di perangkat ini.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleKeluarLain}
                  className="self-start min-h-11 px-4 border-[1.5px] border-brand-900 rounded-xl bg-white text-brand-900 text-sm font-extrabold cursor-pointer hover:bg-cream"
                >
                  Keluar dari perangkat lain
                </button>
                {pesanPerangkat && (
                  <p
                    aria-live="polite"
                    className="m-0 text-sm font-bold text-[#157a4c]"
                  >
                    {pesanPerangkat}
                  </p>
                )}
              </div>
            </section>

            {/* Hapus Akun */}
            <section
              aria-labelledby="judul-hapus"
              className="p-5 border border-[#f2b8b2] rounded-2xl bg-white flex flex-col gap-2.5"
            >
              <h2
                id="judul-hapus"
                className="m-0 text-[17px] font-extrabold text-[#8a1c12]"
              >
                Hapus akun
              </h2>
              <p className="m-0 text-sm leading-[1.55] text-[#3f5247]">
                Akun dan data pribadimu dihapus. Bisa diajukan kalau tidak ada
                pesanan atau Komitmen yang masih berjalan dan saldo Dompet sudah
                Rp 0. Data transaksi yang wajib disimpan tetap dicatat sesuai
                Kebijakan Privasi.{' '}
                <span className="px-1.5 py-px border border-dashed border-[#c2a032] rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs font-bold whitespace-nowrap">
                  [Cek UU PDP]
                </span>
              </p>
              <p className="m-0 text-[13px] font-bold text-[#92400e]">
                Saat ini belum bisa: {pesananBerjalanCount} pesanan berjalan,{' '}
                {komitmenAktifCount} Komitmen aktif, saldo Dompet {resolvedSaldo}.
              </p>
              <button
                type="button"
                onClick={onAjukanHapusAkun}
                className="self-start min-h-11 px-4 border-[1.5px] border-danger rounded-xl bg-white text-danger text-sm font-extrabold cursor-pointer hover:bg-danger-bg"
              >
                Ajukan penghapusan akun
              </button>
            </section>
          </div>
        </div>
      </main>

      {!sempit && <SiteFooter />}
    </div>
  );
}

export default AkunKeamanan;
