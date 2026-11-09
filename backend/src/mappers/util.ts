import type { Koordinat } from '../contract/tipe';

/** Calendar date in Jakarta as YYYY-MM-DD. Timestamps are shown on the Jakarta day, not the server's. */
export function tanggalJakarta(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

/** Numeric text (qty, rating, percent) to a JS number. Null stays null. */
export function angka(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

/** Rupiah as a JS number. Safe because catalog prices stay far below 2^53. */
export function rupiah(value: string | number | bigint | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

/** Public display name: first name and the initial of the last, as the reviews show it ("Rina S."). */
export function namaSingkat(nama: string): string {
  const bagian = nama.trim().split(/\s+/);
  if (bagian.length <= 1) return bagian[0] ?? '';
  return `${bagian[0]} ${bagian[bagian.length - 1]!.charAt(0).toUpperCase()}.`;
}

/**
 * Images. Demo data points at the files in frontend/public with a `local:` prefix. Any other public id is a
 * Cloudinary asset, which has no URL until media upload is built (ApiPlan E2), so it shows the placeholder.
 */
export function srcFoto(publicId: string): string | null {
  return publicId.startsWith('local:') ? publicId.slice('local:'.length) : null;
}

export function koordinat(lat: number | null, lng: number | null): Koordinat {
  // A farmer without a pin shows at 0,0. Registration does not allow this yet; see ApiPlan Phase 2.
  return { lat: lat ?? 0, lng: lng ?? 0 };
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
/** Monday first, the order people read a week in. */
const URUTAN: number[] = [1, 2, 3, 4, 5, 6, 0];

/**
 * Weekly hours as the farmer page prints them: "Senin–Sabtu, 06.00–17.00". Runs of days with the same hours
 * collapse into one entry. Seven days with the same hours read "Setiap hari".
 */
export function jamOperasional(jam: { weekday: number; opens_at: string; closes_at: string }[]): string {
  if (jam.length === 0) return '';
  const byDay = new Map(jam.map((j) => [j.weekday, j]));
  const hari = URUTAN.filter((d) => byDay.has(d));
  const label = (j: { opens_at: string; closes_at: string }) =>
    `${j.opens_at.replace(':', '.')}–${j.closes_at.replace(':', '.')}`;

  if (hari.length === 7 && hari.every((d) => label(byDay.get(d)!) === label(byDay.get(hari[0]!)!))) {
    return `Setiap hari, ${label(byDay.get(hari[0]!)!)}`;
  }

  const runs: { awal: number; akhir: number; jam: string }[] = [];
  for (const d of hari) {
    const teks = label(byDay.get(d)!);
    const last = runs.at(-1);
    if (last && last.jam === teks && URUTAN.indexOf(last.akhir) + 1 === URUTAN.indexOf(d)) {
      last.akhir = d;
    } else {
      runs.push({ awal: d, akhir: d, jam: teks });
    }
  }
  return runs
    .map((r) => {
      const nama = r.awal === r.akhir ? HARI[r.awal]! : `${HARI[r.awal]}–${HARI[r.akhir]}`;
      return `${nama}, ${r.jam}`;
    })
    .join('; ');
}
