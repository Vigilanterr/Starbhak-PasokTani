import Form from "next/form";
import Link from "next/link";
import type { ProdukTampil } from "@/lib/api/tipe";
import { TANGGAL_ACUAN } from "@/lib/api/acuan";
import { angka, labelUmurPanen, LABEL_SATUAN, rupiah } from "@/lib/format";
import { IkonCari, IkonKamera, IkonLokasi, IkonPerisai } from "@/app/_komponen/ikon";
import { FotoKomoditas } from "../_komponen/foto-komoditas";
import { BERANDA } from "./data-beranda";
import { kelasTombolGelap, KONTAINER } from "./kelas";

type Statistik = { petani: number; produk: number; wilayah: number };

/** Hero beranda: proposisi nilai, pencarian, CTA, statistik, dan kolase kartu dari produk asli (desktop). */
export function HeroBeranda({ statistik, produk }: { statistik: Statistik; produk: ProdukTampil[] }) {
  const kolase = produk.slice(0, 2);
  const angkaStatistik = [
    { nilai: statistik.petani, label: "petani mitra" },
    { nilai: statistik.produk, label: "produk" },
    { nilai: statistik.wilayah, label: "kabupaten/kota" },
  ];

  return (
    <section aria-labelledby="judul-beranda" className="relative isolate overflow-hidden bg-brand-900 text-cream">
      <LatarHero />

      <div
        className={`${KONTAINER} grid grid-cols-1 gap-12 pt-10 pb-12 md:pt-16 md:pb-16 lg:items-center lg:gap-16 lg:py-20 ${
          kolase.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_420px]" : ""
        }`}
      >
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-mint">
            <IkonLokasi size={14} />
            Pasar tani daring Jawa Barat
          </p>
          <h1
            id="judul-beranda"
            className="mt-5 max-w-160 text-[34px] leading-[1.12] font-bold tracking-tight text-white sm:text-[42px] md:text-5xl lg:text-[54px]"
          >
            Hasil panen segar, langsung dari petani Jawa Barat
          </h1>
          <p className="mt-4 max-w-140 text-base leading-relaxed text-cream/85 md:text-lg">
            Sayur, buah, beras, dan bumbu dapur untuk rumah tangga maupun usaha kulinermu. Lihat foto stok asli dan
            tanggal panennya, lalu bayar dengan aman.
          </p>

          <Form
            action="/cari"
            role="search"
            className="mt-7 flex max-w-140 items-center gap-2 rounded-xl bg-white p-1.5 pl-4 shadow-[0_8px_24px_rgba(0,0,0,0.18)] focus-within:ring-3 focus-within:ring-mint/70"
          >
            <IkonCari size={20} className="shrink-0 text-muted" />
            <label htmlFor="cari-beranda" className="sr-only">
              Cari hasil panen
            </label>
            <input
              id="cari-beranda"
              type="search"
              name="q"
              placeholder="Cari cabai, tomat, beras…"
              autoComplete="off"
              enterKeyHint="search"
              className="h-11 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-placeholder"
            />
            <button
              type="submit"
              className="h-11 shrink-0 cursor-pointer rounded-lg bg-brand-900 px-5 text-[15px] font-semibold text-white hover:bg-[#053f30] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
            >
              Cari
            </button>
          </Form>

          <div className="mt-4 flex items-start gap-3">
            <p id="label-pencarian-populer" className="shrink-0 pt-3 text-sm text-cream/75">
              Populer:
            </p>
            <ul aria-labelledby="label-pencarian-populer" className="flex min-w-0 flex-1 flex-wrap gap-2">
              {BERANDA.pencarianPopuler.map((c) => (
                <li key={c.q}>
                  <Link
                    href={`/cari?q=${encodeURIComponent(c.q)}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-white/20 bg-white/5 px-4 text-sm font-medium text-white no-underline hover:border-white/45 hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint/70"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 grid gap-3 sm:flex">
            <Link href="/produk" className={kelasTombolGelap("terang")}>
              Jelajahi produk
            </Link>
            <Link href="/daftar/petani" className={kelasTombolGelap("garis")}>
              Jual hasil panen
            </Link>
          </div>

          <dl className="mt-10 grid max-w-120 grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {angkaStatistik.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-0.5">
                <dt className="text-[13px] leading-snug text-cream/75">{s.label}</dt>
                <dd className="text-2xl font-bold tracking-tight text-white md:text-[28px]">{angka(s.nilai)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {kolase.length > 0 && <KolaseProduk produk={kolase} />}
      </div>
    </section>
  );
}

/** Pola titik, cahaya lembut, dan garis sawah terasering sebagai latar dekoratif. */
function LatarHero() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(currentColor_1px,transparent_1.5px)] bg-size-[18px_18px] text-mint opacity-[0.07]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 -z-10 size-[460px] rounded-full bg-accent/25 blur-3xl"
      />
      <svg
        aria-hidden
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 w-full text-mint opacity-15 md:h-56"
      >
        <path vectorEffect="non-scaling-stroke" d="M0 110 C 280 50, 520 140, 800 80 S 1240 30, 1440 90" />
        <path vectorEffect="non-scaling-stroke" d="M0 150 C 260 90, 500 180, 760 120 S 1220 70, 1440 130" />
        <path vectorEffect="non-scaling-stroke" d="M0 190 C 240 130, 480 220, 720 160 S 1200 110, 1440 170" />
        <path vectorEffect="non-scaling-stroke" d="M0 230 C 220 170, 460 260, 700 200 S 1180 150, 1440 210" />
      </svg>
    </>
  );
}

/** Kolase dua kartu stok terbaru (hanya desktop) dengan label fitur yang mengambang. */
function KolaseProduk({ produk }: { produk: ProdukTampil[] }) {
  return (
    <div className="relative mx-auto hidden w-full max-w-105 py-6 lg:block">
      <span aria-hidden className="pointer-events-none absolute inset-10 -z-10 rounded-full bg-accent/20 blur-2xl" />
      <p className="absolute top-0 -left-6 z-10 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-brand-900 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
        <IkonKamera size={16} className="text-brand-600" />
        Foto stok asli dan tanggal panen
      </p>
      <ul aria-label="Stok baru dipanen" className={produk.length > 1 ? "grid grid-cols-2 gap-5" : "mx-auto w-56"}>
        {produk.map((p, i) => (
          <li key={p.id} className={i === 0 ? "-rotate-3" : "mt-16 rotate-2"}>
            <KartuMini produk={p} />
          </li>
        ))}
      </ul>
      <p className="absolute right-0 bottom-0 z-10 inline-flex items-center gap-2 rounded-full bg-mint px-3.5 py-2 text-[13px] font-semibold text-brand-900 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
        <IkonPerisai size={16} />
        Dana aman sampai pesanan diterima
      </p>
    </div>
  );
}

function KartuMini({ produk: p }: { produk: ProdukTampil }) {
  return (
    <article className="group relative rounded-2xl bg-white p-2.5 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.28)] focus-within:ring-3 focus-within:ring-mint">
      <div className="relative">
        <FotoKomoditas
          ikon={p.ikonKategori}
          alt={`Foto stok ${p.nama}`}
          src={p.fotoStok[0]?.src}
          sizes="210px"
          ukuranIkon={52}
          className="aspect-square w-full rounded-xl"
        />
        <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-ink">
          {labelUmurPanen(p.tanggalPanen, TANGGAL_ACUAN)}
        </span>
      </div>
      <div className="px-1.5 pt-3 pb-1.5">
        <p className="truncate text-[15px] font-semibold">
          <Link
            href={`/produk/${p.slug}`}
            className="no-underline after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none group-hover:text-brand-900"
          >
            {p.nama}
          </Link>
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {p.petani.namaToko} · {p.petani.kecamatan}
        </p>
        <p className="mt-2 flex items-baseline gap-1">
          <span className={`text-base font-bold ${p.surplusAktif ? "text-[#c2410c]" : "text-brand-900"}`}>
            {rupiah(p.hargaEfektif)}
          </span>
          <span className="text-xs text-muted">/{LABEL_SATUAN[p.satuan]}</span>
        </p>
      </div>
    </article>
  );
}
