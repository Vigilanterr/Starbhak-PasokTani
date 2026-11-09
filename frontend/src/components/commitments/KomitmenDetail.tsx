'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChipStatus, StatusPasokTani, JalurStatus, JalurStatusItem } from '../common';

export type TahapKomitmen = 'menunggu' | 'tertunda' | 'bayar' | 'terjadwal' | 'batal' | string;

export interface OpsiTanggalKirim {
  id: string;
  label: string;
  tiba: string;
}

export interface MetodePembayaranKomitmen {
  id: string;
  judul: string;
  ket: string;
  mati?: boolean;
}

export interface DetailKomitmen {
  id: string;
  nomor: string;
  nama: string;
  namaProduk?: string;
  petani: string;
  lokasi?: string;
  dibuat?: string;
  status: StatusPasokTani | string;
  labelChip?: string;
  tahap: TahapKomitmen;
  jumlah?: string;
  jumlahRentang?: string;
  minKg?: number;
  maksKg?: number;
  harga?: string;
  hargaSatuan?: number;
  hargaPerKg?: number;
  uangMuka?: string;
  uangMukaDitahan?: boolean | number;
  uangMukaNominal?: number;
  urutan?: string;
  urutanAntrean?: string;
  urut?: string;
  sisaPelunasan?: number;
  perkiraanPanen?: string;
  penundaan?: {
    tglBaru?: string;
    panenBaru?: string;
    tglSemula?: string;
    panenSemula?: string;
    selisihHari: number;
    catatanPetani?: string;
    alasan?: string;
    batalGratis?: boolean;
    sudahPilih?: 'ikut' | 'batal';
  };
  pembayaran?: {
    bobotDapatKg?: number;
    dapatKg?: number;
    batasWaktu?: string;
    sisaJam?: number;
    ongkirRp?: number;
    namaOngkir?: string;
    kurir?: string;
    biayaLayananRp?: number;
    opsiTanggal?: OpsiTanggalKirim[];
  };
  jadwalKirim?: {
    tanggalKirim?: string;
    tibaPerkiraan?: string;
    kurir?: string;
    alamatTujuan?: string;
    totalLunas?: number;
    kuotaUbahJadwal?: number;
    ubahJadwalTerpakai?: number;
  };
  linimasa?: JalurStatusItem[];
}

export type KomitmenDetailData = DetailKomitmen;

export interface KomitmenDetailProps {
  komitmen?: DetailKomitmen;
  tahap?: TahapKomitmen;
  tahapAwal?: TahapKomitmen;
  onBayarPelunasan?: (komitmenId: string, metode: string) => void;
  onBayarSisa?: (tanggalId: string, metodeId: string) => void;
  onBatalkanGratis?: (komitmenId: string) => void;
  onBatalKomitmen?: () => void;
  onUbahJadwal?: (tanggalBaruId: string) => void;
  onPilihTanggalKirim?: (komitmenId: string, tanggalId: string) => void;
  onTetapIkutTunda?: () => void;
  className?: string;
}

const DEFAULT_LINIMASA: JalurStatusItem[] = [
  {
    judul: 'Uang muka diterima Pasok Tani',
    waktu: '22 Okt 2026',
    ket: 'Rp 45.000 ditahan di rekening bersama. Harga dikunci Rp 15.000/kg.',
    status: 'selesai',
  },
  {
    judul: 'Penanaman bibit',
    waktu: '26 Okt 2026',
    ket: 'Sawah Bu Eti selesai tanam. Bibit varietas lokal Cianjur tumbuh baik.',
    status: 'selesai',
  },
  {
    judul: 'Perkiraan panen',
    waktu: '18 sampai 20 Nov 2026',
    ket: 'Petani mengisi hasil panen, lalu kamu bayar sisanya dalam 48 jam.',
    status: 'kini',
  },
  {
    judul: 'Pengiriman ke alamatmu',
    waktu: 'Paling lambat 3 hari setelah lunas',
    ket: 'Jadwal kirim bisa diubah 1 kali gratis.',
    status: 'nanti',
  },
];

