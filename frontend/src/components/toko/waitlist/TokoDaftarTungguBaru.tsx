'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';
import { LangkahWizard } from '../../common/LangkahWizard';

export interface DataDaftarTungguBaru {
  nama: string;
  petak?: string;
  catatan?: string;
  tanam: 'ya' | 'tidak' | '';
  tanggal: string;
  jenisPanen: 'tanggal' | 'rentang' | 'belum' | '';
  panen1?: string;
  panen2?: string;
  bukaKomitmen: 'ya' | 'tidak' | '';
  harga?: string;
  kuota?: string;
  minimal?: string;
}

export interface TokoDaftarTungguBaruProps {
  langkahAwal?: number;
  dataAwal?: Partial<DataDaftarTungguBaru>;
  onTerbitkan?: (data: DataDaftarTungguBaru) => void;
  onKirimKabarLahan?: () => void;
  className?: string;
}

const KATALOG_KOMODITAS = [
  { nama: 'Kentang Granola', hari: 90, ket: 'Sekitar 85–95 hari panen' },
  { nama: 'Tomat Merah Lembang', hari: 75, ket: 'Sekitar 70–80 hari panen' },
  { nama: 'Wortel Kuroda Lembang', hari: 85, ket: 'Sekitar 80–90 hari panen' },
  { nama: 'Cabai Rawit Hijau Bara', hari: 95, ket: 'Sekitar 90–100 hari panen' },
  { nama: 'Kol Bulat Lembang', hari: 70, ket: 'Sekitar 65–75 hari panen' },
  { nama: 'Brokoli Lembang', hari: 65, ket: 'Sekitar 60–70 hari panen' },
];

