// Karovita PWA & Push Notification Service

const DEFAULT_VAPID_PUBLIC_KEY = 'BHdSuUxPHRePsmhhF6y6cGsfHCFraLs8owiXYy4duof6yg2GRWwIn99fC-dITNwp_Bve5bFo_YXVYEDQ-HxYiNU';

function urlBase64ToUint8Array(base64String) {
  const str = (typeof base64String === 'string' && base64String.trim().length > 10) 
    ? base64String.trim() 
    : DEFAULT_VAPID_PUBLIC_KEY;
    
  try {
    const padding = '='.repeat((4 - (str.length % 4)) % 4);
    const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (e) {
    console.warn('[PWA] Error converting base64 VAPID key with provided string, falling back to default key:', e);
    const padding = '='.repeat((4 - (DEFAULT_VAPID_PUBLIC_KEY.length % 4)) % 4);
    const base64 = (DEFAULT_VAPID_PUBLIC_KEY + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

let deferredInstallPrompt = null;
const installListeners = new Set();
const onlineListeners = new Set();
const pushStatusListeners = new Set();

/**
 * Get Master PWA & Web Push Service Status
 */
export async function getPwaStatus() {
  try {
    const res = await fetch('/api/pwa/status?_t=' + Date.now(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('[PWA] Error checking master PWA status:', e);
  }
  return { success: true, enabled: true };
}

/**
 * Unregister all active Service Workers in browser and clear caches
 */
export async function unregisterAllServiceWorkers() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      try {
        if (reg.pushManager) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            await sub.unsubscribe().catch(() => {});
          }
        }
      } catch (subErr) {
        console.warn('[PWA] Error unsubscribing worker:', subErr);
      }
      await reg.unregister();
    }

    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (cacheErr) {
        console.warn('[PWA] Error clearing caches:', cacheErr);
      }
    }

    console.log('[PWA] All service worker registrations and caches cleaned up successfully.');
    return true;
  } catch (err) {
    console.warn('[PWA] Error unregistering service workers:', err);
    return false;
  }
}

/**
 * Register Service Worker
 */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported in this browser environment.');
    return null;
  }

  // Check if PWA service is globally enabled by administrator
  try {
    const status = await getPwaStatus();
    if (status && status.enabled === false) {
      console.log('[PWA] PWA service is globally disabled by admin. Cleaning up active workers.');
      await unregisterAllServiceWorkers();
      return null;
    }
  } catch {
    // Proceed if status check fails
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[PWA] Service Worker registered with scope:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New update available. Reloading or activating...');
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.warn('[PWA] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Capture PWA Install Prompt
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installListeners.forEach((listener) => listener(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installListeners.forEach((listener) => listener(false));
    console.log('[PWA] App successfully installed to device home screen/desktop.');
  });

  window.addEventListener('online', () => {
    onlineListeners.forEach((listener) => listener(true));
  });

  window.addEventListener('offline', () => {
    onlineListeners.forEach((listener) => listener(false));
  });
}

/**
 * Subscribe to online/offline network changes
 */
export function onNetworkStatusChange(callback) {
  onlineListeners.add(callback);
  return () => onlineListeners.delete(callback);
}

/**
 * Check if app is currently online
 */
export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Subscribe to PWA Installability changes
 */
export function onInstallPromptChange(callback) {
  installListeners.add(callback);
  callback(!!deferredInstallPrompt);
  return () => installListeners.delete(callback);
}

/**
 * Trigger PWA installation prompt
 */
export async function promptPwaInstall() {
  if (!deferredInstallPrompt) {
    return { outcome: 'dismissed', message: 'نصب اپلیکیشن در این مرورگر در دسترس نیست یا قبلاً نصب شده است.' };
  }

  deferredInstallPrompt.prompt();
  const choiceResult = await deferredInstallPrompt.userChoice;
  if (choiceResult.outcome === 'accepted') {
    deferredInstallPrompt = null;
    installListeners.forEach((listener) => listener(false));
  }
  return choiceResult;
}

/**
 * Check Push Notification Support & Current Status
 */
export async function getPushNotificationStatus() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { supported: false, permission: 'unsupported', isSubscribed: false };
  }

  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return {
        supported: true,
        permission,
        isSubscribed: false,
        subscription: null,
      };
    }
    const subscription = await registration.pushManager.getSubscription();
    return {
      supported: true,
      permission,
      isSubscribed: !!subscription,
      subscription: subscription ? subscription.toJSON() : null,
    };
  } catch (err) {
    return {
      supported: true,
      permission,
      isSubscribed: false,
      error: err.message,
    };
  }
}

/**
 * Subscribe Device to Web Push
 */
