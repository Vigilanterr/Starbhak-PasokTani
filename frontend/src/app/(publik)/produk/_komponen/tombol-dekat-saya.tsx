"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { IkonDekatSaya } from "@/app/_komponen/ikon";

// Salinan `TITIK_DEFAULT` (pusat Kota Bandung) dari `@/lib/api/katalog`. Sengaja ditulis ulang di sini:
// katalog.ts tidak boleh diimpor Client Component karena ikut membawa seluruh data JSON ke bundle.
const TITIK_BAWAAN = { lat: -6.9175, lng: 107.6191 };
const RADIUS_BAWAAN = 25;

// Kotak batas kasar Jawa Barat (wilayah MVP). Di luar ini, pakai titik bawaan.
const JAWA_BARAT = { latMin: -7.85, latMaks: -5.85, lngMin: 106.35, lngMaks: 108.9 };

const PESAN_GALAT: Record<number, string> = {
  1: "Izin lokasi ditolak.",
  2: "Lokasimu tidak terdeteksi.",
  3: "Pencarian lokasi terlalu lama.",
};

/** 4 desimal (~11 m): cukup untuk jarak, tidak terlalu presisi untuk dibagikan lewat URL. */
const bulat = (n: number) => Math.round(n * 10_000) / 10_000;

type Props = {
  path: string;
  /** Query string filter saat ini (tanpa `?` dan `halaman`), dikirim dari Server Component. */
  query: string;
  /** Pencarian lokasi sedang aktif (ada titik atau radius di URL). */
  aktif?: boolean;
};

/**
 * "Dekat saya": minta lokasi peramban lalu buka path yang sama dengan `lat`, `lng`, `radius`
 * (bawaan 25 km) dan `urut=terdekat`, filter lain dipertahankan. Bila lokasi tidak tersedia,
 * pakai pusat Kota Bandung dan beri tahu pengguna.
 */
export function TombolDekatSaya({ path, query, aktif = false }: Props) {
  const router = useRouter();
  const idPesan = useId();
  const [mencari, setMencari] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [memuat, mulaiTransisi] = useTransition();
  const sibuk = mencari || memuat;

  function buka(titik: { lat: number; lng: number }) {
    const p = new URLSearchParams(query);
    p.set("lat", String(titik.lat));
    p.set("lng", String(titik.lng));
    if (!p.has("radius")) p.set("radius", String(RADIUS_BAWAAN));
    p.set("urut", "terdekat");
    p.delete("halaman");
    mulaiTransisi(() => router.push(`${path}?${p.toString()}`, { scroll: false }));
  }

  function pakaiTitikBawaan(alasan: string) {
    setMencari(false);
    setPesan(`${alasan} Jarak dihitung dari pusat Kota Bandung.`);
    buka(TITIK_BAWAAN);
  }

  function cariLokasi() {
    if (sibuk) return;
    setPesan(null);
    if (!("geolocation" in navigator)) {
      pakaiTitikBawaan("Peramban ini tidak mendukung lokasi.");
      return;
    }
    setMencari(true);
    navigator.geolocation.getCurrentPosition(
      (posisi) => {
        const lat = bulat(posisi.coords.latitude);
        const lng = bulat(posisi.coords.longitude);
        const diJawaBarat =
          lat >= JAWA_BARAT.latMin && lat <= JAWA_BARAT.latMaks && lng >= JAWA_BARAT.lngMin && lng <= JAWA_BARAT.lngMaks;
        if (!diJawaBarat) {
          pakaiTitikBawaan("Lokasimu berada di luar Jawa Barat.");
          return;
        }
        setMencari(false);
        buka({ lat, lng });
      },
      (galat) => pakaiTitikBawaan(PESAN_GALAT[galat.code] ?? "Lokasimu tidak bisa diakses."),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={cariLokasi}
        aria-disabled={sibuk || undefined}
        aria-describedby={pesan ? idPesan : undefined}
        className={`inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border px-3.5 text-[15px] font-semibold whitespace-nowrap focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 aria-disabled:cursor-progress lg:text-sm ${
          aktif ? "border-brand-600 bg-mint text-brand-900" : "border-line bg-white text-ink hover:border-brand-600"
        }`}
      >
        <IkonDekatSaya size={18} className={`shrink-0 text-brand-600 ${sibuk ? "animate-pulse" : ""}`} />
        {mencari ? "Mencari lokasi…" : "Dekat saya"}
      </button>
      <p
        id={idPesan}
        role="status"
        className={pesan ? "max-w-64 text-right text-xs leading-snug text-muted" : "sr-only"}
      >
        {pesan}
      </p>
    </div>
  );
}
