import express from 'express';
import jwt from 'jsonwebtoken';
import http from 'http';
import apiRoutes from '../server/routes';
import { db } from '../server/db';

const JWT_SECRET = process.env.APP_KEY || 'secret_key_owj_abri_123';

async function run() {
  console.log('=== اعتبارسنجی قابلیت فعال/غیرفعال‌سازی سرویس PWA و اعلان‌های وب ===\n');
  const app = express();
  app.use(express.json());
  app.use('/api', apiRoutes);

  const server = http.createServer(app);
  await new Promise<void>(r => server.listen(0, r));
  const url = `http://127.0.0.1:${(server.address() as any).port}`;

  try {
    let adminUser = db.users.find(u => u.role === 'admin') || db.createUser('09111273476', 'مدیر', 'ارشد');
    adminUser.role = 'admin';

    let normalUser = db.users.find(u => u.role === 'user') || db.createUser('09990000001', 'کاربر', 'عادی');
    normalUser.role = 'user';

    const adminToken = jwt.sign({ sub: adminUser.id }, JWT_SECRET, { expiresIn: '1h' });
    const userToken = jwt.sign({ sub: normalUser.id }, JWT_SECRET, { expiresIn: '1h' });

    async function req(m: string, p: string, tok?: string, body?: any) {
      const h: Record<string, string> = { 'Content-Type': 'application/json' };
      if (tok) h['Authorization'] = `Bearer ${tok}`;
      const res = await fetch(`${url}${p}`, { method: m, headers: h, body: body ? JSON.stringify(body) : undefined });
      let data: any = null;
      try { data = await res.json(); } catch (e) {}
      return { status: res.status, data };
    }

    let p = 0, f = 0;
    function check(d: string, cond: boolean) {
      if (cond) { console.log(`  ✅ [PASS] ${d}`); p++; }
      else { console.error(`  ❌ [FAIL] ${d}`); f++; }
    }

    // 1. Check initial status
    console.log('1. بررسی وضعیت اولیه:');
    const rInit = await req('GET', '/api/pwa/status');
    check('دریافت وضعیت سرویس PWA (GET /api/pwa/status)', rInit.status === 200 && rInit.data?.success === true);

    // Ensure service is enabled initially
    await req('POST', '/api/admin/pwa/toggle', adminToken, { enabled: true });
    const rKeyEnabled = await req('GET', '/api/push/public-key');
    check('دریافت کلید VAPID وقتی سرویس فعال است', rKeyEnabled.status === 200 && !!rKeyEnabled.data?.publicKey);

    // 2. Non-admin cannot toggle
    console.log('\n2. بررسی امنیت سطح دسترسی:');
    const rUserToggle = await req('POST', '/api/admin/pwa/toggle', userToken, { enabled: false });
    check('کاربر عادی نباید بتواند سرویس را فعال/غیرفعال کند (403)', rUserToggle.status === 403);

    // 3. Admin toggles service to DISABLED
    console.log('\n3. غیرفعال‌سازی سرویس توسط مدیر ارشد:');
    const rDisable = await req('POST', '/api/admin/pwa/toggle', adminToken, { enabled: false });
    check('پاسخ موفق غیرفعال‌سازی (POST /api/admin/pwa/toggle)', rDisable.status === 200 && rDisable.data?.enabled === false);

    const rStatusDisabled = await req('GET', '/api/pwa/status');
    check('وضعیت سرویس باید false باشد', rStatusDisabled.data?.enabled === false);

    // 4. Test behavior when disabled
    console.log('\n4. بررسی مسدود بودن وب‌پوش و سرویس‌ورکر در حالت غیرفعال:');
    const rKeyDisabled = await req('GET', '/api/push/public-key');
    check('دریافت کلید VAPID مسدود است (403)', rKeyDisabled.status === 403);

    const rSubDisabled = await req('POST', '/api/push/subscribe', userToken, {
      subscription: {
        endpoint: 'https://push.example.com/test',
        keys: { p256dh: 'test', auth: 'test' }
      }
    });
    check('ثبت اشتراک مسدود است (403)', rSubDisabled.status === 403);

    const rTestDisabled = await req('POST', '/api/push/test', adminToken, { title: 'Test', body: 'Test' });
    check('ارسال اعلان آزمایشی مسدود است (403)', rTestDisabled.status === 403);

    const rBroadcastDisabled = await req('POST', '/api/admin/push/broadcast', adminToken, { title: 'Broadcast', body: 'Test' });
    check('ارسال اعلان همگانی مسدود است (403)', rBroadcastDisabled.status === 403);

    const rSubscribers = await req('GET', '/api/admin/push/subscribers', adminToken);
    check('اطلاعات سابسکرایبرها وضعیت enabled=false را منعکس می‌کند', rSubscribers.status === 200 && rSubscribers.data?.enabled === false);

    // 5. Admin toggles service back to ENABLED
    console.log('\n5. فعال‌سازی مجدد سرویس توسط مدیر:');
    const rEnable = await req('POST', '/api/admin/pwa/toggle', adminToken, { enabled: true });
    check('پاسخ موفق فعال‌سازی (POST /api/admin/pwa/toggle)', rEnable.status === 200 && rEnable.data?.enabled === true);

    const rStatusEnabled = await req('GET', '/api/pwa/status');
    check('وضعیت سرویس باید true باشد', rStatusEnabled.data?.enabled === true);

    const rKeyReEnabled = await req('GET', '/api/push/public-key');
    check('کلید VAPID مجدداً فعال است (200)', rKeyReEnabled.status === 200 && !!rKeyReEnabled.data?.publicKey);

    const rSubscribersEnabled = await req('GET', '/api/admin/push/subscribers', adminToken);
    check('اطلاعات سابسکرایبرها وضعیت enabled=true را منعکس می‌کند', rSubscribersEnabled.status === 200 && rSubscribersEnabled.data?.enabled === true);

    console.log(`\nنتیجه نهایی: ${p} تست موفق، ${f} خطا.`);
    if (f > 0) process.exit(1);
  } finally {
    server.close();
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});