import { Ikon, type NamaIkon } from "./ikon";
import { KONTAINER } from "../_beranda/kelas";

function Rantai({ judul, sub, simpul, tebal }: { judul: string; sub: string; simpul: { ikon: NamaIkon; label: string }[]; tebal?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-brand-900">
        {judul} <span className="font-normal text-muted">({sub})</span>
      </p>
      <ol className="mt-4 flex items-start justify-between">
        {simpul.map((s, i) => (
          <li key={s.label} className="relative flex flex-1 flex-col items-center gap-1 text-xs text-ink">
            {i > 0 && <span aria-hidden className={`absolute top-5 right-1/2 left-[-50%] h-0.5 ${tebal ? "bg-accent" : "bg-line"}`} />}
            <span className="relative grid size-10 place-items-center rounded-lg border border-brand-600 bg-white text-brand-600">
              <Ikon nama={s.ikon} />
            </span>
            {s.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

const NILAI = ["Hubungan langsung", "Informasi pasokan terbuka", "Pengadaan lebih terencana"];

export function BagianKenapa() {
  return (
    <>
      <section id="tentang" aria-labelledby="judul-kenapa" className="scroll-mt-4 bg-tint">
        <div className={`${KONTAINER} grid items-center gap-10 py-12 md:grid-cols-2 md:py-16`}>
          <div>
            <h2 id="judul-kenapa" className="text-xl font-bold text-brand-900">Kenapa Pasok Tani?</h2>
            <p className="mt-4 text-[22px] leading-snug font-bold text-brand-900">
              Rantai distribusi yang panjang menciptakan biaya yang tidak perlu
            </p>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink">
              Terlalu banyak perantara dalam rantai pasok pertanian menyebabkan harga menjadi lebih tinggi, petani
              mendapatkan margin yang kecil, dan pembeli harus membayar lebih mahal.
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <Rantai
              judul="Sebelum"
              sub="Rantai distribusi lama"
              simpul={[
                { ikon: "petani", label: "Petani" },
                { ikon: "pengumpul", label: "Pengumpul" },
                { ikon: "pedagang", label: "Pedagang" },
                { ikon: "distributor", label: "Distributor" },
                { ikon: "pembeli", label: "Pembeli" },
              ]}
            />
            <Rantai
              judul="Dengan Pasok Tani"
              sub="Rantai distribusi baru"
              tebal
              simpul={[
                { ikon: "petani", label: "Petani" },
                { ikon: "distributor", label: "Distributor" },
                { ikon: "pembeli", label: "Pembeli" },
              ]}
            />
          </div>
        </div>
      </section>
      <ul className="grid grid-cols-1 divide-y divide-line border-y border-line bg-white text-center text-[15px] font-medium text-ink md:grid-cols-3 md:divide-x md:divide-y-0">
        {NILAI.map((n) => (
          <li key={n} className="px-4 py-4">{n}</li>
        ))}
      </ul>
    </>
  );
}
