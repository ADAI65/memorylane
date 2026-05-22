"use client";

// @memorylane/web - History Page

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobStore } from '@/stores/job-store';
import { jobApi } from '@/lib/api/jobs';
import { formatRelativeTime } from '@/lib/utils';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import type { RestorationJob } from '@memorylane/shared';

export default function HistoryPage() {
  const { jobs, setJobs, isLoadingJobs, setLoadingJobs } = useJobStore();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const result = await jobApi.list({ per_page: 50 });
      if (result.success && result.data) {
        setJobs(result.data as any);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingJobs(false); }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: any; icon: any }> = {
      completed: { variant: 'success', icon: CheckCircle },
      failed: { variant: 'error', icon: AlertCircle },
      processing: { variant: 'info', icon: Loader2 },
      queued: { variant: 'info', icon: Clock },
      pending: { variant: 'default', icon: Clock },
    };
    return map[status] || { variant: 'default', icon: Clock };
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800">History</h1>
        <p className="text-gray-500 mt-1">All your restoration jobs</p>
      </div>

      {isLoadingJobs ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} width="100%" height={60} />)}
        </div>
      ) : jobs.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <p className="text-gray-500 mb-4">No jobs yet</p>
          <Link href="/upload"><Button>Upload Your First Photo</Button></Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job: any) => {
            const { variant, icon: Icon } = getStatusBadge(job.status);
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
                        <p className="text-sm font-medium text-primary-800 capitalize">
                          {job.service_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(job.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={variant} size="sm">{job.status}</Badge>
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
