import { describe, expect, test } from 'bun:test';
import { Hono } from 'hono';
import { requireRole } from '../src/middleware/session';
import { errorHandler } from '../src/middleware/error-handler';
import type { Viewer } from '../src/services/account.service';
import type { AppBindings } from '../src/types/env';

/** Probe app: a fake viewer is injected with the peran under test, then requireRole decides. */
function probe(peran: Viewer['peran'] | undefined) {
  const app = new Hono<AppBindings>();
  app.onError(errorHandler);
  app.use('*', async (c, next) => {
    if (peran) c.set('viewer', { id: 'x', email: 'x@y.test', peran, nama: 'X', telepon: null, status: 'active' });
    await next();
  });
  app.get('/farmer-only', requireRole('farmer'), (c) => c.text('ok'));
  app.get('/buyers', requireRole('consumer', 'umkm'), (c) => c.text('ok'));
  return app;
}

describe('requireRole', () => {
  test('admits a petani on a farmer-only route', async () => {
    expect((await probe('petani').request('/farmer-only')).status).toBe(200);
  });

  test('refuses a konsumen on a farmer-only route with 403 forbidden', async () => {
    const res = await probe('konsumen').request('/farmer-only');
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('forbidden');
  });

  test('admits either buyer role on a shared route', async () => {
    expect((await probe('konsumen').request('/buyers')).status).toBe(200);
    expect((await probe('umkm').request('/buyers')).status).toBe(200);
  });

  test('refuses a request with no viewer with 401, not 403', async () => {
    const res = await probe(undefined).request('/farmer-only');
    expect(res.status).toBe(401);
  });

  test('refuses an admin on a buyer route: admin is never implied', async () => {
    expect((await probe('admin').request('/buyers')).status).toBe(403);
  });
});
