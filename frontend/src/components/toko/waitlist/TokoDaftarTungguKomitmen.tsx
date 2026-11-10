'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { ChipStatus } from '../../common/ChipStatus';

export type TahapKomitmenPetani = 'isi' | 'kurang' | 'terkirim';

export interface KomitmenWaitlistItem {
  id: string;
  urut?: number;
  urutanAntrean?: number;
  namaPembeli: string;
  nama?: string;
  tipePembeli?: 'katering' | 'restoran' | 'warung' | 'individu' | string;
  sejak?: string;
  jumlahKomitmenMinKg?: number;
  min?: number;
  jumlahKomitmenMaksKg?: number;
  maks?: number;
  dpDibayar?: number;
  um?: number;
  alokasiFinalKg?: number;
  dapat?: number;
  nilai?: number;
  tagihan?: string;
  catatan?: string;
  statusLunas?: boolean;
  status?: 'menunggu-panen' | 'alokasi-siap' | 'dibayar-lunas' | 'dikirim' | string;
}

export interface TokoDaftarTungguKomitmenProps {
  komitmenList?: KomitmenWaitlistItem[];
  tahap?: string;
  tahapAwal?: TahapKomitmenPetani;
  namaTanaman?: string;
  hargaPerKg?: number;
  kuotaKg?: number;
  uangMukaDitahan?: number;
  totalHasilPanenKg?: number;
  onBagiAlokasi?: (alokasi: Record<string, number>) => void;
  onKirimPembagian?: (hasilKg: number, masukStok: boolean) => void;
  onSiapkanPesananLunas?: () => void;
  className?: string;
}

const DEFAULT_PEMEGANG_KOMITMEN: KomitmenWaitlistItem[] = [
  {
    id: 'km-1',
    urut: 1,
    urutanAntrean: 1,
    nama: 'Katering Sari Rasa',
    namaPembeli: 'Katering Sari Rasa',
    tipePembeli: 'katering',
    sejak: '18 Agu',
    min: 100,
    jumlahKomitmenMinKg: 100,
    maks: 140,
    jumlahKomitmenMaksKg: 140,
    dpDibayar: 378000,
    um: 378000,
    dapat: 140,
    tagihan: 'Rp 882.000',
    catatan: 'Kuota maksimal terpenuhi',
    statusLunas: true,
  },
  {
    id: 'km-2',
    urut: 2,
    urutanAntrean: 2,
    nama: 'Resto Sunda Laksana',
    namaPembeli: 'Resto Sunda Laksana',
    tipePembeli: 'restoran',
    sejak: '20 Agu',
    min: 80,
    jumlahKomitmenMinKg: 80,
    maks: 110,
    jumlahKomitmenMaksKg: 110,
    dpDibayar: 297000,
    um: 297000,
    dapat: 110,
    tagihan: 'Rp 693.000',
    catatan: 'Kuota maksimal terpenuhi',
    statusLunas: true,
  },
  {
    id: 'km-3',
    urut: 3,
    urutanAntrean: 3,
    nama: 'Warung Bu Enok',
    namaPembeli: 'Warung Bu Enok',
    tipePembeli: 'warung',
    sejak: '22 Agu',
    min: 50,
    jumlahKomitmenMinKg: 50,
    maks: 70,
    jumlahKomitmenMaksKg: 70,
    dpDibayar: 189000,
    um: 189000,
    dapat: 70,
    tagihan: 'Rp 441.000',
    catatan: 'Menunggu pelunasan',
    statusLunas: false,
  },
  {
    id: 'km-4',
    urut: 4,
    urutanAntrean: 4,
    nama: 'Dapur Bu Siti',
    namaPembeli: 'Dapur Bu Siti',
    tipePembeli: 'katering',
    sejak: '25 Agu',
    min: 30,
    jumlahKomitmenMinKg: 30,
    maks: 40,
    jumlahKomitmenMaksKg: 40,
    dpDibayar: 108000,
    um: 108000,
    dapat: 40,
    tagihan: 'Rp 252.000',
    catatan: 'Menunggu pelunasan',
    statusLunas: false,
  },
  {
    id: 'km-5',
    urut: 5,
    urutanAntrean: 5,
    nama: 'Hendra Gunawan',
    namaPembeli: 'Hendra Gunawan',
    tipePembeli: 'individu',
    sejak: '28 Agu',
    min: 20,
    jumlahKomitmenMinKg: 20,
    maks: 30,
    jumlahKomitmenMaksKg: 30,
    dpDibayar: 81000,
    um: 81000,
    dapat: 30,
    tagihan: 'Rp 189.000',
    catatan: 'Menunggu pelunasan',
    statusLunas: false,
  },
  {
    id: 'km-6',
    urut: 6,
    urutanAntrean: 6,
    nama: 'Rina Marlina',
    namaPembeli: 'Rina Marlina',
    tipePembeli: 'individu',
    sejak: '30 Agu',
    min: 20,
    jumlahKomitmenMinKg: 20,
    maks: 30,
    jumlahKomitmenMaksKg: 30,
    dpDibayar: 81000,
    um: 81000,
    dapat: 30,
    tagihan: 'Rp 189.000',
    catatan: 'Menunggu pelunasan',
    statusLunas: false,
  },
];

