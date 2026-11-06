export type AturanKataSandi = {
  /** Minimal 8 karakter. */
  panjang: boolean;
  /** Mengandung huruf dan angka. */
  campuran: boolean;
};

export function periksaKataSandi(nilai: string): AturanKataSandi {
  return {
    panjang: nilai.length >= 8,
    campuran: /[a-zA-Z]/.test(nilai) && /[0-9]/.test(nilai),
  };
}

export function kataSandiValid(nilai: string): boolean {
  const aturan = periksaKataSandi(nilai);
  return aturan.panjang && aturan.campuran;
}
