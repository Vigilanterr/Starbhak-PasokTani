import { query } from '../config/database.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import type { Context } from 'hono';

const mapFarmer = (row: Record<string, unknown>) => ({
  id: row['id'],
  username: row['username'],
  fullName: row['full_name'],
  email: row['email'],
  phone: row['phone'],
  status: row['status'],
  fotoProfile: row['foto_profile'],
  address: row['address'],
  bio: row['bio'],
  village: row['village'],
  farmingExperience: row['farming_experience'],
  farmArea: row['farm_area'],
  farmingMethod: row['farming_method'],
  createdAt: row['created_at'],
  productCount: row['product_count'] === undefined ? undefined : Number(row['product_count']),
  reviewCount: row['review_count'] === undefined ? undefined : Number(row['review_count']),
  rating: row['rating'] === undefined ? undefined : Number(row['rating']),
  completedOrders: row['completed_orders'] === undefined ? undefined : Number(row['completed_orders']),
  totalSold: row['total_sold'] === undefined ? undefined : Number(row['total_sold']),
  achievementCount: row['achievement_count'] === undefined ? undefined : Number(row['achievement_count']),
});

export const listFarmers = async (c: Context) => {
  try {
    const page = Math.max(parseInt(c.req.query('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '12', 10), 1), 100);
    const offset = (page - 1) * limit;
    const search = c.req.query('search');

    const conditions = [`u.role = 'FARMER'`];
    const params: unknown[] = [];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.full_name ILIKE $${params.length} OR u.village ILIKE $${params.length})`);
    }
    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(`SELECT COUNT(*) AS total FROM users u ${where}`, params);
    params.push(limit, offset);

    const result = await query(
      `SELECT u.*,
              (SELECT COUNT(*) FROM commodities c
               WHERE c.farmer_id = u.id AND c.is_published = true
                 AND c.status IN ('AVAILABLE', 'VERIFIED')) AS product_count,
              (SELECT COUNT(*) FROM farmer_achievements fa
               WHERE fa.farmer_id = u.id AND fa.status <> 'REVOKED') AS achievement_count
       FROM users u ${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
    return sendPaginated(c, (result.rows as Record<string, unknown>[]).map(mapFarmer), total, page, limit);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve farmers';
    return sendError(c, message, 400);
  }
};

export const getFarmerProfile = async (c: Context) => {
  try {
    const id = c.req.param('id');

    const farmerResult = await query(
      `SELECT u.*,
              (SELECT COUNT(*) FROM commodities c
               WHERE c.farmer_id = u.id AND c.is_published = true
                 AND c.status IN ('AVAILABLE', 'VERIFIED')) AS product_count,
              (SELECT COUNT(*) FROM reviews r WHERE r.farmer_id = u.id) AS review_count,
              (SELECT COALESCE(ROUND(AVG(r.rating), 2), 0) FROM reviews r WHERE r.farmer_id = u.id) AS rating,
              (SELECT COUNT(*) FROM orders o WHERE o.farmer_id = u.id AND o.status = 'COMPLETED') AS completed_orders,
              (SELECT COALESCE(SUM(o.quantity), 0) FROM orders o
               WHERE o.farmer_id = u.id AND o.status = 'COMPLETED') AS total_sold,
              (SELECT COUNT(*) FROM farmer_achievements fa
               WHERE fa.farmer_id = u.id AND fa.status <> 'REVOKED') AS achievement_count
       FROM users u
       WHERE u.id = $1 AND u.role = 'FARMER'`,
      [id]
    );

    if (farmerResult.rows.length === 0) {
      return sendError(c, 'Farmer not found', 404);
    }

    return sendSuccess(c, mapFarmer(farmerResult.rows[0] as Record<string, unknown>), 'Farmer profile retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve farmer profile';
    return sendError(c, message, 400);
  }
};

export const getFarmerProducts = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const page = Math.max(parseInt(c.req.query('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '12', 10), 1), 48);
    const offset = (page - 1) * limit;

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM commodities c
       WHERE c.farmer_id = $1 AND c.is_published = true AND c.status IN ('AVAILABLE', 'VERIFIED')`,
      [id]
    );
    const result = await query(
      `SELECT c.*, cat.name AS category_name FROM commodities c
       JOIN categories cat ON cat.id = c.category_id
       WHERE c.farmer_id = $1 AND c.is_published = true AND c.status IN ('AVAILABLE', 'VERIFIED')
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
    return sendPaginated(c, result.rows, total, page, limit, 'Farmer products retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve farmer products';
    return sendError(c, message, 400);
  }
};

export const getFarmerReviews = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const page = Math.max(parseInt(c.req.query('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '10', 10), 1), 50);
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) AS total FROM reviews WHERE farmer_id = $1', [id]);
    const result = await query(
      `SELECT r.*, u.full_name AS buyer_name, u.foto_profile AS buyer_foto
       FROM reviews r JOIN users u ON u.id = r.buyer_id
       WHERE r.farmer_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
    return sendPaginated(c, result.rows, total, page, limit, 'Farmer reviews retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve farmer reviews';
    return sendError(c, message, 400);
  }
};

export const getFarmerAchievements = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const result = await query(
      `SELECT fa.* FROM farmer_achievements fa
       WHERE fa.farmer_id = $1 AND fa.status <> 'REVOKED'
       ORDER BY fa.attained_at DESC, fa.id DESC`,
      [id]
    );
    return sendSuccess(c, result.rows, 'Farmer achievements retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve farmer achievements';
    return sendError(c, message, 400);
  }
};