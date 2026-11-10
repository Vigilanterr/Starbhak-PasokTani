export type VarianTombolSitus = "utama" | "aksen" | "garis";

const dasar =
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-[10px] px-6 text-base font-semibold no-underline " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45";

const varian: Record<VarianTombolSitus, string> = {
  utama: "bg-brand-900 text-white hover:bg-[#053f30]",
  aksen: "bg-accent text-white hover:bg-accent-hover",
  garis: "border-[1.5px] border-brand-900 bg-white text-brand-900 hover:bg-tint",
};

/** Tombol untuk halaman publik; dipakai untuk <button> maupun <Link>. */
export function kelasTombolSitus(v: VarianTombolSitus = "utama"): string {
  return `${dasar} ${varian[v]}`;
}
