"use client";

// @memorylane/web - Upload Page (all services free)

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUploadStore } from '@/stores/upload-store';
import { uploadApi } from '@/lib/api/upload';
import { jobApi } from '@/lib/api/jobs';
import { usePremiumUsage } from '@/hooks/use-premium-usage';
import { cn } from '@/lib/utils';
import { UploadCloud, CheckCircle, X, Sparkles, Clock, Image, Video, Users, FileText, Palette } from 'lucide-react';
import type { Upload } from '@memorylane/shared';
import { ServiceType } from '@memorylane/shared';

// Service options shown in the upload page
const HIGH_COST_SERVICES = new Set([
  ServiceType.PHOTO_ANIMATION,
  ServiceType.MEMORY_VIDEO,
]);

const SERVICE_OPTIONS: Array<{
  type: ServiceType;
  name: string;
  desc: string;
  icon: typeof Image;
  highCost?: boolean;
}> = [
  {
    type: ServiceType.BASIC_RESTORATION,
    name: 'Basic Restoration',
    desc: 'Scratch removal, face enhancement, 4K upscaling',
    icon: Image,
  },
  {
    type: ServiceType.PHOTO_ANIMATION,
    name: 'Photo Animation',
    desc: 'Bring vintage photos to life',
    icon: Sparkles,
    highCost: true,
  },
  {
    type: ServiceType.MEMORY_VIDEO,
    name: 'Memory Video',
    desc: 'Cinematic slideshow with narration',
    icon: Video,
    highCost: true,
  },
  {
    type: ServiceType.HISTORICAL_DATING,
    name: 'Historical Dating',
    desc: 'AI era estimation',
    icon: Clock,
  },
  {
    type: ServiceType.ERA_COLORIZATION,
    name: 'Era Colorization',
    desc: 'Period-appropriate colors',
    icon: Palette,
  },
  {
    type: ServiceType.FACE_MATCH,
    name: 'Face Match & Link',
    desc: 'Match faces across photos',
    icon: Users,
  },
  {
    type: ServiceType.CERTIFICATE,
    name: 'Archival Certificate',
    desc: 'Professional PDF certificate',
    icon: FileText,
  },
];

export default function UploadPage() {
  const [selectedService, setSelectedService] = useState<ServiceType>(ServiceType.BASIC_RESTORATION);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<Upload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isLimited } = usePremiumUsage();

  const { addUpload, setCurrentUpload } = useUploadStore();

  const currentService = SERVICE_OPTIONS.find((s) => s.type === selectedService)!;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 1. Get presigned URL
      const presignedResult = await uploadApi.getPresignedUrl(
        selectedFile.name,
        selectedFile.size,
        selectedFile.type
      );

      if (!presignedResult.success || !presignedResult.data) {
        throw new Error('Failed to get upload URL');
      }

      const { upload_url, storage_path, upload_id } = presignedResult.data;

      // 2. Upload to Supabase Storage via presigned URL
      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(pct);
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error('Upload failed'));
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.open('PUT', upload_url);
        xhr.send(selectedFile);
      });

      // 3. Record upload in DB
      const uploadRecord: Upload = {
        id: upload_id,
        user_id: '',
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        storage_path,
        original_url: null,
        width: null,
        height: null,
        status: 'ready',
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addUpload(uploadRecord);
      setCurrentUpload(uploadRecord);
      setUploadResult(uploadRecord);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!uploadResult) return;

    // Check premium limit for high-cost services
    if (HIGH_COST_SERVICES.has(selectedService) && isLimited) {
      setError('Daily limit reached for this premium service. Please try again after midnight UTC.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const jobResult = await jobApi.create({
        upload_id: uploadResult.id,
        service_type: selectedService,
      });

      if (jobResult.success && jobResult.data) {
        window.location.href = `/restore/${jobResult.data.job_id}`;
      } else {
        setError(jobResult.error?.message || 'Failed to create job');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadResult(null);
    setUploadProgress(0);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800">Upload Photo</h1>
        <p className="text-gray-500 mt-1">Upload a vintage photo and choose a service — all free</p>
      </div>

      {/* Service Selector */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Choose a Service</h2>
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((svc) => {
            const Icon = svc.icon;
            const isSelected = selectedService === svc.type;
            return (
              <button
                key={svc.type}
                onClick={() => {
                  setSelectedService(svc.type);
                  setError(null);
                }}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border',
                  isSelected
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                <Icon className="w-4 h-4" />
                {svc.name}
                <Badge variant={svc.highCost ? 'warning' : 'success'} size="sm">
                  {svc.highCost ? '1/day' : 'Free'}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Zone */}
      {!uploadResult ? (
        <Card padding="lg">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-2xl p-12 text-center transition-colors',
              dragActive ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-accent/50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              accept="image/jpeg,image/png,image/webp,image/tiff"
              onChange={handleInputChange}
              className="hidden"
            />
            {previewUrl ? (
              <div className="space-y-4">
                <img src={previewUrl} alt="Preview" className="max-h-80 mx-auto rounded-xl" />
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm text-gray-600">{selectedFile?.name}</span>
                  <button onClick={clearSelection} className="p-1 rounded-full hover:bg-gray-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {isUploading && (
                  <div className="max-w-xs mx-auto">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
                  </div>
                )}
                <Button
                  onClick={handleUpload}
                  isLoading={isUploading}
                  className="mt-2"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-gray-600">Drag & drop your photo here</p>
                  <p className="text-sm text-gray-400 mt-1">or</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-outline text-sm px-4 py-2"
                >
                  Browse Files
                </button>
                <p className="text-xs text-gray-400">JPEG, PNG, WebP, TIFF — Max 20MB</p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-primary-800">Upload Complete!</h3>
              <p className="text-sm text-gray-500 mt-1">
                {uploadResult.file_name} — ready for {currentService.name}
              </p>
            </div>

            {/* Error display */}
            {error && (
              <div className="max-w-md mx-auto p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={handleProcess}
                isLoading={isProcessing}
                variant="primary"
                disabled={HIGH_COST_SERVICES.has(selectedService) && isLimited}
              >
                {isProcessing ? 'Processing...'
                  : HIGH_COST_SERVICES.has(selectedService) && isLimited
                    ? 'Daily Limit Reached'
                    : `Start ${currentService.name} — Free`}
              </Button>
              <Button variant="ghost" onClick={clearSelection}>
                Upload Different Photo
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
