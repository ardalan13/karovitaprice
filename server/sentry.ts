import * as Sentry from '@sentry/node';

const SENTRY_DSN = process.env.SENTRY_DSN;

export function initServerSentry() {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: 1.0,
    });
    console.log('[Sentry Server] Initialized successfully');
  }
}

export function logServerError(error: any, context: Record<string, any> = {}) {
  console.error('[Server Error Tracker]', error, context);
  if (SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

export { Sentry };
