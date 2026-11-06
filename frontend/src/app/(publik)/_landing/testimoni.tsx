import { KONTAINER } from "../_beranda/kelas";

// TODO: testimoni CONTOH (ilustrasi); ganti dengan ulasan asli pengguna setelah peluncuran, lalu hapus label "Ilustrasi".
const DATA = [
  { nama: "Dewi Anggraini", peran: "UMKM Katering", kutipan: "Pasokan sayur jadi lebih terencana, harga transparan dan kualitas konsisten." },
  { nama: "Nevaely Callysta Audrey", peran: "Petani Cabai", kutipan: "Saya bisa jual hasil panen langsung ke pembeli tanpa lewat tengkulak. Harga lebih baik, untung lebih besar." },
  { nama: "Budi Santoso", peran: "Pemilik Warung", kutipan: "Cari beras dan cabai langsung dari petani lebih mudah, jadwal pengirimannya jelas." },
];

export function BagianTestimoniLanding() {
  return (
    <section id="testimoni" aria-labelledby="judul-testimoni-landing" className="scroll-mt-4 border-y border-line bg-white">
      <div className={`${KONTAINER} py-12 md:py-16`}>
        <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Gambaran pengalaman pengguna</p>
        <h2 id="judul-testimoni-landing" className="mt-3 text-[28px] leading-tight font-bold text-brand-900 md:text-[34px]">
          Apa kata mereka?
        </h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {DATA.map((t) => (
            <li key={t.nama}>
              <figure className="flex h-full flex-col rounded-xl border border-line bg-cream p-6">
                <blockquote className="flex-1 text-base leading-relaxed text-ink">&ldquo;{t.kutipan}&rdquo;</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-mint font-bold text-brand-900">
                    {t.nama.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-brand-900">{t.nama}</span>
                    <span className="block text-[13px] text-muted">{t.peran}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[13px] text-muted">
          Ilustrasi berdasarkan kebutuhan petani dan UMKM; ulasan pengguna asli akan ditampilkan setelah peluncuran.
        </p>
      </div>
    </section>
  );
}
