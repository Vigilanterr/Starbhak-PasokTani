import Link from "next/link";
import type { ReactNode } from "react";
import { IkonPanahKanan } from "@/app/_komponen/ikon";

/** Judul bagian + tautan "Lihat semua" opsional. */
export function JudulBagian({
  judul,
  deskripsi,
  href,
  labelTautan = "Lihat semua",
  id,
  ikon,
}: {
  judul: string;
  deskripsi?: ReactNode;
  href?: string;
  labelTautan?: string;
  id?: string;
  ikon?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
      <div>
        <h2 id={id} className="flex items-center gap-2 text-[22px] font-bold tracking-tight text-brand-900 md:text-2xl">
          {ikon}
          {judul}
        </h2>
        {deskripsi && <p className="mt-1 text-[15px] text-muted">{deskripsi}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-[15px] font-semibold text-brand-600 no-underline hover:text-brand-900"
        >
          {labelTautan}
          <IkonPanahKanan size={16} />
        </Link>
      )}
    </div>
  );
}
