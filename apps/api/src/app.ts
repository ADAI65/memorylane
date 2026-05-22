import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { env } from './env';
import { errorHandler } from './utils/response';
import { authMiddleware, adminOnlyMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rate-limit';

// Route imports
import authRoutes from './routes/auth';
import uploadRoutes from './routes/uploads';
import jobRoutes from './routes/jobs';
import serviceRoutes from './routes/services';
import paymentRoutes from './routes/payments';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import stripeWebhook from './routes/webhooks/stripe';

/**
 * App factory for testability
 */
export function createApp() {
  const app = new Hono();

  // Global middleware
  app.use('*', secureHeaders());
  app.use('*', cors({
    origin: [env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'],
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

  // Error handler
  app.onError(errorHandler);

  // Health check
  app.get('/health', (c) => c.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '0.1.0',
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
