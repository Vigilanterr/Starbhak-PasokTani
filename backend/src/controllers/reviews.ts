import { query } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import type { Context } from 'hono';

export const createReview = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number };
    const body = await c.req.json<{ orderId: number; rating: number; comment?: string }>();

    const orderResult = await query(
      'SELECT buyer_id, farmer_id, commodity_id, status FROM orders WHERE id = $1',
      [body.orderId]
    );

    if (orderResult.rows.length === 0 || (orderResult.rows[0] as { buyer_id: number }).buyer_id !== user.userId) {
      return sendError(c, 'Order not found or unauthorized', 404);
    }

    const order = orderResult.rows[0] as { farmer_id: number; commodity_id: number; status: string };
    if (order.status !== 'COMPLETED') {
      return sendError(c, 'Can only review completed orders', 400);
    }

    const existing = await query('SELECT id FROM reviews WHERE order_id = $1', [body.orderId]);
    if (existing.rows.length > 0) {
      return sendError(c, 'Review already exists', 400);
    }

    const result = await query(
      `INSERT INTO reviews (order_id, buyer_id, farmer_id, commodity_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [body.orderId, user.userId, order.farmer_id, order.commodity_id, body.rating, body.comment]
    );

    return sendSuccess(c, result.rows[0], 'Review created', 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create review';
    return sendError(c, message, 400);
  }
};

export const getFarmerReviews = async (c: Context) => {
  try {
    const farmerId = c.req.param('farmerId');
    const result = await query(
      `SELECT r.*, u.full_name as buyer_name FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.farmer_id = $1 ORDER BY r.created_at DESC`,
      [farmerId]
    );
    return sendSuccess(c, result.rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve farmer reviews';
    return sendError(c, message, 400);
  }
};

export const getCommodityReviews = async (c: Context) => {
  try {
    const commodityId = c.req.param('commodityId');
    const result = await query(
      `SELECT r.*, u.full_name as buyer_name FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.commodity_id = $1 ORDER BY r.created_at DESC`,
      [commodityId]
    );
    return sendSuccess(c, result.rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve commodity reviews';
    return sendError(c, message, 400);
  }
};
