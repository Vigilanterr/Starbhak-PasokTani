import type { DaftarTungguTampil, EntriLinimasa } from "@/lib/api/tipe";
import { TANGGAL_ACUAN } from "@/lib/api/acuan";
import { awalPanen } from "@/lib/api/bersama";
import { labelJadwalPanen, selisihHari, tanggal } from "@/lib/format";
import { IkonKalender, IkonPeringatan } from "@/app/_komponen/ikon";
import { JudulBagian } from "@/app/(publik)/_komponen/judul-bagian";
import { Catatan } from "./catatan";

const JENIS = {
  tanggal: "Tanggal pasti",
  rentang: "Perkiraan rentang",
  "belum-ada": "Belum ada perkiraan",
} as const;

/** "Sekitar 36 hari lagi", "Hari ini", atau null bila sudah lewat / tidak relevan. */
export function labelHitungMundur(d: Pick<DaftarTungguTampil, "jadwalPanen" | "status">): string | null {
  const awal = awalPanen(d);
  if (!awal || d.status === "siap-panen" || d.status === "gagal-panen") return null;
  const n = selisihHari(TANGGAL_ACUAN, awal);
  if (n < 0) return null;
  if (n === 0) return "Mulai hari ini";
  return `Sekitar ${n} hari lagi`;
}

/** Kartu jadwal panen + peringatan bila perkiraan belum tersedia. */
export function KartuJadwalPanen({ data: d, linimasa }: { data: DaftarTungguTampil; linimasa: EntriLinimasa[] }) {
  const perubahan = linimasa.filter((e) => e.jenis === "jadwal");
  const terakhir = perubahan[0];
  const belumAda = d.jadwalPanen.jenis === "belum-ada";
  const mundur = labelHitungMundur(d);
  const gagal = d.status === "gagal-panen";

  return (
    <section aria-labelledby="judul-jadwal">
      <JudulBagian id="judul-jadwal" judul="Jadwal panen" />
      <div className="flex gap-4 rounded-2xl border border-line bg-white p-4 md:p-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-tint text-brand-900">
          <IkonKalender size={22} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            {gagal ? "Jadwal semula" : JENIS[d.jadwalPanen.jenis]}
          </p>
          <p
            className={`mt-0.5 text-xl font-bold tracking-tight ${belumAda ? "text-muted italic" : "text-brand-900"} ${gagal ? "line-through" : ""}`}
          >
            {labelJadwalPanen(d.jadwalPanen)}
          </p>
          {mundur && <p className="mt-0.5 text-sm font-medium text-brand-600">{mundur}</p>}
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {terakhir ? `Terakhir diubah ${tanggal(terakhir.tanggal)}. ` : ""}
            {perubahan.length > 0
              ? `Jadwal sudah berubah ${perubahan.length} kali; semua perubahan tercatat di linimasa.`
              : "Setiap perubahan jadwal akan tercatat di linimasa dan dikirim ke pengikut."}
          </p>
        </div>
      </div>

      {belumAda && !gagal && d.status !== "siap-panen" && (
        <Catatan nada="kuning" judul="Perkiraan panen belum tersedia" ikon={<IkonPeringatan size={18} />} className="mt-3">
          Petani bisa menambahkannya kapan saja, dan pengikut diberi tahu saat perkiraan pertama ditetapkan. Kamu tetap
          bisa Komitmen, tetapi dana minimum ditahan tanpa kepastian jadwal. Pembatalan tanpa penalti hanya berlaku
          sampai perkiraan ditetapkan.
        </Catatan>
      )}
    </section>
  );
}
