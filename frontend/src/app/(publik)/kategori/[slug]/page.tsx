import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ambilKategori, ambilKategoriBySlug, ambilProduk } from "@/lib/api/katalog";
import { bacaFilterProduk, type ParamUrl } from "@/lib/filter-produk";
import { IKON_KATEGORI, WARNA_KATEGORI } from "../../_komponen/foto-komoditas";
import { DaftarProduk } from "../../produk/_komponen/daftar-produk";
import { HeroKatalog } from "../../produk/_komponen/hero-katalog";
import { KerangkaDaftarProduk } from "../../produk/_komponen/kerangka-daftar";
import { rapikanFilter, type OpsiKatalog } from "../../produk/_komponen/opsi-katalog";
import { RelKategori } from "../../produk/_komponen/rel-kategori";

export async function generateStaticParams() {
  const semua = await ambilKategori();
  return semua.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: PageProps<"/kategori/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const kategori = await ambilKategoriBySlug(slug);
  if (!kategori) return { title: "Kategori tidak ditemukan" };
  return { title: kategori.nama, description: kategori.deskripsi };
}

export default async function Page({ params, searchParams }: PageProps<"/kategori/[slug]">) {
  const { slug } = await params;
  const semua = await ambilKategori();
  const kategori = semua.find((k) => k.slug === slug);
  if (!kategori) notFound();

  const Ikon = IKON_KATEGORI[kategori.ikon];
  const warna = WARNA_KATEGORI[kategori.ikon];

  return (
    <>
      <HeroKatalog
        remah={[{ label: "Beranda", href: "/" }, { label: "Produk", href: "/produk" }, { label: kategori.nama }]}
        label="Kategori"
        judul={kategori.nama}
        deskripsi={kategori.deskripsi}
        ikon={
          <span
            aria-hidden
            className={`grid size-14 shrink-0 place-items-center rounded-2xl md:size-16 ${warna.latar} ${warna.ikon}`}
          >
            <Ikon size={28} />
          </span>
        }
      >
        <RelKategori kategori={semua} aktif={slug} className="mt-6" />
      </HeroKatalog>

      <div className="mx-auto w-full max-w-300 px-4 pt-6 pb-16 md:px-6 md:pt-8 md:pb-24">
        <Suspense fallback={<KerangkaDaftarProduk />}>
          <HasilKategori slug={slug} nama={kategori.nama} searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function HasilKategori({
  slug,
  nama,
  searchParams,
}: {
  slug: string;
  nama: string;
  searchParams: Promise<ParamUrl>;
}) {
  const opsi: OpsiKatalog = { path: `/kategori/${slug}`, kunci: ["kategori"] };
  const filter = rapikanFilter(bacaFilterProduk(await searchParams), opsi);
  const hasil = await ambilProduk({ ...filter, kategori: slug });
  return (
    <DaftarProduk
      opsi={opsi}
      filter={filter}
      hasil={hasil}
      kosong={{
        judul: `Belum ada produk ${nama}`,
        deskripsi: "Petani belum menjual produk di kategori ini. Coba kategori lain atau lihat daftar tunggu panen.",
      }}
    />
  );
}
