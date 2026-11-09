import { createHash, timingSafeEqual } from 'node:crypto';
import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '../types/env';

/** Compares digests so the length of the secret does not leak through timing. */
function sameSecret(given: string, expected: string): boolean {
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Requires `Authorization: Bearer <CRON_SECRET>`. The secret comes from the app's env, never a default. */
export function cronSecret(expected: string) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const header = c.req.header('authorization') ?? '';
    const given = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
    if (!given || !sameSecret(given, expected)) {
      return c.json({ success: false, error: { code: 'unauthorized', message: 'Tidak diizinkan' } }, 401);
    }
    await next();
  });
}
