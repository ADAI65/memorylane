// ── WebSocket polyfill for Node.js < 22 ──
import { createRequire } from 'node:module';
const _req = createRequire(import.meta.url);
if (typeof globalThis.WebSocket === 'undefined') {
  const _ws = _req('ws');
  Object.defineProperty(globalThis, 'WebSocket', { value: _ws.WebSocket || _ws, writable: true, configurable: true });
}

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createClient } from '@supabase/supabase-js';
import { env } from '../env.js';
import { registerSchema, loginSchema } from '@memorylane/shared';
import { success } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';

const auth = new Hono();

// POST /api/auth/register
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json');

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: { full_name: body.full_name },
    },
  });

  if (error) {
    throw new ValidationError(error.message);
  }

  return success(c, {
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
    message: 'Account created. Please check your email to verify your account.',
  });
});

// POST /api/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error || !data.session || !data.user) {
    throw new ValidationError('Invalid email or password');
  }

  return success(c, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: { id: data.user.id, email: data.user.email! },
  });
});

// POST /api/auth/logout
auth.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return success(c, { message: 'Logged out' });
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  await supabase.auth.signOut();
  return success(c, { message: 'Logged out successfully' });
});

// POST /api/auth/refresh
auth.post('/refresh', async (c) => {
  const { refresh_token } = await c.req.json<{ refresh_token?: string }>();
  if (!refresh_token) {
    throw new ValidationError('refresh_token is required');
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.auth.refreshSession({ refresh_token });

  if (error || !data.session) {
    throw new ValidationError('Invalid refresh token');
  }

  return success(c, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
  });
});

// POST /api/auth/forgot-password
auth.post('/forgot-password', async (c) => {
  const { email } = await c.req.json<{ email?: string }>();
  if (!email) {
    throw new ValidationError('email is required');
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    // Don't reveal if email exists
    return success(c, { message: 'If an account exists, a reset link has been sent.' });
  }

  return success(c, { message: 'If an account exists, a reset link has been sent.' });
});

// POST /api/auth/reset-password
auth.post('/reset-password', async (c) => {
  const { password } = await c.req.json<{ password?: string }>();
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ') || !password) {
    throw new ValidationError('token and password are required');
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw new ValidationError(error.message);
  }

  return success(c, { message: 'Password updated successfully' });
});

export default auth;
