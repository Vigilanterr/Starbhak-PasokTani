'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../../layout';

export interface TokoStokBaruProps {
  produkId?: string;
  namaProduk?: string;
  satuan?: string;
  stokSaatIni?: number;
  hargaDasar?: number;
  tingkatGrosirList?: { min: number; harga: number }[];
  aturanSurplusTeks?: string;
  jumlahPelangganTernotifikasi?: number;
  onTambahBatch?: (batchData: unknown) => void;
  onSimpanStok?: (data: {
    jumlah: number;
    tanggalPanen: string;
    tanggalKedaluwarsa: string;
    fotoUrl?: string;
  }) => void;
  className?: string;
}

type PanenOpsi = 'hari-ini' | 'kemarin' | '2-hari' | 'lain';

const PANEN_OPSI_LIST: { id: PanenOpsi; label: string; date: string }[] = [
  { id: 'hari-ini', label: 'Hari ini', date: '8 Nov 2026' },
  { id: 'kemarin', label: 'Kemarin', date: '7 Nov 2026' },
  { id: '2-hari', label: '2 hari lalu', date: '6 Nov 2026' },
  { id: 'lain', label: 'Tanggal lain', date: 'Pilih manual' },
];

export function TokoStokBaru({
  produkId = 'kol',
  namaProduk = 'Kol Bulat Lembang',
  satuan = 'kg',
  stokSaatIni = 8,
  hargaDasar = 9000,
  tingkatGrosirList = [
    { min: 10, harga: 8000 },
    { min: 20, harga: 7000 },
  ],
  aturanSurplusTeks = '3 hari sebelum kedaluwarsa 10%, 2 hari 25%, 1 hari 40%',
  jumlahPelangganTernotifikasi = 3,
  onTambahBatch,
  onSimpanStok,
  className = '',
}: TokoStokBaruProps) {
  const [jumlah, setJumlah] = useState<number>(25);
  const [panenOpsi, setPanenOpsi] = useState<PanenOpsi>('hari-ini');
  const [panenLain, setPanenLain] = useState('');
  const [kedaluwarsaOtomatis, setKedaluwarsaOtomatis] = useState(true);
  const [kedaluwarsaDate, setKedaluwarsaDate] = useState('2026-11-15');
  const [fotoAda, setFotoAda] = useState(false);
  const [selesai, setSelesai] = useState(false);
  const [galat, setGalat] = useState('');

  const totalStokBaru = stokSaatIni + jumlah;

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (jumlah <= 0) {
      setGalat('Jumlah stok harus lebih dari 0.');
      return;
    }
    if (jumlah > 5000) {
      setGalat(`Maksimal 5.000 ${satuan} sekali tambah.`);
      return;
    }

    setGalat('');
    const dataBatch = {
      produkId,
      jumlah,
      tanggalPanen: panenOpsi === 'lain' ? panenLain : '8 Nov 2026',
      tanggalKedaluwarsa: kedaluwarsaDate,
      fotoUrl: fotoAda ? 'foto-stok-baru.jpg' : undefined,
    };

    if (onTambahBatch) onTambahBatch(dataBatch);
    if (onSimpanStok) onSimpanStok(dataBatch);
    setSelesai(true);
  };

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="produk" />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[980px]">
          <div className="flex flex-col gap-4">
            <Link
              href="/toko/produk"
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-xs sm:text-sm font-bold text-[#157a4c] hover:underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Produk dan stok
            </Link>

            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-[#e3f1df] text-[#2f7a3e]"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#173b2b]">
                  Tambah stok {namaProduk}
                </h1>
                <p className="text-xs sm:text-sm text-[#3f5247]">
                  Stok sekarang <strong className="text-[#92400e]">{stokSaatIni} {satuan}</strong>.
                </p>
              </div>
            </div>

            {!selesai ? (
              <>
                {galat && (
                  <p className="p-3 rounded-xl border border-[#b42318] bg-[#fdecea] text-xs sm:text-sm font-bold text-[#8a1c12]">
                    {galat}
                  </p>
                )}

                <div className="flex flex-col lg:flex-row items-start gap-5">
                  <form onSubmit={handleSimpan} className="w-full lg:flex-[999_1_420px] min-w-0 flex flex-col gap-4">
                    {/* 1. Quantity Stepper */}
                    <section aria-labelledby="judul-jumlah" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                      <label id="judul-jumlah" htmlFor="jumlah-stok" className="text-base font-extrabold text-[#173b2b]">
                        1. Berapa {satuan} stok baru?
                      </label>
                      <div className="flex items-center gap-2 max-w-[360px]">
                        <button
                          type="button"
                          onClick={() => setJumlah(Math.max(1, jumlah - 5))}
                          className="w-12 h-12 rounded-xl border border-[#064e3b] text-[#064e3b] font-bold text-xl flex items-center justify-center hover:bg-[#f6f8f4]"
                        >
                          −
                        </button>
                        <div className="relative flex-1">
                          <input
                            id="jumlah-stok"
                            type="text"
                            inputMode="numeric"
                            value={jumlah}
                            onChange={(e) => setJumlah(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)}
                            className="w-full h-12 text-center text-xl font-extrabold border border-[#7d877e] rounded-xl"
                          />
                          <span className="absolute right-3.5 top-3.5 text-xs font-bold text-[#5a6b60]">{satuan}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setJumlah(jumlah + 5)}
                          className="w-12 h-12 rounded-xl border border-[#064e3b] text-[#064e3b] font-bold text-xl flex items-center justify-center hover:bg-[#f6f8f4]"
                        >
                          +
                        </button>
                      </div>

                      {/* Quick Add Pills */}
                      <div role="group" aria-label="Tambah cepat" className="flex flex-wrap gap-2">
                        {[10, 25, 50].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setJumlah((prev) => prev + n)}
                            className="px-3.5 py-1.5 rounded-full border border-[#dee3da] bg-[#f6f8f4] text-xs font-extrabold text-[#064e3b] hover:bg-[#ebf2eb]"
                          >
                            +{n} {satuan}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-[#5a6b60]">
                        Total stok setelah disimpan: <strong className="text-[#173b2b]">{totalStokBaru} {satuan}</strong>.
                      </p>
                    </section>

                    {/* 2. Harvest Date Radio */}
                    <section aria-labelledby="judul-panen" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                      <fieldset className="border-0 p-0 m-0 flex flex-col gap-2">
                        <legend id="judul-panen" className="text-base font-extrabold text-[#173b2b]">
                          2. Kapan dipanen?
                        </legend>
                        <div className="grid grid-cols-2 gap-2">
                          {PANEN_OPSI_LIST.map((op) => (
                            <label
                              key={op.id}
                              className={`p-3 rounded-xl border flex flex-col cursor-pointer ${
                                panenOpsi === op.id
                                  ? 'bg-[#ebf2eb] border-[#064e3b]'
                                  : 'bg-white border-[#dee3da]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="tanggal-panen"
                                  checked={panenOpsi === op.id}
                                  onChange={() => setPanenOpsi(op.id)}
                                  className="accent-[#064e3b]"
                                />
                                <span className="text-xs sm:text-sm font-bold text-[#173b2b]">{op.label}</span>
                              </div>
                              <span className="text-xs text-[#5a6b60] ml-5">{op.date}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      {panenOpsi === 'lain' && (
                        <input
                          type="date"
                          value={panenLain}
                          onChange={(e) => setPanenLain(e.target.value)}
                          className="h-11 px-3 rounded-xl border border-[#7d877e] bg-white text-sm"
                        />
                      )}
                    </section>

                    {/* 3. Expiry Date */}
                    <section aria-labelledby="judul-kedaluwarsa" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                      <h2 id="judul-kedaluwarsa" className="text-base font-extrabold text-[#173b2b]">
                        3. Sampai kapan layak dijual?
                      </h2>
                      {kedaluwarsaOtomatis ? (
                        <div className="p-3 rounded-xl bg-[#f6f8f4] flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <p className="font-extrabold text-sm text-[#173b2b]">{kedaluwarsaDate}</p>
                            <p className="text-xs text-[#3f5247]">7 hari setelah panen, sama seperti batch sebelumnya.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setKedaluwarsaOtomatis(false)}
                            className="px-3 py-1.5 rounded-lg border border-[#a9cfae] bg-white text-xs font-bold text-[#064e3b]"
                          >
                            Ubah tanggal
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="date"
                            value={kedaluwarsaDate}
                            onChange={(e) => setKedaluwarsaDate(e.target.value)}
                            className="h-11 px-3 rounded-xl border border-[#7d877e] bg-white text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setKedaluwarsaOtomatis(true)}
                            className="self-start text-xs text-[#157a4c] font-bold underline"
                          >
                            Kembali ke otomatis
                          </button>
                        </div>
                      )}
                    </section>

                    {/* 4. Batch Photo */}
                    <section aria-labelledby="judul-foto" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                      <h2 id="judul-foto" className="text-base font-extrabold text-[#173b2b]">
                        4. Foto stok <span className="text-xs text-[#157a4c] font-bold">(disarankan)</span>
                      </h2>
                      {!fotoAda ? (
                        <button
                          type="button"
                          onClick={() => setFotoAda(true)}
                          className="min-h-[80px] p-4 border-[1.5px] border-dashed border-[#a9cfae] rounded-xl bg-[#f6f8f4] text-[#064e3b] text-sm font-extrabold flex items-center justify-center gap-2 hover:bg-[#ebf2eb] cursor-pointer"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                          </svg>
                          Ambil atau pilih foto stok panen
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="w-16 h-16 rounded-xl bg-[#cfe6c7] text-[#2f7a3e] flex items-center justify-center font-bold text-xs">
                            Foto Panen
                          </span>
                          <button
                            type="button"
                            onClick={() => setFotoAda(false)}
                            className="text-xs text-[#b42318] font-bold underline"
                          >
                            Hapus foto
                          </button>
                        </div>
                      )}
                    </section>

                    <button
                      type="submit"
                      className="min-h-[50px] rounded-xl bg-[#064e3b] text-white text-base font-extrabold hover:bg-[#0f5132]"
                    >
                      Simpan stok
                    </button>
                  </form>

                  {/* Right Column (Aside): Inherited Rules & Live Buyer Preview */}
                  <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
                    <section aria-labelledby="judul-ikut" className="p-4 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-2.5">
                      <h2 id="judul-ikut" className="text-sm font-extrabold text-[#173b2b]">
                        Ikut aturan sebelumnya
                      </h2>
                      <dl className="m-0 flex flex-col gap-2 text-xs leading-relaxed">
                        <div>
                          <dt className="text-[#5a6b60] font-bold">Harga dasar</dt>
                          <dd className="m-0 font-extrabold text-[#173b2b]">Rp {hargaDasar.toLocaleString('id-ID')} per {satuan}</dd>
                        </div>
                        <div>
                          <dt className="text-[#5a6b60] font-bold">Harga grosir</dt>
                          <dd className="m-0 text-[#173b2b]">
                            {tingkatGrosirList.map((tg, i) => (
                              <span key={i} className="block">{tg.min} {satuan} ke atas Rp {tg.harga.toLocaleString('id-ID')}</span>
                            ))}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#5a6b60] font-bold">Diskon Surplus</dt>
                          <dd className="m-0 text-[#173b2b]">{aturanSurplusTeks}</dd>
                        </div>
                      </dl>
                    </section>

                    <section aria-labelledby="judul-pratinjau" className="p-4 rounded-2xl bg-[#ebf2eb] flex flex-col gap-2">
                      <h2 id="judul-pratinjau" className="text-xs sm:text-sm font-extrabold text-[#173b2b]">
                        Yang dilihat pembeli
                      </h2>
                      <div className="p-3 rounded-xl bg-white flex items-center gap-3">
                        <span className="w-12 h-12 rounded-lg bg-[#e3f1df] text-[#2f7a3e] flex items-center justify-center shrink-0">
                          🌱
                        </span>
                        <div className="text-xs">
                          <p className="font-extrabold text-[#173b2b]">{namaProduk}</p>
                          <p className="text-[#157a4c] font-bold">Panen {panenOpsi === 'hari-ini' ? 'Hari ini' : 'Baru'}</p>
                          <p className="text-[#5a6b60]">Stok {totalStokBaru} {satuan}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#173b2b] leading-relaxed">
                        {jumlahPelangganTernotifikasi} pelanggan dapat kabar otomatis begitu stok ini disimpan.
                      </p>
                    </section>
                  </div>
                </div>
              </>
            ) : (
              /* Success View */
              <div className="p-6 sm:p-8 rounded-2xl border-[1.5px] border-[#064e3b] bg-[#f3faf3] flex flex-col items-center text-center gap-3 max-w-[560px] mx-auto">
                <span className="w-14 h-14 rounded-full bg-[#064e3b] text-white flex items-center justify-center text-2xl font-bold">
                  ✓
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#173b2b]">
                  Stok {namaProduk} bertambah {jumlah} {satuan}
                </h2>
                <p className="text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                  Sekarang total {totalStokBaru} {satuan}. {jumlahPelangganTernotifikasi} pelanggan sudah diberi tahu.
                </p>
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/toko/produk/${produkId}`}
                    className="px-4 py-2.5 rounded-xl bg-[#064e3b] text-white text-xs sm:text-sm font-extrabold hover:bg-[#0f5132]"
                  >
                    Kembali ke produk
                  </Link>
                  <Link
                    href="/toko"
                    className="px-4 py-2.5 rounded-xl border border-[#dee3da] bg-white text-xs sm:text-sm font-bold text-[#173b2b] hover:bg-[#f6f8f4]"
                  >
                    Ke beranda toko
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="produk" />
      </div>
    </div>
  );
}

export default TokoStokBaru;
