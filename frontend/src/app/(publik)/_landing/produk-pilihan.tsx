import Link from "next/link";
import { KONTAINER } from "../_beranda/kelas";

// TODO: foto stok belum tersedia di data produk (src null); tampilkan foto asli saat sudah ada.
const PRODUK = [
  { nama: "Cabai Keriting", lokasi: "Lembang, Jawa Barat", harga: "Rp15.000", terjual: "100 kg", kualitas: "Segar - sortiran ukuran", panen: "12 Oktober 2026", warna: "bg-[#f6d5d0]" },
  { nama: "Beras Putih", lokasi: "Majalengka, Jawa Tengah", harga: "Rp8.000", terjual: "1.000 kg", kualitas: "Medium - kadar giling", panen: "7 Oktober 2026", warna: "bg-[#ece8de]" },
  { nama: "Tomat Merah", lokasi: "Kuningan, Jawa Barat", harga: "Rp15.000", terjual: "250 kg", kualitas: "Grade A - matang merata", panen: "10 Oktober 2026", warna: "bg-[#f3c9c0]" },
];

export function BagianProdukPilihan() {
  return (
    <section aria-labelledby="judul-bahan" className={`${KONTAINER} py-12 md:py-16`}>
      <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Kenali pilihan hasil panen</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h2 id="judul-bahan" className="max-w-md text-[28px] leading-tight font-bold text-brand-900 md:text-[34px]">
          Bahan baku pilihan, berawal dari sini.
        </h2>
        <Link href="/produk" className="border-l-2 border-accent pl-3 text-lg font-bold text-brand-900 no-underline hover:underline">
          Lihat semua produk
        </Link>
      </div>
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {PRODUK.map((p) => (
          <li key={p.nama} className="overflow-hidden rounded-xl border border-line bg-white">
            <div role="img" aria-label={`Foto ${p.nama} (contoh)`} className={`h-44 ${p.warna}`} />
            <div className="p-4">
              <p className="text-xs text-muted">{p.lokasi}</p>
              <h3 className="mt-1 text-lg font-bold text-brand-900">{p.nama}</h3>
              <p className="mt-1 text-base font-bold text-brand-900">
                {p.harga} <span className="text-xs font-normal text-muted">/ kg</span>
              </p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-xs">
                <dt className="text-muted">Tersedia</dt><dd className="text-right text-ink">{p.terjual}</dd>
                <dt className="text-muted">Kualitas</dt><dd className="text-right text-ink">{p.kualitas}</dd>
                <dt className="text-muted">Waktu panen</dt><dd className="text-right text-ink">{p.panen}</dd>
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
