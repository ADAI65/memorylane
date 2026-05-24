/**
 * Format price in cents to display string
 * e.g., 2900 -> "$29.00"
 */
export function formatPrice(cents, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(cents / 100);
}
/**
 * Format date to human-readable string
 */
export function formatDate(dateStr, options) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    });
}
/**
 * Format date to relative time string
 * e.g., "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffSec < 60)
        return 'just now';
    if (diffMin < 60)
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24)
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 30)
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    return formatDate(dateStr);
}
/**
 * Format file size in bytes to human-readable string
 */
export function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds) {
    if (seconds < 60)
        return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (min < 60)
        return `${min}m ${sec}s`;
    const hr = Math.floor(min / 60);
    const remMin = min % 60;
    return `${hr}h ${remMin}m`;
}
//# sourceMappingURL=formatting.js.map