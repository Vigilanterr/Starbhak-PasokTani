import { query } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import type { Context } from 'hono';

export const getCategories = async (c: Context) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name ASC');
    return sendSuccess(c, result.rows, 'Categories retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve categories';
    return sendError(c, message, 400);
  }
};

export const getCategoriesWithCount = async (c: Context) => {
  try {
    const result = await query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM commodities 
               WHERE category_id = c.id AND is_published = true AND status IN ('AVAILABLE', 'VERIFIED')) as commodity_count
       FROM categories c ORDER BY c.name ASC`
    );
    return sendSuccess(c, result.rows, 'Categories with count retrieved');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve categories with count';
    return sendError(c, message, 400);
  }
};

export const createCategory = async (c: Context) => {
  try {
    const body = await c.req.json<{ name: string; description?: string; icon?: string }>();
    const result = await query(
      'INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3) RETURNING *',
      [body.name, body.description, body.icon]
    );
    return sendSuccess(c, result.rows[0], 'Category created', 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create category';
    return sendError(c, message, 400);
  }
};

export const updateCategory = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<{ name: string; description?: string; icon?: string }>();
    const result = await query(
      'UPDATE categories SET name = $1, description = $2, icon = $3 WHERE id = $4 RETURNING *',
      [body.name, body.description, body.icon, id]
    );
    return sendSuccess(c, result.rows[0], 'Category updated');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update category';
    return sendError(c, message, 400);
  }
};

export const deleteCategory = async (c: Context) => {
  try {
    const id = c.req.param('id');
    await query('DELETE FROM categories WHERE id = $1', [id]);
    return sendSuccess(c, null, 'Category deleted');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete category';
    return sendError(c, message, 400);
  }
};
