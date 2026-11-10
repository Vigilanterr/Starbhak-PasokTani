'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import { ChipStatus } from '../common/ChipStatus';
import { Bintang } from '../common/Bintang';
import { UnggahFoto } from '../common/UnggahFoto';

export type KeadaanUlasan = 'tulis' | 'belum-diterima' | 'terkirim';

export interface ProdukUlasanItem {
  id: string;
  nama: string;
  kategori?: string;
  toko: string;
  foto?: string;
  satuan?: string;
  jumlah?: number;
}

export interface FormUlasanPerProduk {
  nilai: number;
  komentar: string;
  tag: string[];
  fotoUrls: string[];
}

export interface RingkasanUlasanItem {
  nama: string;
  nilai: number;
  komentar: string;
}

export interface UlasanProps {
  pesananId?: string;
  produkList?: ProdukUlasanItem[];
  keadaan?: KeadaanUlasan;
  onKirimUlasan?: (ulasanMap: Record<string, FormUlasanPerProduk>) => void;
  className?: string;
}

const DEFAULT_PRODUK_ULASAN: ProdukUlasanItem[] = [
  {
    id: 'tomat',
    nama: 'Tomat Merah Lembang',
    kategori: 'sayuran',
    toko: 'Kebun Mang Ujang',
    satuan: 'kg',
    jumlah: 12,
  },
  {
    id: 'kol',
    nama: 'Kol Bulat Lembang',
    kategori: 'sayuran',
    toko: 'Kebun Mang Ujang',
    satuan: 'kg',
    jumlah: 16,
  },
];

const LABEL_NILAI = [
  'Belum dinilai',
  'Kurang',
  'Biasa saja',
  'Cukup baik',
  'Bagus',
  'Sangat bagus',
];

const TAG_PLUS = ['Segar', 'Sesuai foto', 'Kemasan rapi', 'Ukuran pas'];
const TAG_MINUS = ['Kurang segar', 'Berbeda dari foto', 'Kemasan rusak', 'Jumlah kurang'];

