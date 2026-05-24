/**
 * Validate file MIME type
 */
export declare function isValidMimeType(mimeType: string): boolean;
/**
 * Validate file extension
 */
export declare function isValidExtension(filename: string): boolean;
/**
 * Validate UUID string
 */
export declare function isValidUUID(uuid: string): boolean;
/**
 * Sanitize filename (remove path traversal attempts)
 */
export declare function sanitizeFilename(filename: string): string;
/**
 * Generate storage path for user upload
 */
export declare function generateUploadPath(userId: string, filename: string): string;
/**
 * Generate storage path for restoration result
 */
export declare function generateResultPath(userId: string, jobId: string): string;
/**
 * Generate certificate number
 */
export declare function generateCertificateNumber(): string;
/**
 * Calculate pagination offset
 */
export declare function calcOffset(page: number, perPage: number): number;
/**
 * Calculate total pages
 */
export declare function calcTotalPages(total: number, perPage: number): number;
//# sourceMappingURL=validation.d.ts.map