import { Hono } from 'hono';
import { authenticate } from '../middlewares/auth.ts';
import { createOrder, getMyOrders, getOrder, updateOrderStatus } from '../controllers/orders.ts';

const orderRouter = new Hono();

orderRouter.post('/', authenticate, createOrder);
orderRouter.get('/me', authenticate, getMyOrders);
orderRouter.get('/:id', authenticate, getOrder);
orderRouter.patch('/:id/status', authenticate, updateOrderStatus);

export default orderRouter;
