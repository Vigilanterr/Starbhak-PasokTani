import type { BarisKeranjang, HalamanKeranjangResep, Keranjang } from '../contract/tipe';
import { AppError, notFound } from '../lib/app-error';
import { barisDari, keranjangDari, keranjangResepDari } from '../mappers/pembeli';
import { findProductById } from '../repo/catalog/catalog.repo';
import {
  addAlternative, addCartItem, createRecipeCart, deleteRecipeCart, findCartForBuyer, getOrCreateTemporaryCart,
  listCartAlternatives, listCartItems, listCartLines, listRecipeCarts, removeCartItem, reorderAlternatives,
  setCartItemQuantity, updateRecipeCart,
} from '../repo/carts/carts.repo';
import { mapDbError, UniqueViolationError } from '../repo/errors';
import type { Executor } from '../repo/executor';
import { withTransaction } from '../repo/executor';
import { numericToNumber } from '../repo/money';

/** Lines per cart. A cart is a shopping list, so the cap is far above a real one and only bounds the work. */
const MAKS_BARIS = 200;
export const MAKS_ALTERNATIF = 3;

type CartRow = NonNullable<Awaited<ReturnType<typeof findCartForBuyer>>>;

const produkTidakDijual = () => new AppError(409, 'state_conflict', 'Produk ini sedang tidak dijual');

/**
 * The cart and its lines, read with the buyer's own id. Sequential on purpose: a transaction runs one
 * statement at a time on its connection.
 */
async function bacaKeranjang(db: Executor, buyerId: string, cart: CartRow): Promise<Keranjang> {
  const lines = await listCartLines(db, { cartId: cart.id, limit: MAKS_BARIS });
  const alts = await listCartAlternatives(db, { buyerId, cartId: cart.id, limit: MAKS_BARIS * MAKS_ALTERNATIF });

  const urutan = new Map<string, string[]>();
  for (const a of alts) urutan.set(a.cart_item_id, [...(urutan.get(a.cart_item_id) ?? []), a.product_id]);
  const baris: BarisKeranjang[] = lines.map((l) => barisDari(l, urutan.get(l.id) ?? []));
  return keranjangDari(cart, baris);
}

/** The cart must belong to the buyer, and to the kind the route asks for. Anything else is a plain 404. */
async function pastikanMilik(db: Executor, buyerId: string, cartId: string, jenis?: 'recipe'): Promise<CartRow> {
  const cart = await findCartForBuyer(db, cartId, buyerId);
  if (!cart || (jenis && cart.kind !== jenis)) throw notFound('Keranjang');
  return cart;
}

/**
 * Stock and minimum checks for one product line. Adding to a cart reserves nothing, so these only stop a line
 * that could never check out. Checkout checks again under lock.
 */
function cekJumlah(produk: { min_order_qty: string; available_qty: string }, jumlah: number): void {
  const min = numericToNumber(produk.min_order_qty);
  if (jumlah < min) {
    throw new AppError(400, 'validation_failed', 'Data yang dikirim tidak valid', { jumlah: `Minimal pembelian ${min}` });
  }
  if (jumlah > numericToNumber(produk.available_qty)) {
    throw new AppError(409, 'out_of_stock', 'Stok tidak mencukupi');
  }
}

/** The id of the buyer's temporary cart, created on first use. Used by the /keranjang routes. */
export function idKeranjangSementara(db: Executor, buyerId: string): Promise<string> {
  return withTransaction(db, async (trx) => (await getOrCreateTemporaryCart(trx, buyerId)).id);
}

// ---------- Carts ----------

/** GET /keranjang. The temporary cart with its lines, created on first use so the header count always has one. */
export function keranjangSementara(db: Executor, buyerId: string): Promise<Keranjang> {
  return withTransaction(db, async (trx) => {
    const cart = await getOrCreateTemporaryCart(trx, buyerId);
    return bacaKeranjang(trx, buyerId, cart);
  });
}

