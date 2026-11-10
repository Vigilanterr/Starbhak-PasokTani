import { afterAll, describe, expect, test } from 'bun:test';
import { CompiledQuery, sql } from 'kysely';
import { closeDb, getDb } from '../db';
import { CheckViolationError, ExclusionViolationError, UniqueViolationError, mapDbError } from '../errors';
import type { Executor } from '../executor';
import { point, withinMeters } from '../geo';
import { withRollback } from '../test-utils';
import { ensureUser, insertMediaAsset } from '../identity/identity.repo';
import { listDistrictsForRegency, listRegencies } from '../identity/reference.repo';
import {
  awardBadge, decideVerification, deleteHoliday, ensureFarmerProfile, findBadgeByCode,
  findFarmerProfile, insertBankAccount, insertHoliday, listActiveBadgesForFarmer,
  listBadgeChanges, listBankAccounts, listFarmersNear, listOperatingHours, listPendingVerifications,
  listUpcomingHolidays, replaceOperatingHours, revokeBadge, setPrimaryBankAccount,
  submitVerification, updateFarmerProfile,
} from './farmers.repo';

afterAll(closeDb);

/** Real neon_auth.user ids. users.id has a foreign key to them. */
async function authIds(trx: Executor, n: number): Promise<string[]> {
  const rows = await trx.selectFrom('neon_auth.user').select('id').orderBy('id').limit(n).execute();
  if (rows.length < n) throw new Error(`need ${n} neon_auth users, found ${rows.length}`);
  return rows.map((r) => r.id);
}

async function geo(trx: Executor) {
  const regency = (await listRegencies(trx, 1))[0]!;
  const district = (await listDistrictsForRegency(trx, regency.code, 1))[0]!;
  return { regencyCode: regency.code, districtCode: district.code };
}

/** A farmer user with a profile, ready for farm queries. */
async function newFarmer(trx: Executor, id: string, shop = 'Tani Makmur') {
  await ensureUser(trx, { id, fullName: 'Pak Tani', role: 'farmer' });
  const g = await geo(trx);
  return ensureFarmerProfile(trx, {
    userId: id,
    shopName: shop,
    slug: `toko-${id}`,
    regencyCode: g.regencyCode,
    districtCode: g.districtCode,
  });
}

const KTP_ENC = Buffer.from('ciphertext-test');

