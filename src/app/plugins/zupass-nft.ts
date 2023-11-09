import { ArgumentTypeName, PCD, SerializedPCD } from '@pcd/pcd-types';
import { EdDSATicketPCDPackage, TicketCategory } from '@pcd/eddsa-ticket-pcd';
import { EmailPCDPackage } from '@pcd/email-pcd';
import { getEdDSAPublicKey } from '@pcd/eddsa-pcd';
import { PCDActionType, PCDPermissionType } from '@pcd/pcd-collection';
import { recoverMessageAddress } from 'viem';
import { RSAImagePCDPackage } from '@pcd/rsa-image-pcd';
import { RSAPCDPackage } from '@pcd/rsa-pcd';
import { SemaphoreSignaturePCD, SemaphoreSignaturePCDClaim, SemaphoreSignaturePCDPackage } from '@pcd/semaphore-signature-pcd';
import { v5 as uuidv5 } from 'uuid';
import { verifyFeedCredential } from '@pcd/passport-interface';
import * as assert from 'node:assert';
import createError from '@fastify/error';
import type { FastifyPluginCallback, RouteHandlerMethod } from 'fastify';

import { formatAddress } from '../utils';
import { getBalanceOf, getName } from '../services/erc721';
import { getClientByChainId } from '../services/client';
import { getCollection } from '../services/simplehash';

import { eddsaPrivateKey, providerName, rsaPrivateKey, uuidNamespace, zupassPublicKey } from '../../config';

EdDSATicketPCDPackage.init?.({});

const ticketName = 'Holder';
const productId = uuidv5(ticketName, uuidNamespace);

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

const listFeedsHandler: RouteHandlerMethod = async (request, reply) => {
  const params = request.params as { chainId: string; contract: string };

  const name = await getName(getClientByChainId(params.chainId), params.contract)

  reply.send({
    providerName,
    providerUrl: `${request.protocol}://${request.hostname}${request.url}`,
    feeds: [
      {
        id: '1',
        name,
        description: `Contract: ${params.contract}\nChain ID: ${params.chainId}`,
        permissions: [
          {
            folder: name,
            type: PCDPermissionType.ReplaceInFolder,
          },
          {
            folder: name,
            type: PCDPermissionType.DeleteFolder,
          },
        ],
        credentialRequest: {
          signatureType: 'sempahore-signature-pcd',
          pcdType: 'email-pcd',
        },
      },
    ],
  });
};

const feedRequestHandler: RouteHandlerMethod = async (request, reply) => {
  const params = request.params as { chainId: string; contract: string; payload: string };
  const body = request.body as { pcd: SerializedPCD<SemaphoreSignaturePCD> };

  const payload = JSON.parse(Buffer.from(params.payload, 'base64').toString()) as { account: string; pcd: string; signature: `0x${string}` };

  const semaphoreSignaturePCD = await SemaphoreSignaturePCDPackage.deserialize(payload.pcd);

  assert.ok(await SemaphoreSignaturePCDPackage.verify(semaphoreSignaturePCD), new PcdInvalidError());

  const credential = await verifyFeedCredential(body.pcd);

  assert.ok(credential.payload.pcd);
  assert.strictEqual(credential.pcd.claim.identityCommitment, semaphoreSignaturePCD.claim.identityCommitment);
  assert.strictEqual(
    await recoverMessageAddress({ message: generateMessage(payload.account, credential.pcd), signature: payload.signature }),
    payload.account
  );

  const emailPCD = await EmailPCDPackage.deserialize(credential.payload.pcd.pcd);

  assert.ok(await EmailPCDPackage.verify(emailPCD), new PcdInvalidError());
  assert.strictEqual(emailPCD.proof.eddsaPCD.claim.publicKey[0], zupassPublicKey[0]);
  assert.strictEqual(emailPCD.proof.eddsaPCD.claim.publicKey[1], zupassPublicKey[1]);

  const client = getClientByChainId(params.chainId);

  const [balance, collection, name] = await Promise.all([
    getBalanceOf(client, params.contract, payload.account),
    getCollection(params.chainId, params.contract),
    getName(client, params.contract),
  ]);

  const id = uuidv5(params.chainId + params.contract, uuidNamespace);

  reply.send({
    actions: [
      {
        type: PCDActionType.DeleteFolder,
        folder: name,
        recursive: false,
      },
      {
        type: PCDActionType.ReplaceInFolder,
        folder: name,
        pcds: balance > 0 ? [
          await EdDSATicketPCDPackage.serialize(
            await EdDSATicketPCDPackage.prove({
              ticket: {
                value: {
                  attendeeEmail: emailPCD.claim.emailAddress,
                  attendeeName: formatAddress(payload.account),
                  eventName: name,
                  eventId: id,
                  ticketName,
                  ticketId: id,
                  productId,
                  ticketCategory: TicketCategory.ZuConnect,
                  checkerEmail: '',
                  isConsumed: false,
                  isRevoked: false,
                  attendeeSemaphoreId: emailPCD.claim.semaphoreId,
                  timestampConsumed: 0,
                  timestampSigned: Date.now(),
                },
                argumentType: ArgumentTypeName.Object,
              },
              privateKey: {
                value: eddsaPrivateKey,
                argumentType: ArgumentTypeName.String,
              },
              id: {
                value: undefined,
                argumentType: ArgumentTypeName.String,
              },
            })
          ),
          await RSAPCDPackage.serialize(
            await RSAPCDPackage.prove({
              id: {
                argumentType: ArgumentTypeName.String,
              },
              signedMessage: {
                argumentType: ArgumentTypeName.String,
                value: `This message attests that the current user is a holder of the ${name} collection.\n\nContract: ${params.contract}\nChain ID: ${params.chainId}`,
              },
              privateKey: {
                argumentType: ArgumentTypeName.String,
                value: rsaPrivateKey,
              },
            }),
          ),
          ...collection?.banner_image_url ? [
            await RSAImagePCDPackage.serialize(
              await RSAImagePCDPackage.prove({
                id: {
                  argumentType: ArgumentTypeName.String,
                },
                url: {
                  argumentType: ArgumentTypeName.String,
                  value: collection.banner_image_url,
                },
                privateKey: {
                  argumentType: ArgumentTypeName.String,
                  value: rsaPrivateKey,
                },
                title: {
                  argumentType: ArgumentTypeName.String,
                  value: name,
                },
              })),
          ] : [],
        ] : [],
      },
    ],
  });
}

const edDSAPublicKeyHandler: RouteHandlerMethod = async (_, reply) => {
  reply.send(await getEdDSAPublicKey(eddsaPrivateKey));
};

export const zupassNftPlugin: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get('/nft/message', {
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

  fastify.get('/nft/:chainId/:contract/:payload', listFeedsHandler);

  fastify.get('/nft/:chainId/:contract/:payload/:feedId', listFeedsHandler);

  fastify.post('/nft/:chainId/:contract/:payload', feedRequestHandler);

  fastify.get('/issue/eddsa-public-key', edDSAPublicKeyHandler);

  done();
};
