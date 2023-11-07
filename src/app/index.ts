import fastify from 'fastify'
import fastifyCors from '@fastify/cors';

import { logger } from './helpers/pino';

import { livezPlugin } from './plugins/livez';

export async function createApp() {
  const app = fastify({
    logger,
    trustProxy: true,
  });

  await app.register(fastifyCors, {
    credentials: true,
    origin: true,
  });

  await app.register(livezPlugin);

  return app;
}
