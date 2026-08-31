/**
 * Lightweight & Unified Local Error Logger (Client-side)
 * Captures UI errors, unhandled rejections, and network errors,
 * sending them to the backend local error logging system (/api/logs/client-error)
 * for centralized persistent file-based tracking without third-party dependencies.
 */

let isInitialized = false;

export function initClientLogger() {
  if (isInitialized || typeof window === 'undefined') return;

  // Capture global JavaScript runtime errors
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message || 'Script Error'), {
      source: 'window.onerror',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const error = reason instanceof Error ? reason : new Error(String(reason || 'Unhandled Promise Rejection'));
    logError(error, {
      source: 'window.onunhandledrejection',
      reason: typeof reason === 'object' ? JSON.stringify(reason) : String(reason),
    });
  });

  isInitialized = true;
  console.log('✅ [Karovita Logger] Local client error logging initialized successfully');
}

/**
 * Dispatches an error to the backend local file storage
 */
export function logError(error, context = {}) {
  const message = error?.message || (typeof error === 'string' ? error : 'Unknown client error');
  const name = error?.name || 'ClientError';
  const stack = error?.stack || (new Error().stack);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  console.error('🔴 [Client Error]', name, message, { context, stack });

  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const payload = JSON.stringify({
      message,
      name,
      stack,
      url,
      context,
      level: 'error',
    });

    // Try sendBeacon if available, otherwise fetch
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/logs/client-error', blob);
    } else {
      fetch('/api/logs/client-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Fail silently to avoid infinite error loops
      });
    }
  } catch {
    // Fail silently on logging failure
  }
}

export function logWarn(message, context = {}) {
  console.warn('🟡 [Client Warn]', message, context);
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    fetch('/api/logs/client-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        name: 'ClientWarning',
        url: typeof window !== 'undefined' ? window.location.href : '',
        context,
        level: 'warn',
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function logInfo(message, context = {}) {
  console.info('ℹ️ [Client Info]', message, context);
}
