import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (v: string): boolean => UUID.test(v);

/** Rejects the request with 400 unless every named route param is a UUID. */
export const uuidParam = (...names: string[]) =>
  createMiddleware(async (c: Context, next) => {
    for (const name of names) {
      if (!isUuid(c.req.param(name) ?? '')) {
        return c.json({ success: false, message: `Invalid ${name}: expected a UUID` }, 400);
      }
    }
    await next();
  });
