import { KONTEN_BERANDA } from "./konten-beranda";
import type { AturanSurplus, IkonKategori, Satuan } from "@/lib/api/tipe";

/** Kunci ikon fitur di `beranda.json`; dipetakan ke komponen ikon di `bagian-fitur.tsx`. */
export type KunciIkonFitur = "kamera" | "lonceng" | "tunas" | "keranjang" | "lencana" | "api" | "label" | "perisai";

export type ItemPencarian = { label: string; q: string };

export type BahanResep = { nama: string; jumlah: number; satuan: Satuan; ikon: IkonKategori };

export type Fitur = { ikon: KunciIkonFitur; judul: string; deskripsi: string };

export type Langkah = { judul: string; deskripsi: string };

export type Testimoni = {
  id: string;
  /** `true` = testimoni contoh (placeholder), belum dari pengguna sungguhan. */
  contoh: boolean;
  jenis: "konsumen" | "umkm" | "petani";
  nama: string;
  peran: string;
  wilayah: string;
  kutipan: string;
};

type DataBeranda = {
  pencarianPopuler: ItemPencarian[];
  keranjangResep: {
    langkah: string[];
    contoh: { nama: string; keterangan: string; bahan: BahanResep[] };
  };
  /** Contoh tingkat diskon Surplus (diatur sendiri oleh tiap petani). */
  contohSurplus: AturanSurplus[];
  fitur: Fitur[];
  caraKerja: { pembeli: Langkah[]; petani: Langkah[] };
  testimoni: Testimoni[];
};

// JSON diketik longgar oleh TypeScript; bentuknya dijaga oleh tipe di atas.
export const BERANDA = KONTEN_BERANDA as unknown as DataBeranda;
