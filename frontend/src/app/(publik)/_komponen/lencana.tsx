import type { ComponentType, SVGProps } from "react";
import type { Lencana } from "@/lib/api/tipe";
import { LABEL_LENCANA, URUTAN_LENCANA } from "@/lib/label";
import { IkonApi, IkonBintang, IkonJam, IkonKamera, IkonLencanaCentang, IkonPetir, IkonTunas } from "@/app/_komponen/ikon";

type Ikon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const GAYA: Record<Lencana, { ikon: Ikon; kelas: string }> = {
  terverifikasi: { ikon: IkonLencanaCentang, kelas: "bg-[#e0f2fe] text-[#075985]" },
  "petani-andalan": { ikon: IkonBintang, kelas: "bg-[#fef3c7] text-[#92400e]" },
  "respons-cepat": { ikon: IkonPetir, kelas: "bg-[#ede9fe] text-[#5b21b6]" },
  "stok-selalu-baru": { ikon: IkonKamera, kelas: "bg-mint text-brand-900" },
  "panen-tepat-waktu": { ikon: IkonJam, kelas: "bg-[#dcfce7] text-[#166534]" },
  "pahlawan-surplus": { ikon: IkonApi, kelas: "bg-[#ffedd5] text-[#9a3412]" },
  "petani-baru": { ikon: IkonTunas, kelas: "bg-tint text-ink" },
};

export function urutkanLencana(daftar: Lencana[]): Lencana[] {
  return [...daftar].sort((a, b) => URUTAN_LENCANA.indexOf(a) - URUTAN_LENCANA.indexOf(b));
}

/** Satu chip lencana. `ringkas` = hanya ikon (label tetap terbaca pembaca layar dan tooltip). */
export function ChipLencana({ lencana, ringkas = false }: { lencana: Lencana; ringkas?: boolean }) {
  const { ikon: Ikon, kelas } = GAYA[lencana];
  const { label, deskripsi } = LABEL_LENCANA[lencana];
  if (ringkas) {
    return (
      <span title={label} className={`grid size-6 place-items-center rounded-full ${kelas}`}>
        <Ikon size={13} aria-hidden />
        <span className="sr-only">{label}</span>
      </span>
    );
  }
  return (
    <span title={deskripsi} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${kelas}`}>
      <Ikon size={13} aria-hidden />
      {label}
    </span>
  );
}

/** Deretan lencana; `maks` membatasi jumlah yang tampil (sisanya "+n"). */
export function DaftarLencana({ lencana, maks, ringkas = false }: { lencana: Lencana[]; maks?: number; ringkas?: boolean }) {
  const urut = urutkanLencana(lencana);
  const tampil = maks ? urut.slice(0, maks) : urut;
  const sisa = urut.length - tampil.length;
  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label="Lencana petani">
      {tampil.map((l) => (
        <li key={l}>
          <ChipLencana lencana={l} ringkas={ringkas} />
        </li>
      ))}
      {sisa > 0 && <li className="text-xs font-semibold text-muted">+{sisa}</li>}
    </ul>
  );
}
