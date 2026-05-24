// Service types enum
export var ServiceType;
(function (ServiceType) {
    ServiceType["BASIC_RESTORATION"] = "basic_restoration";
    ServiceType["PHOTO_ANIMATION"] = "photo_animation";
    ServiceType["MEMORY_VIDEO"] = "memory_video";
    ServiceType["HISTORICAL_DATING"] = "historical_dating";
    ServiceType["ERA_COLORIZATION"] = "era_colorization";
    ServiceType["FACE_MATCH"] = "face_match";
    ServiceType["CERTIFICATE"] = "certificate";
})(ServiceType || (ServiceType = {}));
// Job status enum
export var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["QUEUED"] = "queued";
    JobStatus["PROCESSING"] = "processing";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
    JobStatus["CANCELED"] = "canceled";
})(JobStatus || (JobStatus = {}));
// Payment status enum
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["SUCCEEDED"] = "succeeded";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["CANCELED"] = "canceled";
})(PaymentStatus || (PaymentStatus = {}));
// Payment type enum
export var PaymentType;
(function (PaymentType) {
    PaymentType["ONE_TIME"] = "one_time";
    PaymentType["SUBSCRIPTION"] = "subscription";
    PaymentType["CREDIT_PURCHASE"] = "credit_purchase";
})(PaymentType || (PaymentType = {}));
// User plan enum
export var UserPlan;
(function (UserPlan) {
    UserPlan["FREE"] = "free";
    UserPlan["PRO"] = "pro";
    UserPlan["UNLIMITED"] = "unlimited";
})(UserPlan || (UserPlan = {}));
// Subscription status enum
export var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["PAST_DUE"] = "past_due";
    SubscriptionStatus["CANCELED"] = "canceled";
    SubscriptionStatus["INCOMPLETE"] = "incomplete";
    SubscriptionStatus["TRIALING"] = "trialing";
})(SubscriptionStatus || (SubscriptionStatus = {}));
// Upload status enum
export var UploadStatus;
(function (UploadStatus) {
    UploadStatus["UPLOADING"] = "uploading";
    UploadStatus["READY"] = "ready";
    UploadStatus["PROCESSING"] = "processing";
    UploadStatus["FAILED"] = "failed";
})(UploadStatus || (UploadStatus = {}));
// Animation types
export var AnimationType;
(function (AnimationType) {
    AnimationType["SUBTLE_MOTION"] = "subtle_motion";
    AnimationType["TALKING"] = "talking";
    AnimationType["EXPRESSION"] = "expression";
})(AnimationType || (AnimationType = {}));
//# sourceMappingURL=enums.js.map