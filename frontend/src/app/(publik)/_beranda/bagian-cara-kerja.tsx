import Link from "next/link";
import type { ReactNode } from "react";
import { IkonKeranjang, IkonPanahKanan, IkonTunas } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { BERANDA, type Langkah } from "./data-beranda";
import { KepalaBagian } from "./kepala-bagian";
import { KONTAINER } from "./kelas";

/** `#tentang`: apa itu Pasok Tani dan alur singkat untuk pembeli dan petani. */
export function BagianCaraKerja() {
  const { pembeli, petani } = BERANDA.caraKerja;
  return (
    <section id="tentang" aria-labelledby="judul-tentang" className={`${KONTAINER} scroll-mt-4 py-14 md:py-20`}>
      <KepalaBagian
        id="judul-tentang"
        label="Tentang Pasok Tani"
        judul="Pasar tani yang mempertemukan kebun dan dapur"
        deskripsi="Pasok Tani menghubungkan petani Jawa Barat dengan pembeli rumah tangga dan UMKM. Petani menjual langsung, jadi kamu tahu siapa yang menanam dan kapan hasil panennya dipetik."
      />
      <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 lg:grid-cols-2 lg:gap-5">
        <KolomAlur
          judul="Untuk pembeli"
          ikon={<IkonKeranjang size={20} />}
          langkah={pembeli}
          aksi={{ label: "Mulai belanja", href: "/produk" }}
        />
        <KolomAlur
          judul="Untuk petani"
          ikon={<IkonTunas size={20} />}
          langkah={petani}
          aksi={{ label: "Daftar sebagai petani", href: "/daftar/petani" }}
        />
      </div>
      <p className="mt-6 text-[15px] text-muted">
        Butuh penjelasan lebih lengkap?{" "}
        <Link
          href="/bantuan"
          className="inline-flex items-center gap-1 font-semibold text-brand-900 underline-offset-3 hover:underline"
        >
          Baca panduan di Pusat Bantuan
          <IkonPanahKanan size={16} />
        </Link>
      </p>
    </section>
  );
}

function KolomAlur({
  judul,
  ikon,
  langkah,
  aksi,
}: {
  judul: string;
  ikon: ReactNode;
  langkah: Langkah[];
  aksi: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-white p-5 md:p-7">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-mint text-brand-900">
          {ikon}
        </span>
        <h3 className="text-lg font-bold tracking-tight text-brand-900">{judul}</h3>
      </div>
      <ol className="mt-6 flex flex-col">
        {langkah.map((l, i) => (
          <li key={l.judul} className="relative flex gap-4 pb-6 last:pb-0">
            {i < langkah.length - 1 && <span aria-hidden className="absolute top-10 bottom-1 left-4 w-px bg-line" />}
            <span className="grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] border-brand-900 bg-white text-sm font-bold text-brand-900">
              {i + 1}
            </span>
            <div className="pt-1">
              <p className="text-base font-semibold text-ink">{l.judul}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{l.deskripsi}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-auto pt-7">
        <Link href={aksi.href} className={kelasTombolSitus("garis")}>
          {aksi.label}
        </Link>
      </div>
    </div>
  );
}