describe('farmer profile', () => {
  test('ensureFarmerProfile creates once and keeps the existing shop on replay', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      const first = await newFarmer(trx, id!, 'Pertama');
      const replay = await ensureFarmerProfile(trx, {
        userId: id!,
        shopName: 'Lain',
        slug: `lain-${id}`,
        regencyCode: first.regency_code,
        districtCode: first.district_code,
      });
      expect(replay.shop_name).toBe('Pertama');
      expect(replay.verification_status).toBe('unverified');
    });
  });

  test('rejects a slug that another farmer already uses', async () => {
    await withRollback(async (trx) => {
      const [a, b] = await authIds(trx, 2);
      const first = await newFarmer(trx, a!);
      await ensureUser(trx, { id: b!, fullName: 'Kembar', role: 'farmer' });
      const err = await ensureFarmerProfile(trx, {
        userId: b!,
        shopName: 'Kembar',
        slug: first.slug,
        regencyCode: first.regency_code,
        districtCode: first.district_code,
      }).catch(mapDbError);
      expect(err).toBeInstanceOf(UniqueViolationError);
      expect((err as UniqueViolationError).constraint).toBe('farmer_profiles_slug_key');
    });
  });

  test('updateFarmerProfile stores the farm pin and reads it back as lng and lat', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      const row = await updateFarmerProfile(trx, id!, { location: { lng: 107.6, lat: -6.9 }, addressLine: 'Jl. Sawah 2' });
      expect(row?.lng).toBeCloseTo(107.6, 6);
      expect(row?.lat).toBeCloseTo(-6.9, 6);
      expect(row?.address_line).toBe('Jl. Sawah 2');
    });
  });

  test('an empty patch leaves the profile alone and an unknown farmer returns undefined', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!, 'Utuh');
      expect((await updateFarmerProfile(trx, id!, {}))?.shop_name).toBe('Utuh');
      expect(await updateFarmerProfile(trx, '00000000-0000-7000-8000-000000000999', { shopName: 'Hantu' })).toBeUndefined();
    });
  });

  test('rejects an auto-cancel window outside 12, 24 or 48 hours', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      const err = await updateFarmerProfile(trx, id!, { autoCancelAfterHours: 5 as 12 }).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_auto_cancel_hours');
    });
  });

  test('near-me returns only approved farmers in range, nearest first', async () => {
    await withRollback(async (trx) => {
      const [a, b, c] = await authIds(trx, 3);
      await newFarmer(trx, a!, 'Dekat');
      await newFarmer(trx, b!, 'Agak Jauh');
      await newFarmer(trx, c!, 'Belum Verifikasi');
      await updateFarmerProfile(trx, a!, { location: { lng: 107.6, lat: -6.9 } });
      await updateFarmerProfile(trx, b!, { location: { lng: 107.65, lat: -6.9 } }); // about 5 km east
      await updateFarmerProfile(trx, c!, { location: { lng: 107.6001, lat: -6.9 } });
      await trx.updateTable('farmer_profiles').set({ verification_status: 'approved' })
        .where('user_id', 'in', [a!, b!]).execute();

      const from = { lng: 107.6, lat: -6.9 };
      const near = await listFarmersNear(trx, { from, radiusMeters: 1000, status: 'approved', limit: 50 });
      expect(near.map((r) => r.user_id)).toEqual([a!]);

      const wide = await listFarmersNear(trx, { from, radiusMeters: 10000, status: 'approved', limit: 50 });
      expect(wide.map((r) => r.user_id)).toEqual([a!, b!]);
    });
  });

  // Planner statistics on an empty table decide the real near-me plan, so these two checks use the
  // spatial predicates alone and force the scans that would avoid the GiST index.
  async function planFor(trx: Executor, build: (t: Executor) => { compile(): { sql: string; parameters: readonly unknown[] } }) {
    await sql`select set_config('enable_seqscan', 'off', true), set_config('enable_bitmapscan', 'off', true)`.execute(trx);
    const c = build(trx).compile();
    const plan = await trx.executeQuery(CompiledQuery.raw(`EXPLAIN ${c.sql}`, [...c.parameters]));
    return plan.rows.map((r) => (r as { 'QUERY PLAN': string })['QUERY PLAN']).join('\n');
  }

  test('the nearest-first sort uses the GiST index (KNN)', async () => {
    await withRollback(async (trx) => {
      const plan = await planFor(trx, (t) => t.selectFrom('farmer_profiles')
        .select('user_id')
        .orderBy(sql`location <-> ${point({ lng: 107.6, lat: -6.9 })}`)
        .limit(5));
      expect(plan).toContain('farmer_profiles_location');
    });
  });

  test('the radius filter uses the GiST index', async () => {
    await withRollback(async (trx) => {
      const plan = await planFor(trx, (t) => t.selectFrom('farmer_profiles')
        .select('user_id')
        .where(withinMeters('farmer_profiles.location', { lng: 107.6, lat: -6.9 }, 1000)));
      expect(plan).toContain('farmer_profiles_location');
    });
  });
});

