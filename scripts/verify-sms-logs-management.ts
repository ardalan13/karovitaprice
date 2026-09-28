import { db } from '../server/db';
import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import apiRoutes from '../server/routes';

const JWT_SECRET = process.env.APP_KEY || 'secret_key_owj_abri_123';

async function runTests() {
  console.log('=== تست اعتبارسنجی مدیریت و حذف لاگ‌های پیامک ===\n');
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
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, data };
  }

  try {
    // Admin token
    const adminUser = db.users.find(u => u.role === 'admin') || db.createUser('09120000001', 'مدیر', 'سامانه');
    adminUser.role = 'admin';
    const normalUser = db.users.find(u => u.role === 'user') || db.createUser('09120000002', 'کاربر', 'عادی');
    normalUser.role = 'user';

    const adminToken = jwt.sign({ sub: adminUser.id }, JWT_SECRET, { expiresIn: '1h' });
    const normalToken = jwt.sign({ sub: normalUser.id }, JWT_SECRET, { expiresIn: '1h' });

    // Save initial logs to restore later
    const originalLogs = [...(db.smsLogs || [])];

    // Seed test logs
    db.smsLogs = [
      { id: 'SMS-TEST-1', mobile: '09111273476', message: 'کد تایید: 12345', status: 'sent', timestamp: '2026-09-20 10:00:00' } as any,
      { id: 'SMS-TEST-2', mobile: '09111273476', message: 'کد تایید: 67890', status: 'sent', timestamp: '2026-09-20 11:00:00' } as any,
      { id: 'SMS-TEST-3', mobile: '09120000000', message: 'کد تایید: 11111', status: 'failed', timestamp: '2026-09-20 12:00:00' } as any,
    ];

    // 1. GET logs
    console.log('1. دریافت لاگ‌های پیامک:');
    const rGet = await req('GET', '/api/admin/gateways/sms/logs?limit=200', adminToken);
    check('دریافت لیست لاگ‌ها موفقیت‌آمیز است (200)', rGet.status === 200);
    check('تعداد لاگ‌ها برابر ۳ است', Array.isArray(rGet.data?.data) && rGet.data.data.length === 3);
    check('کد OTP در پاسخ استخراج شده است', rGet.data?.data?.[0]?.code === '12345');

    // 2. DELETE single log
    console.log('\n2. حذف تکی یک لاگ پیامک:');
    const rDelOne = await req('DELETE', '/api/admin/gateways/sms/logs/SMS-TEST-2', adminToken);
    check('درخواست حذف تکی لاگ موفقیت‌آمیز است (200)', rDelOne.status === 200);
    check('پیام موفقیت‌آمیز برگردانده شد', rDelOne.data?.success === true);
    check('لاگ SMS-TEST-2 از آرایه لاگ‌ها حذف شد', db.smsLogs.length === 2 && !db.smsLogs.some(l => l.id === 'SMS-TEST-2'));

    // 3. POST clear all logs
    console.log('\n3. پاکسازی کلیه لاگ‌های پیامک:');
    const rClear = await req('POST', '/api/admin/gateways/sms/logs/clear', adminToken);
    check('درخواست پاکسازی لاگ‌ها موفقیت‌آمیز است (200)', rClear.status === 200);
    check('پیام پاکسازی کلیه لاگ‌ها صحیح است', rClear.data?.success === true);
    check('آرایه smsLogs کاملاً خالی شد', db.smsLogs.length === 0);

    // 4. Verify GET returns 0 logs
    const rGetEmpty = await req('GET', '/api/admin/gateways/sms/logs', adminToken);
    check('پس از پاکسازی، لیست لاگ‌ها خالی است', rGetEmpty.data?.data?.length === 0 && rGetEmpty.data?.total === 0);

    // 5. Normal user forbidden
    console.log('\n4. بررسی امنیت دسترسی کاربران عادی:');
    const rForbidden = await req('POST', '/api/admin/gateways/sms/logs/clear', normalToken);
    check('کاربر غیرادمین دسترسی به پاکسازی لاگ‌ها ندارد -> 403', rForbidden.status === 403);

    // Restore original logs
    db.smsLogs = originalLogs;
    db.save();

  } catch (err: any) {
    console.error('Unhandled test error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\nنتیجه تست‌ها: ${passed} موفق، ${failed} ناموفق`);
  if (failed > 0) process.exit(1);
}

runTests();
