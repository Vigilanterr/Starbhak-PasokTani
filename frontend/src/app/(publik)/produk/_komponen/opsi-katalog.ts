/**
 * Opsi dan utilitas murni untuk halaman daftar produk (`/produk`, `/cari`, `/surplus`, `/kategori/[slug]`).
 * Tidak mengimpor `@/lib/api/katalog`, jadi aman dipakai Server maupun Client Component.
 */

import type { FilterProduk, Kategori, UrutanProduk } from "@/lib/api/tipe";
import { hrefFilter } from "@/lib/filter-produk";
import { rupiah } from "@/lib/format";
import { WILAYAH_JAWA_BARAT } from "@/lib/wilayah";

/** Filter yang bisa ditetapkan oleh halaman, bukan oleh pengunjung. */
export type FilterTerkunci = "kategori" | "surplus";

export type OpsiKatalog = {
  /** Path halaman: action form filter, href chip, paginasi, dan tombol "Dekat saya". */
  path: string;
  /** Filter yang ditetapkan halaman: tidak tampil di panel, chip, maupun URL. */
  kunci?: FilterTerkunci[];
  /** Halaman pencarian: `q` dipertahankan dan urutan "Paling relevan" tersedia. */
  pencarian?: boolean;
};

/** Pilihan radius "Dekat saya" (km). */
export const RADIUS_PILIHAN = [10, 25, 50] as const;

export function urutanBawaan(opsi: OpsiKatalog): UrutanProduk {
  return opsi.pencarian ? "relevan" : "terlaris";
}

/**
 * Bersihkan filter dari URL sebelum dipakai: buang parameter yang tidak berlaku di halaman ini
 * (mis. `?surplus=1` di `/surplus`, `?q=` di luar `/cari`) dan nilai yang tidak masuk akal.
 */
export function rapikanFilter(f: FilterProduk, opsi: OpsiKatalog): FilterProduk {
  const kunci = opsi.kunci ?? [];
  let hargaMin = f.hargaMin !== undefined && f.hargaMin > 0 ? f.hargaMin : undefined;
  let hargaMax = f.hargaMax !== undefined && f.hargaMax > 0 ? f.hargaMax : undefined;
  if (hargaMin !== undefined && hargaMax !== undefined && hargaMin > hargaMax) {
    [hargaMin, hargaMax] = [hargaMax, hargaMin];
  }
  const titikValid = f.titik && Math.abs(f.titik.lat) <= 90 && Math.abs(f.titik.lng) <= 180;
  return {
    ...f,
    q: opsi.pencarian ? f.q : undefined,
    kategori: kunci.includes("kategori") ? undefined : f.kategori,
    surplus: kunci.includes("surplus") ? undefined : f.surplus,
    // Produk Surplus selalu masih punya stok, jadi "sembunyikan stok habis" tidak relevan di /surplus.
    tersedia: kunci.includes("surplus") ? undefined : f.tersedia,
    hargaMin,
    hargaMax,
    titik: titikValid ? f.titik : undefined,
    radiusKm: f.radiusKm !== undefined && f.radiusKm > 0 ? Math.min(f.radiusKm, 200) : undefined,
    urut: f.urut === "relevan" && !opsi.pencarian ? undefined : f.urut,
  };
}

/** Ada filter (termasuk lokasi) yang mempersempit hasil? */
export function adaFilterAktif(f: FilterProduk): boolean {
  return Boolean(
    f.kategori ||
      f.kabupaten ||
      f.organik ||
      f.surplus ||
      f.tersedia ||
      f.hargaMin !== undefined ||
      f.hargaMax !== undefined ||
      f.titik ||
      f.radiusKm !== undefined,
  );
}

export type ChipFilter = { id: string; label: string; href: string };

/** Filter dari panel yang sedang aktif, masing-masing dengan tautan untuk menghapusnya. */
export function susunChipFilter(
  f: FilterProduk,
  path: string,
  kategori: Pick<Kategori, "slug" | "nama">[],
): ChipFilter[] {
  const dasar: FilterProduk = { ...f, halaman: undefined };
  const tanpa = (ubah: Partial<FilterProduk>) => hrefFilter(path, { ...dasar, ...ubah });
  const chip: ChipFilter[] = [];

  if (f.kategori) {
    const nama = kategori.find((k) => k.slug === f.kategori)?.nama ?? f.kategori;
    chip.push({ id: "kategori", label: nama, href: tanpa({ kategori: undefined }) });
  }
  if (f.kabupaten) {
    const nama = WILAYAH_JAWA_BARAT.find((w) => w.nilai === f.kabupaten)?.label ?? f.kabupaten;
    chip.push({ id: "kabupaten", label: nama, href: tanpa({ kabupaten: undefined }) });
  }
  if (f.hargaMin !== undefined || f.hargaMax !== undefined) {
    const label =
      f.hargaMin !== undefined && f.hargaMax !== undefined
        ? `${rupiah(f.hargaMin)} – ${rupiah(f.hargaMax)}`
        : f.hargaMin !== undefined
          ? `Mulai ${rupiah(f.hargaMin)}`
          : `Sampai ${rupiah(f.hargaMax ?? 0)}`;
    chip.push({ id: "harga", label, href: tanpa({ hargaMin: undefined, hargaMax: undefined }) });
  }
  if (f.organik) chip.push({ id: "organik", label: "Organik", href: tanpa({ organik: undefined }) });
  if (f.surplus) chip.push({ id: "surplus", label: "Surplus", href: tanpa({ surplus: undefined }) });
  if (f.tersedia) chip.push({ id: "tersedia", label: "Stok tersedia", href: tanpa({ tersedia: undefined }) });
  return chip;
}

/** Hapus semua filter panel; kata kunci, urutan, dan lokasi tetap. */
export function hrefHapusFilter(f: FilterProduk, path: string): string {
  return hrefFilter(path, { q: f.q, urut: f.urut, titik: f.titik, radiusKm: f.radiusKm });
}

/** Matikan pencarian lokasi (titik + radius, dan urutan "Terdekat"). */
export function hrefTanpaLokasi(f: FilterProduk, path: string): string {
  return hrefFilter(path, {
    ...f,
    halaman: undefined,
    titik: undefined,
    radiusKm: undefined,
    urut: f.urut === "terdekat" ? undefined : f.urut,
  });
}
