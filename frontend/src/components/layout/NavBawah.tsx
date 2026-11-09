import Link from 'next/link';

export type TabNavBawah =
  | 'beranda'
  | 'resep'
  | 'prapanen'
  | 'pesanan'
  | 'akun'
  | 'belanja'
  | 'langganan'
  | 'obrolan';

export interface NavBawahProps {
  aktif?: TabNavBawah;
  ruteAktif?: string;
  umkm?: boolean;
  badgePesanan?: number;
  badgeObrolan?: number;
  keranjangCount?: number;
  className?: string;
}

interface NavItemDef {
  key: TabNavBawah;
  label: string;
  href: string;
  hanyaUmkm?: boolean;
  badge?: number;
}

export function NavBawah({
  aktif: aktifProp,
  ruteAktif,
  umkm = true,
  badgePesanan = 2,
  badgeObrolan = 0,
  keranjangCount = 0,
  className = '',
}: NavBawahProps) {
  // Resolve active tab
  let resolvedAktif: TabNavBawah = aktifProp ?? 'pesanan';
  if (ruteAktif) {
    if (ruteAktif.includes('resep')) resolvedAktif = 'resep';
    else if (ruteAktif.includes('prapanen') || ruteAktif.includes('daftar-tunggu') || ruteAktif.includes('ikuti')) resolvedAktif = 'prapanen';
    else if (ruteAktif.includes('pesanan')) resolvedAktif = 'pesanan';
    else if (ruteAktif.includes('akun')) resolvedAktif = 'akun';
    else if (ruteAktif === '/' || ruteAktif.includes('beranda')) resolvedAktif = 'beranda';
  }

  const allItems: NavItemDef[] = [
    { key: 'beranda', label: 'Beranda', href: '/' },
    { key: 'resep', label: 'Resep', href: '/keranjang-resep', hanyaUmkm: true },
    { key: 'prapanen', label: 'Pra-panen', href: '/daftar-tunggu' },
    { key: 'pesanan', label: 'Pesanan', href: '/pesanan', badge: badgePesanan },
    { key: 'akun', label: 'Akun', href: '/akun', badge: badgeObrolan },
  ];

  const items = allItems.filter((t) => umkm || !t.hanyaUmkm);
  const gridColsClass = items.length === 5 ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <nav
      aria-label="Navigasi utama"
      data-keranjang={keranjangCount}
      className={`fixed bottom-0 left-0 right-0 z-40 w-full px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] bg-white border-t border-line shadow-[0_-6px_18px_rgba(23,59,43,0.06)] font-sans max-[899px]:block ${className}`}
    >
      <ul className={`list-none m-0 p-0 grid ${gridColsClass}`}>
        {items.map((t) => {
          const isActive = t.key === resolvedAktif;
          return (
            <li key={t.key}>
              <Link
                href={t.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-xs no-underline ${
                  isActive ? 'text-brand-900 font-extrabold' : 'text-[#3f5247] font-semibold'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-[52px] h-[30px] rounded-full grid place-items-center ${
                    isActive ? 'bg-mint text-brand-900' : 'bg-transparent text-[#3f5247]'
                  }`}
                >
                  {t.key === 'beranda' && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  )}

                  {t.key === 'resep' && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
                      <path d="M6 17h12" />
                    </svg>
                  )}

                  {t.key === 'prapanen' && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 20h10" />
                      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                    </svg>
                  )}

                  {t.key === 'pesanan' && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                      <path d="M12 22V12" />
                      <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
                      <path d="m7.5 4.27 9 5.15" />
                    </svg>
                  )}

                  {t.key === 'akun' && (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="5" />
                      <path d="M20 21a8 8 0 0 0-16 0" />
                    </svg>
                  )}
                </span>

                <span>{t.label}</span>

                {Boolean(t.badge && t.badge > 0) && (
                  <span
                    aria-label={`${t.badge} perlu tindakan`}
                    className="absolute top-0.5 left-[calc(50%+8px)] min-w-[18px] h-[18px] px-1 rounded-full bg-[#c2410c] text-white text-[11px] font-extrabold grid place-items-center border-2 border-white"
                  >
                    {t.badge! > 99 ? '99+' : t.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default NavBawah;
