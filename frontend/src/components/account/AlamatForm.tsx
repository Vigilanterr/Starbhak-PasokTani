'use client';

import React, { useState } from 'react';

export interface AlamatPengiriman {
  id: string;
  label: string;
  penerima: string;
  jalan: string;
  area: string;
  patokan?: string;
  pin: boolean;
  koordinat?: { lat: number; lng: number };
  isUtama?: boolean;
}

export interface AlamatFormProps {
  mode?: 'tambah' | 'ubah';
  alamatAwal?: Partial<AlamatPengiriman>;
  onSimpan?: (data: Partial<AlamatPengiriman>) => Promise<void> | void;
  onTutup?: () => void;
  className?: string;
}

interface AreaItem {
  nama: string;
  ket: string;
  lengkap: string;
}

const DAFTAR_AREA: AreaItem[] = [
  {
    nama: 'Cigadung',
    ket: 'Kec. Cibeunying Kaler, Kota Bandung · 40191',
    lengkap: 'Cibeunying Kaler, Kota Bandung, Jawa Barat 40191',
  },
  {
    nama: 'Cigending',
    ket: 'Kec. Ujung Berung, Kota Bandung · 40611',
    lengkap: 'Ujung Berung, Kota Bandung, Jawa Barat 40611',
  },
  {
    nama: 'Cigasong',
    ket: 'Kec. Cigasong, Kab. Majalengka',
    lengkap: 'Cigasong, Kab. Majalengka, Jawa Barat',
  },
];

const DAFTAR_LABEL = [
  { id: 'rumah', nama: 'Rumah' },
  { id: 'warung', nama: 'Warung' },
  { id: 'kantor', nama: 'Kantor' },
  { id: 'lainnya', nama: 'Lainnya' },
];

