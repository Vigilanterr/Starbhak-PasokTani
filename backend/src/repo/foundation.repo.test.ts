import { afterAll, describe, expect, test } from 'bun:test';
import { sql } from 'kysely';
import { closeDb } from './db';
import { CheckViolationError, UniqueViolationError, mapDbError } from './errors';
import { withActor, withTransaction } from './executor';
import { getDb } from './db';
import { numericToNumber, rupiahToNumber } from './money';
import { assertAuthMatchesDatabase, assertSafeBranch, settleDeferred, withRollback } from './test-utils';

afterAll(closeDb);

describe('auth endpoint guard', () => {
  const db = 'postgresql://u:p@ep-round-hat-aznwazqc-pooler.ap-southeast-1.aws.neon.tech/neondb';
  test('accepts auth on the same endpoint as the database', () => {
    expect(() =>
      assertAuthMatchesDatabase({
        DATABASE_URL_UNPOOLED: db,
        NEON_AUTH_BASE_URL: 'https://ep-round-hat-aznwazqc.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth',
      }),
    ).not.toThrow();
  });
  test('refuses auth on a different endpoint', () => {
    expect(() =>
      assertAuthMatchesDatabase({
        DATABASE_URL_UNPOOLED: db,
        NEON_AUTH_BASE_URL: 'https://ep-damp-bird-az8zb4ht.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth',
      }),
    ).toThrow(/ep-damp-bird-az8zb4ht differs from database endpoint ep-round-hat-aznwazqc/);
  });
  test('refuses when an endpoint cannot be read', () => {
    expect(() => assertAuthMatchesDatabase({ DATABASE_URL_UNPOOLED: db })).toThrow(/cannot read the endpoint/);
  });
});

describe('branch guard', () => {
  test('refuses production', () => {
    expect(() => assertSafeBranch({ NEON_BRANCH: 'production' })).toThrow(/production/);
    expect(() => assertSafeBranch({ NEON_BRANCH: ' Production ' })).toThrow(/production/);
  });
  test('refuses an unset branch', () => {
    expect(() => assertSafeBranch({})).toThrow(/NEON_BRANCH is not set/);
  });
  test('accepts a dev branch', () => {
    expect(assertSafeBranch({ NEON_BRANCH: 'chore-schema-v2' })).toBe('chore-schema-v2');
  });
});

describe('smoke', () => {
  test('reads seeded regencies', async () => {
    await withRollback(async (trx) => {
      const row = await trx.selectFrom('regencies').select(({ fn }) => fn.countAll<string>().as('n')).executeTakeFirstOrThrow();
      expect(Number(row.n)).toBe(27);
    });
  });
  test('reads neon_auth."user" through the typed view', async () => {
    await withRollback(async (trx) => {
      const rows = await trx.selectFrom('neon_auth.user').select(['id', 'email']).limit(1).execute();
      expect(Array.isArray(rows)).toBe(true);
    });
  });
});

describe('error mapping', () => {
  test('maps unique violations', async () => {
    await withRollback(async (trx) => {
      const r = await trx.selectFrom('regencies').select('code').limit(1).executeTakeFirstOrThrow();
      const full = await trx.selectFrom('regencies').selectAll().where('code', '=', r.code).executeTakeFirstOrThrow();
      const err = await trx.insertInto('regencies').values(full as never).execute().catch(mapDbError);
      expect(err).toBeInstanceOf(UniqueViolationError);
    });
  });
  test('maps check violations raised in a savepoint-free probe', async () => {
    await withRollback(async (trx) => {
      const err = await sql`select 1 where false`.execute(trx).then(() => null);
      expect(err).toBeNull();
      const bad = await sql`do $$ begin raise exception 'x' using errcode = '23514'; end $$`.execute(trx).catch(mapDbError);
      expect(bad).toBeInstanceOf(CheckViolationError);
    });
  });
  test('passes unknown errors through unchanged', () => {
    const e = new Error('boom');
    expect(mapDbError(e)).toBe(e);
  });
});

describe('transactions', () => {
  test('withActor sets a transaction-local app.user_id', async () => {
    const id = '00000000-0000-0000-0000-000000000001';
    const inside = await withActor(getDb(), id, async (trx) => {
      const r = await sql<{ v: string }>`select current_setting('app.user_id', true) as v`.execute(trx);
      return r.rows[0]!.v;
    });
    expect(inside).toBe(id);
    const after = await sql<{ v: string | null }>`select current_setting('app.user_id', true) as v`.execute(getDb());
    expect(after.rows[0]!.v ?? '').toBe('');
  });
  test('withTransaction rolls back on error', async () => {
    await expect(withTransaction(getDb(), async () => { throw new Error('stop'); })).rejects.toThrow('stop');
  });
  test('settleDeferred runs inside a rolled-back test', async () => {
    await withRollback(async (trx) => { await settleDeferred(trx); });
  });
});

describe('money helpers', () => {
  test('converts safely', () => {
    expect(rupiahToNumber('150000')).toBe(150000);
    expect(() => rupiahToNumber('9007199254740993')).toThrow(RangeError);
    expect(numericToNumber('12.500')).toBe(12.5);
  });
});
