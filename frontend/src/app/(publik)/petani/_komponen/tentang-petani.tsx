import Link from "next/link";
import { IkonCari } from "@/app/_komponen/ikon";
import { ChipLencana, urutkanLencana } from "@/app/(publik)/_komponen/lencana";
import type { PetaniTampil } from "@/lib/api/tipe";
import { LABEL_LENCANA } from "@/lib/label";
import { KartuLokasi } from "./kartu-lokasi";

const kelasKartu = "rounded-2xl border border-line bg-white p-5 md:p-6";

/** Bagian "Tentang toko": cerita + komoditas, lokasi lahan, dan rincian lencana. */
export function TentangPetani({ petani: p }: { petani: PetaniTampil }) {
  const lencana = urutkanLencana(p.lencana);
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      <article className={kelasKartu}>
        <h3 className="text-lg font-semibold text-ink">Cerita kebun</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">{p.deskripsi}</p>
        <p className="mt-3 text-sm text-muted">
          Dikelola oleh <span className="font-medium text-ink">{p.nama}</span>
        </p>

        <h4 className="mt-5 text-sm font-semibold text-ink">Komoditas utama</h4>
        <ul className="mt-2 flex flex-wrap gap-2">
          {p.komoditas.map((k) => (
            <li key={k}>
              <Link
                href={`/cari?q=${encodeURIComponent(k)}`}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-cream px-4 text-sm font-medium text-ink no-underline hover:border-brand-600 hover:text-brand-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
              >
                <IkonCari size={14} className="text-muted" />
                <span className="sr-only">Cari </span>
                {k}
              </Link>
            </li>
          ))}
        </ul>
      </article>

      <KartuLokasi lokasi={p.lokasi} kecamatan={p.kecamatan} labelWilayah={p.labelWilayah} />

      <article className={`${kelasKartu} md:col-span-2 lg:col-span-1`}>
        <h3 className="text-lg font-semibold text-ink">Lencana toko</h3>
        {lencana.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-4">
            {lencana.map((l) => (
              <li key={l}>
                <ChipLencana lencana={l} />
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{LABEL_LENCANA[l].deskripsi}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[15px] text-muted">Toko ini belum memiliki lencana.</p>
        )}
        <p className="mt-5 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
          Lencana dievaluasi otomatis setiap bulan dan bisa dicabut bila kinerja toko menurun.{" "}
          <Link href="/petani#lencana" className="font-semibold text-brand-600 underline-offset-3 hover:text-brand-900 hover:underline">
            Pelajari semua lencana
          </Link>
        </p>
      </article>
    </div>
  );
}
