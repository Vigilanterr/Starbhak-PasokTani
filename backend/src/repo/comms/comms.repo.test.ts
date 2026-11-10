import { afterAll, describe, expect, test } from 'bun:test';
import { sql } from 'kysely';
import { closeDb, getDb } from '../db';
import { CheckViolationError, mapDbError } from '../errors';
import type { Executor } from '../executor';
import { withRollback } from '../test-utils';
import { ensureFarmerProfile } from '../farmers/farmers.repo';
import { ensureUser } from '../identity/identity.repo';
import { listDistrictsForRegency, listRegencies } from '../identity/reference.repo';
import {
  claimOutboxEvents, countUnreadMessages, countUnreadNotifications, findConversationForParty,
  getOrCreateConversation, insertMessage, insertNotifications, insertOutboxEvent, listConversationsForUser,
  listMessagesAfter, listMessagesBefore, listNotificationsForUser, markAllNotificationsRead,
  markConversationRead, markNotificationsPushed, markNotificationsRead, markOutboxFailed, markOutboxProcessed,
} from './comms.repo';

afterAll(closeDb);

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
    shopName: 'Tani Chat',
    slug: `toko-${id}`,
    regencyCode: regency.code,
    districtCode: district.code,
  });
}

interface Fixture {
  buyerId: string;
  /** A user who is in none of the conversations. */
  strangerId: string;
  farmerId: string;
  farmer2Id: string;
  farmer3Id: string;
}

/** A buyer, an outsider, and three farmers. Each user id is used once per test, and rolled back afterwards. */
async function fixture(trx: Executor): Promise<Fixture> {
  const [buyerId, strangerId, farmerId, farmer2Id, farmer3Id] = await authIds(trx, 5) as [string, string, string, string, string];
  await consumer(trx, buyerId);
  await consumer(trx, strangerId);
  await farmer(trx, farmerId);
  await farmer(trx, farmer2Id);
  await farmer(trx, farmer3Id);
  return { buyerId, strangerId, farmerId, farmer2Id, farmer3Id };
}

/** Sends one text message and fails the test if it is refused. */
async function say(trx: Executor, conversationId: string, senderId: string, body: string) {
  const sent = await insertMessage(trx, { conversationId, senderId, clientMessageId: crypto.randomUUID(), body });
  expect(sent?.created).toBe(true);
  return sent!.message;
}

/** Moves messages into the past, so a later read marker is after them. Test-only: the repo never rewrites messages. */
async function backdateMessages(trx: Executor, conversationId: string) {
  await sql`update messages set created_at = now() - interval '2 minutes' where conversation_id = ${conversationId}::uuid`.execute(trx);
}

describe('conversations', () => {
  test('a buyer and farmer pair has one conversation, however often it is asked for', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const first = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      const again = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      expect(again.id).toBe(first.id);
      expect(first.last_message_at).toBeNull();
    });
  });

  test('only a party sees a conversation', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const c = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      expect((await findConversationForParty(trx, c.id, f.buyerId))?.id).toBe(c.id);
      expect((await findConversationForParty(trx, c.id, f.farmerId))?.id).toBe(c.id);
      expect(await findConversationForParty(trx, c.id, f.strangerId)).toBeUndefined();
    });
  });

  test('the list is most recent activity first, with pages that do not overlap', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const older = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      const newer = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmer2Id });
      const third = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmer3Id });
      // Activity times are set apart explicitly. Rows made in one transaction share now().
      await say(trx, older.id, f.buyerId, 'Halo, cabai masih ada?');
      await sql`update conversations set last_message_at = now() - interval '1 day' where id = ${older.id}::uuid`.execute(trx);
      await say(trx, newer.id, f.farmer2Id, 'Ada, Kak');
      await sql`update conversations set created_at = now() - interval '2 days' where id = ${third.id}::uuid`.execute(trx);

      const page1 = await listConversationsForUser(trx, { userId: f.buyerId, afterId: null, limit: 2 });
      expect(page1.map((c) => c.id)).toEqual([newer.id, older.id, third.id]); // limit + 1 tells the caller a next page exists

      const page2 = await listConversationsForUser(trx, { userId: f.buyerId, afterId: page1[1]!.id, limit: 2 });
      expect(page2.map((c) => c.id)).toEqual([third.id]);
      expect(await listConversationsForUser(trx, { userId: f.strangerId, afterId: null, limit: 10 })).toHaveLength(0);
    });
  });

  test('marking read moves only the caller\'s marker, and a stranger cannot mark', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const c = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      await say(trx, c.id, f.farmerId, 'Pesanan sudah siap');

      const read = await markConversationRead(trx, { conversationId: c.id, userId: f.farmerId });
      expect(read?.farmer_last_read_at).not.toBeNull();
      expect(read?.buyer_last_read_at).toBeNull();

      expect(await markConversationRead(trx, { conversationId: c.id, userId: f.strangerId })).toBeUndefined();
    });
  });
});

