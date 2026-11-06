import Link from "next/link";
import type { PetaniTampil } from "@/lib/api/tipe";
import { angka, jarak } from "@/lib/format";
import { IkonLokasi } from "@/app/_komponen/ikon";
import { RatingRingkas } from "./bintang";
import { DaftarLencana } from "./lencana";

/** Inisial untuk avatar (data tiruan belum punya foto profil). */
export function inisial(nama: string): string {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase())
    .join("");
}

export function AvatarPetani({ nama, ukuran = "md" }: { nama: string; ukuran?: "sm" | "md" | "lg" }) {
  const kelas = { sm: "size-10 text-sm", md: "size-14 text-lg", lg: "size-20 text-2xl md:size-24 md:text-3xl" }[ukuran];
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full bg-brand-900 font-bold text-mint ${kelas}`}>
      {inisial(nama)}
    </span>
  );
}

export function KartuPetani({ petani: p }: { petani: PetaniTampil }) {
  return (
    <article className="group relative flex h-full flex-col gap-4 rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-[0_6px_24px_rgba(6,78,59,0.08)]">
      <div className="flex items-start gap-3.5">
        <AvatarPetani nama={p.namaToko} />
        <div className="min-w-0">
          <h3 className="text-base leading-snug font-semibold text-ink">
            <Link href={`/petani/${p.id}`} className="no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-brand-900">
              {p.namaToko}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
            <IkonLokasi size={13} className="shrink-0" />
            <span className="truncate">
              {p.kecamatan}, {p.labelWilayah.replace("Kabupaten ", "Kab. ")}
              {p.jarakKm !== null && ` · ${jarak(p.jarakKm)}`}
            </span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            <RatingRingkas nilai={p.rating} jumlah={p.jumlahUlasan} />
            <span>{angka(p.jumlahTransaksi)} transaksi</span>
          </div>
        </div>
      </div>
      <DaftarLencana lencana={p.lencana} maks={3} />
      <p className="mt-auto line-clamp-1 text-[13px] text-muted">
        <span className="font-medium text-ink">Komoditas:</span> {p.komoditas.join(", ")}
      </p>
    </article>
  );
}
