import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import authRoute from './modules/auth/auth.route.ts';
import categoryRouter from './routes/categories.ts';
import productRouter from './routes/products.ts';
import orderRouter from './routes/orders.ts';
import dashboardRouter from './routes/dashboard.ts';
import reviewRouter from './routes/reviews.ts';
import uploadRouter from './routes/upload.ts';
import farmerRouter from './routes/farmers.ts';
import achievementRouter from './modules/achievement/achievement.route.ts';
import adminRouter from './routes/admin.ts';
import docsRouter from './routes/docs.ts';
import type { Context } from 'hono';

const app = new Hono();

app.use('*', cors());

app.get('/', (c: Context) => {
  return c.json({
    success: true,
    message: 'PASOKTANI API is running',
    version: '1.0.0',
    docs: '/api-docs',
    endpoints: [
      '/health',
      '/api/v1/auth/register',
      '/api/v1/auth/login',
      '/api/v1/auth/me',
      '/api/v1/categories',
      '/api/v1/products',
      '/api/v1/orders',
      '/api/v1/dashboard/farmer',
      '/api/v1/dashboard/admin',
      '/api/v1/reviews',
      '/api/v1/upload/image',
      '/api/v1/farmers',
      '/api/v1/achievements',
      '/api/v1/admin',
    ],
  });
});

app.get('/health', (c: Context) => {
  return c.json({ success: true, message: 'PasokTani Backend API is healthy' });
});

app.route('/api/v1/auth', authRoute);
app.route('/api/v1/categories', categoryRouter);
app.route('/api/v1/products', productRouter);
app.route('/api/v1/orders', orderRouter);
app.route('/api/v1/dashboard', dashboardRouter);
app.route('/api/v1/reviews', reviewRouter);
app.route('/api/v1/upload', uploadRouter);
app.route('/api/v1/farmers', farmerRouter);
app.route('/api/v1/achievements', achievementRouter);
app.route('/api/v1/admin', adminRouter);
app.route('/api-docs', docsRouter);

// Hono-specific named exports for Vercel Function detection
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);