'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { ChipStatus } from '../common/ChipStatus';
import { JalurKomplain, type TahapKomplain } from '../common/JalurKomplain';
import { UnggahFoto } from '../common/UnggahFoto';

export type KategoriMasalahKomplain = 'layu' | 'kurang' | 'salah' | 'rusak' | 'lain';
export type SolusiKomplain = 'sebagian' | 'ulang' | 'penuh';
export type TahapKomplainView = 'baru' | 'diajukan' | 'ditanggapi' | 'dimediasi' | 'selesai' | 'kedaluwarsa';

export interface ProdukKomplainItem {
  id: string;
  nama: string;
  kategori?: string;
  harga: number;
  maxJumlah: number;
  jumlah: number;
  dipilih: boolean;
  foto?: string;
}

export interface KomplainProps {
  pesananId?: string;
  tahap?: TahapKomplainView;
  lewatMediasi?: boolean;
  produkList?: ProdukKomplainItem[];
  onSubmitKomplain?: (data: {
    pesananId: string;
    itemDipilih: Record<string, number>;
    jenisMasalah: string;
    cerita: string;
    solusi: string;
    fotoUrls: string[];
  }) => void;
  onTerimaTanggapan?: () => void;
  onMintaMediasi?: () => void;
  className?: string;
}

const DEFAULT_PRODUK_LIST: ProdukKomplainItem[] = [
  {
    id: 'tomat',
    nama: 'Tomat Merah Lembang',
    harga: 12000,
    maxJumlah: 12,
    jumlah: 2,
    dipilih: false,
  },
  {
    id: 'kol',
    nama: 'Kol Bulat Lembang',
    harga: 8000,
    maxJumlah: 16,
    jumlah: 4,
    dipilih: true,
  },
];

