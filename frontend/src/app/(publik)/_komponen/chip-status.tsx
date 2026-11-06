import type { StatusDaftarTunggu } from "@/lib/api/tipe";
import { LABEL_STATUS_DAFTAR_TUNGGU } from "@/lib/label";

const NADA = {
  netral: "bg-[#eef1ec] text-ink",
  hijau: "bg-mint text-brand-900",
  kuning: "bg-[#fef3c7] text-[#92400e]",
  merah: "bg-danger-bg text-danger-ink",
  biru: "bg-[#e0f2fe] text-[#075985]",
} as const;

export function ChipStatus({ status, className = "" }: { status: StatusDaftarTunggu; className?: string }) {
  const { label, nada } = LABEL_STATUS_DAFTAR_TUNGGU[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${NADA[nada]} ${className}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
