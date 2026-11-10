import Link from "next/link";
import type { DaftarTungguTampil } from "@/lib/api/tipe";
import { angka, hargaPerSatuan, labelJadwalPanen, LABEL_SATUAN } from "@/lib/format";
import { IkonKalender, IkonOrang } from "@/app/_komponen/ikon";
import { ChipStatus } from "./chip-status";
import { FotoKomoditas } from "./foto-komoditas";

export function KartuDaftarTunggu({ data: d }: { data: DaftarTungguTampil }) {
  const foto = d.kabarLahan[0];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-[0_6px_24px_rgba(6,78,59,0.08)]">
      <div className="relative">
        <FotoKomoditas ikon={d.ikonKategori} alt={`Kabar lahan ${d.komoditas}`} src={foto?.src} className="aspect-[16/9] w-full" />
        <ChipStatus status={d.status} className="absolute top-2.5 left-2.5 shadow-sm" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-base leading-snug font-semibold text-ink">
            <Link href={`/daftar-tunggu/${d.id}`} className="no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-brand-900">
              {d.komoditas}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {d.petani.namaToko} · {d.petani.kecamatan}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
          <div className="col-span-2 flex items-center gap-1.5 text-ink">
            <IkonKalender size={14} className="shrink-0 text-brand-600" />
            <dt className="sr-only">Perkiraan panen</dt>
            <dd className={d.jadwalPanen.jenis === "belum-ada" ? "text-muted italic" : "font-medium"}>
              {labelJadwalPanen(d.jadwalPanen)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Perkiraan harga</dt>
            <dd className="font-semibold text-brand-900">{hargaPerSatuan(d.hargaPerkiraan, d.satuan)}</dd>
          </div>
          <div>
            <dt className="text-muted">Perkiraan hasil</dt>
            <dd className="font-semibold text-ink">
              {angka(d.perkiraanHasil)} {LABEL_SATUAN[d.satuan]}
            </dd>
          </div>
        </dl>

        <div className="mt-auto pt-2">
          {d.kuota !== null ? (
            <>
              <div className="flex justify-between text-xs text-muted">
                <span>{d.kuotaPenuh ? "Kuota Komitmen penuh" : "Kuota Komitmen"}</span>
                <span className="font-semibold text-ink">{d.persenKuota}%</span>
              </div>
              <div
                className="mt-1 h-1.5 overflow-hidden rounded-full bg-tint"
                role="progressbar"
                aria-valuenow={d.persenKuota ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Kuota Komitmen terisi"
              >
                <div className={`h-full rounded-full ${d.kuotaPenuh ? "bg-muted" : "bg-accent"}`} style={{ width: `${d.persenKuota}%` }} />
              </div>
            </>
          ) : (
            <p className="text-xs text-muted">Tanpa kuota Komitmen</p>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <IkonOrang size={14} />
            {angka(d.pengikut)} mengikuti · {angka(d.jumlahKomitmen)} komitmen
          </p>
        </div>
      </div>
    </article>
  );
}
