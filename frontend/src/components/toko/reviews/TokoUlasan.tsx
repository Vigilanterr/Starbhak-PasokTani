'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { Bintang } from '../../common/Bintang';

export interface UlasanTokoItem {
  id: string;
  namaPembeli: string;
  fotoPembeli?: string;
  nilai: number;
  tanggal: string;
  produk: string;
  komentar: string;
  fotoUlasan?: string[];
  balasanPetani?: {
    tanggal: string;
    pesan: string;
  };
  statusLaporkan?: boolean;
}

export interface TokoUlasanProps {
  ulasanList?: UlasanTokoItem[];
  kosong?: boolean;
  lapor?: boolean;
  onBalasUlasan?: (ulasanId: string, balasan: string) => void;
  onLaporkanUlasan?: (ulasanId: string, alasan: string) => void;
  hrefPesanan?: string;
  className?: string;
}

const DEFAULT_ULASAN_LIST: UlasanTokoItem[] = [
  {
    id: 'r1',
    namaPembeli: 'Warung Dewi',
    nilai: 5,
    tanggal: 'Hari ini, 09.12',
    produk: 'Tomat Merah Lembang 12 kg',
    komentar: 'Tomatnya segar sekali, merah merata dan tidak ada yang pecah. Pembeli warung saya suka. Langsung langganan.',
    fotoUlasan: ['/images/reviews/tomat-1.jpg'],
  },
  {
    id: 'r2',
    namaPembeli: 'Asep Saepudin',
    nilai: 5,
    tanggal: 'Kemarin, 14.30',
    produk: 'Kol Bulat Lembang 5 kg',
    komentar: 'Pengiriman kilat dengan GrabExpress, kol padat dan bersih. Mantap mang Ujang!',
  },
  {
    id: 'r3',
    namaPembeli: 'Rina Marlina',
    nilai: 4,
    tanggal: 'Sab, 7 Nov',
    produk: 'Tomat Merah Lembang 5 kg',
    komentar: 'Bagus dan segar, cuma ada 2 buah yang agak kematangan. Tapi overall puas, terima kasih.',
    balasanPetani: {
      tanggal: 'Sab, 7 Nov',
      pesan: 'Terima kasih Bu Rina. Besok kami pilih yang lebih keras ya.',
    },
  },
  {
    id: 'r4',
    namaPembeli: 'Katering Sari Rasa',
    nilai: 5,
    tanggal: 'Jum, 6 Nov',
    produk: 'Tomat Merah Lembang 25 kg',
    komentar: 'Kualitas stabil untuk masak hajatan. Sangat direkomendasikan untuk katering.',
  },
  {
    id: 'r5',
    namaPembeli: 'Rudi Hartono',
    nilai: 2,
    tanggal: 'Sel, 3 Nov',
    produk: 'Tomat Merah Lembang 5 kg',
    komentar: 'Kurirnya melempar paket ke teras jadi sebagian tomat penyok. Tolong kurirnya ditegur.',
    statusLaporkan: false,
  },
];

const LAPORAN_ALASAN = [
  { id: 'kasar', label: 'Kata kasar atau SARA', ket: 'Hinaan, ancaman, atau ujaran kebencian.' },
  { id: 'kurir', label: 'Masalah kurir, bukan produk', ket: 'Isinya soal keterlambatan atau kerusakan di jalan.' },
  { id: 'pribadi', label: 'Memuat data pribadi', ket: 'Nomor HP, alamat, atau foto orang.' },
  { id: 'spam', label: 'Iklan atau spam', ket: 'Menawarkan toko lain atau tautan.' },
  { id: 'palsu', label: 'Bukan dari pembeli pesanan ini', ket: 'Kamu menduga ulasan palsu.' },
];

