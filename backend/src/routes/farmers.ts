import { Hono } from 'hono';
import { authenticate, authorize } from '../middlewares/auth.ts';
import {
  listFarmers,
  getFarmerProfile,
  getFarmerProducts,
  getFarmerReviews,
  getFarmerAchievements,
} from '../controllers/farmers.ts';

const farmerRouter = new Hono();

farmerRouter.get('/', authenticate, authorize(['ADMIN']), listFarmers);
farmerRouter.get('/:id', getFarmerProfile);
farmerRouter.get('/:id/products', getFarmerProducts);
farmerRouter.get('/:id/reviews', getFarmerReviews);
farmerRouter.get('/:id/achievements', getFarmerAchievements);

export default farmerRouter;