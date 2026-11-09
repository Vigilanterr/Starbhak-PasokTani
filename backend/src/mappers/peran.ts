import type { UserRole } from '../repo/db.generated';
import type { OnboardingRole } from '../repo/identity/identity.repo';

/** Roles a person can choose at onboarding. The JSON names match the frontend (`tipe.ts`, `auth-api.ts`). */
export const PERAN_DAFTAR = ['konsumen', 'umkm', 'petani'] as const;
export type PeranDaftar = (typeof PERAN_DAFTAR)[number];

/** Every role the JSON can show, including admin, which nobody can pick. */
export type PeranTampil = PeranDaftar | 'admin';

const KE_DB: Record<PeranDaftar, OnboardingRole> = {
  konsumen: 'consumer',
  umkm: 'umkm',
  petani: 'farmer',
};

const DARI_DB: Record<UserRole, PeranTampil> = {
  consumer: 'konsumen',
  umkm: 'umkm',
  farmer: 'petani',
  admin: 'admin',
};

const ROLE_DB_DARI_PERAN: Record<PeranTampil, UserRole> = {
  konsumen: 'consumer',
  umkm: 'umkm',
  petani: 'farmer',
  admin: 'admin',
};

export function peranKeDb(peran: PeranDaftar): OnboardingRole {
  return KE_DB[peran];
}

export function peranDariDb(role: UserRole): PeranTampil {
  return DARI_DB[role];
}

export function roleDbDariPeran(peran: PeranTampil): UserRole {
  return ROLE_DB_DARI_PERAN[peran];
}
