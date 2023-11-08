import { SemaphoreSignaturePCDClaim, SemaphoreSignaturePCDPackage } from '@pcd/semaphore-signature-pcd';
import * as assert from 'node:assert';
import createError from '@fastify/error';
import type { FastifyPluginCallback, RouteHandlerMethod } from 'fastify';
import type { PCD } from '@pcd/pcd-types';

export const PcdInvalidError = createError('ERR_PCD_INVALID', 'The PCD is invalid.', 401);

function generateMessage(account: string, pcd: PCD<SemaphoreSignaturePCDClaim, unknown>) {
  return `Account: ${account}\nIdentity: ${pcd.claim.identityCommitment}`;
}

const messageHandler: RouteHandlerMethod = async (request, reply) => {
  const query = request.query as { account: string; pcd: string };

  const semaphoreSignaturePCD = await SemaphoreSignaturePCDPackage.deserialize(Buffer.from(query.pcd, 'base64').toString());

  assert.ok(await SemaphoreSignaturePCDPackage.verify(semaphoreSignaturePCD), new PcdInvalidError());

  const message = generateMessage(query.account, semaphoreSignaturePCD);

  reply.send({ message });
};

export const zupassPlugin: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get('/message', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          account: { type: 'string' },
          pcd: { type: 'string' },
        },
        required: ['account', 'pcd'],
      },
    },
  }, messageHandler);

  done();
};
