"use client";

import { useId, type ChangeEvent, type ReactNode } from "react";

type Props = {
  jenis: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  /** Dipanggil dengan status `checked` baru (radio hanya memanggil saat terpilih). */
  onUbah: (checked: boolean) => void;
  judul: string;
  deskripsi?: string;
  /** Elemen kecil di samping judul, mis. chip "Bawaan". */
  tambahan?: ReactNode;
};

/** Pilihan radio/checkbox berbentuk kartu (seluruh kartu bisa diklik, target sentuh besar). */
export function KartuPilihan({ jenis, name, value, checked, onUbah, judul, deskripsi, tambahan }: Props) {
  const id = useId();
  const idDeskripsi = `${id}-deskripsi`;
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
        checked ? "border-brand-900 bg-tint" : "border-line bg-white hover:border-brand-600"
      }`}
    >
      <input
        id={id}
        type={jenis}
        name={name}
        value={value}
        checked={checked}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onUbah(e.target.checked)}
        aria-describedby={deskripsi ? idDeskripsi : undefined}
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brand-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
      />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] leading-snug font-semibold text-ink">
          {judul}
          {tambahan}
        </span>
        {deskripsi && (
          <span id={idDeskripsi} className="mt-0.5 block text-[13px] leading-snug text-muted">
            {deskripsi}
          </span>
        )}
      </span>
    </label>
  );
}
