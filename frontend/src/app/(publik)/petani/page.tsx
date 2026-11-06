import type { Metadata } from "next";
import { Suspense } from "react";
import { HasilPetani } from "./_komponen/hasil-petani";
import { KerangkaDirektori } from "./_komponen/kerangka-direktori";
import { LegendaLencana } from "./_komponen/legenda-lencana";

export const metadata: Metadata = {
  title: "Direktori Petani",
  description:
    "Kenali petani Jawa Barat di Pasok Tani: cari berdasarkan komoditas atau wilayah, lalu lihat lencana, rating, dan jumlah transaksi mereka.",
};

export default function Page({ searchParams }: PageProps<"/petani">) {
  return (
    <>
      <section className="bg-tint">
        <div className="mx-auto w-full max-w-300 px-4 py-10 md:px-6 md:py-14">
          <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Direktori petani</p>
          <h1 className="mt-3 max-w-180 text-[32px] leading-tight font-bold tracking-tight text-brand-900 md:text-[44px]">
            Kenali petani di balik hasil panenmu
          </h1>
          <p className="mt-3 max-w-160 text-base leading-relaxed text-muted md:text-[17px]">
            Belanja langsung dari petani Jawa Barat. Cari berdasarkan komoditas atau wilayah, lalu lihat lencana, rating,
            dan rekam jejak transaksinya sebelum memesan.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-300 px-4 py-8 md:px-6 md:py-12">
        <Suspense fallback={<KerangkaDirektori />}>
          <HasilPetani searchParams={searchParams} />
        </Suspense>
      </div>

      <LegendaLencana />
    </>
  );
}
