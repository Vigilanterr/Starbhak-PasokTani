export type TrenAngka = 'naik' | 'turun' | 'netral';

export interface KartuAngkaProps {
  label: string;
  nilai: string | number;
  perubahan?: number | string;
  adaPembanding?: boolean;
  periode?: string;
  baikJikaNaik?: boolean;
  tren?: TrenAngka;
  keterangan?: string;
  bantu?: string;
  className?: string;
}

export function KartuAngka({
  label = 'Pendapatan',
  nilai = 'Rp 0',
  perubahan,
  adaPembanding = true,
  periode = 'dibanding bulan lalu',
  baikJikaNaik = true,
  tren: trenProp,
  keterangan,
  bantu,
  className = '',
}: KartuAngkaProps) {
  // Format nilai if number
  const formattedNilai =
    typeof nilai === 'number'
      ? `Rp ${nilai.toLocaleString('id-ID')}`
      : nilai;

  // Determine trend if not explicitly passed
  let tren: TrenAngka = trenProp ?? 'netral';
  let teksPersen = '';

  if (perubahan !== undefined) {
    if (typeof perubahan === 'number') {
      if (!trenProp) {
        if (perubahan > 0) tren = 'naik';
        else if (perubahan < 0) tren = 'turun';
        else tren = 'netral';
      }
      const absVal = Math.abs(perubahan);
      teksPersen = tren === 'naik' ? `Naik ${absVal}%` : tren === 'turun' ? `Turun ${absVal}%` : `Sama (0%)`;
    } else {
      const clean = perubahan.trim();
      if (!trenProp) {
        if (clean.startsWith('-')) tren = 'turun';
        else if (clean.startsWith('+') || parseFloat(clean) > 0) tren = 'naik';
        else tren = 'netral';
      }
      teksPersen = clean.includes('%') ? clean : `${clean}%`;
    }
  }

  // Determine good/bad/neutral color
  let badgeBg = '#eef0eb';
  let badgeText = '#3f5247';

  if (tren === 'naik') {
    if (baikJikaNaik) {
      badgeBg = '#e3f4e6';
      badgeText = '#0f5132';
    } else {
      badgeBg = '#fdecea';
      badgeText = '#8a1c12';
    }
  } else if (tren === 'turun') {
    if (baikJikaNaik) {
      badgeBg = '#fdecea';
      badgeText = '#8a1c12';
    } else {
      badgeBg = '#e3f4e6';
      badgeText = '#0f5132';
    }
  }

  const helperText = bantu ?? keterangan;

  return (
    <div
      className={`box-border w-full p-3.5 sm:p-4 border border-line rounded-[14px] bg-white font-sans text-ink flex flex-col gap-1 ${className}`}
    >
      <p className="m-0 text-[13px] leading-[1.4] font-bold text-[#3f5247]">
        {label}
      </p>

      <p className="m-0 text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] tabular-nums text-ink">
        {formattedNilai}
      </p>

      {adaPembanding && perubahan !== undefined && (
        <p className="m-0 flex flex-wrap items-center gap-1.5 text-[13px] leading-[1.4]">
          <span
            className="inline-flex items-center gap-[3px] px-[7px] py-0.5 rounded-md font-extrabold text-[13px]"
            style={{ backgroundColor: badgeBg, color: badgeText }}
          >
            {tren === 'naik' && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            )}
            {tren === 'turun' && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            )}
            {tren === 'netral' && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
              </svg>
            )}
            {teksPersen}
          </span>
          {periode && <span className="text-[#5a6b60]">{periode}</span>}
        </p>
      )}

      {helperText && (
        <p className="m-0 text-xs leading-[1.5] text-[#5a6b60]">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default KartuAngka;
