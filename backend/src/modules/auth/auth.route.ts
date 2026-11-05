import { Hono } from 'hono';
import { authenticate } from '../../middlewares/auth.ts';
import { register, login, getMe } from './auth.controller.ts';

const authRoute = new Hono();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.get('/me', authenticate, getMe);

export default authRoute;
