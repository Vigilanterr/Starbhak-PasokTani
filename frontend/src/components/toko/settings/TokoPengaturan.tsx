'use client';

import React from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';

export type StatusPengaturanItem = 'lengkap' | 'wajib' | 'cek' | 'opsional';

export interface ItemPengaturan {
  id: string;
  grup: 'Toko' | 'Pesanan dan pengiriman' | 'Uang' | 'Akun';
  ikon: 'Profil' | 'Jam' | 'Verif' | 'Kirim' | 'Otomatis' | 'Rekening' | 'Kunci';
  judul: string;
  href: string;
  nilai: string;
  st: StatusPengaturanItem;
  alasan?: string;
  aksi?: string;
}

export interface TokoPengaturanProps {
  kelengkapanProfil?: number;
  statusToko?: 'buka' | 'tutup' | 'libur';
  tokoBaru?: boolean;
  daftarPengaturan?: ItemPengaturan[];
  className?: string;
}

const DEFAULT_PENGATURAN_DATA: ItemPengaturan[] = [
  {
    grup: 'Toko',
    id: 'profil',
    ikon: 'Profil',
    judul: 'Profil toko',
    href: '/toko/pengaturan/profil',
    nilai: 'Foto, keterangan, nomor HP, alamat lahan di Cikole, Lembang',
    st: 'lengkap',
    alasan: 'Alamat lahan wajib sebelum pesanan pertama dikirim.',
    aksi: 'Isi profil',
  },
  {
    grup: 'Toko',
    id: 'jam',
    ikon: 'Jam',
    judul: 'Jam buka dan libur',
    href: '/toko/pengaturan/jam-operasional',
    nilai: 'Sen–Sab 05.30–17.00, Min 07.00–17.00. Natal dan Tahun Baru belum dipastikan.',
    st: 'cek',
  },
  {
    grup: 'Toko',
    id: 'verif',
    ikon: 'Verif',
    judul: 'Verifikasi petani',
    href: '/toko/verifikasi',
    nilai: 'Petani Terverifikasi sejak Rab, 21 Okt 2026',
    st: 'lengkap',
    alasan: 'Wajib sebelum tarik saldo pertama.',
    aksi: 'Verifikasi',
  },
  {
    grup: 'Pesanan dan pengiriman',
    id: 'kirim',
    ikon: 'Kirim',
    judul: 'Pengiriman',
    href: '/toko/pengaturan/pengiriman',
    nilai: 'Kurir, antar sendiri sampai 25 km, ambil di lahan Sen–Sab',
    st: 'lengkap',
  },
  {
    grup: 'Pesanan dan pengiriman',
    id: 'otomatis',
    ikon: 'Otomatis',
    judul: 'Pesanan otomatis',
    href: '/toko/pengaturan/pesanan-otomatis',
    nilai: 'Terima otomatis. Batal otomatis kalau belum diproses dalam 24 jam.',
    st: 'lengkap',
  },
  {
    grup: 'Uang',
    id: 'rekening',
    ikon: 'Rekening',
    judul: 'Rekening bank',
    href: '/toko/pengaturan/rekening',
    nilai: 'BRI ••••3021 atas nama UJANG, cocok dengan KTP',
    st: 'lengkap',
    alasan: 'Wajib sebelum tarik saldo pertama.',
    aksi: 'Tambah rekening',
  },
  {
    grup: 'Akun',
    id: 'akun',
    ikon: 'Kunci',
    judul: 'Akun dan keamanan',
    href: '/akun/keamanan',
    nilai: 'Email, kata sandi, perangkat yang masuk',
    st: 'lengkap',
  },
];

