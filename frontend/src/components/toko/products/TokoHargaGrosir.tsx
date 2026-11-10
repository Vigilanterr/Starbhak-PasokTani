'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../../layout';

export interface TierGrosirItem {
  id?: string;
  minBeliKg?: number;
  diskonPersen?: number;
  hargaPerKg?: number;
  min?: string | number;
  harga?: string | number;
  hematPersen?: number;
}

export interface TokoHargaGrosirProps {
  tierList?: TierGrosirItem[];
  produkId?: string;
  namaProduk?: string;
  hargaDasar?: number;
  satuan?: string;
  tingkatAwal?: { min: string; harga: string }[];
  onSimpanTier?: (tiers: TierGrosirItem[]) => void;
  onSimpan?: (tingkat: { min: string; harga: string }[]) => void;
  className?: string;
}

interface TingkatRow {
  id: string;
  min: string;
  harga: string;
}

const DEFAULT_TIERS: TingkatRow[] = [
  { id: '1', min: '10', harga: '8.000' },
  { id: '2', min: '20', harga: '7.000' },
];

export function TokoHargaGrosir({
  tierList,
  produkId = 'kol',
  namaProduk = 'Kol Bulat Lembang',
  hargaDasar = 9000,
  satuan = 'kg',
  tingkatAwal,
  onSimpanTier,
  onSimpan,
  className = '',
}: TokoHargaGrosirProps) {
  // Convert tierList to internal TingkatRow if provided
  const initialRows: TingkatRow[] = tierList
    ? tierList.map((t, idx) => ({
        id: t.id || String(idx + 1),
        min: String(t.minBeliKg || t.min || 10),
        harga: t.hargaPerKg ? t.hargaPerKg.toLocaleString('id-ID') : String(t.harga || 8000),
      }))
    : tingkatAwal
    ? tingkatAwal.map((t, idx) => ({ id: String(idx + 1), min: t.min, harga: t.harga }))
    : DEFAULT_TIERS;

  const [tingkat, setTingkat] = useState<TingkatRow[]>(initialRows);
  const [contohBeli, setContohBeli] = useState<number>(15);
  const [tersimpan, setTersimpan] = useState<boolean>(false);
  const [galatList, setGalatList] = useState<string[]>([]);

  const handleAddTier = () => {
    if (tingkat.length >= 5) return;
    const nextNum = tingkat.length + 1;
    const lastTier = tingkat[tingkat.length - 1];
    const lastMin = lastTier ? parseInt(lastTier.min.replace(/\D/g, ''), 10) || 10 : 10;
    const lastHarga = lastTier ? parseInt(lastTier.harga.replace(/\D/g, ''), 10) || hargaDasar : hargaDasar;

    setTingkat((prev) => [
      ...prev,
      {
        id: String(nextNum),
        min: String(lastMin + 10),
        harga: String(Math.max(500, lastHarga - 1000)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      },
    ]);
  };

  const handleRemoveTier = (id: string) => {
    setTingkat((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];

    let prevMin = 1;
    let prevHarga = hargaDasar;

    for (let i = 0; i < tingkat.length; i++) {
      const t = tingkat[i];
      if (!t) continue;
      const mVal = parseInt(t.min.replace(/\D/g, ''), 10) || 0;
      const hVal = parseInt(t.harga.replace(/\D/g, ''), 10) || 0;

      if (mVal <= 1) {
        errs.push(`Tingkat ${i + 1}: minimal 2 ${satuan}, karena 1 ${satuan} ke atas sudah harga biasa.`);
      } else if (mVal <= prevMin) {
        errs.push(`Tingkat ${i + 1}: harus lebih dari ${prevMin} ${satuan} (tingkat sebelumnya).`);
      }

      if (hVal >= prevHarga) {
        errs.push(`Tingkat ${i + 1}: harus lebih murah dari Rp ${prevHarga.toLocaleString('id-ID')} (tingkat sebelumnya).`);
      }

      prevMin = mVal;
      prevHarga = hVal;
    }

    if (errs.length > 0) {
      setGalatList(errs);
      return;
    }

    setGalatList([]);
    setTersimpan(true);

    const convertedTiers: TierGrosirItem[] = tingkat.map((t) => {
      const m = parseInt(t.min.replace(/\D/g, ''), 10) || 10;
      const h = parseInt(t.harga.replace(/\D/g, ''), 10) || hargaDasar;
      return {
        id: t.id,
        minBeliKg: m,
        hargaPerKg: h,
        diskonPersen: Math.round(((hargaDasar - h) / hargaDasar) * 100),
        min: t.min,
        harga: t.harga,
      };
    });

    if (onSimpanTier) onSimpanTier(convertedTiers);
    if (onSimpan) onSimpan(tingkat.map((t) => ({ min: t.min, harga: t.harga })));
  };

  // Staircase bars calculation
  const tanggaBars = [
    { rentang: `1 ${satuan} ke atas`, harga: `Rp ${hargaDasar.toLocaleString('id-ID')}`, lebar: '100%' },
    ...tingkat.map((t) => {
      const h = parseInt(t.harga.replace(/\D/g, ''), 10) || hargaDasar;
      const pct = Math.max(20, Math.min(100, Math.round((h / hargaDasar) * 100)));
      return {
        rentang: `${t.min} ${satuan} ke atas`,
        harga: `Rp ${h.toLocaleString('id-ID')}`,
        lebar: `${pct}%`,
      };
    }),
  ];

  // Simulator calculation
  const getSimPrice = (qty: number) => {
    let effectivePrice = hargaDasar;
    // Check highest matching tier
    for (const t of tingkat) {
      const m = parseInt(t.min.replace(/\D/g, ''), 10) || 0;
      const h = parseInt(t.harga.replace(/\D/g, ''), 10) || hargaDasar;
      if (qty >= m) {
        effectivePrice = h;
      }
    }
    return effectivePrice;
  };

  const simEffectivePrice = getSimPrice(contohBeli);
  const simTotal = simEffectivePrice * contohBeli;
  const simSavings = (hargaDasar - simEffectivePrice) * contohBeli;
  const simTerima = Math.round(simTotal * 0.97);

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
                Harga grosir {namaProduk}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                Harga biasa <strong>Rp {hargaDasar.toLocaleString('id-ID')} per {satuan}</strong>. Pembeli otomatis dapat harga dari tingkat tertinggi yang jumlahnya tercapai.
              </p>
            </div>

            {tersimpan && (
              <div role="status" className="p-3.5 rounded-xl border border-[#064e3b] bg-[#f3faf3] text-xs sm:text-sm font-bold text-[#064e3b] flex items-center gap-2">
                <span>✓</span>
                <span>Harga grosir disimpan dan berlaku untuk pesanan baru berikutnya.</span>
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
                      Tingkat harga
                    </h2>
                    <p className="text-xs text-[#3f5247] mt-0.5">
                      Tiap tingkat butuh jumlah lebih banyak dan harga lebih murah dari tingkat sebelumnya. Maksimal 5 tingkat.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f6f8f4] flex justify-between items-center text-xs sm:text-sm">
                    <span>
                      <strong>1 {satuan} ke atas</strong> (harga biasa)
                    </span>
                    <strong className="text-[#173b2b]">Rp {hargaDasar.toLocaleString('id-ID')}</strong>
                  </div>

                  {tingkat.map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-[#dee3da] bg-[#fcfbf6] flex items-center gap-2.5"
                    >
                      <span className="shrink-0 w-7 h-7 rounded-full bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-bold text-[#3f5247] block mb-0.5">
                            Mulai dari ({satuan})
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={t.min}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTingkat((prev) =>
                                prev.map((item) => (item.id === t.id ? { ...item, min: val } : item))
                              );
                            }}
                            className="w-full h-10 px-2.5 rounded-lg border border-[#dee3da] bg-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#3f5247] block mb-0.5">
                            Harga/{satuan} (Rp)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={t.harga}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTingkat((prev) =>
                                prev.map((item) => (item.id === t.id ? { ...item, harga: val } : item))
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

                  {tingkat.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddTier}
                      className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#a9cfae] text-xs font-extrabold text-[#064e3b] hover:bg-[#f6f8f4]"
                    >
                      + Tambah tingkat harga
                    </button>
                  )}
                </section>

                <p className="p-3 rounded-xl bg-[#fffaf6] border border-[#f3d7c6] text-xs text-[#9a3412] leading-relaxed">
                  Tidak digabung dengan diskon Surplus. Saat keduanya berlaku, pembeli otomatis mendapatkan harga yang paling murah.
                </p>

                <button
                  type="submit"
                  className="min-h-[50px] rounded-xl bg-[#064e3b] text-white text-sm sm:text-base font-extrabold hover:bg-[#0f5132]"
                >
                  Simpan harga grosir
                </button>
              </form>

              {/* Right Column: Staircase Bar Chart + Volume Simulator */}
              <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
                {/* Staircase Chart Card */}
                <section
                  aria-labelledby="judul-tangga"
                  className="p-4 rounded-2xl bg-[#ebf2eb] flex flex-col gap-2.5"
                >
                  <h2 id="judul-tangga" className="text-sm font-extrabold text-[#173b2b]">
                    Tangga harga
                  </h2>
                  <ol className="list-none m-0 p-0 flex flex-col gap-2.5">
                    {tanggaBars.map((tg, i) => (
                      <li key={i} className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between">
                          <span className="font-bold">{tg.rentang}</span>
                          <strong className="text-[#064e3b]">{tg.harga}</strong>
                        </div>
                        <div aria-hidden="true" className="h-3 rounded-xs bg-[#c9dcc9]">
                          <div
                            className="h-full rounded-xs bg-[#064e3b]"
                            style={{ width: tg.lebar }}
                          />
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="text-[11px] text-[#5a6b60]">
                    Panjang batang mengikuti harga per {satuan}. Tiap anak tangga lebih pendek dari tingkat sebelumnya.
                  </p>
                </section>

                {/* Volume Purchase Simulator */}
                <section
                  aria-labelledby="judul-sim"
                  className="p-4 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-2.5"
                >
                  <h2 id="judul-sim" className="text-sm font-extrabold text-[#173b2b]">
                    Coba hitung pesanan pembeli
                  </h2>
                  <p className="text-xs text-[#3f5247]">
                    Simulasi pembelian: <strong>{contohBeli} {satuan}</strong>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setContohBeli(Math.max(1, contohBeli - 1))}
                      className="w-9 h-9 rounded-lg border border-[#064e3b] text-[#064e3b] font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-extrabold text-sm text-[#173b2b]">
                      {contohBeli} {satuan}
                    </span>
                    <button
                      type="button"
                      onClick={() => setContohBeli(contohBeli + 1)}
                      className="w-9 h-9 rounded-lg border border-[#064e3b] text-[#064e3b] font-bold text-lg"
                    >
                      +
                    </button>
                  </div>

                  <dl className="m-0 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-[#3f5247]">Harga per {satuan}</dt>
                      <dd className="m-0 font-extrabold text-[#173b2b]">Rp {simEffectivePrice.toLocaleString('id-ID')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#3f5247]">Total tagihan pembeli</dt>
                      <dd className="m-0 font-extrabold text-[#173b2b]">Rp {simTotal.toLocaleString('id-ID')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#3f5247]">Pembeli hemat</dt>
                      <dd className="m-0 font-extrabold text-[#157a4c]">Rp {simSavings.toLocaleString('id-ID')}</dd>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-[#eef0eb]">
                      <dt className="text-[#3f5247]">Kamu terima (potongan 3%)</dt>
                      <dd className="m-0 font-extrabold text-[#157a4c]">Rp {simTerima.toLocaleString('id-ID')}</dd>
                    </div>
                  </dl>
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

export default TokoHargaGrosir;
