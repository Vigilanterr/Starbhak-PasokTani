"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { IkonInfo, IkonKurang, IkonTambah } from "@/app/_komponen/ikon";
import { kirimPembeli, type Galat } from "@/lib/api/pembeli";
import type { BarisKeranjang, Keranjang } from "@/lib/api/tipe";
import { angka, LABEL_SATUAN, rupiah } from "@/lib/format";

/** Pesan pertama dari galat backend: isian yang salah lebih dulu, bila ada. */
const pesanGalat = (g: Galat) => (g.fields ? (Object.values(g.fields)[0] ?? g.pesan) : g.pesan);

/** Keranjang Sementara. Harga yang tampil harga dasar; grosir dan Surplus dihitung di halaman checkout. */
export function KeranjangTampilan({ keranjang }: { keranjang: Keranjang }) {
  const router = useRouter();
  const [sibuk, setSibuk] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function ubahJumlah(baris: BarisKeranjang, jumlah: number) {
    setSibuk(baris.id);
    setGalat(null);
    const hasil = await kirimPembeli("PATCH", `/keranjang/item/${baris.id}`, { jumlah });
    setSibuk(null);
    if (!hasil.ok) return setGalat(pesanGalat(hasil));
    router.refresh();
  }

  async function hapus(baris: BarisKeranjang) {
    setSibuk(baris.id);
    setGalat(null);
    const hasil = await kirimPembeli("DELETE", `/keranjang/item/${baris.id}`);
    setSibuk(null);
    if (!hasil.ok) return setGalat(pesanGalat(hasil));
    router.refresh();
  }

  if (keranjang.baris.length === 0) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-4 py-12 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">Keranjang kamu masih kosong</h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Tambahkan produk dari halaman produk. Menambah ke keranjang belum mengunci stok.
        </p>
        <Link href="/belanja" className={kelasTombolSitus("utama")}>
          Mulai belanja
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:px-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Keranjang Sementara</h1>
          <p className="mt-1 text-sm text-muted">
            {keranjang.baris.length} produk. Isinya dikosongkan setelah checkout.
          </p>
        </header>

        {galat && (
          <p role="alert" className="rounded-xl bg-[#fef2f2] px-4 py-3 text-[14px] font-medium text-danger">
            {galat}
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {keranjang.baris.map((baris) => {
            const s = LABEL_SATUAN[baris.satuan];
            const kurang = baris.jumlah <= baris.minPembelian || sibuk === baris.id;
            const tambah = !baris.tersedia || baris.jumlah + 1 > baris.stok || sibuk === baris.id;
            return (
              <li key={baris.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <Link href={`/produk/${baris.slug}`} className="font-semibold text-ink no-underline hover:text-brand-900 hover:underline">
                    {baris.nama}
                  </Link>
                  <p className="text-[13px] text-muted">
                    {baris.namaToko} · {rupiah(baris.harga)}/{s}
                  </p>
                  {!baris.tersedia && (
                    <p className="mt-1 text-[13px] font-medium text-[#9a3412]">
                      {baris.stok > 0 ? "Produk ini sedang tidak dijual" : "Stok habis"}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-field-border bg-white" aria-label={`Jumlah ${baris.nama}`}>
                    <button
                      type="button"
                      onClick={() => ubahJumlah(baris, baris.jumlah - 1)}
                      disabled={kurang}
                      aria-label="Kurangi jumlah"
                      className="grid size-10 place-items-center text-brand-900 hover:bg-tint disabled:cursor-not-allowed disabled:text-[#b8bfb6] disabled:hover:bg-transparent"
                    >
                      <IkonKurang size={16} />
                    </button>
                    <span className="grid min-w-12 place-items-center border-x border-line px-2 text-[15px] font-semibold text-ink" aria-live="polite">
                      {angka(baris.jumlah)} {s}
                    </span>
                    <button
                      type="button"
                      onClick={() => ubahJumlah(baris, baris.jumlah + 1)}
                      disabled={tambah}
                      aria-label="Tambah jumlah"
                      className="grid size-10 place-items-center text-brand-900 hover:bg-tint disabled:cursor-not-allowed disabled:text-[#b8bfb6] disabled:hover:bg-transparent"
                    >
                      <IkonTambah size={16} />
                    </button>
                  </div>

                  <p className="w-28 text-right text-[15px] font-bold text-brand-900">{rupiah(baris.subtotal)}</p>
                </div>

                <button
                  type="button"
                  onClick={() => hapus(baris)}
                  disabled={sibuk === baris.id}
                  className="self-end text-[13px] font-semibold text-muted underline-offset-3 hover:text-danger hover:underline disabled:opacity-50 sm:self-center"
                >
                  Hapus
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-4">
        <dl className="flex flex-col gap-2 text-[15px]">
          <div className="flex items-baseline justify-between">
            <dt className="text-muted">Jumlah produk</dt>
            <dd className="font-semibold text-ink">{keranjang.baris.length}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt className="font-semibold text-ink">Subtotal</dt>
            <dd aria-live="polite" className="text-[22px] font-bold tracking-tight text-brand-900">
              {rupiah(keranjang.subtotal)}
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-right text-xs text-muted">Belum termasuk ongkir.</p>

        <button type="button" disabled className={`${kelasTombolSitus("utama")} mt-5 w-full disabled:cursor-not-allowed disabled:opacity-45`}>
          Lanjut ke checkout
        </button>
        <p className="mt-3 flex items-start gap-2 text-xs leading-snug text-muted">
          <IkonInfo size={14} className="mt-px shrink-0" />
          Checkout belum tersedia. Harga grosir dan Surplus akan dihitung saat checkout.
        </p>
      </aside>
    </section>
  );
}