/** Any cart of the buyer by id. `jenis: 'recipe'` refuses the temporary cart, so each route names what it serves. */
export async function keranjangById(db: Executor, buyerId: string, cartId: string, jenis?: 'recipe'): Promise<Keranjang> {
  return bacaKeranjang(db, buyerId, await pastikanMilik(db, buyerId, cartId, jenis));
}

export function daftarKeranjangResep(
  db: Executor,
  buyerId: string,
  q: { setelah?: string; batas: number },
): Promise<HalamanKeranjangResep> {
  return listRecipeCarts(db, { buyerId, afterId: q.setelah ?? null, limit: q.batas }).then((rows) => {
    const halaman = rows.slice(0, q.batas);
    return {
      item: halaman.map(keranjangResepDari),
      berikutnya: rows.length > q.batas ? (halaman.at(-1)?.id ?? null) : null,
    };
  });
}

export function buatKeranjangResep(db: Executor, buyerId: string, input: { nama: string; catatan?: string | null }): Promise<Keranjang> {
  return withTransaction(db, async (trx) => {
    const cart = await createRecipeCart(trx, { buyerId, name: input.nama, note: input.catatan ?? null });
    return bacaKeranjang(trx, buyerId, cart);
  });
}

export function ubahKeranjangResep(
  db: Executor,
  buyerId: string,
  cartId: string,
  input: { nama: string; catatan?: string | null },
): Promise<Keranjang> {
  return withTransaction(db, async (trx) => {
    const cart = await updateRecipeCart(trx, { buyerId, cartId, name: input.nama, note: input.catatan ?? null });
    if (!cart) throw notFound('Keranjang resep');
    return bacaKeranjang(trx, buyerId, cart);
  });
}

export async function hapusKeranjangResep(db: Executor, buyerId: string, cartId: string): Promise<void> {
  await withTransaction(db, async (trx) => {
    const hapus = await deleteRecipeCart(trx, { buyerId, cartId });
    if (!hapus) throw notFound('Keranjang resep');
  });
}

// ---------- Lines ----------

/**
 * Adds a product to a cart, or adds to its quantity when the cart already holds it. The product must be on sale
 * and the amount must meet the product's minimum and stock.
 */
export function tambahBarang(
  db: Executor,
  buyerId: string,
  cartId: string,
  input: { produkId: string; jumlah: number },
  jenis?: 'recipe',
): Promise<Keranjang> {
  return withTransaction(db, async (trx) => {
    const cart = await pastikanMilik(trx, buyerId, cartId, jenis);
    const produk = await findProductById(trx, input.produkId);
    if (!produk) throw notFound('Produk');
    if (produk.status !== 'active') throw produkTidakDijual();
    cekJumlah(produk, input.jumlah);

    await addCartItem(trx, { buyerId, cartId, productId: input.produkId, quantity: input.jumlah });
    return bacaKeranjang(trx, buyerId, cart);
  });
}

/** Sets a line's quantity. The line is re-read after the write, so the minimum and stock check uses the product as stored. */
export function ubahJumlahBarang(
  db: Executor,
  buyerId: string,
  cartId: string,
  itemId: string,
  jumlah: number,
  jenis?: 'recipe',
): Promise<Keranjang> {
  return withTransaction(db, async (trx) => {
    const cart = await pastikanMilik(trx, buyerId, cartId, jenis);
    const hasil = await setCartItemQuantity(trx, { buyerId, cartId, itemId, quantity: jumlah });
    if (!hasil) throw notFound('Barang');

    const line = (await listCartLines(trx, { cartId, limit: MAKS_BARIS })).find((l) => l.id === itemId);
    if (line) cekJumlah(line, jumlah); // a failed check throws, and the transaction rolls the quantity back
    return bacaKeranjang(trx, buyerId, cart);
  });
}

