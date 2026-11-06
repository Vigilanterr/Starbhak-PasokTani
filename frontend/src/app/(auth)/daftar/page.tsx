import type { Metadata } from "next";
import Link from "next/link";
import { IkonPanahKanan } from "../_komponen/ikon";
import { Judul } from "../_komponen/judul";

export const metadata: Metadata = { title: "Daftar" };

const PERAN = [
  {
    href: "/daftar/pembeli",
    judul: "Saya Pembeli",
    isi: "Konsumen atau UMKM yang ingin beli langsung dari petani.",
  },
  {
    href: "/daftar/petani",
    judul: "Saya Petani",
    isi: "Jual hasil panen langsung ke UMKM dan pasar.",
  },
];

export default function Page() {
  return (
    <>
      <Judul judul="Buat akun">Pilih peranmu untuk memulai.</Judul>

      <ul className="flex flex-col gap-3">
        {PERAN.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="flex items-center justify-between gap-4 rounded-[10px] border border-field-border bg-white p-4 no-underline hover:border-brand-900 hover:bg-tint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45"
            >
              <span>
                <span className="block text-base font-bold text-brand-900">{p.judul}</span>
                <span className="mt-1 block text-sm leading-normal text-muted">{p.isi}</span>
              </span>
              <IkonPanahKanan className="flex-none text-brand-900" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-center text-[15px] text-muted">
        Sudah punya akun?
        <Link href="/masuk" className="ml-1 font-bold text-brand-900 no-underline hover:underline">
          Masuk
        </Link>
      </p>
    </>
  );
}
