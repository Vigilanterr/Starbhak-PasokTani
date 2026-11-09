import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import type { Profil } from "@/lib/auth-api";
import { ambilPembeli } from "@/lib/api/pembeli-server";
import { FooterSitus } from "../_komponen/footer-situs";
import { HeaderSesi } from "../_komponen/header-sesi";
import { HeaderSitus } from "../_komponen/header-situs";

/** Grup pembeli: Konsumen dan UMKM. Membaca sesi itu runtime, jadi berada di dalam Suspense. */
export default function PembeliLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <GerbangPembeli>{children}</GerbangPembeli>
    </Suspense>
  );
}

/**
 * Tamu sudah diarahkan ke masuk oleh src/proxy.ts. Di sini diperiksa profilnya: tanpa profil ke formulir
 * lengkapi, petani dan admin ke beranda.
 */
async function GerbangPembeli({ children }: { children: ReactNode }) {
  const r = await ambilPembeli<Profil>("/me");
  if (!r.ok) {
    if (r.kode === "onboarding_required") redirect("/daftar/lengkapi");
    if (r.status === 401) redirect("/masuk");
    throw new Error(`Gagal memuat profil: ${r.kode}`);
  }
  if (r.data.peran === "petani" || r.data.peran === "admin") redirect("/");

  return (
    <>
      <Suspense fallback={<HeaderSitus />}>
        <HeaderSesi />
      </Suspense>
      <main className="flex-1">{children}</main>
      <FooterSitus />
    </>
  );
}
