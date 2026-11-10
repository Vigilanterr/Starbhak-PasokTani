import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { IkonCentang, IkonKembalikan, IkonPanahKanan, IkonPerisai, IkonTruk } from "@/app/_komponen/ikon";

type Ikon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const OPSI_KIRIM = [
  "Kurir pihak ketiga, reguler atau instan",
  "Antar sendiri oleh petani",
  "Ambil sendiri di lokasi petani",
];

function Butir({ ikon: Ikon, judul, children }: { ikon: Ikon; judul: string; children: ReactNode }) {
  return (
    <li className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-brand-900">
        <Ikon size={20} />
      </span>
      <div className="min-w-0 text-sm leading-relaxed text-muted">
        <h3 className="text-[15px] font-semibold text-ink">{judul}</h3>
        {children}
      </div>
    </li>
  );
}

/** Pengiriman, pembayaran escrow, dan komplain (S9, S10). */
export function InfoPengiriman({ asal }: { asal: string }) {
  return (
    <section aria-labelledby="judul-pengiriman" className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <h2 id="judul-pengiriman" className="text-xl font-bold tracking-tight text-brand-900">
        Pengiriman dan jaminan
      </h2>
      <ul className="mt-4 divide-y divide-line">
        <Butir ikon={IkonTruk} judul="Pilihan pengiriman">
          <ul className="mt-1.5 flex flex-col gap-1">
            {OPSI_KIRIM.map((o) => (
              <li key={o} className="flex items-start gap-2 text-ink">
                <IkonCentang size={16} className="mt-0.5 shrink-0 text-brand-600" />
                {o}
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Dikirim dari {asal}. Ongkir dihitung dari jarak dan berat pesanan; pilihan yang tersedia tampil saat
            checkout.
          </p>
        </Butir>
        <Butir ikon={IkonPerisai} judul="Pembayaran aman">
          <p className="mt-1">
            Bayar dengan QRIS atau Virtual Account. Dana ditahan sampai pesanan kamu terima, baru diteruskan ke petani.
          </p>
        </Butir>
        <Butir ikon={IkonKembalikan} judul="Komplain maksimal 3 hari">
          <p className="mt-1">
            Produk rusak, busuk, atau tidak sesuai? Ajukan komplain paling lambat 3 hari setelah pesanan tiba, dengan
            bukti foto.
          </p>
          <Link
            href="/bantuan/kebijakan-pengembalian"
            className="mt-1 inline-flex min-h-11 items-center gap-1 font-semibold text-brand-600 no-underline hover:text-brand-900 hover:underline"
          >
            Baca kebijakan pengembalian
            <IkonPanahKanan size={16} />
          </Link>
        </Butir>
      </ul>
    </section>
  );
}
