export interface Upload {
    id: string;
    user_id: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    storage_path: string;
    original_url: string | null;
    width: number | null;
    height: number | null;
    status: 'uploading' | 'ready' | 'processing' | 'failed';
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}
export interface FileMetadata {
    width: number;
    height: number;
    format: string;
    colorSpace: string;
    exif?: Record<string, unknown>;
}
//# sourceMappingURL=upload.d.ts.map