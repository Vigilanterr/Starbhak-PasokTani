import type { ReviewSummaryRow, PublicReviewRow } from '../repo/feedback/review-read.repo';
import { namaSingkat } from './util';

/** Review in the contract shape. Only the buyer's first name and last initial are shown. */
export function ulasanTampil(r: PublicReviewRow) {
  return {
    id: r.id,
    produkId: r.product_id,
    petaniId: r.farmer_id,
    nama: namaSingkat(r.author_name),
    peran: r.author_role === 'umkm' ? ('umkm' as const) : ('konsumen' as const),
    bintang: r.rating as 1 | 2 | 3 | 4 | 5,
    komentar: r.comment ?? '',
    tanggal: r.created_on,
    adaFoto: r.has_photo,
    balasan: r.reply_body ? { isi: r.reply_body, tanggal: r.replied_on ?? '' } : null,
  };
}

/** Totals and star distribution. Index 0 is one star. Defined here because the frontend defines it in katalog.ts. */
export type RingkasanUlasan = {
  rata: number;
  total: number;
  sebaran: [number, number, number, number, number];
  denganFoto: number;
};

/** Summary in the contract shape. `rata` comes from the rows, so it matches what the list shows. */
export function ringkasanDari(s: ReviewSummaryRow): RingkasanUlasan {
  const sebaran: RingkasanUlasan['sebaran'] = [s.s1, s.s2, s.s3, s.s4, s.s5];
  const total = s.total;
  const jumlah = s.s1 + 2 * s.s2 + 3 * s.s3 + 4 * s.s4 + 5 * s.s5;
  const rata = total ? Math.round((jumlah / total) * 10) / 10 : 0;
  return { rata, total, sebaran, denganFoto: s.with_photo };
}
