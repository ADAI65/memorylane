// @memorylane/web - API Client: Upload endpoints
import { apiClient } from './client';
import type {
  PresignedUploadResponse,
  Upload,
  ApiResponse,
  UploadListParams,
} from '@memorylane/shared';

export const uploadApi = {
  async getPresignedUrl(fileName: string, fileSize: number, mimeType: string) {
    return apiClient.post<PresignedUploadResponse>('/api/uploads', {
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
    });
  },

  async list(params?: UploadListParams): Promise<ApiResponse<Upload[]>> {
    const searchParams: Record<string, string> = {};
    if (params?.page) searchParams.page = String(params.page);
    if (params?.per_page) searchParams.per_page = String(params.per_page);
    if (params?.status) searchParams.status = params.status;
    return apiClient.get<Upload[]>('/api/uploads', searchParams);
  },

  async get(id: string): Promise<ApiResponse<Upload>> {
    return apiClient.get<Upload>(`/api/uploads/${id}`);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/uploads/${id}`);
  },

  async triggerProcessing(id: string): Promise<ApiResponse<{ job_id: string }>> {
    return apiClient.post<{ job_id: string }>(`/api/uploads/${id}/process`);
  },
};
