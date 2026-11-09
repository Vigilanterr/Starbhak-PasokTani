import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  ambilPetaniById,
  ambilProdukBySlug,
  ambilProdukTerkait,
  ambilUlasanProduk,
} from "@/lib/api/katalog";
import { angka, LABEL_SATUAN, rupiah } from "@/lib/format";
import { LABEL_TAG } from "@/lib/label";
import { GridProduk } from "../../_komponen/grid-produk";
import { JudulBagian } from "../../_komponen/judul-bagian";
import { RemahRoti } from "../../_komponen/remah-roti";
import { BagianUlasan } from "./_komponen/bagian-ulasan";
import { BilahAksiSeluler } from "./_komponen/bilah-aksi-seluler";
import { GaleriFoto } from "./_komponen/galeri-foto";
import type { DataBeli } from "./_komponen/harga-produk";
import { InfoPengiriman } from "./_komponen/info-pengiriman";
import { InfoProduk } from "./_komponen/info-produk";
import { KartuPetaniProduk } from "./_komponen/kartu-petani-produk";
import { KotakBeli } from "./_komponen/kotak-beli";
import { PenyediaBeli } from "./_komponen/penyedia-beli";

export async function generateMetadata({ params }: PageProps<"/produk/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await ambilProdukBySlug(slug);
  if (!p) return { title: "Produk tidak ditemukan" };
  return {
    title: `${p.nama} · ${p.petani.namaToko}`,
    description: `${p.deskripsi} ${rupiah(p.hargaEfektif)}/${LABEL_SATUAN[p.satuan]} dari ${p.petani.namaToko}, ${p.petani.kecamatan}.`,
  };
}

export default function Page(props: PageProps<"/produk/[slug]">) {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-[60vh]" />}>
      <IsiHalaman {...props} />
    </Suspense>
  );
}

async function IsiHalaman({ params }: PageProps<"/produk/[slug]">) {
  const { slug } = await params;
  const produk = await ambilProdukBySlug(slug);
  if (!produk) notFound();

  const [{ item: ulasan, ringkasan }, petani, terkait] = await Promise.all([
    ambilUlasanProduk(produk.id),
    ambilPetaniById(produk.petaniId),
    ambilProdukTerkait(produk),
  ]);
  if (!petani) notFound();

  const s = LABEL_SATUAN[produk.satuan];
  const dataBeli: DataBeli = {
    slug: produk.slug,
    nama: produk.nama,
    satuan: produk.satuan,
    harga: produk.harga,
    stok: produk.stok,
    minPembelian: produk.minPembelian,
    hargaGrosir: produk.hargaGrosir,
    hargaSurplus: produk.surplusAktif?.hargaSurplus ?? null,
    diskonSurplus: produk.surplusAktif?.diskonPersen ?? null,
    habis: produk.habis,
    pelanggan: produk.pelanggan,
  };

  // Data terstruktur untuk mesin pencari (schema.org Product).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produk.nama,
    description: produk.deskripsi,
    category: produk.namaKategori,
    brand: { "@type": "Brand", name: produk.petani.namaToko },
    ...(produk.jumlahUlasan > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: produk.rating, reviewCount: produk.jumlahUlasan },
    }),
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: produk.hargaEfektif,
      availability: produk.habis ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  const rincian: { label: string; nilai: string }[] = [
    { label: "Kategori", nilai: produk.namaKategori },
    { label: "Satuan", nilai: s },
    { label: "Minimum pembelian", nilai: `${angka(produk.minPembelian)} ${s}` },
    { label: "Asal", nilai: `${produk.petani.kecamatan}, ${produk.petani.labelWilayah}` },
    ...(produk.tag.length > 0 ? [{ label: "Label", nilai: produk.tag.map((t) => LABEL_TAG[t]).join(", ") }] : []),
  ];

  return (
    <PenyediaBeli data={dataBeli}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="mx-auto w-full max-w-300 px-4 pt-5 pb-12 md:px-6 md:pt-8 lg:pb-20">
        <RemahRoti
          item={[
            { label: "Beranda", href: "/" },
            { label: "Produk", href: "/produk" },
            { label: produk.namaKategori, href: `/kategori/${produk.kategori}` },
            { label: produk.nama },
          ]}
        />

        {/*
          Ponsel: galeri, info + kotak beli, lalu konten lain (urutan DOM).
          Desktop: galeri dan konten di kolom kiri; info + kotak beli di kolom kanan yang membentang dua baris
          sehingga kotak beli (sticky) ikut terlihat saat konten kiri digulir.
        */}
        <div className="mt-5 flex flex-col gap-6 md:mt-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-10 xl:gap-x-14">
          <div className="lg:col-start-1 lg:row-start-1">
            <GaleriFoto foto={produk.fotoStok} ikon={produk.ikonKategori} nama={produk.nama} habis={produk.habis} />
          </div>

          <aside aria-label="Harga dan pembelian" className="flex flex-col gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <InfoProduk produk={produk} />
            <KotakBeli />
          </aside>

          <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-2 lg:gap-8">
            <section aria-labelledby="judul-tentang" className="rounded-2xl border border-line bg-white p-5 md:p-6">
              <h2 id="judul-tentang" className="text-xl font-bold tracking-tight text-brand-900">
                Tentang produk
              </h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink">{produk.deskripsi}</p>
              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 border-t border-line pt-4 text-sm sm:grid-cols-2">
                {rincian.map((r) => (
                  <div key={r.label} className="flex justify-between gap-3 sm:block">
                    <dt className="text-muted">{r.label}</dt>
                    <dd className="text-right font-medium text-ink sm:mt-0.5 sm:text-left">{r.nilai}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <KartuPetaniProduk petani={petani} />
            <InfoPengiriman asal={`${petani.kecamatan}, ${petani.labelWilayah}`} />
            <BagianUlasan produk={produk} ulasan={ulasan} ringkasan={ringkasan} namaToko={petani.namaToko} />
          </div>
        </div>

        {terkait.length > 0 && (
          <section aria-labelledby="judul-serupa" className="mt-14 md:mt-20">
            <JudulBagian
              id="judul-serupa"
              judul="Produk serupa"
              deskripsi={`Pilihan ${produk.namaKategori.toLowerCase()} lain dari petani Jawa Barat.`}
              href={`/kategori/${produk.kategori}`}
              labelTautan={`Semua ${produk.namaKategori.toLowerCase()}`}
            />
            <GridProduk produk={terkait} />
          </section>
        )}
      </div>

      <BilahAksiSeluler />
    </PenyediaBeli>
  );
}
