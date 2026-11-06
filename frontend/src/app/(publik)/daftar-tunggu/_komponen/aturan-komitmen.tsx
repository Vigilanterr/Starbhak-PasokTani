import Link from "next/link";
import { IkonInfo, IkonPanahBawah } from "@/app/_komponen/ikon";
import type { BarisPenalti } from "./data";

const ATURAN = [
  "Pilih rentang jumlah (minimum sampai maksimum). Dana untuk jumlah minimum ditahan di escrow saat kamu berkomitmen.",
  "Sisa di atas jumlah minimum dibayar paling lambat 48 jam setelah panen tersedia, mengikuti harga saat panen.",
  "Bila sisa tidak dibayar dalam 48 jam, pesanan jumlah minimum tetap diproses. Kelebihannya dialihkan ke pemegang Komitmen berikutnya, lalu ke pembeli umum.",
  "Bila petani memasang kuota, Komitmen otomatis ditutup saat kuota penuh.",
  "Saat panen, pemegang Komitmen mendapat stok lebih dulu. Bila hasil panen kurang, yang lebih dulu melunasi sisa pembayaran didahulukan.",
  "Pemegang Komitmen yang tidak kebagian stok mendapat pengembalian penuh dana minimum. Sisa stok dibuka untuk umum: siapa cepat, dia dapat.",
  "Dana baru diteruskan ke petani setelah pesanan dikirim atau diterima.",
];

const PENALTI: { kunci: BarisPenalti; kondisi: string; penalti: string }[] = [
  { kunci: "belum-ada", kondisi: "Perkiraan panen belum tersedia", penalti: "Tanpa penalti" },
  { kunci: "ada-perkiraan", kondisi: "Sudah ada perkiraan panen", penalti: "20% dana minimum" },
  { kunci: "setelah-panen", kondisi: "Setelah panen tersedia", penalti: "20% dana minimum" },
  {
    kunci: "tertunda",
    kondisi: "Panen Tertunda",
    penalti: "Tanpa penalti dalam 48 jam sejak pemberitahuan penundaan (berlaku setiap penundaan)",
  },
  { kunci: "gagal", kondisi: "Gagal Panen", penalti: "Bukan pembatalan: dana kembali penuh otomatis" },
];

/** Aturan Komitmen yang bisa dibuka-tutup (native `<details>`, tanpa JS). Baris penalti yang berlaku disorot. */
export function AturanKomitmen({ berlaku }: { berlaku: BarisPenalti }) {
  return (
    <details className="group rounded-xl border border-line">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 text-[15px] font-semibold text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <IkonInfo size={18} className="text-brand-600" />
          Aturan Komitmen
        </span>
        <IkonPanahBawah size={18} className="shrink-0 text-brand-900 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-line px-4 pt-3.5 pb-4 text-sm leading-relaxed text-ink">
        <ul className="list-disc space-y-1.5 pl-4.5 marker:text-brand-600">
          {ATURAN.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>

        <h3 className="mt-4 text-sm font-bold text-brand-900">Penalti pembatalan oleh pemegang Komitmen</h3>
        <table className="mt-2 w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-muted">
              <th scope="col" className="py-1.5 pr-3 font-semibold">
                Kondisi
              </th>
              <th scope="col" className="py-1.5 font-semibold">
                Penalti
              </th>
            </tr>
          </thead>
          <tbody>
            {PENALTI.map((p) => {
              const aktif = p.kunci === berlaku;
              return (
                <tr key={p.kunci} aria-current={aktif ? "true" : undefined} className={`border-b border-line last:border-b-0 ${aktif ? "bg-mint/60" : ""}`}>
                  <th scope="row" className={`py-2 pr-3 align-top font-medium ${aktif ? "pl-2" : ""}`}>
                    {p.kondisi}
                    {aktif && <span className="mt-0.5 block text-[11px] font-bold tracking-wide text-brand-600 uppercase">Berlaku sekarang</span>}
                  </th>
                  <td className={`py-2 align-top ${aktif ? "pr-2" : ""}`}>{p.penalti}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Link href="/bantuan" className="mt-3 inline-flex min-h-11 items-center font-semibold text-brand-600 no-underline hover:text-brand-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45">
          Selengkapnya di Pusat Bantuan
        </Link>
      </div>
    </details>
  );
}
