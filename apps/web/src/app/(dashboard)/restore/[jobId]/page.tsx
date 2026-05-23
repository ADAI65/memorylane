"use client";

// @memorylane/web - Job Detail Page

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSSE } from '@/hooks/use-sse';
import { useJobStore } from '@/stores/job-store';
import { jobApi } from '@/lib/api/jobs';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Loader2, Download } from 'lucide-react';
import Image from 'next/image';
import type { RestorationJob } from '@memorylane/shared';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const { currentJob, setCurrentJob, clearJobEvents } = useJobStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status, progress, resultUrl, error: sseError } = useSSE({
    jobId,
    onComplete: () => loadJob(),
  });

  const loadJob = async () => {
    setIsLoading(true);
    try {
      const result = await jobApi.get(jobId);
      if (result.success && result.data) {
        setCurrentJob(result.data as any);
      } else {
        setError('Job not found');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    clearJobEvents();
    if (jobId) loadJob();
    return () => clearJobEvents();
  }, [jobId]);

  if (isLoading || !currentJob) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/dashboard">
          <Button variant="ghost" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const job = currentJob;
  const isCompleted = job.status === 'completed';
  const displayStatus = status || job.status;
  const displayProgress = progress || (isCompleted ? 100 : 0);
  const finalResultUrl = resultUrl || job.result_url;

  const statusVariant: Record<string, any> = {
    completed: 'success',
    failed: 'error',
    processing: 'info',
    queued: 'info',
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-primary-800">
            Restoration Job
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {job.id.slice(0, 8)}...
          </p>
        </div>
        <Badge variant={statusVariant[displayStatus] || 'default'} size="md">
          {displayStatus}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Before / After */}
          <Card padding="lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Before</p>
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
                  {job.upload_id ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/${job.upload_id}/preview`}
                      alt="Before"
                      fill
                      className="object-cover rounded-xl"
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No preview</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">After</p>
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
                  {isCompleted && finalResultUrl ? (
                    <Image
                      src={finalResultUrl}
                      alt="After"
                      fill
                      className="object-cover rounded-xl"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="text-center">
                      {displayStatus === 'processing' ? (
                        <>
                          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Processing...</p>
                        </>
                      ) : displayStatus === 'failed' ? (
                        <>
                          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          <p className="text-sm text-red-500">Failed</p>
                        </>
                      ) : (
                        <>
                          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Waiting to start</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Progress */}
          {(displayStatus === 'processing' || isCompleted) && (
            <Card padding="md">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Progress</h3>
              <Progress value={displayProgress} max={100} showPercent label="AI Processing" />
              {isCompleted && finalResultUrl && (
                <div className="mt-4">
                  <a href={finalResultUrl} download>
                    <Button>
                      <Download className="w-4 h-4 mr-2" />
                      Download Result
                    </Button>
                  </a>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card padding="md">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Job Details</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Service</dt>
                <dd className="font-medium text-primary-800 capitalize">
                  {job.service_type.replace(/_/g, ' ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd><Badge variant={statusVariant[displayStatus] || 'default'} size="sm">{displayStatus}</Badge></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-primary-800">{formatRelativeTime(job.created_at)}</dd>
              </div>
              {job.completed_at && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Completed</dt>
                  <dd className="text-primary-800">{formatDate(job.completed_at)}</dd>
                </div>
              )}
              {job.price_cents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Price</dt>
                  <dd className="font-medium text-primary-800">${(job.price_cents / 100).toFixed(2)}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Error message */}
          {job.status === 'failed' && job.error_message && (
            <Card padding="md" className="border-red-200 bg-red-50">
              <h3 className="text-sm font-medium text-red-700 mb-2">Error</h3>
              <p className="text-sm text-red-600">{job.error_message}</p>
              <Button
                variant="danger"
                size="sm"
                className="mt-3 w-full"
                onClick={() => jobApi.retry(job.id)}
              >
                Retry Job
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
