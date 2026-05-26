// @memorylane/web - Hook: useFileUpload - file upload management
'use client';

import { useState, useCallback } from 'react';
import { uploadApi } from '@/lib/api/upload';
import { useUploadStore } from '@/stores/upload-store';
import { useUIStore } from '@/stores/ui-store';
import { jobApi } from '@/lib/api/jobs';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface UseUploadOptions {
  autoProcess?: boolean;
  serviceType?: string;
  onProcessed?: (jobId: string) => void;
}

export function useFileUpload(options: UseUploadOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const { setUploading, setUploadProgress, addUpload } = useUploadStore();
  const { addToast } = useUIStore();

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, WebP, or TIFF image.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 20MB.';
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        addToast({ type: 'error', title: 'Invalid file', message: error });
        return null;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        // 1. Get presigned upload URL
        const presignedResult = await uploadApi.getPresignedUrl(
          file.name,
          file.size,
          file.type
        );

        if (!presignedResult.success || !presignedResult.data) {
          throw new Error('Failed to get upload URL');
        }

        const { upload_url, storage_path, upload_id } = presignedResult.data;

        // 2. Upload file to Supabase Storage
        const xhr = new XMLHttpRequest();
        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(progress);
            }
          });
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error('Upload failed'));
            }
          });
          xhr.addEventListener('error', () => reject(new Error('Upload failed')));
          xhr.open('PUT', upload_url);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.setRequestHeader('x-upsert', 'true');
          xhr.send(file);
        });

        // 3. Record upload in our database
        const uploadRecord = {
          id: upload_id,
          storage_path,
          status: 'ready' as const,
        };
        addUpload(uploadRecord as any);

        // 4. Auto-process if enabled
        if (options.autoProcess && options.serviceType) {
          const processResult = await jobApi.create({
            upload_id: upload_id,
            service_type: options.serviceType as any,
          });

          if (processResult.success && processResult.data) {
            options.onProcessed?.(processResult.data.job_id);
            addToast({
              type: 'success',
              title: 'Processing started',
              message: 'Your photo is being restored...',
            });
          }
        }

        addToast({
          type: 'success',
          title: 'Upload complete',
          message: `"${file.name}" uploaded successfully.`,
        });

        return upload_id;
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'Upload failed',
          message: err.message || 'Something went wrong.',
        });
        return null;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [validateFile, setUploading, setUploadProgress, addUpload, addToast, options]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  return {
    isDragging,
    setIsDragging,
    uploadFile,
    handleDrop,
    handleFileSelect,
    validateFile,
    acceptedTypes: ACCEPTED_TYPES.join(','),
    maxFileSize: MAX_FILE_SIZE,
  };
}
