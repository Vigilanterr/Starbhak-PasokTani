import { Hono } from 'hono';
import { authenticate, authorize } from '../middlewares/auth.js';
import { getFarmerStats, getAdminStats } from '../controllers/dashboard.js';

const dashboardRouter = new Hono();

dashboardRouter.get('/farmer', authenticate, authorize(['FARMER']), getFarmerStats);
dashboardRouter.get('/admin', authenticate, authorize(['ADMIN']), getAdminStats);

export default dashboardRouter;
