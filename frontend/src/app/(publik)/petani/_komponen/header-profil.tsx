import Link from "next/link";
import type { ReactNode } from "react";
import { IkonInfo, IkonJam, IkonKalender, IkonLokasi, IkonObrolan } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { Bintang } from "@/app/(publik)/_komponen/bintang";
import { AvatarPetani } from "@/app/(publik)/_komponen/kartu-petani";
import { DaftarLencana } from "@/app/(publik)/_komponen/lencana";
import { RemahRoti } from "@/app/(publik)/_komponen/remah-roti";
import { TANGGAL_ACUAN } from "@/lib/api/acuan";
import type { PetaniTampil } from "@/lib/api/tipe";
import { angka, desimal1, durasiMenit, selisihHari, tanggalPanjang } from "@/lib/format";

/** `Maret 2025`. */
function bulanTahun(iso: string): string {
  return tanggalPanjang(iso).split(" ").slice(1).join(" ");
}

function Statistik({ label, keterangan, children }: { label: string; keterangan?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col bg-white px-4 py-3.5 md:px-5 md:py-4">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="mt-1 text-lg leading-snug font-bold text-ink">
        {children}
        {keterangan && <span className="block text-xs font-normal text-muted">{keterangan}</span>}
      </dd>
    </div>
  );
}

function InfoLibur({ libur }: { libur: string }) {
  const sisa = selisihHari(TANGGAL_ACUAN, libur);
  if (sisa < 0) return null;
  return (
    <p className="flex items-start gap-2 rounded-xl bg-[#fef3c7] px-3.5 py-2.5 text-[#92400e]">
      <IkonInfo size={16} className="mt-0.5 shrink-0" />
      <span>
        {sisa === 0 ? "Toko sedang libur hari ini." : `Toko libur pada ${tanggalPanjang(libur)}.`} Pesanan yang masuk
        diproses setelah toko buka kembali.
      </span>
    </p>
  );
}

export function HeaderProfil({ petani: p }: { petani: PetaniTampil }) {
  // TODO: sambungkan ke API obrolan (buka percakapan dengan petani ini) setelah sesi tersedia.
  const hrefChat = `/masuk?lanjut=${encodeURIComponent("/obrolan")}`;

  return (
    <section aria-labelledby="judul-petani" className="bg-tint">
      <div className="mx-auto w-full max-w-300 px-4 pt-5 pb-8 md:px-6 md:pt-7 md:pb-10">
        <RemahRoti item={[{ label: "Beranda", href: "/" }, { label: "Petani", href: "/petani" }, { label: p.namaToko }]} />

        <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-4 md:mt-7 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-6">
          <AvatarPetani nama={p.namaToko} ukuran="lg" />

          <div className="min-w-0 self-center">
            <h1 id="judul-petani" className="text-[26px] leading-tight font-bold tracking-tight text-brand-900 md:text-4xl">
              {p.namaToko}
            </h1>
            <p className="mt-1 text-[15px] text-ink">
              Dikelola oleh <span className="font-semibold">{p.nama}</span>
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-4">
              <li className="flex items-start gap-1.5">
                <IkonLokasi size={15} className="mt-0.5 shrink-0" />
                <span>
                  Kec. {p.kecamatan}, {p.labelWilayah}
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <IkonKalender size={15} className="mt-0.5 shrink-0" />
                <span>Bergabung sejak {bulanTahun(p.bergabung)}</span>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 md:col-start-2">
            <DaftarLencana lencana={p.lencana} />
          </div>

          <div className="col-span-2 md:col-span-1 md:col-start-3 md:row-start-1">
            <Link href={hrefChat} className={`${kelasTombolSitus("utama")} w-full gap-2 md:w-auto`}>
              <IkonObrolan size={18} />
              Chat petani
            </Link>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          <Statistik label="Rating" keterangan={`${angka(p.jumlahUlasan)} ulasan`}>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span aria-hidden>{desimal1(p.rating)}</span>
              <Bintang nilai={p.rating} ukuran={14} />
            </span>
          </Statistik>
          <Statistik label="Transaksi" keterangan="di Pasok Tani">
            {angka(p.jumlahTransaksi)}
          </Statistik>
          <Statistik label="Waktu respons" keterangan="rata-rata membalas chat">
            ± {durasiMenit(p.responMenit)}
          </Statistik>
          <Statistik label="Luas lahan" keterangan="lahan garapan">
            {angka(p.luasLahanHa)} ha
          </Statistik>
        </dl>

        <div className="mt-4 flex flex-col gap-2.5 text-sm md:flex-row md:items-center md:gap-6">
          <p className="flex items-start gap-1.5 text-ink">
            <IkonJam size={15} className="mt-0.5 shrink-0 text-brand-600" />
            <span>
              <span className="font-semibold">Jam operasional:</span> {p.jamOperasional}
            </span>
          </p>
          {p.libur && <InfoLibur libur={p.libur} />}
        </div>
      </div>
    </section>
  );
}
