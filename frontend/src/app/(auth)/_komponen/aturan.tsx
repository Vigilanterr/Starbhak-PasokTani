import type { ReactNode } from "react";
import { IkonBulatKosong, IkonCentangBulat } from "./ikon";

export function DaftarAturan({ children }: { children: ReactNode }) {
  return (
    <ul className="flex flex-col gap-2" aria-live="polite">
      {children}
    </ul>
  );
}

export function Aturan({ terpenuhi, children }: { terpenuhi: boolean; children: ReactNode }) {
  return (
    <li className={`flex items-center gap-2 text-sm ${terpenuhi ? "text-ink" : "text-muted"}`}>
      {terpenuhi ? <IkonCentangBulat /> : <IkonBulatKosong />}
      <span className="sr-only">{terpenuhi ? "Terpenuhi: " : "Belum terpenuhi: "}</span>
      {children}
    </li>
  );
}
