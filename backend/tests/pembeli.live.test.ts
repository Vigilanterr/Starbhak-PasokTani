import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createApp } from '../src/app';
import type { NeonSession, SessionLookup } from '../src/lib/session';
import { loadEnv } from '../src/lib/env';
import { insertProduct, receiveBatch } from '../src/repo/catalog/catalog.repo';
import { createDb } from '../src/repo/db';
import { insertWaitlist } from '../src/repo/waitlist/waitlist.repo';
import { listDistrictsForRegency, listRegencies } from '../src/repo/identity/reference.repo';
import type { Executor } from '../src/repo/executor';

// Buyer routes on the api-test branch: addresses, carts, alternatives, recipe carts and follows. Runs only when
// scripts/test-api.sh sets API_TEST_DATABASE_URL. Real commits, so the deferred checks and the row locks run as
// in production. Each run uses fresh neon_auth users, because users.id is a primary key.
const liveUrl = process.env.API_TEST_DATABASE_URL;
const CRON_SECRET = 'c'.repeat(64);
const db: Executor | undefined = liveUrl ? createDb(liveUrl, 2) : undefined;

const TIDAK_ADA = '0190a7c2-0000-7000-8000-00000000ffff';

let app: ReturnType<typeof createApp>;
let regencySlug: string;
let districtName: string;
let produk: { id: string; price: number };
let produkKedua: { id: string };
let daftarTungguId: string;

/** Session stub keyed by the cookie value, so one app serves several people. */
function sessionFor(people: Record<string, NeonSession>): SessionLookup {
  return async ({ cookie }) => {
    const key = cookie?.match(/__Secure-neon-auth\.session_token=([^;]+)/)?.[1];
    return key ? (people[key] ?? null) : null;
  };
}

const KUNCI = { pembeli: 'k-pembeli', lain: 'k-lain', petani: 'k-petani' } as const;

