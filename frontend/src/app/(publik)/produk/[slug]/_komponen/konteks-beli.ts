"use client";

import { createContext, useContext } from "react";
import type { DataBeli, RincianHarga } from "./harga-produk";

/** State pembelian bersama: kotak beli, tabel grosir, bilah aksi ponsel, dan dialog. */
export type NilaiBeli = {
  data: DataBeli;
  min: number;
  maks: number;
  /** Isi mentah input jumlah (boleh kosong saat sedang diketik). */
  teks: string;
  ubahTeks: (teks: string) => void;
  /** Jumlah yang berlaku (sudah dijepit ke min..maks). */
  jumlah: number;
  ubahJumlah: (jumlah: number) => void;
  /** Samakan isi input dengan jumlah yang berlaku (saat blur). */
  rapikan: () => void;
  /** Pesan bila angka yang diketik di luar batas. */
  peringatan: string | null;
  harga: RincianHarga;
  subtotal: number;
  /** Selisih dengan harga dasar x jumlah (grosir/Surplus). */
  hemat: number;
  /** Stok habis atau di bawah minimum pembelian. */
  tidakTersedia: boolean;
  hrefMasuk: string;
  bukaKeranjang: () => void;
  bukaLangganan: () => void;
};

export const KonteksBeli = createContext<NilaiBeli | null>(null);

export function useBeli(): NilaiBeli {
  const nilai = useContext(KonteksBeli);
  if (!nilai) throw new Error("useBeli() harus dipakai di dalam <PenyediaBeli>.");
  return nilai;
}
