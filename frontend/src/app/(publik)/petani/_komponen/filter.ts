import type { FilterPetani } from "@/lib/api/katalog";
import type { ParamUrl } from "@/lib/filter-produk";
import { URUTAN_LENCANA } from "@/lib/label";
import { WILAYAH_JAWA_BARAT } from "@/lib/wilayah";

export type UrutanPetani = NonNullable<FilterPetani["urut"]>;

export const URUTAN_PETANI: UrutanPetani[] = ["rating", "transaksi", "terbaru", "terdekat"];

/** Label pendek agar muat di kolom sempit ponsel (label kolom "Urutkan" ada di atasnya). */
export const LABEL_URUTAN_PETANI: Record<UrutanPetani, string> = {
  rating: "Rating",
  transaksi: "Terlaris",
  terbaru: "Terbaru",
  terdekat: "Terdekat",
};

/** Filter direktori yang sudah divalidasi; `urut` selalu terisi (default rating). */
export type FilterPetaniTerbaca = FilterPetani & { urut: UrutanPetani };

function satu(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Query string `/petani`: `q`, `kabupaten`, `lencana`, `urut`.
 * Nilai yang tidak dikenal diabaikan agar URL buatan tangan tidak merusak halaman.
 */
export function bacaFilterPetani(p: ParamUrl): FilterPetaniTerbaca {
  const kabupaten = satu(p.kabupaten);
  const lencana = URUTAN_LENCANA.find((l) => l === satu(p.lencana));
  const urut = URUTAN_PETANI.find((u) => u === satu(p.urut));
  return {
    q: satu(p.q)?.trim().slice(0, 80) || undefined,
    kabupaten: WILAYAH_JAWA_BARAT.some((w) => w.nilai === kabupaten) ? kabupaten : undefined,
    lencana,
    urut: urut ?? "rating",
  };
}
