import type { ServiceType, JobStatus, AnimationType } from './enums.js';

export interface RestorationJob {
  id: string;
  user_id: string;
  upload_id: string;
  service_type: ServiceType;
  status: JobStatus;
  ai_model: string | null;
  ai_params: Record<string, unknown>;
  result_storage_path: string | null;
  result_url: string | null;
  result_metadata: Record<string, unknown>;
  queued_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_duration_seconds: number | null;
  error_message: string | null;
  error_code: string | null;
  retry_count: number;
  max_retries: number;
  is_premium: boolean;
  price_cents: number;
  payment_id: string | null;
  parent_job_id: string | null;
  batch_upload_ids: string[];
  bullmq_job_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobEvent {
  id: string;
  job_id: string;
  event_type: 'queued' | 'started' | 'progress' | 'completed' | 'failed';
  message: string | null;
  progress_percent: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateJobRequest {
  upload_id: string;
  service_type: ServiceType;
  ai_model?: string;
  ai_params?: Record<string, unknown>;
  // Premium service specific params
  animation_type?: AnimationType;
  duration_seconds?: number;
  audio_text?: string;
  batch_upload_ids?: string[];
}

export interface CreateJobResponse {
  job_id: string;
  status: JobStatus;
  estimated_duration_seconds: number;
  created_at: string;
  /** True if the user must complete a Stripe checkout before the job will be processed */
  payment_required?: boolean;
}

export interface JobListResponse {
  jobs: RestorationJob[];
  total: number;
  page: number;
  per_page: number;
}
