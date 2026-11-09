/**
 * Salinan statis isi beranda (fitur, cara kerja, testimoni contoh, resep). Dulu dibaca dari
 * `src/data/beranda.json`; dipindah ke kode agar halaman tidak mengimpor JSON data.
 */

export const KONTEN_BERANDA = {
  "_catatan": "Salinan statis halaman beranda (/). Seluruh isi `testimoni` adalah CONTOH (placeholder) sampai ada ulasan asli dari pengguna; ganti atau hapus sebelum peluncuran.",
  "pencarianPopuler": [
    { "label": "Cabai", "q": "cabai" },
    { "label": "Tomat", "q": "tomat" },
    { "label": "Beras", "q": "beras" },
    { "label": "Bawang merah", "q": "bawang merah" }
  ],
  "keranjangResep": {
    "langkah": [
      "Buat satu keranjang untuk setiap menu, misalnya Nasi Goreng.",
      "Isi bahan dan jumlahnya dari petani pilihanmu, lengkap dengan produk alternatif bila stok habis.",
      "Tiap minggu, pesan ulang semua bahan dalam satu checkout."
    ],
    "contoh": {
      "nama": "Nasi Goreng",
      "keterangan": "dipesan ulang tiap Senin",
      "bahan": [
        { "nama": "Beras", "jumlah": 40, "satuan": "kg", "ikon": "padi" },
        { "nama": "Bawang merah", "jumlah": 10, "satuan": "kg", "ikon": "rempah" },
        { "nama": "Cabai merah", "jumlah": 5, "satuan": "kg", "ikon": "rempah" }
      ]
    }
  },
  "contohSurplus": [
    { "sisaHari": 3, "diskonPersen": 10 },
    { "sisaHari": 2, "diskonPersen": 25 },
    { "sisaHari": 1, "diskonPersen": 40 }
  ],
  "fitur": [
    {
      "ikon": "kamera",
      "judul": "Foto stok asli",
      "deskripsi": "Lihat foto stok yang benar-benar dijual, lengkap dengan tanggal panen dan tanggal unggahnya."
    },
    {
      "ikon": "lonceng",
      "judul": "Langganan per produk",
      "deskripsi": "Dapat notifikasi saat ada stok baru, harga turun atau masuk Surplus, dan saat stok kembali tersedia."
    },
    {
      "ikon": "tunas",
      "judul": "Daftar Tunggu & Komitmen",
      "deskripsi": "Ikuti panen yang belum siap, atau Komitmen dengan dana minimum agar dapat prioritas stok saat panen."
    },
    {
      "ikon": "keranjang",
      "judul": "Keranjang Resep",
      "deskripsi": "Simpan satu keranjang per menu, lalu pesan ulang semua bahannya dalam satu checkout."
    },
    {
      "ikon": "lencana",
      "judul": "Lencana Petani",
      "deskripsi": "Kenali Petani Terverifikasi, Petani Andalan, Respons Cepat, dan Panen Tepat Waktu sebelum membeli."
    },
    {
      "ikon": "api",
      "judul": "Surplus",
      "deskripsi": "Diskon bertingkat untuk stok yang mendekati kedaluwarsa, supaya hasil panen tidak terbuang."
    },
    {
      "ikon": "label",
      "judul": "Harga grosir bertingkat",
      "deskripsi": "Makin banyak yang kamu beli, makin murah harga per satuannya. Dihitung otomatis di keranjang."
    },
    {
      "ikon": "perisai",
      "judul": "Pembayaran aman",
      "deskripsi": "Bayar lewat QRIS atau Virtual Account. Dana ditahan sampai pesanan kamu terima."
    }
  ],
  "caraKerja": {
    "pembeli": [
      {
        "judul": "Cari hasil panen",
        "deskripsi": "Telusuri produk, cek foto stok asli, tanggal panen, harga grosir, dan lokasi kebunnya."
      },
      {
        "judul": "Pesan atau Komitmen",
        "deskripsi": "Beli stok yang tersedia, atau Komitmen di daftar tunggu untuk panen yang belum siap."
      },
      {
        "judul": "Dana aman",
        "deskripsi": "Bayar lewat QRIS atau Virtual Account. Dana ditahan dan baru diteruskan ke petani setelah pesanan diterima."
      },
      {
        "judul": "Terima dan ulas",
        "deskripsi": "Cek pesanan saat tiba, lalu beri ulasan. Ada masalah? Ajukan komplain dalam 3 hari."
      }
    ],
    "petani": [
      {
        "judul": "Daftar gratis",
        "deskripsi": "Cukup nama, email, nama toko, dan lokasi kebun di Jawa Barat."
      },
      {
        "judul": "Unggah stok atau buka daftar tunggu",
        "deskripsi": "Tambahkan produk dengan foto, harga, dan tanggal panen. Panen belum siap? Buka daftar tunggu."
      },
      {
        "judul": "Terima pesanan",
        "deskripsi": "Pesanan masuk otomatis. Proses, kirim, dan balas obrolan pembeli dari satu tempat."
      },
      {
        "judul": "Tarik dana",
        "deskripsi": "Dana diteruskan setelah pesanan diterima pembeli. Lengkapi KTP dan rekening sebelum penarikan pertama."
      }
    ]
  },
  "testimoni": [
    {
      "id": "contoh-konsumen",
      "contoh": true,
      "jenis": "konsumen",
      "nama": "Rina S.",
      "peran": "Pembeli rumah tangga",
      "wilayah": "Kota Bandung",
      "kutipan": "Tanggal panennya tertulis jelas, jadi aku bisa memilih sayur yang paling baru. Barang yang datang juga sesuai dengan fotonya."
    },
    {
      "id": "contoh-umkm",
      "contoh": true,
      "jenis": "umkm",
      "nama": "Dedi H.",
      "peran": "Pemilik warung nasi goreng",
      "wilayah": "Kota Cimahi",
      "kutipan": "Bahan warung sekarang cukup dipesan ulang dari Keranjang Resep tiap minggu. Tidak perlu menyusun daftar belanja dari awal lagi."
    },
    {
      "id": "contoh-petani",
      "contoh": true,
      "jenis": "petani",
      "nama": "Asep R.",
      "peran": "Petani cabai",
      "wilayah": "Kabupaten Garut",
      "kutipan": "Lewat daftar tunggu, saya sudah tahu ada pembeli sebelum panen. Dananya diteruskan setelah pesanan diterima, jadi sama-sama tenang."
    }
  ]
} as const;
