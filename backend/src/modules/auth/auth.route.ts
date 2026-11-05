import { Hono } from 'hono';
import { authenticate } from '../../middlewares/auth.js';
import { register, login, getMe } from './auth.controller.js';

const authRoute = new Hono();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.get('/me', authenticate, getMe);

export default authRoute;