export function Komplain({
  pesananId = 'PT-26110418',
  tahap = 'baru',
  lewatMediasi = false,
  produkList = DEFAULT_PRODUK_LIST,
  onSubmitKomplain,
  onTerimaTanggapan,
  onMintaMediasi,
  className = '',
}: KomplainProps) {
  const ceritaInputId = useId();

  // Local state for 'baru' form
  const [tahapLokal, setTahapLokal] = useState<TahapKomplainView>(tahap);
  const [lewatLokal, setLewatLokal] = useState<boolean>(lewatMediasi);

  const [items, setItems] = useState<ProdukKomplainItem[]>(produkList);
  const [masalah, setMasalah] = useState<KategoriMasalahKomplain>('layu');
  const [cerita, setCerita] = useState('Sebagian daun kol luar tampak layu dan agak berlendir saat kardus dibuka.');
  const [solusi, setSolusi] = useState<SolusiKomplain>('sebagian');
  const [fotoList, setFotoList] = useState<string[]>([
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
  ]);
  const [galatList, setGalatList] = useState<string[]>([]);

  // Local state for 'ditanggapi' stage
  const [tanyaTerima, setTanyaTerima] = useState(false);
  const [pesanToast, setPesanToast] = useState('');

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  const dipilih = items.filter((it) => it.dipilih);
  const totalKgBermasalah = dipilih.reduce((acc, it) => acc + it.jumlah, 0);
  const nilaiSebagian = dipilih.reduce((acc, it) => acc + it.jumlah * it.harga, 0);

  const togglePilihItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, dipilih: !it.dipilih } : it))
    );
    setGalatList([]);
  };

  const ubahJumlahItem = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const baru = Math.max(1, Math.min(it.maxJumlah, it.jumlah + delta));
        return { ...it, jumlah: baru };
      })
    );
  };

  const handleKirimKomplain = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (dipilih.length === 0) {
      errors.push('Pilih minimal satu produk yang bermasalah.');
    }
    if (masalah === 'lain' && !cerita.trim()) {
      errors.push('Ceritakan masalahnya untuk pilihan Lainnya.');
    }
    if (fotoList.length === 0) {
      errors.push('Tambahkan minimal satu foto bukti.');
    }

    if (errors.length > 0) {
      setGalatList(errors);
      return;
    }

    const payloadItem: Record<string, number> = {};
    dipilih.forEach((it) => {
      payloadItem[it.id] = it.jumlah;
    });

    onSubmitKomplain?.({
      pesananId,
      itemDipilih: payloadItem,
      jenisMasalah: masalah,
      cerita,
      solusi,
      fotoUrls: fotoList,
    });

    // Advance to 'diajukan'
    setTahapLokal('diajukan');
  };

  const handleTerimaTawaran = () => {
    onTerimaTanggapan?.();
    setTahapLokal('selesai');
    setTanyaTerima(false);
    setPesanToast('Tawaran diterima. Rp 32.000 masuk ke saldo Dompet.');
  };

  const handleMintaMediasi = () => {
    onMintaMediasi?.();
    setTahapLokal('dimediasi');
    setLewatLokal(true);
    setPesanToast('Permintaan mediasi admin telah diteruskan.');
  };

  const masalahOptions: { id: KategoriMasalahKomplain; label: string }[] = [
    { id: 'layu', label: 'Layu, busuk, atau tidak segar' },
    { id: 'kurang', label: 'Jumlah kurang dari pesanan' },
    { id: 'salah', label: 'Produk salah' },
    { id: 'rusak', label: 'Rusak atau tumpah di jalan' },
    { id: 'lain', label: 'Lainnya' },
  ];

  const solusiOptions: { id: SolusiKomplain; label: string; ket: string }[] = [
    {
      id: 'sebagian',
      label: 'Kembalikan sebagian dana ke Dompet',
      ket: dipilih.length > 0
        ? `${formatRp(nilaiSebagian)} untuk ${totalKgBermasalah} kg yang bermasalah.`
        : 'Pilih produk dulu untuk melihat perkiraan pengembalian.',
    },
    {
      id: 'ulang',
      label: 'Kirim ulang produk yang sama',
      ket: dipilih.length > 0
        ? `${totalKgBermasalah} kg dikirim lagi sesuai stok kebun.`
        : 'Pilih produk dulu.',
    },
    {
      id: 'penuh',
      label: 'Kembalikan seluruh dana produk',
      ket: 'Rp 272.000. Untuk masalah berat yang mengenai seluruh kiriman.',
    },
  ];

  return (
    <div className={`min-h-full bg-[#fcfbf6] font-sans text-[#173b2b] ${className}`}>
      <SiteHeader signedIn={true} cartCount={0} />

      <main className="max-w-[1100px] mx-auto px-4 py-4 md:py-6 md:px-6 md:pb-16 box-border">
        {/* Breadcrumb */}
        <nav aria-label="Remah roti" className="text-[13px] text-[#5a6b60] mb-2.5">
          <Link
            href={`/pesanan/${pesananId}`}
            className="inline-flex items-center gap-1 min-h-8 text-[#157a4c] font-bold no-underline hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Pesanan {pesananId}
          </Link>
        </nav>

        {/* 1. STATE BARU: DISPUTE INITIATION FORM */}
        {tahapLokal === 'baru' && (
          <div className="flex flex-wrap items-start gap-6">
            <form
              onSubmit={handleKirimKomplain}
              className="flex-[999_1_560px] min-w-0 flex flex-col gap-4"
            >
              <div>
                <h1 className="m-0 text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                  Ajukan komplain
                </h1>
                <p className="mt-2 mb-0 text-sm md:text-[15px] leading-relaxed text-[#3f5247]">
                  Kebun Mang Ujang · tiba Min, 8 Nov, 10.24. Isi 4 hal: produk, masalah, foto, dan solusi yang kamu minta. Sekitar 3 menit.
                </p>
              </div>

              {/* Mobile SLA Alert */}
              <div className="md:hidden p-3.5 border-[1.5px] border-[#e9c75c] rounded-2xl bg-[#fffdf5] flex flex-col gap-2">
                <p className="m-0 text-sm font-extrabold text-[#173b2b]">
                  Sisa waktu komplain: 2 hari 1 jam
                </p>
                <div className="h-2 rounded-full bg-[#eef0eb] overflow-hidden">
                  <div className="h-full bg-[#064e3b] w-[68%]" />
                </div>
                <p className="m-0 text-xs leading-relaxed text-[#3f5247]">
                  Batas Rab, 11 Nov, 10.24. Dana Rp 272.000 tetap ditahan sampai komplain selesai.
                </p>
              </div>

              {/* Validation alert if errors */}
              {galatList.length > 0 && (
                <div
                  role="alert"
                  className="p-3.5 border-[1.5px] border-[#b42318] rounded-xl bg-[#fdecea] text-sm leading-relaxed text-[#8a1c12]"
                >
                  <strong>Belum bisa dikirim:</strong>
                  <ul className="mt-1 mb-0 pl-4 list-disc">
                    {galatList.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fieldset 1: Produk bermasalah */}
              <fieldset className="m-0 p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2">
                <legend className="px-1 text-sm md:text-base font-extrabold text-[#173b2b]">
                  1. Produk yang bermasalah
                </legend>
                <div className="divide-y divide-[#eef0eb]">
                  {items.map((prod) => (
                    <div
                      key={prod.id}
                      className="py-2.5 flex flex-wrap items-center justify-between gap-3"
                    >
                      <label className="flex-1 min-w-[200px] flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prod.dipilih}
                          onChange={() => togglePilihItem(prod.id)}
                          className="mt-1 w-5 h-5 accent-[#064e3b] cursor-pointer"
                        />
                        <div className="text-sm leading-snug">
                          <strong>{prod.nama}</strong>
                          <div className="text-xs text-[#5a6b60]">
                            {prod.maxJumlah} kg × {formatRp(prod.harga)}
                          </div>
                        </div>
                      </label>

                      {prod.dipilih && (
                        <div
                          role="group"
                          aria-label={`Jumlah bermasalah ${prod.nama}`}
                          className="inline-flex items-center gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => ubahJumlahItem(prod.id, -1)}
                            className="w-8 h-8 rounded-lg border border-[#c9d2c6] bg-white text-base font-extrabold text-[#173b2b] cursor-pointer hover:bg-[#ebf2eb]"
                          >
                            −
                          </button>
                          <span className="min-w-12 text-center text-sm font-extrabold">
                            {prod.jumlah} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => ubahJumlahItem(prod.id, 1)}
                            className="w-8 h-8 rounded-lg border border-[#c9d2c6] bg-white text-base font-extrabold text-[#173b2b] cursor-pointer hover:bg-[#ebf2eb]"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </fieldset>

              {/* Fieldset 2: Masalahnya apa */}
              <fieldset className="m-0 p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                <legend className="px-1 text-sm md:text-base font-extrabold text-[#173b2b]">
                  2. Masalahnya apa?
                </legend>

                <div className="flex flex-col gap-1.5">
                  {masalahOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2.5 min-h-10 cursor-pointer text-sm"
                    >
                      <input
                        type="radio"
                        name="masalah"
                        value={opt.id}
                        checked={masalah === opt.id}
                        onChange={() => {
                          setMasalah(opt.id);
                          setGalatList([]);
                        }}
                        className="w-4 h-4 accent-[#064e3b] cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-col gap-1 pt-1">
                  <label htmlFor={ceritaInputId} className="text-xs font-bold text-[#5a6b60]">
                    Ceritakan singkat{' '}
                    <span className="font-normal">
                      {masalah === 'lain' ? '(wajib untuk Lainnya)' : '(opsional)'}
                    </span>
                  </label>
                  <textarea
                    id={ceritaInputId}
                    rows={3}
                    maxLength={500}
                    value={cerita}
                    onChange={(e) => setCerita(e.target.value)}
                    placeholder="Contoh: sayur layu di bagian luar saat dibuka..."
                    className="w-full p-2.5 rounded-xl border border-[#c9d2c6] text-sm text-[#173b2b] focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
                  />
                  <span className="text-[11px] text-[#5a6b60] text-right">
                    {cerita.length}/500 karakter
                  </span>
                </div>
              </fieldset>

              {/* Fieldset 3: Foto bukti */}
              <fieldset className="m-0 p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                <legend className="px-1 text-sm md:text-base font-extrabold text-[#173b2b]">
                  3. Foto bukti <span className="text-xs font-normal text-[#5a6b60]">(minimal 1, sampai 3)</span>
                </legend>
                <p className="m-0 text-xs text-[#5a6b60] leading-relaxed">
                  Foto sebelum barang dibuang. Perlihatkan bagian yang bermasalah dan label kemasan.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <UnggahFoto
                    bentuk="persegi"
                    ringkas={true}
                    wajib={false}
                    status={fotoList[0] ? 'siap' : 'kosong'}
                    fotoUrl={fotoList[0]}
                    onPilih={() => {
                      if (!fotoList[0]) {
                        setFotoList((prev) => [
                          ...prev,
                          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
                        ]);
                      }
                      setGalatList([]);
                    }}
                    onHapus={() => setFotoList((prev) => prev.slice(1))}
                  />
                  <UnggahFoto
                    bentuk="persegi"
                    ringkas={true}
                    wajib={false}
                    status={fotoList[1] ? 'siap' : 'kosong'}
                    fotoUrl={fotoList[1]}
                    onPilih={() => {
                      if (!fotoList[1]) {
                        setFotoList((prev) => [
                          ...prev,
                          'https://images.unsplash.com/photo-1597362070388-75b22256df2e?auto=format&fit=crop&w=300&q=80',
                        ]);
                      }
                      setGalatList([]);
                    }}
                    onHapus={() =>
                      setFotoList((prev) => prev.filter((_, i) => i !== 1))
                    }
                  />
                  <UnggahFoto
                    bentuk="persegi"
                    ringkas={true}
                    wajib={false}
                    status={fotoList[2] ? 'siap' : 'kosong'}
                    fotoUrl={fotoList[2]}
                    onPilih={() => {
                      if (!fotoList[2]) {
                        setFotoList((prev) => [
                          ...prev,
                          'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80',
                        ]);
                      }
                      setGalatList([]);
                    }}
                    onHapus={() =>
                      setFotoList((prev) => prev.filter((_, i) => i !== 2))
                    }
                  />
                </div>
              </fieldset>

              {/* Fieldset 4: Solusi yang kamu minta */}
              <fieldset className="m-0 p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                <legend className="px-1 text-sm md:text-base font-extrabold text-[#173b2b]">
                  4. Solusi yang kamu minta
                </legend>
                <div className="flex flex-col gap-2">
                  {solusiOptions.map((opt) => {
                    const isSelected = solusi === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer ${
                          isSelected
                            ? 'border-[#064e3b] bg-[#f3faf3]'
                            : 'border-[#dee3da] bg-white hover:bg-[#fcfbf6]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="solusi"
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => {
                            setSolusi(opt.id);
                            setGalatList([]);
                          }}
                          className="mt-0.5 w-4 h-4 accent-[#064e3b] cursor-pointer"
                        />
                        <div className="text-sm leading-snug">
                          <strong>{opt.label}</strong>
                          <div className="text-xs text-[#5a6b60] mt-0.5">{opt.ket}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <p className="m-0 text-xs leading-relaxed text-[#5a6b60]">
                Dengan mengirim, kamu setuju foto dan ceritamu dilihat petani dan admin jika butuh mediasi. Petani memutuskan lebih dulu; jika tidak sepakat, kamu bisa meminta mediasi admin.
              </p>

              {/* Form Actions (Desktop) */}
              <div className="hidden md:flex flex-wrap gap-2.5 pt-1">
                <button
                  type="submit"
                  className="min-h-12 px-6 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                >
                  Kirim komplain
                </button>
                <Link
                  href={`/pesanan/${pesananId}`}
                  className="inline-flex items-center min-h-12 px-4 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold no-underline hover:bg-[#f6f8f5]"
                >
                  Batal
                </Link>
              </div>

              {/* Mobile details & sticky bar */}
              <div className="md:hidden flex flex-col gap-3">
                <details className="border border-[#dee3da] rounded-xl bg-white p-3">
                  <summary className="font-extrabold text-sm cursor-pointer list-none flex justify-between items-center">
                    <span>Apa yang terjadi setelah ini?</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="pt-3">
                    <JalurKomplain tahap="diajukan" />
                  </div>
                </details>

                <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-white border-t border-[#dee3da] flex gap-2 shadow-lg">
                  <Link
                    href={`/pesanan/${pesananId}`}
                    className="flex-1 inline-flex items-center justify-center min-h-12 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold no-underline hover:bg-[#f6f8f5]"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    className="flex-[1.4] min-h-12 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                  >
                    Kirim komplain
                  </button>
                </div>
              </div>
            </form>

            {/* Desktop Sidebar */}
            <aside
              aria-label="Waktu dan proses"
              className="hidden md:flex flex-[1_1_320px] min-w-0 flex-col gap-4"
            >
              <section
                aria-labelledby="judul-waktu"
                className="p-4 border-[1.5px] border-[#e9c75c] rounded-2xl bg-[#fffdf5] flex flex-col gap-2.5"
              >
                <h2 id="judul-waktu" className="m-0 text-xs font-bold text-[#5a6b60]">
                  Sisa waktu komplain
                </h2>
                <p className="m-0 text-base font-extrabold text-[#173b2b]">
                  2 hari 1 jam
                </p>
                <div className="h-2 rounded-full bg-[#eef0eb] overflow-hidden">
                  <div className="h-full bg-[#064e3b] w-[68%]" />
                </div>
                <p className="m-0 text-xs text-[#5a6b60] leading-relaxed">
                  Batas: Rab, 11 Nov, 10.24 WIB. Dana Rp 272.000 tetap ditahan sampai komplain selesai.
                </p>
              </section>

              <section
                aria-labelledby="judul-dana"
                className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <h2 id="judul-dana" className="m-0 text-xs font-bold text-[#5a6b60]">
                    Dana pesanan
                  </h2>
                  <ChipStatus status="dana-ditahan" />
                </div>
                <p className="m-0 text-xs leading-relaxed text-[#3f5247]">
                  Rp 272.000 untuk produk tetap ditahan Pasok Tani sampai komplain selesai. Tidak diteruskan otomatis ke petani selama masa komplain.
                </p>
              </section>

              <section
                aria-labelledby="judul-proses"
                className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
              >
                <h2 id="judul-proses" className="m-0 text-sm font-extrabold text-[#173b2b]">
                  Setelah kamu kirim
                </h2>
                <JalurKomplain tahap="diajukan" />
              </section>
            </aside>
          </div>
        )}

        {/* 2. STATE KEDALUWARSA */}
        {tahapLokal === 'kedaluwarsa' && (
          <div className="max-w-xl mx-auto p-6 border border-[#dee3da] rounded-2xl bg-white flex flex-col items-start gap-3.5">
            <ChipStatus status="dana-diteruskan" />
            <h1 className="m-0 text-2xl font-extrabold tracking-tight leading-tight">
              Batas komplain sudah lewat
            </h1>
            <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
              Batas komplain adalah 3 hari setelah pesanan tiba. Karena waktu telah berakhir, dana transaksi sebesar Rp 272.000 sudah diteruskan ke rekening petani.
            </p>
            <p className="m-0 text-xs leading-relaxed text-[#5a6b60]">
              Masih ada hal yang ingin dikomunikasikan? Kamu bisa menghubungi petani secara langsung lewat fitur Obrolan atau membaca bantuan di Pusat Bantuan.
            </p>
            <div className="flex flex-wrap gap-2.5 w-full pt-2">
              <Link
                href="/obrolan"
                className="flex-1 inline-flex items-center justify-center min-h-11 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold no-underline hover:bg-[#157a4c]"
              >
                Obrolan dengan petani
              </Link>
              <Link
                href="/bantuan"
                className="flex-1 inline-flex items-center justify-center min-h-11 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold no-underline hover:bg-[#ebf2eb]"
              >
                Pusat Bantuan
              </Link>
            </div>
          </div>
        )}

        {/* 3. STATUS STATES: diajukan, ditanggapi, dimediasi, selesai */}
        {tahapLokal !== 'baru' && tahapLokal !== 'kedaluwarsa' && (
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex-[999_1_560px] min-w-0 flex flex-col gap-4">
              {/* Status Header Banner */}
              <section className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                <ChipStatus
                  status={
                    tahapLokal === 'diajukan'
                      ? 'komplain-diajukan'
                      : tahapLokal === 'ditanggapi'
                      ? 'komplain-ditanggapi'
                      : tahapLokal === 'dimediasi'
                      ? 'komplain-dimediasi'
                      : 'selesai'
                  }
                />
                <div>
                  <h1 className="m-0 text-xl md:text-2xl font-extrabold tracking-tight leading-snug">
                    {tahapLokal === 'diajukan' && 'Komplain terkirim. Menunggu tanggapan petani'}
                    {tahapLokal === 'ditanggapi' && 'Petani menawarkan penyelesaian'}
                    {tahapLokal === 'dimediasi' && 'Admin sedang meninjau komplain'}
                    {tahapLokal === 'selesai' && 'Komplain selesai'}
                  </h1>
                  <p className="mt-1.5 mb-0 text-sm leading-relaxed text-[#3f5247]">
                    {tahapLokal === 'diajukan' && 'Petani memiliki waktu 24 jam untuk menanggapi komplain ini. Kamu akan menerima notifikasi segera setelah petani menjawab.'}
                    {tahapLokal === 'ditanggapi' && 'Kebun Mang Ujang telah menanggapi keluhanmu. Kamu bisa menerima tawaran solusi atau meminta mediasi admin Pasok Tani.'}
                    {tahapLokal === 'dimediasi' && 'Admin independen Pasok Tani sedang memeriksa bukti foto dan penjelasan kedua pihak. Keputusan admin bersifat final.'}
                    {tahapLokal === 'selesai' && (lewatLokal
                      ? 'Admin telah memutuskan pengembalian dana Rp 32.000 ke saldo Dompet dan sisanya diteruskan ke petani.'
                      : 'Tawaran petani disepakati. Rp 32.000 telah masuk ke saldo Dompet dan pesanan ditutup.')}
                  </p>
                </div>
                {pesanToast && (
                  <p aria-live="polite" className="m-0 text-sm font-bold text-[#157a4c]">
                    {pesanToast}
                  </p>
                )}
              </section>

              {/* Farmer Response Card (when ditanggapi) */}
              {tahapLokal === 'ditanggapi' && (
                <section
                  aria-labelledby="judul-tawaran"
                  className="p-5 border-[1.5px] border-[#064e3b] rounded-2xl bg-[#f3faf3] flex flex-col gap-3"
                >
                  <h2 id="judul-tawaran" className="m-0 text-base font-extrabold text-[#173b2b]">
                    Tanggapan Kebun Mang Ujang · Sen, 9 Nov, 13.05
                  </h2>
                  <blockquote className="m-0 text-sm leading-relaxed text-[#173b2b] italic">
                    “Mohon maaf Bu Dewi, sayur kol memang sempat transit di gudang agak lama karena hujan. Saya ganti Rp 32.000 untuk 4 kg yang layu, langsung kembali ke saldo Dompet ibu.”
                  </blockquote>

                  <dl className="m-0 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-[#5a6b60]">Yang kamu minta:</dt>
                      <dd className="m-0 font-medium">Kembalikan sebagian dana (Rp 32.000)</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#5a6b60]">Yang ditawarkan petani:</dt>
                      <dd className="m-0 font-extrabold text-[#064e3b]">Rp 32.000 ke Dompet</dd>
                    </div>
                  </dl>

                  {/* Confirmation Inline Box */}
                  {tanyaTerima ? (
                    <div
                      role="group"
                      aria-label="Konfirmasi menerima tawaran"
                      className="p-3.5 rounded-xl bg-white border border-[#a9cfae] flex flex-col gap-2"
                    >
                      <p className="m-0 text-xs leading-relaxed text-[#173b2b]">
                        <strong>Terima dan tutup komplain?</strong> Rp 32.000 masuk ke saldo Dompet sekarang, Rp 240.000 diteruskan ke petani. Komplain ini tidak dapat dibuka kembali.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleTerimaTawaran}
                          className="min-h-10 px-4 rounded-xl border-0 bg-[#064e3b] text-white text-xs font-extrabold cursor-pointer hover:bg-[#157a4c]"
                        >
                          Ya, terima Rp 32.000
                        </button>
                        <button
                          type="button"
                          onClick={() => setTanyaTerima(false)}
                          className="min-h-10 px-3 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-xs font-bold cursor-pointer hover:bg-[#f6f8f5]"
                        >
                          Pikir dulu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setTanyaTerima(true)}
                        className="flex-1 min-h-11 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                      >
                        Terima Rp 32.000
                      </button>
                      <button
                        type="button"
                        onClick={handleMintaMediasi}
                        className="flex-1 min-h-11 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold cursor-pointer hover:bg-[#ebf2eb]"
                      >
                        Minta mediasi admin
                      </button>
                    </div>
                  )}
                  <p className="m-0 text-[11px] text-[#5a6b60]">
                    Mediasi admin: tim Pasok Tani memeriksa bukti foto dan obrolan. Keputusan admin mengikat kedua pihak.
                  </p>
                </section>
              )}

              {/* Dispute Progress Timeline */}
              <section className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                <h2 className="m-0 text-base font-extrabold text-[#173b2b]">
                  Perkembangan komplain
                </h2>
                <JalurKomplain
                  tahap={tahapLokal as TahapKomplain}
                  lewatMediasi={lewatLokal}
                />
              </section>

              {/* Recap "Komplainmu" */}
              <section className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3">
                <h2 className="m-0 text-base font-extrabold text-[#173b2b]">
                  Komplainmu
                </h2>
                <dl className="m-0 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-[#5a6b60]">Produk:</dt>
                    <dd className="m-0 font-bold text-[#173b2b]">Kol Bulat Lembang (4 kg)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#5a6b60]">Masalah:</dt>
                    <dd className="m-0 font-bold text-[#173b2b]">Layu, busuk, atau tidak segar</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#5a6b60]">Solusi diminta:</dt>
                    <dd className="m-0 font-bold text-[#173b2b]">Kembalikan sebagian dana (Rp 32.000)</dd>
                  </div>
                </dl>

                <p className="m-0 p-3 rounded-xl bg-[#fcfbf6] border border-[#eef0eb] text-xs leading-relaxed text-[#3f5247]">
                  “{cerita}”
                </p>

                {/* Photo Evidence Gallery */}
                <div className="flex gap-2 pt-1">
                  {fotoList.map((fUrl, idx) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={idx}
                      src={fUrl}
                      alt={`Bukti foto komplain ${idx + 1}`}
                      className="w-16 h-16 rounded-xl object-cover border border-[#dee3da]"
                    />
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside
              aria-label="Info dana komplain"
              className="flex-[1_1_320px] min-w-0 flex flex-col gap-4"
            >
              <section className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="m-0 text-xs font-bold text-[#5a6b60]">Dana pesanan</h2>
                  <ChipStatus
                    status={tahapLokal === 'selesai' ? 'dana-diteruskan' : 'dana-ditahan'}
                  />
                </div>
                <p className="m-0 text-xs leading-relaxed text-[#3f5247]">
                  {tahapLokal === 'selesai'
                    ? 'Komplain telah selesai. Dana penyesuaian telah masuk ke Dompet dan sisanya telah ditransfer ke petani.'
                    : 'Rp 272.000 ditahan Pasok Tani. Selama komplain aktif, dana tidak akan diteruskan ke petani secara otomatis.'}
                </p>
              </section>

              <section className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5 text-xs">
                <h2 className="m-0 text-xs font-bold text-[#5a6b60]">Bantuan</h2>
                <Link
                  href="/obrolan"
                  className="font-bold text-[#064e3b] no-underline hover:underline"
                >
                  Buka obrolan dengan petani
                </Link>
                <Link
                  href={`/pesanan/${pesananId}`}
                  className="font-bold text-[#064e3b] no-underline hover:underline"
                >
                  Detail pesanan
                </Link>
                <Link
                  href="/bantuan"
                  className="font-bold text-[#064e3b] no-underline hover:underline"
                >
                  Pusat Bantuan
                </Link>
              </section>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

export default Komplain;
