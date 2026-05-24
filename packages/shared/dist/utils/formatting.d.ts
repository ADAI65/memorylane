/**
 * Format price in cents to display string
 * e.g., 2900 -> "$29.00"
 */
export declare function formatPrice(cents: number, currency?: string): string;
/**
 * Format date to human-readable string
 */
export declare function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string;
/**
 * Format date to relative time string
 * e.g., "2 hours ago", "3 days ago"
 */
export declare function formatRelativeTime(dateStr: string): string;
/**
 * Format file size in bytes to human-readable string
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Format duration in seconds to human-readable string
 */
export declare function formatDuration(seconds: number): string;
//# sourceMappingURL=formatting.d.ts.map