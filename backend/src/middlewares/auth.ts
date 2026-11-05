import { createMiddleware } from 'hono/factory';
import { verifyToken } from '../utils/jwt.js';
import type { Context } from 'hono';
import type { JwtPayload } from '../modules/auth/auth.types.js';

declare global {
  namespace HonoRequest {
    interface HonoRequest {
      user?: JwtPayload;
    }
  }
}

export const authenticate = createMiddleware(async (c: Context, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return c.json({ success: false, message: 'Unauthorized: No token provided' }, 401);
  }

  const payload = verifyToken(token);
  if (!payload) {
    return c.json({ success: false, message: 'Unauthorized: Invalid token' }, 401);
  }

  c.set('user', payload);
  await next();
});

export const authorize = (allowedRoles: string[]) => {
  return createMiddleware(async (c: Context, next) => {
    const user = c.get('user') as JwtPayload | undefined;

    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ success: false, message: 'Forbidden: Insufficient permissions' }, 403);
    }

    await next();
  });
};