describe('messages', () => {
  test('a party sends a message, and the conversation moves to the message time', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const c = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      const sent = await insertMessage(trx, { conversationId: c.id, senderId: f.buyerId, clientMessageId: crypto.randomUUID(), body: 'Halo' });

      expect(sent?.created).toBe(true);
      const row = await findConversationForParty(trx, c.id, f.buyerId);
      expect(row?.last_message_at?.getTime()).toBe(sent!.message.created_at.getTime());
    });
  });

  test('a stranger cannot send, and nothing is written', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const c = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      const sent = await insertMessage(trx, { conversationId: c.id, senderId: f.strangerId, clientMessageId: crypto.randomUUID(), body: 'Halo' });

      expect(sent).toBeUndefined();
      expect(await listMessagesAfter(trx, { conversationId: c.id, viewerId: f.buyerId, afterId: null, limit: 10 })).toHaveLength(0);
      expect((await findConversationForParty(trx, c.id, f.buyerId))?.last_message_at).toBeNull();
    });
  });

  test('a resend with the same client_message_id is a replay: the stored row comes back and nothing changes', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const c = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      const clientMessageId = crypto.randomUUID();
      const first = await insertMessage(trx, { conversationId: c.id, senderId: f.buyerId, clientMessageId, body: 'Halo' });
      const replay = await insertMessage(trx, { conversationId: c.id, senderId: f.buyerId, clientMessageId, body: 'Halo lagi' });

      expect(replay?.created).toBe(false);
      expect(replay?.message.id).toBe(first!.message.id);
      expect(replay?.message.body).toBe('Halo');
      expect(await listMessagesAfter(trx, { conversationId: c.id, viewerId: f.buyerId, afterId: null, limit: 10 })).toHaveLength(1);
    });
  });

  test('a message needs a body or an attachment (chk_message_content)', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const c = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      const err = await insertMessage(trx, { conversationId: c.id, senderId: f.buyerId, clientMessageId: crypto.randomUUID(), body: null })
        .catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_message_content');
    });
  });

  test('sending outside a transaction throws', async () => {
    const err = await insertMessage(getDb(), {
      conversationId: crypto.randomUUID(), senderId: crypto.randomUUID(), clientMessageId: crypto.randomUUID(), body: 'x',
    }).catch((e: unknown) => e);
    expect((err as Error).message).toMatch(/must run inside a transaction/);
  });

  test('catch-up returns what is after the cursor, oldest first; a stranger reads nothing', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const c = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      const m1 = await say(trx, c.id, f.buyerId, 'satu');
      const m2 = await say(trx, c.id, f.farmerId, 'dua');
      const m3 = await say(trx, c.id, f.buyerId, 'tiga');

      const all = await listMessagesAfter(trx, { conversationId: c.id, viewerId: f.farmerId, afterId: null, limit: 10 });
      expect(all.map((m) => m.id)).toEqual([m1.id, m2.id, m3.id]);

      const missed = await listMessagesAfter(trx, { conversationId: c.id, viewerId: f.farmerId, afterId: m1.id, limit: 10 });
      expect(missed.map((m) => m.id)).toEqual([m2.id, m3.id]);

      expect(await listMessagesAfter(trx, { conversationId: c.id, viewerId: f.strangerId, afterId: null, limit: 10 })).toEqual([]);
    });
  });

  test('history pages newest first without overlap, and a stranger gets an empty page', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const c = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      const sent = [
        await say(trx, c.id, f.buyerId, 'satu'),
        await say(trx, c.id, f.farmerId, 'dua'),
        await say(trx, c.id, f.buyerId, 'tiga'),
      ];

      const page1 = await listMessagesBefore(trx, { conversationId: c.id, viewerId: f.buyerId, beforeId: null, limit: 2 });
      expect(page1).toHaveLength(3); // limit + 1
      expect(page1[0]!.id).toBe(sent[2]!.id);
      const page2 = await listMessagesBefore(trx, { conversationId: c.id, viewerId: f.buyerId, beforeId: page1[1]!.id, limit: 2 });
      expect(page2.map((m) => m.id)).toEqual([sent[0]!.id]);

      expect(await listMessagesBefore(trx, { conversationId: c.id, viewerId: f.strangerId, beforeId: null, limit: 2 })).toEqual([]);
    });
  });

  test('unread counts follow the read marker and skip the reader\'s own messages', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const c = await getOrCreateConversation(trx, { buyerId: f.buyerId, farmerId: f.farmerId });
      await say(trx, c.id, f.farmerId, 'a');
      await say(trx, c.id, f.farmerId, 'b');
      await say(trx, c.id, f.buyerId, 'c');

      expect(await countUnreadMessages(trx, f.buyerId)).toBe('2');
      expect(await countUnreadMessages(trx, f.farmerId)).toBe('1');

      await backdateMessages(trx, c.id);
      await markConversationRead(trx, { conversationId: c.id, userId: f.buyerId });
      expect(await countUnreadMessages(trx, f.buyerId)).toBe('0');
      expect(await countUnreadMessages(trx, f.strangerId)).toBe('0');
    });
  });
});

