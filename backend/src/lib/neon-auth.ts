import { createAuthClient } from '@neon/auth';

const baseUrl = process.env.NEON_AUTH_BASE_URL;
if (!baseUrl) throw new Error('NEON_AUTH_BASE_URL is not set');

export const neonAuth = createAuthClient(baseUrl);

export async function signUpWithEmail(email: string, password: string, name: string) {
  return neonAuth.signUp.email({
    email,
    password,
    name,
    fetchOptions: { headers: { Origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' } },
  });
}
