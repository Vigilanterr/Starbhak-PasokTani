import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ambilKategori, ambilProduk, cariProduk } from "@/lib/api/katalog";
import { bacaFilterProduk, hrefFilter, type ParamUrl } from "@/lib/filter-produk";
import { IkonCari, IkonInfo } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { JudulBagian } from "../_komponen/judul-bagian";
import { KeadaanKosong } from "../_komponen/kosong";
import { DaftarProduk } from "../produk/_komponen/daftar-produk";
import { HeroKatalog } from "../produk/_komponen/hero-katalog";
import { KerangkaDaftarProduk } from "../produk/_komponen/kerangka-daftar";
import { KotakCari } from "../produk/_komponen/kotak-cari";
import { adaFilterAktif, rapikanFilter, type OpsiKatalog } from "../produk/_komponen/opsi-katalog";
import { GridKategori } from "../produk/_komponen/rel-kategori";

export const metadata: Metadata = {
  title: "Cari Produk",
  description: "Cari sayur, buah, dan bahan pangan dari petani Jawa Barat. Salah ketik dan nama daerah tetap dikenali.",
  robots: { index: false, follow: true },
};

const OPSI: OpsiKatalog = { path: "/cari", pencarian: true };

const kelasChipCari =
  "inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink no-underline hover:border-brand-600 hover:text-brand-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45";

export default function Page({ searchParams }: PageProps<"/cari">) {
  return (
    <>
      <HeroKatalog
        remah={[{ label: "Beranda", href: "/" }, { label: "Cari produk" }]}
        judul="Cari produk"
        deskripsi="Salah ketik atau nama daerah tetap kami kenali, misalnya “cabe”, “sampeu”, atau “bonteng”."
      >
        <Suspense fallback={<KotakCari className="mt-6 max-w-150" />}>
          <KotakCariTerisi searchParams={searchParams} />
        </Suspense>
      </HeroKatalog>

      <div className="mx-auto w-full max-w-300 px-4 pt-6 pb-16 md:px-6 md:pt-8 md:pb-24">
        <Suspense fallback={<KerangkaDaftarProduk />}>
          <HasilPencarian searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function KotakCariTerisi({ searchParams }: { searchParams: Promise<ParamUrl> }) {
  const { q } = bacaFilterProduk(await searchParams);
  return <KotakCari q={q} className="mt-6 max-w-150" />;
}

async function HasilPencarian({ searchParams }: { searchParams: Promise<ParamUrl> }) {
  const filter = rapikanFilter(bacaFilterProduk(await searchParams), OPSI);
  const q = filter.q;
  if (!q) return <AjakanCari />;

  const hasil = await cariProduk(q, filter);
  const judul = (
    <div className="mb-5 md:mb-6">
      <h2 className="text-[22px] font-bold tracking-tight break-words text-brand-900 md:text-2xl">
        Hasil pencarian untuk “{q}”
      </h2>
      {hasil.dimaknai && (
        <p className="mt-1.5 flex items-start gap-1.5 text-[15px] text-muted">
          <IkonInfo size={18} className="mt-0.5 shrink-0 text-brand-600" />
          <span>
            Menampilkan hasil untuk “<span className="font-semibold text-ink">{hasil.dimaknai}</span>”.
          </span>
        </p>
      )}
    </div>
  );

  // Tidak ada yang cocok sama sekali: tampilkan saran saja, tanpa panel filter.
  if (hasil.total === 0 && !adaFilterAktif(filter)) {
    return (
      <>
        {judul}
        <KeadaanKosong
          ikon={<IkonCari size={24} />}
          judul={`Belum ada produk untuk “${q}”`}
          deskripsi="Periksa ejaannya atau coba kata yang lebih umum, misalnya nama komoditasnya saja."
          aksi={
            <>
              {hasil.saran.length > 0 && (
                <div className="w-full">
                  <p className="text-sm font-semibold text-ink">Coba cari:</p>
                  <ul className="mt-2 flex flex-wrap justify-center gap-2">
                    {hasil.saran.map((s) => (
                      <li key={s}>
                        <Link href={hrefFilter("/cari", { q: s })} className={kelasChipCari}>
                          {s}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link href="/produk" className={kelasTombolSitus("garis")}>
                Jelajahi semua produk
              </Link>
            </>
          }
        />
      </>
    );
  }

  return (
    <>
      {judul}
      <DaftarProduk opsi={OPSI} filter={filter} hasil={hasil} />
    </>
  );
}

/** Kata kunci kosong: ajakan mencari dengan pencarian populer dan kategori. */
async function AjakanCari() {
  const [{ item }, kategori] = await Promise.all([
    ambilProduk({ urut: "terlaris", tersedia: true, perHalaman: 16 }),
    ambilKategori(),
  ]);
  // Dua kata pertama nama produk (mis. "Tomat Merah"), seperti saran dari API pencarian.
  const populer = [...new Set(item.map((p) => p.nama.split(" ").slice(0, 2).join(" ")))].slice(0, 8);

  return (
    <div className="flex flex-col gap-12 md:gap-14">
      <section aria-labelledby="judul-populer">
        <h2 id="judul-populer" className="text-[22px] font-bold tracking-tight text-brand-900 md:text-2xl">
          Mau cari apa hari ini?
        </h2>
        <p className="mt-1 text-[15px] text-muted">Pencarian populer di Pasok Tani:</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {populer.map((nama) => (
            <li key={nama}>
              <Link href={hrefFilter("/cari", { q: nama })} className={kelasChipCari}>
                <IkonCari size={16} className="shrink-0 text-muted" />
                {nama}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="judul-kategori">
        <JudulBagian id="judul-kategori" judul="Jelajahi kategori" href="/produk" labelTautan="Semua produk" />
        <GridKategori kategori={kategori} />
      </section>
    </div>
  );
}
