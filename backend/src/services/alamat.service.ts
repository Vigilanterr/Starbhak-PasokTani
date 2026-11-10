import type { Alamat } from '../contract/tipe';
import { AppError, notFound } from '../lib/app-error';
import { alamatDari } from '../mappers/pembeli';
import type { Executor } from '../repo/executor';
import { withTransaction } from '../repo/executor';
import { findDistrictByName, findRegencyBySlug } from '../repo/identity/reference.repo';
import {
  insertAddress, listAddressesForUser, listAddressViewsForUser, setDefaultAddress,
} from '../repo/identity/identity.repo';
import type { AlamatInput } from '../validators/pembeli';

/** Addresses per buyer. A buyer needs a handful; the cap bounds the list and stops runaway writes. */
export const MAKS_ALAMAT = 20;

export function daftarAlamat(db: Executor, buyerId: string): Promise<Alamat[]> {
  return listAddressViewsForUser(db, buyerId, MAKS_ALAMAT).then((rows) => rows.map(alamatDari));
}

/**
 * Adds an address. The first one is the default without asking, since checkout needs a default. The regency and
 * district are looked up before any write, so a wrong name leaves nothing behind. Returns the whole list.
 */
export function tambahAlamat(db: Executor, buyerId: string, input: AlamatInput): Promise<Alamat[]> {
  return withTransaction(db, async (trx) => {
    const regency = await findRegencyBySlug(trx, input.kabupaten);
    if (!regency) {
      throw new AppError(400, 'validation_failed', 'Data yang dikirim tidak valid', { kabupaten: 'Kabupaten tidak dikenal' });
    }
    const district = await findDistrictByName(trx, regency.code, input.kecamatan);
    if (!district) {
      throw new AppError(400, 'validation_failed', 'Data yang dikirim tidak valid', {
        kecamatan: 'Kecamatan tidak ditemukan di kabupaten ini',
      });
    }

    const yangAda = await listAddressesForUser(trx, buyerId, MAKS_ALAMAT + 1);
    if (yangAda.length >= MAKS_ALAMAT) {
      throw new AppError(409, 'state_conflict', `Alamat paling banyak ${MAKS_ALAMAT}`);
    }

    const baru = await insertAddress(trx, {
      userId: buyerId,
      label: input.label,
      recipientName: input.namaPenerima,
      phone: input.telepon,
      regencyCode: regency.code,
      districtCode: district.code,
      street: input.jalan,
      postalCode: input.kodePos ?? null,
      notes: input.catatan ?? null,
    });
    if (input.utama || yangAda.length === 0) {
      await setDefaultAddress(trx, buyerId, baru.id);
    }
    return daftarAlamat(trx, buyerId);
  });
}

/** Makes one of the buyer's addresses the default. A guessed id of another buyer's address is a 404. */
export function jadikanAlamatUtama(db: Executor, buyerId: string, addressId: string): Promise<Alamat[]> {
  return withTransaction(db, async (trx) => {
    const hasil = await setDefaultAddress(trx, buyerId, addressId);
    if (!hasil) throw notFound('Alamat');
    return daftarAlamat(trx, buyerId);
  });
}
