// @memorylane/web - Hook: useSSE - Server-Sent Events for real-time job updates
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createJobSSEConnection } from '@/lib/api/jobs';
import type { SSEJobEvent } from '@memorylane/shared';

interface UseSSEOptions {
  jobId: string | null;
  onEvent?: (event: SSEJobEvent) => void;
  onComplete?: (event: SSEJobEvent) => void;
  onError?: (error: string) => void;
  autoReconnect?: boolean;
}

export function useSSE({
  jobId,
  onEvent,
  onComplete,
  onError,
  autoReconnect = true,
}: UseSSEOptions) {
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!jobId) return;

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = createJobSSEConnection(jobId);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.addEventListener('status', (event) => {
      try {
        const data: SSEJobEvent = JSON.parse(event.data);
        setStatus(data.status);
        setProgress(data.progress || 0);
        if (data.result_url) setResultUrl(data.result_url);
        if (data.error) {
          setError(data.error);
          onError?.(data.error);
        }
        onEvent?.(data);

        // Auto-close on terminal states
        if (data.status === 'completed') {
          onComplete?.(data);
          eventSource.close();
          setIsConnected(false);
        } else if (data.status === 'failed') {
          eventSource.close();
          setIsConnected(false);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
      if (autoReconnect && status !== 'completed' && status !== 'failed') {
        // Reconnect after 3 seconds
        setTimeout(() => connect(), 3000);
      }
    };
  }, [jobId, status, onEvent, onComplete, onError, autoReconnect]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        setIsConnected(false);
      }
    };
  }, [jobId]);

  return {
    status,
    progress,
    resultUrl,
    error,
    isConnected,
    reconnect: connect,
  };
}
