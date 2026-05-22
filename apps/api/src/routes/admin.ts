import { Hono } from 'hono';
import { supabaseAdmin } from '../db/supabase';
import { success, paginated } from '../utils/response';

const admin = new Hono();

// GET /api/admin/stats
admin.get('/stats', async (c) => {
  const { count: totalUsers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalJobs } = await supabaseAdmin
    .from('restoration_jobs')
    .select('*', { count: 'exact', head: true });

  const { count: completedJobs } = await supabaseAdmin
    .from('restoration_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  // Sum revenue from succeeded payments (not just count records)
  const { data: revenueRows } = await supabaseAdmin
    .from('payments')
    .select('amount_cents')
    .eq('status', 'succeeded');

  const totalRevenueCents = (revenueRows || []).reduce((sum, r) => sum + (r.amount_cents || 0), 0);

  return success(c, {
    total_users: totalUsers || 0,
    total_jobs: totalJobs || 0,
    completed_jobs: completedJobs || 0,
    total_revenue_cents: totalRevenueCents,
  });
});

// GET /api/admin/revenue — revenue breakdown + recent transactions
admin.get('/revenue', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('per_page') || '20');

  // Revenue breakdown by service_type (from succeeded payments)
  const { data: allPayments } = await supabaseAdmin
    .from('payments')
    .select('id, service_type, amount_cents, payment_type, status, job_id, user_id, created_at')
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false });

  const payments = allPayments || [];

  // Aggregate by service_type
  const byService: Record<string, { total_cents: number; count: number }> = {};
  for (const p of payments) {
    const key = p.service_type || 'unknown';
    if (!byService[key]) byService[key] = { total_cents: 0, count: 0 };
    byService[key].total_cents += p.amount_cents || 0;
    byService[key].count += 1;
  }

  // Separate subscription vs one-time
  const subscriptionRevenue = payments
    .filter((p) => p.payment_type === 'subscription')
    .reduce((s, p) => s + (p.amount_cents || 0), 0);
  const oneTimeRevenue = payments
    .filter((p) => p.payment_type === 'one_time')
    .reduce((s, p) => s + (p.amount_cents || 0), 0);

  // Calculate MRR (sum of latest monthly subscription amounts per customer)
  // payments table has user_id directly — no need for job_id join
  const subPayments = payments.filter((p) => p.payment_type === 'subscription');
  const latestSubByCustomer: Record<string, number> = {};
  for (const p of subPayments) {
    // payments already has user_id from the select above
    if (p.user_id && !latestSubByCustomer[p.user_id]) {
      latestSubByCustomer[p.user_id] = p.amount_cents || 0;
    }
  }
  const mrrCents = Object.values(latestSubByCustomer).reduce((s, v) => s + v, 0);

  // Recent transactions (paginated)
  const { data: txData, count: txCount, error: txError } = await supabaseAdmin
    .from('payments')
    .select('*, profiles!payments_user_id_fkey(email, plan)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (txError) {
    return c.json({ success: false, error: { message: 'Failed to fetch revenue data' } }, 500);
  }

  return success(c, {
    breakdown: byService,
    subscription_revenue_cents: subscriptionRevenue,
    one_time_revenue_cents: oneTimeRevenue,
    mrr_cents: mrrCents,
    total_transactions: payments.length,
    transactions: txData || [],
    meta: {
      page,
      per_page: perPage,
      total: txCount || 0,
      total_pages: Math.ceil((txCount || 0) / perPage),
    },
  });
});

// GET /api/admin/users
admin.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('per_page') || '20');

  const { data, count, error } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) {
    return c.json({ success: false, error: { message: 'Failed to fetch users' } }, 500);
  }

  return paginated(c, data || [], page, perPage, count || 0);
});

// GET /api/admin/jobs
admin.get('/jobs', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('per_page') || '20');
  const status = c.req.query('status');

  let query = supabaseAdmin
    .from('restoration_jobs')
    .select('*, profiles(email, plan)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status) query = query.eq('status', status);

  const { data, count, error } = await query;

  if (error) {
    return c.json({ success: false, error: { message: 'Failed to fetch jobs' } }, 500);
  }

  return paginated(c, data || [], page, perPage, count || 0);
});

export default admin;
