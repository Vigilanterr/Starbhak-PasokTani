import type { JadwalPanen, Satuan } from "./api/tipe";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const BULAN_PANJANG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** `Rp 28.000`. Diformat manual agar hasil server dan klien identik (tanpa Intl/locale). */
export function rupiah(nilai: number): string {
  return `Rp ${angka(Math.round(nilai))}`;
}

/** `12.400` (pemisah ribuan titik). */
export function angka(nilai: number): string {
  const [bulat, desimal] = String(nilai).split(".");
  const teks = (bulat ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return desimal ? `${teks},${desimal}` : teks;
}

/** `4,8` untuk rating. */
export function desimal1(nilai: number): string {
  return nilai.toFixed(1).replace(".", ",");
}

function urai(iso: string): { t: number; b: number; h: number } {
  const [t, b, h] = iso.split("-").map(Number);
  return { t: t ?? 1970, b: (b ?? 1) - 1, h: h ?? 1 };
}

/** `4 Nov 2026`. */
export function tanggal(iso: string): string {
  const { t, b, h } = urai(iso);
  return `${h} ${BULAN[b]} ${t}`;
}

/** `4 November 2026`. */
export function tanggalPanjang(iso: string): string {
  const { t, b, h } = urai(iso);
  return `${h} ${BULAN_PANJANG[b]} ${t}`;
}

/** `4 Nov`. */
export function tanggalPendek(iso: string): string {
  const { b, h } = urai(iso);
  return `${h} ${BULAN[b]}`;
}

/** `10-15 Des 2026`, `28 Nov - 3 Des 2026`. */
export function rentangTanggal(mulai: string, selesai: string): string {
  const a = urai(mulai);
  const z = urai(selesai);
  if (a.t === z.t && a.b === z.b) return `${a.h}–${z.h} ${BULAN[z.b]} ${z.t}`;
  if (a.t === z.t) return `${a.h} ${BULAN[a.b]} – ${z.h} ${BULAN[z.b]} ${z.t}`;
  return `${tanggal(mulai)} – ${tanggal(selesai)}`;
}

export function labelJadwalPanen(j: JadwalPanen): string {
  switch (j.jenis) {
    case "tanggal":
      return tanggal(j.tanggal);
    case "rentang":
      return rentangTanggal(j.mulai, j.selesai);
    case "belum-ada":
      return "Perkiraan belum tersedia";
  }
}

/** Selisih hari kalender `ke - dari` (bisa negatif). */
export function selisihHari(dari: string, ke: string): number {
  const a = urai(dari);
  const z = urai(ke);
  return Math.round((Date.UTC(z.t, z.b, z.h) - Date.UTC(a.t, a.b, a.h)) / 86_400_000);
}

/** "Dipanen hari ini", "Dipanen 2 hari lalu". */
export function labelUmurPanen(tanggalPanen: string, acuan: string): string {
  const n = selisihHari(tanggalPanen, acuan);
  if (n <= 0) return "Dipanen hari ini";
  if (n === 1) return "Dipanen kemarin";
  return `Dipanen ${n} hari lalu`;
}

/** "Kedaluwarsa hari ini", "Sisa 2 hari". */
export function labelSisaHari(sisa: number): string {
  if (sisa < 0) return "Sudah kedaluwarsa";
  if (sisa === 0) return "Kedaluwarsa hari ini";
  if (sisa === 1) return "Sisa 1 hari";
  return `Sisa ${sisa} hari`;
}

export const LABEL_SATUAN: Record<Satuan, string> = {
  kg: "kg",
  ikat: "ikat",
  buah: "buah",
  pak: "pak",
  liter: "liter",
};

/** `Rp 28.000/kg`. */
export function hargaPerSatuan(harga: number, satuan: Satuan): string {
  return `${rupiah(harga)}/${LABEL_SATUAN[satuan]}`;
}

/** `1,2 km`, `850 m`. */
export function jarak(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${desimal1(km)} km`;
}

/** "2 jam", "35 menit". */
export function durasiMenit(menit: number): string {
  if (menit < 60) return `${menit} menit`;
  const jam = Math.round(menit / 60);
  return `${jam} jam`;
}
