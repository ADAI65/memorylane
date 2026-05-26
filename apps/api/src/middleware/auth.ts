// ── WebSocket polyfill for Node.js < 22 ──
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
if (typeof globalThis.WebSocket === 'undefined') {
  const wsMod = _require('ws');
  Object.defineProperty(globalThis, 'WebSocket', {
    value: wsMod.WebSocket || wsMod,
    writable: true,
    configurable: true,
  });
}

import { createMiddleware } from 'hono/factory';
import { jwtVerify, errors as JoseErrors } from 'jose';
import { createClient } from '@supabase/supabase-js';
import { env } from '../env.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { Profile } from '@memorylane/shared';

// Cache the JWT secret as Uint8Array
let jwtSecretBytes: Uint8Array | null = null;
function getJwtSecret(): Uint8Array {
  if (!jwtSecretBytes) {
    jwtSecretBytes = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
  }
  return jwtSecretBytes;
}

/**
 * Middleware: Verify Supabase JWT and attach user to context
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  // Verify JWT locally using jose (no network call needed)
  let payload: Record<string, unknown>;
  try {
    const { payload: verifiedPayload } = await jwtVerify(token, getJwtSecret(), {
      clockTolerance: 60, // 60 seconds leeway for clock skew
    });
    payload = verifiedPayload as Record<string, unknown>;
  } catch (err) {
    if (err instanceof JoseErrors.JWTExpired) {
      throw new UnauthorizedError('Token expired');
    }
    if (err instanceof JoseErrors.JWSSignatureVerificationFailed) {
      throw new UnauthorizedError('Invalid token signature');
    }
    throw new UnauthorizedError('Invalid or expired token');
  }

  const userId = payload.sub as string;
  const userEmail = payload.email as string;

  if (!userId) {
    throw new UnauthorizedError('Invalid token: missing user ID');
  }

  // Get user profile from database using admin client
  const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    // @ts-expect-error - channels is not in the type definition but works at runtime
    realtime: { channels: 'none' },
  });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new UnauthorizedError('User profile not found');
  }

  // Attach user and profile to context
  c.set('user', { id: userId, email: userEmail || profile.email });
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
