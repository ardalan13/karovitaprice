// In unified full-stack architecture, all API requests route directly to /api on the current host
import { getAuthToken, clearAuthState } from './authStorage';

const BASE = '/api';

// In-flight GET request deduplication map
const inFlightRequests = new Map();

// Client-side request concurrency limiter (prevents HTTP request flooding and host firewall blocks)
const MAX_CONCURRENT_REQUESTS = 6;
let activeRequestsCount = 0;
const requestQueue = [];

// Lightweight GET response cache (avoids redundant round-trips for
// frequently-polled endpoints like badges, counts, configurator data)
const responseCache = new Map();
const CACHE_TTL_MS = 15000; // 15s client-side TTL
const CACHEABLE_GET_PREFIXES = [
  '/configurator/data',
  '/payments/pending-count',
  '/tickets/badge',
  '/tickets/unread-count',
  '/push/public-key',
  '/packages',
];

// Serve from cache for the same token+URL if fresh, otherwise refetch
function getCachedResponse(cacheKey) {
  const entry = responseCache.get(cacheKey);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  if (entry) responseCache.delete(cacheKey);
  return null;
}

function setCachedResponse(cacheKey, data) {
  // Keep cache small - LRU-style eviction
  if (responseCache.size > 100) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
  responseCache.set(cacheKey, { data, timestamp: Date.now() });
}

// Invalidate cache entries matching a URL prefix (call after mutations)
export function invalidateApiCache(prefix) {
  for (const key of responseCache.keys()) {
    if (!prefix || key.includes(prefix)) {
      responseCache.delete(key);
    }
  }
}

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

  const isGet = method === 'GET' && !options.body;
  const cacheKey = isGet ? `${fullUrl}:${token || ''}` : null;

  // Mutations invalidate overlapping cached reads so lists stay fresh
  if (method !== 'GET') {
    invalidateApiCache(cleanPath.split('?')[0]);
  }

  // Serve fresh client-side cache for cacheable GETs
  if (isGet && CACHEABLE_GET_PREFIXES.some(p => cleanPath.startsWith(p))) {
    const cached = cacheKey ? getCachedResponse(cacheKey) : null;
    if (cached) return cached;
  }

  // Deduplicate identical in-flight GET requests
  const dedupeKey = isGet ? cacheKey : null;

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
      const apiErr = new Error(d.message || `خطا در پردازش درخواست (${r.status})`);
      apiErr.data = d;
      apiErr.status = r.status;
      throw apiErr;
    }

    // Populate GET cache for cacheable prefixes
    if (isGet && CACHEABLE_GET_PREFIXES.some(p => cleanPath.startsWith(p))) {
      setCachedResponse(cacheKey, d);
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