const DEFAULT_PENGATURAN_BARU: ItemPengaturan[] = [
  {
    grup: 'Toko',
    id: 'profil',
    ikon: 'Profil',
    judul: 'Profil toko',
    href: '/toko/pengaturan/profil',
    nilai: 'Nama dan kecamatan sudah ada. Nomor HP dan alamat lahan belum.',
    st: 'wajib',
    alasan: 'Alamat lahan wajib sebelum pesanan pertama dikirim.',
    aksi: 'Isi profil',
  },
  {
    grup: 'Toko',
    id: 'jam',
    ikon: 'Jam',
    judul: 'Jam buka dan libur',
    href: '/toko/pengaturan/jam-operasional',
    nilai: 'Belum diatur. Sementara dianggap buka setiap hari 07.00–17.00.',
    st: 'opsional',
  },
  {
    grup: 'Toko',
    id: 'verif',
    ikon: 'Verif',
    judul: 'Verifikasi petani',
    href: '/toko/verifikasi',
    nilai: 'KTP dan foto lahan belum dikirim.',
    st: 'wajib',
    alasan: 'Wajib sebelum tarik saldo pertama.',
    aksi: 'Verifikasi',
  },
  {
    grup: 'Pesanan dan pengiriman',
    id: 'kirim',
    ikon: 'Kirim',
    judul: 'Pengiriman',
    href: '/toko/pengaturan/pengiriman',
    nilai: 'Kurir aktif. Antar sendiri dan ambil di lahan belum diatur.',
    st: 'opsional',
  },
  {
    grup: 'Pesanan dan pengiriman',
    id: 'otomatis',
    ikon: 'Otomatis',
    judul: 'Pesanan otomatis',
    href: '/toko/pengaturan/pesanan-otomatis',
    nilai: 'Terima otomatis. Batal otomatis kalau belum diproses dalam 24 jam.',
    st: 'lengkap',
  },
  {
    grup: 'Uang',
    id: 'rekening',
    ikon: 'Rekening',
    judul: 'Rekening bank',
    href: '/toko/pengaturan/rekening',
    nilai: 'Belum ada rekening.',
    st: 'wajib',
    alasan: 'Wajib sebelum tarik saldo pertama.',
    aksi: 'Tambah rekening',
  },
  {
    grup: 'Akun',
    id: 'akun',
    ikon: 'Kunci',
    judul: 'Akun dan keamanan',
    href: '/akun/keamanan',
    nilai: 'Email, kata sandi, perangkat yang masuk',
    st: 'lengkap',
  },
];