describe('verification', () => {
  test('submit moves the profile to pending, and a second submit writes nothing', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      const ktp = await insertMediaAsset(trx, { ownerId: id!, kind: 'ktp', cloudinaryPublicId: `test/${id}/ktp` });
      const land = await insertMediaAsset(trx, { ownerId: id!, kind: 'land_photo', cloudinaryPublicId: `test/${id}/land` });
      const input = { farmerId: id!, ktpNumberEnc: KTP_ENC, ktpMediaId: ktp.id, landMediaId: land.id };

      const v = await submitVerification(trx, input);
      expect(v).toMatchObject({ farmer_id: id!, status: 'pending' });
      expect((await findFarmerProfile(trx, id!))?.verification_status).toBe('pending');
      expect(await submitVerification(trx, input)).toBeUndefined();
    });
  });

  test('submit refuses to run outside a transaction', async () => {
    await expect(submitVerification(getDb(), {
      farmerId: '00000000-0000-7000-8000-000000000000',
      ktpNumberEnc: KTP_ENC,
      ktpMediaId: '00000000-0000-7000-8000-000000000000',
      landMediaId: '00000000-0000-7000-8000-000000000000',
    })).rejects.toThrow(/submitVerification must run inside a transaction/);
  });

  test('approval copies to the profile, is decided once, and then blocks a new submit', async () => {
    await withRollback(async (trx) => {
      const [farmer, admin] = await authIds(trx, 2);
      await newFarmer(trx, farmer!);
      await ensureUser(trx, { id: admin!, fullName: 'Admin', role: 'consumer' });
      await trx.updateTable('users').set({ role: 'admin' }).where('id', '=', admin!).execute();
      const ktp = await insertMediaAsset(trx, { ownerId: farmer!, kind: 'ktp', cloudinaryPublicId: `test/${farmer}/k` });
      const land = await insertMediaAsset(trx, { ownerId: farmer!, kind: 'land_photo', cloudinaryPublicId: `test/${farmer}/l` });
      const v = (await submitVerification(trx, { farmerId: farmer!, ktpNumberEnc: KTP_ENC, ktpMediaId: ktp.id, landMediaId: land.id }))!;

      const decided = await decideVerification(trx, { verificationId: v.id, reviewerId: admin!, decision: 'approved' });
      expect(decided?.status).toBe('approved');
      const profile = await findFarmerProfile(trx, farmer!);
      expect(profile?.verification_status).toBe('approved');
      expect(profile?.verified_at).toBeInstanceOf(Date);

      expect(await decideVerification(trx, { verificationId: v.id, reviewerId: admin!, decision: 'rejected' })).toBeUndefined();
      expect(await submitVerification(trx, { farmerId: farmer!, ktpNumberEnc: KTP_ENC, ktpMediaId: ktp.id, landMediaId: land.id })).toBeUndefined();
    });
  });

  test('rejection keeps the reason and lets the farmer submit again', async () => {
    await withRollback(async (trx) => {
      const [farmer, admin] = await authIds(trx, 2);
      await newFarmer(trx, farmer!);
      await ensureUser(trx, { id: admin!, fullName: 'Peninjau', role: 'consumer' });
      const ktp = await insertMediaAsset(trx, { ownerId: farmer!, kind: 'ktp', cloudinaryPublicId: `test/${farmer}/rk` });
      const land = await insertMediaAsset(trx, { ownerId: farmer!, kind: 'land_photo', cloudinaryPublicId: `test/${farmer}/rl` });
      const v = (await submitVerification(trx, { farmerId: farmer!, ktpNumberEnc: KTP_ENC, ktpMediaId: ktp.id, landMediaId: land.id }))!;
      await decideVerification(trx, { verificationId: v.id, reviewerId: admin!, decision: 'rejected', reason: 'KTP buram' });
      expect((await findFarmerProfile(trx, farmer!))?.verification_status).toBe('rejected');
      expect(await submitVerification(trx, { farmerId: farmer!, ktpNumberEnc: KTP_ENC, ktpMediaId: ktp.id, landMediaId: land.id }))
        .toMatchObject({ status: 'pending' });
    });
  });

  test('the admin queue lists only pending submissions, oldest id first', async () => {
    await withRollback(async (trx) => {
      const [a, b] = await authIds(trx, 2);
      await newFarmer(trx, a!, 'Antre Satu');
      await newFarmer(trx, b!, 'Antre Dua');
      const mk = async (id: string) => {
        const ktp = await insertMediaAsset(trx, { ownerId: id, kind: 'ktp', cloudinaryPublicId: `test/${id}/q-k` });
        const land = await insertMediaAsset(trx, { ownerId: id, kind: 'land_photo', cloudinaryPublicId: `test/${id}/q-l` });
        return (await submitVerification(trx, { farmerId: id, ktpNumberEnc: KTP_ENC, ktpMediaId: ktp.id, landMediaId: land.id }))!;
      };
      const first = await mk(a!);
      const second = await mk(b!);
      const ids = (await listPendingVerifications(trx, null, 1000)).map((r) => r.id);
      expect(ids.indexOf(first.id)).toBeLessThan(ids.indexOf(second.id));
      const page = await listPendingVerifications(trx, first.id, 1000);
      expect(page.map((r) => r.id)).not.toContain(first.id);
    });
  });
});

