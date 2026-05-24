import { z } from 'zod';
import { ServiceType, AnimationType } from '../types/enums.js';
export declare const createJobSchema: z.ZodObject<{
    upload_id: z.ZodString;
    service_type: z.ZodNativeEnum<typeof ServiceType>;
    ai_model: z.ZodOptional<z.ZodString>;
    ai_params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    animation_type: z.ZodOptional<z.ZodNativeEnum<typeof AnimationType>>;
    duration_seconds: z.ZodOptional<z.ZodNumber>;
    audio_text: z.ZodOptional<z.ZodString>;
    batch_upload_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    upload_id: string;
    service_type: ServiceType;
    ai_model?: string | undefined;
    ai_params?: Record<string, unknown> | undefined;
    animation_type?: AnimationType | undefined;
    duration_seconds?: number | undefined;
    audio_text?: string | undefined;
    batch_upload_ids?: string[] | undefined;
}, {
    upload_id: string;
    service_type: ServiceType;
    ai_model?: string | undefined;
    ai_params?: Record<string, unknown> | undefined;
    animation_type?: AnimationType | undefined;
    duration_seconds?: number | undefined;
    audio_text?: string | undefined;
    batch_upload_ids?: string[] | undefined;
}>;
export declare const jobListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["pending", "queued", "processing", "completed", "failed", "canceled"]>>;
    service_type: z.ZodOptional<z.ZodNativeEnum<typeof ServiceType>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    per_page: number;
    status?: "pending" | "queued" | "processing" | "completed" | "failed" | "canceled" | undefined;
    service_type?: ServiceType | undefined;
}, {
    status?: "pending" | "queued" | "processing" | "completed" | "failed" | "canceled" | undefined;
    page?: number | undefined;
    per_page?: number | undefined;
    service_type?: ServiceType | undefined;
}>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type JobListQuery = z.infer<typeof jobListQuerySchema>;
//# sourceMappingURL=job.d.ts.map