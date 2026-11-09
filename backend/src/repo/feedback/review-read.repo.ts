import { sql } from 'kysely';
import type { Executor } from '../executor';

/**
 * Public review reads: published reviews only. Author and product come from joins, so the page never makes a
 * second query per review. The list is the most recent `limit`; a feed with paging uses the keyset reads in
 * review.repo.ts.
 */

export interface PublicReviewRow {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  farmer_id: string;
  author_name: string;
  author_role: 'consumer' | 'umkm' | 'farmer' | 'admin';
  rating: number;
  comment: string | null;
  created_on: string;
  has_photo: boolean;
  reply_body: string | null;
  replied_on: string | null;
}

export function listPublicReviews(db: Executor, a: { by: 'product' | 'farmer'; id: string; limit: number }) {
  const column = a.by === 'product' ? 'reviews.product_id' : 'reviews.farmer_id';
  return db.selectFrom('reviews')
    .innerJoin('users', 'users.id', 'reviews.buyer_id')
    .innerJoin('products', 'products.id', 'reviews.product_id')
    .select([
      'reviews.id', 'reviews.product_id', 'products.name as product_name', 'products.slug as product_slug',
      'reviews.farmer_id', 'users.full_name as author_name', 'users.role as author_role',
      'reviews.rating', 'reviews.comment',
      sql<string>`(reviews.created_at at time zone 'Asia/Jakarta')::date::text`.as('created_on'),
      sql<boolean>`exists (select 1 from review_photos rp where rp.review_id = reviews.id)`.as('has_photo'),
      'reviews.reply_body',
      sql<string | null>`(reviews.replied_at at time zone 'Asia/Jakarta')::date::text`.as('replied_on'),
    ])
    .where(column, '=', a.id)
    .where('reviews.status', '=', 'published')
    .orderBy('reviews.created_at', 'desc')
    .orderBy('reviews.id', 'desc')
    .limit(a.limit)
    .execute() as Promise<PublicReviewRow[]>;
}

export interface ReviewSummaryRow {
  total: number;
  with_photo: number;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
}

/** Totals, star distribution and photo count for one product or farmer. One query. */
export function summarizePublicReviews(db: Executor, a: { by: 'product' | 'farmer'; id: string }) {
  const column = a.by === 'product' ? 'product_id' : 'farmer_id';
  return sql<ReviewSummaryRow>`
    select
      count(*)::int as total,
      count(*) filter (where exists (select 1 from review_photos rp where rp.review_id = r.id))::int as with_photo,
      count(*) filter (where r.rating = 1)::int as s1,
      count(*) filter (where r.rating = 2)::int as s2,
      count(*) filter (where r.rating = 3)::int as s3,
      count(*) filter (where r.rating = 4)::int as s4,
      count(*) filter (where r.rating = 5)::int as s5
    from reviews r
    where r.status = 'published' and r.${sql.ref(column)} = ${a.id}
  `.execute(db).then((res) => res.rows[0]!);
}
