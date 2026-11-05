import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoute from './modules/auth/auth.route';
import categoryRouter from './routes/categories';
import productRouter from './routes/products';
import orderRouter from './routes/orders';
import dashboardRouter from './routes/dashboard';
import reviewRouter from './routes/reviews';
import uploadRouter from './routes/upload';
import farmerRouter from './routes/farmers';
import achievementRouter from './modules/achievement/achievement.route';
import adminRouter from './routes/admin';
import docsRouter from './routes/docs';
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

export default {
  async fetch(request: Request, env: any, ctx: any) {
    return app.fetch(request);
  },
};