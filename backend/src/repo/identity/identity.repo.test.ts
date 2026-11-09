import { afterAll, describe, expect, test } from 'bun:test';
import { sql } from 'kysely';
import { closeDb, getDb } from '../db';
import { ForeignKeyViolationError, UniqueViolationError, mapDbError } from '../errors';
import type { Executor } from '../executor';
import { requireTransaction } from '../executor';
import { withRollback } from '../test-utils';
import { findRegencyBySlug, listDistrictsForRegency, listRegencies } from './reference.repo';
import {
  deletePushSubscription, ensureUser, findAddressForUser, findUserById, findUserWithEmail,
  insertAddress, insertMediaAsset, listAddressesForUser, listNotificationPreferences,
  listPushSubscriptions, listStalePendingMedia, markMediaDeleted, markMediaReady,
  markPushSucceeded, markUserOnboarded, markUsersSeen, setDefaultAddress, upsertNotificationPreference,
  upsertPushSubscription,
} from './identity.repo';

afterAll(closeDb);

/** Two real neon_auth.user ids. users.id has a foreign key to them, so fixtures need them. */
async function authIds(trx: Executor, n: number): Promise<string[]> {
  const rows = await trx.selectFrom('neon_auth.user').select('id').orderBy('id').limit(n).execute();
  if (rows.length < n) throw new Error(`need ${n} neon_auth users, found ${rows.length}`);
  return rows.map((r) => r.id);
}

/** First regency and one of its districts, from the seed. */
async function geo(trx: Executor) {
  const regency = (await listRegencies(trx, 1))[0]!;
  const district = (await listDistrictsForRegency(trx, regency.code, 1))[0]!;
  return { regencyCode: regency.code, districtCode: district.code };
}

function addressInput(userId: string, g: { regencyCode: string; districtCode: string }, label = 'Rumah') {
  return {
    userId,
    label,
    recipientName: 'Penerima',
    phone: '+6281234567890',
    regencyCode: g.regencyCode,
    districtCode: g.districtCode,
    street: 'Jl. Sawah 1',
    location: { lng: 107.6, lat: -6.9 },
  };
}

describe('reference data', () => {
  test('lists regencies in code order, with the seeded count', async () => {
    await withRollback(async (trx) => {
      const rows = await listRegencies(trx, 100);
      expect(rows).toHaveLength(27);
      const codes = rows.map((r) => r.code);
      expect(codes).toEqual([...codes].sort());
    });
  });

  test('finds a regency by slug and returns undefined for an unknown one', async () => {
    await withRollback(async (trx) => {
      const [first] = await listRegencies(trx, 1);
      expect(await findRegencyBySlug(trx, first!.slug)).toMatchObject({ code: first!.code });
      expect(await findRegencyBySlug(trx, 'bukan-kota')).toBeUndefined();
    });
  });

  test('lists only the districts of the requested regency', async () => {
    await withRollback(async (trx) => {
      const { regencyCode } = await geo(trx);
      const rows = await listDistrictsForRegency(trx, regencyCode, 500);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.every((r) => r.regency_code === regencyCode)).toBe(true);
    });
  });
});

