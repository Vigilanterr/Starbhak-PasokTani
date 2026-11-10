export type VarianTombol = "utama" | "google" | "garis";

const dasar =
  "flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] text-base font-semibold no-underline " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 " +
  "disabled:cursor-not-allowed disabled:border disabled:border-line disabled:bg-[#eef1ec] disabled:text-[#5c665e]";

const varian: Record<VarianTombol, string> = {
  utama: "bg-brand-900 text-white hover:bg-[#053f30]",
  google: "border border-field-border bg-white text-ink hover:bg-[#f6f8f5]",
  garis: "border-[1.5px] border-brand-900 bg-white text-brand-900",
};

/** Dipakai untuk <button> maupun <Link> agar tampilannya sama. */
export function kelasTombol(v: VarianTombol = "utama"): string {
  return `${dasar} ${varian[v]}`;
}
