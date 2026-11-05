import { Hono } from 'hono';
import { authenticate } from '../middlewares/auth.js';
import { createOrder, getMyOrders, getOrder, updateOrderStatus } from '../controllers/orders.js';

const orderRouter = new Hono();

orderRouter.post('/', authenticate, createOrder);
orderRouter.get('/me', authenticate, getMyOrders);
orderRouter.get('/:id', authenticate, getOrder);
orderRouter.patch('/:id/status', authenticate, updateOrderStatus);

export default orderRouter;
