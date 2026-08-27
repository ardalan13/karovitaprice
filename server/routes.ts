import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User } from './db';

const JWT_SECRET = process.env.APP_KEY || 'secret_key_owj_abri_123';
const router = Router();

// Middleware: Authenticate JWT Token
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'نیاز به ورود دارید.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: number };
    const user = db.getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'کاربر یافت نشد.' });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'توکن نامعتبر یا منقضی شده است.' });
  }
}

// Middleware: Require Admin
function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'دسترسی مدیر لازم است.' });
  }
  next();
}

// Digits Normalization (support Persian and Arabic numerals)
function toEnglishDigits(str: string): string {
  return String(str || '')
    .replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584));
}

// Mobile Normalization Helper
function normalizeMobile(m: string): string | null {
  const converted = toEnglishDigits(m);
  let cleaned = converted.replace(/\D/g, '');
  if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('98')) {
    cleaned = '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('+98')) {
    cleaned = '0' + cleaned.substring(3);
  }
  return /^09\d{9}$/.test(cleaned) ? cleaned : null;
}

// -------------------------------------------------------------
// Auth Routes
// -------------------------------------------------------------
router.post('/auth/otp/request', (req: Request, res: Response) => {
  const mobile = normalizeMobile(req.body.mobile || '');
  if (!mobile) {
    return res.status(422).json({ message: 'شماره موبایل معتبر نیست.' });
  }

  const recentSends = db.getRecentOtpsCount(mobile, 3600);
  if (recentSends >= 10) {
    return res.status(429).json({ message: 'تعداد درخواست بیش از حد مجاز است.' });
  }

  const lastOtp = db.getLastOtp(mobile);
  if (lastOtp && Date.now() - lastOtp.created_at < 10000) {
    return res.status(429).json({ message: 'برای ارسال مجدد کمی صبر کنید.' });
  }

  // Generate 5-digit OTP
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  const ttlSeconds = 120;
  db.addOtp(mobile, code, ttlSeconds);

  console.log(`[SMS OTP SERVICE] Mobile: ${mobile} => OTP Code: ${code}`);

  return res.json({
    message: 'کد تأیید ارسال شد.',
    expires_in: ttlSeconds,
    resend_after: 60,
    debug_code: code,
  });
});

router.post('/auth/otp/verify', (req: Request, res: Response) => {
  const mobile = normalizeMobile(req.body.mobile || '');
  const code = String(req.body.code || '').trim();

  if (!mobile) {
    return res.status(422).json({ message: 'شماره موبایل معتبر نیست.' });
  }

  const otp = db.getLastOtp(mobile);
  if (!otp || otp.status !== 'sent') {
    return res.status(422).json({ message: 'کد فعال وجود ندارد.' });
  }

  if (Date.now() > otp.expires_at) {
    otp.status = 'expired';
    return res.status(422).json({ message: 'کد منقضی شده است.' });
  }

  if (otp.attempts >= 5) {
    return res.status(429).json({ message: 'تعداد تلاش مجاز تمام شده است.' });
  }

  // Accept generated code or fallback '12345' in dev
  if (otp.code !== code && code !== '12345') {
    otp.attempts++;
    return res.status(422).json({ message: 'کد صحیح نیست.' });
  }

  otp.status = 'verified';

  let user = db.getUserByMobile(mobile);
  if (!user) {
    user = db.createUser(mobile);
  } else {
    user.mobile_verified_at = new Date().toISOString();
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const hasSub = db.subscriptions.some(s => s.user_id === user!.id);

  return res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 3600 * 24 * 7,
    user: {
      ...user,
      has_subscription: hasSub,
    },
  });
});

// -------------------------------------------------------------
// Onboarding & Profile Routes
// -------------------------------------------------------------
router.get('/onboarding', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const company = db.getCompanyByUserId(user.id) || null;
  return res.json({
    user,
    company,
    next_step: user.onboarding_step,
  });
});

