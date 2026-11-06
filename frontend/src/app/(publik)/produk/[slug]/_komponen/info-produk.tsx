import Link from "next/link";
import type { ProdukTampil } from "@/lib/api/tipe";
import { TANGGAL_ACUAN } from "@/lib/api/acuan";
import { angka, desimal1, labelSisaHari, labelUmurPanen, LABEL_SATUAN, rupiah, tanggal } from "@/lib/format";
import { LABEL_TAG } from "@/lib/label";
import { IkonApi, IkonJam, IkonLonceng, IkonLokasi, IkonTunas } from "@/app/_komponen/ikon";
import { Bintang } from "@/app/(publik)/_komponen/bintang";
import { TabelGrosir } from "./tabel-grosir";

const kelasChip = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";

/** "karena sisa 2 hari sebelum kedaluwarsa", "karena kedaluwarsa hari ini". */
function alasanSurplus(sisaHari: number): string {
  const label = labelSisaHari(sisaHari).toLowerCase();
  return sisaHari > 0 ? `${label} sebelum kedaluwarsa` : label;
}

/** Judul, rating, harga (termasuk Surplus), kesegaran batch, stok, dan tabel grosir. */
export function InfoProduk({ produk: p }: { produk: ProdukTampil }) {
  const s = LABEL_SATUAN[p.satuan];
  const surplus = p.surplusAktif;
  const segera = p.sisaHari <= 2;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <ul aria-label="Kategori dan label" className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href={`/kategori/${p.kategori}`}
              className={`${kelasChip} bg-tint text-brand-900 no-underline hover:bg-mint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45`}
            >
              {p.namaKategori}
            </Link>
          </li>
          {surplus && (
            <li className={`${kelasChip} bg-[#c2410c] text-white`}>Surplus −{surplus.diskonPersen}%</li>
          )}
          {p.tag.map((t) => (
            <li key={t} className={`${kelasChip} border border-line bg-white text-ink`}>
              {LABEL_TAG[t]}
            </li>
          ))}
        </ul>

        <h1 className="mt-3 text-[26px] leading-tight font-bold tracking-tight text-brand-900 md:text-[32px]">{p.nama}</h1>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted">
          {p.jumlahUlasan > 0 ? (
            <a href="#ulasan" className="inline-flex items-center gap-1.5 text-ink no-underline hover:underline">
              <Bintang nilai={p.rating} ukuran={15} />
              <span className="font-semibold">{desimal1(p.rating)}</span>
              <span className="text-muted">({angka(p.jumlahUlasan)} ulasan)</span>
            </a>
          ) : (
            <span>Belum ada ulasan</span>
          )}
          <span aria-hidden className="text-line">|</span>
          <span>{angka(p.terjual)} terjual</span>
          <span aria-hidden className="text-line">|</span>
          <span className="inline-flex items-center gap-1">
            <IkonLonceng size={14} className="text-brand-600" />
            {angka(p.pelanggan)} pelanggan
          </span>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <IkonLokasi size={15} className="shrink-0" />
          <span className="min-w-0">
            <Link href={`/petani/${p.petani.id}`} className="font-semibold text-brand-600 no-underline hover:text-brand-900 hover:underline">
              {p.petani.namaToko}
            </Link>{" "}
            · {p.petani.kecamatan}, {p.petani.labelWilayah.replace("Kabupaten ", "Kab. ")}
          </span>
        </p>
      </div>

      <div
        className={`rounded-2xl px-4 py-4 ${surplus ? "border border-[#fed7aa] bg-[#fff4ec]" : "bg-tint"} ${p.habis ? "opacity-80" : ""}`}
      >
        {surplus ? (
          <>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="sr-only">Harga Surplus</span>
              <span className="text-[30px] leading-none font-bold tracking-tight text-[#c2410c]">{rupiah(p.hargaEfektif)}</span>
              <span className="text-sm text-muted">/{s}</span>
              <span className="sr-only">, harga normal</span>
              <s className="text-[15px] text-muted">{rupiah(p.harga)}</s>
            </p>
            <p className="mt-2.5 flex items-start gap-2 text-sm leading-snug font-medium text-[#9a3412]">
              <IkonApi size={16} className="mt-px shrink-0" />
              Diskon Surplus {surplus.diskonPersen}% karena {alasanSurplus(p.sisaHari)}.
            </p>
          </>
        ) : (
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[30px] leading-none font-bold tracking-tight text-brand-900">{rupiah(p.harga)}</span>
            <span className="text-sm text-muted">/{s}</span>
          </p>
        )}

        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {p.habis ? (
            <span className={`${kelasChip} bg-danger-bg text-danger-ink`}>Stok habis</span>
          ) : (
            <span>
              <span className="text-muted">Stok</span>{" "}
              <strong className="font-semibold text-ink">
                {angka(p.stok)} {s}
              </strong>
            </span>
          )}
          <span>
            <span className="text-muted">Min. pembelian</span>{" "}
            <strong className="font-semibold text-ink">
              {angka(p.minPembelian)} {s}
            </strong>
          </span>
        </p>
      </div>

      <section aria-labelledby="judul-kesegaran" className="rounded-2xl border border-line bg-white px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="judul-kesegaran" className="text-sm font-semibold text-ink">
            {p.habis ? "Batch terakhir" : "Kesegaran batch ini"}
          </h2>
          <span className={`${kelasChip} bg-mint text-brand-900`}>{labelUmurPanen(p.tanggalPanen, TANGGAL_ACUAN)}</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2.5 text-[15px] text-ink">
          <li className="flex items-center gap-2.5">
            <IkonTunas size={18} className="shrink-0 text-brand-600" />
            <span>
              Dipanen <time dateTime={p.tanggalPanen} className="font-semibold">{tanggal(p.tanggalPanen)}</time>
            </span>
          </li>
          <li className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <IkonJam size={18} className="shrink-0 text-brand-600" />
            <span>
              Baik dikonsumsi sebelum{" "}
              <time dateTime={p.tanggalKedaluwarsa} className="font-semibold">
                {tanggal(p.tanggalKedaluwarsa)}
              </time>
            </span>
            <span
              className={`${kelasChip} ${segera ? "bg-[#ffedd5] text-[#9a3412]" : "bg-[#eef1ec] text-ink"}`}
            >
              {labelSisaHari(p.sisaHari)}
            </span>
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted">Tanggal panen dan kedaluwarsa berlaku untuk batch yang sedang dijual.</p>
      </section>

      <TabelGrosir />
    </div>
  );
}
