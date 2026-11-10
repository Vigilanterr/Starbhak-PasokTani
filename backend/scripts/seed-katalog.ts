/**
 * Seeds the public catalog with the demo data that the frontend mock used (`frontend/src/data/*.json`).
 *
 * - Dev branch only. It refuses production through assertSafeBranch, and there is no flag to override that.
 * - Runs once: it stops if the demo farmers already exist.
 * - Every date is shifted by the same number of days, from the mock's reference date to today in Jakarta,
 *   so "akan kedaluwarsa dalam 3 hari" stays true on the day you seed.
 * - Each farmer is written in one transaction under withActor, so a failure leaves no half-seeded farmer.
 * - Not seeded: product photos (the images are not committed yet, see ApiPlan Phase 3), and reviews (they need
 *   order items, which exist from Phase 5). Ratings therefore start at zero.
 *
 * Usage: bun run seed:katalog   (reads DATABASE_URL and NEON_BRANCH from backend/.env)
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { closeDb, getDb } from '../src/repo/db';
import type { Executor } from '../src/repo/executor';
import { withActor, withTransaction } from '../src/repo/executor';
import { assertAuthMatchesDatabase, assertSafeBranch } from '../src/repo/test-utils';
import { findCategoryBySlug, ensureTag, insertProduct, receiveBatch, replacePriceTiers, replaceSurplusRules, setProductTags } from '../src/repo/catalog/catalog.repo';
import { ensureFarmerProfile, awardBadge, findBadgeByCode, insertHoliday, replaceOperatingHours, updateFarmerProfile } from '../src/repo/farmers/farmers.repo';
import { ensureUser, markUserOnboarded } from '../src/repo/identity/identity.repo';
import { findDistrictByName, findRegencyBySlug, listDistrictsForRegency } from '../src/repo/identity/reference.repo';
import { insertWaitlist, insertWaitlistEvent, followWaitlist } from '../src/repo/waitlist/waitlist.repo';
import {
  approveFarmerForDemo, listDemoBuyers, listUnlinkedAuthUsers, listWaitlistIdsForDemo, setFarmerDemoStats,
  setProductSoldQty, setWaitlistDemoState,
} from '../src/repo/demo/demo.repo';
import type { ProductUnit, WaitlistEventType, WaitlistStatus, HarvestScheduleType } from '../src/repo/db.generated';
import { STATUS_DAFTAR_DARI_DB, LENCANA_DARI_BADGE } from '../src/mappers/enum';

const DATA = join(import.meta.dir, '..', '..', 'frontend', 'src', 'data');
const ACUAN_FILE = join(import.meta.dir, '..', '..', 'frontend', 'src', 'lib', 'api', 'acuan.ts');

type Json = Record<string, any>;
const baca = <T>(nama: string): T[] => JSON.parse(readFileSync(join(DATA, `${nama}.json`), 'utf8')) as T[];

/** Mock category slug to the slug in the categories table. */
const KATEGORI_DB: Record<string, string> = {
  sayuran: 'sayur',
  'bumbu-rempah': 'rempah',
  'beras-biji': 'beras-padi',
  buah: 'buah',
  umbi: 'umbi',
  jamur: 'jamur',
};

const SATUAN_DB: Record<string, ProductUnit> = { kg: 'kg', liter: 'liter', pak: 'pack', ikat: 'bunch', buah: 'piece' };

const JENIS_EVENT: Record<string, WaitlistEventType> = {
  status: 'status_change',
  jadwal: 'schedule_change',
  foto: 'field_photo',
  catatan: 'note',
};

const STATUS_DB: Record<string, WaitlistStatus> = Object.fromEntries(
  Object.entries(STATUS_DAFTAR_DARI_DB).map(([db, mock]) => [mock, db]),
) as Record<string, WaitlistStatus>;

/** Days from the mock's reference date to today in Jakarta. Every seeded date moves by this amount. */
function selisihHariDariAcuan(): number {
  const acuan = readFileSync(ACUAN_FILE, 'utf8').match(/TANGGAL_ACUAN = "(\d{4}-\d{2}-\d{2})"/)?.[1];
  if (!acuan) throw new Error('TANGGAL_ACUAN not found in frontend/src/lib/api/acuan.ts');
  const hariIni = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  return Math.round((Date.parse(hariIni) - Date.parse(acuan)) / 86_400_000);
}

