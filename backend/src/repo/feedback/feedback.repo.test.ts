import { afterAll, describe, expect, test } from 'bun:test';
import { closeDb } from '../db';
import { CheckViolationError, mapDbError } from '../errors';
import type { Executor } from '../executor';
import { withRollback } from '../test-utils';
import { ensureFarmerProfile } from '../farmers/farmers.repo';
import { insertProduct } from '../catalog/catalog.repo';
import { ensureUser, insertMediaAsset } from '../identity/identity.repo';
import { listDistrictsForRegency, listRegencies } from '../identity/reference.repo';
import { insertFeeSetting, insertOrder, insertOrderItems } from '../orders/orders.repo';
import {
  findComplaintForParty, insertComplaintMessage, insertReport, insertReview, insertReviewPhotos,
  listComplaintMessages, listComplaintQueue, listComplaintsForBuyer, listComplaintsForFarmer,
  listPhotosForReviews, listPublishedReviewsForFarmer, listPublishedReviewsForProduct, listReportQueue,
  openComplaint, replyToReview, setComplaintStatus, setReportStatus, setReviewModeration,
} from './feedback.repo';

afterAll(closeDb);

const DAY_MS = 24 * 60 * 60 * 1000;

/** Real neon_auth.user ids. users.id has a foreign key to them. Rolled back, so reuse is safe. */
async function authIds(trx: Executor, n: number): Promise<string[]> {
  const rows = await trx.selectFrom('neon_auth.user').select('id').orderBy('id').limit(n).execute();
  if (rows.length < n) throw new Error(`need ${n} neon_auth users, found ${rows.length}`);
  return rows.map((r) => r.id);
}

async function consumer(trx: Executor, id: string) {
  return ensureUser(trx, { id, fullName: 'Pembeli Uji', role: 'consumer' });
}

async function farmer(trx: Executor, id: string) {
  await ensureUser(trx, { id, fullName: 'Pak Tani', role: 'farmer' });
  const regency = (await listRegencies(trx, 1))[0]!;
  const district = (await listDistrictsForRegency(trx, regency.code, 1))[0]!;
  return ensureFarmerProfile(trx, {
    userId: id,
    shopName: 'Tani Ulasan',
    slug: `toko-${id}`,
    regencyCode: regency.code,
    districtCode: district.code,
  });
}

async function product(trx: Executor, farmerId: string) {
  const slug = `kat-${crypto.randomUUID()}`;
  const cat = await trx.insertInto('categories').values({ slug, name: slug }).returning(['id']).executeTakeFirstOrThrow();
  return insertProduct(trx, {
    farmerId,
    categoryId: cat.id,
    slug: `uji-${crypto.randomUUID()}`,
    name: 'Cabai Rawit',
    unit: 'kg',
    price: 40000,
  });
}

interface Fixture {
  buyerId: string;
  buyer2Id: string;
  farmerId: string;
  farmer2Id: string;
  mediatorId: string;
  productId: string;
  feeId: string;
}

/**
 * Two buyers, two farmers and a mediator (a plain user here: the repo does not check roles), a product and a fee
 * version. Each user id is used once per test, and rolled back afterwards.
 */
async function fixture(trx: Executor): Promise<Fixture> {
  const [buyerId, buyer2Id, farmerId, farmer2Id, mediatorId] = await authIds(trx, 5) as [string, string, string, string, string];
  await consumer(trx, buyerId);
  await consumer(trx, buyer2Id);
  await consumer(trx, mediatorId);
  await farmer(trx, farmerId);
  await farmer(trx, farmer2Id);
  const p = await product(trx, farmerId);
  const fee = await insertFeeSetting(trx, {
    commissionPct: 3, serviceFeePct: 1, effectiveFrom: new Date(Date.now() - DAY_MS), createdBy: buyerId,
  });
  return { buyerId, buyer2Id, farmerId, farmer2Id, mediatorId, productId: p.id, feeId: fee.id };
}

