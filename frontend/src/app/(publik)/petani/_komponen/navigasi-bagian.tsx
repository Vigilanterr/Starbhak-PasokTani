import { angka } from "@/lib/format";

export type ItemNavigasiBagian = { id: string; label: string; jumlah?: number };

/**
 * Pintasan ke bagian profil (anchor biasa, tanpa state klien). Menempel di atas layar saat digulir;
 * di ponsel deretan chip bisa digeser bila tidak muat. Bagian tujuan memakai `scroll-mt-20`.
 */
export function NavigasiBagian({ item }: { item: ItemNavigasiBagian[] }) {
  return (
    <nav aria-label="Bagian profil" className="sticky top-0 z-20 border-b border-line bg-cream/95 backdrop-blur-sm">
      <ul className="mx-auto flex w-full max-w-300 gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:px-6">
        {item.map((i) => (
          <li key={i.id} className="shrink-0">
            <a
              href={`#${i.id}`}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink no-underline hover:border-brand-600 hover:text-brand-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
            >
              {i.label}
              {i.jumlah !== undefined && <span className="font-medium text-muted">{angka(i.jumlah)}</span>}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
