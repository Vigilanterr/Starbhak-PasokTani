import { createDb } from './repo/db';
import type { AppDeps } from './app';
import type { Env } from './lib/env';

/** Small pool: each Fluid Compute instance serves several requests, and the pooler caps connections. */
const POOL_SIZE = 5;

export function createDeps(env: Env): AppDeps {
  return { env, db: createDb(env.DATABASE_URL, POOL_SIZE) };
}
