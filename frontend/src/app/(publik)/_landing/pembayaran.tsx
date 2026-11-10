import { ESCROW_JALUR } from "./data-jalur";
import { Ikon } from "./ikon";
import { Tahap } from "./tahap";

const CATATAN = [
  { ikon: "persen" as const, isi: "Biaya layanan pembeli [1%] dari nilai barang setelah diskon. Ongkir dihitung terpisah." },
  { ikon: "keluhan" as const, isi: "Barang rusak atau tidak sesuai? Ajukan komplain dengan foto dalam 3 hari sejak pesanan tiba." },
];

export function BagianPembayaran() {
  return (
    <Tahap
      id="judul-pembayaran"
      nomor={4}
      eyebrow="Pembayaran"
      judul="Dana aman sampai pesanan diterima"
      isi="Bayar lewat QRIS atau Virtual Account. Pasok Tani menahan dana dan baru meneruskannya ke petani setelah pesanan Anda terima."
      latar="bg-white"
      latarHex="#ffffff"
      tautan={{ label: "Cara kerja pembayaran", href: "/bantuan" }}
    >
      <ol className="m-0 mt-7 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {ESCROW_JALUR.map((e, i) => (
          <li key={e.judul} className="flex flex-col gap-2.5 rounded-[20px] bg-[#f4f2ea] p-5.5">
            <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-brand-900 text-base font-extrabold text-white">
              {i + 1}
            </span>
            <h3 className="m-0 text-[17px] leading-snug font-extrabold text-[#10291e]">{e.judul}</h3>
            <p className="m-0 text-sm leading-relaxed text-[#4d5f54]">{e.isi}</p>
          </li>
        ))}
      </ol>
      <ul className="m-0 mt-5 grid list-none gap-x-8 gap-y-3 p-0 text-[15px] text-[#173b2b] md:grid-cols-2">
        {CATATAN.map((c) => (
          <li key={c.isi} className="flex gap-3">
            <Ikon nama={c.ikon} ukuran={22} className="mt-0.5 shrink-0 text-[#157a4c]" />
            <span>{c.isi}</span>
          </li>
        ))}
      </ul>
    </Tahap>
  );
}
