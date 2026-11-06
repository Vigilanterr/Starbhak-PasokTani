export type IdTopik = "akun" | "pasokan" | "transaksi" | "keamanan";

export type Topik = { id: IdTopik; judul: string; deskripsi: string };
export type Faq = { id: string; topik: IdTopik; tanya: string; jawab: string };

export const TOPIK: Topik[] = [
  { id: "akun", judul: "Akun & Pendaftaran", deskripsi: "Daftar, masuk, dan kelola profil." },
  { id: "pasokan", judul: "Pasokan & Harga", deskripsi: "Menampilkan hasil panen dan mengatur harga." },
  { id: "transaksi", judul: "Transaksi & Pengiriman", deskripsi: "Kesepakatan, jadwal, dan pengiriman." },
  { id: "keamanan", judul: "Keamanan", deskripsi: "Kata sandi, privasi, dan laporan." },
];

export const FAQ: Faq[] = [
  {
    id: "berbayar",
    topik: "akun",
    tanya: "Apakah mendaftar di Pasok Tani berbayar?",
    jawab: "Tidak. Pendaftaran dan penggunaan fitur dasar gratis untuk petani maupun UMKM.",
  },
  {
    id: "tampilkan-panen",
    topik: "pasokan",
    tanya: "Bagaimana cara menampilkan hasil panen?",
    jawab:
      "Masuk sebagai petani, lalu tambahkan produk lengkap dengan foto, harga, stok, dan tanggal panen. Untuk panen yang belum siap, buat daftar tunggu agar pembeli bisa mengikuti dan berkomitmen lebih dulu.",
  },
  {
    id: "penentu-harga",
    topik: "pasokan",
    tanya: "Siapa yang menentukan harga?",
    jawab:
      "Petani menetapkan harga pada setiap produknya. Kesepakatan jumlah, jadwal, dan pengiriman ditentukan bersama oleh petani dan pembeli.",
  },
  {
    id: "pengiriman-terlambat",
    topik: "transaksi",
    tanya: "Bagaimana jika pengiriman terlambat?",
    jawab:
      "Tanyakan kabar pesanan langsung ke petani lewat obrolan. Dana tetap aman dan baru diteruskan ke petani setelah pesanan diterima. Jika ada masalah, ajukan komplain dalam 3 hari sejak pesanan tiba.",
  },
  {
    id: "hapus-akun",
    topik: "keamanan",
    tanya: "Bagaimana cara menghapus akun?",
    jawab:
      "Ajukan penghapusan melalui pengaturan akun atau hubungi tim kami. Datamu dihapus secara aman, kecuali yang wajib disimpan untuk kewajiban hukum.",
  },
];
