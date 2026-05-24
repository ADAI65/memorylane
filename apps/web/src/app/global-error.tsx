// @memorylane/web - Global Error Boundary (catches root layout errors)
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error for debugging (replace with Sentry when DSN is configured)
  console.error('[Global Error]', error);

  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
              Something Went Wrong
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '24rem' }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