describe('users', () => {
  test('ensureUser creates the row once and returns the existing row on replay', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      const first = await ensureUser(trx, { id: id!, fullName: 'Pertama', role: 'consumer' });
      const replay = await ensureUser(trx, { id: id!, fullName: 'Lain', role: 'farmer' });
      expect(replay.id).toBe(first.id);
      expect(replay.full_name).toBe('Pertama');
      expect(replay.role).toBe('consumer');
    });
  });

  test('ensureUser rejects an id with no neon_auth.user row', async () => {
    await withRollback(async (trx) => {
      const err = await ensureUser(trx, {
        id: '00000000-0000-7000-8000-000000000999',
        fullName: 'Hantu',
        role: 'consumer',
      }).catch(mapDbError);
      expect(err).toBeInstanceOf(ForeignKeyViolationError);
      expect((err as ForeignKeyViolationError).constraint).toBe('users_id_fkey');
    });
  });

  test('findUserById hides soft-deleted users', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await ensureUser(trx, { id: id!, fullName: 'Hapus', role: 'consumer' });
      expect(await findUserById(trx, id!)).toBeDefined();
      await trx.updateTable('users').set({ deleted_at: sql<Date>`now()` }).where('id', '=', id!).execute();
      expect(await findUserById(trx, id!)).toBeUndefined();
    });
  });

  test('findUserWithEmail reads the email from neon_auth.user', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await ensureUser(trx, { id: id!, fullName: 'Email', role: 'umkm' });
      const row = await findUserWithEmail(trx, id!);
      const auth = await trx.selectFrom('neon_auth.user').select('email').where('id', '=', id!).executeTakeFirstOrThrow();
      expect(row?.email).toBe(auth.email);
    });
  });

  test('markUsersSeen stamps live users, skips soft-deleted ones, and an empty list changes nothing', async () => {
    await withRollback(async (trx) => {
      const [liveId, deletedId] = await authIds(trx, 2);
      await ensureUser(trx, { id: liveId!, fullName: 'Aktif', role: 'consumer' });
      await ensureUser(trx, { id: deletedId!, fullName: 'Terhapus', role: 'consumer' });
      await sql`update users set deleted_at = now() where id = ${deletedId!}::uuid`.execute(trx);

      expect(await markUsersSeen(trx, [])).toBe(0);
      expect(await markUsersSeen(trx, [liveId!, deletedId!])).toBe(1);

      const seen = await trx.selectFrom('users').select(['id', 'last_seen_at'])
        .where('id', 'in', [liveId!, deletedId!]).execute();
      expect(seen.find((u) => u.id === liveId)?.last_seen_at).toBeInstanceOf(Date);
      expect(seen.find((u) => u.id === deletedId)?.last_seen_at).toBeNull();
    });
  });

  test('markUserOnboarded sets onboarded_at once', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await ensureUser(trx, { id: id!, fullName: 'Awal', role: 'farmer' });
      const done = await markUserOnboarded(trx, id!, { fullName: 'Pak Tani', phone: '+6281111111111' });
      expect(done?.onboarded_at).toBeInstanceOf(Date);
      expect(done?.full_name).toBe('Pak Tani');
      expect(await markUserOnboarded(trx, id!, { fullName: 'Ulang', phone: null })).toBeUndefined();
    });
  });
});

