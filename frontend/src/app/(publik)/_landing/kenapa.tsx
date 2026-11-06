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
          <li key={s.label} className="relative flex min-w-0 flex-1 flex-col items-center gap-1 px-0.5 text-center text-[11px] leading-tight text-ink sm:text-xs">
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
    <section id="tentang" aria-labelledby="judul-kenapa" className="scroll-mt-4 bg-tint">
      <div className={`${KONTAINER} grid items-center gap-10 py-12 md:grid-cols-2 md:py-16`}>
        <div>
          <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Kenapa Pasok Tani?</p>
          <h2 id="judul-kenapa" className="mt-3 text-[28px] leading-tight font-bold text-brand-900 md:text-[34px]">
            Rantai distribusi yang panjang menciptakan biaya yang tidak perlu.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink">
            Terlalu banyak perantara dalam rantai pasok pertanian menyebabkan harga menjadi lebih tinggi, petani
            mendapatkan margin yang kecil, dan pembeli harus membayar lebih mahal.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {NILAI.map((n) => (
              <li key={n} className="rounded-full border border-brand-600/30 bg-white px-3.5 py-1.5 text-sm font-medium text-brand-900">
                {n}
              </li>
            ))}
          </ul>
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
  );
}
