import Link from "next/link";
import type { PetaniTampil, RingkasPetani } from "@/lib/api/tipe";
import { angka, durasiMenit } from "@/lib/format";
import { IkonLokasi } from "@/app/_komponen/ikon";
import { RatingRingkas } from "@/app/(publik)/_komponen/bintang";
import { AvatarPetani } from "@/app/(publik)/_komponen/kartu-petani";
import { DaftarLencana } from "@/app/(publik)/_komponen/lencana";
import { wilayahRingkas } from "./data";

/** Kartu "Tentang petani" di detail daftar tunggu. `detail` null = hanya data ringkas yang tersedia. */
export function KartuPetaniDaftar({ ringkas: r, detail }: { ringkas: RingkasPetani; detail: PetaniTampil | null }) {
  const href = `/petani/${r.id}`;
  return (
    <section aria-labelledby="judul-petani" className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <h2 id="judul-petani" className="text-[22px] font-bold tracking-tight text-brand-900 md:text-2xl">
        Tentang petani
      </h2>
      <div className="mt-4 flex items-start gap-3.5">
        <AvatarPetani nama={r.namaToko} />
        <div className="min-w-0">
          <p className="text-base leading-snug font-semibold text-ink">
            <Link href={href} className="no-underline hover:text-brand-900 hover:underline">
              {r.namaToko}
            </Link>
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
            <IkonLokasi size={13} className="shrink-0" />
            <span className="truncate">
              {detail ? `${detail.nama} · ` : ""}
              {r.kecamatan}, {wilayahRingkas(r.labelWilayah)}
            </span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            <RatingRingkas nilai={r.rating} jumlah={detail?.jumlahUlasan} />
            {detail && <span>{angka(detail.jumlahTransaksi)} transaksi</span>}
            {detail && <span>Balas ± {durasiMenit(detail.responMenit)}</span>}
          </div>
        </div>
      </div>
      {r.lencana.length > 0 && (
        <div className="mt-4">
          <DaftarLencana lencana={r.lencana} />
        </div>
      )}
      {detail?.deskripsi && <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-muted">{detail.deskripsi}</p>}
      <Link
        href={href}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-[10px] border-[1.5px] border-brand-900 bg-white px-5 text-[15px] font-semibold text-brand-900 no-underline hover:bg-tint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
      >
        Lihat profil petani
      </Link>
    </section>
  );
}