export function hapusBarang(db: Executor, buyerId: string, cartId: string, itemId: string, jenis?: 'recipe'): Promise<Keranjang> {
  return withTransaction(db, async (trx) => {
    const cart = await pastikanMilik(trx, buyerId, cartId, jenis);
    const hasil = await removeCartItem(trx, { buyerId, cartId, itemId });
    if (!hasil) throw notFound('Barang');
    return bacaKeranjang(trx, buyerId, cart);
  });
}

// ---------- Alternatives ----------

/** Appends a product as the item's next alternative, at most MAKS_ALTERNATIF per line. */
export function tambahAlternatif(
  db: Executor,
  buyerId: string,
  cartId: string,
  itemId: string,
  produkId: string,
  jenis?: 'recipe',
): Promise<Keranjang> {
  return withTransaction(db, async (trx) => {
    const cart = await pastikanMilik(trx, buyerId, cartId, jenis);
    await pastikanBarisDiKeranjang(trx, buyerId, cartId, itemId);

    const produk = await findProductById(trx, produkId);
    if (!produk) throw notFound('Produk');
    if (produk.status !== 'active') throw produkTidakDijual();

    const sudah = (await listCartAlternatives(trx, { buyerId, cartId, limit: MAKS_BARIS * MAKS_ALTERNATIF }))
      .filter((a) => a.cart_item_id === itemId);
    if (sudah.length >= MAKS_ALTERNATIF) {
      throw new AppError(409, 'state_conflict', `Alternatif paling banyak ${MAKS_ALTERNATIF} per barang`);
    }

    try {
      const hasil = await addAlternative(trx, { buyerId, cartItemId: itemId, productId: produkId });
      if (!hasil) throw notFound('Barang');
    } catch (error) {
      // A repeat product breaks the unique index on (cart_item_id, product_id). Map it here, since this path skips mapDbError.
      if (mapDbError(error) instanceof UniqueViolationError) {
        throw new AppError(409, 'state_conflict', 'Produk ini sudah ada di daftar alternatif');
      }
      throw error;
    }
    return bacaKeranjang(trx, buyerId, cart);
  });
}

/** Puts the item's alternatives in the given order. The ids must be exactly that item's alternatives. */
export function urutkanAlternatif(
  db: Executor,
  buyerId: string,
  cartId: string,
  itemId: string,
  urutan: string[],
  jenis?: 'recipe',
): Promise<Keranjang> {
  return withTransaction(db, async (trx) => {
    const cart = await pastikanMilik(trx, buyerId, cartId, jenis);
    await pastikanBarisDiKeranjang(trx, buyerId, cartId, itemId);

    // The client sends product ids, as the cart shows them. The rows are keyed by their own ids, so map them here.
    const daftar = (await listCartAlternatives(trx, { buyerId, cartId, limit: MAKS_BARIS * MAKS_ALTERNATIF }))
      .filter((a) => a.cart_item_id === itemId);
    const idBaris = new Map(daftar.map((a) => [a.product_id, a.id]));
    const orderedIds = urutan.map((produkId) => idBaris.get(produkId));

    const hasil = orderedIds.every((id): id is string => id !== undefined)
      ? await reorderAlternatives(trx, { buyerId, cartItemId: itemId, orderedIds })
      : undefined;
    if (!hasil) {
      throw new AppError(400, 'validation_failed', 'Data yang dikirim tidak valid', {
        urutan: 'Daftar tidak sama dengan alternatif barang ini',
      });
    }
    return bacaKeranjang(trx, buyerId, cart);
  });
}

/** Alternatives are keyed by the item id alone, so check the item is in this cart before writing to it. */
async function pastikanBarisDiKeranjang(db: Executor, buyerId: string, cartId: string, itemId: string): Promise<void> {
  const items = await listCartItems(db, { buyerId, cartId, limit: MAKS_BARIS });
  if (!items.some((i) => i.id === itemId)) throw notFound('Barang');
}
