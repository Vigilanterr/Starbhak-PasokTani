import type { Metadata } from "next";
import { HalamanLegal, type BagianLegal } from "../_komponen/halaman-legal";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Data apa yang dikumpulkan Pasok Tani, cara penggunaannya, dan hak kamu atas data tersebut.",
};

const BAGIAN: BagianLegal[] = [
  {
    id: "data-yang-dikumpulkan",
    judul: "Data yang kami kumpulkan",
    isi: "Nama, email, nomor telepon, lokasi usaha atau lahan, serta informasi pasokan dan transaksi yang kamu masukkan ke platform.",
  },
  {
    id: "penggunaan-data",
    judul: "Cara kami menggunakan data",
    isi: "Data digunakan untuk menjalankan layanan, mencocokkan kebutuhan pembeli dengan pasokan petani, mengirim notifikasi penting, dan meningkatkan kualitas platform.",
  },
  {
    id: "berbagi-data",
    judul: "Berbagi data",
    isi: "Informasi profil dan pasokan dapat dilihat oleh pengguna lain sesuai pengaturanmu. Kami tidak menjual data pribadimu kepada pihak mana pun.",
  },
  {
    id: "keamanan-data",
    judul: "Keamanan data",
    isi: "Kami menggunakan enkripsi dan pembatasan akses untuk melindungi datamu. Meski begitu, tidak ada sistem yang sepenuhnya bebas risiko.",
  },
  {
    id: "hak-kamu",
    judul: "Hak kamu",
    isi: "Kamu dapat melihat, memperbarui, atau meminta penghapusan data pribadi melalui pengaturan akun atau dengan menghubungi tim kami.",
  },
  {
    id: "penyimpanan-data",
    judul: "Penyimpanan data",
    isi: "Data disimpan selama akunmu aktif atau selama diperlukan untuk kewajiban hukum, lalu dihapus secara aman.",
  },
];

export default function Page() {
  return (
    <HalamanLegal
      judul="Kebijakan Privasi"
      diperbarui="3 November 2026"
      pengantar="Kami menghargai kepercayaanmu. Kebijakan ini menjelaskan data apa yang kami kumpulkan, bagaimana kami menggunakannya, dan pilihan yang kamu miliki."
      bagian={BAGIAN}
    />
  );
}
