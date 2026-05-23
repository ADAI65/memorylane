"use client";

// @memorylane/web - Admin Overview Page (中文版)
// Only accessible to admin users (is_admin = true)

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { adminApi } from '@/lib/api/admin';
import { formatRelativeTime } from '@/lib/utils';
import {
  Users,
  Image,
  CheckCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Clock,
  Loader2,
  TrendingUp,
  CreditCard,
  Repeat,
  Zap,
} from 'lucide-react';
import type { AdminStats, AdminUser, AdminJob, AdminRevenue } from '@/lib/api/admin';
import type { PaginationMeta } from '@memorylane/shared';

// ─── Stat Card ────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  prefix = '',
  suffix = '',
  loading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          {loading ? (
            <Skeleton width={80} height={32} />
          ) : (
            <p className="text-2xl font-bold text-primary-800 mt-1">
              {prefix}{value}{suffix}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </Card>
  );
}

// ─── Status Mappings ──────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  completed: '已完成',
  failed: '失败',
  processing: '处理中',
  queued: '队列中',
  pending: '待处理',
  canceled: '已取消',
  active: '活跃',
  inactive: '未激活',
};

const STATUS_COLORS: Record<string, 'success' | 'error' | 'info' | 'warning' | 'default'> = {
  completed: 'success',
  failed: 'error',
  processing: 'info',
  queued: 'warning',
  pending: 'default',
  canceled: 'error',
};

// ─── Users Table ──────────────────────────────────────────────

function UsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.getUsers({ page: p, per_page: 10 });
      if (result.success && result.data) {
        setUsers(result.data as unknown as AdminUser[]);
        setMeta(result.meta ?? null);
      } else {
        setError(result.error?.message || '加载用户失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(page); }, [page, loadUsers]);

  const totalPages = meta ? meta.total_pages : 1;

  return (
    <Card padding="md">
      <CardHeader className="!mb-4 flex items-center justify-between">
        <div>
          <CardTitle>用户管理</CardTitle>
          <CardDescription>{meta?.total ?? '—'} 位注册用户</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => loadUsers(page)}>
          <RefreshCw className="w-4 h-4 mr-1" /> 刷新
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-red-500 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} width="100%" height={44} />)}
          </div>
        ) : users.length === 0 ? (
          <p className="text-center py-8 text-gray-400">暂无用户</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-2 font-medium text-gray-500">用户</th>
                  <th className="pb-2 font-medium text-gray-500">套餐</th>
                  <th className="pb-2 font-medium text-gray-500 hidden sm:table-cell">状态</th>
                  <th className="pb-2 font-medium text-gray-500 hidden md:table-cell">注册时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                          {(u.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-primary-800 text-sm">
                            {u.full_name || u.email?.split('@')[0] || '未知'}
                          </p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <Badge
                        variant={u.plan === 'unlimited' ? 'gold' : u.plan === 'pro' ? 'default' : 'info'}
                        size="sm"
                      >
                        {u.plan}
                      </Badge>
                    </td>
                    <td className="py-2.5 hidden sm:table-cell">
                      <Badge
                        variant={u.subscription_status === 'active' ? 'success' : 'error'}
                        size="sm"
                      >
                        {STATUS_LABELS[u.subscription_status] || u.subscription_status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-gray-500 hidden md:table-cell">
                      {formatRelativeTime(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              第 {page} / {totalPages} 页
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Jobs Table ───────────────────────────────────────────────

const SERVICE_LABELS: Record<string, string> = {
  basic_restoration: '基础修复',
  photo_animation: '照片动画',
  memory_video: '记忆视频',
  historical_dating: '历史年代判定',
  era_colorization: '年代上色',
  face_match: '人脸匹配',
  archival_certificate: '档案证书',
  subscription: '订阅',
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  all: '全部',
  pending: '待处理',
  queued: '队列中',
  processing: '处理中',
  completed: '已完成',
  failed: '失败',
};

function JobsTable() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const loadJobs = useCallback(async (p: number, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(p), per_page: '10' };
      if (status) params.status = status;
      const result = await adminApi.getJobs(params);
      if (result.success && result.data) {
        setJobs(result.data as unknown as AdminJob[]);
        setMeta(result.meta ?? null);
      } else {
        setError(result.error?.message || '加载任务失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(page, statusFilter); }, [page, statusFilter, loadJobs]);

  const totalPages = meta ? meta.total_pages : 1;

  return (
    <Card padding="md">
      <CardHeader className="!mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle>任务管理</CardTitle>
          <CardDescription>{meta?.total ?? '—'} 个处理任务</CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter chips */}
          {['all', 'pending', 'queued', 'processing', 'completed', 'failed'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s === 'all' ? undefined : s);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                (statusFilter || 'all') === s
                  ? 'bg-accent/10 text-accent'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {STATUS_FILTER_LABELS[s] || s}
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => loadJobs(page, statusFilter)}>
            <RefreshCw className="w-4 h-4 mr-1" /> 刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-red-500 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} width="100%" height={44} />)}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center py-8 text-gray-400">暂无任务</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-2 font-medium text-gray-500">服务</th>
                  <th className="pb-2 font-medium text-gray-500">状态</th>
                  <th className="pb-2 font-medium text-gray-500 hidden sm:table-cell">用户</th>
                  <th className="pb-2 font-medium text-gray-500 hidden md:table-cell">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5">
                      <p className="font-medium text-primary-800 text-sm">
                        {SERVICE_LABELS[j.service_type] || j.service_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{j.id.slice(0, 8)}</p>
                    </td>
                    <td className="py-2.5">
                      <Badge variant={STATUS_COLORS[j.status] || 'default'} size="sm">
                        {j.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        {STATUS_LABELS[j.status] || j.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-gray-500 hidden sm:table-cell">
                      {j.profiles?.email || '—'}
                      {j.profiles?.plan && (
                        <Badge variant="info" size="sm" className="ml-1.5">{j.profiles.plan}</Badge>
                      )}
                    </td>
                    <td className="py-2.5 text-gray-500 hidden md:table-cell">
                      {formatRelativeTime(j.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              第 {page} / {totalPages} 页
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Revenue Section ──────────────────────────────────────────

const PAYMENT_STATUS_COLORS: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  succeeded: 'success',
  failed: 'error',
  pending: 'warning',
  canceled: 'default',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  succeeded: '成功',
  failed: '失败',
  pending: '待处理',
  canceled: '已取消',
};

function RevenueSection() {
  const [revenue, setRevenue] = useState<AdminRevenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadRevenue = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.getRevenue({ page: p, per_page: 10 });
      if (result.success && result.data) {
        setRevenue(result.data as unknown as AdminRevenue);
      } else {
        setError(result.error?.message || '加载收入数据失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRevenue(page); }, [page, loadRevenue]);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const breakdown = revenue?.breakdown || {};
  const breakdownEntries = Object.entries(breakdown).sort((a, b) => b[1].total_cents - a[1].total_cents);
  const maxBreakdown = breakdownEntries.length > 0 ? breakdownEntries[0][1].total_cents : 1;
  const transactions = revenue?.transactions || [];
  const txMeta = revenue?.meta;
  const totalPages = txMeta ? txMeta.total_pages : 1;

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="总收入"
          value={revenue ? fmt(revenue.subscription_revenue_cents + revenue.one_time_revenue_cents) : '—'}
          icon={DollarSign}
          color="text-gold-dark"
          bgColor="bg-gold/10"
          loading={loading}
        />
        <StatCard
          label="月经常性收入 (MRR)"
          value={revenue ? fmt(revenue.mrr_cents) : '—'}
          icon={Repeat}
          color="text-purple-600"
          bgColor="bg-purple-50"
          loading={loading}
        />
        <StatCard
          label="一次性付费收入"
          value={revenue ? fmt(revenue.one_time_revenue_cents) : '—'}
          icon={Zap}
          color="text-amber-600"
          bgColor="bg-amber-50"
          loading={loading}
        />
      </div>

      {/* Revenue Breakdown by Service */}
      <Card padding="md">
        <CardHeader className="!mb-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            按服务分类收入
          </CardTitle>
          <CardDescription>
            共 {revenue?.total_transactions ?? '—'} 笔交易
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} width="100%" height={40} />)}
            </div>
          ) : breakdownEntries.length === 0 ? (
            <p className="text-center py-8 text-gray-400">暂无收入数据</p>
          ) : (
            <div className="space-y-3">
              {breakdownEntries.map(([serviceType, data]) => {
                const pct = maxBreakdown > 0 ? (data.total_cents / maxBreakdown) * 100 : 0;
                const label = SERVICE_LABELS[serviceType] || serviceType.replace(/_/g, ' ');
                return (
                  <div key={serviceType} className="flex items-center gap-3">
                    <div className="w-40 sm:w-48 text-sm font-medium text-primary-800 truncate" title={label}>
                      {label}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent/80 to-accent rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-24 text-right text-sm">
                      <span className="font-semibold text-primary-800">{fmt(data.total_cents)}</span>
                      <span className="text-gray-400 ml-1">({data.count})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions Table */}
      <Card padding="md">
        <CardHeader className="!mb-4 flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent" />
              近期交易
            </CardTitle>
            <CardDescription>{txMeta?.total ?? '—'} 条支付记录</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => loadRevenue(page)}>
            <RefreshCw className="w-4 h-4 mr-1" /> 刷新
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-500 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          ) : loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} width="100%" height={44} />)}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 text-gray-400">暂无交易记录</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-2 font-medium text-gray-500">客户</th>
                    <th className="pb-2 font-medium text-gray-500">服务</th>
                    <th className="pb-2 font-medium text-gray-500">类型</th>
                    <th className="pb-2 font-medium text-gray-500">金额</th>
                    <th className="pb-2 font-medium text-gray-500 hidden sm:table-cell">状态</th>
                    <th className="pb-2 font-medium text-gray-500 hidden md:table-cell">日期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5">
                        <p className="text-sm text-primary-800 font-medium">
                          {tx.profiles?.email?.split('@')[0] || '—'}
                        </p>
                        <p className="text-xs text-gray-400">{tx.profiles?.email || '—'}</p>
                      </td>
                      <td className="py-2.5">
                        <p className="text-sm text-primary-800">
                          {SERVICE_LABELS[tx.service_type || ''] || tx.service_type?.replace(/_/g, ' ') || '—'}
                        </p>
                      </td>
                      <td className="py-2.5">
                        <Badge variant={tx.payment_type === 'subscription' ? 'info' : 'gold'} size="sm">
                          {tx.payment_type === 'subscription' ? '周期性' : '一次性'}
                        </Badge>
                      </td>
                      <td className="py-2.5 font-semibold text-primary-800">
                        {fmt(tx.amount_cents)}
                      </td>
                      <td className="py-2.5 hidden sm:table-cell">
                        <Badge variant={PAYMENT_STATUS_COLORS[tx.status] || 'default'} size="sm">
                          {PAYMENT_STATUS_LABELS[tx.status] || tx.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-gray-500 hidden md:table-cell">
                        {formatRelativeTime(tx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                第 {page} / {totalPages} 页
              </p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────

export default function AdminPage() {
  const { user, plan, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const loadStats = async () => {
      try {
        const result = await adminApi.getStats();
        if (result.success && result.data) {
          setStats(result.data as unknown as AdminStats);
        } else {
          setStatsError(result.error?.message || '加载统计数据失败');
        }
      } catch {
        setStatsError('网络错误');
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, [isAdmin]);

  // Access denied
  if (!statsLoading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 rounded-full bg-red-50 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-primary-800 mb-2">访问受限</h2>
        <p className="text-gray-500 text-center max-w-md">
          管理后台仅对管理员开放。请联系管理员获取权限。
        </p>
      </div>
    );
  }

  const revenue = stats ? (stats.total_revenue_cents / 100).toFixed(2) : '—';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-primary-800">管理后台</h1>
        <p className="text-gray-500 mt-1">
          平台数据概览与管理
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="总用户数"
          value={stats?.total_users.toString() ?? '—'}
          icon={Users}
          color="text-accent"
          bgColor="bg-accent/10"
          loading={statsLoading}
        />
        <StatCard
          label="总任务数"
          value={stats?.total_jobs.toString() ?? '—'}
          icon={Image}
          color="text-blue-600"
          bgColor="bg-blue-50"
          loading={statsLoading}
        />
        <StatCard
          label="已完成"
          value={stats?.completed_jobs.toString() ?? '—'}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-50"
          loading={statsLoading}
        />
        <StatCard
          label="总收入"
          value={revenue}
          icon={DollarSign}
          color="text-gold-dark"
          bgColor="bg-gold/10"
          prefix="$"
          loading={statsLoading}
        />
      </div>

      {/* Jobs Table */}
      <JobsTable />

      {/* Revenue Section */}
      <RevenueSection />

      {/* Users Table */}
      <UsersTable />
    </div>
  );
}
