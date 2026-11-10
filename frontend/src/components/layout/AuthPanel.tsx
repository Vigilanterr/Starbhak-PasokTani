export type VarianAuth = 'umum' | 'pembeli' | 'petani';
export type VarianAuthPanel = VarianAuth;

export interface TestimoniAuth {
  kutipan: string;
  nama: string;
  peran: string;
}

export interface AuthPanelProps {
  varian?: VarianAuth;
  judul?: string;
  subtitel?: string;
  testimoni?: TestimoniAuth;
  judulKustom?: string;
  poinKustom?: string[];
  fotoKustom?: string;
  className?: string;
}

interface VarianData {
  foto: string;
  judul: string;
  poin: string[];
}

const VARIAN_MAP: Record<VarianAuth, VarianData> = {
  umum: {
    foto: '/images/landingpage/hero/sawah-terasering.png',
    judul: 'Dari ladang, langsung ke dapur.',
    poin: [
      'Foto stok asli dengan tanggal panen',
      'Dana ditahan sampai pesanan kamu terima',
      'Petani dari seluruh Jawa Barat',
    ],
  },
  pembeli: {
    foto: '/images/landingpage/umkm/warung-makan.png',
    judul: 'Belanja dari petani, bayar dengan aman.',
    poin: [
      'Harga grosir otomatis saat jumlah naik',
      'Keranjang Resep untuk belanja rutin usaha',
      'Komitmen sebelum panen agar kebagian stok',
    ],
  },
  petani: {
    foto: '/images/landingpage/petani/petani-karung-padi.png',
    judul: 'Jual hasil panen, bahkan sebelum dipanen.',
    poin: [
      'Daftar gratis dan langsung bisa berjualan',
      'Komitmen pembeli jadi sinyal sebelum panen',
      'Dana masuk setelah pembeli menerima pesanan',
    ],
  },
};

export function AuthPanel({
  varian = 'umum',
  judul: judulProp,
  subtitel,
  testimoni,
  judulKustom,
  poinKustom,
  fotoKustom,
  className = '',
}: AuthPanelProps) {
  const currentVarian = (varian && VARIAN_MAP[varian]) ? VARIAN_MAP[varian]! : VARIAN_MAP.umum;

  const resolvedFoto = fotoKustom ?? currentVarian.foto;
  const resolvedJudul = judulKustom ?? judulProp ?? currentVarian.judul;
  const resolvedPoin = poinKustom ?? currentVarian.poin;

  return (
    <div
      className={`relative box-border w-full h-full min-h-[680px] rounded-[28px] overflow-hidden bg-[#10291e] font-sans ${className}`}
    >
      {/* Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedFoto}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* "Foto contoh" badge */}
      <span className="absolute top-4 left-4 px-2 py-0.5 border border-dashed border-[#c2a032] rounded-md bg-[#fbf3d9] text-[#5c4500] text-xs font-bold">
        Foto contoh
      </span>

      {/* Floating Card */}
      <div className="absolute left-6 right-6 bottom-6 box-border p-6 rounded-[20px] bg-white shadow-[0_18px_40px_rgba(6,78,59,0.18)]">
        <p className="m-0 font-['Bricolage_Grotesque',sans-serif] text-[30px] leading-[1.02] font-extrabold tracking-[-0.03em] text-[#10291e] text-balance">
          {resolvedJudul}
        </p>

        {subtitel && (
          <p className="mt-2 text-sm text-[#3f5247]">
            {subtitel}
          </p>
        )}

        <ul className="list-none m-0 mt-4 p-0 flex flex-col gap-2.5">
          {resolvedPoin.map((pointText, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-[15px] leading-[1.45] text-ink"
            >
              <span
                aria-hidden="true"
                className="shrink-0 w-[22px] h-[22px] mt-px rounded-full grid place-items-center bg-mint text-brand-900"
              >
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
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span>{pointText}</span>
            </li>
          ))}
        </ul>

        {testimoni && (
          <div className="mt-4 pt-3 border-t border-[#eef0eb]">
            <p className="m-0 italic text-sm text-[#3f5247]">
              &ldquo;{testimoni.kutipan}&rdquo;
            </p>
            <p className="m-0 mt-1 text-xs font-bold text-ink">
              {testimoni.nama} · <span className="text-[#5a6b60] font-normal">{testimoni.peran}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPanel;
