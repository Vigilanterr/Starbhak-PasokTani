import Link from "next/link";
import { IkonOrang } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { KartuPetani } from "@/app/(publik)/_komponen/kartu-petani";
import { KeadaanKosong } from "@/app/(publik)/_komponen/kosong";
import { ambilPetani } from "@/lib/api/katalog";
import { labelWilayah } from "@/lib/api/bersama";
import type { ParamUrl } from "@/lib/filter-produk";
import { angka } from "@/lib/format";
import { LABEL_LENCANA } from "@/lib/label";
import { bacaFilterPetani } from "./filter";
import { FormFilterPetani } from "./form-filter";

/** Filter + hasil direktori. Membaca `searchParams`, jadi wajib dirender di dalam `<Suspense>`. */
export async function HasilPetani({ searchParams }: { searchParams: Promise<ParamUrl> }) {
  const filter = bacaFilterPetani(await searchParams);
  const daftar = await ambilPetani(filter);
  const adaFilter = Boolean(filter.q || filter.kabupaten || filter.lencana);

  const keterangan = [
    `${angka(daftar.length)} petani`,
    filter.q && `untuk “${filter.q}”`,
    filter.kabupaten && `di ${labelWilayah(filter.kabupaten)}`,
    filter.lencana && `dengan lencana ${LABEL_LENCANA[filter.lencana].label}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <FormFilterPetani filter={filter} />

      <div className="mt-8 mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 md:mt-10 md:mb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-900 md:text-2xl">Daftar petani</h2>
          <p aria-live="polite" className="mt-1 text-sm text-muted">
            {keterangan}
            {filter.urut === "terdekat" && " · jarak dihitung dari pusat Kota Bandung"}
          </p>
        </div>
        {adaFilter && (
          <Link
            href="/petani"
            scroll={false}
            className="inline-flex min-h-11 items-center text-[15px] font-semibold text-brand-600 underline-offset-3 hover:text-brand-900 hover:underline"
          >
            Hapus filter
          </Link>
        )}
      </div>

      {daftar.length === 0 ? (
        <KeadaanKosong
          ikon={<IkonOrang size={26} />}
          judul="Petani tidak ditemukan"
          deskripsi={
            filter.q
              ? `Belum ada petani yang cocok dengan “${filter.q}”. Coba kata kunci lain, misalnya nama komoditas, atau hapus filter.`
              : "Belum ada petani yang cocok dengan filter ini. Coba pilih wilayah atau lencana lain."
          }
          aksi={
            <Link href="/petani" scroll={false} className={kelasTombolSitus("garis")}>
              Lihat semua petani
            </Link>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {daftar.map((p) => (
            <li key={p.id}>
              <KartuPetani petani={p} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
