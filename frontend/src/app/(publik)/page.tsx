import type { Metadata } from "next";
import { BagianKontak } from "./_beranda/bagian-kontak";
import { HeroLanding } from "./_landing/hero";
import { BagianKenapa } from "./_landing/kenapa";
import { BagianLangkah } from "./_landing/langkah";
import { BagianProdukPilihan } from "./_landing/produk-pilihan";
import { BagianRancangan } from "./_landing/rancangan";
import { BagianTestimoniLanding } from "./_landing/testimoni";

export const metadata: Metadata = {
  title: { absolute: "Pasok Tani · Menghubungkan hasil panen dengan kebutuhan pasar" },
  description:
    "Platform digital yang menghubungkan petani dan UMKM: pasokan dan harga yang jelas, pemasok yang sesuai, serta pengadaan yang lebih terencana.",
};

export default function Landing() {
  return (
    <>
      <HeroLanding />
      <BagianKenapa />
      <BagianRancangan />
      <BagianProdukPilihan />
      <BagianLangkah />
      <BagianTestimoniLanding />
      <BagianKontak varian="landing" />
    </>
  );
}
