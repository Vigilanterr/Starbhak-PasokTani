import Link from "next/link";
import { IkonChevronKanan, IkonChevronKiri } from "@/app/_komponen/ikon";

/** Paginasi berbasis tautan (query string). `href(n)` membentuk URL halaman ke-n. */
export function Paginasi({ halaman, jumlahHalaman, href }: { halaman: number; jumlahHalaman: number; href: (n: number) => string }) {
  if (jumlahHalaman <= 1) return null;
  const nomor = Array.from({ length: jumlahHalaman }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === jumlahHalaman || Math.abs(n - halaman) <= 1,
  );
  const dasar =
    "grid h-10 min-w-10 place-items-center rounded-[10px] px-3 text-[15px] font-semibold no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45";
  return (
    <nav aria-label="Halaman" className="mt-10 flex items-center justify-center gap-1.5">
      {halaman > 1 ? (
        <Link href={href(halaman - 1)} className={`${dasar} text-ink hover:bg-tint`} aria-label="Halaman sebelumnya">
          <IkonChevronKiri size={18} />
        </Link>
      ) : (
        <span className={`${dasar} text-[#b8bfb6]`} aria-hidden>
          <IkonChevronKiri size={18} />
        </span>
      )}
      {nomor.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - (nomor[i - 1] ?? n) > 1 && <span className="px-1 text-muted">…</span>}
          {n === halaman ? (
            <span aria-current="page" className={`${dasar} bg-brand-900 text-white`}>
              {n}
            </span>
          ) : (
            <Link href={href(n)} className={`${dasar} text-ink hover:bg-tint`}>
              {n}
            </Link>
          )}
        </span>
      ))}
      {halaman < jumlahHalaman ? (
        <Link href={href(halaman + 1)} className={`${dasar} text-ink hover:bg-tint`} aria-label="Halaman berikutnya">
          <IkonChevronKanan size={18} />
        </Link>
      ) : (
        <span className={`${dasar} text-[#b8bfb6]`} aria-hidden>
          <IkonChevronKanan size={18} />
        </span>
      )}
    </nav>
  );
}
