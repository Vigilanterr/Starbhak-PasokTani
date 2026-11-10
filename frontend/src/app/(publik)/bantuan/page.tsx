import type { Metadata } from "next";
import { kelasTombolSitus } from "../../_komponen/tombol";
import { EMAIL_BANTUAN } from "./_komponen/halaman-legal";
import { PusatBantuan } from "./_komponen/pusat-bantuan";

export const metadata: Metadata = {
  title: "Pusat Bantuan",
  description: "Jawaban seputar akun, pasokan, dan transaksi di Pasok Tani.",
};

export default function Page() {
  return (
    <>
      <PusatBantuan />

      <section className="mx-auto max-w-260 px-4 pb-16 md:px-0 md:pb-24">
        <div className="flex flex-col gap-6 rounded-3xl bg-brand-900 px-6 py-10 text-cream md:flex-row md:items-center md:justify-between md:px-12">
          <div>
            <h2 className="text-[28px] font-bold tracking-tight text-white">Masih butuh bantuan?</h2>
            <p className="mt-1.5 text-base text-cream/80">Tim kami membalas dalam 1×24 jam pada hari kerja.</p>
          </div>
          <a href={`mailto:${EMAIL_BANTUAN}`} className={`${kelasTombolSitus("aksen")} self-start md:self-auto`}>
            Hubungi kami
          </a>
        </div>
      </section>
    </>
  );
}
