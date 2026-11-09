import { pingDatabase } from '../repo/health.repo';
import type { Executor } from '../repo/executor';

/** Returns true when the database answers. Never throws: the route turns false into a 503. */
export async function databaseIsUp(db: Executor): Promise<boolean> {
  try {
    await pingDatabase(db);
    return true;
  } catch {
    return false;
  }
}
