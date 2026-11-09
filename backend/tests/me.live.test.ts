import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createApp } from '../src/app';
import type { NeonSession, SessionLookup } from '../src/lib/session';
import { loadEnv } from '../src/lib/env';
import { createDb } from '../src/repo/db';
import { listDistrictsForRegency, listRegencies } from '../src/repo/identity/reference.repo';
import type { Executor } from '../src/repo/executor';

// Runs only when scripts/test-api.sh sets API_TEST_DATABASE_URL. Each test uses its own neon_auth user, because
// users.id is the primary key and a branch run keeps the rows it creates.
const liveUrl = process.env.API_TEST_DATABASE_URL;
const CRON_SECRET = 'c'.repeat(64);
const db: Executor | undefined = liveUrl ? createDb(liveUrl, 2) : undefined;

let ids: string[] = [];
let regencyA: { code: string; slug: string };
let districtOfA: string; // name of a district inside regency A
let regencyB: { code: string; slug: string };

beforeAll(async () => {
  if (!db) return;
  ids = (await db.selectFrom('neon_auth.user').select('id').orderBy('id').execute()).map((r) => r.id);
  const [a, b] = await listRegencies(db, 2);
  regencyA = a!;
  regencyB = b!;
  districtOfA = (await listDistrictsForRegency(db, a!.code, 1))[0]!.name;
});

afterAll(async () => {
  await db?.destroy();
});

/** Session stub keyed by the cookie value, so one app can serve several people in one test. */
function sessionFor(people: Record<string, NeonSession>): SessionLookup {
  return async ({ cookie }) => {
    const key = cookie?.match(/__Secure-neon-auth\.session_token=([^;]+)/)?.[1];
    return key ? (people[key] ?? null) : null;
  };
}

const cookieOf = (key: string) => ({ cookie: `__Secure-neon-auth.session_token=${key}` });

function appFor(key: string, idx: number) {
  const env = loadEnv({
    DATABASE_URL: liveUrl!,
    NEON_AUTH_BASE_URL: 'https://example.invalid/neondb/auth',
    CRON_SECRET,
  });
  return createApp({
    db: db!,
    env,
    session: sessionFor({ [key]: { id: ids[idx]!, email: `u${idx}@example.test`, name: `U${idx}` } }),
  });
}

const post = (app: ReturnType<typeof appFor>, key: string, body: unknown) =>
  app.request('/api/v1/me/onboarding', {
    method: 'POST',
    headers: { ...cookieOf(key), 'content-type': 'application/json', origin: 'https://pasoktani.test', 'x-forwarded-host': 'pasoktani.test' },
    body: JSON.stringify(body),
  });

const get = (app: ReturnType<typeof appFor>, key: string) =>
  app.request('/api/v1/me', { headers: cookieOf(key) });

