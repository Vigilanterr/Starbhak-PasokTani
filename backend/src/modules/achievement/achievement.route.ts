import { Hono } from 'hono';
import { authenticate, authorize } from '../../middlewares/auth.js';
import {
  getAchievements,
  getMyAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from './achievement.controller.js';

const achievementRouter = new Hono();

achievementRouter.get('/', authenticate, authorize(['ADMIN', 'FARMER']), getAchievements);
achievementRouter.get('/me', authenticate, authorize(['FARMER']), getMyAchievements);
achievementRouter.post('/', authenticate, authorize(['ADMIN']), createAchievement);
achievementRouter.patch('/:id', authenticate, authorize(['ADMIN']), updateAchievement);
achievementRouter.delete('/:id', authenticate, authorize(['ADMIN']), deleteAchievement);

export default achievementRouter;