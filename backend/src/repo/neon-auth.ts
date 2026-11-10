import type { Selectable } from 'kysely';

/**
 * Read-only view of neon_auth."user". Neon owns this table: select from it, never write.
 * Only the columns the repo needs are declared.
 */
export interface NeonAuthUserTable {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
}

export type NeonAuthUser = Selectable<NeonAuthUserTable>;

export interface NeonAuthTables {
  'neon_auth.user': NeonAuthUserTable;
}
