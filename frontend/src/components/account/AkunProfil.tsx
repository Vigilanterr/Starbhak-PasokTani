'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { AkunMenu } from '../layout/AkunMenu';

export interface AkunProfilData {
  nama: string;
  email: string;
  hp: string;
  jenis: 'konsumen' | 'umkm';
  namaBisnis?: string;
}

export interface AkunProfilProps {
  profil?: AkunProfilData;
  onSimpan?: (data: {
    nama: string;
    hp: string;
    jenis: 'konsumen' | 'umkm';
  }) => Promise<void> | void;
  onUnggahFoto?: () => void;
  onUbahEmail?: () => void;
  hrefAkun?: string;
  className?: string;
}

const DEFAULT_PROFIL: AkunProfilData = {
  nama: 'Dewi Lestari',
  email: 'dewi.lestari@contoh.id',
  hp: '0812-3456-7890',
  jenis: 'umkm',
};

export function AkunProfil({
  profil = DEFAULT_PROFIL,
  onSimpan,
  onUnggahFoto,
  onUbahEmail,
  hrefAkun = '/akun',
  className = '',
}: AkunProfilProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);

  const [nama, setNama] = useState<string>(profil.nama);
  const [hp, setHp] = useState<string>(profil.hp);
  const [jenis, setJenis] = useState<'konsumen' | 'umkm'>(profil.jenis);
  const [tersimpan, setTersimpan] = useState<boolean>(false);

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

  const initial = (nama ? nama.charAt(0) : 'D').toUpperCase();

  const daftarJenis = [
    {
      id: 'konsumen' as const,
      judul: 'Rumah tangga',
      ket: 'Belanja untuk kebutuhan dapur sendiri.',
    },
    {
      id: 'umkm' as const,
      judul: 'UMKM atau usaha kuliner',
      ket: 'Warung, katering, atau kedai. Dapat pintasan Keranjang Resep untuk belanja rutin.',
    },
  ];

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setTersimpan(true);
    if (onSimpan) {
      await onSimpan({ nama, hp, jenis });
    }
  };

  return (
    <div
      ref={rootRef}
      className={`min-h-full bg-cream font-sans text-ink ${className}`}
    >
      <SiteHeader
        active="beranda"
        signedIn={true}
        user={{
          nama: profil.nama,
          email: profil.email,
          hp: profil.hp,
          jenis: profil.jenis,
        }}
        cartCount={0}
      />

      <main className="max-w-[1200px] mx-auto px-4 py-4 pb-8 min-[900px]:px-6 min-[900px]:py-7 min-[900px]:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Desktop Left Sidebar */}
          {!sempit && (
            <div className="flex-[0_0_272px] min-w-0">
              <AkunMenu
                aktif="profil"
                namaUser={profil.nama}
                peranUser={
                  profil.jenis === 'umkm' ? 'Pembeli UMKM' : 'Rumah Tangga'
                }
                initialUser={initial}
              />
            </div>
          )}

          {/* Form Content Column */}
          <div className="flex-[999_1_560px] min-w-0 max-w-[720px] flex flex-col gap-3.5">
            {sempit && (
              <Link
                href={hrefAkun}
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

            <div>
              <h1 className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                Profil
              </h1>
              <p className="mt-1.5 text-sm text-[#5a6b60]">
                Tanda{' '}
                <span aria-hidden="true" className="text-danger font-extrabold">
                  *
                </span>{' '}
                wajib diisi.
              </p>
            </div>

            <form
              onSubmit={handleSimpan}
              className="flex flex-col gap-4.5 p-5 border border-line rounded-2xl bg-white"
            >
              {/* Foto Profil */}
              <div className="flex flex-wrap items-center gap-3.5">
                <span
                  aria-hidden="true"
                  className="shrink-0 w-[72px] h-[72px] rounded-full grid place-items-center bg-brand-900 text-white text-[26px] font-extrabold"
                >
                  {initial}
                </span>
                <div className="flex-[1_1_200px] flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-ink">
                    Foto profil{' '}
                    <span className="font-medium text-[#5a6b60]">
                      (opsional)
                    </span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onUnggahFoto}
                      className="min-h-10 px-3.5 border-[1.5px] border-brand-900 rounded-xl bg-white text-brand-900 text-sm font-extrabold cursor-pointer hover:bg-cream"
                    >
                      Unggah foto
                    </button>
                  </div>
                  <span className="text-xs text-[#5a6b60]">
                    JPG atau PNG. Foto dikecilkan otomatis agar hemat kuota.
                  </span>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nama" className="text-sm font-bold text-ink">
                  Nama lengkap{' '}
                  <span aria-hidden="true" className="text-danger">
                    *
                  </span>
                </label>
                <input
                  id="nama"
                  type="text"
                  value={nama}
                  onChange={(e) => {
                    setNama(e.target.value);
                    setTersimpan(false);
                  }}
                  autoComplete="name"
                  required
                  className="h-12 box-border px-3.5 border-[1.5px] border-field-border rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
                />
              </div>

              {/* Email Section */}
              <div className="flex flex-col gap-1.5">
                <span id="label-email" className="text-sm font-bold text-ink">
                  Email
                </span>
                <div
                  role="group"
                  aria-labelledby="label-email"
                  className="flex flex-wrap items-center justify-between gap-2 min-h-12 p-1.5 pl-3.5 box-border border border-line rounded-xl bg-cream"
                >
                  <span className="flex flex-wrap items-center gap-2 text-[15px]">
                    {profil.email}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-bold">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Terverifikasi
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={onUbahEmail}
                    className="inline-flex items-center min-h-9 px-3 rounded-lg text-brand-900 text-sm font-extrabold cursor-pointer hover:bg-tint"
                  >
                    Ubah email
                  </button>
                </div>
                <span className="text-xs text-[#5a6b60]">
                  Email baru perlu diverifikasi sebelum dipakai untuk masuk.
                </span>
              </div>

              {/* Nomor HP */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="hp" className="text-sm font-bold text-ink">
                  Nomor HP{' '}
                  <span aria-hidden="true" className="text-danger">
                    *
                  </span>
                </label>
                <input
                  id="hp"
                  type="tel"
                  inputMode="tel"
                  value={hp}
                  onChange={(e) => {
                    setHp(e.target.value);
                    setTersimpan(false);
                  }}
                  autoComplete="tel"
                  aria-describedby="hp-ket"
                  required
                  className="h-12 box-border px-3.5 border-[1.5px] border-field-border rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
                />
                <span
                  id="hp-ket"
                  className="text-xs leading-[1.5] text-[#5a6b60]"
                >
                  Dipakai kurir dan petani untuk menghubungimu soal pesanan.
                  Tidak dipakai untuk promosi. Wajib sebelum checkout pertama.
                </span>
              </div>

              {/* Jenis Akun Fieldset */}
              <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                <legend className="p-0 mb-2 text-sm font-bold text-ink">
                  Jenis akun{' '}
                  <span aria-hidden="true" className="text-danger">
                    *
                  </span>
                </legend>
                <div
                  className={`grid gap-2 ${
                    sempit ? 'grid-cols-1' : 'grid-cols-2'
                  }`}
                >
                  {daftarJenis.map((j) => {
                    const isSelected = jenis === j.id;
                    return (
                      <label
                        key={j.id}
                        className={`flex items-start gap-2.5 p-3.5 rounded-xl cursor-pointer ${
                          isSelected
                            ? 'border-2 border-brand-900 bg-[#f3faf3]'
                            : 'border border-line bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="jenis-akun"
                          checked={isSelected}
                          onChange={() => {
                            setJenis(j.id);
                            setTersimpan(false);
                          }}
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
                <span className="text-xs text-[#5a6b60]">
                  Tidak perlu dokumen usaha. Jenis akun hanya mengubah pintasan
                  di beranda dan menu, bukan harga.
                </span>
              </fieldset>

              {/* Tombol Simpan & Batal */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="submit"
                  className="min-h-12 px-5.5 border-0 rounded-xl bg-brand-900 text-white text-[15px] font-extrabold cursor-pointer hover:bg-brand-600"
                >
                  Simpan perubahan
                </button>
                <Link
                  href={hrefAkun}
                  className="inline-flex items-center min-h-12 px-3.5 text-brand-900 text-[15px] font-bold no-underline hover:underline"
                >
                  Batal
                </Link>
                {tersimpan && (
                  <p
                    aria-live="polite"
                    className="basis-full m-0 text-sm font-bold text-[#157a4c]"
                  >
                    Perubahan disimpan.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>

      {!sempit && <SiteFooter />}
    </div>
  );
}

export default AkunProfil;
