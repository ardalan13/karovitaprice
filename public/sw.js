// Karovita Progressive Web App (PWA) Service Worker
// Version: 2.7.0

const CACHE_NAME_STATIC = 'karovita-static-v2.7.0';
const CACHE_NAME_RUNTIME = 'karovita-runtime-v2.7.0';
const CACHE_NAME_API = 'karovita-api-v2.7.0';

// Essential assets to precache on install
// Note: only the single variable font is precached (~108KB);
// static weights were removed in favor of Vazirmatn[wght].woff2
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/karovita-logo.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/badge-72.svg',
  '/fonts/vazirmatn/vazirmatn.css',
  '/fonts/vazirmatn/Vazirmatn[wght].woff2'
];

// Core API endpoints safe to cache for offline fallback
// Note: cacheable GET responses now carry X-Karovita-Cache headers from server
const CACHEABLE_API_PREFIXES = [
  '/api/configurator/data',
  '/api/packages',
  '/api/pricing-config',
  '/api/rates',
  '/api/health'
];

// -------------------------------------------------------------
// 1. Install Event: Precache Static Shell
// -------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME_STATIC).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache partial error (non-blocking):', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// -------------------------------------------------------------
// 2. Activate Event: Clean up outdated caches & take control
// -------------------------------------------------------------
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME_STATIC, CACHE_NAME_RUNTIME, CACHE_NAME_API];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!currentCaches.includes(key)) {
            console.log('[SW] Deleting stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// -------------------------------------------------------------
// 3. Fetch Event: Multi-tier Caching Strategies
// -------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore chrome-extension / non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // A. Navigation Requests (HTML Pages / Routes): Network First -> Fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME_STATIC).then((cache) => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match('/index.html') || await caches.match('/');
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="fa" dir="rtl">
            <head><meta charset="utf-8"/><title>کارویتا - آفلاین</title><style>body{font-family:sans-serif;text-align:center;padding:40px;background:#0f172a;color:#f8fafc;}</style></head>
            <body>
              <h2>ارتباط اینترنت برقرار نیست</h2>
              <p>شما در حالت آفلاین هستید. لطفاً اتصال اینترنت خود را بررسی نمایید.</p>
              <button onclick="location.reload()" style="background:#0284c7;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">تلاش مجدد</button>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // B. API Requests
  if (url.pathname.startsWith('/api/')) {
    // 1. NEVER cache admin, auth, push, PWA status, tickets or transactional routes
    const isSensitiveApi = 
      url.pathname.startsWith('/api/admin/') ||
      url.pathname.startsWith('/api/pwa/') ||
      url.pathname.startsWith('/api/push/') ||
      url.pathname.startsWith('/api/auth/') ||
      url.pathname.startsWith('/api/tickets') ||
      url.pathname.startsWith('/api/orders') ||
      url.pathname.startsWith('/api/users');

    if (isSensitiveApi || request.method !== 'GET') {
      // Direct network bypass - no service worker interception or caching
      return;
    }

    // 2. Only cache safe public read-only endpoints explicitly listed in CACHEABLE_API_PREFIXES
    const isCacheable = CACHEABLE_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
    if (!isCacheable) {
      return;
    }

    // Network First -> Cache Fallback for safe public GET requests
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME_API).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            // Add a custom header indicating cached offline data
            const newHeaders = new Headers(cached.headers);
            newHeaders.set('X-Karovita-Offline-Cache', 'true');
            return new Response(cached.body, {
              status: cached.status,
              statusText: cached.statusText,
              headers: newHeaders
            });
          }
          // If API is not cached and offline
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'ارتباط با سرور برقرار نشد. شما در حالت آفلاین هستید.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }
          );
        })
    );
    return;
  }

  // C. Static Assets & Fonts (Stale-While-Revalidate with guaranteed Response fallback)
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME_RUNTIME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      } catch (fetchErr) {
        if (cached) {
          return cached;
        }
        return new Response('', { status: 408, statusText: 'Request Timeout or Offline' });
      }
    })()
  );
});

// -------------------------------------------------------------
// 4. Push Notification Event Handler
// -------------------------------------------------------------
self.addEventListener('push', (event) => {
  let data = {
    title: 'کارویتا | اعلان جدید',
    body: 'یک پیام جدید از سامانه کارویتا دریافت شد.',
    icon: '/icon-192.svg',
    badge: '/badge-72.svg',
    url: '/',
    tag: 'karovita-general-alert',
    timestamp: Date.now()
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon || '/icon-192.svg',
    badge: data.badge || '/badge-72.svg',
    dir: 'rtl',
    lang: 'fa',
    tag: data.tag || `karovita-${Date.now()}`,
    data: {
      url: data.url || '/',
      timestamp: data.timestamp || Date.now(),
      ticketId: data.ticketId || null,
      customPayload: data.customPayload || null
    },
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'open', title: 'مشاهده' },
      { action: 'close', title: 'بستن' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// -------------------------------------------------------------
// 5. Notification Click & Action Handler
// -------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          if (client.url !== targetUrl && 'navigate' in client) {
            return client.navigate(targetUrl);
          }
          return client;
        }
      }
      // If no window is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// -------------------------------------------------------------
// 6. Push Subscription Change (Auto re-subscribe sync)
// -------------------------------------------------------------
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options).then((subscription) => {
      return fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      });
    })
  );
});

// -------------------------------------------------------------
// 7. Message Handler (for UI triggers)
// -------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
