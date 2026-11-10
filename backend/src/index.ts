import { createApp } from './app';
import { createDeps } from './factory';
import { loadEnv } from './lib/env';

// Env is validated when the function starts. A bad value fails the boot, not a later request.
const app = createApp(createDeps(loadEnv()));

export default app;
