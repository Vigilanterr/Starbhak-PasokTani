import Image from "next/image";
import Link from "next/link";

const TAUTAN = [
  { label: "Bantuan", href: "/bantuan" },
  { label: "Syarat & Ketentuan", href: "/bantuan/syarat-ketentuan" },
  { label: "Kebijakan Privasi", href: "/bantuan/kebijakan-privasi" },
  { label: "Kebijakan Pengembalian", href: "/bantuan/kebijakan-pengembalian" },
  { label: "Kontak", href: "/#kontak" },
];

export function FooterSitus() {
  return (
    <footer className="bg-brand-900 px-4 pt-12 pb-10 text-cream md:px-15">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <p className="flex items-center gap-3 text-xl font-bold text-white">
          {/* Logo berwarna gelap, jadi diberi latar terang agar terbaca di atas hijau tua. */}
          <span className="grid size-11 place-items-center rounded-xl bg-cream">
            <Image src="/images/logo/color-logo-pasoktani.png" alt="" width={32} height={30} className="h-7 w-auto" />
          </span>
          Pasok Tani
        </p>
        <nav aria-label="Tautan footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {TAUTAN.map((t) => (
              <li key={t.label}>
                <Link href={t.href} className="text-[15px] text-cream/90 no-underline hover:text-white hover:underline">
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <hr className="my-6 border-0 border-t border-white/15" />
      <p className="text-[13px] text-cream/70">
        © 2026 Pasok Tani. Menghubungkan hasil panen dengan kebutuhan pasar.
      </p>
    </footer>
  );
}
