import { Address, PublicClient } from 'viem';
import { LRUCache } from 'lru-cache';

import { formatAddress } from '../utils';

const abi = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const cache = new LRUCache<string, Promise<string>>({ max: 1000 });

export async function getBalanceOf(client: PublicClient, address: string, owner: string) {
  return await client.readContract({
    address: address as Address,
    abi,
    functionName: 'balanceOf',
    args: [owner as Address],
  });
}

async function getNameFn(client: PublicClient, address: string) {
  try {
    return await client.readContract({
      address: address as Address,
      abi,
      functionName: 'name',
    });
  } catch {
    return formatAddress(address);
  }
}

export async function getName(client: PublicClient, address: string) {
  const key = client.key + address;

  let promise = cache.get(key);

  if (!promise) {
    promise = getNameFn(client, address)
      .catch((err) => { cache.delete(key); throw err; });

    cache.set(key, promise);
  }

  return await promise;
}
