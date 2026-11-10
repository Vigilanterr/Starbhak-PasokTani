import type { Metadata } from "next";
import { Suspense } from "react";
import { HasilDaftarTunggu, KerangkaHasilDaftarTunggu } from "./_komponen/hasil";
import { HeroDaftarTunggu } from "./_komponen/hero";

export const metadata: Metadata = {
  title: "Daftar Tunggu",
  description:
    "Ikuti komoditas yang belum dipanen dari petani Jawa Barat, lalu Komitmen lebih awal agar dapat prioritas stok saat panen.",
};

// Hero statis; hanya area hasil yang membaca query string (status, kategori, komitmen, urut).
export default function Page({ searchParams }: PageProps<"/daftar-tunggu">) {
  return (
    <>
      <HeroDaftarTunggu />
      <section aria-labelledby="judul-jelajah" className="mx-auto w-full max-w-300 px-4 pt-8 pb-14 md:px-6 md:pt-12 md:pb-20">
        <h2 id="judul-jelajah" className="text-[22px] font-bold tracking-tight text-brand-900 md:text-2xl">
          Jelajahi daftar tunggu
        </h2>
        <Suspense fallback={<KerangkaHasilDaftarTunggu />}>
          <HasilDaftarTunggu searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
