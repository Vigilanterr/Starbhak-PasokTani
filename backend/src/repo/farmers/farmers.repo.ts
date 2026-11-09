import { sql, type UpdateObject } from 'kysely';
import type { Database } from '../db';
import type { Executor } from '../executor';
import { requireTransaction } from '../executor';
import { latOf, lngOf, point, withinMeters, type LngLat } from '../geo';
import type { VerificationStatus } from '../db.generated';

// ---------- Profile ----------

export const FARMER_PROFILE_COLUMNS = [
  'user_id', 'shop_name', 'slug', 'description', 'regency_code', 'district_code', 'address_line',
  'land_area_ha', 'verification_status', 'verified_at', 'auto_cancel_after_hours',
  'self_delivery_enabled', 'self_delivery_fee', 'pickup_enabled', 'rating_avg', 'rating_count',
  'completed_order_count', 'avg_response_minutes', 'created_at', 'updated_at',
] as const;

/** Profile with the farm pin as lng and lat. The location column itself is never returned. */
export function findFarmerProfile(db: Executor, userId: string) {
  return db.selectFrom('farmer_profiles')
    .select(FARMER_PROFILE_COLUMNS)
    .select([
      lngOf('farmer_profiles.location').as('lng'),
      latOf('farmer_profiles.location').as('lat'),
    ])
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export interface NewFarmerProfile {
  userId: string;
  shopName: string;
  slug: string;
  regencyCode: string;
  districtCode: string;
}

/**
 * Get-or-create at farmer onboarding. A replay keeps the existing row.
 * A taken slug still fails with UniqueViolationError, because only user_id is the conflict target.
 */
export async function ensureFarmerProfile(db: Executor, p: NewFarmerProfile) {
  await db.insertInto('farmer_profiles')
    .values({
      user_id: p.userId,
      shop_name: p.shopName,
      slug: p.slug,
      regency_code: p.regencyCode,
      district_code: p.districtCode,
    })
    .onConflict((oc) => oc.column('user_id').doNothing())
    .execute();
  return db.selectFrom('farmer_profiles')
    .select(FARMER_PROFILE_COLUMNS)
    .where('user_id', '=', p.userId)
    .executeTakeFirstOrThrow();
}

/** Only the fields a farmer edits. verification_status and the counters are never written here. */
export interface FarmerProfilePatch {
  shopName?: string;
  description?: string | null;
  addressLine?: string | null;
  location?: LngLat | null;
  landAreaHa?: string | null;
  autoCancelAfterHours?: 12 | 24 | 48 | null;
  selfDeliveryEnabled?: boolean;
  selfDeliveryFee?: string | number | null;
  pickupEnabled?: boolean;
}

/** undefined means no such farmer. An empty patch just reads the profile back. */
export async function updateFarmerProfile(db: Executor, userId: string, p: FarmerProfilePatch) {
  const set: UpdateObject<Database, 'farmer_profiles'> = {};
  if (p.shopName !== undefined) set.shop_name = p.shopName;
  if (p.description !== undefined) set.description = p.description;
  if (p.addressLine !== undefined) set.address_line = p.addressLine;
  if (p.location !== undefined) set.location = p.location ? point(p.location) : null;
  if (p.landAreaHa !== undefined) set.land_area_ha = p.landAreaHa;
  if (p.autoCancelAfterHours !== undefined) set.auto_cancel_after_hours = p.autoCancelAfterHours;
  if (p.selfDeliveryEnabled !== undefined) set.self_delivery_enabled = p.selfDeliveryEnabled;
  if (p.selfDeliveryFee !== undefined) set.self_delivery_fee = p.selfDeliveryFee === null ? null : String(p.selfDeliveryFee);
  if (p.pickupEnabled !== undefined) set.pickup_enabled = p.pickupEnabled;

  if (Object.keys(set).length > 0) {
    const row = await db.updateTable('farmer_profiles').set(set)
      .where('user_id', '=', userId)
      .returning('user_id')
      .executeTakeFirst();
    if (!row) return undefined;
  }
  return findFarmerProfile(db, userId);
}

/**
 * Approved farmers within a radius, nearest first. Uses the GiST index for both the filter
 * and the sort (`<->`), so distance is not computed in ORDER BY.
 */
export function nearFarmersQuery(db: Executor, a: { from: LngLat; radiusMeters: number; status: VerificationStatus; limit: number }) {
  return db.selectFrom('farmer_profiles')
    .innerJoin('users', 'users.id', 'farmer_profiles.user_id')
    .select([
      'farmer_profiles.user_id', 'farmer_profiles.shop_name', 'farmer_profiles.slug',
      'farmer_profiles.rating_avg', 'farmer_profiles.verification_status',
      lngOf('farmer_profiles.location').as('lng'),
      latOf('farmer_profiles.location').as('lat'),
    ])
    .where('users.deleted_at', 'is', null)
    .where('farmer_profiles.verification_status', '=', a.status)
    .where(withinMeters('farmer_profiles.location', a.from, a.radiusMeters))
    .orderBy(sql`farmer_profiles.location <-> ${point(a.from)}`)
    .orderBy('farmer_profiles.user_id')
    .limit(a.limit);
}

export function listFarmersNear(db: Executor, a: Parameters<typeof nearFarmersQuery>[1]) {
  return nearFarmersQuery(db, a).execute();
}

// ---------- Verification ----------

export type VerificationDecision = Extract<VerificationStatus, 'approved' | 'rejected'>;

/**
 * Starts a review. The profile moves to pending first, so a second submit while pending (or after
 * approval) returns undefined and writes nothing. Requires a transaction.
 */
export async function submitVerification(db: Executor, v: {
  farmerId: string;
  ktpNumberEnc: Buffer;
  ktpMediaId: string;
  landMediaId: string;
}) {
  requireTransaction(db, 'submitVerification');
  const moved = await db.updateTable('farmer_profiles')
    .set({ verification_status: 'pending' })
    .where('user_id', '=', v.farmerId)
    .where('verification_status', 'in', ['unverified', 'rejected'])
    .returning('user_id')
    .executeTakeFirst();
  if (!moved) return undefined;
  return db.insertInto('farmer_verifications')
    .values({
      farmer_id: v.farmerId,
      ktp_number_enc: v.ktpNumberEnc,
      ktp_media_id: v.ktpMediaId,
      land_media_id: v.landMediaId,
    })
    .returning(['id', 'farmer_id', 'status', 'submitted_at'])
    .executeTakeFirstOrThrow();
}

/**
 * Records the decision on a pending submission and copies it to the profile.
 * undefined means it was already decided. Requires a transaction.
 */
export async function decideVerification(db: Executor, a: {
  verificationId: string;
  reviewerId: string;
  decision: VerificationDecision;
  reason?: string | null;
}) {
  requireTransaction(db, 'decideVerification');
  const row = await db.updateTable('farmer_verifications')
    .set({
      status: a.decision,
      reviewed_by: a.reviewerId,
      reviewed_at: sql<Date>`now()`,
      rejection_reason: a.decision === 'rejected' ? (a.reason ?? null) : null,
    })
    .where('id', '=', a.verificationId)
    .where('status', '=', 'pending')
    .returning(['id', 'farmer_id', 'status'])
    .executeTakeFirst();
  if (!row) return undefined;
  await db.updateTable('farmer_profiles')
    .set({
      verification_status: a.decision,
      verified_at: a.decision === 'approved' ? sql<Date>`now()` : null,
    })
    .where('user_id', '=', row.farmer_id)
    .execute();
  return row;
}

/** Admin queue, oldest first. Keyset on id, which is UUIDv7 and so sorts by submission time. */
export function listPendingVerifications(db: Executor, afterId: string | null, limit: number) {
  let q = db.selectFrom('farmer_verifications')
    .innerJoin('farmer_profiles', 'farmer_profiles.user_id', 'farmer_verifications.farmer_id')
    .select([
      'farmer_verifications.id', 'farmer_verifications.farmer_id', 'farmer_profiles.shop_name',
      'farmer_verifications.ktp_media_id', 'farmer_verifications.land_media_id',
      'farmer_verifications.submitted_at',
    ])
    .where('farmer_verifications.status', '=', 'pending');
  if (afterId) q = q.where('farmer_verifications.id', '>', afterId);
  return q.orderBy('farmer_verifications.id', 'asc').limit(limit).execute();
}

// ---------- Bank accounts ----------

/** account_number_enc is deliberately absent: callers only ever see the last four digits. */
export const BANK_ACCOUNT_COLUMNS = [
  'id', 'farmer_id', 'bank_code', 'account_number_last4', 'account_holder_name',
  'is_primary', 'verified_at', 'created_at',
] as const;

export interface NewBankAccount {
  farmerId: string;
  bankCode: string;
  accountNumberEnc: Buffer;
  accountNumberLast4: string;
  accountHolderName: string;
  isPrimary?: boolean;
}

/** Inserting a second primary fails with UniqueViolationError (bank_accounts_one_primary). */
export function insertBankAccount(db: Executor, b: NewBankAccount) {
  return db.insertInto('bank_accounts')
    .values({
      farmer_id: b.farmerId,
      bank_code: b.bankCode,
      account_number_enc: b.accountNumberEnc,
      account_number_last4: b.accountNumberLast4,
      account_holder_name: b.accountHolderName,
      is_primary: b.isPrimary ?? false,
    })
    .returning(BANK_ACCOUNT_COLUMNS)
    .executeTakeFirstOrThrow();
}

export function listBankAccounts(db: Executor, farmerId: string, limit: number) {
  return db.selectFrom('bank_accounts')
    .select(BANK_ACCOUNT_COLUMNS)
    .where('farmer_id', '=', farmerId)
    .orderBy('is_primary', 'desc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/**
 * Moves the primary flag. The partial unique index is not deferrable, so the old primary is
 * cleared first. undefined when the account does not belong to this farmer. Requires a transaction.
 */
export async function setPrimaryBankAccount(db: Executor, farmerId: string, accountId: string) {
  requireTransaction(db, 'setPrimaryBankAccount');
  const owned = await db.selectFrom('bank_accounts')
    .select('id')
    .where('id', '=', accountId)
    .where('farmer_id', '=', farmerId)
    .forUpdate()
    .executeTakeFirst();
  if (!owned) return undefined;
  await db.updateTable('bank_accounts').set({ is_primary: false })
    .where('farmer_id', '=', farmerId)
    .where('is_primary', '=', true)
    .execute();
  return db.updateTable('bank_accounts').set({ is_primary: true })
    .where('id', '=', accountId)
    .returning(BANK_ACCOUNT_COLUMNS)
    .executeTakeFirst();
}

// ---------- Operating hours and holidays ----------

export interface OperatingHour {
  weekday: number;
  opensAt: string;
  closesAt: string;
}

/** Replaces the whole week in one transaction. An empty list clears it. Requires a transaction. */
export async function replaceOperatingHours(db: Executor, farmerId: string, hours: OperatingHour[]) {
  requireTransaction(db, 'replaceOperatingHours');
  await db.deleteFrom('farmer_operating_hours').where('farmer_id', '=', farmerId).execute();
  if (hours.length === 0) return [];
  return db.insertInto('farmer_operating_hours')
    .values(hours.map((h) => ({
      farmer_id: farmerId,
      weekday: h.weekday,
      opens_at: h.opensAt,
      closes_at: h.closesAt,
    })))
    .returning(['weekday', 'opens_at', 'closes_at'])
    .execute();
}

export function listOperatingHours(db: Executor, farmerId: string, limit: number) {
  return db.selectFrom('farmer_operating_hours')
    .select(['weekday', 'opens_at', 'closes_at'])
    .where('farmer_id', '=', farmerId)
    .orderBy('weekday', 'asc')
    .limit(limit)
    .execute();
}

/**
 * Adds a holiday for the inclusive day range from..to (YYYY-MM-DD).
 * An overlap with an existing holiday fails with ExclusionViolationError (farmer_holidays_no_overlap).
 */
export function insertHoliday(db: Executor, h: { farmerId: string; from: string; to: string; note?: string | null }) {
  return db.insertInto('farmer_holidays')
    .values({
      farmer_id: h.farmerId,
      period: sql<string>`daterange(${h.from}::date, ${h.to}::date, '[]')`,
      note: h.note ?? null,
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
}

/** Holidays that have not ended yet, in Jakarta time. Dates are inclusive and returned as YYYY-MM-DD. */
export function listUpcomingHolidays(db: Executor, farmerId: string, limit: number) {
  return db.selectFrom('farmer_holidays')
    .select([
      'id', 'note',
      sql<string>`lower(period)::text`.as('starts_on'),
      sql<string>`(upper(period) - 1)::text`.as('ends_on'),
    ])
    .where('farmer_id', '=', farmerId)
    .where(sql<boolean>`upper(period) > (now() at time zone 'Asia/Jakarta')::date`)
    .orderBy('starts_on', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/** Owner-scoped. undefined when the holiday is not this farmer's. */
export function deleteHoliday(db: Executor, farmerId: string, holidayId: string) {
  return db.deleteFrom('farmer_holidays')
    .where('id', '=', holidayId)
    .where('farmer_id', '=', farmerId)
    .returning('id')
    .executeTakeFirst();
}

// ---------- Badges ----------

export function findBadgeByCode(db: Executor, code: string) {
  return db.selectFrom('badges')
    .select(['id', 'code', 'name', 'is_automatic', 'is_active'])
    .where('code', '=', code)
    .executeTakeFirst();
}

/** Badges a farmer holds now (revoked ones are excluded), in display order. */
export function listActiveBadgesForFarmer(db: Executor, farmerId: string, limit: number) {
  return db.selectFrom('farmer_badges')
    .innerJoin('badges', 'badges.id', 'farmer_badges.badge_id')
    .select([
      'farmer_badges.id as farmer_badge_id', 'badges.id as badge_id', 'badges.code', 'badges.name',
      'farmer_badges.awarded_at',
      sql<string | null>`farmer_badges.evaluation_period::text`.as('evaluation_period'),
    ])
    .where('farmer_badges.farmer_id', '=', farmerId)
    .where('farmer_badges.revoked_at', 'is', null)
    .orderBy('badges.sort_order', 'asc')
    .orderBy('badges.id', 'asc')
    .limit(limit)
    .execute();
}

/**
 * Awards a badge. A replay while the badge is still active is a no-op (undefined).
 * The conflict target repeats the partial index predicate: revoked_at IS NULL.
 */
export function awardBadge(db: Executor, a: { farmerId: string; badgeId: string; evaluationPeriod: string | null }) {
  return db.insertInto('farmer_badges')
    .values({
      farmer_id: a.farmerId,
      badge_id: a.badgeId,
      evaluation_period: a.evaluationPeriod,
    })
    .onConflict((oc) => oc.columns(['farmer_id', 'badge_id']).where('revoked_at', 'is', null).doNothing())
    .returning(['id'])
    .executeTakeFirst();
}

/** Revokes an active award and keeps the row as history. undefined when it is already revoked. */
export function revokeBadge(db: Executor, a: { farmerBadgeId: string; reason: string }) {
  return db.updateTable('farmer_badges')
    .set({ revoked_at: sql<Date>`now()`, revoke_reason: a.reason })
    .where('id', '=', a.farmerBadgeId)
    .where('revoked_at', 'is', null)
    .returning(['id', 'farmer_id', 'badge_id'])
    .executeTakeFirst();
}
