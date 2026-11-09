import { Hono } from 'hono';
import { databaseIsUp } from '../services/health.service';
import type { Executor } from '../repo/executor';
import type { AppBindings } from '../types/env';

export function healthRoutes(db: Executor) {
  const app = new Hono<AppBindings>();

  /** Checks the process and a round trip to the database. */
  app.get('/health', async (c) => {
    if (!(await databaseIsUp(db))) {
      return c.json(
        { success: false, error: { code: 'db_unavailable', message: 'Database tidak dapat dijangkau' } },
        503,
      );
    }
    return c.json({ success: true, data: { status: 'ok', database: 'ok' } });
  });

  return app;
}
