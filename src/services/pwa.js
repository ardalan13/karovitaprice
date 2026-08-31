// Karovita PWA & Push Notification Service

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

let deferredInstallPrompt = null;
const installListeners = new Set();
const onlineListeners = new Set();
const pushStatusListeners = new Set();

/**
 * Register Service Worker
 */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported in this browser environment.');
    return null;
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

  const permission = Notification.permission;

  try {
    const registration = await navigator.serviceWorker.ready;
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

  // Request notification permission from user
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('مجوز دسترسی به اعلان‌ها توسط کاربر یا مرورگر تایید نشد.');
  }

  // Fetch VAPID public key from backend
  const resKey = await fetch('/api/push/public-key');
  if (!resKey.ok) {
    throw new Error('دریافت کلید ارتباط با سرور اعلان‌ها ناموفق بود.');
  }
  const { publicKey } = await resKey.json();
  if (!publicKey) {
    throw new Error('کلید سرور اعلان‌ها خالی است.');
  }

  const convertedVapidKey = urlBase64ToUint8Array(publicKey);
  const registration = await navigator.serviceWorker.ready;

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
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/push/test', {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, body }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'خطا در ارسال اعلان آزمایشی');
  }
  return data;
}
