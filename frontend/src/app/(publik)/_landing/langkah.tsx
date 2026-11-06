"use client";

import { useState } from "react";
import { KONTAINER } from "../_beranda/kelas";

const LANGKAH = {
  petani: [
    ["Daftarkan diri", "Mulai dengan profil petani dan lokasi lahan Anda."],
    ["Tampilkan hasil panen", "Lengkapi komoditas, harga, jumlah, kualitas, dan waktu panen."],
    ["Terhubung dengan UMKM", "Diskusikan kebutuhan pembeli dan pasokan yang sesuai."],
    ["Sepakati bersama", "Tentukan transaksi, jadwal, dan cara pengiriman."],
  ],
  umkm: [
    ["Daftarkan usaha", "Buat profil usaha dan kebutuhan bahan baku Anda."],
    ["Cari pasokan", "Telusuri komoditas, harga, kualitas, dan lokasi petani."],
    ["Hubungi petani", "Diskusikan jumlah dan waktu ketersediaan langsung."],
    ["Sepakati bersama", "Tentukan transaksi, jadwal, dan cara pengiriman."],
  ],
} as const;

const MANFAAT: Record<keyof typeof LANGKAH, string[]> = {
  petani: [
    "Tampilkan hasil panen dengan harga dan jumlah yang jelas",
    "Temukan pembeli yang sesuai dengan komoditas Anda",
    "Rencanakan panen berdasarkan kebutuhan pasar",
  ],
  umkm: [
    "Cari pasokan bahan baku langsung dari petani",
    "Bandingkan harga, kualitas, dan waktu ketersediaan",
    "Rencanakan pengadaan dan pengiriman lebih awal",
  ],
};

type Peran = keyof typeof LANGKAH;
const TAB: { id: Peran; label: string }[] = [
  { id: "petani", label: "Untuk Petani" },
  { id: "umkm", label: "Untuk UMKM" },
];

export function BagianLangkah() {
  const [peran, setPeran] = useState<Peran>("petani");
  return (
    <section id="cara-kerja" aria-labelledby="judul-langkah" className="scroll-mt-4 bg-tint">
      <div className={`${KONTAINER} py-12 md:py-16`}>
        <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Dua peran, satu peluang untuk tumbuh</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h2 id="judul-langkah" className="text-[28px] leading-tight font-bold text-brand-900 md:text-[34px]">Mulai dari peran Anda.</h2>
          <div role="group" aria-label="Pilih peran" className="flex gap-1 rounded-lg border border-line bg-white p-1">
            {TAB.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={peran === t.id}
                onClick={() => setPeran(t.id)}
                className={`cursor-pointer rounded-md px-4 py-2 text-sm font-semibold ${peran === t.id ? "bg-brand-900 text-white" : "text-brand-900 hover:bg-tint"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <ul className="mt-8 grid gap-3 md:grid-cols-3">
          {MANFAAT[peran].map((t) => (
            <li key={t} className="flex gap-3 text-[15px] leading-snug text-ink">
              <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
              {t}
            </li>
          ))}
        </ul>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {LANGKAH[peran].map(([judul, isi], i) => (
            <li key={judul} className="rounded-xl border border-line bg-white p-5">
              <span className="text-2xl font-bold text-brand-600">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-base font-bold text-brand-900">{judul}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{isi}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">
          Informasi yang terbuka membantu kedua pihak berkomunikasi dan menyepakati transaksi. Hasil dan penghematan
          bergantung pada kondisi serta kesepakatan masing-masing.
        </p>
      </div>
    </section>
  );
}
