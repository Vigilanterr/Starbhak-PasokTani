import type { Metadata } from "next";
import { HeroLanding } from "./_landing/hero";
import { BagianBaruDipanen } from "./_landing/baru-dipanen";
import { BagianCabang } from "./_landing/cabang";
import { BagianDaftarTunggu } from "./_landing/daftar-tunggu";
import { BagianPembayaran } from "./_landing/pembayaran";
import { BagianPengiriman } from "./_landing/pengiriman";
import { BagianPetani } from "./_landing/petani";

export const metadata: Metadata = {
  title: { absolute: "Pasok Tani · Menghubungkan hasil panen dengan kebutuhan pasar" },
  description:
    "Platform digital yang menghubungkan petani dan UMKM: pasokan dan harga yang jelas, pemasok yang sesuai, serta pengadaan yang lebih terencana.",
};

export default function Landing() {
  return (
    <>
      <HeroLanding />
      <BagianBaruDipanen />
      <BagianPetani />
      <BagianDaftarTunggu />
      <BagianPembayaran />
      <BagianPengiriman />
      <BagianCabang />
    </>
  );
}
