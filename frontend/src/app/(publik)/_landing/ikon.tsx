import type { SVGProps } from "react";

const PATH = {
  petani: "M12 3c2 3 2 6 0 9-2-3-2-6 0-9zM12 12v9M7 21h10M6 9c3 0 5 2 6 5M18 9c-3 0-5 2-6 5",
  pengumpul: "M4 8l8-4 8 4-8 4-8-4zM4 8v8l8 4 8-4V8M12 12v8",
  pedagang: "M4 9h16l-1 11H5L4 9zM4 9l2-5h12l2 5M9 13v3M15 13v3",
  distributor: "M2 7h11v9H2zM13 10h4l3 3v3h-7M6 19a1.5 1.5 0 100-.01M17 19a1.5 1.5 0 100-.01",
  pembeli: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6",
  harga: "M4 5h16v14H4zM4 10h16M9 5v14",
  cari: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5",
  temu: "M4 8h14l-3-3M20 16H6l3 3",
  kirim: "M5 12l4 4L19 6M3 19h18",
} as const;

export type NamaIkon = keyof typeof PATH;

export function Ikon({ nama, ...p }: { nama: NamaIkon } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d={PATH[nama]} />
    </svg>
  );
}
