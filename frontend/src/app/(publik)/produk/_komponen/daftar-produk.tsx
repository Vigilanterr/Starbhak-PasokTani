import Link from "next/link";
import type { ReactNode } from "react";
import type { FilterProduk, HasilHalaman, ProdukTampil } from "@/lib/api/tipe";
import { ambilKategori } from "@/lib/api/katalog";
import { hrefFilter, keQueryString } from "@/lib/filter-produk";
import { angka } from "@/lib/format";
import { IkonSaring } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { GridProduk } from "../../_komponen/grid-produk";
import { KeadaanKosong } from "../../_komponen/kosong";
import { Paginasi } from "../../_komponen/paginasi";
import {
  adaFilterAktif,
  hrefHapusFilter,
  susunChipFilter,
  urutanBawaan,
  type OpsiKatalog,
} from "./opsi-katalog";
import { PanelFilter } from "./panel-filter";
import { PilihUrutan } from "./pilih-urutan";
import { ChipFilterAktif, PitaLokasi } from "./pita-filter";
import { TataLetakKatalog } from "./tata-letak-katalog";
import { TombolDekatSaya } from "./tombol-dekat-saya";

const ID_FORM = "form-filter-produk";
const ID_PANEL = "panel-filter-produk";

type Props = {
  opsi: OpsiKatalog;
  /** Filter dari URL yang sudah dirapikan dengan `rapikanFilter(…, opsi)` (tanpa filter terkunci). */
  filter: FilterProduk;
  hasil: HasilHalaman<ProdukTampil>;
  /** Pengganti `GridProduk` untuk `hasil.item` (mis. kartu dengan sisa hari di /surplus). */
  grid?: ReactNode;
  /** Keadaan kosong khusus halaman, dipakai saat TIDAK ada filter aktif. */
  kosong?: { judul: string; deskripsi?: ReactNode; aksi?: ReactNode };
};

/**
 * Daftar produk lengkap: panel filter, urutan, "Dekat saya", pita lokasi, chip filter aktif,
 * grid, dan paginasi. Dipakai oleh /produk, /cari, /surplus, dan /kategori/[slug].
 * Render di dalam `<Suspense>` karena isinya bergantung pada `searchParams`.
 */
export async function DaftarProduk({ opsi, filter, hasil, grid, kosong }: Props) {
  const kunci = opsi.kunci ?? [];
  const kategori = kunci.includes("kategori") ? [] : await ambilKategori();
  const dasar: FilterProduk = { ...filter, halaman: undefined };
  const query = keQueryString(dasar);
  const chip = susunChipFilter(filter, opsi.path, kategori);
  const hrefReset = hrefHapusFilter(filter, opsi.path);
  const lokasiAktif = filter.titik !== undefined || filter.radiusKm !== undefined;

  return (
    <TataLetakKatalog
      query={query}
      jumlahFilter={chip.length}
      idPanel={ID_PANEL}
      urutan={
        <>
          <PilihUrutan
            key={query}
            form={ID_FORM}
            nilai={filter.urut ?? urutanBawaan(opsi)}
            relevan={opsi.pencarian}
          />
          <noscript>
            <button type="submit" form={ID_FORM} className="mt-2 text-sm font-semibold text-brand-600 underline">
              Urutkan
            </button>
          </noscript>
        </>
      }
      ringkasan={
        <p role="status" className="text-[15px] text-muted lg:text-sm">
          <span className="font-bold text-ink">{angka(hasil.total)}</span> produk
        </p>
      }
      dekatSaya={<TombolDekatSaya path={opsi.path} query={query} aktif={lokasiAktif} />}
      panel={
        <PanelFilter
          idForm={ID_FORM}
          query={query}
          path={opsi.path}
          filter={filter}
          kategori={kategori}
          tampilSurplus={!kunci.includes("surplus")}
          hrefReset={chip.length > 0 ? hrefReset : null}
        />
      }
    >
      <div className="flex flex-col gap-3">
        <h2 className="sr-only">Daftar produk</h2>
        <PitaLokasi path={opsi.path} filter={filter} />
        <ChipFilterAktif chip={chip} hrefHapusSemua={hrefReset} />
        <div className={chip.length > 0 || lokasiAktif ? "mt-1" : ""}>
          {hasil.total === 0 ? (
            <Kosong opsi={opsi} filter={filter} hrefReset={chip.length > 0 ? hrefReset : null} kosong={kosong} />
          ) : (
            (grid ?? <GridProduk produk={hasil.item} prioritas={4} />)
          )}
        </div>
      </div>
      <Paginasi
        halaman={hasil.halaman}
        jumlahHalaman={hasil.jumlahHalaman}
        href={(n) => hrefFilter(opsi.path, { ...dasar, halaman: n })}
      />
    </TataLetakKatalog>
  );
}

function Kosong({
  opsi,
  filter,
  hrefReset,
  kosong,
}: {
  opsi: OpsiKatalog;
  filter: FilterProduk;
  hrefReset: string | null;
  kosong: Props["kosong"];
}) {
  const tautanSemua =
    opsi.path !== "/produk" ? (
      <Link href="/produk" className={kelasTombolSitus("garis")}>
        Lihat semua produk
      </Link>
    ) : null;

  if (adaFilterAktif(filter)) {
    return (
      <KeadaanKosong
        ikon={<IkonSaring size={24} />}
        judul="Belum ada produk yang cocok dengan filtermu"
        deskripsi="Coba longgarkan filter, ubah rentang harga, atau perbesar radius pencarian."
        aksi={
          hrefReset || tautanSemua ? (
            <>
              {hrefReset && (
                <Link href={hrefReset} className={kelasTombolSitus("utama")}>
                  Hapus semua filter
                </Link>
              )}
              {tautanSemua}
            </>
          ) : undefined
        }
      />
    );
  }

  return (
    <KeadaanKosong
      judul={kosong?.judul ?? "Belum ada produk"}
      deskripsi={kosong?.deskripsi ?? "Produk baru dari petani akan segera tampil di sini."}
      aksi={kosong?.aksi ?? tautanSemua ?? undefined}
    />
  );
}
