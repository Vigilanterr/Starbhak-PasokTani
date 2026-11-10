'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { ChipStatus } from '../../common/ChipStatus';
import { JalurKomplain, type TahapKomplain } from '../../common/JalurKomplain';

export type TahapTokoKomplain = 'tanggapi' | 'terkirim' | 'menunggu' | 'dimediasi' | 'selesai';
export type PilihanSolusiPetani = 'setuju' | 'lain' | 'kirim' | 'tolak';

export interface BuktiFotoKomplain {
  id: string;
  url?: string;
  label: string;
}

export interface KomplainTokoItem {
  id: string;
  pesananId: string;
  nomorPesanan?: string;
  namaPembeli: string;
  tanggalKomplain: string;
  alasan: string;
  deskripsi: string;
  fotoBukti: string[] | BuktiFotoKomplain[];
  solusiDiminta: 'ganti-barang' | 'kembalikan-dana' | 'diskon-surplus' | string;
  status: 'menunggu-tanggapan' | 'menunggu-pembeli' | 'selesai' | 'eskalasi-admin' | string;
  batasWaktuTanggapan: string;
  sisaWaktuJam?: number;
  totalDanaDitahan?: number;
  nominalDiminta?: number;
  produk?: string;
  tanggapanPetani?: {
    tanggal: string;
    pesan: string;
    solusiDisetujui: boolean;
    penawaranPengganti?: string;
    solusiPilihan?: PilihanSolusiPetani;
    nominalTawaran?: number;
  };
}

export interface TokoKomplainProps {
  komplainList?: KomplainTokoItem[];
  tahap?: 'tanggapi' | 'terkirim' | 'menunggu';
  onTanggapiKomplain?: (komplainId: string, tanggapan: unknown) => void;
  className?: string;
}

const DEFAULT_KOMPLAIN_LIST: KomplainTokoItem[] = [
  {
    id: 'KMP-26110801',
    pesananId: 'PT-26110418',
    nomorPesanan: 'PT-26110418',
    namaPembeli: 'Dewi Lestari',
    tanggalKomplain: 'Sen, 9 Nov, 09.31',
    produk: 'Kol Bulat Lembang, 4 dari 16 kg',
    alasan: 'Layu atau busuk',
    deskripsi: 'Bagian luar kol layu dan berlendir, kira-kira 4 kg dari 16 kg. Tomatnya bagus.',
    fotoBukti: [
      { id: 'f1', label: 'Kol layu di kardus (tampak luar)' },
      { id: 'f2', label: 'Lapisan lendir daun luar' },
      { id: 'f3', label: 'Timbangan 4 kg kol yang rusak' },
    ],
    solusiDiminta: 'kembalikan-dana',
    nominalDiminta: 32000,
    status: 'menunggu-tanggapan',
    batasWaktuTanggapan: 'Sel, 10 Nov, 09.31',
    sisaWaktuJam: 20,
    totalDanaDitahan: 272000,
  },
];

