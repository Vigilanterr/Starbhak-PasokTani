import { createMiddleware } from 'hono/factory';
import { AppError } from '../lib/app-error';
import { publicOrigin, type NeonSession, type SessionLookup } from '../lib/session';
import { roleDbDariPeran } from '../mappers/peran';
import { resolveViewer, type Viewer } from '../services/account.service';
import type { Executor } from '../repo/executor';
import type { UserRole } from '../repo/db.generated';
import type { AppBindings } from '../types/env';

/** Asks Neon Auth who the cookie belongs to. Sets `neon`. Does not check onboarding. */
export function requireSession(session: SessionLookup) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const neon = await session({
      cookie: c.req.header('cookie'),
      origin: publicOrigin({
        host: c.req.header('host'),
        forwardedHost: c.req.header('x-forwarded-host'),
        forwardedProto: c.req.header('x-forwarded-proto'),
      }),
    });
    if (!neon) throw new AppError(401, 'unauthorized', 'Silakan masuk terlebih dahulu');
    c.set('neon', neon);
    await next();
  });
}

/** Loads the onboarded, usable account for the session. Sets `viewer`. Requires requireSession before it. */
export function requireViewer(db: Executor) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const neon = c.get('neon') as NeonSession | undefined;
    if (!neon) throw new AppError(401, 'unauthorized', 'Silakan masuk terlebih dahulu');
    c.set('viewer', await resolveViewer(db, neon));
    await next();
  });
}

/** Admits only the listed DB roles. Requires requireViewer before it. */
export function requireRole(...roles: UserRole[]) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const viewer = c.get('viewer') as Viewer | undefined;
    if (!viewer) throw new AppError(401, 'unauthorized', 'Silakan masuk terlebih dahulu');
    if (!roles.includes(roleDbDariPeran(viewer.peran))) {
      throw new AppError(403, 'forbidden', 'Anda tidak memiliki akses ke halaman ini');
    }
    await next();
  });
}
