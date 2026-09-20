import express from 'express';
import jwt from 'jsonwebtoken';
import http from 'http';
import apiRoutes from '../server/routes';
import { db } from '../server/db';

const JWT_SECRET = process.env.APP_KEY || 'secret_key_owj_abri_123';

async function run() {
  console.log('--- اعتبارسنجی جامع سطح دسترسی نقش پشتیبان ---');
  const app = express();
  app.use(express.json());
  app.use('/api', apiRoutes);
  app.use('/admin', apiRoutes);

  const server = http.createServer(app);
  await new Promise<void>(r => server.listen(0, r));
  const url = `http://127.0.0.1:${(server.address() as any).port}`;

  try {
    let normalUser = db.users.find(u => u.role === 'user') || db.createUser('09990000001', 'کاربر', 'عادی');
    normalUser.role = 'user';

    let supportUser = db.users.find(u => u.role === 'support') || db.createUser('09990000002', 'پشتیبان', 'فنی');
    supportUser.role = 'support';

    const normalToken = jwt.sign({ sub: normalUser.id }, JWT_SECRET, { expiresIn: '1h' });
    const supportToken = jwt.sign({ sub: supportUser.id }, JWT_SECRET, { expiresIn: '1h' });

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

    console.log('\n1. دسترسی‌های مجاز پشتیبان:');
    const rDash = await req('GET', '/api/dashboard', supportToken);
    check('دریافت داشبورد', rDash.status === 200 && rDash.data?.user?.role === 'support');

    const rBadge = await req('GET', '/api/tickets/badge', supportToken);
    check('کانتر اعلان تیکت‌ها', rBadge.status === 200 && typeof rBadge.data?.count === 'number');

    const rTickets = await req('GET', '/api/admin/tickets', supportToken);
    check('دریافت لیست تیکت‌ها', rTickets.status === 200 && Array.isArray(rTickets.data?.data));

    const rStaff = await req('GET', '/api/admin/support-staff', supportToken);
    check('دریافت لیست کارشناسان پشتیبانی', rStaff.status === 200);

    const rSubs = await req('GET', '/api/admin/subscriptions', supportToken);
    check('دریافت لیست اشتراک‌ها (/api/admin/subscriptions)', rSubs.status === 200 && Array.isArray(rSubs.data?.data));

    const rSubsDirect = await req('GET', '/admin/subscriptions', supportToken);
    check('دریافت لیست اشتراک‌ها با مسیر مستقیم (/admin/subscriptions)', rSubsDirect.status === 200);

    let sub = db.subscriptions[0] || db.createSubscription({ user_id: normalUser.id, package_id: 'standard', billing_period: 'monthly', status: 'active' });
    const rSubUp = await req('PUT', '/api/admin/subscriptions', supportToken, { id: sub.id, status: 'active', user_count: 5 });
    check('ویرایش و تمدید دوره اشتراک', rSubUp.status === 200);

    let t = db.createTicket({ user_id: normalUser.id, department_id: 1, service_name: 'test', subject: 'تست تیکت برای پشتیبان', message: 'پیام اولیه کاربر' });
    const rMsg = await req('POST', `/api/tickets/${t.id}/messages`, supportToken, { message: 'پاسخ کارشناس پشتیبانی' });
    check('ارسال پاسخ پشتیبان به تیکت', rMsg.status === 200 && rMsg.data?.data?.sender_type === 'support');

    const rAssign = await req('PUT', `/api/admin/tickets/${t.id}/assign`, supportToken, { staff_id: 1 });
    check('تخصیص تیکت به کارشناس دپارتمان توسط پشتیبان', rAssign.status === 200 && rAssign.data?.ticket?.assigned_to === 1);

    const rStat = await req('PUT', `/api/admin/tickets/${t.id}/status`, supportToken, { status: 'in_progress' });
    check('تغییر وضعیت تیکت به در حال بررسی', rStat.status === 200);

    const rDept = await req('PUT', `/api/admin/tickets/${t.id}/department`, supportToken, { department_id: 2 });
    check('تغییر دپارتمان تیکت', rDept.status === 200);

    const rOrders = await req('GET', '/api/admin/orders', supportToken);
    check('دسترسی پشتیبان به مدیریت خریدها و تراکنش‌ها (/api/admin/orders)', rOrders.status === 200 && Array.isArray(rOrders.data?.data));

    let testOrder = db.orders[0];
    if (testOrder) {
      const rOrderUp = await req('PUT', `/api/admin/orders/${testOrder.id}`, supportToken, { status: testOrder.status, note: 'بررسی پشتیبان' });
      check('امکان مدیریت و تغییر وضعیت سفارش توسط پشتیبان', rOrderUp.status === 200);
    }

    const rDelTicket = await req('DELETE', `/api/admin/tickets/${t.id}`, supportToken);
    check('امکان مدیریت و حذف تیکت توسط پشتیبان', rDelTicket.status === 200);

    console.log('\n2. ایزولاسیون و جلوگیری از دسترسی به بخش‌های مدیریتی (403 Forbidden):');
    const rOver = await req('GET', '/api/admin/overview', supportToken);
    check('عدم دسترسی به درآمد کل و overview -> 403', rOver.status === 403);

    const rUsers = await req('GET', '/api/admin/users', supportToken);
    check('عدم دسترسی به لیست کاربران -> 403', rUsers.status === 403);

    const rRole = await req('PUT', `/api/admin/users/${normalUser.id}/role`, supportToken, { role: 'admin' });
    check('عدم امکان تغییر نقش کاربران -> 403', rRole.status === 403);

    const rAudit = await req('GET', '/api/admin/audit-logs', supportToken);
    check('عدم دسترسی به لاگ‌های سیستمی -> 403', rAudit.status === 403);

    const rDelSub = await req('DELETE', `/api/admin/subscriptions/${sub.id}`, supportToken);
    check('عدم امکان حذف فیزیکی اشتراک -> 403', rDelSub.status === 403);

    console.log('\n3. عدم دسترسی کاربر عادی به تیکت‌ها، سفارش‌ها و اشتراک‌های ادمین:');
    const rNormSub = await req('GET', '/api/admin/subscriptions', normalToken);
    check('کاربر عادی به اشتراک‌های ادمین دسترسی ندارد -> 403', rNormSub.status === 403);

    const rNormTicket = await req('GET', '/api/admin/tickets', normalToken);
    check('کاربر عادی به تیکت‌های ادمین دسترسی ندارد -> 403', rNormTicket.status === 403);

    const rNormOrders = await req('GET', '/api/admin/orders', normalToken);
    check('کاربر عادی به سفارش‌های ادمین دسترسی ندارد -> 403', rNormOrders.status === 403);

    console.log(`\nمجموع: ${p} موفق | ${f} ناموفق`);
    if (f > 0) process.exit(1);
  } finally {
    server.close();
  }
}

run().catch(e => { console.error(e); process.exit(1); });
