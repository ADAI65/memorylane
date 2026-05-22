// @memorylane/api - Premium Service Worker
// Processes BullMQ jobs for all premium services (animation, video, dating, colorization, face match, certificate)
import { Worker, Job } from 'bullmq';
import { getBullMQRedis } from '../lib/redis';
import {
  QUEUE_NAMES,
  addJobEvent,
  updateJobStatus,
  getUploadPath,
  getPublicUrl,
} from '../lib/queue';
import type { PremiumJobData } from '../lib/queue';
import {
  initializeProviders,
  createPrediction,
  waitForPrediction,
} from '../services/ai';
import { ServiceType, DEFAULT_MODEL_PER_SERVICE, ESTIMATED_DURATIONS } from '@memorylane/shared';

// ── Worker Processor ─────────────────────────────────────

async function processPremiumJob(
  job: Job<PremiumJobData>,
): Promise<{ resultUrl: string; processingTimeMs: number }> {
  const {
    jobId,
    userId,
    uploadId,
    serviceType,
    aiModel,
    aiParams,
    animationType,
    durationSeconds,
    audioText,
    batchUploadIds,
  } = job.data;

  const typedServiceType = serviceType as ServiceType;
  console.log(`[PremiumWorker] Processing job ${jobId} (${typedServiceType})`);

  // 1. Initialize providers
  await initializeProviders();

  // 2. Mark job as started
  await updateJobStatus(jobId, 'processing', { started_at: new Date().toISOString() });
  await addJobEvent(jobId, 'started', `Premium service started: ${typedServiceType}`, 5);

  try {
    // 3. Determine AI model
    const model = aiModel || DEFAULT_MODEL_PER_SERVICE[typedServiceType];
    if (!model) {
      throw new Error(`No AI model configured for service type "${typedServiceType}"`);
    }

    // 4. Gather input images
    const sourceUrl = await getPrimaryImageUrl(uploadId, batchUploadIds);
    const imageUrls = await getAllImageUrls(uploadId, batchUploadIds);

    console.log(`[PremiumWorker] Primary image: ${sourceUrl}, Total images: ${imageUrls.length}`);

    // 5. Create AI prediction with service-specific parameters
    await addJobEvent(jobId, 'progress', 'Submitting to AI service...', 10);

    const prediction = await createPrediction({
      serviceType: typedServiceType,
      model,
      input: {
        imageUrl: sourceUrl,
        imageUrls: imageUrls.length > 1 ? imageUrls : undefined,
        params: {
          ...aiParams,
          animationType,
          duration: durationSeconds,
        },
        audioText,
        duration: durationSeconds,
      },
    });

    console.log(`[PremiumWorker] Prediction created: ${prediction.id} (provider: ${prediction.provider})`);

    // 6. Wait for prediction (skip polling for synchronous providers like OpenAI/Certificate)
    const startTime = Date.now();
    const estimatedDuration = (ESTIMATED_DURATIONS[typedServiceType] || 60) * 1000;
    const timeout = Math.max(estimatedDuration * 3, 5 * 60 * 1000); // At least 5 min, or 3x estimated

    const result = await waitForPrediction(prediction.provider, prediction.id, {
      timeoutMs: timeout,
      pollIntervalMs: 5000,
      onProgress: async (progress) => {
        const normalizedProgress = Math.min(10 + progress * 0.85, 95);
        await addJobEvent(
          jobId,
          'progress',
          'AI processing in progress...',
          Math.round(normalizedProgress),
        );
      },
    });

    const processingTimeMs = Date.now() - startTime;
    console.log(`[PremiumWorker] Prediction completed in ${processingTimeMs}ms`);

    // 7. Process result based on service type and output format
    await addJobEvent(jobId, 'progress', 'Saving results...', 95);
    const resultInfo = await saveResult(jobId, userId, typedServiceType, result, sourceUrl);

    // 8. Mark job as completed
    await updateJobStatus(jobId, 'completed', {
      completed_at: new Date().toISOString(),
      result_url: resultInfo.url,
      result_metadata: {
        ai_model: model,
        processing_time_ms: processingTimeMs,
        prediction_id: prediction.id,
        provider: prediction.provider,
        metrics: result.metrics,
        output_type: resultInfo.type,
      },
    });

    await addJobEvent(jobId, 'completed', `${typedServiceType} complete`, 100, {
      result_url: resultInfo.url,
      output_type: resultInfo.type,
    });

    console.log(`[PremiumWorker] Job ${jobId} completed (${resultInfo.type}: ${resultInfo.url})`);
    return { resultUrl: resultInfo.url, processingTimeMs };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[PremiumWorker] Job ${jobId} failed:`, message);

    await updateJobStatus(jobId, 'failed', {
      error_message: message,
      error_code: 'PREMIUM_PROCESSING_ERROR',
    });

    await addJobEvent(jobId, 'failed', `Premium processing failed: ${message}`, 0);
    throw error;
  }
}

// ── Image URL Helpers ───────────────────────────────────

/**
 * Get the primary image URL from an upload ID
 */
async function getPrimaryImageUrl(uploadId: string, _batchUploadIds?: string[]): Promise<string> {
  const storagePath = await getUploadPath(uploadId);
  if (!storagePath) {
    throw new Error(`Upload ${uploadId} not found`);
  }
  return getPublicUrl(storagePath);
}

/**
 * Get all image URLs (primary + batch uploads)
 */
async function getAllImageUrls(uploadId: string, batchUploadIds?: string[]): Promise<string[]> {
  const urls: string[] = [];

  // Primary upload
  const primaryPath = await getUploadPath(uploadId);
  if (primaryPath) {
    urls.push(getPublicUrl(primaryPath));
  }

  // Batch uploads (for face match, memory video)
  if (batchUploadIds && batchUploadIds.length > 0) {
    for (const id of batchUploadIds) {
      const path = await getUploadPath(id);
      if (path) {
        urls.push(getPublicUrl(path));
      }
    }
  }

  return urls;
}

// ── Result Processing ───────────────────────────────────

interface ResultInfo {
  url: string;
  type: 'image' | 'video' | 'text' | 'json' | 'pdf';
}

/**
 * Save result to storage based on output type
 */
async function saveResult(
  jobId: string,
  userId: string,
  serviceType: ServiceType,
  result: Awaited<ReturnType<typeof waitForPrediction>>,
  _sourceUrl: string,
): Promise<ResultInfo> {
  const { outputs } = result;

  // Video result (photo_animation, memory_video)
  if (outputs.videoUrl) {
    const storagePath = await downloadAndUploadResult(
      jobId, userId, outputs.videoUrl, 'mp4', 'video/mp4',
    );
    return { url: getPublicUrl(storagePath), type: 'video' };
  }

  // PDF result (certificate)
  if (outputs.pdfBytes) {
    const storagePath = await uploadPdfResult(jobId, userId, outputs.pdfBytes);
    return { url: getPublicUrl(storagePath), type: 'pdf' };
  }

  // JSON result (face_match, historical_dating)
  if (outputs.jsonResult) {
    const storagePath = await uploadJsonResult(jobId, userId, outputs.jsonResult, serviceType);
    return { url: getPublicUrl(storagePath), type: 'json' };
  }

  // Text result (historical_dating)
  if (outputs.textResult && !outputs.imageUrl) {
    const storagePath = await uploadTextResult(jobId, userId, outputs.textResult, serviceType);
    return { url: getPublicUrl(storagePath), type: 'text' };
  }

  // Image result (era_colorization — also returns images)
  if (outputs.imageUrl || outputs.imageUrls?.[0]) {
    const imageUrl = outputs.imageUrl || outputs.imageUrls![0];
    if (imageUrl.startsWith('http')) {
      const ext = imageUrl.includes('png') ? 'png' : 'jpg';
      const storagePath = await downloadAndUploadResult(
        jobId, userId, imageUrl, ext, ext === 'png' ? 'image/png' : 'image/jpeg',
      );
      return { url: getPublicUrl(storagePath), type: 'image' };
    }
    return { url: imageUrl, type: 'image' };
  }

  // Audio result (narration for memory video)
  if (outputs.audioUrl) {
    const storagePath = await downloadAndUploadResult(
      jobId, userId, outputs.audioUrl, 'mp3', 'audio/mpeg',
    );
    return { url: getPublicUrl(storagePath), type: 'video' }; // Group with video
  }

  throw new Error('AI service returned no recognized output');
}

// ── Storage Upload Helpers ───────────────────────────────

/**
 * Download a URL and upload to Supabase storage
 */
async function downloadAndUploadResult(
  jobId: string,
  userId: string,
  url: string,
  ext: string,
  contentType: string,
): Promise<string> {
  const { supabaseAdmin } = await import('../db/supabase');
  const provider = getProviderFromUrl(url);

  try {
    // Try to download with proxy support
    let arrayBuffer: ArrayBuffer;
    if (provider === 'replicate') {
      // Replicate outputs are accessible directly
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      arrayBuffer = await response.arrayBuffer();
    } else {
      // Use proxy-aware download for other providers
      arrayBuffer = await downloadWithProxy(url);
    }

    const storagePath = `results/${userId}/${jobId}/result.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from('results')
      .upload(storagePath, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`[PremiumWorker] Storage upload failed:`, error.message);
      return `external/${jobId}/result.${ext}`;
    }

    return storagePath;
  } catch (err) {
    console.error(`[PremiumWorker] Failed to download/upload result:`, err);
    // Fallback: store the external URL
    return `external/${jobId}/result.${ext}`;
  }
}

