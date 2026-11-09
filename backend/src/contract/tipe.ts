/**
 * Copy of frontend/src/lib/api/tipe.ts, the JSON contract for the public catalog.
 * The backend deploys from its own root, so it cannot import the frontend. Change both files together.
 */

export type Satuan = "kg" | "ikat" | "buah" | "pak" | "liter";

export type TagProduk = "organik" | "hidroponik" | "bebas-pestisida";

export type IkonKategori = "sayuran" | "buah" | "rempah" | "padi" | "umbi" | "jamur";

export type Kategori = {
  slug: string;
  nama: string;
  deskripsi: string;
  ikon: IkonKategori;
};

/** Lencana petani (S6). */
export type Lencana =
  | "petani-baru"
  | "terverifikasi"
  | "petani-andalan"
  | "respons-cepat"
  | "stok-selalu-baru"
  | "panen-tepat-waktu"
  | "pahlawan-surplus";

export type Koordinat = { lat: number; lng: number };

export type Petani = {
  id: string;
  /** Nama pemilik. */
  nama: string;
  namaToko: string;
  /** Nilai dari `WILAYAH_JAWA_BARAT` (mis. `kabupaten-bandung`). */
  kabupaten: string;
  kecamatan: string;
  deskripsi: string;
  /** Tanggal bergabung. */
  bergabung: string;
  lencana: Lencana[];
  rating: number;
  jumlahUlasan: number;
  jumlahTransaksi: number;
  /** Komoditas utama, teks bebas (mis. "Cabai", "Tomat"). */
  komoditas: string[];
  lokasi: Koordinat;
  /** Rata-rata waktu balas obrolan. */
  responMenit: number;
  luasLahanHa: number;
  jamOperasional: string;
  /** Hari libur toko berikutnya, bila ada. */
  libur: string | null;
};

export type FotoStok = {
  /** Path gambar; `null` = belum ada aset, tampilkan placeholder. */
  src: string | null;
  /** Tanggal foto diunggah (label kesegaran). */
  diunggah: string;
  keterangan: string;
};

export type TingkatGrosir = {
  /** Jumlah minimum (dalam satuan produk) agar harga ini berlaku. Tingkat pertama selalu `minJumlah: 1`. */
  minJumlah: number;
  harga: number;
};

export type AturanSurplus = {
  /** Berlaku bila sisa hari sebelum kedaluwarsa <= nilai ini. */
  sisaHari: number;
  diskonPersen: number;
};

export type Produk = {
  id: string;
  slug: string;
  nama: string;
  /** Nama lain / daerah untuk pencarian fuzzy (mis. "cabe", "lombok"). */
  namaLain: string[];
  kategori: string;
  petaniId: string;
  /** Harga dasar per satuan (= tingkat grosir pertama). */
  harga: number;
  satuan: Satuan;
  /** Stok publik yang tersedia; 0 = Habis (produk tetap tampil). */
  stok: number;
  minPembelian: number;
  deskripsi: string;
  tag: TagProduk[];
  /** Batch aktif (FEFO: batch terdekat kedaluwarsa). */
  tanggalPanen: string;
  tanggalKedaluwarsa: string;
  fotoStok: FotoStok[];
  hargaGrosir: TingkatGrosir[];
  /** Aturan diskon bertingkat; kosong = tidak ikut program Surplus. */
  aturanSurplus: AturanSurplus[];
  /** Harga lantai agar petani tidak rugi. */
  hargaMinimumSurplus: number | null;
  rating: number;
  jumlahUlasan: number;
  terjual: number;
  pelanggan: number;
  dibuat: string;
};

export type Ulasan = {
  id: string;
  produkId: string;
  petaniId: string;
  /** Nama tampilan pembeli, disingkat (mis. "Rina S."). */
  nama: string;
  peran: "konsumen" | "umkm";
  bintang: 1 | 2 | 3 | 4 | 5;
  komentar: string;
  tanggal: string;
  adaFoto: boolean;
  balasan: { isi: string; tanggal: string } | null;
};

/** Status daftar tunggu (S4). */
export type StatusDaftarTunggu =
  | "jadwal-tanam"
  | "sudah-tanam"
  | "panen-tertunda"
  | "panen-lebih-awal"
  | "gagal-panen"
  | "siap-panen";

