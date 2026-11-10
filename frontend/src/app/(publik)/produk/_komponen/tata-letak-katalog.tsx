"use client";

import { useState, type ReactNode } from "react";
import { IkonSaring } from "@/app/_komponen/ikon";

type Props = {
  /** Query string filter saat ini. Saat berubah (navigasi), panel seluler tertutup lagi. */
  query: string;
  /** Jumlah filter panel yang aktif, untuk lencana di tombol "Filter". */
  jumlahFilter: number;
  idPanel: string;
  urutan: ReactNode;
  ringkasan: ReactNode;
  dekatSaya: ReactNode;
  /** Isi panel filter (form). */
  panel: ReactNode;
  /** Hasil: pita lokasi, chip filter, grid, paginasi. */
  children: ReactNode;
};

/**
 * Form GET mengirim semua field, termasuk yang kosong (`?kabupaten=&harga-min=`). Field kosong
 * dimatikan sesaat, sebelum `next/form` membaca isi form (fase capture berjalan lebih dulu),
 * agar URL hasil tetap rapi dan enak dibagikan.
 */
function rapikanKiriman(target: EventTarget) {
  if (!(target instanceof HTMLFormElement)) return;
  const dimatikan: (HTMLInputElement | HTMLSelectElement)[] = [];
  for (const el of Array.from(target.elements)) {
    if (
      (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) &&
      el.name &&
      !el.disabled &&
      el.value.trim() === ""
    ) {
      el.disabled = true;
      dimatikan.push(el);
    }
  }
  window.setTimeout(() => {
    for (const el of dimatikan) el.disabled = false;
  }, 0);
}

/**
 * Tata letak daftar produk. Desktop (lg): panel filter di kolom kiri (sticky), bilah alat dan hasil
 * di kanan. Ponsel: satu bilah ringkas (Filter + Urutkan, lalu jumlah + Dekat saya); panel filter
 * terlipat di bawah bilah dan dibuka lewat tombol "Filter".
 */
export function TataLetakKatalog({ query, jumlahFilter, idPanel, urutan, ringkasan, dekatSaya, panel, children }: Props) {
  const [terbuka, setTerbuka] = useState(false);
  const [querySebelum, setQuerySebelum] = useState(query);
  if (query !== querySebelum) {
    setQuerySebelum(query);
    setTerbuka(false);
  }

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[256px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-3 lg:col-start-2 lg:row-start-1 lg:flex lg:flex-wrap lg:gap-x-3">
        <button
          type="button"
          aria-expanded={terbuka}
          aria-controls={idPanel}
          onClick={() => setTerbuka((v) => !v)}
          className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border px-3.5 text-[15px] font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 lg:hidden ${
            terbuka ? "border-brand-900 bg-brand-900 text-white" : "border-line bg-white text-ink hover:border-brand-600"
          }`}
        >
          <IkonSaring size={18} className="shrink-0" />
          Filter
          {jumlahFilter > 0 && (
            <span
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-xs font-bold ${
                terbuka ? "bg-white text-brand-900" : "bg-brand-900 text-white"
              }`}
            >
              {jumlahFilter}
              <span className="sr-only"> filter aktif</span>
            </span>
          )}
        </button>
        <div className="min-w-0 lg:order-3">{urutan}</div>
        <div className="min-w-0 lg:order-1 lg:mr-auto">{ringkasan}</div>
        <div className="justify-self-end lg:order-2">{dekatSaya}</div>
      </div>

      <aside
        id={idPanel}
        aria-label="Filter produk"
        onSubmitCapture={(e: { target: EventTarget }) => rapikanKiriman(e.target)}
        onSubmit={() => setTerbuka(false)}
        className={`${terbuka ? "block" : "hidden"} lg:sticky lg:top-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block lg:max-h-[calc(100dvh-3rem)] lg:self-start lg:overflow-y-auto`}
      >
        {panel}
      </aside>

      <div className="min-w-0 lg:col-start-2 lg:row-start-2">{children}</div>
    </div>
  );
}
