import type { ProdukTampil } from "@/lib/api/tipe";
import { KartuProduk } from "./kartu-produk";

/** Grid responsif: 2 kolom di ponsel, 3 di tablet, 4 di desktop. */
export function GridProduk({ produk, prioritas = 0 }: { produk: ProdukTampil[]; prioritas?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {produk.map((p, i) => (
        <li key={p.id}>
          <KartuProduk produk={p} prioritas={i < prioritas} />
        </li>
      ))}
    </ul>
  );
}