/**
 * Upload PDF bytes to storage
 */
async function uploadPdfResult(
  jobId: string,
  userId: string,
  pdfBytes: Uint8Array,
): Promise<string> {
  const { supabaseAdmin } = await import('../db/supabase');

  const storagePath = `results/${userId}/${jobId}/certificate.pdf`;

  const { error } = await supabaseAdmin.storage
    .from('results')
    .upload(storagePath, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload certificate: ${error.message}`);
  }

  return storagePath;
}

/**
 * Upload JSON result to storage
 */
async function uploadJsonResult(
  jobId: string,
  userId: string,
  jsonResult: Record<string, unknown>,
  serviceType: ServiceType,
): Promise<string> {
  const { supabaseAdmin } = await import('../db/supabase');

  const storagePath = `results/${userId}/${jobId}/${serviceType}-result.json`;
  const jsonStr = JSON.stringify(jsonResult, null, 2);

  const { error } = await supabaseAdmin.storage
    .from('results')
    .upload(storagePath, jsonStr, {
      contentType: 'application/json',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload JSON result: ${error.message}`);
  }

  return storagePath;
}

/**
 * Upload text result to storage
 */
async function uploadTextResult(
  jobId: string,
  userId: string,
  textResult: string,
  serviceType: ServiceType,
): Promise<string> {
  const { supabaseAdmin } = await import('../db/supabase');

  const storagePath = `results/${userId}/${jobId}/${serviceType}-result.txt`;

  const { error } = await supabaseAdmin.storage
    .from('results')
    .upload(storagePath, textResult, {
      contentType: 'text/plain',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload text result: ${error.message}`);
  }

  return storagePath;
}

/**
 * Download a URL using SOCKS5 proxy if configured
 */
async function downloadWithProxy(url: string): Promise<ArrayBuffer> {
  const proxyUrl = process.env.ALL_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

  if (!proxyUrl) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    return response.arrayBuffer();
  }

  // Use node-fetch with proxy agent
  const { SocksProxyAgent } = await import('socks-proxy-agent');
  const fetchWithProxy = (await import('node-fetch')).default;

  try {
    const agent = new SocksProxyAgent(proxyUrl);
    const response = await fetchWithProxy(url, { agent });
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    return response.buffer() as unknown as ArrayBuffer;
  } catch {
    // Fallback to direct fetch
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    return response.arrayBuffer();
  }
}

/**
 * Guess provider from URL for download strategy
 */
function getProviderFromUrl(url: string): string {
  if (url.includes('replicate.com')) return 'replicate';
  if (url.includes('heygen.com') || url.includes('heygen')) return 'heygen';
  if (url.includes('runway')) return 'runway';
  if (url.includes('openai')) return 'openai';
  return 'unknown';
}

// ── Worker Factory ───────────────────────────────────────

let worker: Worker<PremiumJobData> | null = null;

export function createPremiumWorker(): Worker<PremiumJobData> {
  if (worker) return worker;

  worker = new Worker<PremiumJobData>(
    QUEUE_NAMES.PREMIUM,
    async (job: Job<PremiumJobData>) => {
      return processPremiumJob(job);
    },
    {
      connection: getBullMQRedis(),
      concurrency: 2, // Premium jobs are heavier — lower concurrency
      limiter: {
        max: 5, // Max 5 premium jobs per minute
        duration: 60_000,
      },
    },
  );

  // Worker event listeners
  worker.on('completed', (job) => {
    console.log(`[PremiumWorker] Job ${job.data.jobId} (${job.data.serviceType}) completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[PremiumWorker] Job ${job?.data?.jobId ?? 'unknown'} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[PremiumWorker] Worker error:', err.message);
  });

  console.log('[PremiumWorker] Premium worker started (concurrency: 2)');
  return worker;
}

/**
 * Gracefully close the premium worker
 */
export async function closePremiumWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    console.log('[PremiumWorker] Premium worker closed');
  }
}
