import type { Env } from '../lib/env';
import type { NeonSession } from '../lib/session';
import type { Viewer } from '../services/account.service';

export type { Env };

/** Hono generics: request-scoped variables set by middleware. */
export type AppBindings = {
  Variables: {
    requestId: string;
    /** Neon Auth identity, set by requireSession. Says nothing about onboarding. */
    neon: NeonSession;
    /** Onboarded, usable account, set by requireViewer. */
    viewer: Viewer;
  };
};