describe('bank accounts', () => {
  test('only one primary account, and the switch never shows the encrypted number', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      const first = await insertBankAccount(trx, {
        farmerId: id!, bankCode: 'BCA', accountNumberEnc: KTP_ENC, accountNumberLast4: '1234',
        accountHolderName: 'Pak Tani', isPrimary: true,
      });
      const second = await insertBankAccount(trx, {
        farmerId: id!, bankCode: 'BRI', accountNumberEnc: KTP_ENC, accountNumberLast4: '5678', accountHolderName: 'Pak Tani',
      });

      const moved = await setPrimaryBankAccount(trx, id!, second.id);
      expect(moved?.is_primary).toBe(true);

      const rows = await listBankAccounts(trx, id!, 10);
      expect(rows.filter((r) => r.is_primary).map((r) => r.id)).toEqual([second.id]);
      expect(rows.find((r) => r.id === first.id)?.is_primary).toBe(false);
      for (const r of rows) expect(Object.keys(r)).not.toContain('account_number_enc');
    });
  });

  test('a second primary account is rejected by the partial unique index', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      await insertBankAccount(trx, {
        farmerId: id!, bankCode: 'BCA', accountNumberEnc: KTP_ENC, accountNumberLast4: '1111',
        accountHolderName: 'Pak Tani', isPrimary: true,
      });
      const err = await insertBankAccount(trx, {
        farmerId: id!, bankCode: 'BRI', accountNumberEnc: KTP_ENC, accountNumberLast4: '2222',
        accountHolderName: 'Pak Tani', isPrimary: true,
      }).catch(mapDbError);
      expect(err).toBeInstanceOf(UniqueViolationError);
      expect((err as UniqueViolationError).constraint).toBe('bank_accounts_one_primary');
    });
  });

  test('setPrimaryBankAccount refuses another farmer\'s account', async () => {
    await withRollback(async (trx) => {
      const [owner, other] = await authIds(trx, 2);
      await newFarmer(trx, owner!);
      await newFarmer(trx, other!, 'Lain');
      const theirs = await insertBankAccount(trx, {
        farmerId: other!, bankCode: 'BJB', accountNumberEnc: KTP_ENC, accountNumberLast4: '9999', accountHolderName: 'Lain',
      });
      expect(await setPrimaryBankAccount(trx, owner!, theirs.id)).toBeUndefined();
    });
  });
});

describe('operating hours', () => {
  test('replacing the week keeps only the new rows', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      await replaceOperatingHours(trx, id!, [
        { weekday: 1, opensAt: '07:00', closesAt: '15:00' },
        { weekday: 6, opensAt: '07:00', closesAt: '12:00' },
      ]);
      await replaceOperatingHours(trx, id!, [{ weekday: 0, opensAt: '08:00', closesAt: '10:00' }]);
      const rows = await listOperatingHours(trx, id!, 7);
      expect(rows.map((r) => r.weekday)).toEqual([0]);
    });
  });

  test('an empty list clears the week', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      await replaceOperatingHours(trx, id!, [{ weekday: 2, opensAt: '07:00', closesAt: '15:00' }]);
      expect(await replaceOperatingHours(trx, id!, [])).toEqual([]);
      expect(await listOperatingHours(trx, id!, 7)).toEqual([]);
    });
  });

  test('rejects closing before opening', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      const err = await replaceOperatingHours(trx, id!, [{ weekday: 3, opensAt: '15:00', closesAt: '07:00' }]).catch(mapDbError);
      expect(err).toBeInstanceOf(CheckViolationError);
      expect((err as CheckViolationError).constraint).toBe('chk_hours_order');
    });
  });
});

