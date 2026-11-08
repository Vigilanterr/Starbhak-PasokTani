import Image from "next/image";
import Link from "next/link";
import { DAFTAR_TUNGGU, LANGKAH_TUNGGU } from "./data-jalur";
import { Ikon } from "./ikon";
import { Tahap } from "./tahap";

export function BagianDaftarTunggu() {
  return (
    <Tahap
      id="judul-daftar-tunggu"
      nomor={3}
      eyebrow="Sebelum panen"
      judul="Pesan sebelum panen lewat Daftar Tunggu"
      isi="Ikuti lahan yang sedang ditanam. Komit untuk mengamankan stok: dana minimum ditahan, sisanya dibayar setelah panen tersedia."
      latar="bg-[#ebf2eb]"
      latarHex="#ebf2eb"
      tautan={{ label: "Lihat Daftar Tunggu", href: "/daftar-tunggu" }}
    >
      <ul className="m-0 mt-7 grid list-none gap-6 p-0 md:grid-cols-3">
        {DAFTAR_TUNGGU.map((w) => {
          const persen = w.kuota ? Math.round((w.terkomit / w.kuota) * 100) : 0;
          const komitTeks = w.kuota ? `${w.terkomit} dari ${w.kuota} kg terkomit` : `${w.terkomit} kg terkomit, tanpa kuota`;
          return (
            <li key={w.komoditas} className="min-w-0">
              <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(16,41,30,0.06)]">
                <div className="relative">
                  <div className="relative aspect-[16/10]">
                    <Image src={w.foto} alt={w.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                  </div>
                  <p className="absolute bottom-3 left-3 m-0 rounded-full bg-[rgba(16,41,30,0.78)] px-3 py-1.5 text-xs leading-snug text-white">
                    <b className="font-extrabold">Kabar {w.kabarTanggal}:</b> {w.kabar}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-3.5 p-5">
                  <ol aria-label={`Status: ${w.status}`} className="m-0 grid list-none grid-cols-3 gap-1.5 p-0">
                    {LANGKAH_TUNGGU.map((label, i) => {
                      const aktif = i === w.aktif;
                      return (
                        <li key={label} className={`flex flex-col gap-1.5 text-xs ${aktif ? "font-extrabold text-[#10291e]" : "font-semibold text-[#4d5f54]"}`}>
                          <span aria-hidden="true" className="h-1.5 rounded-full" style={{ background: i <= w.aktif ? "#157a4c" : "#e3e8df" }} />
                          {label}
                        </li>
                      );
                    })}
                  </ol>
                  <div>
                    <h3 className="m-0 text-[22px] leading-tight font-extrabold text-[#10291e]">{w.komoditas}</h3>
                    <p className="m-0 mt-1 text-sm text-[#4d5f54]">
                      {w.toko} · {w.kab}
                    </p>
                  </div>
                  <p className="m-0 flex items-center gap-2 text-[15px] font-bold text-[#173b2b]">
                    <Ikon nama="kalender" ukuran={18} className="shrink-0 text-[#157a4c]" />
                    {w.jadwal}
                  </p>
                  <div>
                    <p className="m-0 flex flex-wrap justify-between gap-2 text-[13px] text-[#4d5f54]">
                      <span>{komitTeks}</span>
                      <span>{w.pengikut} pengikut</span>
                    </p>
                    {w.kuota > 0 && (
                      <div role="img" aria-label={`${persen} persen kuota terisi`} className="mt-2 h-2 overflow-hidden rounded-full bg-[#e3e8df]">
                        <div className="h-full rounded-full bg-[#157a4c]" style={{ width: `${persen}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="mt-auto flex gap-2.5">
                    <Link href="/daftar-tunggu" className="flex min-h-11 flex-1 items-center justify-center rounded-full border-[1.5px] border-brand-900 text-[15px] font-bold text-brand-900 no-underline">
                      Ikuti
                    </Link>
                    <Link href="/daftar-tunggu" className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand-900 text-[15px] font-bold text-white no-underline">
                      {w.aksi}
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Tahap>
  );
}
