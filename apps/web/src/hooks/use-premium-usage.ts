// @memorylane/web - Premium usage tracking hook
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

export interface PremiumUsage {
  premium_usage_today: number;
  premium_daily_limit: number;
  premium_remaining: number; // -1 = unlimited (admin)
  reset_at: string;
  is_admin: boolean;
}

export function usePremiumUsage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [usage, setUsage] = useState<PremiumUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!isAuthenticated) {
      setUsage(null);
      setIsLoading(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/api/jobs/usage`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setUsage(json.data);
      }
    } catch {
      // Silently fail — usage info is non-critical
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const isLimited = usage ? usage.premium_remaining === 0 : false;
  const isUnlimited = usage ? usage.is_admin || usage.premium_remaining === -1 : false;

  return {
    usage,
    isLoading: isLoading || authLoading,
    isLimited,
    isUnlimited,
    refetch: fetchUsage,
  };
}
