import fastify from 'fastify'
import fastifyCors from '@fastify/cors';

import { logger } from './helpers/pino';

import { livezPlugin } from './plugins/livez';
import { pcdPlugin } from './plugins/pcd';
import { zupassTicketPlugin } from './plugins/zupass-ticket';

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
  await app.register(pcdPlugin);
  await app.register(zupassTicketPlugin);

  return app;
}
