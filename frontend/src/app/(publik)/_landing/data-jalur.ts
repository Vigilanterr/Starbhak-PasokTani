export type Lencana = { label: string; latar: string; warna: string };

export const KATEGORI_JALUR = [
  { nama: "Sayuran", foto: "/images/landingpage/komoditas/cabai-rawit.png" },
  { nama: "Buah", foto: "/images/landingpage/komoditas/durian.png" },
  { nama: "Bumbu & Rempah", foto: "/images/landingpage/komoditas/rimpang.png" },
  { nama: "Beras & Biji-bijian", foto: "/images/landingpage/komoditas/beras.png" },
  { nama: "Umbi-umbian", foto: "/images/landingpage/komoditas/singkong.png" },
  { nama: "Jamur", foto: "/images/landingpage/komoditas/jamur-tiram.png" },
];

export type ProdukBaru = {
  nama: string;
  foto: string;
  lokasi: string;
  harga: number;
  hargaAsli?: number;
  diskon?: string;
  satuan: string;
  panen: string;
};

export const PRODUK_BARU: ProdukBaru[] = [
  { nama: "Tomat Merah Lembang", foto: "/images/landingpage/petani/petani-petik-cabai.png", lokasi: "Lembang, Kab. Bandung Barat", harga: 14000, satuan: "kg", panen: "Dipanen kemarin" },
  { nama: "Pakcoy Hidroponik", foto: "/images/landingpage/lahan/padi-tumbuh.png", lokasi: "Arcamanik, Kota Bandung", harga: 22000, satuan: "kg", panen: "Dipanen kemarin" },
  { nama: "Jamur Tiram Putih", foto: "/images/landingpage/komoditas/jamur-tiram.png", lokasi: "Cigugur, Kab. Kuningan", harga: 15400, hargaAsli: 22000, diskon: "−30%", satuan: "kg", panen: "Dipanen kemarin" },
  { nama: "Singkong Mentega", foto: "/images/landingpage/komoditas/singkong.png", lokasi: "Pamulihan, Kab. Sumedang", harga: 4000, hargaAsli: 5000, diskon: "−20%", satuan: "kg", panen: "Dipanen kemarin" },
  { nama: "Cabai Merah Keriting", foto: "/images/landingpage/komoditas/cabai-rawit.png", lokasi: "Cikajang, Kab. Garut", harga: 37800, hargaAsli: 42000, diskon: "−10%", satuan: "kg", panen: "Dipanen 3 hari lalu" },
];

export type PetaniJalur = {
  nama: string;
  toko: string;
  lokasi: string;
  foto: string;
  alt: string;
  posisi: string;
  lencana: string[];
  komoditas: string;
  rating: string;
  ulasan: number;
  transaksi: string;
};

export const PETANI_JALUR: PetaniJalur[] = [
  { nama: "Ujang Suherman", toko: "Kebun Mang Ujang", lokasi: "Lembang, Kab. Bandung Barat", foto: "/images/landingpage/petani/petani-caping-sawah.png", alt: "Petani tersenyum di tengah sawah", posisi: "50% 22%", lencana: ["Petani Terverifikasi", "Petani Andalan", "+3 lencana"], komoditas: "Tomat, brokoli, sawi putih, stroberi", rating: "4,8", ulasan: 214, transaksi: "1.320" },
  { nama: "Enjang Supriatna", toko: "Tani Cilembu Asli", lokasi: "Pamulihan, Kab. Sumedang", foto: "/images/landingpage/petani/petani-pikul-keranjang.png", alt: "Petani memanggul keranjang di pematang sawah", posisi: "50% 30%", lencana: ["Petani Terverifikasi", "Petani Andalan", "+1 lencana"], komoditas: "Ubi cilembu, singkong, jahe", rating: "4,8", ulasan: 188, transaksi: "1.610" },
  { nama: "Tati Hartati", toko: "Kumbung Jamur Ciremai", lokasi: "Cigugur, Kab. Kuningan", foto: "/images/landingpage/petani/petani-perempuan-panen-padi.png", alt: "Petani perempuan bercaping di sawah saat panen", posisi: "86% 30%", lencana: ["Petani Terverifikasi", "Petani Andalan", "+2 lencana"], komoditas: "Jamur tiram, jamur kuping, kacang tanah", rating: "4,8", ulasan: 163, transaksi: "1.880" },
];

