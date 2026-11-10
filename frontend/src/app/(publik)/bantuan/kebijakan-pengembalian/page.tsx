import type { Metadata } from "next";
import { HalamanLegal, type BagianLegal } from "../_komponen/halaman-legal";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian",
  description:
    "Kapan kamu bisa mengajukan komplain, bagaimana dana dijaga selama prosesnya, dan aturan pengembalian dana untuk pesanan dan Komitmen di Pasok Tani.",
};

// Sumber: Features Context S4 (Komitmen), S9 (escrow, Dompet), S10 (komplain, mediasi), S11 (stok).
// Asumsi yang belum tertulis di spesifikasi: anjuran menyimpan produk selama komplain (bagian 2) dan
// pengecualian kerusakan akibat keterlambatan pembeli mengambil/menerima pesanan (bagian 10).
const BAGIAN: BagianLegal[] = [
  {
    id: "kapan-mengajukan",
    judul: "Kapan kamu bisa mengajukan komplain",
    isi: "Kamu bisa mengajukan komplain bila produk yang diterima rusak, busuk, atau tidak sesuai deskripsi, misalnya jenis, jumlah, atau kualitasnya berbeda. Komplain hanya berlaku untuk pesanan yang sudah tercatat tiba, diajukan paling lambat 3 hari sejak waktu tiba tersebut, dan wajib disertai foto bukti kondisi produk.",
  },
  {
    id: "cara-mengajukan",
    judul: "Cara mengajukan komplain",
    isi: "Buka menu Pesanan, pilih pesanan yang bermasalah, lalu tekan Komplain. Unggah foto produk dan kemasan yang menunjukkan masalahnya, lalu jelaskan apa yang terjadi. Petani akan menerima notifikasi dan bisa menanggapi langsung. Simpan produk sampai komplain selesai karena bukti tambahan mungkin diperlukan.",
  },
  {
    id: "dana-selama-komplain",
    judul: "Dana selama komplain",
    isi: "Pembayaranmu ditahan oleh Pasok Tani dan belum diteruskan ke petani sampai pesanan diterima. Selama komplain berjalan, dana tetap ditahan hingga sengketa selesai. Bila kamu tidak mengonfirmasi penerimaan dan tidak mengajukan komplain, dana diteruskan ke petani secara otomatis 3 hari setelah pesanan tercatat tiba.",
  },
  {
    id: "mediasi-admin",
    judul: "Mediasi oleh admin",
    isi: "Bila kamu dan petani belum menemukan kesepakatan, admin Pasok Tani menengahi secara netral. Kedua pihak dapat menyampaikan bukti, seperti foto, riwayat obrolan, dan nomor resi pengiriman. Keputusan diambil berdasarkan bukti tersebut dan diberitahukan kepada kedua pihak.",
  },
  {
    id: "bentuk-pengembalian",
    judul: "Bentuk pengembalian dana",
    isi: "Bila komplain disetujui, dana dikembalikan ke Dompet Pasok Tani milikmu. Saldo Dompet bisa langsung dipakai untuk belanja maupun Komitmen di daftar tunggu. Bila produk rusak atau tidak sesuai deskripsi, biaya pengembalian barang dan dana ditanggung oleh petani.",
  },
  {
    id: "pembatalan-sebelum-pengiriman",
    judul: "Pembatalan sebelum pengiriman",
    isi: "Pesanan yang dibatalkan sebelum dikirim, baik olehmu sesuai ketentuan maupun oleh petani, termasuk yang batal otomatis karena petani tidak merespons dalam batas waktu, dikembalikan penuh ke Dompet. Stok produk dipulihkan sehingga bisa dibeli pembeli lain.",
  },
  {
    id: "komitmen-gagal-panen",
    judul: "Komitmen dan Gagal Panen",
    isi: "Saat kamu berkomitmen pada daftar tunggu, dana minimum ditahan sampai panen tersedia. Bila status daftar tunggu berubah menjadi Gagal Panen, dana dikembalikan penuh ke Dompet secara otomatis tanpa perlu mengajukan apa pun. Bila panen tidak mencukupi dan kamu tidak kebagian stok saat alokasi, dana minimum juga dikembalikan penuh.",
  },
  {
    id: "pembatalan-komitmen",
    judul: "Pembatalan Komitmen",
    isi: "Kamu bisa membatalkan Komitmen sendiri dengan ketentuan berikut: tanpa potongan selama daftar tunggu belum memiliki perkiraan panen; potongan 20% dari dana minimum setelah perkiraan panen ada atau setelah panen tersedia; dan tanpa potongan bila dibatalkan dalam 48 jam setelah pemberitahuan Panen Tertunda, berapa kali pun jadwalnya mundur. Sisa dana setelah potongan dikembalikan ke Dompet.",
  },
  {
    id: "sisa-pembayaran-komitmen",
    judul: "Sisa pembayaran Komitmen",
    isi: "Setelah panen tersedia, kamu punya waktu 48 jam untuk melunasi sisa pembayaran di atas jumlah minimum. Bila tidak dilunasi, dana minimum diteruskan ke petani, pesanan sejumlah minimum tetap diproses seperti biasa, dan kamu akan menerima notifikasi. Dana minimum ini tidak dikembalikan karena pesanan sejumlah minimum tetap kamu terima.",
  },
  {
    id: "produk-segar",
    judul: "Produk segar",
    isi: "Produk segar dikirim dengan batas waktu pengiriman khusus agar tetap layak saat tiba. Bila produk rusak karena pengiriman melewati batas waktu tersebut, kamu bisa mengajukan komplain seperti biasa. Kerusakan akibat pesanan terlambat diambil atau diterima oleh pembeli, misalnya pada opsi ambil sendiri, tidak termasuk dalam cakupan pengembalian dana.",
  },
];

export default function Page() {
  return (
    <HalamanLegal
      judul="Kebijakan Pengembalian"
      diperbarui="4 November 2026"
      pengantar="Kami ingin setiap transaksi adil bagi pembeli dan petani. Kebijakan ini menjelaskan kapan kamu bisa mengajukan komplain, bagaimana dana dijaga selama prosesnya, dan bagaimana pengembalian dana dilakukan, termasuk untuk Komitmen di daftar tunggu."
      bagian={BAGIAN}
    />
  );
}
