import { afterAll, expect, test } from 'bun:test';
import { createApp } from '../src/app';
import { loadEnv } from '../src/lib/env';
import { createDb } from '../src/repo/db';

// Runs only when scripts/test-api.sh sets API_TEST_DATABASE_URL (the api-test branch).
const liveUrl = process.env.API_TEST_DATABASE_URL;

const CRON_SECRET = 'c'.repeat(64);
const db = liveUrl ? createDb(liveUrl, 2) : undefined;

afterAll(async () => {
  await db?.destroy();
});

(liveUrl ? test : test.skip)('health returns 200 when the api-test branch answers', async () => {
  const env = loadEnv({
    DATABASE_URL: liveUrl,
    NEON_AUTH_BASE_URL: 'https://example.invalid/neondb/auth',
    CRON_SECRET,
  });
  const app = createApp({ db: db!, env });
  const res = await app.request('/api/v1/health');
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ success: true, data: { status: 'ok', database: 'ok' } });
});
