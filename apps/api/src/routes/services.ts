import { Hono } from 'hono';
import { SERVICE_PRICES, ServiceType } from '@memorylane/shared';
import { success } from '../utils/response.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { supabaseAdmin } from '../db/supabase.js';

const services = new Hono();

/**
 * Verify that an upload belongs to the current user.
 * Throws ForbiddenError if not, NotFoundError if upload doesn't exist.
 */
async function verifyUploadOwnership(userId: string, uploadId: string, label = 'Upload') {
  const { data: upload, error } = await supabaseAdmin
    .from('uploads')
    .select('id, user_id')
    .eq('id', uploadId)
    .single();

  if (error || !upload) {
    throw new NotFoundError(label, uploadId);
  }
  if (upload.user_id !== userId) {
    throw new ForbiddenError('You do not have access to this resource');
  }
}

// POST /api/services/animation
services.post('/animation', async (c) => {
  const profile = c.get('profile');
  const { upload_id, animation_type, duration_seconds, audio_text } = await c.req.json<{
    upload_id?: string;
    animation_type?: string;
    duration_seconds?: number;
    audio_text?: string;
  }>();

  if (!upload_id) {
    throw new ValidationError('upload_id is required');
  }

  await verifyUploadOwnership(profile.id, upload_id);

  const price = SERVICE_PRICES[ServiceType.PHOTO_ANIMATION];

  // Create pending job
  const { data: job, error } = await supabaseAdmin
    .from('restoration_jobs')
    .insert({
      user_id: profile.id,
      upload_id,
      service_type: ServiceType.PHOTO_ANIMATION,
      ai_model: 'heygen/photo_animation',
      ai_params: { animation_type: animation_type || 'subtle_motion', duration_seconds, audio_text },
      is_premium: true,
      price_cents: price.priceCents,
      estimated_duration_seconds: 120,
    })
    .select()
    .single();

  if (error) throw new ValidationError('Failed to create animation job');

  return success(c, {
    job_id: job.id,
    service_type: ServiceType.PHOTO_ANIMATION,
    price_cents: price.priceCents,
    status: 'payment_required',
  }, 201);
});

// POST /api/services/memory-video
services.post('/memory-video', async (c) => {
  const profile = c.get('profile');
  const { upload_ids, audio_text, duration } = await c.req.json<{
    upload_ids?: string[];
    audio_text?: string;
    duration?: number;
  }>();

  if (!upload_ids || upload_ids.length < 1) {
    throw new ValidationError('At least one upload_id is required');
  }

  // Verify all uploads belong to current user
  for (const uid of upload_ids) {
    await verifyUploadOwnership(profile.id, uid);
  }

  const price = SERVICE_PRICES[ServiceType.MEMORY_VIDEO];

  const { data: job, error } = await supabaseAdmin
    .from('restoration_jobs')
    .insert({
      user_id: profile.id,
      upload_id: upload_ids[0],
      service_type: ServiceType.MEMORY_VIDEO,
      ai_model: 'runway/gen-3-alpha',
      ai_params: { audio_text, duration: duration || 30 },
      batch_upload_ids: upload_ids,
      is_premium: true,
      price_cents: price.priceCents,
      estimated_duration_seconds: 300,
    })
    .select()
    .single();

  if (error) throw new ValidationError('Failed to create memory video job');

  return success(c, {
    job_id: job.id,
    service_type: ServiceType.MEMORY_VIDEO,
    price_cents: price.priceCents,
    status: 'payment_required',
  }, 201);
});

// POST /api/services/historical-dating
services.post('/historical-dating', async (c) => {
  const profile = c.get('profile');
  const { upload_id } = await c.req.json<{ upload_id?: string }>();

  if (!upload_id) throw new ValidationError('upload_id is required');

  await verifyUploadOwnership(profile.id, upload_id);

  const price = SERVICE_PRICES[ServiceType.HISTORICAL_DATING];

  const { data: job, error } = await supabaseAdmin
    .from('restoration_jobs')
    .insert({
      user_id: profile.id,
      upload_id,
      service_type: ServiceType.HISTORICAL_DATING,
      ai_model: 'gpt-4o-vision',
      is_premium: true,
      price_cents: price.priceCents,
      estimated_duration_seconds: 15,
    })
    .select()
    .single();

  if (error) throw new ValidationError('Failed to create dating job');

  return success(c, {
    job_id: job.id,
    service_type: ServiceType.HISTORICAL_DATING,
    price_cents: price.priceCents,
    status: 'payment_required',
  }, 201);
});

