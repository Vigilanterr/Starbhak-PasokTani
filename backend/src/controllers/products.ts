import { z } from 'zod';
import { query } from '../config/database.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import type { Context } from 'hono';

const createCommoditySchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().optional(),
  categoryId: z.number().int().positive(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().positive(),
  unit: z.string().default('kg'),
  quality: z.string().default('A'),
  location: z.string().min(1).max(150),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  fixedPrice: z.coerce.number().optional(),
  minWeightForNego: z.coerce.number().optional(),
  harvestEstimate: z.string().datetime().optional(),
});

export const getProducts = async (c: Context) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);
    const offset = (page - 1) * limit;
    const search = c.req.query('search');
    const categoryId = c.req.query('categoryId');

    let whereClause = "WHERE is_published = true AND status IN ('AVAILABLE', 'VERIFIED')";
    const params: unknown[] = [];
    let paramIndex = 1;

    if (categoryId) {
      whereClause += ` AND category_id = $${paramIndex}`;
      params.push(parseInt(categoryId, 10));
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM commodities ${whereClause}`, params);
    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT c.*, cat.name as category_name FROM commodities c
       JOIN categories cat ON c.category_id = cat.id
       ${whereClause}
       ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const totalCount = parseInt(countResult.rows[0]?.['total'] as string || '0', 10);
    return sendPaginated(c, result.rows, totalCount, page, limit);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve products';
    return sendError(c, message, 400);
  }
};

export const getProduct = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const result = await query(
      `SELECT c.*, cat.name as category_name, u.full_name as farmer_name
       FROM commodities c
       JOIN categories cat ON c.category_id = cat.id
       JOIN users u ON c.farmer_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(c, 'Commodity not found', 404);
    }

    return sendSuccess(c, result.rows[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve product';
    return sendError(c, message, 400);
  }
};

export const createProduct = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number };
    const body = await c.req.json();
    const parsed = createCommoditySchema.parse(body);

    const result = await query(
      `INSERT INTO commodities 
       (farmer_id, category_id, name, description, price, min_price, max_price, fixed_price,
        stock, unit, quality, location, min_weight_for_nego, harvest_estimate, status, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        user.userId,
        parsed.categoryId,
        parsed.name,
        parsed.description,
        parsed.price,
        parsed.minPrice,
        parsed.maxPrice,
        parsed.fixedPrice,
        parsed.stock,
        parsed.unit,
        parsed.quality,
        parsed.location,
        parsed.minWeightForNego,
        parsed.harvestEstimate ? new Date(parsed.harvestEstimate) : null,
        'PENDING',
        false,
      ]
    );

    return sendSuccess(c, result.rows[0], 'Commodity created', 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create commodity';
    return sendError(c, message, 400);
  }
};

export const getMyProducts = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number };
    const result = await query(
      `SELECT c.*, cat.name as category_name FROM commodities c
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.farmer_id = $1 ORDER BY c.created_at DESC`,
      [user.userId]
    );
    return sendSuccess(c, result.rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve your commodities';
    return sendError(c, message, 400);
  }
};

export const updateProduct = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number };
    const id = c.req.param('id');
    const body = await c.req.json<{ name: string; description?: string; price: number; stock: number; quality: string; location: string }>();

    const ownerCheck = await query('SELECT farmer_id FROM commodities WHERE id = $1', [id]);
    if (ownerCheck.rows.length === 0 || (ownerCheck.rows[0] as { farmer_id: number }).farmer_id !== user.userId) {
      return sendError(c, 'Unauthorized', 403);
    }

    const result = await query(
      `UPDATE commodities SET name = $1, description = $2, price = $3, stock = $4, quality = $5, location = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [body.name, body.description, body.price, body.stock, body.quality, body.location, id]
    );

    return sendSuccess(c, result.rows[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update commodity';
    return sendError(c, message, 400);
  }
};

export const deleteProduct = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number };
    const id = c.req.param('id');

    const ownerCheck = await query('SELECT farmer_id FROM commodities WHERE id = $1', [id]);
    if (ownerCheck.rows.length === 0 || (ownerCheck.rows[0] as { farmer_id: number }).farmer_id !== user.userId) {
      return sendError(c, 'Unauthorized', 403);
    }

    await query('DELETE FROM commodities WHERE id = $1', [id]);
    return sendSuccess(c, null, 'Commodity deleted');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete commodity';
    return sendError(c, message, 400);
  }
};

export const updateStock = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number };
    const id = c.req.param('id');
    const { stock } = await c.req.json<{ stock: number }>();

    const ownerCheck = await query('SELECT farmer_id FROM commodities WHERE id = $1', [id]);
    if (ownerCheck.rows.length === 0 || (ownerCheck.rows[0] as { farmer_id: number }).farmer_id !== user.userId) {
      return sendError(c, 'Unauthorized', 403);
    }

    const status = stock <= 0 ? 'SOLD_OUT' : 'AVAILABLE';
    const result = await query(
      `UPDATE commodities SET stock = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [stock, status, id]
    );

    return sendSuccess(c, result.rows[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update stock';
    return sendError(c, message, 400);
  }
};

export const togglePublish = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number };
    const id = c.req.param('id');

    const ownerCheck = await query('SELECT farmer_id, is_published FROM commodities WHERE id = $1', [id]);
    if (ownerCheck.rows.length === 0 || (ownerCheck.rows[0] as { farmer_id: number }).farmer_id !== user.userId) {
      return sendError(c, 'Unauthorized', 403);
    }

    const currentPublished = (ownerCheck.rows[0] as { is_published: boolean }).is_published;
    const newPublished = !currentPublished;
    const result = await query(
      `UPDATE commodities SET is_published = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [newPublished, id]
    );

    return sendSuccess(c, result.rows[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to toggle publication status';
    return sendError(c, message, 400);
  }
};
