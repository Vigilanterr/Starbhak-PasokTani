import { sql } from 'kysely';
import type { Executor } from '../executor';
import { requireTransaction } from '../executor';
import { latOf, lngOf, point, type LngLat } from '../geo';
import type { MediaKind, NotificationCategory, NotificationFrequency, UserRole } from '../db.generated';

// ---------- Users ----------

/** Nothing else can create an admin: admins are seeded (schema comment on users.role). */
export type OnboardingRole = Exclude<UserRole, 'admin'>;

export const USER_COLUMNS = [
  'id', 'full_name', 'phone', 'role', 'status', 'avatar_media_id',
  'onboarded_at', 'last_seen_at', 'created_at', 'updated_at', 'deleted_at',
] as const;

/** Live user by id. Soft-deleted rows are hidden. */
export function findUserById(db: Executor, userId: string) {
  return db.selectFrom('users')
    .select(USER_COLUMNS)
    .where('id', '=', userId)
    .where('deleted_at', 'is', null)
    .executeTakeFirst();
}

/** Live user with the email from neon_auth.user (read-only, Neon owns it). */
export function findUserWithEmail(db: Executor, userId: string) {
  return db.selectFrom('users')
    .innerJoin('neon_auth.user as na', 'na.id', 'users.id')
    .select([
      'users.id', 'users.full_name', 'users.phone', 'users.role', 'users.status',
      'users.onboarded_at', 'users.avatar_media_id', 'na.email as email',
    ])
    .where('users.id', '=', userId)
    .where('users.deleted_at', 'is', null)
    .executeTakeFirst();
}

export interface NewUser {
  id: string;
  fullName: string;
  role: OnboardingRole;
  phone?: string | null;
}

/**
 * Get-or-create at first sign-in. The replay is a no-op, so the existing row wins.
 * Fails with ForeignKeyViolationError when the id has no neon_auth.user row.
 * Not in a transaction on its own: the insert is idempotent, so a service may call it anywhere.
 */
export async function ensureUser(db: Executor, u: NewUser) {
  await db.insertInto('users')
    .values({ id: u.id, full_name: u.fullName, role: u.role, phone: u.phone ?? null })
    .onConflict((oc) => oc.column('id').doNothing())
    .execute();
  // No deleted_at filter here: the service decides what a soft-deleted user means.
  return db.selectFrom('users').select(USER_COLUMNS).where('id', '=', u.id).executeTakeFirstOrThrow();
}

/** Sets onboarded_at once. undefined means missing, soft-deleted or already onboarded. */
export function markUserOnboarded(db: Executor, userId: string, profile: { fullName: string; phone: string | null }) {
  return db.updateTable('users')
    .set({ onboarded_at: sql<Date>`now()`, full_name: profile.fullName, phone: profile.phone })
    .where('id', '=', userId)
    .where('deleted_at', 'is', null)
    .where('onboarded_at', 'is', null)
    .returning(USER_COLUMNS)
    .executeTakeFirst();
}

/**
 * Presence flush: every user with a live Redis presence key was seen just now, so last_seen_at is Postgres
 * now() rather than a time from the caller. Soft-deleted users are skipped. Returns the number of rows changed.
 * One array parameter, so a large flush cannot reach the bind parameter limit. An empty list returns early.
 */
export async function markUsersSeen(db: Executor, userIds: string[]): Promise<number> {
  if (userIds.length === 0) return 0;
  const result = await db.updateTable('users')
    .set({ last_seen_at: sql<Date>`now()` })
    .where(sql<boolean>`id = any(${userIds}::uuid[])`)
    .where('deleted_at', 'is', null)
    .executeTakeFirst();
  return Number(result.numUpdatedRows);
}

/**
 * Deleted media whose Cloudinary asset has not been destroyed yet, oldest first. Plain read, no lock: the job
 * takes pg_try_advisory_xact_lock so one instance runs, and a Cloudinary destroy is safe to repeat. A lock would
 * be released before the network call anyway. Matches media_assets_awaiting_destroy.
 */
