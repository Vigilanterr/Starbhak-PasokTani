import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '../types/env';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Cookie-based CSRF guard. For unsafe methods, a present Origin must match the host the
 * browser actually called. Behind a Vercel service rewrite the internal Host can differ, so
 * the forwarded host is compared first. Requests with no Origin (server-to-server) pass.
 * Routes that receive webhooks or cron calls mount outside this middleware.
 */
export const originCheck = createMiddleware<AppBindings>(async (c, next) => {
  if (SAFE_METHODS.has(c.req.method)) return next();

  const origin = c.req.header('origin');
  if (origin === undefined) return next();

  const publicHost = c.req.header('x-forwarded-host') ?? c.req.header('host');
  let originHost: string | undefined;
  try {
    originHost = new URL(origin).host;
  } catch {
    originHost = undefined;
  }

  if (!originHost || !publicHost || originHost !== publicHost) {
    return c.json(
      { success: false, error: { code: 'csrf_failed', message: 'Permintaan ditolak: asal tidak dikenali' } },
      403,
    );
  }
  return next();
});
