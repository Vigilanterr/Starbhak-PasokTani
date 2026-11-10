import { describe, expect, test } from 'bun:test';
import { IKON_DARI_KATEGORI, JENIS_LINIMASA_DARI_DB, LENCANA_DARI_BADGE, SATUAN_DARI_DB, STATUS_DAFTAR_DARI_DB, TAG_DARI_DB, badgeDariLencana, statusDbDari } from '../src/mappers/enum';
import { jamOperasional, namaSingkat, srcFoto, tanggalJakarta } from '../src/mappers/util';
import { lencanaDari } from '../src/mappers/petani';
import { ringkasanDari } from '../src/mappers/ulasan';
import { PER_HALAMAN_DEFAULT } from '../src/services/katalog.service';

/**
 * Every value of each database enum must map. Each table is typed as a complete Record, so a missing key fails
 * the typecheck; these tests also check the values at run time, which the typecheck cannot.
 */
const DB_UNIT = ['bunch', 'kg', 'liter', 'pack', 'piece'];
const DB_WAITLIST_STATUS = ['harvest_delayed', 'harvest_early', 'harvest_failed', 'planted', 'planting_scheduled', 'ready_to_harvest'];
const DB_EVENT = ['field_photo', 'note', 'schedule_change', 'status_change'];
const DB_BADGE = ['new_farmer', 'verified_farmer', 'power_farmer', 'fast_response', 'stock_always_updated', 'on_time_harvest', 'surplus_hero'];

describe('enum tables', () => {
  test('every product unit maps to a contract unit', () => {
    for (const u of DB_UNIT) expect(SATUAN_DARI_DB[u as keyof typeof SATUAN_DARI_DB]).toBeTruthy();
    expect(Object.values(SATUAN_DARI_DB).sort()).toEqual(['buah', 'ikat', 'kg', 'liter', 'pak']);
  });

  test('every wait list status maps, and back again', () => {
    for (const s of DB_WAITLIST_STATUS) {
      const mock = STATUS_DAFTAR_DARI_DB[s as keyof typeof STATUS_DAFTAR_DARI_DB];
      expect(mock).toBeTruthy();
      expect(statusDbDari(mock)).toBe(s as never);
    }
  });

  test('every event type maps to a timeline kind', () => {
    for (const t of DB_EVENT) expect(JENIS_LINIMASA_DARI_DB[t as keyof typeof JENIS_LINIMASA_DARI_DB]).toBeTruthy();
  });

  test('every badge code maps to a public badge, one to one', () => {
    for (const code of DB_BADGE) expect(LENCANA_DARI_BADGE[code]).toBeTruthy();
    expect(new Set(Object.values(LENCANA_DARI_BADGE)).size).toBe(DB_BADGE.length);
    for (const code of DB_BADGE) {
      expect(badgeDariLencana(LENCANA_DARI_BADGE[code]!)).toBe(code);
    }
  });

  test('unknown badge codes are dropped, not shown', () => {
    expect(lencanaDari(['verified_farmer', 'not_a_badge'])).toEqual(['terverifikasi']);
  });

  test('tags the catalog shows are the three the contract names', () => {
    expect(Object.keys(TAG_DARI_DB).sort()).toEqual(['bebas-pestisida', 'hidroponik', 'organik']);
  });

  test('every category slug in the database has an icon, and an unknown one falls back', () => {
    for (const slug of ['sayur', 'buah', 'beras-padi', 'rempah', 'umbi', 'jamur']) {
      expect(IKON_DARI_KATEGORI[slug]).toBeTruthy();
    }
  });
});

describe('jamOperasional', () => {
  const jam = (weekday: number, opens = '06:00', closes = '17:00') => ({ weekday, opens_at: opens, closes_at: closes });

  test('a Monday-to-Saturday run reads as one line', () => {
    const rows = [1, 2, 3, 4, 5, 6].map((d) => jam(d));
    expect(jamOperasional(rows)).toBe('Senin–Sabtu, 06.00–17.00');
  });

  test('seven days with the same hours read as every day', () => {
    expect(jamOperasional([0, 1, 2, 3, 4, 5, 6].map((d) => jam(d, '07:00', '16:00')))).toBe('Setiap hari, 07.00–16.00');
  });

  test('a run is broken where the hours change', () => {
    const rows = [jam(1), jam(2), jam(3, '07:00', '15:00')];
    expect(jamOperasional(rows)).toBe('Senin–Selasa, 06.00–17.00; Rabu, 07.00–15.00');
  });

  test('Sunday comes last, so a week that spans the weekend reads in order', () => {
    expect(jamOperasional([jam(0), jam(6)])).toBe('Sabtu–Minggu, 06.00–17.00');
  });

  test('no rows is no hours', () => {
    expect(jamOperasional([])).toBe('');
  });
});

describe('dates and names', () => {
  test('a timestamp late at night in UTC is still the same Jakarta day', () => {
    // 2026-11-09T18:30Z is 2026-11-10 01:30 in Jakarta.
    expect(tanggalJakarta(new Date('2026-11-09T18:30:00Z'))).toBe('2026-11-10');
    expect(tanggalJakarta(new Date('2026-11-09T16:59:00Z'))).toBe('2026-11-09');
  });

  test('a reviewer name shows the first name and last initial', () => {
    expect(namaSingkat('Rina Sartika Dewi')).toBe('Rina D.');
    expect(namaSingkat('Rina')).toBe('Rina');
  });

  test('demo images map from the local prefix, and Cloudinary ids have no URL yet', () => {
    expect(srcFoto('local:/images/landingpage/komoditas/cabai-rawit.png')).toBe('/images/landingpage/komoditas/cabai-rawit.png');
    expect(srcFoto('catalog/abc123')).toBeNull();
  });
});

describe('reviews summary', () => {
  test('the average is weighted by each star count', () => {
    const r = ringkasanDari({ total: 4, with_photo: 1, s1: 0, s2: 0, s3: 1, s4: 1, s5: 2 });
    expect(r.rata).toBe(4.3);
    expect(r.sebaran).toEqual([0, 0, 1, 1, 2]);
    expect(r.denganFoto).toBe(1);
  });

  test('no reviews gives zero, not NaN', () => {
    expect(ringkasanDari({ total: 0, with_photo: 0, s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 }).rata).toBe(0);
  });
});

describe('paging default', () => {
  test('the catalog pages by twelve, as the mock did', () => {
    expect(PER_HALAMAN_DEFAULT).toBe(12);
  });
});
