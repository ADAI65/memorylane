import { ALLOWED_EXTENSIONS, ALLOWED_FILE_TYPES } from '../constants/limits.js';
/**
 * Validate file MIME type
 */
export function isValidMimeType(mimeType) {
    return ALLOWED_FILE_TYPES.includes(mimeType);
}
/**
 * Validate file extension
 */
export function isValidExtension(filename) {
    const ext = '.' + filename.split('.').pop()?.toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
}
/**
 * Validate UUID string
 */
export function isValidUUID(uuid) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
}
/**
 * Sanitize filename (remove path traversal attempts)
 */
export function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.\./g, '_')
        .replace(/^\//, '');
}
/**
 * Generate storage path for user upload
 */
export function generateUploadPath(userId, filename) {
    const sanitized = sanitizeFilename(filename);
    const ext = sanitized.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `uploads/${userId}/${timestamp}-${random}.${ext}`;
}
/**
 * Generate storage path for restoration result
 */
export function generateResultPath(userId, jobId) {
    return `results/${userId}/${jobId}/output.png`;
}
/**
 * Generate certificate number
 */
export function generateCertificateNumber() {
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `ML-${year}-${seq}`;
}
/**
 * Calculate pagination offset
 */
export function calcOffset(page, perPage) {
    return (page - 1) * perPage;
}
/**
 * Calculate total pages
 */
export function calcTotalPages(total, perPage) {
    return Math.ceil(total / perPage);
}
//# sourceMappingURL=validation.js.map