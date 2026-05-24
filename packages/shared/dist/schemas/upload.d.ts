import { z } from 'zod';
export declare const uploadFileSchema: z.ZodObject<{
    file_name: z.ZodString;
    file_size: z.ZodNumber;
    mime_type: z.ZodEnum<[string, ...string[]]>;
}, "strip", z.ZodTypeAny, {
    file_name: string;
    file_size: number;
    mime_type: string;
}, {
    file_name: string;
    file_size: number;
    mime_type: string;
}>;
export declare const uploadListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["uploading", "ready", "processing", "failed"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    per_page: number;
    status?: "processing" | "failed" | "uploading" | "ready" | undefined;
}, {
    status?: "processing" | "failed" | "uploading" | "ready" | undefined;
    page?: number | undefined;
    per_page?: number | undefined;
}>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type UploadListQuery = z.infer<typeof uploadListQuerySchema>;
//# sourceMappingURL=upload.d.ts.map