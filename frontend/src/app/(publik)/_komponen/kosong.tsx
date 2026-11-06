import type { ReactNode } from "react";
import { IkonDaun } from "@/app/_komponen/ikon";

/** Keadaan kosong (hasil filter/pencarian kosong, dsb). */
export function KeadaanKosong({ judul, deskripsi, aksi, ikon }: { judul: string; deskripsi?: ReactNode; aksi?: ReactNode; ikon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-tint text-brand-600">{ikon ?? <IkonDaun size={26} />}</span>
      <h2 className="mt-4 text-lg font-semibold text-ink">{judul}</h2>
      {deskripsi && <p className="mt-1.5 max-w-110 text-[15px] leading-relaxed text-muted">{deskripsi}</p>}
      {aksi && <div className="mt-5 flex flex-wrap justify-center gap-3">{aksi}</div>}
    </div>
  );
}
