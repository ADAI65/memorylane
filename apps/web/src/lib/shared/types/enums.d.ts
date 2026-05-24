export declare enum ServiceType {
    BASIC_RESTORATION = "basic_restoration",
    PHOTO_ANIMATION = "photo_animation",
    MEMORY_VIDEO = "memory_video",
    HISTORICAL_DATING = "historical_dating",
    ERA_COLORIZATION = "era_colorization",
    FACE_MATCH = "face_match",
    CERTIFICATE = "certificate"
}
export declare enum JobStatus {
    PENDING = "pending",
    QUEUED = "queued",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELED = "canceled"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELED = "canceled"
}
export declare enum PaymentType {
    ONE_TIME = "one_time",
    SUBSCRIPTION = "subscription",
    CREDIT_PURCHASE = "credit_purchase"
}
export declare enum UserPlan {
    FREE = "free",
    PRO = "pro",
    UNLIMITED = "unlimited"
}
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    PAST_DUE = "past_due",
    CANCELED = "canceled",
    INCOMPLETE = "incomplete",
    TRIALING = "trialing"
}
export declare enum UploadStatus {
    UPLOADING = "uploading",
    READY = "ready",
    PROCESSING = "processing",
    FAILED = "failed"
}
export type AIPredictionStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
export declare enum AnimationType {
    SUBTLE_MOTION = "subtle_motion",
    TALKING = "talking",
    EXPRESSION = "expression"
}
//# sourceMappingURL=enums.d.ts.map