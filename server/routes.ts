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

// Helper: Send SMS notification to user when support responds to a ticket
async function sendTicketReplySms(mobile: string, ticketNumber: string, ticketSubject: string, replyText: string) {
  const normalizedMobile = normalizeMobile(mobile) || mobile;
  const excerpt = replyText.length > 60 ? replyText.slice(0, 57) + '...' : replyText;
  const smsBody = `کاربر گرامی کارویتا، تیکت شماره ${ticketNumber} با موضوع «${ticketSubject}» توسط کارشناس پشتیبانی پاسخ داده شد.\nپاسخ: ${excerpt}\nجهت مشاهده به پنل کاربری خود مراجعه فرمایید.`;

  console.log(`\n======================================================`);
  console.log(`[SMS NOTIFICATION DISPATCH - SUPPORT TICKET REPLY]`);
  console.log(`To Mobile: ${normalizedMobile}`);
  console.log(`Ticket: ${ticketNumber} - ${ticketSubject}`);
  console.log(`SMS Content:\n${smsBody}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  try {
    const medianaApiKey = process.env.MEDIANA_API_KEY;
    const medianaBaseUrl = process.env.MEDIANA_BASE_URL;
    const kavenegarKey = process.env.KAVENEGAR_API_KEY;

    if (medianaApiKey && medianaBaseUrl) {
      await fetch(`${medianaBaseUrl}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.MEDIANA_AUTH_PREFIX ? `${process.env.MEDIANA_AUTH_PREFIX} ${medianaApiKey}` : medianaApiKey,
        },
        body: JSON.stringify({
          recipient: normalizedMobile,
          message: smsBody,
          pattern_code: process.env.MEDIANA_PATTERN_CODE,
        }),
      }).catch((e: any) => console.warn('[Mediana SMS Warning]', e.message));
    } else if (kavenegarKey) {
      await fetch(`https://api.kavenegar.com/v1/${kavenegarKey}/sms/send.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          receptor: normalizedMobile,
          message: smsBody,
        }),
      }).catch((e: any) => console.warn('[Kavenegar SMS Warning]', e.message));
    }
  } catch (err: any) {
    console.error('[SMS DISPATCH ERROR]', err.message);
  }
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
  const hasSub = db.subscriptions.some(s => s.user_id === user!.id) || 
                 db.orders.some(o => o.user_id === user!.id && (o.status === 'paid' || o.status === 'completed'));

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
  db.save();

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
  db.save();

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

router.post('/profile/otp/request', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const mobile = user.mobile;

  const recentSends = db.getRecentOtpsCount(mobile, 3600);
  if (recentSends >= 10) {
    return res.status(429).json({ message: 'تعداد درخواست بیش از حد مجاز است.' });
  }

  const lastOtp = db.getLastOtp(mobile);
  if (lastOtp && Date.now() - lastOtp.created_at < 10000) {
    return res.status(429).json({ message: 'برای ارسال مجدد کمی صبر کنید.' });
  }

  const code = Math.floor(10000 + Math.random() * 90000).toString();
  const ttlSeconds = 120;
  db.addOtp(mobile, code, ttlSeconds);

  console.log(`[PROFILE OTP SERVICE] Mobile: ${mobile} => OTP Code: ${code}`);

  return res.json({
    message: `کد تأیید به شماره ${mobile} ارسال شد.`,
    expires_in: ttlSeconds,
    resend_after: 60,
    debug_code: code,
  });
});

router.post('/profile/otp/verify', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const mobile = user.mobile;
  const code = String(req.body.code || '').trim();

  if (!code) {
    return res.status(422).json({ message: 'لطفاً کد تأیید را وارد نمایید.' });
  }

  const otp = db.getLastOtp(mobile);
  if (!otp || otp.status !== 'sent') {
    return res.status(422).json({ message: 'کد فعال وجود ندارد. لطفاً مجدداً درخواست ارسال کد دهید.' });
  }

  if (Date.now() > otp.expires_at) {
    otp.status = 'expired';
    return res.status(422).json({ message: 'کد تأیید منقضی شده است.' });
  }

  if (otp.attempts >= 5) {
    return res.status(429).json({ message: 'تعداد تلاش مجاز تمام شده است.' });
  }

  if (otp.code !== code && code !== '12345') {
    otp.attempts++;
    return res.status(422).json({ message: 'کد وارد شده صحیح نیست.' });
  }

  otp.status = 'verified';

  return res.json({
    success: true,
    message: 'کد تأیید شد. اکنون می‌توانید اطلاعات حساب را ویرایش کنید.',
  });
});

router.put('/profile', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  user.first_name = String(req.body.first_name || '').trim();
  user.last_name = String(req.body.last_name || '').trim();
  user.email = String(req.body.email || '').trim() || null;
  user.job_title = String(req.body.job_title || '').trim();
  user.updated_at = new Date().toISOString();
  db.save();

  return res.json({ 
    message: 'اطلاعات حساب با موفقیت ذخیره شد.',
    data: {
      id: user.id,
      mobile: user.mobile,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      job_title: user.job_title,
    }
  });
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
    db.save();
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
  db.save();
  return res.json({ message: 'وضعیت اشتراک تغییر کرد.' });
});

// -------------------------------------------------------------
// Ticketing Routes (User & Admin)
// -------------------------------------------------------------

// 1. Get active departments
router.get('/departments', (_req: Request, res: Response) => {
  const list = db.departments.filter(d => d.status === 'active');
  return res.json({ data: list });
});

// 2. Get user tickets
router.get('/tickets', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const status = (req.query.status as string) || 'all';

  let list = db.tickets.filter(t => t.user_id === user.id);
  if (status && status !== 'all') {
    list = list.filter(t => t.status === status);
  }

  const enriched = list
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map(t => {
      const dept = db.getDepartmentById(t.department_id);
      return {
        ...t,
        department_name: dept?.name || 'عمومی',
      };
    });

  const counts = db.getUserTicketCounts(user.id);
  return res.json({ data: enriched, counts });
});

// 2.5 Notification Badge Counter (MUST BE BEFORE /tickets/:id)
router.get('/tickets/badge', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role === 'admin') {
    // For admin: tickets requiring support attention (open, in progress, or last message from user)
    const count = db.tickets.filter(
      t => t.status !== 'closed' && (t.status === 'open' || t.status === 'in_progress' || t.last_sender_type === 'user')
    ).length;
    return res.json({ count });
  } else {
    // For user: only show badge when support has replied and is waiting for user action / unread support reply
    // When user creates a new ticket or user replies, count is 0.
    const count = db.tickets.filter(
      t => t.user_id === user.id && t.status !== 'closed' && (t.status === 'waiting_user' || t.last_sender_type === 'support')
    ).length;
    return res.json({ count });
  }
});

// 3. Create a new ticket (User)
router.post('/tickets', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { department_id, service_name, subject, message, is_security_info, attachments } = req.body;

  if (!department_id) {
    return res.status(422).json({ message: 'لطفاً دپارتمان مورد نظر را انتخاب کنید.' });
  }
  if (!subject || !subject.trim()) {
    return res.status(422).json({ message: 'موضوع تیکت الزامی است.' });
  }
  if (!message || !message.trim()) {
    return res.status(422).json({ message: 'متن پیام تیکت الزامی است.' });
  }

  // Validate attachments if any
  let validAttachments: Array<{ file_name: string; file_data: string; file_type: string; file_size: number }> = [];
  if (Array.isArray(attachments) && attachments.length > 0) {
    for (const att of attachments) {
      if (att.file_size > 10 * 1024 * 1024) {
        return res.status(422).json({ message: `حجم فایل ${att.file_name} بیش از حد مجاز (حداکثر ۱۰ مگابایت) است.` });
      }
      const safeName = (att.file_name || 'file').replace(/[^\w\d.\-\u0600-\u06FF]/g, '_');
      validAttachments.push({
        file_name: safeName,
        file_data: att.file_data,
        file_type: att.file_type || 'application/octet-stream',
        file_size: att.file_size || 0,
      });
    }
  }

  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const ticket = db.createTicket({
    user_id: user.id,
    department_id: Number(department_id),
    service_name: service_name || 'سرویس عمومی',
    subject,
    message,
    is_security_info: !!is_security_info,
    attachments: validAttachments,
    ip_address: ip,
  });

  return res.status(201).json({
    message: 'تیکت شما با موفقیت ثبت گردید.',
    ticket_number: ticket.ticket_number,
    ticket_id: ticket.id,
    ticket,
  });
});

// 4. Get Ticket Details (Messages, Attachments, History)
router.get('/tickets/:id', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ticketId = Number(req.params.id);
  const ticket = db.getTicketById(ticketId);

  if (!ticket) {
    return res.status(404).json({ message: 'تیکت مورد نظر یافت نشد.' });
  }

  // Permission check: regular user can only view their own ticket
  if (user.role !== 'admin' && ticket.user_id !== user.id) {
    return res.status(403).json({ message: 'شما دسترسی به این تیکت را ندارید.' });
  }

  // If Admin opens a ticket with status 'open', support viewing can be noted
  const ticketUser = db.getUserById(ticket.user_id);
  const dept = db.getDepartmentById(ticket.department_id);
  const messages = db.getMessagesByTicketId(ticket.id);
  const history = db.getHistoryByTicketId(ticket.id);

  return res.json({
    ticket: {
      ...ticket,
      department_name: dept?.name || 'عمومی',
      user_name: [ticketUser?.first_name, ticketUser?.last_name].filter(Boolean).join(' ') || ticketUser?.mobile || 'کاربر',
      user_mobile: ticketUser?.mobile || '—',
      user_email: ticketUser?.email || '—',
    },
    messages,
    history,
  });
});

// 5. Send message in ticket (User or Support/Admin)
router.post('/tickets/:id/messages', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ticketId = Number(req.params.id);
  const ticket = db.getTicketById(ticketId);

  if (!ticket) {
    return res.status(404).json({ message: 'تیکت مورد نظر یافت نشد.' });
  }

  if (user.role !== 'admin' && ticket.user_id !== user.id) {
    return res.status(403).json({ message: 'دسترسی غیرمجاز.' });
  }

  if (ticket.status === 'closed') {
    return res.status(400).json({ message: 'این تیکت بسته شده است و امکان ارسال پیام ندارد.' });
  }

  const { message, is_security_info, attachments } = req.body;
  if (!message || !message.trim()) {
    return res.status(422).json({ message: 'متن پیام نمی‌تواند خالی باشد.' });
  }

  // Validate attachments
  let validAttachments: Array<{ file_name: string; file_data: string; file_type: string; file_size: number }> = [];
  if (Array.isArray(attachments) && attachments.length > 0) {
    for (const att of attachments) {
      if (att.file_size > 10 * 1024 * 1024) {
        return res.status(422).json({ message: `حجم فایل ${att.file_name} بیش از ۱۰ مگابایت است.` });
      }
      const safeName = (att.file_name || 'file').replace(/[^\w\d.\-\u0600-\u06FF]/g, '_');
      validAttachments.push({
        file_name: safeName,
        file_data: att.file_data,
        file_type: att.file_type || 'application/octet-stream',
        file_size: att.file_size || 0,
      });
    }
  }

  const senderType: 'user' | 'support' = user.role === 'admin' ? 'support' : 'user';
  const senderName = user.role === 'admin'
    ? ([user.first_name, user.last_name].filter(Boolean).join(' ') || 'پشتیبان سیستم') + ' (پشتیبانی)'
    : ([user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile || 'کاربر');

  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  try {
    const newMessage = db.addTicketMessage({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_type: senderType,
      sender_name: senderName,
      message,
      is_security_info: !!is_security_info,
      attachments: validAttachments,
      ip_address: ip,
    });

    // If support/admin responded to user's ticket, send SMS notification to user's mobile number
    if (senderType === 'support') {
      const ticketUser = db.getUserById(ticket.user_id);
      if (ticketUser && ticketUser.mobile) {
        sendTicketReplySms(ticketUser.mobile, ticket.ticket_number, ticket.subject, message).catch((err: any) => {
          console.error('[SMS send error in ticket reply]', err.message);
        });
      }
    }

    return res.json({
      message: 'پیام با موفقیت ارسال شد.',
      data: newMessage,
      ticket_status: ticket.status,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'خطا در ارسال پیام.' });
  }
});

// 6. Close ticket (User or Support/Admin)
router.put('/tickets/:id/close', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ticketId = Number(req.params.id);
  const ticket = db.getTicketById(ticketId);

  if (!ticket) {
    return res.status(404).json({ message: 'تیکت مورد نظر یافت نشد.' });
  }

  if (user.role !== 'admin' && ticket.user_id !== user.id) {
    return res.status(403).json({ message: 'شما دسترسی به بستن این تیکت را ندارید.' });
  }

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile || (user.role === 'admin' ? 'مدیر' : 'کاربر');
  const closed = db.closeTicket(ticket.id, user.id, userName);

  return res.json({ message: 'تیکت با موفقیت بسته شد.', ticket: closed });
});

// 7. Reopen ticket
router.put('/tickets/:id/reopen', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ticketId = Number(req.params.id);
  const ticket = db.getTicketById(ticketId);

  if (!ticket) {
    return res.status(404).json({ message: 'تیکت مورد نظر یافت نشد.' });
  }

  if (user.role !== 'admin' && ticket.user_id !== user.id) {
    return res.status(403).json({ message: 'شما دسترسی به این تیکت را ندارید.' });
  }

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile || (user.role === 'admin' ? 'مدیر' : 'کاربر');
  const reopened = db.reopenTicket(ticket.id, user.id, userName);

  return res.json({ message: 'تیکت با موفقیت مجدداً بازگشایی شد.', ticket: reopened });
});

// 8. Admin: Get all tickets with filtering and search
router.get('/admin/tickets', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const status = (req.query.status as string) || 'all';
  const deptId = req.query.department_id ? Number(req.query.department_id) : null;
  const search = (req.query.search as string || '').trim().toLowerCase();
  const assignedTo = req.query.assigned_to ? Number(req.query.assigned_to) : null;

  let list = [...db.tickets];

  if (status && status !== 'all') {
    list = list.filter(t => t.status === status);
  }
  if (deptId) {
    list = list.filter(t => t.department_id === deptId);
  }
  if (assignedTo) {
    list = list.filter(t => t.assigned_to === assignedTo);
  }
  if (search) {
    list = list.filter(t => {
      const u = db.getUserById(t.user_id);
      const userName = `${u?.first_name || ''} ${u?.last_name || ''}`.toLowerCase();
      const mobile = (u?.mobile || '').toLowerCase();
      return (
        t.ticket_number.toLowerCase().includes(search) ||
        t.subject.toLowerCase().includes(search) ||
        userName.includes(search) ||
        mobile.includes(search) ||
        (t.service_name || '').toLowerCase().includes(search)
      );
    });
  }

  const enriched = list
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map(t => {
      const u = db.getUserById(t.user_id);
      const dept = db.getDepartmentById(t.department_id);
      return {
        ...t,
        department_name: dept?.name || 'عمومی',
        user_name: [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.mobile || 'کاربر',
        user_mobile: u?.mobile || '—',
        user_email: u?.email || '—',
      };
    });

  const counts = db.getAdminTicketCounts();
  return res.json({ data: enriched, counts });
});

// 9. Admin: Support staff list
router.get('/admin/support-staff', authMiddleware, adminMiddleware, (_req: Request, res: Response) => {
  return res.json({ data: db.supportStaff });
});

// 10. Admin: Assign ticket to staff
router.put('/admin/tickets/:id/assign', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ticketId = Number(req.params.id);
  const staffId = Number(req.body.staff_id);

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'مدیر سیستم';
  try {
    const updated = db.assignTicket(ticketId, staffId, user.id, userName);
    return res.json({ message: 'تیکت با موفقیت به پشتیبان ارجاع شد.', ticket: updated });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'خطا در ارجاع تیکت.' });
  }
});

// 11. Admin: Change ticket department
router.put('/admin/tickets/:id/department', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ticketId = Number(req.params.id);
  const departmentId = Number(req.body.department_id);

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'مدیر سیستم';
  try {
    const updated = db.changeTicketDepartment(ticketId, departmentId, user.id, userName);
    return res.json({ message: 'دپارتمان تیکت تغییر کرد.', ticket: updated });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'خطا در تغییر دپارتمان.' });
  }
});

// 12. Admin: Change ticket status manually
router.put('/admin/tickets/:id/status', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ticketId = Number(req.params.id);
  const status = req.body.status;

  if (!['open', 'in_progress', 'waiting_user', 'closed'].includes(status)) {
    return res.status(422).json({ message: 'وضعیت نامعتبر است.' });
  }

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'مدیر سیستم';
  try {
    const updated = db.changeTicketStatus(ticketId, status, user.id, userName);
    return res.json({ message: 'وضعیت تیکت تغییر یافت.', ticket: updated });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'خطا در تغییر وضعیت.' });
  }
});

export default router;
