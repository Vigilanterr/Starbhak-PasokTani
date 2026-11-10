/**
 * Pencarian fuzzy sederhana untuk data tiruan (S3): toleran salah ketik, varian ejaan,
 * dan nama daerah. Contoh: "cabe", "cabai", "chabai" semuanya menemukan Cabai.
 *
 * TODO: pindahkan ke backend (mis. trigram/pg_trgm + kamus sinonim).
 */

/** Kamus nama daerah / varian -> kata baku. Kunci dan nilai sudah dinormalisasi. */
const SINONIM: Record<string, string> = {
  cabe: "cabai",
  lombok: "cabai",
  cengek: "rawit",
  beureum: "merah",
  bodas: "putih",
  hejo: "hijau",
  koneng: "kuning",
  sampeu: "singkong",
  kaspe: "singkong",
  hui: "ubi",
  cau: "pisang",
  bonteng: "timun",
  mentimun: "timun",
  bortol: "wortel",
  kol: "kubis",
  apokat: "alpukat",
  terung: "terong",
  sosin: "sawi",
  waluh: "labu",
  sledri: "seledri",
  tomato: "tomat",
};

export function normal(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jarakEdit(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 99;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const biaya = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min((prev[j] ?? 0) + 1, (cur[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + biaya);
    }
    prev = cur;
  }
  return prev[b.length] ?? 99;
}

function toleransi(panjang: number): number {
  if (panjang <= 3) return 0;
  if (panjang <= 5) return 1;
  return 2;
}

/** Skor satu token terhadap satu kata (0 = tidak cocok). */
function skorKata(token: string, kata: string): number {
  if (kata === token) return 10;
  if (token.length >= 3 && kata.startsWith(token)) return 7;
  if (kata.length >= 4 && token.startsWith(kata)) return 5;
  const d = jarakEdit(token, kata);
  if (d <= toleransi(token.length)) return 4 - d;
  if (token.length >= 4 && kata.includes(token)) return 2;
  return 0;
}

function pecah(teks: string[]): string[] {
  return teks.flatMap((t) => normal(t).split(" ")).filter(Boolean);
}

/**
 * Cocokkan kueri (sudah dinormalisasi) dengan teks utama (nama + nama lain) dan sekunder
 * (kategori, nama toko). Semua token kueri harus cocok (AND).
 * `dimaknai` berisi kueri yang ditafsirkan bila ada token yang dikoreksi (mis. "cabe" -> "cabai").
 */
export function cocokkan(
  kueri: string,
  utama: string[],
  sekunder: string[] = [],
): { skor: number; dimaknai: string | null } | null {
  const tokenAsli = kueri.split(" ").filter((t) => t.length >= 2);
  if (tokenAsli.length === 0) return null;

  const kataNama = pecah(utama.slice(0, 1));
  const kataUtama = pecah(utama);
  const kataSekunder = pecah(sekunder);

  let total = 0;
  let dikoreksi = false;
  const tafsiran: string[] = [];

  for (const asli of tokenAsli) {
    const token = SINONIM[asli] ?? asli;
    if (token !== asli) dikoreksi = true;

    let terbaik = 0;
    for (const k of kataUtama) terbaik = Math.max(terbaik, skorKata(token, k));
    for (const k of kataSekunder) terbaik = Math.max(terbaik, skorKata(token, k) / 2);
    if (asli !== token) for (const k of kataUtama) terbaik = Math.max(terbaik, skorKata(asli, k));
    if (terbaik === 0) return null;
    total += terbaik;

    // Koreksi salah ketik terhadap kata pada nama produk (mis. "chabai" -> "cabai").
    if (!kataNama.includes(token) && !kataNama.some((k) => k.startsWith(token))) {
      const dekat = kataNama.find((k) => jarakEdit(token, k) <= toleransi(token.length));
      if (dekat) {
        dikoreksi = true;
        tafsiran.push(dekat);
        continue;
      }
    }
    tafsiran.push(token);
  }

  return { skor: total, dimaknai: dikoreksi ? [...new Set(tafsiran)].join(" ") : null };
}
