import { z } from 'zod';

/**
 * Bodies and query strings for the buyer routes: addresses, carts and wait-list follows. Field names match the
 * contract (`Alamat`, `BarisKeranjang`, `HalamanKeranjangResep`). Quantities are numeric(12,3) in the database,
 * so more than three decimals is refused here rather than failing at the CHECK.
 */

const teks = (min: number, max: number, nama: string) =>
  z
    .string({ required_error: `${nama} wajib diisi` })
    .trim()
    .min(min, `${nama} minimal ${min} karakter`)
    .max(max, `${nama} maksimal ${max} karakter`);

const uuid = z.string({ required_error: 'Id wajib diisi' }).uuid('Format tidak valid');

const jumlah = z
  .number({ required_error: 'Jumlah wajib diisi', invalid_type_error: 'Jumlah harus berupa angka' })
  .finite('Jumlah tidak valid')
  .positive('Jumlah harus lebih dari 0')
  .max(100_000, 'Jumlah terlalu besar')
  .refine((v) => Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6, 'Jumlah maksimal 3 desimal');

const catatan = z.string().trim().max(200, 'Catatan maksimal 200 karakter').nullish();

/** Body of POST /me/alamat. `kabupaten` is the regency slug and `kecamatan` the district name, as at onboarding. */
export const alamatSchema = z.object({
  label: teks(1, 40, 'Label'),
  namaPenerima: teks(2, 120, 'Nama penerima'),
  telepon: z
    .string({ required_error: 'Nomor telepon wajib diisi' })
    .trim()
    .regex(/^\+?[0-9]{8,15}$/, 'Nomor telepon tidak valid'),
  kabupaten: teks(1, 80, 'Kabupaten'),
  kecamatan: teks(1, 80, 'Kecamatan'),
  jalan: teks(5, 200, 'Alamat'),
  kodePos: z.string().trim().regex(/^[0-9]{5}$/, 'Kode pos harus 5 angka').nullish(),
  catatan,
  utama: z.boolean().optional(),
});
export type AlamatInput = z.infer<typeof alamatSchema>;

export const tambahBarangSchema = z.object({ produkId: uuid, jumlah });
export const ubahJumlahSchema = z.object({ jumlah });

/** Alternatives are capped at three, as the Keranjang Resep screen shows Alternative 1 to 3. `urutan` lists product ids, first is priority 1. */
export const alternatifSchema = z.object({ produkId: uuid });
export const urutanAlternatifSchema = z.object({ urutan: z.array(uuid).min(1, 'Urutan kosong').max(3, 'Alternatif maksimal 3') });

export const keranjangResepSchema = z.object({
  nama: teks(1, 50, 'Nama grup'),
  catatan,
});
export type KeranjangResepInput = z.infer<typeof keranjangResepSchema>;

export const daftarResepQuery = z.object({
  setelah: uuid.optional(),
  batas: z.coerce.number().int().min(1).max(50).default(20),
});
