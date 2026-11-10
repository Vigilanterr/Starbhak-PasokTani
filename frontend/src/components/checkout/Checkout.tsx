'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';

export interface CheckoutItemProduk {
  id: string;
  nama: string;
  kategori?: string;
  info?: string;
  infoUrgen?: boolean;
  qty: number;
  satuan: string;
  harga: number;
  normal: number;
  jenis?: 'grosir' | 'surplus' | string;
  diskon?: string;
}
export type ItemCheckout = CheckoutItemProduk;

export interface PilihanKurir {
  id: string;
  ikon?: 'antar' | 'kurir' | 'instan' | 'ambil' | string;
  nama: string;
  via: string;
  tanggal?: string;
  harga: number;
  batas?: string;
  nonaktif?: string;
}
export type OpsiPengiriman = PilihanKurir;

export interface PaketTokoCheckout {
  id: string;
  toko: string;
  lokasi: string;
  terverifikasi?: boolean;
  berat: string;
  item: CheckoutItemProduk[];
  opsi: PilihanKurir[];
  kurirTerpilih?: string;
  catatan?: string;
}
export type GrupPengirimanPetani = PaketTokoCheckout;

export interface AlamatPenerimaCheckout {
  id: string;
  label: string;
  penerima: string;
  telepon: string;
  alamatLengkap: string;
  patokan?: string;
  terpasangTitik?: boolean;
  isUtama?: boolean;
}
export type AlamatCheckout = AlamatPenerimaCheckout;

export interface RingkasanBiayaCheckout {
  subtotal: number;
  totalOngkir: number;
  diskonGrosir: number;
  diskonSurplus: number;
  biayaLayanan: number;
  total: number;
}

export interface DataCheckout {
  tokoList: PaketTokoCheckout[];
  alamat?: AlamatPenerimaCheckout | null;
  saldoDompet?: number;
  ringkasan?: RingkasanBiayaCheckout;
  isResep?: boolean;
}

export interface CheckoutProps {
  dataCheckout?: DataCheckout;
  alamat?: AlamatPenerimaCheckout | null;
  pertamaKali?: boolean;
  grupPengiriman?: PaketTokoCheckout[];
  saldoDompet?: number;
  metodeBawaan?: 'dompet' | 'qris' | 'va';
  bankBawaan?: string;
  masalah?: boolean;
  masalahStok?: boolean;
  resep?: boolean;
  isResep?: boolean;
  onGantiAlamat?: () => void;
  onTambahAlamat?: () => void;
  onPilihPengiriman?: (grupId: string, opsiId: string) => void;
  onSimpanCatatanPetani?: (grupId: string, catatan: string) => void;
  onPilihMetodeBayar?: (metode: string) => void;
  onPilihBankVa?: (bank: string) => void;
  onLanjutBayar?: (payload: {
    metode: string;
    bank?: string;
    kirim: Record<string, string>;
    catatan: Record<string, string>;
  }) => void;
  onBayar?: (data: { total: number; metode: string; bank?: string }) => void;
  hrefKeranjang?: string;
  hrefBayar?: string;
  className?: string;
}

