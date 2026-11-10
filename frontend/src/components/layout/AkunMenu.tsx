import Link from 'next/link';

export type TabAkunMenu =
  | 'ringkasan'
  | 'pesanan'
  | 'komitmen'
  | 'diikuti'
  | 'resep'
  | 'langganan'
  | 'obrolan'
  | 'dompet'
  | 'alamat'
  | 'profil'
  | 'notifikasi'
  | 'keamanan';

export interface AkunMenuProps {
  aktif?: TabAkunMenu;
  tabAktif?: string;
  namaUser?: string;
  peranUser?: string;
  initialUser?: string;
  badgePesanan?: number;
  badgeKomitmen?: number;
  badgeObrolan?: number;
  saldoDompet?: string;
  onPilihTab?: (tab: string) => void;
  onLogout?: () => void;
  className?: string;
}

interface MenuItemDef {
  key: TabAkunMenu;
  label: string;
  href: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
}

export function AkunMenu({
  aktif: aktifProp,
  tabAktif,
  namaUser = 'Dewi Lestari',
  peranUser = 'Pembeli UMKM',
  initialUser: initialUserProp,
  badgePesanan = 2,
  badgeKomitmen = 0,
  badgeObrolan = 1,
  saldoDompet = 'Rp 63.500',
  onPilihTab,
  onLogout,
  className = '',
}: AkunMenuProps) {
  // Resolve active tab
  let resolvedAktif: TabAkunMenu = aktifProp ?? 'ringkasan';
  if (tabAktif) {
    resolvedAktif = tabAktif as TabAkunMenu;
  }

  const resolvedInitial =
    initialUserProp ??
    (namaUser ? namaUser[0]?.toUpperCase() : 'D');

  const belanjaItems: MenuItemDef[] = [
    {
      key: 'ringkasan',
      label: 'Ringkasan akun',
      href: '/akun',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      ),
    },
    {
      key: 'pesanan',
      label: 'Pesanan saya',
      href: '/pesanan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
          <path d="M12 22V12" />
          <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
          <path d="m7.5 4.27 9 5.15" />
        </svg>
      ),
      extra: badgePesanan > 0 ? (
        <span className="min-w-[22px] px-1.5 py-0.25 rounded-full bg-[#c2410c] text-white text-xs font-extrabold text-center">
          {badgePesanan}
          <span className="sr-only"> perlu tindakan</span>
        </span>
      ) : null,
    },
    {
      key: 'komitmen',
      label: 'Komitmen pra-panen',
      href: '/komitmen',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 20h10" />
          <path d="M10 20c5.5-2.5.8-6.4 3-10" />
          <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
          <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
        </svg>
      ),
      extra: badgeKomitmen > 0 ? (
        <span className="min-w-[22px] px-1.5 py-0.25 rounded-full bg-[#c2410c] text-white text-xs font-extrabold text-center">
          {badgeKomitmen}
        </span>
      ) : null,
    },
    {
      key: 'diikuti',
      label: 'Daftar Tunggu diikuti',
      href: '/ikuti',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      key: 'resep',
      label: 'Keranjang Resep',
      href: '/keranjang-resep',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
          <path d="M6 17h12" />
        </svg>
      ),
    },
    {
      key: 'langganan',
      label: 'Langganan produk',
      href: '/langganan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      ),
    },
  ];

  const akunItems: MenuItemDef[] = [
    {
      key: 'obrolan',
      label: 'Obrolan',
      href: '/obrolan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      ),
      extra: badgeObrolan > 0 ? (
        <span className="min-w-[22px] px-1.5 py-0.25 rounded-full bg-[#c2410c] text-white text-xs font-extrabold text-center">
          {badgeObrolan}
          <span className="sr-only"> belum dibaca</span>
        </span>
      ) : null,
    },
    {
      key: 'dompet',
      label: 'Dompet',
      href: '/dompet',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </svg>
      ),
      extra: (
        <span className="text-xs font-bold text-[#3f5247] whitespace-nowrap">
          {saldoDompet}
        </span>
      ),
    },
    {
      key: 'alamat',
      label: 'Alamat pengiriman',
      href: '/alamat',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      key: 'profil',
      label: 'Profil',
      href: '/profil',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      ),
    },
    {
      key: 'notifikasi',
      label: 'Pengaturan notifikasi',
      href: '/akun/notifikasi',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.268 21a2 2 0 0 0 3.464 0" />
          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
        </svg>
      ),
    },
    {
      key: 'keamanan',
      label: 'Keamanan',
      href: '/akun/keamanan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ];

  const renderSection = (items: MenuItemDef[]) => (
    <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive = item.key === resolvedAktif;
        return (
          <li key={item.key}>
            <Link
              href={item.href}
              onClick={(e) => {
                if (onPilihTab) {
                  e.preventDefault();
                  onPilihTab(item.key);
                }
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 min-h-11 px-2.5 rounded-[10px] text-sm no-underline ${
                isActive
                  ? 'bg-tint text-brand-900 font-extrabold'
                  : 'bg-transparent text-ink font-semibold hover:bg-tint/60'
              }`}
            >
              {item.icon}
              <span className="flex-1 min-w-0 truncate">{item.label}</span>
              {item.extra}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav
      aria-label="Menu akun"
      className={`box-border w-full p-3 border border-line rounded-2xl bg-white font-sans text-ink ${className}`}
    >
      {/* Profile Header Card */}
      <Link
        href="/akun"
        className="flex items-center gap-3 p-2 pb-3.5 mb-1.5 border-b border-[#eef0eb] text-ink no-underline hover:bg-cream"
      >
        <span
          aria-hidden="true"
          className="shrink-0 w-11 h-11 rounded-full grid place-items-center bg-brand-900 text-white text-base font-extrabold"
        >
          {resolvedInitial}
        </span>
        <span className="min-w-0">
          <span className="block text-[15px] font-extrabold truncate">
            {namaUser}
          </span>
          <span className="block text-xs text-[#5a6b60]">
            {peranUser}
          </span>
        </span>
      </Link>

      {/* Belanja Section */}
      <p className="mx-2 mt-2.5 mb-1 text-xs font-bold text-[#5a6b60]">
        Belanja
      </p>
      {renderSection(belanjaItems)}

      {/* Akun Section */}
      <p className="mx-2 mt-3.5 mb-1 text-xs font-bold text-[#5a6b60]">
        Akun
      </p>
      {renderSection(akunItems)}

      {/* Logout Action Button */}
      <button
        type="button"
        onClick={onLogout}
        className="mt-2.5 w-full min-h-11 flex items-center gap-3 px-2.5 border-0 border-t border-[#eef0eb] bg-transparent text-[#8a1c12] text-sm font-bold cursor-pointer hover:bg-red-50/60"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Keluar
      </button>
    </nav>
  );
}

export default AkunMenu;
