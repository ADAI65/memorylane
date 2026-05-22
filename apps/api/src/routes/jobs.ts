// @memorylane/api - Job Routes with BullMQ integration
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  jobListQuerySchema,
  createJobSchema,
  ServiceType,
  DEFAULT_MODEL_PER_SERVICE,
  ESTIMATED_DURATIONS,
  PREMIUM_DAILY_LIMIT,
  HIGH_COST_PREMIUM_SERVICES,
} from '@memorylane/shared';
import { supabaseAdmin } from '../db/supabase.js';
import { success, paginated } from '../utils/response.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { getRestorationQueue, getPremiumQueue, type RestorationJobData, type PremiumJobData } from '../lib/queue.js';

const jobs = new Hono();

// ── Premium service types ────────────────────────────────
const PREMIUM_SERVICE_TYPES = new Set([
  ServiceType.PHOTO_ANIMATION,
  ServiceType.MEMORY_VIDEO,
  ServiceType.HISTORICAL_DATING,
  ServiceType.ERA_COLORIZATION,
  ServiceType.FACE_MATCH,
  ServiceType.CERTIFICATE,
]);

// ── High-cost premium services (daily limit applies) ─────
const HIGH_COST_SET: Set<string> = new Set(HIGH_COST_PREMIUM_SERVICES);

// ── Helper: Check and increment premium daily usage ──────
async function checkPremiumDailyLimit(userId: string, serviceType: ServiceType): Promise<void> {
  // Only applies to high-cost services
  if (!HIGH_COST_SET.has(serviceType)) return;

  // Get current usage with row-level lock
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('premium_usage_today, premium_usage_reset_at')
    .eq('id', userId)
    .single();

  if (fetchError || !profile) {
    throw new ValidationError('Failed to verify usage limit');
  }

  const now = new Date();
  const resetAt = new Date(profile.premium_usage_reset_at);

  // Check if we need to reset the counter (new day)
  let usageToday = profile.premium_usage_today;
  if (now >= resetAt) {
    // Reset to 0 for the new day
    const nextReset = new Date(now);
    nextReset.setHours(24, 0, 0, 0); // Next midnight UTC
    usageToday = 0;

    await supabaseAdmin
      .from('profiles')
      .update({
        premium_usage_today: 0,
        premium_usage_reset_at: nextReset.toISOString(),
      })
      .eq('id', userId);
  }

  // Check limit (admin bypasses)
  const { data: adminCheck } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  const isAdmin = adminCheck?.is_admin === true;
  if (!isAdmin && usageToday >= PREMIUM_DAILY_LIMIT) {
    throw new ValidationError(
      `Daily limit reached. You've used ${PREMIUM_DAILY_LIMIT} premium service(s) today. The limit resets at midnight UTC.`
    );
  }
}

// ── Helper: Increment premium usage after job creation ───
async function incrementPremiumUsage(userId: string, serviceType: ServiceType): Promise<void> {
  if (!HIGH_COST_SET.has(serviceType)) return;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('premium_usage_today, premium_usage_reset_at, is_admin')
    .eq('id', userId)
    .single();

  if (!profile) return;
  if (profile.is_admin) return;

  const now = new Date();
  const resetAt = new Date(profile.premium_usage_reset_at);

  if (now >= resetAt) {
    // New day — reset to 1
    const nextReset = new Date(now);
    nextReset.setHours(24, 0, 0, 0);
    await supabaseAdmin
      .from('profiles')
      .update({
        premium_usage_today: 1,
        premium_usage_reset_at: nextReset.toISOString(),
      })
      .eq('id', userId);
  } else {
    // Same day — increment
    await supabaseAdmin
      .from('profiles')
      .update({ premium_usage_today: profile.premium_usage_today + 1 })
      .eq('id', userId);
  }
}