function formatRupiah(n?: number): string {
  if (typeof n !== 'number') return 'Rp 0';
  return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function TokoKomplain({
  komplainList = DEFAULT_KOMPLAIN_LIST,
  tahap = 'tanggapi',
  onTanggapiKomplain,
  className = '',
}: TokoKomplainProps) {
  const currentKomplain: KomplainTokoItem =
    komplainList[0] ?? {
      id: 'KMP-000',
      pesananId: 'PT-000',
      namaPembeli: 'Pembeli',
      tanggalKomplain: 'Hari ini',
      alasan: 'Kualitas produk',
      deskripsi: 'Keluhan produk.',
      fotoBukti: [],
      solusiDiminta: 'kembalikan-dana',
      status: 'menunggu-tanggapan',
      batasWaktuTanggapan: '24 jam',
      totalDanaDitahan: 0,
      nominalDiminta: 0,
    };

  const [tahapAktif, setTahapAktif] = useState<'tanggapi' | 'terkirim' | 'menunggu'>(tahap);
  const [solusiPilihan, setSolusiPilihan] = useState<PilihanSolusiPetani>('setuju');
  const [nominalTawaran, setNominalTawaran] = useState<string>('20000');
  const [pesanTanggapan, setPesanTanggapan] = useState<string>('');
  const [menungguKonfirmasi, setMenungguKonfirmasi] = useState<boolean>(false);
  const [pesanGalat, setPesanGalat] = useState<string>('');
  const [pesanSukses, setPesanSukses] = useState<string>('');

  const totalDana = currentKomplain.totalDanaDitahan ?? 272000;
  const nominalDiminta = currentKomplain.nominalDiminta ?? 32000;

  const handleSubmitTanggapan = (e: React.FormEvent) => {
    e.preventDefault();
    setPesanGalat('');

    if (solusiPilihan === 'tolak' && !pesanTanggapan.trim()) {
      setPesanGalat('Isi alasan penolakan dulu, supaya pembeli dan admin bisa membacanya.');
      return;
    }

    if (solusiPilihan === 'lain') {
      const num = parseInt(nominalTawaran.replace(/\D/g, ''), 10);
      if (isNaN(num) || num <= 0 || num > totalDana) {
        setPesanGalat(`Isi jumlah tawaran antara Rp 1 dan ${formatRupiah(totalDana)}.`);
        return;
      }
    }

    setMenungguKonfirmasi(true);
  };

  const handleKonfirmasiFinal = () => {
    setTahapAktif('terkirim');
    setMenungguKonfirmasi(false);
    setPesanSukses('Tanggapan komplain berhasil dikirim ke pembeli.');

    const payload = {
      komplainId: currentKomplain.id,
      solusi: solusiPilihan,
      nominal: solusiPilihan === 'lain' ? parseInt(nominalTawaran.replace(/\D/g, ''), 10) : nominalDiminta,
      pesan: pesanTanggapan,
    };

    onTanggapiKomplain?.(currentKomplain.id, payload);
  };

  const mapTahapToJalur = (): TahapKomplain => {
    if (tahapAktif === 'tanggapi') return 'diajukan';
    if (tahapAktif === 'terkirim') return 'ditanggapi';
    return 'dimediasi';
  };

  // Safe normalize photos
  const fotoBuktiList: BuktiFotoKomplain[] = (currentKomplain.fotoBukti ?? []).map((f, i) => {
    if (typeof f === 'string') {
      return { id: `foto-${i}`, label: f };
    }
    return f;
  });

  return (
    <div className={`relative min-h-screen bg-[#fcfbf6] font-['Plus_Jakarta_Sans',sans-serif] text-[#173b2b] ${className}`}>
      <TokoAtas notif={5} />

      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-none w-[272px] p-5 pr-0 pb-6">
          <TokoSamping aktif="pesanan" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-5 md:py-5 md:px-6 md:pb-12">
          <div className="max-w-[1000px] flex flex-col gap-4">
            {/* Header / Back Link */}
            <div>
              <Link
                href={`/toko/pesanan/${currentKomplain.pesananId}`}
                className="inline-flex items-center min-h-[44px] text-sm font-bold text-[#064e3b] hover:underline"
              >
                Kembali ke pesanan {currentKomplain.nomorPesanan ?? currentKomplain.pesananId}
              </Link>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                <h1 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#173b2b]">
                  Komplain dari {currentKomplain.namaPembeli}
                </h1>
                <ChipStatus
                  status={
                    tahapAktif === 'tanggapi'
                      ? 'komplain-diajukan'
                      : tahapAktif === 'terkirim'
                      ? 'komplain-ditanggapi'
                      : 'komplain'
                  }
                />
              </div>
              <p className="mt-1.5 mb-0 text-sm text-[#3f5247]">
                Pesanan {currentKomplain.nomorPesanan ?? currentKomplain.pesananId} · Nilai pesanan{' '}
                {formatRupiah(totalDana)} (ditahan di rekening bersama PasokTani).
              </p>
            </div>

            {/* Notification message */}
            {pesanSukses && (
              <p aria-live="polite" className="m-0 text-sm font-bold text-[#157a4c]">
                {pesanSukses}
              </p>
            )}

            {/* Two Columns Grid */}
            <div className="flex flex-wrap lg:flex-nowrap items-start gap-5">
              {/* Left Column (flex-1) */}
              <div className="flex-1 min-w-0 flex flex-col gap-4 w-full">
                {/* Countdown Timer Box (only in 'tanggapi' stage) */}
                {tahapAktif === 'tanggapi' && (
                  <section
                    aria-labelledby="judul-batas"
                    className="p-4 sm:p-4.5 rounded-2xl border-[1.5px] border-[#e9c75c] bg-[#fffdf5] flex flex-col gap-2"
                  >
                    <h2 id="judul-batas" className="m-0 text-xs font-bold text-[#5a6b60]">
                      Waktu menanggapi
                    </h2>
                    <p className="m-0 text-xl sm:text-2xl font-extrabold leading-none text-[#173b2b]">
                      Sisa {currentKomplain.sisaWaktuJam ?? 20} jam
                    </p>
                    <span
                      aria-hidden="true"
                      className="block h-2.5 rounded-full bg-[#eef0eb] overflow-hidden"
                    >
                      <span className="block h-full w-[17%] bg-[#064e3b]" />
                    </span>
                    <p className="m-0 text-xs sm:text-sm leading-relaxed text-[#3f5247]">
                      Tanggapi sebelum {currentKomplain.batasWaktuTanggapan}. Kalau lewat, komplain masuk
                      ke admin tanpa tanggapanmu dan pembeli melihat bahwa kamu belum menjawab.
                    </p>
                  </section>
                )}

                {/* Reported Incident Card */}
                <section
                  aria-labelledby="judul-isi"
                  className="p-4.5 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
                >
                  <h2 id="judul-isi" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                    Yang dilaporkan pembeli · {currentKomplain.tanggalKomplain}
                  </h2>

                  <dl className="m-0 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between items-baseline gap-4">
                      <dt className="text-[#5a6b60]">Produk</dt>
                      <dd className="m-0 font-bold text-[#173b2b] text-right">
                        {currentKomplain.produk ?? 'Kol Bulat Lembang, 4 dari 16 kg'}
                      </dd>
                    </div>
                    <div className="flex justify-between items-baseline gap-4">
                      <dt className="text-[#5a6b60]">Masalah</dt>
                      <dd className="m-0 font-bold text-[#173b2b] text-right">
                        {currentKomplain.alasan}
                      </dd>
                    </div>
                    <div className="flex justify-between items-baseline gap-4">
                      <dt className="text-[#5a6b60]">Solusi diminta</dt>
                      <dd className="m-0 font-bold text-[#173b2b] text-right">
                        Kembalikan sebagian dana, {formatRupiah(nominalDiminta)}
                      </dd>
                    </div>
                  </dl>

                  {/* Quote Box */}
                  <blockquote className="m-0 p-3 px-3.5 rounded-xl bg-[#f6f7f2] text-sm leading-relaxed text-[#173b2b] italic">
                    &ldquo;{currentKomplain.deskripsi}&rdquo;
                  </blockquote>

                  {/* Photo Thumbnails */}
                  <div>
                    <p className="mt-1 mb-2 text-xs font-bold text-[#5a6b60]">Bukti foto pembeli:</p>
                    <div className="flex flex-wrap gap-2.5">
                      {fotoBuktiList.map((foto, idx) => (
                        <div
                          key={foto.id ?? idx}
                          className="flex-1 min-w-[120px] max-w-[200px] p-2.5 rounded-xl border border-[#dee3da] bg-[#fcfbf6] flex flex-col gap-1.5"
                        >
                          <span
                            role="img"
                            aria-label={foto.label}
                            className="w-full h-24 rounded-lg bg-[#e3f1df] grid place-items-center text-[#2f7a3e]"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                          </span>
                          <span className="text-[11px] leading-tight text-[#3f5247]">{foto.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Farmer Response Form (when in 'tanggapi' mode) */}
                {tahapAktif === 'tanggapi' ? (
                  <form
                    onSubmit={handleSubmitTanggapan}
                    className="p-4.5 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3.5"
                  >
                    <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                      <legend className="m-0 mb-1.5 text-base sm:text-lg font-extrabold text-[#173b2b]">
                        Tanggapanmu
                      </legend>

                      {[
                        {
                          id: 'setuju' as PilihanSolusiPetani,
                          label: `Kembalikan dana ${formatRupiah(nominalDiminta)}`,
                          ket: `Sesuai yang diminta ${currentKomplain.namaPembeli}. Sisa ${formatRupiah(
                            totalDana - nominalDiminta
                          )} diteruskan ke kamu.`,
                        },
                        {
                          id: 'lain' as PilihanSolusiPetani,
                          label: 'Tawarkan jumlah pengembalian lain',
                          ket: 'Kamu isi sendiri jumlahnya. Pembeli bisa terima atau menolak tawaranmu.',
                        },
                        {
                          id: 'kirim' as PilihanSolusiPetani,
                          label: 'Kirim ulang barang yang rusak',
                          ket: 'Ongkir ditanggung kamu. Cocok kalau pembeli butuh barangnya untuk pesanan.',
                        },
                        {
                          id: 'tolak' as PilihanSolusiPetani,
                          label: 'Tolak komplain',
                          ket: 'Sertakan alasan yang jelas. Komplain langsung masuk ke admin untuk dimediasi.',
                        },
                      ].map((op) => (
                        <label
                          key={op.id}
                          className={`flex items-start gap-3 min-h-[52px] p-2.5 px-3.5 rounded-xl border cursor-pointer ${
                            solusiPilihan === op.id
                              ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                              : 'border-[#dee3da] bg-white hover:bg-[#fafbf9]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="solusi-petani"
                            checked={solusiPilihan === op.id}
                            onChange={() => setSolusiPilihan(op.id)}
                            className="w-5 h-5 mt-0.5 accent-[#064e3b]"
                          />
                          <span className="flex flex-col gap-0.5">
                            <strong className="text-sm font-extrabold text-[#173b2b]">{op.label}</strong>
                            <span className="text-xs text-[#3f5247] leading-relaxed">{op.ket}</span>
                          </span>
                        </label>
                      ))}
                    </fieldset>

                    {/* Conditional Input for 'lain' */}
                    {solusiPilihan === 'lain' && (
                      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#f6f8f4] border border-[#dee3da]">
                        <label htmlFor="jumlah-tawaran" className="text-xs font-bold text-[#173b2b]">
                          Jumlah yang kamu tawarkan (Rp)
                        </label>
                        <input
                          id="jumlah-tawaran"
                          type="text"
                          inputMode="numeric"
                          value={nominalTawaran}
                          onChange={(e) => setNominalTawaran(e.target.value)}
                          className="w-full max-w-[240px] h-11 px-3 rounded-xl border border-[#c9d2c6] text-base font-bold text-[#173b2b] bg-white focus:outline-[#157a4c]"
                        />
                        <p className="m-0 text-xs text-[#5a6b60]">
                          Paling banyak {formatRupiah(totalDana)}, nilai produk yang ditahan. Ongkir tidak ikut.
                        </p>
                      </div>
                    )}

                    {/* Textarea for message / reason */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="pesan-tanggapan" className="text-xs font-bold text-[#173b2b]">
                        {solusiPilihan === 'tolak'
                          ? 'Alasan penolakan (wajib)'
                          : 'Pesan untuk pembeli (boleh dikosongkan)'}
                      </label>
                      <textarea
                        id="pesan-tanggapan"
                        rows={3}
                        maxLength={500}
                        value={pesanTanggapan}
                        onChange={(e) => setPesanTanggapan(e.target.value)}
                        placeholder={
                          solusiPilihan === 'tolak'
                            ? 'Jelaskan mengapa keluhan tidak sesuai bukti kirim atau standar panen...'
                            : `Contoh: Mohon maaf Bu ${currentKomplain.namaPembeli.split(' ')[0]}, kolnya sempat tertahan di gudang...`
                        }
                        className="w-full p-3 rounded-xl border border-[#c9d2c6] text-sm text-[#173b2b] bg-white focus:outline-[#157a4c] resize-y"
                      />
                    </div>

                    {/* Error Banner */}
                    {pesanGalat && (
                      <p role="alert" className="m-0 p-2.5 px-3 rounded-xl bg-[#fdecea] text-[#8a1c12] text-xs font-bold">
                        {pesanGalat}
                      </p>
                    )}

                    {/* Confirmation Prompt */}
                    {menungguKonfirmasi ? (
                      <div
                        role="group"
                        aria-label="Konfirmasi tanggapan"
                        className="p-3.5 px-4 rounded-xl bg-[#f3faf3] border border-[#a9cfae] flex flex-col gap-2.5"
                      >
                        <p className="m-0 text-xs sm:text-sm text-[#173b2b] leading-relaxed">
                          <strong>Kirim tanggapan ini?</strong>{' '}
                          {solusiPilihan === 'setuju'
                            ? `${formatRupiah(nominalDiminta)} akan dikembalikan ke dompet ${currentKomplain.namaPembeli}. Sisa ${formatRupiah(totalDana - nominalDiminta)} diteruskan ke tokomu.`
                            : solusiPilihan === 'lain'
                            ? `Tawaran pengembalian ${formatRupiah(parseInt(nominalTawaran.replace(/\D/g, '') || '0', 10))} akan dikirim ke ${currentKomplain.namaPembeli}.`
                            : solusiPilihan === 'kirim'
                            ? 'Kamu setuju mengirim ulang produk pengganti yang layak dengan ongkos ditanggung penjual.'
                            : 'Komplain akan langsung masuk ke admin PasokTani untuk ditengahi.'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={handleKonfirmasiFinal}
                            className="min-h-[42px] px-4 rounded-xl bg-[#064e3b] text-white text-xs sm:text-sm font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                          >
                            Ya, kirim tanggapan
                          </button>
                          <button
                            type="button"
                            onClick={() => setMenungguKonfirmasi(false)}
                            className="min-h-[42px] px-3.5 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-xs sm:text-sm font-bold cursor-pointer hover:bg-[#f6f8f4]"
                          >
                            Ubah dulu
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        <button
                          type="submit"
                          className="flex-1 min-w-[180px] min-h-[46px] rounded-xl bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                        >
                          Kirim tanggapan
                        </button>
                        <Link
                          href={`/toko/obrolan?user=${encodeURIComponent(currentKomplain.namaPembeli)}`}
                          className="flex-1 min-w-[180px] min-h-[46px] inline-flex items-center justify-center rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold hover:bg-[#f6f8f4]"
                        >
                          Obrolan dengan {currentKomplain.namaPembeli.split(' ')[0]} dulu
                        </Link>
                      </div>
                    )}
                  </form>
                ) : (
                  /* Read-Only Banner for 'terkirim' mode */
                  <section
                    aria-labelledby="judul-terkirim"
                    className="p-4.5 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[#157a4c] text-white grid place-items-center">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <h2 id="judul-terkirim" className="m-0 text-base sm:text-lg font-extrabold text-[#173b2b]">
                        Tanggapanmu sudah terkirim ke {currentKomplain.namaPembeli}
                      </h2>
                    </div>

                    <p className="m-0 text-xs sm:text-sm leading-relaxed text-[#3f5247]">
                      {solusiPilihan === 'setuju'
                        ? `Kamu telah menyetujui pengembalian dana sebesar ${formatRupiah(nominalDiminta)}.`
                        : solusiPilihan === 'lain'
                        ? `Kamu menawarkan pengembalian dana alternatif sebesar ${formatRupiah(
                            parseInt(nominalTawaran.replace(/\D/g, '') || '0', 10)
                          )}.`
                        : solusiPilihan === 'kirim'
                        ? 'Kamu bersedia mengirim ulang produk pengganti ke alamat pembeli.'
                        : 'Kamu telah menolak komplain ini dan meminta mediasi resmi admin.'}
                    </p>

                    <p className="m-0 p-3 px-3.5 rounded-xl bg-[#f6f8f4] text-xs text-[#5a6b60]">
                      Pembeli memiliki waktu 24 jam untuk merespons tawaranmu. Jika pembeli menyetujui,
                      komplain otomatis selesai. Jika menolak atau waktu habis, mediasi admin akan
                      dimulai.
                    </p>
                  </section>
                )}
              </div>

              {/* Right Aside (300px) */}
              <aside
                aria-label="Status dana dan linimasa komplain"
                className="w-full lg:w-[300px] flex-none flex flex-col gap-4"
              >
                {/* Dana Pesanan Card */}
                <section
                  aria-labelledby="judul-dana"
                  className="p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 id="judul-dana" className="m-0 text-xs font-bold text-[#5a6b60]">
                      Dana pesanan
                    </h2>
                    <ChipStatus status="dana-ditahan" ukuran="kecil" />
                  </div>

                  <p className="m-0 text-2xl font-extrabold text-[#173b2b]">
                    {formatRupiah(totalDana)}
                  </p>

                  <p className="m-0 text-xs leading-relaxed text-[#5a6b60]">
                    Nilai produk yang ditahan di rekening bersama PasokTani sampai masalah ini selesai.
                    Uang tidak dicairkan tanpa kesepakatan kedua belah pihak.
                  </p>
                </section>

                {/* Linimasa Komplain Tracker */}
                <section
                  aria-labelledby="judul-perkembangan"
                  className="p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
                >
                  <h2 id="judul-perkembangan" className="m-0 text-sm font-extrabold text-[#173b2b]">
                    Perkembangan komplain
                  </h2>

                  <JalurKomplain tahap={mapTahapToJalur()} />
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <div className="block lg:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="pesanan" />
      </div>
    </div>
  );
}