(liveUrl ? describe : describe.skip)('onboarding and /me on the api-test branch', () => {
  test('GET /me without a session is 401', async () => {
    const env = loadEnv({ DATABASE_URL: liveUrl!, NEON_AUTH_BASE_URL: 'https://example.invalid/a', CRON_SECRET });
    const app = createApp({ db: db!, env, session: sessionFor({}) });
    const res = await app.request('/api/v1/me');
    expect(res.status).toBe(401);
  });

  test('a signed-in person with no profile gets 403 onboarding_required', async () => {
    const app = appFor('k-new', 0);
    const res = await get(app, 'k-new');
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('onboarding_required');
  });

  test('a consumer completes onboarding once, and a replay changes nothing', async () => {
    const app = appFor('k-buyer', 1);
    const first = await post(app, 'k-buyer', { peran: 'konsumen', nama: 'Ani Lestari', telepon: '+6281234567890' });
    expect(first.status).toBe(200);
    const body = await first.json();
    expect(body.data).toMatchObject({ peran: 'konsumen', nama: 'Ani Lestari', telepon: '+6281234567890', toko: null });

    const replay = await post(app, 'k-buyer', { peran: 'konsumen', nama: 'Lain Nama' });
    expect(replay.status).toBe(200);
    expect((await replay.json()).data.nama).toBe('Ani Lestari');

    const me = await get(app, 'k-buyer');
    expect(me.status).toBe(200);
    const data = (await me.json()).data;
    expect(data).toMatchObject({ peran: 'konsumen', nama: 'Ani Lestari', toko: null });
    // The email comes from neon_auth.user, not from the session stub, so only its shape is asserted here.
    expect(data.email).toMatch(/@/);
  });

  test('a petani with no shop fields is refused with a field per missing input, and nothing is written', async () => {
    const app = appFor('k-farm-empty', 2);
    const res = await post(app, 'k-farm-empty', { peran: 'petani', nama: 'Pak Tani' });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('validation_failed');
    expect(Object.keys(body.error.fields).sort()).toEqual(['kecamatan', 'namaToko', 'wilayah']);

    expect((await get(app, 'k-farm-empty')).status).toBe(403);
  });

  test('a regency slug that does not exist is refused on wilayah', async () => {
    const app = appFor('k-farm-slug', 3);
    const res = await post(app, 'k-farm-slug', {
      peran: 'petani', nama: 'Pak Tani', namaToko: 'Kebun Sawah', wilayah: 'kabupaten-bukan-ada', kecamatan: districtOfA,
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error.fields.wilayah).toBe('Wilayah tidak dikenal');
  });

  test('a kecamatan name that is not in the chosen regency is refused on kecamatan', async () => {
    const app = appFor('k-farm-mismatch', 4);
    const res = await post(app, 'k-farm-mismatch', {
      peran: 'petani', nama: 'Pak Tani', namaToko: 'Kebun Sawah', wilayah: regencyB.slug, kecamatan: 'Kecamatan Antah Berantah',
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error.fields.kecamatan).toBe('Kecamatan tidak ditemukan di wilayah ini');
  });

  test('a petani completes onboarding and gets a farm profile with a unique slug', async () => {
    const app = appFor('k-farm-ok', 5);
    const res = await post(app, 'k-farm-ok', {
      peran: 'petani', nama: 'Pak Tani', telepon: '081234567890', namaToko: 'Kebun Sawah Berkah',
      wilayah: regencyA.slug, kecamatan: districtOfA,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.peran).toBe('petani');
    expect(body.data.toko).toMatchObject({ nama: 'Kebun Sawah Berkah', kodeKabupaten: regencyA.code });
    expect(body.data.toko.kodeKecamatan).toMatch(/^32\./);
    expect(body.data.toko.slug).toMatch(/^kebun-sawah-berkah-[0-9a-f]{6}$/);

    const me = await (await get(app, 'k-farm-ok')).json();
    expect(me.data.toko.nama).toBe('Kebun Sawah Berkah');
  });

  test('an unknown peran is refused on peran', async () => {
    const app = appFor('k-role', 6);
    const res = await post(app, 'k-role', { peran: 'admin', nama: 'Coba Admin' });
    expect(res.status).toBe(400);
    expect((await res.json()).error.fields.peran).toBeString();
  });

  test('a suspended account gets 403 account_suspended on /me', async () => {
    const app = appFor('k-suspended', 7);
    await post(app, 'k-suspended', { peran: 'umkm', nama: 'Warung Sehat' });
    await db!.updateTable('users').set({ status: 'suspended' }).where('id', '=', ids[7]!).execute();
    const res = await get(app, 'k-suspended');
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('account_suspended');
  });

  test('a soft-deleted account gets 403 account_inactive, also on onboarding', async () => {
    const app = appFor('k-deleted', 8);
    await post(app, 'k-deleted', { peran: 'konsumen', nama: 'Akun Hapus' });
    await db!.updateTable('users').set({ deleted_at: new Date() }).where('id', '=', ids[8]!).execute();

    const me = await get(app, 'k-deleted');
    expect((await me.json()).error.code).toBe('account_inactive');
    const again = await post(app, 'k-deleted', { peran: 'konsumen', nama: 'Hidup Lagi' });
    expect(again.status).toBe(403);
    expect((await again.json()).error.code).toBe('account_inactive');
  });
});
