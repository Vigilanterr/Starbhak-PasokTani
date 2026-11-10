import type { ComponentType, SVGProps } from "react";
import type { EntriLinimasa } from "@/lib/api/tipe";
import { tanggal } from "@/lib/format";
import { IkonKalender, IkonKamera, IkonObrolan, IkonSegitigaPeringatan, IkonTunas } from "@/app/_komponen/ikon";
import { JudulBagian } from "@/app/(publik)/_komponen/judul-bagian";

type Ikon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const JENIS: Record<EntriLinimasa["jenis"], { label: string; ikon: Ikon; kelas: string }> = {
  status: { label: "Status", ikon: IkonTunas, kelas: "bg-mint text-brand-900" },
  jadwal: { label: "Jadwal panen", ikon: IkonKalender, kelas: "bg-[#e0f2fe] text-[#075985]" },
  foto: { label: "Foto lahan", ikon: IkonKamera, kelas: "bg-tint text-brand-600" },
  catatan: { label: "Catatan petani", ikon: IkonObrolan, kelas: "bg-[#eef1ec] text-ink" },
};

/** Entri beralasan (tertunda/gagal). Gagal ditandai merah, sisanya kuning. */
function nadaAlasan(e: EntriLinimasa): "merah" | "kuning" {
  return /gagal/i.test(`${e.judul} ${e.isi}`) ? "merah" : "kuning";
}

/** Linimasa perubahan status, jadwal, foto, dan catatan (sudah diurutkan terbaru dulu). */
export function Linimasa({ entri }: { entri: EntriLinimasa[] }) {
  return (
    <section aria-labelledby="judul-linimasa">
      <JudulBagian id="judul-linimasa" judul="Linimasa" deskripsi="Semua perubahan status dan jadwal, terbaru di atas." />
      <div className="rounded-2xl border border-line bg-white p-4 md:p-6">
        {entri.length === 0 ? (
          <p className="text-[15px] text-muted">Belum ada catatan dari petani.</p>
        ) : (
          <ol>
            {entri.map((e, i) => {
              const j = JENIS[e.jenis];
              const nada = e.alasan ? nadaAlasan(e) : null;
              const Ikon = nada ? IkonSegitigaPeringatan : j.ikon;
              const kelasIkon =
                nada === "merah" ? "bg-danger-bg text-danger" : nada === "kuning" ? "bg-[#fef3c7] text-[#b45309]" : j.kelas;
              return (
                <li key={`${e.tanggal}-${i}`} className="relative flex gap-3.5 pb-6 last:pb-0">
                  {i < entri.length - 1 && (
                    <span aria-hidden className="absolute top-11 bottom-1 left-[19px] w-0.5 rounded-full bg-line" />
                  )}
                  <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-full ${kelasIkon}`}>
                    <Ikon size={18} />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs text-muted">
                      <time dateTime={e.tanggal}>{tanggal(e.tanggal)}</time> · {j.label}
                    </p>
                    <h3 className="mt-0.5 text-[15px] leading-snug font-semibold text-ink">{e.judul}</h3>
                    {e.isi && <p className="mt-0.5 text-[15px] leading-relaxed text-muted">{e.isi}</p>}
                    {e.alasan && (
                      <p
                        className={`mt-2 rounded-lg px-3 py-2 text-sm leading-relaxed ${
                          nada === "merah" ? "bg-danger-bg text-danger-ink" : "bg-[#fffaeb] text-[#713f12]"
                        }`}
                      >
                        <span className="font-semibold">Alasan:</span> {e.alasan}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
