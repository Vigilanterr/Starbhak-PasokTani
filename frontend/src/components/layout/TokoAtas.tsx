import Link from 'next/link';

export interface TokoSummary {
  id?: string;
  nama: string;
  inisial?: string;
  statusBuka?: string;
  pemilikNama?: string;
  pemilikInisial?: string;
  terverifikasi?: boolean;
  rating?: number;
  avatarUrl?: string;
}

export interface TokoAtasProps {
  toko?: TokoSummary;
  namaToko?: string;
  statusBuka?: string;
  sempit?: boolean;
  notif?: number;
  obrolan?: number;
  namaPetani?: string;
  initialPetani?: string;
  initialToko?: string;
  onBukaMenu?: () => void;
  onMenuToggle?: () => void;
  onLihatToko?: () => void;
  className?: string;
}

export function TokoAtas({
  toko,
  namaToko: namaTokoProp,
  statusBuka: statusBukaProp,
  sempit,
  notif = 5,
  obrolan = 2,
  namaPetani: namaPetaniProp,
  initialPetani: initialPetaniProp,
  initialToko: initialTokoProp,
  onBukaMenu,
  onMenuToggle,
  onLihatToko,
  className = '',
}: TokoAtasProps) {
  const storeName = namaTokoProp ?? toko?.nama ?? 'Kebun Mang Ujang';
  const storeStatus = statusBukaProp ?? toko?.statusBuka ?? 'Buka sampai 17.00';
  const farmerName = namaPetaniProp ?? toko?.pemilikNama ?? 'Ujang';
  const farmerInitial = initialPetaniProp ?? toko?.pemilikInisial ?? (farmerName ? farmerName[0]?.toUpperCase() : 'U');

  const resolvedInitialToko =
    initialTokoProp ??
    toko?.inisial ??
    storeName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');

  const isExplicitMobile = sempit === true;
  const isExplicitDesktop = sempit === false;

  const showDesktopBrand = isExplicitDesktop || (!isExplicitMobile && true);
  const showMobileBrand = isExplicitMobile || (!isExplicitDesktop && true);

  const desktopClass = isExplicitDesktop ? 'inline-flex' : isExplicitMobile ? 'hidden' : 'hidden min-[900px]:inline-flex';
  const mobileClass = isExplicitMobile ? 'flex' : isExplicitDesktop ? 'hidden' : 'min-[900px]:hidden flex';

  const paddingClass = isExplicitMobile ? 'px-4 py-2.5' : isExplicitDesktop ? 'px-6 py-3' : 'px-4 py-2.5 min-[900px]:px-6 min-[900px]:py-3';

  const handleMenuClick = onMenuToggle ?? onBukaMenu;

  return (
    <header
      className={`box-border w-full flex items-center justify-between gap-3 bg-white border-b border-line font-sans text-ink ${paddingClass} ${className}`}
    >
      {/* Desktop Brand Logo */}
      {showDesktopBrand && (
        <Link
          href="/toko"
          aria-label="Pasok Tani Toko, ke dasbor"
          className={`${desktopClass} items-center gap-2.5 min-h-11 no-underline`}
        >
          <span className="w-[34px] h-[34px] rounded-lg bg-brand-900 text-white grid place-items-center font-extrabold text-base">
            🌱
          </span>
          <span className="font-['Bricolage_Grotesque',sans-serif] text-xl font-extrabold tracking-tight text-brand-900">
            Pasok<span className="text-[#a8862a]">Tani</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-brand-900 text-white text-xs font-extrabold">
            Toko
          </span>
        </Link>
      )}

      {/* Mobile Store Profile Card */}
      {showMobileBrand && (
        <div className={`${mobileClass} items-center gap-2.5 min-w-0 min-h-11 text-ink`}>
          {handleMenuClick && (
            <button
              type="button"
              onClick={handleMenuClick}
              aria-label="Menu navigasi toko"
              className="p-1 border-0 bg-transparent cursor-pointer text-ink"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          )}
          <Link
            href="/toko"
            className="flex items-center gap-2.5 min-w-0 text-ink no-underline"
          >
            <span
              aria-hidden="true"
              className="shrink-0 w-[38px] h-[38px] rounded-xl grid place-items-center bg-brand-900 text-white text-sm font-extrabold"
            >
              {resolvedInitialToko || 'MU'}
            </span>
            <span className="min-w-0">
              <strong className="block text-[15px] font-extrabold truncate">
                {storeName}
              </strong>
              <span className="flex items-center gap-1.5 text-xs text-[#157a4c] font-bold">
                <span
                  aria-hidden="true"
                  className="w-[7px] h-[7px] rounded-full bg-[#15803d]"
                />
                {storeStatus}
              </span>
            </span>
          </Link>
        </div>
      )}

      {/* Right Quick Actions */}
      <div className="shrink-0 flex items-center gap-2">
        {/* "Lihat toko" Link (Desktop) */}
        {showDesktopBrand && (
          <Link
            href="/petani/kebun-mang-ujang"
            onClick={onLihatToko}
            className={`${desktopClass} items-center gap-1.5 min-h-11 px-3 rounded-xl text-brand-900 text-sm font-bold no-underline hover:bg-tint`}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
              <path d="M2 7h20" />
            </svg>
            Lihat toko
          </Link>
        )}

        {/* Chat / Obrolan Icon Button */}
        <Link
          href="/toko/obrolan"
          aria-label={obrolan > 0 ? `Obrolan, ${obrolan} belum dibaca` : 'Obrolan'}
          className="relative shrink-0 w-11 h-11 grid place-items-center border border-line rounded-xl text-ink no-underline hover:bg-cream"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          {obrolan > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#c2410c] text-white text-[11px] font-extrabold grid place-items-center border-2 border-white"
            >
              {obrolan > 99 ? '99+' : obrolan}
            </span>
          )}
        </Link>

        {/* Notification Bell Button */}
        <Link
          href="/toko/notifikasi"
          aria-label={notif > 0 ? `Notifikasi, ${notif} belum dibaca` : 'Notifikasi'}
          className="relative shrink-0 w-11 h-11 grid place-items-center border border-line rounded-xl text-ink no-underline hover:bg-cream"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10.268 21a2 2 0 0 0 3.464 0" />
            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
          </svg>
          {notif > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#c2410c] text-white text-[11px] font-extrabold grid place-items-center border-2 border-white"
            >
              {notif > 99 ? '99+' : notif}
            </span>
          )}
        </Link>

        {/* Farmer Profile Avatar (Desktop) */}
        {showDesktopBrand && (
          <span className={`${desktopClass} items-center gap-2 pl-1.5 text-sm font-bold text-ink`}>
            <span
              aria-hidden="true"
              className="w-[34px] h-[34px] rounded-full grid place-items-center bg-[#fbf3d9] text-[#5c4500] text-[13px] font-extrabold"
            >
              {farmerInitial}
            </span>
            {farmerName}
          </span>
        )}
      </div>
    </header>
  );
}

export default TokoAtas;