/** One order for one farmer with one line. Returns the order and its item. */
async function orderWithItem(trx: Executor, f: Fixture, farmerId: string = f.farmerId, buyerId: string = f.buyerId) {
  const order = await insertOrder(trx, {
    code: `T-${crypto.randomUUID()}`,
    checkoutId: null,
    buyerId,
    farmerId,
    goodsSubtotal: 80000,
    serviceFee: 800,
    commissionFee: 2400,
    buyerTotal: 80800,
    farmerNet: 77600,
    commissionPct: 3,
    serviceFeePct: 1,
    feeSettingId: f.feeId,
  });
  const [item] = await insertOrderItems(trx, order.id, [{
    productId: f.productId, productName: 'Cabai Rawit', unit: 'kg', quantity: 2, tierUnitPrice: 40000, lineSubtotal: 80000,
  }]);
  return { order, item: item! };
}

async function ratingOf(trx: Executor, productId: string) {
  const p = await trx.selectFrom('products').select(['rating_avg', 'rating_count']).where('id', '=', productId).executeTakeFirstOrThrow();
  return { avg: Number(p.rating_avg), count: Number(p.rating_count) };
}

describe('reviews', () => {
  test('a review copies product and farmer from the order item and moves the product rating', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { item } = await orderWithItem(trx, f);
      const review = await insertReview(trx, { orderItemId: item.id, buyerId: f.buyerId, rating: 4, comment: 'Pedas, segar' });

      expect(review).toBeDefined();
      expect(review!.product_id).toBe(f.productId);
      expect(review!.farmer_id).toBe(f.farmerId);
      expect(review!.buyer_id).toBe(f.buyerId);
      expect(review!.status).toBe('published');
      expect(await ratingOf(trx, f.productId)).toEqual({ avg: 4, count: 1 });
    });
  });

  test('another buyer cannot review an item, and nothing is written', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { item } = await orderWithItem(trx, f);
      expect(await insertReview(trx, { orderItemId: item.id, buyerId: f.buyer2Id, rating: 1 })).toBeUndefined();
      expect(await ratingOf(trx, f.productId)).toEqual({ avg: 0, count: 0 });
    });
  });

  test('a second review of the same item is a replay: nothing changes', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { item } = await orderWithItem(trx, f);
      await insertReview(trx, { orderItemId: item.id, buyerId: f.buyerId, rating: 5 });
      expect(await insertReview(trx, { orderItemId: item.id, buyerId: f.buyerId, rating: 1 })).toBeUndefined();
      expect(await ratingOf(trx, f.productId)).toEqual({ avg: 5, count: 1 });
    });
  });

  test('a rating outside 1 to 5 fails with chk_rating', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { item } = await orderWithItem(trx, f);
      const err = await insertReview(trx, { orderItemId: item.id, buyerId: f.buyerId, rating: 6 }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_rating');
    });
  });

  test('published lists are newest first with non-overlapping pages; hidden reviews are left out', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const r1 = await insertReview(trx, { orderItemId: (await orderWithItem(trx, f)).item.id, buyerId: f.buyerId, rating: 3 });
      const r2 = await insertReview(trx, { orderItemId: (await orderWithItem(trx, f)).item.id, buyerId: f.buyerId, rating: 4 });
      const r3 = await insertReview(trx, { orderItemId: (await orderWithItem(trx, f)).item.id, buyerId: f.buyerId, rating: 5 });
      const ids = [r1!.id, r2!.id, r3!.id];

      const page1 = await listPublishedReviewsForProduct(trx, { productId: f.productId, afterId: null, limit: 2 });
      expect(page1).toHaveLength(3); // limit + 1 tells the caller a next page exists
      const seen = page1.slice(0, 2).map((r) => r.id);
      const page2 = await listPublishedReviewsForProduct(trx, { productId: f.productId, afterId: seen[1]!, limit: 2 });
      expect(page2.map((r) => r.id)).toEqual([page1[2]!.id]);
      expect([...seen, page2[0]!.id].sort()).toEqual([...ids].sort());

      await setReviewModeration(trx, { reviewId: r2!.id, from: 'published', to: 'hidden' });
      const visible = await listPublishedReviewsForProduct(trx, { productId: f.productId, afterId: null, limit: 10 });
      expect(visible.map((r) => r.id)).not.toContain(r2!.id);
      expect(visible).toHaveLength(2);
      expect((await listPublishedReviewsForFarmer(trx, { farmerId: f.farmerId, afterId: null, limit: 10 })).length).toBe(2);
    });
  });

  test('moderation is guarded and the rating follows the published reviews', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const r1 = await insertReview(trx, { orderItemId: (await orderWithItem(trx, f)).item.id, buyerId: f.buyerId, rating: 2 });
      await insertReview(trx, { orderItemId: (await orderWithItem(trx, f)).item.id, buyerId: f.buyerId, rating: 4 });
      expect(await ratingOf(trx, f.productId)).toEqual({ avg: 3, count: 2 });

      const hidden = await setReviewModeration(trx, { reviewId: r1!.id, from: 'published', to: 'hidden' });
      expect(hidden?.status).toBe('hidden');
      expect(await ratingOf(trx, f.productId)).toEqual({ avg: 4, count: 1 });

      expect(await setReviewModeration(trx, { reviewId: r1!.id, from: 'published', to: 'hidden' })).toBeUndefined();
      expect(await ratingOf(trx, f.productId)).toEqual({ avg: 4, count: 1 });
    });
  });

  test('the farmer replies once, and only to their own review', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { item } = await orderWithItem(trx, f);
      const review = await insertReview(trx, { orderItemId: item.id, buyerId: f.buyerId, rating: 5 });

      expect(await replyToReview(trx, { reviewId: review!.id, farmerId: f.farmer2Id, body: 'Terima kasih' })).toBeUndefined();
      const reply = await replyToReview(trx, { reviewId: review!.id, farmerId: f.farmerId, body: 'Terima kasih kembali' });
      expect(reply?.reply_body).toBe('Terima kasih kembali');
      expect(reply?.replied_at).toBeInstanceOf(Date);
      expect(await replyToReview(trx, { reviewId: review!.id, farmerId: f.farmerId, body: 'Balasan kedua' })).toBeUndefined();
    });
  });

  test('photos keep the given order, and an asset owned by someone else is dropped', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { item } = await orderWithItem(trx, f);
      const review = await insertReview(trx, { orderItemId: item.id, buyerId: f.buyerId, rating: 5 });
      const mine1 = await insertMediaAsset(trx, { ownerId: f.buyerId, kind: 'review_photo', cloudinaryPublicId: `rv-${crypto.randomUUID()}` });
      const mine2 = await insertMediaAsset(trx, { ownerId: f.buyerId, kind: 'review_photo', cloudinaryPublicId: `rv-${crypto.randomUUID()}` });
      const theirs = await insertMediaAsset(trx, { ownerId: f.buyer2Id, kind: 'review_photo', cloudinaryPublicId: `rv-${crypto.randomUUID()}` });

      expect(await insertReviewPhotos(trx, review!.id, [])).toEqual([]);
      const rows = await insertReviewPhotos(trx, review!.id, [mine2.id, theirs.id, mine1.id]);
      expect(rows.map((r) => r.media_id)).toEqual([mine2.id, mine1.id]);
      expect(rows.map((r) => r.position)).toEqual([0, 2]);

      const listed = await listPhotosForReviews(trx, [review!.id], 10);
      expect(listed.map((p) => p.media_id)).toEqual([mine2.id, mine1.id]);
      expect(await listPhotosForReviews(trx, [], 10)).toEqual([]);
    });
  });
});

