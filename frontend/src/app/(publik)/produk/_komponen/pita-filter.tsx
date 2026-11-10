import Link from "next/link";
import type { FilterProduk } from "@/lib/api/tipe";
import { TITIK_DEFAULT } from "@/lib/api/katalog";
import { hrefFilter } from "@/lib/filter-produk";
import { angka } from "@/lib/format";
import { IkonDekatSaya, IkonSilang } from "@/app/_komponen/ikon";
import { hrefTanpaLokasi, RADIUS_PILIHAN, type ChipFilter } from "./opsi-katalog";

const kelasFokus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45";

/**
 * Pita pencarian lokasi: chip "Radius 25 km dari lokasimu" (tautan untuk mematikannya) dan pilihan
 * radius 10/25/50 km. Tampil bila ada titik, radius, atau urutan "Terdekat" di URL.
 */
export function PitaLokasi({ path, filter }: { path: string; filter: FilterProduk }) {
  if (!filter.titik && filter.radiusKm === undefined && filter.urut !== "terdekat") return null;

  const bawaan =
    !filter.titik || (filter.titik.lat === TITIK_DEFAULT.lat && filter.titik.lng === TITIK_DEFAULT.lng);
  const sumber = bawaan ? "pusat Kota Bandung" : "lokasimu";
  const label =
    filter.radiusKm !== undefined ? `Radius ${angka(filter.radiusKm)} km dari ${sumber}` : `Terdekat dari ${sumber}`;
  const dasar: FilterProduk = { ...filter, halaman: undefined };

  return (
    <div className="rounded-2xl border border-line bg-tint/70 px-3 py-1.5 md:px-4">
      <div className="flex flex-wrap items-center gap-x-3">
        <Link
          href={hrefTanpaLokasi(filter, path)}
          aria-label={`${label}. Matikan pencarian lokasi`}
          className={`group inline-flex h-11 items-center rounded-full no-underline ${kelasFokus}`}
        >
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-900 pr-2.5 pl-3 text-[13px] font-semibold text-white group-hover:bg-[#053f30]">
            <IkonDekatSaya size={15} className="shrink-0" />
            {label}
            <IkonSilang size={14} className="shrink-0 opacity-80" />
          </span>
        </Link>
        <div role="group" aria-label="Ubah radius" className="flex items-center gap-1">
          <span className="mr-1 text-[13px] text-muted">Radius</span>
          {RADIUS_PILIHAN.map((r) =>
            r === filter.radiusKm ? (
              <span
                key={r}
                aria-current="true"
                className="inline-flex h-11 items-center px-0.5"
              >
                <span className="inline-flex h-8 items-center rounded-full bg-white px-3 text-[13px] font-bold text-brand-900 ring-1 ring-brand-600">
                  {r} km
                </span>
              </span>
            ) : (
              <Link
                key={r}
                href={hrefFilter(path, { ...dasar, radiusKm: r })}
                scroll={false}
                className={`group inline-flex h-11 items-center rounded-full px-0.5 no-underline ${kelasFokus}`}
              >
                <span className="inline-flex h-8 items-center rounded-full px-3 text-[13px] font-semibold text-ink group-hover:bg-white">
                  {r} km
                </span>
              </Link>
            ),
          )}
        </div>
      </div>
      {bawaan && (
        <p className="pb-1.5 text-[13px] leading-snug text-muted">
          Lokasimu belum tersedia, jadi jarak dihitung dari pusat Kota Bandung.
        </p>
      )}
    </div>
  );
}

/** Deretan chip filter aktif; setiap chip adalah tautan yang menghapus filter itu. */
export function ChipFilterAktif({ chip, hrefHapusSemua }: { chip: ChipFilter[]; hrefHapusSemua: string }) {
  if (chip.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-1.5">
      <ul aria-label="Filter aktif" className="flex flex-wrap items-center gap-x-1.5">
        {chip.map((c) => (
          <li key={c.id}>
            <Link
              href={c.href}
              aria-label={`Hapus filter ${c.label}`}
              className={`group inline-flex h-11 items-center rounded-full no-underline ${kelasFokus}`}
            >
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-600/30 bg-mint/70 pr-2.5 pl-3.5 text-[13px] font-semibold text-brand-900 group-hover:bg-mint">
                {c.label}
                <IkonSilang size={14} className="shrink-0" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={hrefHapusSemua}
        className={`inline-flex h-11 items-center rounded-lg px-2 text-[13px] font-semibold text-brand-600 no-underline hover:text-brand-900 hover:underline ${kelasFokus}`}
      >
        Hapus semua
      </Link>
    </div>
  );
}
