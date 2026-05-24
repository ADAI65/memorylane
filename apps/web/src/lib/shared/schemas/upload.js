import { z } from 'zod';
import { ALLOWED_FILE_TYPES, RATE_LIMITS } from '../constants/limits.js';
export const uploadFileSchema = z.object({
    file_name: z.string().min(1).max(255),
    file_size: z
        .number()
        .max(RATE_LIMITS.unlimited.maxFileSize)
        .min(1),
    mime_type: z.enum(ALLOWED_FILE_TYPES),
});
export const uploadListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    per_page: z.coerce.number().int().min(1).max(100).default(20),
    status: z
        .enum(['uploading', 'ready', 'processing', 'failed'])
        .optional(),
});
//# sourceMappingURL=upload.js.map