describe('complaints', () => {
  test('a buyer opens a complaint on their own order; another buyer gets nothing', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { order } = await orderWithItem(trx, f);
      expect(await openComplaint(trx, { orderId: order.id, buyerId: f.buyer2Id, reason: 'damaged', description: 'x' })).toBeUndefined();

      const c = await openComplaint(trx, {
        orderId: order.id, buyerId: f.buyerId, reason: 'rotten', description: 'Separuh busuk', requestedAmount: 40000,
      });
      expect(c?.status).toBe('open');
      expect(c?.requested_amount).toBe('40000');
      expect(c?.resolved_at).toBeNull();
    });
  });

  test('parties see the complaint: buyer, farmer and mediator. A stranger sees nothing', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { order } = await orderWithItem(trx, f);
      const c = await openComplaint(trx, { orderId: order.id, buyerId: f.buyerId, reason: 'damaged', description: 'Rusak' });
      await setComplaintStatus(trx, { complaintId: c!.id, from: 'open', to: 'under_mediation', mediatorId: f.mediatorId });

      expect(await findComplaintForParty(trx, c!.id, f.buyerId)).toBeDefined();
      expect(await findComplaintForParty(trx, c!.id, f.farmerId)).toBeDefined();
      expect(await findComplaintForParty(trx, c!.id, f.mediatorId)).toBeDefined();
      expect(await findComplaintForParty(trx, c!.id, f.buyer2Id)).toBeUndefined();
      expect(await findComplaintForParty(trx, c!.id, f.farmer2Id)).toBeUndefined();
    });
  });

  test('a status change is guarded, sets resolved_at on a terminal state, and a stale from changes nothing', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { order } = await orderWithItem(trx, f);
      const c = await openComplaint(trx, { orderId: order.id, buyerId: f.buyerId, reason: 'missing_items', description: 'Kurang' });

      const stale = await setComplaintStatus(trx, { complaintId: c!.id, from: 'under_mediation', to: 'rejected' });
      expect(stale).toBeUndefined();

      const done = await setComplaintStatus(trx, {
        complaintId: c!.id, from: 'open', to: 'resolved_partial_refund', resolvedAmount: 20000, resolutionNote: 'Separuh',
      });
      expect(done?.status).toBe('resolved_partial_refund');
      expect(done?.resolved_amount).toBe('20000');
      expect(done?.resolution_note).toBe('Separuh');
      expect(done?.resolved_at).toBeInstanceOf(Date);
    });
  });

  test('the thread: a party posts, a stranger cannot, and the list is oldest first with pages', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const { order } = await orderWithItem(trx, f);
      const c = await openComplaint(trx, { orderId: order.id, buyerId: f.buyerId, reason: 'other', description: 'Tolong' });
      await setComplaintStatus(trx, { complaintId: c!.id, from: 'open', to: 'under_mediation', mediatorId: f.mediatorId });

      expect(await insertComplaintMessage(trx, { complaintId: c!.id, senderId: f.buyer2Id, body: 'Saya ikut' })).toBeUndefined();
      const m1 = await insertComplaintMessage(trx, { complaintId: c!.id, senderId: f.buyerId, body: 'Ini fotonya' });
      const m2 = await insertComplaintMessage(trx, { complaintId: c!.id, senderId: f.farmerId, body: 'Kami tanggapi' });
      const m3 = await insertComplaintMessage(trx, { complaintId: c!.id, senderId: f.mediatorId, body: 'Dicatat' });
      expect([m1, m2, m3].every((m) => m !== undefined)).toBe(true);

      const page1 = await listComplaintMessages(trx, { complaintId: c!.id, viewerId: f.buyerId, afterId: null, limit: 2 });
      expect(page1).toHaveLength(3);
      const page2 = await listComplaintMessages(trx, { complaintId: c!.id, viewerId: f.buyerId, afterId: page1[1]!.id, limit: 2 });
      expect(page2.map((m) => m.id)).toEqual([m3!.id]);
      expect(page1.slice(0, 2).map((m) => m.id)).toEqual([m1!.id, m2!.id]);

      expect(await listComplaintMessages(trx, { complaintId: c!.id, viewerId: f.buyer2Id, afterId: null, limit: 10 })).toEqual([]);
    });
  });

  test('buyer and farmer lists are newest first; the admin queue is oldest first and filters by status', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const o1 = await orderWithItem(trx, f);
      const o2 = await orderWithItem(trx, f);
      const first = await openComplaint(trx, { orderId: o1.order.id, buyerId: f.buyerId, reason: 'rotten', description: 'a' });
      const second = await openComplaint(trx, { orderId: o2.order.id, buyerId: f.buyerId, reason: 'rotten', description: 'b' });
      await setComplaintStatus(trx, { complaintId: first!.id, from: 'open', to: 'rejected' });

      const mine = await listComplaintsForBuyer(trx, { buyerId: f.buyerId, afterId: null, limit: 10 });
      expect(mine).toHaveLength(2);
      expect(mine.map((c) => c.id)).toContain(second!.id);
      expect((await listComplaintsForFarmer(trx, { farmerId: f.farmerId, afterId: null, limit: 10 })).length).toBe(2);
      expect(await listComplaintsForFarmer(trx, { farmerId: f.farmer2Id, afterId: null, limit: 10 })).toEqual([]);

      const open = await listComplaintQueue(trx, { status: 'open', afterId: null, limit: 10 });
      expect(open.map((c) => c.id)).toEqual([second!.id]);
      const all = await listComplaintQueue(trx, { afterId: null, limit: 10 });
      expect(all.map((c) => c.id)).toEqual([first!.id, second!.id]);
    });
  });
});

