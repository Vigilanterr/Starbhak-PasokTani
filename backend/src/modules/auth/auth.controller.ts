import { authService } from './auth.service.ts';
import { registerSchema, loginSchema } from './auth.schema.ts';
import { sendSuccess, sendError } from '../../utils/response.ts';
import type { Context } from 'hono';

export const register = async (c: Context) => {
  try {
    const body = await c.req.json();
    const parsed = registerSchema.parse(body);
    const result = await authService.register(parsed);
    return sendSuccess(c, result, 'User registered successfully', 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return sendError(c, message, 400);
  }
};

export const login = async (c: Context) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.parse(body);
    const result = await authService.login(parsed);
    return sendSuccess(c, result, 'Login successful');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    const statusCode = message.includes('suspended') ? 403 : 401;
    return sendError(c, message, statusCode);
  }
};

export const getMe = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number } | undefined;
    if (!user) {
      return sendError(c, 'Unauthorized', 401);
    }
    const result = await authService.getCurrentUser(user.userId);
    return sendSuccess(c, result, 'User profile retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get user profile';
    return sendError(c, message, error instanceof Error && error.message.includes('not found') ? 404 : 400);
  }
};
