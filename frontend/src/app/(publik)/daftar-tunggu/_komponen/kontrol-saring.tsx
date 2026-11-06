"use client";

import Form from "next/form";
import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { IkonPanahBawah } from "@/app/_komponen/ikon";

const fokus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45";

/**
 * Form GET untuk filter `/daftar-tunggu`. Setiap perubahan pilihan langsung dikirim (navigasi klien lewat
 * `next/form`, dipicu oleh `PilihSaring`/`SakelarSaring`); tanpa JS, form tetap berjalan lewat tombol
 * "Terapkan" di dalam `<noscript>`.
 */
export function FormSaring({ action, className, children }: { action: string; className?: string; children: ReactNode }) {
  return (
    <Form
      action={action}
      className={className}
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        // Buang parameter kosong (mis. `kategori=`) agar URL yang dibagikan tetap rapi. Kontrol yang
        // dinonaktifkan tidak ikut FormData; diaktifkan lagi setelah next/form membaca isinya.
        const kosong = Array.from(e.currentTarget.elements).filter(
          (el): el is HTMLSelectElement | HTMLInputElement =>
            (el instanceof HTMLSelectElement || el instanceof HTMLInputElement) && el.name !== "" && el.value === "",
        );
        kosong.forEach((el) => {
          el.disabled = true;
        });
        setTimeout(() => {
          kosong.forEach((el) => {
            el.disabled = false;
          });
        }, 0);
      }}
    >
      {children}
    </Form>
  );
}

type Pilihan = { nilai: string; label: string };

/** Select filter. `nilai` = nilai dari URL saat ini. */
export function PilihSaring({ id, name, nilai, pilihan }: { id: string; name: string; nilai: string; pilihan: Pilihan[] }) {
  const ref = useRef<HTMLSelectElement>(null);
  // `defaultValue` tidak ikut berubah saat URL berubah lewat tautan lain (mis. "Hapus filter"), jadi disamakan manual.
  useEffect(() => {
    if (ref.current) ref.current.value = nilai;
  }, [nilai]);

  return (
    <div className="relative">
      <select
        ref={ref}
        id={id}
        name={name}
        defaultValue={nilai}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-field-border bg-white pr-10 pl-3.5 text-[15px] text-ink ${fokus}`}
      >
        {pilihan.map((p) => (
          <option key={p.nilai} value={p.nilai}>
            {p.label}
          </option>
        ))}
      </select>
      <IkonPanahBawah size={18} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
    </div>
  );
}

/** Sakelar filter (checkbox `name=1`). */
export function SakelarSaring({ name, aktif, children }: { name: string; aktif: boolean; children: ReactNode }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.checked = aktif;
  }, [aktif]);

  return (
    <label className="relative inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full border border-line bg-white py-1.5 pr-4 pl-2 text-[15px] font-medium text-ink select-none has-[:checked]:border-brand-900 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-600/45">
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        name={name}
        value="1"
        defaultChecked={aktif}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-6 w-10 shrink-0 rounded-full bg-[#cfd6cc] transition-colors peer-checked:bg-brand-900 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:after:translate-x-4"
      />
      {children}
    </label>
  );
}
