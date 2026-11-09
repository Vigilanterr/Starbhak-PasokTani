import type { SVGProps } from "react";
import { inisial } from "../_komponen/kartu-petani";
import { BERANDA, type Testimoni } from "./data-beranda";
import { KepalaBagian } from "./kepala-bagian";
import { KONTAINER } from "./kelas";

const WARNA_AVATAR: Record<Testimoni["jenis"], string> = {
  konsumen: "bg-mint text-brand-900",
  umkm: "bg-[#fde9d9] text-[#9a3412]",
  petani: "bg-brand-900 text-mint",
};

function IkonKutip(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M9.6 5C6.3 6.4 4 9.4 4 13.2V19h6v-6H7c0-2.3 1.3-4.2 3.4-5.2zm10 0c-3.3 1.4-5.6 4.4-5.6 8.2V19h6v-6h-3c0-2.3 1.3-4.2 3.4-5.2z" />
    </svg>
  );
}

/**
 * `#testimoni`.
 * TODO: testimoni di `konten-beranda.ts` masih CONTOH (`contoh: true`); ganti dengan ulasan asli pengguna
 * (mis. dari API ulasan terpilih) sebelum peluncuran.
 */
export function BagianTestimoni() {
  return (
    <section id="testimoni" aria-labelledby="judul-testimoni" className={`${KONTAINER} scroll-mt-4 pb-14 md:pb-20`}>
      <KepalaBagian id="judul-testimoni" label="Testimoni" judul="Cerita dari pengguna Pasok Tani" />
      <ul className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
        {BERANDA.testimoni.map((t) => (
          <li key={t.id}>
            <figure className="flex h-full flex-col rounded-2xl border border-line bg-white p-6">
              <IkonKutip className="text-accent/40" />
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink">
                <p>{t.kutipan}</p>
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span
                  aria-hidden
                  className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${WARNA_AVATAR[t.jenis]}`}
                >
                  {inisial(t.nama)}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-ink">{t.nama}</span>
                  <span className="block text-[13px] text-muted">
                    {t.peran}, {t.wilayah}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
