"use client";

import { useState } from "react";
import type { FotoStok, IkonKategori } from "@/lib/api/tipe";
import { TANGGAL_ACUAN } from "@/lib/api/acuan";
import { selisihHari, tanggal, tanggalPendek } from "@/lib/format";
import { IkonKamera } from "@/app/_komponen/ikon";
import { FotoKomoditas } from "@/app/(publik)/_komponen/foto-komoditas";

type Props = {
  foto: FotoStok[];
  ikon: IkonKategori;
  nama: string;
  habis: boolean;
};

function labelDiunggah(iso: string): string {
  const n = selisihHari(iso, TANGGAL_ACUAN);
  if (n <= 0) return "hari ini";
  if (n === 1) return "kemarin";
  return `${n} hari lalu`;
}

/** Foto stok asli per batch, masing-masing berlabel tanggal unggah agar pembeli bisa menilai kesegaran (S2). */
export function GaleriFoto({ foto, ikon, nama, habis }: Props) {
  const [aktif, setAktif] = useState(0);
  const pilihan = foto[aktif] ?? foto[0];

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-line">
        <FotoKomoditas
          ikon={ikon}
          alt={pilihan ? `Foto stok ${nama}: ${pilihan.keterangan}` : `Belum ada foto stok ${nama}`}
          src={pilihan?.src}
          ukuranIkon={88}
          prioritas
          sizes="(min-width: 1280px) 720px, (min-width: 1024px) 55vw, 100vw"
          className={`aspect-[4/3] w-full ${habis ? "grayscale-[0.6]" : ""}`}
        />
        {pilihan && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
            <IkonKamera size={14} className="text-brand-600" />
            Diunggah {tanggal(pilihan.diunggah)}
          </span>
        )}
        {habis && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-2 text-center text-sm font-semibold tracking-wide text-white">
            Stok habis
          </span>
        )}
      </div>

      <p className="mt-2.5 text-[13px] leading-snug text-muted">
        {pilihan ? (
          <>
            <span className="font-medium text-ink">{pilihan.keterangan}</span> · diunggah {labelDiunggah(pilihan.diunggah)}.
            Foto asli stok yang dijual, bukan ilustrasi.
          </>
        ) : (
          "Petani belum mengunggah foto untuk batch ini."
        )}
      </p>

      {foto.length > 1 && (
        <ul aria-label="Pilih foto stok" className="mt-3 flex snap-x gap-2.5 overflow-x-auto pb-1">
          {foto.map((f, n) => {
            const dipilih = n === aktif;
            return (
              <li key={`${f.diunggah}-${n}`} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => setAktif(n)}
                  aria-pressed={dipilih}
                  aria-label={`Foto ${n + 1} dari ${foto.length}: ${f.keterangan}, diunggah ${tanggal(f.diunggah)}`}
                  className={`block w-20 cursor-pointer overflow-hidden rounded-xl border-2 bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 ${
                    dipilih ? "border-brand-900" : "border-line hover:border-brand-600"
                  }`}
                >
                  <span aria-hidden className="block">
                    <FotoKomoditas ikon={ikon} alt="" src={f.src} ukuranIkon={22} sizes="80px" className="aspect-square w-full" />
                    <span className="block py-0.5 text-center text-[11px] font-medium text-ink">{tanggalPendek(f.diunggah)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
