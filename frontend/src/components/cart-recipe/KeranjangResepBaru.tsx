'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { AkunMenu } from '../layout/AkunMenu';

export interface ResepBaruFormData {
  nama: string;
  catatan?: string;
  porsi?: number | string;
}

export type FormResepBaruData = ResepBaruFormData;

export interface KeranjangResepBaruProps {
  galat?: boolean;
  galatBawaan?: boolean;
  namaAwal?: string;
  catatanAwal?: string;
  initialData?: Partial<ResepBaruFormData>;
  onSubmit?: (data: ResepBaruFormData) => void;
  onSimpan?: (data: ResepBaruFormData) => void;
  onBatal?: () => void;
  hrefDaftar?: string;
  hrefIsi?: string;
  className?: string;
}

export function KeranjangResepBaru({
  galat = false,
  galatBawaan = false,
  namaAwal = '',
  catatanAwal = '',
  initialData,
  onSubmit,
  onSimpan,
  onBatal,
  hrefDaftar = '/keranjang-resep',
  hrefIsi = '/keranjang-resep/baru/isi',
  className = '',
}: KeranjangResepBaruProps) {
  const [nama, setNama] = useState<string>(initialData?.nama ?? namaAwal);
  const [catatan, setCatatan] = useState<string>(initialData?.catatan ?? catatanAwal);
  const [cobaKirim, setCobaKirim] = useState<boolean>(galat || galatBawaan);

  const isKosong = nama.trim().length === 0;
  const showGalat = cobaKirim && isKosong;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCobaKirim(true);
    if (isKosong) {
      return;
    }
    const data: ResepBaruFormData = {
      nama: nama.trim(),
      catatan: catatan.trim(),
    };
    if (onSubmit) {
      onSubmit(data);
    } else if (onSimpan) {
      onSimpan(data);
    }
  };

  const handleBatal = () => {
    if (onBatal) {
      onBatal();
    }
  };

  return (
    <div
      className={`relative min-h-screen bg-[#fcfbf6] font-sans text-[#173b2b] ${className}`}
    >
      <SiteHeader cartCount={5} />

      <main className="max-w-[1200px] mx-auto px-4 py-4 md:px-6 md:pt-7 md:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Desktop Left Sidebar */}
          <div className="hidden lg:block shrink-0 w-[272px] min-w-0">
            <AkunMenu aktif="resep" />
          </div>

          {/* Main Form Content */}
          <div className="grow min-w-0 max-w-[720px] flex flex-col gap-4">
            <Link
              href={hrefDaftar}
              onClick={(e) => {
                if (onBatal) {
                  e.preventDefault();
                  onBatal();
                }
              }}
              className="self-start inline-flex items-center gap-1 min-h-11 text-[#157a4c] text-sm font-bold no-underline hover:underline"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Keranjang Resep
            </Link>

            <div>
              <h1 className="m-0 text-[28px] md:text-[34px] leading-tight font-extrabold tracking-tight">
                Buat resep
              </h1>
              <p className="mt-1.5 mb-0 text-[15px] leading-relaxed text-[#3f5247]">
                Dua isian, kurang dari satu menit. Bahan dipilih di langkah berikutnya.
              </p>
            </div>

            <form
              noValidate
              onSubmit={handleSubmit}
              className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-4.5"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="nama-menu"
                  className="flex flex-wrap items-baseline gap-1.5 text-sm font-extrabold"
                >
                  Nama menu <span className="text-xs font-bold text-[#92400e]">Wajib</span>
                </label>
                <input
                  id="nama-menu"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  maxLength={40}
                  autoComplete="off"
                  aria-required="true"
                  aria-invalid={showGalat}
                  aria-describedby="bantu-nama"
                  placeholder="Contoh: Soto Ayam, 30 porsi"
                  className={`box-border w-full min-h-12 px-3.5 rounded-xl bg-white text-[#173b2b] font-sans text-base outline-none ${
                    showGalat
                      ? 'border-2 border-[#b42318]'
                      : 'border border-[#c9d2c6] focus:border-[#064e3b]'
                  }`}
                />
                <div
                  id="bantu-nama"
                  className="flex justify-between gap-3 text-[13px] leading-normal"
                >
                  {showGalat ? (
                    <span
                      role="alert"
                      className="flex items-center gap-1.5 font-bold text-[#8a1c12]"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="shrink-0"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                      </svg>
                      Isi nama menu dulu, misalnya Nasi Goreng Kampung.
                    </span>
                  ) : (
                    <span className="text-[#5a6b60]">Nama ini muncul di daftar resepmu.</span>
                  )}
                  <span className="shrink-0 text-[#5a6b60] ml-auto">{nama.length}/40</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="catatan-menu"
                  className="flex flex-wrap items-baseline gap-1.5 text-sm font-extrabold"
                >
                  Catatan <span className="text-xs font-semibold text-[#5a6b60]">Opsional</span>
                </label>
                <textarea
                  id="catatan-menu"
                  rows={3}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  aria-describedby="bantu-catatan"
                  placeholder="Contoh: porsi, hari menu ini dijual"
                  className="box-border w-full p-3 px-3.5 border border-[#c9d2c6] rounded-xl bg-white text-[#173b2b] font-sans text-base leading-relaxed outline-none focus:border-[#064e3b] resize-y"
                />
                <p id="bantu-catatan" className="m-0 text-[13px] leading-normal text-[#5a6b60]">
                  Hanya kamu yang melihat catatan ini.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {!isKosong && (onSubmit || onSimpan) ? (
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center min-h-12 px-5 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                  >
                    Simpan dan pilih bahan
                  </button>
                ) : !isKosong ? (
                  <Link
                    href={hrefIsi}
                    onClick={handleSubmit}
                    className="w-full sm:w-auto inline-flex items-center justify-center min-h-12 px-5 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline hover:bg-[#053d2e]"
                  >
                    Simpan dan pilih bahan
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full sm:w-auto min-h-12 px-5 border-0 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold cursor-pointer hover:bg-[#053d2e]"
                  >
                    Simpan dan pilih bahan
                  </button>
                )}

                <Link
                  href={hrefDaftar}
                  onClick={(e) => {
                    if (onBatal) {
                      e.preventDefault();
                      handleBatal();
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center min-h-12 px-5 border-[1.5px] border-[#c9d2c6] rounded-xl bg-white text-[#173b2b] text-[15px] font-extrabold no-underline hover:bg-[#f6f8f4]"
                >
                  Batal
                </Link>
              </div>
            </form>

            <section
              aria-labelledby="judul-lanjut"
              className="p-4 md:p-4.5 border border-[#dee3da] rounded-2xl bg-white"
            >
              <h2 id="judul-lanjut" className="mt-0 mb-3 text-[15px] font-extrabold">
                Setelah disimpan
              </h2>
              <ol className="list-none m-0 p-0 flex flex-col gap-3">
                <li className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-6.5 h-6.5 rounded-full grid place-items-center bg-[#064e3b] text-white text-[13px] font-extrabold"
                  >
                    1
                  </span>
                  <span className="text-[13px] leading-relaxed text-[#3f5247]">
                    <strong className="block text-sm text-[#173b2b]">
                      Pilih bahan dan jumlahnya
                    </strong>
                    Dari produk yang ada di Pasok Tani.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-6.5 h-6.5 rounded-full grid place-items-center bg-[#064e3b] text-white text-[13px] font-extrabold"
                  >
                    2
                  </span>
                  <span className="text-[13px] leading-relaxed text-[#3f5247]">
                    <strong className="block text-sm text-[#173b2b]">
                      Atur alternatif (opsional)
                    </strong>
                    Dipakai berurutan kalau bahan utama kosong.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-6.5 h-6.5 rounded-full grid place-items-center bg-[#064e3b] text-white text-[13px] font-extrabold"
                  >
                    3
                  </span>
                  <span className="text-[13px] leading-relaxed text-[#3f5247]">
                    <strong className="block text-sm text-[#173b2b]">
                      Checkout semua sekaligus
                    </strong>
                    Pembayaran memakai checkout yang sama.
                  </span>
                </li>
              </ol>
            </section>
          </div>
        </div>
      </main>

      <div className="mt-8 hidden lg:block">
        <SiteFooter />
      </div>
    </div>
  );
}

export default KeranjangResepBaru;
