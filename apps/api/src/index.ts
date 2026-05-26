// index.ts - keep clean
import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { env } from './env.js';
import { closeAllQueues } from './lib/queue.js';
import { closeRedis, getRedis } from './lib/redis.js';
import { initializeProviders } from './services/ai/index.js';

const app = createApp();

// Track worker references for graceful shutdown
let closeRestorationWorker: (() => Promise<void>) | null = null;
let closePremiumWorker: (() => Promise<void>) | null = null;

// ── Start Worker (dynamic import — only if Redis is reachable) ──
async function startWorker() {
  try {
    const redis = getRedis();
    await redis.connect();
    console.log('[Worker] Redis connected successfully');
    await initializeProviders();

    const { createRestorationWorker } = await import('./workers/restoration.js');
    const { createPremiumWorker } = await import('./workers/premium.js');

    const restorationWorker = createRestorationWorker();
    const premiumWorker = createPremiumWorker();
    await restorationWorker.run();
    await premiumWorker.run();

    closeRestorationWorker = () => restorationWorker.close();
    closePremiumWorker = () => premiumWorker.close();

    console.log('[Worker] Both workers running (restoration + premium)');
  } catch (err) {
    console.warn('[Worker] Redis unavailable — workers disabled. API server is running without job processing.');
    console.warn('[Worker] Add a Redis service to enable background job processing.');
  }
}

// ── Graceful Shutdown ────────────────────────────────────
async function gracefulShutdown(signal: string) {
  console.log(`\n[Server] ${signal} received, shutting down gracefully...`);
  try {
    if (closeRestorationWorker) await closeRestorationWorker();
    if (closePremiumWorker) await closePremiumWorker();
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
╔════════════════════════════════════════════╗
║         MemoryLane API Server           ║
╠══════════════════════════════════════════╣
║  Environment: ${env.NODE_ENV.padEnd(26)}║
║  URL:         ${`http://localhost:${info.port}`.padEnd(26)}║
║  Health:      ${`http://localhost:${info.port}/health`.padEnd(26)}║
║  Worker:      ${'Restoration (BullMQ)'.padEnd(26)}║
╚══════════════════════════════════════════╝
    `);
    startWorker();
  },
);
