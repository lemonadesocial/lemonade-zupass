import { createPublicClient, http, PublicClient } from 'viem';
import * as assert from 'node:assert';
import createError from '@fastify/error';

import { rpcUrls } from '../../config';

export const ChainInvalidError = createError('ERR_CHAIN_INVALID', 'The chain is invalid.', 422);

const clientsByChainId: Record<number, PublicClient> = {};

async function createClient(rpcUrl: string) {
  const client = createPublicClient({ transport: http(rpcUrl, { fetchOptions: { keepalive: true } }) });

  clientsByChainId[await client.getChainId()] = client;
}

export async function init() {
  await Promise.all(rpcUrls.split(',').map(createClient));
}

export function getClientByChainId(chainId: number | string) {
  assert.ok(clientsByChainId[+chainId], new ChainInvalidError());

  return clientsByChainId[+chainId];
}
