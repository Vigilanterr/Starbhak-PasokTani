import { Hono } from 'hono';
import { requireRole, requireSession, requireViewer } from '../middleware/session';
import { idParam } from '../validators/katalog';
import {
  alamatSchema, alternatifSchema, daftarResepQuery, keranjangResepSchema, tambahBarangSchema,
  ubahJumlahSchema, urutanAlternatifSchema,
} from '../validators/pembeli';
import { parseBody, parseParam, parseQuery } from '../validators/parse';
import { daftarAlamat, jadikanAlamatUtama, tambahAlamat } from '../services/alamat.service';
import {
  buatKeranjangResep, daftarKeranjangResep, hapusBarang, hapusKeranjangResep, idKeranjangSementara,
  keranjangById, keranjangSementara, tambahAlternatif, tambahBarang, ubahJumlahBarang, ubahKeranjangResep,
  urutkanAlternatif,
} from '../services/keranjang.service';
import { berhentiIkutiDaftarTunggu, ikutiDaftarTunggu } from '../services/daftar-tunggu.service';
import type { SessionLookup } from '../lib/session';
import type { Executor } from '../repo/executor';
import type { AppBindings } from '../types/env';

export interface PembeliDeps {
  db: Executor;
  session: SessionLookup;
}

/**
 * Buyer routes (Konsumen and UMKM): addresses, carts and wait-list follows. Mounted at /api/v1, so each path
 * spells out its prefix. Every route runs the same three checks in order: a session, an onboarded account, and
 * a buyer role. Producers and admins get 403 here.
 */
