/**
 * Lightweight in-memory rate limiter for single-instance deployment.
 * Uses a sliding window counter per IP.
 *
 * For multi-instance deployments, replace with Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
};

/**
 * Check rate limit for a given key (usually IP + path).
 * Returns true if the request should be rejected (limit exceeded).
 */
export function isRateLimited(key: string, config: RateLimitConfig = DEFAULT_CONFIG): {
  limited: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + config.windowMs };
    store.set(key, entry);
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    return { limited: true, remaining: 0, resetAt: entry.resetAt };
  }

  return { limited: false, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Predefined rate limit configurations for different endpoint types.
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  auth: { windowMs: 60 * 1000, maxRequests: 5 }, // 5/min for login/signup
  upload: { windowMs: 60 * 1000, maxRequests: 10 }, // 10/min for uploads
  aiService: { windowMs: 60 * 1000, maxRequests: 15 }, // 15/min for AI services
  default: { windowMs: 60 * 1000, maxRequests: 60 }, // 60/min for everything else
};
