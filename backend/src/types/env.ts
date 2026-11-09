import type { Env } from '../lib/env';

export type { Env };

/** Hono generics: request-scoped variables set by middleware. */
export type AppBindings = {
  Variables: {
    requestId: string;
  };
};
