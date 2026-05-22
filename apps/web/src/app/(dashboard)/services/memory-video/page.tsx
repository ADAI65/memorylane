"use client";

import { useState } from 'react';
import { ServicePageShell } from '@/components/services/service-page-shell';
import { PremiumUsageBanner } from '@/components/services/premium-usage-banner';
import { ImageUploader } from '@/components/services/image-uploader';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { uploadApi } from '@/lib/api/upload';
import { jobApi } from '@/lib/api/jobs';
import { ServiceType } from '@memorylane/shared';
import { usePremiumUsage } from '@/hooks/use-premium-usage';
import { cn } from '@/lib/utils';

const DURATIONS = [
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
] as const;

export default function MemoryVideoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioText, setAudioText] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(10);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { isLimited, refetch } = usePremiumUsage();

  const error = uploadError;

  const charCount = audioText.length;
  const maxChars = 500;

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
        service_type: ServiceType.MEMORY_VIDEO,
        ai_params: { audio_text: audioText || undefined, duration_seconds: durationSeconds },
      });

      if (jobResult.success && jobResult.data) {
        refetch();
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
      title="Memory Video"
      description="Transform your cherished photos into cinematic AI-generated videos"
      price={0}
      icon={<Video className="w-6 h-6 text-accent" />}
      estimatedTime="5 minutes"
      limitType="high_cost"
      features={[
        'Cinematic AI-generated video',
        'AI narration with natural voice',
        'Up to 10-second clip',
        '16:9 widescreen format',
      ]}
    >
      <div className="space-y-8">
        {/* Premium usage banner */}
        <PremiumUsageBanner serviceType="memory_video" />

        {/* Custom Narration */}
        <div className="space-y-3">
          <label htmlFor="narration" className="block text-sm font-medium text-gray-700">
            Custom narration (optional)
          </label>
          <div className="relative">
            <textarea
              id="narration"
              value={audioText}
              onChange={(e) => setAudioText(e.target.value.slice(0, maxChars))}
              placeholder="Describe the story behind this photo..."
              rows={3}
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-white text-primary-800 placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',
                'transition-all duration-200 resize-none',
                'border-gray-200',
              )}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">
              Add a personal story for AI narration
            </p>
            <p className={cn(
              'text-xs',
              charCount >= maxChars ? 'text-red-500' : 'text-gray-400',
            )}>
              {charCount}/{maxChars}
            </p>
          </div>
        </div>

        {/* Duration Selector */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary-800">Duration</h3>
          <div className="flex gap-3">
            {DURATIONS.map((dur) => {
              const isSelected = durationSeconds === dur.value;
              return (
                <button
                  key={dur.value}
                  type="button"
                  onClick={() => setDurationSeconds(dur.value)}
                  className={cn(
                    'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                    isSelected
                      ? 'bg-accent text-white shadow-lg shadow-accent/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {dur.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary-800">Source Photo</h3>
          <p className="text-sm text-gray-500">
            Upload the photo you want to transform into a video
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
            disabled={!selectedFile || isLimited}
            onClick={handleSubmit}
          >
            <Video className="w-4 h-4 mr-2" />
            {isUploading ? 'Processing...' : isLimited ? 'Daily Limit Reached' : 'Create Memory Video — Free'}
          </Button>
        </div>
      </div>
    </ServicePageShell>
  );
}
