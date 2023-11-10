import { ArgumentTypeName, SerializedPCD } from '@pcd/pcd-types';
import { EdDSATicketPCDPackage, TicketCategory } from '../../lib/eddsa-ticket-pcd/src';
import { EmailPCDPackage } from '@pcd/email-pcd';
import { PCDActionType, PCDPermissionType } from '@pcd/pcd-collection';
import { SemaphoreSignaturePCD } from '@pcd/semaphore-signature-pcd';
import { v5 as uuidv5 } from 'uuid';
import { verifyFeedCredential } from '@pcd/passport-interface';
import * as assert from 'node:assert';
import type { FastifyPluginCallback, RouteHandlerMethod } from 'fastify';

import { PcdInvalidError } from './pcd';

import { getTickets } from '../services/lemonade';

import { eddsaPrivateKey, providerName, uuidNamespace, zupassPublicKey } from '../../config';

const folder = 'Lemonade';

const listFeedsHandler: RouteHandlerMethod = async (request, reply) => {
  reply.send({
    providerName,
    providerUrl: `${request.protocol}://${request.hostname}${request.url}`,
    feeds: [
      {
        id: '1',
        name: folder,
        description: 'Your tickets at Lemonade 🍋',
        permissions: [
          {
            folder,
            type: PCDPermissionType.ReplaceInFolder,
          },
          {
            folder,
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
  const body = request.body as { pcd: SerializedPCD<SemaphoreSignaturePCD> };

  const credential = await verifyFeedCredential(body.pcd);

  assert.ok(credential.payload.pcd);

  const emailPCD = await EmailPCDPackage.deserialize(credential.payload.pcd.pcd);

  assert.ok(await EmailPCDPackage.verify(emailPCD), new PcdInvalidError());
  assert.strictEqual(emailPCD.proof.eddsaPCD.claim.publicKey[0], zupassPublicKey[0]);
  assert.strictEqual(emailPCD.proof.eddsaPCD.claim.publicKey[1], zupassPublicKey[1]);

  const tickets = await getTickets(emailPCD.claim.emailAddress);

  reply.send({
    actions: [
      {
        type: PCDActionType.DeleteFolder,
        folder,
        recursive: false,
      },
      {
        type: PCDActionType.ReplaceInFolder,
        folder,
        pcds: tickets && tickets.length > 0 ? await Promise.all(tickets.map(async (ticket) => {
          return await EdDSATicketPCDPackage.serialize(
            await EdDSATicketPCDPackage.prove({
              ticket: {
                value: {
                  attendeeEmail: ticket.user_email,
                  attendeeName: ticket.user_name,
                  eventName: ticket.event_name,
                  eventId: uuidv5(ticket.event_id, uuidNamespace),
                  ticketName: ticket.ticket_type_title,
                  ticketId: uuidv5(ticket._id, uuidNamespace),
                  productId: uuidv5(ticket.ticket_type_id, uuidNamespace),
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
          );
        })) : [],
      },
    ],
  });
}

export const zupassTicketPlugin: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get('/tickets', listFeedsHandler);

  fastify.get('/tickets/:feedId', listFeedsHandler);

  fastify.post('/tickets', feedRequestHandler);

  done();
};
