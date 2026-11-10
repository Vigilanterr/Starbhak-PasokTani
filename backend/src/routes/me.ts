import { Hono } from 'hono';
import { requireSession, requireViewer } from '../middleware/session';
import { onboardingSchema } from '../validators/account';
import { parseBody } from '../validators/parse';
import { completeOnboarding, getMe } from '../services/account.service';
import type { SessionLookup } from '../lib/session';
import type { Executor } from '../repo/executor';
import type { AppBindings } from '../types/env';

export interface MeDeps {
  db: Executor;
  session: SessionLookup;
}

/** Mounted at /api/v1/me. Sign-up and sign-in stay in Neon Auth; this only adds the profile. */
export function meRoutes({ db, session }: MeDeps) {
  const app = new Hono<AppBindings>();

  /** Signed-in person with their farm profile. 403 onboarding_required before onboarding. */
  app.get('/', requireSession(session), requireViewer(db), async (c) => {
    return c.json({ success: true, data: await getMe(db, c.get('viewer')) });
  });

  /** Creates the profile after first sign-in. Needs only a session, not an onboarded account. */
  app.post('/onboarding', requireSession(session), async (c) => {
    const input = await parseBody(c, onboardingSchema);
    const me = await completeOnboarding(db, c.get('neon'), input);
    return c.json({ success: true, data: me });
  });

  return app;
}
