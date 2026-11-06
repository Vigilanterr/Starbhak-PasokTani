"use client";

import type { UrutanProduk } from "@/lib/api/tipe";
import { LABEL_URUTAN } from "@/lib/label";
import { IkonPanahBawah } from "@/app/_komponen/ikon";
import { IkonUrut } from "./ikon";

const SEMUA_URUTAN = Object.keys(LABEL_URUTAN) as UrutanProduk[];

type Props = {
  /** `id` form filter. Select ini ikut terkirim bersama form itu (atribut `form`) walau letaknya di luar. */
  form: string;
  nilai: UrutanProduk;
  /** Tampilkan "Paling relevan" (hanya di halaman pencarian). */
  relevan?: boolean;
};

/**
 * Kontrol urutan yang langsung menerapkan pilihan. Tanpa JS, pilihan ikut terkirim saat
 * tombol "Terapkan" di panel filter ditekan. Pasang `key` dari query string agar nilainya
 * ikut berganti setelah navigasi (select tak terkendali hanya membaca `defaultValue` saat mount).
 */
export function PilihUrutan({ form, nilai, relevan = false }: Props) {
  const opsi = SEMUA_URUTAN.filter((u) => relevan || u !== "relevan");
  return (
    <div className="flex items-center gap-2.5">
      <label htmlFor="urutan-produk" className="sr-only whitespace-nowrap lg:not-sr-only lg:text-sm lg:text-muted">
        Urutkan
      </label>
      <div className="relative w-full lg:w-52">
        <IkonUrut size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-900" />
        <select
          id="urutan-produk"
          name="urut"
          form={form}
          defaultValue={nilai}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="h-11 w-full cursor-pointer appearance-none truncate rounded-[10px] border border-line bg-white pr-8 pl-9 text-base font-semibold text-ink hover:border-brand-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 lg:text-sm"
        >
          {opsi.map((u) => (
            <option key={u} value={u}>
              {LABEL_URUTAN[u]}
            </option>
          ))}
        </select>
        <IkonPanahBawah size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
      </div>
    </div>
  );
}
