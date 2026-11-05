import { query, getClient } from '../config/database.ts';
import { sendSuccess, sendError } from '../utils/response.ts';
import type { Context } from 'hono';

export const createOrder = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number };
    const body = await c.req.json<{ commodityId: number; quantity: number; deliveryMethod?: string; paymentMethod: string }>();

    const commodityResult = await query('SELECT * FROM commodities WHERE id = $1', [body.commodityId]);
    if (commodityResult.rows.length === 0) {
      return sendError(c, 'Commodity not found', 404);
    }

    const commodity = commodityResult.rows[0] as { is_published: boolean; status: string; stock: number; farmer_id: number; id: number; price: number };
    if (!commodity.is_published || commodity.status !== 'AVAILABLE') {
      return sendError(c, 'Commodity not available', 400);
    }

    if (Number(commodity.stock) < body.quantity) {
      return sendError(c, 'Insufficient stock', 400);
    }

    const unitPrice = Number(commodity.price);
    const subtotal = unitPrice * body.quantity;
    const serviceFee = subtotal * 0.025;
    const deliveryFee = body.deliveryMethod === 'EXPEDITION' ? 25000 : 0;
    const totalPrice = subtotal + serviceFee + deliveryFee;

    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderCode = `KD-${dateStr}-${randomStr}`;

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `INSERT INTO orders (order_code, buyer_id, farmer_id, commodity_id, quantity, unit_price, 
         subtotal, service_fee, delivery_fee, total_price, delivery_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          orderCode,
          user.userId,
          commodity.farmer_id,
          commodity.id,
          body.quantity,
          unitPrice,
          subtotal,
          serviceFee,
          deliveryFee,
          totalPrice,
          body.deliveryMethod || 'PICKUP',
          'PENDING',
        ]
      );

      const order = orderResult.rows[0];

      await client.query(
        `INSERT INTO payments (order_id, buyer_id, method, amount, fee, status, reference_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, user.userId, body.paymentMethod, totalPrice, serviceFee, 'PENDING', `PY-${orderCode}`]
      );

      const newStock = Number(commodity.stock) - body.quantity;
      const newStatus = newStock <= 0 ? 'SOLD_OUT' : 'AVAILABLE';
      await client.query(
        `UPDATE commodities SET stock = $1, status = $2, updated_at = NOW() WHERE id = $3`,
        [newStock, newStatus, commodity.id]
      );

      await client.query('COMMIT');
      return sendSuccess(c, order, 'Order created', 201);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    return sendError(c, message, 400);
  }
};

export const getMyOrders = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number; role: string };
    const role = user.role;
    const whereClause = role === 'FARMER' ? 'o.farmer_id = $1' : 'o.buyer_id = $1';

    const result = await query(
      `SELECT o.*, c.name as commodity_name FROM orders o
       JOIN commodities c ON o.commodity_id = c.id
       WHERE ${whereClause} ORDER BY o.created_at DESC`,
      [user.userId]
    );

    return sendSuccess(c, result.rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve orders';
    return sendError(c, message, 400);
  }
};

export const getOrder = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const result = await query(
      `SELECT o.*, c.name as commodity_name FROM orders o
       JOIN commodities c ON o.commodity_id = c.id WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(c, 'Order not found', 404);
    }

    return sendSuccess(c, result.rows[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve order';
    return sendError(c, message, 400);
  }
};

export const updateOrderStatus = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number; role: string };
    const id = c.req.param('id');
    const { status } = await c.req.json<{ status: string }>();

    const orderCheck = await query('SELECT buyer_id, farmer_id FROM orders WHERE id = $1', [id]);
    if (orderCheck.rows.length === 0) {
      return sendError(c, 'Order not found', 404);
    }

    const order = orderCheck.rows[0] as { buyer_id: number; farmer_id: number };
    if (user.role === 'FARMER' && order.farmer_id !== user.userId) {
      return sendError(c, 'Unauthorized', 403);
    }
    if (user.role === 'BUYER' && order.buyer_id !== user.userId) {
      return sendError(c, 'Unauthorized', 403);
    }

    const result = await query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [
      status,
      id,
    ]);

    return sendSuccess(c, result.rows[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update order status';
    return sendError(c, message, 400);
  }
};
