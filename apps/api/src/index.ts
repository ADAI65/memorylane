import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './app';
import { env } from './env';
import { createRestorationWorker, closeWorker } from './workers/restoration';
import { createPremiumWorker, closePremiumWorker } from './workers/premium';
import { closeAllQueues } from './lib/queue';
import { closeRedis } from './lib/redis';
import { initializeProviders } from './services/ai';

const app = createApp();

// ── Start Worker ─────────────────────────────────────────
async function startWorker() {
  try {
    await initializeProviders();
    createRestorationWorker();
    createPremiumWorker();
    console.log('[Worker] Both workers initialized (restoration + premium)');
  } catch (err) {
    console.error('[Worker] Failed to initialize worker:', err);
    // Don't crash the server if worker fails to start
    // Worker can be started later when Redis/AI services become available
  }
}

// ── Graceful Shutdown ────────────────────────────────────
async function gracefulShutdown(signal: string) {
  console.log(`\n[Server] ${signal} received, shutting down gracefully...`);

  try {
    await closeWorker();
    await closePremiumWorker();
    await closeAllQueues();
    await closeRedis();
    console.log('[Server] All connections closed');
  } catch (err) {
    console.error('[Server] Error during shutdown:', err);
  }

  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Start Server ─────────────────────────────────────────
serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info: { port: number }) => {
    console.log(`
╔══════════════════════════════════════════╗
║         MemoryLane API Server           ║
╠══════════════════════════════════════════╣
║  Environment: ${env.NODE_ENV.padEnd(26)}║
║  URL:         ${`http://localhost:${info.port}`.padEnd(26)}║
║  Health:      ${`http://localhost:${info.port}/health`.padEnd(26)}║
║  Worker:      ${'Restoration (BullMQ)'.padEnd(26)}║
╚══════════════════════════════════════════╝
    `);

    // Start worker after server is up
    startWorker();
  },
);
