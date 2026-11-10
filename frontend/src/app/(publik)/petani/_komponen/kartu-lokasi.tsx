import { IkonLokasi, IkonPanahKanan } from "@/app/_komponen/ikon";
import type { Koordinat } from "@/lib/api/tipe";

/** `6,8115° LS, 107,6177° BT` (lintang selatan / bujur timur). */
function labelKoordinat({ lat, lng }: Koordinat): string {
  const f = (n: number) => Math.abs(n).toFixed(4).replace(".", ",");
  return `${f(lat)}° ${lat < 0 ? "LS" : "LU"}, ${f(lng)}° ${lng < 0 ? "BB" : "BT"}`;
}

/**
 * Panel peta bergaya (dekoratif). Belum ada pustaka peta, jadi lokasi ditunjukkan dengan pin di
 * tengah panel; informasi sebenarnya ada di teks dan tautan Google Maps di bawahnya.
 */
function PetaBergaya({ kecamatan }: { kecamatan: string }) {
  return (
    <div aria-hidden className="relative aspect-[16/9] w-full overflow-hidden bg-[#e6f2e1]">
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        {/* Petak sawah dan kebun */}
        <path d="M0 150 L120 122 L172 225 L0 225 Z" fill="#d6eacd" />
        <path d="M262 0 L400 0 L400 92 L304 116 Z" fill="#dbecd2" />
        <path d="M250 225 L282 160 L400 150 L400 225 Z" fill="#d9ebd0" />
        <g stroke="#c4ddb8" strokeWidth="1.5">
          <path d="M8 172 L132 144" />
          <path d="M14 196 L146 166" />
          <path d="M20 220 L158 190" />
          <path d="M290 182 L400 172" />
          <path d="M276 206 L400 196" />
        </g>
        {/* Garis kontur perbukitan */}
        <g fill="none" stroke="#c6dfbb" strokeWidth="1.5">
          <ellipse cx="318" cy="52" rx="74" ry="38" transform="rotate(-12 318 52)" />
          <ellipse cx="318" cy="52" rx="50" ry="25" transform="rotate(-12 318 52)" />
          <ellipse cx="318" cy="52" rx="26" ry="12" transform="rotate(-12 318 52)" />
          <ellipse cx="62" cy="58" rx="56" ry="30" transform="rotate(8 62 58)" />
          <ellipse cx="62" cy="58" rx="32" ry="16" transform="rotate(8 62 58)" />
        </g>
        {/* Sungai */}
        <path d="M-10 84 C 60 72, 96 122, 168 128 S 262 158, 410 142" fill="none" stroke="#d3e8f4" strokeWidth="11" strokeLinecap="round" />
        <path d="M-10 84 C 60 72, 96 122, 168 128 S 262 158, 410 142" fill="none" stroke="#b7d7ec" strokeWidth="4" strokeLinecap="round" />
        {/* Jalan */}
        <g fill="none" strokeLinecap="round">
          <path d="M-10 30 C 90 40, 140 72, 200 112 S 320 192, 410 206" stroke="#cdd8c8" strokeWidth="9" />
          <path d="M-10 30 C 90 40, 140 72, 200 112 S 320 192, 410 206" stroke="#ffffff" strokeWidth="6" />
          <path d="M222 -10 C 208 44, 200 80, 200 112 C 200 150, 226 188, 238 235" stroke="#cdd8c8" strokeWidth="7" />
          <path d="M222 -10 C 208 44, 200 80, 200 112 C 200 150, 226 188, 238 235" stroke="#ffffff" strokeWidth="4" />
        </g>
        {/* Penunjuk arah utara */}
        <g transform="translate(372 30)">
          <circle r="14" fill="#ffffff" opacity="0.9" />
          <path d="M0 -10 L4 -3 L-4 -3 Z" fill="#064e3b" />
          <text y="7" textAnchor="middle" fontSize="10" fontWeight="700" fill="#064e3b">
            U
          </text>
        </g>
        {/* Pin lokasi */}
        <circle cx="200" cy="112" r="30" fill="#1e8b5a" opacity="0.1" />
        <circle cx="200" cy="112" r="16" fill="#1e8b5a" opacity="0.16" />
        <ellipse cx="200" cy="115" rx="9" ry="3" fill="#064e3b" opacity="0.2" />
        <path d="M200 114 C 194 107, 186 100, 186 88 A 14 14 0 1 1 214 88 C 214 100, 206 107, 200 114 Z" fill="#064e3b" />
        <circle cx="200" cy="88" r="5.5" fill="#d5f6d5" />
      </svg>
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-900 shadow-sm">
        <IkonLokasi size={13} />
        {kecamatan}
      </span>
    </div>
  );
}

export function KartuLokasi({
  lokasi,
  kecamatan,
  labelWilayah,
}: {
  lokasi: Koordinat;
  kecamatan: string;
  labelWilayah: string;
}) {
  const urlPeta = `https://www.google.com/maps?q=${lokasi.lat},${lokasi.lng}`;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <PetaBergaya kecamatan={kecamatan} />
      <div className="flex flex-1 flex-col gap-1.5 p-5 md:p-6">
        <h3 className="text-lg font-semibold text-ink">Lokasi lahan</h3>
        <p className="text-[15px] text-ink">
          Kec. {kecamatan}, {labelWilayah}, Jawa Barat
        </p>
        <p className="text-[13px] text-muted">
          Titik perkiraan area lahan: <span className="tabular-nums">{labelKoordinat(lokasi)}</span>
        </p>
        <a
          href={urlPeta}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex min-h-11 items-center gap-1 self-start pt-2 text-[15px] font-semibold text-brand-600 no-underline hover:text-brand-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
        >
          Buka di Google Maps
          <span className="sr-only"> (membuka tab baru)</span>
          <IkonPanahKanan size={16} className="-rotate-45" />
        </a>
      </div>
    </article>
  );
}
