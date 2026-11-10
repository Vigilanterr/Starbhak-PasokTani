export type StatusJalurItem = 'selesai' | 'kini' | 'nanti' | 'peringatan' | 'masalah';

export interface JalurStatusItem {
  judul?: string;
  label?: string;
  waktu?: string;
  ket?: string;
  status?: StatusJalurItem;
  selesai?: boolean;
  aktif?: boolean;
  foto?: boolean;
  fotoUrl?: string;
  fotoAlt?: string;
  lama?: string;
  labelTag?: string;
}

export interface JalurStatusProps {
  contoh?: 'tanam' | 'jadwal' | 'pesanan';
  ringkas?: boolean;
  langkah?: JalurStatusItem[];
  langkahList?: JalurStatusItem[];
  label?: string;
  className?: string;
}

const PRESET_TANAM: JalurStatusItem[] = [
  {
    judul: 'Semai & Tanam',
    waktu: '12 Sep 2026',
    ket: 'Bibit unggul varietas Marta F1 mulai disemai di bedengan persemaian tertutup.',
    status: 'selesai',
    foto: true,
    fotoAlt: 'Foto persemaian bibit tomat',
  },
  {
    judul: 'Perawatan Vegetatif',
    waktu: '28 Sep 2026',
    ket: 'Pemberian pupuk kandang matang dan pemasangan ajir bambu untuk penopang.',
    status: 'selesai',
  },
  {
    judul: 'Pembungaan',
    waktu: '15 Okt 2026',
    ket: 'Bunga bermekaran sempurna. Cuaca cerah mendukung penyerbukan alami.',
    status: 'selesai',
  },
  {
    judul: 'Pembentukan Buah',
    waktu: '02 Nov 2026',
    ket: 'Buah mulai hijau mengilap dan membesar. Perkiraan bobot panen sesuai target.',
    status: 'kini',
    labelTag: 'Sedang berlangsung',
  },
  {
    judul: 'Menjelang Panen',
    waktu: 'Perkiraan 18 Nov 2026',
    ket: 'Pemantauan tingkat kematangan semburat merah 80% siap petik.',
    status: 'nanti',
  },
  {
    judul: 'Panen & Sortir',
    waktu: 'Perkiraan 22 Nov 2026',
    ket: 'Pemetikan bertahap pagi hari dan penyortiran grade A siap kirim.',
    status: 'nanti',
  },
];

const PRESET_JADWAL: JalurStatusItem[] = [
  { judul: 'Jadwal Tanam Dibuat', waktu: '01 Okt 2026', ket: 'Rencana kalender tanam terdaftar', status: 'selesai' },
  { judul: 'Penyemaian Bibit', waktu: '10 Okt 2026', ket: 'Bibit mulai disiapkan di tray semai', status: 'selesai' },
  { judul: 'Pindah Tanam', waktu: '25 Okt 2026', ket: 'Bibit dipindahkan ke lahan terbuka', status: 'kini' },
  { judul: 'Estimasi Panen', waktu: '15 Des 2026', ket: 'Perkiraan panen raya pertama', status: 'nanti' },
];

const PRESET_PESANAN: JalurStatusItem[] = [
  { judul: 'Pesanan Dikonfirmasi', waktu: '08:30 WIB', ket: 'Petani menerima dan menyetujui pesanan', status: 'selesai' },
  { judul: 'Diproses & Dikemas', waktu: '11:15 WIB', ket: 'Sayuran dipetik dan dikemas dalam krat berventilasi', status: 'selesai' },
  { judul: 'Sedang Dikirim', waktu: '13:40 WIB', ket: 'Kurir dalam perjalanan menuju lokasi penerima', status: 'kini' },
  { judul: 'Tiba di Tujuan', waktu: 'Perkiraan 15:30 WIB', ket: 'Konfirmasi penerimaan oleh pembeli', status: 'nanti' },
];

