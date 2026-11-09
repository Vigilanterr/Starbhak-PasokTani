'use client';

import { useState } from 'react';

export interface DataGrafikItem {
  label: string;
  nilai: number;
  lalu?: number;
  teks?: string;
  ket?: string;
  geser?: number;
}

export interface GrafikProps {
  judul?: string;
  data?: DataGrafikItem[];
  maks?: number;
  satuan?: string;
  tipe?: 'garis' | 'batang';
  tinggi?: number;
  className?: string;
}

const DEFAULT_DATA: DataGrafikItem[] = [
  { label: 'Tomat Merah Lembang', nilai: 840, lalu: 720, teks: '840 kg', ket: 'Bulan lalu 720 kg · Naik 17%' },
  { label: 'Kol Bulat Lembang', nilai: 620, lalu: 650, teks: '620 kg', ket: 'Bulan lalu 650 kg · Turun 5%' },
  { label: 'Wortel Brastagi', nilai: 410, lalu: 300, teks: '410 kg', ket: 'Bulan lalu 300 kg · Naik 37%' },
];

export function Grafik({
  judul = 'Komoditas terlaris (kg)',
  data: dataProp,
  maks,
  satuan = 'kg',
  tipe = 'batang',
  tinggi,
  className = '',
}: GrafikProps) {
  const [tabel, setTabel] = useState(false);

  const data = (dataProp && dataProp.length > 0) ? dataProp : DEFAULT_DATA;

  // Calculate maximum value for proportion bars
  const calculatedMax = Math.max(
    ...data.map((d) => Math.max(d.nilai, d.lalu ?? 0)),
    1
  );
  const maxVal = maks && maks > 0 ? maks : calculatedMax;

  return (
    <figure
      data-tipe={tipe}
      className={`m-0 box-border w-full font-sans text-ink ${className}`}
      style={tinggi ? { minHeight: `${tinggi}px` } : undefined}
    >
      <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-2.5">
        <span className="text-[13px] font-bold text-[#3f5247]">{judul}</span>
        <button
          type="button"
          aria-pressed={tabel}
          onClick={() => setTabel(!tabel)}
          className="min-h-[44px] px-2.5 border-0 bg-transparent text-brand-900 text-[13px] font-extrabold cursor-pointer underline underline-offset-[3px] focus-visible:outline-3 focus-visible:outline-[#157a4c]"
        >
          {tabel ? 'Lihat sebagai grafik' : 'Lihat sebagai tabel'}
        </button>
      </figcaption>

      {!tabel ? (
        <div>
          <ul className="list-none m-0 p-0 flex flex-col gap-3">
            {data.map((item, idx) => {
              const barPercent = Math.min(Math.max((item.nilai / maxVal) * 100, 1), 100);
              const prevPercent =
                item.lalu !== undefined
                  ? Math.min(Math.max((item.lalu / maxVal) * 100, 0), 100)
                  : undefined;
              const displayVal =
                item.teks ?? (satuan ? `${item.nilai.toLocaleString('id-ID')} ${satuan}` : item.nilai.toLocaleString('id-ID'));

              return (
                <li key={idx} style={{ paddingLeft: item.geser ? `${item.geser}px` : undefined }}>
                  <p className="m-0 mb-1 flex justify-between items-baseline gap-3 text-sm leading-[1.35]">
                    <span className="font-bold">{item.label}</span>
                    <strong className="font-extrabold tabular-nums whitespace-nowrap">{displayVal}</strong>
                  </p>
                  <span
                    aria-hidden="true"
                    className="relative block h-3.5 rounded bg-[#eef0eb]"
                  >
                    <span
                      className="absolute left-0 top-0 bottom-0 min-w-[3px] rounded bg-brand-900"
                      style={{ width: `${barPercent}%` }}
                    />
                    {prevPercent !== undefined && (
                      <span
                        className="absolute -top-[3px] -bottom-[3px] w-0.5 bg-[#a8862a]"
                        style={{ left: `${prevPercent}%` }}
                        title={item.lalu !== undefined ? `Periode lalu: ${item.lalu}` : undefined}
                      />
                    )}
                  </span>
                  {item.ket && (
                    <p className="m-0 mt-1 text-xs leading-[1.5] text-[#5a6b60]">
                      {item.ket}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="m-0 mt-3 text-xs text-[#5a6b60]">
            <span
              aria-hidden="true"
              className="inline-block w-0.5 h-[11px] mr-1.5 align-[-1px] bg-[#a8862a]"
            />
            Garis tegak emas menunjukkan capaian periode lalu.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{judul}</caption>
            <thead>
              <tr className="border-b-[1.5px] border-line text-left text-xs text-[#5a6b60]">
                <th className="py-2 pr-3 font-bold">Item</th>
                <th className="py-2 px-3 text-right font-bold">Periode Ini</th>
                <th className="py-2 px-3 text-right font-bold">Periode Lalu</th>
                <th className="py-2 pl-3 font-bold">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx} className="border-b border-[#eef0eb]">
                  <td className="py-2.5 pr-3 font-semibold text-ink">{item.label}</td>
                  <td className="py-2.5 px-3 text-right font-extrabold tabular-nums text-ink">
                    {item.teks ?? `${item.nilai.toLocaleString('id-ID')} ${satuan}`}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[#5a6b60]">
                    {item.lalu !== undefined ? `${item.lalu.toLocaleString('id-ID')} ${satuan}` : '-'}
                  </td>
                  <td className="py-2.5 pl-3 text-xs text-[#5a6b60]">
                    {item.ket ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

export default Grafik;
