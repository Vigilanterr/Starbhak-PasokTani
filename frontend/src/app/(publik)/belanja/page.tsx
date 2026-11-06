import type { Metadata } from "next";
import { ambilBeranda } from "@/lib/api/katalog";
import { BagianCaraKerja } from "../_beranda/bagian-cara-kerja";
import { BagianFitur } from "../_beranda/bagian-fitur";
import { BagianKontak } from "../_beranda/bagian-kontak";
import { BagianSurplus } from "../_beranda/bagian-surplus";
import { BagianTestimoni } from "../_beranda/bagian-testimoni";
import { BannerKeranjangResep } from "../_beranda/banner-keranjang-resep";
import { GridKategori } from "../_beranda/grid-kategori";
import { HeroBeranda } from "../_beranda/hero-beranda";
import { BagianRelDaftarTunggu, BagianRelProduk } from "../_beranda/rel";

export const metadata: Metadata = {
  title: { absolute: "Pasok Tani · Hasil panen langsung dari petani Jawa Barat" },
  description:
    "Belanja sayur, buah, beras, dan bumbu dapur langsung dari petani Jawa Barat. Foto stok asli bertanggal panen, harga grosir, diskon Surplus, Daftar Tunggu, dan Keranjang Resep untuk UMKM.",
};

/**
 * Beranda (S12, S5). Tidak memakai data saat-permintaan, jadi seluruh halaman di-prerender statis.
 * TODO: saat `ambilBeranda` beralih ke `fetch` backend, beri cache (mis. `"use cache"` + `cacheLife`) agar tetap statis.
 */
export default async function Beranda() {
  const { terlaris, baruPanen, surplus, daftarTungguPopuler, kategori, statistik } = await ambilBeranda();

  return (
    <>
      <HeroBeranda statistik={statistik} produk={baruPanen} />
      <GridKategori kategori={kategori} />
      <BannerKeranjangResep />

      <BagianRelProduk
        id="judul-terlaris"
        judul="Terlaris"
        deskripsi="Paling sering dibeli di Pasok Tani."
        href="/produk?urut=terlaris"
        produk={terlaris}
      />
      <BagianRelProduk
        id="judul-baru-dipanen"
        judul="Baru dipanen"
        deskripsi="Stok dengan tanggal panen paling baru."
        href="/produk?urut=terbaru"
        produk={baruPanen}
      />
      <BagianSurplus produk={surplus} />
      <BagianRelDaftarTunggu
        id="judul-daftar-tunggu"
        judul="Daftar Tunggu populer"
        deskripsi="Panen yang belum siap. Ikuti untuk dapat kabar, atau Komitmen agar kebagian stok lebih dulu."
        href="/daftar-tunggu"
        data={daftarTungguPopuler}
      />

      <BagianFitur />
      <BagianCaraKerja />
      <BagianTestimoni />
      <BagianKontak />
    </>
  );
}
