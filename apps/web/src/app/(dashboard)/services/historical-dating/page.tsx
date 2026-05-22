"use client";

import { useState } from 'react';
import { ServicePageShell } from '@/components/services/service-page-shell';
import { ImageUploader } from '@/components/services/image-uploader';
import { Button } from '@/components/ui/button';
import { Clock, Search } from 'lucide-react';
import { uploadApi } from '@/lib/api/upload';
import { jobApi } from '@/lib/api/jobs';
import { ServiceType } from '@memorylane/shared';

export default function HistoricalDatingPage() {
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
        service_type: ServiceType.HISTORICAL_DATING,
      });

      if (jobResult.success && jobResult.data) {
        window.location.href = '/dashboard';
      } else {
        throw new Error(jobResult.error?.message || 'Failed to create job');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ServicePageShell
      title="Historical Dating"
      description="Discover when your vintage photos were taken using AI analysis"
      price={0}
      icon={<Clock className="w-6 h-6 text-accent" />}
      estimatedTime="15 seconds"
      limitType="unlimited"
      features={[
        'AI-powered era estimation',
        'Year range with confidence level',
        'Visual clue analysis',
        'Historical context report',
      ]}
    >
      <div className="space-y-8">
        {/* Image Upload */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary-800">Your Photo</h3>
          <ImageUploader
            onFilesChange={(files) => setSelectedFile(files[0] || null)}
          />
          <p className="text-sm text-gray-400">
            Upload a vintage photo to analyze clothing, backgrounds, and photographic techniques for era estimation.
          </p>
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
            <Search className="w-4 h-4 mr-2" />
            {isUploading ? 'Analyzing...' : 'Analyze Photo — Free'}
          </Button>
        </div>
      </div>
    </ServicePageShell>
  );
}
