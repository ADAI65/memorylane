import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { env } from './env.js';
import { errorHandler } from './utils/response.js';
import { authMiddleware, adminOnlyMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rate-limit.js';
import { isRateLimited, RATE_LIMIT_CONFIGS } from './lib/rate-limiter.js';
import { RateLimitError } from './utils/errors.js';

// Route imports
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/uploads.js';
import jobRoutes from './routes/jobs.js';
import serviceRoutes from './routes/services.js';
import paymentRoutes from './routes/payments.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import stripeWebhook from './routes/webhooks/stripe.js';

/**
 * Parse ALLOWED_ORIGINS env var into an array of origins.
 * Defaults to NEXT_PUBLIC_APP_URL + localhost if not set.
 */
function parseAllowedOrigins(): string[] {
  const allowed = env.ALLOWED_ORIGINS;
  if (allowed) {
    return allowed.split(',').map((o) => o.trim()).filter(Boolean);
  }
  // Fallback defaults
  return [
    env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://memorylane-web.vercel.app',
  ];
}

/**
 * App factory for testability
 */
export function createApp() {
  const app = new Hono();
  const allowedOrigins = parseAllowedOrigins();

  // Security headers (custom — extends hono/secureHeaders)
  app.use('*', async (c, next) => {
    await next();
    // Add missing security headers that secureHeaders() doesn't cover
    if (!c.res.headers.get('X-Content-Type-Options')) {
      c.header('X-Content-Type-Options', 'nosniff');
    }
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    c.header('X-Request-Id', crypto.randomUUID());
  });

  app.use('*', secureHeaders());
  app.use('*', cors({
    origin: (origin) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return origin;
      if (allowedOrigins.includes(origin)) return origin;
      return undefined; // Reject
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
    exposeHeaders: ['X-Total-Count'],
  }));

  // Logger in development only
  if (env.NODE_ENV === 'development') {
    app.use('*', logger());
    app.use('*', prettyJSON());
  }

  // IP-based rate limiting (all requests)
  app.use('*', async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || 'unknown';
    const path = c.req.path;

    // Select rate limit config based on endpoint type
    let config = RATE_LIMIT_CONFIGS.default;
    if (path.includes('/auth/')) config = RATE_LIMIT_CONFIGS.auth;
    else if (path.includes('/uploads')) config = RATE_LIMIT_CONFIGS.upload;
    else if (path.includes('/services') || path.includes('/jobs')) config = RATE_LIMIT_CONFIGS.aiService;

    const key = `${ip}:${path.split('/').slice(0, 3).join('/')}`;
    const result = isRateLimited(key, config);

    // Set rate limit headers
    c.header('X-RateLimit-Remaining', String(result.remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

    if (result.limited) {
      throw new RateLimitError(`Too many requests. Try again in ${Math.ceil((result.resetAt - Date.now()) / 1000)}s`);
    }

    await next();
  });

  // Error handler
  app.onError(errorHandler);

  // Health check
  app.get('/health', (c) => c.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '0.1.0',
    node_version: process.version,
    has_native_ws: typeof WebSocket !== 'undefined',
    has_global_ws: typeof globalThis.WebSocket !== 'undefined',
    preload_ran: !!process.env.__PRELOAD_RAN,
  }));

  // API info
  app.get('/', (c) => c.json({
    name: 'MemoryLane API',
    version: '0.1.0',
    docs: `${env.API_BASE_URL}/health`,
  }));

  // Webhooks (no auth - use signature verification)
  app.route('/api/webhooks/stripe', stripeWebhook);

  // Public auth routes
  app.route('/api/auth', authRoutes);

  // Protected routes (require authentication)
  const protectedRoutes = new Hono();
  protectedRoutes.use('*', authMiddleware);
  protectedRoutes.use('*', rateLimitMiddleware);

  protectedRoutes.route('/api/uploads', uploadRoutes);
  protectedRoutes.route('/api/jobs', jobRoutes);
  protectedRoutes.route('/api/services', serviceRoutes);
  protectedRoutes.route('/api/payments', paymentRoutes);
  protectedRoutes.route('/api/users', userRoutes);

  // Admin routes (require authentication + admin role)
  const adminRoutesGroup = new Hono();
  adminRoutesGroup.use('*', authMiddleware);
  adminRoutesGroup.use('*', adminOnlyMiddleware);
  adminRoutesGroup.route('/api/admin', adminRoutes);

  // Mount route groups
  app.route('/', protectedRoutes);
  app.route('/', adminRoutesGroup);

  // 404 handler
  app.notFound((c) => c.json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${c.req.method} ${c.req.path} not found` },
  }, 404));

  return app;
}
