/**
 * Perhitungan harga untuk kotak beli (tanpa "use client": dipakai Server maupun Client Component).
 * Backend nanti menghitung ulang harga di keranjang dan checkout; ini hanya pratinjau untuk pembeli.
 */

import type { Satuan, TingkatGrosir } from "@/lib/api/tipe";
import { angka, LABEL_SATUAN } from "@/lib/format";

/** Data minimum yang dikirim dari Server Component ke kotak beli (semua bisa diserialisasi). */
export type DataBeli = {
  slug: string;
  nama: string;
  satuan: Satuan;
  /** Harga dasar per satuan (= tingkat grosir pertama). */
  harga: number;
  stok: number;
  minPembelian: number;
  hargaGrosir: TingkatGrosir[];
  /** Harga Surplus per satuan bila Surplus sedang aktif. */
  hargaSurplus: number | null;
  diskonSurplus: number | null;
  habis: boolean;
  pelanggan: number;
};

export type RincianHarga = {
  /** Harga per satuan yang dipakai untuk jumlah ini. */
  satuan: number;
  /** Harga tingkat grosir untuk jumlah ini (sebelum dibandingkan dengan Surplus). */
  tingkat: number;
  sumber: "dasar" | "grosir" | "surplus";
  /** Indeks tingkat grosir yang berlaku pada daftar terurut, -1 bila tidak ada. */
  indeks: number;
};

export function urutkanTingkat(daftar: TingkatGrosir[]): TingkatGrosir[] {
  return [...daftar].sort((a, b) => a.minJumlah - b.minJumlah);
}

/** Indeks tingkat terakhir yang `minJumlah`-nya sudah terpenuhi. */
export function indeksTingkat(urut: TingkatGrosir[], jumlah: number): number {
  let indeks = -1;
  urut.forEach((t, n) => {
    if (jumlah >= t.minJumlah) indeks = n;
  });
  return indeks;
}

/** Harga satuan untuk `jumlah`: tingkat grosir, atau harga Surplus bila lebih murah. */
export function hitungHarga(data: Pick<DataBeli, "harga" | "hargaGrosir" | "hargaSurplus">, jumlah: number): RincianHarga {
  const urut = urutkanTingkat(data.hargaGrosir);
  const indeks = indeksTingkat(urut, jumlah);
  const tingkat = urut[indeks]?.harga ?? data.harga;
  if (data.hargaSurplus !== null && data.hargaSurplus <= tingkat) {
    return { satuan: data.hargaSurplus, tingkat, sumber: "surplus", indeks };
  }
  return { satuan: tingkat, tingkat, sumber: indeks > 0 ? "grosir" : "dasar", indeks };
}

/** "1–9 kg", "10–49 kg", "≥ 50 kg". */
export function labelRentang(urut: TingkatGrosir[], n: number, satuan: Satuan): string {
  const t = urut[n];
  if (!t) return "";
  const s = LABEL_SATUAN[satuan];
  const berikut = urut[n + 1];
  if (!berikut) return `≥ ${angka(t.minJumlah)} ${s}`;
  const atas = berikut.minJumlah - 1;
  return atas <= t.minJumlah ? `${angka(t.minJumlah)} ${s}` : `${angka(t.minJumlah)}–${angka(atas)} ${s}`;
}

/** Batas input jumlah: minimum pembelian sampai stok tersedia. */
export function batasJumlah(data: Pick<DataBeli, "minPembelian" | "stok">): { min: number; maks: number } {
  const min = Math.max(1, data.minPembelian);
  return { min, maks: Math.max(min, data.stok) };
}

export function hrefMasuk(slug: string): string {
  return `/masuk?lanjut=${encodeURIComponent(`/produk/${slug}`)}`;
}
