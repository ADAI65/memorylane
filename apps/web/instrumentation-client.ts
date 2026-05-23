// Next.js Client Instrumentation - Sentry Client-Side SDK
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  debug: false,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});

// Export for Next.js instrumentation hook (Sentry recommends this)
// Safe no-op if the SDK version doesn't support it
export const onRouterTransitionStart =
  (Sentry as Record<string, any>).captureRouterTransitionStart || (() => {});
