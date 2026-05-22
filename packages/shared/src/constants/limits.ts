import { UserPlan } from '../types/enums.js';
export { UserPlan } from '../types/enums.js';

// Rate limits per plan
export const RATE_LIMITS = {
  [UserPlan.FREE]: {
    restorationsPerDay: 1,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxConcurrentJobs: 1,
    priority: 1,
  },
  [UserPlan.PRO]: {
    restorationsPerDay: 50,
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxConcurrentJobs: 3,
    priority: 5,
  },
  [UserPlan.UNLIMITED]: {
    restorationsPerDay: 1000, // Effectively unlimited
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxConcurrentJobs: 10,
    priority: 10,
  },
} as const;

// Premium service daily limit (per user, for expensive AI services)
export const PREMIUM_DAILY_LIMIT = 1;

// High-cost premium services that count against the daily limit
// Low-cost services (historical_dating, era_colorization, face_match, certificate) are unlimited
export const HIGH_COST_PREMIUM_SERVICES = [
  'photo_animation',   // HeyGen ~$0.50-0.99 per video
  'memory_video',      // Runway ~$0.50-1.50 per video
] as const;

// API rate limits (requests per minute)
export const API_RATE_LIMITS = {
  auth: { windowMs: 60_000, maxRequests: 10 },
  upload: { windowMs: 60_000, maxRequests: 30 },
  jobs: { windowMs: 60_000, maxRequests: 60 },
  payments: { windowMs: 60_000, maxRequests: 20 },
  general: { windowMs: 60_000, maxRequests: 100 },
} as const;

// Allowed file types for upload
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/bmp',
  'image/webp',
] as const;

// Allowed file extensions
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', '.webp'] as const;

// Job retry configuration
export const JOB_RETRY_CONFIG = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelayMs: 5000,
  maxDelayMs: 60000,
} as const;

// Cleanup configuration
export const CLEANUP_CONFIG = {
  // Delete failed jobs after 7 days
  failedJobRetentionDays: 7,
  // Delete temp files after 24 hours
  tempFileRetentionHours: 24,
  // Run cleanup every 6 hours
  cleanupIntervalMs: 6 * 60 * 60 * 1000,
} as const;
