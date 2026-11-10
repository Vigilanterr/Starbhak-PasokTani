"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { IkonLonceng } from "@/app/_komponen/ikon";
import { angka } from "@/lib/format";
import { KartuPilihan } from "./kartu-pilihan";
import { useBeli } from "./konteks-beli";
import { LembarDialog } from "./lembar-dialog";

type Pemicu = "stokBaru" | "hargaTurun" | "tersediaKembali";
type Frekuensi = "instan" | "harian";

const PEMICU: { id: Pemicu; judul: string; deskripsi: string }[] = [
  { id: "stokBaru", judul: "Ada stok baru", deskripsi: "Petani menambah batch panen baru." },
  {
    id: "hargaTurun",
    judul: "Harga turun atau masuk Surplus",
    deskripsi: "Harga lebih murah dari sebelumnya, termasuk diskon Surplus.",
  },
  {
    id: "tersediaKembali",
    judul: "Tersedia kembali setelah habis",
    deskripsi: "Stok yang sempat habis sudah bisa dibeli lagi.",
  },
];

const FREKUENSI: { id: Frekuensi; judul: string; deskripsi: string }[] = [
  { id: "instan", judul: "Instan", deskripsi: "Langsung dikabari saat ada perubahan." },
  { id: "harian", judul: "Ringkasan harian", deskripsi: "Satu ringkasan per hari untuk semua kabar." },
];

/** Preferensi Langganan per produk (S2). */
export function DialogLangganan({ terbuka, onTutup }: { terbuka: boolean; onTutup: () => void }) {
  const { data } = useBeli();
  return (
    <LembarDialog
      terbuka={terbuka}
      onTutup={onTutup}
      judul={data.habis ? "Kabari saya saat stok kembali" : "Langganan produk ini"}
      deskripsi={`Dapat kabar tentang ${data.nama} tanpa perlu mengecek berulang kali.`}
    >
      <IsiDialogLangganan onTutup={onTutup} />
    </LembarDialog>
  );
}

function IsiDialogLangganan({ onTutup }: { onTutup: () => void }) {
  const { data, hrefMasuk } = useBeli();
  const router = useRouter();
  const id = useId();
  // Bawaan: semua kabar aktif (S2, S8).
  const [pemicu, setPemicu] = useState<Record<Pemicu, boolean>>({
    stokBaru: true,
    hargaTurun: true,
    tersediaKembali: true,
  });
  const [frekuensi, setFrekuensi] = useState<Frekuensi>("instan");
  const adaPemicu = PEMICU.some((p) => pemicu[p.id]);

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!adaPemicu) return;
    // TODO: sambungkan ke API langganan (pemicu + frekuensi) setelah sesi tersedia.
    router.push(hrefMasuk);
  }

  return (
    <form onSubmit={kirim}>
      <fieldset>
        <legend className="text-sm font-semibold text-ink">Kabari saya saat</legend>
        <div className="mt-2.5 flex flex-col gap-2.5">
          {PEMICU.map((p) => (
            <KartuPilihan
              key={p.id}
              jenis="checkbox"
              name={`${id}-pemicu`}
              value={p.id}
              checked={pemicu[p.id]}
              onUbah={(v) => setPemicu((lama) => ({ ...lama, [p.id]: v }))}
              judul={p.judul}
              deskripsi={p.deskripsi}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-ink">Seberapa sering</legend>
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {FREKUENSI.map((f) => (
            <KartuPilihan
              key={f.id}
              jenis="radio"
              name={`${id}-frekuensi`}
              value={f.id}
              checked={frekuensi === f.id}
              onUbah={(v) => v && setFrekuensi(f.id)}
              judul={f.judul}
              deskripsi={f.deskripsi}
            />
          ))}
        </div>
      </fieldset>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-tint px-4 py-3 text-[13px] leading-snug text-ink">
        <IkonLonceng size={16} className="mt-px shrink-0 text-brand-600" />
        <span>
          Notifikasi dikirim lewat web, ke pusat notifikasi akunmu. Ubah atau berhenti berlangganan kapan saja di
          halaman Langganan.
          {data.pelanggan > 0 && <> {angka(data.pelanggan)} orang sudah berlangganan produk ini.</>}
        </span>
      </p>

      <p aria-live="polite" className="text-[13px] font-medium text-danger">
        {!adaPemicu && <span className="mt-3 block">Pilih minimal satu kabar yang ingin kamu terima.</span>}
      </p>

      <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <button type="button" onClick={onTutup} className={kelasTombolSitus("garis")}>
          Batal
        </button>
        <button
          type="submit"
          disabled={!adaPemicu}
          className={`${kelasTombolSitus("utama")} gap-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <IkonLonceng size={18} />
          Langganan
        </button>
      </div>
    </form>
  );
}
