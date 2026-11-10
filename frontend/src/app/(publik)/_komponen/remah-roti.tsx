import Link from "next/link";
import { IkonChevronKanan } from "@/app/_komponen/ikon";

export type ItemRemahRoti = { label: string; href?: string };

/** Breadcrumb. Item terakhir (tanpa href) adalah halaman saat ini. */
export function RemahRoti({ item }: { item: ItemRemahRoti[] }) {
  return (
    <nav aria-label="Remah roti" className="text-[13px]">
      <ol className="flex flex-wrap items-center gap-1 text-muted">
        {item.map((i, n) => (
          <li key={`${i.label}-${n}`} className="flex items-center gap-1">
            {n > 0 && <IkonChevronKanan size={14} className="text-[#a3aba2]" />}
            {i.href ? (
              <Link href={i.href} className="no-underline hover:text-brand-900 hover:underline">
                {i.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                {i.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
