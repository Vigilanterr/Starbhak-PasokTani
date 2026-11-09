import { afterAll, describe, expect, test } from 'bun:test';
import { Hono } from 'hono';
import { createApp } from '../src/app';
import { AppError } from '../src/lib/app-error';
import { loadEnv } from '../src/lib/env';
import { errorHandler } from '../src/middleware/error-handler';
import { createDb } from '../src/repo/db';
import { CheckViolationError } from '../src/repo/errors';
import type { AppBindings } from '../src/types/env';

// No database is needed for these tests. The pool is pointed at a closed port, so any
// query fails fast, which is what the health and 503 tests rely on.
const CRON_SECRET = 'c'.repeat(64);
const noSession = async () => null;
const env = loadEnv({
  DATABASE_URL: 'postgresql://user:pass@127.0.0.1:1/none',
  NEON_AUTH_BASE_URL: 'https://example.invalid/neondb/auth',
  CRON_SECRET,
});
const db = createDb(env.DATABASE_URL, 1);
const app = createApp({ db, env, session: noSession });

afterAll(async () => {
  await db.destroy();
});

const cron = (job: string, auth?: string) =>
  app.request(`/api/cron/${job}`, {
    method: 'POST',
    headers: auth ? { authorization: auth } : {},
  });

describe('loadEnv', () => {
  const valid = {
    DATABASE_URL: 'postgresql://u:p@h/db',
    NEON_AUTH_BASE_URL: 'https://example.invalid/auth',
    CRON_SECRET: 'x'.repeat(32),
  };

  test('accepts a complete environment', () => {
    expect(loadEnv(valid).CRON_SECRET).toHaveLength(32);
  });

  test('refuses a missing CRON_SECRET, with no fallback', () => {
    const { CRON_SECRET: _omit, ...rest } = valid;
    expect(() => loadEnv(rest)).toThrow(/CRON_SECRET/);
  });

  test('refuses a short CRON_SECRET', () => {
    expect(() => loadEnv({ ...valid, CRON_SECRET: 'short' })).toThrow(/at least 32/);
  });

  test('refuses a DATABASE_URL that is not a Postgres URL', () => {
    expect(() => loadEnv({ ...valid, DATABASE_URL: 'mysql://x' })).toThrow(/DATABASE_URL/);
  });
});

describe('cron route', () => {
  test('rejects a request with no secret', async () => {
    const res = await cron('auto-cancel');
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthorized');
  });

  test('rejects a wrong secret of the same length', async () => {
    const res = await cron('auto-cancel', `Bearer ${'d'.repeat(64)}`);
    expect(res.status).toBe(401);
  });

  test('rejects a secret sent without the Bearer prefix', async () => {
    const res = await cron('auto-cancel', CRON_SECRET);
    expect(res.status).toBe(401);
  });

  test('returns 404 for a job the registry does not know', async () => {
    const res = await cron('no-such-job', `Bearer ${CRON_SECRET}`);
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('job_not_found');
  });

  test('returns 200 with skipped true for a named job that is not built yet', async () => {
    const res = await cron('auto-cancel', `Bearer ${CRON_SECRET}`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: { job: 'auto-cancel', skipped: true } });
  });
});

describe('origin check', () => {
  const post = (origin: string | undefined, host = 'pasoktani.test') =>
    app.request('/api/v1/health', {
      method: 'POST',
      headers: {
        ...(origin ? { origin } : {}),
        'x-forwarded-host': host,
      },
    });

  test('rejects a cross-site origin on an unsafe method', async () => {
    const res = await post('https://evil.example');
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('csrf_failed');
  });

  test('allows the same host as the forwarded request host', async () => {
    const res = await post('https://pasoktani.test');
    expect(res.status).not.toBe(403);
  });

  test('allows a request with no Origin header (server to server)', async () => {
    const res = await post(undefined);
    expect(res.status).not.toBe(403);
  });

  test('does not apply to safe methods', async () => {
    const res = await app.request('/api/v1/health', { headers: { origin: 'https://evil.example' } });
    expect(res.status).not.toBe(403);
  });

  test('does not apply to cron, which is called by GitHub Actions', async () => {
    const res = await app.request('/api/cron/auto-cancel', {
      method: 'POST',
      headers: { origin: 'https://evil.example', authorization: `Bearer ${CRON_SECRET}` },
    });
    expect(res.status).toBe(200);
  });
});

describe('request id', () => {
  test('echoes a safe incoming id', async () => {
    const res = await app.request('/api/cron/auto-cancel', {
      method: 'POST',
      headers: { 'x-request-id': 'abc-12345678', authorization: `Bearer ${CRON_SECRET}` },
    });
    expect(res.headers.get('x-request-id')).toBe('abc-12345678');
  });

  test('replaces an unsafe incoming id with a generated one', async () => {
    const res = await app.request('/api/cron/auto-cancel', {
      method: 'POST',
      headers: { 'x-request-id': 'bad id with spaces', authorization: `Bearer ${CRON_SECRET}` },
    });
    const id = res.headers.get('x-request-id');
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('health', () => {
  test('returns 503 db_unavailable when the database cannot be reached', async () => {
    const res = await app.request('/api/v1/health');
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe('db_unavailable');
  });
});

describe('unknown routes', () => {
  test('return a JSON 404 envelope', async () => {
    const res = await app.request('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('route_not_found');
  });
});

describe('error handler', () => {
  const probe = new Hono<AppBindings>();
  probe.onError(errorHandler);
  probe.get('/app-error', () => {
    throw new AppError(409, 'state_conflict', 'Status saat ini tidak mengizinkan aksi ini');
  });
  probe.get('/quota', () => {
    throw new CheckViolationError('check failed', undefined, 'chk_quota_not_exceeded');
  });
  probe.get('/unlisted', () => {
    throw new CheckViolationError('check failed', undefined, 'chk_something_else');
  });
  probe.get('/boom', () => {
    throw new Error('SELECT * FROM secret_table failed');
  });

  test('maps an AppError to its status and code', async () => {
    const res = await probe.request('/app-error');
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('state_conflict');
  });

  test('maps a named quota constraint to quota_full', async () => {
    const res = await probe.request('/quota');
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('quota_full');
  });

  test('turns an unlisted constraint into a generic 500 without its name', async () => {
    const res = await probe.request('/unlisted');
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.code).toBe('internal_error');
    expect(JSON.stringify(body)).not.toContain('chk_something_else');
  });

  test('never returns a raw error message for an unknown failure', async () => {
    const res = await probe.request('/boom');
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('secret_table');
  });
});
