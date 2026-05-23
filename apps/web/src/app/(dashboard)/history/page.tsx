"use client";

// @memorylane/web - History Page

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobStore } from '@/stores/job-store';
import { jobApi } from '@/lib/api/jobs';
import { formatRelativeTime } from '@/lib/utils';
import { CheckCircle, Clock, AlertCircle, Loader2, RefreshCw, Upload } from 'lucide-react';
import type { RestorationJob } from '@memorylane/shared';

export default function HistoryPage() {
  const { jobs, setJobs, isLoadingJobs, setLoadingJobs } = useJobStore();
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    setLoadError('');
    try {
      const result = await jobApi.list({ per_page: 50 });
      if (result.success && result.data) {
        setJobs(result.data as any);
      }
    } catch (e) {
      console.error(e);
      setLoadError('Failed to load history. Please check your connection and try again.');
    } finally {
      setLoadingJobs(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: any; icon: any; label: string }> = {
      completed: { variant: 'success', icon: CheckCircle, label: 'Completed' },
      failed: { variant: 'error', icon: AlertCircle, label: 'Failed' },
      processing: { variant: 'info', icon: Loader2, label: 'Processing' },
      queued: { variant: 'info', icon: Clock, label: 'Queued' },
      pending: { variant: 'default', icon: Clock, label: 'Pending' },
    };
    return map[status] || { variant: 'default', icon: Clock, label: status };
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary-800">History</h1>
          <p className="text-gray-500 mt-1">All your AI restoration jobs</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadJobs} title="Refresh" className="p-2">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Error Banner */}
      {loadError && (
        <div role="alert" aria-live="assertive" className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{loadError}</span>
          <button
            onClick={loadJobs}
            className="text-red-600 hover:text-red-800 font-medium text-xs underline"
          >
            Retry
          </button>
        </div>
      )}

      {isLoadingJobs ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} width="100%" height={60} />)}
        </div>
      ) : jobs.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <p className="text-gray-500 mb-4">No restoration history yet</p>
          <Link href="/upload"><Button><Upload className="w-4 h-4 mr-2" />Upload Your First Photo</Button></Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job: any) => {
            const { variant, icon: Icon, label } = getStatusBadge(job.status);
            return (
              <Link key={job.id} href={`/restore/${job.id}`}>
                <Card variant="interactive" padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        job.status === 'completed' ? 'bg-green-100' :
                        job.status === 'failed' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          job.status === 'completed' ? 'text-green-600' :
                          job.status === 'failed' ? 'text-red-600' :
                          'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-800">
                          {job.service_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(job.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={variant} size="sm">{label}</Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
