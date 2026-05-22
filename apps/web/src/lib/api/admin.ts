// @memorylane/web - API Client: Admin endpoints
import { apiClient } from './client';

// Admin stats from GET /api/admin/stats
export interface AdminStats {
  total_users: number;
  total_jobs: number;
  completed_jobs: number;
  total_revenue_cents: number;
}

// Admin revenue from GET /api/admin/revenue
export interface RevenueBreakdown {
  [serviceType: string]: { total_cents: number; count: number };
}

export interface AdminRevenue {
  breakdown: RevenueBreakdown;
  subscription_revenue_cents: number;
  one_time_revenue_cents: number;
  mrr_cents: number;
  total_transactions: number;
  transactions: AdminTransaction[];
  meta: { page: number; per_page: number; total: number; total_pages: number };
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  job_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  service_type: string | null;
  payment_type: 'subscription' | 'one_time';
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  profiles?: { email: string; plan: string } | null;
}

// Admin user from GET /api/admin/users (profiles row)
export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'unlimited';
  subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled';
  stripe_customer_id: string | null;
  daily_free_used: number;
  daily_free_reset_at: string;
  created_at: string;
  updated_at: string;
}

// Admin job from GET /api/admin/jobs (restoration_jobs row with profile join)
export interface AdminJob {
  id: string;
  user_id: string;
  service_type: string;
  status: string;
  ai_model: string | null;
  result_url: string | null;
  error_message: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  queued_at: string | null;
  profiles: { email: string; plan: string } | null;
}

export const adminApi = {
  /** GET /api/admin/stats — platform-wide KPIs */
  getStats: () => apiClient.get<AdminStats>('/api/admin/stats'),

  /** GET /api/admin/revenue — revenue breakdown + transactions */
  getRevenue: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<AdminRevenue>('/api/admin/revenue', params as Record<string, string>),

  /** GET /api/admin/users — paginated user list */
  getUsers: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<AdminUser[]>('/api/admin/users', params as Record<string, string>),

  /** GET /api/admin/jobs — paginated job list, optional status filter */
  getJobs: (params?: { page?: number; per_page?: number; status?: string }) =>
    apiClient.get<AdminJob[]>('/api/admin/jobs', params as Record<string, string>),
};
