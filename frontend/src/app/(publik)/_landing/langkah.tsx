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
        <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Langkah sederhana, tujuan bersama</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h2 id="judul-langkah" className="text-[28px] font-bold text-brand-900">Mulai dari peran Anda.</h2>
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
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {LANGKAH[peran].map(([judul, isi], i) => (
            <li key={judul} className="rounded-xl border border-line bg-white p-5">
              <span className="text-2xl font-bold text-brand-600">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 text-sm font-bold text-brand-900">{judul}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{isi}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
