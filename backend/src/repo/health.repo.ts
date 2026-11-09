import { sql } from 'kysely';
import type { Executor } from './executor';

/** Round trip to the database. Throws when it cannot be reached. */
export async function pingDatabase(db: Executor): Promise<void> {
  await sql`select 1`.execute(db);
}
