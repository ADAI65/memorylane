// Service types enum
export enum ServiceType {
  BASIC_RESTORATION = 'basic_restoration',
  PHOTO_ANIMATION = 'photo_animation',
  MEMORY_VIDEO = 'memory_video',
  HISTORICAL_DATING = 'historical_dating',
  ERA_COLORIZATION = 'era_colorization',
  FACE_MATCH = 'face_match',
  CERTIFICATE = 'certificate',
}

// Job status enum
export enum JobStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELED = 'canceled',
}

// Payment type enum
export enum PaymentType {
  ONE_TIME = 'one_time',
  SUBSCRIPTION = 'subscription',
  CREDIT_PURCHASE = 'credit_purchase',
}

// User plan enum
export enum UserPlan {
  FREE = 'free',
  PRO = 'pro',
  UNLIMITED = 'unlimited',
}

// Subscription status enum
export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  TRIALING = 'trialing',
}

// Upload status enum
export enum UploadStatus {
  UPLOADING = 'uploading',
  READY = 'ready',
  PROCESSING = 'processing',
  FAILED = 'failed',
}

// AI prediction status
export type AIPredictionStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';

// Animation types
export enum AnimationType {
  SUBTLE_MOTION = 'subtle_motion',
  TALKING = 'talking',
  EXPRESSION = 'expression',
}
