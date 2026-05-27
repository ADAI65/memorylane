"use client";

import { useState } from 'react';
import { ServicePageShell } from '@/components/services/service-page-shell';
import { ImageUploader } from '@/components/services/image-uploader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image, Palette } from 'lucide-react';
import { uploadApi } from '@/lib/api/upload';
import { jobApi } from '@/lib/api/jobs';
import { ServiceType } from '@memorylane/shared';
import { cn } from '@/lib/utils';

const eras = [
  '1800s', '1850s', '1900s', '1920s', '1930s', '1940s', '1950s', '1960s', 'Auto-detect',
];

export default function EraColorizationPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEra, setSelectedEra] = useState('Auto-detect');
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
        xhr.setRequestHeader('Content-Type', selectedFile.type);
        xhr.send(selectedFile);
      });

      // 3. Update upload status to 'ready' so job creation can verify ownership
      const statusResult = await uploadApi.updateStatus(upload_id, 'ready');
      if (!statusResult.success) {
        throw new Error('Failed to update upload status');
      }

      // 4. Create job directly (free — no payment required)
      const jobResult = await jobApi.create({
        upload_id,
        service_type: ServiceType.ERA_COLORIZATION,
        ai_params: { era: selectedEra === 'Auto-detect' ? 'auto' : selectedEra },
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
      title="Era-Accurate Colorization"
      description="Add historically accurate colors to your black & white photos"
      price={0}
      icon={<Image className="w-6 h-6 text-accent" />}
      estimatedTime="45 seconds"
      limitType="unlimited"
      features={[
        'Period-appropriate color palette',
        'AI-powered color analysis',
        'High-resolution output',
        'Preserves photo texture',
      ]}
    >
      <div className="space-y-8">
        {/* Era Selection */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary-800">Select Era (optional)</h3>
          <div className="flex flex-wrap gap-2">
            {eras.map((era) => {
              const isSelected = selectedEra === era;
              return (
                <button
                  key={era}
                  type="button"
                  onClick={() => setSelectedEra(era)}
                >
                  <Badge
                    variant={isSelected ? 'gold' : 'default'}
                    size="md"
                    className={cn(
                      'cursor-pointer transition-all duration-200',
                      isSelected && 'ring-2 ring-gold/30',
                      !isSelected && 'hover:bg-gray-200',
                    )}
                  >
                    {era}
                  </Badge>
                </button>
              );
            })}
          </div>
          {selectedEra !== 'Auto-detect' && (
            <p className="text-xs text-gray-400">
              Using color palette from the {selectedEra} era
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary-800">Your Photo</h3>
          <ImageUploader
            onFilesChange={(files) => setSelectedFile(files[0] || null)}
          />
          <p className="text-sm text-gray-400">
            Upload a black & white photo. Best results with clear, well-scanned originals.
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
            <Palette className="w-4 h-4 mr-2" />
            {isUploading ? 'Colorizing...' : 'Colorize Photo — Free'}
          </Button>
        </div>
      </div>
    </ServicePageShell>
  );
}
