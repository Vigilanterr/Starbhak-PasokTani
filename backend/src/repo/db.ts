import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { DB } from './db.generated';
import type { NeonAuthTables } from './neon-auth';

export type Database = DB & NeonAuthTables;

/**
 * Builds a Kysely instance on a pooled connection string.
 * The pooled URL runs behind PgBouncer in transaction mode, so the repo must not use
 * named prepared statements or session state. Use set_config(..., true) in a transaction.
 */
export function createDb(connectionString: string, max = 10) {
  const pool = new Pool({ connectionString, max, connectionTimeoutMillis: 15_000, idleTimeoutMillis: 30_000 });
  return new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });
}

let shared: Kysely<Database> | undefined;

/** Lazily created so importing the repo never needs DATABASE_URL. */
export function getDb(): Kysely<Database> {
  if (!shared) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    shared = createDb(url);
  }
  return shared;
}

export async function closeDb(): Promise<void> {
  if (shared) {
    await shared.destroy();
    shared = undefined;
  }
}