export async function subscribeToPushNotifications(token = null) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('مرورگر شما از اعلان‌های وب (Push Notifications) پشتیبانی نمی‌کند.');
  }

  // Check if PWA service is globally enabled
  const pwaStatus = await getPwaStatus();
  if (pwaStatus && pwaStatus.enabled === false) {
    throw new Error('سرویس PWA و ارسال اعلان‌های وب توسط مدیریت سامانه غیرفعال شده است.');
  }

  // Request notification permission from user
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('مجوز دسترسی به اعلان‌ها توسط کاربر یا مرورگر تایید نشد.');
  }

  // Fetch VAPID public key from backend (with safe fallback)
  let publicKey = DEFAULT_VAPID_PUBLIC_KEY;
  try {
    const resKey = await fetch('/api/push/public-key?_t=' + Date.now(), { cache: 'no-store' });
    if (resKey.ok) {
      const data = await resKey.json().catch(() => ({}));
      if (data && typeof data.publicKey === 'string' && data.publicKey.trim().length > 10) {
        publicKey = data.publicKey.trim();
      }
    }
  } catch (keyErr) {
    console.warn('[PWA] Using default VAPID key due to server fetch failure:', keyErr);
  }

  const convertedVapidKey = urlBase64ToUint8Array(publicKey);

  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    registration = await registerServiceWorker();
  }
  if (!registration) {
    throw new Error('سرویس‌ورکر فعال برای ثبت اشتراک در دسترس نیست.');
  }

  // Wait if it's currently installing
  if (registration.installing) {
    await new Promise((resolve) => {
      const worker = registration.installing;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated' || worker.state === 'installed') resolve();
      });
      setTimeout(resolve, 1500);
    });
  }

  // Subscribe via browser PushManager
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });

  // Sync subscription with backend database
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const syncRes = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      userAgent: navigator.userAgent,
    }),
  });

  if (!syncRes.ok) {
    const errData = await syncRes.json().catch(() => ({}));
    throw new Error(errData.message || 'ثبت اشتراک اعلان در سرور با خطا مواجه شد.');
  }

  return { success: true, subscription: subscription.toJSON() };
}

/**
 * Unsubscribe Device from Web Push
 */
export async function unsubscribeFromPushNotifications(token = null) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Tell backend to remove
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers,
        body: JSON.stringify({ endpoint }),
      }).catch(() => {});
    }
    return true;
  } catch (err) {
    console.error('[PWA] Unsubscribe error:', err);
    throw err;
  }
}

/**
 * Trigger a live test push notification
 */
export async function sendTestPushNotification(token = null, title = '', body = '') {
  const notifTitle = title || 'کارویتا | تست اعلان سیستم';
  const notifBody = body || 'اتصال اعلان‌های وب PWA کارویتا روی دستگاه شما فعال و پایدار است. ✨';

  // 1. Trigger backend recording if available
  let backendData = null;
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/push/test', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: notifTitle, body: notifBody }),
    });
    backendData = await res.json().catch(() => null);
  } catch (err) {
    console.warn('[PWA] Server test route warning:', err);
  }

  // 2. Trigger native Notification on the device
  if (typeof window !== 'undefined' && 'Notification' in window) {
    let currentPerm = Notification.permission;
    if (currentPerm === 'default') {
      currentPerm = await Notification.requestPermission();
    }

    if (currentPerm === 'granted') {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.showNotification) {
            await registration.showNotification(notifTitle, {
              body: notifBody,
              icon: '/icon-192.svg',
              badge: '/badge-72.svg',
              dir: 'rtl',
              lang: 'fa',
              tag: `test-push-${Date.now()}`,
              data: { url: '/' },
              actions: [
                { action: 'open', title: 'مشاهده' },
                { action: 'close', title: 'بستن' }
              ]
            });
            return { success: true, message: 'اعلان با موفقیت روی دستگاه شما نمایش داده شد! 🔔' };
          }
        } catch (swErr) {
          console.warn('[PWA] SW showNotification failed, using fallback:', swErr);
        }
      }

      try {
        new Notification(notifTitle, {
          body: notifBody,
          icon: '/icon-192.svg',
          dir: 'rtl',
          lang: 'fa'
        });
        return { success: true, message: 'اعلان با موفقیت روی دستگاه شما نمایش داده شد! 🔔' };
      } catch (nErr) {}
    } else if (currentPerm === 'denied') {
      throw new Error('مجوز ارسال اعلان در مرورگر شما مسدود (Block) است. لطفاً از علامت قفل کنار آدرس‌بار، گزینه Notifications را روی Allow قرار دهید.');
    }
  }

  return backendData || { success: true, message: 'اعلان آزمایشی به دستگاه ارسال گردید.' };
}
