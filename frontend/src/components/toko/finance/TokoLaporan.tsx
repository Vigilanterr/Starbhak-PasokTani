'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { Grafik, DataGrafikItem } from '../../common/Grafik';

export type PeriodeLaporan = 'minggu' | 'bulan' | 'okt' | 'pilih';
export type FormatCsv = 'excel' | 'standar';

export interface LaporanKeuanganItem {
  id: string;
  tanggal: string;
  noPesanan: string;
  namaPembeli: string;
  produk: string;
  jumlahKg: number;
  kotor: number;
  potonganPlatform: number;
  ongkir: number;
  bersih: number;
}

export interface DataLaporanRingkasan {
  judul: string;
  ket: string;
  kotor: number;
  lalu: number;
  labelLalu: string;
  pesanan: number;
  batal: number;
  batalNilai: number;
  tarik: number;
  file: string;
  produk: [string, number][];
  baris: [string, string, string, string, number, string][];
}

export interface TokoLaporanProps {
  laporanList?: LaporanKeuanganItem[];
  periodeAwal?: PeriodeLaporan;
  periodeBulan?: string;
  dataLaporan?: Record<string, DataLaporanRingkasan>;
  omzetTahunBerjalan?: number;
  onUnduhCsv?: () => void;
  onUnduhPdf?: () => void;
  hrefKeuangan?: string;
  className?: string;
}

const DEFAULT_LAPORAN_LIST: LaporanKeuanganItem[] = [
  { id: '1', tanggal: '2026-10-31', noPesanan: 'PT-26103118', namaPembeli: 'Warung Dewi', produk: 'Tomat Merah Lembang 15 kg', jumlahKg: 15, kotor: 180000, potonganPlatform: 5400, ongkir: 12000, bersih: 174600 },
  { id: '2', tanggal: '2026-10-30', noPesanan: 'PT-26103004', namaPembeli: 'Katering Ibu Siti', produk: 'Kol Bulat Lembang 20 kg', jumlahKg: 20, kotor: 160000, potonganPlatform: 4800, ongkir: 15000, bersih: 155200 },
  { id: '3', tanggal: '2026-10-29', noPesanan: 'PT-26102911', namaPembeli: 'Asep Saepudin', produk: 'Wortel Brastagi 10 kg', jumlahKg: 10, kotor: 110000, potonganPlatform: 3300, ongkir: 10000, bersih: 106700 },
];

const DEFAULT_RINGKASAN_OKT: DataLaporanRingkasan = {
  judul: 'Oktober 2026',
  ket: '1 sampai 31 Okt 2026',
  kotor: 4862000,
  lalu: 3950000,
  labelLalu: 'Naik 23% dari September',
  pesanan: 41,
  batal: 2,
  batalNilai: 96000,
  tarik: 1850000,
  file: 'okt-2026',
  produk: [
    ['Tomat Merah Lembang', 1980000],
    ['Kol Bulat Lembang', 1420000],
    ['Wortel Brastagi', 860000],
    ['Brokoli Hijau', 342000],
    ['Selada Keriting', 160000],
    ['Bawang Daun', 100000],
  ],
  baris: [
    ['2026-10-31', 'PT-26103118', 'Warung Dewi', 'Tomat Merah Lembang 15 kg', 180000, 'Selesai'],
    ['2026-10-30', 'PT-26103004', 'Katering Ibu Siti', 'Kol Bulat Lembang 20 kg', 160000, 'Selesai'],
    ['2026-10-29', 'PT-26102911', 'Asep Saepudin', 'Wortel Brastagi 10 kg', 110000, 'Selesai'],
  ],
};

function formatRupiah(val: number): string {
  return 'Rp ' + Math.round(val).toLocaleString('id-ID');
}

