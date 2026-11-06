import type { RingkasanUlasan } from "@/lib/api/katalog";
import type { ProdukTampil, Ulasan } from "@/lib/api/tipe";
import { angka, desimal1 } from "@/lib/format";
import { IkonBintang, IkonInfo } from "@/app/_komponen/ikon";
import { Bintang } from "@/app/(publik)/_komponen/bintang";
import { DaftarUlasan } from "./daftar-ulasan";

type Props = {
  produk: Pick<ProdukTampil, "rating" | "jumlahUlasan">;
  ulasan: Ulasan[];
  ringkasan: RingkasanUlasan;
  namaToko: string;
};

/** Ringkasan rating, sebaran bintang, dan daftar ulasan pembeli (S3). */
export function BagianUlasan({ produk, ulasan, ringkasan, namaToko }: Props) {
  const kosong = produk.jumlahUlasan === 0 && ulasan.length === 0;
  const sampel = ringkasan.total;

  return (
    <section id="ulasan" aria-labelledby="judul-ulasan" className="scroll-mt-6">
      <h2 id="judul-ulasan" className="text-[22px] font-bold tracking-tight text-brand-900 md:text-2xl">
        Ulasan pembeli
      </h2>
      <p className="mt-1.5 flex items-start gap-2 text-sm text-muted">
        <IkonInfo size={16} className="mt-0.5 shrink-0" />
        Hanya pembeli yang sudah menerima pesanan yang bisa memberi ulasan.
      </p>

      {kosong ? (
        <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-tint text-brand-600">
            <IkonBintang size={26} />
          </span>
          <p className="mt-4 text-lg font-semibold text-ink">Belum ada ulasan</p>
          <p className="mt-1.5 max-w-110 text-[15px] leading-relaxed text-muted">
            Produk ini belum diulas. Setelah pesananmu diterima, kamu bisa memberi bintang, komentar, dan foto.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-6 rounded-2xl border border-line bg-white p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-10 md:p-6">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <p className="text-5xl leading-none font-bold tracking-tight text-brand-900">
                {desimal1(produk.rating)}
                <span className="text-lg font-semibold text-muted">/5</span>
              </p>
              <Bintang nilai={produk.rating} ukuran={20} className="mt-2.5" />
              <p className="mt-2 text-sm text-muted">
                {angka(produk.jumlahUlasan)} ulasan
                {ringkasan.denganFoto > 0 && <> · {angka(ringkasan.denganFoto)} dengan foto</>}
              </p>
            </div>

            {sampel > 0 && (
              <div>
                <ul aria-label="Sebaran bintang" className="flex flex-col gap-2">
                  {[5, 4, 3, 2, 1].map((b) => {
                    const jumlah = ringkasan.sebaran[b - 1] ?? 0;
                    const persen = Math.round((jumlah / sampel) * 100);
                    return (
                      <li key={b} className="flex items-center gap-3 text-sm">
                        <span className="w-18 shrink-0 whitespace-nowrap text-ink">{b} bintang</span>
                        <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-tint">
                          <span className="block h-full rounded-full bg-[#e5a50a]" style={{ width: `${persen}%` }} />
                        </span>
                        <span className="w-8 shrink-0 text-right text-muted">
                          {angka(jumlah)}
                          <span className="sr-only"> ulasan</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {sampel < produk.jumlahUlasan && (
                  <p className="mt-3 text-xs text-muted">Sebaran dihitung dari {angka(sampel)} ulasan terbaru.</p>
                )}
              </div>
            )}
          </div>

          <DaftarUlasan ulasan={ulasan} namaToko={namaToko} />
        </>
      )}
    </section>
  );
}
