// @memorylane/web - Hook: Premium service checkout flow
//
// Flow:
//   Pro/Unlimited user: create job → enqueue → redirect to restore page
//   Free user:           create job (pending, not enqueued) → create Stripe checkout → redirect to Stripe
//   After Stripe payment: webhook enqueues job → user lands on dashboard → sees success banner

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jobApi } from '@/lib/api/jobs';
import { paymentApi } from '@/lib/api/payment';
import { ServiceType } from '@memorylane/shared';
import type { CreateJobResponse } from '@memorylane/shared';

interface UsePremiumCheckoutOptions {
  /** Build the redirect URL after a job is successfully created (Pro/Unlimited) */
  onSuccessRedirect?: (jobId: string) => string;
  /** The premium service type */
  serviceType: ServiceType;
  /** Extra params passed to jobApi.create (animation_type, audio_text, etc.) */
  jobParams?: Record<string, unknown>;
}

interface CheckoutState {
  isLoading: boolean;
  error: string | null;
  /** Call after upload is complete. Handles the full create-job → checkout flow. */
  startProcessing: (uploadId: string) => Promise<void>;
  clearError: () => void;
}

export function usePremiumCheckout({
  onSuccessRedirect = (jobId) => `/restore/${jobId}`,
  serviceType,
  jobParams = {},
}: UsePremiumCheckoutOptions): CheckoutState {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const startProcessing = useCallback(async (uploadId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create the job (backend handles plan check internally)
      const jobResult = await jobApi.create({
        upload_id: uploadId,
        service_type: serviceType,
        ...jobParams,
      } as any);

      if (!jobResult.success || !jobResult.data) {
        const msg = jobResult.error?.message || 'Failed to create job';
        setError(msg);
        return;
      }

      const data = jobResult.data as CreateJobResponse;

      // Step 2: If payment is required (free user on premium service), go to Stripe
      if (data.payment_required) {
        const checkoutResult = await paymentApi.createCheckout({
          service_type: serviceType as any,
          job_id: data.job_id,
        });

        if (checkoutResult.success && checkoutResult.data) {
          // Redirect to Stripe Checkout
          window.location.href = (checkoutResult.data as any).checkout_url;
          return;
        }

        setError(checkoutResult.error?.message || 'Failed to create checkout session');
        return;
      }

      // Step 3: Job created & queued (Pro/Unlimited or free basic restoration)
      router.push(onSuccessRedirect(data.job_id));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [router, serviceType, jobParams, onSuccessRedirect]);

  return { isLoading, error, startProcessing, clearError };
}
