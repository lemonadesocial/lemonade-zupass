import type { FastifyPluginCallback } from 'fastify';

export const livezPlugin: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get('/livez', (_, reply) => reply.send('OK'));

  done();
};