export function TokoDaftarTungguBaru({
  langkahAwal = 1,
  dataAwal,
  onTerbitkan,
  onKirimKabarLahan,
  className = '',
}: TokoDaftarTungguBaruProps) {
  const [langkah, setLangkah] = useState<number>(langkahAwal);
  const [nama, setNama] = useState<string>(dataAwal?.nama ?? 'Kentang Granola');
  const [petak, setPetak] = useState<string>(dataAwal?.petak ?? 'petak bawah');
  const [catatan, setCatatan] = useState<string>(
    dataAwal?.catatan ?? 'Bibit sertifikasi G2 ditanam di lahan Cikole dengan pupuk kandang matang.'
  );
  const [tanam, setTanam] = useState<'ya' | 'tidak' | ''>(dataAwal?.tanam ?? 'ya');
  const [tanggalTanam, setTanggalTanam] = useState<string>(dataAwal?.tanggal ?? '2026-08-29');
  const [jenisPanen, setJenisPanen] = useState<'tanggal' | 'rentang' | 'belum' | ''>(
    dataAwal?.jenisPanen ?? 'rentang'
  );
  const [panen1, setPanen1] = useState<string>(dataAwal?.panen1 ?? '2026-11-20');
  const [panen2, setPanen2] = useState<string>(dataAwal?.panen2 ?? '2026-11-27');
  const [bukaKomitmen, setBukaKomitmen] = useState<'ya' | 'tidak' | ''>(dataAwal?.bukaKomitmen ?? 'ya');
  const [harga, setHarga] = useState<string>(dataAwal?.harga ?? '16500');
  const [kuota, setKuota] = useState<string>(dataAwal?.kuota ?? '1500');
  const [minimal, setMinimal] = useState<string>(dataAwal?.minimal ?? '10');

  const [tampilkanSaran, setTampilkanSaran] = useState<boolean>(false);
  const [sudahTerbit, setSudahTerbit] = useState<boolean>(false);
  const [pesanGalat, setPesanGalat] = useState<string>('');

  const filteredSuggestions = KATALOG_KOMODITAS.filter((k) =>
    k.nama.toLowerCase().includes(nama.toLowerCase())
  );

  const handlePilihKomoditas = (komoditas: typeof KATALOG_KOMODITAS[0]) => {
    setNama(komoditas.nama);
    setTampilkanSaran(false);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setPesanGalat('');

    if (langkah === 1) {
      if (!nama.trim()) {
        setPesanGalat('Isi nama komoditas tanaman.');
        return;
      }
      setLangkah(2);
    } else if (langkah === 2) {
      if (!tanam) {
        setPesanGalat('Pilih apakah tanaman sudah ditanam atau belum.');
        return;
      }
      if (!tanggalTanam) {
        setPesanGalat('Isi tanggal tanam atau rencana tanam.');
        return;
      }
      setLangkah(3);
    } else if (langkah === 3) {
      if (bukaKomitmen === 'ya') {
        const h = parseInt(harga.replace(/\D/g, ''), 10);
        const k = parseInt(kuota.replace(/\D/g, ''), 10);
        if (isNaN(h) || h < 1000) {
          setPesanGalat('Isi harga per kg minimal Rp 1.000.');
          return;
        }
        if (isNaN(k) || k <= 0) {
          setPesanGalat('Isi jumlah kuota komitmen (kg).');
          return;
        }
      }

      const hasilData: DataDaftarTungguBaru = {
        nama,
        petak,
        catatan,
        tanam,
        tanggal: tanggalTanam,
        jenisPanen,
        panen1,
        panen2,
        bukaKomitmen,
        harga,
        kuota,
        minimal,
      };

      setSudahTerbit(true);
      onTerbitkan?.(hasilData);
    }
  };

  const formatRupiah = (val: string) => {
    const n = parseInt(val.replace(/\D/g, ''), 10);
    if (isNaN(n)) return 'Rp 0';
    return 'Rp ' + n.toLocaleString('id-ID');
  };

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

            {sudahTerbit ? (
              /* Success / Published View */
              <div className="p-7 px-5 border border-[#157a4c] rounded-2xl bg-[#f3faf3] flex flex-col items-start gap-3">
                <span className="w-12 h-12 rounded-full bg-[#157a4c] text-white grid place-items-center">
                  <svg
                    width="24"
                    height="24"
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
                <h1 className="m-0 text-2xl font-extrabold text-[#173b2b]">
                  Daftar Tunggu {nama} Berhasil Diterbitkan!
                </h1>
                <p className="m-0 max-w-[60ch] text-sm text-[#3f5247] leading-relaxed">
                  Calon pembeli kini dapat mengikuti perkembangan tanamanmu di etalase PasokTani dan
                  memesan kuota pre-order panen lewat Komitmen.
                </p>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <Link
                    href={`/toko/daftar-tunggu/kabar-lahan`}
                    onClick={() => onKirimKabarLahan?.()}
                    className="inline-flex items-center min-h-[46px] px-5 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold hover:bg-[#053d2e]"
                  >
                    Kirim kabar lahan pertama
                  </Link>
                  <Link
                    href="/toko/daftar-tunggu"
                    className="inline-flex items-center min-h-[46px] px-4.5 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-sm font-bold hover:bg-[#f6f8f4]"
                  >
                    Kembali ke Daftar Tunggu
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Header Title with Auto-save check */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#173b2b]">
                      Buat Daftar Tunggu
                    </h1>
                    <p className="mt-1 mb-0 text-xs sm:text-sm text-[#3f5247]">
                      Sekitar 3 menit. Siapkan tanggal tanam dan estimasi panen.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#157a4c]">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#157a4c"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Draf tersimpan otomatis</span>
                  </span>
                </div>

                {/* Wizard Steps Bar */}
                <div className="p-3 sm:p-4 rounded-2xl border border-[#dee3da] bg-white">
                  <LangkahWizard
                    langkah={langkah}
                    judul={['Tanaman', 'Jadwal', 'Komitmen']}
                    onPilih={(idx) => setLangkah(idx)}
                  />
                </div>

                {/* Error Banner */}
                {pesanGalat && (
                  <p role="alert" className="m-0 p-3 px-3.5 rounded-xl bg-[#fdecea] text-[#8a1c12] text-xs font-bold">
                    {pesanGalat}
                  </p>
                )}

                {/* Form & Live Preview Grid */}
                <div className="flex flex-wrap lg:flex-nowrap items-start gap-4.5">
                  {/* Left Column: Current Wizard Step Form */}
                  <form
                    onSubmit={handleNext}
                    className="flex-1 min-w-0 p-4 sm:p-5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-4.5 w-full"
                  >
                    {/* STEP 1: TANAMAN */}
                    {langkah === 1 && (
                      <section aria-labelledby="step-tanaman" className="flex flex-col gap-3.5">
                        <div className="border-b border-[#dee3da] pb-2">
                          <h2 id="step-tanaman" className="m-0 text-lg font-extrabold text-[#173b2b]">
                            1. Informasi Tanaman
                          </h2>
                          <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                            Nama komoditas standar membantu pembeli menemukan hasil panenmu.
                          </p>
                        </div>

                        {/* Commodity Input with Autocomplete Dropdown */}
                        <div className="relative flex flex-col gap-1.5">
                          <label htmlFor="dt-nama" className="text-xs font-bold text-[#173b2b]">
                            Komoditas <span className="text-[#b42318]">*</span>
                          </label>
                          <input
                            id="dt-nama"
                            type="text"
                            autoComplete="off"
                            value={nama}
                            onChange={(e) => {
                              setNama(e.target.value);
                              setTampilkanSaran(true);
                            }}
                            onFocus={() => setTampilkanSaran(true)}
                            placeholder="Contoh: Kentang Granola, Tomat Merah Lembang"
                            className="h-12 px-3.5 rounded-xl border border-[#c9d2c6] text-sm sm:text-base font-bold text-[#173b2b] bg-white focus:outline-[#157a4c]"
                          />

                          {/* Autocomplete suggestions */}
                          {tampilkanSaran && filteredSuggestions.length > 0 && (
                            <ul className="absolute z-20 top-full left-0 right-0 mt-1 p-1 list-none rounded-xl border border-[#dee3da] bg-white shadow-xl flex flex-col max-h-56 overflow-y-auto">
                              {filteredSuggestions.map((sug) => (
                                <li key={sug.nama}>
                                  <button
                                    type="button"
                                    onClick={() => handlePilihKomoditas(sug)}
                                    className="w-full p-2.5 px-3 text-left rounded-lg hover:bg-[#f6f8f4] flex flex-col border-0 bg-transparent cursor-pointer"
                                  >
                                    <strong className="text-sm font-bold text-[#173b2b]">{sug.nama}</strong>
                                    <span className="text-xs text-[#5a6b60]">{sug.ket}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Plot Location */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="dt-petak" className="text-xs font-bold text-[#173b2b]">
                            Petak lahan <span className="font-normal text-[#5a6b60]">(opsional)</span>
                          </label>
                          <input
                            id="dt-petak"
                            type="text"
                            value={petak}
                            onChange={(e) => setPetak(e.target.value)}
                            placeholder="Contoh: petak bawah, greenhouse 2"
                            className="h-12 px-3.5 rounded-xl border border-[#c9d2c6] text-sm text-[#173b2b] bg-white focus:outline-[#157a4c]"
                          />
                        </div>

                        {/* Buyer Notes */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="dt-catatan" className="text-xs font-bold text-[#173b2b]">
                            Catatan untuk pembeli <span className="font-normal text-[#5a6b60]">(opsional)</span>
                          </label>
                          <textarea
                            id="dt-catatan"
                            rows={3}
                            maxLength={200}
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            placeholder="Ceritakan metode penanaman, sertifikasi benih, atau keunggulan panenmu..."
                            className="p-3 rounded-xl border border-[#c9d2c6] text-sm text-[#173b2b] bg-white focus:outline-[#157a4c] resize-y"
                          />
                          <span className="text-[11px] text-[#5a6b60] text-right">
                            {catatan.length}/200 karakter
                          </span>
                        </div>
                      </section>
                    )}

                    {/* STEP 2: JADWAL */}
                    {langkah === 2 && (
                      <section aria-labelledby="step-jadwal" className="flex flex-col gap-3.5">
                        <div className="border-b border-[#dee3da] pb-2">
                          <h2 id="step-jadwal" className="m-0 text-lg font-extrabold text-[#173b2b]">
                            2. Jadwal Tanam & Perkiraan Panen
                          </h2>
                          <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                            Jadwal ini akan menjadi patokan bagi pembeli yang mengikuti prapanen.
                          </p>
                        </div>

                        {/* Sudah Ditanam Radio */}
                        <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                          <legend className="text-xs font-bold text-[#173b2b] mb-1">
                            Sudah ditanam? <span className="text-[#b42318]">*</span>
                          </legend>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                              { id: 'ya' as const, label: 'Sudah ditanam', desc: 'Bibit sudah masuk tanah di lahan' },
                              { id: 'tidak' as const, label: 'Baru rencana tanam', desc: 'Akan ditanam beberapa hari lagi' },
                            ].map((o) => (
                              <label
                                key={o.id}
                                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                                  tanam === o.id
                                    ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                                    : 'border-[#dee3da] bg-white hover:bg-[#fafbf9]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="dt-tanam"
                                  checked={tanam === o.id}
                                  onChange={() => setTanam(o.id)}
                                  className="w-4 h-4 mt-0.5 accent-[#064e3b]"
                                />
                                <span className="flex flex-col">
                                  <strong className="text-xs sm:text-sm font-bold text-[#173b2b]">{o.label}</strong>
                                  <span className="text-[11px] text-[#5a6b60]">{o.desc}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        {/* Tanggal Tanam Input */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="dt-tanggal" className="text-xs font-bold text-[#173b2b]">
                            {tanam === 'ya' ? 'Tanggal penanaman' : 'Rencana tanggal tanam'} <span className="text-[#b42318]">*</span>
                          </label>
                          <input
                            id="dt-tanggal"
                            type="date"
                            value={tanggalTanam}
                            onChange={(e) => setTanggalTanam(e.target.value)}
                            className="w-full max-w-[240px] h-12 px-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b] bg-white focus:outline-[#157a4c]"
                          />
                        </div>

                        {/* Perkiraan Panen */}
                        <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                          <legend className="text-xs font-bold text-[#173b2b] mb-1">
                            Perkiraan panen <span className="text-[#b42318]">*</span>
                          </legend>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: 'rentang' as const, label: 'Rentang tanggal (Rekomendasi)' },
                              { id: 'tanggal' as const, label: 'Satu tanggal' },
                              { id: 'belum' as const, label: 'Belum tahu persis' },
                            ].map((j) => (
                              <label
                                key={j.id}
                                className={`inline-flex items-center gap-2 min-h-[38px] px-3.5 rounded-full text-xs font-bold cursor-pointer border ${
                                  jenisPanen === j.id
                                    ? 'border-[#064e3b] bg-[#064e3b] text-white'
                                    : 'border-[#dee3da] bg-white text-[#173b2b] hover:bg-[#f6f8f4]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="dt-jenis-panen"
                                  checked={jenisPanen === j.id}
                                  onChange={() => setJenisPanen(j.id)}
                                  className="sr-only"
                                />
                                <span>{j.label}</span>
                              </label>
                            ))}
                          </div>

                          {jenisPanen === 'rentang' && (
                            <div className="flex flex-wrap gap-3 mt-1">
                              <div className="flex-1 min-w-[150px] max-w-[200px] flex flex-col gap-1">
                                <span className="text-xs text-[#5a6b60]">Paling cepat</span>
                                <input
                                  type="date"
                                  value={panen1}
                                  onChange={(e) => setPanen1(e.target.value)}
                                  className="h-11 px-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b]"
                                />
                              </div>
                              <div className="flex-1 min-w-[150px] max-w-[200px] flex flex-col gap-1">
                                <span className="text-xs text-[#5a6b60]">Paling lambat</span>
                                <input
                                  type="date"
                                  value={panen2}
                                  onChange={(e) => setPanen2(e.target.value)}
                                  className="h-11 px-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b]"
                                />
                              </div>
                            </div>
                          )}

                          {jenisPanen === 'tanggal' && (
                            <div className="w-full max-w-[240px] flex flex-col gap-1 mt-1">
                              <span className="text-xs text-[#5a6b60]">Tanggal target panen</span>
                              <input
                                type="date"
                                value={panen1}
                                onChange={(e) => setPanen1(e.target.value)}
                                className="h-11 px-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b]"
                              />
                            </div>
                          )}
                        </fieldset>
                      </section>
                    )}

                    {/* STEP 3: KOMITMEN */}
                    {langkah === 3 && (
                      <section aria-labelledby="step-komitmen" className="flex flex-col gap-3.5">
                        <div className="border-b border-[#dee3da] pb-2">
                          <h2 id="step-komitmen" className="m-0 text-lg font-extrabold text-[#173b2b]">
                            3. Kuota Komitmen (Pre-order Panen)
                          </h2>
                          <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                            Buka kuota pesanan berbayar uang muka untuk mengunci kepastian pembeli.
                          </p>
                        </div>

                        {/* Buka Komitmen Radio */}
                        <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
                          <legend className="text-xs font-bold text-[#173b2b] mb-1">
                            Buka Komitmen sekarang? <span className="text-[#b42318]">*</span>
                          </legend>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                              { id: 'ya' as const, label: 'Buka Komitmen sekarang', desc: 'Pembeli bisa memesan dengan uang muka 30%' },
                              { id: 'tidak' as const, label: 'Nanti saja', desc: 'Buka kuota komitmen mendekati panen' },
                            ].map((o) => (
                              <label
                                key={o.id}
                                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                                  bukaKomitmen === o.id
                                    ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                                    : 'border-[#dee3da] bg-white hover:bg-[#fafbf9]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="dt-buka"
                                  checked={bukaKomitmen === o.id}
                                  onChange={() => setBukaKomitmen(o.id)}
                                  className="w-4 h-4 mt-0.5 accent-[#064e3b]"
                                />
                                <span className="flex flex-col">
                                  <strong className="text-xs sm:text-sm font-bold text-[#173b2b]">{o.label}</strong>
                                  <span className="text-[11px] text-[#5a6b60]">{o.desc}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        {/* Price, Quota & Minimum Inputs */}
                        {bukaKomitmen === 'ya' && (
                          <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-[#f6f8f4] border border-[#dee3da]">
                            <div className="flex flex-col gap-1">
                              <label htmlFor="dt-harga" className="text-xs font-bold text-[#173b2b]">
                                Harga per kg (Rp) <span className="text-[#b42318]">*</span>
                              </label>
                              <div className="relative max-w-[240px]">
                                <span className="absolute left-3 top-3 text-sm font-bold text-[#5a6b60]">
                                  Rp
                                </span>
                                <input
                                  id="dt-harga"
                                  type="text"
                                  inputMode="numeric"
                                  value={harga}
                                  onChange={(e) => setHarga(e.target.value)}
                                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b] bg-white"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <div className="flex-1 min-w-[140px] max-w-[200px] flex flex-col gap-1">
                                <label htmlFor="dt-kuota" className="text-xs font-bold text-[#173b2b]">
                                  Kuota total (kg) <span className="text-[#b42318]">*</span>
                                </label>
                                <input
                                  id="dt-kuota"
                                  type="text"
                                  inputMode="numeric"
                                  value={kuota}
                                  onChange={(e) => setKuota(e.target.value)}
                                  className="h-11 px-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b] bg-white"
                                />
                              </div>
                              <div className="flex-1 min-w-[140px] max-w-[200px] flex flex-col gap-1">
                                <label htmlFor="dt-min" className="text-xs font-bold text-[#173b2b]">
                                  Minimal per pesanan (kg)
                                </label>
                                <input
                                  id="dt-min"
                                  type="text"
                                  inputMode="numeric"
                                  value={minimal}
                                  onChange={(e) => setMinimal(e.target.value)}
                                  className="h-11 px-3 rounded-xl border border-[#c9d2c6] text-sm font-bold text-[#173b2b] bg-white"
                                />
                              </div>
                            </div>

                            <p className="m-0 text-xs text-[#5a6b60] leading-relaxed">
                              Uang muka 30% ditahan di rekening bersama PasokTani. Pembeli melunasi sisa
                              70% saat panen siap ditimbang.
                            </p>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-2 border-t border-[#dee3da]">
                      {langkah > 1 ? (
                        <button
                          type="button"
                          onClick={() => setLangkah(langkah - 1)}
                          className="min-h-[44px] px-4 rounded-xl border border-[#dee3da] bg-white text-[#173b2b] text-xs sm:text-sm font-bold cursor-pointer hover:bg-[#f6f8f4]"
                        >
                          Kembali
                        </button>
                      ) : <div />}

                      <button
                        type="submit"
                        className="min-h-[44px] px-6 rounded-xl bg-[#064e3b] text-white text-xs sm:text-sm font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                      >
                        {langkah === 3 ? 'Terbitkan Daftar Tunggu' : 'Lanjut'}
                      </button>
                    </div>
                  </form>

                  {/* Right Aside: Yang Dilihat Pembeli Live Preview */}
                  <aside
                    aria-label="Pratinjau tanaman"
                    className="w-full lg:w-[320px] flex-none p-4.5 rounded-2xl border border-[#dee3da] bg-white flex flex-col gap-3"
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-[#fbf3d9] text-[#5c4500] text-[10px] font-bold uppercase tracking-wider">
                        Pratinjau Pembeli
                      </span>
                      <h3 className="mt-1 mb-0 text-base font-extrabold text-[#173b2b]">
                        {nama || 'Nama Komoditas'}
                      </h3>
                      <p className="mt-0.5 mb-0 text-xs text-[#5a6b60]">
                        Petak: {petak || 'Lahan tokomu'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#fcfbf6] border border-[#eef0eb] flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#5a6b60]">Tanggal tanam:</span>
                        <strong className="text-[#173b2b]">{tanggalTanam || 'Belum diisi'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5a6b60]">Perkiraan panen:</span>
                        <strong className="text-[#173b2b]">
                          {jenisPanen === 'rentang'
                            ? `${panen1} – ${panen2}`
                            : jenisPanen === 'tanggal'
                            ? panen1
                            : 'Akan dikabari'}
                        </strong>
                      </div>
                      {bukaKomitmen === 'ya' && (
                        <div className="flex justify-between pt-1 border-t border-[#dee3da]">
                          <span className="text-[#5a6b60]">Harga Komitmen:</span>
                          <strong className="text-[#157a4c] font-bold">{formatRupiah(harga)}/kg</strong>
                        </div>
                      )}
                    </div>

                    {catatan && (
                      <p className="m-0 text-xs text-[#3f5247] italic leading-relaxed">
                        &ldquo;{catatan}&rdquo;
                      </p>
                    )}

                    <p className="m-0 text-[11px] text-[#5a6b60] leading-relaxed">
                      Pengikut akan melihat data ini di etalase tokomu dan menerima pemberitahuan setiap
                      kamu mengirim kabar lahan.
                    </p>
                  </aside>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <div className="block lg:hidden sticky bottom-0 z-10 mt-4">
        <TokoNavBawah aktif="prapanen" />
      </div>
    </div>
  );
}
