import type { IkonKategori, KabarLahan as TipeKabarLahan } from "@/lib/api/tipe";
import { tanggal } from "@/lib/format";
import { IkonKamera } from "@/app/_komponen/ikon";
import { FotoKomoditas } from "@/app/(publik)/_komponen/foto-komoditas";
import { JudulBagian } from "@/app/(publik)/_komponen/judul-bagian";

/** Grid foto perkembangan tanaman (sudah diurutkan terbaru dulu). */
export function KabarLahan({ kabar, ikon, komoditas }: { kabar: TipeKabarLahan[]; ikon: IkonKategori; komoditas: string }) {
  return (
    <section aria-labelledby="judul-kabar">
      <JudulBagian
        id="judul-kabar"
        judul="Kabar lahan"
        deskripsi="Foto perkembangan tanaman yang diunggah petani secara berkala."
      />
      {kabar.length === 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-line bg-white p-5 text-[15px] leading-relaxed text-muted">
          <IkonKamera size={20} className="mt-0.5 shrink-0 text-brand-600" />
          <p>Petani belum mengunggah foto lahan. Ikuti daftar tunggu ini agar kamu diberi tahu saat ada foto baru.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {kabar.map((k, i) => (
            <li key={`${k.tanggal}-${i}`}>
              <figure className="h-full overflow-hidden rounded-2xl border border-line bg-white">
                <FotoKomoditas
                  ikon={ikon}
                  alt={`Foto lahan ${komoditas}: ${k.keterangan}`}
                  src={k.src}
                  ukuranIkon={36}
                  sizes="(min-width: 1024px) 240px, (min-width: 768px) 30vw, 50vw"
                  className="aspect-square w-full"
                />
                <figcaption className="p-3">
                  <time dateTime={k.tanggal} className="text-xs text-muted">
                    {tanggal(k.tanggal)}
                  </time>
                  <p className="mt-0.5 line-clamp-2 text-sm leading-snug font-medium text-ink">{k.keterangan}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
