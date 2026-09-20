import { db } from '../server/db';
import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import apiRoutes from '../server/routes';

const JWT_SECRET = process.env.APP_KEY || 'secret_key_owj_abri_123';

async function runTests() {
  console.log('=== تست بررسی حذف اشتراک آزمایشی و فعال‌سازی اشتراک خریداری‌شده جدید ===\n');

  const app = express();
  app.use(express.json());
  app.use('/api', apiRoutes);

  const server = http.createServer(app);
  await new Promise<void>(r => server.listen(0, r));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

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
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    let data: any = null;
    try {
      data = await res.json();
    } catch {}
    return { status: res.status, data };
  }

  function makeToken(user: any) {
    return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '2h' });
  }

  console.log('۱. تست کاربری با اشتراک آزمایشی فعال که اشتراک جدید خریداری می‌کند:');
  const testUser1 = db.createUser('09121112233', 'کاربر تستی ۱');
  testUser1.onboarding_step = 3;
  testUser1.onboarding_completed_at = new Date().toISOString();
  db.save();

  const tokenUser1 = makeToken(testUser1);
  const trialModules = ['activities', 'calendar', 'contacts'];
  const trialSub1 = db.createERPSubscription(testUser1.id, null, trialModules, 1, 'monthly', 'trial', 5);

  check('اشتراک آزمایشی کاربر فعال شد', trialSub1.status === 'active' && trialSub1.source === 'trial');
  const subsBeforeBuy1 = db.subscriptions.filter(s => s.user_id === testUser1.id);
  check('کاربر در دیتابیس اشتراک آزمایشی دارد', subsBeforeBuy1.length === 1 && subsBeforeBuy1[0].source === 'trial');

  const purchasedModules1 = ['sale', 'crm'];
  const order1 = db.createERPOrder(testUser1.id, purchasedModules1, 3, '6_months');
  check('سفارش خرید اشتراک جدید در سامانه ثبت شد', Boolean(order1 && order1.id));

  const adminUser = db.users.find(u => u.role === 'admin') || db.createUser('09111273476', 'ادمین');
  adminUser.role = 'admin';
  const adminToken = makeToken(adminUser);

  const rPay1 = await req('PUT', `/admin/orders/${order1.id}`, adminToken, {
    status: 'paid',
    reference_id: 'SHAPARAK-TEST-REF-1001'
  });
  check('سفارش به وضعیت پرداخت‌شده تغییر یافت', rPay1.status === 200);

  const subsAfterBuy1 = db.subscriptions.filter(s => s.user_id === testUser1.id);
  check('اشتراک آزمایشی قبلی کاربر به طور کامل حذف شد', !subsAfterBuy1.some(s => s.source === 'trial' || s.title?.includes('آزمایشی')));
  check('کاربر دقیقاً یک اشتراک دارد (اشتراک جدید خریداری‌شده)', subsAfterBuy1.length === 1);

  const newSub1 = subsAfterBuy1[0];
  check('وضعیت اشتراک جدید active است', newSub1?.status === 'active');
  check('منبع اشتراک purchase است', newSub1?.source === 'purchase');
  check('دوره زمانی اشتراک جدید دقیقاً 6_months است', newSub1?.billing_period === '6_months');
  check('تعداد کاربران اشتراک جدید دقیقاً 3 است', newSub1?.user_count === 3);
  check('ماژول‌ها دقیقاً ماژول‌های خریداری‌شده هستند و ماژول‌های آزمایشی تداخل نکرده‌اند', 
    Array.isArray(newSub1?.module_ids) &&
    newSub1.module_ids.length === purchasedModules1.length &&
    purchasedModules1.every(m => newSub1.module_ids.includes(m)) &&
    !newSub1.module_ids.includes('activities')
  );

  const rStatus1 = await req('GET', '/onboarding', tokenUser1);
  check('در خروجی وضعیت کاربر has_used_trial برابر true است', rStatus1.data?.has_used_trial === true);
  check('در خروجی وضعیت کاربر has_subscription برابر true است', rStatus1.data?.has_subscription === true);
  check('در خروجی وضعیت کاربر trial_subscription خالی است', !rStatus1.data?.trial_subscription);

  console.log('\n۲. تست کاربری با اشتراک آزمایشی منقضی یا غیرفعال که اشتراک جدید خریداری می‌کند:');
  const testUser2 = db.createUser('09129998877', 'کاربر تستی ۲');
  testUser2.onboarding_step = 3;
  testUser2.onboarding_completed_at = new Date().toISOString();
  db.save();

  const tokenUser2 = makeToken(testUser2);
  const expiredTrial = db.createERPSubscription(testUser2.id, null, ['survey', 'loyalty'], 1, 'monthly', 'trial', -2);
  expiredTrial.status = 'expired';
  db.save();

  check('اشتراک آزمایشی منقضی در دیتابیس وجود دارد', expiredTrial.status === 'expired' && expiredTrial.source === 'trial');

  const purchasedModules2 = ['crm', 'sale', 'project'];
  const order2 = db.createERPOrder(testUser2.id, purchasedModules2, 5, 'yearly');
  check('سفارش خرید سالانه در سیستم ثبت شد', Boolean(order2 && order2.id));

  const rPay2 = await req('PUT', `/admin/orders/${order2.id}`, adminToken, {
    status: 'paid',
    reference_id: 'SHAPARAK-TEST-REF-2002'
  });
  check('سفارش دوم پرداخت و تسویه شد', rPay2.status === 200);

  const subsAfterBuy2 = db.subscriptions.filter(s => s.user_id === testUser2.id);
  check('اشتراک آزمایشی منقضی قبلی کاربر ۲ پاک شد', !subsAfterBuy2.some(s => s.source === 'trial' || s.title?.includes('آزمایشی')));
  check('کاربر ۲ اکنون یک اشتراک معتبر خریداری‌شده دارد', subsAfterBuy2.length === 1 && subsAfterBuy2[0].source === 'purchase');

  const newSub2 = subsAfterBuy2[0];
  check('وضعیت اشتراک کاربر ۲ فعال است', newSub2.status === 'active');
  check('دوره اشتراک کاربر ۲ دقیقاً yearly است', newSub2.billing_period === 'yearly');
  check('تعداد کاربر اشتراک کاربر ۲ دقیقاً 5 است', newSub2.user_count === 5);
  check('ماژول‌های اشتراک کاربر ۲ دقیقاً crm, sale, project هستند', 
    Array.isArray(newSub2.module_ids) &&
    newSub2.module_ids.length === 3 &&
    purchasedModules2.every(m => newSub2.module_ids.includes(m)) &&
    !newSub2.module_ids.includes('survey')
  );

  const rStatus2 = await req('GET', '/onboarding', tokenUser2);
  check('در خروجی وضعیت کاربر ۲ has_used_trial برابر true است', rStatus2.data?.has_used_trial === true);
  check('در خروجی وضعیت کاربر ۲ has_subscription برابر true است', rStatus2.data?.has_subscription === true);
  check('در خروجی وضعیت کاربر ۲ trial_subscription خالی است', !rStatus2.data?.trial_subscription);

  // Clean up test data
  db.subscriptions = db.subscriptions.filter(s => s.user_id !== testUser1.id && s.user_id !== testUser2.id);
  db.orders = db.orders.filter(o => o.user_id !== testUser1.id && o.user_id !== testUser2.id);
  db.users = db.users.filter(u => u.id !== testUser1.id && u.id !== testUser2.id);
  db.save();

  server.close();

  console.log(`\n======================================================`);
  console.log(`نتیجه تست‌ها: ${passed} موفق | ${failed} ناموفق`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