// ── POST /api/jobs - Create new restoration job ─────────
jobs.post('/', zValidator('json', createJobSchema), async (c) => {
  const profile = c.get('profile');
  const body = c.req.valid('json');
  const { upload_id, service_type, ai_model, ai_params, animation_type, duration_seconds, audio_text, batch_upload_ids } = body;

  // 1. Validate upload belongs to user
  const { data: upload, error: uploadError } = await supabaseAdmin
    .from('uploads')
    .select('id, user_id, status, storage_path')
    .eq('id', upload_id)
    .single();

  if (uploadError || !upload) {
    throw new NotFoundError('Upload', upload_id);
  }
  if (upload.user_id !== profile.id) {
    throw new ValidationError('Upload does not belong to current user');
  }
  if (upload.status !== 'ready') {
    throw new ValidationError('Upload is not ready for processing');
  }

  // 2. Check premium daily limit for high-cost services
  await checkPremiumDailyLimit(profile.id, service_type as ServiceType);

  // 3. Determine AI model
  const isPremium = PREMIUM_SERVICE_TYPES.has(service_type);
  const model = ai_model || DEFAULT_MODEL_PER_SERVICE[service_type];
  const estimatedDuration = ESTIMATED_DURATIONS[service_type as keyof typeof ESTIMATED_DURATIONS] || 30;

  // 4. All users get standard priority (no plan-based priority)
  const priority = 1;

  // 5. Create job record
  const { data: job, error: jobError } = await supabaseAdmin
    .from('restoration_jobs')
    .insert({
      user_id: profile.id,
      upload_id: upload_id,
      service_type: service_type,
      ai_model: model,
      ai_params: ai_params || {},
      estimated_duration_seconds: estimatedDuration,
      is_premium: isPremium,
      status: 'pending',
    })
    .select()
    .single();

  if (jobError || !job) {
    throw new Error(`Failed to create job: ${jobError?.message}`);
  }

  // 5. Enqueue all jobs directly (no payment gate)
  try {
    if (isPremium) {
      const premiumQueue = getPremiumQueue();
      await premiumQueue.add(
        `premium-${job.id}`,
        {
          jobId: job.id,
          userId: profile.id,
          uploadId: upload_id,
          serviceType: service_type,
          aiModel: model,
          aiParams: ai_params || {},
          priority,
          animationType: animation_type,
          durationSeconds: duration_seconds,
          audioText: audio_text,
          batchUploadIds: batch_upload_ids,
        } satisfies PremiumJobData,
        {
          priority,
          jobId: job.id,
        },
      );
    } else {
      const restorationQueue = getRestorationQueue();
      await restorationQueue.add(
        `restoration-${job.id}`,
        {
          jobId: job.id,
          userId: profile.id,
          uploadId: upload_id,
          serviceType: service_type,
          aiModel: model,
          aiParams: ai_params || {},
          priority,
        } satisfies RestorationJobData,
        {
          priority,
          jobId: job.id,
        },
      );
    }

    // Update job status to queued
    await supabaseAdmin
      .from('restoration_jobs')
      .update({ status: 'queued', queued_at: new Date().toISOString() })
      .eq('id', job.id);

    // Increment premium daily usage for high-cost services
    await incrementPremiumUsage(profile.id, service_type as ServiceType);
  } catch (queueError) {
    console.error(`[Jobs] Failed to enqueue job ${job.id}:`, queueError);
  }

  return success(c, {
    job_id: job.id,
    status: job.status,
    estimated_duration_seconds: estimatedDuration,
    created_at: job.created_at,
  }, 201);
});

// ── GET /api/jobs - List user jobs ──────────────────────
jobs.get('/', zValidator('query', jobListQuerySchema), async (c) => {
  const profile = c.get('profile');
  const { page, per_page, status, service_type } = c.req.valid('query');

  let query = supabaseAdmin
    .from('restoration_jobs')
    .select('*', { count: 'exact' })
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1);

  if (status) query = query.eq('status', status);
  if (service_type) query = query.eq('service_type', service_type);

  const { data, count, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  return paginated(c, data || [], page, per_page, count || 0);
});

// ── GET /api/jobs/:id - Get job details with events ─────
jobs.get('/:id', async (c) => {
  const profile = c.get('profile');
  const jobId = c.req.param('id');

  const { data: job, error } = await supabaseAdmin
    .from('restoration_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', profile.id)
    .single();

  if (error || !job) {
    throw new NotFoundError('Job', jobId);
  }

  // Get job events
  const { data: events } = await supabaseAdmin
    .from('job_events')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });

  return success(c, { job, events: events || [] });
});

// ── GET /api/jobs/:id/events - SSE stream ───────────────
jobs.get('/:id/events', async (c) => {
  const profile = c.get('profile');
  const jobId = c.req.param('id');

  // Verify job ownership
  const { data: job } = await supabaseAdmin
    .from('restoration_jobs')
    .select('id, user_id, status')
    .eq('id', jobId)
    .eq('user_id', profile.id)
    .single();

  if (!job) {
    throw new NotFoundError('Job', jobId);
  }

  // SSE headers
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');
  c.header('X-Accel-Buffering', 'no');

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial state
      controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({ status: job.status, progress: 0 })}\n\n`));

      if (['completed', 'failed', 'canceled'].includes(job.status)) {
        controller.close();
        return;
      }

      // Subscribe to Supabase Realtime
      const channel = supabaseAdmin
        .channel(`job-${jobId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'job_events',
          filter: `job_id=eq.${jobId}`,
        }, (payload) => {
          const event = payload.new as { event_type: string; message: string | null; progress_percent: number; metadata: Record<string, unknown> };
          const resultUrl = event.metadata?.result_url ? String(event.metadata.result_url) : undefined;
          const sseData = JSON.stringify({
            status: event.event_type === 'completed' ? 'completed' :
                    event.event_type === 'failed' ? 'failed' : 'processing',
            progress: event.progress_percent,
            message: event.message,
            ...(resultUrl && { result_url: resultUrl }),
          });
          controller.enqueue(encoder.encode(`event: status\ndata: ${sseData}\n\n`));

          if (['completed', 'failed'].includes(event.event_type)) {
            controller.close();
            supabaseAdmin.removeChannel(channel);
          }
        })
        .subscribe();

      // Keep-alive ping every 15s
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'));
      }, 15000);

      // Cleanup on disconnect
      c.req.raw.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        supabaseAdmin.removeChannel(channel);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
});

