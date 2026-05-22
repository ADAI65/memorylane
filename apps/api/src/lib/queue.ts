// @memorylane/api - BullMQ Queue definitions and helpers
import { Queue } from 'bullmq';
import { getBullMQRedis } from './redis';
import { supabaseAdmin } from '../db/supabase';
import { JOB_RETRY_CONFIG } from '@memorylane/shared';

// ── Queue Names ──────────────────────────────────────────
export const QUEUE_NAMES = {
  RESTORATION: 'restoration',
  PREMIUM: 'premium',
  CLEANUP: 'cleanup',
} as const;

// ── Job Data Types ───────────────────────────────────────
export interface RestorationJobData {
  jobId: string;
  userId: string;
  uploadId: string;
  serviceType: string;
  aiModel: string;
  aiParams: Record<string, unknown>;
  priority: number;
}

export interface PremiumJobData {
  jobId: string;
  userId: string;
  uploadId: string;
  serviceType: string;
  aiModel: string;
  aiParams: Record<string, unknown>;
  priority: number;
  animationType?: string;
  durationSeconds?: number;
  audioText?: string;
  batchUploadIds?: string[];
}

export interface CleanupJobData {
  type: 'temp_files' | 'failed_jobs' | 'expired_results';
  olderThanHours: number;
}

// ── Queue Instances ──────────────────────────────────────

let restorationQueue: Queue<RestorationJobData> | null = null;
let premiumQueue: Queue<PremiumJobData> | null = null;
let cleanupQueue: Queue<CleanupJobData> | null = null;

export function getRestorationQueue(): Queue<RestorationJobData> {
  if (!restorationQueue) {
    const connection = getBullMQRedis();
    restorationQueue = new Queue<RestorationJobData>(QUEUE_NAMES.RESTORATION, {
      connection,
      defaultJobOptions: {
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
        attempts: JOB_RETRY_CONFIG.maxRetries,
        backoff: {
          type: 'exponential',
          delay: JOB_RETRY_CONFIG.initialDelayMs,
        },
      },
    });
  }
  return restorationQueue;
}

export function getPremiumQueue(): Queue<PremiumJobData> {
  if (!premiumQueue) {
    const connection = getBullMQRedis();
    premiumQueue = new Queue<PremiumJobData>(QUEUE_NAMES.PREMIUM, {
      connection,
      defaultJobOptions: {
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
        attempts: JOB_RETRY_CONFIG.maxRetries,
        backoff: {
          type: 'exponential',
          delay: JOB_RETRY_CONFIG.initialDelayMs,
        },
      },
    });
  }
  return premiumQueue;
}

export function getCleanupQueue(): Queue<CleanupJobData> {
  if (!cleanupQueue) {
    const connection = getBullMQRedis();
    cleanupQueue = new Queue<CleanupJobData>(QUEUE_NAMES.CLEANUP, {
      connection,
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: false,
      },
    });
  }
  return cleanupQueue;
}

// ── Job Event Helpers ────────────────────────────────────

/**
 * Insert a job event into the database (used by workers)
 */
export async function addJobEvent(
  jobId: string,
  eventType: 'queued' | 'started' | 'progress' | 'completed' | 'failed',
  message: string | null = null,
  progressPercent: number = 0,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await supabaseAdmin.from('job_events').insert({
    job_id: jobId,
    event_type: eventType,
    message,
    progress_percent: progressPercent,
    metadata,
  });
}

/**
 * Update job status in the database
 */
export async function updateJobStatus(
  jobId: string,
  status: string,
  updates: Record<string, unknown> = {},
): Promise<void> {
  await supabaseAdmin
    .from('restoration_jobs')
    .update({
      status,
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

/**
 * Get upload storage path for a given upload ID
 */
export async function getUploadPath(uploadId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('uploads')
    .select('storage_path')
    .eq('id', uploadId)
    .single();
  return data?.storage_path ?? null;
}

/**
 * Get upload public URL for a given storage path
 */
export function getPublicUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${storagePath}`;
}

// ── Queue Close (Graceful Shutdown) ──────────────────────

export async function closeAllQueues(): Promise<void> {
  const queues = [restorationQueue, premiumQueue, cleanupQueue];
  await Promise.all(
    queues.map((q) => (q ? q.close() : Promise.resolve())),
  );
}
