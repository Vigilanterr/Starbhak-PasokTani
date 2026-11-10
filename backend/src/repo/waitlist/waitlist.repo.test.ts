import { afterAll, describe, expect, test } from 'bun:test';
import { sql } from 'kysely';
import { closeDb, getDb } from '../db';
import { CheckViolationError, mapDbError } from '../errors';
import type { Executor } from '../executor';
import { withRollback } from '../test-utils';
import { ensureFarmerProfile } from '../farmers/farmers.repo';
import { ensureUser, insertMediaAsset } from '../identity/identity.repo';
import { listDistrictsForRegency, listRegencies } from '../identity/reference.repo';
import {
  changeWaitlistStatus, commitToWaitlist, findCommitmentForBuyer, findWaitlistById,
  findWaitlistForFarmer, followWaitlist, insertEventMedia, insertWaitlist, insertWaitlistEvent,
  listCommitmentsInAllocationOrder, listMediaForEvents, listWaitlistTimeline, lockOverdueRemainders,
  unfollowWaitlist,
} from './waitlist.repo';

afterAll(closeDb);

/** Real neon_auth.user ids. users.id has a foreign key to them. Rolled back, so reuse is safe. */
async function authIds(trx: Executor, n: number): Promise<string[]> {
  const rows = await trx.selectFrom('neon_auth.user').select('id').orderBy('id').limit(n).execute();
  if (rows.length < n) throw new Error(`need ${n} neon_auth users, found ${rows.length}`);
  return rows.map((r) => r.id);
}

async function farmer(trx: Executor, id: string) {
  await ensureUser(trx, { id, fullName: 'Pak Tani', role: 'farmer' });
  const regency = (await listRegencies(trx, 1))[0]!;
  const district = (await listDistrictsForRegency(trx, regency.code, 1))[0]!;
  return ensureFarmerProfile(trx, {
    userId: id,
    shopName: 'Tani Waitlist',
    slug: `toko-${id}`,
    regencyCode: regency.code,
    districtCode: district.code,
  });
}

/** A consumer row. commitments.buyer_id and waitlist_followers.user_id reference users, not neon_auth. */
async function buyer(trx: Executor, id: string) {
  return ensureUser(trx, { id, fullName: 'Pembeli Uji', role: 'consumer' });
}

/** A fresh category, so the test owns its wait list. */
async function category(trx: Executor) {
  const slug = `kat-${crypto.randomUUID()}`;
  return trx.insertInto('categories').values({ slug, name: slug }).returning(['id']).executeTakeFirstOrThrow();
}

/** A wait list owned by farmerId with the given quota. Estimated price is rupiah per kg. */
async function waitlist(trx: Executor, farmerId: string, quotaQty: number | null = 10) {
  const cat = await category(trx);
  const { id } = await insertWaitlist(trx, {
    farmerId,
    categoryId: cat.id,
    commodityName: 'Cabai Rawit',
    unit: 'kg',
    estimatedUnitPrice: 20000,
    quotaQty,
  });
  return id;
}

/** Commitment input for a buyer. Quantities are kg, held amount is qty_min times the price. */
function commitInput(waitlistId: string, buyerId: string, qtyMin: number, qtyMax = qtyMin + 2) {
  return {
    waitlistId,
    buyerId,
    qtyMin,
    qtyMax,
    unitPriceEstimate: 20000,
    heldAmount: qtyMin * 20000,
    hadEstimateAtCommit: true,
  };
}

describe('wait list read and create', () => {
  test('insertWaitlist stores the row and findWaitlistById reads the dates as text', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!);
      const row = await findWaitlistById(trx, id);
      expect(row?.status).toBe('planting_scheduled');
      expect(row?.committed_min_qty).toBe('0.000');
      expect(row?.planted_on).toBeNull();
      expect(row?.harvest_start).toBeNull();
    });
  });

  test('findWaitlistForFarmer returns nothing for another farmer', async () => {
    await withRollback(async (trx) => {
      const [a, b] = await authIds(trx, 2);
      await farmer(trx, a!);
      await farmer(trx, b!);
      const id = await waitlist(trx, a!);
      expect(await findWaitlistForFarmer(trx, id, a!)).toBeDefined();
      expect(await findWaitlistForFarmer(trx, id, b!)).toBeUndefined();
    });
  });
});

