import { pino } from 'pino';

const targets: pino.TransportTargetOptions[] = [
  { level: 'trace', target: 'pino/file', options: { destination: 1 } },
  { level: 'fatal', target: 'pino/file', options: { destination: 2 } },
];

export const logger = pino(
  { level: 'trace' },
  pino.transport({ targets })
);