export function TokoPengaturan({
  kelengkapanProfil,
  statusToko = 'buka',
  tokoBaru = false,
  daftarPengaturan,
  className = '',
}: TokoPengaturanProps) {
  const items = daftarPengaturan ?? (tokoBaru ? DEFAULT_PENGATURAN_BARU : DEFAULT_PENGATURAN_DATA);

  const wajibItems = items.filter((d) => d.alasan);
  const lengkapWajibCount = wajibItems.filter((d) => d.st === 'lengkap').length;
  const kurangItems = items.filter((d) => d.st === 'wajib');

  const resolvedPercent =
    kelengkapanProfil ?? (wajibItems.length > 0 ? (lengkapWajibCount / wajibItems.length) * 100 : 100);

  const ringkasanTeks = kurangItems.length > 0
    ? `${lengkapWajibCount} dari ${wajibItems.length} pengaturan wajib sudah lengkap.`
    : 'Semua pengaturan wajib sudah lengkap.';

  const renderIcon = (ikon: ItemPengaturan['ikon']) => {
    switch (ikon) {
      case 'Profil':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
            <path d="M2 7h20" />
          </svg>
        );
      case 'Jam':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        );
      case 'Verif':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      case 'Kirim':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
            <circle cx="17" cy="18" r="2" />
            <circle cx="7" cy="18" r="2" />
          </svg>
        );
      case 'Otomatis':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        );
      case 'Rekening':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V10" />
            <path d="M19 21V10" />
            <path d="M12 3 3 8h18z" />
            <path d="M9 21v-6" />
            <path d="M15 21v-6" />
          </svg>
        );
      case 'Kunci':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
    }
  };

  const renderChipStatus = (st: StatusPengaturanItem) => {
    switch (st) {
      case 'lengkap':
        return (
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-extrabold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" aria-hidden="true" />
            Lengkap
          </span>
        );
      case 'wajib':
        return (
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdecea] text-[#8a1c12] text-xs font-extrabold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b42318]" aria-hidden="true" />
            Belum diisi
          </span>
        );
      case 'cek':
        return (
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] text-xs font-extrabold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]" aria-hidden="true" />
            Perlu dicek
          </span>
        );
      case 'opsional':
        return (
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-dashed border-[#9aa79e] bg-white text-[#3f5247] text-xs font-extrabold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9d2c6]" aria-hidden="true" />
            Belum aktif
          </span>
        );
    }
  };

  const groups: Array<ItemPengaturan['grup']> = ['Toko', 'Pesanan dan pengiriman', 'Uang', 'Akun'];

  return (
    <div className={`min-h-full bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas statusBuka={statusToko === 'libur' ? 'Toko Libur' : statusToko === 'tutup' ? 'Tutup' : 'Buka sampai 17.00'} />
      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden min-[900px]:block w-[272px] shrink-0 p-5 pt-5 pb-6 pl-5">
          <TokoSamping aktif="pengaturan" terverifikasi={!tokoBaru} />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 min-[900px]:px-6 min-[900px]:py-5 min-[900px]:pb-12">
          <div className="max-w-[820px] flex flex-col gap-4.5">
            {/* Header */}
            <div>
              <h1 className="text-2xl min-[900px]:text-[28px] font-extrabold tracking-tight leading-tight m-0">
                Pengaturan toko
              </h1>
              <p className="mt-1.5 mb-0 text-[15px] text-[#3f5247]">
                {ringkasanTeks}
              </p>
            </div>

            {/* Warning Banner if incomplete */}
            {kurangItems.length > 0 && (
              <section
                aria-labelledby="judul-kurang-pengaturan"
                className="p-4 min-[900px]:px-[18px] border-[1.5px] border-[#f3d7c6] rounded-2xl bg-[#fffaf6] flex flex-col gap-2.5"
              >
                <h2 id="judul-kurang-pengaturan" className="text-base font-extrabold text-[#9a3412] m-0">
                  {kurangItems.length} hal wajib belum diisi
                </h2>
                <div
                  aria-hidden="true"
                  className="h-2 rounded-full bg-[#f3e4da] overflow-hidden"
                >
                  <div
                    style={{ width: `${resolvedPercent}%` }}
                    className="h-full rounded-full bg-[#157a4c]"
                  />
                </div>
                <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                  {kurangItems.map((k) => (
                    <li
                      key={k.id}
                      className="flex flex-wrap items-center justify-between gap-1.5 min-[640px]:gap-3 text-sm"
                    >
                      <span>
                        <strong>{k.judul}</strong>{' '}
                        <span className="text-[#3f5247]">{k.alasan}</span>
                      </span>
                      {k.aksi && (
                        <Link
                          href={k.href}
                          className="inline-flex items-center min-h-[40px] px-3.5 rounded-xl bg-[#064e3b] text-white text-[13px] font-extrabold no-underline"
                        >
                          {k.aksi}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Grouped Settings Lists */}
            {groups.map((groupName) => {
              const groupItems = items.filter((d) => d.grup === groupName);
              if (groupItems.length === 0) return null;

              return (
                <section
                  key={groupName}
                  aria-label={groupName}
                  className="flex flex-col gap-2"
                >
                  <h2 className="text-sm font-extrabold text-[#3f5247] m-0">
                    {groupName}
                  </h2>
                  <ul className="list-none p-0 m-0 border border-[#dee3da] rounded-2xl bg-white overflow-hidden">
                    {groupItems.map((it, idx) => (
                      <li
                        key={it.id}
                        className={idx > 0 ? 'border-t border-[#dee3da]' : ''}
                      >
                        <Link
                          href={it.href}
                          className="flex items-center gap-3.5 min-h-[72px] p-3 px-4 text-[#173b2b] no-underline hover:bg-[#fcfbf6]"
                        >
                          <span
                            aria-hidden="true"
                            className="shrink-0 w-10 h-10 rounded-xl grid place-items-center bg-[#ebf2eb] text-[#064e3b]"
                          >
                            {renderIcon(it.ikon)}
                          </span>
                          <span className="flex-1 min-w-0">
                            <strong className="block text-[15px] font-extrabold">
                              {it.judul}
                            </strong>
                            <span className="block mt-0.5 text-[13px] leading-relaxed text-[#3f5247]">
                              {it.nilai}
                            </span>
                          </span>
                          {renderChipStatus(it.st)}
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
                            className="shrink-0"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="min-[900px]:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="lainnya" />
      </div>
    </div>
  );
}
