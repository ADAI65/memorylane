"use client";

import { useState } from 'react';
import { ServicePageShell } from '@/components/services/service-page-shell';
import { ImageUploader } from '@/components/services/image-uploader';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { uploadApi } from '@/lib/api/upload';
import { jobApi } from '@/lib/api/jobs';
import { ServiceType } from '@memorylane/shared';

export default function CertificatePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const error = uploadError;

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Get presigned URL
      const presignedResult = await uploadApi.getPresignedUrl(
        selectedFile.name,
        selectedFile.size,
        selectedFile.type,
      );

      if (!presignedResult.success || !presignedResult.data) {
        throw new Error('Failed to get upload URL');
      }

      const { upload_url, upload_id } = presignedResult.data;

      // 2. Upload file via XMLHttpRequest with PUT
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error('Upload failed'));
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.open('PUT', upload_url);
        xhr.send(selectedFile);
      });

      // 3. Create job directly (free — no payment required)
      const jobResult = await jobApi.create({
        upload_id,
        service_type: ServiceType.CERTIFICATE,
      });

      if (jobResult.success && jobResult.data) {
        window.location.href = '/dashboard';
      } else {
        throw new Error(jobResult.error?.message || 'Failed to create job');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ServicePageShell
      title="Archival Certificate"
      description="Generate a professional archival certificate to authenticate your restored photo"
      price={0}
      icon={<FileText className="w-6 h-6 text-accent" />}
      estimatedTime="Instant"
      limitType="unlimited"
      features={[
        'Professional archival certificate',
        'High-quality PDF download',
        'Includes certificate number',
        'Validates restoration authenticity',
      ]}
    >
      <div className="space-y-8">
        {/* Info Note */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800">
            Certificate will be generated based on your restoration job details.
            You can also generate a standalone certificate for any photo.
          </p>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary-800">Select Photo</h3>
          <p className="text-sm text-gray-500">
            Upload the photo you want to generate a certificate for
          </p>
          <ImageUploader
            onFilesChange={(files) => setSelectedFile(files[0] || null)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-400">
            {selectedFile ? '1 photo selected' : 'No photo selected'}
          </p>
          <Button
            variant="gold"
            size="lg"
            isLoading={isUploading}
            disabled={!selectedFile}
            onClick={handleSubmit}
          >
            <FileText className="w-4 h-4 mr-2" />
            {isUploading ? 'Processing...' : 'Generate Certificate — Free'}
          </Button>
        </div>
      </div>
    </ServicePageShell>
  );
}
