import { Hono } from 'hono';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getProducts,
  getProduct,
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  updateStock,
  togglePublish,
} from '../controllers/products.js';

const productRouter = new Hono();

productRouter.get('/', getProducts);
productRouter.get('/:id', getProduct);
productRouter.post('/', authenticate, authorize(['FARMER']), createProduct);
productRouter.get('/me/products', authenticate, authorize(['FARMER']), getMyProducts);
productRouter.patch('/:id', authenticate, authorize(['FARMER']), updateProduct);
productRouter.delete('/:id', authenticate, authorize(['FARMER']), deleteProduct);
productRouter.patch('/:id/stock', authenticate, authorize(['FARMER']), updateStock);
productRouter.patch('/:id/publish', authenticate, authorize(['FARMER']), togglePublish);

export default productRouter;
