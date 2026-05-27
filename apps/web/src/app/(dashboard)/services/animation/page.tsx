"use client";

import { useState } from 'react';
import { ServicePageShell } from '@/components/services/service-page-shell';
import { PremiumUsageBanner } from '@/components/services/premium-usage-banner';
import { ImageUploader } from '@/components/services/image-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Video, SmilePlus, Wind, Mic, Loader2 } from 'lucide-react';
import { uploadApi } from '@/lib/api/upload';
import { jobApi } from '@/lib/api/jobs';
import { ServiceType, AnimationType } from '@memorylane/shared';
import { usePremiumUsage } from '@/hooks/use-premium-usage';
import { cn } from '@/lib/utils';

const animationStyles = [
  {
    type: AnimationType.SUBTLE_MOTION,
    title: 'Subtle Motion',
    description: 'Gentle breathing and eye-blink effects for a natural look',
    icon: Wind,
  },
  {
    type: AnimationType.TALKING,
    title: 'Talking Photo',
    description: 'Bring your photo to life with lip-synced speech animation',
    icon: Mic,
  },
  {
    type: AnimationType.EXPRESSION,
    title: 'Expression Animation',
    description: 'Add smiles, winks, and other expressive movements',
    icon: SmilePlus,
  },
];

export default function AnimationPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<AnimationType>(AnimationType.SUBTLE_MOTION);
  const [narration, setNarration] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const { isLimited, refetch } = usePremiumUsage();

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
        service_type: ServiceType.PHOTO_ANIMATION,
        animation_type: selectedStyle,
        audio_text: narration || undefined,
      });

      if (jobResult.success && jobResult.data) {
        setJobId(jobResult.data.job_id);
        refetch();
        // Redirect to dashboard to see processing status
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
      title="Photo Animation"
      description="Bring vintage photos to life with AI-powered animation"
      price={0}
      icon={<Sparkles className="w-6 h-6 text-accent" />}
      estimatedTime="2 minutes"
      limitType="high_cost"
      features={[
        'Choose from 3 animation styles',
        'Up to 15-second animated clip',
        'Full HD (1080x1920) output',
        'Downloadable MP4 video',
      ]}
    >
      <div className="space-y-8">
        {/* Premium usage banner */}
        <PremiumUsageBanner serviceType="photo_animation" />

        {/* Animation Style Selector */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary-800">Animation Style</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {animationStyles.map((style) => {
              const Icon = style.icon;
              const isSelected = selectedStyle === style.type;
              return (
                <button
                  key={style.type}
                  type="button"
                  onClick={() => setSelectedStyle(style.type)}
                  className={cn(
                    'text-left p-4 rounded-xl border-2 transition-all duration-200',
                    isSelected
                      ? 'ring-2 ring-accent border-accent bg-accent/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                    isSelected ? 'bg-accent/10' : 'bg-gray-100',
                  )}>
                    <Icon className={cn('w-5 h-5', isSelected ? 'text-accent' : 'text-gray-500')} />
                  </div>
                  <p className={cn(
                    'text-sm font-semibold mb-0.5',
                    isSelected ? 'text-accent' : 'text-primary-800',
                  )}>
                    {style.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {style.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Narration Text */}
        <Input
          label="Narration text (optional)"
          placeholder="Leave empty for default narration..."
          helperText="Add custom narration for talking photo animations"
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
        />

        {/* Image Upload */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-primary-800">Your Photo</h3>
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
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="gold"
              size="lg"
              isLoading={isUploading}
              disabled={!selectedFile || isLimited}
              onClick={handleSubmit}
            >
              {isUploading ? 'Processing...' : isLimited ? 'Daily Limit Reached' : 'Animate Photo — Free'}
            </Button>
          </div>
        </div>
      </div>
    </ServicePageShell>
  );
}
