"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { IkonDaun, IkonPanahBawah } from "@/app/(auth)/_komponen/ikon";
import { IkonCari, IkonPengguna, IkonPerisai, IkonTruk } from "@/app/_komponen/ikon";
import { FAQ, TOPIK, type IdTopik } from "./data-bantuan";

type IkonKomponen = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const IKON_TOPIK: Record<IdTopik, IkonKomponen> = {
  akun: IkonPengguna,
  pasokan: IkonDaun,
  transaksi: IkonTruk,
  keamanan: IkonPerisai,
};

/** Pencarian, pilihan topik, dan daftar FAQ berbagi satu state, jadi dirender bersama. */
export function PusatBantuan() {
  const [kata, setKata] = useState("");
  const [topik, setTopik] = useState<IdTopik | null>(null);
  const [terbuka, setTerbuka] = useState<string | null>(FAQ[0]?.id ?? null);

  const cari = kata.trim().toLowerCase();
  const hasil = FAQ.filter(
    (f) =>
      (topik === null || f.topik === topik) &&
      (cari === "" || f.tanya.toLowerCase().includes(cari) || f.jawab.toLowerCase().includes(cari)),
  );

  return (
    <>
      <section className="bg-tint px-4 pt-14 pb-12 text-center md:pt-18 md:pb-14">
        <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Pusat bantuan</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-brand-900 md:text-[44px] md:leading-tight">
          Ada yang bisa kami bantu?
        </h1>
        <p className="mt-3 text-base text-muted">Temukan jawaban seputar akun, pasokan, dan transaksi di Pasok Tani.</p>

        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-7 flex max-w-150 items-center gap-3 rounded-xl border border-line bg-white py-2 pr-2 pl-5 focus-within:border-brand-600"
        >
          <IkonCari size={20} className="shrink-0 text-muted" />
          <input
            type="search"
            value={kata}
            onChange={(e) => setKata(e.target.value)}
            aria-label="Cari pertanyaan"
            placeholder="Cari pertanyaan, misalnya “cara mengubah harga”"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-placeholder"
          />
          <button
            type="submit"
            className="h-10 shrink-0 cursor-pointer rounded-lg bg-brand-900 px-5 text-[15px] font-semibold text-white hover:bg-[#053f30] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
          >
            Cari
          </button>
        </form>
      </section>

      <div className="mx-auto max-w-260 px-4 py-12 md:px-0 md:py-16">
        <h2 className="text-2xl font-bold tracking-tight text-brand-900">Pilih topik</h2>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TOPIK.map((t) => {
            const Ikon = IKON_TOPIK[t.id];
            const dipilih = topik === t.id;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  aria-pressed={dipilih}
                  onClick={() => setTopik(dipilih ? null : t.id)}
                  className={`h-full w-full cursor-pointer rounded-2xl border bg-white p-6 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 ${
                    dipilih ? "border-brand-900 ring-1 ring-brand-900" : "border-line hover:border-brand-600"
                  }`}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-tint text-brand-900">
                    <Ikon size={20} />
                  </span>
                  <span className="mt-4 block text-lg font-semibold text-ink">{t.judul}</span>
                  <span className="mt-2 block text-sm leading-normal text-muted">{t.deskripsi}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <h2 className="mt-16 text-2xl font-bold tracking-tight text-brand-900 md:mt-20">Pertanyaan yang sering diajukan</h2>

        {hasil.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-line bg-white px-7 py-8 text-center text-[15px] text-muted">
            Tidak ada pertanyaan yang cocok. Coba kata kunci lain atau hubungi tim kami.
          </p>
        ) : (
          <ul className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
            {hasil.map((f) => {
              const buka = terbuka === f.id;
              return (
                <li key={f.id} className="border-b border-line last:border-b-0">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={buka}
                      aria-controls={`faq-${f.id}`}
                      onClick={() => setTerbuka(buka ? null : f.id)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 px-7 py-5 text-left text-[17px] font-semibold text-ink focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand-600/45"
                    >
                      {f.tanya}
                      <IkonPanahBawah size={20} className={`shrink-0 text-brand-900 ${buka ? "rotate-180" : ""}`} />
                    </button>
                  </h3>
                  {buka && (
                    <p id={`faq-${f.id}`} className="-mt-2 px-7 pb-5 text-[15px] leading-relaxed text-muted">
                      {f.jawab}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
