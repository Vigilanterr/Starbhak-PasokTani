import { Hono } from 'hono';
import { idParam } from '../validators/katalog';
import { petaniQuery } from '../validators/katalog';
import { parseParam, parseQuery } from '../validators/parse';
import {
  daftarPetani, daftarTungguPetaniPublik, detailPetani, produkPetani, ulasanPetani,
} from '../services/petani.service';
import type { Executor } from '../repo/executor';
import type { AppBindings } from '../types/env';

/** Farmer directory and profiles, public. */
export function petaniRoutes(db: Executor) {
  const app = new Hono<AppBindings>();

  app.get('/farmers', async (c) => {
    const q = parseQuery(c, petaniQuery);
    return c.json({ success: true, data: await daftarPetani(db, q) });
  });

  app.get('/farmers/:id', async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await detailPetani(db, id) });
  });

  app.get('/farmers/:id/products', async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await produkPetani(db, id) });
  });

  app.get('/farmers/:id/waitlists', async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await daftarTungguPetaniPublik(db, id) });
  });

  app.get('/farmers/:id/reviews', async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await ulasanPetani(db, id) });
  });

  return app;
}
