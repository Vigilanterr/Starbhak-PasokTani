import Link from "next/link";
import { IkonInfo, IkonPanahKanan } from "@/app/_komponen/ikon";
import { JudulBagian } from "@/app/(publik)/_komponen/judul-bagian";
import { ChipLencana } from "@/app/(publik)/_komponen/lencana";
import { LABEL_LENCANA, URUTAN_LENCANA } from "@/lib/label";

/** Penjelasan semua lencana petani (S6). Statis, jadi dirender di luar `<Suspense>`. */
export function LegendaLencana() {
  return (
    <section id="lencana" aria-labelledby="judul-lencana" className="scroll-mt-6 border-t border-line bg-white">
      <div className="mx-auto w-full max-w-300 px-4 py-12 md:px-6 md:py-16">
        <JudulBagian
          id="judul-lencana"
          judul="Tentang lencana petani"
          deskripsi="Lencana membantumu mengenali petani yang tepercaya, cepat membalas, dan rajin memperbarui stok."
        />

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {URUTAN_LENCANA.map((l) => {
            const { label, deskripsi } = LABEL_LENCANA[l];
            return (
              <li key={l} className="flex flex-col gap-2.5 rounded-2xl border border-line bg-cream p-5">
                <div>
                  <ChipLencana lencana={l} />
                </div>
                <p className="text-[15px] leading-relaxed text-ink">{deskripsi}</p>
                <Link
                  href={`/petani?lencana=${l}`}
                  className="mt-auto inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-brand-600 no-underline hover:text-brand-900"
                >
                  Lihat petani<span className="sr-only"> dengan lencana {label}</span>
                  <IkonPanahKanan size={16} />
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 flex items-start gap-3 rounded-2xl bg-tint px-5 py-4 text-[15px] leading-relaxed text-ink">
          <IkonInfo size={20} className="mt-0.5 shrink-0 text-brand-600" />
          <span>
            Lencana dievaluasi otomatis setiap bulan berdasarkan kinerja toko. Lencana bisa dicabut bila kinerjanya
            menurun atau terjadi pelanggaran, jadi lencana yang tampil selalu mencerminkan kondisi terbaru.
          </span>
        </p>
      </div>
    </section>
  );
}
