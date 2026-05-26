// @memorylane/web - Root Error Boundary
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Error Boundary]', error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4 max-w-xl w-full">
        <h1 className="text-8xl font-bold text-red-100 mb-4">!</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Something Went Wrong</h2>
        <p className="text-gray-500 mb-4 max-w-md mx-auto">
          An unexpected error occurred. Please try again or go back to the home page.
        </p>

        {/* Show error details in ALL environments for debugging */}
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-left text-xs text-red-700 break-all">
          <p className="font-semibold mb-1">Error: {error?.message || 'Unknown error'}</p>
          {error?.digest && <p className="text-red-400">Digest: {error.digest}</p>}
          {isDev && error?.stack && (
            <pre className="mt-2 text-red-400 overflow-auto max-h-40 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
