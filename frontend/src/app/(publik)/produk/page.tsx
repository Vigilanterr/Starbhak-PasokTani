import type { Metadata } from "next";
import { Suspense } from "react";
import { ambilProduk } from "@/lib/api/katalog";
import { bacaFilterProduk, type ParamUrl } from "@/lib/filter-produk";
import { DaftarProduk } from "./_komponen/daftar-produk";
import { HeroKatalog } from "./_komponen/hero-katalog";
import { KerangkaDaftarProduk } from "./_komponen/kerangka-daftar";
import { KotakCari } from "./_komponen/kotak-cari";
import { rapikanFilter, type OpsiKatalog } from "./_komponen/opsi-katalog";

export const metadata: Metadata = {
  title: "Jelajahi Produk",
  description:
    "Sayur, buah, dan bahan pangan segar langsung dari petani Jawa Barat. Saring berdasarkan harga, jarak, rating, tanggal panen, organik, atau Surplus.",
};

const OPSI: OpsiKatalog = { path: "/produk" };

export default function Page({ searchParams }: PageProps<"/produk">) {
  return (
    <>
      <HeroKatalog
        remah={[{ label: "Beranda", href: "/" }, { label: "Produk" }]}
        label="Katalog"
        judul="Jelajahi produk"
        deskripsi="Bahan pangan segar langsung dari petani Jawa Barat. Saring berdasarkan harga, wilayah, atau cari yang terdekat dari lokasimu."
      >
        <KotakCari className="mt-6 max-w-150" />
      </HeroKatalog>

      <div className="mx-auto w-full max-w-300 px-4 pt-6 pb-16 md:px-6 md:pt-8 md:pb-24">
        <Suspense fallback={<KerangkaDaftarProduk />}>
          <HasilProduk searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function HasilProduk({ searchParams }: { searchParams: Promise<ParamUrl> }) {
  const filter = rapikanFilter(bacaFilterProduk(await searchParams), OPSI);
  const hasil = await ambilProduk(filter);
  return <DaftarProduk opsi={OPSI} filter={filter} hasil={hasil} />;
}
