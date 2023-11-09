import { createApp } from '../app';

async function main() {
  const app = await createApp();

  await app.listen({ host: '0.0.0.0', port: 4000 });

  async function close() {
    await app.close();

    /**
     * Please note that the forced exit below is required due to a handle leak in the proof verification library.
     * See https://github.com/semaphore-protocol/semaphore/issues/318
     */
    process.exit(0);
  }

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}

void main();
