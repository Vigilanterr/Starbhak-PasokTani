'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TokoAtas } from '../../layout/TokoAtas';
import { TokoSamping } from '../../layout/TokoSamping';
import { TokoNavBawah } from '../../layout/TokoNavBawah';

export interface KurirLogistikItem {
  id: string;
  namaKurir: string;
  aktif: boolean;
  layanan?: string[];
  ket?: string;
}

export interface ZonaOngkir {
  km: string;
  ongkir: string;
}

export interface OpsiPengirimanToko {
  kurirLogistik: KurirLogistikItem[];
  antarSendiri: {
    aktif: boolean;
    radiusKm: number;
    tarifPerKm: number;
    minimalBelanja: number;
    batasJamAntarBesok?: string;
    hariAntar?: string[];
    zonaAntar?: ZonaOngkir[];
  };
  ambilDiLahan: {
    aktif: boolean;
    alamatLengkap: string;
    instruksiPenjemputan?: string;
    hariAmbil?: string[];
    kebijakanSiapAmbil?: 'sama' | 'besok';
  };
}

export interface TokoPengaturanKirimProps {
  opsiKirim?: OpsiPengirimanToko;
  onSimpanOpsiKirim?: (opsi: OpsiPengirimanToko) => void;
  hrefPengaturan?: string;
  className?: string;
}

const DEFAULT_KURIR: KurirLogistikItem[] = [
  { id: 'jne', namaKurir: 'JNE Reguler', aktif: true, ket: '1-2 hari tiba' },
  { id: 'jnt', namaKurir: 'J&T Express', aktif: true, ket: '1-2 hari tiba' },
  { id: 'sicepat', namaKurir: 'SiCepat', aktif: true, ket: '1-2 hari tiba' },
  { id: 'grab', namaKurir: 'GrabExpress Instan', aktif: true, ket: 'Maksimal 30 km dari lahan' },
  { id: 'gosend', namaKurir: 'GoSend Instan', aktif: false, ket: 'Maksimal 30 km dari lahan' },
];

const DEFAULT_ZONA: ZonaOngkir[] = [
  { km: '5', ongkir: '10000' },
  { km: '15', ongkir: '18000' },
  { km: '25', ongkir: '28000' },
];

const DEFAULT_OPSI_KIRIM: OpsiPengirimanToko = {
  kurirLogistik: DEFAULT_KURIR,
  antarSendiri: {
    aktif: true,
    radiusKm: 25,
    tarifPerKm: 1500,
    minimalBelanja: 100000,
    batasJamAntarBesok: '16:00',
    hariAntar: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    zonaAntar: DEFAULT_ZONA,
  },
  ambilDiLahan: {
    aktif: true,
    alamatLengkap: 'Kp. Cikole RT 02/RW 07, Lembang',
    instruksiPenjemputan: 'Masuk dari gerbang hijau kebun. Parkir motor/mobil luas di halaman.',
    hariAmbil: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    kebijakanSiapAmbil: 'sama',
  },
};

