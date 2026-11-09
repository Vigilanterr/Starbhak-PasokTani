import { neonAuth, signUpWithEmail } from '../../lib/neon-auth.js';
import { getDb } from '../../repo/db';
import { withTransaction } from '../../repo/executor';
import { ensureUser, findUserWithEmail } from '../../repo/identity/identity.repo';
import type { RegisterInput, LoginInput } from './auth.schema.js';
import type { UserProfile } from './auth.types.js';

export class AuthError extends Error {
  constructor(message: string, readonly status: 400 | 401 | 403 | 404 | 409 = 400) {
    super(message);
  }
}

export const authService = {
  /** Creates the Neon Auth account, then the app profile row for it. */
  async register(data: RegisterInput): Promise<UserProfile> {
    const up = await signUpWithEmail(data.email, data.password, data.fullName);
    if (up.error || !up.data?.user) {
      throw new AuthError(up.error?.message ?? 'Registration failed', 400);
    }
    const id = up.data.user.id;
    await withTransaction(getDb(), (trx) =>
      ensureUser(trx, { id, fullName: data.fullName, role: data.role, phone: data.phone ?? null }),
    );
    return authService.getCurrentUser(id);
  },

  /** Signs in through Neon Auth. Returns the cookies to hand to the client. */
  async login(data: LoginInput): Promise<{ profile: UserProfile | null; setCookies: string[] }> {
    let setCookies: string[] = [];
    const res = await neonAuth.signIn.email({
      email: data.email,
      password: data.password,
      fetchOptions: {
        headers: { Origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' },
        onSuccess: (ctx: { response: Response }) => {
          setCookies = ctx.response.headers.getSetCookie();
        },
      },
    });
    if (res.error || !res.data?.user) throw new AuthError('Invalid email or password', 401);

    const profile = await findUserWithEmail(getDb(), res.data.user.id);
    if (profile?.status === 'suspended') throw new AuthError('Account is suspended', 403);
    return { profile: profile ? toProfile(profile) : null, setCookies };
  },

  async getCurrentUser(userId: string): Promise<UserProfile> {
    const row = await findUserWithEmail(getDb(), userId);
    if (!row) throw new AuthError('User not found', 404);
    return toProfile(row);
  },
};

function toProfile(row: NonNullable<Awaited<ReturnType<typeof findUserWithEmail>>>): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    role: row.role,
    status: row.status,
    avatarMediaId: row.avatar_media_id,
    onboardedAt: row.onboarded_at,
  };
}
