"use client";

// @memorylane/web - Dashboard Page

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useJobStore } from '@/stores/job-store';
import { jobApi } from '@/lib/api/jobs';
import { uploadApi } from '@/lib/api/upload';
import { formatRelativeTime } from '@/lib/utils';
import { Upload, Sparkles, Image, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import type { RestorationJob, Upload as UploadType } from '@memorylane/shared';

export default function DashboardPage() {
  const { user, plan, isAdmin } = useAuth();
  const { jobs, setJobs, isLoadingJobs, setLoadingJobs } = useJobStore();
  const [uploads, setUploads] = useState<UploadType[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingJobs(true);
    setIsLoadingUploads(true);
    setLoadError('');
    try {
      const [jobsResult, uploadsResult] = await Promise.all([
        jobApi.list({ per_page: 5 }),
        uploadApi.list({ per_page: 5 }),
      ]);
      if (jobsResult.success && jobsResult.data) setJobs(jobsResult.data as any);
      if (uploadsResult.success && uploadsResult.data) setUploads(uploadsResult.data as any);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoadError('Failed to load data. Please check your connection and try again.');
    } finally {
      setLoadingJobs(false);
      setIsLoadingUploads(false);
    }
  };

  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      {loadError && (
        <div role="alert" aria-live="assertive" className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{loadError}</span>
          <button
            onClick={loadData}
            className="text-red-600 hover:text-red-800 font-medium text-xs underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary-800">
            Welcome back, {user?.full_name || 'friend'}!
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? 'Admin account — all limits removed'
              : 'Free plan — unlimited basic restoration, premium video 1x/day'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            title="Refresh"
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-primary-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/upload">
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Restorations', value: jobs.length.toString(), icon: Image, color: 'text-accent', bgColor: 'bg-accent/10' },
          { label: 'Completed', value: jobs.filter((j: any) => j.status === 'completed').length.toString(), icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
          { label: 'Failed', value: jobs.filter((j: any) => j.status === 'failed').length.toString(), icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  {isLoadingJobs ? (
                    <Skeleton width={60} height={32} />
                  ) : (
                    <p className="text-2xl font-bold text-primary-800 mt-1">{stat.value}</p>
                  )}
                </div>
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/upload" className="block">
          <Card variant="interactive" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/10">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle>Upload New Photo</CardTitle>
                <CardDescription>Start a new restoration job</CardDescription>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/services/animation" className="block">
          <Card variant="interactive" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gold/10">
                <Sparkles className="w-6 h-6 text-gold-dark" />
              </div>
              <div>
                <CardTitle>Premium Services</CardTitle>
                <CardDescription>Explore AI animation & more</CardDescription>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/history" className="block">
          <Card variant="interactive" padding="md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary-800/10">
                <Image className="w-6 h-6 text-primary-800" />
              </div>
              <div>
                <CardTitle>View History</CardTitle>
                <CardDescription>Browse all restoration records</CardDescription>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Jobs */}
      <Card padding="md">
        <CardHeader className="!mb-4 flex items-center justify-between">
          <div>
            <CardTitle>Recent Restorations</CardTitle>
            <CardDescription>Your latest AI processing jobs</CardDescription>
          </div>
          <Link href="/history">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoadingJobs ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width="100%" height={60} />
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No restoration history yet.</p>
              <Link href="/upload">
                <Button variant="ghost" size="sm" className="mt-2">Upload Your First Photo</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job: any) => (
                <Link key={job.id} href={`/restore/${job.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        job.status === 'completed' ? 'bg-green-100' :
                        job.status === 'failed' ? 'bg-red-100' :
                        job.status === 'processing' ? 'bg-accent/10' : 'bg-gray-100'
                      }`}>
                        {job.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : job.status === 'failed' ? (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-accent" />
                        )}
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
                      <Badge
                      variant={
                        job.status === 'completed' ? 'success' :
                        job.status === 'failed' ? 'error' : 'info'
                      }
                      size="sm"
                    >
                      {job.status === 'completed' ? 'Completed' :
                       job.status === 'failed' ? 'Failed' :
                       job.status === 'processing' ? 'Processing' : 'Pending'}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