export function listMediaAwaitingDestroy(db: Executor, limit: number) {
  return db.selectFrom('media_assets')
    .select(['id', 'owner_id', 'kind', 'cloudinary_public_id', 'delivery_type', 'created_at'])
    .where('status', '=', 'deleted')
    .where('destroyed_at', 'is', null)
    .orderBy('created_at', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/** Records that the Cloudinary asset is gone. Returns the ids that changed; a replay returns an empty list. */
export async function markMediaDestroyed(db: Executor, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await db.updateTable('media_assets')
    .set({ destroyed_at: sql<Date>`now()` })
    .where('id', 'in', ids)
    .where('status', '=', 'deleted')
    .where('destroyed_at', 'is', null)
    .returning('id')
    .execute();
  return rows.map((r) => r.id);
}

// ---------- Addresses ----------

export const ADDRESS_COLUMNS = [
  'id', 'user_id', 'label', 'recipient_name', 'phone', 'regency_code', 'district_code',
  'street', 'postal_code', 'notes', 'is_default', 'created_at', 'updated_at',
] as const;

export interface NewAddress {
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  regencyCode: string;
  districtCode: string;
  street: string;
  postalCode?: string | null;
  notes?: string | null;
  location?: LngLat | null;
}

/** Inserts with is_default = false. Use setDefaultAddress to make it the default. */
export function insertAddress(db: Executor, a: NewAddress) {
  return db.insertInto('addresses')
    .values({
      user_id: a.userId,
      label: a.label,
      recipient_name: a.recipientName,
      phone: a.phone,
      regency_code: a.regencyCode,
      district_code: a.districtCode,
      street: a.street,
      postal_code: a.postalCode ?? null,
      notes: a.notes ?? null,
      location: a.location ? point(a.location) : null,
    })
    .returning([...ADDRESS_COLUMNS, lngOf('location').as('lng'), latOf('location').as('lat')])
    .executeTakeFirstOrThrow();
}

/** All addresses of one user, default first. `id` breaks the tie, so the order is unique. */
export function listAddressesForUser(db: Executor, userId: string, limit: number) {
  return db.selectFrom('addresses')
    .select([...ADDRESS_COLUMNS, lngOf('location').as('lng'), latOf('location').as('lat')])
    .where('user_id', '=', userId)
    .orderBy('is_default', 'desc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/** Owner-scoped read: a guessed address id of another user returns undefined. */
export function findAddressForUser(db: Executor, addressId: string, userId: string) {
  return db.selectFrom('addresses')
    .select([...ADDRESS_COLUMNS, lngOf('location').as('lng'), latOf('location').as('lat')])
    .where('id', '=', addressId)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

/**
 * Makes one address the user's default. Must run inside a transaction.
 *
 * addresses_one_default is not deferrable, so the old default is cleared before the new one
 * is set. The target row is locked and checked for ownership first, so a wrong id returns
 * undefined before anything is cleared.
 */
export async function setDefaultAddress(db: Executor, userId: string, addressId: string) {
  requireTransaction(db, 'setDefaultAddress');
  const target = await db.selectFrom('addresses')
    .select('id')
    .where('id', '=', addressId)
    .where('user_id', '=', userId)
    .forUpdate()
    .executeTakeFirst();
  if (!target) return undefined;

  await db.updateTable('addresses')
    .set({ is_default: false })
    .where('user_id', '=', userId)
    .where('is_default', '=', true)
    .where('id', '<>', addressId)
    .execute();

  return db.updateTable('addresses')
    .set({ is_default: true })
    .where('id', '=', addressId)
    .where('user_id', '=', userId)
    .returning(ADDRESS_COLUMNS)
    .executeTakeFirst();
}

// ---------- Media ----------

export const MEDIA_COLUMNS = [
  'id', 'owner_id', 'kind', 'status', 'cloudinary_public_id', 'cloudinary_version',
  'delivery_type', 'format', 'width', 'height', 'bytes',
  sql<string | null>`taken_on::text`.as('taken_on'),
  'created_at', 'ready_at',
] as const;

export interface NewMedia {
  ownerId: string;
  kind: MediaKind;
  cloudinaryPublicId: string;
  deliveryType?: 'upload' | 'authenticated';
  /** 'YYYY-MM-DD' in the WIB calendar. Written as text, so pg never shifts it. */
  takenOn?: string | null;
}

/** Records an upload that is still pending. The browser reports back after Cloudinary confirms it. */
export function insertMediaAsset(db: Executor, m: NewMedia) {
  return db.insertInto('media_assets')
    .values({
      owner_id: m.ownerId,
      kind: m.kind,
      cloudinary_public_id: m.cloudinaryPublicId,
      delivery_type: m.deliveryType ?? 'upload',
      taken_on: m.takenOn ?? null,
    })
    .returning(MEDIA_COLUMNS)
    .executeTakeFirstOrThrow();
}

export interface MediaReady {
  id: string;
  ownerId: string;
  cloudinaryVersion: number | string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/** pending -> ready, guarded by owner and state. undefined means not pending or not theirs. */
export function markMediaReady(db: Executor, m: MediaReady) {
  return db.updateTable('media_assets')
    .set({
      status: 'ready',
      ready_at: sql<Date>`now()`,
      cloudinary_version: m.cloudinaryVersion,
      format: m.format,
      width: m.width,
      height: m.height,
      bytes: m.bytes,
    })
    .where('id', '=', m.id)
    .where('owner_id', '=', m.ownerId)
    .where('status', '=', 'pending')
    .returning(MEDIA_COLUMNS)
    .executeTakeFirst();
}

/** Pending uploads older than 24 hours, oldest first, for the cleanup job. */
export function listStalePendingMedia(db: Executor, limit: number) {
  return db.selectFrom('media_assets')
    .select(['id', 'owner_id', 'kind', 'cloudinary_public_id', 'delivery_type', 'created_at'])
    .where('status', '=', 'pending')
    .where('created_at', '<', sql<Date>`now() - interval '24 hours'`)
    .orderBy('created_at', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/**
 * Marks media as deleted: the parent is gone (or the upload was abandoned), so the Cloudinary asset is now due
 * to be destroyed. It does not mean the asset is destroyed yet; markMediaDestroyed records that.
 * Returns the ids that changed. An empty list is not sent to Postgres.
 */
export async function markMediaDeleted(db: Executor, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await db.updateTable('media_assets')
    .set({ status: 'deleted' })
    .where('id', 'in', ids)
    .where('status', 'in', ['pending', 'ready'])
    .returning('id')
    .execute();
  return rows.map((r) => r.id);
}

// ---------- Notifications and push ----------

export const PREFERENCE_COLUMNS = ['user_id', 'category', 'web_enabled', 'frequency'] as const;

/** Missing rows mean the default (on, instant), so a list is partial by design. */
export function listNotificationPreferences(db: Executor, userId: string, limit: number) {
  return db.selectFrom('notification_preferences')
    .select(PREFERENCE_COLUMNS)
    .where('user_id', '=', userId)
    .orderBy('category', 'asc')
    .limit(limit)
    .execute();
}

export interface NotificationPreferenceInput {
  userId: string;
  category: NotificationCategory;
  webEnabled: boolean;
  frequency: NotificationFrequency;
}

export function upsertNotificationPreference(db: Executor, p: NotificationPreferenceInput) {
  return db.insertInto('notification_preferences')
    .values({ user_id: p.userId, category: p.category, web_enabled: p.webEnabled, frequency: p.frequency })
    .onConflict((oc) => oc.columns(['user_id', 'category']).doUpdateSet({
      web_enabled: p.webEnabled,
      frequency: p.frequency,
    }))
    .returning(PREFERENCE_COLUMNS)
    .executeTakeFirstOrThrow();
}

export const PUSH_COLUMNS = [
  'id', 'user_id', 'endpoint', 'p256dh', 'auth', 'user_agent', 'created_at', 'last_success_at',
] as const;

export interface PushSubscriptionInput {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}

/**
 * Keyed by endpoint. A replay updates the keys and the user. The same browser signing
 * in as someone else gets its endpoint moved to that user.
 */
export function upsertPushSubscription(db: Executor, s: PushSubscriptionInput) {
  return db.insertInto('push_subscriptions')
    .values({
      user_id: s.userId,
      endpoint: s.endpoint,
      p256dh: s.p256dh,
      auth: s.auth,
      user_agent: s.userAgent ?? null,
    })
    .onConflict((oc) => oc.column('endpoint').doUpdateSet({
      user_id: s.userId,
      p256dh: s.p256dh,
      auth: s.auth,
      user_agent: s.userAgent ?? null,
    }))
    .returning(PUSH_COLUMNS)
    .executeTakeFirstOrThrow();
}

export function listPushSubscriptions(db: Executor, userId: string, limit: number) {
  return db.selectFrom('push_subscriptions')
    .select(PUSH_COLUMNS)
    .where('user_id', '=', userId)
    .orderBy('created_at', 'asc')
    .orderBy('id', 'asc')
    .limit(limit)
    .execute();
}

/** Owner-scoped delete. undefined means nothing matched. */
export function deletePushSubscription(db: Executor, userId: string, endpoint: string) {
  return db.deleteFrom('push_subscriptions')
    .where('user_id', '=', userId)
    .where('endpoint', '=', endpoint)
    .returning('id')
    .executeTakeFirst();
}

export function markPushSucceeded(db: Executor, id: string) {
  return db.updateTable('push_subscriptions')
    .set({ last_success_at: sql<Date>`now()` })
    .where('id', '=', id)
    .returning(PUSH_COLUMNS)
    .executeTakeFirst();
}
