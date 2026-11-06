import type { ReactNode } from "react";

export type NadaCatatan = "netral" | "hijau" | "kuning" | "biru" | "merah";

const GAYA: Record<NadaCatatan, { kotak: string; ikon: string }> = {
  netral: { kotak: "border-line bg-tint text-ink", ikon: "text-brand-900" },
  hijau: { kotak: "border-[#bbe5c7] bg-[#effaf1] text-brand-900", ikon: "text-brand-600" },
  kuning: { kotak: "border-[#f5d58a] bg-[#fffaeb] text-[#713f12]", ikon: "text-[#b45309]" },
  biru: { kotak: "border-[#bae6fd] bg-[#f0f9ff] text-[#0c4a6e]", ikon: "text-[#0369a1]" },
  merah: { kotak: "border-danger-line bg-danger-bg text-danger-ink", ikon: "text-danger" },
};

/** Kotak keterangan berwarna (peringatan jadwal, status cabang, alasan). */
export function Catatan({
  nada,
  judul,
  ikon,
  children,
  className = "",
}: {
  nada: NadaCatatan;
  judul?: string;
  ikon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const g = GAYA[nada];
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${g.kotak} ${className}`}>
      {ikon && <span className={`mt-0.5 shrink-0 ${g.ikon}`}>{ikon}</span>}
      <div className="min-w-0">
        {judul && <p className="font-semibold">{judul}</p>}
        {children && <div className={judul ? "mt-0.5" : ""}>{children}</div>}
      </div>
    </div>
  );
}