export function TokoUlasan({
  ulasanList = DEFAULT_ULASAN_LIST,
  kosong = false,
  lapor = false,
  onBalasUlasan,
  onLaporkanUlasan,
  hrefPesanan = '/toko/pesanan',
  className = '',
}: TokoUlasanProps) {
  const [daftar, setDaftar] = useState<UlasanTokoItem[]>(ulasanList);
  const [filterBintang, setFilterBintang] = useState<number>(0); // 0 means all
  const [hanyaBelum, setHanyaBelum] = useState<boolean>(false);
  const [balasBukaId, setBalasBukaId] = useState<string>('');
  const [teksBalas, setTeksBalas] = useState<Record<string, string>>({});
  const [laporTargetId, setLaporTargetId] = useState<string>(lapor ? 'r5' : '');
  const [alasanDipilih, setAlasanDipilih] = useState<string>('kurir');
  const [galatLapor, setGalatLapor] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  const isListEmpty = kosong || daftar.length === 0;

  // Rating distribution counts
  const totalCount = daftar.length;
  const count5 = daftar.filter((u) => u.nilai === 5).length;
  const count4 = daftar.filter((u) => u.nilai === 4).length;
  const count3 = daftar.filter((u) => u.nilai === 3).length;
  const count2 = daftar.filter((u) => u.nilai === 2).length;
  const count1 = daftar.filter((u) => u.nilai === 1).length;
  const belumDibalasCount = daftar.filter((u) => !u.balasanPetani).length;

  // Filtered reviews
  const filteredList = daftar.filter((item) => {
    if (filterBintang > 0 && item.nilai !== filterBintang) return false;
    if (hanyaBelum && item.balasanPetani) return false;
    return true;
  });

  const handleKirimBalasan = (id: string) => {
    const teks = (teksBalas[id] ?? '').trim();
    if (!teks) return;

    setDaftar((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            balasanPetani: {
              tanggal: 'Hari ini',
              pesan: teks,
            },
          };
        }
        return item;
      })
    );
    setBalasBukaId('');
    setToastMessage('Balasan berhasil dikirim.');
    if (onBalasUlasan) {
      onBalasUlasan(id, teks);
    }
  };

  const handleKirimLaporan = () => {
    if (!alasanDipilih) {
      setGalatLapor('Pilih satu alasan dulu.');
      return;
    }
    const targetId = laporTargetId;
    setDaftar((prev) =>
      prev.map((item) => {
        if (item.id === targetId) {
          return { ...item, statusLaporkan: true };
        }
        return item;
      })
    );
    setLaporTargetId('');
    setGalatLapor('');
    setToastMessage('Laporan dikirim. Admin akan meninjau.');
    if (onLaporkanUlasan) {
      onLaporkanUlasan(targetId, alasanDipilih);
    }
  };

  const targetLaporReview = daftar.find((u) => u.id === laporTargetId);

  return (
    <div className={`relative min-h-full bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas notif={5} />
      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden min-[900px]:block w-[272px] shrink-0 p-5 pt-5 pb-6 pl-5">
          <TokoSamping aktif="ulasan" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 min-[900px]:px-6 min-[900px]:py-5 min-[900px]:pb-12">
          <div className="max-w-[860px] flex flex-col gap-4">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl min-[900px]:text-[28px] font-extrabold tracking-tight leading-tight m-0">
                Ulasan
              </h1>
              <p className="mt-1.5 mb-0 text-[15px] leading-relaxed text-[#3f5247]">
                Balas dalam 3 hari untuk menjaga nilai toko. Calon pembeli membaca balasanmu sebelum memutuskan membeli.
              </p>
            </div>

            {/* Empty State */}
            {isListEmpty && (
              <div className="p-6 border-[1.5px] border-dashed border-[#a9cfae] rounded-2xl bg-white flex flex-col items-start gap-2.5">
                <p className="text-base font-extrabold m-0">Belum ada ulasan</p>
                <p className="text-sm leading-relaxed text-[#3f5247] max-w-[56ch] m-0">
                  Ulasan masuk setelah pembeli mengonfirmasi pesanan diterima. Pesanan yang cepat diproses dan dikemas rapi paling sering dinilai baik.
                </p>
                <Link
                  href={hrefPesanan}
                  className="inline-flex items-center min-h-[48px] px-4.5 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline"
                >
                  Buka pesanan masuk
                </Link>
              </div>
            )}

            {/* Content when available */}
            {!isListEmpty && (
              <>
                {/* Rating Summary Card */}
                <section
                  aria-labelledby="judul-nilai-toko"
                  className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-wrap gap-4 min-[640px]:gap-8 items-center"
                >
                  <div className="flex flex-col gap-1">
                    <h2 id="judul-nilai-toko" className="text-[13px] font-bold text-[#5a6b60] m-0">
                      Nilai toko
                    </h2>
                    <p className="text-[40px] leading-none font-extrabold tracking-tight m-0">
                      4,4
                      <span className="text-base font-semibold text-[#5a6b60]"> dari 5</span>
                    </p>
                    <Bintang nilai={4} ukuran={20} />
                    <p className="text-[13px] text-[#3f5247] m-0">
                      {totalCount} ulasan, {belumDibalasCount} belum kamu balas
                    </p>
                  </div>

                  {/* Distribution bars */}
                  <ul
                    aria-label="Jumlah ulasan per bintang"
                    className="flex-1 basis-[260px] list-none p-0 m-0 flex flex-col gap-1.5"
                  >
                    {[
                      { star: 5, label: '5 bintang', count: count5 },
                      { star: 4, label: '4 bintang', count: count4 },
                      { star: 3, label: '3 bintang', count: count3 },
                      { star: 2, label: '2 bintang', count: count2 },
                      { star: 1, label: '1 bintang', count: count1 },
                    ].map((row) => {
                      const pct = totalCount > 0 ? (row.count / totalCount) * 100 : 0;
                      return (
                        <li key={row.star} className="flex items-center gap-2.5 text-[13px]">
                          <span className="shrink-0 w-16 font-bold">{row.label}</span>
                          <span
                            aria-hidden="true"
                            className="flex-1 h-2.5 rounded-full bg-[#eef0eb] overflow-hidden"
                          >
                            <span
                              style={{ width: `${pct}%` }}
                              className="block h-full bg-[#157a4c]"
                            />
                          </span>
                          <span className="shrink-0 w-7 text-right font-extrabold tabular-nums">
                            {row.count}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                {/* Filter Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 min-[640px]:gap-3">
                  <div
                    role="group"
                    aria-label="Saring menurut bintang"
                    className="flex gap-2 overflow-x-auto pb-1"
                  >
                    {[
                      { val: 0, label: `Semua (${totalCount})` },
                      { val: 5, label: `5 bintang (${count5})` },
                      { val: 4, label: `4 bintang (${count4})` },
                      { val: 3, label: `3 bintang (${count3})` },
                      { val: 2, label: `2 bintang (${count2})` },
                      { val: 1, label: `1 bintang (${count1})` },
                    ].map((tab) => (
                      <button
                        key={tab.val}
                        type="button"
                        aria-pressed={filterBintang === tab.val}
                        onClick={() => setFilterBintang(tab.val)}
                        className={`shrink-0 min-h-[44px] px-3.5 rounded-full font-sans text-sm font-bold cursor-pointer ${
                          filterBintang === tab.val
                            ? 'border-[1.5px] border-[#064e3b] bg-[#064e3b] text-white'
                            : 'border border-[#dee3da] bg-white text-[#173b2b]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <label className="inline-flex items-center gap-2 min-h-[44px] text-sm font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hanyaBelum}
                      onChange={(e) => setHanyaBelum(e.target.checked)}
                      className="w-5 h-5 accent-[#064e3b]"
                    />
                    Belum dibalas saja
                  </label>
                </div>

                {/* Toast Notification */}
                {toastMessage && (
                  <p aria-live="polite" className="text-sm font-bold text-[#157a4c] m-0">
                    {toastMessage}
                  </p>
                )}

                {/* Empty filtered list note */}
                {filteredList.length === 0 && (
                  <p className="p-3.5 border-[1.5px] border-dashed border-[#c9d2c6] rounded-xl text-sm text-[#3f5247] m-0">
                    Tidak ada ulasan di daftar yang dimuat untuk saringan ini.
                  </p>
                )}

                {/* Review Card List */}
                <ul className="flex flex-col gap-3 list-none p-0 m-0">
                  {filteredList.map((rev) => {
                    const initials = rev.namaPembeli
                      .split(' ')
                      .map((w) => w[0]?.toUpperCase() ?? '')
                      .slice(0, 2)
                      .join('');
                    const isReplying = balasBukaId === rev.id;
                    const replyText = teksBalas[rev.id] ?? '';

                    return (
                      <li
                        key={rev.id}
                        className="p-4 min-[640px]:px-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5"
                      >
                        {/* Reviewer Header */}
                        <div className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className="shrink-0 w-10 h-10 rounded-full grid place-items-center bg-[#ebf2eb] text-[#064e3b] text-sm font-extrabold"
                          >
                            {initials || 'P'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="m-0 flex flex-wrap items-baseline justify-between gap-1">
                              <strong className="text-[15px] font-extrabold">
                                {rev.namaPembeli}
                              </strong>
                              <span className="text-xs text-[#5a6b60]">{rev.tanggal}</span>
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Bintang nilai={rev.nilai} ukuran={16} />
                              <span className="text-[13px] text-[#3f5247]">{rev.produk}</span>
                            </div>
                          </div>
                        </div>

                        {/* Comment text */}
                        <p className="text-[15px] leading-relaxed text-[#173b2b] m-0">
                          {rev.komentar}
                        </p>

                        {/* Photos if any */}
                        {rev.fotoUlasan && rev.fotoUlasan.length > 0 && (
                          <div className="flex gap-2">
                            {rev.fotoUlasan.map((_, idx) => (
                              <span
                                key={idx}
                                role="img"
                                aria-label="Foto dari pembeli"
                                className="w-16 h-16 rounded-xl grid place-items-center bg-[#e3f1df] text-[#2f7a3e]"
                              >
                                <svg
                                  width="26"
                                  height="26"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                                </svg>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Existing reply if any */}
                        {rev.balasanPetani && (
                          <div className="p-3 px-3.5 rounded-xl bg-[#f6f8f4] border border-[#eef0eb]">
                            <p className="m-0 mb-0.5 text-xs font-extrabold text-[#064e3b]">
                              Balasanmu · {rev.balasanPetani.tanggal}
                            </p>
                            <p className="m-0 text-sm leading-relaxed text-[#173b2b]">
                              {rev.balasanPetani.pesan}
                            </p>
                          </div>
                        )}

                        {/* Inline Reply Form */}
                        {isReplying && (
                          <div className="flex flex-col gap-2 mt-1">
                            <label
                              htmlFor={`balas-${rev.id}`}
                              className="text-sm font-bold text-[#173b2b]"
                            >
                              Balasanmu{' '}
                              <span className="font-normal text-[#5a6b60]">
                                (tampil untuk semua pembeli)
                              </span>
                            </label>
                            <textarea
                              id={`balas-${rev.id}`}
                              rows={3}
                              maxLength={500}
                              value={replyText}
                              onChange={(e) =>
                                setTeksBalas((prev) => ({
                                  ...prev,
                                  [rev.id]: e.target.value,
                                }))
                              }
                              placeholder="Tulis balasan sopan dan membantu..."
                              className="w-full p-3 px-3.5 border-[1.5px] border-[#c9d2c6] rounded-xl font-sans text-[15px] leading-relaxed text-[#173b2b] outline-none"
                            />
                            <div className="flex justify-between items-center text-xs text-[#5a6b60]">
                              <span>
                                {rev.nilai <= 2
                                  ? 'Sapa dengan sopan, akui masalahnya, dan tawarkan jalan keluar. Jangan menyebut data pribadi.'
                                  : 'Ucapkan terima kasih dan ceritakan panen segar berikutnya.'}
                              </span>
                              <span className="font-bold">{replyText.length}/500</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleKirimBalasan(rev.id)}
                                className="min-h-[44px] px-4.5 rounded-xl bg-[#064e3b] text-white font-extrabold text-sm border-0 cursor-pointer"
                              >
                                Kirim balasan
                              </button>
                              <button
                                type="button"
                                onClick={() => setBalasBukaId('')}
                                className="min-h-[44px] px-4 rounded-xl border-[1.5px] border-[#dee3da] bg-white text-[#173b2b] font-bold text-sm cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Card Actions Row */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 min-[640px]:gap-3 pt-1">
                          {!rev.balasanPetani && !isReplying && (
                            <button
                              type="button"
                              onClick={() => setBalasBukaId(rev.id)}
                              className="min-h-[44px] px-4 rounded-xl border-[1.5px] border-[#064e3b] bg-white text-[#064e3b] font-extrabold text-sm cursor-pointer"
                            >
                              Balas
                            </button>
                          )}
                          {!rev.statusLaporkan ? (
                            <button
                              type="button"
                              onClick={() => setLaporTargetId(rev.id)}
                              className="inline-flex items-center gap-1.5 min-h-[44px] px-2.5 bg-transparent border-0 text-[#3f5247] font-bold text-sm cursor-pointer"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                <line x1="4" x2="4" y1="22" y2="15" />
                              </svg>
                              Laporkan
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]" />
                              Dilaporkan, menunggu tinjauan admin
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  onClick={() => setToastMessage('Semua ulasan telah dimuat.')}
                  className="self-start min-h-[48px] px-5 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] font-bold text-sm cursor-pointer"
                >
                  Muat 10 ulasan lagi
                </button>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Report Modal Dialog */}
      {laporTargetId && (
        <div
          role="presentation"
          className="absolute inset-0 z-20 bg-[rgba(23,59,43,0.5)] flex justify-center items-start pt-28 min-[900px]:pt-36 px-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-judul-lapor"
            className="w-full max-w-[460px] p-6 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5 text-[#173b2b]"
          >
            <h2 id="modal-judul-lapor" className="text-[19px] font-extrabold leading-snug m-0">
              Laporkan ulasan dari {targetLaporReview?.namaPembeli ?? 'Pembeli'}?
            </h2>

            <fieldset className="border-0 p-0 m-0 flex flex-col gap-1">
              <legend className="text-sm font-bold text-[#173b2b] mb-1.5">
                Alasan
              </legend>
              {LAPORAN_ALASAN.map((alasan) => (
                <label
                  key={alasan.id}
                  className="flex items-start gap-3 min-h-[44px] py-1 cursor-pointer text-sm leading-normal"
                >
                  <input
                    type="radio"
                    name="alasan-lapor"
                    checked={alasanDipilih === alasan.id}
                    onChange={() => {
                      setAlasanDipilih(alasan.id);
                      setGalatLapor('');
                    }}
                    className="w-5 h-5 mt-0.5 accent-[#064e3b] shrink-0"
                  />
                  <span>
                    <strong>{alasan.label}</strong>
                    <br />
                    <span className="text-[13px] text-[#3f5247]">{alasan.ket}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <p className="p-2.5 px-3 rounded-xl bg-[#f6f8f4] text-[13px] leading-relaxed text-[#3f5247] m-0">
              Ulasan tetap tampil sampai admin meninjau. Admin yang memutuskan, bukan kamu. Keluhan soal kurir bisa dikeluarkan dari nilai toko setelah ditinjau (sementara).
            </p>

            {galatLapor && (
              <p role="alert" className="text-xs font-bold text-[#8a1c12] m-0">
                {galatLapor}
              </p>
            )}

            <div className="flex flex-col gap-2 mt-1">
              <button
                type="button"
                onClick={handleKirimLaporan}
                className="min-h-[48px] rounded-xl bg-[#064e3b] text-white font-extrabold text-[15px] border-0 cursor-pointer"
              >
                Kirim laporan
              </button>
              <button
                type="button"
                onClick={() => {
                  setLaporTargetId('');
                  setGalatLapor('');
                }}
                className="min-h-[48px] border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] font-bold text-[15px] cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="min-[900px]:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="lainnya" />
      </div>
    </div>
  );
}
