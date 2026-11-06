import { DaftarIsi } from "./daftar-isi";

export const EMAIL_BANTUAN = "halo@pasoktani.id";

export type BagianLegal = { id: string; judul: string; isi: string };

type Props = {
  judul: string;
  diperbarui: string;
  pengantar: string;
  bagian: BagianLegal[];
};

export function HalamanLegal({ judul, diperbarui, pengantar, bagian }: Props) {
  return (
    <>
      <section className="bg-tint px-4 py-14 md:px-30 md:py-18">
        <div className="mx-auto max-w-260">
          <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Dokumen legal</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-brand-900 md:text-[44px] md:leading-tight">
            {judul}
          </h1>
          <p className="mt-3 text-base text-muted">Terakhir diperbarui: {diperbarui}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-260 gap-10 px-4 py-12 md:grid-cols-[220px_minmax(0,1fr)] md:gap-x-25 md:px-0 md:py-16">
        <aside>
          <DaftarIsi item={bagian.map(({ id, judul }) => ({ id, judul }))} />
        </aside>

        <article>
          <p className="text-[17px] leading-relaxed text-ink">{pengantar}</p>

          {bagian.map((b, n) => (
            <section key={b.id} id={b.id} className="mt-10 scroll-mt-8">
              <h2 className="text-[22px] font-bold tracking-tight text-brand-900">
                {n + 1}. {b.judul}
              </h2>
              <p className="mt-3 text-base leading-[1.7] text-[#555]">{b.isi}</p>
            </section>
          ))}

          <p className="mt-12 rounded-2xl bg-tint px-6 py-5 text-[15px] text-ink">
            Ada pertanyaan tentang dokumen ini? Hubungi kami di{" "}
            <a href={`mailto:${EMAIL_BANTUAN}`} className="font-medium underline underline-offset-3">
              {EMAIL_BANTUAN}
            </a>
            .
          </p>
        </article>
      </div>
    </>
  );
}
