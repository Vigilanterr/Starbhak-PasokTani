import type {
  DaftarTungguTampil, HasilCari, HasilHalaman, Kategori, ProdukTampil, SurplusAktif,
} from '../contract/tipe';
import { notFound } from '../lib/app-error';
import { ikonDariKategori } from '../mappers/enum';
import { jarakKmDari, produkTampil, type ProdukHidrasi } from '../mappers/produk';
import { ringkasanDari, ulasanTampil } from '../mappers/ulasan';
import {
  type CatalogCardRow, type CatalogFilter, type CatalogSort,
  countPublicStats, findCatalogCardById, findCatalogCardBySlug, listCatalogCards, listCategoriesWithCounts,
  listPhotosForProducts, listSurplusRulesForProducts, listTagSlugsForProducts, listTiersForProducts,
} from '../repo/catalog/catalog-read.repo';
import { resolveSearchTerm, searchProducts } from '../repo/catalog/catalog.repo';
import { listBadgeCodesForFarmers } from '../repo/farmers/farmer-read.repo';
import { listPublicReviews, summarizePublicReviews } from '../repo/feedback/review-read.repo';
import type { Executor } from '../repo/executor';
import { listRegencies, findRegencyBySlug, listDistrictsForRegency } from '../repo/identity/reference.repo';
import { listWaitlistCards } from '../repo/waitlist/waitlist-read.repo';
import { groupBy } from './hidrasi';
import { surplusFor } from './surplus';
import { tampilkanDaftar } from './daftar-tunggu.service';

/** Default origin for "near me": central Bandung, as the catalog page uses. */
export const TITIK_DEFAULT = { lat: -6.9175, lng: 107.6191 };

export const PER_HALAMAN_DEFAULT = 12;
export const PER_HALAMAN_MAKS = 60;
/** Search hits kept before the filters and sort run. Bounds the work per search. */
const MAKS_HASIL_CARI = 200;

export type Urutan = 'relevan' | 'terlaris' | 'terbaru' | 'harga-asc' | 'harga-desc' | 'rating' | 'terdekat';

export interface ProdukQuery {
  kategori?: string;
  kabupaten?: string;
  organik?: boolean;
  surplus?: boolean;
  tersedia?: boolean;
  petaniId?: string;
  hargaMin?: number;
  hargaMax?: number;
  titik?: { lat: number; lng: number };
  radiusKm?: number;
  urut?: Urutan;
  halaman: number;
  perHalaman: number;
}

/** Per-product hydration: tags, tiers, Surplus rules and photos, plus badges for each farmer. Five queries in all. */
export async function tampilkanProduk(db: Executor, rows: CatalogCardRow[]): Promise<ProdukTampil[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const farmerIds = [...new Set(rows.map((r) => r.farmer_id))];
  const [tags, tiers, rules, photos, badges] = await Promise.all([
    listTagSlugsForProducts(db, ids),
    listTiersForProducts(db, ids),
    listSurplusRulesForProducts(db, ids),
    listPhotosForProducts(db, ids),
    listBadgeCodesForFarmers(db, farmerIds),
  ]);
  const tagOf = groupBy(tags, (t) => t.product_id);
  const tierOf = groupBy(tiers, (t) => t.product_id);
  const ruleOf = groupBy(rules, (r) => r.product_id);
  const photoOf = groupBy(photos, (p) => p.product_id);
  const badgeOf = groupBy(badges, (b) => b.farmer_id);

  return rows.map((row) => {
    const h: ProdukHidrasi = {
      tags: (tagOf.get(row.id) ?? []).map((t) => t.slug),
      tiers: tierOf.get(row.id) ?? [],
      rules: ruleOf.get(row.id) ?? [],
      photos: photoOf.get(row.id) ?? [],
    };
    const surplus = surplusFor({
      basePrice: row.price,
      floorPrice: row.surplus_floor_price,
      surplusEnabled: row.surplus_enabled,
      rules: h.rules.map((r) => ({ daysRemaining: r.days_remaining, discountPct: r.discount_pct })),
      daysLeft: row.days_left,
      stock: Number(row.available_qty),
    });
    const aktif: SurplusAktif | null = surplus ? { diskonPersen: surplus.discountPct, hargaSurplus: surplus.price } : null;
    return produkTampil(
      row,
      h,
      aktif,
      jarakKmDari(row.distance_m),
      (badgeOf.get(row.farmer_id) ?? []).map((b) => b.code),
    );
  });
}

