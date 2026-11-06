"use client";

import { useState } from "react";

// TODO: testimoni CONTOH; ganti dengan ulasan asli pengguna sebelum peluncuran.
const DATA = [
  { nama: "Dewi Anggraini", peran: "UMKM Katering", kutipan: "Pasokan sayur jadi lebih terencana, harga transparan dan kualitas konsisten." },
  { nama: "Asep Rahmat", peran: "Petani Sayur", kutipan: "Sekarang saya tahu berapa yang dibutuhkan pembeli sebelum panen, jadi hasil tidak terbuang." },
  { nama: "Nevaely Callysta Audrey", peran: "Petani Cabai", kutipan: "Sejak pakai platform ini, saya bisa jual hasil panen langsung ke pembeli tanpa lewat tengkulak. Harga lebih baik, untung lebih besar." },
  { nama: "Budi Santoso", peran: "Pemilik Warung", kutipan: "Cari beras dan cabai langsung dari petani lebih mudah, jadwal pengirimannya jelas." },
  { nama: "Lilis Kartika", peran: "Petani Beras", kutipan: "Pembeli datang sendiri karena info stok saya terbuka. Sangat membantu." },
];

export function BagianTestimoniLanding() {
  const [i, setI] = useState(2);
  const t = DATA[i]!;
  const geser = (d: number) => setI((v) => (v + d + DATA.length) % DATA.length);
  return (
    <section id="testimoni" aria-labelledby="judul-testimoni-landing" className="scroll-mt-4 px-4 py-12 md:py-16">
      <h2 id="judul-testimoni-landing" className="text-center text-[28px] font-bold text-brand-900">Apa Kata Mereka?</h2>
      <figure className="mx-auto mt-10 max-w-xl text-center" aria-live="polite">
        <span aria-hidden className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-lg font-bold text-brand-900">
          {t.nama.charAt(0)}
        </span>
        <blockquote className="mt-6 text-lg leading-relaxed text-ink">&ldquo;{t.kutipan}&rdquo;</blockquote>
        <figcaption className="mt-4">
          <p className="font-bold text-brand-900">{t.nama}</p>
          <p className="text-sm text-muted">{t.peran}</p>
        </figcaption>
      </figure>
      <div className="mt-8 flex items-center justify-center gap-3">
        <button type="button" aria-label="Testimoni sebelumnya" onClick={() => geser(-1)} className="size-10 cursor-pointer rounded-full text-brand-900 hover:bg-tint">&lsaquo;</button>
        {DATA.map((d, n) => (
          <button key={d.nama} type="button" aria-label={`Testimoni ${n + 1}`} aria-current={n === i} onClick={() => setI(n)} className={`size-2.5 cursor-pointer rounded-full ${n === i ? "bg-brand-900" : "bg-line"}`} />
        ))}
        <button type="button" aria-label="Testimoni berikutnya" onClick={() => geser(1)} className="size-10 cursor-pointer rounded-full text-brand-900 hover:bg-tint">&rsaquo;</button>
      </div>
    </section>
  );
}
