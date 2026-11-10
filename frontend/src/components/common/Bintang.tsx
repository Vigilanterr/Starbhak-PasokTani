'use client';

import { useState } from 'react';

export interface BintangProps {
  /** Rating value from 0 to 5 */
  nilai?: number;
  /** Star size in pixels (default: 18) */
  ukuran?: number;
  /** Whether to show numeric score text (e.g. "4/5") */
  angka?: boolean;
  /** Allows user interaction (click/hover) to select a rating */
  interaktif?: boolean;
  /** Callback when rating changes */
  onChange?: (nilai: number) => void;
  className?: string;
}

export function Bintang({
  nilai = 4,
  ukuran = 18,
  angka = false,
  interaktif = false,
  onChange,
  className = '',
}: BintangProps) {
  const [hoverNilai, setHoverNilai] = useState<number | null>(null);

  const starSize = Math.min(Math.max(ukuran, 12), 40);
  const clampedNilai = Math.min(Math.max(Math.round(nilai), 0), 5);
  const displayNilai = hoverNilai !== null ? hoverNilai : clampedNilai;
  const ukuranTeks = Math.max(13, Math.round(starSize * 0.8));

  const stars = [1, 2, 3, 4, 5];

  return (
    <span
      role="img"
      aria-label={`${displayNilai} dari 5 bintang`}
      className={`inline-flex items-center gap-1.5 font-sans text-ink ${className}`}
    >
      <span aria-hidden="true" className="inline-flex items-center gap-0.5">
        {stars.map((star) => {
          const isFilled = star <= displayNilai;
          const fill = isFilled ? '#a8862a' : 'none';
          const stroke = isFilled ? '#a8862a' : '#6b7a70';

          const starSvg = (
            <svg
              width={starSize}
              height={starSize}
              viewBox="0 0 24 24"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
            </svg>
          );

          if (interaktif) {
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange?.(star)}
                onMouseEnter={() => setHoverNilai(star)}
                onMouseLeave={() => setHoverNilai(null)}
                className="p-0 border-0 bg-transparent cursor-pointer inline-flex items-center focus-visible:outline-2 focus-visible:outline-[#157a4c]"
                aria-label={`Beri nilai ${star}`}
              >
                {starSvg}
              </button>
            );
          }

          return <span key={star} className="inline-flex items-center">{starSvg}</span>;
        })}
      </span>
      {angka && (
        <span
          aria-hidden="true"
          className="font-extrabold text-ink"
          style={{ fontSize: `${ukuranTeks}px` }}
        >
          {displayNilai}/5
        </span>
      )}
    </span>
  );
}

export default Bintang;
