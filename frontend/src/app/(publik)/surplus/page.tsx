import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ambilProduk } from "@/lib/api/katalog";
import { bacaFilterProduk, type ParamUrl } from "@/lib/filter-produk";
import { IkonDaun, IkonLabel, IkonPerisai } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { DaftarProduk } from "../produk/_komponen/daftar-produk";
import { HeroKatalog } from "../produk/_komponen/hero-katalog";
import { KerangkaDaftarProduk } from "../produk/_komponen/kerangka-daftar";
import { rapikanFilter, type OpsiKatalog } from "../produk/_komponen/opsi-katalog";
import { GridSurplus } from "./_komponen/grid-surplus";

export const metadata: Metadata = {
  title: "Produk Surplus",
  description:
    "Produk segar menjelang tanggal kedaluwarsa dengan diskon bertingkat dari petani. Lebih hemat untukmu, lebih sedikit pangan terbuang.",
};

const OPSI: OpsiKatalog = { path: "/surplus", kunci: ["surplus"] };

const CONTOH_DISKON = [
  { hari: 3, diskon: 10 },
  { hari: 2, diskon: 25 },
  { hari: 1, diskon: 40 },
];

const POIN = [
  {
    ikon: IkonLabel,
    judul: "Diskon bertingkat",
    isi: "Petani mengatur sendiri besar dan tahapan diskonnya. Makin dekat kedaluwarsa, makin besar potongannya.",
  },
  {
    ikon: IkonPerisai,
    judul: "Ada harga lantai",
    isi: "Harga Surplus tidak turun di bawah batas minimum yang ditetapkan petani, jadi petani tidak rugi.",
  },
  {
    ikon: IkonDaun,
    judul: "Kurangi pangan terbuang",
    isi: "Hasil panen yang masih layak konsumsi tetap terjual, bukan berakhir di tempat sampah.",
  },
];

export default function Page({ searchParams }: PageProps<"/surplus">) {
  return (
    <>
      <HeroKatalog
        remah={[{ label: "Beranda", href: "/" }, { label: "Produk", href: "/produk" }, { label: "Surplus" }]}
        label="Program Surplus"
        judul="Produk Surplus"
        deskripsi="Produk segar yang mendekati tanggal kedaluwarsa, dijual lebih murah. Lebih hemat untukmu, lebih sedikit pangan terbuang."
        samping={<TabelContohDiskon />}
      >
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {POIN.map(({ ikon: Ikon, judul, isi }) => (
            <li key={judul} className="flex gap-3 sm:flex-col sm:gap-2.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#c2410c]">
                <Ikon size={18} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-ink">{judul}</span>
                <span className="mt-0.5 block text-sm leading-normal text-muted">{isi}</span>
              </span>
            </li>
          ))}
        </ul>
      </HeroKatalog>

      <div className="mx-auto w-full max-w-300 px-4 pt-6 pb-16 md:px-6 md:pt-8 md:pb-24">
        <Suspense fallback={<KerangkaDaftarProduk />}>
          <HasilSurplus searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

function TabelContohDiskon() {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <table className="w-full text-left text-[15px]">
        <caption className="text-left text-sm font-semibold text-ink">Contoh diskon bertingkat</caption>
        <thead>
          <tr className="text-[13px] text-muted">
            <th scope="col" className="pt-3 pb-2 font-medium">
              Sisa waktu sebelum kedaluwarsa
            </th>
            <th scope="col" className="pt-3 pb-2 text-right font-medium">
              Diskon
            </th>
          </tr>
        </thead>
        <tbody>
          {CONTOH_DISKON.map((d) => (
            <tr key={d.hari} className="border-t border-line">
              <td className="py-2.5 text-ink">
                <span aria-hidden>≤ {d.hari} hari</span>
                <span className="sr-only">{d.hari} hari atau kurang</span>
              </td>
              <td className="py-2.5 text-right font-bold text-[#c2410c]">{d.diskon}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs leading-normal text-muted">
        Angka di atas hanya contoh. Tiap petani menentukan tahapan dan besar diskonnya sendiri.
      </p>
    </div>
  );
}

async function HasilSurplus({ searchParams }: { searchParams: Promise<ParamUrl> }) {
  const filter = rapikanFilter(bacaFilterProduk(await searchParams), OPSI);
  const hasil = await ambilProduk({ ...filter, surplus: true });
  return (
    <DaftarProduk
      opsi={OPSI}
      filter={filter}
      hasil={hasil}
      grid={<GridSurplus produk={hasil.item} prioritas={4} />}
      kosong={{
        judul: "Belum ada produk Surplus saat ini",
        deskripsi:
          "Produk masuk Surplus saat mendekati tanggal kedaluwarsa. Langganan produk favoritmu agar dapat kabar ketika harganya turun.",
        aksi: (
          <Link href="/produk" className={kelasTombolSitus("garis")}>
            Jelajahi semua produk
          </Link>
        ),
      }}
    />
  );
}