const DEFAULT_KOMITMEN_DETAIL: DetailKomitmen = {
  id: 'KM-26102204',
  nomor: 'KM-26102204',
  nama: 'Beras Pandan Wangi',
  namaProduk: 'Beras Pandan Wangi Cianjur',
  petani: 'Sawah Bu Eti',
  lokasi: 'Cianjur',
  dibuat: '22 Okt 2026',
  status: 'ditanam',
  tahap: 'menunggu',
  jumlah: '5 sampai 10 kg',
  jumlahRentang: '5 sampai 10 kg',
  minKg: 5,
  maksKg: 10,
  harga: 'Rp 15.000/kg',
  hargaSatuan: 15000,
  hargaPerKg: 15000,
  uangMuka: 'Rp 45.000',
  uangMukaDitahan: true,
  uangMukaNominal: 45000,
  urut: 'ke-6 dari 11 pembeli',
  urutanAntrean: 'ke-6 dari 11',
  sisaPelunasan: 120500,
  perkiraanPanen: '18 sampai 20 Nov 2026',
  penundaan: {
    tglBaru: 'Rab, 25 Nov 2026',
    panenBaru: 'Rab, 25 Nov 2026',
    tglSemula: 'Sen, 16 Nov 2026',
    panenSemula: 'Sen, 16 Nov 2026',
    selisihHari: 9,
    alasan: 'Hujan lebat sepekan menghambat penjemuran gabah.',
    catatanPetani: 'Tanah becek membuat gabah perlu diangin-anginkan lebih lama agar kadar air pas dan beras tidak patah saat digiling.',
    batalGratis: true,
  },
  pembayaran: {
    bobotDapatKg: 10,
    dapatKg: 10,
    batasWaktu: 'Jum, 20 Nov, 16.00',
    sisaJam: 47,
    ongkirRp: 14000,
    namaOngkir: 'JNE Reguler',
    kurir: 'JNE Reguler',
    biayaLayananRp: 1500,
    opsiTanggal: [
      { id: 'tgl-1', label: 'Besok, 20 Nov', tiba: 'Perkiraan tiba Sab, 21 Nov' },
      { id: 'tgl-2', label: 'Sab, 21 Nov', tiba: 'Perkiraan tiba Min, 22 Nov' },
      { id: 'tgl-3', label: 'Min, 22 Nov', tiba: 'Perkiraan tiba Sen, 23 Nov' },
    ],
  },
  jadwalKirim: {
    tanggalKirim: 'Sab, 21 Nov 2026',
    tibaPerkiraan: 'Min, 22 Nov 2026',
    kurir: 'JNE Reguler',
    alamatTujuan: 'Jl. Margonda Raya No. 45, Beji, Depok',
    totalLunas: 165500,
    kuotaUbahJadwal: 1,
    ubahJadwalTerpakai: 0,
  },
  linimasa: DEFAULT_LINIMASA,
};

