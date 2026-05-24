export { UserPlan } from '../types/enums.js';
export declare const RATE_LIMITS: {
    readonly free: {
        readonly restorationsPerDay: 1;
        readonly maxFileSize: number;
        readonly maxConcurrentJobs: 1;
        readonly priority: 1;
    };
    readonly pro: {
        readonly restorationsPerDay: 50;
        readonly maxFileSize: number;
        readonly maxConcurrentJobs: 3;
        readonly priority: 5;
    };
    readonly unlimited: {
        readonly restorationsPerDay: 1000;
        readonly maxFileSize: number;
        readonly maxConcurrentJobs: 10;
        readonly priority: 10;
    };
};
export declare const PREMIUM_DAILY_LIMIT = 1;
export declare const HIGH_COST_PREMIUM_SERVICES: readonly ["photo_animation", "memory_video"];
export declare const API_RATE_LIMITS: {
    readonly auth: {
        readonly windowMs: 60000;
        readonly maxRequests: 10;
    };
    readonly upload: {
        readonly windowMs: 60000;
        readonly maxRequests: 30;
    };
    readonly jobs: {
        readonly windowMs: 60000;
        readonly maxRequests: 60;
    };
    readonly payments: {
        readonly windowMs: 60000;
        readonly maxRequests: 20;
    };
    readonly general: {
        readonly windowMs: 60000;
        readonly maxRequests: 100;
    };
};
export declare const ALLOWED_FILE_TYPES: readonly ["image/jpeg", "image/png", "image/tiff", "image/bmp", "image/webp"];
export declare const ALLOWED_EXTENSIONS: readonly [".jpg", ".jpeg", ".png", ".tiff", ".tif", ".bmp", ".webp"];
export declare const JOB_RETRY_CONFIG: {
    readonly maxRetries: 3;
    readonly backoffMultiplier: 2;
    readonly initialDelayMs: 5000;
    readonly maxDelayMs: 60000;
};
export declare const CLEANUP_CONFIG: {
    readonly failedJobRetentionDays: 7;
    readonly tempFileRetentionHours: 24;
    readonly cleanupIntervalMs: number;
};
//# sourceMappingURL=limits.d.ts.map