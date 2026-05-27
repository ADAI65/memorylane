"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ServicePageShell } from '@/components/services/service-page-shell';
import { ImageUploader } from '@/components/services/image-uploader';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { uploadApi } from '@/lib/api/upload';
import { jobApi } from '@/lib/api/jobs';
import { ServiceType } from '@memorylane/shared';

export default function FaceMatchPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const isLoading = isUploading || isProcessing;

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setError(null);
  }, []);

  const uploadFile = async (file: File): Promise<string> => {
    const presignedResult = await uploadApi.getPresignedUrl(
      file.name,
      file.size,
      file.type,
    );

    if (!presignedResult.success || !presignedResult.data) {
      throw new Error(`Failed to get upload URL for ${file.name}`);
    }

    const { upload_url, upload_id } = presignedResult.data;

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed for ${file.name}`));
      });
      xhr.addEventListener('error', () => reject(new Error(`Upload failed for ${file.name}`)));
      xhr.open('PUT', upload_url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });

    // Update upload status to 'ready' so job creation can verify ownership
    const statusResult = await uploadApi.updateStatus(upload_id, 'ready');
    if (!statusResult.success) {
      throw new Error(`Failed to update upload status for ${file.name}`);
    }

    return upload_id;
  };

  const handleSubmit = async () => {
    if (files.length < 2) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // 1. Upload all files and collect upload IDs
      const uploadIds: string[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const uploadId = await uploadFile(files[i]);
        uploadIds.push(uploadId);
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      setIsUploading(false);
      setIsProcessing(true);

      // 3. Create job directly (free — no payment required)
      const jobResult = await jobApi.create({
        upload_id: uploadIds[0],
        service_type: ServiceType.FACE_MATCH,
        batch_upload_ids: uploadIds.length > 1 ? uploadIds.slice(1) : undefined,
      });

      if (jobResult.success && jobResult.data) {
        router.push(`/restore/${jobResult.data.job_id}`);
      } else {
        setError(jobResult.error?.message || 'Failed to create job');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  return (
    <ServicePageShell
      title="Face Match & Link"
      description="AI-powered face matching to find and group people across your photo collection"
      price={0}
      icon={<Users className="w-6 h-6 text-accent" />}
      estimatedTime="1 minute"
      limitType="unlimited"
      features={[
        'Match faces across photos',
        'AI-powered similarity detection',
        'Grouped results by person',
        'Confidence score for each match',
      ]}
    >
      <div className="space-y-8">
        {/* Info Note */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">
            Upload 2-20 photos to match faces across your collection.
            Our AI will detect and group faces by person.
          </p>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary-800">Upload Photos</h3>
          <p className="text-sm text-gray-500">
            Select 2 to 20 photos for face matching
          </p>
          <ImageUploader
            multiple
            maxFiles={20}
            onFilesChange={handleFilesChange}
          />
        </div>

        {/* Upload Progress */}
        {(isUploading) && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Uploading photos...</p>
              <p className="text-sm font-medium text-accent">{uploadProgress}%</p>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-400">
            {files.length < 2
              ? `Need ${2 - files.length} more photo${2 - files.length > 1 ? 's' : ''}`
              : `${files.length} photos selected`}
          </p>
          <Button
            variant="gold"
            size="lg"
            isLoading={isLoading}
            disabled={files.length < 2}
            onClick={handleSubmit}
          >
            <Users className="w-4 h-4 mr-2" />
            {isLoading ? 'Processing...' : 'Match Faces — Free'}
          </Button>
        </div>
      </div>
    </ServicePageShell>
  );
}
