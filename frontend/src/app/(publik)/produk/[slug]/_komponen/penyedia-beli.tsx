"use client";

import { useState, type ReactNode } from "react";
import { angka, LABEL_SATUAN } from "@/lib/format";
import { DialogKeranjang } from "./dialog-keranjang";
import { DialogLangganan } from "./dialog-langganan";
import { batasJumlah, hitungHarga, hrefMasuk, type DataBeli } from "./harga-produk";
import { KonteksBeli, type NilaiBeli } from "./konteks-beli";

type Dialog = "keranjang" | "langganan" | null;

/**
 * Menyimpan jumlah yang dipilih dan dialog yang terbuka, dipakai bersama oleh kotak beli, tabel grosir,
 * dan bilah aksi ponsel. `children` tetap dirender di server; hanya bagian interaktif yang memakai konteks.
 */
export function PenyediaBeli({ data, children }: { data: DataBeli; children: ReactNode }) {
  const { min, maks } = batasJumlah(data);
  const [teks, setTeks] = useState(String(min));
  const [dialog, setDialog] = useState<Dialog>(null);

  const jepit = (n: number) => Math.min(Math.max(Math.floor(n), min), maks);
  const ketik = teks.trim() === "" ? Number.NaN : Number(teks);
  const jumlah = Number.isFinite(ketik) ? jepit(ketik) : min;
  const harga = hitungHarga(data, jumlah);
  const s = LABEL_SATUAN[data.satuan];
  const tidakTersedia = data.habis || data.stok < min;

  let peringatan: string | null = null;
  if (!tidakTersedia && Number.isFinite(ketik)) {
    if (ketik > maks) peringatan = `Maksimal ${angka(maks)} ${s}, sesuai stok yang tersedia.`;
    else if (ketik < min) peringatan = `Minimal pembelian ${angka(min)} ${s}.`;
  }

  const nilai: NilaiBeli = {
    data,
    min,
    maks,
    teks,
    ubahTeks: setTeks,
    jumlah,
    ubahJumlah: (n) => setTeks(String(jepit(n))),
    rapikan: () => setTeks(String(jumlah)),
    peringatan,
    harga,
    subtotal: harga.satuan * jumlah,
    hemat: Math.max(0, (data.harga - harga.satuan) * jumlah),
    tidakTersedia,
    hrefMasuk: hrefMasuk(data.slug),
    bukaKeranjang: () => setDialog("keranjang"),
    bukaLangganan: () => setDialog("langganan"),
  };
  const tutup = () => setDialog(null);

  return (
    <KonteksBeli value={nilai}>
      {children}
      <DialogKeranjang terbuka={dialog === "keranjang"} onTutup={tutup} />
      <DialogLangganan terbuka={dialog === "langganan"} onTutup={tutup} />
    </KonteksBeli>
  );
}
