import { KONTAINER } from "../_beranda/kelas";

const PERAN = [
  { judul: "Untuk Petani", poin: ["Tampilkan hasil panen dengan harga dan jumlah yang jelas", "Temukan pembeli yang sesuai dengan komoditas Anda", "Rencanakan panen berdasarkan kebutuhan pasar"] },
  { judul: "Untuk UMKM", poin: ["Cari pasokan bahan baku langsung dari petani", "Bandingkan harga, kualitas, dan waktu ketersediaan", "Rencanakan pengadaan dan pengiriman lebih awal"] },
];

export function BagianDuaPeran() {
  return (
    <section aria-labelledby="judul-dua-peran" className={`${KONTAINER} py-12 md:py-16`}>
      <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Tumbuh dari hubungan yang saling mendukung</p>
      <h2 id="judul-dua-peran" className="mt-3 text-[28px] font-bold text-brand-900 md:text-[34px]">
        Dua peran. Satu peluang untuk tumbuh.
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {PERAN.map((p) => (
          <article key={p.judul} className="rounded-xl border border-line bg-white p-6">
            <h3 className="text-lg font-bold text-brand-900">{p.judul}</h3>
            <ul className="mt-4 space-y-3">
              {p.poin.map((t) => (
                <li key={t} className="flex gap-3 text-sm text-ink">
                  <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-lg text-center text-xs leading-relaxed text-muted">
        Informasi yang terbuka membantu kedua pihak berkomunikasi dan menyepakati transaksi. Hasil dan penghematan
        bergantung pada kondisi serta kesepakatan masing-masing.
      </p>
    </section>
  );
}
