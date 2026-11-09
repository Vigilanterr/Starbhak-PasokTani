import type { UserRole, UserStatus } from '../../repo/db.generated';

/** Roles a person can pick at sign-up. Admins are seeded, never self-registered. */
export type SignUpRole = Exclude<UserRole, 'admin'>;

/** What the session middleware puts on the context. `role` is null until the profile row exists. */
export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole | null;
  status: UserStatus | null;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  avatarMediaId: string | null;
  onboardedAt: Date | null;
}