describe('timeline', () => {
  test('lists newest first and pages with the last row as the cursor', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!);
      for (const title of ['pertama', 'kedua', 'ketiga']) {
        await insertWaitlistEvent(trx, { waitlistId: id, type: 'note', title, createdBy: farmerId! });
      }

      const first = await listWaitlistTimeline(trx, { waitlistId: id, beforeId: null, limit: 2 });
      expect(first.map((e) => e.title)).toEqual(['ketiga', 'kedua', 'pertama']);

      // All three events share the transaction's created_at, so the id breaks the tie.
      const next = await listWaitlistTimeline(trx, { waitlistId: id, beforeId: first[1]!.id, limit: 2 });
      expect(next.map((e) => e.title)).toEqual(['pertama']);
    });
  });

  test('harvest_failed without a reason is rejected with chk_reason_required', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!);
      const err = await insertWaitlistEvent(trx, {
        waitlistId: id,
        type: 'status_change',
        toStatus: 'harvest_failed',
        title: 'Gagal panen',
        createdBy: farmerId!,
      }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_reason_required');
    });
  });

  test('media attaches to an event and an empty list writes nothing', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!);
      const event = await insertWaitlistEvent(trx, { waitlistId: id, type: 'field_photo', title: 'Foto lahan', createdBy: farmerId! });
      const media = await insertMediaAsset(trx, {
        ownerId: farmerId!,
        kind: 'waitlist_photo',
        cloudinaryPublicId: `wl-${crypto.randomUUID()}`,
      });

      expect(await insertEventMedia(trx, event.id, [])).toEqual([]);
      await insertEventMedia(trx, event.id, [{ mediaId: media.id, caption: 'Tanaman minggu ke-3' }]);

      const rows = await listMediaForEvents(trx, [event.id], 10);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.media_id).toBe(media.id);
      expect(rows[0]?.caption).toBe('Tanaman minggu ke-3');
      expect(await listMediaForEvents(trx, [], 10)).toEqual([]);
    });
  });
});

describe('status change', () => {
  test('moves the status once and writes the event; a stale from returns undefined', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!);

      const moved = await changeWaitlistStatus(trx, {
        waitlistId: id, from: 'planting_scheduled', to: 'planted', title: 'Sudah ditanam', createdBy: farmerId!,
      });
      expect(moved?.status).toBe('planted');
      expect(moved?.event.id).toBeDefined();

      const stale = await changeWaitlistStatus(trx, {
        waitlistId: id, from: 'planting_scheduled', to: 'planted', title: 'Ulangan', createdBy: farmerId!,
      });
      expect(stale).toBeUndefined();
      const timeline = await listWaitlistTimeline(trx, { waitlistId: id, beforeId: null, limit: 10 });
      expect(timeline).toHaveLength(1);
    });
  });

  test('harvest_failed without a failure reason is rejected with chk_failed_reason', async () => {
    await withRollback(async (trx) => {
      const [farmerId] = await authIds(trx, 1);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!);
      const err = await changeWaitlistStatus(trx, {
        waitlistId: id,
        from: 'planting_scheduled',
        to: 'harvest_failed',
        title: 'Gagal',
        reason: 'Hama',
        createdBy: farmerId!,
      }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_failed_reason');
    });
  });
});

describe('follow', () => {
  test('follow counts once, a replay changes nothing, and unfollow reverses it', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!);

      expect(await followWaitlist(trx, buyerId!, id)).toBeDefined();
      expect(await followWaitlist(trx, buyerId!, id)).toBeUndefined();
      expect((await findWaitlistById(trx, id))?.follower_count).toBe(1);

      expect(await unfollowWaitlist(trx, buyerId!, id)).toBeDefined();
      expect(await unfollowWaitlist(trx, buyerId!, id)).toBeUndefined();
      expect((await findWaitlistById(trx, id))?.follower_count).toBe(0);
    });
  });
});

