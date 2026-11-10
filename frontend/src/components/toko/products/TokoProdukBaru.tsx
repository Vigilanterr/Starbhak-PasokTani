'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas, TokoSamping, TokoNavBawah } from '../../layout';
import { LangkahWizard, UnggahFoto } from '../../common';

export interface TingkatGrosirBaru {
  id: string;
  min: string;
  harga: string;
}

export interface TokoProdukBaruProps {
  langkahAwal?: number;
  kategoriList?: string[];
  namaToko?: string;
  lokasiToko?: string;
  daftarProdukSudahAda?: { kunci: string; nama: string }[];
  onSimpan?: (data: unknown) => void;
  onSelesai?: (produkBaru: unknown) => void;
  onSimpanDraf?: (draf: unknown) => void;
  className?: string;
}

const DEFAULT_EXISTING = [
  { kunci: 'tomat', nama: 'Tomat Merah Lembang' },
  { kunci: 'kol', nama: 'Kol Bulat Lembang' },
];

const SUGGESTIONS = [
  { nama: 'Buncis Lembang', ket: 'Sayuran · panen tiap 2 hari' },
  { nama: 'Buncis Baby', ket: 'Sayuran · kualitas premium' },
  { nama: 'Buncis Super', ket: 'Sayuran · polong panjang' },
];

type PanenOpsiTipe = 'hari-ini' | 'kemarin' | '2-hari' | 'lain';