export function AlamatForm({
  mode = 'tambah',
  alamatAwal,
  onSimpan,
  onTutup,
  className = '',
}: AlamatFormProps) {
  const ubah = mode === 'ubah';

  const [label, setLabel] = useState<string>(
    alamatAwal?.label?.toLowerCase() ?? (ubah ? 'warung' : 'rumah')
  );
  const [nama, setNama] = useState<string>(
    alamatAwal?.penerima?.split(' · ')[0] ?? 'Dewi Lestari'
  );
  const [hp, setHp] = useState<string>(
    alamatAwal?.penerima?.split(' · ')[1] ?? '0812-3456-7890'
  );
  const [areaObj, setAreaObj] = useState<AreaItem | null>(
    ubah ? DAFTAR_AREA[0] ?? null : null
  );
  const [cari, setCari] = useState<string>('Ciga');
  const [alamat, setAlamat] = useState<string>(
    alamatAwal?.jalan ?? (ubah ? 'Jl. Cigadung Raya Timur No. 18, RT 03/RW 07' : '')
  );
  const [patokanBuka, setPatokanBuka] = useState<boolean>(
    Boolean(alamatAwal?.patokan) || ubah
  );
  const [patokan, setPatokan] = useState<string>(
    alamatAwal?.patokan ?? (ubah ? 'Depan Masjid Al-Ikhlas, pagar hijau' : '')
  );
  const [pin, setPin] = useState<boolean>(alamatAwal?.pin ?? ubah);
  const [utama, setUtama] = useState<boolean>(alamatAwal?.isUtama ?? ubah);

  const q = String(cari || '').trim().toLowerCase();
  const saran = DAFTAR_AREA.filter(
    (x) =>
      q.length >= 2 &&
      (x.nama.toLowerCase().startsWith(q) || x.ket.toLowerCase().includes(q))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSimpan) {
      await onSimpan({
        label: DAFTAR_LABEL.find((l) => l.id === label)?.nama ?? label,
        penerima: `${nama} · ${hp}`,
        jalan: alamat,
        area: areaObj ? `${areaObj.nama}, ${areaObj.lengkap}` : cari,
        patokan: patokanBuka ? patokan : undefined,
        pin,
        isUtama: utama,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`box-border w-full flex flex-col gap-4.5 font-sans text-ink ${className}`}
    >
      <div>
        <h2 className="m-0 text-xl font-extrabold text-ink">
          {ubah ? 'Ubah alamat' : 'Tambah alamat'}
        </h2>
        <p className="mt-1.5 text-[13px] leading-[1.5] text-[#5a6b60]">
          Tanda{' '}
          <span aria-hidden="true" className="text-danger font-extrabold">
            *
          </span>{' '}
          wajib diisi. Pengiriman saat ini hanya di Jawa Barat.
        </p>
      </div>

      {/* Label Alamat */}
      <fieldset className="m-0 p-0 border-0">
        <legend className="p-0 mb-2 text-sm font-bold text-ink">
          Label alamat{' '}
          <span aria-hidden="true" className="text-danger">
            *
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {DAFTAR_LABEL.map((lb) => {
            const isSelected = label === lb.id;
            return (
              <label
                key={lb.id}
                className={`inline-flex items-center gap-2 min-h-11 px-3.5 rounded-full text-sm font-bold cursor-pointer ${
                  isSelected
                    ? 'border-2 border-brand-900 bg-[#f3faf3] text-brand-900'
                    : 'border border-line bg-white text-ink'
                }`}
              >
                <input
                  type="radio"
                  name="label-alamat"
                  checked={isSelected}
                  onChange={() => setLabel(lb.id)}
                  className="w-4.5 h-4.5 m-0 accent-brand-900 cursor-pointer"
                />
                {lb.nama}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Nama & HP Penerima */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="af-nama" className="text-sm font-bold text-ink">
            Nama penerima{' '}
            <span aria-hidden="true" className="text-danger">
              *
            </span>
          </label>
          <input
            id="af-nama"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            autoComplete="name"
            required
            className="h-12 box-border px-3.5 border-[1.5px] border-field-border rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="af-hp" className="text-sm font-bold text-ink">
            Nomor HP penerima{' '}
            <span aria-hidden="true" className="text-danger">
              *
            </span>
          </label>
          <input
            id="af-hp"
            type="tel"
            inputMode="tel"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            autoComplete="tel"
            aria-describedby="af-hp-ket"
            required
            className="h-12 box-border px-3.5 border-[1.5px] border-field-border rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
          />
          <span id="af-hp-ket" className="text-xs text-[#5a6b60]">
            Dihubungi kurir saat mengantar.
          </span>
        </div>
      </div>

      {/* Kelurahan / Kecamatan */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="af-area" className="text-sm font-bold text-ink">
          Kelurahan atau kecamatan{' '}
          <span aria-hidden="true" className="text-danger">
            *
          </span>
        </label>
        {areaObj ? (
          <div className="flex items-center justify-between gap-2.5 min-h-12 p-2 pl-3.5 box-border border-[1.5px] border-[#157a4c] rounded-xl bg-[#f3faf3]">
            <span className="text-[15px] leading-[1.4]">
              <strong>{areaObj.nama}</strong>, {areaObj.lengkap}
            </span>
            <button
              type="button"
              onClick={() => {
                setAreaObj(null);
                setCari('');
              }}
              className="shrink-0 min-h-9 px-3 border border-[#a9cfae] rounded-lg bg-white text-brand-900 text-[13px] font-extrabold cursor-pointer hover:bg-cream"
            >
              Ganti
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5a6b60"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="absolute left-3.5 top-[15px]"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                id="af-area"
                type="search"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Ketik nama kelurahan, kecamatan, atau kode pos"
                aria-describedby="af-area-ket"
                className="w-full h-12 box-border pl-10 pr-3.5 border-[1.5px] border-brand-900 rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
              />
            </div>
            {saran.length > 0 && (
              <ul
                aria-label="Pilihan area"
                className="list-none m-0 p-1 border border-line rounded-xl bg-white shadow-[0_10px_24px_rgba(6,78,59,0.08)]"
              >
                {saran.map((sr, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => {
                        setAreaObj(sr);
                        setCari(sr.nama);
                      }}
                      className="w-full min-h-[52px] flex flex-col items-start justify-center gap-px px-2.5 py-1.5 border-0 rounded-lg bg-transparent text-ink text-left cursor-pointer hover:bg-tint"
                    >
                      <span className="text-[15px] font-extrabold">
                        {sr.nama}
                      </span>
                      <span className="text-xs text-[#5a6b60]">{sr.ket}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <span
          id="af-area-ket"
          className="text-xs leading-[1.5] text-[#5a6b60]"
        >
          Kurir menghitung ongkir dari kecamatan. Provinsi terisi Jawa Barat.
        </span>
      </div>

      {/* Alamat Lengkap */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="af-alamat" className="text-sm font-bold text-ink">
          Alamat lengkap{' '}
          <span aria-hidden="true" className="text-danger">
            *
          </span>
        </label>
        <textarea
          id="af-alamat"
          rows={2}
          autoComplete="street-address"
          placeholder="Nama jalan, nomor rumah, RT/RW, nama gedung"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          required
          className="box-border w-full p-3 px-3.5 border-[1.5px] border-field-border rounded-xl bg-white text-ink text-base leading-[1.5] resize-y focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
        />
      </div>

      {/* Patokan untuk Kurir */}
      <div className="flex flex-col gap-1.5">
        {!patokanBuka ? (
          <button
            type="button"
            aria-expanded="false"
            onClick={() => setPatokanBuka(true)}
            className="self-start inline-flex items-center gap-1.5 min-h-10 px-0.5 border-0 bg-transparent text-[#157a4c] text-sm font-bold cursor-pointer hover:underline"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Tambah patokan untuk kurir (opsional)
          </button>
        ) : (
          <>
            <label
              htmlFor="af-patokan"
              className="text-sm font-bold text-ink"
            >
              Patokan untuk kurir{' '}
              <span className="font-medium text-[#5a6b60]">(opsional)</span>
            </label>
            <input
              id="af-patokan"
              type="text"
              value={patokan}
              onChange={(e) => setPatokan(e.target.value)}
              placeholder="Contoh: depan masjid, pagar hijau"
              className="h-12 box-border px-3.5 border-[1.5px] border-field-border rounded-xl bg-white text-ink text-base focus:outline-none focus:ring-2 focus:ring-[#157a4c]"
            />
          </>
        )}
      </div>

      {/* Titik Lokasi Peta Mock */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-ink">
          Titik lokasi{' '}
          <span className="font-medium text-[#5a6b60]">
            (opsional, perlu untuk kurir instan)
          </span>
        </span>
        <div
          role="img"
          aria-label={
            pin
              ? 'Contoh peta dengan titik lokasi terpasang'
              : 'Contoh peta, belum ada titik lokasi'
          }
          className="relative h-[150px] border border-line rounded-xl bg-[#e9f1e4] overflow-hidden"
        >
          {/* Roads styling */}
          <span className="absolute -left-[10%] top-[58%] w-[120%] h-2.5 bg-white -rotate-[8deg]" />
          <span className="absolute left-[38%] -top-[10%] w-2.5 h-[130%] bg-white rotate-[12deg]" />
          <span className="absolute left-[62%] top-[20%] w-[26%] h-[22%] rounded-lg bg-[#d4e6cc]" />
          <span className="absolute left-[8%] top-[12%] w-[22%] h-[30%] rounded-lg bg-[#d4e6cc]" />

          {/* Map Pin */}
          {pin && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[88%] text-brand-900">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="#d5f6d5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
          )}

          <span className="absolute right-2 bottom-2 px-1.5 py-px border border-dashed border-[#c2a032] rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
            Contoh peta
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPin(!pin)}
            className="inline-flex items-center gap-2 min-h-11 px-3.5 border-[1.5px] border-brand-900 rounded-xl bg-white text-brand-900 text-sm font-extrabold cursor-pointer hover:bg-cream"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="2" x2="5" y1="12" y2="12" />
              <line x1="19" x2="22" y1="12" y2="12" />
              <line x1="12" x2="12" y1="2" y2="5" />
              <line x1="12" x2="12" y1="19" y2="22" />
              <circle cx="12" cy="12" r="7" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {pin ? 'Geser titik' : 'Pasang titik di peta'}
          </button>
          <span className="text-xs leading-[1.5] text-[#5a6b60]">
            {pin
              ? 'Titik terpasang. Kurir instan tersedia untuk alamat ini.'
              : 'Tanpa titik, kurir reguler dan diantar petani tetap bisa dipilih.'}
          </span>
        </div>
      </div>

      {/* Jadikan Alamat Utama */}
      <label className="flex items-center gap-2.5 min-h-11 text-[15px] font-semibold cursor-pointer">
        <input
          type="checkbox"
          checked={utama}
          onChange={(e) => setUtama(e.target.checked)}
          className="w-5 h-5 m-0 accent-brand-900 cursor-pointer"
        />
        Jadikan alamat utama
      </label>

      {/* Tombol Simpan & Batal */}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="submit"
          className="flex-[1_1_200px] min-h-[52px] border-0 rounded-xl bg-brand-900 text-white text-base font-extrabold cursor-pointer hover:bg-brand-600"
        >
          Simpan alamat
        </button>
        <button
          type="button"
          onClick={onTutup}
          className="flex-[0_1_140px] min-h-[52px] border-[1.5px] border-line rounded-xl bg-white text-ink text-[15px] font-bold cursor-pointer hover:bg-cream"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

export default AlamatForm;
