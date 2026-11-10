'use client';

import React from 'react';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { NavBawah } from '../layout/NavBawah';
import { AkunMenu } from '../layout/AkunMenu';
import { ChipStatus } from '../common/ChipStatus';
import type { StatusPasokTani } from '../common/ChipStatus';

export interface ResepKeranjang {
  id?: string;
  nama: string;
  catatan?: string;
  status: StatusPasokTani | string;
  labelChip?: string;
  bahan: string;
  jumlahBahan: number;
  estimasi: string | number;
  terakhir?: string;
  keterangan?: string;
  urgen?: boolean;
  hrefBuka?: string;
  hrefCheckout?: string;
}

export type ResepItemRingkasan = ResepKeranjang;
export type ItemKartuResep = ResepKeranjang;

export interface KeranjangResepProps {
  resepList?: ResepKeranjang[];
  kosong?: boolean;
  teksRingkas?: string;
  hrefBaru?: string;
  onCheckoutGrup?: (resepId: string) => void;
  onBukaResep?: (resepId: string) => void;
  onBuatResep?: () => void;
  className?: string;
}

export function formatRupiah(n: number | string): string {
  if (typeof n === 'string') return n;
  const nb = '\u00a0';
  return 'Rp' + nb + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const defaultResepList: ResepKeranjang[] = [
  {
    id: 'nasi-goreng-kampung',
    nama: 'Nasi Goreng Kampung',
    catatan: 'Untuk 40 porsi, Warung Dewi',
    status: 'tertunda',
    labelChip: '1 bahan diganti',
    bahan: 'Cabai merah keriting 2 kg, jamur tiram putih 3 kg, tomat merah 3 kg, bawang daun 1 kg',
    jumlahBahan: 4,
    estimasi: 'Rp\u00a0189.200',
    terakhir: 'Sab, 26 Okt',
    keterangan:
      'Bawang daun Cikajang habis. Saat checkout diganti Bawang Daun Pangalengan, Rp 17.000/kg.',
    urgen: true,
    hrefBuka: '/keranjang-resep/nasi-goreng-kampung',
    hrefCheckout: '/checkout',
  },
  {
    id: 'sayur-asem',
    nama: 'Sayur Asem',
    catatan: 'Menu hari Jumat, 30 porsi',
    status: 'diproses',
    labelChip: 'Semua bahan ada',
    bahan: 'Kol bulat 4 kg, tomat merah 2 kg, kacang panjang 2 kg, jagung manis 3 kg, labu siam 2 kg',
    jumlahBahan: 5,
    estimasi: 'Rp\u00a0136.000',
    terakhir: 'Sen, 2 Nov',
    keterangan: 'Semua bahan tersedia dengan stok sekarang.',
    urgen: false,
    hrefBuka: '/keranjang-resep/sayur-asem',
    hrefCheckout: '/checkout',
  },
];

export function KeranjangResep({
  resepList = defaultResepList,
  kosong = false,
  teksRingkas,
  hrefBaru = '/keranjang-resep/baru',
  onCheckoutGrup,
  onBukaResep,
  onBuatResep,
  className = '',
}: KeranjangResepProps) {
  const isKosong = kosong || resepList.length === 0;
  const daftarResep = isKosong ? [] : resepList;

  const ringkasanTeks =
    teksRingkas ??
    (isKosong
      ? 'Belum ada resep.'
      : `${daftarResep.length} resep. Pilih satu untuk memesan semua bahannya sekaligus.`);

  return (
    <div
      className={`relative min-h-screen bg-[#fcfbf6] font-sans text-[#173b2b] ${className}`}
    >
      <SiteHeader cartCount={5} />

      <main className="max-w-[1200px] mx-auto px-4 py-4 md:px-6 md:pt-7 md:pb-16 box-border">
        <div className="flex flex-wrap items-start gap-6">
          {/* Desktop Left Sidebar Navigation */}
          <div className="hidden lg:block shrink-0 w-[272px] min-w-0">
            <AkunMenu aktif="resep" />
          </div>

          {/* Main Recipe List Content */}
          <div className="grow min-w-0 flex flex-col gap-4" style={{ flex: '999 1 560px' }}>
            <div className="flex flex-wrap items-end justify-between gap-2.5 gap-x-5">
              <div>
                <h1 className="m-0 text-[28px] md:text-[34px] leading-tight font-extrabold tracking-tight">
                  Keranjang Resep
                </h1>
                <p className="mt-1.5 mb-0 text-[15px] leading-relaxed text-[#3f5247]">
                  {ringkasanTeks}
                </p>
              </div>

              {!isKosong && (
                <a
                  href={hrefBaru}
                  onClick={(e) => {
                    if (onBuatResep) {
                      e.preventDefault();
                      onBuatResep();
                    }
                  }}
                  className="inline-flex items-center gap-2 min-h-11 px-4 border-1.5 border-[#064e3b] rounded-xl text-[#064e3b] text-sm font-extrabold no-underline hover:bg-[#ebf2eb]"
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
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Buat resep
                </a>
              )}
            </div>

            {/* Empty State */}
            {isKosong && (
              <div className="p-5.5 border-1.5 border-dashed border-[#a9cfae] rounded-2xl bg-white flex flex-col items-start gap-2.5">
                <p className="m-0 text-base font-extrabold">Belum ada resep</p>
                <p className="m-0 max-w-[56ch] text-sm leading-relaxed text-[#3f5247]">
                  Simpan bahan satu menu sebagai satu resep, misalnya Nasi Goreng Kampung. Lain kali
                  kamu tinggal checkout semua bahannya sekaligus, dengan alternatif kalau ada yang
                  kosong.
                </p>
                <a
                  href={hrefBaru}
                  onClick={(e) => {
                    if (onBuatResep) {
                      e.preventDefault();
                      onBuatResep();
                    }
                  }}
                  className="inline-flex items-center min-h-12 px-4.5 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline hover:bg-[#053d2e]"
                >
                  Buat resep pertama
                </a>
              </div>
            )}

            {/* Recipe Cards List */}
            <ul className="list-none m-0 p-0 flex flex-col gap-3.5">
              {daftarResep.map((k) => {
                const id = k.id ?? k.nama;
                const linkBuka = k.hrefBuka ?? `/keranjang-resep/${id}`;
                const linkCheckout = k.hrefCheckout ?? '/checkout';
                const estimasiTeks = formatRupiah(k.estimasi);

                return (
                  <li
                    key={id}
                    className="p-4.5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 gap-x-3">
                      <div className="min-w-0">
                        <h2 className="m-0 text-lg font-extrabold">
                          <a
                            href={linkBuka}
                            onClick={(e) => {
                              if (onBukaResep) {
                                e.preventDefault();
                                onBukaResep(id);
                              }
                            }}
                            className="text-[#173b2b] no-underline hover:underline"
                          >
                            {k.nama}
                          </a>
                        </h2>
                        {k.catatan && (
                          <p className="mt-0.5 mb-0 text-[13px] text-[#3f5247]">{k.catatan}</p>
                        )}
                      </div>
                      <ChipStatus
                        status={k.status as StatusPasokTani}
                        label={k.labelChip}
                      />
                    </div>

                    <p className="m-0 text-sm leading-relaxed text-[#3f5247]">{k.bahan}</p>

                    <dl className="m-0 grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div className="p-2 px-3 rounded-xl bg-[#f6f8f4]">
                        <dt className="text-xs text-[#3f5247]">Bahan</dt>
                        <dd className="m-0 text-[15px] font-extrabold">{k.jumlahBahan}</dd>
                      </div>
                      <div className="p-2 px-3 rounded-xl bg-[#ebf2eb]">
                        <dt className="text-xs text-[#3f5247]">Estimasi barang</dt>
                        <dd className="m-0 text-[15px] font-extrabold text-[#064e3b]">
                          {estimasiTeks}
                        </dd>
                      </div>
                      <div className="col-span-2 md:col-span-1 p-2 px-3 rounded-xl bg-[#f6f8f4]">
                        <dt className="text-xs text-[#3f5247]">Terakhir dipesan</dt>
                        <dd className="m-0 text-[15px] font-extrabold">
                          {k.terakhir ?? 'Belum pernah'}
                        </dd>
                      </div>
                    </dl>

                    {k.keterangan && (
                      <p
                        className={`m-0 text-[13px] leading-relaxed font-semibold ${
                          k.urgen ? 'text-[#92400e]' : 'text-[#157a4c]'
                        }`}
                      >
                        {k.keterangan}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={linkCheckout}
                        onClick={(e) => {
                          if (onCheckoutGrup) {
                            e.preventDefault();
                            onCheckoutGrup(id);
                          }
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center min-h-12 px-4.5 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline hover:bg-[#053d2e]"
                      >
                        Checkout grup ({k.jumlahBahan})
                      </a>
                      <a
                        href={linkBuka}
                        onClick={(e) => {
                          if (onBukaResep) {
                            e.preventDefault();
                            onBukaResep(id);
                          }
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center min-h-12 px-4.5 border-1.5 border-[#064e3b] rounded-xl bg-white text-[#064e3b] text-[15px] font-extrabold no-underline hover:bg-[#ebf2eb]"
                      >
                        Buka resep
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>

            {!isKosong && (
              <p className="m-0 flex gap-2 text-[13px] leading-relaxed text-[#3f5247]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span>
                  Estimasi memakai harga dan stok sekarang, hanya untuk barang. Ongkos kirim dan
                  biaya layanan 1% dihitung di checkout. Harga grosir dan Surplus bisa berubah kalau
                  stok berubah.
                </span>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <div className="lg:hidden sticky bottom-0 z-10 mt-6">
        <NavBawah ruteAktif="resep" />
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <SiteFooter />
      </div>
    </div>
  );
}

export default KeranjangResep;
