import Link from "next/link";
import type { ReactNode } from "react";
import { IkonSurat } from "@/app/(auth)/_komponen/ikon";
import { IkonJam, IkonLokasi } from "@/app/_komponen/ikon";
import { kelasTombolSitus } from "@/app/_komponen/tombol";
import { EMAIL_BANTUAN } from "../bantuan/_komponen/halaman-legal";
import { kelasTombolGelap, KONTAINER } from "./kelas";

const SALINAN = {
  belanja: {
    kontak: "Ada pertanyaan soal pesanan, pendaftaran petani, atau kerja sama? Kirim pesan, tim kami siap membantu.",
    judul: "Siap belanja langsung dari petani?",
    isi: "Daftar gratis sebagai pembeli rumah tangga, UMKM, atau petani. Data lain seperti nomor HP dan alamat diisi nanti saat dibutuhkan.",
    sekunder: "Lihat produk dulu",
    jarakAtas: "",
  },
  landing: {
    kontak: "Ada pertanyaan soal pendaftaran petani, kebutuhan pasokan usaha, atau kerja sama? Kirim pesan, tim kami siap membantu.",
    judul: "Siap terhubung langsung dengan petani?",
    isi: "Daftar gratis sebagai petani untuk menawarkan hasil panen, atau sebagai UMKM untuk mencari pasokan bahan baku.",
    sekunder: "Lihat pasokan dulu",
    jarakAtas: "pt-12 md:pt-16",
  },
} as const;

/** `#kontak` (tautan header dan footer) + ajakan mendaftar penutup halaman. */
export function BagianKontak({ varian = "belanja" }: { varian?: keyof typeof SALINAN }) {
  const t = SALINAN[varian];
  return (
    <div className={`${KONTAINER} ${t.jarakAtas} pb-16 md:pb-24`}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-5">
        <section
          id="kontak"
          aria-labelledby="judul-kontak"
          className="scroll-mt-4 rounded-3xl border border-line bg-white p-6 md:p-8"
        >
          <p className="text-xs font-bold tracking-wider text-brand-900 uppercase">Kontak</p>
          <h2 id="judul-kontak" className="mt-3 text-[26px] leading-tight font-bold tracking-tight text-brand-900">
            Hubungi kami
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {t.kontak}
          </p>
          <dl className="mt-6 flex flex-col gap-4">
            <BarisKontak ikon={<IkonSurat size={18} />} label="Email">
              <a
                href={`mailto:${EMAIL_BANTUAN}`}
                className="font-semibold break-all text-brand-900 underline underline-offset-3 hover:text-brand-600"
              >
                {EMAIL_BANTUAN}
              </a>
            </BarisKontak>
            <BarisKontak ikon={<IkonJam size={18} />} label="Waktu balas">
              1×24 jam pada hari kerja
            </BarisKontak>
            <BarisKontak ikon={<IkonLokasi size={18} />} label="Area layanan">
              Jawa Barat
            </BarisKontak>
          </dl>
          <Link href="/bantuan" className={`${kelasTombolSitus("garis")} mt-7`}>
            Kunjungi Pusat Bantuan
          </Link>
        </section>

        <section
          aria-labelledby="judul-ajakan"
          className="relative isolate flex flex-col justify-center overflow-hidden rounded-3xl bg-brand-900 px-6 py-9 text-cream md:px-10 md:py-12"
        >
          <span aria-hidden className="pointer-events-none absolute -top-24 -right-20 -z-10 size-72 rounded-full bg-accent/25 blur-2xl" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(currentColor_1px,transparent_1.5px)] bg-size-[18px_18px] text-mint opacity-[0.07]"
          />
          <h2 id="judul-ajakan" className="text-[28px] leading-tight font-bold tracking-tight text-white md:text-4xl">
            {t.judul}
          </h2>
          <p className="mt-3 max-w-130 text-base leading-relaxed text-cream/85">
            {t.isi}
          </p>
          <div className="mt-7 grid gap-3 sm:flex">
            <Link href="/daftar" className={kelasTombolGelap("terang")}>
              Daftar gratis
            </Link>
            <Link href="/produk" className={kelasTombolGelap("garis")}>
              {t.sekunder}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function BarisKontak({ ikon, label, children }: { ikon: ReactNode; label: string; children: ReactNode }) {
  return (
    // Ikon diletakkan di dalam <dt> (diposisikan absolut) agar struktur <dl><div><dt/><dd/></div></dl> tetap valid.
    <div className="relative min-h-10 pt-0.5 pl-13">
      <dt className="text-[13px] text-muted">
        <span aria-hidden className="absolute top-0 left-0 grid size-10 place-items-center rounded-full bg-tint text-brand-900">
          {ikon}
        </span>
        {label}
      </dt>
      <dd className="text-[15px] text-ink">{children}</dd>
    </div>
  );
}
