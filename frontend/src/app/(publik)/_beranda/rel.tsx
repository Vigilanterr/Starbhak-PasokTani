import type { ReactNode } from "react";
import type { DaftarTungguTampil, ProdukTampil } from "@/lib/api/tipe";
import { JudulBagian } from "../_komponen/judul-bagian";
import { KartuDaftarTunggu } from "../_komponen/kartu-daftar-tunggu";
import { KartuProduk } from "../_komponen/kartu-produk";
import { KONTAINER } from "./kelas";

/** Jumlah kartu yang tampil di grid desktop (satu baris); sisanya hanya ada di rel geser. */
const MAKS_DESKTOP = 4;

/**
 * Rel kartu: di ponsel dan tablet digeser horizontal (snap) dan melebar sampai tepi layar,
 * di desktop menjadi grid 4 kolom. Hanya rel ini yang boleh menggulir horizontal; halamannya tidak.
 */
export function Rel({ children }: { children: ReactNode }) {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-3 md:-mx-6 md:scroll-px-6 md:gap-4 md:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
      {children}
    </ul>
  );
}

/** `produk`: ±2,2 kartu terlihat di ponsel. `lebar`: ±1,3 kartu (kartu daftar tunggu yang lebih padat). */
const LEBAR = {
  produk: "w-[44%] sm:w-[30%]",
  lebar: "w-[76%] sm:w-[46%] md:w-[38%]",
} as const;

export function ItemRel({
  children,
  indeks,
  lebar = "produk",
}: {
  children: ReactNode;
  indeks: number;
  lebar?: keyof typeof LEBAR;
}) {
  return (
    <li className={`shrink-0 snap-start ${LEBAR[lebar]} lg:w-auto ${indeks >= MAKS_DESKTOP ? "lg:hidden" : ""}`}>
      {children}
    </li>
  );
}

type PropsJudul = {
  id: string;
  judul: string;
  deskripsi?: ReactNode;
  href: string;
  labelTautan?: string;
};

/** Bagian rel produk (Terlaris, Baru dipanen). Disembunyikan bila kosong. */
export function BagianRelProduk({ produk, ...judul }: PropsJudul & { produk: ProdukTampil[] }) {
  if (produk.length === 0) return null;
  return (
    <section aria-labelledby={judul.id} className={`${KONTAINER} mt-12 md:mt-16`}>
      <JudulBagian {...judul} />
      <Rel>
        {produk.map((p, i) => (
          <ItemRel key={p.id} indeks={i}>
            <KartuProduk produk={p} />
          </ItemRel>
        ))}
      </Rel>
    </section>
  );
}

/** Bagian Daftar Tunggu Populer. Disembunyikan bila kosong. */
export function BagianRelDaftarTunggu({ data, ...judul }: PropsJudul & { data: DaftarTungguTampil[] }) {
  if (data.length === 0) return null;
  return (
    <section aria-labelledby={judul.id} className={`${KONTAINER} mt-12 md:mt-16`}>
      <JudulBagian {...judul} />
      <Rel>
        {data.map((d, i) => (
          <ItemRel key={d.id} indeks={i} lebar="lebar">
            <KartuDaftarTunggu data={d} />
          </ItemRel>
        ))}
      </Rel>
    </section>
  );
}
