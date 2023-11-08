import { getAddress } from 'viem';

export function formatAddress(address: string) {
  let str: string;

  try {
    str = getAddress(address);
  } catch {
    str = address;
  }

  return `${str.slice(0, 5)}...${str.slice(-4)}`;
}