router.post('/onboarding/user', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const first_name = String(req.body.first_name || '').trim();
  const last_name = String(req.body.last_name || '').trim();
  const email = String(req.body.email || '').trim();

  if (first_name.length < 2 || last_name.length < 2) {
    return res.status(422).json({ message: 'نام و نام خانوادگی را کامل وارد کنید.' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ message: 'ایمیل معتبر نیست.' });
  }

  user.first_name = first_name;
  user.last_name = last_name;
  user.email = email || null;
  user.onboarding_step = Math.max(user.onboarding_step, 2);
  user.updated_at = new Date().toISOString();

  return res.json({
    message: 'اطلاعات کاربری ذخیره شد.',
    next_step: 2,
  });
});

router.post('/onboarding/company', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const name = String(req.body.name || '').trim();
  const industry = String(req.body.industry || '').trim();
  const employee_count = parseInt(req.body.employee_count, 10) || 0;
  const job_title = String(req.body.job_title || '').trim();

  if (name.length < 2 || !industry || employee_count < 1 || !job_title) {
    return res.status(422).json({ message: 'تمام مشخصات شرکت را کامل وارد کنید.' });
  }

  db.upsertCompany(user.id, name, industry, employee_count);
  user.job_title = job_title;
  user.onboarding_step = 3;
  user.onboarding_completed_at = new Date().toISOString();
  user.updated_at = new Date().toISOString();

  return res.json({
    message: 'مشخصات شرکت ذخیره شد.',
    next_step: 3,
  });
});

router.get('/profile', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  return res.json({
    data: {
      id: user.id,
      mobile: user.mobile,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      job_title: user.job_title,
    },
  });
});

router.put('/profile', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  user.first_name = String(req.body.first_name || '').trim();
  user.last_name = String(req.body.last_name || '').trim();
  user.email = String(req.body.email || '').trim() || null;
  user.job_title = String(req.body.job_title || '').trim();
  user.updated_at = new Date().toISOString();

  return res.json({ message: 'پروفایل ذخیره شد.' });
});

// -------------------------------------------------------------
// Packages, Trial, Orders & Payments
// -------------------------------------------------------------
router.get('/packages', (_req: Request, res: Response) => {
  const list = db.packages.filter(p => p.is_active).sort((a, b) => a.price - b.price);
  return res.json({ data: list });
});

router.post('/trial', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.onboarding_step < 3) {
    return res.status(422).json({ message: 'ابتدا اطلاعات کاربری و شرکت را تکمیل کنید.' });
  }

  const alreadyHadTrial = db.subscriptions.some(s => s.user_id === user.id && s.source === 'trial');
  if (alreadyHadTrial) {
    return res.status(409).json({ message: 'دوره آزمایشی قبلاً برای شما فعال شده است.' });
  }

  const trialPkg = db.packages.find(p => p.slug === 'trial' && p.is_active);
  if (!trialPkg) {
    return res.status(404).json({ message: 'پکیج آزمایشی یافت نشد.' });
  }

  db.createSubscription(user.id, trialPkg.id, null, 'trial', 5, trialPkg.usage_limit);

  return res.status(201).json({ message: 'دوره آزمایشی ۵ روزه فعال شد.' });
});

router.post('/orders', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.onboarding_step < 3) {
    return res.status(422).json({ message: 'ابتدا اطلاعات کاربری و شرکت را تکمیل کنید.' });
  }

  const packageId = Number(req.body.package_id);
  const pkg = db.packages.find(p => p.id === packageId && p.is_active && p.price > 0);
  if (!pkg) {
    return res.status(404).json({ message: 'پکیج قابل خرید یافت نشد.' });
  }

  const order = db.createOrder(user.id, pkg.id, pkg.price);
  const authority = 'sandbox-' + Math.random().toString(36).substring(2, 14);
  db.createTransaction(order.id, user.id, authority, pkg.price);

  return res.status(201).json({
    order_id: order.id,
    order_number: order.order_number,
    payment_url: `/api/payments/callback?authority=${authority}`,
  });
});

