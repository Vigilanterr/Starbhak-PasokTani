import { z } from 'zod';
import { PERAN_DAFTAR } from '../mappers/peran';

const teks = (min: number, max: number, nama: string) =>
  z
    .string({ required_error: `${nama} wajib diisi` })
    .trim()
    .min(min, `${nama} minimal ${min} karakter`)
    .max(max, `${nama} maksimal ${max} karakter`);

/**
 * Body of POST /me/onboarding. `wilayah` is the regency slug (`kabupaten-bandung`, from `frontend/src/lib/wilayah.ts`)
 * and `kecamatan` is the district name typed in the form, matched inside that regency. The toko fields apply to petani only.
 */
export const onboardingSchema = z
  .object({
    peran: z.enum(PERAN_DAFTAR, {
      errorMap: () => ({ message: 'Pilih konsumen, UMKM, atau petani' }),
    }),
    nama: teks(2, 120, 'Nama'),
    telepon: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{8,15}$/, 'Nomor telepon tidak valid')
      .nullish(),
    namaToko: teks(3, 120, 'Nama toko').optional(),
    wilayah: teks(1, 80, 'Wilayah').optional(),
    kecamatan: teks(1, 80, 'Kecamatan').optional(),
  })
  .superRefine((v, ctx) => {
    if (v.peran !== 'petani') return;
    if (!v.namaToko) ctx.addIssue({ code: 'custom', path: ['namaToko'], message: 'Nama toko wajib diisi' });
    if (!v.wilayah) ctx.addIssue({ code: 'custom', path: ['wilayah'], message: 'Wilayah wajib dipilih' });
    if (!v.kecamatan) ctx.addIssue({ code: 'custom', path: ['kecamatan'], message: 'Kecamatan wajib dipilih' });
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;