// POST /api/services/era-colorization
services.post('/era-colorization', async (c) => {
  const profile = c.get('profile');
  const { upload_id, color_palette } = await c.req.json<{
    upload_id?: string;
    color_palette?: 'vintage' | 'sepia' | 'natural' | 'auto';
  }>();

  if (!upload_id) throw new ValidationError('upload_id is required');

  await verifyUploadOwnership(profile.id, upload_id);

  const price = SERVICE_PRICES[ServiceType.ERA_COLORIZATION];

  const { data: job, error } = await supabaseAdmin
    .from('restoration_jobs')
    .insert({
      user_id: profile.id,
      upload_id,
      service_type: ServiceType.ERA_COLORIZATION,
      ai_model: 'deoldify',
      ai_params: { color_palette: color_palette || 'auto' },
      is_premium: true,
      price_cents: price.priceCents,
      estimated_duration_seconds: 45,
    })
    .select()
    .single();

  if (error) throw new ValidationError('Failed to create colorization job');

  return success(c, {
    job_id: job.id,
    service_type: ServiceType.ERA_COLORIZATION,
    price_cents: price.priceCents,
    status: 'payment_required',
  }, 201);
});

// POST /api/services/face-match
services.post('/face-match', async (c) => {
  const profile = c.get('profile');
  const { upload_ids } = await c.req.json<{ upload_ids?: string[] }>();

  if (!upload_ids || upload_ids.length < 2) {
    throw new ValidationError('At least 2 upload_ids are required for face matching');
  }

  // Verify all uploads belong to current user
  for (const uid of upload_ids) {
    await verifyUploadOwnership(profile.id, uid);
  }

  const price = SERVICE_PRICES[ServiceType.FACE_MATCH];

  const { data: job, error } = await supabaseAdmin
    .from('restoration_jobs')
    .insert({
      user_id: profile.id,
      upload_id: upload_ids[0],
      service_type: ServiceType.FACE_MATCH,
      ai_model: 'insightface/arcface',
      batch_upload_ids: upload_ids,
      is_premium: true,
      price_cents: price.priceCents,
      estimated_duration_seconds: 60,
    })
    .select()
    .single();

  if (error) throw new ValidationError('Failed to create face match job');

  return success(c, {
    job_id: job.id,
    service_type: ServiceType.FACE_MATCH,
    price_cents: price.priceCents,
    status: 'payment_required',
  }, 201);
});

// POST /api/services/certificate
services.post('/certificate', async (c) => {
  const profile = c.get('profile');
  const { job_id } = await c.req.json<{ job_id?: string }>();

  if (!job_id) throw new ValidationError('job_id is required');

  // Verify job belongs to current user
  const { data: existingJob, error: jobCheckError } = await supabaseAdmin
    .from('restoration_jobs')
    .select('id, user_id')
    .eq('id', job_id)
    .single();

  if (jobCheckError || !existingJob) {
    throw new NotFoundError('Job', job_id);
  }
  if (existingJob.user_id !== profile.id) {
    throw new ForbiddenError('You do not have access to this resource');
  }

  const price = SERVICE_PRICES[ServiceType.CERTIFICATE];

  const { data: job, error } = await supabaseAdmin
    .from('restoration_jobs')
    .insert({
      user_id: profile.id,
      upload_id: job_id,
      service_type: ServiceType.CERTIFICATE,
      ai_model: 'puppeteer/pdf',
      is_premium: true,
      price_cents: price.priceCents,
      estimated_duration_seconds: 10,
    })
    .select()
    .single();

  if (error) throw new ValidationError('Failed to create certificate job');

  return success(c, {
    job_id: job.id,
    service_type: ServiceType.CERTIFICATE,
    price_cents: price.priceCents,
    status: 'payment_required',
  }, 201);
});

export default services;
