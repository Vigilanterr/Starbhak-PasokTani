import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import { getSessionUser } from '../lib/session.js';
import { getDb } from '../repo/db';
import { findUserById } from '../repo/identity/identity.repo';
import type { UserRole } from '../repo/db.generated';
import type { AuthUser } from '../modules/auth/auth.types.js';

export const authenticate = createMiddleware(async (c: Context, next) => {
  const session = await getSessionUser(c.req.header('Cookie'));
  if (!session) {
    return c.json({ success: false, message: 'Unauthorized: No valid session' }, 401);
  }

  const profile = await findUserById(getDb(), session.id);
  if (profile?.status === 'suspended') {
    return c.json({ success: false, message: 'Forbidden: Account is suspended' }, 403);
  }

  const user: AuthUser = {
    userId: session.id,
    email: session.email,
    name: session.name,
    role: profile?.role ?? null,
    status: profile?.status ?? null,
  };
  c.set('user', user);
  await next();
});

export const authorize = (allowedRoles: UserRole[]) =>
  createMiddleware(async (c: Context, next) => {
    const user = c.get('user') as AuthUser | undefined;
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return c.json({ success: false, message: 'Forbidden: Insufficient permissions' }, 403);
    }
    await next();
  });
