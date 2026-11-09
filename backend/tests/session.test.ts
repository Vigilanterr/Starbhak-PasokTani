import { describe, expect, test } from 'bun:test';
import { AppError } from '../src/lib/app-error';
import { createSessionLookup, neonAuthCookies, publicOrigin } from '../src/lib/session';

const AUTH = 'https://auth.example.test/neondb/auth';

/** A fetch stub that records what it was asked and answers with the given response. */
function stubFetch(respond: () => Response | Promise<Response>) {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const fetch = async (url: string, init?: RequestInit) => {
    calls.push({ url, headers: (init?.headers ?? {}) as Record<string, string> });
    return respond();
  };
  return { fetch, calls };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('neonAuthCookies', () => {
  test('keeps only the Neon Auth cookies and drops everything else', () => {
    const header = '_ga=1; __Secure-neon-auth.session_token=abc; theme=dark; __Secure-neon-auth.session_data=def';
    expect(neonAuthCookies(header)).toBe('__Secure-neon-auth.session_token=abc; __Secure-neon-auth.session_data=def');
  });

  test('returns undefined when no auth cookie is present', () => {
    expect(neonAuthCookies('theme=dark')).toBeUndefined();
    expect(neonAuthCookies(undefined)).toBeUndefined();
  });

  test('does not treat a look-alike name as an auth cookie', () => {
    expect(neonAuthCookies('x__Secure-neon-auth.token=1')).toBeUndefined();
  });
});

describe('publicOrigin', () => {
  test('prefers the forwarded host and proto set by the Vercel rewrite', () => {
    expect(publicOrigin({ host: 'internal', forwardedHost: 'pasoktani.example', forwardedProto: 'https' }))
      .toBe('https://pasoktani.example');
  });

  test('uses http for localhost when no proto is forwarded', () => {
    expect(publicOrigin({ host: 'localhost:3000' })).toBe('http://localhost:3000');
  });
});

describe('createSessionLookup', () => {
  test('makes no call when there is no auth cookie', async () => {
    const { fetch, calls } = stubFetch(() => json({}));
    const lookup = createSessionLookup({ authBaseUrl: AUTH, fetch });
    expect(await lookup({ cookie: 'theme=dark', origin: 'https://x.test' })).toBeNull();
    expect(calls).toHaveLength(0);
  });

  test('forwards only the auth cookies and the public origin to get-session', async () => {
    const { fetch, calls } = stubFetch(() =>
      json({ user: { id: 'a97db859-ec48-4f83-a680-81d61362da50', email: 'a@b.test', name: 'Ani' } }),
    );
    const lookup = createSessionLookup({ authBaseUrl: `${AUTH}/`, fetch });
    const user = await lookup({ cookie: '__Secure-neon-auth.session_token=t; other=1', origin: 'https://x.test' });

    expect(user).toEqual({ id: 'a97db859-ec48-4f83-a680-81d61362da50', email: 'a@b.test', name: 'Ani' });
    expect(calls[0]!.url).toBe(`${AUTH}/get-session`);
    expect(calls[0]!.headers.Cookie).toBe('__Secure-neon-auth.session_token=t');
    expect(calls[0]!.headers.Origin).toBe('https://x.test');
  });

  test('returns null when the auth server rejects the session', async () => {
    const { fetch } = stubFetch(() => json({ error: 'unauthenticated' }, 401));
    const lookup = createSessionLookup({ authBaseUrl: AUTH, fetch });
    expect(await lookup({ cookie: '__Secure-neon-auth.session_token=t', origin: 'https://x.test' })).toBeNull();
  });

  test('returns null when the body has no user id', async () => {
    const { fetch } = stubFetch(() => json({ user: { email: 'a@b.test' } }));
    const lookup = createSessionLookup({ authBaseUrl: AUTH, fetch });
    expect(await lookup({ cookie: '__Secure-neon-auth.session_token=t', origin: 'https://x.test' })).toBeNull();
  });

  test('throws 503 auth_unavailable when the auth server errors', async () => {
    const { fetch } = stubFetch(() => json({}, 502));
    const lookup = createSessionLookup({ authBaseUrl: AUTH, fetch });
    const err = await lookup({ cookie: '__Secure-neon-auth.session_token=t', origin: 'https://x.test' }).catch((e) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({ status: 503, code: 'auth_unavailable' });
  });

  test('throws 503 auth_unavailable when the auth server cannot be reached', async () => {
    const lookup = createSessionLookup({
      authBaseUrl: AUTH,
      fetch: async () => {
        throw new TypeError('fetch failed');
      },
    });
    const err = await lookup({ cookie: '__Secure-neon-auth.session_token=t', origin: 'https://x.test' }).catch((e) => e);
    expect(err).toMatchObject({ status: 503, code: 'auth_unavailable' });
  });
});
