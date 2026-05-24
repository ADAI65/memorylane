import { z } from 'zod';
import { ServiceType } from '../types/enums.js';
export declare const createCheckoutSchema: z.ZodEffects<z.ZodObject<{
    service_type: z.ZodOptional<z.ZodNativeEnum<typeof ServiceType>>;
    job_id: z.ZodOptional<z.ZodString>;
    plan: z.ZodOptional<z.ZodEnum<["pro", "unlimited"]>>;
}, "strip", z.ZodTypeAny, {
    service_type?: ServiceType | undefined;
    job_id?: string | undefined;
    plan?: "pro" | "unlimited" | undefined;
}, {
    service_type?: ServiceType | undefined;
    job_id?: string | undefined;
    plan?: "pro" | "unlimited" | undefined;
}>, {
    service_type?: ServiceType | undefined;
    job_id?: string | undefined;
    plan?: "pro" | "unlimited" | undefined;
}, {
    service_type?: ServiceType | undefined;
    job_id?: string | undefined;
    plan?: "pro" | "unlimited" | undefined;
}>;
export declare const paymentListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    per_page: number;
}, {
    page?: number | undefined;
    per_page?: number | undefined;
}>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
//# sourceMappingURL=payment.d.ts.map