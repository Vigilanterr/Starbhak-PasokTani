import Link from "next/link";
import type { ReactNode } from "react";
import type { PetaniTampil } from "@/lib/api/tipe";
import { angka, desimal1, durasiMenit, tanggalPanjang } from "@/lib/format";
import { IkonBintang, IkonJam, IkonKalender, IkonLokasi, IkonObrolan } from "@/app/_komponen/ikon";
import { AvatarPetani } from "@/app/(publik)/_komponen/kartu-petani";
import { DaftarLencana } from "@/app/(publik)/_komponen/lencana";

const kelasTautan =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] px-4 text-[15px] font-semibold no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45";

function Statistik({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-cream px-3 py-2.5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-semibold text-ink">{children}</dd>
    </div>
  );
}

/** Ringkasan petani penjual: lencana, rating, transaksi, waktu balas, jam operasional, libur (S3, S6, S10). */
export function KartuPetaniProduk({ petani: p }: { petani: PetaniTampil }) {
  // TODO: sambungkan ke obrolan dengan petani ini setelah sesi tersedia.
  const hrefChat = `/masuk?lanjut=${encodeURIComponent("/obrolan")}`;

  return (
    <section aria-labelledby="judul-petani" className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <h2 id="judul-petani" className="text-xs font-bold tracking-wider text-brand-900 uppercase">
        Dijual oleh
      </h2>

      <div className="mt-4 flex items-start gap-4">
        <AvatarPetani nama={p.namaToko} />
        <div className="min-w-0">
          <h3 className="text-lg leading-snug font-semibold text-ink">
            <Link href={`/petani/${p.id}`} className="no-underline hover:text-brand-900 hover:underline">
              {p.namaToko}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted">Dikelola oleh {p.nama}</p>
          <p className="mt-1 flex items-start gap-1 text-[13px] text-muted">
            <IkonLokasi size={14} className="mt-px shrink-0" />
            {p.kecamatan}, {p.labelWilayah}
          </p>
        </div>
      </div>

      {p.lencana.length > 0 && (
        <div className="mt-4">
          <DaftarLencana lencana={p.lencana} />
        </div>
      )}

      <dl className="mt-5 grid grid-cols-3 gap-2">
        <Statistik label="Rating">
          <span className="inline-flex items-center gap-1">
            <IkonBintang size={14} isi strokeWidth={1.5} className="text-[#e5a50a]" />
            {desimal1(p.rating)}
            <span className="sr-only">dari 5, {angka(p.jumlahUlasan)} ulasan</span>
          </span>
        </Statistik>
        <Statistik label="Transaksi">{angka(p.jumlahTransaksi)}</Statistik>
        <Statistik label="Waktu balas">± {durasiMenit(p.responMenit)}</Statistik>
      </dl>

      <p className="mt-3 flex items-start gap-2 text-sm text-ink">
        <IkonJam size={16} className="mt-0.5 shrink-0 text-brand-600" />
        <span>
          <span className="text-muted">Jam operasional:</span> {p.jamOperasional}
        </span>
      </p>

      {p.libur && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#fef3c7] px-4 py-3 text-sm font-medium text-[#92400e]">
          <IkonKalender size={16} className="mt-0.5 shrink-0" />
          Toko libur pada {tanggalPanjang(p.libur)}.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Link href={`/petani/${p.id}`} className={`${kelasTautan} border-[1.5px] border-brand-900 bg-white text-brand-900 hover:bg-tint`}>
          Lihat profil
        </Link>
        <Link href={hrefChat} className={`${kelasTautan} bg-tint text-brand-900 hover:bg-mint`}>
          <IkonObrolan size={18} />
          Chat petani
        </Link>
      </div>
    </section>
  );
}
