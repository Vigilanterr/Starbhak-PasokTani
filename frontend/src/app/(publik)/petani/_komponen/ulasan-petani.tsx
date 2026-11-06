import Link from "next/link";
import { IkonBintang, IkonKamera } from "@/app/_komponen/ikon";
import { Bintang } from "@/app/(publik)/_komponen/bintang";
import { inisial } from "@/app/(publik)/_komponen/kartu-petani";
import type { RingkasanUlasan } from "@/lib/api/katalog";
import type { Ulasan } from "@/lib/api/tipe";
import { angka, desimal1, tanggal } from "@/lib/format";

type ItemUlasan = Ulasan & { namaProduk: string; slugProduk: string };

const LABEL_PERAN: Record<Ulasan["peran"], string> = { konsumen: "Konsumen", umkm: "UMKM" };

function Ringkasan({ rating, jumlahUlasan, ringkasan }: { rating: number; jumlahUlasan: number; ringkasan: RingkasanUlasan }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <p className="flex items-end gap-1.5" aria-hidden>
        <span className="text-[44px] leading-none font-bold tracking-tight text-brand-900">{desimal1(rating)}</span>
        <span className="pb-1 text-[15px] text-muted">/ 5</span>
      </p>
      <Bintang nilai={rating} ukuran={18} className="mt-2.5" />
      <p className="mt-1.5 text-sm text-muted">dari {angka(jumlahUlasan)} ulasan</p>

      {ringkasan.total > 0 && (
        <ul aria-label="Sebaran rating" className="mt-5 flex flex-col gap-2">
          {([5, 4, 3, 2, 1] as const).map((b) => {
            const n = ringkasan.sebaran[b - 1] ?? 0;
            const persen = Math.round((n / ringkasan.total) * 100);
            return (
              <li key={b} className="flex items-center gap-2.5 text-[13px]">
                <span className="flex w-7 shrink-0 items-center gap-0.5 font-semibold text-ink">
                  {b}
                  <IkonBintang size={12} isi strokeWidth={1.5} className="text-[#e5a50a]" />
                  <span className="sr-only"> bintang:</span>
                </span>
                <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-tint">
                  <span className="block h-full rounded-full bg-[#e5a50a]" style={{ width: `${persen}%` }} />
                </span>
                <span className="w-9 shrink-0 text-right text-muted tabular-nums">{persen}%</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function KartuUlasan({ ulasan: u, namaToko }: { ulasan: ItemUlasan; namaToko: string }) {
  return (
    <article aria-labelledby={`ulasan-${u.id}`} className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-sm font-bold text-brand-900">
          {inisial(u.nama)}
        </span>
        <div className="min-w-0">
          <h3 id={`ulasan-${u.id}`} className="text-[15px] font-semibold text-ink">
            {u.nama} <span className="font-normal text-muted">· {LABEL_PERAN[u.peran]}</span>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            <Bintang nilai={u.bintang} ukuran={14} />
            <time dateTime={u.tanggal}>{tanggal(u.tanggal)}</time>
          </p>
        </div>
      </div>

      {u.slugProduk && (
        <p className="mt-3 text-[13px] text-muted">
          Membeli{" "}
          <Link href={`/produk/${u.slugProduk}`} className="font-semibold text-brand-600 underline-offset-3 hover:text-brand-900 hover:underline">
            {u.namaProduk}
          </Link>
        </p>
      )}
      <p className="mt-2 text-[15px] leading-relaxed text-ink">{u.komentar}</p>
      {u.adaFoto && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
          <IkonKamera size={14} />
          Menyertakan foto
        </p>
      )}

      {u.balasan && (
        <div className="mt-4 rounded-xl bg-tint px-4 py-3">
          <p className="text-[13px] font-semibold text-brand-900">
            Balasan {namaToko}{" "}
            <span className="font-normal text-muted">
              · <time dateTime={u.balasan.tanggal}>{tanggal(u.balasan.tanggal)}</time>
            </span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink">{u.balasan.isi}</p>
        </div>
      )}
    </article>
  );
}

/**
 * Ringkasan + ulasan terbaru toko. Angka rata-rata dan total memakai agregat toko (`Petani.rating`,
 * `Petani.jumlahUlasan`) agar sama dengan header profil; sebaran bintang diambil dari `ringkasan`.
 * Di backend keduanya berasal dari sumber yang sama.
 */
export function UlasanPetani({
  item,
  ringkasan,
  rating,
  jumlahUlasan,
  namaToko,
}: {
  item: ItemUlasan[];
  ringkasan: RingkasanUlasan;
  rating: number;
  jumlahUlasan: number;
  namaToko: string;
}) {
  if (jumlahUlasan === 0 && item.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center text-[15px] text-muted">
        Toko ini belum punya ulasan. Ulasan muncul setelah pembeli menerima pesanannya.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
      <Ringkasan rating={rating} jumlahUlasan={jumlahUlasan} ringkasan={ringkasan} />
      {item.length > 0 ? (
        <div>
          <ol className="flex flex-col gap-3">
            {item.map((u) => (
              <li key={u.id}>
                <KartuUlasan ulasan={u} namaToko={namaToko} />
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[13px] text-muted">Menampilkan {angka(item.length)} ulasan terbaru.</p>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center text-[15px] text-muted">
          Belum ada ulasan yang bisa ditampilkan.
        </p>
      )}
    </div>
  );
}