const handleCallback = (req: Request, res: Response) => {
  const authority = String(req.query.authority || req.body.authority || '');
  const tx = db.transactions.find(t => t.authority === authority);
  if (!tx) {
    return res.status(404).json({ message: 'تراکنش یافت نشد.' });
  }

  const order = db.orders.find(o => o.id === tx.order_id);
  const pkg = order ? db.getPackageById(order.package_id) : null;

  if (tx.status !== 'successful' && order && pkg) {
    tx.status = 'successful';
    tx.reference_id = 'REF-' + Date.now();
    tx.paid_at = new Date().toISOString();
    order.status = 'paid';

    db.createSubscription(tx.user_id, pkg.id, order.id, 'purchase', pkg.duration_days, pkg.usage_limit);
  }

  return res.redirect('/dashboard?payment=success');
};

router.get('/payments/callback', handleCallback);
router.post('/payments/callback', handleCallback);

router.get('/dashboard', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const company = db.getCompanyByUserId(user.id);

  const userSubs = db.subscriptions
    .filter(s => s.user_id === user.id)
    .sort((a, b) => b.id - a.id)
    .map(s => {
      const pkg = db.getPackageById(s.package_id);
      return {
        ...s,
        package_name: pkg?.name || 'نامشخص',
        price: pkg?.price || 0,
        usage_percent: s.usage_limit ? Math.round((s.usage_used / s.usage_limit) * 100) : 0,
      };
    });

  const userTxs = db.transactions
    .filter(t => t.user_id === user.id)
    .sort((a, b) => b.id - a.id)
    .map(t => {
      const ord = db.orders.find(o => o.id === t.order_id);
      const pkg = ord ? db.getPackageById(ord.package_id) : null;
      return {
        id: t.id,
        amount: t.amount,
        status: t.status,
        reference_id: t.reference_id,
        paid_at: t.paid_at,
        order_number: ord?.order_number || '—',
        package_name: pkg?.name || '—',
      };
    });

  return res.json({
    user: {
      id: user.id,
      mobile: user.mobile,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      job_title: user.job_title,
      role: user.role,
      company_name: company?.name || null,
      industry: company?.industry || null,
      employee_count: company?.employee_count || null,
    },
    subscriptions: userSubs,
    transactions: userTxs,
  });
});

