/**
 * Validates a Neon Auth session by forwarding the caller's cookie to the auth server.
 * A fresh request per call on purpose: a shared client with a session cache could hand one
 * user's session to another.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

function authBaseUrl(): string {
  const url = process.env.NEON_AUTH_BASE_URL;
  if (!url) throw new Error('NEON_AUTH_BASE_URL is not set');
  return url.replace(/\/$/, '');
}

export async function getSessionUser(cookie: string | undefined): Promise<SessionUser | null> {
  if (!cookie) return null;
  const res = await fetch(`${authBaseUrl()}/get-session`, {
    headers: { Cookie: cookie, Origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' },
  });
  if (!res.ok) return null;
  const body = (await res.json().catch(() => null)) as { user?: { id?: string; email?: string; name?: string } } | null;
  const user = body?.user;
  if (!user?.id || !user.email) return null;
  return { id: user.id, email: user.email, name: user.name ?? '' };
}
