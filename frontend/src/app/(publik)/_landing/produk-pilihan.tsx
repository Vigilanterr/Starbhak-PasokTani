import Link from "next/link";
import { ambilProdukBySlug } from "@/lib/api/katalog";
import { angka, LABEL_SATUAN, rupiah, tanggalPanjang } from "@/lib/format";
import { FotoKomoditas } from "../_komponen/foto-komoditas";
import { KONTAINER } from "../_beranda/kelas";

/** Bahan baku yang umum dicari UMKM (warung, katering). Diambil dari katalog agar data dan tautannya nyata. */
const SLUG_PILIHAN = ["cabai-merah-keriting-garut", "beras-premium-karawang", "tomat-merah-lembang"];

export async function BagianProdukPilihan() {
  const produk = (await Promise.all(SLUG_PILIHAN.map(ambilProdukBySlug))).filter((p) => p !== null);
  return (
    <section aria-labelledby="judul-bahan" className={`${KONTAINER} py-12 md:py-16`}>
      <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Kenali pilihan hasil panen</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h2 id="judul-bahan" className="max-w-md text-[28px] leading-tight font-bold text-brand-900 md:text-[34px]">
          Bahan baku pilihan, berawal dari sini.
        </h2>
        <Link href="/produk" className="inline-flex items-center gap-1.5 text-base font-bold text-brand-900 no-underline hover:text-brand-600 hover:underline">
          Lihat semua produk
          <span aria-hidden>&rarr;</span>
        </Link>
      </div>
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {produk.map((p) => (
          <li key={p.id}>
            <article className="group relative h-full overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-[0_6px_24px_rgba(6,78,59,0.08)] focus-within:shadow-[0_6px_24px_rgba(6,78,59,0.08)]">
              <FotoKomoditas ikon={p.ikonKategori} alt={`Foto stok ${p.nama}`} src={p.fotoStok[0]?.src} className="aspect-[16/10] w-full" sizes="(min-width: 768px) 33vw, 100vw" />
              <div className="p-4">
                <p className="text-xs text-muted">
                  {p.petani.kecamatan}, {p.petani.labelWilayah.replace("Kabupaten ", "Kab. ")}
                </p>
                <h3 className="mt-1 text-lg font-bold text-brand-900">
                  <Link href={`/produk/${p.slug}`} className="no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:text-brand-600">
                    {p.nama}
                  </Link>
                </h3>
                <p className="mt-1 text-base font-bold text-brand-900">
                  {rupiah(p.harga)} <span className="text-xs font-normal text-muted">/ {LABEL_SATUAN[p.satuan]}</span>
                </p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[13px]">
                  <dt className="text-muted">Tersedia</dt>
                  <dd className="text-right text-ink">
                    {angka(p.stok)} {LABEL_SATUAN[p.satuan]}
                  </dd>
                  <dt className="text-muted">Petani</dt>
                  <dd className="truncate text-right text-ink">{p.petani.namaToko}</dd>
                  <dt className="text-muted">Waktu panen</dt>
                  <dd className="text-right text-ink">{tanggalPanjang(p.tanggalPanen)}</dd>
                </dl>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