// ── POST /api/jobs/:id/retry - Retry failed job ─────────
jobs.post('/:id/retry', async (c) => {
  const profile = c.get('profile');
  const jobId = c.req.param('id');

  // Get the failed job
  const { data: existingJob, error: fetchError } = await supabaseAdmin
    .from('restoration_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', profile.id)
    .eq('status', 'failed')
    .single();

  if (fetchError || !existingJob) {
    throw new NotFoundError('Failed job', jobId);
  }

  // Check retry limit
  if (existingJob.retry_count >= existingJob.max_retries) {
    throw new ValidationError('Maximum retry limit reached');
  }

  // Reset job status
  const { data: job, error: updateError } = await supabaseAdmin
    .from('restoration_jobs')
    .update({
      status: 'pending',
      error_message: null,
      error_code: null,
      retry_count: existingJob.retry_count + 1,
    })
    .eq('id', jobId)
    .select()
    .single();

  if (updateError || !job) {
    throw new Error(`Failed to reset job: ${updateError?.message}`);
  }

  // Re-enqueue to BullMQ
  try {
    const isPremium = PREMIUM_SERVICE_TYPES.has(existingJob.service_type as ServiceType);
    const queue = isPremium ? getPremiumQueue() : getRestorationQueue();

    const jobData = {
      jobId: job.id,
      userId: profile.id,
      uploadId: existingJob.upload_id,
      serviceType: existingJob.service_type,
      aiModel: existingJob.ai_model || '',
      aiParams: existingJob.ai_params || {},
      priority: 1, // Retry at lower priority
    };

    if (isPremium) {
      await queue.add(`premium-retry-${job.id}`, jobData, { jobId: job.id });
    } else {
      await queue.add(`restoration-retry-${job.id}`, jobData, { jobId: job.id });
    }

    // Update to queued
    await supabaseAdmin
      .from('restoration_jobs')
      .update({ status: 'queued', queued_at: new Date().toISOString() })
      .eq('id', job.id);
  } catch (queueError) {
    console.error(`[Jobs] Failed to re-enqueue job ${job.id}:`, queueError);
  }

  return success(c, { job_id: job.id, status: job.status, retry_count: job.retry_count });
});

// ── DELETE /api/jobs/:id - Cancel pending/queued job ────
jobs.delete('/:id', async (c) => {
  const profile = c.get('profile');
  const jobId = c.req.param('id');

  // Get job to check status
  const { data: existingJob } = await supabaseAdmin
    .from('restoration_jobs')
    .select('status, service_type')
    .eq('id', jobId)
    .eq('user_id', profile.id)
    .single();

  if (!existingJob) {
    throw new NotFoundError('Job', jobId);
  }

  if (!['pending', 'queued'].includes(existingJob.status)) {
    throw new ValidationError(`Cannot cancel job in "${existingJob.status}" status`);
  }

  // Try to remove from BullMQ queue
  try {
    const isPremium = PREMIUM_SERVICE_TYPES.has(existingJob.service_type as ServiceType);
    const queue = isPremium ? getPremiumQueue() : getRestorationQueue();
    await queue.remove(jobId);
  } catch {
    // Job may have already been picked up by a worker
  }

  // Update status in database
  await supabaseAdmin
    .from('restoration_jobs')
    .update({ status: 'canceled' })
    .eq('id', jobId);

  return success(c, { job_id: jobId, status: 'canceled' });
});

// ── GET /api/jobs/usage - Get premium usage status ─────
jobs.get('/usage', async (c) => {
  const profile = c.get('profile');

  const { data: prof, error } = await supabaseAdmin
    .from('profiles')
    .select('premium_usage_today, premium_usage_reset_at, is_admin')
    .eq('id', profile.id)
    .single();

  if (error || !prof) {
    throw new Error(`Failed to fetch usage: ${error?.message}`);
  }

  const now = new Date();
  const resetAt = new Date(prof.premium_usage_reset_at);
  const isReset = now >= resetAt;
  const usageToday = isReset ? 0 : prof.premium_usage_today;
  const remaining = prof.is_admin ? -1 : Math.max(0, PREMIUM_DAILY_LIMIT - usageToday);
  // -1 remaining means unlimited (admin)

  const nextReset = isReset
    ? (() => { const d = new Date(now); d.setHours(24, 0, 0, 0); return d.toISOString(); })()
    : prof.premium_usage_reset_at;

  return success(c, {
    premium_usage_today: usageToday,
    premium_daily_limit: PREMIUM_DAILY_LIMIT,
    premium_remaining: remaining,
    reset_at: nextReset,
    is_admin: prof.is_admin,
  });
});

export default jobs;