export function JalurStatus({
  contoh = 'tanam',
  ringkas = false,
  langkah,
  langkahList,
  label = 'Jalur perkembangan',
  className = '',
}: JalurStatusProps) {
  // Normalize items
  let rawList: JalurStatusItem[] = [];
  if (langkah && langkah.length > 0) {
    rawList = langkah;
  } else if (langkahList && langkahList.length > 0) {
    rawList = langkahList;
  } else if (contoh === 'jadwal') {
    rawList = PRESET_JADWAL;
  } else if (contoh === 'pesanan') {
    rawList = PRESET_PESANAN;
  } else {
    rawList = PRESET_TANAM;
  }

  const items = rawList.map((item) => {
    let resolvedStatus: StatusJalurItem = item.status ?? 'nanti';
    if (!item.status) {
      if (item.aktif) resolvedStatus = 'kini';
      else if (item.selesai) resolvedStatus = 'selesai';
    }
    const resolvedJudul = item.judul ?? item.label ?? '';
    return {
      ...item,
      judul: resolvedJudul,
      status: resolvedStatus,
    };
  });

  return (
    <ol
      aria-label={label}
      className={`list-none m-0 p-0 box-border w-full font-sans text-ink ${className}`}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const nextItem = !isLast ? items[idx + 1] : undefined;

        // Line color
        const isNextActiveOrDone =
          nextItem && (nextItem.status === 'selesai' || nextItem.status === 'kini');
        const lineColor =
          item.status === 'selesai' && isNextActiveOrDone ? '#c2a032' : '#c9d2c6';

        // Tag styling
        const hasTag = Boolean(item.labelTag);

        return (
          <li key={idx} className="flex gap-3 sm:gap-3.5">
            {/* Pin Column */}
            <div
              aria-hidden="true"
              className="shrink-0 flex flex-col items-center w-[22px] sm:w-6"
            >
              <span
                className={`w-[22px] sm:w-6 h-[22px] sm:h-6 rounded-full grid place-items-center text-white shrink-0 ${
                  item.status === 'selesai'
                    ? 'bg-brand-900 border-0'
                    : item.status === 'kini'
                    ? 'bg-white border-2 border-brand-900'
                    : item.status === 'peringatan'
                    ? 'bg-[#b45309] border-0'
                    : item.status === 'masalah'
                    ? 'bg-[#b42318] border-0'
                    : 'bg-white border-2 border-[#c9d2c6]'
                }`}
              >
                {item.status === 'selesai' && (
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

                {item.status === 'kini' && (
                  <span className="w-2 h-2 rounded-full bg-[#c2a032]" />
                )}

                {item.status === 'peringatan' && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                )}

                {item.status === 'masalah' && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </span>

              {!isLast && (
                <span
                  className="flex-1 min-h-[22px] my-1 border-l-2 border-dotted"
                  style={{ borderColor: lineColor }}
                />
              )}
            </div>

            {/* Content Column */}
            <div className={`flex-1 min-w-0 ${!isLast ? (ringkas ? 'pb-2.5' : 'pb-4 sm:pb-5') : 'pb-0'}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <strong
                  className={`text-sm sm:text-[15px] ${
                    item.status === 'kini'
                      ? 'font-extrabold text-ink'
                      : item.status === 'selesai'
                      ? 'font-bold text-ink'
                      : 'font-semibold text-[#5a6b60]'
                  }`}
                >
                  {item.judul}
                </strong>
                {item.waktu && (
                  <span className="text-xs sm:text-[13px] text-[#5a6b60] tabular-nums whitespace-nowrap">
                    {item.waktu}
                  </span>
                )}
              </div>

              {hasTag && (
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center min-h-[22px] px-2 rounded-full text-xs font-extrabold ${
                      item.status === 'peringatan'
                        ? 'bg-[#fef3c7] text-[#92400e]'
                        : item.status === 'masalah'
                        ? 'bg-[#fdecea] text-[#8a1c12]'
                        : 'bg-[#e0f2fe] text-[#075985]'
                    }`}
                  >
                    {item.labelTag}
                  </span>
                </div>
              )}

              {item.lama && (
                <p className="m-0 mt-1 text-xs text-[#5a6b60]">
                  Semula <s className="line-through">{item.lama}</s>
                </p>
              )}

              {item.ket && (
                <p className="m-0 mt-1 text-xs sm:text-[13px] leading-[1.5] text-[#3f5247]">
                  {item.ket}
                </p>
              )}

              {item.foto && (
                <div className="mt-2.5 max-w-full w-[160px] sm:w-[200px] aspect-[4/3] rounded-[10px] overflow-hidden border border-line bg-[#dfeee6] flex items-center justify-center">
                  {item.fotoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.fotoUrl}
                      alt={item.fotoAlt ?? 'Foto perkembangan'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#2f7a3e] p-2 text-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      <span className="text-[11px] font-bold mt-1">Foto Lahan Aktual</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default JalurStatus;
