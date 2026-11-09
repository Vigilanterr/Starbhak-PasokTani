import type { Metadata } from "next";
import { Suspense } from "react";
import { ambilPembeli } from "@/lib/api/pembeli-server";
import type { Alamat } from "@/lib/api/tipe";
import { AlamatTampilan } from "./_komponen/alamat-tampilan";

export const metadata: Metadata = { title: "Alamat" };

/** Buku alamat pembeli. Checkout memerlukan satu alamat utama. */
export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 md:px-6" aria-busy="true" />}>
      <IsiAlamat />
    </Suspense>
  );
}

async function IsiAlamat() {
  const r = await ambilPembeli<Alamat[]>("/me/alamat");
  if (!r.ok) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">Alamat belum bisa dimuat</h1>
        <p className="mt-2 text-[15px] text-muted">{r.pesan}</p>
      </section>
    );
  }
  return <AlamatTampilan daftar={r.data} />;
}
