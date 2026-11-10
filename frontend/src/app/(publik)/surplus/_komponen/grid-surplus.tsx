import type { ProdukTampil } from "@/lib/api/tipe";
import { labelSisaHari, tanggal } from "@/lib/format";
import { IkonJam } from "@/app/_komponen/ikon";
import { KartuProduk } from "../../_komponen/kartu-produk";

/** Grid seperti `GridProduk`, dengan penanda sisa hari di atas setiap kartu (kartu bersama tidak diubah). */
export function GridSurplus({ produk, prioritas = 0 }: { produk: ProdukTampil[]; prioritas?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {produk.map((p, i) => {
        const mendesak = p.sisaHari <= 1;
        return (
          <li key={p.id} className="flex flex-col gap-1.5">
            <p
              className={`inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-bold ${
                mendesak ? "bg-[#c2410c] text-white" : "bg-[#ffedd5] text-[#9a3412]"
              }`}
            >
              <IkonJam size={13} className="shrink-0" />
              {labelSisaHari(p.sisaHari)}
              <span className="sr-only">, kedaluwarsa {tanggal(p.tanggalKedaluwarsa)}</span>
            </p>
            <div className="flex flex-1 flex-col">
              <KartuProduk produk={p} prioritas={i < prioritas} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
