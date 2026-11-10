'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../../layout';

export interface TingkatDiskonSurplus {
  hariSebelumKedaluwarsa: number;
  diskonPersen: number;
  hargaSetelahDiskon: number;
  aktif: boolean;
}

export interface AturanSurplusData {
  produkId?: string;
  namaProduk?: string;
  hargaNormal: number;
  hargaMinimum: number;
  aktif: boolean;
  tingkat1: TingkatDiskonSurplus;
  tingkat2: TingkatDiskonSurplus;
  tingkatList?: { hari: string; diskon: string }[];
}

export interface TokoProdukSurplusProps {
  aturanSurplus?: AturanSurplusData;
  produkId?: string;
  namaProduk?: string;
  hargaDasar?: number;
  satuan?: string;
  sisaHariBatchAktif?: number;
  stokBatchAktif?: number;
  hargaMinimumAwal?: number;
  kosong?: boolean;
  onSimpanAturan?: (aturan: AturanSurplusData) => void;
  onSimpan?: (tingkat: { hari: string; diskon: string }[], hargaMinimum: number) => void;
  className?: string;
}

interface TingkatRow {
  id: string;
  hari: string;
  diskon: string;
}

const DEFAULT_TINGKAT: TingkatRow[] = [
  { id: '1', hari: '3', diskon: '20' },
  { id: '2', hari: '1', diskon: '40' },
];