export function pembeliRoutes({ db, session }: PembeliDeps) {
  const app = new Hono<AppBindings>();
  const pembeli = [requireSession(session), requireViewer(db), requireRole('consumer', 'umkm')] as const;

  // ---------- Alamat ----------

  app.get('/me/alamat', ...pembeli, async (c) => {
    return c.json({ success: true, data: await daftarAlamat(db, c.get('viewer').id) });
  });

  app.post('/me/alamat', ...pembeli, async (c) => {
    const input = await parseBody(c, alamatSchema);
    return c.json({ success: true, data: await tambahAlamat(db, c.get('viewer').id, input) });
  });

  app.post('/me/alamat/:id/utama', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await jadikanAlamatUtama(db, c.get('viewer').id, id) });
  });

  // ---------- Keranjang Sementara ----------
  // The temporary cart is the buyer's own; its id is resolved here, so the item routes need no cart id.

  app.get('/keranjang', ...pembeli, async (c) => {
    return c.json({ success: true, data: await keranjangSementara(db, c.get('viewer').id) });
  });

  app.post('/keranjang/item', ...pembeli, async (c) => {
    const input = await parseBody(c, tambahBarangSchema);
    const cartId = await idKeranjangSementara(db, c.get('viewer').id);
    return c.json({ success: true, data: await tambahBarang(db, c.get('viewer').id, cartId, input) });
  });

  app.patch('/keranjang/item/:itemId', ...pembeli, async (c) => {
    const itemId = parseParam(c.req.param('itemId'), idParam, 'itemId');
    const input = await parseBody(c, ubahJumlahSchema);
    const cartId = await idKeranjangSementara(db, c.get('viewer').id);
    return c.json({ success: true, data: await ubahJumlahBarang(db, c.get('viewer').id, cartId, itemId, input.jumlah) });
  });

  app.delete('/keranjang/item/:itemId', ...pembeli, async (c) => {
    const itemId = parseParam(c.req.param('itemId'), idParam, 'itemId');
    const cartId = await idKeranjangSementara(db, c.get('viewer').id);
    return c.json({ success: true, data: await hapusBarang(db, c.get('viewer').id, cartId, itemId) });
  });

  app.post('/keranjang/item/:itemId/alternatif', ...pembeli, async (c) => {
    const itemId = parseParam(c.req.param('itemId'), idParam, 'itemId');
    const input = await parseBody(c, alternatifSchema);
    const cartId = await idKeranjangSementara(db, c.get('viewer').id);
    return c.json({ success: true, data: await tambahAlternatif(db, c.get('viewer').id, cartId, itemId, input.produkId) });
  });

  app.put('/keranjang/item/:itemId/alternatif', ...pembeli, async (c) => {
    const itemId = parseParam(c.req.param('itemId'), idParam, 'itemId');
    const input = await parseBody(c, urutanAlternatifSchema);
    const cartId = await idKeranjangSementara(db, c.get('viewer').id);
    return c.json({ success: true, data: await urutkanAlternatif(db, c.get('viewer').id, cartId, itemId, input.urutan) });
  });

  // ---------- Keranjang Resep ----------

  app.get('/keranjang-resep', ...pembeli, async (c) => {
    const q = parseQuery(c, daftarResepQuery);
    return c.json({ success: true, data: await daftarKeranjangResep(db, c.get('viewer').id, q) });
  });

  app.post('/keranjang-resep', ...pembeli, async (c) => {
    const input = await parseBody(c, keranjangResepSchema);
    return c.json({ success: true, data: await buatKeranjangResep(db, c.get('viewer').id, input) });
  });

  app.get('/keranjang-resep/:id', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await keranjangById(db, c.get('viewer').id, id, 'recipe') });
  });

  app.patch('/keranjang-resep/:id', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    const input = await parseBody(c, keranjangResepSchema);
    return c.json({ success: true, data: await ubahKeranjangResep(db, c.get('viewer').id, id, input) });
  });

  app.delete('/keranjang-resep/:id', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    await hapusKeranjangResep(db, c.get('viewer').id, id);
    return c.json({ success: true, data: { dihapus: true } });
  });

  app.post('/keranjang-resep/:id/item', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    const input = await parseBody(c, tambahBarangSchema);
    return c.json({ success: true, data: await tambahBarang(db, c.get('viewer').id, id, input, 'recipe') });
  });

  app.patch('/keranjang-resep/:id/item/:itemId', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    const itemId = parseParam(c.req.param('itemId'), idParam, 'itemId');
    const input = await parseBody(c, ubahJumlahSchema);
    return c.json({ success: true, data: await ubahJumlahBarang(db, c.get('viewer').id, id, itemId, input.jumlah, 'recipe') });
  });

  app.delete('/keranjang-resep/:id/item/:itemId', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    const itemId = parseParam(c.req.param('itemId'), idParam, 'itemId');
    return c.json({ success: true, data: await hapusBarang(db, c.get('viewer').id, id, itemId, 'recipe') });
  });

  app.post('/keranjang-resep/:id/item/:itemId/alternatif', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    const itemId = parseParam(c.req.param('itemId'), idParam, 'itemId');
    const input = await parseBody(c, alternatifSchema);
    return c.json({ success: true, data: await tambahAlternatif(db, c.get('viewer').id, id, itemId, input.produkId, 'recipe') });
  });

  app.put('/keranjang-resep/:id/item/:itemId/alternatif', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    const itemId = parseParam(c.req.param('itemId'), idParam, 'itemId');
    const input = await parseBody(c, urutanAlternatifSchema);
    return c.json({ success: true, data: await urutkanAlternatif(db, c.get('viewer').id, id, itemId, input.urutan, 'recipe') });
  });

  // ---------- Ikuti Daftar Tunggu ----------

  app.post('/daftar-tunggu/:id/ikuti', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await ikutiDaftarTunggu(db, c.get('viewer').id, id) });
  });

  app.delete('/daftar-tunggu/:id/ikuti', ...pembeli, async (c) => {
    const id = parseParam(c.req.param('id'), idParam, 'id');
    return c.json({ success: true, data: await berhentiIkutiDaftarTunggu(db, c.get('viewer').id, id) });
  });

  return app;
}
