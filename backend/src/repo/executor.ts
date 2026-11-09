import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import type { Database } from './db';
import { mapDbError } from './errors';

/**
 * What every repo function receives first. A Kysely instance or a Transaction both fit,
 * so services decide where the transaction boundaries are.
 */
export type Executor = Kysely<Database>;

/**
 * Runs fn in a transaction. Errors from fn and from COMMIT (deferred triggers such as the
 * ledger balance and price tier checks fire there) are mapped to typed repo errors.
 */
export async function withTransaction<T>(db: Executor, fn: (trx: Executor) => Promise<T>): Promise<T> {
  try {
    return await db.transaction().execute(fn);
  } catch (error) {
    throw mapDbError(error);
  }
}

/**
 * Guard for repo functions that issue several statements or take row locks.
 * Without a transaction, FOR UPDATE releases immediately and nothing reports it.
 */
export function requireTransaction(db: Executor, fn: string): void {
  if (!db.isTransaction) throw new Error(`${fn} must run inside a transaction`);
}

/**
 * Like withTransaction, and sets app.user_id for the audit triggers.
 * set_config(..., true) is transaction-local, which is required behind the pooler.
 */
export function withActor<T>(db: Executor, userId: string, fn: (trx: Executor) => Promise<T>): Promise<T> {
  return withTransaction(db, async (trx) => {
    await sql`select set_config('app.user_id', ${userId}, true)`.execute(trx);
    return fn(trx);
  });
}
