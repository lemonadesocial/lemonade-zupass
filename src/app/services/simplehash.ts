import { LRUCache } from 'lru-cache';
import * as assert from 'node:assert';

import { simplehashApiKey } from '../../config';

interface Collection {
  readonly banner_image_url: string;
}

const chains: Record<number, string> = {
  1: 'ethereum',
};
const cache = new LRUCache<string, Promise<unknown>>({ max: 1000 });

async function requestFn<T>(path: string) {
  assert.ok(simplehashApiKey);

  const response = await fetch(`https://api.simplehash.com${path}`, {
    headers: { 'x-api-key': simplehashApiKey },
    keepalive: true,
  });

  switch (response.status) {
    case 200: return await response.json() as T;
    case 400: return null;
    default:  throw new Error(response.statusText);
  }
}

async function request<T>(path: string, ttl?: number) {
  let promise = cache.get(path) as Promise<T | null> | undefined;

  if (!promise) {
    promise = requestFn<T>(path)
      .catch((err) => { cache.delete(path); throw err; });

    cache.set(path, promise, { ttl });
  }

  return await promise;
}

export async function getCollection(chainId: number | string, address: string) {
  if (!simplehashApiKey || !chains[+chainId]) return;

  const body = await request<{
    collections: Collection[];
  }>(`/api/v0/nfts/collections/${chains[+chainId]}/${address}`);

  return body?.collections[0];
}