const HARI_LIST = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function TokoPengaturanKirim({
  opsiKirim = DEFAULT_OPSI_KIRIM,
  onSimpanOpsiKirim,
  hrefPengaturan = '/toko/pengaturan',
  className = '',
}: TokoPengaturanKirimProps) {
  const [kurirList, setKurirList] = useState<KurirLogistikItem[]>(
    opsiKirim.kurirLogistik ?? DEFAULT_KURIR
  );
  const [caraSerah, setCaraSerah] = useState<'jemput' | 'agen'>('jemput');

  const [antarAktif, setAntarAktif] = useState<boolean>(
    opsiKirim.antarSendiri?.aktif ?? true
  );
  const [zonaList, setZonaList] = useState<ZonaOngkir[]>(
    opsiKirim.antarSendiri?.zonaAntar ?? DEFAULT_ZONA
  );
  const [minBelanja, setMinBelanja] = useState<string>(
    String(opsiKirim.antarSendiri?.minimalBelanja ?? 100000)
  );
  const [batasJamAntar, setBatasJamAntar] = useState<string>(
    opsiKirim.antarSendiri?.batasJamAntarBesok ?? '16:00'
  );
  const [hariAntar, setHariAntar] = useState<string[]>(
    opsiKirim.antarSendiri?.hariAntar ?? ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  );

  const [ambilAktif, setAmbilAktif] = useState<boolean>(
    opsiKirim.ambilDiLahan?.aktif ?? true
  );
  const [hariAmbil, setHariAmbil] = useState<string[]>(
    opsiKirim.ambilDiLahan?.hariAmbil ?? ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  );
  const [kebijakanAmbil, setKebijakanAmbil] = useState<'sama' | 'besok'>(
    opsiKirim.ambilDiLahan?.kebijakanSiapAmbil ?? 'sama'
  );
  const [petunjukAmbil, setPetunjukAmbil] = useState<string>(
    opsiKirim.ambilDiLahan?.instruksiPenjemputan ?? 'Masuk dari gerbang hijau kebun. Parkir luas.'
  );

  const [tersimpan, setTersimpan] = useState<boolean>(false);
  const [galatList, setGalatList] = useState<Array<{ href: string; pesan: string }>>([]);

  const toggleKurir = (id: string) => {
    setKurirList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, aktif: !k.aktif } : k))
    );
  };

  const handleUpdateZona = (idx: number, field: 'km' | 'ongkir', val: string) => {
    setZonaList((prev) =>
      prev.map((z, i) => (i === idx ? { ...z, [field]: val } : z))
    );
  };

  const handleHapusZona = (idx: number) => {
    setZonaList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTambahZona = () => {
    if (zonaList.length >= 3) return;
    const lastKm = parseInt(zonaList[zonaList.length - 1]?.km ?? '15', 10) || 15;
    const nextKm = Math.min(40, lastKm + 10);
    setZonaList((prev) => [...prev, { km: String(nextKm), ongkir: '35000' }]);
  };

  const toggleHariAntar = (hari: string) => {
    setHariAntar((prev) =>
      prev.includes(hari) ? prev.filter((h) => h !== hari) : [...prev, hari]
    );
  };

  const toggleHariAmbil = (hari: string) => {
    setHariAmbil((prev) =>
      prev.includes(hari) ? prev.filter((h) => h !== hari) : [...prev, hari]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Array<{ href: string; pesan: string }> = [];

    const aktifCount = kurirList.filter((k) => k.aktif).length;
    if (aktifCount === 0) {
      errors.push({ href: '#kr-kurir', pesan: 'Pilih minimal 1 kurir.' });
    }

    if (antarAktif) {
      for (let i = 1; i < zonaList.length; i++) {
        const curr = parseInt(zonaList[i]?.km ?? '0', 10);
        const prev = parseInt(zonaList[i - 1]?.km ?? '0', 10);
        if (curr <= prev) {
          errors.push({
            href: '#kr-antar',
            pesan: `Jarak zona ke-${i + 1} (${curr} km) harus lebih jauh dari zona sebelumnya (${prev} km).`,
          });
          break;
        }
      }
    }

    if (errors.length > 0) {
      setGalatList(errors);
      setTersimpan(false);
      return;
    }

    setGalatList([]);
    setTersimpan(true);

    if (onSimpanOpsiKirim) {
      onSimpanOpsiKirim({
        kurirLogistik: kurirList,
        antarSendiri: {
          aktif: antarAktif,
          radiusKm: parseInt(zonaList[zonaList.length - 1]?.km ?? '25', 10) || 25,
          tarifPerKm: 1500,
          minimalBelanja: parseInt(minBelanja, 10) || 0,
          batasJamAntarBesok: batasJamAntar,
          hariAntar,
          zonaAntar: zonaList,
        },
        ambilDiLahan: {
          aktif: ambilAktif,
          alamatLengkap: opsiKirim.ambilDiLahan?.alamatLengkap ?? 'Kp. Cikole RT 02/RW 07, Lembang',
          instruksiPenjemputan: petunjukAmbil,
          hariAmbil,
          kebijakanSiapAmbil: kebijakanAmbil,
        },
      });
    }
  };

  return (
    <div className={`min-h-full bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <TokoAtas />
      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <div className="hidden min-[900px]:block w-[272px] shrink-0 p-5 pt-5 pb-6 pl-5">
          <TokoSamping aktif="pengaturan" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 min-[900px]:px-6 min-[900px]:py-5 min-[900px]:pb-12">
          <div className="max-w-[1080px] flex flex-col gap-4">
            {/* Back link */}
            <Link
              href={hrefPengaturan}
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
              Pengaturan toko
            </Link>

            {/* Header */}
            <div>
              <h1 className="text-2xl min-[900px]:text-[28px] font-extrabold tracking-tight leading-tight m-0">
                Pengiriman
              </h1>
              <p className="mt-1.5 mb-0 text-[15px] leading-relaxed text-[#3f5247]">
                Tiga cara sampai ke pembeli. Pembeli melihat semua yang aktif dalam satu pilihan di checkout, lengkap dengan ongkir dan tanggal tiba.
              </p>
            </div>

            {/* Validation Alerts */}
            {galatList.length > 0 && (
              <div
                role="alert"
                className="p-3.5 px-4 border-[1.5px] border-[#b42318] rounded-xl bg-[#fdecea]"
              >
                <p className="m-0 mb-1 text-sm font-extrabold text-[#8a1c12]">
                  Periksa kembali isian pengiriman:
                </p>
                <ul className="m-0 pl-4.5 text-sm text-[#8a1c12]">
                  {galatList.map((g, idx) => (
                    <li key={idx}>
                      <a href={g.href} className="font-bold underline text-[#8a1c12]">
                        {g.pesan}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Status Banner */}
            {tersimpan && (
              <p
                role="status"
                className="m-0 flex items-center gap-2.5 p-3 px-3.5 border-[1.5px] border-[#064e3b] rounded-xl bg-[#f3faf3] text-sm font-bold text-[#064e3b]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#157a4c"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Pengaturan pengiriman disimpan. Berlaku untuk checkout berikutnya.
              </p>
            )}

            {/* Two-Column Form Layout */}
            <div className="flex flex-wrap items-start gap-4.5">
              {/* Form Column */}
              <form
                onSubmit={handleSubmit}
                className="flex-[999_1_480px] min-w-0 m-0 flex flex-col gap-3.5"
              >
                {/* Section 1: Kurir */}
                <section
                  id="kr-kurir"
                  aria-labelledby="judul-kurir-logistik"
                  className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                >
                  <div>
                    <h2 id="judul-kurir-logistik" className="text-[17px] font-extrabold m-0">
                      1. Kurir
                    </h2>
                    <p className="mt-1 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
                      Ongkir dan tanggal tiba dihitung otomatis dari kecamatan pembeli. Resi dibuat begitu kamu memilih cara serah.
                    </p>
                  </div>

                  <fieldset className="border-0 p-0 m-0">
                    <legend className="p-0 mb-2 text-sm font-bold text-[#173b2b]">
                      Kurir yang ditawarkan
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {kurirList.map((k) => (
                        <label
                          key={k.id}
                          className={`flex items-center gap-2.5 min-h-[52px] px-3 rounded-xl border cursor-pointer text-sm font-bold ${
                            k.aktif
                              ? 'border-[#064e3b] bg-[#f6f8f4]'
                              : 'border-[#dee3da] bg-white text-[#5a6b60]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={k.aktif}
                            onChange={() => toggleKurir(k.id)}
                            className="w-5 h-5 accent-[#064e3b] shrink-0"
                          />
                          <span>
                            {k.namaKurir}
                            {k.ket && (
                              <span className="block text-xs font-normal text-[#5a6b60]">
                                {k.ket}
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="border-0 p-0 m-0">
                    <legend className="p-0 mb-2 text-sm font-bold text-[#173b2b]">
                      Cara serah ke kurir yang biasa dipakai
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      <label
                        className={`flex-1 basis-[200px] flex items-center gap-2.5 min-h-[52px] px-3 rounded-xl border cursor-pointer text-sm font-bold ${
                          caraSerah === 'jemput'
                            ? 'border-[#064e3b] bg-[#f6f8f4]'
                            : 'border-[#dee3da] bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="kr-serah"
                          checked={caraSerah === 'jemput'}
                          onChange={() => setCaraSerah('jemput')}
                          className="w-5 h-5 accent-[#064e3b] shrink-0"
                        />
                        <span>
                          Dijemput kurir
                          <span className="block text-xs font-normal text-[#5a6b60]">
                            Pilih jam jemput di lahan
                          </span>
                        </span>
                      </label>
                      <label
                        className={`flex-1 basis-[200px] flex items-center gap-2.5 min-h-[52px] px-3 rounded-xl border cursor-pointer text-sm font-bold ${
                          caraSerah === 'agen'
                            ? 'border-[#064e3b] bg-[#f6f8f4]'
                            : 'border-[#dee3da] bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="kr-serah"
                          checked={caraSerah === 'agen'}
                          onChange={() => setCaraSerah('agen')}
                          className="w-5 h-5 accent-[#064e3b] shrink-0"
                        />
                        <span>
                          Antar ke agen
                          <span className="block text-xs font-normal text-[#5a6b60]">
                            Agen terdekat di Lembang
                          </span>
                        </span>
                      </label>
                    </div>
                  </fieldset>
                </section>

                {/* Section 2: Antar Sendiri */}
                <section
                  id="kr-antar"
                  aria-labelledby="judul-antar-sendiri"
                  className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 id="judul-antar-sendiri" className="text-[17px] font-extrabold m-0">
                        2. Antar sendiri
                      </h2>
                      <p className="mt-1 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
                        Kamu yang mengantar. Ongkir mengikuti jarak dari lahan.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={antarAktif}
                      aria-label="Aktifkan antar sendiri"
                      onClick={() => setAntarAktif(!antarAktif)}
                      className="shrink-0 w-15 h-11 grid place-items-center bg-transparent border-0 cursor-pointer"
                    >
                      <span
                        aria-hidden="true"
                        className={`relative inline-block w-11 h-6.5 rounded-full ${
                          antarAktif ? 'bg-[#064e3b]' : 'bg-[#c9d2c6]'
                        }`}
                      >
                        <span
                          style={{ left: antarAktif ? '21px' : '3px' }}
                          className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm"
                        />
                      </span>
                    </button>
                  </div>

                  {antarAktif && (
                    <div className="flex flex-col gap-3 pt-1">
                      <p className="m-0 text-sm font-bold text-[#173b2b]">
                        Jarak dan ongkir
                      </p>
                      {zonaList.map((z, idx) => (
                        <div
                          key={idx}
                          role="group"
                          aria-label={`Zona ${idx + 1}`}
                          className="flex flex-wrap items-end gap-2.5 p-2.5 px-3 border border-[#dee3da] rounded-xl bg-[#fffdf5]"
                        >
                          <div className="flex-1 basis-[120px] flex flex-col gap-1">
                            <label className="text-xs font-bold text-[#3f5247]">
                              Sampai (km)
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={z.km}
                              onChange={(e) =>
                                handleUpdateZona(idx, 'km', e.target.value.replace(/\D/g, ''))
                              }
                              className="h-11 px-2.5 border-[1.5px] border-[#dee3da] rounded-lg bg-white text-[#173b2b] text-base font-bold outline-none"
                            />
                          </div>
                          <div className="flex-1 basis-[140px] flex flex-col gap-1">
                            <label className="text-xs font-bold text-[#3f5247]">
                              Ongkir (Rp)
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={z.ongkir}
                              onChange={(e) =>
                                handleUpdateZona(idx, 'ongkir', e.target.value.replace(/\D/g, ''))
                              }
                              className="h-11 px-2.5 border-[1.5px] border-[#dee3da] rounded-lg bg-white text-[#173b2b] text-base font-bold outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleHapusZona(idx)}
                            aria-label={`Hapus zona ${idx + 1}`}
                            className="w-11 h-11 grid place-items-center border border-[#dee3da] rounded-lg bg-white text-[#b42318] cursor-pointer"
                          >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      ))}

                      {zonaList.length < 3 && (
                        <button
                          type="button"
                          onClick={handleTambahZona}
                          className="self-start min-h-[44px] px-3.5 border border-[#a9cfae] rounded-xl bg-white text-[#064e3b] font-extrabold text-sm cursor-pointer"
                        >
                          Tambah jarak
                        </button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div className="flex flex-col gap-1">
                          <label htmlFor="kr-min-belanja" className="text-[13px] font-bold text-[#173b2b]">
                            Minimal belanja (Rp)
                          </label>
                          <input
                            id="kr-min-belanja"
                            type="text"
                            inputMode="numeric"
                            value={minBelanja}
                            onChange={(e) => setMinBelanja(e.target.value.replace(/\D/g, ''))}
                            className="h-12 px-3 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-base outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label htmlFor="kr-batas-jam" className="text-[13px] font-bold text-[#173b2b]">
                            Pesanan sebelum jam ini diantar besok
                          </label>
                          <input
                            id="kr-batas-jam"
                            type="time"
                            value={batasJamAntar}
                            onChange={(e) => setBatasJamAntar(e.target.value)}
                            className="h-12 px-3 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-base outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-bold text-[#173b2b]">
                          Hari antar
                        </span>
                        <div role="group" aria-label="Hari antar" className="flex flex-wrap gap-1.5">
                          {HARI_LIST.map((h) => (
                            <button
                              key={h}
                              type="button"
                              aria-pressed={hariAntar.includes(h)}
                              onClick={() => toggleHariAntar(h)}
                              className={`min-w-12 min-h-11 px-2.5 rounded-xl text-sm font-extrabold cursor-pointer ${
                                hariAntar.includes(h)
                                  ? 'bg-[#064e3b] text-white border-0'
                                  : 'border border-[#dee3da] bg-white text-[#173b2b]'
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Section 3: Ambil di Lahan */}
                <section
                  id="kr-ambil"
                  aria-labelledby="judul-ambil-lahan"
                  className="p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 id="judul-ambil-lahan" className="text-[17px] font-extrabold m-0">
                        3. Ambil di lahan
                      </h2>
                      <p className="mt-1 mb-0 text-[13px] leading-relaxed text-[#3f5247]">
                        Pembeli datang langsung ke lahanmu. Gratis ongkir.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={ambilAktif}
                      aria-label="Aktifkan ambil di lahan"
                      onClick={() => setAmbilAktif(!ambilAktif)}
                      className="shrink-0 w-15 h-11 grid place-items-center bg-transparent border-0 cursor-pointer"
                    >
                      <span
                        aria-hidden="true"
                        className={`relative inline-block w-11 h-6.5 rounded-full ${
                          ambilAktif ? 'bg-[#064e3b]' : 'bg-[#c9d2c6]'
                        }`}
                      >
                        <span
                          style={{ left: ambilAktif ? '21px' : '3px' }}
                          className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm"
                        />
                      </span>
                    </button>
                  </div>

                  {ambilAktif && (
                    <div className="flex flex-col gap-3 pt-1">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-bold text-[#173b2b]">
                          Hari ambil
                        </span>
                        <div role="group" aria-label="Hari ambil" className="flex flex-wrap gap-1.5">
                          {HARI_LIST.map((h) => (
                            <button
                              key={h}
                              type="button"
                              aria-pressed={hariAmbil.includes(h)}
                              onClick={() => toggleHariAmbil(h)}
                              className={`min-w-12 min-h-11 px-2.5 rounded-xl text-sm font-extrabold cursor-pointer ${
                                hariAmbil.includes(h)
                                  ? 'bg-[#064e3b] text-white border-0'
                                  : 'border border-[#dee3da] bg-white text-[#173b2b]'
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>

                      <fieldset className="border-0 p-0 m-0">
                        <legend className="p-0 mb-1.5 text-[13px] font-bold text-[#173b2b]">
                          Kebijakan siap ambil
                        </legend>
                        <div className="flex flex-col gap-2">
                          <label
                            className={`flex items-start gap-2.5 p-2.5 px-3 rounded-xl border cursor-pointer text-sm leading-normal ${
                              kebijakanAmbil === 'sama'
                                ? 'border-[#064e3b] bg-[#f6f8f4]'
                                : 'border-[#dee3da] bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="kebijakan-ambil"
                              checked={kebijakanAmbil === 'sama'}
                              onChange={() => setKebijakanAmbil('sama')}
                              className="w-5 h-5 mt-0.5 accent-[#064e3b] shrink-0"
                            />
                            <span>
                              Hari yang sama kalau dibayar sebelum 10.00, selain itu besoknya
                            </span>
                          </label>
                          <label
                            className={`flex items-start gap-2.5 p-2.5 px-3 rounded-xl border cursor-pointer text-sm leading-normal ${
                              kebijakanAmbil === 'besok'
                                ? 'border-[#064e3b] bg-[#f6f8f4]'
                                : 'border-[#dee3da] bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="kebijakan-ambil"
                              checked={kebijakanAmbil === 'besok'}
                              onChange={() => setKebijakanAmbil('besok')}
                              className="w-5 h-5 mt-0.5 accent-[#064e3b] shrink-0"
                            />
                            <span>Selalu besoknya</span>
                          </label>
                        </div>
                      </fieldset>

                      <div className="flex flex-col gap-1">
                        <label htmlFor="kr-petunjuk" className="text-[13px] font-bold text-[#173b2b]">
                          Petunjuk untuk pembeli yang mengambil
                        </label>
                        <textarea
                          id="kr-petunjuk"
                          rows={2}
                          value={petunjukAmbil}
                          onChange={(e) => setPetunjukAmbil(e.target.value)}
                          placeholder="Gerbang, parkir, kontak..."
                          className="w-full p-2.5 px-3 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-sm leading-relaxed outline-none"
                        />
                      </div>
                    </div>
                  )}
                </section>

                <button
                  type="submit"
                  className="min-h-14 rounded-xl bg-[#064e3b] text-white font-extrabold text-base border-0 cursor-pointer"
                >
                  Simpan pengiriman
                </button>
              </form>

              {/* Aside Preview Column */}
              <aside
                aria-labelledby="judul-lihat-checkout"
                className="flex-1 basis-[300px] min-w-0 bg-[#ebf2eb] rounded-2xl p-[18px] flex flex-col gap-2.5"
              >
                <h2 id="judul-lihat-checkout" className="text-[15px] font-extrabold m-0">
                  Yang dilihat pembeli di checkout
                </h2>
                <p className="m-0 text-xs text-[#3f5247]">
                  Contoh: Warung Dewi di Cigadung, 11 km dari lahan, pesan hari ini 14.00.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="p-3 rounded-xl bg-white text-xs leading-relaxed">
                    <strong className="block text-sm text-[#173b2b]">JNE Reguler</strong>
                    <span className="text-[#3f5247]">Rp 12.000 · Tiba Sel, 10 Nov</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white text-xs leading-relaxed">
                    <strong className="block text-sm text-[#173b2b]">GrabExpress Instan</strong>
                    <span className="text-[#3f5247]">Rp 38.000 · Tiba hari ini dalam 2 jam</span>
                  </div>
                  {antarAktif && (
                    <div className="p-3 rounded-xl bg-white text-xs leading-relaxed border border-[#157a4c]">
                      <strong className="block text-sm text-[#064e3b]">
                        Diantar Kebun Mang Ujang
                      </strong>
                      <span className="text-[#173b2b] font-bold">Rp 18.000</span>
                      <span className="text-[#3f5247]"> · Diantar besok 08.00–12.00</span>
                    </div>
                  )}
                  {ambilAktif && (
                    <div className="p-3 rounded-xl bg-white text-xs leading-relaxed">
                      <strong className="block text-sm text-[#173b2b]">
                        Ambil di lahan, Lembang
                      </strong>
                      <span className="text-[#157a4c] font-bold">Gratis</span>
                      <span className="text-[#3f5247]"> · Siap besok mulai 08.00</span>
                    </div>
                  )}
                </div>
              </aside>
            </div>
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
