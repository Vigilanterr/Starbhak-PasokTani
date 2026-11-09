import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createApp } from '../src/app';
import { loadEnv } from '../src/lib/env';
import { createDb } from '../src/repo/db';
import type { Executor } from '../src/repo/executor';

/**
 * The public catalog against a real database. Runs only when scripts/test-api.sh sets API_TEST_DATABASE_URL.
 * The branch is reset from the dev branch before each run, so the demo catalog is there when the dev branch has
 * been seeded (`bun run seed:katalog`). Every assertion is a read, so nothing here writes.
 */
const liveUrl = process.env.API_TEST_DATABASE_URL;
const db: Executor | undefined = liveUrl ? createDb(liveUrl, 2) : undefined;
const live = liveUrl ? describe : describe.skip;

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  if (!db) return;
  const env = loadEnv({
    DATABASE_URL: liveUrl!,
    NEON_AUTH_BASE_URL: 'https://example.invalid/neondb/auth',
    CRON_SECRET: 'c'.repeat(64),
  });
  app = createApp({ db, env, session: async () => null });
});

afterAll(async () => {
  await db?.destroy();
});

const get = async (path: string) => {
  const res = await app.request(path);
  return { status: res.status, body: (await res.json()) as any };
};

live('public catalog, live database', () => {
  test('categories answer with a count per category', async () => {
    const { status, body } = await get('/api/v1/categories');
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(typeof body.data[0].jumlahProduk).toBe('number');
  });

  test('the product list pages with a total', async () => {
    const { status, body } = await get('/api/v1/products?perHalaman=2');
    expect(status).toBe(200);
    expect(body.data.item.length).toBeLessThanOrEqual(2);
    expect(body.data.total).toBeGreaterThan(0);
    expect(body.data.jumlahHalaman).toBe(Math.ceil(body.data.total / 2));
  });

  test('a product detail carries its wholesale tiers and Surplus rules', async () => {
    const { status, body } = await get('/api/v1/products/tomat-merah-lembang');
    expect(status).toBe(200);
    expect(body.data.hargaGrosir[0]).toEqual({ minJumlah: 1, harga: body.data.harga });
    expect(Array.isArray(body.data.aturanSurplus)).toBe(true);
    expect(body.data.petani.namaToko).toBeTruthy();
  });

  test('a missing product is a 404 with the error envelope', async () => {
    const { status, body } = await get('/api/v1/products/tidak-ada-produk-ini');
    expect(status).toBe(404);
    expect(body.error.code).toBe('not_found');
  });

  test('a malformed id is a 400 before any query', async () => {
    const { status, body } = await get('/api/v1/products/bukan-uuid/related');
    expect(status).toBe(400);
    expect(body.error.code).toBe('validation_failed');
  });

  test('search maps a synonym and says what it understood', async () => {
    const { status, body } = await get('/api/v1/search?q=cabe');
    expect(status).toBe(200);
    expect(body.data.dimaknai).toBe('cabai');
  });

  test('farmer and wait list pages answer', async () => {
    const farmers = await get('/api/v1/farmers?urut=rating');
    expect(farmers.status).toBe(200);
    const lists = await get('/api/v1/waitlists?bisaKomitmen=true');
    expect(lists.status).toBe(200);
    expect(lists.body.data.item.every((w: any) => w.status !== 'gagal-panen')).toBe(true);
  });

  test('home reports the statistics the page shows', async () => {
    const { status, body } = await get('/api/v1/home');
    expect(status).toBe(200);
    expect(Object.keys(body.data.statistik).sort()).toEqual(['daftarTunggu', 'petani', 'produk', 'wilayah']);
  });

  test('an unknown filter value is a 400 with the field named', async () => {
    const { status, body } = await get('/api/v1/products?urut=ngawur');
    expect(status).toBe(400);
    expect(body.error.fields.urut).toBeTruthy();
  });
});
