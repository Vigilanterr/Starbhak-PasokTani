import { query } from '../config/database.ts';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.ts';
import type { Context } from 'hono';

const parseIntParam = (value: string | undefined, fallback: number) => {
  const parsed = parseInt(value || '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const getAdminOverview = async (c: Context) => {
  try {
    const [users, farmers, buyers, products, orders, pendingProducts, pendingUsers, reviews, revenue, pendingAchievements] =
      await Promise.all([
        query('SELECT COUNT(*) AS count FROM users'),
        query("SELECT COUNT(*) AS count FROM users WHERE role = 'FARMER'"),
        query("SELECT COUNT(*) AS count FROM users WHERE role = 'BUYER'"),
        query('SELECT COUNT(*) AS count FROM commodities'),
        query('SELECT COUNT(*) AS count FROM orders'),
        query("SELECT COUNT(*) AS count FROM commodities WHERE status = 'PENDING'"),
        query("SELECT COUNT(*) AS count FROM users WHERE status = 'PENDING'"),
        query('SELECT COUNT(*) AS count FROM reviews'),
        query("SELECT COALESCE(SUM(total_price), 0) AS sum FROM orders WHERE status = 'COMPLETED'"),
        query("SELECT COUNT(*) AS count FROM farmer_achievements WHERE status = 'FEATURED'"),
      ]);

    const count = (r: typeof users) => parseInt((r.rows[0] as { count: string }).count, 10);

    return sendSuccess(c, {
      totalUsers: count(users),
      totalFarmers: count(farmers),
      totalBuyers: count(buyers),
      totalProducts: count(products),
      totalOrders: count(orders),
      pendingProducts: count(pendingProducts),
      pendingUsers: count(pendingUsers),
      totalReviews: count(reviews),
      totalRevenue: parseFloat((revenue.rows[0] as { sum: string }).sum),
      featuredAchievements: count(pendingAchievements),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve admin overview';
    return sendError(c, message, 400);
  }
};

export const getUsers = async (c: Context) => {
  try {
    const page = parseIntParam(c.req.query('page'), 1);
    const limit = Math.min(parseIntParam(c.req.query('limit'), 20), 100);
    const offset = (page - 1) * limit;
    const role = c.req.query('role');
    const status = c.req.query('status');
    const search = c.req.query('search');

    const conditions: string[] = [];
    const params: unknown[] = [];
    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length} OR username ILIKE $${params.length})`);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT COUNT(*) AS total FROM users ${where}`, params);
    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
    return sendPaginated(c, result.rows, total, page, limit, 'Users retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve users';
    return sendError(c, message, 400);
  }
};

export const updateUserStatus = async (c: Context) => {
  try {
    const admin = c.get('user') as { userId: number };
    const id = parseIntParam(c.req.param('id'), 1);
    const body = await c.req.json<{ status: string; reason?: string }>();

    if (id === admin.userId) {
      return sendError(c, 'Cannot change your own status', 400);
    }

    const target = await query('SELECT id, role, status FROM users WHERE id = $1', [id]);
    if (target.rows.length === 0) {
      return sendError(c, 'User not found', 404);
    }

    const result = await query(
      `UPDATE users SET status = $1, rejected_reason = CASE WHEN $1 = 'REJECTED' THEN $2 ELSE rejected_reason END,
       reviewed_at = NOW(), updated_at = NOW() WHERE id = $3 RETURNING *`,
      [body.status, body.reason ?? null, id]
    );

    return sendSuccess(c, result.rows[0], 'User status updated');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user status';
    return sendError(c, message, 400);
  }
};

export const getCommodities = async (c: Context) => {
  try {
    const page = parseIntParam(c.req.query('page'), 1);
    const limit = Math.min(parseIntParam(c.req.query('limit'), 20), 100);
    const offset = (page - 1) * limit;
    const status = c.req.query('status');
    const search = c.req.query('search');

    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status) {
      params.push(status);
      conditions.push(`c.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(c.name ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM commodities c JOIN users u ON u.id = c.farmer_id ${where}`,
      params
    );
    params.push(limit, offset);
    const result = await query(
      `SELECT c.*, u.full_name AS farmer_name, cat.name AS category_name
       FROM commodities c
       JOIN users u ON u.id = c.farmer_id
       JOIN categories cat ON cat.id = c.category_id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
    return sendPaginated(c, result.rows, total, page, limit, 'Commodities retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve commodities';
    return sendError(c, message, 400);
  }
};

export const updateCommodityStatus = async (c: Context) => {
  try {
    const id = parseIntParam(c.req.param('id'), 1);
    const body = await c.req.json<{ status: string; reason?: string }>();

    const target = await query('SELECT id FROM commodities WHERE id = $1', [id]);
    if (target.rows.length === 0) {
      return sendError(c, 'Commodity not found', 404);
    }

    const publishable = body.status === 'VERIFIED' || body.status === 'AVAILABLE';
    const result = await query(
      `UPDATE commodities SET status = $1, is_published = $2,
       rejected_reason = CASE WHEN $1 = 'REJECTED' THEN $3 ELSE rejected_reason END,
       reviewed_at = NOW(), updated_at = NOW() WHERE id = $4 RETURNING *`,
      [body.status, publishable, body.reason ?? null, id]
    );

    return sendSuccess(c, result.rows[0], 'Commodity status updated');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update commodity status';
    return sendError(c, message, 400);
  }
};

export const getOrders = async (c: Context) => {
  try {
    const page = parseIntParam(c.req.query('page'), 1);
    const limit = Math.min(parseIntParam(c.req.query('limit'), 20), 100);
    const offset = (page - 1) * limit;
    const status = c.req.query('status');
    const search = c.req.query('search');

    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status) {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(o.order_code ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM orders o JOIN users u ON u.id = o.buyer_id ${where}`,
      params
    );
    params.push(limit, offset);
    const result = await query(
      `SELECT o.*, b.full_name AS buyer_name, f.full_name AS farmer_name, cm.name AS commodity_name
       FROM orders o
       JOIN users b ON b.id = o.buyer_id
       JOIN users f ON f.id = o.farmer_id
       JOIN commodities cm ON cm.id = o.commodity_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
    return sendPaginated(c, result.rows, total, page, limit, 'Orders retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve orders';
    return sendError(c, message, 400);
  }
};