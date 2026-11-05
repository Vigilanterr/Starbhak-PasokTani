import { Hono } from 'hono';
import { swaggerDocument, swaggerHtml } from '../config/swagger.js';

const docsRouter = new Hono();

docsRouter.get('/', (c) => c.html(swaggerHtml));
docsRouter.get('/openapi.json', (c) => c.json(swaggerDocument));

export default docsRouter;
