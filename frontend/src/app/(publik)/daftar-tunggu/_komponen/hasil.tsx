import Link from "next/link";
import type { StatusDaftarTunggu } from "@/lib/api/tipe";
import { ambilDaftarTunggu, ambilKategori } from "@/lib/api/katalog";
import type { ParamUrl } from "@/lib/filter-produk";
import { angka } from "@/lib/format";
import { LABEL_STATUS_DAFTAR_TUNGGU } from "@/lib/label";
import { IkonKalender } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { KartuDaftarTunggu } from "@/app/(publik)/_komponen/kartu-daftar-tunggu";
import { KerangkaBaris } from "@/app/(publik)/_komponen/kerangka";
import { KeadaanKosong } from "@/app/(publik)/_komponen/kosong";
import {
  bacaFilterDaftarTunggu,
  hrefDaftarTunggu,
  LABEL_URUTAN_DAFTAR_TUNGGU,
  URUTAN_CHIP_STATUS,
  type UrutanDaftarTunggu,
} from "./filter";
import { FormSaring, PilihSaring, SakelarSaring } from "./kontrol-saring";

const fokus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45";

function kelasChip(aktif: boolean): string {
  return `inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold whitespace-nowrap no-underline ${fokus} ${
    aktif ? "border-brand-900 bg-brand-900 text-white" : "border-line bg-white text-ink hover:border-brand-600 hover:text-brand-900"
  }`;
}

const kelasLabel = "mb-1.5 block text-[13px] font-semibold text-ink";

/** Filter + grid daftar tunggu. Membaca `searchParams`, jadi wajib dirender di dalam `<Suspense>`. */
export async function HasilDaftarTunggu({ searchParams }: { searchParams: Promise<ParamUrl> }) {
  const f = bacaFilterDaftarTunggu(await searchParams);
  const [daftar, kategori] = await Promise.all([ambilDaftarTunggu(f), ambilKategori()]);
  const adaFilter = Boolean(f.status || f.kategori || f.bisaKomitmen);
  const namaKategori = kategori.find((k) => k.slug === f.kategori)?.nama;

  const chip: { status?: StatusDaftarTunggu; label: string }[] = [
    { label: "Semua" },
    ...URUTAN_CHIP_STATUS.map((s) => ({ status: s, label: LABEL_STATUS_DAFTAR_TUNGGU[s].label })),
  ];
  const urutan = Object.entries(LABEL_URUTAN_DAFTAR_TUNGGU) as [UrutanDaftarTunggu, string][];

  return (
    <>
      <nav aria-label="Saring menurut status" className="mt-4">
        <ul className="-mx-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pt-0.5 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {chip.map((c) => {
            const aktif = f.status === c.status;
            return (
              <li key={c.label} className="shrink-0 snap-start">
                <Link
                  href={hrefDaftarTunggu({ ...f, status: c.status })}
                  aria-current={aktif ? "true" : undefined}
                  className={kelasChip(aktif)}
                >
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <FormSaring action="/daftar-tunggu" className="mt-3 grid grid-cols-2 items-end gap-3 md:flex md:flex-wrap">
        {f.status && <input type="hidden" name="status" value={f.status} />}
        <div className="min-w-0 md:w-56">
          <label htmlFor="saring-kategori" className={kelasLabel}>
            Kategori
          </label>
          <PilihSaring
            id="saring-kategori"
            name="kategori"
            nilai={f.kategori ?? ""}
            pilihan={[{ nilai: "", label: "Semua kategori" }, ...kategori.map((k) => ({ nilai: k.slug, label: k.nama }))]}
          />
        </div>
        <div className="min-w-0 md:w-52">
          <label htmlFor="saring-urut" className={kelasLabel}>
            Urutkan
          </label>
          <PilihSaring
            id="saring-urut"
            name="urut"
            nilai={f.urut ?? "populer"}
            pilihan={urutan.map(([nilai, label]) => ({ nilai, label }))}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <SakelarSaring name="komitmen" aktif={Boolean(f.bisaKomitmen)}>
            Masih bisa komitmen
          </SakelarSaring>
        </div>
        <noscript>
          <button type="submit" className={`${kelasTombolSitus("utama")} h-11 px-5 text-[15px]`}>
            Terapkan
          </button>
        </noscript>
      </FormSaring>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-[15px] text-muted">
          <span className="font-semibold text-ink">{angka(daftar.length)}</span> daftar tunggu
          {f.status && ` · ${LABEL_STATUS_DAFTAR_TUNGGU[f.status].label}`}
          {namaKategori && ` · ${namaKategori}`}
          {f.bisaKomitmen && " · masih bisa komitmen"}
        </p>
        {adaFilter && (
          <Link
            href={hrefDaftarTunggu({ urut: f.urut })}
            className={`inline-flex min-h-11 items-center text-[15px] font-semibold text-brand-600 no-underline hover:text-brand-900 ${fokus}`}
          >
            Hapus filter
          </Link>
        )}
      </div>

      {daftar.length === 0 ? (
        <div className="mt-3">
          <KeadaanKosong
            ikon={<IkonKalender size={26} />}
            judul="Belum ada daftar tunggu yang cocok"
            deskripsi={
              adaFilter
                ? "Coba hapus beberapa filter, atau lihat produk yang sudah siap dibeli sekarang."
                : "Petani belum membuka daftar tunggu baru. Sementara itu, lihat produk yang sudah siap dibeli."
            }
            aksi={
              <>
                {adaFilter && (
                  <Link href="/daftar-tunggu" className={kelasTombolSitus("garis")}>
                    Hapus semua filter
                  </Link>
                )}
                <Link href="/produk" className={kelasTombolSitus("utama")}>
                  Lihat produk siap beli
                </Link>
              </>
            }
          />
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {daftar.map((d) => (
            <li key={d.id}>
              <KartuDaftarTunggu data={d} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** Fallback `<Suspense>` untuk `HasilDaftarTunggu`. */
export function KerangkaHasilDaftarTunggu() {
  return (
    <div role="status" aria-label="Memuat daftar tunggu" className="mt-4">
      <div className="flex gap-2 overflow-hidden pb-2">
        {[72, 112, 128, 136, 112].map((lebar, i) => (
          <div key={i} aria-hidden style={{ width: lebar }} className="h-11 shrink-0 animate-pulse rounded-full bg-tint" />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:flex">
        <KerangkaBaris className="h-[70px] md:w-56" />
        <KerangkaBaris className="h-[70px] md:w-52" />
      </div>
      <KerangkaBaris className="mt-6 h-5 w-40" />
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} aria-hidden className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="aspect-[16/9] w-full animate-pulse bg-tint" />
            <div className="flex flex-col gap-2 p-4">
              <KerangkaBaris className="h-4 w-3/5" />
              <KerangkaBaris className="h-3 w-2/5" />
              <KerangkaBaris className="mt-2 h-3 w-4/5" />
              <KerangkaBaris className="mt-3 h-1.5 w-full rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
