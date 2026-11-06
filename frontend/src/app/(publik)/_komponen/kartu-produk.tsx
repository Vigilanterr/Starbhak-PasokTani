import Link from "next/link";
import type { ProdukTampil } from "@/lib/api/tipe";
import { TANGGAL_ACUAN } from "@/lib/api/acuan";
import { angka, jarak, labelUmurPanen, LABEL_SATUAN, rupiah } from "@/lib/format";
import { IkonLokasi } from "@/app/_komponen/ikon";
import { RatingRingkas } from "./bintang";
import { FotoKomoditas } from "./foto-komoditas";
import { ChipLencana } from "./lencana";

/** Kartu produk untuk grid katalog, beranda, dan profil petani. */
export function KartuProduk({ produk: p, prioritas = false }: { produk: ProdukTampil; prioritas?: boolean }) {
  const foto = p.fotoStok[0];
  const terverifikasi = p.petani.lencana.includes("terverifikasi");
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-[0_6px_24px_rgba(6,78,59,0.08)] focus-within:shadow-[0_6px_24px_rgba(6,78,59,0.08)]">
      <div className="relative">
        <FotoKomoditas
          ikon={p.ikonKategori}
          alt={`Foto stok ${p.nama}`}
          src={foto?.src}
          prioritas={prioritas}
          className={`aspect-[4/3] w-full ${p.habis ? "grayscale-[0.6]" : ""}`}
        />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {p.surplusAktif && (
            <span className="rounded-full bg-[#c2410c] px-2.5 py-1 text-xs font-bold text-white">
              Surplus −{p.surplusAktif.diskonPersen}%
            </span>
          )}
          {p.tag.includes("organik") && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-900">Organik</span>
          )}
        </div>
        {p.habis && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1.5 text-center text-xs font-semibold tracking-wide text-white">
            Stok habis
          </span>
        )}
        {foto && !p.habis && (
          <span className="absolute right-2.5 bottom-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-ink">
            {labelUmurPanen(p.tanggalPanen, TANGGAL_ACUAN)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5 md:p-4">
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-ink">
          <Link
            href={`/produk/${p.slug}`}
            className="no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:text-brand-900"
          >
            {p.nama}
          </Link>
        </h3>

        <p className="flex items-center gap-1 text-[13px] text-muted">
          <span className="truncate">{p.petani.namaToko}</span>
          {terverifikasi && <ChipLencana lencana="terverifikasi" ringkas />}
        </p>

        <div className="mt-auto pt-1.5">
          {p.surplusAktif ? (
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-[17px] font-bold text-[#c2410c]">{rupiah(p.hargaEfektif)}</span>
              <span className="text-xs text-muted">/{LABEL_SATUAN[p.satuan]}</span>
              <s className="text-xs text-muted">{rupiah(p.harga)}</s>
            </p>
          ) : (
            <p className="flex items-baseline gap-1">
              <span className="text-[17px] font-bold text-brand-900">{rupiah(p.harga)}</span>
              <span className="text-xs text-muted">/{LABEL_SATUAN[p.satuan]}</span>
            </p>
          )}
          {p.hargaGrosir.length > 1 && (
            <p className="text-xs text-brand-600">Grosir mulai {rupiah(p.hargaGrosir[p.hargaGrosir.length - 1]?.harga ?? p.harga)}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-muted">
          {p.jumlahUlasan > 0 && <RatingRingkas nilai={p.rating} />}
          <span>{angka(p.terjual)} terjual</span>
        </div>
        <p className="flex items-center gap-1 text-xs text-muted">
          <IkonLokasi size={13} className="shrink-0" />
          <span className="truncate">
            {p.petani.kecamatan}, {p.petani.labelWilayah.replace("Kabupaten ", "Kab. ")}
            {p.jarakKm !== null && ` · ${jarak(p.jarakKm)}`}
          </span>
        </p>
      </div>
    </article>
  );
}