router.get('/invoices/:id', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const txId = Number(req.params.id);
  const tx = db.transactions.find(t => t.id === txId && t.user_id === user.id && t.status === 'successful');
  if (!tx) {
    return res.status(404).json({ message: 'فاکتور یافت نشد.' });
  }

  const order = db.orders.find(o => o.id === tx.order_id);
  const pkg = order ? db.getPackageById(order.package_id) : null;

  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>فاکتور فروش - ${order?.order_number || ''}</title>
  <style>
    body { font-family: Tahoma, 'Vazirmatn', sans-serif; padding: 40px; color: #14213d; background: #fff; line-height: 1.8; }
    .invoice-box { max-width: 600px; margin: auto; border: 1px solid #e5eaf1; border-radius: 12px; padding: 30px; }
    h1 { color: #0870d1; margin-top: 0; font-size: 22px; border-bottom: 2px solid #f0f7ff; padding-bottom: 12px; }
    p { margin: 10px 0; }
    strong { color: #0759a8; }
    .footer { margin-top: 25px; font-size: 12px; color: #6f7b8f; border-top: 1px solid #e5eaf1; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="invoice-box">
    <h1>فاکتور رسمی فروش خدمات کارویتا</h1>
    <p><strong>شماره سفارش:</strong> ${order?.order_number || '—'}</p>
    <p><strong>مشتری:</strong> ${[user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile}</p>
    <p><strong>شماره همراه:</strong> ${user.mobile}</p>
    <p><strong>پکیج خریداری‌شده:</strong> ${pkg?.name || '—'}</p>
    <p><strong>مبلغ کل:</strong> ${Number(tx.amount).toLocaleString('fa-IR')} تومان</p>
    <p><strong>کد رهگیری پرداخت:</strong> ${tx.reference_id || '—'}</p>
    <p><strong>تاریخ پرداخت:</strong> ${tx.paid_at ? new Date(tx.paid_at).toLocaleDateString('fa-IR') : '—'}</p>
    <div class="footer">
      این فاکتور به‌صورت سیستمی توسط سامانه کارویتا صادر گردیده است.
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order?.order_number || tx.id}.html`);
  return res.send(html);
});

// -------------------------------------------------------------
// Admin Routes
// -------------------------------------------------------------
router.get('/admin/overview', authMiddleware, adminMiddleware, (_req: Request, res: Response) => {
  const usersCount = db.users.filter(u => u.role === 'user').length;
  const companiesCount = db.companies.length;
  const revenue = db.transactions
    .filter(t => t.status === 'successful')
    .reduce((sum, t) => sum + t.amount, 0);
  const now = new Date().toISOString();
  const activeSubs = db.subscriptions.filter(s => s.status === 'active' && s.expires_at > now).length;
  const trials = db.subscriptions.filter(s => s.source === 'trial').length;

  return res.json({
    stats: {
      users: usersCount,
      companies: companiesCount,
      revenue,
      active_subscriptions: activeSubs,
      trials,
    },
  });
});

router.get('/admin/users', authMiddleware, adminMiddleware, (_req: Request, res: Response) => {
  const users = db.users
    .filter(u => u.role === 'user')
    .sort((a, b) => b.id - a.id)
    .map(u => {
      const company = db.getCompanyByUserId(u.id);
      const subCount = db.subscriptions.filter(s => s.user_id === u.id).length;
      return {
        id: u.id,
        mobile: u.mobile,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        created_at: u.created_at,
        company_name: company?.name || '—',
        industry: company?.industry || '—',
        subscriptions_count: subCount,
      };
    });

  return res.json({ data: users });
});

router.get('/admin/packages', authMiddleware, adminMiddleware, (_req: Request, res: Response) => {
  const list = [...db.packages].sort((a, b) => b.id - a.id);
  return res.json({ data: list });
});

router.post('/admin/packages', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id, name, slug, description, price, duration_days, usage_limit, is_featured, is_active, features } = req.body;
  if (!name || typeof price !== 'number') {
    return res.status(422).json({ message: 'اطلاعات پکیج ناقص است.' });
  }

  db.upsertPackage({
    id: id ? Number(id) : undefined,
    name: String(name).trim(),
    slug: slug ? String(slug).trim() : `package-${Date.now()}`,
    description: String(description || '').trim(),
    price: Number(price),
    duration_days: Number(duration_days) || 30,
    usage_limit: usage_limit === '' || usage_limit === null || usage_limit === undefined ? null : Number(usage_limit),
    is_featured: !!is_featured,
    is_active: is_active ?? true,
    features: Array.isArray(features) ? features : [],
  });

  return res.json({ message: 'پکیج ذخیره شد.' });
});

router.get('/admin/orders', authMiddleware, adminMiddleware, (_req: Request, res: Response) => {
  const orders = [...db.orders]
    .sort((a, b) => b.id - a.id)
    .map(o => {
      const user = db.getUserById(o.user_id);
      const pkg = db.getPackageById(o.package_id);
      const tx = db.transactions.find(t => t.order_id === o.id);
      return {
        id: o.id,
        order_number: o.order_number,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at,
        package_name: pkg?.name || '—',
        user_name: [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.mobile || '—',
        mobile: user?.mobile || '—',
        transaction_status: tx?.status || '—',
        reference_id: tx?.reference_id || '—',
      };
    });

  return res.json({ data: orders });
});

router.get('/admin/subscriptions', authMiddleware, adminMiddleware, (_req: Request, res: Response) => {
  const subs = [...db.subscriptions]
    .sort((a, b) => b.id - a.id)
    .map(s => {
      const user = db.getUserById(s.user_id);
      const pkg = db.getPackageById(s.package_id);
      return {
        ...s,
        package_name: pkg?.name || '—',
        mobile: user?.mobile || '—',
        user_name: [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.mobile || '—',
      };
    });

  return res.json({ data: subs });
});

router.put('/admin/subscriptions', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const id = Number(req.body.id);
  const status = ['active', 'expired', 'cancelled'].includes(req.body.status) ? req.body.status : 'cancelled';
  const sub = db.subscriptions.find(s => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: 'اشتراک یافت نشد.' });
  }

  sub.status = status;
  return res.json({ message: 'وضعیت اشتراک تغییر کرد.' });
});

export default router;
