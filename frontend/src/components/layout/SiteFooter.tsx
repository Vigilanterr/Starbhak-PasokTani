import Link from 'next/link';

export interface TautanKaki {
  label: string;
  href: string;
  kategori?: string;
}

export interface FooterNavColumn {
  judul: string;
  tautan: Array<{ label: string; href: string }>;
}

export interface SiteFooterProps {
  emailKontak?: string;
  waktuBalas?: string;
  areaLayanan?: string;
  tahunHakCipta?: number | string;
  kolomNavigasi?: FooterNavColumn[];
  tautan?: TautanKaki[];
  className?: string;
}

const DEFAULT_COLUMNS: FooterNavColumn[] = [
  {
    judul: 'Belanja',
    tautan: [
      { label: 'Semua produk', href: '/produk' },
      { label: 'Produk Surplus', href: '/surplus' },
      { label: 'Daftar Tunggu', href: '/daftar-tunggu' },
      { label: 'Direktori petani', href: '/petani' },
    ],
  },
  {
    judul: 'Solusi',
    tautan: [
      { label: 'Rumah tangga', href: '/belanja' },
      { label: 'UMKM & usaha kuliner', href: '/umkm' },
      { label: 'Petani', href: '/petani' },
    ],
  },
  {
    judul: 'Pelajari',
    tautan: [
      { label: 'Cara kerja', href: '/pasok-tani' },
      { label: 'Tentang kami', href: '/tentang' },
      { label: 'Pusat Bantuan', href: '/bantuan' },
    ],
  },
  {
    judul: 'Kebijakan',
    tautan: [
      { label: 'Pengembalian dana', href: '/bantuan/kebijakan-pengembalian' },
      { label: 'Syarat & Ketentuan', href: '/bantuan/syarat-ketentuan' },
      { label: 'Kebijakan Privasi', href: '/bantuan/kebijakan-privasi' },
    ],
  },
];

export function SiteFooter({
  emailKontak = 'halo@pasoktani.id',
  waktuBalas = '1×24 jam pada hari kerja',
  areaLayanan = 'Area layanan: Jawa Barat',
  tahunHakCipta = 2026,
  kolomNavigasi,
  tautan: tautanProp,
  className = '',
}: SiteFooterProps) {
  let columns = kolomNavigasi ?? DEFAULT_COLUMNS;
  if (tautanProp && tautanProp.length > 0 && !kolomNavigasi) {
    const grouped: Record<string, Array<{ label: string; href: string }>> = {};
    tautanProp.forEach((t) => {
      const cat = t.kategori ?? 'Tautan';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat]!.push({ label: t.label, href: t.href });
    });
    columns = Object.entries(grouped).map(([judul, list]) => ({
      judul,
      tautan: list,
    }));
  }

  return (
    <footer
      className={`font-sans bg-brand-900 text-[#e6eee9] ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-14 pb-8">
        <div className="flex flex-wrap gap-10 lg:gap-14">
          {/* Brand Info Column */}
          <div className="flex-[1_1_260px] min-w-0 max-w-[360px]">
            <Link
              href="/"
              aria-label="Pasok Tani, ke beranda"
              className="inline-flex items-center gap-3 no-underline"
            >
              <span className="w-11 h-11 rounded-xl bg-cream grid place-items-center text-brand-900 text-xl font-extrabold">
                🌱
              </span>
              <span className="text-xl font-extrabold text-white">
                Pasok Tani
              </span>
            </Link>

            <p className="mt-3.5 text-sm leading-relaxed text-[#cbd8d1]">
              Pasar tani daring yang menghubungkan petani Jawa Barat dengan rumah tangga dan UMKM.
            </p>

            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex gap-2 flex-wrap">
                <dt className="text-[#b2c7be]">Email</dt>
                <dd className="m-0">
                  <a
                    href={`mailto:${emailKontak}`}
                    className="text-white font-bold underline underline-offset-3 hover:text-mint"
                  >
                    {emailKontak}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2 flex-wrap">
                <dt className="text-[#b2c7be]">Waktu balas</dt>
                <dd className="m-0 text-[#e6eee9]">{waktuBalas}</dd>
              </div>
            </dl>
          </div>

          {/* Navigation Links Columns */}
          <nav aria-label="Tautan situs" className="flex-[999_1_560px] min-w-0">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-7 md:gap-6">
              {columns.map((col, idx) => {
                const headerId = `kaki-col-${idx}`;
                return (
                  <div key={col.judul}>
                    <p
                      id={headerId}
                      className="m-0 mb-3 text-[13px] font-extrabold tracking-wider uppercase text-[#e9c75c]"
                    >
                      {col.judul}
                    </p>
                    <ul
                      aria-labelledby={headerId}
                      className="list-none m-0 p-0 flex flex-col gap-0.5 text-[15px]"
                    >
                      {col.tautan.map((link) => {
                        const isInternal = link.href.startsWith('/');
                        return (
                          <li key={link.label}>
                            {isInternal ? (
                              <Link
                                href={link.href}
                                className="inline-flex items-center min-h-9 text-[#e6eee9] no-underline hover:text-white hover:underline"
                              >
                                {link.label}
                              </Link>
                            ) : (
                              <a
                                href={link.href}
                                className="inline-flex items-center min-h-9 text-[#e6eee9] no-underline hover:text-white hover:underline"
                              >
                                {link.label}
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="mt-10 pt-5 border-t border-white/16 flex flex-wrap items-center justify-between gap-3 md:gap-6">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#cbd8d1]">
            <span>Pembayaran</span>
            <span className="px-2.5 py-1 rounded-lg border border-white/30 text-white font-bold text-xs">
              QRIS
            </span>
            <span className="px-2.5 py-1 rounded-lg border border-white/30 text-white font-bold text-xs">
              Virtual Account
            </span>
            <span aria-hidden="true" className="mx-1">·</span>
            <span>{areaLayanan}</span>
          </div>

          <p className="m-0 text-[13px] text-[#b2c7be]">
            © {tahunHakCipta} Pasok Tani
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
