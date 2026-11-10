import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { DaftarTungguTampil } from "@/lib/api/tipe";
import { ambilDaftarTunggu, ambilDaftarTungguById, ambilPetaniById, ambilSemuaIdDaftarTunggu } from "@/lib/api/katalog";
import { angka, hargaPerSatuan, labelJadwalPanen, LABEL_SATUAN, tanggal } from "@/lib/format";
import { ChipStatus } from "@/app/(publik)/_komponen/chip-status";
import { FotoKomoditas } from "@/app/(publik)/_komponen/foto-komoditas";
import { JudulBagian } from "@/app/(publik)/_komponen/judul-bagian";
import { KartuDaftarTunggu } from "@/app/(publik)/_komponen/kartu-daftar-tunggu";
import { RemahRoti } from "@/app/(publik)/_komponen/remah-roti";
import { alasanTerbaru, terbaruDulu, wilayahRingkas } from "../_komponen/data";
import { KartuJadwalPanen, labelHitungMundur } from "../_komponen/jadwal-panen";
import { KabarLahan } from "../_komponen/kabar-lahan";
import { KartuPetaniDaftar } from "../_komponen/kartu-petani-daftar";
import { Linimasa } from "../_komponen/linimasa";
import { PanelKomitmen } from "../_komponen/panel-komitmen";
import { ProgresStatus } from "../_komponen/progres-status";

export async function generateStaticParams() {
  const id = await ambilSemuaIdDaftarTunggu();
  return id.map((x) => ({ id: x }));
}

export async function generateMetadata({ params }: PageProps<"/daftar-tunggu/[id]">): Promise<Metadata> {
  const { id } = await params;
  const d = await ambilDaftarTungguById(id);
  if (!d) return { title: "Daftar tunggu tidak ditemukan" };
  return {
    title: `${d.komoditas} · Daftar Tunggu`,
    description: `${d.komoditas} dari ${d.petani.namaToko}, ${d.petani.kecamatan}. Perkiraan panen: ${labelJadwalPanen(d.jadwalPanen)}. Ikuti atau Komitmen sebelum panen.`,
  };
}

/** Daftar tunggu lain untuk rel: kategori sama dulu, lalu yang populer. Hanya yang masih berjalan. */
async function ambilLainnya(d: DaftarTungguTampil, jumlah = 4): Promise<DaftarTungguTampil[]> {
  const [sekategori, populer] = await Promise.all([ambilDaftarTunggu({ kategori: d.kategori }), ambilDaftarTunggu()]);
  const berjalan = (x: DaftarTungguTampil) => x.id !== d.id && x.status !== "gagal-panen" && x.status !== "siap-panen";
  const hasil = sekategori.filter(berjalan);
  for (const x of populer) {
    if (hasil.length >= jumlah) break;
    if (berjalan(x) && !hasil.some((h) => h.id === x.id)) hasil.push(x);
  }
  return hasil.slice(0, jumlah);
}

