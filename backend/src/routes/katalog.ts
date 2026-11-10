import { Hono } from 'hono';
import { cariQuery, idParam, produkQuery, slugParam } from '../validators/katalog';
import { parseParam, parseQuery } from '../validators/parse';
import {
  beranda, cariProduk, daftarKategori, daftarProduk, daftarWilayah, detailKategori, detailProduk,
  kecamatanWilayah, produkTerkait, ulasanProduk,
} from '../services/katalog.service';
import type { Executor } from '../repo/executor';
import type { AppBindings } from '../types/env';

/** Public catalog reads. No session: anyone can browse. Mounted under /api/v1. */
export function katalogRoutes(db: Executor) {
  const app = new Hono<AppBindings>();

  app.get('/categories', async (c) => c.json({ success: true, data: await daftarKategori(db) }));

  app.get('/categories/:slug', async (c) => {
    const slug = parseParam(c.req.param('slug'), slugParam, 'slug');
    return c.json({ success: true, data: await detailKategori(db, slug) });
  });

  app.get('/regions', async (c) => c.json({ success: true, data: await daftarWilayah(db) }));

  app.get('/regions/:slug/districts', async (c) => {
    const slug = parseParam(c.req.param('slug'), slugParam, 'slug');
    return c.json({ success: true, data: await kecamatanWilayah(db, slug) });
  });

  app.get('/products', async (c) => {
    const q = parseQuery(c, produkQuery);
    return c.json({ success: true, data: await daftarProduk(db, q) });
  });

  app.get('/products/:slug', async (c) => {
    const slug = parseParam(c.req.param('slug'), slugParam, 'slug');
    return c.json({ success: true, data: await detailProduk(db, slug) });
  });

  app.get('/products/:id/related', async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await produkTerkait(db, id) });
  });

  app.get('/products/:id/reviews', async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await ulasanProduk(db, id) });
  });

  /** Search. `teks` is the trimmed `q`; the filters are the same as /products. */
  app.get('/search', async (c) => {
    const q = parseQuery(c, cariQuery);
    return c.json({ success: true, data: await cariProduk(db, q.teks, q) });
  });

  app.get('/home', async (c) => c.json({ success: true, data: await beranda(db) }));

  return app;
}
