import { Ikon, type NamaIkon } from "./ikon";
import { KONTAINER } from "../_beranda/kelas";

const FITUR: { ikon: NamaIkon; judul: string; isi: string }[] = [
  { ikon: "harga", judul: "Pasokan & harga yang jelas", isi: "Lihat harga per satuan, jumlah tersedia, kualitas, dan waktu panen untuk menimbang pilihan." },
  { ikon: "cari", judul: "Pemasok yang sesuai", isi: "Cari berdasarkan komoditas, jumlah, kualitas, harga, lokasi, dan waktu ketersediaan." },
  { ikon: "temu", judul: "Kebutuhan bertemu panen", isi: "Cocokkan kebutuhan bahan baku usaha dengan pasokan yang ditawarkan petani." },
  { ikon: "kirim", judul: "Pengiriman terkoordinasi", isi: "Komunikasikan jumlah, jadwal, lokasi tujuan, dan cara pengiriman bersama pihak terkait." },
];

export function BagianRancangan() {
  return (
    <section id="fitur" aria-labelledby="judul-rancangan" className="scroll-mt-4 bg-brand-900 text-white">
      <div className={`${KONTAINER} py-12 md:py-16`}>
        <p className="text-xs font-bold tracking-wider text-mint uppercase">Dirancang untuk kebutuhan sehari-hari</p>
        <h2 id="judul-rancangan" className="mt-4 max-w-xl text-[28px] leading-tight font-bold md:text-[34px]">
          Dari mencari pasokan sampai merencanakan pengiriman.
        </h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FITUR.map((f) => (
            <li key={f.judul}>
              <span className="grid size-12 place-items-center rounded-xl bg-mint text-brand-900">
                <Ikon nama={f.ikon} strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-base font-bold">{f.judul}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">{f.isi}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
