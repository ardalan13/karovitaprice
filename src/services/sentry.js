import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE || 'production',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of the transactions in production/staging
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions for replay
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
    });
    console.log('[Sentry Client] Initialized successfully');
  }
}

export function logErrorToSentry(error, context = {}) {
  console.error('[Error Tracker]', error, context);
  if (SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

export { Sentry };
