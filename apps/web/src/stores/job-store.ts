// @memorylane/web - Store: Job state management
import { create } from 'zustand';
import type { RestorationJob, SSEJobEvent } from '@memorylane/shared';

interface JobState {
  jobs: RestorationJob[];
  currentJob: RestorationJob | null;
  jobEvents: SSEJobEvent[];
  isLoadingJobs: boolean;

  // Actions
  setJobs: (jobs: RestorationJob[]) => void;
  addJob: (job: RestorationJob) => void;
  updateJob: (id: string, updates: Partial<RestorationJob>) => void;
  setCurrentJob: (job: RestorationJob | null) => void;
  addJobEvent: (event: SSEJobEvent) => void;
  clearJobEvents: () => void;
  setLoadingJobs: (isLoading: boolean) => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  currentJob: null,
  jobEvents: [],
  isLoadingJobs: false,

  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
      currentJob:
        state.currentJob?.id === id
          ? { ...state.currentJob, ...updates }
          : state.currentJob,
    })),
  setCurrentJob: (job) => set({ currentJob: job }),
  addJobEvent: (event) =>
    set((state) => ({
      jobEvents: [...state.jobEvents, event],
    })),
  clearJobEvents: () => set({ jobEvents: [] }),
  setLoadingJobs: (isLoading) => set({ isLoadingJobs: isLoading }),
}));
