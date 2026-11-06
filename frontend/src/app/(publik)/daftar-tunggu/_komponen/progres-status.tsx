import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import type { DaftarTungguTampil, EntriLinimasa, StatusDaftarTunggu } from "@/lib/api/tipe";
import { labelJadwalPanen, tanggalPendek } from "@/lib/format";
import { ALUR_STATUS, LABEL_STATUS_DAFTAR_TUNGGU } from "@/lib/label";
import {
  IkonCentang,
  IkonJam,
  IkonKalender,
  IkonKeranjang,
  IkonPetir,
  IkonSegitigaPeringatan,
  IkonSilang,
  IkonTunas,
} from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { JudulBagian } from "@/app/(publik)/_komponen/judul-bagian";
import { Catatan } from "./catatan";

type Ikon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
type Keadaan = "selesai" | "aktif" | "nanti" | "batal";
type Nada = "netral" | "hijau" | "kuning" | "biru" | "merah";
type Langkah = { status: StatusDaftarTunggu; keadaan: Keadaan; nada: Nada; keterangan: string | null };

/** Status cabang dari "Sudah Ditanam" (S4). Tampil sebagai langkah sisipan sebelum "Siap Panen". */
const CABANG: StatusDaftarTunggu[] = ["panen-tertunda", "panen-lebih-awal", "gagal-panen"];

const IKON_STATUS: Record<StatusDaftarTunggu, Ikon> = {
  "jadwal-tanam": IkonKalender,
  "sudah-tanam": IkonTunas,
  "panen-tertunda": IkonJam,
  "panen-lebih-awal": IkonPetir,
  "gagal-panen": IkonSilang,
  "siap-panen": IkonCentang,
};

const LINGKARAN_AKTIF: Record<Nada, string> = {
  netral: "bg-brand-900 text-white ring-4 ring-mint",
  hijau: "bg-brand-900 text-white ring-4 ring-mint",
  kuning: "bg-[#b45309] text-white ring-4 ring-[#fef3c7]",
  biru: "bg-[#0369a1] text-white ring-4 ring-[#e0f2fe]",
  merah: "bg-danger text-white ring-4 ring-danger-bg",
};

const GARIS_AKTIF: Record<Nada, string> = {
  netral: "border-brand-600",
  hijau: "border-brand-600",
  kuning: "border-[#d97706]",
  biru: "border-[#0284c7]",
  merah: "border-danger",
};

const TEKS_KEADAAN: Record<Keadaan, string> = {
  selesai: "selesai",
  aktif: "status saat ini",
  nanti: "belum",
  batal: "tidak dilanjutkan",
};

function susunLangkah(d: DaftarTungguTampil, tanggalStatus: string | null): Langkah[] {
  const s = d.status;
  const cabang = CABANG.includes(s);
  const iTanam = ALUR_STATUS.indexOf("sudah-tanam");
  // Pada status cabang, "Sudah Ditanam" sudah terlewati; cabang menjadi langkah aktif.
  const iAktif = cabang ? iTanam : ALUR_STATUS.indexOf(s);

  const keterangan = (st: StatusDaftarTunggu): string | null => {
    if (st === "jadwal-tanam") return `Dibuat ${tanggalPendek(d.dibuat)}`;
    if (st === "sudah-tanam") {
      if (!d.tanggalTanam) return null;
      return s === "jadwal-tanam" ? `Rencana ${tanggalPendek(d.tanggalTanam)}` : tanggalPendek(d.tanggalTanam);
    }
    if (st === "siap-panen") {
      if (s === "gagal-panen") return "Tidak dilanjutkan";
      if (s === "siap-panen" && tanggalStatus) return tanggalPendek(tanggalStatus);
      return d.jadwalPanen.jenis === "belum-ada" ? "Belum ada perkiraan" : labelJadwalPanen(d.jadwalPanen);
    }
    return null;
  };

  const langkah: Langkah[] = ALUR_STATUS.map((st, i) => ({
    status: st,
    keadaan:
      i < iAktif || (cabang && i === iAktif) ? "selesai" : i === iAktif ? "aktif" : s === "gagal-panen" ? "batal" : "nanti",
    nada: "hijau",
    keterangan: keterangan(st),
  }));

  if (cabang) {
    langkah.splice(iTanam + 1, 0, {
      status: s,
      keadaan: "aktif",
      nada: LABEL_STATUS_DAFTAR_TUNGGU[s].nada,
      keterangan: tanggalStatus ? tanggalPendek(tanggalStatus) : null,
    });
  }
  return langkah;
}

function Lingkaran({ langkah: l, nomor }: { langkah: Langkah; nomor: number }) {
  const dasar = "relative grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold";
  if (l.keadaan === "selesai") {
    return (
      <span aria-hidden className={`${dasar} bg-brand-600 text-white`}>
        <IkonCentang size={16} strokeWidth={2.5} />
      </span>
    );
  }
  if (l.keadaan === "aktif") {
    const Ikon = IKON_STATUS[l.status];
    return (
      <span aria-hidden className={`${dasar} ${LINGKARAN_AKTIF[l.nada]}`}>
        <Ikon size={16} strokeWidth={2.25} />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`${dasar} border-2 bg-white ${l.keadaan === "batal" ? "border-dashed border-[#c9d0c6] text-[#a3aba2]" : "border-line text-muted"}`}
    >
      {nomor}
    </span>
  );
}

