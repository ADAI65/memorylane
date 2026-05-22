import { createMiddleware } from 'hono/factory';
import { createClient } from '@supabase/supabase-js';
import { env } from '../env.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { Profile } from '@memorylane/shared';

/**
 * Middleware: Verify Supabase JWT and attach user to context
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  // Create a Supabase client with the user's JWT
  // Server-side JWT verification uses the Authorization header, not the anon key
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, 'https://placeholder.supabase.co', {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new UnauthorizedError('User profile not found');
  }

  // Attach user and profile to context
  c.set('user', { id: user.id, email: user.email! });
  c.set('profile', profile as Profile);

  await next();
});

/**
 * Admin-only middleware (must be used after authMiddleware)
 * Checks independent is_admin role field, NOT subscription plan
 */
export const adminOnlyMiddleware = createMiddleware(async (c, next) => {
  const profile = c.get('profile');
  if (!profile || !profile.is_admin) {
    throw new UnauthorizedError('Admin access required');
  }

  await next();
});

// Extend Hono context types
declare module 'hono' {
  interface ContextVariableMap {
    user: { id: string; email: string };
    profile: Profile;
  }
}
