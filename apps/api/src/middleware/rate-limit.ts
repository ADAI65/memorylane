import { createMiddleware } from 'hono/factory';
import { supabaseAdmin } from '../db/supabase.js';
import { DailyLimitError } from '../utils/errors.js';
import { RATE_LIMITS } from '@memorylane/shared';

/**
 * Middleware: Rate limiting based on user plan
 * Checks daily free usage and API rate limits
 */
export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const profile = c.get('profile');
  const plan = profile?.plan || 'free';
  const limits = RATE_LIMITS[plan as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;

  // For free tier, check daily limit on restoration endpoints
  const path = c.req.path;
  if (plan === 'free' && (path.includes('/jobs') || path.includes('/uploads/') && path.endsWith('/process'))) {
    const { data, error } = await supabaseAdmin
      .rpc('check_daily_limit', {
        p_user_id: profile.id,
        p_limit: limits.restorationsPerDay,
      });

    if (error) {
      console.error('Rate limit check error:', error);
    } else if (data) {
      throw new DailyLimitError(limits.restorationsPerDay);
    }
  }

  await next();
});
