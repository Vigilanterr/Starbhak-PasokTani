import { randomBytes } from 'node:crypto';
import { AppError } from '../lib/app-error';
import { peranDariDb, peranKeDb, type PeranTampil } from '../mappers/peran';
import type { OnboardingInput } from '../validators/account';
import type { NeonSession } from '../lib/session';
import { ensureFarmerProfile, findFarmerProfile } from '../repo/farmers/farmers.repo';
import type { Executor } from '../repo/executor';
import { withActor } from '../repo/executor';
import { findDistrictByName, findRegencyBySlug } from '../repo/identity/reference.repo';
import {
  ensureUser,
  findAccountWithEmail,
  markUserOnboarded,
} from '../repo/identity/identity.repo';

type AccountRow = NonNullable<Awaited<ReturnType<typeof findAccountWithEmail>>>;

/** The signed-in person as the API describes them. Only onboarded, live, active accounts reach a route. */
export interface Viewer {
  id: string;
  email: string;
  peran: PeranTampil;
  nama: string;
  telepon: string | null;
  status: AccountRow['status'];
}

export interface MeProfile extends Viewer {
  toko: {
    nama: string;
    slug: string;
    kodeKabupaten: string;
    kodeKecamatan: string;
    statusVerifikasi: string;
  } | null;
}

export const onboardingRequired = () =>
  new AppError(403, 'onboarding_required', 'Lengkapi profil Anda terlebih dahulu');

const accountInactive = () =>
  new AppError(403, 'account_inactive', 'Akun ini sudah tidak aktif');

const accountSuspended = () =>
  new AppError(403, 'account_suspended', 'Akun ini sedang ditangguhkan');

/** A deleted or suspended account is refused before anything else is read. */
function assertUsable(row: AccountRow): void {
  if (row.deleted_at || row.status === 'deleted') throw accountInactive();
  if (row.status === 'suspended') throw accountSuspended();
}

function viewerOf(row: AccountRow): Viewer {
  return {
    id: row.id,
    email: row.email,
    peran: peranDariDb(row.role),
    nama: row.full_name,
    telepon: row.phone,
    status: row.status,
  };
}

/**
 * Resolves the signed-in person to a usable viewer. Missing or un-onboarded accounts get onboarding_required,
 * so the frontend knows to send them to the onboarding page.
 */
export async function resolveViewer(db: Executor, neon: NeonSession): Promise<Viewer> {
  const row = await findAccountWithEmail(db, neon.id);
  if (!row) throw onboardingRequired();
  assertUsable(row);
  if (!row.onboarded_at) throw onboardingRequired();
  return viewerOf(row);
}

/** GET /me: the viewer plus the farm profile for petani. */
export async function getMe(db: Executor, viewer: Viewer): Promise<MeProfile> {
  return withToko(db, viewer);
}

async function withToko(db: Executor, viewer: Viewer): Promise<MeProfile> {
  if (viewer.peran !== 'petani') return { ...viewer, toko: null };
  const profile = await findFarmerProfile(db, viewer.id);
  return {
    ...viewer,
    toko: profile
      ? {
          nama: profile.shop_name,
          slug: profile.slug,
          kodeKabupaten: profile.regency_code,
          kodeKecamatan: profile.district_code,
          statusVerifikasi: profile.verification_status,
        }
      : null,
  };
}

/** URL-safe name plus a random suffix, so two shops with the same name do not collide on the unique slug. */
export function shopSlug(nama: string): string {
  const base = nama
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  return `${base || 'toko'}-${randomBytes(3).toString('hex')}`;
}

/**
 * POST /me/onboarding. One transaction, so a half-made account never exists. A replay on an onboarded account
 * changes nothing and returns the current profile.
 */
export function completeOnboarding(db: Executor, neon: NeonSession, input: OnboardingInput): Promise<MeProfile> {
  return withActor(db, neon.id, async (trx) => {
    const existing = await findAccountWithEmail(trx, neon.id);
    if (existing) {
      assertUsable(existing);
      if (existing.onboarded_at) return withToko(trx, viewerOf(existing));
    }

    // Validate the farm's location before any write, so a bad regency or district leaves nothing behind.
    let farm: { regencyCode: string; districtCode: string } | undefined;
    if (input.peran === 'petani') {
      const regency = await findRegencyBySlug(trx, input.wilayah!);
      if (!regency) {
        throw new AppError(400, 'validation_failed', 'Data yang dikirim tidak valid', {
          wilayah: 'Wilayah tidak dikenal',
        });
      }
      const district = await findDistrictByName(trx, regency.code, input.kecamatan!);
      if (!district) {
        throw new AppError(400, 'validation_failed', 'Data yang dikirim tidak valid', {
          kecamatan: 'Kecamatan tidak ditemukan di wilayah ini',
        });
      }
      farm = { regencyCode: regency.code, districtCode: district.code };
    }

    const role = peranKeDb(input.peran);
    const user = await ensureUser(trx, { id: neon.id, fullName: input.nama, role, phone: input.telepon ?? null });
    if (user.role !== role) {
      // The row came from an earlier attempt with another role. Refuse rather than guess which role is right.
      throw new AppError(409, 'state_conflict', 'Peran akun ini sudah berbeda, hubungi admin');
    }

    const done = await markUserOnboarded(trx, neon.id, { fullName: input.nama, phone: input.telepon ?? null });
    if (!done) {
      // Another request onboarded this account between our read and this write. Return what is there now.
      const current = await findAccountWithEmail(trx, neon.id);
      if (!current) throw onboardingRequired();
      return withToko(trx, viewerOf(current));
    }

    if (farm && input.namaToko) {
      await ensureFarmerProfile(trx, {
        userId: neon.id,
        shopName: input.namaToko,
        slug: shopSlug(input.namaToko),
        regencyCode: farm.regencyCode,
        districtCode: farm.districtCode,
      });
    }

    const current = await findAccountWithEmail(trx, neon.id);
    if (!current) throw onboardingRequired();
    return withToko(trx, viewerOf(current));
  });
}
