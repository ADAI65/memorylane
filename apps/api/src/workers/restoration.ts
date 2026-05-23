// @memorylane/api - Restoration Worker
// Processes BullMQ jobs for photo restoration via AI providers
import { Worker, Job } from 'bullmq';
import { getBullMQRedis } from '../lib/redis.js';
import {
  QUEUE_NAMES,
  addJobEvent,
  updateJobStatus,
  getUploadPath,
  getPublicUrl,
} from '../lib/queue.js';
import type { RestorationJobData } from '../lib/queue.js';
import {
  initializeProviders,
  createPrediction,
  waitForPrediction,
} from '../services/ai/index.js';
import { ServiceType, DEFAULT_MODEL_PER_SERVICE } from '@memorylane/shared';

// ── Worker Processor ─────────────────────────────────────

async function processRestorationJob(
  job: Job<RestorationJobData>,
): Promise<{ resultUrl: string; processingTimeMs: number }> {
  const { jobId, userId, uploadId, serviceType, aiModel, aiParams } = job.data;

  console.log(`[Worker] Processing job ${jobId} (${serviceType})`);

  // 1. Initialize providers (lazy, idempotent)
  await initializeProviders();

  // 2. Mark job as started
  await updateJobStatus(jobId, 'processing', { started_at: new Date().toISOString() });
  await addJobEvent(jobId, 'started', 'Processing started', 5);

  try {
    // 3. Get the upload (source image)
    const storagePath = await getUploadPath(uploadId);
    if (!storagePath) {
      throw new Error(`Upload ${uploadId} not found`);
    }

    const sourceUrl = getPublicUrl(storagePath);
    console.log(`[Worker] Source image: ${sourceUrl}`);

    // 4. Determine AI model
    const model = aiModel || DEFAULT_MODEL_PER_SERVICE[serviceType as ServiceType];
    if (!model) {
      throw new Error(`No AI model configured for service type "${serviceType}"`);
    }

    // 5. Create AI prediction
    await addJobEvent(jobId, 'progress', 'Sending to AI service...', 15);

    const prediction = await createPrediction({
      serviceType: serviceType as ServiceType,
      model,
      input: {
        imageUrl: sourceUrl,
        params: aiParams,
      },
    });

    console.log(`[Worker] Prediction created: ${prediction.id}`);

    // Update job with BullMQ prediction reference
    await updateJobStatus(jobId, 'processing', {
      bullmq_job_id: job.id!,
    });

    // 6. Wait for prediction to complete
    const startTime = Date.now();

    const result = await waitForPrediction(prediction.provider, prediction.id, {
      timeoutMs: 10 * 60 * 1000, // 10 minute timeout
      pollIntervalMs: 4000,
      onProgress: async (progress) => {
        const normalizedProgress = Math.min(15 + progress * 0.8, 95); // Map to 15-95%
        await addJobEvent(
          jobId,
          'progress',
          'AI processing in progress...',
          Math.round(normalizedProgress),
        );
      },
    });

    const processingTimeMs = Date.now() - startTime;

    // 7. Get the result URL
    let resultUrl = result.outputs.imageUrl || result.outputs.imageUrls?.[0];
    if (!resultUrl && result.outputs.textResult) {
      // For text-based services (historical dating), store the text
      resultUrl = result.outputs.textResult;
    }

    if (!resultUrl) {
      throw new Error('AI service returned no output');
    }

    console.log(`[Worker] Result obtained in ${processingTimeMs}ms`);

    // 8. For image results, upload to Supabase storage
    if (resultUrl.startsWith('http')) {
      const resultStoragePath = await uploadResultToStorage(
        jobId,
        userId,
        resultUrl,
        serviceType,
      );
      resultUrl = getPublicUrl(resultStoragePath);
    }

    // 9. Mark job as completed
    await updateJobStatus(jobId, 'completed', {
      completed_at: new Date().toISOString(),
      result_url: resultUrl,
      result_metadata: {
        ai_model: model,
        processing_time_ms: processingTimeMs,
        prediction_id: prediction.id,
        provider: prediction.provider,
        metrics: result.metrics,
      },
    });

    await addJobEvent(jobId, 'completed', 'Restoration complete', 100, {
      result_url: resultUrl,
    });

    console.log(`[Worker] Job ${jobId} completed successfully`);

    return { resultUrl, processingTimeMs };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Worker] Job ${jobId} failed:`, message);

    // Mark job as failed
    await updateJobStatus(jobId, 'failed', {
      error_message: message,
      error_code: 'PROCESSING_ERROR',
    });

    await addJobEvent(jobId, 'failed', `Processing failed: ${message}`, 0);

    throw error; // Re-throw to let BullMQ handle retries
  }
}

// ── Result Upload ────────────────────────────────────────

/**
 * Download AI result image and upload to Supabase storage
 */
async function uploadResultToStorage(
  jobId: string,
  userId: string,
  resultUrl: string,
  serviceType: string,
): Promise<string> {
  // Import supabase admin dynamically to avoid circular deps
  const { supabaseAdmin } = await import('../db/supabase.js');

  // Download the result image
  const response = await fetch(resultUrl);
  if (!response.ok) {
    throw new Error(`Failed to download result image: ${response.status}`);
  }

  const blob = await response.blob();
  const ext = blob.type.includes('png') ? 'png' : 'jpg';
  const storagePath = `results/${userId}/${jobId}/restored.${ext}`;

  // Convert blob to ArrayBuffer for Supabase upload
  const arrayBuffer = await blob.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from('uploads')
    .upload(storagePath, arrayBuffer, {
      contentType: blob.type,
      upsert: true,
    });

  if (error) {
    // Fallback: just use the external URL
    console.warn(`[Worker] Storage upload failed, using external URL:`, error.message);
    return `external/${serviceType}/${jobId}`;
  }

  return storagePath;
}

// ── Worker Factory ───────────────────────────────────────

let worker: Worker<RestorationJobData> | null = null;

export function createRestorationWorker(): Worker<RestorationJobData> {
  if (worker) return worker;

  worker = new Worker<RestorationJobData>(
    QUEUE_NAMES.RESTORATION,
    async (job: Job<RestorationJobData>) => {
      return processRestorationJob(job);
    },
    {
      connection: getBullMQRedis(),
      concurrency: 3,
      limiter: {
        max: 10,
        duration: 60_000,
      },
      autorun: false, // Don't auto-start — prevents Redis connection spam if Redis is down
    },
  );

  // Worker event listeners
  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.data.jobId} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.data?.jobId ?? 'unknown'} failed:`, err.message);
  });

  worker.on('error', (_err) => {
    // Suppress all connection errors — handled in index.ts before worker creation
  });

  console.log(`[Worker] Restoration worker created (autorun: false)`);

  return worker;
}

/**
 * Gracefully close the worker
 */
export async function closeWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    console.log('[Worker] Restoration worker closed');
  }
}
