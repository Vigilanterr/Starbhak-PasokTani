import { Hono } from 'hono';
import { cronSecret } from '../middleware/cron-secret';
import { isJobName, jobHandler } from '../jobs';
import type { Executor } from '../repo/executor';
import type { AppBindings, Env } from '../types/env';

export interface CronDeps {
  db: Executor;
  env: Env;
}

/** POST /api/cron/:job. Outside the origin check: the caller is GitHub Actions, not a browser. */
export function cronRoutes({ db, env }: CronDeps) {
  const app = new Hono<AppBindings>();

  app.use('/:job', cronSecret(env.CRON_SECRET));

  app.post('/:job', async (c) => {
    const job = c.req.param('job');
    if (!isJobName(job)) {
      return c.json({ success: false, error: { code: 'job_not_found', message: 'Tugas tidak dikenal' } }, 404);
    }

    const handler = jobHandler(job);
    if (!handler) {
      return c.json({ success: true, data: { job, skipped: true } });
    }

    const result = await handler({ db, requestId: c.get('requestId'), now: new Date() });
    return c.json({ success: true, data: { job, skipped: false, ...result } });
  });

  return app;
}