export function TokoLaporan({
  laporanList = DEFAULT_LAPORAN_LIST,
  periodeAwal = 'okt',
  periodeBulan,
  dataLaporan,
  omzetTahunBerjalan = 38420000,
  onUnduhCsv,
  onUnduhPdf,
  hrefKeuangan = '/toko/keuangan',
  className = '',
}: TokoLaporanProps) {
  const [periode, setPeriode] = useState<PeriodeLaporan>(
    (periodeBulan as PeriodeLaporan) || periodeAwal
  );
  const [format, setFormat] = useState<FormatCsv>('excel');
  const [tglDari, setTglDari] = useState<string>('2026-10-01');
  const [tglSampai, setTglSampai] = useState<string>('2026-10-31');
  const [galatTanggal, setGalatTanggal] = useState<string>('');
  const [pesanUnduh, setPesanUnduh] = useState<string>('');

  const activeRingkasan: DataLaporanRingkasan =
    dataLaporan?.[periode] ?? DEFAULT_RINGKASAN_OKT;

  const kotor = activeRingkasan.kotor;
  const komisi = Math.round(kotor * 0.03);
  const diterima = kotor - komisi;

  const chartData: DataGrafikItem[] = activeRingkasan.produk.map(([label, nilai]) => ({
    label,
    nilai,
    teks: formatRupiah(nilai),
  }));

  const handleValidasiTanggal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tglDari || !tglSampai) {
      setGalatTanggal('Isi tanggal mulai dan tanggal akhir.');
      return;
    }
    if (tglSampai < tglDari) {
      setGalatTanggal('Tanggal akhir harus sama atau setelah tanggal mulai.');
      return;
    }
    if (tglSampai > '2026-11-08') {
      setGalatTanggal('Tanggal akhir tidak boleh setelah hari ini.');
      return;
    }
    const selisihHari = (Date.parse(tglSampai) - Date.parse(tglDari)) / 86400000;
    if (selisihHari > 366) {
      setGalatTanggal('Maksimal satu tahun per laporan.');
      return;
    }
    setGalatTanggal('');
    setPesanUnduh(`Menampilkan laporan dari ${tglDari} sampai ${tglSampai}`);
  };

  const handleDownloadCsv = () => {
    if (onUnduhCsv) {
      onUnduhCsv();
    }
    const sep = format === 'excel' ? ';' : ',';
    const filename = `pasoktani-kebun-mang-ujang-${activeRingkasan.file}.csv`;
    setPesanUnduh(`File ${filename} diunduh (pemisah: "${sep}").`);
  };

  const separator = format === 'excel' ? ';' : ',';
  const contohBaris = activeRingkasan.baris.slice(0, 3);
  const barisPertama = contohBaris[0];
  const barisMentah = barisPertama
    ? [
        barisPertama[0],
        barisPertama[1],
        barisPertama[2],
        barisPertama[3],
        barisPertama[4],
        Math.round(barisPertama[4] * 0.03),
        Math.round(barisPertama[4] * 0.97),
        barisPertama[5],
      ].join(separator)
    : '';

  return (
    <div className={`min-h-full bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />
      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden min-[900px]:block w-[272px] shrink-0 p-5 pt-5 pb-6 pl-5">
          <TokoSamping aktif="keuangan" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 min-[900px]:px-6 min-[900px]:py-5 min-[900px]:pb-12">
          <div className="max-w-[1080px] flex flex-col gap-4">
            {/* Back link */}
            <Link
              href={hrefKeuangan}
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-[#157a4c] text-sm font-bold no-underline"
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
              Keuangan
            </Link>

            <h1 className="text-2xl min-[900px]:text-[28px] font-extrabold tracking-tight leading-tight m-0">
              Laporan
            </h1>

            {/* Period Filters */}
            <div role="group" aria-label="Periode" className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={periode === 'minggu'}
                onClick={() => setPeriode('minggu')}
                className={`min-h-[44px] px-3.5 rounded-full font-sans text-sm font-extrabold cursor-pointer ${
                  periode === 'minggu'
                    ? 'border-[1.5px] border-[#064e3b] bg-[#064e3b] text-white'
                    : 'border border-[#dee3da] bg-white text-[#173b2b]'
                }`}
              >
                Minggu ini
              </button>
              <button
                type="button"
                aria-pressed={periode === 'bulan'}
                onClick={() => setPeriode('bulan')}
                className={`min-h-[44px] px-3.5 rounded-full font-sans text-sm font-extrabold cursor-pointer ${
                  periode === 'bulan'
                    ? 'border-[1.5px] border-[#064e3b] bg-[#064e3b] text-white'
                    : 'border border-[#dee3da] bg-white text-[#173b2b]'
                }`}
              >
                Bulan ini
              </button>
              <button
                type="button"
                aria-pressed={periode === 'okt'}
                onClick={() => setPeriode('okt')}
                className={`min-h-[44px] px-3.5 rounded-full font-sans text-sm font-extrabold cursor-pointer ${
                  periode === 'okt'
                    ? 'border-[1.5px] border-[#064e3b] bg-[#064e3b] text-white'
                    : 'border border-[#dee3da] bg-white text-[#173b2b]'
                }`}
              >
                Oktober 2026
              </button>
              <button
                type="button"
                aria-pressed={periode === 'pilih'}
                onClick={() => setPeriode('pilih')}
                className={`min-h-[44px] px-3.5 rounded-full font-sans text-sm font-extrabold cursor-pointer ${
                  periode === 'pilih'
                    ? 'border-[1.5px] border-[#064e3b] bg-[#064e3b] text-white'
                    : 'border border-[#dee3da] bg-white text-[#173b2b]'
                }`}
              >
                Pilih tanggal
              </button>
            </div>

            {/* Custom Date Form (when pilih active) */}
            {periode === 'pilih' && (
              <form
                onSubmit={handleValidasiTanggal}
                className="p-3.5 border border-[#dee3da] rounded-2xl bg-white flex flex-wrap items-end gap-2.5 m-0"
              >
                <div className="flex-1 basis-[160px] flex flex-col gap-1">
                  <label htmlFor="lp-dari" className="text-[13px] font-bold text-[#173b2b]">
                    Dari
                  </label>
                  <input
                    id="lp-dari"
                    type="date"
                    max="2026-11-08"
                    value={tglDari}
                    onChange={(e) => setTglDari(e.target.value)}
                    className="h-12 px-3 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[15px] outline-none"
                  />
                </div>
                <div className="flex-1 basis-[160px] flex flex-col gap-1">
                  <label htmlFor="lp-sampai" className="text-[13px] font-bold text-[#173b2b]">
                    Sampai
                  </label>
                  <input
                    id="lp-sampai"
                    type="date"
                    max="2026-11-08"
                    value={tglSampai}
                    onChange={(e) => setTglSampai(e.target.value)}
                    className="h-12 px-3 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[15px] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[48px] px-4.5 rounded-xl bg-[#064e3b] text-white font-extrabold text-[15px] cursor-pointer border-0"
                >
                  Tampilkan
                </button>
                {galatTanggal && (
                  <p role="alert" className="basis-full m-0 text-[13px] font-bold text-[#b42318]">
                    {galatTanggal}
                  </p>
                )}
              </form>
            )}

            {/* Summary Metrics Section */}
            <section
              aria-labelledby="judul-rekap"
              className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3.5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h2 id="judul-rekap" className="text-lg font-extrabold m-0">
                  {activeRingkasan.judul}
                </h2>
                <span className="text-[13px] text-[#5a6b60]">{activeRingkasan.ket}</span>
              </div>

              <dl className="grid grid-cols-2 min-[640px]:grid-cols-3 min-[900px]:grid-cols-6 gap-3.5 min-[900px]:gap-5 m-0">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] font-bold text-[#3f5247]">Penjualan kotor</dt>
                  <dd className="m-0 text-lg min-[900px]:text-xl font-extrabold text-[#173b2b] whitespace-nowrap">
                    {formatRupiah(kotor)}
                  </dd>
                  <dd className="m-0 text-xs text-[#5a6b60]">{activeRingkasan.labelLalu}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] font-bold text-[#3f5247]">Komisi Pasok Tani 3%</dt>
                  <dd className="m-0 text-lg min-[900px]:text-xl font-extrabold text-[#9a3412] whitespace-nowrap">
                    −{formatRupiah(komisi)}
                  </dd>
                  <dd className="m-0 text-xs text-[#5a6b60]">Dipotong per pesanan</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] font-bold text-[#3f5247]">Kamu terima</dt>
                  <dd className="m-0 text-lg min-[900px]:text-xl font-extrabold text-[#064e3b] whitespace-nowrap">
                    {formatRupiah(diterima)}
                  </dd>
                  <dd className="m-0 text-xs text-[#5a6b60]">
                    Nilai barang dikurangi komisi
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] font-bold text-[#3f5247]">Pesanan</dt>
                  <dd className="m-0 text-lg min-[900px]:text-xl font-extrabold text-[#173b2b]">
                    {activeRingkasan.pesanan}
                  </dd>
                  <dd className="m-0 text-xs text-[#5a6b60]">Semua pesanan yang dibayar</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] font-bold text-[#3f5247]">Dibatalkan</dt>
                  <dd className="m-0 text-lg min-[900px]:text-xl font-extrabold text-[#b42318]">
                    {activeRingkasan.batal}
                  </dd>
                  <dd className="m-0 text-xs text-[#5a6b60]">
                    {formatRupiah(activeRingkasan.batalNilai)} dikembalikan
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] font-bold text-[#3f5247]">Ditarik ke rekening</dt>
                  <dd className="m-0 text-lg min-[900px]:text-xl font-extrabold text-[#173b2b] whitespace-nowrap">
                    {formatRupiah(activeRingkasan.tarik)}
                  </dd>
                  <dd className="m-0 text-xs text-[#5a6b60]">Ke BRI ••••3021</dd>
                </div>
              </dl>
            </section>

            {/* Sales per produce */}
            <section
              aria-labelledby="judul-penjualan-produk"
              className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
            >
              <h2 id="judul-penjualan-produk" className="text-[17px] font-extrabold m-0">
                Penjualan per produk
              </h2>
              <Grafik
                judul="Nilai penjualan per produk (Rp)"
                data={chartData}
                satuan=""
              />
            </section>

            {/* CSV Download Section */}
            <section
              aria-labelledby="judul-unduh-csv"
              className="p-[18px] border-[1.5px] border-[#064e3b] rounded-2xl bg-white flex flex-col gap-3.5"
            >
              <div>
                <h2 id="judul-unduh-csv" className="text-[17px] font-extrabold m-0">
                  Unduh CSV
                </h2>
                <p className="mt-1 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
                  Satu baris per pesanan, {laporanList.length || activeRingkasan.baris.length} baris. Angka tanpa titik ribuan, tanggal ditulis tahun-bulan-tanggal, supaya bisa langsung dihitung.
                </p>
              </div>

              {/* Radio Format */}
              <fieldset className="border-0 p-0 m-0">
                <legend className="p-0 mb-2 text-sm font-bold text-[#173b2b]">
                  Mau dibuka di mana?
                </legend>
                <div className="flex flex-col gap-2">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                      format === 'excel'
                        ? 'border-[#064e3b] bg-[#f6f8f4]'
                        : 'border-[#dee3da] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format-csv"
                      checked={format === 'excel'}
                      onChange={() => setFormat('excel')}
                      className="w-5 h-5 mt-0.5 accent-[#064e3b] shrink-0"
                    />
                    <span className="text-sm leading-normal">
                      <strong>Excel di komputer berbahasa Indonesia</strong>
                      <span className="block text-[13px] text-[#3f5247]">
                        Pemisah titik-koma (;), angka desimal memakai koma. Kolom langsung rapi.
                      </span>
                    </span>
                  </label>
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                      format === 'standar'
                        ? 'border-[#064e3b] bg-[#f6f8f4]'
                        : 'border-[#dee3da] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format-csv"
                      checked={format === 'standar'}
                      onChange={() => setFormat('standar')}
                      className="w-5 h-5 mt-0.5 accent-[#064e3b] shrink-0"
                    />
                    <span className="text-sm leading-normal">
                      <strong>Google Sheets atau aplikasi akuntansi</strong>
                      <span className="block text-[13px] text-[#3f5247]">
                        Pemisah koma (,), standar internasional.
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>

              {/* Top 3 sample rows */}
              <div className="flex flex-col gap-1.5">
                <p className="m-0 text-[13px] font-bold text-[#3f5247]">
                  Contoh 3 baris teratas
                </p>
                <div className="overflow-x-auto border border-[#eef0eb] rounded-xl">
                  <div role="table" aria-label="Contoh isi CSV" className="min-w-[760px] text-[13px]">
                    <div
                      role="row"
                      className="grid grid-cols-[96px_110px_1.2fr_1.4fr_90px_70px_90px_1fr] gap-x-2.5 p-2 px-3 bg-[#f6f8f4] font-extrabold text-[#3f5247]"
                    >
                      <div role="columnheader">tanggal</div>
                      <div role="columnheader">nomor_pesanan</div>
                      <div role="columnheader">pembeli</div>
                      <div role="columnheader">produk</div>
                      <div role="columnheader">nilai_barang</div>
                      <div role="columnheader">komisi</div>
                      <div role="columnheader">diterima</div>
                      <div role="columnheader">status</div>
                    </div>
                    {contohBaris.map((c, i) => (
                      <div
                        key={i}
                        role="row"
                        className={`grid grid-cols-[96px_110px_1.2fr_1.4fr_90px_70px_90px_1fr] gap-x-2.5 p-2 px-3 ${
                          i > 0 ? 'border-t border-[#eef0eb]' : ''
                        }`}
                      >
                        <div role="cell">{c[0]}</div>
                        <div role="cell">{c[1]}</div>
                        <div role="cell">{c[2]}</div>
                        <div role="cell">{c[3]}</div>
                        <div role="cell">{c[4]}</div>
                        <div role="cell">{Math.round(c[4] * 0.03)}</div>
                        <div role="cell">{Math.round(c[4] * 0.97)}</div>
                        <div role="cell">{c[5]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {barisMentah && (
                  <p className="m-0 text-xs leading-relaxed text-[#3f5247] break-all">
                    Baris kedua di file: {barisMentah}
                  </p>
                )}
              </div>

              {/* Download Action Row */}
              <div className="flex flex-wrap items-center gap-2.5 min-[640px]:gap-3.5">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-2 min-h-[52px] px-5 rounded-xl bg-[#064e3b] text-white font-extrabold text-base border-0 cursor-pointer"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 15V3" />
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="m7 10 5 5 5-5" />
                  </svg>
                  Unduh CSV
                </button>
                {onUnduhPdf && (
                  <button
                    type="button"
                    onClick={onUnduhPdf}
                    className="inline-flex items-center gap-2 min-h-[52px] px-5 rounded-xl border-[1.5px] border-[#dee3da] bg-white text-[#173b2b] font-extrabold text-base cursor-pointer"
                  >
                    Unduh PDF
                  </button>
                )}
                <span className="text-[13px] text-[#3f5247] break-all">
                  pasoktani-kebun-mang-ujang-{activeRingkasan.file}.csv
                </span>
              </div>

              {pesanUnduh && (
                <p aria-live="polite" className="m-0 text-sm font-bold text-[#157a4c]">
                  {pesanUnduh}
                </p>
              )}
            </section>

            {/* Tax Info Card */}
            <section
              aria-labelledby="judul-pajak-info"
              className="p-4 min-[900px]:px-[18px] rounded-2xl bg-[#f6f8f4] flex flex-col gap-1.5"
            >
              <h2
                id="judul-pajak-info"
                className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold m-0"
              >
                Untuk lapor pajak{' '}
                <span className="px-1.5 py-0.5 border border-dashed border-[#c2a032] rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
                  [Cek pajak]
                </span>
              </h2>
              <p className="m-0 text-[13px] leading-relaxed text-[#3f5247]">
                Pasok Tani belum memotong PPh dari penjualanmu. Omzet 2026 sampai hari ini{' '}
                <strong className="text-[#173b2b]">{formatRupiah(omzetTahunBerjalan)}</strong>. Untuk UMKM perorangan, omzet sampai Rp 500 juta setahun tidak dikenai PPh final 0,5%. Simpan CSV ini untuk catatan dan SPT tahunan.
              </p>
            </section>
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
