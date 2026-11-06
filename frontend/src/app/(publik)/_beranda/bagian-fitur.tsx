import type { ComponentType, SVGProps } from "react";
import {
  IkonApi,
  IkonKamera,
  IkonKeranjang,
  IkonLabel,
  IkonLencanaCentang,
  IkonLonceng,
  IkonPerisai,
  IkonTunas,
} from "@/app/_komponen/ikon";
import { BERANDA, type KunciIkonFitur } from "./data-beranda";
import { KepalaBagian } from "./kepala-bagian";
import { KONTAINER } from "./kelas";

type Ikon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const IKON_FITUR: Record<KunciIkonFitur, Ikon> = {
  kamera: IkonKamera,
  lonceng: IkonLonceng,
  tunas: IkonTunas,
  keranjang: IkonKeranjang,
  lencana: IkonLencanaCentang,
  api: IkonApi,
  label: IkonLabel,
  perisai: IkonPerisai,
};

/** `#fitur`: inovasi utama Pasok Tani (S2 dan fitur MVP). */
export function BagianFitur() {
  return (
    <section id="fitur" aria-labelledby="judul-fitur" className="mt-16 scroll-mt-4 bg-tint py-14 md:mt-24 md:py-20">
      <div className={KONTAINER}>
        <KepalaBagian
          id="judul-fitur"
          label="Fitur"
          judul="Belanja hasil tani dengan lebih pasti"
          deskripsi="Kesegaran, harga, dan jadwal panen terlihat jelas sebelum kamu membeli. Pembayaranmu juga terlindungi sampai pesanan tiba."
        />
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:mt-10 lg:grid-cols-4 lg:gap-5">
          {BERANDA.fitur.map((f) => {
            const Ikon = IKON_FITUR[f.ikon];
            return (
              <li
                key={f.judul}
                className="flex gap-4 rounded-2xl border border-line bg-white p-4 sm:flex-col sm:gap-0 sm:p-5"
              >
                <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-mint text-brand-900">
                  <Ikon size={20} />
                </span>
                <div className="sm:mt-4">
                  <h3 className="text-base font-semibold text-ink">{f.judul}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{f.deskripsi}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
