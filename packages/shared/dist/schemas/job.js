import { z } from 'zod';
import { ServiceType, AnimationType } from '../types/enums.js';
export const createJobSchema = z.object({
    upload_id: z.string().uuid('Invalid upload ID'),
    service_type: z.nativeEnum(ServiceType),
    ai_model: z.string().optional(),
    ai_params: z.record(z.unknown()).optional(),
    // Premium service params
    animation_type: z.nativeEnum(AnimationType).optional(),
    duration_seconds: z.number().int().min(1).max(300).optional(),
    audio_text: z.string().max(500).optional(),
    batch_upload_ids: z.array(z.string().uuid()).max(20).optional(),
});
export const jobListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    per_page: z.coerce.number().int().min(1).max(100).default(20),
    status: z
        .enum(['pending', 'queued', 'processing', 'completed', 'failed', 'canceled'])
        .optional(),
    service_type: z.nativeEnum(ServiceType).optional(),
});
//# sourceMappingURL=job.js.map