function geser(tanggal: string | null | undefined, hari: number): string | null {
  if (!tanggal) return null;
  const d = new Date(Date.parse(tanggal) + hari * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/** "Senin–Sabtu, 06.00–17.00" to weekday rows. Weekday 0 is Sunday, as the database stores it. */
function jamDariTeks(teks: string): { weekday: number; opensAt: string; closesAt: string }[] {
  const HARI: Record<string, number> = { Minggu: 0, Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6 };
  const urutan = [1, 2, 3, 4, 5, 6, 0];
  const [bagian, jam] = teks.split(', ');
  if (!bagian || !jam) return [];
  const [buka, tutup] = jam.split('–').map((j) => j.replace('.', ':'));
  let hari: number[];
  if (bagian === 'Setiap hari') hari = urutan;
  else {
    const [awal, akhir] = bagian.split('–');
    const i = urutan.indexOf(HARI[awal!]!);
    const j = urutan.indexOf(HARI[akhir ?? awal!]!);
    hari = urutan.slice(i, j + 1);
  }
  return hari.map((weekday) => ({ weekday, opensAt: buka!, closesAt: tutup! }));
}

async function main() {
  assertSafeBranch();
  assertAuthMatchesDatabase();
  const db = getDb();

  const petani = baca<Json>('petani');
  const produk = baca<Json>('produk');
  const daftar = baca<Json>('daftar-tunggu');

  const sudahAda = await db.selectFrom('farmer_profiles').select('user_id').limit(1).execute();
  if (sudahAda.length > 0) {
    console.log('Data katalog sudah ada. Seed hanya jalan di database kosong; hapus data demo dulu.');
    return;
  }

  const hariGeser = selisihHariDariAcuan();
  const pemilik = await listUnlinkedAuthUsers(db, petani.length);
  if (pemilik.length < petani.length) {
    throw new Error(`Butuh ${petani.length} akun neon_auth tanpa baris users, ada ${pemilik.length}`);
  }
  const pembeli = (await listDemoBuyers(db, 3)).map((b) => b.id);
  console.log(`Geser tanggal ${hariGeser} hari. ${petani.length} petani, ${produk.length} produk, ${daftar.length} daftar tunggu.`);

  const idPetani = new Map<string, string>(petani.map((p, i) => [p.id as string, pemilik[i]!.id]));
  const kategoriId = new Map<string, string>();
  for (const slug of new Set(Object.values(KATEGORI_DB))) {
    const row = await findCategoryBySlug(db, slug);
    if (!row) throw new Error(`Kategori ${slug} tidak ada di tabel categories`);
    kategoriId.set(slug, row.id);
  }

  const wilayahDiTabel = new Map<string, string>();
  const kodeKecamatan = async (kabupaten: string, kecamatan: string) => {
    let kode = wilayahDiTabel.get(`${kabupaten}|${kecamatan}`);
    if (kode) return kode;
    const regency = await findRegencyBySlug(db, kabupaten);
    if (!regency) throw new Error(`Kabupaten ${kabupaten} tidak ada`);
    const district = (await findDistrictByName(db, regency.code, kecamatan))
      ?? (await listDistrictsForRegency(db, regency.code, 1))[0];
    if (!district) throw new Error(`Tidak ada kecamatan di ${kabupaten}`);
    kode = district.code;
    wilayahDiTabel.set(`${kabupaten}|${kecamatan}`, kode);
    return kode;
  };

  for (const p of petani) {
    const ownerId = idPetani.get(p.id)!;
    const regency = await findRegencyBySlug(db, p.kabupaten);
    const districtCode = await kodeKecamatan(p.kabupaten, p.kecamatan);
    const produkPetani = produk.filter((x) => x.petaniId === p.id);
    const daftarPetani = daftar.filter((x) => x.petaniId === p.id);

    await withActor(db, ownerId, async (trx: Executor) => {
      await ensureUser(trx, { id: ownerId, fullName: p.nama, role: 'farmer' });
      await markUserOnboarded(trx, ownerId, { fullName: p.nama, phone: null });
      await ensureFarmerProfile(trx, {
        userId: ownerId,
        shopName: p.namaToko,
        slug: p.id,
        regencyCode: regency!.code,
        districtCode,
      });
      await updateFarmerProfile(trx, ownerId, {
        description: p.deskripsi,
        landAreaHa: String(p.luasLahanHa),
        location: { lng: p.lokasi.lng, lat: p.lokasi.lat },
      });
      await approveFarmerForDemo(trx, ownerId);
      await setFarmerDemoStats(trx, ownerId, { completedOrders: p.jumlahTransaksi, avgResponseMinutes: p.responMenit });
      await replaceOperatingHours(trx, ownerId, jamDariTeks(p.jamOperasional));
      if (p.libur) {
        const libur = geser(p.libur, hariGeser)!;
        await insertHoliday(trx, { farmerId: ownerId, from: libur, to: libur, note: 'Libur toko' });
      }
      for (const lencana of p.lencana as string[]) {
        const kode = Object.entries(LENCANA_DARI_BADGE).find(([, v]) => v === lencana)?.[0];
        if (!kode) continue;
        const badge = await findBadgeByCode(trx, kode);
        if (badge) await awardBadge(trx, { farmerId: ownerId, badgeId: badge.id, evaluationPeriod: null });
      }

      for (const x of produkPetani) {
        const aturan = (x.aturanSurplus as Json[]) ?? [];
        const productId = (await insertProduct(trx, {
          farmerId: ownerId,
          categoryId: kategoriId.get(KATEGORI_DB[x.kategori]!)!,
          slug: x.slug,
          name: x.nama,
          unit: SATUAN_DB[x.satuan]!,
          price: x.harga,
          altNames: x.namaLain,
          description: x.deskripsi,
          minOrderQty: x.minPembelian,
          surplusEnabled: aturan.length > 0,
          surplusFloorPrice: x.hargaMinimumSurplus,
        })).id;

        const tagIds: string[] = [];
        for (const tag of x.tag as string[]) {
          const nama = tag.split('-').map((k) => k[0]!.toUpperCase() + k.slice(1)).join(' ');
          tagIds.push((await ensureTag(trx, { slug: tag, name: nama })).id);
        }
        await setProductTags(trx, productId, tagIds);
        await replacePriceTiers(trx, productId, (x.hargaGrosir as Json[])
          .filter((t) => t.minJumlah > 1)
          .map((t) => ({ minQty: t.minJumlah, unitPrice: t.harga })));
        await replaceSurplusRules(trx, productId, aturan.map((r) => ({ daysRemaining: r.sisaHari, discountPct: r.diskonPersen })));

        if (x.stok > 0) {
          await receiveBatch(trx, {
            productId,
            createdBy: ownerId,
            initialQty: x.stok,
            harvestedOn: geser(x.tanggalPanen, hariGeser)!,
            expiresOn: geser(x.tanggalKedaluwarsa, hariGeser)!,
          });
        }
        await setProductSoldQty(trx, productId, x.terjual);
      }
    });

    // Wait lists in their own transactions, so each timeline row gets its own created_at.
    for (const d of daftarPetani) {
      const waitlistId = await withActor(db, ownerId, async (trx: Executor) => {
        const id = await insertWaitlist(trx, {
          farmerId: ownerId,
          categoryId: kategoriId.get(KATEGORI_DB[d.kategori]!)!,
          commodityName: d.komoditas,
          unit: SATUAN_DB[d.satuan]!,
          estimatedUnitPrice: d.hargaPerkiraan,
          description: d.deskripsi,
          minCommitQty: d.minKomitmen,
          quotaQty: d.kuota,
        });
        return id.id;
      });
      await withActor(db, ownerId, async (trx: Executor) => {
        const alasan = (d.linimasa as Json[]).find((e) => e.alasan)?.alasan ?? null;
        const jadwal = d.jadwalPanen as Json;
        const jadwalTipe: HarvestScheduleType = jadwal.jenis === 'tanggal' ? 'exact_date'
          : jadwal.jenis === 'rentang' ? 'date_range' : 'not_set';
        await setWaitlistDemoState(trx, waitlistId, {
          status: STATUS_DB[d.status]!,
          scheduleType: jadwalTipe,
          plantedOn: geser(d.tanggalTanam, hariGeser),
          harvestStart: geser(jadwal.tanggal ?? jadwal.mulai, hariGeser),
          harvestEnd: geser(jadwal.selesai, hariGeser),
          estimatedYieldQty: d.perkiraanHasil,
          committedMinQty: d.terkomitmen,
          failureReason: d.status === 'gagal-panen' ? alasan : null,
        });
      });
      for (const e of d.linimasa as Json[]) {
        await withActor(db, ownerId, async (trx: Executor) => {
          await insertWaitlistEvent(trx, {
            waitlistId,
            type: JENIS_EVENT[e.jenis]!,
            title: e.judul,
            body: e.isi,
            reason: e.alasan ?? null,
            createdBy: ownerId,
          });
        });
      }
    }
  }

  // Followers: the existing consumer accounts follow the first few open wait lists. Counters come from the trigger.
  const daftarIkuti = await listWaitlistIdsForDemo(db, 4);
  for (const w of daftarIkuti) {
    for (const b of pembeli) {
      await withTransaction(db, (trx: Executor) => followWaitlist(trx, b, w));
    }
  }
  console.log(`Selesai. ${produk.length} produk dan ${daftar.length} daftar tunggu masuk ke katalog.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