/** Stepper status daftar tunggu + keterangan untuk status cabang (tertunda, lebih awal, gagal) dan siap panen. */
export function ProgresStatus({
  data: d,
  linimasa,
  alasan,
}: {
  data: DaftarTungguTampil;
  /** Sudah diurutkan terbaru dulu. */
  linimasa: EntriLinimasa[];
  alasan: string | null;
}) {
  const tanggalStatus = linimasa.find((e) => e.jenis === "status")?.tanggal ?? null;
  const langkah = susunLangkah(d, tanggalStatus);
  const jadwal = labelJadwalPanen(d.jadwalPanen);
  const teksAlasan = alasan ?? "Petani belum mencantumkan alasan.";

  return (
    <section aria-labelledby="judul-status">
      <JudulBagian id="judul-status" judul="Status tanam" deskripsi="Dari rencana tanam sampai panen, langsung dari petani." />
      <div className="rounded-2xl border border-line bg-white p-4 md:p-6">
        <ol aria-label="Tahapan daftar tunggu" className={`grid ${langkah.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {langkah.map((l, i) => {
            const garis =
              l.keadaan === "selesai"
                ? "border-brand-600"
                : l.keadaan === "aktif"
                  ? GARIS_AKTIF[l.nada]
                  : l.keadaan === "batal"
                    ? "border-dashed border-[#c9d0c6]"
                    : "border-line";
            return (
              <li
                key={l.status}
                aria-current={l.keadaan === "aktif" ? "step" : undefined}
                className="relative flex flex-col items-center px-1 text-center"
              >
                {i > 0 && <span aria-hidden className={`absolute top-4 right-1/2 w-full -translate-y-1/2 border-t-2 ${garis}`} />}
                <Lingkaran langkah={l} nomor={i + 1} />
                <span
                  className={`mt-2.5 text-[13px] leading-tight ${
                    l.keadaan === "aktif"
                      ? "font-bold text-ink"
                      : l.keadaan === "selesai"
                        ? "font-semibold text-ink"
                        : l.keadaan === "batal"
                          ? "font-semibold text-muted line-through"
                          : "font-semibold text-muted"
                  }`}
                >
                  {LABEL_STATUS_DAFTAR_TUNGGU[l.status].label}
                  <span className="sr-only">, {TEKS_KEADAAN[l.keadaan]}</span>
                </span>
                {l.keterangan && <span className="mt-1 text-xs leading-snug text-muted">{l.keterangan}</span>}
              </li>
            );
          })}
        </ol>

        <div className="mt-5">
          {d.status === "jadwal-tanam" && (
            <Catatan nada="netral" ikon={<IkonKalender size={18} />}>
              Petani sudah membuat rencana tanam. Kamu bisa mengikuti atau berkomitmen sejak sekarang.
            </Catatan>
          )}
          {d.status === "sudah-tanam" && (
            <Catatan nada="hijau" ikon={<IkonTunas size={18} />}>
              Tanaman sedang tumbuh di lahan. Pantau perkembangannya lewat kabar lahan dari petani.
            </Catatan>
          )}
          {d.status === "panen-tertunda" && (
            <Catatan nada="kuning" judul="Panen tertunda" ikon={<IkonJam size={18} />}>
              <p>
                <span className="font-semibold">Alasan:</span> {teksAlasan}
              </p>
              <p className="mt-1">
                Jadwal baru: <span className="font-semibold">{jadwal}</span>. Pemegang Komitmen bisa membatalkan tanpa
                penalti dalam 48 jam sejak pemberitahuan penundaan, berlaku untuk setiap penundaan.
              </p>
            </Catatan>
          )}
          {d.status === "panen-lebih-awal" && (
            <Catatan nada="biru" judul="Panen lebih awal" ikon={<IkonPetir size={18} />}>
              Jadwal panen dimajukan menjadi <span className="font-semibold">{jadwal}</span>. Pemegang Komitmen sudah diberi
              tahu; siapkan sisa pembayaran karena wajib dilunasi dalam 48 jam setelah panen tersedia.
            </Catatan>
          )}
          {d.status === "gagal-panen" && (
            <Catatan nada="merah" judul="Gagal panen" ikon={<IkonSegitigaPeringatan size={18} />}>
              <p>
                <span className="font-semibold">Alasan:</span> {teksAlasan}
              </p>
              <p className="mt-1">
                Dana minimum seluruh pemegang Komitmen dikembalikan penuh secara otomatis. Ini bukan pembatalan, jadi
                tidak ada penalti.
              </p>
            </Catatan>
          )}
          {d.status === "siap-panen" && (
            <Catatan nada="hijau" judul="Sudah panen, daftar tunggu selesai" ikon={<IkonCentang size={18} />}>
              <p>Pemegang Komitmen mendapat stok lebih dulu. Sisa stok dibuka untuk umum: siapa cepat, dia dapat.</p>
              {d.produkSlug && (
                <Link href={`/produk/${d.produkSlug}`} className={`${kelasTombolSitus("aksen")} mt-3 h-11 gap-2 px-5 text-[15px]`}>
                  <IkonKeranjang size={18} />
                  Beli sekarang
                </Link>
              )}
            </Catatan>
          )}
        </div>
      </div>
    </section>
  );
}
