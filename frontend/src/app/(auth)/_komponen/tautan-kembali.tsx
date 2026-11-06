import Link from "next/link";
import type { ReactNode } from "react";
import { IkonPanahKiri } from "./ikon";

export function TautanKembali({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 self-start py-1 text-sm font-semibold text-brand-900 hover:underline"
    >
      <IkonPanahKiri size={16} />
      {children}
    </Link>
  );
}