export function TokoProdukSurplus({
  aturanSurplus,
  produkId: produkIdProp = 'kol',
  namaProduk: namaProdukProp = 'Kol Bulat Lembang',
  hargaDasar: hargaDasarProp = 9000,
  satuan = 'kg',
  sisaHariBatchAktif = 6,
  stokBatchAktif = 40,
  hargaMinimumAwal = 4500,
  kosong = false,
  onSimpanAturan,
  onSimpan,
  className = '',
}: TokoProdukSurplusProps) {
  const produkId = aturanSurplus?.produkId ?? produkIdProp;
  const namaProduk = aturanSurplus?.namaProduk ?? namaProdukProp;
  const hargaDasar = aturanSurplus?.hargaNormal ?? hargaDasarProp;

  const initialTingkat: TingkatRow[] = aturanSurplus?.tingkatList
    ? aturanSurplus.tingkatList.map((t, idx) => ({ id: String(idx + 1), hari: t.hari, diskon: t.diskon }))
    : aturanSurplus
    ? [
        { id: '1', hari: String(aturanSurplus.tingkat1.hariSebelumKedaluwarsa), diskon: String(aturanSurplus.tingkat1.diskonPersen) },
        { id: '2', hari: String(aturanSurplus.tingkat2.hariSebelumKedaluwarsa), diskon: String(aturanSurplus.tingkat2.diskonPersen) },
      ]
    : kosong
    ? []
    : DEFAULT_TINGKAT;

  const [tingkat, setTingkat] = useState<TingkatRow[]>(initialTingkat);
  const [minHarga, setMinHarga] = useState<string>(
    String(aturanSurplus?.hargaMinimum ?? (kosong ? '' : hargaMinimumAwal))
  );
  const [hariContoh, setHariContoh] = useState<number>(2);
  const [tersimpan, setTersimpan] = useState<boolean>(false);
  const [galatList, setGalatList] = useState<string[]>([]);

  const cleanMinHarga = parseInt(minHarga.replace(/\D/g, ''), 10) || 0;

  const handleAddTier = () => {
    if (tingkat.length >= 4) return;
    const nextNum = tingkat.length + 1;
    const lastTier = tingkat[tingkat.length - 1];
    const lastHari = lastTier ? parseInt(lastTier.hari, 10) || 2 : 2;
    const lastDiskon = lastTier ? parseInt(lastTier.diskon, 10) || 20 : 20;

    setTingkat((prev) => [
      ...prev,
      {
        id: String(nextNum),
        hari: String(Math.max(1, lastHari - 1)),
        diskon: String(Math.min(90, lastDiskon + 15)),
      },
    ]);
  };

  const handleRemoveTier = (id: string) => {
    setTingkat((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];

    if (tingkat.length > 0) {
      if (cleanMinHarga <= 0) {
        errs.push('Harga minimum wajib diisi saat aturan Surplus aktif.');
      } else if (cleanMinHarga >= hargaDasar) {
        errs.push(`Harga minimum harus lebih murah dari harga biasa Rp ${hargaDasar.toLocaleString('id-ID')}.`);
      }

      let prevHari = 999;
      let prevDiskon = 0;
      for (let i = 0; i < tingkat.length; i++) {
        const t = tingkat[i];
        if (!t) continue;
        const hVal = parseInt(t.hari, 10) || 0;
        const dVal = parseInt(t.diskon, 10) || 0;

        if (hVal >= prevHari) {
          errs.push(`Tingkat ${i + 1}: sisa hari harus kurang dari ${prevHari} hari (tingkat sebelumnya).`);
        }
        if (dVal <= prevDiskon) {
          errs.push(`Tingkat ${i + 1}: diskon harus lebih besar dari ${prevDiskon}% (tingkat sebelumnya).`);
        }
        if (dVal < 5 || dVal > 90) {
          errs.push(`Tingkat ${i + 1}: diskon harus antara 5 sampai 90 persen.`);
        }
        prevHari = hVal;
        prevDiskon = dVal;
      }
    }

    if (errs.length > 0) {
      setGalatList(errs);
      return;
    }

    setGalatList([]);
    setTersimpan(true);

    const firstTier = tingkat[0];
    const secondTier = tingkat[1] ?? tingkat[0];

    const dataBaru: AturanSurplusData = {
      produkId,
      namaProduk,
      hargaNormal: hargaDasar,
      hargaMinimum: cleanMinHarga,
      aktif: tingkat.length > 0,
      tingkat1: {
        hariSebelumKedaluwarsa: firstTier ? parseInt(firstTier.hari, 10) || 3 : 3,
        diskonPersen: firstTier ? parseInt(firstTier.diskon, 10) || 20 : 20,
        hargaSetelahDiskon: Math.round(hargaDasar * 0.8),
        aktif: true,
      },
      tingkat2: {
        hariSebelumKedaluwarsa: secondTier ? parseInt(secondTier.hari, 10) || 1 : 1,
        diskonPersen: secondTier ? parseInt(secondTier.diskon, 10) || 40 : 40,
        hargaSetelahDiskon: Math.round(hargaDasar * 0.6),
        aktif: true,
      },
      tingkatList: tingkat.map((t) => ({ hari: t.hari, diskon: t.diskon })),
    };

    if (onSimpanAturan) onSimpanAturan(dataBaru);
    if (onSimpan) onSimpan(tingkat.map((t) => ({ hari: t.hari, diskon: t.diskon })), cleanMinHarga);
  };

  // Calculate simulated price given days remaining
  const getPriceForDays = (daysLeft: number) => {
    let applicableDiscount = 0;
    // Sort tiers descending by days
    const sorted = [...tingkat].sort((a, b) => parseInt(b.hari, 10) - parseInt(a.hari, 10));
    for (const t of sorted) {
      const h = parseInt(t.hari, 10) || 0;
      if (daysLeft <= h) {
        applicableDiscount = parseInt(t.diskon, 10) || 0;
      }
    }

    if (applicableDiscount === 0) return { price: hargaDasar, discount: 0, clamped: false };

    const calculated = Math.round(hargaDasar * (1 - applicableDiscount / 100));
    if (cleanMinHarga > 0 && calculated < cleanMinHarga) {
      return { price: cleanMinHarga, discount: applicableDiscount, clamped: true };
    }
    return { price: calculated, discount: applicableDiscount, clamped: false };
  };

  const simResult = getPriceForDays(hariContoh);
  const simTotal = simResult.price * stokBatchAktif;
  const simTerima = Math.round(simTotal * 0.97);

  // Daily preview schedule
  const countdownDays = [6, 5, 4, 3, 2, 1];

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="produk" />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1080px]">
          <div className="flex flex-col gap-4">
            <Link
              href={`/toko/produk/${produkId}`}
              className="self-start inline-flex items-center gap-1 min-h-[36px] text-xs sm:text-sm font-bold text-[#157a4c] hover:underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              {namaProduk}
            </Link>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173b2b]">
                Diskon Surplus {namaProduk}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                Harga biasa <strong>Rp {hargaDasar.toLocaleString('id-ID')} per {satuan}</strong>. Makin dekat kedaluwarsa, makin besar diskonnya, jadi stok tetap laku dan tidak terbuang.
              </p>
            </div>

            {tersimpan && (
              <div role="status" className="p-3.5 rounded-xl border border-[#064e3b] bg-[#f3faf3] text-xs sm:text-sm font-bold text-[#064e3b] flex items-center gap-2">
                <span>✓</span>
                <span>Aturan Surplus disimpan. Harga Surplus dihitung otomatis tiap hari.</span>
              </div>
            )}

            {galatList.length > 0 && (
              <div role="alert" className="p-4 border-[1.5px] border-[#b42318] rounded-xl bg-[#fdecea]">
                <ul className="list-disc pl-5 text-xs sm:text-sm text-[#8a1c12]">
                  {galatList.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-start gap-5">
              {/* Form Column */}
              <form onSubmit={handleSave} className="w-full lg:flex-[999_1_440px] min-w-0 flex flex-col gap-4">
                <section aria-labelledby="judul-tingkat" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                  <div>
                    <h2 id="judul-tingkat" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                      Diskon menurut sisa hari
                    </h2>
                    <p className="text-xs text-[#3f5247] mt-0.5">
                      Urutkan dari sisa hari terbanyak. Tiap tingkat berikutnya sisa hari lebih sedikit dan diskon lebih besar.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f6f8f4] flex justify-between items-center text-xs sm:text-sm">
                    <span>
                      <strong>Lebih dari tingkat pertama</strong> (harga biasa)
                    </span>
                    <strong className="text-[#173b2b]">Rp {hargaDasar.toLocaleString('id-ID')}</strong>
                  </div>

                  {tingkat.map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-[#dee3da] bg-[#fcfbf6] flex items-center gap-2.5"
                    >
                      <span className="shrink-0 w-7 h-7 rounded-full bg-[#ffeedd] text-[#c2410c] text-xs font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-bold text-[#3f5247] block mb-0.5">
                            Sisa hari ≤
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={t.hari}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTingkat((prev) =>
                                prev.map((item) => (item.id === t.id ? { ...item, hari: val } : item))
                              );
                            }}
                            className="w-full h-10 px-2.5 rounded-lg border border-[#dee3da] bg-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#3f5247] block mb-0.5">
                            Diskon (%)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={t.diskon}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTingkat((prev) =>
                                prev.map((item) => (item.id === t.id ? { ...item, diskon: val } : item))
                              );
                            }}
                            className="w-full h-10 px-2.5 rounded-lg border border-[#dee3da] bg-white text-xs font-bold"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(t.id)}
                        className="shrink-0 w-8 h-8 rounded-lg border border-[#f2b8b2] text-[#b42318] flex items-center justify-center hover:bg-[#fdecea]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {tingkat.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddTier}
                      className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#a9cfae] text-xs font-extrabold text-[#064e3b] hover:bg-[#f6f8f4]"
                    >
                      + Tambah tingkat diskon
                    </button>
                  )}
                </section>

                {/* Minimum Price Floor Guard */}
                <section aria-labelledby="judul-min" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2">
                  <h2 id="judul-min" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Harga minimum
                  </h2>
                  <label htmlFor="sp-min" className="text-xs font-bold text-[#3f5247]">
                    Harga per {satuan} tidak akan turun di bawah (Rp)
                  </label>
                  <input
                    id="sp-min"
                    type="text"
                    inputMode="numeric"
                    value={minHarga}
                    onChange={(e) => setMinHarga(e.target.value)}
                    className="h-10 max-w-[200px] px-3 rounded-lg border border-[#dee3da] bg-white text-sm font-bold"
                  />
                  <p className="text-xs text-[#5a6b60]">
                    Wajib diisi. Kalau hasil diskon Surplus lebih murah, harga ditahan di angka ini.
                  </p>
                </section>

                <p className="p-3 rounded-xl bg-[#fffaf6] border border-[#f3d7c6] text-xs text-[#9a3412] leading-relaxed">
                  Tidak digabung dengan harga grosir. Saat keduanya berlaku, pembeli otomatis mendapatkan harga yang paling murah.
                </p>

                <button
                  type="submit"
                  className="min-h-[50px] rounded-xl bg-[#064e3b] text-white text-sm sm:text-base font-extrabold hover:bg-[#0f5132]"
                >
                  Simpan aturan Surplus
                </button>
              </form>

              {/* Right Column: Daily Countdown Preview + Simulator */}
              <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
                {/* Daily Preview Table */}
                <section
                  aria-labelledby="judul-pratinjau"
                  className="p-4 rounded-2xl bg-[#fff7f2] border border-[#f6d5c3] flex flex-col gap-2.5"
                >
                  <h2 id="judul-pratinjau" className="text-sm font-extrabold text-[#173b2b]">
                    Pratinjau harga tiap hari
                  </h2>
                  <p className="text-xs text-[#3f5247]">
                    Kol ini kedaluwarsa dalam {sisaHariBatchAktif} hari:
                  </p>

                  <ol className="list-none m-0 p-0 flex flex-col gap-1.5 text-xs">
                    {countdownDays.map((d) => {
                      const res = getPriceForDays(d);
                      return (
                        <li
                          key={d}
                          className="flex items-center justify-between p-2 rounded-lg bg-white"
                        >
                          <span className="font-bold">{d} hari lagi</span>
                          <span className="flex items-center gap-1.5">
                            {res.discount > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-[#fde2d2] text-[#9a3412] font-extrabold text-[11px]">
                                -{res.discount}%
                              </span>
                            )}
                            <strong className="text-[#173b2b]">
                              Rp {res.price.toLocaleString('id-ID')}
                            </strong>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </section>

                {/* Interactive Simulator */}
                <section
                  aria-labelledby="judul-sim"
                  className="p-4 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-2.5"
                >
                  <h2 id="judul-sim" className="text-sm font-extrabold text-[#173b2b]">
                    Coba hitung pendapatan
                  </h2>
                  <p className="text-xs text-[#3f5247]">
                    Simulasi: sisa <strong>{hariContoh} hari</strong>, stok {stokBatchAktif} {satuan}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHariContoh(Math.max(1, hariContoh - 1))}
                      className="w-9 h-9 rounded-lg border border-[#064e3b] text-[#064e3b] font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-extrabold text-sm text-[#173b2b]">
                      {hariContoh} hari lagi
                    </span>
                    <button
                      type="button"
                      onClick={() => setHariContoh(Math.min(14, hariContoh + 1))}
                      className="w-9 h-9 rounded-lg border border-[#064e3b] text-[#064e3b] font-bold text-lg"
                    >
                      +
                    </button>
                  </div>

                  <dl className="m-0 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-[#3f5247]">Harga per {satuan}</dt>
                      <dd className="m-0 font-extrabold text-[#173b2b]">Rp {simResult.price.toLocaleString('id-ID')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#3f5247]">Total jika laku semua</dt>
                      <dd className="m-0 font-extrabold text-[#173b2b]">Rp {simTotal.toLocaleString('id-ID')}</dd>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-[#eef0eb]">
                      <dt className="text-[#3f5247]">Kamu terima (potongan 3%)</dt>
                      <dd className="m-0 font-extrabold text-[#157a4c]">Rp {simTerima.toLocaleString('id-ID')}</dd>
                    </div>
                  </dl>
                  <p className="text-[11px] text-[#5a6b60] leading-relaxed">
                    Tanpa Surplus, {stokBatchAktif} {satuan} yang tidak laku sebelum batas kedaluwarsa jadi Rp 0.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="lg:hidden sticky bottom-0 z-10">
        <TokoNavBawah aktif="produk" />
      </div>
    </div>
  );
}

export default TokoProdukSurplus;
