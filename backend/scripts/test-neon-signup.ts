import { neonAuth, signUpWithEmail } from '../src/lib/neon-auth.js';

const origin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const email = `signup-test-${Date.now()}@example.com`;
const password = `Pw-${crypto.randomUUID()}`;

const up = await signUpWithEmail(email, password, 'Signup Test');
if (up.error) { console.error('sign-up failed:', up.error.message); process.exit(1); }
console.log('signed up:', { id: up.data?.user?.id, email: up.data?.user?.email });

let cookie = '';
const inn = await neonAuth.signIn.email({
  email, password,
  fetchOptions: {
    headers: { Origin: origin },
    onSuccess: (ctx: { response: Response }) => {
      cookie = ctx.response.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
    },
  },
});
if (inn.error) { console.error('sign-in failed:', inn.error.message); process.exit(1); }
console.log('signed in; session cookie received:', cookie.length > 0);

const session = await neonAuth.getSession({ fetchOptions: { headers: { Origin: origin, Cookie: cookie } } });
console.log('current user:', session.data?.user ? { id: session.data.user.id, email: session.data.user.email, name: session.data.user.name } : session.error ?? null);
