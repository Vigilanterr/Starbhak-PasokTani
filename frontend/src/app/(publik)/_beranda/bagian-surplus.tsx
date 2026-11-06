import Link from "next/link";
import type { ProdukTampil } from "@/lib/api/tipe";
import { IkonApi, IkonPanahKanan } from "@/app/_komponen/ikon";
import { KartuProduk } from "../_komponen/kartu-produk";
import { BERANDA } from "./data-beranda";
import { KONTAINER } from "./kelas";
import { ItemRel, Rel } from "./rel";

/** Pita Surplus (S7): penjelasan diskon bertingkat + rel produk Surplus dengan diskon terbesar. */
export function BagianSurplus({ produk }: { produk: ProdukTampil[] }) {
  return (
    <section aria-labelledby="judul-surplus" className="mt-14 border-y border-[#fbd9c0] bg-[#fff5ed] py-10 md:mt-20 md:py-14">
      <div className={KONTAINER}>
        <div className="mb-6 flex flex-col gap-6 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-150">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-[#c2410c] px-3 py-1 text-xs font-bold text-white">
              <IkonApi size={14} />
              Surplus
            </p>
            <h2 id="judul-surplus" className="mt-3 text-[22px] font-bold tracking-tight text-brand-900 md:text-2xl">
              Hemat sambil mengurangi sisa panen
            </h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
              Stok yang mendekati tanggal kedaluwarsa mendapat diskon bertingkat dari petani. Kamu hemat, hasil panen
              tidak terbuang, dan petani tetap punya harga minimum agar tidak rugi.
            </p>
            <Link
              href="/surplus"
              className="mt-3 inline-flex items-center gap-1 text-[15px] font-semibold text-[#9a3412] no-underline hover:text-brand-900"
            >
              Lihat semua Surplus
              <IkonPanahKanan size={16} />
            </Link>
          </div>

          <div className="rounded-2xl border border-[#fbd9c0] bg-white p-4 lg:w-95 lg:shrink-0">
            <p id="label-contoh-surplus" className="text-[13px] font-semibold text-ink">
              Contoh diskon bertingkat <span className="font-normal text-muted">(diatur oleh petani)</span>
            </p>
            <ol aria-labelledby="label-contoh-surplus" className="mt-3 grid grid-cols-3 gap-2">
              {BERANDA.contohSurplus.map((t) => (
                <li key={t.sisaHari} className="rounded-xl bg-[#fff5ed] px-2 py-2.5 text-center">
                  <span className="block text-lg font-bold text-[#c2410c]">−{t.diskonPersen}%</span>
                  <span className="block text-xs text-muted">sisa ≤ {t.sisaHari} hari</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {produk.length > 0 ? (
          <Rel>
            {produk.map((p, i) => (
              <ItemRel key={p.id} indeks={i}>
                <KartuProduk produk={p} />
              </ItemRel>
            ))}
          </Rel>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#fbd9c0] bg-white px-5 py-6 text-center text-[15px] text-muted">
            Belum ada produk Surplus saat ini. Langganan produk favoritmu agar dapat kabar begitu produknya masuk
            Surplus.
          </p>
        )}
      </div>
    </section>
  );
}
