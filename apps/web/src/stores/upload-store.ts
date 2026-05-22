// @memorylane/web - Store: Upload state management
import { create } from 'zustand';
import type { Upload } from '@memorylane/shared';

interface UploadState {
  uploads: Upload[];
  currentUpload: Upload | null;
  isUploading: boolean;
  uploadProgress: number;
  totalFiles: number;

  // Actions
  setUploads: (uploads: Upload[]) => void;
  addUpload: (upload: Upload) => void;
  setCurrentUpload: (upload: Upload | null) => void;
  setUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  uploads: [],
  currentUpload: null,
  isUploading: false,
  uploadProgress: 0,
  totalFiles: 0,

  setUploads: (uploads) => set({ uploads }),
  addUpload: (upload) =>
    set((state) => ({ uploads: [upload, ...state.uploads] })),
  setCurrentUpload: (upload) => set({ currentUpload: upload }),
  setUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  reset: () =>
    set({
      uploads: [],
      currentUpload: null,
      isUploading: false,
      uploadProgress: 0,
      totalFiles: 0,
    }),
}));
