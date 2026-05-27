import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { uploadListQuerySchema } from '@memorylane/shared';
import { supabaseAdmin } from '../db/supabase.js';
import { success, paginated } from '../utils/response.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { generateUploadPath, sanitizeFilename } from '@memorylane/shared';
import { getRestorationQueue } from '../lib/queue.js';

const uploads = new Hono();

// Upload validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff',
]);

// POST /api/uploads - Create presigned upload
uploads.post('/', async (c) => {
  const profile = c.get('profile');
  const userId = profile.id;

  // Get file metadata from request
  const { file_name, file_size, mime_type } = await c.req.json<{
    file_name?: string;
    file_size?: number;
    mime_type?: string;
  }>();

  if (!file_name || !file_size || !mime_type) {
    throw new ValidationError('file_name, file_size, and mime_type are required');
  }

  // Validate file size
  if (typeof file_size !== 'number' || file_size <= 0) {
    throw new ValidationError('file_size must be a positive number');
  }
  if (file_size > MAX_FILE_SIZE) {
    throw new ValidationError(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.has(mime_type)) {
    throw new ValidationError(`File type "${mime_type}" is not supported. Allowed types: ${Array.from(ALLOWED_MIME_TYPES).join(', ')}`);
  }

  const storagePath = generateUploadPath(userId, file_name);

  // Create upload record
  const { data: upload, error } = await supabaseAdmin
    .from('uploads')
    .insert({
      user_id: userId,
      file_name: sanitizeFilename(file_name),
      file_size,
      mime_type,
      storage_path: storagePath,
      status: 'uploading',
    })
    .select()
    .single();

  if (error) {
    throw new ValidationError('Failed to create upload record');
  }

  // Generate presigned upload URL
  const { data: urlResult, error: urlError } = await supabaseAdmin.storage
    .from('user-uploads')
    .createSignedUploadUrl(storagePath, {
      upsert: true,
    });

  if (urlError || !urlResult) {
    throw new ValidationError('Failed to generate upload URL');
  }

  return success(c, {
    upload_id: upload.id,
    upload_url: urlResult.signedUrl,
    storage_path: storagePath,
  }, 201);
});

// GET /api/uploads - List user uploads
uploads.get('/', zValidator('query', uploadListQuerySchema), async (c) => {
  const profile = c.get('profile');
  const { page, per_page, status: statusFilter } = c.req.valid('query');

  let query = supabaseAdmin
    .from('uploads')
    .select('*', { count: 'exact' })
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1);

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, count, error } = await query;

  if (error) {
    throw new ValidationError('Failed to fetch uploads');
  }

  return paginated(c, data, page, per_page, count || 0);
});

// GET /api/uploads/:id
uploads.get('/:id', async (c) => {
  const profile = c.get('profile');
  const uploadId = c.req.param('id');

  const { data: upload, error } = await supabaseAdmin
    .from('uploads')
    .select('*')
    .eq('id', uploadId)
    .eq('user_id', profile.id)
    .single();

  if (error || !upload) {
    throw new NotFoundError('Upload', uploadId);
  }

  // Get signed download URL
  const { data: urlData } = await supabaseAdmin.storage
    .from('user-uploads')
    .createSignedUrl(upload.storage_path, 3600); // 1 hour

  return success(c, {
    ...upload,
    download_url: urlData?.signedUrl || null,
  });
});

// DELETE /api/uploads/:id
uploads.delete('/:id', async (c) => {
  const profile = c.get('profile');
  const uploadId = c.req.param('id');

  // Get upload record
  const { data: upload, error: fetchError } = await supabaseAdmin
    .from('uploads')
    .select('storage_path')
    .eq('id', uploadId)
    .eq('user_id', profile.id)
    .single();

  if (fetchError || !upload) {
    throw new NotFoundError('Upload', uploadId);
  }

  // Delete from storage
  await supabaseAdmin.storage.from('user-uploads').remove([upload.storage_path]);

  // Delete from database
  await supabaseAdmin.from('uploads').delete().eq('id', uploadId);

  return success(c, { message: 'Upload deleted successfully' });
});

// PATCH /api/uploads/:id/status - Update upload status
uploads.patch('/:id/status', async (c) => {
  const profile = c.get('profile');
  const uploadId = c.req.param('id');
  const { status } = await c.req.json<{ status?: string }>();

  // Only allow 'ready' status transition (upload was completed to storage)
  if (status && !['ready', 'processing', 'failed'].includes(status)) {
    throw new ValidationError('Invalid status transition');
  }

  const { data: upload, error } = await supabaseAdmin
    .from('uploads')
    .update({ status: status || 'ready' })
    .eq('id', uploadId)
    .eq('user_id', profile.id)
    .select()
    .single();

  if (error || !upload) {
    throw new NotFoundError('Upload', uploadId);
  }

  return success(c, upload);
});

// POST /api/uploads/:id/process - Trigger restoration
uploads.post('/:id/process', async (c) => {
  const profile = c.get('profile');
  const uploadId = c.req.param('id');
  const { ai_model, ai_params } = await c.req.json<{
    ai_model?: string;
    ai_params?: Record<string, unknown>;
  }>();

  // Verify upload exists and belongs to user
  const { data: upload, error: uploadError } = await supabaseAdmin
    .from('uploads')
    .select('*')
    .eq('id', uploadId)
    .eq('user_id', profile.id)
    .eq('status', 'ready')
    .single();

  if (uploadError || !upload) {
    throw new NotFoundError('Upload', uploadId);
  }

  // Create restoration job
  const { data: job, error: jobError } = await supabaseAdmin
    .from('restoration_jobs')
    .insert({
      user_id: profile.id,
      upload_id: uploadId,
      service_type: 'basic_restoration',
      ai_model: ai_model || 'gfpgan',
      ai_params: ai_params || { upscale_factor: 4, face_enhance: true },
      status: 'pending',
      estimated_duration_seconds: 30,
    })
    .select()
    .single();

  if (jobError) {
    throw new ValidationError('Failed to create restoration job');
  }

  // Enqueue job to BullMQ
  const restorationQueue = getRestorationQueue();
  await restorationQueue.add('process-restoration', {
    jobId: job.id,
    userId: profile.id,
    uploadId,
    serviceType: 'basic_restoration',
    aiModel: ai_model || 'gfpgan',
    aiParams: ai_params || { upscale_factor: 4, face_enhance: true },
    priority: 0,
  });

  // Mark upload as processing
  await supabaseAdmin
    .from('uploads')
    .update({ status: 'processing' })
    .eq('id', uploadId);

  return success(c, {
    job_id: job.id,
    status: job.status,
    estimated_duration_seconds: job.estimated_duration_seconds,
  }, 201);
});

export default uploads;
