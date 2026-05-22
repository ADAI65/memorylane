// @memorylane/web - Premium Usage Banner
'use client';

import { usePremiumUsage } from '@/hooks/use-premium-usage';
import { AlertTriangle, Clock, Info } from 'lucide-react';

interface PremiumUsageBannerProps {
  serviceType: 'photo_animation' | 'memory_video'; // Only high-cost services
}

export function PremiumUsageBanner({ serviceType }: PremiumUsageBannerProps) {
  const { usage, isLoading } = usePremiumUsage();

  if (isLoading) return null;
  if (!usage) return null;

  const isUnlimited = usage.is_admin || usage.premium_remaining === -1;
  if (isUnlimited) return null;

  const serviceName = serviceType === 'photo_animation' ? 'Photo Animation' : 'Memory Video';

  if (usage.premium_remaining <= 0) {
    return (
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Daily limit reached</p>
          <p className="text-xs text-amber-600 mt-0.5">
            You&apos;ve used your 1 free {serviceName} for today. The limit resets at midnight UTC.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5">
      <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-blue-700">
          <span className="font-medium">{usage.premium_remaining}</span> free {serviceName} remaining today
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <p className="text-xs text-blue-500">
            Resets at {new Date(usage.reset_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
          </p>
        </div>
      </div>
    </div>
  );
}
