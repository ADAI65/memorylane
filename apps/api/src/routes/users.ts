import { Hono } from 'hono';
import { supabaseAdmin } from '../db/supabase.js';
import { success } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';

const users = new Hono();

// GET /api/users/me - Get current user profile
users.get('/me', async (c) => {
  const profile = c.get('profile');
  return success(c, profile);
});

// PATCH /api/users/me - Update profile
users.patch('/me', async (c) => {
  const profile = c.get('profile');
  const body = await c.req.json<{
    full_name?: string;
    avatar_url?: string;
  }>();

  const { data: updated, error } = await supabaseAdmin
    .from('profiles')
    .update({
      ...(body.full_name && { full_name: body.full_name }),
      ...(body.avatar_url && { avatar_url: body.avatar_url }),
    })
    .eq('id', profile.id)
    .select()
    .single();

  if (error) throw new ValidationError('Failed to update profile');

  return success(c, updated);
});

// GET /api/users/me/usage - Get usage stats
users.get('/me/usage', async (c) => {
  const profile = c.get('profile');

  const { count: todayJobs } = await supabaseAdmin
    .from('restoration_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .gte('created_at', new Date().toISOString().split('T')[0]);

  const { count: totalJobs } = await supabaseAdmin
    .from('restoration_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id);

  return success(c, {
    plan: profile.plan,
    daily_free_used: profile.daily_free_used,
    daily_free_limit: profile.plan === 'free' ? 1 : profile.plan === 'pro' ? 50 : 1000,
    today_restorations: todayJobs || 0,
    total_restorations: totalJobs || 0,
  });
});

// DELETE /api/users/me - Delete account
users.delete('/me', async (c) => {
  const profile = c.get('profile');

  // This will cascade delete all user data via RLS
  await supabaseAdmin.auth.admin.deleteUser(profile.id);

  return success(c, { message: 'Account deleted successfully' });
});

export default users;