describe('commit', () => {
  test('commits within quota: committed qty adds up and the commitment count follows the trigger', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerA, buyerB] = await authIds(trx, 3);
      await buyer(trx, buyerA!);
      await buyer(trx, buyerB!);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!, 10);

      await commitToWaitlist(trx, commitInput(id, buyerA!, 4));
      const second = await commitToWaitlist(trx, commitInput(id, buyerB!, 6));
      expect(Number(second?.waitlist.committed_min_qty)).toBe(10);

      const row = await findWaitlistById(trx, id);
      expect(Number(row?.committed_min_qty)).toBe(10);
      expect(row?.commitment_count).toBe(2);
    });
  });

  test('a commit over quota is rejected with chk_quota_not_exceeded', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerA, buyerB] = await authIds(trx, 3);
      await buyer(trx, buyerA!);
      await buyer(trx, buyerB!);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!, 10);
      await commitToWaitlist(trx, commitInput(id, buyerA!, 6));

      const err = await commitToWaitlist(trx, commitInput(id, buyerB!, 5)).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_quota_not_exceeded');
    });
  });

  test('an unlimited wait list (null quota) takes any commit', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId] = await authIds(trx, 2);
      await buyer(trx, buyerId!);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!, null);
      const result = await commitToWaitlist(trx, commitInput(id, buyerId!, 500));
      expect(result?.commitment.status).toBe('active');
      expect(result?.commitment.held_amount).toBe(String(500 * 20000));
    });
  });

  test('a commit to an unknown wait list returns undefined and writes nothing', async () => {
    await withRollback(async (trx) => {
      const [buyerId] = await authIds(trx, 1);
      await buyer(trx, buyerId!);
      const result = await commitToWaitlist(trx, commitInput(crypto.randomUUID(), buyerId!, 2));
      expect(result).toBeUndefined();
    });
  });

  test('findCommitmentForBuyer returns the commitment to its buyer only', async () => {
    await withRollback(async (trx) => {
      const [farmerId, buyerId, other] = await authIds(trx, 3);
      await buyer(trx, buyerId!);
      await buyer(trx, other!);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!);
      const result = await commitToWaitlist(trx, commitInput(id, buyerId!, 3));
      const commitmentId = result!.commitment.id;
      expect(await findCommitmentForBuyer(trx, commitmentId, buyerId!)).toBeDefined();
      expect(await findCommitmentForBuyer(trx, commitmentId, other!)).toBeUndefined();
    });
  });

  test('lockOverdueRemainders outside a transaction throws before any query runs', () => {
    expect(() => lockOverdueRemainders(getDb(), 10)).toThrow('lockOverdueRemainders must run inside a transaction');
  });
});

describe('remainders and allocation', () => {
  test('lockOverdueRemainders returns only awaiting_remainder rows past their due time', async () => {
    await withRollback(async (trx) => {
      const [farmerId, b1, b2, b3] = await authIds(trx, 4);
      await buyer(trx, b1!);
      await buyer(trx, b2!);
      await buyer(trx, b3!);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!);
      const due = await commitToWaitlist(trx, commitInput(id, b1!, 2));
      const notYet = await commitToWaitlist(trx, commitInput(id, b2!, 2));
      const wrongStatus = await commitToWaitlist(trx, commitInput(id, b3!, 2));

      await trx.updateTable('commitments')
        .set({ status: 'awaiting_remainder', remainder_due_at: sql<Date>`now() - interval '1 hour'` })
        .where('id', '=', due!.commitment.id)
        .execute();
      await trx.updateTable('commitments')
        .set({ status: 'awaiting_remainder', remainder_due_at: sql<Date>`now() + interval '1 hour'` })
        .where('id', '=', notYet!.commitment.id)
        .execute();
      await trx.updateTable('commitments')
        .set({ remainder_due_at: sql<Date>`now() - interval '1 hour'` })
        .where('id', '=', wrongStatus!.commitment.id)
        .execute();

      const rows = await lockOverdueRemainders(trx, 10);
      expect(rows.map((r) => r.id)).toEqual([due!.commitment.id]);
    });
  });

  test('allocation order is earliest remainder payment first, with unpaid rows last', async () => {
    await withRollback(async (trx) => {
      const [farmerId, b1, b2, b3] = await authIds(trx, 4);
      await buyer(trx, b1!);
      await buyer(trx, b2!);
      await buyer(trx, b3!);
      await farmer(trx, farmerId!);
      const id = await waitlist(trx, farmerId!);
      const late = await commitToWaitlist(trx, commitInput(id, b1!, 2));
      const early = await commitToWaitlist(trx, commitInput(id, b2!, 2));
      const unpaid = await commitToWaitlist(trx, commitInput(id, b3!, 2));

      await trx.updateTable('commitments')
        .set({ remainder_paid_at: sql<Date>`now() - interval '1 hour'` })
        .where('id', '=', late!.commitment.id)
        .execute();
      await trx.updateTable('commitments')
        .set({ remainder_paid_at: sql<Date>`now() - interval '3 hour'` })
        .where('id', '=', early!.commitment.id)
        .execute();

      const rows = await listCommitmentsInAllocationOrder(trx, { waitlistId: id, status: 'active', limit: 10 });
      expect(rows.map((r) => r.id)).toEqual([early!.commitment.id, late!.commitment.id, unpaid!.commitment.id]);
    });
  });
});
