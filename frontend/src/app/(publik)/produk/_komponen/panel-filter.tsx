import Form from "next/form";
import Link from "next/link";
import type { ReactNode } from "react";
import type { FilterProduk, Kategori } from "@/lib/api/tipe";
import { WILAYAH_JAWA_BARAT } from "@/lib/wilayah";
import { IkonPanahBawah } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";

const KABUPATEN = WILAYAH_JAWA_BARAT.filter((w) => w.nilai.startsWith("kabupaten-"));
const KOTA = WILAYAH_JAWA_BARAT.filter((w) => w.nilai.startsWith("kota-"));

const kelasLabel = "text-sm font-semibold text-ink";
// text-base di ponsel: iOS memperbesar halaman bila font kontrol form < 16px.
const kelasKontrol =
  "h-11 w-full rounded-[10px] border border-field-border bg-white text-base text-ink placeholder:text-placeholder hover:border-brand-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 lg:text-[15px]";

type Props = {
  /** `id` form; dipakai juga oleh select urutan (atribut `form`). */
  idForm: string;
  /** Query string saat ini: dipakai sebagai `key` agar `defaultValue` diperbarui setelah navigasi. */
  query: string;
  path: string;
  filter: FilterProduk;
  /** Pilihan kategori; array kosong = pilihan kategori disembunyikan (mis. di /kategori/[slug]). */
  kategori: Pick<Kategori, "slug" | "nama">[];
  /** Tampilkan centang "Hanya Surplus" dan "Sembunyikan stok habis" (disembunyikan di /surplus). */
  tampilSurplus: boolean;
  /** Tautan reset; `null` bila belum ada filter aktif. */
  hrefReset: string | null;
};

/** Panel filter berbasis form GET (`next/form`), tetap berfungsi tanpa JS. */
export function PanelFilter({ idForm, query, path, filter, kategori, tampilSurplus, hrefReset }: Props) {
  return (
    <Form
      key={query}
      action={path}
      id={idForm}
      className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-4 md:p-5"
    >
      <div className="-my-1.5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-brand-900">Filter</h2>
        {hrefReset && (
          <Link
            href={hrefReset}
            className="inline-flex h-11 items-center px-1 text-sm font-semibold text-brand-600 no-underline hover:text-brand-900 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
          >
            Reset
          </Link>
        )}
      </div>

      {/* Parameter di luar panel yang harus ikut terbawa saat filter diterapkan. Urutan ikut lewat atribut `form`. */}
      {filter.q && <input type="hidden" name="q" value={filter.q} />}
      {filter.titik && (
        <>
          <input type="hidden" name="lat" value={String(filter.titik.lat)} />
          <input type="hidden" name="lng" value={String(filter.titik.lng)} />
        </>
      )}
      {filter.radiusKm !== undefined && <input type="hidden" name="radius" value={String(filter.radiusKm)} />}

      {kategori.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-kategori" className={kelasLabel}>
            Kategori
          </label>
          <KotakPilih id="filter-kategori" name="kategori" nilai={filter.kategori ?? ""}>
            <option value="">Semua kategori</option>
            {kategori.map((k) => (
              <option key={k.slug} value={k.slug}>
                {k.nama}
              </option>
            ))}
          </KotakPilih>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-wilayah" className={kelasLabel}>
          Kabupaten/Kota
        </label>
        <KotakPilih id="filter-wilayah" name="kabupaten" nilai={filter.kabupaten ?? ""}>
          <option value="">Semua wilayah Jawa Barat</option>
          <optgroup label="Kabupaten">
            {KABUPATEN.map((w) => (
              <option key={w.nilai} value={w.nilai}>
                {w.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Kota">
            {KOTA.map((w) => (
              <option key={w.nilai} value={w.nilai}>
                {w.label}
              </option>
            ))}
          </optgroup>
        </KotakPilih>
      </div>

      <fieldset>
        <legend className={kelasLabel}>Harga per satuan</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-2.5">
          <KotakHarga id="filter-harga-min" name="harga-min" label="Minimum" nilai={filter.hargaMin} />
          <KotakHarga id="filter-harga-max" name="harga-max" label="Maksimum" nilai={filter.hargaMax} />
        </div>
      </fieldset>

      <fieldset>
        <legend className={kelasLabel}>Tampilkan</legend>
        <div className="mt-1 flex flex-col">
          <KotakCentang name="organik" nilai={filter.organik} label="Organik" />
          {tampilSurplus && (
            <KotakCentang
              name="surplus"
              nilai={filter.surplus}
              label="Hanya Surplus"
              keterangan="Diskon menjelang kedaluwarsa"
            />
          )}
          {tampilSurplus && <KotakCentang name="tersedia" nilai={filter.tersedia} label="Sembunyikan stok habis" />}
        </div>
      </fieldset>

      <button type="submit" className={`${kelasTombolSitus("utama")} w-full`}>
        Terapkan
      </button>
    </Form>
  );
}

function KotakPilih({ id, name, nilai, children }: { id: string; name: string; nilai: string; children: ReactNode }) {
  return (
    <div className="relative">
      <select id={id} name={name} defaultValue={nilai} className={`${kelasKontrol} cursor-pointer appearance-none truncate pr-9 pl-3`}>
        {children}
      </select>
      <IkonPanahBawah size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
    </div>
  );
}

function KotakHarga({ id, name, label, nilai }: { id: string; name: string; label: string; nilai: number | undefined }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs text-muted">
        {label}
      </label>
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">
          Rp
        </span>
        <input
          id={id}
          type="number"
          name={name}
          inputMode="numeric"
          min={0}
          defaultValue={nilai}
          placeholder="0"
          className={`${kelasKontrol} pr-2 pl-9.5`}
        />
      </div>
    </div>
  );
}

function KotakCentang({
  name,
  nilai,
  label,
  keterangan,
}: {
  name: string;
  nilai: boolean | undefined;
  label: string;
  keterangan?: string;
}) {
  return (
    <label className="-mx-1.5 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1.5 py-1.5 hover:bg-tint/70">
      <input
        type="checkbox"
        name={name}
        value="1"
        defaultChecked={Boolean(nilai)}
        className="size-5 shrink-0 cursor-pointer accent-brand-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
      />
      <span className="flex flex-col">
        <span className="text-[15px] text-ink">{label}</span>
        {keterangan && <span className="text-xs text-muted">{keterangan}</span>}
      </span>
    </label>
  );
}