describe('addresses', () => {
  test('stores the pin and reads back lng and lat', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      const g = await geo(trx);
      await ensureUser(trx, { id: id!, fullName: 'Alamat', role: 'consumer' });
      const row = await insertAddress(trx, addressInput(id!, g));
      expect(row.lng).toBeCloseTo(107.6, 6);
      expect(row.lat).toBeCloseTo(-6.9, 6);
      expect(row.is_default).toBe(false);
    });
  });

  test('setDefaultAddress moves the default and keeps exactly one', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      const g = await geo(trx);
      await ensureUser(trx, { id: id!, fullName: 'Default', role: 'consumer' });
      const a = await insertAddress(trx, addressInput(id!, g, 'A'));
      const b = await insertAddress(trx, addressInput(id!, g, 'B'));

      await setDefaultAddress(trx, id!, a.id);
      await setDefaultAddress(trx, id!, b.id);

      const rows = await listAddressesForUser(trx, id!, 10);
      expect(rows.filter((r) => r.is_default).map((r) => r.id)).toEqual([b.id]);
      expect(rows[0]!.id).toBe(b.id); // default sorts first
    });
  });

  test('setDefaultAddress refuses another user\'s address and leaves the current default alone', async () => {
    await withRollback(async (trx) => {
      const [owner, other] = await authIds(trx, 2);
      const g = await geo(trx);
      await ensureUser(trx, { id: owner!, fullName: 'Pemilik', role: 'consumer' });
      await ensureUser(trx, { id: other!, fullName: 'Lain', role: 'consumer' });
      const mine = await insertAddress(trx, addressInput(owner!, g, 'Mine'));
      const theirs = await insertAddress(trx, addressInput(other!, g, 'Theirs'));
      await setDefaultAddress(trx, owner!, mine.id);

      expect(await setDefaultAddress(trx, owner!, theirs.id)).toBeUndefined();
      expect((await findAddressForUser(trx, mine.id, owner!))?.is_default).toBe(true);
    });
  });

  test('findAddressForUser is owner-scoped', async () => {
    await withRollback(async (trx) => {
      const [owner, other] = await authIds(trx, 2);
      const g = await geo(trx);
      await ensureUser(trx, { id: owner!, fullName: 'A', role: 'consumer' });
      await ensureUser(trx, { id: other!, fullName: 'B', role: 'consumer' });
      const row = await insertAddress(trx, addressInput(owner!, g));
      expect(await findAddressForUser(trx, row.id, other!)).toBeUndefined();
    });
  });

  test('setDefaultAddress refuses to run outside a transaction', async () => {
    expect(() => requireTransaction(getDb(), 'probe')).toThrow(/must run inside a transaction/);
    await expect(setDefaultAddress(getDb(), '00000000-0000-7000-8000-000000000000', '00000000-0000-7000-8000-000000000000'))
      .rejects.toThrow(/setDefaultAddress must run inside a transaction/);
  });

  test('rejects an address with an unknown district', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      const g = await geo(trx);
      await ensureUser(trx, { id: id!, fullName: 'Kode', role: 'consumer' });
      const err = await insertAddress(trx, { ...addressInput(id!, g), districtCode: '00.00.00' }).catch(mapDbError);
      expect(err).toBeInstanceOf(ForeignKeyViolationError);
      expect((err as ForeignKeyViolationError).constraint).toBe('addresses_district_code_fkey');
    });
  });
});

describe('media', () => {
  test('a pending upload becomes ready once, and only for its owner', async () => {
    await withRollback(async (trx) => {
      const [owner, other] = await authIds(trx, 2);
      await ensureUser(trx, { id: owner!, fullName: 'Foto', role: 'farmer' });
      await ensureUser(trx, { id: other!, fullName: 'Lain', role: 'consumer' });
      const m = await insertMediaAsset(trx, { ownerId: owner!, kind: 'avatar', cloudinaryPublicId: `test/${owner}/a` });
      expect(m.status).toBe('pending');

      const base = { id: m.id, cloudinaryVersion: 1700000000, format: 'jpg', width: 800, height: 600, bytes: 12345 };
      expect(await markMediaReady(trx, { ...base, ownerId: other! })).toBeUndefined();
      const ready = await markMediaReady(trx, { ...base, ownerId: owner! });
      expect(ready?.status).toBe('ready');
      expect(await markMediaReady(trx, { ...base, ownerId: owner! })).toBeUndefined();
    });
  });

  test('taken_on round-trips as the calendar date, not shifted by the timezone', async () => {
    await withRollback(async (trx) => {
      const [owner] = await authIds(trx, 1);
      await ensureUser(trx, { id: owner!, fullName: 'Tanggal', role: 'farmer' });
      const m = await insertMediaAsset(trx, {
        ownerId: owner!, kind: 'land_photo', cloudinaryPublicId: `test/${owner}/tgl`, takenOn: '2026-11-08',
      });
      expect(m.taken_on).toBe('2026-11-08');
    });
  });

  test('rejects a duplicate Cloudinary public id', async () => {
    await withRollback(async (trx) => {
      const [owner] = await authIds(trx, 1);
      await ensureUser(trx, { id: owner!, fullName: 'Dup', role: 'farmer' });
      const id = `test/${owner}/dup`;
      await insertMediaAsset(trx, { ownerId: owner!, kind: 'product_photo', cloudinaryPublicId: id });
      const err = await insertMediaAsset(trx, { ownerId: owner!, kind: 'product_photo', cloudinaryPublicId: id }).catch(mapDbError);
      expect(err).toBeInstanceOf(UniqueViolationError);
      expect((err as UniqueViolationError).constraint).toBe('media_assets_cloudinary_public_id_key');
    });
  });

  test('the cleanup list finds only pending uploads older than 24 hours, and markMediaDeleted retires them', async () => {
    await withRollback(async (trx) => {
      const [owner] = await authIds(trx, 1);
      await ensureUser(trx, { id: owner!, fullName: 'Bersih', role: 'farmer' });
      const old = await insertMediaAsset(trx, { ownerId: owner!, kind: 'waitlist_photo', cloudinaryPublicId: `test/${owner}/old` });
      const fresh = await insertMediaAsset(trx, { ownerId: owner!, kind: 'waitlist_photo', cloudinaryPublicId: `test/${owner}/new` });
      await trx.updateTable('media_assets')
        .set({ created_at: sql<Date>`now() - interval '25 hours'` })
        .where('id', '=', old.id)
        .execute();

      const stale = (await listStalePendingMedia(trx, 1000)).map((r) => r.id);
      expect(stale).toContain(old.id);
      expect(stale).not.toContain(fresh.id);

      expect(await markMediaDeleted(trx, [old.id])).toEqual([old.id]);
      expect(await markMediaDeleted(trx, [])).toEqual([]);
      expect((await listStalePendingMedia(trx, 1000)).map((r) => r.id)).not.toContain(old.id);
    });
  });
});