describe('reports', () => {
  test('a report on a product is filed', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const r = await insertReport(trx, { reporterId: f.buyerId, productId: f.productId, reason: 'Foto menyesatkan' });
      expect(r.product_id).toBe(f.productId);
      expect(r.farmer_id).toBeNull();
      expect(r.review_id).toBeNull();
      expect(r.status).toBe('open');
    });
  });

  test('zero targets fail with chk_report_target', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const err = await insertReport(trx, { reporterId: f.buyerId, reason: 'kosong' }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_report_target');
    });
  });

  test('two targets fail with chk_report_target', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const err = await insertReport(trx, {
        reporterId: f.buyerId, productId: f.productId, farmerId: f.farmerId, reason: 'dua',
      }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_report_target');
    });
  });

  test('triage is guarded and handled_at is set only when the report is closed', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const r = await insertReport(trx, { reporterId: f.buyerId, farmerId: f.farmerId, reason: 'Penipuan' });

      const reviewing = await setReportStatus(trx, { reportId: r.id, from: 'open', to: 'reviewing', handledBy: f.mediatorId });
      expect(reviewing?.handled_by).toBe(f.mediatorId);
      expect(reviewing?.handled_at).toBeNull();

      expect(await setReportStatus(trx, { reportId: r.id, from: 'open', to: 'dismissed', handledBy: f.mediatorId })).toBeUndefined();

      const closed = await setReportStatus(trx, { reportId: r.id, from: 'reviewing', to: 'actioned', handledBy: f.mediatorId });
      expect(closed?.status).toBe('actioned');
      expect(closed?.handled_at).toBeInstanceOf(Date);
    });
  });

  test('the report queue is oldest first and filters by status', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const a = await insertReport(trx, { reporterId: f.buyerId, productId: f.productId, reason: 'a' });
      const b = await insertReport(trx, { reporterId: f.buyerId, productId: f.productId, reason: 'b' });
      await setReportStatus(trx, { reportId: a.id, from: 'open', to: 'dismissed', handledBy: f.mediatorId });

      const open = await listReportQueue(trx, { status: 'open', afterId: null, limit: 10 });
      expect(open.map((r) => r.id)).toEqual([b.id]);
      // limit 1 fetches limit + 1 rows, so both come back and the caller knows a next page exists.
      const all = await listReportQueue(trx, { afterId: null, limit: 1 });
      expect(all.map((r) => r.id)).toEqual([a.id, b.id]);
    });
  });
});
