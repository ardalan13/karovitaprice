// In unified full-stack architecture, all API requests route directly to /api on the current host
import { getAuthToken, clearAuthState } from './authStorage';

const BASE = '/api';

// In-flight GET request deduplication map
const inFlightRequests = new Map();

// Client-side request concurrency limiter (prevents HTTP request flooding and host firewall blocks)
const MAX_CONCURRENT_REQUESTS = 3;
let activeRequestsCount = 0;
const requestQueue = [];

function dequeueNext() {
  if (activeRequestsCount >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
    return;
  }
  const next = requestQueue.shift();
  if (next) {
    activeRequestsCount++;
    next.execute().finally(() => {
      activeRequestsCount--;
      dequeueNext();
    });
  }
}

function runWithConcurrencyLimit(task) {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      execute: async () => {
        try {
          const res = await task();
          resolve(res);
        } catch (err) {
          reject(err);
        }
      }
    });
    dequeueNext();
  });
}

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const token = getAuthToken();
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const fullUrl = BASE + cleanPath;

  // Deduplicate identical in-flight GET requests
  const isGet = method === 'GET' && !options.body;
  const dedupeKey = isGet ? `${fullUrl}:${token || ''}` : null;

  if (dedupeKey && inFlightRequests.has(dedupeKey)) {
    return inFlightRequests.get(dedupeKey);
  }

  const executeCall = () => runWithConcurrencyLimit(async () => {
    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof URLSearchParams)) {
      body = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || 25000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let r;
    try {
      r = await fetch(fullUrl, {
        ...options,
        signal: options.signal || controller.signal,
        body,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });
    } catch (networkErr) {
      clearTimeout(timeoutId);
      if (networkErr.name === 'AbortError') {
        console.warn('API Fetch Timeout on:', fullUrl);
        throw new Error('پاسخگویی سرور بیش از حد طول کشید. لطفاً اتصال اینترنت یا سرور را بررسی نمایید.');
      }
      console.warn('API Fetch Network Error on:', fullUrl, networkErr.message);
      throw new Error('خطا در اتصال به سرور. لطفا اتصال اینترنت یا سرور را بررسی کنید.');
    } finally {
      clearTimeout(timeoutId);
    }

    let d = {};
    try {
      d = await r.json();
    } catch (err) {
      if (!r.ok) {
        if (r.status === 401) {
          clearAuthState();
          if (typeof window !== 'undefined' && window.location.pathname !== '/' && window.location.pathname !== '/auth' && window.location.pathname !== '/login') {
            window.location.replace('/');
          }
        }
        throw new Error(`خطای سرور (${r.status})`);
      }
      return {};
    }

    if (!r.ok) {
      if (r.status === 401) {
        clearAuthState();
        if (typeof window !== 'undefined' && window.location.pathname !== '/' && window.location.pathname !== '/auth' && window.location.pathname !== '/login') {
          window.location.replace('/');
        }
      }
      throw new Error(d.message || `خطا در پردازش درخواست (${r.status})`);
    }

    return d;
  });

  if (dedupeKey) {
    const promise = executeCall().finally(() => {
      inFlightRequests.delete(dedupeKey);
    });
    inFlightRequests.set(dedupeKey, promise);
    return promise;
  }

  return executeCall();
}



