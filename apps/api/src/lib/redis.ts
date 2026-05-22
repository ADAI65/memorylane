// @memorylane/api - Redis connection via ioredis
import Redis from 'ioredis';
import { env } from '../env.js';

let _redis: Redis | null = null;

/**
 * Get or create a singleton Redis connection
 */
export function getRedis(): Redis {
  if (!_redis || _redis.status === 'end' || _redis.status === 'close') {
    _redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 5000);
        return delay;
      },
    });

    _redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });

    _redis.on('connect', () => {
      console.log('[Redis] Connected');
    });
  }
  return _redis;
}

/**
 * Create a dedicated Redis connection for BullMQ
 * BullMQ requires maxRetriesPerRequest: null
 */
export function getBullMQRedis(): Redis {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
      // Exponential backoff capped at 30s, max 10 retries then stop
      if (times > 10) return null; // Stop retrying after 10 attempts
      const delay = Math.min(times * 3000, 30_000);
      return delay;
    },
  });
}

/**
 * Close all Redis connections (for graceful shutdown)
 */
export async function closeRedis(): Promise<void> {
  if (_redis) {
    await _redis.quit();
    _redis = null;
  }
}
