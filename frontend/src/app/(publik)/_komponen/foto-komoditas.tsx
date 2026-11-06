import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import type { IkonKategori } from "@/lib/api/tipe";
import { IkonBuah, IkonCabai, IkonDaun, IkonJamur, IkonPadi, IkonUmbi } from "@/app/_komponen/ikon";

type Ikon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export const IKON_KATEGORI: Record<IkonKategori, Ikon> = {
  sayuran: IkonDaun,
  buah: IkonBuah,
  rempah: IkonCabai,
  padi: IkonPadi,
  umbi: IkonUmbi,
  jamur: IkonJamur,
};

/** Warna latar + ikon per kategori untuk placeholder foto. */
export const WARNA_KATEGORI: Record<IkonKategori, { latar: string; ikon: string }> = {
  sayuran: { latar: "bg-[#e3f1df]", ikon: "text-[#2f7a3e]" },
  buah: { latar: "bg-[#fde9d9]", ikon: "text-[#c2541c]" },
  rempah: { latar: "bg-[#fbe3df]", ikon: "text-[#b42318]" },
  padi: { latar: "bg-[#f5eed6]", ikon: "text-[#8a6d1c]" },
  umbi: { latar: "bg-[#f3e7da]", ikon: "text-[#8b5a2b]" },
  jamur: { latar: "bg-[#ece8e1]", ikon: "text-[#6b5e4f]" },
};

type Props = {
  ikon: IkonKategori;
  /** Teks alternatif, mis. nama produk. */
  alt: string;
  src?: string | null;
  /** Ukuran ikon placeholder. */
  ukuranIkon?: number;
  className?: string;
  sizes?: string;
  prioritas?: boolean;
};

/**
 * Foto stok produk / lahan. Data tiruan belum punya aset gambar (`src: null`), jadi
 * ditampilkan placeholder berwarna sesuai kategori. Wadah induk menentukan ukuran (pakai aspect-*).
 */
export function FotoKomoditas({ ikon, alt, src, ukuranIkon = 44, className = "", sizes, prioritas }: Props) {
  const warna = WARNA_KATEGORI[ikon];
  const Ikon = IKON_KATEGORI[ikon];
  if (src) {
    return (
      <div className={`relative overflow-hidden ${warna.latar} ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"} priority={prioritas} className="object-cover" />
      </div>
    );
  }
  return (
    <div role="img" aria-label={alt} className={`relative grid place-items-center overflow-hidden ${warna.latar} ${className}`}>
      <span
        aria-hidden
        className={`absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1.5px)] bg-size-[14px_14px] opacity-25 ${warna.ikon}`}
      />
      <Ikon size={ukuranIkon} strokeWidth={1.5} className={`relative ${warna.ikon}`} />
    </div>
  );
}