export function formatRupiah(n: number | string): string {
  if (typeof n === 'string') return n;
  const nb = '\u00a0';
  return 'Rp' + nb + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const defaultAlamatCheckout: AlamatPenerimaCheckout = {
  id: 'alamat-1',
  label: 'Warung Dewi',
  penerima: 'Dewi Lestari',
  telepon: '0812-3456-7890',
  alamatLengkap:
    'Jl. Cigadung Raya Timur No. 18, RT 03/RW 07, Cigadung, Cibeunying Kaler, Kota Bandung, Jawa Barat 40191',
  patokan: 'depan Masjid Al-Ikhlas, pagar hijau',
  terpasangTitik: true,
  isUtama: true,
};

export const defaultTokoListCheckout: PaketTokoCheckout[] = [
  {
    id: 'ujang',
    toko: 'Kebun Mang Ujang',
    lokasi: 'Lembang · 14 km',
    terverifikasi: true,
    berat: '28 kg',
    item: [
      {
        id: 'tomat',
        nama: 'Tomat Merah Lembang',
        kategori: 'sayuran',
        info: 'Dipanen kemarin',
        qty: 12,
        satuan: 'kg',
        harga: 12000,
        normal: 14000,
        jenis: 'grosir',
      },
      {
        id: 'kol',
        nama: 'Kol Bulat Lembang',
        kategori: 'sayuran',
        info: 'Dipanen hari ini',
        qty: 16,
        satuan: 'kg',
        harga: 8000,
        normal: 9000,
        jenis: 'grosir',
      },
    ],
    opsi: [
      {
        id: 'antar',
        ikon: 'antar',
        nama: 'Diantar petani',
        via: 'Jadwal dan ongkir ditentukan Kebun Mang Ujang',
        tanggal: 'Sen, 9 Nov · 06.00–09.00',
        harga: 15000,
      },
      {
        id: 'reguler',
        ikon: 'kurir',
        nama: 'Kurir reguler',
        via: 'JNE',
        tanggal: 'Tiba Sel, 10 Nov',
        harga: 12000,
      },
      {
        id: 'instan',
        ikon: 'instan',
        nama: 'Kurir instan (mobil)',
        via: 'GrabExpress · dipakai karena berat di atas 20 kg',
        tanggal: 'Tiba hari ini, 15.30–17.30',
        harga: 85000,
        batas: 'Pesan dalam 1 jam 28 menit',
      },
      {
        id: 'ambil',
        ikon: 'ambil',
        nama: 'Ambil di lahan',
        via: 'Lembang, 14 km dari alamatmu',
        tanggal: 'Mulai Sen, 9 Nov · 07.00–15.00',
        harga: 0,
      },
    ],
  },
  {
    id: 'ciremai',
    toko: 'Kumbung Jamur Ciremai',
    lokasi: 'Kuningan · 168 km',
    terverifikasi: true,
    berat: '3 kg',
    item: [
      {
        id: 'jamur',
        nama: 'Jamur Tiram Putih',
        kategori: 'jamur',
        info: 'Kedaluwarsa Sel, 10 Nov',
        infoUrgen: true,
        qty: 3,
        satuan: 'kg',
        harga: 15400,
        normal: 22000,
        jenis: 'surplus',
        diskon: '−30%',
      },
    ],
    opsi: [
      {
        id: 'kilat',
        ikon: 'kurir',
        nama: 'Kurir kilat',
        via: 'SiCepat BEST',
        tanggal: 'Tiba Sen, 9 Nov, sebelum kedaluwarsa',
        harga: 21000,
      },
      {
        id: 'reguler',
        ikon: 'kurir',
        nama: 'Kurir reguler',
        via: 'JNE',
        harga: 12000,
        nonaktif: 'Tidak tersedia: jamur tiram paling lama 1 hari di perjalanan.',
      },
      {
        id: 'ambil',
        ikon: 'ambil',
        nama: 'Ambil di lahan',
        via: 'Cigugur, Kuningan · 168 km dari alamatmu',
        tanggal: 'Mulai Sen, 9 Nov · 06.00–12.00',
        harga: 0,
      },
    ],
  },
  {
    id: 'cikajang',
    toko: 'Tani Cikajang',
    lokasi: 'Garut · 71 km',
    terverifikasi: false,
    berat: '2 kg',
    item: [
      {
        id: 'cabai',
        nama: 'Cabai Merah Keriting',
        kategori: 'rempah',
        info: 'Dipanen 3 hari lalu',
        qty: 2,
        satuan: 'kg',
        harga: 42000,
        normal: 42000,
        jenis: '',
      },
    ],
    opsi: [
      {
        id: 'reguler',
        ikon: 'kurir',
        nama: 'Kurir reguler',
        via: 'JNE',
        tanggal: 'Tiba Sel, 10 Nov',
        harga: 14000,
      },
      {
        id: 'hemat',
        ikon: 'kurir',
        nama: 'Kurir hemat',
        via: 'AnterAja',
        tanggal: 'Tiba Rab, 11 Nov',
        harga: 10000,
      },
      {
        id: 'ambil',
        ikon: 'ambil',
        nama: 'Ambil di lahan',
        via: 'Cikajang, Garut · 71 km dari alamatmu',
        tanggal: 'Mulai Sen, 9 Nov · 08.00–16.00',
        harga: 0,
      },
    ],
  },
];

export const defaultDataCheckout: DataCheckout = {
  tokoList: defaultTokoListCheckout,
  alamat: defaultAlamatCheckout,
  saldoDompet: 63500,
  isResep: false,
};

export const bankVaList = [
  { id: 'bni', nama: 'BNI', ket: 'Bisa dari bank apa pun', semua: true },
  { id: 'bri', nama: 'BRI', ket: 'Bisa dari bank apa pun', semua: true },
  { id: 'permata', nama: 'Permata', ket: 'Bisa dari bank apa pun', semua: true },
  { id: 'cimb', nama: 'CIMB Niaga', ket: 'Bisa dari bank apa pun', semua: true },
  { id: 'bca', nama: 'BCA', ket: 'Hanya dari rekening BCA', semua: false },
  { id: 'mandiri', nama: 'Mandiri', ket: 'Hanya dari rekening Mandiri', semua: false },
];

export function Checkout({
  dataCheckout = defaultDataCheckout,
  alamat: alamatProp,
  pertamaKali: pertamaKaliProp = false,
  grupPengiriman: grupProp,
  saldoDompet: saldoDompetProp,
  metodeBawaan = 'qris',
  bankBawaan = 'bni',
  masalah = false,
  masalahStok = false,
  resep = false,
  isResep: isResepProp,
  onGantiAlamat,
  onTambahAlamat,
  onPilihPengiriman,
  onSimpanCatatanPetani,
  onPilihMetodeBayar,
  onPilihBankVa,
  onLanjutBayar,
  onBayar,
  hrefKeranjang = '/keranjang',
  hrefBayar = '/checkout/bayar',
  className = '',
}: CheckoutProps) {
  const adaAlamat = !pertamaKaliProp && (alamatProp !== null && (alamatProp ?? dataCheckout.alamat) !== null);
  const alamatAktif = alamatProp ?? dataCheckout.alamat ?? defaultAlamatCheckout;
  const isResepMode = isResepProp ?? resep ?? dataCheckout.isResep ?? false;
  const saldoUser = saldoDompetProp ?? dataCheckout.saldoDompet ?? 63500;

  // Initial shipping selection: default 'reguler' for ujang & cikajang, 'kilat' for ciremai
  const [kirimTerpilih, setKirimTerpilih] = useState<Record<string, string>>({
    ujang: 'reguler',
    ciremai: 'kilat',
    cikajang: 'reguler',
  });

  const [metodeBayar, setMetodeBayar] = useState<string>(metodeBawaan);
  const [bankVa, setBankVa] = useState<string>(bankBawaan);
  const [catatanBukaMap, setCatatanBukaMap] = useState<Record<string, boolean>>({});
  const [catatanTeksMap, setCatatanTeksMap] = useState<Record<string, string>>({});

  // Shortage problem simulation states
  const [masalahTerbuka, setMasalahTerbuka] = useState<boolean>(masalah || masalahStok);
  const [jamurQty, setJamurQty] = useState<number>(3);
  const [jamurGanti, setJamurGanti] = useState<boolean>(false);
  const [jamurLewati, setJamurLewati] = useState<boolean>(false);

  // Wallet modal state: '' | 'konfirmasi' | 'lunas'
  const [dompetModal, setDompetModal] = useState<'' | 'konfirmasi' | 'lunas'>('');

  const rawGrup = grupProp ?? dataCheckout.tokoList ?? defaultTokoListCheckout;

  // Process store packages with any simulated shortage adjustments
  const processedGrup = rawGrup
    .filter((g) => !(jamurLewati && g.id === 'ciremai'))
    .map((g) => {
      if (g.id === 'ciremai') {
        return {
          ...g,
          berat: `${jamurQty} kg`,
          item: g.item.map((it) => {
            if (it.id === 'jamur') {
              return {
                ...it,
                nama: jamurGanti ? 'Jamur Kancing Putih' : 'Jamur Tiram Putih',
                qty: jamurQty,
                harga: jamurGanti ? 24000 : 15400,
                normal: jamurGanti ? 24000 : 22000,
                jenis: jamurGanti ? '' : 'surplus',
                diskon: jamurGanti ? '' : '−30%',
                info: jamurGanti ? 'Dipanen kemarin' : 'Kedaluwarsa Sel, 10 Nov',
                infoUrgen: !jamurGanti,
              };
            }
            return it;
          }),
        };
      }
      return g;
    });

  // Calculate totals
  let normalTotal = 0;
  let bayarTotal = 0;
  let grosirTotal = 0;
  let surplusTotal = 0;
  let ongkirTotal = 0;
  let jumlahProduk = 0;

  for (const g of processedGrup) {
    for (const it of g.item) {
      jumlahProduk += 1;
      normalTotal += it.normal * it.qty;
      bayarTotal += it.harga * it.qty;
      if (it.jenis === 'grosir') grosirTotal += (it.normal - it.harga) * it.qty;
      if (it.jenis === 'surplus') surplusTotal += (it.normal - it.harga) * it.qty;
    }

    const pilihanOpsiId = kirimTerpilih[g.id];
    const opsiAktif = g.opsi.find((o) => o.id === pilihanOpsiId && !o.nonaktif);
    if (adaAlamat && opsiAktif) {
      ongkirTotal += opsiAktif.harga;
    }
  }

  const biayaLayanan = Math.round(bayarTotal * 0.01);
  const totalAkhir = bayarTotal + (adaAlamat ? ongkirTotal : 0) + biayaLayanan;

  const saldoCukup = saldoUser >= totalAkhir;
  const metodeEfektif = metodeBayar === 'dompet' && !saldoCukup ? 'qris' : metodeBayar;
  const pakaiDompet = metodeEfektif === 'dompet';

  const handlePilihKurir = (grupId: string, opsiId: string) => {
    setKirimTerpilih((prev) => ({ ...prev, [grupId]: opsiId }));
    onPilihPengiriman?.(grupId, opsiId);
  };

  const handlePilihMetode = (metode: string) => {
    setMetodeBayar(metode);
    onPilihMetodeBayar?.(metode);
  };

  const handlePilihBank = (bId: string) => {
    setBankVa(bId);
    onPilihBankVa?.(bId);
  };

  const handleCatatanChange = (grupId: string, teks: string) => {
    setCatatanTeksMap((prev) => ({ ...prev, [grupId]: teks }));
    onSimpanCatatanPetani?.(grupId, teks);
  };

  const handleCtaClick = (e?: React.MouseEvent) => {
    if (!adaAlamat) {
      if (onTambahAlamat) {
        e?.preventDefault();
        onTambahAlamat();
      }
      return;
    }

    if (masalahTerbuka) {
      e?.preventDefault();
      setMasalahTerbuka(true);
      return;
    }

    if (pakaiDompet) {
      e?.preventDefault();
      setDompetModal('konfirmasi');
      return;
    }

    if (onLanjutBayar) {
      e?.preventDefault();
      onLanjutBayar({
        metode: metodeEfektif,
        bank: metodeEfektif === 'va' ? bankVa : undefined,
        kirim: kirimTerpilih,
        catatan: catatanTeksMap,
      });
    } else if (onBayar) {
      e?.preventDefault();
      onBayar({
        total: totalAkhir,
        metode: metodeEfektif,
        bank: metodeEfektif === 'va' ? bankVa : undefined,
      });
    }
  };

  const ctaLabel = adaAlamat
    ? pakaiDompet
      ? `Bayar ${formatRupiah(totalAkhir)} dengan Dompet`
      : `Bayar ${formatRupiah(totalAkhir)}`
    : 'Tambah alamat dulu';

  const ctaLabelPendek = adaAlamat
    ? pakaiDompet
      ? 'Bayar dengan Dompet'
      : 'Bayar'
    : 'Tambah alamat';

  return (
    <div
      className={`relative min-h-screen bg-[#fcfbf6] font-sans text-[#173b2b] ${className}`}
    >
      <SiteHeader active="keranjang" cartCount={5} />

      <main className="max-w-[1200px] mx-auto px-4 py-4 md:px-6 md:pt-7 md:pb-16 box-border">
        {/* Stepper Progress */}
        <ol
          aria-label="Langkah belanja"
          className="list-none m-0 mb-3 p-0 flex items-center gap-2 text-[13px] text-[#5a6b60]"
        >
          <li className="flex items-center gap-1.5">
            <Link
              href={hrefKeranjang}
              className="inline-flex items-center gap-1.5 min-h-8 text-[#157a4c] font-bold no-underline hover:underline"
            >
              <span
                aria-hidden="true"
                className="w-5 h-5 rounded-full grid place-items-center bg-[#157a4c] text-white"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              Keranjang
            </Link>
          </li>
          <li aria-hidden="true" className="w-5 h-px bg-[#c9d2c6]" />
          <li
            aria-current="step"
            className="flex items-center gap-1.5 text-[#173b2b] font-extrabold"
          >
            <span
              aria-hidden="true"
              className="w-5 h-5 rounded-full grid place-items-center bg-[#064e3b] text-white text-[11px]"
            >
              2
            </span>
            Checkout
          </li>
          <li aria-hidden="true" className="w-5 h-px bg-[#c9d2c6]" />
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="w-5 h-5 box-border rounded-full grid place-items-center border-1.5 border-[#9aa79e] text-[11px] font-bold"
            >
              3
            </span>
            Bayar
          </li>
        </ol>

        <h1 className="m-0 mb-4.5 text-[28px] md:text-[36px] leading-tight font-extrabold tracking-tight">
          Checkout
        </h1>

        <div className="flex flex-wrap items-start gap-6">
          {/* Main Checkout Packages Column */}
          <div className="grow min-w-0 flex flex-col gap-4" style={{ flex: '999 1 560px' }}>
            {/* Delivery Address Section */}
            <section
              aria-labelledby="judul-alamat"
              className="p-4.5 md:p-5 border border-[#dee3da] rounded-2xl bg-white"
            >
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <h2
                  id="judul-alamat"
                  className="m-0 flex items-center gap-2 text-[17px] font-extrabold"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#157a4c"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Alamat pengiriman
                </h2>

                {adaAlamat && (
                  <button
                    type="button"
                    onClick={onGantiAlamat}
                    className="inline-flex items-center min-h-10 px-3.5 border border-[#dee3da] rounded-xl text-[#064e3b] text-sm font-bold bg-white cursor-pointer hover:bg-[#ebf2eb]"
                  >
                    Ganti
                  </button>
                )}
              </div>

              {adaAlamat ? (
                <div className="flex flex-col gap-1 text-sm leading-relaxed">
                  <p className="m-0 flex items-center gap-2 flex-wrap">
                    <strong className="font-extrabold">{alamatAktif.label}</strong>
                    {alamatAktif.isUtama && (
                      <span className="py-0.5 px-2 rounded-full bg-[#ebf2eb] text-[#064e3b] text-xs font-bold">
                        Utama
                      </span>
                    )}
                  </p>
                  <p className="m-0">
                    {alamatAktif.penerima} · {alamatAktif.telepon}
                  </p>
                  <p className="m-0 text-[#3f5247]">{alamatAktif.alamatLengkap}</p>
                  {alamatAktif.patokan && (
                    <p className="m-0 text-[#3f5247]">Patokan: {alamatAktif.patokan}</p>
                  )}
                  <p className="mt-1.5 mb-0 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] text-[#5a6b60]">
                    {alamatAktif.terpasangTitik && (
                      <span className="inline-flex items-center gap-1.5 text-[#157a4c] font-bold">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Titik lokasi terpasang, kurir instan tersedia
                      </span>
                    )}
                    <span>
                      Nomor HP dipakai kurir dan petani untuk menghubungimu soal pesanan ini.
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2.5 p-3.5 border-1.5 border-dashed border-[#c9d2c6] rounded-xl bg-[#fcfbf6]">
                  <p className="m-0 text-sm leading-relaxed">
                    Ini checkout pertamamu. Tambahkan alamat dan nomor HP penerima agar ongkos kirim
                    bisa dihitung. Data ini disimpan di akunmu untuk belanja berikutnya.
                  </p>
                  <button
                    type="button"
                    onClick={onTambahAlamat}
                    className="inline-flex items-center gap-2 min-h-12 px-4.5 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold cursor-pointer border-0 hover:bg-[#053d2e]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Tambah alamat pengiriman
                  </button>
                </div>
              )}
            </section>

            {/* Farmer Shipping Package Groups */}
            {processedGrup.map((g, gi) => {
              const catatanBuka = !!catatanBukaMap[g.id];
              return (
                <section
                  key={g.id}
                  aria-label={`Pengiriman ${gi + 1}: ${g.toko}`}
                  className="border border-[#dee3da] rounded-2xl bg-white overflow-hidden"
                >
                  {/* Store Header */}
                  <div className="flex items-center gap-2.5 p-2.5 px-4 bg-[#d5f6d5] border-b border-[#a9cfae]">
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-8 h-8 rounded-xl grid place-items-center bg-[#064e3b] text-white"
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                        <path d="M2 7h20" />
                      </svg>
                    </span>
                    <div className="grow min-w-0">
                      <p className="m-0 text-xs font-bold text-[#3f5247]">
                        Pengiriman {gi + 1} dari {processedGrup.length}
                      </p>
                      <p className="m-0 flex items-center gap-1.5 min-w-0 text-[15px] font-extrabold">
                        <span className="min-w-0 truncate">{g.toko}</span>
                        {g.terverifikasi && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-1.5 rounded-md bg-[#075985] text-white text-xs leading-4.5 font-extrabold">
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            Terverifikasi
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[#3f5247] text-right">{g.lokasi}</span>
                  </div>

                  {/* Items in store */}
                  <ul className="list-none m-0 p-1 px-4">
                    {g.item.map((it, iIdx) => {
                      const isSayuran = it.kategori === 'sayuran';
                      const isJamur = it.kategori === 'jamur';
                      const isRempah = it.kategori === 'rempah';

                      const latarIkon = isSayuran
                        ? 'bg-[#e3f1df] text-[#2f7a3e]'
                        : isJamur
                        ? 'bg-[#ece8e1] text-[#6b5e4f]'
                        : 'bg-[#fbe3df] text-[#b42318]';

                      return (
                        <li
                          key={it.id}
                          className={`flex items-start gap-3 py-3 ${
                            iIdx === 0 ? '' : 'border-t border-[#eef0eb]'
                          }`}
                        >
                          <span
                            role="img"
                            aria-label={`Placeholder foto ${it.nama}`}
                            className={`shrink-0 w-13 h-13 rounded-xl grid place-items-center ${latarIkon}`}
                          >
                            {isJamur ? (
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M12 3C7 3 3 6.5 3 10.5c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5C21 6.5 17 3 12 3Z" />
                                <path d="M9 12v6.5a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5V12" />
                              </svg>
                            ) : isRempah ? (
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M17.5 6.5c-3.5-.5-7 1.5-8.6 5.4C7.6 15.2 5.3 17.6 2.5 19c4.2 1.6 10.2.6 13.6-3.6 2.3-2.8 2.9-6 1.4-8.9Z" />
                                <path d="M17.5 6.5c.2-1.8 1.4-3.2 3.5-3.5" />
                              </svg>
                            ) : (
                              <svg
                                width="24"
                                height="24"
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
                            )}
                          </span>

                          <div className="grow min-w-0 flex flex-col gap-1">
                            <p className="m-0 text-sm font-bold leading-snug">{it.nama}</p>
                            <p className="m-0 flex flex-wrap items-center gap-1 gap-x-2 text-[13px] text-[#3f5247]">
                              <span>
                                {it.qty} {it.satuan} × {formatRupiah(it.harga)}
                              </span>
                              {it.jenis === 'grosir' && (
                                <span className="px-1.5 rounded-md bg-[#ebf2eb] text-[#064e3b] text-xs font-bold">
                                  Harga grosir
                                </span>
                              )}
                              {it.jenis === 'surplus' && (
                                <span className="px-1.5 rounded-md bg-[#c2410c] text-white text-xs font-extrabold">
                                  Surplus {it.diskon}
                                </span>
                              )}
                            </p>
                            {it.info && (
                              <p
                                className={`m-0 text-xs ${
                                  it.infoUrgen ? 'text-[#c2410c] font-bold' : 'text-[#157a4c]'
                                }`}
                              >
                                {it.info}
                              </p>
                            )}
                          </div>

                          <span className="shrink-0 text-sm font-extrabold whitespace-nowrap">
                            {formatRupiah(it.harga * it.qty)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Courier selection */}
                  <fieldset className="m-0 p-1 px-4 pb-4 border-0 border-t border-[#eef0eb]">
                    <legend className="float-left w-full py-3 pb-2 text-sm font-extrabold">
                      Pilih pengiriman{' '}
                      <span className="font-normal text-[#5a6b60]">· berat {g.berat}</span>
                    </legend>

                    {adaAlamat ? (
                      <div className="clear-both flex flex-col gap-2">
                        {g.opsi.map((opsi) => {
                          const isNonaktif = !!opsi.nonaktif;
                          const isDipilih = !isNonaktif && kirimTerpilih[g.id] === opsi.id;

                          return (
                            <label
                              key={opsi.id}
                              className={`flex items-start gap-3 p-3 px-3.5 rounded-xl border ${
                                isDipilih
                                  ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                                  : isNonaktif
                                  ? 'border-[#dee3da] bg-[#fcfbf6] opacity-70 cursor-not-allowed'
                                  : 'border-[#dee3da] bg-white cursor-pointer hover:bg-[#f6f8f4]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`kirim-${g.id}`}
                                checked={isDipilih}
                                disabled={isNonaktif}
                                onChange={() => handlePilihKurir(g.id, opsi.id)}
                                className="shrink-0 w-5 h-5 mt-0.5 accent-[#064e3b]"
                              />
                              <span
                                aria-hidden="true"
                                className="shrink-0 w-8 h-8 rounded-xl grid place-items-center bg-[#ebf2eb] text-[#064e3b]"
                              >
                                {opsi.ikon === 'instan' ? (
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                                  </svg>
                                ) : opsi.ikon === 'antar' ? (
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M7 20h10" />
                                    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                                    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                                    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                                  </svg>
                                ) : opsi.ikon === 'ambil' ? (
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                                    <path d="M2 7h20" />
                                  </svg>
                                ) : (
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                                    <path d="M15 18H9" />
                                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                                    <circle cx="17" cy="18" r="2" />
                                    <circle cx="7" cy="18" r="2" />
                                  </svg>
                                )}
                              </span>

                              <span className="grow min-w-0 flex flex-col gap-0.5">
                                <span className="text-sm font-extrabold">{opsi.nama}</span>
                                {!isNonaktif && opsi.tanggal && (
                                  <span className="text-sm font-bold text-[#064e3b]">
                                    {opsi.tanggal}
                                  </span>
                                )}
                                <span className="text-xs text-[#5a6b60]">{opsi.via}</span>
                                {opsi.batas && !isNonaktif && (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#c2410c]">
                                    <svg
                                      width="13"
                                      height="13"
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
                                    {opsi.batas} agar tiba hari ini
                                  </span>
                                )}
                                {isNonaktif && (
                                  <span className="text-xs font-semibold text-[#8a1c12]">
                                    {opsi.nonaktif}
                                  </span>
                                )}
                              </span>

                              <span
                                className={`shrink-0 text-sm font-extrabold whitespace-nowrap ${
                                  opsi.harga === 0 ? 'text-[#157a4c]' : 'text-[#173b2b]'
                                }`}
                              >
                                {opsi.harga === 0 ? 'Gratis' : formatRupiah(opsi.harga)}
                              </span>
                            </label>
                          );
                        })}

                        {/* Collapsible notes for farmer */}
                        <button
                          type="button"
                          aria-expanded={catatanBuka}
                          onClick={() =>
                            setCatatanBukaMap((prev) => ({ ...prev, [g.id]: !catatanBuka }))
                          }
                          className="self-start inline-flex items-center gap-1.5 min-h-10 mt-0.5 px-1 border-0 bg-transparent text-[#157a4c] font-sans text-sm font-bold cursor-pointer hover:underline"
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
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          Catatan untuk petani (opsional)
                        </button>

                        {catatanBuka && (
                          <div className="flex flex-col gap-1.5">
                            <label
                              htmlFor={`catatan-${g.id}`}
                              className="text-[13px] font-bold"
                            >
                              Catatan untuk {g.toko}{' '}
                              <span className="font-normal text-[#5a6b60]">(opsional)</span>
                            </label>
                            <textarea
                              id={`catatan-${g.id}`}
                              rows={2}
                              value={catatanTeksMap[g.id] ?? ''}
                              onChange={(e) => handleCatatanChange(g.id, e.target.value)}
                              placeholder="Contoh: pilihkan tomat yang belum terlalu matang"
                              className="box-border w-full p-2.5 px-3 border-1.5 border-[#7d877e] rounded-xl font-sans text-[15px] text-[#173b2b] resize-y outline-none focus:border-[#064e3b]"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="clear-both m-0 p-3 px-3.5 rounded-xl bg-[#fcfbf6] text-[13px] text-[#5a6b60]">
                        Pilihan pengiriman dan ongkosnya muncul setelah alamat diisi.
                      </p>
                    )}
                  </fieldset>
                </section>
              );
            })}

            {/* Payment Method Selector */}
            <section
              aria-labelledby="judul-bayar"
              className="p-4.5 md:p-5 border border-[#dee3da] rounded-2xl bg-white"
            >
              <fieldset className="m-0 p-0 border-0">
                <legend
                  id="judul-bayar"
                  className="p-0 mb-3 text-[17px] font-extrabold"
                >
                  Metode pembayaran
                </legend>
                <div className="flex flex-col gap-2">
                  {/* Dompet Pasok Tani */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                      pakaiDompet
                        ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                        : saldoCukup
                        ? 'border-[#dee3da] bg-white cursor-pointer hover:bg-[#f6f8f4]'
                        : 'border-[#dee3da] bg-[#fcfbf6] opacity-80 cursor-not-allowed'
                    }`}
                  >
                    <input
                      type="radio"
                      name="metode-bayar"
                      checked={pakaiDompet}
                      disabled={!saldoCukup}
                      onChange={() => {
                        if (saldoCukup) handlePilihMetode('dompet');
                      }}
                      className="shrink-0 w-5 h-5 mt-0.5 accent-[#064e3b]"
                    />
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-8 h-8 rounded-xl grid place-items-center bg-[#ebf2eb] text-[#064e3b]"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                      </svg>
                    </span>
                    <span className="grow min-w-0 flex flex-col gap-0.5">
                      <span className="flex items-center justify-between gap-2 flex-wrap text-sm font-extrabold">
                        Dompet Pasok Tani
                        <span className="text-[13px] font-bold text-[#3f5247] whitespace-nowrap">
                          Saldo {formatRupiah(saldoUser)}
                        </span>
                      </span>
                      <span
                        className={`text-[13px] leading-snug ${
                          saldoCukup
                            ? 'text-[#157a4c] font-bold'
                            : 'text-[#8a1c12] font-semibold'
                        }`}
                      >
                        {saldoCukup
                          ? 'Saldo cukup. Pesanan langsung lunas tanpa menunggu transfer.'
                          : `Belum bisa dipakai: saldo kurang ${formatRupiah(
                              totalAkhir - saldoUser
                            )}. Dompet hanya untuk pesanan yang totalnya tertutup penuh oleh saldo.`}
                      </span>
                    </span>
                  </label>

                  {/* QRIS */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer ${
                      metodeEfektif === 'qris'
                        ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                        : 'border-[#dee3da] bg-white hover:bg-[#f6f8f4]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="metode-bayar"
                      checked={metodeEfektif === 'qris'}
                      onChange={() => handlePilihMetode('qris')}
                      className="shrink-0 w-5 h-5 mt-0.5 accent-[#064e3b]"
                    />
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-8 h-8 rounded-xl grid place-items-center bg-[#ebf2eb] text-[#064e3b]"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="5" height="5" x="3" y="3" rx="1" />
                        <rect width="5" height="5" x="16" y="3" rx="1" />
                        <rect width="5" height="5" x="3" y="16" rx="1" />
                        <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                        <path d="M21 21v.01" />
                        <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                        <path d="M3 12h.01" />
                        <path d="M12 3h.01" />
                        <path d="M12 16v.01" />
                        <path d="M16 12h1" />
                        <path d="M21 12v.01" />
                        <path d="M12 21v-1" />
                      </svg>
                    </span>
                    <span className="grow min-w-0 flex flex-col gap-0.5">
                      <span className="flex items-center gap-2 flex-wrap text-sm font-extrabold">
                        QRIS
                        <span className="px-2 rounded-full bg-[#ebf2eb] text-[#064e3b] text-xs font-bold">
                          Terakhir dipakai
                        </span>
                      </span>
                      <span className="text-[13px] text-[#3f5247]">
                        Bayar dari aplikasi e-wallet atau m-banking apa pun. Bisa dari HP yang sama:
                        simpan QR, lalu unggah di aplikasimu.
                      </span>
                    </span>
                  </label>

                  {/* Virtual Account */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer ${
                      metodeEfektif === 'va'
                        ? 'border-2 border-[#064e3b] bg-[#f3faf3]'
                        : 'border-[#dee3da] bg-white hover:bg-[#f6f8f4]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="metode-bayar"
                      checked={metodeEfektif === 'va'}
                      onChange={() => handlePilihMetode('va')}
                      className="shrink-0 w-5 h-5 mt-0.5 accent-[#064e3b]"
                    />
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-8 h-8 rounded-xl grid place-items-center bg-[#ebf2eb] text-[#064e3b]"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="3" x2="21" y1="22" y2="22" />
                        <line x1="6" x2="6" y1="18" y2="11" />
                        <line x1="10" x2="10" y1="18" y2="11" />
                        <line x1="14" x2="14" y1="18" y2="11" />
                        <line x1="18" x2="18" y1="18" y2="11" />
                        <polygon points="12 2 20 7 4 7" />
                      </svg>
                    </span>
                    <span className="grow min-w-0 flex flex-col gap-0.5">
                      <span className="text-sm font-extrabold">Transfer Virtual Account</span>
                      <span className="text-[13px] text-[#3f5247]">
                        Transfer lewat m-banking, internet banking, atau ATM ke nomor khusus
                        pesanan ini.
                      </span>
                    </span>
                  </label>

                  {/* 6-Bank VA Selector Grid */}
                  {metodeEfektif === 'va' && (
                    <fieldset className="mt-0.5 p-3 px-3.5 pb-3.5 border border-[#dee3da] rounded-xl bg-[#fcfbf6]">
                      <legend className="px-1 text-[13px] font-extrabold">Pilih bank</legend>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {bankVaList.map((b) => {
                          const isBankOn = bankVa === b.id;
                          return (
                            <label
                              key={b.id}
                              className={`flex items-start gap-2 min-h-13 p-2.5 box-border rounded-xl bg-white cursor-pointer border ${
                                isBankOn ? 'border-2 border-[#064e3b]' : 'border-[#dee3da]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="bank-va"
                                checked={isBankOn}
                                onChange={() => handlePilihBank(b.id)}
                                className="shrink-0 w-4.5 h-4.5 mt-0.5 accent-[#064e3b]"
                              />
                              <span className="flex flex-col gap-px min-w-0">
                                <span className="text-sm font-extrabold">{b.nama}</span>
                                <span
                                  className={`text-xs ${
                                    b.semua ? 'text-[#157a4c]' : 'text-[#92400e]'
                                  }`}
                                >
                                  {b.ket}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}
                </div>
              </fieldset>
            </section>
          </div>

          {/* Right Summary Aside */}
          <aside
            aria-label="Ringkasan pembayaran"
            className="w-full lg:w-[340px] shrink-0 sticky top-6 flex flex-col gap-4"
          >
            <div className="p-5 border border-[#dee3da] rounded-2xl bg-white flex flex-col gap-3.5">
              <h2 className="m-0 text-lg font-extrabold">Ringkasan pembayaran</h2>
              <dl className="m-0 flex flex-col gap-2.5 text-sm leading-snug">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#5a6b60]">Harga normal ({jumlahProduk} produk)</dt>
                  <dd className="m-0 font-semibold whitespace-nowrap">
                    {formatRupiah(normalTotal)}
                  </dd>
                </div>

                {grosirTotal > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#157a4c] font-semibold">Hemat harga grosir</dt>
                    <dd className="m-0 font-bold text-[#157a4c] whitespace-nowrap">
                      −{formatRupiah(grosirTotal)}
                    </dd>
                  </div>
                )}

                {surplusTotal > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#c2410c] font-semibold">Diskon Surplus</dt>
                    <dd className="m-0 font-bold text-[#c2410c] whitespace-nowrap">
                      −{formatRupiah(surplusTotal)}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <dt className="text-[#5a6b60]">Ongkos kirim ({processedGrup.length} pengiriman)</dt>
                  <dd className="m-0 font-semibold whitespace-nowrap">
                    {adaAlamat ? formatRupiah(ongkirTotal) : 'Isi alamat dulu'}
                  </dd>
                </div>

                <div className="flex justify-between gap-3">
                  <dt className="text-[#5a6b60]">Biaya layanan (1%)</dt>
                  <dd className="m-0 font-semibold whitespace-nowrap">
                    {formatRupiah(biayaLayanan)}
                  </dd>
                </div>
              </dl>

              <div className="flex items-baseline justify-between gap-3 pt-3.5 border-t border-dashed border-[#dee3da]">
                <span className="text-[15px] font-bold">Total bayar</span>
                <span
                  aria-live="polite"
                  className="text-[22px] font-extrabold text-[#064e3b] whitespace-nowrap"
                >
                  {formatRupiah(totalAkhir)}
                </span>
              </div>

              {/* Desktop CTA Button */}
              <div className="hidden lg:flex flex-col">
                <Link
                  href={hrefBayar}
                  onClick={handleCtaClick}
                  className="flex items-center justify-center min-h-13 rounded-xl bg-[#064e3b] text-white text-base font-extrabold no-underline hover:bg-[#053d2e] cursor-pointer"
                >
                  {ctaLabel}
                </Link>
              </div>

              <div className="flex flex-col gap-2 text-xs leading-relaxed text-[#5a6b60]">
                <p className="m-0 flex gap-2">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span>
                    {pakaiDompet
                      ? 'Dengan Dompet, saldo langsung dipotong dan pesanan langsung lunas. Tidak ada waktu tunggu.'
                      : 'Setelah kamu menekan Bayar, stok disisihkan untukmu selama 1 jam sambil menunggu pembayaran.'}
                  </span>
                </p>
                <p className="m-0 flex gap-2">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 mt-0.5"
                  >
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>
                    Dana ditahan Pasok Tani sampai pesanan kamu terima. Komplain bisa diajukan
                    sampai 3 hari setelah pesanan tiba.
                  </span>
                </p>
                <p className="m-0">
                  Dengan membayar, kamu menyetujui{' '}
                  <a href="#" className="text-[#157a4c] font-bold no-underline hover:underline">
                    Syarat & Ketentuan
                  </a>{' '}
                  dan{' '}
                  <a href="#" className="text-[#157a4c] font-bold no-underline hover:underline">
                    Kebijakan Pengembalian
                  </a>
                  .
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile Sticky Bottom CTA */}
        <div className="lg:hidden sticky bottom-0 z-10 -mx-4 mt-5 p-3 px-4 bg-white border-t border-[#dee3da] shadow-lg flex items-center gap-3">
          <div className="grow min-w-0 flex flex-col gap-px">
            <span className="text-xs text-[#5a6b60]">
              Total bayar · {processedGrup.length} pengiriman
            </span>
            <span
              aria-live="polite"
              className="text-lg font-extrabold text-[#064e3b] whitespace-nowrap"
            >
              {formatRupiah(totalAkhir)}
            </span>
          </div>
          <Link
            href={hrefBayar}
            onClick={handleCtaClick}
            className="shrink-0 inline-flex items-center justify-center min-h-12 px-5.5 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline cursor-pointer"
          >
            {ctaLabelPendek}
          </Link>
        </div>
      </main>

      <div className="mt-8 hidden lg:block">
        <SiteFooter />
      </div>

      {/* Shortage Dialog Modal */}
      {masalahTerbuka && (
        <div className="fixed inset-0 z-20 bg-[#173b2b]/50 flex justify-center items-start pt-24 md:pt-36 px-4 box-border">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-masalah"
            className="w-full max-w-[440px] p-5.5 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5 box-border"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="shrink-0 w-10 h-10 rounded-full grid place-items-center bg-[#fef3c7] text-[#92400e]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </span>
              <div className="grow min-w-0">
                <h2
                  id="judul-masalah"
                  className="mt-0 mb-1 text-lg font-extrabold leading-snug"
                >
                  Stok Jamur Tiram Putih berkurang
                </h2>
                <p className="m-0 text-sm leading-relaxed text-[#3f5247]">
                  Kamu memesan 3 kg, tapi stoknya sekarang tinggal 2 kg. Produk lain di pesanan ini
                  tidak berubah.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 px-3 border border-[#dee3da] rounded-xl">
              <span
                role="img"
                aria-label="Placeholder foto Jamur Tiram Putih"
                className="shrink-0 w-11 h-11 rounded-xl grid place-items-center bg-[#ece8e1] text-[#6b5e4f]"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3C7 3 3 6.5 3 10.5c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5C21 6.5 17 3 12 3Z" />
                  <path d="M9 12v6.5a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5V12" />
                </svg>
              </span>
              <span className="grow min-w-0 text-[13px] leading-snug">
                <strong className="block text-sm">Jamur Tiram Putih</strong>
                Kumbung Jamur Ciremai · Rp 15.400/kg
              </span>
            </div>

            {isResepMode && (
              <div className="p-3 border-1.5 border-[#a9cfae] rounded-xl bg-[#f3faf3] flex flex-col gap-1.5">
                <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold text-[#157a4c]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
                    <path d="M6 17h12" />
                  </svg>
                  Bahan resep Nasi Goreng Kampung · alternatif 1 dari 2
                </p>
                <p className="m-0 text-sm leading-snug">
                  <strong>Jamur Kancing Putih</strong>
                  <br />
                  Kumbung Jamur Ciremai · Rp 24.000/kg · stok 9 kg
                </p>
                <p className="m-0 text-[13px] leading-relaxed text-[#3f5247]">
                  3 kg = Rp 72.000. Petaninya sama, jadi pengiriman tidak berubah. Kalau ini juga
                  kurang, alternatif ke-2 adalah Jamur Merang.
                </p>
                <p
                  role="alert"
                  className="m-0 flex gap-2 p-2.5 px-3 rounded-xl bg-[#fef3c7] text-[#92400e] text-[13px] leading-relaxed font-bold"
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
                    className="shrink-0 mt-0.5"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                  <span>
                    Lebih mahal 56%: Rp 25.800 di atas pesananmu semula (Rp 46.200, harga Surplus).
                    Lanjutkan hanya kalau kamu setuju dengan harga ini.
                  </span>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {isResepMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setJamurGanti(true);
                      setMasalahTerbuka(false);
                    }}
                    className="min-h-12 border-0 rounded-xl bg-[#064e3b] text-white font-sans text-[15px] font-extrabold cursor-pointer hover:bg-[#053d2e]"
                  >
                    Lanjut, ganti dan bayar Rp 25.800 lebih
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setJamurQty(2);
                      setMasalahTerbuka(false);
                    }}
                    className="min-h-12 border-1.5 border-[#064e3b] rounded-xl bg-white text-[#064e3b] font-sans text-[15px] font-extrabold cursor-pointer hover:bg-[#ebf2eb]"
                  >
                    Ambil 2 kg yang tersisa
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setJamurQty(2);
                    setMasalahTerbuka(false);
                  }}
                  className="min-h-12 border-0 rounded-xl bg-[#064e3b] text-white font-sans text-[15px] font-extrabold cursor-pointer hover:bg-[#053d2e]"
                >
                  Ambil 2 kg yang tersisa
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setJamurLewati(true);
                  setMasalahTerbuka(false);
                }}
                className="min-h-12 border-1.5 border-[#064e3b] rounded-xl bg-white text-[#064e3b] font-sans text-[15px] font-extrabold cursor-pointer hover:bg-[#ebf2eb]"
              >
                Lewati produk ini
              </button>

              <Link
                href="/produk?cari=jamur"
                className="flex items-center justify-center min-h-11 text-[#157a4c] text-sm font-bold no-underline hover:underline"
              >
                Cari jamur tiram dari petani lain
              </Link>
            </div>

            <p className="m-0 text-xs text-[#5a6b60]">
              Total diperbarui sebelum kamu membayar. Satu pemberitahuan untuk tiap produk yang
              berubah.
            </p>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {dompetModal !== '' && (
        <div className="fixed inset-0 z-20 bg-[#173b2b]/50 flex justify-center items-start pt-24 md:pt-36 px-4 box-border">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-dompet"
            className="w-full max-w-[420px] p-5.5 rounded-2xl bg-white shadow-2xl flex flex-col gap-3.5 box-border"
          >
            {dompetModal === 'konfirmasi' ? (
              <>
                <h2
                  id="judul-dompet"
                  className="m-0 text-[19px] font-extrabold leading-snug"
                >
                  Bayar dari Dompet?
                </h2>
                <dl className="m-0 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#5a6b60]">Saldo sekarang</dt>
                    <dd className="m-0 font-bold whitespace-nowrap">
                      {formatRupiah(saldoUser)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#5a6b60]">Dipotong</dt>
                    <dd className="m-0 font-bold whitespace-nowrap">
                      −{formatRupiah(totalAkhir)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 pt-2 border-t border-dashed border-[#dee3da]">
                    <dt className="font-bold">Sisa saldo</dt>
                    <dd className="m-0 font-extrabold text-[#064e3b] whitespace-nowrap">
                      {formatRupiah(Math.max(0, saldoUser - totalAkhir))}
                    </dd>
                  </div>
                </dl>
                <p className="m-0 text-[13px] leading-relaxed text-[#3f5247]">
                  Pesanan langsung diteruskan ke petani. Dana tetap ditahan Pasok Tani sampai pesanan
                  kamu terima.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setDompetModal('lunas')}
                    className="min-h-12 border-0 rounded-xl bg-[#064e3b] text-white font-sans text-[15px] font-extrabold cursor-pointer hover:bg-[#053d2e]"
                  >
                    Bayar {formatRupiah(totalAkhir)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDompetModal('')}
                    className="min-h-12 border-1.5 border-[#dee3da] rounded-xl bg-white text-[#173b2b] font-sans text-[15px] font-bold cursor-pointer hover:bg-[#f6f8f4]"
                  >
                    Batal
                  </button>
                </div>
              </>
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className="self-center w-14 h-14 rounded-full grid place-items-center bg-[#064e3b] text-white"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <h2
                  id="judul-dompet"
                  className="m-0 text-[19px] font-extrabold text-center"
                >
                  Pembayaran berhasil
                </h2>
                <p className="m-0 text-sm leading-relaxed text-[#3f5247] text-center">
                  {formatRupiah(totalAkhir)} dibayar dari Dompet. {processedGrup.length} pesanan
                  diteruskan ke petani. Sisa saldo{' '}
                  {formatRupiah(Math.max(0, saldoUser - totalAkhir))}.
                </p>
                <Link
                  href="/pesanan"
                  className="flex items-center justify-center min-h-12 rounded-xl bg-[#064e3b] text-white text-[15px] font-extrabold no-underline hover:bg-[#053d2e]"
                >
                  Lihat pesanan
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
