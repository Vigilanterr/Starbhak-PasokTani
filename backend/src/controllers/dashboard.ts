import { query } from '../config/database.ts';
import { sendSuccess, sendError } from '../utils/response.ts';
import type { Context } from 'hono';

export const getFarmerStats = async (c: Context) => {
  try {
    const user = c.get('user') as { userId: number };

    const productsCountResult = await query('SELECT COUNT(*) as count FROM commodities WHERE farmer_id = $1', [
      user.userId,
    ]);
    const activeProductsResult = await query(
      "SELECT COUNT(*) as count FROM commodities WHERE farmer_id = $1 AND status = 'AVAILABLE' AND is_published = true",
      [user.userId]
    );
    const totalOrdersResult = await query('SELECT COUNT(*) as count FROM orders WHERE farmer_id = $1', [user.userId]);
    const revenueResult = await query(
      "SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM orders WHERE farmer_id = $1 AND status = 'COMPLETED'",
      [user.userId]
    );

    const stats = {
      totalProducts: parseInt((productsCountResult.rows[0] as { count: string }).count, 10),
      activeProducts: parseInt((activeProductsResult.rows[0] as { count: string }).count, 10),
      totalOrders: parseInt((totalOrdersResult.rows[0] as { count: string }).count, 10),
      totalRevenue: parseFloat((revenueResult.rows[0] as { total_revenue: string }).total_revenue),
    };

    return sendSuccess(c, { stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve farmer stats';
    return sendError(c, message, 400);
  }
};

export const getAdminStats = async (c: Context) => {
  try {
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const farmersResult = await query("SELECT COUNT(*) as count FROM users WHERE role = 'FARMER'");
    const ordersResult = await query('SELECT COUNT(*) as count FROM orders');

    const stats = {
      totalUsers: parseInt((usersResult.rows[0] as { count: string }).count, 10),
      totalFarmers: parseInt((farmersResult.rows[0] as { count: string }).count, 10),
      totalOrders: parseInt((ordersResult.rows[0] as { count: string }).count, 10),
    };

    return sendSuccess(c, stats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve admin stats';
    return sendError(c, message, 400);
  }
};
