import Link from "next/link";
import type { DaftarTungguTampil } from "@/lib/api/tipe";
import { angka, LABEL_SATUAN, rupiah } from "@/lib/format";
import { IkonCentang, IkonKeranjang, IkonLonceng, IkonOrang, IkonPeringatan, IkonSegitigaPeringatan } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { AturanKomitmen } from "./aturan-komitmen";
import { Catatan } from "./catatan";
import { barisPenaltiBerlaku } from "./data";
import { FormKomitmen } from "./form-komitmen";

const kelasTombolNonaktif =
  "mt-4 inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-[10px] bg-[#eef1ec] text-base font-semibold text-muted";

/** Panel aksi detail daftar tunggu: Komitmen (form klien), status tertutup, aturan, dan Ikuti. */
export function PanelKomitmen({ data: d, alasan }: { data: DaftarTungguTampil; alasan: string | null }) {
  const path = `/daftar-tunggu/${d.id}`;
  const hrefMasuk = `/masuk?lanjut=${encodeURIComponent(path)}`;
  const s = LABEL_SATUAN[d.satuan];
  const sisaKuota = d.kuota === null ? null : Math.max(0, d.kuota - d.terkomitmen);
  const kuotaKurang = sisaKuota !== null && sisaKuota < d.minKomitmen;
  const keadaan =
    d.status === "gagal-panen"
      ? "gagal"
      : d.status === "siap-panen"
        ? "selesai"
        : d.kuotaPenuh || kuotaKurang
          ? "penuh"
          : "buka";
  const berlaku = barisPenaltiBerlaku(d.status, d.jadwalPanen);
  const persen = d.persenKuota ?? 0;
  const tampilIkuti = d.status !== "gagal-panen" && !(d.status === "siap-panen" && d.produkSlug);

  return (
    <section id="komitmen" aria-labelledby="judul-komitmen" className="scroll-mt-6 rounded-2xl border border-line bg-white p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="judul-komitmen" className="text-xl font-bold tracking-tight text-brand-900">
            Komitmen
          </h2>
          <p className="mt-0.5 text-sm text-muted">Amankan bagianmu sebelum panen.</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-xs text-muted">Perkiraan harga</span>
          <span className="text-lg font-bold text-brand-900">{rupiah(d.hargaPerkiraan)}</span>
          <span className="text-xs text-muted">/{s}</span>
        </p>
      </div>

      {(keadaan === "buka" || keadaan === "penuh") &&
        (d.kuota !== null ? (
          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">Kuota Komitmen</span>
              <span className="text-muted">
                <span className="font-semibold text-ink">{angka(d.terkomitmen)}</span> / {angka(d.kuota)} {s}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Kuota Komitmen terisi"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={persen}
              aria-valuetext={`${persen}% terisi`}
              className="mt-2 h-2 overflow-hidden rounded-full bg-tint"
            >
              <div className={`h-full rounded-full ${d.kuotaPenuh ? "bg-muted" : "bg-accent"}`} style={{ width: `${persen}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {d.kuotaPenuh ? "Kuota penuh" : `${persen}% terisi · sisa ${angka(sisaKuota ?? 0)} ${s}`} ·{" "}
              {angka(d.jumlahKomitmen)} komitmen
            </p>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-tint px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
            <span className="font-semibold">Tanpa kuota.</span> Bila hasil panen kurang, stok dibagi sesuai aturan
            prioritas Komitmen.
          </p>
        ))}

      {keadaan === "buka" && (
        <>
          {d.jadwalPanen.jenis === "belum-ada" && (
            <Catatan nada="kuning" ikon={<IkonPeringatan size={18} />} className="mt-4">
              Perkiraan panen belum tersedia: dana minimum ditahan tanpa kepastian jadwal.
            </Catatan>
          )}
          <FormKomitmen
            path={path}
            harga={d.hargaPerkiraan}
            satuan={d.satuan}
            minKomitmen={d.minKomitmen}
            sisaKuota={sisaKuota}
            penaltiPersen={berlaku === "belum-ada" ? 0 : 20}
            catatanPenalti={
              berlaku === "belum-ada"
                ? "Pembatalan tanpa penalti selama perkiraan panen belum ditetapkan."
                : berlaku === "tertunda"
                  ? "Tanpa penalti bila dibatalkan dalam 48 jam sejak pemberitahuan penundaan."
                  : ""
            }
          />
        </>
      )}

      {keadaan === "penuh" && (
        <>
          <Catatan nada="netral" judul="Kuota Komitmen penuh, kamu masih bisa mengikuti" ikon={<IkonOrang size={18} />} className="mt-4">
            {kuotaKurang && !d.kuotaPenuh
              ? `Sisa kuota (${angka(sisaKuota ?? 0)} ${s}) kurang dari jumlah minimum Komitmen (${angka(d.minKomitmen)} ${s}). `
              : ""}
            Sisa stok setelah pemegang Komitmen dibuka untuk umum saat panen.
          </Catatan>
          <button type="button" disabled className={kelasTombolNonaktif}>
            Komitmen ditutup
          </button>
        </>
      )}

      {keadaan === "gagal" && (
        <>
          <Catatan nada="merah" judul="Gagal panen, Komitmen ditutup" ikon={<IkonSegitigaPeringatan size={18} />} className="mt-4">
            {alasan && (
              <p>
                <span className="font-semibold">Alasan:</span> {alasan}
              </p>
            )}
            <p className={alasan ? "mt-1" : ""}>
              Dana minimum seluruh pemegang Komitmen dikembalikan penuh secara otomatis, tanpa penalti.
            </p>
          </Catatan>
          <button type="button" disabled className={kelasTombolNonaktif}>
            Komitmen ditutup
          </button>
        </>
      )}

      {keadaan === "selesai" && (
        <>
          <Catatan nada="hijau" judul="Daftar tunggu selesai" ikon={<IkonCentang size={18} />} className="mt-4">
            {d.produkSlug
              ? "Panen sudah tersedia. Pemegang Komitmen dapat stok lebih dulu, sisanya bisa dibeli sekarang."
              : "Panen sudah tersedia dan petani sedang menyiapkan produknya. Ikuti agar kamu diberi tahu saat bisa dibeli."}
          </Catatan>
          {d.produkSlug && (
            <Link href={`/produk/${d.produkSlug}`} className={`${kelasTombolSitus("aksen")} mt-4 w-full gap-2`}>
              <IkonKeranjang size={20} />
              Beli sekarang
            </Link>
          )}
        </>
      )}

      <div className="mt-5">
        <AturanKomitmen berlaku={berlaku} />
      </div>

      {tampilIkuti && (
        <div className="mt-5 border-t border-line pt-5">
          {/* TODO: sambungkan ke API Ikuti setelah sesi tersedia (tombol jadi toggle aria-pressed). */}
          <Link href={hrefMasuk} className={`${kelasTombolSitus("garis")} w-full gap-2`}>
            <IkonLonceng size={20} />
            Ikuti
            <span className="font-normal text-muted">· {angka(d.pengikut)} pengikut</span>
          </Link>
          <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
            Gratis, tanpa komitmen. Kamu diberi tahu saat status berubah, jadwal panen diperbarui, dan petani
            mengunggah foto lahan baru.
          </p>
        </div>
      )}
    </section>
  );
}
