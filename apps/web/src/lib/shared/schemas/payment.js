import { z } from 'zod';
import { ServiceType } from '../types/enums.js';
export const createCheckoutSchema = z.object({
    service_type: z.nativeEnum(ServiceType).optional(),
    job_id: z.string().uuid().optional(),
    plan: z.enum(['pro', 'unlimited']).optional(),
}).refine((data) => data.service_type || data.plan, { message: 'Either service_type or plan is required' });
export const paymentListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    per_page: z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=payment.js.map