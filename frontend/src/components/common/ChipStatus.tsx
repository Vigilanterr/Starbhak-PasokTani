export type StatusPasokTani =
  | 'menunggu-bayar'
  | 'dikonfirmasi'
  | 'diproses'
  | 'dikirim'
  | 'tiba'
  | 'selesai'
  | 'dibatalkan'
  | 'batal-diajukan'
  | 'komplain'
  | 'komplain-diajukan'
  | 'komplain-ditanggapi'
  | 'komplain-dimediasi'
  | 'komplain-selesai'
  | 'dana-ditahan'
  | 'dana-diteruskan'
  | 'dikembalikan'
  | 'jadwal-tanam'
  | 'ditanam'
  | 'tertunda'
  | 'lebih-awal'
  | 'gagal'
  | 'siap';

export type TipeStatus = StatusPasokTani;

export interface ChipStatusProps {
  status?: StatusPasokTani | string;
  label?: string;
  ukuran?: 'kecil' | 'sedang';
  tampilkanTitik?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  dot: string;
  border?: string;
}

const PETA_STATUS: Record<StatusPasokTani, StatusConfig> = {
  'menunggu-bayar': { label: 'Menunggu pembayaran', bg: '#fef3c7', text: '#92400e', dot: '#b45309' },
  'dikonfirmasi': { label: 'Dikonfirmasi petani', bg: '#e0f2fe', text: '#075985', dot: '#0369a1' },
  'diproses': { label: 'Diproses', bg: '#ebf2eb', text: '#173b2b', dot: '#157a4c' },
  'dikirim': { label: 'Dikirim', bg: '#dcfce7', text: '#166534', dot: '#15803d' },
  'tiba': { label: 'Tiba, perlu konfirmasi', bg: '#064e3b', text: '#ffffff', dot: '#e9c75c' },
  'selesai': { label: 'Selesai', bg: '#ffffff', text: '#064e3b', dot: '#157a4c', border: '#dee3da' },
  'dibatalkan': { label: 'Dibatalkan', bg: '#eef0eb', text: '#3f5247', dot: '#7d877e' },
  'batal-diajukan': { label: 'Pembatalan diajukan', bg: '#fef3c7', text: '#92400e', dot: '#b45309' },
  'komplain': { label: 'Dalam komplain', bg: '#fdecea', text: '#8a1c12', dot: '#b42318' },
  'komplain-diajukan': { label: 'Komplain diajukan', bg: '#fdecea', text: '#8a1c12', dot: '#b42318' },
  'komplain-ditanggapi': { label: 'Ditanggapi petani', bg: '#fef3c7', text: '#92400e', dot: '#b45309' },
  'komplain-dimediasi': { label: 'Dimediasi admin', bg: '#e0f2fe', text: '#075985', dot: '#0369a1' },
  'komplain-selesai': { label: 'Komplain selesai', bg: '#ffffff', text: '#064e3b', dot: '#157a4c', border: '#dee3da' },
  'dana-ditahan': { label: 'Dana ditahan', bg: '#ebf2eb', text: '#173b2b', dot: '#c2a032' },
  'dana-diteruskan': { label: 'Dana diteruskan', bg: '#dcfce7', text: '#166534', dot: '#15803d' },
  'dikembalikan': { label: 'Dikembalikan ke Dompet', bg: '#e0f2fe', text: '#075985', dot: '#0369a1' },
  'jadwal-tanam': { label: 'Jadwal Tanam', bg: '#ebf2eb', text: '#173b2b', dot: '#7d877e' },
  'ditanam': { label: 'Sudah Ditanam', bg: '#dcfce7', text: '#166534', dot: '#15803d' },
  'tertunda': { label: 'Panen Tertunda', bg: '#fef3c7', text: '#92400e', dot: '#b45309' },
  'lebih-awal': { label: 'Panen Lebih Awal', bg: '#e0f2fe', text: '#075985', dot: '#0369a1' },
  'gagal': { label: 'Gagal Panen', bg: '#fdecea', text: '#8a1c12', dot: '#b42318' },
  'siap': { label: 'Siap Panen', bg: '#064e3b', text: '#ffffff', dot: '#e9c75c' },
};

const DEFAULT_CONFIG: StatusConfig = {
  label: 'Tiba, perlu konfirmasi',
  bg: '#064e3b',
  text: '#ffffff',
  dot: '#e9c75c',
};

export function ChipStatus({
  status = 'tiba',
  label,
  ukuran = 'sedang',
  tampilkanTitik = true,
  className = '',
}: ChipStatusProps) {
  const config = (status && PETA_STATUS[status as StatusPasokTani]) ? PETA_STATUS[status as StatusPasokTani]! : DEFAULT_CONFIG;
  const teks = label ?? config.label;

  const sizeClasses =
    ukuran === 'kecil'
      ? 'gap-1 px-2 py-0.5 text-[11px] leading-4'
      : 'gap-[5px] px-2.5 py-[3px] text-xs leading-[18px]';

  const dotSizeClasses = ukuran === 'kecil' ? 'w-1 h-1' : 'w-1.5 h-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-sans font-bold whitespace-nowrap ${sizeClasses} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: config.border ? `1px solid ${config.border}` : '1px solid transparent',
      }}
    >
      {tampilkanTitik && (
        <span
          aria-hidden="true"
          className={`rounded-full shrink-0 ${dotSizeClasses}`}
          style={{ backgroundColor: config.dot }}
        />
      )}
      {teks}
    </span>
  );
}

export default ChipStatus;
