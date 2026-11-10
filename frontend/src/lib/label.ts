import type { Lencana, StatusDaftarTunggu, TagProduk, UrutanProduk } from "./api/tipe";

export const LABEL_LENCANA: Record<Lencana, { label: string; deskripsi: string }> = {
  "petani-baru": { label: "Petani Baru", deskripsi: "Baru bergabung di Pasok Tani." },
  terverifikasi: { label: "Petani Terverifikasi", deskripsi: "Identitas dan lahan sudah diverifikasi admin." },
  "petani-andalan": {
    label: "Petani Andalan",
    deskripsi: "Transaksi rutin tiap bulan, rating minimal 4,7, dan 95% pesanan selesai.",
  },
  "respons-cepat": { label: "Respons Cepat", deskripsi: "Rata-rata membalas obrolan kurang dari 1 jam." },
  "stok-selalu-baru": { label: "Stok Selalu Baru", deskripsi: "Rutin memperbarui foto stok di setiap batch baru." },
  "panen-tepat-waktu": { label: "Panen Tepat Waktu", deskripsi: "Sebagian besar daftar tunggu dipanen sesuai jadwal." },
  "pahlawan-surplus": { label: "Pahlawan Surplus", deskripsi: "Aktif menjalankan program Surplus untuk mengurangi sisa pangan." },
};

/** Urutan tampil lencana (yang paling meyakinkan pembeli lebih dulu). */
export const URUTAN_LENCANA: Lencana[] = [
  "terverifikasi",
  "petani-andalan",
  "respons-cepat",
  "panen-tepat-waktu",
  "stok-selalu-baru",
  "pahlawan-surplus",
  "petani-baru",
];

export const LABEL_STATUS_DAFTAR_TUNGGU: Record<
  StatusDaftarTunggu,
  { label: string; nada: "netral" | "hijau" | "kuning" | "merah" | "biru" }
> = {
  "jadwal-tanam": { label: "Jadwal Tanam", nada: "netral" },
  "sudah-tanam": { label: "Sudah Ditanam", nada: "hijau" },
  "panen-tertunda": { label: "Panen Tertunda", nada: "kuning" },
  "panen-lebih-awal": { label: "Panen Lebih Awal", nada: "biru" },
  "gagal-panen": { label: "Gagal Panen", nada: "merah" },
  "siap-panen": { label: "Siap Panen", nada: "hijau" },
};

/** Urutan alur status untuk stepper (S4). Cabang tertunda/lebih awal/gagal ditampilkan sebagai catatan. */
export const ALUR_STATUS: StatusDaftarTunggu[] = ["jadwal-tanam", "sudah-tanam", "siap-panen"];

export const LABEL_TAG: Record<TagProduk, string> = {
  organik: "Organik",
  hidroponik: "Hidroponik",
  "bebas-pestisida": "Bebas Pestisida",
};

export const LABEL_URUTAN: Record<UrutanProduk, string> = {
  relevan: "Paling relevan",
  terlaris: "Terlaris",
  terbaru: "Panen terbaru",
  "harga-asc": "Harga terendah",
  "harga-desc": "Harga tertinggi",
  rating: "Rating tertinggi",
  terdekat: "Terdekat",
};
