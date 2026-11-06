import { IkonBintang } from "@/app/_komponen/ikon";
import { angka, desimal1 } from "@/lib/format";

/** Lima bintang dengan isian sesuai nilai (dibulatkan ke 0,5 terdekat secara visual: bintang penuh bila >= x,5). */
export function Bintang({ nilai, ukuran = 16, className = "" }: { nilai: number; ukuran?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`Rating ${desimal1(nilai)} dari 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IkonBintang
          key={n}
          size={ukuran}
          isi={nilai >= n - 0.5}
          strokeWidth={1.5}
          className={nilai >= n - 0.5 ? "text-[#e5a50a]" : "text-[#cfd6cc]"}
        />
      ))}
    </span>
  );
}

/** "★ 4,8 (64)" ringkas untuk kartu. */
export function RatingRingkas({ nilai, jumlah, className = "" }: { nilai: number; jumlah?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[13px] text-ink ${className}`}>
      <IkonBintang size={14} isi strokeWidth={1.5} className="text-[#e5a50a]" />
      <span className="font-semibold">{desimal1(nilai)}</span>
      {jumlah !== undefined && <span className="text-muted">({angka(jumlah)})</span>}
    </span>
  );
}
