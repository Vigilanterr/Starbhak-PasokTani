import type { Alamat, BarisKeranjang, Keranjang, KeranjangResepRingkas } from '../contract/tipe';
import type { listAddressViewsForUser } from '../repo/identity/identity.repo';
import type { listCartLines } from '../repo/carts/carts.repo';
import { rupiahToNumber } from '../repo/money';
import { angka, rupiah } from './util';
import { SATUAN_DARI_DB } from './enum';

type AlamatRow = Awaited<ReturnType<typeof listAddressViewsForUser>>[number];
type BarisRow = Awaited<ReturnType<typeof listCartLines>>[number];

export function alamatDari(r: AlamatRow): Alamat {
  return {
    id: r.id,
    label: r.label,
    namaPenerima: r.recipient_name,
    telepon: r.phone,
    kabupaten: r.regency_slug,
    namaKabupaten: r.regency_name,
    kecamatan: r.district_name,
    jalan: r.street,
    kodePos: r.postal_code,
    catatan: r.notes,
    utama: r.is_default,
  };
}

/** One cart line. `alternatif` is the product ids of its alternatives, already in priority order. */
export function barisDari(r: BarisRow, alternatif: string[]): BarisKeranjang {
  const stok = angka(r.available_qty);
  return {
    id: r.id,
    produkId: r.product_id,
    slug: r.slug,
    nama: r.name,
    satuan: SATUAN_DARI_DB[r.unit],
    harga: rupiah(r.price),
    jumlah: angka(r.quantity),
    subtotal: rupiahToNumber(r.subtotal),
    namaToko: r.shop_name,
    stok,
    minPembelian: angka(r.min_order_qty),
    tersedia: r.status === 'active' && stok > 0,
    alternatif,
  };
}

/** The cart with its lines. The subtotal adds BigInt amounts, so no float rounding crosses lines. */
export function keranjangDari(
  cart: { id: string; kind: 'temporary' | 'recipe'; name: string | null; note: string | null },
  baris: BarisKeranjang[],
): Keranjang {
  const subtotal = baris.reduce((total, b) => total + BigInt(b.subtotal), 0n);
  return {
    id: cart.id,
    jenis: cart.kind === 'temporary' ? 'sementara' : 'resep',
    nama: cart.name,
    catatan: cart.note,
    baris,
    subtotal: rupiahToNumber(subtotal),
  };
}

export function keranjangResepDari(cart: { id: string; name: string | null; note: string | null }): KeranjangResepRingkas {
  return { id: cart.id, nama: cart.name ?? '', catatan: cart.note };
}
