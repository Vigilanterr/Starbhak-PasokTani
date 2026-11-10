import { AppError } from './app-error';

/**
 * Validates a Neon Auth session by forwarding the browser's auth cookies to the auth server.
 * No JWT and no session cache: each call asks the auth server, so a revoked session stops working at once.
 * The app never reads the cookie value itself.
 */
export interface NeonSession {
  id: string;
  email: string;
  name: string;
}

export interface SessionRequest {
  /** Raw Cookie header from the browser, or undefined. */
  cookie: string | undefined;
  /** Public origin of the page that made the call, such as https://pasoktani.example. */
  origin: string;
}

export type SessionLookup = (req: SessionRequest) => Promise<NeonSession | null>;

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const AUTH_COOKIE = /^__Secure-neon-auth\./;

/** Keeps only Neon Auth's own cookies. Other browser cookies never reach the auth server. */
export function neonAuthCookies(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const kept = header
    .split(';')
    .map((part) => part.trim())
    .filter((part) => AUTH_COOKIE.test(part));
  return kept.length > 0 ? kept.join('; ') : undefined;
}

/** Public origin from the forwarded host, so previews and production both work. */
export function publicOrigin(headers: { host?: string; forwardedHost?: string; forwardedProto?: string }): string {
  const host = headers.forwardedHost ?? headers.host ?? 'localhost:3000';
  const proto = headers.forwardedProto ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function createSessionLookup(opts: { authBaseUrl: string; fetch?: FetchLike }): SessionLookup {
  const base = opts.authBaseUrl.replace(/\/$/, '');
  const doFetch: FetchLike = opts.fetch ?? ((input, init) => fetch(input, init));

  return async ({ cookie, origin }) => {
    const forwarded = neonAuthCookies(cookie);
    if (!forwarded) return null;

    let res: Response;
    try {
      res = await doFetch(`${base}/get-session`, {
        headers: { Cookie: forwarded, Origin: origin },
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      // The auth server is down or slow. Not the caller's fault, so not a 401.
      throw new AppError(503, 'auth_unavailable', 'Layanan masuk sedang tidak tersedia, coba lagi');
    }
    if (res.status >= 500) {
      throw new AppError(503, 'auth_unavailable', 'Layanan masuk sedang tidak tersedia, coba lagi');
    }
    if (!res.ok) return null;

    const body = (await res.json().catch(() => null)) as { user?: { id?: unknown; email?: unknown; name?: unknown } } | null;
    const user = body?.user;
    if (typeof user?.id !== 'string' || typeof user.email !== 'string') return null;
    return { id: user.id, email: user.email, name: typeof user.name === 'string' ? user.name : '' };
  };
}
