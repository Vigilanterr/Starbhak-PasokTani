import { Hono } from 'hono';
import { daftarTungguQuery, idParam } from '../validators/katalog';
import { parseParam, parseQuery } from '../validators/parse';
import { daftarTunggu, detailDaftarTunggu } from '../services/daftar-tunggu.service';
import type { Executor } from '../repo/executor';
import type { AppBindings } from '../types/env';

/** Wait list browsing and detail, public. */
export function daftarTungguRoutes(db: Executor) {
  const app = new Hono<AppBindings>();

  app.get('/waitlists', async (c) => {
    const q = parseQuery(c, daftarTungguQuery);
    return c.json({ success: true, data: await daftarTunggu(db, q) });
  });

  app.get('/waitlists/:id', async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await detailDaftarTunggu(db, id) });
  });

  return app;
}
