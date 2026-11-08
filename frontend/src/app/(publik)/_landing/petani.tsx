import Image from "next/image";
import Link from "next/link";
import { PETANI_JALUR, lencanaGaya } from "./data-jalur";
import { Tahap } from "./tahap";

export function BagianPetani() {
  return (
    <Tahap
      id="judul-petani"
      nomor={2}
      eyebrow="Petani"
      judul="Kenal petani yang menanamnya"
      isi="Setiap profil memuat lokasi lahan, lencana, rating, dan jumlah transaksi."
      latar="bg-white"
      latarHex="#ffffff"
      tautan={{ label: "Direktori petani", href: "/petani" }}
    >
      <ul className="m-0 mt-7 grid list-none gap-6 p-0 md:grid-cols-3">
        {PETANI_JALUR.map((pt) => (
          <li key={pt.nama} className="min-w-0">
            <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#e3e8df] bg-white transition-transform hover:-translate-y-1">
              <div className="relative aspect-[4/3]">
                <Image src={pt.foto} alt={pt.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" style={{ objectPosition: pt.posisi }} />
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-5">
                <div>
                  <h3 className="m-0 text-[22px] leading-tight font-extrabold text-[#10291e]">{pt.nama}</h3>
                  <p className="m-0 mt-1 text-sm text-[#4d5f54]">
                    {pt.toko} · {pt.lokasi}
                  </p>
                </div>
                <ul aria-label="Lencana" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {pt.lencana.map((l) => {
                    const g = lencanaGaya(l);
                    return (
                      <li key={l} className="rounded-full px-2.5 py-0.5 text-xs font-extrabold" style={{ background: g.latar, color: g.warna }}>
                        {g.label}
                      </li>
                    );
                  })}
                </ul>
                <p className="m-0 text-sm text-[#173b2b]">
                  <b className="font-bold">Menanam:</b> {pt.komoditas}
                </p>
                <p className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[#e3e8df] pt-3 text-[13px] text-[#4d5f54]">
                  <span>
                    <b className="text-[#173b2b]">{pt.rating}</b> dari {pt.ulasan} ulasan · {pt.transaksi} transaksi
                  </span>
                  <Link href="/petani" className="font-bold text-brand-900 underline-offset-4 hover:underline">
                    Lihat profil
                  </Link>
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Tahap>
  );
}
