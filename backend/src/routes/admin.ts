import { Hono } from 'hono';
import { authenticate, authorize } from '../middlewares/auth.ts';
import {
  getAdminOverview,
  getUsers,
  updateUserStatus,
  getCommodities,
  updateCommodityStatus,
  getOrders,
} from '../controllers/admin.ts';

const adminRouter = new Hono();
adminRouter.use('*', authenticate, authorize(['ADMIN']));

adminRouter.get('/overview', getAdminOverview);
adminRouter.get('/users', getUsers);
adminRouter.patch('/users/:id/status', updateUserStatus);
adminRouter.get('/commodities', getCommodities);
adminRouter.patch('/commodities/:id/status', updateCommodityStatus);
adminRouter.get('/orders', getOrders);

export default adminRouter;