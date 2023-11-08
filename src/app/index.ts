import fastify from 'fastify'
import fastifyCors from '@fastify/cors';

import { logger } from './helpers/pino';

import { livezPlugin } from './plugins/livez';
import { zupassPlugin } from './plugins/zupass';

import * as chain from './services/client';

export async function createApp() {
  const app = fastify({
    logger,
    trustProxy: true,
  });

  app.addHook('onReady', async () => {
    try {
      await chain.init();
    } catch (err) {
      app.log.fatal(err);
      process.exit(1);
    }
  });

  await app.register(fastifyCors, {
    credentials: true,
    origin: true,
  });

  await app.register(livezPlugin);
  await app.register(zupassPlugin);

  return app;
}