/** One request as a signed-in person. The origin matches the forwarded host, as the browser sends it. */
function req(key: string, method: string, path: string, body?: unknown) {
  return app.request(path, {
    method,
    headers: {
      cookie: `__Secure-neon-auth.session_token=${key}`,
      origin: 'https://pasoktani.test',
      'x-forwarded-host': 'pasoktani.test',
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const isiDari = async (res: Response) => (await res.json()).data;
const galatDari = async (res: Response) => (await res.json()).error;

beforeAll(async () => {
  if (!db) return;

  // Fresh auth users only: the ones with no users row yet. Three are needed, so the run stops clearly if the branch ran out.
  const ids = (await db.selectFrom('neon_auth.user').select('id')
    .where('id', 'not in', (eb) => eb.selectFrom('users').select('id'))
    .orderBy('id').limit(3).execute()).map((r) => r.id);
  if (ids.length < 3) throw new Error(`buyer tests need 3 fresh neon_auth users, found ${ids.length}`);
  const [idPembeli, idLain, idPetani] = ids as [string, string, string];

  const env = loadEnv({ DATABASE_URL: liveUrl!, NEON_AUTH_BASE_URL: 'https://example.invalid/neondb/auth', CRON_SECRET });
  app = createApp({
    db: db!,
    env,
    session: sessionFor({
      [KUNCI.pembeli]: { id: idPembeli, email: 'pembeli@example.test', name: 'Ani' },
      [KUNCI.lain]: { id: idLain, email: 'lain@example.test', name: 'Budi' },
      [KUNCI.petani]: { id: idPetani, email: 'petani@example.test', name: 'Pak Tani' },
    }),
  });

  const [regency] = await listRegencies(db!, 1);
  regencySlug = regency!.slug;
  districtName = (await listDistrictsForRegency(db!, regency!.code, 1))[0]!.name;

  const onboard = (key: string, body: unknown) => req(key, 'POST', '/api/v1/me/onboarding', body);
  expect((await onboard(KUNCI.pembeli, { peran: 'konsumen', nama: 'Ani Lestari' })).status).toBe(200);
  expect((await onboard(KUNCI.lain, { peran: 'umkm', nama: 'Budi Usaha' })).status).toBe(200);
  const farmer = await onboard(KUNCI.petani, {
    peran: 'petani', nama: 'Pak Tani', namaToko: 'Kebun Uji', wilayah: regencySlug, kecamatan: districtName,
  });
  expect(farmer.status).toBe(200);

  // Products and a wait list need a category and stock. Stock comes in through receiveBatch, as at harvest.
  const slug = `kat-${crypto.randomUUID()}`;
  const kategori = await db!.insertInto('categories').values({ slug, name: slug }).returning('id').executeTakeFirstOrThrow();
  const hariIni = new Date().toISOString().slice(0, 10);
  const enamPuluhHari = new Date(Date.now() + 60 * 86400_000).toISOString().slice(0, 10);

  const pertama = await insertProduct(db!, {
    farmerId: idPetani, categoryId: kategori.id, slug: `uji-${crypto.randomUUID()}`,
    name: 'Bawang Merah', unit: 'kg', price: 30000, minOrderQty: 2,
  });
  await db!.transaction().execute((trx) => receiveBatch(trx, {
    productId: pertama.id, createdBy: idPetani, initialQty: 10, harvestedOn: hariIni, expiresOn: enamPuluhHari,
  }));
  produk = { id: pertama.id, price: 30000 };

  const kedua = await insertProduct(db!, {
    farmerId: idPetani, categoryId: kategori.id, slug: `uji-${crypto.randomUUID()}`,
    name: 'Bawang Putih', unit: 'kg', price: 42000,
  });
  await db!.transaction().execute((trx) => receiveBatch(trx, {
    productId: kedua.id, createdBy: idPetani, initialQty: 5, harvestedOn: hariIni, expiresOn: enamPuluhHari,
  }));
  produkKedua = { id: kedua.id };

  const wl = await insertWaitlist(db!, {
    farmerId: idPetani, categoryId: kategori.id, commodityName: 'Cabai Merah', unit: 'kg', estimatedUnitPrice: 40000,
  });
  daftarTungguId = wl.id;
});

afterAll(async () => {
  await db?.destroy();
});

(liveUrl ? describe : describe.skip)('buyer routes on the api-test branch', () => {
  test('a farmer gets 403 forbidden on every buyer route', async () => {
    const res = await req(KUNCI.petani, 'GET', '/api/v1/keranjang');
    expect(res.status).toBe(403);
    expect((await galatDari(res)).code).toBe('forbidden');
  });

  test('GET /keranjang creates the temporary cart once and returns it with no lines', async () => {
    const pertama = await isiDari(await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang'));
    expect(pertama).toMatchObject({ jenis: 'sementara', nama: null, baris: [], subtotal: 0 });
    const kedua = await isiDari(await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang'));
    expect(kedua.id).toBe(pertama.id);
  });

  test('adding below the minimum purchase is refused on jumlah and writes nothing', async () => {
    const res = await req(KUNCI.pembeli, 'POST', '/api/v1/keranjang/item', { produkId: produk.id, jumlah: 1 });
    expect(res.status).toBe(400);
    const galat = await galatDari(res);
    expect(galat.code).toBe('validation_failed');
    expect(galat.fields.jumlah).toMatch(/Minimal pembelian 2/);
    expect((await isiDari(await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang'))).baris).toHaveLength(0);
  });

  test('adding a product returns the line with its subtotal, and adding it again adds to the quantity', async () => {
    const tambah = await req(KUNCI.pembeli, 'POST', '/api/v1/keranjang/item', { produkId: produk.id, jumlah: 3 });
    expect(tambah.status).toBe(200);
    const keranjang = await isiDari(tambah);
    expect(keranjang.baris).toHaveLength(1);
    expect(keranjang.baris[0]).toMatchObject({
      produkId: produk.id, jumlah: 3, harga: 30000, subtotal: 90000, stok: 10, minPembelian: 2, tersedia: true, alternatif: [],
    });
    expect(keranjang.subtotal).toBe(90000);

    const lagi = await isiDari(await req(KUNCI.pembeli, 'POST', '/api/v1/keranjang/item', { produkId: produk.id, jumlah: 2 }));
    expect(lagi.baris).toHaveLength(1);
    expect(lagi.baris[0].jumlah).toBe(5);
    expect(lagi.subtotal).toBe(150000);
  });

  test('a quantity above stock is refused with out_of_stock, and an unknown product is 404', async () => {
    const habis = await req(KUNCI.pembeli, 'POST', '/api/v1/keranjang/item', { produkId: produk.id, jumlah: 50 });
    expect(habis.status).toBe(409);
    expect((await galatDari(habis)).code).toBe('out_of_stock');

    const tidakAda = await req(KUNCI.pembeli, 'POST', '/api/v1/keranjang/item', { produkId: TIDAK_ADA, jumlah: 2 });
    expect(tidakAda.status).toBe(404);
    expect((await galatDari(tidakAda)).code).toBe('not_found');
  });

  test('a line changed below the minimum is refused and keeps its old quantity', async () => {
    const [baris] = (await isiDari(await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang'))).baris;
    const res = await req(KUNCI.pembeli, 'PATCH', `/api/v1/keranjang/item/${baris.id}`, { jumlah: 1 });
    expect(res.status).toBe(400);
    const sesudah = await isiDari(await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang'));
    expect(sesudah.baris[0].jumlah).toBe(5);
  });

  test('a line changed to a valid quantity shows the new subtotal', async () => {
    const [baris] = (await isiDari(await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang'))).baris;
    const keranjang = await isiDari(await req(KUNCI.pembeli, 'PATCH', `/api/v1/keranjang/item/${baris.id}`, { jumlah: 4 }));
    expect(keranjang.baris[0].jumlah).toBe(4);
    expect(keranjang.subtotal).toBe(120000);
  });

  test('another buyer cannot change or see this line', async () => {
    const [baris] = (await isiDari(await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang'))).baris;
    const res = await req(KUNCI.lain, 'PATCH', `/api/v1/keranjang/item/${baris.id}`, { jumlah: 2 });
    expect(res.status).toBe(404);
    expect((await isiDari(await req(KUNCI.lain, 'GET', '/api/v1/keranjang'))).baris).toHaveLength(0);
  });

  test('alternatives: append, refuse a repeat, reorder with the right ids, refuse a wrong set', async () => {
    const [baris] = (await isiDari(await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang'))).baris;
    const base = `/api/v1/keranjang/item/${baris.id}/alternatif`;

    const tambah = await req(KUNCI.pembeli, 'POST', base, { produkId: produkKedua.id });
    expect(tambah.status).toBe(200);
    const [dengan] = (await isiDari(tambah)).baris;
    expect(dengan.alternatif).toEqual([produkKedua.id]);

    const ulang = await req(KUNCI.pembeli, 'POST', base, { produkId: produkKedua.id });
    expect(ulang.status).toBe(409);
    expect((await galatDari(ulang)).code).toBe('state_conflict');

    const salah = await req(KUNCI.pembeli, 'PUT', base, { urutan: [TIDAK_ADA] });
    expect(salah.status).toBe(400);
    expect((await galatDari(salah)).fields.urutan).toBeDefined();

    const urut = await req(KUNCI.pembeli, 'PUT', base, { urutan: [produkKedua.id] });
    expect(urut.status).toBe(200);
  });

  test('a second line is added, and deleting a line removes it; an unknown line is 404', async () => {
    const tambah = await req(KUNCI.pembeli, 'POST', '/api/v1/keranjang/item', { produkId: produkKedua.id, jumlah: 2 });
    const keranjang = await isiDari(tambah);
    expect(keranjang.baris).toHaveLength(2);

    const [pertama] = keranjang.baris;
    const hapus = await req(KUNCI.pembeli, 'DELETE', `/api/v1/keranjang/item/${pertama.id}`);
    expect(hapus.status).toBe(200);
    expect((await isiDari(hapus)).baris).toHaveLength(1);

    const hapusLagi = await req(KUNCI.pembeli, 'DELETE', `/api/v1/keranjang/item/${pertama.id}`);
    expect(hapusLagi.status).toBe(404);
  });

  test('recipe cart: a blank name is refused, then create, rename, add a product, and delete', async () => {
    const kosong = await req(KUNCI.pembeli, 'POST', '/api/v1/keranjang-resep', { nama: '   ' });
    expect(kosong.status).toBe(400);
    expect((await galatDari(kosong)).fields.nama).toBeDefined();

    const dibuat = await isiDari(await req(KUNCI.pembeli, 'POST', '/api/v1/keranjang-resep', { nama: 'Nasi Goreng', catatan: 'Tiap Senin' }));
    expect(dibuat).toMatchObject({ jenis: 'resep', nama: 'Nasi Goreng', catatan: 'Tiap Senin', baris: [] });
    const id = dibuat.id as string;

    const daftar = await isiDari(await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang-resep'));
    expect(daftar.item.map((c: { id: string }) => c.id)).toContain(id);
    expect(daftar.berikutnya).toBeNull();

    // The temporary cart is not a recipe cart, so the recipe route refuses its id.
    const sementara = await isiDari(await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang'));
    expect((await req(KUNCI.pembeli, 'GET', `/api/v1/keranjang-resep/${sementara.id}`)).status).toBe(404);

    const ganti = await isiDari(await req(KUNCI.pembeli, 'PATCH', `/api/v1/keranjang-resep/${id}`, { nama: 'Nasi Goreng Keluarga' }));
    expect(ganti.nama).toBe('Nasi Goreng Keluarga');

    const isi = await isiDari(await req(KUNCI.pembeli, 'POST', `/api/v1/keranjang-resep/${id}/item`, { produkId: produk.id, jumlah: 2 }));
    expect(isi.baris).toHaveLength(1);
    expect(isi.subtotal).toBe(60000);

    const hapus = await req(KUNCI.pembeli, 'DELETE', `/api/v1/keranjang-resep/${id}`);
    expect(hapus.status).toBe(200);
    expect((await req(KUNCI.pembeli, 'GET', `/api/v1/keranjang-resep/${id}`)).status).toBe(404);
  });

  test('addresses: unknown region names are refused on their field; the first address becomes the default', async () => {
    const base = { label: 'Rumah', namaPenerima: 'Ani Lestari', telepon: '+6281234567890', jalan: 'Jl. Sawah No. 1' };

    const kabupaten = await req(KUNCI.pembeli, 'POST', '/api/v1/me/alamat', { ...base, kabupaten: 'kabupaten-bukan-ada', kecamatan: districtName });
    expect(kabupaten.status).toBe(400);
    expect((await galatDari(kabupaten)).fields.kabupaten).toBeDefined();

    const kecamatan = await req(KUNCI.pembeli, 'POST', '/api/v1/me/alamat', { ...base, kabupaten: regencySlug, kecamatan: 'Kecamatan Tidak Ada' });
    expect(kecamatan.status).toBe(400);
    expect((await galatDari(kecamatan)).fields.kecamatan).toBeDefined();

    const pertama = await isiDari(await req(KUNCI.pembeli, 'POST', '/api/v1/me/alamat', { ...base, kabupaten: regencySlug, kecamatan: districtName }));
    expect(pertama).toHaveLength(1);
    expect(pertama[0]).toMatchObject({ utama: true, kabupaten: regencySlug, kecamatan: districtName, label: 'Rumah' });
  });

  test('a second address is not the default until it is set; another buyer cannot set it', async () => {
    const base = { label: 'Kantor', namaPenerima: 'Ani Lestari', telepon: '+6281234567890', jalan: 'Jl. Pasar No. 9', kabupaten: regencySlug, kecamatan: districtName };
    const daftar = await isiDari(await req(KUNCI.pembeli, 'POST', '/api/v1/me/alamat', { ...base, utama: false }));
    expect(daftar).toHaveLength(2);
    expect(daftar[0].utama).toBe(true);

    const kantor = daftar.find((a: { label: string }) => a.label === 'Kantor');
    const dilarang = await req(KUNCI.lain, 'POST', `/api/v1/me/alamat/${kantor.id}/utama`);
    expect(dilarang.status).toBe(404);

    const ganti = await isiDari(await req(KUNCI.pembeli, 'POST', `/api/v1/me/alamat/${kantor.id}/utama`));
    expect(ganti[0]).toMatchObject({ id: kantor.id, utama: true });
    expect(ganti.filter((a: { utama: boolean }) => a.utama)).toHaveLength(1);
  });

  test('a wait list can be followed twice with one answer, and unfollowed; a missing one is 404', async () => {
    const ikuti = `/api/v1/daftar-tunggu/${daftarTungguId}/ikuti`;
    expect(await isiDari(await req(KUNCI.pembeli, 'POST', ikuti))).toEqual({ mengikuti: true });
    expect(await isiDari(await req(KUNCI.pembeli, 'POST', ikuti))).toEqual({ mengikuti: true });
    expect(await isiDari(await req(KUNCI.pembeli, 'DELETE', ikuti))).toEqual({ mengikuti: false });
    expect(await isiDari(await req(KUNCI.pembeli, 'DELETE', ikuti))).toEqual({ mengikuti: false });

    const tidakAda = await req(KUNCI.pembeli, 'POST', `/api/v1/daftar-tunggu/${TIDAK_ADA}/ikuti`);
    expect(tidakAda.status).toBe(404);
  });

  test('a path id that is not a uuid is 400 before any query', async () => {
    const res = await req(KUNCI.pembeli, 'GET', '/api/v1/keranjang-resep/bukan-uuid');
    expect(res.status).toBe(400);
    expect((await galatDari(res)).code).toBe('validation_failed');
  });
});