describe('holidays', () => {
  test('overlapping holidays are rejected by the temporal constraint', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      await insertHoliday(trx, { farmerId: id!, from: '2030-01-01', to: '2030-01-05' });
      const err = await insertHoliday(trx, { farmerId: id!, from: '2030-01-05', to: '2030-01-10' }).catch(mapDbError);
      expect(err).toBeInstanceOf(ExclusionViolationError);
      expect((err as ExclusionViolationError).constraint).toBe('farmer_holidays_no_overlap');
    });
  });

  test('upcoming holidays use inclusive dates and hide ones that already ended', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      const future = await insertHoliday(trx, { farmerId: id!, from: '2030-03-01', to: '2030-03-03', note: 'Lebaran' });
      await insertHoliday(trx, { farmerId: id!, from: '2001-03-01', to: '2001-03-03' });
      const rows = await listUpcomingHolidays(trx, id!, 50);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ id: future.id, starts_on: '2030-03-01', ends_on: '2030-03-03', note: 'Lebaran' });
    });
  });

  test('deleting a holiday is owner-scoped', async () => {
    await withRollback(async (trx) => {
      const [owner, other] = await authIds(trx, 2);
      await newFarmer(trx, owner!);
      await newFarmer(trx, other!, 'Lain');
      const h = await insertHoliday(trx, { farmerId: owner!, from: '2030-06-01', to: '2030-06-01' });
      expect(await deleteHoliday(trx, other!, h.id)).toBeUndefined();
      expect(await deleteHoliday(trx, owner!, h.id)).toEqual({ id: h.id });
    });
  });
});