export function TokoDaftarTungguKomitmen({
  komitmenList = DEFAULT_PEMEGANG_KOMITMEN,
  tahap,
  tahapAwal = 'isi',
  namaTanaman = 'Wortel Lembang',
  hargaPerKg = 9000,
  kuotaKg = 400,
  uangMukaDitahan = 1134000,
  totalHasilPanenKg,
  onBagiAlokasi,
  onKirimPembagian,
  onSiapkanPesananLunas,
  className = '',
}: TokoDaftarTungguKomitmenProps) {
  const modalKirimId = useId();

  const [tahapKini, setTahapKini] = useState<TahapKomitmenPetani>(
    (tahap as TahapKomitmenPetani) ?? tahapAwal
  );
  const [hasilKgInput, setHasilKgInput] = useState<string>(
    String(totalHasilPanenKg ?? 480)
  );
  const [sudahDihitung, setSudahDihitung] = useState<boolean>(true);
  const [masukkanKeStok, setMasukkanKeStok] = useState<boolean>(true);
  const [bukaModalKirim, setBukaModalKirim] = useState<boolean>(false);
  const [pesanGalat, setPesanGalat] = useState<string>('');
  const [pesanSukses, setPesanSukses] = useState<string>('');

  const totalMin = komitmenList.reduce((acc, k) => acc + (k.min ?? k.jumlahKomitmenMinKg ?? 0), 0);
  const totalMaks = komitmenList.reduce((acc, k) => acc + (k.maks ?? k.jumlahKomitmenMaksKg ?? 0), 0);

  const hasilKg = parseInt(hasilKgInput.replace(/\D/g, ''), 10) || 0;
  const untukKomitmen = Math.min(hasilKg, totalMaks);
  const sisaKeStok = Math.max(0, hasilKg - untukKomitmen);
  const adaKurang = hasilKg < totalMin;

  const handleHitung = (e: React.FormEvent) => {
    e.preventDefault();
    setPesanGalat('');

    if (hasilKg <= 0 || hasilKg > 10000) {
      setPesanGalat('Masukkan jumlah hasil panen yang valid antara 1 hingga 10.000 kg.');
      return;
    }

    setSudahDihitung(true);
    const alokasiMap: Record<string, number> = {};
    let sisaAlokasi = hasilKg;

    for (const k of komitmenList) {
      const maxK = k.maks ?? k.jumlahKomitmenMaksKg ?? 0;
      const jatah = Math.min(sisaAlokasi, maxK);
      alokasiMap[k.id] = jatah;
      sisaAlokasi = Math.max(0, sisaAlokasi - jatah);
    }

    onBagiAlokasi?.(alokasiMap);
  };

  const handleKonfirmasiKirim = () => {
    setBukaModalKirim(false);
    setTahapKini('terkirim');
    setPesanSukses(
      `Pembagian ${hasilKg} kg ${namaTanaman} berhasil dikirim ke ${komitmenList.length} pembeli. Menunggu pelunasan 48 jam.`
    );
    onKirimPembagian?.(hasilKg, masukkanKeStok);
  };

  const lunasCount = komitmenList.filter((k) => k.statusLunas).length;
  const lunasPct = Math.round((lunasCount / komitmenList.length) * 100);

  return (
    <div className={`relative min-h-screen bg-[#fcfbf6] font-['Plus_Jakarta_Sans',sans-serif] text-[#173b2b] ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-none w-[272px] p-5 pr-0 pb-6">
          <TokoSamping aktif="prapanen" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-5 md:py-5 md:px-6 md:pb-12">
          <div className="max-w-[1040px] flex flex-col gap-4">
            {/* Back link */}
            <Link
              href="/toko/daftar-tunggu"
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-sm font-bold text-[#157a4c] hover:underline"
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
              <span>Daftar Tunggu</span>
            </Link>

            {/* Title & Stats */}
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
                <h1 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#173b2b]">
                  Panen {namaTanaman} dan Komitmen
                </h1>
                <ChipStatus status="siap" />
              </div>
              <p className="mt-1.5 mb-0 text-xs sm:text-sm text-[#3f5247]">
                {komitmenList.length} pemegang Komitmen, {totalMin} sampai {totalMaks} kg dari kuota{' '}
                {kuotaKg} kg. Harga Rp {hargaPerKg.toLocaleString('id-ID')}/kg. Uang muka ditahan Rp{' '}
                {uangMukaDitahan.toLocaleString('id-ID')}.
              </p>
            </div>

            {/* Notification messages */}
            {pesanSukses && (
              <p aria-live="polite" className="m-0 p-3.5 px-4 rounded-xl border border-[#157a4c] bg-[#f3faf3] text-sm text-[#064e3b] font-bold">
                {pesanSukses}
              </p>
            )}

            {pesanGalat && (
              <p role="alert" className="m-0 p-3.5 px-4 rounded-xl border border-[#b42318] bg-[#fdecea] text-sm text-[#8a1c12] font-bold">
                {pesanGalat}
              </p>
            )}

            {/* PHASE 1: INPUT HASIL & PERIKSA PEMBAGIAN */}
            {tahapKini !== 'terkirim' ? (
              <div className="flex flex-col gap-4">
                {/* Step 1: Isi Hasil Panen */}
                <form
                  onSubmit={handleHitung}
                  aria-labelledby="judul-hasil-panen"
                  className="p-4 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3.5"
                >
                  <div>
                    <h2 id="judul-hasil-panen" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                      1. Isi hasil panen
                    </h2>
                    <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                      Timbang setelah disortir. Yang dihitung hanya hasil yang layak jual.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[200px] max-w-[280px] flex flex-col gap-1">
                      <label htmlFor="ak-hasil" className="text-xs font-bold text-[#173b2b]">
                        Hasil layak jual <span className="text-[#b42318]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="ak-hasil"
                          type="text"
                          inputMode="numeric"
                          value={hasilKgInput}
                          onChange={(e) => setHasilKgInput(e.target.value)}
                          className="w-full h-14 pl-3.5 pr-11 rounded-xl border border-[#dee3da] bg-white text-[22px] font-extrabold text-[#173b2b] focus:outline-[#157a4c]"
                        />
                        <span className="absolute right-3.5 top-4 text-base font-bold text-[#5a6b60]">
                          kg
                        </span>
                      </div>
                    </div>
                    <p className="m-0 mb-3 text-xs sm:text-sm text-[#3f5247]">
                      Dipanen hari ini, Min 8 Nov 2026
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="self-start min-h-[44px] px-5 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold cursor-pointer hover:bg-[#f6f8f4]"
                  >
                    Hitung pembagian
                  </button>
                </form>

                {/* Step 2: Periksa Pembagian */}
                {sudahDihitung && (
                  <section
                    aria-labelledby="judul-bagi"
                    className="p-4 sm:p-5 rounded-2xl border-2 border-[#064e3b] bg-white flex flex-col gap-4"
                  >
                    <div>
                      <h2 id="judul-bagi" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                        2. Periksa pembagian hasil panen
                      </h2>
                      <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                        Sistem membagi hasil panen sesuai urutan waktu masuknya Komitmen.
                      </p>
                    </div>

                    {/* Breakdown Metric Summary */}
                    <dl className="m-0 grid grid-cols-3 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-[#f6f8f4]">
                        <dt className="text-[#3f5247]">Hasil panen</dt>
                        <dd className="m-0 mt-0.5 text-base sm:text-lg font-extrabold text-[#173b2b]">
                          {hasilKg} kg
                        </dd>
                      </div>
                      <div className="p-3 rounded-xl bg-[#f6f8f4]">
                        <dt className="text-[#3f5247]">Untuk Komitmen</dt>
                        <dd className="m-0 mt-0.5 text-base sm:text-lg font-extrabold text-[#157a4c]">
                          {untukKomitmen} kg
                        </dd>
                      </div>
                      <div className="p-3 rounded-xl bg-[#f6f8f4]">
                        <dt className="text-[#3f5247]">Sisa untuk umum</dt>
                        <dd className="m-0 mt-0.5 text-base sm:text-lg font-extrabold text-[#5c4500]">
                          {sisaKeStok} kg
                        </dd>
                      </div>
                    </dl>

                    {/* Tri-Color Quota Bar */}
                    <div>
                      <div
                        aria-hidden="true"
                        className="flex h-3 rounded-full overflow-hidden bg-[#ebf2eb]"
                      >
                        {/* Solid Gold: Min commitment */}
                        <span
                          className="bg-[#c2a032]"
                          style={{ width: `${Math.min(100, (totalMin / (hasilKg || 1)) * 100)}%` }}
                        />
                        {/* Striped Gold: Additional commitment */}
                        <span
                          className="bg-[repeating-linear-gradient(135deg,#e9d79a_0_4px,#f4e9c4_4px_8px)]"
                          style={{
                            width: `${Math.min(
                              100,
                              ((untukKomitmen - totalMin) / (hasilKg || 1)) * 100
                            )}%`,
                          }}
                        />
                        {/* Solid Green: Public store surplus */}
                        <span
                          className="bg-[#157a4c]"
                          style={{ width: `${Math.min(100, (sisaKeStok / (hasilKg || 1)) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-1.5 mb-0 text-[11px] text-[#5a6b60]">
                        Emas: jumlah paling sedikit. Arsir: tambahan. Hijau: sisa untuk etalase umum.
                      </p>
                    </div>

                    {/* Deficit Alert if any */}
                    {adaKurang && (
                      <div className="p-3.5 px-4 rounded-xl bg-[#fef3c7] text-[#92400e] text-xs leading-relaxed border border-[#fde68a]">
                        <strong>Hasil kurang dari jumlah minimal komitmen ({totalMin} kg).</strong>{' '}
                        Pembeli yang mendapat alokasi di bawah minimal berhak memilih menerima jumlah yang
                        ada atau membatalkan tanpa penalti (uang muka dikembalikan penuh).
                      </div>
                    )}

                    {/* Allocation Table */}
                    <div
                      role="table"
                      aria-label="Pembagian per pembeli"
                      className="border border-[#dee3da] rounded-xl overflow-hidden flex flex-col"
                    >
                      {/* Table Header */}
                      <div
                        role="row"
                        className="grid grid-cols-[56px_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.4fr)] gap-2.5 p-2.5 px-3.5 bg-[#f6f8f4] text-xs font-bold text-[#3f5247]"
                      >
                        <span role="columnheader">Urutan</span>
                        <span role="columnheader">Pembeli</span>
                        <span role="columnheader">Komitmen</span>
                        <span role="columnheader">Dapat</span>
                        <span role="columnheader">Tagihan atau kembali</span>
                      </div>

                      {/* Table Rows */}
                      {komitmenList.map((b, idx) => (
                        <div
                          key={b.id}
                          role="row"
                          className="grid grid-cols-[56px_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.4fr)] gap-2.5 p-3 px-3.5 border-t border-[#eef0eb] bg-white text-xs sm:text-sm items-center"
                        >
                          <span role="cell" className="font-extrabold text-[#173b2b]">
                            {b.urut ?? idx + 1}
                          </span>
                          <span role="cell">
                            <strong className="block text-[#173b2b]">{b.nama ?? b.namaPembeli}</strong>
                            <span className="text-[11px] text-[#5a6b60]">Sejak {b.sejak ?? 'Agu'}</span>
                          </span>
                          <span role="cell" className="text-[#3f5247]">
                            {b.min ?? b.jumlahKomitmenMinKg}–{b.maks ?? b.jumlahKomitmenMaksKg} kg
                          </span>
                          <span role="cell" className="font-extrabold text-[#157a4c]">
                            {b.dapat ?? b.maks ?? 0} kg
                          </span>
                          <span role="cell">
                            <strong className="block text-[#173b2b]">{b.tagihan ?? 'Rp 0'}</strong>
                            <span className="text-[11px] text-[#5a6b60]">
                              (UM Rp {(b.um ?? b.dpDibayar ?? 0).toLocaleString('id-ID')})
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Excess to Store Checkbox */}
                    <label className="flex items-start gap-3 p-3 rounded-xl bg-[#f6f8f4] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={masukkanKeStok}
                        onChange={(e) => setMasukkanKeStok(e.target.checked)}
                        className="w-5 h-5 mt-0.5 accent-[#064e3b] cursor-pointer"
                      />
                      <span className="flex flex-col">
                        <strong className="text-xs sm:text-sm font-bold text-[#173b2b]">
                          Masukkan sisa {sisaKeStok} kg ke stok {namaTanaman}
                        </strong>
                        <span className="text-[11px] text-[#5a6b60]">
                          Batch panen hari ini, dijual harga reguler Rp 11.000/kg di etalase tokomu.
                        </span>
                      </span>
                    </label>

                    {/* Trigger Confirmation Modal */}
                    <button
                      type="button"
                      onClick={() => setBukaModalKirim(true)}
                      className="min-h-[50px] px-6 rounded-xl bg-[#064e3b] text-white text-sm sm:text-base font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                    >
                      Kirim pembagian ke {komitmenList.length} pembeli
                    </button>
                  </section>
                )}
              </div>
            ) : (
              /* PHASE 2: PAYMENT COMPLIANCE (TERKIRIM) */
              <section
                aria-labelledby="judul-terkirim"
                className="p-4 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-4"
              >
                <div>
                  <h2 id="judul-terkirim" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Menunggu pelunasan pembeli
                  </h2>
                  <p className="mt-0.5 mb-0 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                    Batas waktu 48 jam (Sel, 10 Nov, 15.00). {lunasCount} dari {komitmenList.length}{' '}
                    pembeli sudah melunasi. Yang sudah lunas dapat langsung disiapkan untuk pengiriman.
                  </p>
                </div>

                {/* Progress Bar of Settlement */}
                <div aria-hidden="true" className="h-2.5 rounded-full bg-[#ebf2eb] overflow-hidden">
                  <div
                    className="h-full bg-[#157a4c]"
                    style={{ width: `${lunasPct}%` }}
                  />
                </div>

                {/* Settlement Table / List */}
                <ul className="list-none m-0 p-0 divide-y divide-[#eef0eb]">
                  {komitmenList.map((p, idx) => (
                    <li
                      key={p.id}
                      className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm"
                    >
                      <div className="flex flex-col">
                        <strong className="text-sm font-extrabold text-[#173b2b]">
                          {p.urut ?? idx + 1}. {p.nama ?? p.namaPembeli}
                        </strong>
                        <span className="text-xs text-[#3f5247]">
                          Alokasi: {p.dapat ?? 0} kg · Tagihan pelunasan: {p.tagihan ?? 'Rp 0'}
                        </span>
                      </div>

                      <ChipStatus
                        status={p.statusLunas ? 'dana-ditahan' : 'menunggu-bayar'}
                        label={p.statusLunas ? 'Lunas (Dana ditahan)' : 'Menunggu pembayaran'}
                        ukuran="kecil"
                      />
                    </li>
                  ))}
                </ul>

                <p className="m-0 text-xs text-[#5a6b60] leading-relaxed">
                  Ketentuan: Pembeli yang tidak melunasi dalam 48 jam dianggap batal, dan 20% uang muka
                  akan diteruskan ke petani sebagai kompensasi panen.
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Link
                    href="/toko/pesanan"
                    onClick={() => onSiapkanPesananLunas?.()}
                    className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold hover:bg-[#053d2e]"
                  >
                    Siapkan pesanan yang lunas
                  </Link>
                  <button
                    type="button"
                    onClick={() => setTahapKini('isi')}
                    className="min-h-[46px] px-4.5 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#f6f8f4]"
                  >
                    Koreksi pembagian
                  </button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <div className="block lg:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="prapanen" />
      </div>

      {/* Confirmation Modal */}
      {bukaModalKirim && (
        <div className="fixed inset-0 z-50 bg-[#173b2b]/50 flex justify-center items-start pt-20 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalKirimId}
            className="w-full max-w-[460px] p-5.5 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5"
          >
            <h2 id={modalKirimId} className="m-0 text-lg font-extrabold text-[#173b2b]">
              Kirim pembagian {hasilKg} kg {namaTanaman}?
            </h2>

            <p className="m-0 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
              Tagihan pelunasan akan otomatis dikirimkan ke {komitmenList.length} pembeli dengan batas
              waktu 48 jam. Sisa {sisaKeStok} kg akan langsung masuk ke stok etalase toko.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleKonfirmasiKirim}
                className="min-h-[46px] border-0 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#053d2e]"
              >
                Ya, kirim tagihan pelunasan
              </button>
              <button
                type="button"
                onClick={() => setBukaModalKirim(false)}
                className="min-h-[46px] border border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#f6f8f4]"
              >
                Periksa lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
