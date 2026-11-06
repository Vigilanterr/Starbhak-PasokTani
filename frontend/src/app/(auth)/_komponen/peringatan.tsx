import type { ReactNode } from "react";
import { IkonInfo, IkonPeringatan } from "./ikon";

/** Kotak galat tingkat form (mis. email atau kata sandi salah). */
export function Peringatan({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex gap-2.5 rounded-[10px] border border-danger-line bg-danger-bg px-3.5 py-3 text-sm font-medium leading-normal text-danger-ink [&_a]:font-bold [&_a]:text-danger-ink"
    >
      <IkonPeringatan size={18} className="mt-0.5 flex-none" />
      <span>{children}</span>
    </div>
  );
}

/** Kotak informasi netral. */
export function Catatan({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-[10px] bg-tint px-4 py-3.5 text-sm leading-normal text-ink [&_a]:font-bold [&_a]:text-brand-900 [&_button]:cursor-pointer [&_button]:font-bold [&_button]:text-brand-900 [&_button]:underline">
      <IkonInfo size={18} className="mt-0.5 flex-none text-brand-600" />
      <span>{children}</span>
    </div>
  );
}
