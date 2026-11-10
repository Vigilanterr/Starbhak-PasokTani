import type { ReactNode } from "react";
import { RemahRoti, type ItemRemahRoti } from "../../_komponen/remah-roti";

type Props = {
  remah: ItemRemahRoti[];
  /** Label kecil di atas judul (eyebrow). */
  label?: string;
  judul: string;
  deskripsi?: ReactNode;
  /** Ikon/ilustrasi di kiri judul. */
  ikon?: ReactNode;
  /** Kolom kanan di desktop (mis. tabel contoh diskon Surplus). */
  samping?: ReactNode;
  /** Konten tambahan di bawah deskripsi (kotak cari, rel kategori, ...). */
  children?: ReactNode;
};

/** Hero statis halaman katalog (di luar `<Suspense>`): remah roti, judul (h1), deskripsi. */
export function HeroKatalog({ remah, label, judul, deskripsi, ikon, samping, children }: Props) {
  return (
    <section className="bg-tint">
      <div className="mx-auto w-full max-w-300 px-4 pt-5 pb-8 md:px-6 md:pt-6 md:pb-10">
        <RemahRoti item={remah} />
        <div
          className={`mt-5 md:mt-7 ${samping ? "lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-12" : ""}`}
        >
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              {ikon}
              <div className="min-w-0">
                {label && <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">{label}</p>}
                <h1
                  className={`${label ? "mt-2" : ""} text-[28px] leading-tight font-bold tracking-tight text-brand-900 md:text-4xl`}
                >
                  {judul}
                </h1>
              </div>
            </div>
            {deskripsi && <p className="mt-3 max-w-170 text-[15px] leading-relaxed text-muted md:text-base">{deskripsi}</p>}
            {children}
          </div>
          {samping && <div className="mt-6 lg:mt-0">{samping}</div>}
        </div>
      </div>
    </section>
  );
}
