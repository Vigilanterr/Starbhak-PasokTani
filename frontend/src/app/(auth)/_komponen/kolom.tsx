"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { IkonMata, IkonMataCoret, IkonPanahBawah, IkonPeringatan } from "./ikon";

const kontrolNormal =
  "flex h-12 items-center gap-3 rounded-[10px] border border-field-border bg-white pl-4 pr-1.5 transition-shadow " +
  "focus-within:border-brand-900 focus-within:shadow-[0_0_0_1px_var(--color-brand-900),0_0_0_4px_rgba(30,139,90,0.25)]";

const kontrolGalat =
  "flex h-12 items-center gap-3 rounded-[10px] border border-danger bg-white pl-4 pr-1.5 shadow-[0_0_0_1px_var(--color-danger)] transition-shadow " +
  "focus-within:shadow-[0_0_0_1px_var(--color-danger),0_0_0_4px_rgba(180,35,24,0.2)]";

const kelasInput =
  "h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] text-ink outline-0 placeholder:text-placeholder";

export function Kolom({
  id,
  label,
  bantuan,
  children,
}: {
  id: string;
  label: string;
  bantuan?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {bantuan}
    </div>
  );
}

/** Teks bantuan / galat di bawah kolom. Hubungkan lewat aria-describedby. */
export function Bantuan({
  id,
  galat,
  children,
}: {
  id: string;
  galat?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      className={`flex items-start gap-1.5 text-[13px] leading-snug ${galat ? "text-danger" : "text-muted"}`}
    >
      {galat && <IkonPeringatan size={14} className="mt-px flex-none" />}
      <span>{children}</span>
    </p>
  );
}

type InputProps = ComponentProps<"input"> & { galat?: boolean };

export function KolomTeks({ galat, className, ...rest }: InputProps) {
  return (
    <div className={galat ? kontrolGalat : kontrolNormal}>
      <input
        {...rest}
        aria-invalid={galat || undefined}
        className={`${kelasInput} pr-2 ${className ?? ""}`}
      />
    </div>
  );
}

export function KolomKataSandi({ galat, className, ...rest }: InputProps) {
  const [tampil, setTampil] = useState(false);
  return (
    <div className={galat ? kontrolGalat : kontrolNormal}>
      <input
        {...rest}
        type={tampil ? "text" : "password"}
        aria-invalid={galat || undefined}
        className={`${kelasInput} ${className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setTampil((v) => !v)}
        aria-label={tampil ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        className="grid size-9 flex-none cursor-pointer place-items-center rounded-lg text-[#5c665e] hover:bg-tint focus-visible:outline-2 focus-visible:outline-brand-600"
      >
        {tampil ? <IkonMataCoret /> : <IkonMata />}
      </button>
    </div>
  );
}

export function KolomPilihan({
  galat,
  className,
  children,
  ...rest
}: ComponentProps<"select"> & { galat?: boolean }) {
  const kosong = rest.value === "";
  return (
    <div className={`relative ${galat ? kontrolGalat : kontrolNormal}`}>
      <select
        {...rest}
        aria-invalid={galat || undefined}
        className={`${kelasInput} cursor-pointer appearance-none pr-8 ${kosong ? "text-placeholder" : ""} ${className ?? ""}`}
      >
        {children}
      </select>
      <IkonPanahBawah
        size={18}
        className="pointer-events-none absolute right-3 text-[#5c665e]"
      />
    </div>
  );
}
