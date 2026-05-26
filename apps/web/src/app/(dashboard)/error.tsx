// @memorylane/web - Dashboard Error Boundary
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error Boundary]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-red-50">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-4">An error occurred while loading this page.</p>

        {/* Error details for debugging */}
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-left text-xs text-red-700 break-all">
          <p className="font-mono font-semibold">{error?.message || 'Unknown error'}</p>
          {error?.digest && <p className="text-red-400 mt-1">Digest: {error.digest}</p>}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
