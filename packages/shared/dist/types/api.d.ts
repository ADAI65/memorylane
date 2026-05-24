export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: PaginationMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
export interface PaginationMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    full_name?: string;
}
export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}
export interface PresignedUploadResponse {
    upload_url: string;
    upload_id: string;
    storage_path: string;
}
export interface UploadListParams {
    page?: number;
    per_page?: number;
    status?: string;
}
export interface SSEJobEvent {
    status: string;
    progress: number;
    message: string;
    result_url?: string;
    error?: string;
}
//# sourceMappingURL=api.d.ts.map