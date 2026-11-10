import Link from 'next/link';

export type TabTokoSamping =
  | 'beranda'
  | 'pesanan'
  | 'produk'
  | 'prapanen'
  | 'keuangan'
  | 'ulasan'
  | 'obrolan'
  | 'analitik'
  | 'lencana'
  | 'pengaturan';

export interface TokoSampingProps {
  aktif?: TabTokoSamping;
  ruteAktif?: string;
  terverifikasi?: boolean;
  namaToko?: string;
  initialToko?: string;
  statusOperasional?: string;
  rating?: number;
  badgeCounts?: {
    pesanan?: number;
    obrolan?: number;
    saldoKeuangan?: string;
    [key: string]: string | number | undefined;
  };
  className?: string;
}

export function TokoSamping({
  aktif: aktifProp,
  ruteAktif,
  terverifikasi = true,
  namaToko = 'Kebun Mang Ujang',
  initialToko: initialTokoProp,
  statusOperasional = 'Buka sampai 17.00',
  rating,
  badgeCounts = {},
  className = '',
}: TokoSampingProps) {
  // Resolve active tab
  let resolvedAktif: TabTokoSamping = aktifProp ?? 'beranda';
  if (ruteAktif) {
    if (ruteAktif.includes('pesanan')) resolvedAktif = 'pesanan';
    else if (ruteAktif.includes('produk') || ruteAktif.includes('stok')) resolvedAktif = 'produk';
    else if (ruteAktif.includes('prapanen') || ruteAktif.includes('daftar-tunggu')) resolvedAktif = 'prapanen';
    else if (ruteAktif.includes('keuangan')) resolvedAktif = 'keuangan';
    else if (ruteAktif.includes('ulasan')) resolvedAktif = 'ulasan';
    else if (ruteAktif.includes('obrolan')) resolvedAktif = 'obrolan';
    else if (ruteAktif.includes('analitik')) resolvedAktif = 'analitik';
    else if (ruteAktif.includes('lencana')) resolvedAktif = 'lencana';
    else if (ruteAktif.includes('pengaturan')) resolvedAktif = 'pengaturan';
    else if (ruteAktif.includes('beranda') || ruteAktif === '/toko') resolvedAktif = 'beranda';
  }

  const resolvedInitialToko =
    initialTokoProp ??
    namaToko
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');

  const countPesanan = badgeCounts.pesanan ?? 3;
  const countObrolan = badgeCounts.obrolan ?? 2;
  const saldoKeuangan = badgeCounts.saldoKeuangan ?? 'Rp 842.500';

  const navItems: Array<{
    key: TabTokoSamping;
    label: string;
    href: string;
    icon: React.ReactNode;
    extra?: React.ReactNode;
  }> = [
    {
      key: 'beranda',
      label: 'Beranda toko',
      href: '/toko',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      ),
    },
    {
      key: 'pesanan',
      label: 'Pesanan',
      href: '/toko/pesanan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
          <path d="M12 22V12" />
          <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
          <path d="m7.5 4.27 9 5.15" />
        </svg>
      ),
      extra: countPesanan > 0 ? (
        <span className="min-w-[22px] px-1.5 py-0.25 rounded-full bg-[#c2410c] text-white text-xs font-extrabold text-center">
          {countPesanan}
          <span className="sr-only"> baru</span>
        </span>
      ) : null,
    },
    {
      key: 'produk',
      label: 'Produk dan stok',
      href: '/toko/produk',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46" />
          <path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z" />
          <path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z" />
        </svg>
      ),
    },
    {
      key: 'prapanen',
      label: 'Daftar Tunggu',
      href: '/toko/daftar-tunggu',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 20h10" />
          <path d="M10 20c5.5-2.5.8-6.4 3-10" />
          <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
          <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
        </svg>
      ),
    },
    {
      key: 'keuangan',
      label: 'Keuangan',
      href: '/toko/keuangan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </svg>
      ),
      extra: (
        <span className="text-xs font-bold text-[#3f5247] whitespace-nowrap">
          {saldoKeuangan}
        </span>
      ),
    },
    {
      key: 'ulasan',
      label: 'Ulasan',
      href: '/toko/ulasan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
        </svg>
      ),
    },
    {
      key: 'obrolan',
      label: 'Obrolan',
      href: '/toko/obrolan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      ),
      extra: countObrolan > 0 ? (
        <span className="min-w-[22px] px-1.5 py-0.25 rounded-full bg-tint text-brand-900 text-xs font-extrabold text-center">
          {countObrolan}
          <span className="sr-only"> belum dibaca</span>
        </span>
      ) : null,
    },
    {
      key: 'analitik',
      label: 'Analitik',
      href: '/toko/analitik',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 3v16a2 2 0 0 0 2 2h16" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
      ),
    },
    {
      key: 'lencana',
      label: 'Lencana',
      href: '/toko/lencana',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
          <circle cx="12" cy="8" r="6" />
        </svg>
      ),
    },
    {
      key: 'pengaturan',
      label: 'Pengaturan toko',
      href: '/toko/pengaturan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#157a4c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      aria-label="Menu toko"
      className={`box-border w-full p-3 border border-line rounded-2xl bg-white font-sans text-ink ${className}`}
    >
      {/* Store Header Card */}
      <div className="flex items-center gap-2.5 p-1.5 pb-3.5 mb-1.5 border-b border-[#eef0eb]">
        <span
          aria-hidden="true"
          className="shrink-0 w-11 h-11 rounded-xl grid place-items-center bg-brand-900 text-white text-[15px] font-extrabold"
        >
          {resolvedInitialToko || 'MU'}
        </span>
        <span className="min-w-0">
          <strong className="block text-[15px] font-extrabold truncate">
            {namaToko}
          </strong>

          {terverifikasi ? (
            <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 rounded-md bg-[#075985] text-white text-xs leading-[18px] font-extrabold">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Terverifikasi
            </span>
          ) : (
            <Link
              href="/toko/verifikasi"
              className="inline-flex items-center min-h-6 mt-0.5 px-1.5 border border-dashed border-[#9aa79e] rounded-md text-[#3f5247] text-xs font-extrabold no-underline hover:bg-cream"
            >
              Belum terverifikasi
            </Link>
          )}

          <span className="flex items-center gap-1.5 mt-1 text-xs text-[#157a4c] font-bold">
            <span
              aria-hidden="true"
              className="w-[7px] h-[7px] rounded-full bg-[#15803d]"
            />
            {statusOperasional}
            {typeof rating === 'number' && ` · ⭐ ${rating.toFixed(1)}`}
          </span>
        </span>
      </div>

      {/* Navigation Routes List */}
      <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = item.key === resolvedAktif;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
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

      {/* Bottom Switch Links */}
      <div className="mt-2.5 pt-2.5 border-t border-[#eef0eb] flex flex-col">
        <Link
          href="/petani/kebun-mang-ujang"
          className="flex items-center min-h-10 px-2.5 text-brand-900 text-[13px] font-bold no-underline hover:underline"
        >
          Lihat toko sebagai pembeli
        </Link>
        <Link
          href="/bantuan/petani"
          className="flex items-center min-h-10 px-2.5 text-[#3f5247] text-[13px] no-underline hover:underline"
        >
          Pusat Bantuan Petani
        </Link>
      </div>
    </nav>
  );
}

export default TokoSamping;
