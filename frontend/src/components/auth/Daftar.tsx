'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AuthHeader } from '../layout/AuthHeader';
import { AuthPanel } from '../layout/AuthPanel';

export interface DaftarProps {
  dariGoogle?: boolean;
  googleEmail?: string;
  onPilihPeran?: (peran: 'pembeli' | 'petani') => void;
  hrefPembeli?: string;
  hrefPetani?: string;
  hrefMasuk?: string;
  className?: string;
}

export function Daftar({
  dariGoogle = false,
  googleEmail = 'dewi.lestari@gmail.com',
  onPilihPeran,
  hrefPembeli = '/daftar/pembeli',
  hrefPetani = '/daftar/petani',
  hrefMasuk = '/masuk',
  className = '',
}: DaftarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sempit, setSempit] = useState<boolean>(false);

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

  return (
    <div
      ref={rootRef}
      className={`min-h-full bg-white font-sans text-ink ${className}`}
    >
      <AuthHeader ajakan="masuk" sempit={sempit} />

      <main className="flex items-start">
        <section
          aria-labelledby="judul-daftar"
          className="flex-1 min-w-0 flex justify-center px-5 py-2 pb-10 min-[900px]:px-12 min-[900px]:pt-10 min-[900px]:pb-16 box-border"
        >
          <div className="w-full max-w-[460px] flex flex-col gap-[18px]">
            <div>
              <h1
                id="judul-daftar"
                className="m-0 text-[28px] min-[900px]:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink"
              >
                Daftar ke Pasok Tani
              </h1>
              <p className="mt-2 text-[15px] leading-[1.55] text-[#3f5247]">
                Pilih peran untuk akun ini. Data lain diminta bertahap, saat memang
                dibutuhkan.
              </p>
            </div>

            {/* Google notice banner */}
            {dariGoogle && (
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
                  Akun Google <strong>{googleEmail}</strong> belum terdaftar di
                  Pasok Tani. Pilih peran untuk melanjutkan.
                </span>
              </p>
            )}

            {/* Role Options */}
            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              {/* Buyer Option Card */}
              <li>
                <Link
                  href={hrefPembeli}
                  onClick={() => onPilihPeran?.('pembeli')}
                  className="flex items-start gap-3.5 p-[18px] border-[1.5px] border-line rounded-2xl bg-white text-ink no-underline hover:border-brand-900"
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-12 h-12 rounded-[14px] grid place-items-center bg-tint text-brand-900"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 11-1 9" />
                      <path d="m19 11-4-7" />
                      <path d="M2 11h20" />
                      <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
                      <path d="M4.5 15.5h15" />
                      <path d="m5 11 4-7" />
                      <path d="m9 11 1 9" />
                    </svg>
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col gap-1">
                    <strong className="text-lg font-extrabold text-ink">
                      Saya mau belanja
                    </strong>
                    <span className="text-sm leading-[1.5] text-[#3f5247]">
                      Untuk rumah tangga, warung, dan katering.
                    </span>
                    <span className="mt-1.5 flex flex-col gap-1.5">
                      <span className="flex items-start gap-2 text-[13px] leading-[1.5] text-[#3f5247]">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#157a4c"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0 mt-0.5"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Daftar dengan email atau Google, tanpa dokumen usaha.
                      </span>
                      <span className="flex items-start gap-2 text-[13px] leading-[1.5] text-[#3f5247]">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#157a4c"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0 mt-0.5"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Nomor HP dan alamat diminta saat checkout pertama.
                      </span>
                    </span>
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5a6b60"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 self-center"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </li>

              {/* Farmer Option Card */}
              <li>
                <Link
                  href={hrefPetani}
                  onClick={() => onPilihPeran?.('petani')}
                  className="flex items-start gap-3.5 p-[18px] border-[1.5px] border-line rounded-2xl bg-white text-ink no-underline hover:border-brand-900"
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-12 h-12 rounded-[14px] grid place-items-center bg-[#fbf3d9] text-[#5c4500]"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 20h10" />
                      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                    </svg>
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col gap-1">
                    <strong className="text-lg font-extrabold text-ink">
                      Saya mau menjual hasil panen
                    </strong>
                    <span className="text-sm leading-[1.5] text-[#3f5247]">
                      Untuk petani dan kelompok tani di Jawa Barat.
                    </span>
                    <span className="mt-1.5 flex flex-col gap-1.5">
                      <span className="flex items-start gap-2 text-[13px] leading-[1.5] text-[#3f5247]">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#157a4c"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0 mt-0.5"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Bisa langsung berjualan, sebelum verifikasi.
                      </span>
                      <span className="flex items-start gap-2 text-[13px] leading-[1.5] text-[#3f5247]">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#157a4c"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0 mt-0.5"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        KTP, foto lahan, dan rekening diminta sebelum pencairan dana
                        pertama.
                      </span>
                    </span>
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5a6b60"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 self-center"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </li>
            </ul>

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
          <AuthPanel varian="umum" />
        </div>
      </main>
    </div>
  );
}

export default Daftar;
