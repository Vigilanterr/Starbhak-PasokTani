'use client';

import React, { useState } from 'react';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { NavBawah } from '../layout/NavBawah';
import { AkunMenu } from '../layout/AkunMenu';
import { ChipStatus } from '../common/ChipStatus';
import type { StatusPasokTani, TipeStatus } from '../common/ChipStatus';

export type TipeTransaksiDompet = 'pengembalian' | 'ditahan' | 'dipakai';
export type TipeMutasiDompet = TipeTransaksiDompet;
export type StatusMutasiDompet = StatusPasokTani | 'berhasil' | 'diproses' | 'ditahan';
export type TabDompet = 'semua' | TipeTransaksiDompet;

export interface TransaksiDompetItem {
  id: string;
  jenis: TipeTransaksiDompet;
  judul: string;
  tanggal: string;
  rujukan: string;
  status: TipeStatus | string;
  labelChip?: string;
  nominal?: number;
  jumlah?: number;
  jumlahFormat?: string;
  warnaJumlah?: string;
  keterangan: string;
  href?: string;
}
export type MutasiDompetItem = TransaksiDompetItem;

export interface DompetProps {
  kosong?: boolean;
  saldo?: number;
  ketSaldo?: string;
  uangMukaDitahan?: number;
  ketDitahan?: string;
  daftarRiwayat?: TransaksiDompetItem[];
  daftarMutasi?: TransaksiDompetItem[];
  tabAwal?: TabDompet;
  onTarikSaldo?: (nominal: number) => Promise<void> | void;
  onIsiSaldo?: (nominal: number) => Promise<void> | void;
  className?: string;
}