describe('notifications', () => {
  test('an empty fan-out writes nothing', async () => {
    await withRollback(async (trx) => {
      expect(await insertNotifications(trx, [])).toEqual([]);
    });
  });

  test('the list is newest first with pages that do not overlap, and holds only the owner\'s rows', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const rows = await insertNotifications(trx, [
        { userId: f.buyerId, category: 'chat', type: 'chat.message', title: 'Pesan baru', link: `/pesan/${f.farmerId}`, data: { n: 1 } },
        { userId: f.buyerId, category: 'order', type: 'order.shipped', title: 'Pesanan dikirim' },
        { userId: f.buyerId, category: 'waitlist', type: 'waitlist.schedule_changed', title: 'Jadwal berubah' },
        { userId: f.strangerId, category: 'system', type: 'system.notice', title: 'Bukan untuk pembeli' },
      ]);
      expect(rows).toHaveLength(4);

      const page1 = await listNotificationsForUser(trx, { userId: f.buyerId, afterId: null, limit: 2 });
      expect(page1).toHaveLength(3);
      const page2 = await listNotificationsForUser(trx, { userId: f.buyerId, afterId: page1[1]!.id, limit: 2 });
      expect(page2.map((n) => n.id)).toEqual([page1[2]!.id]);
      // page1 has limit + 1 rows; the last one is only a signal, so the page itself is the first two.
      expect([...page1.slice(0, 2), ...page2].map((n) => n.id).sort()).toEqual(rows.filter((r) => r.user_id === f.buyerId).map((r) => r.id).sort());
    });
  });

  test('the unread badge counts only the owner\'s unread rows; marking read ignores other users\' ids', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const [mine1, , theirs] = await insertNotifications(trx, [
        { userId: f.buyerId, category: 'order', type: 'order.paid', title: 'Dibayar' },
        { userId: f.buyerId, category: 'order', type: 'order.arrived', title: 'Tiba' },
        { userId: f.strangerId, category: 'order', type: 'order.paid', title: 'Dibayar' },
      ]);

      expect(await countUnreadNotifications(trx, f.buyerId)).toBe('2');

      const marked = await markNotificationsRead(trx, f.buyerId, [mine1.id, theirs.id]);
      expect(marked.map((m) => m.id)).toEqual([mine1.id]);
      expect(await countUnreadNotifications(trx, f.buyerId)).toBe('1');
      expect(await countUnreadNotifications(trx, f.strangerId)).toBe('1');

      await markAllNotificationsRead(trx, f.buyerId);
      expect(await countUnreadNotifications(trx, f.buyerId)).toBe('0');
    });
  });

  test('web push is recorded once', async () => {
    await withRollback(async (trx) => {
      const f = await fixture(trx);
      const [n] = await insertNotifications(trx, [{ userId: f.buyerId, category: 'system', type: 'system.notice', title: 'Halo' }]);
      expect(await markNotificationsPushed(trx, [n.id])).toHaveLength(1);
      expect(await markNotificationsPushed(trx, [n.id])).toEqual([]);
      expect(await markNotificationsPushed(trx, [])).toEqual([]);
    });
  });
});

