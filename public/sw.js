// Karovita Progressive Web App (PWA) Service Worker
// Version: 2.5.0

const CACHE_NAME_STATIC = 'karovita-static-v2.5.0';
const CACHE_NAME_RUNTIME = 'karovita-runtime-v2.5.0';
const CACHE_NAME_API = 'karovita-api-v2.5.0';

// Essential assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/karovita-logo.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/badge-72.svg',
  '/fonts/vazirmatn/vazirmatn.css',
  '/fonts/vazirmatn/Vazirmatn-Regular.woff2',
  '/fonts/vazirmatn/Vazirmatn-Medium.woff2',
  '/fonts/vazirmatn/Vazirmatn-Bold.woff2'
];

// Core API endpoints safe to cache for offline fallback
const CACHEABLE_API_PREFIXES = [
  '/api/pricing-config',
  '/api/rates',
  '/api/health',
  '/api/push/public-key'
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

  // B. API Requests: Network First -> Cache Fallback for GET requests
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'GET') {
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
    }
    // Non-GET API calls (POST/PUT/DELETE) bypass service worker caching directly
    return;
  }

  // C. Static Assets & Fonts (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME_RUNTIME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
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