export function lencanaGaya(label: string): Lencana {
  if (label === "Petani Andalan") return { label, latar: "#fef3c7", warna: "#92400e" };
  if (label === "Petani Terverifikasi") return { label, latar: "#e0f2fe", warna: "#075985" };
  return { label, latar: "#ebf2eb", warna: "#064e3b" };
}

export const LANGKAH_TUNGGU = ["Jadwal tanam", "Ditanam", "Siap panen"];

export type DaftarTunggu = {
  komoditas: string;
  toko: string;
  kab: string;
  foto: string;
  alt: string;
  kabarTanggal: string;
  kabar: string;
  aktif: number;
  status: string;
  jadwal: string;
  kuota: number;
  terkomit: number;
  pengikut: number;
  aksi: string;
};

export const DAFTAR_TUNGGU: DaftarTunggu[] = [
  { komoditas: "Beras Ketan Putih", toko: "Tani Sauyunan Rengasdengklok", kab: "Kab. Karawang", foto: "/images/landingpage/lahan/bibit-padi.png", alt: "Bibit padi di petak sawah berair", kabarTanggal: "2 Nov", kabar: "Sawah dibajak, menunggu air irigasi", aktif: 0, status: "Jadwal tanam", jadwal: "Belum ada estimasi panen", kuota: 0, terkomit: 150, pengikut: 84, aksi: "Komit" },
  { komoditas: "Cabai Rawit Merah", toko: "Tani Cikajang", kab: "Kab. Garut", foto: "/images/landingpage/petani/petani-petik-cabai.png", alt: "Petani memetik cabai di kebun", kabarTanggal: "2 Nov", kabar: "Buah pertama mulai terbentuk", aktif: 1, status: "Ditanam", jadwal: "Perkiraan panen 10–15 Des 2026", kuota: 500, terkomit: 320, pengikut: 126, aksi: "Komit" },
  { komoditas: "Kacang Tanah", toko: "Kumbung Jamur Ciremai", kab: "Kab. Kuningan", foto: "/images/landingpage/komoditas/kacang-tanah.png", alt: "Kacang tanah yang baru dicabut beserta akarnya", kabarTanggal: "1 Nov", kabar: "Penjemuran kacang tanah", aktif: 2, status: "Siap panen", jadwal: "Dipanen sejak 28 Okt 2026", kuota: 0, terkomit: 180, pengikut: 58, aksi: "Lihat produk" },
];

export const ESCROW_JALUR = [
  { judul: "Bayar lewat QRIS atau Virtual Account", isi: "Batas bayar 1 jam. Stok ditahan untuk Anda selama itu." },
  { judul: "Dana ditahan Pasok Tani", isi: "Petani melihat pesanan sudah dibayar, tetapi dana belum cair." },
  { judul: "Petani mengirim, Anda konfirmasi", isi: "Lacak resi, lalu tekan Pesanan diterima saat barang tiba." },
  { judul: "Dana diteruskan ke petani", isi: "Tanpa konfirmasi, dana cair otomatis 3 hari setelah barang tiba." },
];

export const PENGIRIMAN_JALUR = [
  { ikon: "kurir" as const, judul: "Kurir reguler atau instan", isi: "Dipesan lewat Pasok Tani, nomor resi bisa dilacak." },
  { ikon: "rumah" as const, judul: "Diantar sendiri oleh petani", isi: "Ongkir ditentukan petani untuk area sekitarnya." },
  { ikon: "lokasi" as const, judul: "Ambil di lahan", isi: "Tanpa ongkir, sesuai jam operasional petani." },
];

export const CABANG_JALUR = [
  { judul: "Belanja untuk usaha?", isi: "Simpan bahan per menu di Keranjang Resep dan pesan ulang tiap minggu. Harga grosir terpasang otomatis sesuai jumlah.", aksi: "Untuk UMKM", href: "/daftar/pembeli", foto: "/images/landingpage/umkm/warung-makan.png" },
  { judul: "Mau jual hasil panen?", isi: "Daftar gratis, buka Daftar Tunggu, dan terima Komitmen pembeli sebelum panen.", aksi: "Untuk petani", href: "/daftar/petani", foto: "/images/landingpage/petani/petani-genggam-padi.png" },
];

export function rupiah(n: number): string {
  return "Rp" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
