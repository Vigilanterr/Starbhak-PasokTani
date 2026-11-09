import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '../types/env';

/** Reuses the incoming x-request-id when it looks sane, otherwise makes one. */
const SAFE_ID = /^[A-Za-z0-9-]{8,64}$/;

export const requestId = createMiddleware<AppBindings>(async (c, next) => {
  const incoming = c.req.header('x-request-id');
  const id = incoming && SAFE_ID.test(incoming) ? incoming : crypto.randomUUID();
  c.set('requestId', id);
  c.header('x-request-id', id);
  await next();
});
