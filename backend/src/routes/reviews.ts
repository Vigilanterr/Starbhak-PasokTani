import { Hono } from 'hono';
import { authenticate } from '../middlewares/auth.ts';
import { createReview, getFarmerReviews, getCommodityReviews } from '../controllers/reviews.ts';

const reviewRouter = new Hono();

reviewRouter.post('/', authenticate, createReview);
reviewRouter.get('/farmer/:farmerId', getFarmerReviews);
reviewRouter.get('/commodity/:commodityId', getCommodityReviews);

export default reviewRouter;