export function KomitmenDetail({
  komitmen = DEFAULT_KOMITMEN_DETAIL,
  tahap: tahapProp,
  tahapAwal,
  onBayarPelunasan,
  onBayarSisa,
  onBatalkanGratis,
  onBatalKomitmen,
  onUbahJadwal,
  onPilihTanggalKirim,
  onTetapIkutTunda,
  className = '',
}: KomitmenDetailProps) {
  const [internalTahap, setInternalTahap] = useState<TahapKomitmen>(
    tahapAwal ?? komitmen.tahap ?? 'menunggu'
  );
  const tahapKini = tahapProp ?? internalTahap;

  // Payment stage form states
  const opsiTanggal = komitmen.pembayaran?.opsiTanggal ?? [
    { id: 'tgl-1', label: 'Besok, 20 Nov', tiba: 'Perkiraan tiba Sab, 21 Nov' },
    { id: 'tgl-2', label: 'Sab, 21 Nov', tiba: 'Perkiraan tiba Min, 22 Nov' },
    { id: 'tgl-3', label: 'Min, 22 Nov', tiba: 'Perkiraan tiba Sen, 23 Nov' },
  ];
  const [tanggalTerpilih, setTanggalTerpilih] = useState<string>('tgl-2');
  const [metodeTerpilih, setMetodeTerpilih] = useState<string>('va');
  const [galatTanggal, setGalatTanggal] = useState<boolean>(false);
  const [galatMetode, setGalatMetode] = useState<boolean>(false);

  // Postponement state
  const [pilihanTunda, setPilihanTunda] = useState<'ikut' | 'batal' | null>(
    komitmen.penundaan?.sudahPilih ?? null
  );

  // Cancellation modal state
  const [dialogBatalBuka, setDialogBatalBuka] = useState<boolean>(false);

  // Reschedule form states
  const [bukaFormUbah, setBukaFormUbah] = useState<boolean>(false);
  const [tanggalUbahBaru, setTanggalUbahBaru] = useState<string>('tgl-3');
  const [galatUbahSama, setGalatUbahSama] = useState<boolean>(false);
  const [jadwalUbahTerpakai, setJadwalUbahTerpakai] = useState<number>(
    komitmen.jadwalKirim?.ubahJadwalTerpakai ?? 0
  );
  const [tanggalKirimAktif, setTanggalKirimAktif] = useState<string>(
    komitmen.jadwalKirim?.tanggalKirim ?? 'Sab, 21 Nov 2026'
  );

  // Derived values
  const selisihHari = komitmen.penundaan?.selisihHari ?? 9;
  const isBatalGratis = selisihHari > 7 || !!komitmen.penundaan?.batalGratis;
  const tglBaru = komitmen.penundaan?.tglBaru ?? komitmen.penundaan?.panenBaru ?? 'Rab, 25 Nov';
  const tglSemula = komitmen.penundaan?.tglSemula ?? komitmen.penundaan?.panenSemula ?? 'Sen, 16 Nov';
  const catatanPetani =
    komitmen.penundaan?.catatanPetani ??
    komitmen.penundaan?.alasan ??
    'Tanah becek membuat gabah perlu diangin-anginkan lebih lama agar kadar air pas dan beras tidak patah saat digiling.';

  const dapatKg = komitmen.pembayaran?.dapatKg ?? komitmen.pembayaran?.bobotDapatKg ?? 10;
  const hargaSatuan = komitmen.hargaSatuan ?? komitmen.hargaPerKg ?? 15000;
  const subtotalBarang = dapatKg * hargaSatuan;
  const ongkirNominal = komitmen.pembayaran?.ongkirRp ?? 14000;
  const kurirNama = komitmen.pembayaran?.kurir ?? komitmen.pembayaran?.namaOngkir ?? 'JNE Reguler';
  const biayaLayananNominal = komitmen.pembayaran?.biayaLayananRp ?? 1500;
  const uangMukaNominal = komitmen.uangMukaNominal ?? 45000;
  const sisaBayarTotal = subtotalBarang + ongkirNominal + biayaLayananNominal - uangMukaNominal;
  const potongan20Persen = Math.round(uangMukaNominal * 0.2);

  // Method options for payment
  const metodeList: MetodePembayaranKomitmen[] = [
    {
      id: 'dompet',
      judul: 'Dompet Pasok Tani',
      ket: 'Saldo Rp 63.500, kurang Rp 57.000.',
      mati: true,
    },
    {
      id: 'va',
      judul: 'Transfer Bank (Virtual Account)',
      ket: 'BCA, Mandiri, BRI, BNI. Otomatis terverifikasi.',
      mati: false,
    },
    {
      id: 'qris',
      judul: 'QRIS',
      ket: 'Bisa dari semua aplikasi perbankan & dompet digital.',
      mati: false,
    },
  ];

  const handleTetapIkut = () => {
    setPilihanTunda('ikut');
    onTetapIkutTunda?.();
  };

  const handleBukaBatal = () => {
    setDialogBatalBuka(true);
  };

  const handleTutupBatal = () => {
    setDialogBatalBuka(false);
  };

  const handleKonfirmasiBatal = () => {
    setDialogBatalBuka(false);
    setInternalTahap('batal');
    onBatalkanGratis?.(komitmen.id);
    onBatalKomitmen?.();
  };

  const handleBayarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!tanggalTerpilih) {
      setGalatTanggal(true);
      valid = false;
    } else {
      setGalatTanggal(false);
    }

    if (!metodeTerpilih) {
      setGalatMetode(true);
      valid = false;
    } else {
      setGalatMetode(false);
    }

    if (!valid) return;

    onBayarPelunasan?.(komitmen.id, metodeTerpilih);
    onBayarSisa?.(tanggalTerpilih, metodeTerpilih);
    setInternalTahap('terjadwal');
  };

  const handleSimpanUbahJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetObj = opsiTanggal.find((o) => o.id === tanggalUbahBaru);
    const labelBaru = targetObj?.label ?? 'Min, 22 Nov 2026';

    if (labelBaru === tanggalKirimAktif) {
      setGalatUbahSama(true);
      return;
    }

    setGalatUbahSama(false);
    setTanggalKirimAktif(labelBaru);
    setJadwalUbahTerpakai(1);
    setBukaFormUbah(false);
    onUbahJadwal?.(tanggalUbahBaru);
    onPilihTanggalKirim?.(komitmen.id, tanggalUbahBaru);
  };

  return (
    <div className={`relative min-h-screen bg-[#fcfbf6] text-[#173b2b] font-sans ${className}`}>
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-7 md:pb-16 box-border">
        <div className="flex flex-col gap-4">
          {/* Back Link */}
          <Link
            href="/komitmen"
            className="self-start inline-flex items-center gap-1 min-h-[36px] text-[#157a4c] text-sm font-bold no-underline hover:underline"
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
            Komitmen saya
          </Link>

          {/* Page Title & Status Header */}
          <div>
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
              <h1 className="m-0 text-[26px] md:text-[32px] font-extrabold leading-tight tracking-tight">
                {komitmen.nama}
              </h1>
              <ChipStatus
                status={komitmen.status}
                label={komitmen.labelChip}
              />
            </div>
            <p className="m-0 mt-1.5 text-sm text-[#3f5247]">
              {komitmen.petani}. {komitmen.nomor}, dibuat {komitmen.dibuat ?? '22 Okt 2026'}.
            </p>
          </div>

          {/* Main Grid: Left interactive content, Right summary */}
          <div className="flex flex-wrap items-start gap-5">
            {/* Left Main Area */}
            <div className="flex-1 min-w-0 basis-[480px] flex flex-col gap-4">
              {/* Info banner for choice confirmation */}
              {pilihanTunda === 'ikut' && (
                <p
                  role="status"
                  className="m-0 p-3.5 md:px-4 border-[1.5px] border-[#157a4c] rounded-xl bg-[#f3faf3] text-sm leading-normal text-[#173b2b] font-semibold"
                >
                  Kamu memilih tetap ikut. Kami akan kabari saat hasil panen siap diisi petani.
                </p>
              )}

              {/* Stage: Menunggu Panen */}
              {tahapKini === 'menunggu' && (
                <section
                  aria-labelledby="judul-tunggu"
                  className="p-4 md:p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5"
                >
                  <h2
                    id="judul-tunggu"
                    className="m-0 text-lg font-extrabold text-[#173b2b]"
                  >
                    Menunggu panen
                  </h2>
                  <p className="m-0 text-[15px] leading-relaxed">
                    Perkiraan panen <strong>18 sampai 20 Nov</strong>. Begitu {komitmen.petani} mengisi hasil panen, kamu dapat kabar jumlah pastinya dan punya 48 jam untuk membayar sisanya.
                  </p>
                  <p className="m-0 text-[13px] leading-normal text-[#3f5247]">
                    Kamu urutan {komitmen.urut ?? 'ke-6 dari 11'}. Jumlah paling sedikit semua pembeli dipenuhi dulu sesuai urutan, lalu tambahan sampai paling banyak.
                  </p>
                </section>
              )}

              {/* Stage: Panen Tertunda (Mundur) */}
              {tahapKini === 'tertunda' && (
                <section
                  aria-labelledby="judul-tunda"
                  className="p-4 md:p-[18px] border-[1.5px] border-[#e9c75c] rounded-2xl bg-[#fffdf5] flex flex-col gap-2.5"
                >
                  <h2
                    id="judul-tunda"
                    className="m-0 text-lg font-extrabold text-[#92400e]"
                  >
                    Panen mundur {selisihHari} hari
                  </h2>
                  <p className="m-0 text-[15px] leading-relaxed">
                    Sekarang <strong>{tglBaru}</strong>. Semula <del>{tglSemula}</del>.
                  </p>
                  <p className="m-0 p-2.5 md:px-3 rounded-xl bg-white text-sm leading-relaxed text-[#3f5247]">
                    {catatanPetani}
                  </p>
                  {!pilihanTunda && (
                    <>
                      <p className="m-0 text-sm leading-relaxed text-[#173b2b]">
                        Karena mundur lebih dari 7 hari, kamu boleh batal tanpa potongan. Uang muka {komitmen.uangMuka ?? 'Rp 135.000'} kembali penuh ke Dompet. Pilihan ini berlaku sampai hasil panen diisi.
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={handleTetapIkut}
                          className="flex-1 basis-[200px] min-h-[52px] border-0 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold cursor-pointer hover:bg-[#157a4c]"
                        >
                          Tetap ikut, tunggu {tglBaru}
                        </button>
                        <button
                          type="button"
                          onClick={handleBukaBatal}
                          className="flex-1 basis-[200px] min-h-[52px] border-[1.5px] border-[#064e3b] rounded-xl bg-white text-[#064e3b] text-[15px] font-extrabold cursor-pointer hover:bg-[#f3faf3]"
                        >
                          Batal tanpa potongan
                        </button>
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* Stage: Bayar Sisa */}
              {tahapKini === 'bayar' && (
                <form
                  onSubmit={handleBayarSubmit}
                  aria-labelledby="judul-bayar"
                  className="m-0 p-4 md:p-[18px] border-[1.5px] border-[#064e3b] rounded-2xl bg-white flex flex-col gap-4"
                >
                  <div>
                    <h2
                      id="judul-bayar"
                      className="m-0 text-[19px] font-extrabold text-[#173b2b]"
                    >
                      Kamu dapat {dapatKg} kg. Bayar sisanya.
                    </h2>
                    <p className="m-0 mt-1.5 flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-[#9a3412]">
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
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      Sebelum {komitmen.pembayaran?.batasWaktu ?? 'Jum, 20 Nov, 16.00'} ({komitmen.pembayaran?.sisaJam ?? 47} jam lagi)
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <dl className="m-0 p-3 md:px-3.5 rounded-xl bg-[#f6f8f4] flex flex-col gap-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#3f5247]">
                        {komitmen.namaProduk ?? komitmen.nama} {dapatKg} kg x Rp {hargaSatuan.toLocaleString('id-ID')}
                      </dt>
                      <dd className="m-0 font-medium">Rp {subtotalBarang.toLocaleString('id-ID')}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#3f5247]">Ongkir {kurirNama}</dt>
                      <dd className="m-0 font-medium">Rp {ongkirNominal.toLocaleString('id-ID')}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#3f5247]">Biaya layanan (1%)</dt>
                      <dd className="m-0 font-medium">Rp {biayaLayananNominal.toLocaleString('id-ID')}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#3f5247]">Uang muka sudah dibayar</dt>
                      <dd className="m-0 font-medium">−Rp {uangMukaNominal.toLocaleString('id-ID')}</dd>
                    </div>
                    <div className="flex justify-between gap-3 pt-2 border-t border-[#dee3da]">
                      <dt className="font-extrabold text-base">Sisa dibayar</dt>
                      <dd className="m-0 text-lg font-extrabold text-[#173b2b]">
                        Rp {sisaBayarTotal.toLocaleString('id-ID')}
                      </dd>
                    </div>
                  </dl>

                  {/* Delivery Date Fieldset */}
                  <fieldset className="m-0 p-0 border-0">
                    <legend className="p-0 mb-1 text-[15px] font-bold text-[#173b2b]">
                      Tanggal kirim <span aria-hidden="true" className="text-[#b42318]">*</span>
                    </legend>
                    <p className="m-0 mb-2 text-[13px] text-[#3f5247]">
                      Paling lambat 3 hari. Bisa diubah 1 kali gratis.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {opsiTanggal.map((t) => {
                        const isChecked = tanggalTerpilih === t.id;
                        return (
                          <label
                            key={t.id}
                            className={`flex flex-col items-start gap-0.5 min-h-[44px] p-2.5 px-3 box-border rounded-xl cursor-pointer ${
                              isChecked
                                ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                                : 'border border-[#dee3da] bg-white hover:bg-[#f6f8f4]'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="tanggal-kirim"
                                checked={isChecked}
                                onChange={() => {
                                  setTanggalTerpilih(t.id);
                                  setGalatTanggal(false);
                                }}
                                className="w-[18px] h-[18px] m-0 accent-[#064e3b]"
                              />
                              <strong className="text-sm text-[#173b2b]">{t.label}</strong>
                            </span>
                            <span className="text-xs text-[#3f5247]">{t.tiba}</span>
                          </label>
                        );
                      })}
                    </div>
                    {galatTanggal && (
                      <p className="m-0 mt-1.5 text-[13px] font-bold text-[#b42318]">
                        Pilih tanggal kirim.
                      </p>
                    )}
                  </fieldset>

                  {/* Payment Method Fieldset */}
                  <fieldset className="m-0 p-0 border-0">
                    <legend className="p-0 mb-2 text-[15px] font-bold text-[#173b2b]">
                      Bayar dengan <span aria-hidden="true" className="text-[#b42318]">*</span>
                    </legend>
                    <div className="flex flex-col gap-2">
                      {metodeList.map((m) => {
                        const isChecked = metodeTerpilih === m.id;
                        return (
                          <label
                            key={m.id}
                            className={`flex items-start gap-2.5 min-h-[44px] p-2.5 px-3.5 box-border rounded-xl ${
                              m.mati
                                ? 'border border-[#dee3da] bg-[#f6f8f4] opacity-75 cursor-not-allowed'
                                : isChecked
                                ? 'border-2 border-[#064e3b] bg-[#f3faf3] cursor-pointer'
                                : 'border border-[#dee3da] bg-white cursor-pointer hover:bg-[#f6f8f4]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="metode-bayar"
                              checked={isChecked}
                              disabled={m.mati}
                              onChange={() => {
                                if (!m.mati) {
                                  setMetodeTerpilih(m.id);
                                  setGalatMetode(false);
                                }
                              }}
                              className="w-5 h-5 mt-0.5 m-0 accent-[#064e3b]"
                            />
                            <span>
                              <strong className="block text-[15px] text-[#173b2b]">{m.judul}</strong>
                              <span
                                className={`text-[13px] ${
                                  m.mati ? 'text-[#92400e]' : 'text-[#3f5247]'
                                }`}
                              >
                                {m.ket}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {galatMetode && (
                      <p className="m-0 mt-1.5 text-[13px] font-bold text-[#b42318]">
                        Pilih cara bayar.
                      </p>
                    )}
                  </fieldset>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full min-h-[56px] border-0 rounded-xl bg-[#064e3b] text-white text-base font-extrabold cursor-pointer hover:bg-[#157a4c]"
                  >
                    Bayar Rp {sisaBayarTotal.toLocaleString('id-ID')}
                  </button>
                  <p className="m-0 text-[13px] leading-normal text-[#3f5247]">
                    Kalau lewat batas, Komitmen batal dengan potongan 20% uang muka (Rp {potongan20Persen.toLocaleString('id-ID')}) dan bagianmu ditawarkan ke pembeli berikutnya.
                  </p>
                </form>
              )}

              {/* Stage: Terjadwal (Lunas) */}
              {tahapKini === 'terjadwal' && (
                <section
                  aria-labelledby="judul-jadwal"
                  className="p-4 md:p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3"
                >
                  <h2
                    id="judul-jadwal"
                    className="m-0 text-lg font-extrabold text-[#173b2b]"
                  >
                    Lunas. Dikirim {tanggalKirimAktif}
                  </h2>
                  <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
                    {dapatKg} kg lewat {kurirNama} ke {komitmen.jadwalKirim?.alamatTujuan ?? 'Jl. Margonda Raya No. 45, Beji, Depok'}. Perkiraan tiba {komitmen.jadwalKirim?.tibaPerkiraan ?? 'Min, 22 Nov 2026'}. Dana Rp {(komitmen.jadwalKirim?.totalLunas ?? 165500).toLocaleString('id-ID')} ditahan sampai kamu menerima pesanan.
                  </p>

                  {bukaFormUbah ? (
                    <form
                      onSubmit={handleSimpanUbahJadwal}
                      className="p-3 md:p-3.5 border border-[#dee3da] rounded-xl bg-[#f6f8f4] flex flex-col gap-3"
                    >
                      <p className="m-0 text-sm font-extrabold text-[#173b2b]">
                        Pilih jadwal kirim baru (1 kali gratis)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {opsiTanggal.map((t) => {
                          const isChecked = tanggalUbahBaru === t.id;
                          return (
                            <label
                              key={t.id}
                              className={`flex flex-col items-start gap-0.5 p-2 px-2.5 rounded-lg cursor-pointer ${
                                isChecked
                                  ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                                  : 'border border-[#dee3da] bg-white'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <input
                                  type="radio"
                                  name="ubah-tgl"
                                  checked={isChecked}
                                  onChange={() => {
                                    setTanggalUbahBaru(t.id);
                                    setGalatUbahSama(false);
                                  }}
                                  className="accent-[#064e3b]"
                                />
                                <strong className="text-xs text-[#173b2b]">{t.label}</strong>
                              </span>
                              <span className="text-[11px] text-[#3f5247]">{t.tiba}</span>
                            </label>
                          );
                        })}
                      </div>
                      {galatUbahSama && (
                        <p className="m-0 text-[13px] font-bold text-[#b42318]">
                          Pilih tanggal lain dari jadwal sekarang.
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="flex-2 basis-[180px] min-h-[44px] border-0 rounded-xl bg-[#064e3b] text-white text-sm font-extrabold cursor-pointer hover:bg-[#157a4c]"
                        >
                          Simpan jadwal baru
                        </button>
                        <button
                          type="button"
                          onClick={() => setBukaFormUbah(false)}
                          className="flex-1 basis-[100px] min-h-[44px] border border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-sm font-bold cursor-pointer hover:bg-[#f6f8f4]"
                        >
                          Batal ubah
                        </button>
                      </div>
                    </form>
                  ) : jadwalUbahTerpakai === 0 ? (
                    <button
                      type="button"
                      onClick={() => setBukaFormUbah(true)}
                      className="self-start min-h-[44px] px-4 border-[1.5px] border-[#064e3b] rounded-xl bg-white text-[#064e3b] text-sm font-extrabold cursor-pointer hover:bg-[#f3faf3]"
                    >
                      Ubah jadwal (1 kali gratis)
                    </button>
                  ) : (
                    <p className="m-0 text-[13px] leading-normal text-[#3f5247]">
                      Jadwal sudah diubah 1 kali. Untuk mengubah lagi, tanya {komitmen.petani} lewat obrolan.
                    </p>
                  )}
                </section>
              )}

              {/* Stage: Batal */}
              {tahapKini === 'batal' && (
                <section className="p-4 md:p-[18px] border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-2.5">
                  <h2 className="m-0 text-lg font-extrabold text-[#173b2b]">
                    Komitmen dibatalkan
                  </h2>
                  <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
                    {isBatalGratis
                      ? `Uang muka Rp ${uangMukaNominal.toLocaleString('id-ID')} sudah kembali penuh ke Dompet Pasok Tani kamu tanpa potongan.`
                      : `Uang muka Rp ${uangMukaNominal.toLocaleString('id-ID')} dipotong 20% (Rp ${potongan20Persen.toLocaleString('id-ID')}). Saldo Rp ${(uangMukaNominal - potongan20Persen).toLocaleString('id-ID')} telah dikembalikan ke Dompet Pasok Tani.`}
                  </p>
                  <Link
                    href="/ikuti"
                    className="self-start inline-flex items-center min-h-[44px] px-4 border-[1.5px] border-[#064e3b] rounded-xl text-[#064e3b] text-sm font-extrabold no-underline hover:bg-[#f3faf3]"
                  >
                    Lihat Daftar Tunggu lain
                  </Link>
                </section>
              )}

              {/* Cancellation Bar (Available while not yet canceled and not yet scheduled) */}
              {tahapKini !== 'batal' && tahapKini !== 'terjadwal' && (
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 p-3.5 md:px-4 border border-[#dee3da] rounded-2xl bg-white">
                  <p className="flex-1 basis-[260px] m-0 text-[13px] leading-normal text-[#3f5247]">
                    {isBatalGratis
                      ? 'Panen mundur lebih dari 7 hari: kamu boleh batal tanpa potongan kapan saja sebelum hasil panen diisi.'
                      : 'Batal sebelum panen kena potongan 20% uang muka. Sisanya kembali ke Dompet.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleBukaBatal}
                    className="shrink-0 min-h-[44px] px-3.5 border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#8a1c12] text-sm font-extrabold cursor-pointer hover:bg-[#fff5f5]"
                  >
                    Batalkan Komitmen
                  </button>
                </div>
              )}
            </div>

            {/* Right Aside: Summary and Linimasa */}
            <aside className="flex-1 min-w-0 basis-[300px] flex flex-col gap-4">
              {/* Summary Card */}
              <section
                aria-labelledby="judul-ringkas"
                className="p-4 md:p-[18px] border border-[#dee3da] rounded-2xl bg-white"
              >
                <h2
                  id="judul-ringkas"
                  className="m-0 mb-2.5 text-[15px] font-extrabold text-[#173b2b]"
                >
                  Ringkasan
                </h2>
                <dl className="m-0 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#3f5247]">Jumlah</dt>
                    <dd className="m-0 font-bold text-right">
                      {komitmen.jumlah ?? komitmen.jumlahRentang ?? '5 sampai 10 kg'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#3f5247]">Harga dikunci</dt>
                    <dd className="m-0 font-bold">
                      {komitmen.harga ?? `Rp ${hargaSatuan.toLocaleString('id-ID')}/kg`}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#3f5247]">Uang muka</dt>
                    <dd className="m-0 font-bold">
                      {komitmen.uangMuka ?? `Rp ${uangMukaNominal.toLocaleString('id-ID')}`}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#3f5247]">Urutan</dt>
                    <dd className="m-0 font-bold">
                      {komitmen.urut ?? komitmen.urutanAntrean ?? 'ke-6 dari 11'}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Timeline Card */}
              <section
                aria-labelledby="judul-linimasa"
                className="p-4 md:p-[18px] border border-[#dee3da] rounded-2xl bg-white"
              >
                <h2
                  id="judul-linimasa"
                  className="m-0 mb-3.5 text-[15px] font-extrabold text-[#173b2b]"
                >
                  Dari lahan ke dapurmu
                </h2>
                <JalurStatus
                  langkah={komitmen.linimasa ?? DEFAULT_LINIMASA}
                  ringkas={true}
                  label="Linimasa Komitmen"
                />
              </section>
            </aside>
          </div>
        </div>
      </main>

      {/* Cancellation Confirmation Dialog */}
      {dialogBatalBuka && (
        <div className="fixed inset-0 z-20 bg-[rgba(23,59,43,0.5)] flex justify-center items-start p-3 md:p-4 pt-28 md:pt-48 box-border">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-batal"
            className="w-full max-w-[440px] p-5 md:p-[22px] rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5 box-border"
          >
            <h2
              id="judul-batal"
              className="m-0 text-[19px] font-extrabold leading-tight text-[#173b2b]"
            >
              Batalkan Komitmen {komitmen.nama}{' '}
              {komitmen.jumlahRentang ?? komitmen.jumlah ?? ''}?
            </h2>
            <dl className="m-0 p-3 md:px-3.5 rounded-xl bg-[#f6f8f4] flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#3f5247]">Sudah kamu bayar</dt>
                <dd className="m-0 font-medium">Rp {uangMukaNominal.toLocaleString('id-ID')}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#3f5247]">
                  {isBatalGratis ? 'Potongan panen mundur (0%)' : 'Potongan pembatalan (20%)'}
                </dt>
                <dd className="m-0 font-medium">
                  {isBatalGratis ? 'Rp 0' : `−Rp ${potongan20Persen.toLocaleString('id-ID')}`}
                </dd>
              </div>
              <div className="flex justify-between gap-3 pt-2 border-t border-[#dee3da]">
                <dt className="font-extrabold">Kembali ke Dompet</dt>
                <dd className="m-0 font-extrabold">
                  Rp{' '}
                  {isBatalGratis
                    ? uangMukaNominal.toLocaleString('id-ID')
                    : (uangMukaNominal - potongan20Persen).toLocaleString('id-ID')}
                </dd>
              </div>
            </dl>
            <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
              Bagianmu ditawarkan ke pembeli berikutnya. Pembatalan tidak bisa diurungkan.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleKonfirmasiBatal}
                className="w-full min-h-[52px] border-0 rounded-xl bg-[#b42318] text-white text-base font-extrabold cursor-pointer hover:bg-[#991b1b]"
              >
                {isBatalGratis
                  ? `Batalkan, uang kembali penuh (Rp ${uangMukaNominal.toLocaleString('id-ID')})`
                  : `Batalkan, potong Rp ${potongan20Persen.toLocaleString('id-ID')}`}
              </button>
              <button
                type="button"
                onClick={handleTutupBatal}
                className="w-full min-h-[48px] border-[1.5px] border-[#dee3da] rounded-xl bg-white text-[#173b2b] text-[15px] font-bold cursor-pointer hover:bg-[#f6f8f4]"
              >
                Tetap ikut
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KomitmenDetail;
