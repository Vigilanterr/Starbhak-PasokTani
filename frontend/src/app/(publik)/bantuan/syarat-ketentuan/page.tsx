import type { Metadata } from "next";
import { HalamanLegal, type BagianLegal } from "../_komponen/halaman-legal";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Ketentuan penggunaan layanan Pasok Tani bagi petani dan pembeli.",
};

const BAGIAN: BagianLegal[] = [
  {
    id: "tentang-layanan",
    judul: "Tentang layanan",
    isi: "Pasok Tani adalah platform yang mempertemukan petani dan pelaku usaha untuk berkomunikasi dan menyepakati transaksi hasil panen. Kami tidak menjadi pihak dalam transaksi antara penjual dan pembeli.",
  },
  {
    id: "akun-pengguna",
    judul: "Akun pengguna",
    isi: "Kamu bertanggung jawab menjaga kerahasiaan kata sandi dan seluruh aktivitas pada akunmu. Data yang kamu daftarkan harus benar, lengkap, dan diperbarui bila ada perubahan.",
  },
  {
    id: "informasi-pasokan-harga",
    judul: "Informasi pasokan dan harga",
    isi: "Petani wajib menampilkan informasi komoditas, jumlah, kualitas, harga, dan waktu panen secara jujur. Harga dan ketersediaan dapat berubah sesuai kondisi di lapangan.",
  },
  {
    id: "transaksi-pengiriman",
    judul: "Transaksi dan pengiriman",
    isi: "Kesepakatan harga, jumlah, jadwal, dan cara pengiriman ditentukan bersama oleh kedua pihak. Pasok Tani menyediakan fitur pencatatan untuk membantu koordinasi.",
  },
  {
    id: "larangan",
    judul: "Larangan",
    isi: "Pengguna dilarang memalsukan data, menyalahgunakan platform untuk penipuan, atau mengganggu pengguna lain. Kami berhak menangguhkan akun yang melanggar ketentuan.",
  },
  {
    id: "perubahan-ketentuan",
    judul: "Perubahan ketentuan",
    isi: "Kami dapat memperbarui ketentuan ini sewaktu-waktu. Perubahan penting akan kami informasikan melalui email atau notifikasi di aplikasi.",
  },
];

export default function Page() {
  return (
    <HalamanLegal
      judul="Syarat & Ketentuan"
      diperbarui="3 November 2026"
      pengantar="Dengan membuat akun atau menggunakan Pasok Tani, kamu menyetujui ketentuan berikut. Mohon baca dengan saksama sebelum menggunakan layanan kami."
      bagian={BAGIAN}
    />
  );
}
