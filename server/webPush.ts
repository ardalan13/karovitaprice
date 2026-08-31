import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

const VAPID_STORAGE_FILE = path.join(process.cwd(), 'data', 'vapid.json');

interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

let vapidKeys: VapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

// Initialize VAPID Keys
function initVapidKeys(): VapidKeys {
  if (vapidKeys.publicKey && vapidKeys.privateKey) {
    return vapidKeys;
  }

  try {
    const dir = path.dirname(VAPID_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(VAPID_STORAGE_FILE)) {
      const content = fs.readFileSync(VAPID_STORAGE_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      if (loaded.publicKey && loaded.privateKey) {
        vapidKeys = loaded;
        return vapidKeys;
      }
    }

    // Generate new VAPID keys if none exist
    const generated = webpush.generateVAPIDKeys();
    vapidKeys = {
      publicKey: generated.publicKey,
      privateKey: generated.privateKey,
    };

    fs.writeFileSync(VAPID_STORAGE_FILE, JSON.stringify(vapidKeys, null, 2), 'utf-8');
    console.log('[WebPush] Generated and saved new VAPID keys');
  } catch (err) {
    console.error('[WebPush] Error loading/generating VAPID keys:', err);
    // Fallback in-memory generation
    const generated = webpush.generateVAPIDKeys();
    vapidKeys = {
      publicKey: generated.publicKey,
      privateKey: generated.privateKey,
    };
  }

  return vapidKeys;
}

// Apply VAPID Details
try {
  const keys = initVapidKeys();
  webpush.setVapidDetails(
    'mailto:support@karovita.ir',
    keys.publicKey,
    keys.privateKey
  );
  console.log('[WebPush] VAPID details configured successfully');
} catch (err) {
  console.error('[WebPush] Failed to set VAPID details:', err);
}

export function getVapidPublicKey(): string {
  if (!vapidKeys.publicKey) {
    initVapidKeys();
  }
  return vapidKeys.publicKey;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  ticketId?: number | string;
  data?: Record<string, any>;
  requireInteraction?: boolean;
}

/**
 * Send a push notification to a single subscriber
 */
export async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushNotificationPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const stringPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.svg',
      badge: payload.badge || '/badge-72.svg',
      url: payload.url || '/',
      tag: payload.tag || `karovita-${Date.now()}`,
      ticketId: payload.ticketId,
      timestamp: Date.now(),
      requireInteraction: payload.requireInteraction || false,
    });

    const response = await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      stringPayload,
      {
        TTL: 24 * 60 * 60, // 24 hours
        urgency: 'high',
      }
    );

    return { success: true, statusCode: response.statusCode };
  } catch (err: any) {
    console.warn('[WebPush] Error sending push notification:', err?.message || err);
    return {
      success: false,
      statusCode: err?.statusCode,
      error: err?.message || 'Push delivery failed',
    };
  }
}

/**
 * Broadcast notification to multiple subscribers
 */
export async function broadcastWebPush(
  subscriptions: Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>,
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const promises = subscriptions.map(async (sub) => {
    const res = await sendWebPush(sub, payload);
    if (res.success) {
      sent++;
    } else {
      failed++;
    }
  });

  await Promise.all(promises);
  return { sent, failed };
}
