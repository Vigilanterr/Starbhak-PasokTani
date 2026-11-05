import { ZodError } from 'zod';
import { query } from '../../config/database.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { createAchievementSchema, updateAchievementSchema } from './achievement.schema.js';
import type { Context } from 'hono';
import type { JwtPayload } from '../auth/auth.types.js';

interface AchievementRow {
  id: number;
  farmer_id: number;
  farmer_name?: string;
  farmer_village?: string | null;
  title: string;
  description: string;
  badge_icon: string | null;
  attained_at: Date;
  status: string;
}

const toAchievement = (row: AchievementRow) => ({
  id: row.id,
  farmerId: row.farmer_id,
  farmerName: row.farmer_name,
  farmerVillage: row.farmer_village,
  title: row.title,
  description: row.description,
  badgeIcon: row.badge_icon,
  attainedAt: row.attained_at,
  status: row.status,
});

export const getAchievements = async (c: Context) => {
  try {
    const user = c.get('user') as JwtPayload;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (user.role === 'FARMER') {
      params.push(user.userId);
      conditions.push(`fa.farmer_id = $${params.length}`);
    } else {
      const farmerId = c.req.query('farmerId');
      const status = c.req.query('status');
      if (farmerId) {
        params.push(parseInt(farmerId, 10));
        conditions.push(`fa.farmer_id = $${params.length}`);
      }
      if (status) {
        params.push(status);
        conditions.push(`fa.status = $${params.length}`);
      }
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT fa.*, u.full_name AS farmer_name, u.village AS farmer_village
       FROM farmer_achievements fa
       JOIN users u ON u.id = fa.farmer_id
       ${where}
       ORDER BY fa.attained_at DESC, fa.id DESC`,
      params
    );

    return sendSuccess(c, (result.rows as AchievementRow[]).map(toAchievement), 'Achievements retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve achievements';
    return sendError(c, message, 400);
  }
};

export const getMyAchievements = async (c: Context) => {
  try {
    const user = c.get('user') as JwtPayload;
    const result = await query(
      `SELECT fa.* FROM farmer_achievements fa
       WHERE fa.farmer_id = $1
       ORDER BY fa.attained_at DESC, fa.id DESC`,
      [user.userId]
    );
    return sendSuccess(c, (result.rows as AchievementRow[]).map(toAchievement), 'Your achievements retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve your achievements';
    return sendError(c, message, 400);
  }
};

export const createAchievement = async (c: Context) => {
  try {
    const input = createAchievementSchema.parse(await c.req.json());

    const farmer = await query("SELECT id FROM users WHERE id = $1 AND role = 'FARMER'", [input.farmerId]);
    if (farmer.rows.length === 0) {
      return sendError(c, 'Farmer not found', 404);
    }

    const result = await query(
      `INSERT INTO farmer_achievements (farmer_id, title, description, badge_icon, attained_at, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        input.farmerId,
        input.title,
        input.description,
        input.badgeIcon ?? null,
        input.attainedAt ?? new Date(),
        input.status,
      ]
    );

    return sendSuccess(c, toAchievement(result.rows[0] as AchievementRow), 'Achievement created', 201);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return sendError(c, error.issues[0]?.message ?? 'Invalid input', 400);
    }
    const message = error instanceof Error ? error.message : 'Failed to create achievement';
    return sendError(c, message, 400);
  }
};

export const updateAchievement = async (c: Context) => {
  try {
    const id = c.req.param('id') as string;
    const input = updateAchievementSchema.parse(await c.req.json());

    const sets: string[] = [];
    const params: unknown[] = [];
    const assign = (column: string, value: unknown) => {
      params.push(value);
      sets.push(`${column} = $${params.length}`);
    };

    if (input.title !== undefined) assign('title', input.title);
    if (input.description !== undefined) assign('description', input.description);
    if (input.badgeIcon !== undefined) assign('badge_icon', input.badgeIcon);
    if (input.attainedAt !== undefined) assign('attained_at', input.attainedAt);
    if (input.status !== undefined) assign('status', input.status);

    params.push(id);
    const result = await query(
      `UPDATE farmer_achievements SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return sendError(c, 'Achievement not found', 404);
    }

    return sendSuccess(c, toAchievement(result.rows[0] as AchievementRow), 'Achievement updated');
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return sendError(c, error.issues[0]?.message ?? 'Invalid input', 400);
    }
    const message = error instanceof Error ? error.message : 'Failed to update achievement';
    return sendError(c, message, 400);
  }
};

export const deleteAchievement = async (c: Context) => {
  try {
    const id = c.req.param('id') as string;
    const result = await query('DELETE FROM farmer_achievements WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return sendError(c, 'Achievement not found', 404);
    }
    return sendSuccess(c, null, 'Achievement deleted');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete achievement';
    return sendError(c, message, 400);
  }
};