export type JadwalPanen =
  | { jenis: "tanggal"; tanggal: string }
  | { jenis: "rentang"; mulai: string; selesai: string }
  | { jenis: "belum-ada" };

export type EntriLinimasa = {
  tanggal: string;
  jenis: "status" | "jadwal" | "foto" | "catatan";
  judul: string;
  isi: string;
  /** Wajib untuk Panen Tertunda dan Gagal Panen. */
  alasan?: string;
};

export type KabarLahan = {
  tanggal: string;
  keterangan: string;
  src: string | null;
};

export type DaftarTunggu = {
  id: string;
  komoditas: string;
  kategori: string;
  petaniId: string;
  deskripsi: string;
  status: StatusDaftarTunggu;
  tanggalTanam: string | null;
  jadwalPanen: JadwalPanen;
  perkiraanHasil: number;
  satuan: Satuan;
  /** Perkiraan harga per satuan saat panen. */
  hargaPerkiraan: number;
  /** Kuota Komitmen total (dalam satuan); `null` = tanpa kuota. */
  kuota: number | null;
  /** Total jumlah minimum yang sudah dikomitmenkan. */
  terkomitmen: number;
  jumlahKomitmen: number;
  pengikut: number;
  /** Batas bawah jumlah per Komitmen yang diizinkan petani. */
  minKomitmen: number;
  linimasa: EntriLinimasa[];
  kabarLahan: KabarLahan[];
  /** Slug produk setelah Siap Panen; `null` bila belum dijual. */
  produkSlug: string | null;
  dibuat: string;
};

// ---------------------------------------------------------------------------
// Bentuk turunan yang dikembalikan fungsi API (sudah digabung dan dihitung).
// ---------------------------------------------------------------------------

export type RingkasPetani = Pick<
  Petani,
  "id" | "nama" | "namaToko" | "kabupaten" | "kecamatan" | "lencana" | "rating" | "lokasi"
> & { labelWilayah: string };

export type SurplusAktif = {
  diskonPersen: number;
  hargaSurplus: number;
};

export type ProdukTampil = Produk & {
  petani: RingkasPetani;
  namaKategori: string;
  ikonKategori: IkonKategori;
  /** Sisa hari batch aktif sebelum kedaluwarsa, dihitung dari `TANGGAL_ACUAN`. */
  sisaHari: number;
  surplusAktif: SurplusAktif | null;
  /** Harga per satuan yang berlaku sekarang (setelah Surplus bila aktif). */
  hargaEfektif: number;
  habis: boolean;
  /** Jarak dari titik acuan, bila diminta. */
  jarakKm: number | null;
};

export type DaftarTungguTampil = DaftarTunggu & {
  petani: RingkasPetani;
  namaKategori: string;
  ikonKategori: IkonKategori;
  /** Persentase kuota terisi (0-100), `null` bila tanpa kuota. */
  persenKuota: number | null;
  kuotaPenuh: boolean;
};

export type PetaniTampil = Petani & {
  labelWilayah: string;
  jumlahProduk: number;
  jumlahDaftarTunggu: number;
  jarakKm: number | null;
};

export type UrutanProduk =
  | "relevan"
  | "terlaris"
  | "terbaru"
  | "harga-asc"
  | "harga-desc"
  | "rating"
  | "terdekat";

export type FilterProduk = {
  q?: string;
  kategori?: string;
  kabupaten?: string;
  organik?: boolean;
  surplus?: boolean;
  /** Sembunyikan produk yang stoknya habis. */
  tersedia?: boolean;
  petaniId?: string;
  hargaMin?: number;
  hargaMax?: number;
  /** Titik acuan "dekat saya"; default pusat Kota Bandung. */
  titik?: Koordinat;
  radiusKm?: number;
  urut?: UrutanProduk;
  halaman?: number;
  perHalaman?: number;
};

export type HasilHalaman<T> = {
  item: T[];
  total: number;
  halaman: number;
  jumlahHalaman: number;
};

export type HasilCari = HasilHalaman<ProdukTampil> & {
  /** Kata yang dikenali sebagai sinonim/salah ketik (mis. "cabe" -> "cabai"). */
  dimaknai: string | null;
  saran: string[];
};
