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

// Rate limiting & Loop prevention state
const recentErrors = new Map();
let errorCountInWindow = 0;
let windowStartTime = Date.now();
const MAX_ERRORS_PER_MINUTE = 3;
const DEDUPE_WINDOW_MS = 15000;

/**
 * Dispatches an error to the backend local file storage with strict rate-limiting
 */
export function logError(error, context = {}) {
  const message = error?.message || (typeof error === 'string' ? error : 'Unknown client error');
  const name = error?.name || 'ClientError';
  const stack = error?.stack || (new Error().stack);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  // 1. Always log locally to console for debugging
  console.error('🔴 [Client Error]', name, message, { context, stack });

  // 2. Loop & Recursion Protection: Never report errors from logger, vitals, network disconnects or aborts
  if (
    context?.url?.includes('/api/logs/') ||
    context?.type === 'network_failure' ||
    message.includes('/api/logs/') ||
    message.includes('ERR_INTERNET_DISCONNECTED') ||
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('AbortError') ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  ) {
    return;
  }

  // 3. Deduplication: Drop identical errors within DEDUPE_WINDOW_MS
  const errorKey = `${name}:${message}:${context?.source || ''}`;
  const now = Date.now();
  if (recentErrors.has(errorKey)) {
    const lastSeen = recentErrors.get(errorKey);
    if (now - lastSeen < DEDUPE_WINDOW_MS) {
      return;
    }
  }
  recentErrors.set(errorKey, now);

  // Clean old entries
  if (recentErrors.size > 50) {
    for (const [k, time] of recentErrors.entries()) {
      if (now - time > DEDUPE_WINDOW_MS) {
        recentErrors.delete(k);
      }
    }
  }

  // 4. Rate Limiting: Max 3 error reports per minute to protect host from firewall blocking
  if (now - windowStartTime > 60000) {
    windowStartTime = now;
    errorCountInWindow = 0;
  }

  if (errorCountInWindow >= MAX_ERRORS_PER_MINUTE) {
    return;
  }
  errorCountInWindow++;

  try {
    const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('karovita_token')) : null;
    const payload = JSON.stringify({
      message: message.slice(0, 500),
      name: name.slice(0, 100),
      stack: (stack || '').slice(0, 1000),
      url,
      context,
      level: 'error',
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/logs/client-error', blob);
    } else if (typeof fetch === 'function') {
      fetch('/api/logs/client-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Fail silently
  }
}

export function logWarn(message, context = {}) {
  console.warn('🟡 [Client Warn]', message, context);
}

export function logInfo(message, context = {}) {
  console.info('ℹ️ [Client Info]', message, context);
}
