import type { ReactNode } from "react";

/** Judul bagian landing (label kecil + h2 + deskripsi) untuk #fitur, #tentang, #testimoni. */
export function KepalaBagian({
  id,
  label,
  judul,
  deskripsi,
}: {
  id: string;
  label: string;
  judul: string;
  deskripsi?: ReactNode;
}) {
  return (
    <div className="max-w-170">
      <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">{label}</p>
      <h2 id={id} className="mt-3 text-[26px] leading-tight font-bold tracking-tight text-brand-900 md:text-[34px]">
        {judul}
      </h2>
      {deskripsi && <p className="mt-3 text-base leading-relaxed text-muted md:text-[17px]">{deskripsi}</p>}
    </div>
  );
}
