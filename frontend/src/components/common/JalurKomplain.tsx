export type TahapKomplain = 'diajukan' | 'ditanggapi' | 'dimediasi' | 'selesai';

export interface JalurKomplainProps {
  tahap?: TahapKomplain;
  lewatMediasi?: boolean;
  hasil?: string;
  waktuTahap?: Record<string, string>;
  className?: string;
}

interface TahapDef {
  id: TahapKomplain;
  judul: string;
  ketDefault: string;
  waktuDefault: string;
}

const TAHAP_LIST: TahapDef[] = [
  {
    id: 'diajukan',
    judul: 'Komplain diajukan',
    ketDefault: 'Bukti foto dan deskripsi masalah dikirim ke pihak penjual.',
    waktuDefault: '09:15 WIB',
  },
  {
    id: 'ditanggapi',
    judul: 'Tanggapan petani',
    ketDefault: 'Petani menanggapi keluhan dan menawarkan solusi penyesuaian dana.',
    waktuDefault: '11:40 WIB',
  },
  {
    id: 'dimediasi',
    judul: 'Mediasi admin PasokTani',
    ketDefault: 'Admin meninjau bukti transaksi untuk memastikan penyelesaian adil.',
    waktuDefault: '14:00 WIB',
  },
  {
    id: 'selesai',
    judul: 'Kesepakatan selesai',
    ketDefault: 'Penyelesaian tuntas dan dana telah disesuaikan ke pihak terkait.',
    waktuDefault: '16:20 WIB',
  },
];

export function JalurKomplain({
  tahap = 'diajukan',
  lewatMediasi = false,
  hasil = 'Rp 32.000 kembali ke Dompet, Rp 240.000 diteruskan ke petani.',
  waktuTahap = {},
  className = '',
}: JalurKomplainProps) {
  const stageKeys: TahapKomplain[] = ['diajukan', 'ditanggapi', 'dimediasi', 'selesai'];
  const currentIndex = stageKeys.indexOf(tahap);

  return (
    <ol
      aria-label="Tahap komplain"
      className={`list-none m-0 p-0 font-sans text-ink ${className}`}
    >
      {TAHAP_LIST.map((step, idx) => {
        const isLast = idx === TAHAP_LIST.length - 1;
        const isSkippedMediation =
          step.id === 'dimediasi' && tahap === 'selesai' && !lewatMediasi;

        let statusState: 'selesai' | 'kini' | 'nanti' | 'lewat' = 'nanti';
        if (isSkippedMediation) {
          statusState = 'lewat';
        } else if (idx < currentIndex || (tahap === 'selesai' && idx === currentIndex)) {
          statusState = 'selesai';
        } else if (idx === currentIndex) {
          statusState = 'kini';
        }

        const waktu =
          isSkippedMediation
            ? 'Dilewati'
            : waktuTahap[step.id] ?? (statusState !== 'nanti' ? step.waktuDefault : '');

        let ket = step.ketDefault;
        if (isSkippedMediation) {
          ket = 'Pembeli dan petani sudah sepakat, admin tidak perlu turun tangan.';
        } else if (step.id === 'selesai' && statusState === 'selesai') {
          ket = hasil;
        }

        // Connector line color
        const isLineGold =
          (statusState === 'selesai' || isSkippedMediation) &&
          idx < stageKeys.length - 1 &&
          (currentIndex > idx || tahap === 'selesai');
        const lineColor = isLineGold ? '#c2a032' : '#c9d2c6';

        return (
          <li
            key={step.id}
            aria-current={statusState === 'kini' ? 'step' : undefined}
            className="flex gap-3.5"
          >
            {/* Pin Column */}
            <div
              aria-hidden="true"
              className="shrink-0 w-6 flex flex-col items-center"
            >
              <span
                className={`w-6 h-6 rounded-full grid place-items-center text-white shrink-0 ${
                  statusState === 'selesai'
                    ? 'bg-brand-900 border-0'
                    : statusState === 'kini'
                    ? 'bg-white border-2 border-brand-900'
                    : 'bg-white border-2 border-[#c9d2c6]'
                }`}
              >
                {statusState === 'selesai' && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}

                {statusState === 'kini' && (
                  <span className="w-2 h-2 rounded-full bg-[#c2a032]" />
                )}

                {statusState === 'lewat' && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5a6b60"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14" />
                  </svg>
                )}
              </span>

              {!isLast && (
                <span
                  className="flex-1 min-h-5 my-1 border-l-2 border-dotted"
                  style={{ borderColor: lineColor }}
                />
              )}
            </div>

            {/* Content Column */}
            <div className={`flex-1 min-w-0 ${!isLast ? 'pb-3.5' : 'pb-0'}`}>
              <p className="m-0 mt-px flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <strong
                  className={`text-[15px] ${
                    statusState === 'kini'
                      ? 'font-extrabold text-ink'
                      : statusState === 'selesai'
                      ? 'font-bold text-ink'
                      : 'font-bold text-[#5a6b60]'
                  }`}
                >
                  {step.judul}
                </strong>
                {waktu && (
                  <span className="text-[13px] text-[#5a6b60] tabular-nums whitespace-nowrap">
                    {waktu}
                  </span>
                )}
              </p>

              <p className="m-0 mt-0.5 text-[13px] leading-[1.5] text-[#3f5247]">
                {ket}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default JalurKomplain;
