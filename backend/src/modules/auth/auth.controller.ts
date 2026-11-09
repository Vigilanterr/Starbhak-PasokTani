import { authService, AuthError } from './auth.service.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import type { Context } from 'hono';
import type { AuthUser } from './auth.types.js';

function fail(c: Context, error: unknown, fallback: string) {
  if (error instanceof AuthError) return sendError(c, error.message, error.status);
  if (error && typeof error === 'object' && 'issues' in error) return sendError(c, 'Invalid input', 400);
  return sendError(c, error instanceof Error ? error.message : fallback, 400);
}

export const register = async (c: Context) => {
  try {
    const parsed = registerSchema.parse(await c.req.json());
    return sendSuccess(c, await authService.register(parsed), 'User registered successfully', 201);
  } catch (error) {
    return fail(c, error, 'Registration failed');
  }
};

export const login = async (c: Context) => {
  try {
    const parsed = loginSchema.parse(await c.req.json());
    const { profile, setCookies } = await authService.login(parsed);
    for (const cookie of setCookies) c.header('Set-Cookie', cookie, { append: true });
    return sendSuccess(c, profile, 'Login successful');
  } catch (error) {
    return fail(c, error, 'Login failed');
  }
};

export const getMe = async (c: Context) => {
  try {
    const user = c.get('user') as AuthUser | undefined;
    if (!user) return sendError(c, 'Unauthorized', 401);
    return sendSuccess(c, await authService.getCurrentUser(user.userId), 'User profile retrieved');
  } catch (error) {
    return fail(c, error, 'Failed to get user profile');
  }
};
