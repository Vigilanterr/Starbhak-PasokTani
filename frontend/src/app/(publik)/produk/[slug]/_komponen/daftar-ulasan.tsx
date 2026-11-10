"use client";

import { useState } from "react";
import type { Ulasan } from "@/lib/api/tipe";
import { angka, tanggal } from "@/lib/format";
import { IkonKamera } from "@/app/_komponen/ikon";
import { Bintang } from "@/app/(publik)/_komponen/bintang";
import { inisial } from "@/app/(publik)/_komponen/kartu-petani";

type Saring = "semua" | "foto" | Ulasan["bintang"];

const PER_MUAT = 5;
const BINTANG: Ulasan["bintang"][] = [5, 4, 3, 2, 1];

function cocok(u: Ulasan, saring: Saring): boolean {
  if (saring === "semua") return true;
  if (saring === "foto") return u.adaFoto;
  return u.bintang === saring;
}

/** Chip saring + daftar ulasan (S3). Data sudah lengkap dari server, penyaringan cukup di klien. */
export function DaftarUlasan({ ulasan, namaToko }: { ulasan: Ulasan[]; namaToko: string }) {
  const [saring, setSaring] = useState<Saring>("semua");
  const [jumlahTampil, setJumlahTampil] = useState(PER_MUAT);

  const chip: { id: Saring; label: string; jumlah: number }[] = [
    { id: "semua", label: "Semua", jumlah: ulasan.length },
    { id: "foto", label: "Dengan foto", jumlah: ulasan.filter((u) => u.adaFoto).length },
    ...BINTANG.map((b) => ({ id: b, label: `${b} bintang`, jumlah: ulasan.filter((u) => u.bintang === b).length })),
  ];
  const hasil = ulasan.filter((u) => cocok(u, saring));
  const tampil = hasil.slice(0, jumlahTampil);
  const sisa = hasil.length - tampil.length;

  function pilih(id: Saring) {
    setSaring(id);
    setJumlahTampil(PER_MUAT);
  }

  return (
    <div className="mt-6">
      <div
        role="group"
        aria-label="Saring ulasan"
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
      >
        {chip.map((c) => {
          const dipilih = saring === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={dipilih}
              disabled={c.id !== "semua" && c.jumlah === 0}
              onClick={() => pilih(c.id)}
              className={`inline-flex h-11 shrink-0 cursor-pointer snap-start items-center gap-1.5 rounded-full border px-4 text-sm font-semibold whitespace-nowrap focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 disabled:cursor-not-allowed disabled:opacity-45 ${
                dipilih ? "border-brand-900 bg-brand-900 text-white" : "border-line bg-white text-ink hover:border-brand-600"
              }`}
            >
              {c.label}
              <span className={dipilih ? "text-white/80" : "text-muted"}>({angka(c.jumlah)})</span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        Menampilkan {angka(hasil.length)} ulasan
      </p>

      {hasil.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line bg-white px-6 py-8 text-center text-[15px] text-muted">
          {ulasan.length === 0 ? "Ulasan belum bisa ditampilkan." : "Belum ada ulasan yang cocok dengan pilihan ini."}
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {tampil.map((u) => (
            <li key={u.id} className="py-5">
              <article className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold text-brand-900"
                >
                  {inisial(u.nama)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold text-ink">
                    {u.nama}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        u.peran === "umkm" ? "bg-[#e0f2fe] text-[#075985]" : "bg-[#eef1ec] text-ink"
                      }`}
                    >
                      {u.peran === "umkm" ? "UMKM" : "Konsumen"}
                    </span>
                  </h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    <Bintang nilai={u.bintang} ukuran={14} />
                    <time dateTime={u.tanggal}>{tanggal(u.tanggal)}</time>
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink">{u.komentar}</p>
                  {u.adaFoto && (
                    <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-ink ring-1 ring-line">
                      <IkonKamera size={14} className="text-brand-600" />
                      Ada foto
                    </p>
                  )}
                  {u.balasan && (
                    <div className="mt-3 rounded-xl border-l-3 border-brand-600 bg-tint px-4 py-3">
                      <p className="text-xs font-semibold text-brand-900">
                        Balasan {namaToko}
                        <span className="font-normal text-muted">
                          {" "}
                          · <time dateTime={u.balasan.tanggal}>{tanggal(u.balasan.tanggal)}</time>
                        </span>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink">{u.balasan.isi}</p>
                    </div>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {sisa > 0 && (
        <button
          type="button"
          onClick={() => setJumlahTampil((n) => n + PER_MUAT)}
          className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-[10px] border border-line bg-white px-5 text-[15px] font-semibold text-brand-900 hover:bg-tint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 sm:w-auto"
        >
          Tampilkan {angka(Math.min(sisa, PER_MUAT))} ulasan lagi
        </button>
      )}
    </div>
  );
}
