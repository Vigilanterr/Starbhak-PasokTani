import { Hono } from 'hono';
import { authenticate } from '../middlewares/auth.js';
import { createReview, getFarmerReviews, getCommodityReviews } from '../controllers/reviews.js';

const reviewRouter = new Hono();

reviewRouter.post('/', authenticate, createReview);
reviewRouter.get('/farmer/:farmerId', getFarmerReviews);
reviewRouter.get('/commodity/:commodityId', getCommodityReviews);

export default reviewRouter;