describe('notifications and push', () => {
  test('a preference upsert replaces the earlier choice', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await ensureUser(trx, { id: id!, fullName: 'Notif', role: 'consumer' });
      await upsertNotificationPreference(trx, { userId: id!, category: 'chat', webEnabled: true, frequency: 'instant' });
      await upsertNotificationPreference(trx, { userId: id!, category: 'chat', webEnabled: false, frequency: 'daily_digest' });
      const rows = await listNotificationPreferences(trx, id!, 10);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ web_enabled: false, frequency: 'daily_digest' });
    });
  });

  test('a push endpoint is stored once, and a replay updates its keys', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await ensureUser(trx, { id: id!, fullName: 'Push', role: 'consumer' });
      const endpoint = `https://push.example.test/${id}`;
      const first = await upsertPushSubscription(trx, { userId: id!, endpoint, p256dh: 'k1', auth: 'a1' });
      const again = await upsertPushSubscription(trx, { userId: id!, endpoint, p256dh: 'k2', auth: 'a2' });
      expect(again.id).toBe(first.id);
      expect(again.p256dh).toBe('k2');
      expect(await listPushSubscriptions(trx, id!, 10)).toHaveLength(1);
    });
  });

  test('markPushSucceeded stamps last_success_at and deletePushSubscription is owner-scoped', async () => {
    await withRollback(async (trx) => {
      const [owner, other] = await authIds(trx, 2);
      await ensureUser(trx, { id: owner!, fullName: 'Dua', role: 'consumer' });
      await ensureUser(trx, { id: other!, fullName: 'Tiga', role: 'consumer' });
      const endpoint = `https://push.example.test/${owner}/x`;
      const s = await upsertPushSubscription(trx, { userId: owner!, endpoint, p256dh: 'k', auth: 'a' });
      expect((await markPushSucceeded(trx, s.id))?.last_success_at).toBeInstanceOf(Date);
      expect(await deletePushSubscription(trx, other!, endpoint)).toBeUndefined();
      expect(await deletePushSubscription(trx, owner!, endpoint)).toEqual({ id: s.id });
    });
  });

  test('rejects a push subscription for an unknown user', async () => {
    await withRollback(async (trx) => {
      const err = await upsertPushSubscription(trx, {
        userId: '00000000-0000-7000-8000-000000000999',
        endpoint: 'https://push.example.test/ghost',
        p256dh: 'k',
        auth: 'a',
      }).catch(mapDbError);
      expect(err).toBeInstanceOf(ForeignKeyViolationError);
      expect((err as ForeignKeyViolationError).constraint).toBe('push_subscriptions_user_id_fkey');
    });
  });
});
