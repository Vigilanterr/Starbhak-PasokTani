import { Hono } from 'hono';
import { authenticate } from '../middlewares/auth.ts';
import { uploadImage, deleteImage } from '../controllers/upload.ts';

const uploadRouter = new Hono();

uploadRouter.post('/image', authenticate, uploadImage);
uploadRouter.delete('/image/:publicId', authenticate, deleteImage);

export default uploadRouter;