describe('badges', () => {
  test('an award is idempotent while active, and a revoked badge can be awarded again', async () => {
    await withRollback(async (trx) => {
      const [id] = await authIds(trx, 1);
      await newFarmer(trx, id!);
      const badge = (await findBadgeByCode(trx, 'new_farmer'))!;

      const first = await awardBadge(trx, { farmerId: id!, badgeId: badge.id, evaluationPeriod: '2026-11-01' });
      expect(first).toBeDefined();
      expect(await awardBadge(trx, { farmerId: id!, badgeId: badge.id, evaluationPeriod: '2026-11-01' })).toBeUndefined();

      const active = await listActiveBadgesForFarmer(trx, id!, 20);
      expect(active).toHaveLength(1);
      expect(active[0]).toMatchObject({ code: 'new_farmer', evaluation_period: '2026-11-01' });

      expect(await revokeBadge(trx, { farmerBadgeId: first!.id, reason: 'tidak aktif' })).toMatchObject({ id: first!.id });
      expect(await revokeBadge(trx, { farmerBadgeId: first!.id, reason: 'ulang' })).toBeUndefined();
      expect(await listActiveBadgesForFarmer(trx, id!, 20)).toHaveLength(0);

      expect(await awardBadge(trx, { farmerId: id!, badgeId: badge.id, evaluationPeriod: '2026-12-01' })).toBeDefined();
    });
  });

  test('badge changes list the awards and revokes a rerun would find, and nothing once applied', async () => {
    await withRollback(async (trx) => {
      const [good, weak, gone] = await authIds(trx, 3) as [string, string, string];
      for (const id of [good, weak, gone]) await newFarmer(trx, id);
      const code = `uji_${crypto.randomUUID().replaceAll('-', '_')}`;
      const badge = await trx.insertInto('badges')
        .values({ code, name: 'Uji', criteria: JSON.stringify({ min_completed_orders: 5, min_rating_avg: 4.5 }) })
        .returning('id').executeTakeFirstOrThrow();
      await sql`update farmer_profiles set completed_order_count = 6, rating_avg = 4.8 where user_id = any(${[good, gone]}::uuid[])`.execute(trx);
      await sql`update farmer_profiles set completed_order_count = 6, rating_avg = 4.0 where user_id = ${weak}::uuid`.execute(trx);
      const mine = async () => (await listBadgeChanges(trx, { code, afterFarmerId: null, limit: 10_000 }))!
        .filter((c) => [good, weak, gone].includes(c.farmer_id));

      expect((await mine()).map((c) => [c.farmer_id, c.action]).sort()).toEqual([[gone, 'award'], [good, 'award']].sort());

      const held = await awardBadge(trx, { farmerId: gone, badgeId: badge.id, evaluationPeriod: '2026-11-01' });
      await awardBadge(trx, { farmerId: good, badgeId: badge.id, evaluationPeriod: '2026-11-01' });
      await sql`update users set deleted_at = now() where id = ${gone}::uuid`.execute(trx);
      await awardBadge(trx, { farmerId: weak, badgeId: badge.id, evaluationPeriod: '2026-10-01' });

      const changes = await mine();
      expect(changes.map((c) => [c.farmer_id, c.action]).sort()).toEqual([[gone, 'revoke'], [weak, 'revoke']].sort());
      expect(changes.find((c) => c.farmer_id === gone)!.farmer_badge_id).toBe(held!.id);

      for (const c of changes) await revokeBadge(trx, { farmerBadgeId: c.farmer_badge_id!, reason: 'tidak lagi memenuhi' });
      expect(await mine()).toEqual([]);
    });
  });

  test('badge changes page by farmer id and return limit + 1', async () => {
    await withRollback(async (trx) => {
      const ids = await authIds(trx, 3);
      for (const id of ids) await newFarmer(trx, id);
      const code = `uji_${crypto.randomUUID().replaceAll('-', '_')}`;
      await trx.insertInto('badges').values({ code, name: 'Halaman', criteria: JSON.stringify({ max_age_days: 1 }) }).execute();
      const all = (await listBadgeChanges(trx, { code, afterFarmerId: null, limit: 10_000 }))!.map((c) => c.farmer_id);
      expect(ids.every((id) => all.includes(id))).toBe(true);
      const first = (await listBadgeChanges(trx, { code, afterFarmerId: null, limit: 2 }))!;
      expect(first).toHaveLength(3);
      const second = (await listBadgeChanges(trx, { code, afterFarmerId: first[1]!.farmer_id, limit: 2 }))!;
      expect(second[0]!.farmer_id).toBe(first[2]!.farmer_id);
      expect(second[0]!.farmer_id).not.toBe(first[1]!.farmer_id);
    });
  });

  test('badge changes refuse unusable criteria and skip unknown or manual badges', async () => {
    await withRollback(async (trx) => {
      const mk = (criteria: unknown, extra: object = {}) => {
        const code = `uji_${crypto.randomUUID().replaceAll('-', '_')}`;
        return trx.insertInto('badges').values({ code, name: 'x', criteria: JSON.stringify(criteria), ...extra }).execute().then(() => code);
      };
      const run = (code: string) => listBadgeChanges(trx, { code, afterFarmerId: null, limit: 1 });
      await expect(run(await mk({}))).rejects.toThrow(/criteria is empty/);
      await expect(run(await mk({ min_completed_ordres: 5 }))).rejects.toThrow(/unknown criterion min_completed_ordres/);
      await expect(run(await mk({ min_rating_avg: '4.5' }))).rejects.toThrow(/non-negative number/);
      await expect(run(await mk({ verified: false }))).rejects.toThrow(/verified must be true/);
      expect(await run(await mk({ verified: true }, { is_automatic: false }))).toBeUndefined();
      expect(await run(await mk({ verified: true }, { is_active: false }))).toBeUndefined();
      expect(await run(`tidak_ada_${crypto.randomUUID()}`)).toBeUndefined();
    });
  });
});
