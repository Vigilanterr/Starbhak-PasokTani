/** Kontainer halaman katalog (1200px), sama dengan halaman publik lain. */
export const KONTAINER = "mx-auto w-full max-w-300 px-4 md:px-6";

export type VarianTombolGelap = "terang" | "garis";

const dasar =
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-[10px] px-6 text-base font-semibold no-underline " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint/70";

const varian: Record<VarianTombolGelap, string> = {
  terang: "bg-mint text-brand-900 hover:bg-white",
  garis: "border-[1.5px] border-white/45 text-white hover:border-white hover:bg-white/10",
};

/**
 * Varian lokal `kelasTombolSitus` untuk latar gelap (`bg-brand-900`): kontras teks lebih tinggi
 * daripada varian "aksen", dan cincin fokus mint agar terlihat di atas hijau tua.
 */
export function kelasTombolGelap(v: VarianTombolGelap = "terang"): string {
  return `${dasar} ${varian[v]}`;
}
