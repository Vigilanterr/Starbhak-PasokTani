import { Hono } from 'hono';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { originCheck } from './middleware/origin-check';
import { requestId } from './middleware/request-id';
import { cronRoutes } from './routes/cron';
import { healthRoutes } from './routes/health';
import { meRoutes } from './routes/me';
import type { SessionLookup } from './lib/session';
import type { Executor } from './repo/executor';
import type { AppBindings, Env } from './types/env';

export interface AppDeps {
  db: Executor;
  env: Env;
  session: SessionLookup;
}

/**
 * Builds the app from its dependencies, so tests can pass a fake database and a fake session and never touch
 * the network. Mounts under the full path because the Vercel service rewrite forwards it unchanged.
 */
export function createApp(deps: AppDeps) {
  const app = new Hono<AppBindings>();

  app.use('*', requestId);
  app.use('/api/v1/*', originCheck);

  app.route('/api/v1', healthRoutes(deps.db));
  app.route('/api/v1/me', meRoutes(deps));
  app.route('/api/cron', cronRoutes(deps));

  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  return app;
}