export default async function Page({ params }: PageProps<"/daftar-tunggu/[id]">) {
  const { id } = await params;
  const d = await ambilDaftarTungguById(id);
  if (!d) notFound();

  const [petani, lainnya] = await Promise.all([ambilPetaniById(d.petaniId), ambilLainnya(d)]);
  const linimasa = terbaruDulu(d.linimasa);
  const kabar = terbaruDulu(d.kabarLahan);
  const sampul = kabar[0];
  const alasan = alasanTerbaru(linimasa);
  const mundur = labelHitungMundur(d);
  const s = LABEL_SATUAN[d.satuan];

  const fakta: { label: string; nilai: string; catatan?: string | null; redup?: boolean }[] = [
    {
      label: "Perkiraan panen",
      nilai: labelJadwalPanen(d.jadwalPanen),
      catatan: mundur,
      redup: d.jadwalPanen.jenis === "belum-ada",
    },
    { label: "Perkiraan hasil", nilai: `${angka(d.perkiraanHasil)} ${s}` },
    { label: "Perkiraan harga", nilai: hargaPerSatuan(d.hargaPerkiraan, d.satuan) },
    {
      label: d.status === "jadwal-tanam" ? "Rencana tanam" : "Tanggal tanam",
      nilai: d.tanggalTanam ? tanggal(d.tanggalTanam) : "Belum ditentukan",
      redup: !d.tanggalTanam,
    },
    { label: "Pengikut", nilai: angka(d.pengikut) },
    { label: "Jumlah Komitmen", nilai: angka(d.jumlahKomitmen) },
  ];

  return (
    <div className="mx-auto w-full max-w-300 px-4 pt-4 pb-14 md:px-6 md:pt-6 md:pb-20">
      <RemahRoti
        item={[
          { label: "Beranda", href: "/" },
          { label: "Daftar Tunggu", href: "/daftar-tunggu" },
          { label: d.komoditas },
        ]}
      />

      {/* Ponsel: header -> panel Komitmen -> konten. Desktop: panel menempel (sticky) di kolom kanan. */}
      <div className="mt-4 grid grid-cols-1 gap-8 md:mt-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-x-10 lg:gap-y-10">
        <header className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start md:gap-6">
            <figure className="relative">
              <FotoKomoditas
                ikon={d.ikonKategori}
                alt={sampul ? `Kabar lahan ${d.komoditas}: ${sampul.keterangan}` : `Ilustrasi ${d.komoditas}`}
                src={sampul?.src}
                ukuranIkon={64}
                prioritas
                sizes="(min-width: 1024px) 340px, (min-width: 768px) 45vw, 100vw"
                className="aspect-[16/10] w-full rounded-2xl md:aspect-[4/3]"
              />
              {sampul && (
                <figcaption className="absolute bottom-2.5 left-2.5 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-ink">
                  Kabar lahan terbaru · {tanggal(sampul.tanggal)}
                </figcaption>
              )}
            </figure>
            <div className="mt-5 md:mt-0">
              <ChipStatus status={d.status} />
              <h1 className="mt-3 text-[28px] leading-tight font-bold tracking-tight text-brand-900 md:text-[32px]">
                {d.komoditas}
              </h1>
              <p className="mt-1.5 text-[15px] text-muted">
                dari{" "}
                <Link href={`/petani/${d.petaniId}`} className="font-semibold text-brand-600 no-underline hover:text-brand-900 hover:underline">
                  {d.petani.namaToko}
                </Link>{" "}
                · {d.petani.kecamatan}, {wilayahRingkas(d.petani.labelWilayah)}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink">{d.deskripsi}</p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {fakta.map((f) => (
              <div key={f.label} className="bg-white px-3.5 py-3 md:px-4">
                <dt className="text-xs text-muted">{f.label}</dt>
                <dd className={`mt-0.5 text-[15px] leading-snug font-semibold ${f.redup ? "text-muted italic" : "text-ink"}`}>
                  {f.nilai}
                  {f.catatan && <span className="mt-0.5 block text-xs font-medium text-brand-600 not-italic">{f.catatan}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100dvh-3rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
          <PanelKomitmen data={d} alasan={alasan} />
        </div>

        <div className="flex min-w-0 flex-col gap-10 md:gap-12 lg:col-start-1 lg:row-start-2">
          <ProgresStatus data={d} linimasa={linimasa} alasan={alasan} />
          <KartuJadwalPanen data={d} linimasa={linimasa} />
          <Linimasa entri={linimasa} />
          <KabarLahan kabar={kabar} ikon={d.ikonKategori} komoditas={d.komoditas} />
          <KartuPetaniDaftar ringkas={d.petani} detail={petani} />
        </div>
      </div>

      {lainnya.length > 0 && (
        <section aria-labelledby="judul-lainnya" className="mt-14 md:mt-20">
          <JudulBagian
            id="judul-lainnya"
            judul="Daftar tunggu lainnya"
            href={`/daftar-tunggu?kategori=${encodeURIComponent(d.kategori)}`}
            labelTautan="Lihat semua"
          />
          <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 lg:gap-5">
            {lainnya.map((x) => (
              <li key={x.id} className="w-[80%] max-w-80 shrink-0 snap-start sm:w-[45%] md:w-auto md:max-w-none">
                <KartuDaftarTunggu data={x} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
