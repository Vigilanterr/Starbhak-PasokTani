import Link from "next/link";
import { IkonDaun, IkonLonceng, IkonPanahKanan, IkonPerisai } from "@/app/_komponen/ikon";

const LANGKAH = [
  {
    ikon: IkonLonceng,
    judul: "Ikuti",
    isi: "Dapat kabar saat status, jadwal panen, atau foto lahan diperbarui petani.",
  },
  {
    ikon: IkonPerisai,
    judul: "Komitmen",
    isi: "Pilih rentang jumlah. Hanya dana untuk jumlah minimum yang ditahan aman di escrow.",
  },
  {
    ikon: IkonDaun,
    judul: "Prioritas saat panen",
    isi: "Pemegang Komitmen dapat stok lebih dulu. Sisanya dilunasi dalam 48 jam setelah panen.",
  },
];

/** Hero statis halaman `/daftar-tunggu`: apa itu Daftar Tunggu dan Komitmen dalam tiga langkah. */
export function HeroDaftarTunggu() {
  return (
    <section className="bg-tint">
      <div className="mx-auto w-full max-w-300 px-4 pt-8 pb-9 md:px-6 md:pt-14 md:pb-14">
        <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Sebelum panen</p>
        <h1 className="mt-3 text-[32px] leading-tight font-bold tracking-tight text-brand-900 md:text-[44px]">
          Daftar Tunggu
        </h1>
        <p className="mt-3 max-w-160 text-base leading-relaxed text-muted md:text-[17px]">
          Pantau komoditas yang belum dipanen langsung dari lahan petani Jawa Barat, lalu amankan bagianmu sebelum
          panen tiba.
        </p>

        <ol aria-label="Cara kerja Daftar Tunggu" className="mt-6 grid grid-cols-1 gap-3 md:mt-8 md:grid-cols-3 md:gap-4">
          {LANGKAH.map(({ ikon: Ikon, judul, isi }, i) => (
            <li key={judul} className="flex gap-3.5 rounded-2xl border border-line bg-white p-4 md:flex-col md:p-5">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-mint text-brand-900">
                <Ikon size={20} />
                <span
                  aria-hidden
                  className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-brand-900 text-[11px] font-bold text-white"
                >
                  {i + 1}
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold text-ink">
                  <span className="sr-only">Langkah {i + 1}: </span>
                  {judul}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{isi}</p>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href="/bantuan"
          className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-brand-600 no-underline hover:text-brand-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
        >
          Pelajari aturan Komitmen di Pusat Bantuan
          <IkonPanahKanan size={16} />
        </Link>
      </div>
    </section>
  );
}
