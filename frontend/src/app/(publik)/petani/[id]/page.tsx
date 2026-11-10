import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GridProduk } from "@/app/(publik)/_komponen/grid-produk";
import { JudulBagian } from "@/app/(publik)/_komponen/judul-bagian";
import { KartuDaftarTunggu } from "@/app/(publik)/_komponen/kartu-daftar-tunggu";
import { ambilKatalogPetani, ambilPetaniById, ambilSemuaIdPetani, ambilUlasanPetani } from "@/lib/api/katalog";
import { angka, desimal1 } from "@/lib/format";
import { HeaderProfil } from "../_komponen/header-profil";
import { NavigasiBagian, type ItemNavigasiBagian } from "../_komponen/navigasi-bagian";
import { TentangPetani } from "../_komponen/tentang-petani";
import { UlasanPetani } from "../_komponen/ulasan-petani";

export async function generateStaticParams() {
  const semua = await ambilSemuaIdPetani();
  return semua.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/petani/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = await ambilPetaniById(id);
  if (!p) return { title: "Petani tidak ditemukan" };
  return {
    title: p.namaToko,
    description: `${p.namaToko} di ${p.kecamatan}, ${p.labelWilayah}. Komoditas: ${p.komoditas.join(", ")}. Rating ${desimal1(
      p.rating,
    )} dari ${angka(p.jumlahUlasan)} ulasan, ${angka(p.jumlahTransaksi)} transaksi.`,
  };
}

const kelasBagian = "scroll-mt-20";
const kelasKosong = "rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center text-[15px] text-muted";

export default async function Page({ params }: PageProps<"/petani/[id]">) {
  const { id } = await params;
  const petani = await ambilPetaniById(id);
  if (!petani) notFound();

  const [{ produk, daftarTunggu }, ulasan] = await Promise.all([
    ambilKatalogPetani(petani.id),
    ambilUlasanPetani(petani.id, 5),
  ]);
  const jumlahHabis = produk.filter((p) => p.habis).length;

  const bagian: ItemNavigasiBagian[] = [
    { id: "produk", label: "Produk", jumlah: produk.length },
    ...(daftarTunggu.length > 0 ? [{ id: "daftar-tunggu", label: "Daftar Tunggu", jumlah: daftarTunggu.length }] : []),
    { id: "ulasan", label: "Ulasan", jumlah: petani.jumlahUlasan },
    { id: "tentang", label: "Tentang" },
  ];

  return (
    <>
      <HeaderProfil petani={petani} />
      <NavigasiBagian item={bagian} />

      <div className="mx-auto flex w-full max-w-300 flex-col gap-14 px-4 py-10 md:gap-18 md:px-6 md:py-14">
        <section id="produk" aria-labelledby="judul-produk" className={kelasBagian}>
          <JudulBagian
            id="judul-produk"
            judul="Produk"
            deskripsi={
              produk.length > 0
                ? `${angka(produk.length)} produk${jumlahHabis > 0 ? ` · ${angka(jumlahHabis)} stok habis` : ""}`
                : undefined
            }
          />
          {produk.length > 0 ? (
            <GridProduk produk={produk} />
          ) : (
            <p className={kelasKosong}>
              Toko ini belum menjual produk.{" "}
              {daftarTunggu.length > 0 ? "Lihat daftar tunggunya untuk panen yang akan datang." : "Cek lagi nanti, ya."}
            </p>
          )}
        </section>

        {daftarTunggu.length > 0 && (
          <section id="daftar-tunggu" aria-labelledby="judul-daftar-tunggu" className={kelasBagian}>
            <JudulBagian
              id="judul-daftar-tunggu"
              judul="Daftar Tunggu"
              deskripsi="Panen yang belum siap. Ikuti untuk dapat kabar lahan, atau Komitmen lebih dulu agar kebagian."
            />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {daftarTunggu.map((d) => (
                <li key={d.id}>
                  <KartuDaftarTunggu data={d} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id="ulasan" aria-labelledby="judul-ulasan" className={kelasBagian}>
          <JudulBagian id="judul-ulasan" judul="Ulasan pembeli" />
          <UlasanPetani
            item={ulasan.item}
            ringkasan={ulasan.ringkasan}
            rating={petani.rating}
            jumlahUlasan={petani.jumlahUlasan}
            namaToko={petani.namaToko}
          />
        </section>

        <section id="tentang" aria-labelledby="judul-tentang" className={kelasBagian}>
          <JudulBagian id="judul-tentang" judul="Tentang toko" />
          <TentangPetani petani={petani} />
        </section>
      </div>
    </>
  );
}
