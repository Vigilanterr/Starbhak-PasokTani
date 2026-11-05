import { Hono } from 'hono';
import { authenticate, authorize } from '../middlewares/auth.ts';
import {
  getCategories,
  getCategoriesWithCount,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.ts';

const categoryRouter = new Hono();

categoryRouter.get('/', getCategories);
categoryRouter.get('/count', getCategoriesWithCount);
categoryRouter.post('/', authenticate, authorize(['ADMIN']), createCategory);
categoryRouter.patch('/:id', authenticate, authorize(['ADMIN']), updateCategory);
categoryRouter.delete('/:id', authenticate, authorize(['ADMIN']), deleteCategory);

export default categoryRouter;