export function Ulasan({
  pesananId = 'PT-26110418',
  produkList = DEFAULT_PRODUK_ULASAN,
  keadaan = 'tulis',
  onKirimUlasan,
  className = '',
}: UlasanProps) {
  const [keadaanLokal, setKeadaanLokal] = useState<KeadaanUlasan>(keadaan);
  const [galat, setGalat] = useState('');
  const [sembunyiNama, setSembunyiNama] = useState(false);

  // Per-product review state maps
  const [nilaiMap, setNilaiMap] = useState<Record<string, number>>({
    tomat: 5,
    kol: 4,
  });
  const [komentarMap, setKomentarMap] = useState<Record<string, string>>({
    tomat: 'Tomat segar, padat, dan warna merah merata. Sangat cocok untuk olahan sambal.',
    kol: 'Kol cukup renyah dan kemasan rapi.',
  });
  const [tagMap, setTagMap] = useState<Record<string, string[]>>({
    tomat: ['Segar', 'Kemasan rapi'],
    kol: ['Ukuran pas'],
  });
  const [fotoMap, setFotoMap] = useState<Record<string, string[]>>({
    tomat: [],
    kol: [],
  });

  const handlePilihBintang = (pId: string, rating: number) => {
    setNilaiMap((prev) => ({ ...prev, [pId]: rating }));
    setGalat('');
  };

  const handleToggleTag = (pId: string, tagLabel: string) => {
    setTagMap((prev) => {
      const currentTags = prev[pId] ?? [];
      const exists = currentTags.includes(tagLabel);
      return {
        ...prev,
        [pId]: exists
          ? currentTags.filter((t) => t !== tagLabel)
          : [...currentTags, tagLabel],
      };
    });
  };

  const handleKirim = (e: React.FormEvent) => {
    e.preventDefault();
    const hasRatedAny = produkList.some((p) => (nilaiMap[p.id] ?? 0) > 0);
    if (!hasRatedAny) {
      setGalat('Pilih bintang untuk minimal satu produk yang ingin kamu nilai.');
      return;
    }

    const payload: Record<string, FormUlasanPerProduk> = {};
    produkList.forEach((p) => {
      const val = nilaiMap[p.id] ?? 0;
      if (val > 0) {
        payload[p.id] = {
          nilai: val,
          komentar: komentarMap[p.id] ?? '',
          tag: tagMap[p.id] ?? [],
          fotoUrls: fotoMap[p.id] ?? [],
        };
      }
    });

    onKirimUlasan?.(payload);
    setKeadaanLokal('terkirim');
  };

  const maskedName = sembunyiNama ? 'D****i' : 'Dewi L.';

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

        {/* 1. KEADAAN TULIS */}
        {keadaanLokal === 'tulis' && (
          <div className="flex flex-wrap items-start gap-6">
            <form
              onSubmit={handleKirim}
              className="flex-[999_1_560px] min-w-0 flex flex-col gap-4"
            >
              <div>
                <h1 className="m-0 text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                  Beri ulasan
                </h1>
                <p className="mt-2 mb-0 text-sm md:text-[15px] leading-relaxed text-[#3f5247]">
                  Dari Kebun Mang Ujang · tiba Min, 8 Nov · diterima Sen, 9 Nov. Boleh mengisi sebagian produk saja. Sekitar 1 menit.
                </p>
              </div>

              {galat && (
                <p
                  role="alert"
                  className="m-0 p-3.5 border-[1.5px] border-[#b42318] rounded-xl bg-[#fdecea] text-sm font-bold text-[#8a1c12]"
                >
                  {galat}
                </p>
              )}

              {/* Per-Product Review Fieldsets */}
              {produkList.map((prod) => {
                const currentRating = nilaiMap[prod.id] ?? 0;
                const activeTags = currentRating >= 4 ? TAG_PLUS : currentRating >= 1 ? TAG_MINUS : [];
                const isLowRating = currentRating >= 1 && currentRating <= 2;
                const commentText = komentarMap[prod.id] ?? '';

                return (
                  <fieldset
                    key={prod.id}
                    className="m-0 p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3.5"
                  >
                    <legend className="sr-only">Ulasan {prod.nama}</legend>

                    {/* Product Header */}
                    <div className="flex items-center gap-3">
                      <span
                        role="img"
                        aria-label={`Foto ${prod.nama}`}
                        className="w-14 h-14 rounded-xl grid place-items-center bg-[#e3f1df] text-[#2f7a3e] shrink-0"
                      >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <p className="m-0 text-base font-extrabold text-[#173b2b]">
                          {prod.nama}
                        </p>
                        <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                          {prod.jumlah} {prod.satuan} · {prod.toko}
                        </p>
                      </div>
                    </div>

                    {/* Interactive 5-Star Rating Picker */}
                    <div>
                      <p className="m-0 mb-1.5 text-xs font-bold text-[#5a6b60]">
                        Seberapa puas kamu?
                      </p>
                      <div
                        role="radiogroup"
                        aria-label={`Penilaian untuk ${prod.nama}`}
                        className="flex flex-wrap items-center gap-1"
                      >
                        {[1, 2, 3, 4, 5].map((starIdx) => {
                          const isFilled = starIdx <= currentRating;
                          return (
                            <button
                              key={starIdx}
                              type="button"
                              role="radio"
                              aria-checked={currentRating === starIdx}
                              aria-label={`${starIdx} dari 5, ${LABEL_NILAI[starIdx] ?? ''}`}
                              onClick={() => handlePilihBintang(prod.id, starIdx)}
                              className={`w-12 h-12 rounded-xl grid place-items-center border-0 cursor-pointer ${
                                currentRating === starIdx ? 'bg-[#fbf3d9]' : 'bg-transparent hover:bg-[#f6f8f5]'
                              }`}
                            >
                              <svg
                                width="30"
                                height="30"
                                viewBox="0 0 24 24"
                                fill={isFilled ? '#a8862a' : 'none'}
                                stroke={isFilled ? '#a8862a' : '#6b7a70'}
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                              </svg>
                            </button>
                          );
                        })}
                        <span className="ml-2 text-xs font-bold text-[#173b2b]">
                          {LABEL_NILAI[currentRating] ?? 'Belum dinilai'}
                        </span>
                      </div>
                    </div>

                    {/* Contextual Feedback Tags */}
                    {activeTags.length > 0 && (
                      <div>
                        <p className="m-0 mb-1.5 text-xs font-bold text-[#5a6b60]">
                          Pilih hal yang berkesan:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeTags.map((tag) => {
                            const isChecked = (tagMap[prod.id] ?? []).includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                aria-pressed={isChecked}
                                onClick={() => handleToggleTag(prod.id, tag)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                                  isChecked
                                    ? 'border-[#064e3b] bg-[#064e3b] text-white'
                                    : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f5]'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Comments Textarea */}
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor={`komentar-${prod.id}`}
                        className="text-xs font-bold text-[#5a6b60]"
                      >
                        Ceritakan pengalamanmu
                      </label>
                      <textarea
                        id={`komentar-${prod.id}`}
                        rows={2}
                        maxLength={500}
                        value={commentText}
                        onChange={(e) =>
                          setKomentarMap((prev) => ({
                            ...prev,
                            [prod.id]: e.target.value,
                          }))
                        }
                        placeholder={
                          isLowRating
                            ? 'Tulis apa yang kurang supaya petani bisa memperbaiki...'
                            : 'Kondisi barang saat tiba, kesegaran, rasa...'
                        }
                        className="w-full p-2.5 rounded-xl border border-[#c9d2c6] text-sm text-[#173b2b] focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
                      />
                      <span className="text-[11px] text-[#5a6b60] text-right">
                        {commentText.length}/500
                      </span>
                    </div>

                    {/* Low rating escrow reminder */}
                    {isLowRating && (
                      <p className="m-0 p-3 rounded-xl bg-[#fffdf5] border border-[#e9c75c] text-xs leading-relaxed text-[#9a3412]">
                        Ulasan tidak mengembalikan dana. Kalau ada pesanan rusak atau bermasalah,{' '}
                        <Link
                          href={`/pesanan/${pesananId}/komplain`}
                          className="font-extrabold text-[#064e3b] underline"
                        >
                          ajukan komplain
                        </Link>{' '}
                        atau hubungi petani lewat obrolan.
                      </p>
                    )}

                    {/* Photos upload */}
                    <div>
                      <p className="m-0 mb-1.5 text-xs font-bold text-[#5a6b60]">
                        Foto <span className="font-normal">(opsional, sampai 3)</span>
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <UnggahFoto
                          bentuk="persegi"
                          ringkas={true}
                          wajib={false}
                          status={fotoMap[prod.id]?.[0] ? 'siap' : 'kosong'}
                          fotoUrl={fotoMap[prod.id]?.[0]}
                          onPilih={() =>
                            setFotoMap((prev) => ({
                              ...prev,
                              [prod.id]: [
                                ...(prev[prod.id] ?? []),
                                'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
                              ],
                            }))
                          }
                          onHapus={() =>
                            setFotoMap((prev) => ({
                              ...prev,
                              [prod.id]: (prev[prod.id] ?? []).filter((_, idx) => idx !== 0),
                            }))
                          }
                        />
                        <UnggahFoto
                          bentuk="persegi"
                          ringkas={true}
                          wajib={false}
                          status={fotoMap[prod.id]?.[1] ? 'siap' : 'kosong'}
                          fotoUrl={fotoMap[prod.id]?.[1]}
                          onPilih={() =>
                            setFotoMap((prev) => ({
                              ...prev,
                              [prod.id]: [
                                ...(prev[prod.id] ?? []),
                                'https://images.unsplash.com/photo-1597362070388-75b22256df2e?auto=format&fit=crop&w=300&q=80',
                              ],
                            }))
                          }
                          onHapus={() =>
                            setFotoMap((prev) => ({
                              ...prev,
                              [prod.id]: (prev[prod.id] ?? []).filter((_, idx) => idx !== 1),
                            }))
                          }
                        />
                        <UnggahFoto
                          bentuk="persegi"
                          ringkas={true}
                          wajib={false}
                          status={fotoMap[prod.id]?.[2] ? 'siap' : 'kosong'}
                          fotoUrl={fotoMap[prod.id]?.[2]}
                          onPilih={() =>
                            setFotoMap((prev) => ({
                              ...prev,
                              [prod.id]: [
                                ...(prev[prod.id] ?? []),
                                'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80',
                              ],
                            }))
                          }
                          onHapus={() =>
                            setFotoMap((prev) => ({
                              ...prev,
                              [prod.id]: (prev[prod.id] ?? []).filter((_, idx) => idx !== 2),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </fieldset>
                );
              })}

              {/* Anonymity Card */}
              <div className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sembunyiNama}
                    onChange={(e) => setSembunyiNama(e.target.checked)}
                    className="mt-0.5 w-5 h-5 accent-[#064e3b] cursor-pointer"
                  />
                  <div className="text-sm leading-snug">
                    <strong>Sembunyikan namaku</strong>
                    <div className="text-xs text-[#5a6b60] mt-0.5">
                      Tampil ke publik sebagai <strong>{maskedName}</strong>. Petani tetap tahu nomor pesananmu.
                    </div>
                  </div>
                </label>
                <p className="m-0 text-xs text-[#5a6b60] leading-relaxed">
                  Ulasan tampil di halaman produk dan toko petani. Kamu dapat mengeditnya sekali dalam 7 hari.
                </p>
              </div>

              {/* Action Buttons (Desktop) */}
              <div className="hidden md:flex flex-wrap gap-2.5 pt-1">
                <button
                  type="submit"
                  className="min-h-12 px-6 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                >
                  Kirim ulasan
                </button>
                <Link
                  href={`/pesanan/${pesananId}`}
                  className="inline-flex items-center min-h-12 px-4 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold no-underline hover:bg-[#f6f8f5]"
                >
                  Nanti saja
                </Link>
              </div>

              {/* Mobile Sticky Bar */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white border-t border-[#dee3da] flex gap-2 shadow-lg">
                <Link
                  href={`/pesanan/${pesananId}`}
                  className="flex-1 inline-flex items-center justify-center min-h-12 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold no-underline hover:bg-[#f6f8f5]"
                >
                  Nanti saja
                </Link>
                <button
                  type="submit"
                  className="flex-[1.4] min-h-12 rounded-xl border-0 bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                >
                  Kirim ulasan
                </button>
              </div>
            </form>

            {/* Aside Sidebar */}
            <aside
              aria-label="Tentang ulasan"
              className="hidden md:flex flex-[1_1_300px] min-w-0 flex-col gap-4"
            >
              <section className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                <h2 className="m-0 text-xs font-bold text-[#5a6b60]">Pesanan ini</h2>
                <ChipStatus status="selesai" />
                <p className="m-0 text-xs leading-relaxed text-[#173b2b]">
                  {pesananId} · Tomat 12 kg &amp; Kol 16 kg
                  <br />
                  <span className="text-[#5a6b60]">
                    Dikonfirmasi Sen, 9 Nov. Dana telah diteruskan ke petani.
                  </span>
                </p>
              </section>

              <section className="p-4 rounded-2xl bg-[#ebf2eb] text-xs leading-relaxed text-[#173b2b]">
                <p className="m-0 font-extrabold text-[#064e3b] mb-1">
                  Ulasan yang membantu
                </p>
                <p className="m-0 text-[#3f5247]">
                  Ceritakan kondisi paket saat tiba, kesegaran sayur, dan kemasan. Hindari mencantumkan nomor telepon atau data pribadi.
                </p>
              </section>
            </aside>
          </div>
        )}

        {/* 2. KEADAAN BELUM DITERIMA */}
        {keadaanLokal === 'belum-diterima' && (
          <div className="max-w-xl mx-auto p-6 border-[1.5px] border-[#e9c75c] rounded-2xl bg-[#fffdf5] flex flex-col items-start gap-3.5">
            <ChipStatus status="tiba" />
            <h1 className="m-0 text-2xl font-extrabold tracking-tight leading-tight">
              Ulasan dibuka setelah pesanan diterima
            </h1>
            <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
              Pesanan {pesananId} sudah tiba di alamat tujuan, tapi belum kamu konfirmasi penerimaannya. Periksa kondisi produk terlebih dahulu. Setelah dikonfirmasi, kamu bisa menuliskan ulasan.
            </p>
            <p className="m-0 text-xs leading-relaxed text-[#5a6b60]">
              Ada bagian yang tidak sesuai atau rusak? Ajukan komplain sebelum melakukan konfirmasi pesanan.
            </p>
            <div className="flex flex-wrap gap-2.5 w-full pt-2">
              <Link
                href={`/pesanan/${pesananId}`}
                className="flex-1 inline-flex items-center justify-center min-h-11 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold no-underline hover:bg-[#157a4c]"
              >
                Ke detail pesanan
              </Link>
              <Link
                href={`/pesanan/${pesananId}/komplain`}
                className="flex-1 inline-flex items-center justify-center min-h-11 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold no-underline hover:bg-[#ebf2eb]"
              >
                Ajukan komplain
              </Link>
            </div>
          </div>
        )}

        {/* 3. KEADAAN TERKIRIM */}
        {keadaanLokal === 'terkirim' && (
          <div className="max-w-xl mx-auto flex flex-col gap-4">
            <div className="p-6 border-[1.5px] border-[#064e3b] rounded-2xl bg-[#f3faf3] flex flex-col items-start gap-3">
              <span
                aria-hidden="true"
                className="w-11 h-11 rounded-full grid place-items-center bg-[#064e3b] text-white shrink-0"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h1 className="m-0 text-2xl font-extrabold tracking-tight leading-tight">
                Ulasanmu terkirim
              </h1>
              <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
                Terima kasih telah memberikan ulasan. Pendapatmu membantu pembeli lain dan petani untuk terus meningkatkan mutu hasil panen mereka.
              </p>
            </div>

            <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
              {produkList.map((prod) => (
                <li
                  key={prod.id}
                  className="p-4 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2"
                >
                  <p className="m-0 text-sm font-extrabold text-[#173b2b]">
                    {prod.nama}
                  </p>
                  <Bintang nilai={nilaiMap[prod.id] ?? 5} ukuran={18} />
                  <p className="m-0 text-xs text-[#3f5247] leading-relaxed">
                    {komentarMap[prod.id] || 'Tanpa komentar tertulis.'}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <Link
                href="/pesanan"
                className="flex-1 inline-flex items-center justify-center min-h-12 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold no-underline hover:bg-[#157a4c]"
              >
                Ke pesanan saya
              </Link>
              <Link
                href={`/pesanan/${pesananId}`}
                className="flex-1 inline-flex items-center justify-center min-h-12 rounded-xl border border-[#064e3b] bg-white text-[#064e3b] text-sm font-extrabold no-underline hover:bg-[#ebf2eb]"
              >
                Lihat detail pesanan
              </Link>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

export default Ulasan;
