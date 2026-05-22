// @memorylane/web - API Client: Job endpoints
import { apiClient } from './client';
import type {
  CreateJobRequest,
  CreateJobResponse,
  RestorationJob,
  JobEvent,
  ApiResponse,
} from '@memorylane/shared';

export const jobApi = {
  async create(data: CreateJobRequest): Promise<ApiResponse<CreateJobResponse>> {
    return apiClient.post<CreateJobResponse>('/api/jobs', data);
  },

  async list(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    service_type?: string;
  }): Promise<ApiResponse<RestorationJob[]>> {
    const searchParams: Record<string, string> = {};
    if (params?.page) searchParams.page = String(params.page);
    if (params?.per_page) searchParams.per_page = String(params.per_page);
    if (params?.status) searchParams.status = params.status;
    if (params?.service_type) searchParams.service_type = params.service_type;
    return apiClient.get<RestorationJob[]>('/api/jobs', searchParams);
  },

  async get(id: string): Promise<ApiResponse<RestorationJob>> {
    return apiClient.get<RestorationJob>(`/api/jobs/${id}`);
  },

  async getEvents(id: string): Promise<ApiResponse<JobEvent[]>> {
    return apiClient.get<JobEvent[]>(`/api/jobs/${id}/events`);
  },

  async retry(id: string): Promise<ApiResponse<CreateJobResponse>> {
    return apiClient.post<CreateJobResponse>(`/api/jobs/${id}/retry`);
  },

  async cancel(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/jobs/${id}`);
  },

  async getUsage(): Promise<ApiResponse<{
    premium_usage_today: number;
    premium_daily_limit: number;
    premium_remaining: number;
    reset_at: string;
    is_admin: boolean;
  }>> {
    return apiClient.get('/api/jobs/usage');
  },
};

// SSE connection for real-time job updates
export function createJobSSEConnection(jobId: string): EventSource {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return new EventSource(`${baseUrl}/api/jobs/${jobId}/events`, {
    withCredentials: true,
  });
}
