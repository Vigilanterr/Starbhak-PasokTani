import { sql } from 'kysely';
import { closeDb, getDb } from './db';
import type { Executor } from './executor';
import { mapDbError } from './errors';

/**
 * Refuses to run against production or an unnamed branch.
 * `env` is a parameter so a test can prove the guard without touching process.env.
 */
export function assertSafeBranch(env: Record<string, string | undefined> = process.env): string {
  const branch = env.NEON_BRANCH?.trim();
  if (!branch) throw new Error('Refusing to run repo tests: NEON_BRANCH is not set');
  if (branch.toLowerCase() === 'production') {
    throw new Error('Refusing to run repo tests against the production branch');
  }
  return branch;
}

class Rollback extends Error {}

/**
 * Runs fn in a transaction and always rolls it back.
 * Deferred triggers only fire at COMMIT, so call settleDeferred(trx) to fire them inside the test.
 */
export async function withRollback(fn: (trx: Executor) => Promise<void>): Promise<void> {
  assertSafeBranch();
  try {
    await getDb()
      .transaction()
      .execute(async (trx) => {
        await fn(trx);
        throw new Rollback();
      });
  } catch (error) {
    if (error instanceof Rollback) return;
    throw mapDbError(error);
  }
}

/** Fires deferred constraints and triggers now, so a test can assert the typed error. */
export async function settleDeferred(trx: Executor): Promise<void> {
  await sql`SET CONSTRAINTS ALL IMMEDIATE`.execute(trx);
}

export { closeDb };
