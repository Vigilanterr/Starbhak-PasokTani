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

/** Neon endpoint id (`ep-…`) from a Postgres or Neon Auth host, or undefined when the host has none. */
function endpointOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const host = new URL(url).hostname;
    return host.match(/^(ep-[a-z0-9-]+?)(?:-pooler)?\./)?.[1];
  } catch {
    return undefined;
  }
}

/**
 * Refuses to run when Neon Auth and the database point at different endpoints.
 * Sign-ups would land on one branch while users.id foreign keys point at the other.
 */
export function assertAuthMatchesDatabase(env: Record<string, string | undefined> = process.env): void {
  const db = endpointOf(env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL);
  const auth = endpointOf(env.NEON_AUTH_BASE_URL);
  if (!db || !auth) {
    throw new Error('Refusing to run repo tests: cannot read the endpoint from DATABASE_URL or NEON_AUTH_BASE_URL');
  }
  if (db !== auth) {
    throw new Error(`Refusing to run repo tests: auth endpoint ${auth} differs from database endpoint ${db}`);
  }
}

class Rollback extends Error {}

/**
 * Runs fn in a transaction and always rolls it back.
 * Deferred triggers only fire at COMMIT, so call settleDeferred(trx) to fire them inside the test.
 */
export async function withRollback(fn: (trx: Executor) => Promise<void>): Promise<void> {
  assertSafeBranch();
  assertAuthMatchesDatabase();
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
