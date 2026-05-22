// @memorylane/web - Image Uploader Component (Premium Services)
// Reusable drag-and-drop image upload with preview, supports multi-file for batch services
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, UploadCloud, X, Plus, CheckCircle } from 'lucide-react';

interface ImageUploaderProps {
  /** Single file mode (default) or multi-file for batch services */
  multiple?: boolean;
  /** Max number of files in multi-file mode */
  maxFiles?: number;
  /** Accepted file types */
  accept?: string;
  /** Called when files are ready (uploaded to presigned URL) */
  onFilesReady?: (files: UploadedFile[]) => void;
  /** Called when files change (before upload) */
  onFilesChange?: (files: File[]) => void;
  className?: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  uploadId: string;
  storagePath: string;
}

export function ImageUploader({
  multiple = false,
  maxFiles = 10,
  accept = 'image/jpeg,image/png,image/webp,image/tiff',
  onFilesChange,
  className,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const updated = multiple
      ? [...files, ...arr].slice(0, maxFiles)
      : arr.slice(0, 1);

    setFiles(updated);

    // Generate previews
    const newPreviews = arr.map((f) => URL.createObjectURL(f));
    if (multiple) {
      setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles));
    } else {
      setPreviews(newPreviews);
    }

    onFilesChange?.(updated);
  }, [files, multiple, maxFiles, onFilesChange]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== index);
    });
    onFilesChange?.(files.filter((_, i) => i !== index));
  }, [files, onFilesChange]);

  const clearFiles = useCallback(() => {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setFiles([]);
    setPreviews([]);
    onFilesChange?.([]);
  }, [previews, onFilesChange]);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
  }, [addFiles]);

  // Empty state — drop zone
  if (files.length === 0) {
    return (
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
          dragActive
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : 'border-gray-200 hover:border-accent/50 hover:bg-gray-50',
          className,
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        <UploadCloud className="w-10 h-10 text-gray-300 mx-auto mb-4" />
        <p className="text-base font-medium text-primary-800 mb-1">
          {multiple ? 'Drop your photos here' : 'Drop your photo here'}
        </p>
        <p className="text-sm text-gray-400">
          or click to browse
        </p>
        <p className="text-xs text-gray-300 mt-2">
          Supports JPG, PNG, WebP, TIFF
        </p>
      </div>
    );
  }

  // File(s) selected — preview grid
  return (
    <div className={cn('space-y-3', className)}>
      <div className={cn(
        'grid gap-3',
        files.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3',
      )}>
        {files.map((file, idx) => (
          <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            {/* Image preview */}
            <div className="aspect-[4/3] relative">
              <Image
                src={previews[idx]}
                alt={file.name}
                className="w-full h-full object-contain"
                fill
                sizes="(max-width: 640px) 100vw, 200px"
              />
            </div>

            {/* Remove button */}
            <button
              onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* File info */}
            <div className="p-2">
              <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          </div>
        ))}

        {/* Add more button (multi-file mode) */}
        {multiple && files.length < maxFiles && (
          <div
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-accent/50 hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <Plus className="w-6 h-6 text-gray-300 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Add more</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      {/* Clear all */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {files.length} photo{files.length > 1 ? 's' : ''} selected
        </p>
        <button
          onClick={clearFiles}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

// Next.js Image component (to avoid import issues with Image from lucide)
import Image from 'next/image';
