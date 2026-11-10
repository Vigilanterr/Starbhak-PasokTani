import Form from "next/form";
import type { ReactNode } from "react";
import { IkonCari, IkonPanahBawah } from "@/app/_komponen/ikon";
import { LABEL_LENCANA, URUTAN_LENCANA } from "@/lib/label";
import { WILAYAH_JAWA_BARAT } from "@/lib/wilayah";
import { LABEL_URUTAN_PETANI, URUTAN_PETANI, type FilterPetaniTerbaca } from "./filter";
import { KolomCari, PilihanOtomatis } from "./kolom-filter";

const fokus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45";
const kelasLabel = "mb-1.5 block text-[13px] font-semibold text-ink";
// 16px di ponsel agar Safari iOS tidak memperbesar halaman saat kolom difokuskan.
const kelasKolom = `h-12 w-full rounded-[10px] border border-field-border bg-white text-base text-ink focus:border-brand-600 md:text-[15px] ${fokus}`;

function Pilihan({
  id,
  label,
  name,
  nilai,
  className = "",
  children,
}: {
  id: string;
  label: string;
  name: string;
  nilai: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={kelasLabel}>
        {label}
      </label>
      <div className="relative">
        <PilihanOtomatis id={id} name={name} nilai={nilai} className={`${kelasKolom} cursor-pointer appearance-none truncate pr-9 pl-3`}>
          {children}
        </PilihanOtomatis>
        <IkonPanahBawah size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
      </div>
    </div>
  );
}

/**
 * Form GET ke `/petani` (tetap jalan tanpa JS lewat tombol Cari). Dengan JS, pilihan wilayah, lencana,
 * dan urutan langsung diterapkan; `scroll={false}` menjaga posisi gulir agar hasil tetap terlihat.
 */
export function FormFilterPetani({ filter }: { filter: FilterPetaniTerbaca }) {
  return (
    <Form
      action="/petani"
      scroll={false}
      role="search"
      aria-label="Cari dan saring petani"
      className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-3 md:p-5 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:gap-4"
    >
      <div className="col-span-2 sm:col-span-3 lg:col-span-1">
        <label htmlFor="cari-petani" className={kelasLabel}>
          Cari petani
        </label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <IkonCari size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
            <KolomCari
              id="cari-petani"
              name="q"
              nilai={filter.q ?? ""}
              placeholder="Nama toko, pemilik, atau komoditas"
              className={`${kelasKolom} pr-3 pl-10 placeholder:text-placeholder`}
            />
          </div>
          <button
            type="submit"
            className={`h-12 shrink-0 cursor-pointer rounded-[10px] bg-brand-900 px-5 text-[15px] font-semibold text-white hover:bg-[#053f30] ${fokus}`}
          >
            Cari
          </button>
        </div>
      </div>

      <Pilihan id="filter-wilayah" label="Wilayah" name="kabupaten" nilai={filter.kabupaten ?? ""} className="col-span-2 sm:col-span-1">
        <option value="">Semua wilayah</option>
        {WILAYAH_JAWA_BARAT.map((w) => (
          <option key={w.nilai} value={w.nilai}>
            {w.label.replace("Kabupaten ", "Kab. ")}
          </option>
        ))}
      </Pilihan>

      <Pilihan id="filter-lencana" label="Lencana" name="lencana" nilai={filter.lencana ?? ""}>
        <option value="">Semua</option>
        {URUTAN_LENCANA.map((l) => (
          <option key={l} value={l}>
            {LABEL_LENCANA[l].label}
          </option>
        ))}
      </Pilihan>

      <Pilihan id="filter-urut" label="Urutkan" name="urut" nilai={filter.urut}>
        {URUTAN_PETANI.map((u) => (
          <option key={u} value={u}>
            {LABEL_URUTAN_PETANI[u]}
          </option>
        ))}
      </Pilihan>
    </Form>
  );
}