export function formatRupiah(n: number): string {
  const nb = '\u00A0';
  return 'Rp' + nb + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function getDefaultTransactions(): TransaksiDompetItem[] {
  return [
    {
      id: 'tx_1',
      jenis: 'pengembalian',
      judul: 'Pengembalian pesanan',
      tanggal: 'Sen, 2 Nov',
      rujukan: 'PT-26102207',
      status: 'dikembalikan',
      labelChip: 'Ditolak petani',
      nominal: 63500,
      jumlahFormat: `+${formatRupiah(63500)}`,
      warnaJumlah: '#157a4c',
      keterangan: `Saldo ${formatRupiah(63500)}`,
      href: '/pesanan/PT-26102207',
    },
    {
      id: 'tx_2',
      jenis: 'dipakai',
      judul: 'Bayar pesanan dengan Dompet',
      tanggal: 'Min, 25 Okt',
      rujukan: 'PT-26102301',
      status: 'selesai',
      labelChip: 'Lunas',
      nominal: 120000,
      jumlahFormat: `−${formatRupiah(120000)}`,
      warnaJumlah: '#173b2b',
      keterangan: `Saldo ${formatRupiah(0)}`,
      href: '/pesanan/PT-26102301',
    },
    {
      id: 'tx_3',
      jenis: 'pengembalian',
      judul: 'Pengembalian pesanan',
      tanggal: 'Sab, 24 Okt',
      rujukan: 'PT-26101505',
      status: 'dikembalikan',
      labelChip: 'Dibatalkan sebelum diproses',
      nominal: 120000,
      jumlahFormat: `+${formatRupiah(120000)}`,
      warnaJumlah: '#157a4c',
      keterangan: `Saldo ${formatRupiah(120000)}`,
      href: '/pesanan/PT-26101505',
    },
    {
      id: 'tx_4',
      jenis: 'ditahan',
      judul: 'Uang muka Beras Pandan Wangi',
      tanggal: 'Kam, 22 Okt',
      rujukan: 'KM-26102204',
      status: 'dana-ditahan',
      labelChip: 'Ditahan, dibayar QRIS',
      nominal: 45000,
      jumlahFormat: formatRupiah(45000),
      warnaJumlah: '#3f5247',
      keterangan: 'Tidak mengurangi saldo',
      href: '/komitmen/KM-26102204',
    },
    {
      id: 'tx_5',
      jenis: 'ditahan',
      judul: 'Uang muka Bawang Merah Bima',
      tanggal: 'Sen, 19 Okt',
      rujukan: 'KM-26101908',
      status: 'dana-ditahan',
      labelChip: 'Ditahan, dibayar QRIS',
      nominal: 135000,
      jumlahFormat: formatRupiah(135000),
      warnaJumlah: '#3f5247',
      keterangan: 'Tidak mengurangi saldo',
      href: '/komitmen/KM-26101908',
    },
  ];
}

export function Dompet({
  kosong = false,
  saldo = 63500,
  ketSaldo: ketSaldoProp,
  uangMukaDitahan = 180000,
  ketDitahan: ketDitahanProp,
  daftarRiwayat,
  daftarMutasi,
  tabAwal = 'semua',
  className = '',
}: DompetProps) {
  const [tab, setTab] = useState<TabDompet>(tabAwal);

  const saldoNilai = kosong ? 0 : saldo;
  const ditahanNilai = kosong ? 0 : uangMukaDitahan;

  const saldoFormat = formatRupiah(saldoNilai);
  const ditahanFormat = formatRupiah(ditahanNilai);

  const ketSaldo =
    ketSaldoProp ??
    (kosong
      ? 'Belum ada saldo. Saldo datang dari pengembalian pesanan.'
      : `Dari pengembalian pesanan PT-26102207. Bisa menutup pesanan sampai total ${saldoFormat}.`);

  const ketDitahan =
    ketDitahanProp ??
    (kosong
      ? 'Tidak ada Komitmen aktif.'
      : `2 Komitmen aktif: bawang merah ${formatRupiah(135000)} dan beras ${formatRupiah(45000)}. Tidak termasuk saldo, kembali sesuai aturan Komitmen.`);

  const listSumber = kosong
    ? []
    : (daftarRiwayat ?? daftarMutasi ?? getDefaultTransactions());

  const countByJenis = (j: TabDompet) =>
    listSumber.filter((item) => j === 'semua' || item.jenis === j).length;

  const tabs: Array<{ id: TabDompet; label: string }> = [
    { id: 'semua', label: `Semua (${countByJenis('semua')})` },
    { id: 'pengembalian', label: `Pengembalian (${countByJenis('pengembalian')})` },
    { id: 'ditahan', label: `Uang muka ditahan (${countByJenis('ditahan')})` },
    { id: 'dipakai', label: `Dipakai (${countByJenis('dipakai')})` },
  ];

  const barisRiwayat = listSumber.filter(
    (item) => tab === 'semua' || item.jenis === tab
  );

  return (
    <div
      className={`relative min-h-screen bg-cream font-sans text-ink flex flex-col justify-between ${className}`}
    >
      <div>
        <SiteHeader active="beranda" signedIn={true} cartCount={5} />

        <main className="max-w-[1200px] mx-auto px-4 pt-2 md:px-6 md:pt-7 md:pb-16 box-border">
          <div className="flex flex-wrap items-start gap-6">
            {/* Desktop Left Sidebar */}
            <div className="hidden md:block w-[272px] shrink-0 min-w-0">
              <AkunMenu aktif="dompet" saldoDompet={saldoFormat} />
            </div>

            {/* Main Content Column */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* Mobile back link to Account */}
              <div className="block md:hidden">
                <a
                  href="/akun"
                  className="self-start inline-flex items-center gap-1 min-h-[44px] text-brand-600 text-sm font-bold no-underline"
                >
                  <svg
                    className="w-[18px] h-[18px]"
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
                  Akun
                </a>
              </div>

              <h1 className="m-0 text-[28px] md:text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
                Dompet
              </h1>

              {/* Balance Cards Row */}
              <div className="flex flex-wrap gap-3.5">
                {/* Spendable Balance Card */}
                <section
                  aria-labelledby="judul-saldo"
                  className="flex-1 min-w-[300px] p-5 rounded-2xl bg-brand-900 text-white flex flex-col gap-1.5"
                >
                  <h2
                    id="judul-saldo"
                    className="m-0 text-sm font-bold text-[#d5f6d5]"
                  >
                    Saldo bisa dipakai
                  </h2>
                  <p className="m-0 text-[34px] leading-[1.1] font-extrabold tracking-[-0.01em]">
                    {saldoFormat}
                  </p>
                  <p className="m-0 text-[13px] leading-[1.5] text-[#d5f6d5]">
                    {ketSaldo}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    <a
                      href="/keranjang"
                      className="inline-flex items-center min-h-[44px] px-4 rounded-xl bg-[#e9c75c] text-ink text-sm font-extrabold no-underline"
                    >
                      Pakai di keranjang
                    </a>
                    <a
                      href="/komitmen"
                      className="inline-flex items-center min-h-[44px] px-4 border-[1.5px] border-[#d5f6d5] rounded-xl text-white text-sm font-extrabold no-underline"
                    >
                      Lihat Komitmen
                    </a>
                  </div>
                </section>

                {/* Held Escrow Downpayment Card */}
                <section
                  aria-labelledby="judul-ditahan"
                  className="flex-1 min-w-[240px] p-5 border border-line rounded-2xl bg-white flex flex-col gap-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <h2
                      id="judul-ditahan"
                      className="m-0 text-sm font-bold text-[#3f5247]"
                    >
                      Uang muka ditahan
                    </h2>
                    <ChipStatus status="dana-ditahan" />
                  </div>
                  <p className="m-0 text-[26px] leading-[1.15] font-extrabold text-ink">
                    {ditahanFormat}
                  </p>
                  <p className="m-0 text-[13px] leading-[1.5] text-[#3f5247]">
                    {ketDitahan}
                  </p>
                </section>
              </div>

              {/* Explainer Box */}
              <section
                aria-labelledby="judul-aturan"
                className="p-4 sm:px-[18px] border border-line rounded-2xl bg-white"
              >
                <h2
                  id="judul-aturan"
                  className="m-0 mb-2 text-[15px] font-extrabold text-ink"
                >
                  Cara kerja Dompet
                </h2>
                <ul className="list-none m-0 p-0 flex flex-col gap-2 text-[13px] leading-[1.55] text-[#3f5247]">
                  <li>
                    <strong className="text-ink">Terisi dari pengembalian.</strong>{' '}
                    Pesanan yang ditolak petani atau dibatalkan dikembalikan penuh ke sini.
                  </li>
                  <li>
                    <strong className="text-ink">
                      Membayar kalau saldo menutup seluruh total.
                    </strong>{' '}
                    Kalau kurang, pakai QRIS atau transfer VA. Saldo tidak dipecah.
                  </li>
                  <li>
                    <strong className="text-ink">
                      Tidak ada isi saldo dan tarik tunai.
                    </strong>{' '}
                    Aturan izin uang elektronik masih perlu dicek.
                  </li>
                </ul>
              </section>

              {/* Transaction History Section */}
              <section
                aria-labelledby="judul-riwayat"
                className="flex flex-col gap-2.5"
              >
                <h2
                  id="judul-riwayat"
                  className="m-0 text-[17px] font-extrabold text-ink"
                >
                  Riwayat
                </h2>

                <div
                  role="group"
                  aria-label="Saring riwayat"
                  className="flex gap-2 overflow-x-auto pb-0.5"
                >
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={tab === t.id}
                      onClick={() => setTab(t.id)}
                      className={`shrink-0 min-h-[44px] px-3.5 rounded-full font-bold text-sm cursor-pointer ${
                        tab === t.id
                          ? 'border border-brand-900 bg-brand-900 text-white'
                          : 'border border-line bg-white text-ink'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Empty State */}
                {kosong && (
                  <div className="p-[22px] border-[1.5px] border-dashed border-[#a9cfae] rounded-2xl bg-white flex flex-col items-start gap-2">
                    <p className="m-0 text-base font-extrabold text-ink">
                      Belum ada riwayat
                    </p>
                    <p className="m-0 max-w-[56ch] text-sm leading-[1.55] text-[#3f5247]">
                      Saldo terisi sendiri kalau ada pengembalian pesanan. Uang muka Komitmen yang kamu bayar juga tercatat di sini.
                    </p>
                  </div>
                )}

                {!kosong && barisRiwayat.length === 0 && (
                  <p className="m-0 p-3.5 border-[1.5px] border-dashed border-[#c9d2c6] rounded-xl text-sm text-[#3f5247]">
                    Tidak ada catatan jenis ini.
                  </p>
                )}

                {/* History List Table */}
                {!kosong && barisRiwayat.length > 0 && (
                  <ul className="list-none m-0 p-0 border border-line rounded-2xl bg-white overflow-hidden">
                    {barisRiwayat.map((r, i) => {
                      const jumlahTeks =
                        r.jumlahFormat ??
                        (r.nominal !== undefined
                          ? r.jenis === 'pengembalian'
                            ? `+${formatRupiah(r.nominal)}`
                            : r.jenis === 'dipakai'
                            ? `−${formatRupiah(r.nominal)}`
                            : formatRupiah(r.nominal)
                          : '');
                      const warnaJumlah =
                        r.warnaJumlah ??
                        (r.jenis === 'pengembalian'
                          ? '#157a4c'
                          : r.jenis === 'dipakai'
                          ? '#173b2b'
                          : '#3f5247');
                      const hrefTarget = r.href ?? '#';

                      return (
                        <li
                          key={r.id}
                          className={i === 0 ? 'border-t-0' : 'border-t border-[#eef0eb]'}
                        >
                          <a
                            href={hrefTarget}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 p-3.5 sm:px-4 text-ink no-underline hover:bg-[#f6f8f4]"
                          >
                            <div className="flex-1 min-w-[220px]">
                              <p className="m-0 text-[15px] font-extrabold">{r.judul}</p>
                              <p className="m-0 mt-0.5 text-[13px] leading-[1.5] text-[#3f5247]">
                                {r.tanggal} · {r.rujukan}
                              </p>
                              <div className="mt-1.5">
                                <ChipStatus status={r.status} label={r.labelChip} />
                              </div>
                            </div>
                            <div className="shrink-0 ml-auto text-right">
                              <p
                                className="m-0 text-base font-extrabold"
                                style={{ color: warnaJumlah }}
                              >
                                {jumlahTeks}
                              </p>
                              <p className="m-0 mt-0.5 text-xs text-[#5a6b60]">
                                {r.keterangan}
                              </p>
                            </div>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="block md:hidden sticky bottom-0 z-5 mt-6">
        <NavBawah aktif="akun" />
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <SiteFooter />
      </div>
    </div>
  );
}
