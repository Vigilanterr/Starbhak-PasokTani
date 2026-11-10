import type { Metadata } from "next";
import { Suspense } from "react";
import { ambilPembeli } from "@/lib/api/pembeli-server";
import type { Keranjang } from "@/lib/api/tipe";
import { KeranjangTampilan } from "./_komponen/keranjang-tampilan";

export const metadata: Metadata = { title: "Keranjang" };

/** Keranjang Sementara milik pembeli. Masuk dan profil diperiksa di layout grup (pembeli). */
export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 md:px-6" aria-busy="true" />}>
      <IsiKeranjang />
    </Suspense>
  );
}

async function IsiKeranjang() {
  const r = await ambilPembeli<Keranjang>("/keranjang");
  if (!r.ok) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">Keranjang belum bisa dimuat</h1>
        <p className="mt-2 text-[15px] text-muted">{r.pesan}</p>
      </section>
    );
  }
  return <KeranjangTampilan keranjang={r.data} />;
}