function filterDari(q: ProdukQuery): { filter: CatalogFilter; sort: CatalogSort } {
  const origin = q.titik ?? (q.urut === 'terdekat' || q.radiusKm !== undefined ? TITIK_DEFAULT : undefined);
  const sort: CatalogSort = q.urut ?? 'terlaris';
  return {
    sort,
    filter: {
      origin,
      radiusMeters: q.radiusKm !== undefined ? q.radiusKm * 1000 : undefined,
      categorySlug: q.kategori,
      regencySlug: q.kabupaten,
      tagSlug: q.organik ? 'organik' : undefined,
      surplusOnly: q.surplus,
      inStockOnly: q.tersedia,
      farmerId: q.petaniId,
      priceMin: q.hargaMin,
      priceMax: q.hargaMax,
    },
  };
}

/**
 * One page of products, with the total. A page past the end (or an empty result) shows page 1, as the catalog
 * did before. The base price drives price sort and filter; the Surplus price is shown per product.
 */
export async function daftarProduk(db: Executor, q: ProdukQuery): Promise<HasilHalaman<ProdukTampil>> {
  const { filter, sort } = filterDari(q);
  let halaman = q.halaman;
  let rows = await listCatalogCards(db, { filter, sort, page: halaman, perPage: q.perHalaman });
  if (rows.length === 0 && halaman > 1) {
    halaman = 1;
    rows = await listCatalogCards(db, { filter, sort, page: 1, perPage: q.perHalaman });
  }
  const total = rows[0]?.total ?? 0;
  return {
    item: await tampilkanProduk(db, rows),
    total,
    halaman,
    jumlahHalaman: Math.max(1, Math.ceil(total / q.perHalaman)),
  };
}

/**
 * Search: full text first, trigram only when that finds nothing (searchProducts). The hits keep their relevance
 * order unless the caller picks a sort. `dimaknai` names the term when a synonym changed it ("cabe" -> "cabai").
 */
export async function cariProduk(db: Executor, teks: string, q: ProdukQuery): Promise<HasilCari> {
  const kosong = { item: [], total: 0, halaman: 1, jumlahHalaman: 1, dimaknai: null, saran: [] };
  const norm = teks.trim();
  if (!norm) return kosong;

  const [{ term }, hits] = await Promise.all([resolveSearchTerm(db, norm), searchProducts(db, norm, MAKS_HASIL_CARI)]);
  const ids = hits.map((h) => h.id);
  const { filter } = filterDari(q);
  let halaman = q.halaman;
  const dasar = { filter: { ...filter, ids }, sort: q.urut ?? ('relevan' as const) };
  let rows = ids.length
    ? await listCatalogCards(db, { ...dasar, page: halaman, perPage: q.perHalaman })
    : [];
  if (rows.length === 0 && halaman > 1) {
    halaman = 1;
    rows = ids.length ? await listCatalogCards(db, { ...dasar, page: 1, perPage: q.perHalaman }) : [];
  }
  const total = rows[0]?.total ?? 0;

  let saran: string[] = [];
  if (total === 0) {
    const populer = await listCatalogCards(db, { sort: 'terlaris', page: 1, perPage: 5 });
    saran = [...new Set(populer.map((p) => p.name.split(' ').slice(0, 2).join(' ')))];
  }
  const dimaknai = term.toLowerCase() !== norm.toLowerCase() ? term : null;
  return {
    item: await tampilkanProduk(db, rows),
    total,
    halaman,
    jumlahHalaman: Math.max(1, Math.ceil(total / q.perHalaman)),
    dimaknai,
    saran,
  };
}

/** Product detail. Drafts, banned and inactive products are not found. */
export async function detailProduk(db: Executor, slug: string): Promise<ProdukTampil> {
  const row = await findCatalogCardBySlug(db, slug);
  if (!row) throw notFound('Produk');
  const [item] = await tampilkanProduk(db, [row]);
  return item!;
}

