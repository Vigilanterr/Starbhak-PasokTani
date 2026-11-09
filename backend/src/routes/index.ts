import { Hono } from 'hono';
import { daftarTungguRoutes } from './daftar-tunggu';
import { katalogRoutes } from './katalog';
import { petaniRoutes } from './petani';
import type { Executor } from '../repo/executor';
import type { AppBindings } from '../types/env';

/** Every public read of the catalog, mounted once under /api/v1. */
export function publicRoutes(db: Executor) {
  const app = new Hono<AppBindings>();
  app.route('/', katalogRoutes(db));
  app.route('/', petaniRoutes(db));
  app.route('/', daftarTungguRoutes(db));
  return app;
}
