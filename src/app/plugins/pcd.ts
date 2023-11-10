import { EdDSATicketPCDPackage } from '../../lib/eddsa-ticket-pcd/src';
import { getEdDSAPublicKey } from '@pcd/eddsa-pcd';
import createError from '@fastify/error';
import type { FastifyPluginCallback, RouteHandlerMethod } from 'fastify';

import { eddsaPrivateKey } from '../../config';

EdDSATicketPCDPackage.init?.({});

export const PcdInvalidError = createError('ERR_PCD_INVALID', 'The PCD is invalid.', 401);

const edDSAPublicKeyHandler: RouteHandlerMethod = async (_, reply) => {
  reply.send(await getEdDSAPublicKey(eddsaPrivateKey));
};

export const pcdPlugin: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get('/issue/eddsa-public-key', edDSAPublicKeyHandler);

  done();
};
