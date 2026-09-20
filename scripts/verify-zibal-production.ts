import { db } from '../server/db';
import { getZibalConfig, initiateZibalPayment } from '../server/zibalService';
import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import apiRoutes from '../server/routes';

const JWT_SECRET = process.env.APP_KEY || 'secret_key_owj_abri_123';

async function runTests() {
  console.log('=== تست اعتبارسنجی درگاه شاپرک زیبال در حالت پروداکشن ===\n');
  const app = express();
  app.use(express.json());
  app.use('/api', apiRoutes);

  const server = http.createServer(app);
  await new Promise<void>(r => server.listen(0, r));
  const url = `http://127.0.0.1:${(server.address() as any).port}`;

  let passed = 0;
  let failed = 0;

  function check(desc: string, cond: boolean) {
    if (cond) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  async function req(method: string, path: string, token?: string, body?: any) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${url}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data: any = null;
    try { data = await res.json(); } catch (e) {}
    return { status: res.status, data };
  }

  try {
    const adminUser = db.users.find(u => u.role === 'admin') || db.createUser('09120000001', 'مدیر', 'سامانه');
    adminUser.role = 'admin';
    const normalUser = db.users.find(u => u.role === 'user') || db.createUser('09120000002', 'کاربر', 'عادی');
    normalUser.role = 'user';

    const adminToken = jwt.sign({ sub: adminUser.id }, JWT_SECRET, { expiresIn: '1h' });
    const userToken = jwt.sign({ sub: normalUser.id }, JWT_SECRET, { expiresIn: '1h' });

    // 1. پیش‌فرض غیرفعال بودن سندباکس
    console.log('1. بررسی پیش‌فرض غیرفعال بودن سندباکس:');
    const initialConfig = getZibalConfig();
    check('حالت سندباکس به صورت پیش‌فرض غیرفعال است (sandbox: false)', initialConfig.sandbox === false);

    // 2. اطلاعات درگاه بدون IP
    console.log('\n2. بررسی استعلام اطلاعات درگاه (/api/payments/gateway-info):');
    const rInfo = await req('GET', '/api/payments/gateway-info', userToken);
    check('استعلام اطلاعات درگاه موفقیت‌آمیز است', rInfo.status === 200);
    check('وضعیت درگاه پروداکشن است (is_live: true, sandbox: false)', rInfo.data?.data?.is_live === true && rInfo.data?.data?.sandbox === false);
    check('آی‌پی سرور (server_ip) کاملاً از خروجی حذف شده است', rInfo.data?.data?.server_ip === undefined);
    check('کد مرچنت پویا شناسایی شده است', rInfo.data?.data?.merchant_configured === true);

    // 3. دریافت تنظیمات در ادمین
    console.log('\n3. بررسی دریافت تنظیمات درگاه توسط مدیر (/api/admin/gateways/settings):');
    const rSettings = await req('GET', '/api/admin/gateways/settings', adminToken);
    check('دریافت تنظیمات ادمین موفقیت‌آمیز است', rSettings.status === 200);
    check('آی‌پی سرور در تنظیمات پنل مدیریت وجود ندارد', rSettings.data?.data?.server_ip === undefined && rSettings.data?.data?.zibal?.server_ip === undefined);
    check(`مرچنت کد خوانده شده از دیتابیس: ${rSettings.data?.data?.zibal?.merchant}`, Boolean(rSettings.data?.data?.zibal?.merchant));

    // 4. ذخیره پویا مرچنت و سندباکس در پنل مدیریت
    console.log('\n4. تست ذخیره و اعمال پویای تنظیمات از پنل مدیریت:');
    const originalMerchant = db.gatewaySettings?.zibal?.merchant;
    const testMerchant = 'test-merchant-production-12345';

    const rPut = await req('PUT', '/api/admin/gateways/settings', adminToken, {
      zibal: {
        merchant: testMerchant,
        sandbox: true,
        enabled: true,
      }
    });
    check('ذخیره تنظیمات موفقیت‌آمیز است', rPut.status === 200);
    check('مرچنت کد جدید در دیتابیس ذخیره شد', db.gatewaySettings.zibal.merchant === testMerchant);
    check('تاگل سندباکس به صورت پویا روشن شد', db.gatewaySettings.zibal.sandbox === true);

    // بازگردانی به پروداکشن
    await req('PUT', '/api/admin/gateways/settings', adminToken, {
      zibal: {
        merchant: originalMerchant || '6a5f37d32884aa3809632821',
        sandbox: false,
        enabled: true,
      }
    });
    check('درگاه با موفقیت به حالت پروداکشن واقعی بازگردانده شد', db.gatewaySettings.zibal.sandbox === false);

    // 5. اعتبارسنجی در صورت خالی بودن مرچنت
    console.log('\n5. تست رفتار درگاه در صورت خالی بودن کد مرچنت:');
    db.gatewaySettings.zibal.merchant = '';
    const mockOrder = { id: 9991, order_number: 'TEST-01', amount: 50000 } as any;
    const emptyRes = await initiateZibalPayment(mockOrder, normalUser, 'http://localhost:3000');
    check('در صورت عدم ثبت مرچنت خطای معتبر ارسال شده و به هاردکد بازنمی‌گردد', emptyRes.success === false && emptyRes.resultCode === 102);

    // بازیابی مرچنت اصلی
    db.gatewaySettings.zibal.merchant = originalMerchant || '6a5f37d32884aa3809632821';
    db.gatewaySettings.zibal.sandbox = false;
    db.save();

    // 6. بررسی هلث چک
    console.log('\n6. بررسی Health Check:');
    const rHealth = await req('GET', '/api/admin/gateways/health', adminToken);
    check('دریافت سلامت درگاه موفقیت‌آمیز است', rHealth.status === 200);
    check('فیلد server_ip از خروجی Health Check حذف شده است', rHealth.data?.zibal?.server_ip === undefined);
    check('وضعیت سلامت نشان‌دهنده پروداکشن با مرچنت معتبر است', rHealth.data?.zibal?.sandbox === false && rHealth.data?.zibal?.merchant_configured === true);

    console.log(`\n======================================================`);
    console.log(`نتیجه نهایی: ${passed} موفق | ${failed} ناموفق`);
    console.log(`======================================================\n`);
  } finally {
    server.close();
  }

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('خطای تست:', err);
  process.exit(1);
});

