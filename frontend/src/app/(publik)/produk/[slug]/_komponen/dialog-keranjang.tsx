"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { IkonInfo, IkonKeranjang } from "@/app/_komponen/ikon";
import { angka, LABEL_SATUAN, rupiah } from "@/lib/format";
import { KartuPilihan } from "./kartu-pilihan";
import { useBeli } from "./konteks-beli";
import { LembarDialog } from "./lembar-dialog";

type Tujuan = "sementara" | "baru";

const MAKS_NAMA = 50;
const MAKS_CATATAN = 200;

/** Pilihan keranjang saat "Tambah ke Keranjang" (S5): Keranjang Sementara, Keranjang Resep, atau grup baru. */
export function DialogKeranjang({ terbuka, onTutup }: { terbuka: boolean; onTutup: () => void }) {
  return (
    <LembarDialog
      terbuka={terbuka}
      onTutup={onTutup}
      judul="Tambah ke keranjang"
      deskripsi="Pilih keranjang untuk menyimpan produk ini."
    >
      <IsiDialogKeranjang onTutup={onTutup} />
    </LembarDialog>
  );
}

function IsiDialogKeranjang({ onTutup }: { onTutup: () => void }) {
  const { data, jumlah, subtotal, harga, hrefMasuk } = useBeli();
  const router = useRouter();
  const id = useId();
  const [tujuan, setTujuan] = useState<Tujuan>("sementara");
  const [nama, setNama] = useState("");
  const [catatan, setCatatan] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const refNama = useRef<HTMLInputElement>(null);
  const s = LABEL_SATUAN[data.satuan];

  const idNama = `${id}-nama`;
  const idGalat = `${id}-galat`;
  const idCatatan = `${id}-catatan`;

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (tujuan === "baru" && nama.trim() === "") {
      setGalat("Nama grup wajib diisi.");
      refNama.current?.focus();
      return;
    }
    // TODO: sambungkan ke API keranjang (Keranjang Sementara / buat Keranjang Resep berisi produk ini)
    // setelah sesi tersedia. Untuk pengunjung, arahkan ke halaman masuk lalu kembali ke produk ini.
    router.push(hrefMasuk);
  }

  return (
    <form onSubmit={kirim} noValidate>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3 text-sm">
        <p className="min-w-0">
          <span className="block truncate font-semibold text-ink">{data.nama}</span>
          <span className="text-muted">
            {angka(jumlah)} {s} × {rupiah(harga.satuan)}
          </span>
        </p>
        <p className="shrink-0 text-base font-bold text-brand-900">{rupiah(subtotal)}</p>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-ink">Simpan ke</legend>
        <div className="mt-2.5 flex flex-col gap-2.5">
          <KartuPilihan
            jenis="radio"
            name={`${id}-tujuan`}
            value="sementara"
            checked={tujuan === "sementara"}
            onUbah={(v) => v && setTujuan("sementara")}
            judul="Keranjang Sementara"
            tambahan={<span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-brand-900">Bawaan</span>}
            deskripsi="Untuk belanja sekali. Isinya dikosongkan setelah checkout."
          />

          <div className="rounded-xl border border-dashed border-line bg-cream px-4 py-3.5">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <IkonKeranjang size={18} className="shrink-0 text-brand-600" />
              Masuk untuk memilih Keranjang Resep
            </p>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              Keranjang Resep menyimpan daftar belanja per menu, mis. &ldquo;Nasi Goreng&rdquo;. Isinya tetap tersimpan
              setelah checkout, jadi bisa kamu beli ulang tiap minggu.
            </p>
            <Link
              href={hrefMasuk}
              className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand-600 underline-offset-3 hover:text-brand-900 hover:underline"
            >
              Masuk ke akunmu
            </Link>
          </div>

          <KartuPilihan
            jenis="radio"
            name={`${id}-tujuan`}
            value="baru"
            checked={tujuan === "baru"}
            onUbah={(v) => v && setTujuan("baru")}
            judul="Buat Keranjang Resep baru"
            deskripsi="Buat grup menu baru dan simpan produk ini di dalamnya."
          />

          {tujuan === "baru" && (
            <div className="flex flex-col gap-4 rounded-xl border border-line bg-white px-4 py-4">
              <div>
                <label htmlFor={idNama} className="text-sm font-semibold text-ink">
                  Nama grup <span className="font-normal text-muted">(wajib)</span>
                </label>
                <input
                  ref={refNama}
                  id={idNama}
                  type="text"
                  value={nama}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setNama(e.target.value);
                    if (galat) setGalat(null);
                  }}
                  maxLength={MAKS_NAMA}
                  required
                  autoComplete="off"
                  placeholder="Contoh: Nasi Goreng"
                  aria-invalid={galat ? true : undefined}
                  aria-describedby={galat ? idGalat : undefined}
                  className={`mt-1.5 h-12 w-full rounded-[10px] border bg-white px-4 text-base text-ink outline-none placeholder:text-placeholder focus-visible:border-brand-600 focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-brand-600/25 ${
                    galat ? "border-danger" : "border-field-border"
                  }`}
                />
                {galat && (
                  <p id={idGalat} className="mt-1.5 text-[13px] font-medium text-danger">
                    {galat}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={idCatatan} className="text-sm font-semibold text-ink">
                  Catatan <span className="font-normal text-muted">(opsional)</span>
                </label>
                <textarea
                  id={idCatatan}
                  value={catatan}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCatatan(e.target.value)}
                  maxLength={MAKS_CATATAN}
                  rows={2}
                  placeholder="Contoh: belanja tiap Senin untuk 50 porsi"
                  className="mt-1.5 w-full resize-y rounded-[10px] border border-field-border bg-white px-4 py-3 text-base text-ink outline-none placeholder:text-placeholder focus-visible:border-brand-600 focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-brand-600/25"
                />
              </div>
            </div>
          )}
        </div>
      </fieldset>

      <p className="mt-4 flex items-start gap-2 text-[13px] leading-snug text-muted">
        <IkonInfo size={16} className="mt-px shrink-0" />
        Menambah ke keranjang belum mengunci stok. Stok baru dipesan untukmu saat checkout.
      </p>

      <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <button type="button" onClick={onTutup} className={kelasTombolSitus("garis")}>
          Batal
        </button>
        <button type="submit" className={kelasTombolSitus("utama")}>
          {tujuan === "baru" ? "Buat dan tambahkan" : "Tambahkan"}
        </button>
      </div>
    </form>
  );
}
