import { ALLOWED_EXTENSIONS, ALLOWED_FILE_TYPES } from '../constants/limits.js';

/**
 * Validate file MIME type
 */
export function isValidMimeType(mimeType: string): boolean {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Validate file extension
 */
export function isValidExtension(filename: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Validate UUID string
 */
export function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

/**
 * Sanitize filename (remove path traversal attempts)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\//, '');
}

/**
 * Generate storage path for user upload
 */
export function generateUploadPath(userId: string, filename: string): string {
  const sanitized = sanitizeFilename(filename);
  const ext = sanitized.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `uploads/${userId}/${timestamp}-${random}.${ext}`;
}

/**
 * Generate storage path for restoration result
 */
export function generateResultPath(userId: string, jobId: string): string {
  return `results/${userId}/${jobId}/output.png`;
}

/**
 * Generate certificate number
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `ML-${year}-${seq}`;
}

/**
 * Calculate pagination offset
 */
export function calcOffset(page: number, perPage: number): number {
  return (page - 1) * perPage;
}

/**
 * Calculate total pages
 */
export function calcTotalPages(total: number, perPage: number): number {
  return Math.ceil(total / perPage);
}
