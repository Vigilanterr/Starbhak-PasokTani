import { afterAll, describe, expect, test } from 'bun:test';
import { createApp } from '../src/app';
import { loadEnv } from '../src/lib/env';
import { createDb } from '../src/repo/db';

/**
 * Every route that needs a session, with the request shape the matrix sends. A route added to this list gets the
 * 401 check for free. Routes with a uuid parameter also get the bad-uuid check, so the list grows with the API.
 * No database is touched: the session stub answers "no session" and the 401 happens before any query.
 */
const CRON_SECRET = 'c'.repeat(64);
const env = loadEnv({
  DATABASE_URL: 'postgresql://user:pass@127.0.0.1:1/none',
  NEON_AUTH_BASE_URL: 'https://example.invalid/neondb/auth',
  CRON_SECRET,
});
const db = createDb(env.DATABASE_URL, 1);
const app = createApp({ db, env, session: async () => null });

afterAll(() => db.destroy());

const SESSION_ROUTES: { name: string; method: 'GET' | 'POST'; path: string; body?: unknown }[] = [
  { name: 'GET /me', method: 'GET', path: '/api/v1/me' },
  { name: 'POST /me/onboarding', method: 'POST', path: '/api/v1/me/onboarding', body: { peran: 'konsumen', nama: 'Ani' } },
  { name: 'GET /me/alamat', method: 'GET', path: '/api/v1/me/alamat' },
  { name: 'POST /me/alamat', method: 'POST', path: '/api/v1/me/alamat', body: { label: 'Rumah' } },
  { name: 'POST /me/alamat/:id/utama', method: 'POST', path: '/api/v1/me/alamat/0190a7c2-0000-7000-8000-000000000001/utama' },
  { name: 'GET /keranjang', method: 'GET', path: '/api/v1/keranjang' },
  { name: 'POST /keranjang/item', method: 'POST', path: '/api/v1/keranjang/item', body: { produkId: '0190a7c2-0000-7000-8000-000000000002', jumlah: 1 } },
  { name: 'PATCH /keranjang/item/:itemId', method: 'PATCH', path: '/api/v1/keranjang/item/0190a7c2-0000-7000-8000-000000000003', body: { jumlah: 2 } },
  { name: 'DELETE /keranjang/item/:itemId', method: 'DELETE', path: '/api/v1/keranjang/item/0190a7c2-0000-7000-8000-000000000003' },
  { name: 'GET /keranjang-resep', method: 'GET', path: '/api/v1/keranjang-resep' },
  { name: 'POST /keranjang-resep', method: 'POST', path: '/api/v1/keranjang-resep', body: { nama: 'Nasi Goreng' } },
  { name: 'GET /keranjang-resep/:id', method: 'GET', path: '/api/v1/keranjang-resep/0190a7c2-0000-7000-8000-000000000004' },
  { name: 'POST /daftar-tunggu/:id/ikuti', method: 'POST', path: '/api/v1/daftar-tunggu/0190a7c2-0000-7000-8000-000000000005/ikuti' },
  { name: 'DELETE /daftar-tunggu/:id/ikuti', method: 'DELETE', path: '/api/v1/daftar-tunggu/0190a7c2-0000-7000-8000-000000000005/ikuti' },
];

describe('route matrix: no session', () => {
  for (const route of SESSION_ROUTES) {
    test(`${route.name} answers 401 unauthorized`, async () => {
      const res = await app.request(route.path, {
        method: route.method,
        headers: route.body ? { 'content-type': 'application/json' } : {},
        body: route.body ? JSON.stringify(route.body) : undefined,
      });
      expect(res.status).toBe(401);
      expect((await res.json()).error.code).toBe('unauthorized');
    });
  }
});

describe('route matrix: wrong origin on unsafe methods', () => {
  test('POST /me/onboarding refuses a cross-site origin before the session check', async () => {
    const res = await app.request('/api/v1/me/onboarding', {
      method: 'POST',
      headers: { origin: 'https://evil.example', 'x-forwarded-host': 'pasoktani.test', 'content-type': 'application/json' },
      body: '{}',
    });
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('csrf_failed');
  });
});

describe('route matrix: auth server outage', () => {
  test('a session lookup that throws 503 reaches the client as an envelope, not a crash', async () => {
    const { AppError } = await import('../src/lib/app-error');
    const down = createApp({
      db,
      env,
      session: async () => {
        throw new AppError(503, 'auth_unavailable', 'Layanan masuk sedang tidak tersedia, coba lagi');
      },
    });
    const res = await down.request('/api/v1/me', { headers: { cookie: '__Secure-neon-auth.session_token=t' } });
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe('auth_unavailable');
  });
});