export function TokoProdukBaru({
  langkahAwal = 1,
  kategoriList = ['Sayuran', 'Buah', 'Umbi', 'Rempah dan bumbu', 'Lainnya'],
  namaToko = 'Kebun Mang Ujang',
  lokasiToko = 'Lembang, Kab. Bandung Barat',
  daftarProdukSudahAda = DEFAULT_EXISTING,
  onSimpan,
  onSelesai,
  onSimpanDraf,
  className = '',
}: TokoProdukBaruProps) {
  const [langkah, setLangkah] = useState<number>(langkahAwal);
  const [selesai, setSelesai] = useState<boolean>(false);

  // Step 1 Form State
  const [nama, setNama] = useState('Buncis Lembang');
  const [kategori, setKategori] = useState('Sayuran');
  const [satuan, setSatuan] = useState('kg');
  const [deskripsi, setDeskripsi] = useState('Buncis segar renyah dari kebun lereng Tangkuban Parahu.');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Step 2 Form State
  const [fotoUtamaStatus, setFotoUtamaStatus] = useState<'kosong' | 'siap' | 'buram'>('siap');
  const [fotoLainStatus, setFotoLainStatus] = useState<string[]>(['siap', 'kosong', 'kosong', 'kosong']);
  const [harga, setHarga] = useState('14.000');
  const [grosirBuka, setGrosirBuka] = useState(false);
  const [grosirTingkat, setGrosirTingkat] = useState<TingkatGrosirBaru[]>([
    { id: 't1', min: '10', harga: '12.000' },
  ]);

  // Step 3 Form State
  const [jumlahStok, setJumlahStok] = useState('25');
  const [panenOpsi, setPanenOpsi] = useState<PanenOpsiTipe>('hari-ini');
  const [panenLainDate, setPanenLainDate] = useState('');
  const [kedaluwarsaOtomatis, setKedaluwarsaOtomatis] = useState(true);
  const [kedaluwarsaDate, setKedaluwarsaDate] = useState('2026-11-15');
  const [fotoStokOpsi, setFotoStokOpsi] = useState<'sama' | 'baru'>('sama');

  // Error validation states
  const [galatList, setGalatList] = useState<string[]>([]);

  // Duplicate checker
  const duplicate = daftarProdukSudahAda.find(
    (item) => item.nama.toLowerCase() === nama.trim().toLowerCase()
  );

  const cleanPrice = parseInt(harga.replace(/\D/g, ''), 10) || 0;
  const cleanStok = parseInt(jumlahStok.replace(/\D/g, ''), 10) || 0;

  const validateStep1 = () => {
    const errs: string[] = [];
    if (!nama.trim()) errs.push('Nama produk wajib diisi.');
    if (!kategori) errs.push('Pilih salah satu kategori.');
    if (!satuan) errs.push('Pilih satuan penjualan.');
    return errs;
  };

  const validateStep2 = () => {
    const errs: string[] = [];
    if (fotoUtamaStatus !== 'siap') errs.push('Foto utama produk wajib diunggah.');
    if (cleanPrice < 500) errs.push('Harga minimal Rp 500. Tulis angka saja.');

    if (grosirBuka) {
      let prevMin = 1;
      let prevHarga = cleanPrice;
      for (let i = 0; i < grosirTingkat.length; i++) {
        const t = grosirTingkat[i];
        if (!t) continue;
        const minVal = parseInt(t.min.replace(/\D/g, ''), 10) || 0;
        const hargaVal = parseInt(t.harga.replace(/\D/g, ''), 10) || 0;

        if (minVal <= prevMin) {
          errs.push(`Tingkat ${i + 1}: minimal ${prevMin + 1} ${satuan} (harus lebih dari sebelumnya).`);
        }
        if (hargaVal >= prevHarga) {
          errs.push(`Tingkat ${i + 1}: harga harus lebih murah dari tingkat sebelumnya (di bawah Rp ${prevHarga.toLocaleString('id-ID')}).`);
        }
        prevMin = minVal;
        prevHarga = hargaVal;
      }
    }
    return errs;
  };

  const validateStep3 = () => {
    const errs: string[] = [];
    if (cleanStok <= 0) errs.push('Jumlah stok harus lebih dari 0.');
    if (cleanStok > 5000) errs.push(`Maksimal 5.000 ${satuan} sekali tambah.`);
    return errs;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setGalatList([]);

    if (langkah === 1) {
      const errs = validateStep1();
      if (errs.length > 0) {
        setGalatList(errs);
        return;
      }
      setLangkah(2);
    } else if (langkah === 2) {
      const errs = validateStep2();
      if (errs.length > 0) {
        setGalatList(errs);
        return;
      }
      setLangkah(3);
    } else if (langkah === 3) {
      const errs = validateStep3();
      if (errs.length > 0) {
        setGalatList(errs);
        return;
      }
      const dataProduk = {
        nama,
        kategori,
        satuan,
        deskripsi,
        harga: cleanPrice,
        grosir: grosirBuka ? grosirTingkat : [],
        stok: cleanStok,
        panen: panenOpsi,
        kedaluwarsa: kedaluwarsaDate,
      };
      setSelesai(true);
      if (onSimpan) onSimpan(dataProduk);
      if (onSelesai) onSelesai(dataProduk);
    }
  };

  const handleSimpanDraf = () => {
    const draf = {
      nama,
      kategori,
      satuan,
      harga: cleanPrice,
      langkah,
    };
    if (onSimpanDraf) onSimpanDraf(draf);
    setSelesai(true);
  };

  const handleAddTier = () => {
    if (grosirTingkat.length >= 5) return;
    const nextNum = grosirTingkat.length + 1;
    const lastTier = grosirTingkat[grosirTingkat.length - 1];
    const lastMin = lastTier ? parseInt(lastTier.min.replace(/\D/g, ''), 10) || 10 : 10;
    const lastHarga = lastTier ? parseInt(lastTier.harga.replace(/\D/g, ''), 10) || cleanPrice : cleanPrice;

    setGrosirTingkat((prev) => [
      ...prev,
      {
        id: `t${nextNum}`,
        min: String(lastMin + 10),
        harga: String(Math.max(500, lastHarga - 1000)),
      },
    ]);
  };

  const handleRemoveTier = (id: string) => {
    setGrosirTingkat((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={`min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />

      <div className="flex items-start">
        <aside className="hidden lg:block w-[272px] shrink-0 p-5 pr-0 box-border">
          <TokoSamping aktif="produk" />
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1040px]">
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

            {!selesai ? (
              <>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173b2b]">
                    Tambah produk
                  </h1>
                  <p className="text-xs text-[#3f5247] flex items-center gap-1.5">
                    <span className="text-[#157a4c] font-bold">✓</span>
                    Draf tersimpan otomatis. Bisa dilanjutkan nanti.
                  </p>
                </div>

                {/* Step indicator */}
                <div className="p-3 sm:p-4 border border-[#dee3da] rounded-2xl bg-white">
                  <LangkahWizard
                    langkah={langkah}
                    onPilih={(step) => setLangkah(step)}
                    judul={['Info produk', 'Foto dan harga', 'Stok pertama']}
                  />
                </div>

                {/* Validation Errors */}
                {galatList.length > 0 && (
                  <div role="alert" className="p-3.5 sm:p-4 border-[1.5px] border-[#b42318] rounded-xl bg-[#fdecea]">
                    <p className="font-extrabold text-[#8a1c12] text-sm mb-1">
                      Periksa kembali data berikut:
                    </p>
                    <ul className="list-disc pl-5 text-xs sm:text-sm text-[#8a1c12] leading-relaxed">
                      {galatList.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 2-column: Form + Live Buyer Preview */}
                <div className="flex flex-col lg:flex-row items-start gap-5">
                  <form onSubmit={handleNext} className="w-full lg:flex-[999_1_460px] min-w-0 flex flex-col gap-4">
                    {/* STEP 1: INFO PRODUK */}
                    {langkah === 1 && (
                      <section aria-labelledby="judul-info" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-4">
                        <div>
                          <h2 id="judul-info" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                            Info produk
                          </h2>
                          <p className="text-xs text-[#5a6b60]">Tanda * wajib diisi.</p>
                        </div>

                        {/* Nama Produk with autocomplete & duplicate warning */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="pb-nama" className="text-sm font-bold text-[#173b2b]">
                            Nama produk <span className="text-[#b42318]">*</span>
                          </label>
                          <input
                            id="pb-nama"
                            type="text"
                            value={nama}
                            onChange={(e) => {
                              setNama(e.target.value);
                              setShowSuggestions(true);
                            }}
                            placeholder="Contoh: Buncis Lembang"
                            className="h-12 px-3.5 rounded-xl border border-[#7d877e] bg-white text-base text-[#173b2b]"
                          />

                          {showSuggestions && (
                            <ul className="list-none m-0 p-1 border border-[#dee3da] rounded-xl bg-white shadow-lg flex flex-col gap-1 z-10">
                              {SUGGESTIONS.map((sug, i) => (
                                <li key={i}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNama(sug.nama);
                                      setShowSuggestions(false);
                                    }}
                                    className="w-full text-left p-2 rounded-lg hover:bg-[#f6f8f4] flex flex-col cursor-pointer"
                                  >
                                    <span className="font-extrabold text-sm text-[#173b2b]">{sug.nama}</span>
                                    <span className="text-xs text-[#5a6b60]">{sug.ket}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}

                          {duplicate && (
                            <div className="p-3 rounded-xl bg-[#fef3c7] text-[#92400e] text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2">
                              <span>Kamu sudah punya <strong>{duplicate.nama}</strong> di tokomu.</span>
                              <Link
                                href="/toko/produk/buncis/stok-baru"
                                className="px-3 py-1 rounded-lg border border-[#92400e] bg-white font-extrabold text-xs"
                              >
                                Tambah stok saja
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Kategori Radio Pills */}
                        <fieldset className="border-0 p-0 m-0 flex flex-col gap-2">
                          <legend className="text-sm font-bold text-[#173b2b]">
                            Kategori <span className="text-[#b42318]">*</span>
                          </legend>
                          <div className="flex flex-wrap gap-2">
                            {kategoriList.map((kat) => (
                              <label
                                key={kat}
                                className={`inline-flex items-center gap-2 min-h-[40px] px-3.5 rounded-full text-xs sm:text-sm font-bold border cursor-pointer ${
                                  kategori === kat
                                    ? 'bg-[#ebf2eb] border-[#064e3b] text-[#064e3b]'
                                    : 'bg-white border-[#dee3da] text-[#173b2b]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="pb-kategori"
                                  checked={kategori === kat}
                                  onChange={() => setKategori(kat)}
                                  className="w-4 h-4 accent-[#064e3b]"
                                />
                                {kat}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        {/* Dijual per (Satuan) */}
                        <fieldset className="border-0 p-0 m-0 flex flex-col gap-2">
                          <legend className="text-sm font-bold text-[#173b2b]">
                            Dijual per <span className="text-[#b42318]">*</span>
                          </legend>
                          <div className="grid grid-cols-4 gap-2">
                            {['kg', 'ikat', 'buah', 'pak'].map((sat) => (
                              <label
                                key={sat}
                                className={`flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl border text-sm font-bold cursor-pointer ${
                                  satuan === sat
                                    ? 'bg-[#ebf2eb] border-[#064e3b] text-[#064e3b]'
                                    : 'bg-white border-[#dee3da] text-[#173b2b]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="pb-satuan"
                                  checked={satuan === sat}
                                  onChange={() => setSatuan(sat)}
                                  className="w-4 h-4 accent-[#064e3b]"
                                />
                                {sat}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        {/* Deskripsi */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="pb-desk" className="text-sm font-bold text-[#173b2b]">
                            Keterangan <span className="text-xs text-[#5a6b60] font-normal">(opsional)</span>
                          </label>
                          <textarea
                            id="pb-desk"
                            rows={3}
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            placeholder="Contoh: varietas, rasa, cara simpan."
                            className="p-3 rounded-xl border border-[#7d877e] bg-white text-sm text-[#173b2b] resize-y"
                          />
                        </div>

                        <p className="p-2.5 rounded-xl bg-[#f6f8f4] text-xs text-[#3f5247] flex items-center gap-2">
                          <span className="text-[#157a4c] font-bold">📍</span>
                          Asal: <strong>{lokasiToko}</strong> (diambil dari profil toko).
                        </p>
                      </section>
                    )}

                    {/* STEP 2: FOTO DAN HARGA */}
                    {langkah === 2 && (
                      <>
                        <section aria-labelledby="judul-foto" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                          <div>
                            <h2 id="judul-foto" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                              Foto produk
                            </h2>
                            <p className="text-xs text-[#3f5247]">
                              Foto asli dari lahanmu, cahaya siang, latar polos. Foto dikecilkan otomatis jadi sekitar 300 KB.
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3.5">
                            <div className="w-full sm:w-[240px] shrink-0">
                              <UnggahFoto
                                label="Foto utama"
                                wajib
                                status={fotoUtamaStatus}
                                onPilih={() => setFotoUtamaStatus('siap')}
                                onUlang={() => setFotoUtamaStatus('siap')}
                                onHapus={() => setFotoUtamaStatus('kosong')}
                              />
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                              <p className="text-xs sm:text-sm font-bold text-[#173b2b]">
                                Foto lain <span className="text-xs font-normal text-[#5a6b60]">(opsional, sampai 4)</span>
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {fotoLainStatus.map((st, idx) => (
                                  <UnggahFoto
                                    key={idx}
                                    label={`Foto ${idx + 2}`}
                                    ringkas
                                    status={st as 'kosong' | 'siap' | 'buram'}
                                    onPilih={() =>
                                      setFotoLainStatus((prev) => {
                                        const next = [...prev];
                                        next[idx] = 'siap';
                                        return next;
                                      })
                                    }
                                    onHapus={() =>
                                      setFotoLainStatus((prev) => {
                                        const next = [...prev];
                                        next[idx] = 'kosong';
                                        return next;
                                      })
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </section>

                        <section aria-labelledby="judul-harga" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                          <h2 id="judul-harga" className="text-base sm:text-lg font-extrabold text-[#173b2b]">
                            Harga
                          </h2>

                          <div className="flex flex-col gap-1 max-w-[320px]">
                            <label htmlFor="pb-harga" className="text-sm font-bold text-[#173b2b]">
                              Harga per {satuan} <span className="text-[#b42318]">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-3 text-sm font-bold text-[#5a6b60]">Rp</span>
                              <input
                                id="pb-harga"
                                type="text"
                                inputMode="numeric"
                                value={harga}
                                onChange={(e) => setHarga(e.target.value)}
                                className="w-full h-12 pl-10 pr-3 rounded-xl border border-[#7d877e] bg-white text-base font-extrabold text-[#173b2b]"
                              />
                            </div>
                            <p className="text-xs text-[#3f5247]">
                              Harga buncis di Pasok Tani minggu ini Rp 11.000 sampai Rp 15.000 per {satuan}.
                            </p>
                          </div>

                          {/* Wholesale configuration */}
                          <div className="pt-3 border-t border-[#eef0eb] flex flex-col gap-2.5">
                            {!grosirBuka ? (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setGrosirBuka(true)}
                                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#064e3b] hover:underline cursor-pointer"
                                >
                                  + Tambah harga grosir (opsional)
                                </button>
                                <p className="text-xs text-[#5a6b60] mt-0.5">
                                  Harga lebih murah untuk pembelian banyak, misalnya untuk warung dan rumah makan.
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2.5">
                                <div className="flex justify-between items-center">
                                  <p className="text-sm font-extrabold text-[#173b2b]">Tingkat harga grosir</p>
                                  <button
                                    type="button"
                                    onClick={() => setGrosirBuka(false)}
                                    className="text-xs text-[#b42318] font-bold hover:underline"
                                  >
                                    Hapus semua grosir
                                  </button>
                                </div>

                                {grosirTingkat.map((t, idx) => (
                                  <div
                                    key={t.id}
                                    className="p-3 border border-[#dee3da] rounded-xl flex items-center gap-2.5 bg-[#fcfbf6]"
                                  >
                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#ebf2eb] text-[#064e3b] text-xs font-extrabold flex items-center justify-center">
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
                                            setGrosirTingkat((prev) =>
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
                                            setGrosirTingkat((prev) =>
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

                                {grosirTingkat.length < 5 && (
                                  <button
                                    type="button"
                                    onClick={handleAddTier}
                                    className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#a9cfae] text-xs font-extrabold text-[#064e3b] hover:bg-[#f6f8f4]"
                                  >
                                    + Tambah tingkat
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </section>
                      </>
                    )}

                    {/* STEP 3: STOK PERTAMA */}
                    {langkah === 3 && (
                      <>
                        <section aria-labelledby="judul-jumlah" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                          <label id="judul-jumlah" htmlFor="pb-jumlah" className="text-base font-extrabold text-[#173b2b]">
                            Berapa {satuan} yang siap dijual?
                          </label>
                          <div className="flex items-center gap-2 max-w-[360px]">
                            <button
                              type="button"
                              onClick={() => setJumlahStok(String(Math.max(1, cleanStok - 5)))}
                              className="w-12 h-12 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-xl font-bold flex items-center justify-center hover:bg-[#f6f8f4]"
                            >
                              −
                            </button>
                            <div className="relative flex-1">
                              <input
                                id="pb-jumlah"
                                type="text"
                                inputMode="numeric"
                                value={jumlahStok}
                                onChange={(e) => setJumlahStok(e.target.value)}
                                className="w-full h-12 px-3 text-center rounded-xl border border-[#7d877e] bg-white text-xl font-extrabold text-[#173b2b]"
                              />
                              <span className="absolute right-3 top-3.5 text-xs font-bold text-[#5a6b60]">{satuan}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setJumlahStok(String(cleanStok + 5))}
                              className="w-12 h-12 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-xl font-bold flex items-center justify-center hover:bg-[#f6f8f4]"
                            >
                              +
                            </button>
                          </div>
                        </section>

                        <section aria-labelledby="judul-panen" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                          <fieldset className="border-0 p-0 m-0 flex flex-col gap-2">
                            <legend id="judul-panen" className="text-base font-extrabold text-[#173b2b]">
                              Kapan dipanen?
                            </legend>
                            <div className="grid grid-cols-2 gap-2">
                              {(
                                [
                                  { id: 'hari-ini', label: 'Hari ini', date: '8 Nov 2026' },
                                  { id: 'kemarin', label: 'Kemarin', date: '7 Nov 2026' },
                                  { id: '2-hari', label: '2 hari lalu', date: '6 Nov 2026' },
                                  { id: 'lain', label: 'Tanggal lain', date: 'Pilih manual' },
                                ] as const
                              ).map((op) => (
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
                                      name="pb-panen"
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
                              value={panenLainDate}
                              onChange={(e) => setPanenLainDate(e.target.value)}
                              className="h-11 px-3 rounded-xl border border-[#7d877e] bg-white text-sm"
                            />
                          )}
                        </section>

                        <section aria-labelledby="judul-ked" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                          <h2 id="judul-ked" className="text-base font-extrabold text-[#173b2b]">
                            Sampai kapan layak dijual?
                          </h2>
                          {kedaluwarsaOtomatis ? (
                            <div className="p-3 rounded-xl bg-[#f6f8f4] flex flex-wrap justify-between items-center gap-2">
                              <div>
                                <p className="font-extrabold text-sm sm:text-base text-[#173b2b]">
                                  {kedaluwarsaDate} (7 hari setelah panen)
                                </p>
                                <p className="text-xs text-[#3f5247]">Perkiraan standar komoditas buncis.</p>
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
                          <p className="text-xs text-[#5a6b60]">
                            Lewat tanggal ini, stok berhenti dijual otomatis.
                          </p>
                        </section>

                        <section aria-labelledby="judul-foto-stok" className="p-4 sm:p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                          <fieldset className="border-0 p-0 m-0 flex flex-col gap-2">
                            <legend id="judul-foto-stok" className="text-base font-extrabold text-[#173b2b]">
                              Foto stok ini <span className="text-xs text-[#5a6b60] font-normal">(opsional)</span>
                            </legend>
                            <div className="flex flex-col gap-2">
                              <label
                                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                                  fotoStokOpsi === 'sama' ? 'bg-[#ebf2eb] border-[#064e3b]' : 'bg-white border-[#dee3da]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="pb-foto-stok"
                                  checked={fotoStokOpsi === 'sama'}
                                  onChange={() => setFotoStokOpsi('sama')}
                                  className="accent-[#064e3b]"
                                />
                                <span className="text-xs sm:text-sm font-bold text-[#173b2b]">Pakai foto produk utama</span>
                              </label>
                              <label
                                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                                  fotoStokOpsi === 'baru' ? 'bg-[#ebf2eb] border-[#064e3b]' : 'bg-white border-[#dee3da]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="pb-foto-stok"
                                  checked={fotoStokOpsi === 'baru'}
                                  onChange={() => setFotoStokOpsi('baru')}
                                  className="accent-[#064e3b]"
                                />
                                <span className="text-xs sm:text-sm font-bold text-[#173b2b]">Foto baru khusus batch ini</span>
                              </label>
                            </div>
                          </fieldset>
                        </section>
                      </>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      {langkah > 1 && (
                        <button
                          type="button"
                          onClick={() => setLangkah((prev) => Math.max(1, prev - 1))}
                          className="flex-1 min-h-[48px] rounded-xl border border-[#dee3da] bg-white text-sm font-bold text-[#173b2b] hover:bg-[#f6f8f4]"
                        >
                          ← Kembali
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-2 min-h-[48px] rounded-xl bg-[#064e3b] text-white text-sm sm:text-base font-extrabold hover:bg-[#0f5132]"
                      >
                        {langkah === 3 ? 'Simpan dan tampilkan di toko' : 'Lanjut ke langkah berikutnya →'}
                      </button>
                    </div>

                    {langkah === 3 && (
                      <button
                        type="button"
                        onClick={handleSimpanDraf}
                        className="self-center text-xs text-[#157a4c] font-bold underline mt-1"
                      >
                        Belum ada stok? Simpan dulu, tampilkan nanti
                      </button>
                    )}
                  </form>

                  {/* Right Column: Live Buyer Card Preview */}
                  <aside
                    aria-labelledby="judul-pratinjau"
                    className="w-full lg:w-[280px] shrink-0 p-4 rounded-2xl bg-[#ebf2eb] flex flex-col gap-2.5"
                  >
                    <h2 id="judul-pratinjau" className="text-sm font-extrabold text-[#173b2b]">
                      Yang dilihat pembeli
                    </h2>
                    <div className="p-3 rounded-xl bg-white flex flex-col gap-2">
                      <div className="w-full aspect-4/3 rounded-lg bg-[#e3f1df] flex items-center justify-center text-[#2f7a3e]">
                        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-[#173b2b]">
                          {nama || 'Nama Produk'}
                        </p>
                        <p className="text-xs text-[#3f5247]">
                          <strong>Rp {cleanPrice.toLocaleString('id-ID')}</strong>/{satuan}
                        </p>
                        <p className="text-[11px] text-[#157a4c] font-bold mt-1">
                          {namaToko} · {lokasiToko}
                        </p>
                      </div>
                    </div>
                  </aside>
                </div>
              </>
            ) : (
              /* Success Screen */
              <div className="p-6 sm:p-8 rounded-2xl border-[1.5px] border-[#064e3b] bg-[#f3faf3] flex flex-col items-center text-center gap-3 max-w-[560px] mx-auto">
                <span className="w-14 h-14 rounded-full bg-[#064e3b] text-white flex items-center justify-center text-2xl font-bold">
                  ✓
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#173b2b]">
                  {nama} berhasil ditambahkan!
                </h2>
                <p className="text-xs sm:text-sm text-[#3f5247] leading-relaxed">
                  Produk sudah tersimpan dan dapat dilihat pembeli. Kamu bisa menambah stok atau mengatur diskon Surplus kapan pun.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    href={`/toko/produk/${nama.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex-1 min-h-[44px] px-4 rounded-xl bg-[#064e3b] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center hover:bg-[#0f5132]"
                  >
                    Lihat ringkasan produk
                  </Link>
                  <Link
                    href="/toko/produk"
                    className="min-h-[44px] px-4 rounded-xl border border-[#dee3da] bg-white text-xs sm:text-sm font-bold text-[#173b2b] flex items-center justify-center hover:bg-[#f6f8f4]"
                  >
                    Ke daftar produk
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

export default TokoProdukBaru;