/** Other products from the same category, sold-out last, best sellers first. Four at most. */
export async function produkTerkait(db: Executor, productId: string): Promise<ProdukTampil[]> {
  const asal = await findCatalogCardById(db, productId);
  if (!asal) throw notFound('Produk');
  const rows = await listCatalogCards(db, {
    filter: { categorySlug: asal.category_slug, excludeProductId: productId },
    sort: 'terlaris',
    page: 1,
    perPage: 4,
  });
  return tampilkanProduk(db, rows);
}

/** Reviews of a product: the latest published ones and the summary. */
export async function ulasanProduk(db: Executor, productId: string) {
  const [rows, ringkas] = await Promise.all([
    listPublicReviews(db, { by: 'product', id: productId, limit: 50 }),
    summarizePublicReviews(db, { by: 'product', id: productId }),
  ]);
  return { item: rows.map(ulasanTampil), ringkasan: ringkasanDari(ringkas) };
}

export async function daftarKategori(db: Executor): Promise<(Kategori & { jumlahProduk: number })[]> {
  const rows = await listCategoriesWithCounts(db, 50);
  return rows.map((k) => ({
    slug: k.slug,
    nama: k.name,
    deskripsi: k.description ?? '',
    ikon: ikonDariKategori(k.slug),
    jumlahProduk: k.product_count,
  }));
}

export async function detailKategori(db: Executor, slug: string): Promise<Kategori> {
  const semua = await daftarKategori(db);
  const hit = semua.find((k) => k.slug === slug);
  if (!hit) throw notFound('Kategori');
  return { slug: hit.slug, nama: hit.nama, deskripsi: hit.deskripsi, ikon: hit.ikon };
}

export async function daftarWilayah(db: Executor) {
  const rows = await listRegencies(db, 100);
  return rows.map((r) => ({ slug: r.slug, nama: r.name, kota: r.is_city }));
}

export async function kecamatanWilayah(db: Executor, slug: string) {
  const wilayah = await findRegencyBySlug(db, slug);
  if (!wilayah) throw notFound('Wilayah');
  const rows = await listDistrictsForRegency(db, wilayah.code, 500);
  return rows.map((d) => ({ nama: d.name }));
}

/**
 * Home page. Three product lists, one hydration pass for all of them, two counts and the popular open wait
 * lists. Surplus is ranked by discount in code, because the discount is computed per request.
 */
export async function beranda(db: Executor) {
  const [terlarisRows, baruRows, surplusRows, populerRows, kategori, stats] = await Promise.all([
    listCatalogCards(db, { filter: { inStockOnly: true }, sort: 'terlaris', page: 1, perPage: 8 }),
    listCatalogCards(db, { filter: { inStockOnly: true }, sort: 'terbaru', page: 1, perPage: 8 }),
    listCatalogCards(db, { filter: { inStockOnly: true, surplusOnly: true }, sort: 'terlaris', page: 1, perPage: 24 }),
    listWaitlistCards(db, { filter: { stillOpen: true }, sort: 'populer', page: 1, perPage: 4 }),
    daftarKategori(db),
    countPublicStats(db),
  ]);
  const [terlaris, baru, surplusSemua] = await Promise.all([
    tampilkanProduk(db, terlarisRows),
    tampilkanProduk(db, baruRows),
    tampilkanProduk(db, surplusRows),
  ]);
  const daftarTungguPopuler: DaftarTungguTampil[] = await tampilkanDaftar(db, populerRows, { linimasa: false });
  return {
    terlaris,
    baruPanen: baru,
    surplus: surplusSemua
      .filter((p) => p.surplusAktif)
      .sort((a, b) => (b.surplusAktif?.diskonPersen ?? 0) - (a.surplusAktif?.diskonPersen ?? 0))
      .slice(0, 8),
    daftarTungguPopuler,
    kategori,
    statistik: {
      petani: stats.petani,
      produk: stats.produk,
      wilayah: stats.wilayah,
      daftarTunggu: stats.daftar_tunggu,
    },
  };
}
