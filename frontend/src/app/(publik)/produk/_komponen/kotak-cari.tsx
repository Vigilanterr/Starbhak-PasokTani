import Form from "next/form";
import { IkonCari } from "@/app/_komponen/ikon";

/** Kotak cari produk (GET ke /cari). Pencarian baru sengaja tidak membawa filter lama. */
export function KotakCari({ q, className = "" }: { q?: string; className?: string }) {
  return (
    <Form
      action="/cari"
      role="search"
      aria-label="Cari produk"
      className={`flex h-14 items-center gap-2 rounded-xl border border-line bg-white py-2 pr-2 pl-4 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/25 ${className}`}
    >
      <IkonCari size={20} className="shrink-0 text-muted" />
      <label htmlFor="kueri-produk" className="sr-only">
        Cari produk
      </label>
      {/* `key`: input tak terkendali; pasang ulang saat kata kunci di URL berubah. */}
      <input
        key={q ?? ""}
        id="kueri-produk"
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Cari cabai, tomat, beras…"
        enterKeyHint="search"
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-placeholder"
      />
      <button
        type="submit"
        className="h-10 shrink-0 cursor-pointer rounded-lg bg-brand-900 px-5 text-[15px] font-semibold text-white hover:bg-[#053f30] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
      >
        Cari
      </button>
    </Form>
  );
}
