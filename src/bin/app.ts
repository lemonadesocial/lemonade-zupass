import { createApp } from '../app';

async function main() {
  const app = await createApp();

  await app.listen({ host: '0.0.0.0', port: 4000 });

  process.on('SIGINT', () => app.close());
  process.on('SIGTERM', () => app.close());
}

void main();
