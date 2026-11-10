'use client';

import React from 'react';
import { KomitmenDetail, DetailKomitmen } from './KomitmenDetail';

export interface KomitmenDetailTertundaProps {
  komitmen?: DetailKomitmen;
  onBatalkanGratis?: (komitmenId: string) => void;
  onLanjutMenunggu?: (komitmenId: string) => void;
  onTetapIkutTunda?: () => void;
  className?: string;
}

const DEFAULT_KOMITMEN_TERTUNDA: DetailKomitmen = {
  id: 'KM-26101908',
  nomor: 'KM-26101908',
  nama: 'Bawang Merah Bima',
  namaProduk: 'Bawang Merah Bima Cirebon',
  petani: 'Kebun Pak Darsono, Cirebon',
  lokasi: 'Cirebon',
  dibuat: '19 Okt 2026',
  status: 'tertunda',
  tahap: 'tertunda',
  jumlah: '10 sampai 15 kg',
  jumlahRentang: '10 sampai 15 kg',
  minKg: 10,
  maksKg: 15,
  harga: 'Rp 30.000/kg',
  hargaSatuan: 30000,
  hargaPerKg: 30000,
  uangMuka: 'Rp 135.000',
  uangMukaDitahan: true,
  uangMukaNominal: 135000,
  urut: 'ke-5 dari 9 pembeli',
  urutanAntrean: 'ke-5 dari 9',
  perkiraanPanen: '25 Nov 2026',
  penundaan: {
    tglBaru: 'Rab, 25 Nov 2026',
    panenBaru: 'Rab, 25 Nov 2026',
    tglSemula: 'Sen, 16 Nov 2026',
    panenSemula: 'Sen, 16 Nov 2026',
    selisihHari: 9,
    alasan: 'Hujan deras seminggu berturut-turut membuat pengeringan tanah lebih lambat.',
    catatanPetani:
      'Tanah becek bikin umbi rentan busuk kalau dipanen basah. Kami jemur dan angin-anginkan dulu di lahan supaya umbi padat dan tahan simpan.',
    batalGratis: true,
  },
  pembayaran: {
    bobotDapatKg: 15,
    dapatKg: 15,
    batasWaktu: 'Jum, 27 Nov, 16.00',
    sisaJam: 48,
    ongkirRp: 18000,
    namaOngkir: 'JNE Reguler',
    kurir: 'JNE Reguler',
    biayaLayananRp: 4500,
    opsiTanggal: [
      { id: 'tgl-1', label: 'Kam, 26 Nov', tiba: 'Perkiraan tiba Jum, 27 Nov' },
      { id: 'tgl-2', label: 'Jum, 27 Nov', tiba: 'Perkiraan tiba Sab, 28 Nov' },
      { id: 'tgl-3', label: 'Sab, 28 Nov', tiba: 'Perkiraan tiba Min, 29 Nov' },
    ],
  },
  jadwalKirim: {
    tanggalKirim: 'Jum, 27 Nov 2026',
    tibaPerkiraan: 'Sab, 28 Nov 2026',
    kurir: 'JNE Reguler',
    alamatTujuan: 'Jl. Margonda Raya No. 45, Beji, Depok',
    totalLunas: 337500,
    kuotaUbahJadwal: 1,
    ubahJadwalTerpakai: 0,
  },
  linimasa: [
    {
      judul: 'Uang muka diterima Pasok Tani',
      waktu: '19 Okt 2026',
      ket: 'Rp 135.000 ditahan di rekening bersama. Harga dikunci Rp 30.000/kg.',
      status: 'selesai',
    },
    {
      judul: 'Penanaman bibit',
      waktu: '22 Okt 2026',
      ket: 'Kebun Pak Darsono selesai tanam bibit unggul varietas Bima.',
      status: 'selesai',
    },
    {
      judul: 'Panen tertunda 9 hari',
      waktu: 'Semula 16 Nov -> Diubah 25 Nov 2026',
      ket: 'Petani memberikan kabar penundaan panen akibat cuaca basah.',
      status: 'peringatan',
    },
    {
      judul: 'Pengiriman ke alamatmu',
      waktu: 'Setelah panen dan pelunasan',
      ket: 'Jadwal kirim bisa diubah 1 kali gratis.',
      status: 'nanti',
    },
  ],
};

export function KomitmenDetailTertunda({
  komitmen = DEFAULT_KOMITMEN_TERTUNDA,
  onBatalkanGratis,
  onLanjutMenunggu,
  onTetapIkutTunda,
  className = '',
}: KomitmenDetailTertundaProps) {
  const mergedKomitmen: DetailKomitmen = {
    ...komitmen,
    tahap: 'tertunda',
  };

  const handleTetapIkut = () => {
    onLanjutMenunggu?.(mergedKomitmen.id);
    onTetapIkutTunda?.();
  };

  return (
    <KomitmenDetail
      komitmen={mergedKomitmen}
      tahap="tertunda"
      onBatalkanGratis={onBatalkanGratis}
      onTetapIkutTunda={handleTetapIkut}
      className={className}
    />
  );
}

export default KomitmenDetailTertunda;
