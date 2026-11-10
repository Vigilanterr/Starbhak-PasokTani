"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IkonDaun } from "./ikon";

// TODO: ganti dengan nomor WhatsApp bantuan Pasok Tani.
const WHATSAPP_URL = "#";

type Salinan = { judul: string; isi: string; bukti: "komunitas" | "bantuan" };

const MASUK: Salinan = {
  judul: "Selamat datang kembali di ladang digitalmu.",
  isi: "Pantau pasokan, harga, dan jadwal pengiriman dalam satu tempat.",
  bukti: "komunitas",
};
const DAFTAR: Salinan = {
  judul: "Mulai salurkan hasil panen langsung ke pasar.",
  isi: "Jual hasil panen langsung ke UMKM dengan harga yang adil dan transparan.",
  bukti: "komunitas",
};
const LUPA: Salinan = {
  judul: "Tenang, akunmu tetap aman.",
  isi: "Kami bantu kamu kembali masuk hanya dalam beberapa langkah.",
  bukti: "bantuan",
};
const ATUR_ULANG: Salinan = {
  judul: "Satu langkah lagi untuk kembali masuk.",
  isi: "Buat kata sandi baru yang kuat dan mudah kamu ingat.",
  bukti: "bantuan",
};

function pilihSalinan(path: string): Salinan {
  if (path.startsWith("/daftar")) return DAFTAR;
  if (path.startsWith("/lupa-sandi")) return LUPA;
  if (path.startsWith("/atur-ulang-sandi")) return ATUR_ULANG;
  return MASUK;
}

const AVATAR = [
  { inisial: "SR", warna: "#d5f6d5" },
  { inisial: "BW", warna: "#e6d9b3" },
  { inisial: "AN", warna: "#a7d8bf" },
];

export function PanelMerek() {
  const { judul, isi, bukti } = pilihSalinan(usePathname());

  return (
    <aside className="sticky top-0 hidden h-screen flex-col justify-between overflow-hidden bg-brand-900 px-15 py-12 text-cream min-[901px]:flex">
      <span aria-hidden className="pointer-events-none absolute -top-35 -left-20 size-60 rounded-full bg-brand-600 opacity-[0.08]" />
      <span aria-hidden className="pointer-events-none absolute -right-40 -bottom-12 size-80 rounded-full bg-brand-600 opacity-[0.12]" />

      <Link href="/" className="relative z-10 flex items-center gap-3 no-underline">
        <span className="grid size-12 place-items-center rounded-full bg-mint text-brand-900">
          <IkonDaun size={22} />
        </span>
        <span className="text-lg font-semibold text-cream">Pasok Tani</span>
      </Link>

      <div className="relative z-10 max-w-105">
        <h1 className="text-[40px] leading-[1.2] font-bold tracking-tight">{judul}</h1>
        <p className="mt-5 max-w-100 text-[17px] leading-relaxed text-cream/85">{isi}</p>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex">
          {AVATAR.map((a, i) => (
            <span
              key={a.inisial}
              style={{ background: a.warna }}
              className={`grid size-9 place-items-center rounded-full text-xs font-bold text-brand-900 ring-2 ring-brand-900 ${i > 0 ? "-ml-1.5" : ""}`}
            >
              {a.inisial}
            </span>
          ))}
        </div>
        {bukti === "komunitas" ? (
          <p className="max-w-75 text-sm leading-normal font-medium">
            1.200+ petani dan UMKM sudah bertransaksi di Pasok Tani
          </p>
        ) : (
          <p className="max-w-75 text-sm leading-normal font-medium">
            Butuh bantuan? Tim kami siap membantu setiap hari kerja.
            <br />
            <a href={WHATSAPP_URL} className="font-bold text-mint underline underline-offset-3">
              Chat via WhatsApp →
            </a>
          </p>
        )}
      </div>
    </aside>
  );
}