describe('outbox', () => {
  test('an outbox event outside a transaction throws, so it can never commit alone', async () => {
    const err = await insertOutboxEvent(getDb(), {
      aggregateType: 'order', aggregateId: crypto.randomUUID(), eventType: 'order.paid', payload: {},
    }).catch((e: unknown) => e);
    expect((err as Error).message).toMatch(/must run inside a transaction/);
  });

  test('a claim takes due events once: a lease hides them from the next claim, and a processed event never returns', async () => {
    await withRollback(async (trx) => {
      const aggregateId = crypto.randomUUID();
      const a = await insertOutboxEvent(trx, { aggregateType: 'order', aggregateId, eventType: 'order.paid', payload: { step: 1 } });
      const b = await insertOutboxEvent(trx, { aggregateType: 'order', aggregateId, eventType: 'order.shipped', payload: { step: 2 } });

      const first = await claimOutboxEvents(trx, { limit: 500, leaseSeconds: 300 });
      const claimedIds = first.map((e) => e.id);
      expect(claimedIds).toEqual(expect.arrayContaining([a, b]));
      const mine = first.filter((e) => e.aggregate_id === aggregateId);
      expect(mine.every((e) => e.attempts === 1)).toBe(true);
      expect(mine.every((e) => e.available_at.getTime() > Date.now())).toBe(true);

      const second = await claimOutboxEvents(trx, { limit: 500, leaseSeconds: 300 });
      expect(second.map((e) => e.id)).not.toContain(a);
      expect(second.map((e) => e.id)).not.toContain(b);

      expect((await markOutboxProcessed(trx, [a, b])).map((r) => r.id).sort()).toEqual([a, b].sort());
      expect(await markOutboxProcessed(trx, [a])).toEqual([]);
      expect(await markOutboxProcessed(trx, [])).toEqual([]);
      const third = await claimOutboxEvents(trx, { limit: 500, leaseSeconds: 0 });
      expect(third.map((e) => e.id)).not.toContain(a);
      expect(third.map((e) => e.id)).not.toContain(b);
    });
  });

  test('a failed dispatch keeps the error, pushes the event out, and stops it being claimed now', async () => {
    await withRollback(async (trx) => {
      const id = await insertOutboxEvent(trx, {
        aggregateType: 'waitlist', aggregateId: crypto.randomUUID(), eventType: 'waitlist.schedule_changed', payload: {},
      });
      await claimOutboxEvents(trx, { limit: 500, leaseSeconds: 0 });
      const failed = await markOutboxFailed(trx, { id, error: 'redis timeout', retryAfterSeconds: 600 });
      expect(failed?.attempts).toBe(1);
      expect(failed!.available_at.getTime()).toBeGreaterThan(Date.now() + 500_000);

      const row = await trx.selectFrom('outbox_events').select('last_error').where('id', '=', id).executeTakeFirstOrThrow();
      expect(row.last_error).toBe('redis timeout');

      const next = await claimOutboxEvents(trx, { limit: 500, leaseSeconds: 300 });
      expect(next.map((e) => e.id)).not.toContain(id);
    });
  });
});
