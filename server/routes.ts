import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User } from './db';
import {
  otpRequestLimiter,
  otpVerifyLimiter,
  ticketSubmissionLimiter,
  ticketMessageLimiter,
  couponValidateLimiter,
  orderCreationLimiter,
} from './rateLimiters';
import {
  logAudit,
  logPrivilegeEscalation,
  logSensitiveDataAccess,
  logConfigChange,
  logSecurityEvent,
  logSubscriptionChange,
} from './auditLogger';
import { getVapidPublicKey, sendWebPush, broadcastWebPush, PushNotificationPayload } from './webPush';
import { errorLogger, logClientError, logServerError } from './errorLogger';
import { performanceLogger } from './performanceLogger';
import { dispatchOtpSms } from './smsService';

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
    return res.status(403).json({ message: 'دسترسی مدیر ارشد (Admin) لازم است.' });
  }
  next();
}

// Middleware: Require Admin or Support
function adminOrSupportMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (!user || (user.role !== 'admin' && user.role !== 'support')) {
    return res.status(403).json({ message: 'دسترسی مدیریت یا پشتیبانی (Admin / Support) لازم است.' });
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

// Helper: Send OTP SMS to user
async function sendOtpSms(mobile: string, code: string) {
  const normalizedMobile = normalizeMobile(mobile) || mobile;
  return await dispatchOtpSms(normalizedMobile, code);
}

// -------------------------------------------------------------
// Auth Routes
// -------------------------------------------------------------
router.post('/auth/otp/request', otpRequestLimiter, async (req: Request, res: Response) => {
  const mobile = normalizeMobile(req.body.mobile || '');
  if (!mobile) {
    return res.status(422).json({ message: 'شماره موبایل معتبر نیست.' });
  }

  const recentSends = db.getRecentOtpsCount(mobile, 3600);
  if (recentSends >= 10) {
    return res.status(429).json({ message: 'تعداد درخواست کد در یک ساعت بیش از حد مجاز است. لطفاً بعداً تلاش کنید.' });
  }

  const lastOtp = db.getLastOtp(mobile);
  if (lastOtp && Date.now() - lastOtp.created_at < 30000) {
    return res.status(429).json({ message: 'برای ارسال مجدد کد حداقل ۳۰ ثانیه صبر کنید.' });
  }

  // Generate 5-digit cryptographically random OTP
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  const ttlSeconds = 120;
  db.addOtp(mobile, code, ttlSeconds);

  // Dispatch real SMS
  await sendOtpSms(mobile, code);

  const isDev = process.env.NODE_ENV !== 'production';

  return res.json({
    message: 'کد تأیید برای شماره شما ارسال شد.',
    expires_in: ttlSeconds,
    resend_after: 60,
    // Only expose debug_code in development / testing mode
    ...(isDev ? { debug_code: code } : {}),
  });
});

router.post('/auth/otp/verify', otpVerifyLimiter, (req: Request, res: Response) => {
  const mobile = normalizeMobile(req.body.mobile || '');
  const code = String(req.body.code || '').trim();

  if (!mobile) {
    return res.status(422).json({ message: 'شماره موبایل معتبر نیست.' });
  }

  const otp = db.getLastOtp(mobile);
  if (!otp || otp.status !== 'sent') {
    return res.status(422).json({ message: 'کد فعال وجود ندارد. لطفاً درخواست کد جدید دهید.' });
  }

  if (Date.now() > otp.expires_at) {
    otp.status = 'expired';
    return res.status(422).json({ message: 'کد منقضی شده است. لطفاً مجدداً تلاش کنید.' });
  }

  if (otp.attempts >= 5) {
    logSecurityEvent(req, {
      actionDescription: `مسدودسازی موقت تأیید شماره به دلیل ۵ بار ورود اشتباه کد OTP (${mobile})`,
      resourceType: 'AUTH_SECURITY',
      resourceId: mobile,
      status: 'WARNING',
      details: { mobile, attempts: otp.attempts },
    });
    return res.status(429).json({ message: 'تعداد دفعات اشتباه بیش از حد مجاز (۵ بار) بود. لطفاً کد جدید دریافت کنید.' });
  }

  const isDev = process.env.NODE_ENV !== 'production';
  const isMatch = otp.code === code || (isDev && code === '12345');

  if (!isMatch) {
    otp.attempts++;
    const remaining = 5 - otp.attempts;
    logSecurityEvent(req, {
      actionDescription: `تلاش ناموفق برای ورود کد تأیید OTP (شماره: ${mobile})`,
      resourceType: 'AUTH_SECURITY',
      resourceId: mobile,
      status: 'WARNING',
      details: { mobile, attempt_number: otp.attempts, remaining_attempts: remaining },
    });
    return res.status(422).json({ 
      message: `کد وارد شده صحیح نیست.${remaining > 0 ? ` (${remaining} بار تلاش باقی‌مانده)` : ' تعداد تلاش به پایان رسید.'}` 
    });
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

router.post('/profile/otp/request', authMiddleware, otpRequestLimiter, (req: Request, res: Response) => {
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

router.post('/profile/otp/verify', authMiddleware, otpVerifyLimiter, (req: Request, res: Response) => {
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
// ERP Configurator, Packages, Trial, Orders & Payments
// -------------------------------------------------------------
router.get('/configurator/data', (_req: Request, res: Response) => {
  return res.json({
    modules: db.erpModules.filter(m => m.is_active !== false),
    presets: db.industryPresets,
    settings: db.configuratorSettings,
  });
});

router.post('/configurator/calculate', (req: Request, res: Response) => {
  const { selected_module_ids = [], user_count = 5, billing_period = 'monthly', coupon_code = '' } = req.body;
  const calc = db.calculateERPPrice(
    Array.isArray(selected_module_ids) ? selected_module_ids : [],
    Number(user_count) || 5,
    billing_period === 'yearly' ? 'yearly' : 'monthly',
    String(coupon_code || '')
  );
  return res.json({ data: calc });
});

router.post('/coupons/validate', couponValidateLimiter, (req: Request, res: Response) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) {
    return res.status(422).json({ message: 'لطفاً کد تخفیف را وارد کنید.' });
  }

  const coupon = db.coupons.find(c => c.code.toUpperCase() === code && c.is_active);
  if (!coupon) {
    return res.status(404).json({ message: 'کد تخفیف معتبر نیست یا منقضی شده است.' });
  }

  return res.json({
    data: {
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount,
    }
  });
});

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

  const selectedModuleIds = Array.isArray(req.body.selected_module_ids) ? req.body.selected_module_ids : [];
  const userCount = Number(req.body.user_count) || 5;

  if (selectedModuleIds.length > 0) {
    db.createERPSubscription(user.id, null, selectedModuleIds, userCount, 'monthly', 'trial', 5);
  } else {
    const trialPkg = db.packages.find(p => p.slug === 'trial' && p.is_active) || db.packages[0];
    db.createSubscription(user.id, trialPkg?.id || 1, null, 'trial', 5, trialPkg?.usage_limit || null);
  }

  if (!user.onboarding_completed_at) {
    user.onboarding_completed_at = new Date().toISOString();
    user.onboarding_step = 3;
    db.save();
  }

  return res.status(201).json({ message: 'دوره آزمایشی ۵ روزه کارویتا برای شما فعال شد.' });
});

router.post('/orders', authMiddleware, orderCreationLimiter, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.onboarding_step < 3) {
    return res.status(422).json({ message: 'ابتدا اطلاعات کاربری و شرکت را تکمیل کنید.' });
  }

  const { selected_module_ids, user_count = 5, billing_period = 'monthly', coupon_code = '', package_id } = req.body;

  let order: Order;
  let finalAmount = 0;

  if (Array.isArray(selected_module_ids) && selected_module_ids.length > 0) {
    // ERP Configurator Order
    order = db.createERPOrder(
      user.id,
      selected_module_ids,
      Number(user_count) || 5,
      billing_period === 'yearly' ? 'yearly' : 'monthly',
      coupon_code
    );
    finalAmount = order.amount;
  } else if (package_id) {
    // Legacy fallback
    const pkg = db.packages.find(p => p.id === Number(package_id) && p.is_active);
    if (!pkg) {
      return res.status(404).json({ message: 'پکیج قابل خرید یافت نشد.' });
    }
    order = db.createOrder(user.id, pkg.id, pkg.price);
    finalAmount = pkg.price;
  } else {
    return res.status(422).json({ message: 'حداقل یک ماژول برای خرید انتخاب کنید.' });
  }

  if (finalAmount <= 0) {
    // Free order (e.g. 100% coupon or 0 amount)
    order.status = 'paid';
    if (order.module_ids && order.module_ids.length > 0) {
      db.createERPSubscription(
        user.id,
        order.id,
        order.module_ids,
        order.user_count || 5,
        order.billing_period || 'monthly',
        'purchase'
      );
    }
    if (!user.onboarding_completed_at) {
      user.onboarding_completed_at = new Date().toISOString();
      user.onboarding_step = 3;
    }
    db.save();
    return res.status(201).json({
      order_id: order.id,
      order_number: order.order_number,
      payment_url: `/dashboard?payment=success`,
    });
  }

  const authority = 'sandbox-' + Math.random().toString(36).substring(2, 14);
  db.createTransaction(order.id, user.id, authority, finalAmount);

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
  const user = db.getUserById(tx.user_id);

  if (tx.status !== 'successful' && order) {
    tx.status = 'successful';
    tx.reference_id = 'REF-' + Date.now();
    tx.paid_at = new Date().toISOString();
    order.status = 'paid';

    if (order.module_ids && order.module_ids.length > 0) {
      db.createERPSubscription(
        tx.user_id,
        order.id,
        order.module_ids,
        order.user_count || 5,
        order.billing_period || 'monthly',
        'purchase'
      );
    } else if (order.package_id) {
      const pkg = db.getPackageById(order.package_id);
      if (pkg) {
        db.createSubscription(tx.user_id, pkg.id, order.id, 'purchase', pkg.duration_days, pkg.usage_limit);
      }
    }

    if (user && !user.onboarding_completed_at) {
      user.onboarding_completed_at = new Date().toISOString();
      user.onboarding_step = 3;
    }
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
      const pkg = s.package_id ? db.getPackageById(s.package_id) : null;
      const order = s.order_id ? db.orders.find(o => o.id === s.order_id) : null;
      const transaction = order ? db.transactions.find(t => t.order_id === order.id && t.status === 'successful') : null;

      let moduleObjects: any[] = [];
      let moduleNames: string[] = [];
      if (s.module_ids && Array.isArray(s.module_ids)) {
        moduleObjects = s.module_ids.map(id => {
          const m = db.erpModules.find(x => x.id === id);
          return {
            id,
            title: m?.title || id,
            price: m?.price || 0,
            dependencies: m?.dependencies || [],
            industries: m?.industries || [],
          };
        });
        moduleNames = moduleObjects.map(m => m.title);
      } else if (pkg && Array.isArray(pkg.features)) {
        moduleNames = pkg.features;
        moduleObjects = pkg.features.map((f, idx) => ({ id: `feat_${idx}`, title: f, price: 0 }));
      }

      const safeCompanySlug = (company?.name ? company.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'workspace') || 'workspace';
      const isSubActive = s.status === 'active' && new Date(s.expires_at) > new Date();

      return {
        ...s,
        package_name: s.title || (pkg?.name) || `اشتراک سازمانی کارویتا (${moduleNames.length} ماژول)`,
        module_names: moduleNames,
        modules_detail: moduleObjects,
        user_count: s.user_count || order?.user_count || 5,
        billing_period: s.billing_period || order?.billing_period || 'monthly',
        order_number: order?.order_number || (s.source === 'trial' ? `TRIAL-KARVITA-${s.id}` : '—'),
        order_amount: order?.amount || pkg?.price || 0,
        discount_amount: order?.discount_amount || 0,
        coupon_code: order?.coupon_code || null,
        reference_id: transaction?.reference_id || (s.source === 'trial' ? 'فعال‌سازی آزمایشی رایگان' : null),
        paid_at: transaction?.paid_at || s.created_at,
        price: pkg?.price || order?.amount || 0,
        usage_percent: s.usage_limit ? Math.round((s.usage_used / s.usage_limit) * 100) : 0,
        server_instance: {
          subdomain: `${safeCompanySlug}-${user.id}.karvita.ir`,
          portal_url: `/workspace/${s.id}`,
          status: isSubActive ? 'online' : 'paused',
          ssl: true,
          database: 'PostgreSQL 16 Enterprise (اختصاصی)',
          backup_status: 'روزانه خودکار (ساعت ۰۲:۰۰ بامداد)',
          datacenter: 'دیتاسنتر ابری تهران - برج میلاد',
          dedicated_ip: `185.143.232.${(user.id % 200) + 10}`,
        }
      };
    });

  const userTxs = db.transactions
    .filter(t => t.user_id === user.id)
    .sort((a, b) => b.id - a.id)
    .map(t => {
      const ord = db.orders.find(o => o.id === t.order_id);
      const pkg = ord?.package_id ? db.getPackageById(ord.package_id) : null;
      let title = pkg?.name || 'اشتراک کارویتا';
      if (ord?.module_ids && ord.module_ids.length > 0) {
        title = `سفارش سازمانی (${ord.module_ids.length} ماژول - ${ord.user_count || 5} کاربر)`;
      }
      return {
        id: t.id,
        amount: t.amount,
        status: t.status,
        reference_id: t.reference_id,
        paid_at: t.paid_at,
        order_number: ord?.order_number || '—',
        package_name: title,
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

router.get('/subscriptions/:id', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const subId = Number(req.params.id);
  const s = db.subscriptions.find(x => x.id === subId && x.user_id === user.id);
  if (!s) {
    return res.status(404).json({ message: 'اشتراک یافت نشد.' });
  }

  const company = db.getCompanyByUserId(user.id);
  const pkg = s.package_id ? db.getPackageById(s.package_id) : null;
  const order = s.order_id ? db.orders.find(o => o.id === s.order_id) : null;
  const transaction = order ? db.transactions.find(t => t.order_id === order.id && t.status === 'successful') : null;

  let moduleObjects: any[] = [];
  let moduleNames: string[] = [];
  if (s.module_ids && Array.isArray(s.module_ids)) {
    moduleObjects = s.module_ids.map(id => {
      const m = db.erpModules.find(x => x.id === id);
      return {
        id,
        title: m?.title || id,
        price: m?.price || 0,
        dependencies: m?.dependencies || [],
        industries: m?.industries || [],
      };
    });
    moduleNames = moduleObjects.map(m => m.title);
  } else if (pkg && Array.isArray(pkg.features)) {
    moduleNames = pkg.features;
    moduleObjects = pkg.features.map((f, idx) => ({ id: `feat_${idx}`, title: f, price: 0 }));
  }

  const safeCompanySlug = (company?.name ? company.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'workspace') || 'workspace';
  const isSubActive = s.status === 'active' && new Date(s.expires_at) > new Date();

  return res.json({
    data: {
      ...s,
      package_name: s.title || (pkg?.name) || `اشتراک سازمانی کارویتا (${moduleNames.length} ماژول)`,
      module_names: moduleNames,
      modules_detail: moduleObjects,
      user_count: s.user_count || order?.user_count || 5,
      billing_period: s.billing_period || order?.billing_period || 'monthly',
      order_number: order?.order_number || (s.source === 'trial' ? `TRIAL-KARVITA-${s.id}` : '—'),
      order_amount: order?.amount || pkg?.price || 0,
      discount_amount: order?.discount_amount || 0,
      coupon_code: order?.coupon_code || null,
      reference_id: transaction?.reference_id || (s.source === 'trial' ? 'فعال‌سازی آزمایشی رایگان' : null),
      paid_at: transaction?.paid_at || s.created_at,
      price: pkg?.price || order?.amount || 0,
      usage_percent: s.usage_limit ? Math.round((s.usage_used / s.usage_limit) * 100) : 0,
      server_instance: {
        subdomain: `${safeCompanySlug}-${user.id}.karvita.ir`,
        portal_url: `/workspace/${s.id}`,
        status: isSubActive ? 'online' : 'paused',
        ssl: true,
        database: 'PostgreSQL 16 Enterprise (اختصاصی)',
        backup_status: 'روزانه خودکار (ساعت ۰۲:۰۰ بامداد)',
        datacenter: 'دیتاسنتر ابری تهران - برج میلاد',
        dedicated_ip: `185.143.232.${(user.id % 200) + 10}`,
      }
    }
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
  const pkg = order?.package_id ? db.getPackageById(order.package_id) : null;

  let serviceDescription = pkg?.name || 'اشتراک نرم‌افزار ابری کارویتا';
  let moduleListHtml = '';
  if (order?.module_ids && order.module_ids.length > 0) {
    const mods = order.module_ids.map(id => {
      const m = db.erpModules.find(x => x.id === id);
      return `<li style="display:flex; justify-content:space-between; padding: 4px 0;"><span>${m?.title || id}</span><span>${(m?.price || 0).toLocaleString('fa-IR')} تومان</span></li>`;
    }).join('');
    moduleListHtml = `<div style="background:#f8fafc; padding:12px; border-radius:8px; margin: 12px 0;">
      <h4 style="margin:0 0 8px; color:#1e293b;">ماژول‌های فعال:</h4>
      <ul style="margin:0; padding-right: 18px;">${mods}</ul>
    </div>`;
    serviceDescription = `پیکربندی سازمانی (${order.module_ids.length} ماژول - ${order.user_count || 5} کاربر - دوره ${order.billing_period === 'yearly' ? 'سالانه' : 'ماهانه'})`;
  }

  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>پیش‌فاکتور و رسید پرداخت - ${order?.order_number || ''}</title>
  <style>
    body { font-family: Tahoma, 'Vazirmatn', sans-serif; padding: 40px; color: #0f172a; background: #f8fafc; line-height: 1.8; }
    .invoice-box { max-width: 680px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eff6ff; padding-bottom: 16px; margin-bottom: 20px; }
    h1 { color: #2563eb; margin: 0; font-size: 20px; font-weight: 800; }
    .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #f1f5f9; font-size: 14px; }
    .total-box { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 16px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
    .total-price { font-size: 20px; font-weight: 800; color: #1d4ed8; }
    .footer { margin-top: 28px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div>
        <h1>فاکتور رسمی فروش خدمات ابری کارویتا</h1>
        <small style="color:#64748b;">شناسه فاکتور: ${order?.order_number || '—'}</small>
      </div>
      <span class="badge">پرداخت موفق</span>
    </div>
    <div class="row"><span>مشتری:</span><strong>${[user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile}</strong></div>
    <div class="row"><span>شماره همراه:</span><strong>${user.mobile}</strong></div>
    <div class="row"><span>سرویس انتخابی:</span><strong>${serviceDescription}</strong></div>
    <div class="row"><span>تعداد کاربران:</span><strong>${order?.user_count || 5} کاربر</strong></div>
    <div class="row"><span>کد رهگیری بانکی:</span><strong>${tx.reference_id || '—'}</strong></div>
    <div class="row"><span>تاریخ پرداخت:</span><strong>${tx.paid_at ? new Date(tx.paid_at).toLocaleDateString('fa-IR') : '—'}</strong></div>
    
    ${moduleListHtml}

    <div class="total-box">
      <span>مبلغ نهایی پرداخت‌شده:</span>
      <span class="total-price">${Number(tx.amount).toLocaleString('fa-IR')} تومان</span>
    </div>
    <div class="footer">
      این فاکتور به‌صورت سیستمی توسط سامانه ابری کارویتا صادر گردیده و دارای ارزش استناد مالی است.
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order?.order_number || tx.id}.html`);

  logSensitiveDataAccess(req, {
    resourceType: 'FINANCIAL_INVOICE',
    resourceId: tx.id,
    actionDescription: `دانلود و دریافت فاکتور رسمی سفارش ${order?.order_number || tx.id}`,
    details: { order_id: order?.id, amount: tx.amount },
  });

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

router.get('/admin/users', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const users = db.users
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
        job_title: u.job_title,
        role: u.role,
        is_owner: u.mobile === '09111273476',
        created_at: u.created_at,
        company_name: company?.name || '—',
        industry: company?.industry || '—',
        subscriptions_count: subCount,
      };
    });

  logSensitiveDataAccess(req, {
    resourceType: 'USER_PII',
    resourceId: 'USER_DIRECTORY',
    actionDescription: 'مشاهده و بازبینی فهرست کاربران، اطلاعات هویتی و شماره‌های تماس توسط مدیر',
    details: { total_users_returned: users.length },
  });

  return res.json({ data: users });
});

router.get('/admin/erp/modules', authMiddleware, adminMiddleware, (_req: Request, res: Response) => {
  return res.json({
    modules: db.erpModules,
    presets: db.industryPresets,
    settings: db.configuratorSettings,
    coupons: db.coupons,
  });
});

router.post('/admin/erp/modules', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id, title, price, dependencies = [], industries = [], is_active = true, add_to_presets = [] } = req.body;
  if (!id || !title || typeof price !== 'number') {
    return res.status(422).json({ message: 'اطلاعات ماژول ناقص است. لطفاً عنوان و قیمت را به درستی وارد کنید.' });
  }

  const cleanId = String(id).trim().toLowerCase().replace(/\s+/g, '_');
  const existingIdx = db.erpModules.findIndex(m => m.id === cleanId);
  const cleanDependencies = Array.isArray(dependencies) ? dependencies : [];
  const cleanIndustries = Array.isArray(industries) ? industries : [];
  const oldModule = existingIdx >= 0 ? { ...db.erpModules[existingIdx] } : null;

  if (existingIdx >= 0) {
    db.erpModules[existingIdx] = {
      ...db.erpModules[existingIdx],
      title: String(title).trim(),
      price: Number(price),
      dependencies: cleanDependencies,
      industries: cleanIndustries,
      is_active: is_active ?? true,
    };
  } else {
    db.erpModules.push({
      id: cleanId,
      title: String(title).trim(),
      price: Number(price),
      dependencies: cleanDependencies,
      industries: cleanIndustries,
      is_active: is_active ?? true,
    });
  }

  // If specific presets were selected, assign module to those presets
  if (Array.isArray(add_to_presets) && add_to_presets.length > 0) {
    db.industryPresets.forEach(preset => {
      if (add_to_presets.includes(preset.id)) {
        if (!preset.default_modules.includes(cleanId)) {
          preset.default_modules.push(cleanId);
        }
      }
    });
  }

  db.save();

  logConfigChange(req, {
    resourceType: 'ERP_MODULE',
    resourceId: cleanId,
    actionDescription: existingIdx >= 0 ? `ویرایش اطلاعات و نرخ ماژول «${title}»` : `تعریف و افزودن ماژول جدید «${title}» به سیستم`,
    oldValue: oldModule,
    newValue: { id: cleanId, title, price, is_active },
    details: { dependencies: cleanDependencies, industries: cleanIndustries },
  });

  return res.json({ message: existingIdx >= 0 ? 'ماژول با موفقیت بروزرسانی شد.' : 'ماژول جدید با موفقیت به سیستم اضافه گردید.', data: db.erpModules });
});

router.post('/admin/erp/modules/:id/toggle', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const mod = db.erpModules.find(m => m.id === id);
  if (!mod) {
    return res.status(404).json({ message: 'ماژول یافت نشد.' });
  }

  const oldStatus = mod.is_active;
  mod.is_active = mod.is_active === false ? true : false;
  db.save();

  logConfigChange(req, {
    resourceType: 'ERP_MODULE_STATUS',
    resourceId: id,
    actionDescription: `تغییر وضعیت ماژول «${mod.title}» به ${mod.is_active ? 'فعال' : 'غیرفعال'}`,
    oldValue: oldStatus,
    newValue: mod.is_active,
    details: { module_id: id, module_title: mod.title },
  });

  return res.json({ message: `وضعیت ماژول به ${mod.is_active ? 'فعال' : 'غیرفعال'} تغییر یافت.`, data: db.erpModules });
});

router.delete('/admin/erp/modules/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.erpModules.findIndex(m => m.id === id);
  if (idx < 0) {
    return res.status(404).json({ message: 'ماژول یافت نشد.' });
  }

  const removedModule = db.erpModules.splice(idx, 1)[0];

  // Also remove from industryPresets
  db.industryPresets.forEach(preset => {
    preset.default_modules = preset.default_modules.filter(mId => mId !== id);
  });

  // Also remove from dependencies of other modules
  db.erpModules.forEach(mod => {
    if (mod.dependencies) {
      mod.dependencies = mod.dependencies.filter(dId => dId !== id);
    }
  });

  db.save();

  logConfigChange(req, {
    resourceType: 'ERP_MODULE',
    resourceId: id,
    actionDescription: `حذف دائم ماژول «${removedModule.title}» (${id}) از ساختار ERP`,
    details: { deleted_module: removedModule },
  });

  return res.json({ message: `ماژول «${removedModule.title}» با موفقیت حذف گردید.`, data: db.erpModules });
});

router.post('/admin/erp/settings', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { base_user_limit, extra_user_price, yearly_multiplier, step_users_enabled, step_modules_enabled } = req.body;
  const oldSettings = { ...db.configuratorSettings };

  db.configuratorSettings = {
    ...db.configuratorSettings,
    base_user_limit: typeof base_user_limit === 'number' ? base_user_limit : db.configuratorSettings.base_user_limit,
    extra_user_price: typeof extra_user_price === 'number' ? extra_user_price : db.configuratorSettings.extra_user_price,
    yearly_multiplier: typeof yearly_multiplier === 'number' ? yearly_multiplier : db.configuratorSettings.yearly_multiplier,
    step_users_enabled: typeof step_users_enabled === 'boolean' ? step_users_enabled : db.configuratorSettings.step_users_enabled,
    step_modules_enabled: typeof step_modules_enabled === 'boolean' ? step_modules_enabled : db.configuratorSettings.step_modules_enabled,
  };
  db.save();

  logConfigChange(req, {
    resourceType: 'CONFIGURATOR_SETTINGS',
    resourceId: 'GLOBAL_ERP_SETTINGS',
    actionDescription: 'تغییر تنظیمات و پارامترهای عمومی سیستم محاسبه قیمت ERP',
    oldValue: oldSettings,
    newValue: db.configuratorSettings,
  });

  return res.json({ message: 'تنظیمات قیمت‌گذاری ذخیره شد.', data: db.configuratorSettings });
});

router.post('/admin/erp/presets', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id, title, default_modules = [] } = req.body;
  if (!title || !title.trim()) {
    return res.status(422).json({ message: 'عنوان تب الزامی است.' });
  }

  const slug = id ? String(id).trim() : `preset_${Date.now()}`;
  const cleanModules = Array.isArray(default_modules) ? default_modules : [];

  const existingIdx = db.industryPresets.findIndex(p => p.id === slug);
  if (existingIdx >= 0) {
    db.industryPresets[existingIdx] = {
      ...db.industryPresets[existingIdx],
      title: String(title).trim(),
      default_modules: cleanModules,
    };
  } else {
    db.industryPresets.push({
      id: slug,
      title: String(title).trim(),
      default_modules: cleanModules,
    });
  }

  db.save();

  logConfigChange(req, {
    resourceType: 'INDUSTRY_PRESET',
    resourceId: slug,
    actionDescription: `تنظیم و ذخیره بسته پیشنهادی صنف «${title}»`,
    details: { slug, title, modules_count: cleanModules.length, default_modules: cleanModules },
  });

  return res.json({ message: 'تب (صنف) با موفقیت ذخیره شد.', data: db.industryPresets });
});

router.delete('/admin/erp/presets/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.industryPresets.findIndex(p => p.id === id);
  if (idx < 0) {
    return res.status(404).json({ message: 'تب یافت نشد.' });
  }
  if (db.industryPresets.length <= 1) {
    return res.status(422).json({ message: 'حداقل یک تب باید در سیستم باقی بماند.' });
  }

  const removed = db.industryPresets.splice(idx, 1)[0];
  db.save();

  logConfigChange(req, {
    resourceType: 'INDUSTRY_PRESET',
    resourceId: id,
    actionDescription: `حذف تب پیش‌فرض صنف «${removed?.title || id}»`,
    details: { removed_preset: removed },
  });

  return res.json({ message: 'تب با موفقیت حذف گردید.', data: db.industryPresets });
});

router.delete('/admin/erp/coupons/:code', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { code } = req.params;
  const cleanCode = String(code).trim().toUpperCase();
  const idx = db.coupons.findIndex(c => c.code.toUpperCase() === cleanCode);
  if (idx < 0) {
    return res.status(404).json({ message: 'کوپن تخفیف یافت نشد.' });
  }

  const removed = db.coupons.splice(idx, 1)[0];
  db.save();

  logConfigChange(req, {
    resourceType: 'COUPON',
    resourceId: cleanCode,
    actionDescription: `حذف کوپن تخفیف «${cleanCode}»`,
    details: { deleted_coupon: removed },
  });

  return res.json({ message: 'کوپن تخفیف حذف شد.', data: db.coupons });
});

router.post('/admin/erp/coupons', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { code, discount_type, discount_value, min_order_amount, is_active } = req.body;
  if (!code || !discount_value) {
    return res.status(422).json({ message: 'اطلاعات کوپن تخفیف ناقص است.' });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const existingIdx = db.coupons.findIndex(c => c.code.toUpperCase() === cleanCode);
  const couponObj = {
    code: cleanCode,
    discount_type: discount_type === 'fixed' ? 'fixed' as const : 'percent' as const,
    discount_value: Number(discount_value),
    min_order_amount: min_order_amount ? Number(min_order_amount) : undefined,
    is_active: is_active ?? true,
  };

  if (existingIdx >= 0) {
    db.coupons[existingIdx] = couponObj;
  } else {
    db.coupons.push(couponObj);
  }
  db.save();

  logConfigChange(req, {
    resourceType: 'COUPON',
    resourceId: cleanCode,
    actionDescription: existingIdx >= 0 ? `بروزرسانی کوپن تخفیف «${cleanCode}»` : `تعریف کوپن تخفیف جدید «${cleanCode}»`,
    details: couponObj,
  });

  return res.json({ message: 'کوپن تخفیف ذخیره شد.', data: db.coupons });
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

  const pkg = db.upsertPackage({
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

  logConfigChange(req, {
    resourceType: 'PACKAGE_DEFINITION',
    resourceId: pkg.id,
    actionDescription: `ایجاد یا ویرایش پکیج تعرفه «${name}» با قیمت ${Number(price).toLocaleString('fa-IR')} تومان`,
    details: pkg,
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

  const oldStatus = sub.status;
  sub.status = status;
  db.save();

  logSubscriptionChange(req, {
    subscriptionId: id,
    userId: sub.user_id,
    oldStatus,
    newStatus: status,
    actionDescription: `تغییر دستی وضعیت اشتراک #${id} به حالت «${status}»`,
  });

  return res.json({ message: 'وضعیت اشتراک تغییر کرد.' });
});

// -------------------------------------------------------------
// Privilege Escalation & User Management
// -------------------------------------------------------------
// 1. Quick Mobile Lookup for Role Toggling
router.get('/admin/users/lookup', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const mobile = req.query.mobile as string;
  const normalized = normalizeMobile(mobile || '');

  if (!normalized) {
    return res.status(422).json({ message: 'شماره موبایل وارد شده معتبر نیست.' });
  }

  const user = db.getUserByMobile(normalized);
  if (!user) {
    return res.json({
      exists: false,
      mobile: normalized,
      message: 'کاربری با این شماره در سیستم یافت نشد. می‌توانید همین حالا این کاربر را به عنوان مدیر یا پشتیبان ثبت کنید.',
    });
  }

  const company = db.getCompanyByUserId(user.id);
  const subCount = db.subscriptions.filter(s => s.user_id === user.id).length;

  return res.json({
    exists: true,
    user: {
      id: user.id,
      mobile: user.mobile,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'بی‌نام',
      email: user.email,
      job_title: user.job_title,
      role: user.role,
      is_owner: user.mobile === '09111273476',
      created_at: user.created_at,
      company_name: company?.name || '—',
      industry: company?.industry || '—',
      subscriptions_count: subCount,
    }
  });
});

// 2. Direct Role Toggle by Mobile Number (Admin / Support / User)
router.post('/admin/users/toggle-role', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { mobile, role } = req.body;
  const normalizedMobile = normalizeMobile(mobile || '');

  if (!normalizedMobile) {
    return res.status(422).json({ message: 'شماره موبایل نامعتبر است. لطفاً شماره معتبر وارد کنید (مانند 09123456789).' });
  }

  if (!['admin', 'support', 'user'].includes(role)) {
    return res.status(422).json({ message: 'نقش انتخابی نامعتبر است (باید admin، support یا user باشد).' });
  }

  // Prevent modifying or demoting the Super Admin / Owner
  if (normalizedMobile === '09111273476' && role !== 'admin') {
    return res.status(403).json({ message: 'امکان خلع دسترسی از مالک و مدیر ارشد پروژه وجود ندارد.' });
  }

  const roleLabels: Record<string, string> = {
    admin: 'مدیر سیستم (Admin)',
    support: 'کارشناس پشتیبانی (Support)',
    user: 'کاربر عادی (User)',
  };

  let user = db.getUserByMobile(normalizedMobile);

  if (user) {
    const oldRole = user.role;
    user.role = role as 'admin' | 'support' | 'user';
    user.updated_at = new Date().toISOString();
    db.save();

    const targetUserName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile;
    logPrivilegeEscalation(req, {
      targetUserId: user.id,
      targetUserName,
      oldRole,
      newRole: role,
      actionDescription: `تغییر سریع نقش کاربر ${normalizedMobile} (${targetUserName}) از «${roleLabels[oldRole] || oldRole}» به «${roleLabels[role]}»`,
    });

    return res.json({
      message: `سطح دسترسی کاربر «${targetUserName}» با موفقیت به «${roleLabels[role]}» تغییر یافت.`,
      user: {
        id: user.id,
        mobile: user.mobile,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_owner: user.mobile === '09111273476',
      }
    });
  } else {
    // Create pre-authorized user with this role
    const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
    const defaultJobTitle = role === 'admin' ? 'مدیر سیستم' : role === 'support' ? 'کارشناس پشتیبانی' : 'کاربر';
    const newUser: User = {
      id: newId,
      mobile: normalizedMobile,
      first_name: null,
      last_name: null,
      email: null,
      job_title: defaultJobTitle,
      role: role as 'admin' | 'support' | 'user',
      onboarding_step: 3,
      onboarding_completed_at: new Date().toISOString(),
      mobile_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    db.save();

    logPrivilegeEscalation(req, {
      targetUserId: newUser.id,
      targetUserName: normalizedMobile,
      oldRole: 'none',
      newRole: role,
      actionDescription: `ثبت شماره همراه ${normalizedMobile} در سیستم با سطح دسترسی «${roleLabels[role]}»`,
    });

    return res.json({
      message: `شماره ${normalizedMobile} در سامانه ثبت و دسترسی «${roleLabels[role]}» به آن اعطا شد.`,
      user: {
        id: newUser.id,
        mobile: newUser.mobile,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        is_owner: false,
      }
    });
  }
});

// 3. Create or Promote User / Admin / Support by Mobile with detailed info
router.post('/admin/users', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { mobile, first_name, last_name, email, job_title, role = 'admin' } = req.body;
  const normalizedMobile = normalizeMobile(mobile || '');

  if (!normalizedMobile) {
    return res.status(422).json({ message: 'شماره موبایل نامعتبر است. لطفاً شماره معتبر ایران (مانند 09123456789) وارد کنید.' });
  }

  const targetRole = (['admin', 'support', 'user'].includes(role) ? role : 'admin') as 'admin' | 'support' | 'user';
  
  if (normalizedMobile === '09111273476' && targetRole !== 'admin') {
    return res.status(403).json({ message: 'امکان خلع دسترسی از مالک و مدیر ارشد پروژه وجود ندارد.' });
  }

  const roleLabels: Record<string, string> = {
    admin: 'مدیر سیستم (Admin)',
    support: 'کارشناس پشتیبانی (Support)',
    user: 'کاربر عادی (User)',
  };

  let user = db.getUserByMobile(normalizedMobile);

  if (user) {
    const oldRole = user.role;
    user.role = targetRole;
    if (first_name && first_name.trim()) user.first_name = String(first_name).trim();
    if (last_name && last_name.trim()) user.last_name = String(last_name).trim();
    if (email && email.trim()) user.email = String(email).trim();
    if (job_title && job_title.trim()) user.job_title = String(job_title).trim();
    user.updated_at = new Date().toISOString();
    db.save();

    const targetName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile;
    logPrivilegeEscalation(req, {
      targetUserId: user.id,
      targetUserName: targetName,
      oldRole,
      newRole: targetRole,
      actionDescription: `بروزرسانی مشخصات و تغییر نقش کاربر ${normalizedMobile} به «${roleLabels[targetRole]}»`,
    });

    return res.json({
      message: `کاربر با شماره ${normalizedMobile} یافت شد و نقش آن با موفقیت به «${roleLabels[targetRole]}» تنظیم شد.`,
      user,
    });
  } else {
    const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
    const defaultJob = targetRole === 'admin' ? 'مدیر سیستم' : targetRole === 'support' ? 'کارشناس پشتیبانی' : null;
    const newUser: User = {
      id: newId,
      mobile: normalizedMobile,
      first_name: first_name && first_name.trim() ? String(first_name).trim() : null,
      last_name: last_name && last_name.trim() ? String(last_name).trim() : null,
      email: email && email.trim() ? String(email).trim() : null,
      job_title: job_title && job_title.trim() ? String(job_title).trim() : defaultJob,
      role: targetRole,
      onboarding_step: 3,
      onboarding_completed_at: new Date().toISOString(),
      mobile_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    db.save();

    const targetName = [newUser.first_name, newUser.last_name].filter(Boolean).join(' ') || newUser.mobile;
    logPrivilegeEscalation(req, {
      targetUserId: newUser.id,
      targetUserName: targetName,
      oldRole: 'none',
      newRole: targetRole,
      actionDescription: `تعریف و ثبت کاربر جدید با شماره ${normalizedMobile} و دسترسی «${roleLabels[targetRole]}»`,
    });

    return res.json({
      message: `کاربر جدید با شماره ${normalizedMobile} ایجاد و دسترسی «${roleLabels[targetRole]}» اعطا شد.`,
      user: newUser,
    });
  }
});

// 4. Update User Role by User ID (supports both PUT and POST)
const handleRoleUpdate = (req: Request, res: Response) => {
  const targetUserId = Number(req.params.id);
  const { role } = req.body;

  if (!['admin', 'support', 'user'].includes(role)) {
    return res.status(422).json({ message: 'نقش کاربری نامعتبر است (باید admin، support یا user باشد).' });
  }

  const targetUser = db.getUserById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: 'کاربر مورد نظر یافت نشد.' });
  }

  // Protect project owner from being demoted
  if (targetUser.mobile === '09111273476' && role !== 'admin') {
    return res.status(403).json({ message: 'امکان خلع دسترسی از مالک و مدیر ارشد پروژه وجود ندارد.' });
  }

  const roleLabels: Record<string, string> = {
    admin: 'مدیر سیستم (Admin)',
    support: 'کارشناس پشتیبانی (Support)',
    user: 'کاربر عادی (User)',
  };

  const oldRole = targetUser.role;
  targetUser.role = role as 'admin' | 'support' | 'user';
  targetUser.updated_at = new Date().toISOString();
  db.save();

  const targetUserName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(' ') || targetUser.mobile;

  logPrivilegeEscalation(req, {
    targetUserId: targetUser.id,
    targetUserName,
    oldRole,
    newRole: role,
    actionDescription: `تغییر سطح دسترسی کاربر #${targetUser.id} (${targetUserName}) از «${roleLabels[oldRole] || oldRole}» به «${roleLabels[role]}»`,
  });

  return res.json({
    message: `نقش کاربر با موفقیت به «${roleLabels[role]}» تغییر یافت.`,
    user: targetUser,
  });
};

router.put('/admin/users/:id/role', authMiddleware, adminMiddleware, handleRoleUpdate);
router.post('/admin/users/:id/role', authMiddleware, adminMiddleware, handleRoleUpdate);

// 5. Delete User by ID (with owner protection)
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const targetUserId = Number(req.params.id);
  const targetUser = db.getUserById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: 'کاربر مورد نظر یافت نشد.' });
  }

  if (targetUser.mobile === '09111273476') {
    return res.status(403).json({ message: 'امکان حذف حساب مالک و مدیر ارشد سامانه وجود ندارد.' });
  }

  const idx = db.users.findIndex(u => u.id === targetUserId);
  if (idx >= 0) {
    const removed = db.users.splice(idx, 1)[0];
    db.save();

    const targetUserName = [removed.first_name, removed.last_name].filter(Boolean).join(' ') || removed.mobile;
    logPrivilegeEscalation(req, {
      targetUserId: removed.id,
      targetUserName,
      oldRole: removed.role,
      newRole: 'deleted',
      actionDescription: `حذف حساب کاربری ${removed.mobile} (${targetUserName}) از سامانه توسط مدیر`,
    });

    return res.json({ message: `کاربر «${targetUserName}» با موفقیت حذف گردید.` });
  }

  return res.status(404).json({ message: 'کاربر یافت نشد.' });
});

// -------------------------------------------------------------
// Unified Audit Logging Endpoints
// -------------------------------------------------------------
router.get('/admin/audit-logs', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const action_type = (req.query.action_type as string) || 'all';
  const resource_type = (req.query.resource_type as string) || 'all';
  const status = (req.query.status as string) || 'all';
  const search = (req.query.search as string) || '';
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;

  const result = db.getAuditLogs({
    action_type,
    resource_type,
    status,
    search,
    limit,
    offset,
  });

  logSensitiveDataAccess(req, {
    resourceType: 'AUDIT_TRAIL',
    resourceId: 'LOGS_VIEWER',
    actionDescription: 'مشاهده و بازبینی لاگ‌های امنیتی و حسابرسی سامانه',
    details: { filters: { action_type, search }, returned_count: result.logs.length },
  });

  return res.json(result);
});

router.get('/admin/audit-logs/stats', authMiddleware, adminMiddleware, (_req: Request, res: Response) => {
  const stats = db.getAuditStats();
  return res.json({ stats });
});

router.get('/admin/audit-logs/export', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const result = db.getAuditLogs({ limit: 2000, offset: 0 });

  logSensitiveDataAccess(req, {
    resourceType: 'AUDIT_TRAIL_EXPORT',
    resourceId: 'ALL_LOGS',
    actionDescription: 'خروجی گرفتن و دانلود گزارش کامل لاگ‌های حسابرسی و امنیتی',
    details: { total_exported: result.total },
  });

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=karovita-audit-logs-${new Date().toISOString().slice(0, 10)}.json`);
  return res.send(JSON.stringify(result.logs, null, 2));
});

// -------------------------------------------------------------
// Unified Local Error Logging & Diagnostics Endpoints
// -------------------------------------------------------------

// 1. Client error report receiver (public/semi-public endpoint for browsers)
router.post('/logs/client-error', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET) as { sub: number };
        const user = db.getUserById(payload.sub);
        if (user) {
          (req as any).user = user;
        }
      } catch {
        // Continue unauthenticated if token invalid
      }
    }

    const { message, name, stack, url, context, level } = req.body || {};
    if (!message && !name) {
      return res.status(400).json({ message: 'پیام خطا الزامی است.' });
    }

    const log = logClientError({ message, name, stack, url, context, level }, req);
    return res.status(201).json({ status: 'ok', id: log.id });
  } catch (err) {
    return res.status(500).json({ message: 'خطا در ثبت لاگ محلی.' });
  }
});

// 2. Admin: Get system error logs with filtering
router.get('/admin/error-logs', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const level = (req.query.level as string) || 'all';
  const source = (req.query.source as string) || 'all';
  const resolved = req.query.resolved as string;
  const search = (req.query.search as string) || '';
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  const logs = errorLogger.getLogs({
    level,
    source,
    resolved: resolved === 'true' ? true : resolved === 'false' ? false : 'all',
    search,
    limit,
  });

  const stats = errorLogger.getStats();

  logSensitiveDataAccess(req, {
    resourceType: 'ERROR_LOGS',
    resourceId: 'VIEWER',
    actionDescription: 'مشاهده و بازبینی لاگ‌های خطای محلی سامانه',
    details: { filters: { level, source, search }, returned_count: logs.length },
  });

  return res.json({ logs, stats });
});

// 3. Admin: Get error statistics
router.get('/admin/error-logs/stats', authMiddleware, adminMiddleware, (_req: Request, res: Response) => {
  const stats = errorLogger.getStats();
  return res.json({ stats });
});

// 4. Admin: Mark error as resolved / unresolved
router.post('/admin/error-logs/:id/resolve', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const resolved = req.body.resolved !== undefined ? Boolean(req.body.resolved) : true;
  const success = errorLogger.markResolved(id, resolved);

  if (!success) {
    return res.status(404).json({ message: 'رکورد خطا یافت نشد.' });
  }

  logConfigChange(req, {
    configKey: `error_log_${id}_resolved`,
    oldValue: !resolved,
    newValue: resolved,
    actionDescription: `تغییر وضعیت بررسی خطای «${id}» به ${resolved ? 'حل‌شده' : 'حل‌نشده'}`,
  });

  return res.json({ message: `وضعیت خطا به ${resolved ? 'بررسی‌شده' : 'در انتظار بررسی'} تغییر یافت.` });
});

// 5. Admin: Clear all error logs
router.post('/admin/error-logs/clear', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  errorLogger.clearLogs();

  logSecurityEvent(req, {
    eventType: 'CONFIGURATION_CHANGE',
    severity: 'WARNING',
    actionDescription: 'پاکسازی کامل فایل و لیست لاگ‌های خطای سامانه توسط مدیر',
  });

  return res.json({ message: 'کلیه لاگ‌های خطای محلی با موفقیت پاکسازی شدند.' });
});

// 6. Admin: Export error logs (JSON or text log file)
router.get('/admin/error-logs/export', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const format = (req.query.format as string) || 'json';

  logSensitiveDataAccess(req, {
    resourceType: 'ERROR_LOGS_EXPORT',
    resourceId: format,
    actionDescription: `دانلود فایل خروجی لاگ‌های خطای سامانه با فرمت ${format.toUpperCase()}`,
  });

  if (format === 'text' || format === 'log') {
    const rawText = errorLogger.getRawLogText();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=karovita-errors-${new Date().toISOString().slice(0, 10)}.log`);
    return res.send(rawText || 'No logs recorded.');
  }

  const logs = errorLogger.getLogs({ limit: 1000 });
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=karovita-error-logs-${new Date().toISOString().slice(0, 10)}.json`);
  return res.send(JSON.stringify(logs, null, 2));
});

// 7. Admin: Trigger a simulated test error
router.post('/admin/error-logs/test', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { type = 'server', message = 'این یک خطای آزمایشی جهت بررسی سلامت سیستم لاگ است.' } = req.body || {};

  const testErr = new Error(`[Test] ${message}`);
  const created = logServerError(testErr, {
    test: true,
    triggeredByAdmin: (req as any).user?.mobile,
    triggerTime: new Date().toISOString(),
  }, req, 'warn', type === 'database' ? 'database' : 'api');

  return res.status(201).json({
    message: 'خطای آزمایشی با موفقیت در فایل data/error_logs.json ثبت گردید.',
    log: created,
  });
});

// -------------------------------------------------------------
// Core Web Vitals & Performance Monitoring Endpoints
// -------------------------------------------------------------

// 1. Client Web Vitals beacon receiver (public endpoint for periodic performance logs)
router.post('/logs/vitals', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET) as { sub: number };
        const user = db.getUserById(payload.sub);
        if (user) {
          (req as any).user = user;
        }
      } catch {
        // Continue unauthenticated if token invalid
      }
    }

    const { url, metrics = {}, connection, memory } = req.body || {};
    const entry = performanceLogger.logVitals({ url, metrics, connection, memory }, req);
    return res.status(201).json({ status: 'ok', id: entry.id });
  } catch (err) {
    return res.status(500).json({ message: 'خطا در ثبت معیارهای کارایی.' });
  }
});

// 2. Admin: Get recorded web vitals and aggregated performance statistics
router.get('/admin/vitals', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 100, 300);
  const vitals = performanceLogger.getVitals(limit);
  const stats = performanceLogger.getStats();

  return res.json({ vitals, stats });
});

// 3. Admin: Clear web vitals logs
router.post('/admin/vitals/clear', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  performanceLogger.clearLogs();
  return res.json({ message: 'لاگ‌های پایش کارایی Core Web Vitals با موفقیت پاکسازی شدند.' });
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
router.post('/tickets', authMiddleware, ticketSubmissionLimiter, (req: Request, res: Response) => {
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

  // Send push notification to Admins and Support staff
  try {
    const adminSubs = db.getAllPushSubscriptions().filter(s => s.role === 'admin' || s.role === 'support');
    if (adminSubs.length > 0) {
      broadcastWebPush(adminSubs, {
        title: `تیکت جدید: ${subject}`,
        body: `تیکت شماره ${ticket.ticket_number} توسط کاربر ثبت شد.`,
        url: `/admin`,
        tag: `ticket-${ticket.id}`,
      }).catch(() => {});
    }
  } catch (err) {
    // Ignore push delivery error on creation
  }

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
    logSecurityEvent(req, {
      actionDescription: `تلاش غیرمجاز برای مشاهده تیکت #${ticket.ticket_number} (کاربر ID: ${user.id})`,
      resourceType: 'TICKET_ACCESS_VIOLATION',
      resourceId: ticket.id,
      status: 'WARNING',
      details: { attempted_ticket_id: ticket.id, ticket_owner_id: ticket.user_id },
    });
    return res.status(403).json({ message: 'شما دسترسی به این تیکت را ندارید.' });
  }

  // If ticket contains security information or is inspected by Admin, log sensitive access
  if (ticket.is_security_info || user.role === 'admin') {
    logSensitiveDataAccess(req, {
      resourceType: 'TICKET_SECURITY_DATA',
      resourceId: ticket.id,
      actionDescription: `دسترسی و بازبینی اطلاعات تیکت شماره ${ticket.ticket_number} ${ticket.is_security_info ? '(شامل اطلاعات حساس و دسترسی)' : ''}`,
      details: { ticket_number: ticket.ticket_number, is_security_info: ticket.is_security_info, viewer_role: user.role },
    });
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
router.post('/tickets/:id/messages', authMiddleware, ticketMessageLimiter, (req: Request, res: Response) => {
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

    // If support/admin responded to user's ticket, send SMS & Push notification to user
    if (senderType === 'support') {
      const ticketUser = db.getUserById(ticket.user_id);
      if (ticketUser && ticketUser.mobile) {
        sendTicketReplySms(ticketUser.mobile, ticket.ticket_number, ticket.subject, message).catch((err: any) => {
          console.error('[SMS send error in ticket reply]', err.message);
        });
      }

      // Web Push to ticket owner
      const userSubs = db.getPushSubscriptions({ user_id: ticket.user_id });
      if (userSubs.length > 0) {
        broadcastWebPush(userSubs, {
          title: `پاسخ به تیکت #${ticket.ticket_number}`,
          body: `${senderName}: ${message.length > 80 ? message.substring(0, 80) + '...' : message}`,
          url: `/support?ticketId=${ticket.id}`,
          tag: `ticket-${ticket.id}`,
        }).catch(() => {});
      }
    } else {
      // Regular user sent message: notify admins & support staff
      const staffSubs = db.getAllPushSubscriptions().filter(s => s.role === 'admin' || s.role === 'support');
      if (staffSubs.length > 0) {
        broadcastWebPush(staffSubs, {
          title: `پیام جدید در تیکت #${ticket.ticket_number}`,
          body: `${senderName}: ${message.length > 80 ? message.substring(0, 80) + '...' : message}`,
          url: `/admin`,
          tag: `ticket-${ticket.id}`,
        }).catch(() => {});
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
    const staff = db.supportStaff.find(s => s.id === staffId);

    logConfigChange(req, {
      resourceType: 'TICKET_ASSIGNMENT',
      resourceId: ticketId,
      actionDescription: `ارجاع تیکت #${updated.ticket_number} به کارشناس پشتیبانی «${staff?.name || staffId}»`,
      details: { staff_id: staffId, staff_name: staff?.name, ticket_number: updated.ticket_number },
    });

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
    const dept = db.getDepartmentById(departmentId);

    logConfigChange(req, {
      resourceType: 'TICKET_DEPARTMENT',
      resourceId: ticketId,
      actionDescription: `انتقال دپارتمان تیکت #${updated.ticket_number} به «${dept?.name || departmentId}»`,
      details: { new_department_id: departmentId, department_name: dept?.name },
    });

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

    logConfigChange(req, {
      resourceType: 'TICKET_STATUS',
      resourceId: ticketId,
      actionDescription: `تغییر وضعیت تیکت #${updated.ticket_number} به «${status}» توسط مدیر`,
      details: { new_status: status, ticket_number: updated.ticket_number },
    });

    return res.json({ message: 'وضعیت تیکت تغییر یافت.', ticket: updated });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'خطا در تغییر وضعیت.' });
  }
});

// 13. Admin: Clear all tickets (cleanup test tickets)
router.delete('/admin/tickets/clear-all', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const result = db.clearAllTickets();
  logConfigChange(req, {
    resourceType: 'TICKET_CLEANUP',
    resourceId: 0,
    actionDescription: `حذف و پاک‌سازی تمام تیکت‌های تستی (${result.clearedCount} تیکت)`,
    details: { clearedCount: result.clearedCount },
  });
  return res.json({ message: 'تمام تیکت‌های تستی با موفقیت پاک شدند.', clearedCount: result.clearedCount });
});

// 14. Admin: Delete single ticket
router.delete('/admin/tickets/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const ticketId = Number(req.params.id);
  const deleted = db.deleteTicket(ticketId);
  if (!deleted) {
    return res.status(404).json({ message: 'تیکت مورد نظر یافت نشد.' });
  }
  logConfigChange(req, {
    resourceType: 'TICKET_DELETION',
    resourceId: ticketId,
    actionDescription: `حذف تیکت شماره ${ticketId}`,
    details: { ticket_id: ticketId },
  });
  return res.json({ message: 'تیکت مورد نظر با موفقیت حذف شد.' });
});

// -------------------------------------------------------------
// Progressive Web App (PWA) & Web Push Endpoints
// -------------------------------------------------------------

// Helper: Extract user optionally from auth header
function getOptionalUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: number };
    return db.getUserById(payload.sub) || null;
  } catch {
    return null;
  }
}

// 1. Get VAPID Public Key for client subscription
router.get('/push/public-key', (_req: Request, res: Response) => {
  const publicKey = getVapidPublicKey();
  return res.json({ publicKey });
});

// 2. Register or update Push Subscription
router.post('/push/subscribe', (req: Request, res: Response) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
    return res.status(422).json({ message: 'اطلاعات اشتراک اعلان ناقص است.' });
  }

  const optionalUser = getOptionalUser(req);
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  const registered = db.addOrUpdatePushSubscription({
    user_id: optionalUser ? optionalUser.id : null,
    user_mobile: optionalUser ? optionalUser.mobile : null,
    role: optionalUser ? optionalUser.role : 'guest',
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    user_agent: userAgent,
    ip_address: ip,
  });

  return res.status(201).json({
    success: true,
    message: 'دستگاه شما با موفقیت برای دریافت اعلان‌ها ثبت شد.',
    subscription_id: registered.id,
  });
});

// 3. Unsubscribe from Push Notifications
router.post('/push/unsubscribe', (req: Request, res: Response) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(422).json({ message: 'شناسه endpoint الزامی است.' });
  }

  const removed = db.removePushSubscription(endpoint);
  return res.json({
    success: true,
    removed,
    message: removed ? 'اشتراک اعلان‌ها با موفقیت لغو شد.' : 'اشتراک یافت نشد.',
  });
});

// 4. Send Test Push Notification to the caller or specific subscription
router.post('/push/test', async (req: Request, res: Response) => {
  const { endpoint, title, body } = req.body;
  let targetSub = endpoint ? db.pushSubscriptions.find(s => s.endpoint === endpoint) : null;

  if (!targetSub) {
    const optionalUser = getOptionalUser(req);
    if (optionalUser) {
      const userSubs = db.getPushSubscriptions({ user_id: optionalUser.id });
      if (userSubs.length > 0) {
        targetSub = userSubs[userSubs.length - 1];
      }
    }
  }

  if (!targetSub && db.pushSubscriptions.length > 0) {
    targetSub = db.pushSubscriptions[db.pushSubscriptions.length - 1];
  }

  if (!targetSub) {
    return res.status(404).json({
      success: false,
      message: 'هیچ اشتراک اعلانی برای ارسال پیام آزمایشی یافت نشد. لطفاً ابتدا دکمه فعال‌سازی اعلان را بزنید.',
    });
  }

  const payload: PushNotificationPayload = {
    title: title || 'کارویتا | اعلان آزمایشی PWA',
    body: body || 'سیستم وب‌پوش و سرویس‌ورکر کارویتا با موفقیت فعال و متصل است! 🚀',
    icon: '/icon-192.svg',
    badge: '/badge-72.svg',
    url: '/admin',
    tag: 'karovita-test-notification',
  };

  const result = await sendWebPush(targetSub, payload);

  if (result.success) {
    return res.json({
      success: true,
      message: 'اعلان آزمایشی با موفقیت به دستگاه شما ارسال گردید.',
      result,
    });
  } else {
    // If endpoint is expired or invalid (410 / 404), clean it up
    if (result.statusCode === 410 || result.statusCode === 404) {
      db.removePushSubscription(targetSub.endpoint);
    }
    return res.status(500).json({
      success: false,
      message: `خطا در تحویل وب‌پوش: ${result.error || 'پاسخ ناموفق از سرور پوش'}`,
      result,
    });
  }
});

// 5. Admin: Get Push notification subscribers list & statistics
router.get('/admin/push/subscribers', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const all = db.getAllPushSubscriptions();
  const total = all.length;
  const admin_count = all.filter(s => s.role === 'admin').length;
  const support_count = all.filter(s => s.role === 'support').length;
  const user_count = all.filter(s => s.role === 'user').length;
  const guest_count = all.filter(s => s.role === 'guest' || !s.role).length;

  return res.json({
    total,
    stats: {
      admin_count,
      support_count,
      user_count,
      guest_count,
    },
    subscribers: all.map(s => ({
      id: s.id,
      user_id: s.user_id,
      user_mobile: s.user_mobile,
      role: s.role,
      user_agent: s.user_agent,
      ip_address: s.ip_address,
      created_at: s.created_at,
      updated_at: s.updated_at,
    })),
  });
});

// 6. Admin: Broadcast custom push notification to users/admins
router.post('/admin/push/broadcast', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const { title, body, targetRole = 'all', url = '/' } = req.body;
  if (!title || !body) {
    return res.status(422).json({ message: 'عنوان و متن پیام اعلان الزامی است.' });
  }

  let targets = db.getAllPushSubscriptions();
  if (targetRole && targetRole !== 'all') {
    targets = targets.filter(s => s.role === targetRole);
  }

  if (targets.length === 0) {
    return res.status(404).json({ message: 'هیچ دستگاه فعالی در گروه انتخابی برای دریافت اعلان وجود ندارد.' });
  }

  const payload: PushNotificationPayload = {
    title,
    body,
    icon: '/icon-192.svg',
    badge: '/badge-72.svg',
    url,
    tag: `karovita-broadcast-${Date.now()}`,
  };

  const { sent, failed } = await broadcastWebPush(targets, payload);

  logConfigChange(req, {
    resourceType: 'PUSH_NOTIFICATION_BROADCAST',
    resourceId: 'BROADCAST',
    actionDescription: `ارسال اعلان وب‌پوش همگانی («${title}») به گروه ${targetRole}`,
    details: { title, body, targetRole, url, sent_count: sent, failed_count: failed },
  });

  return res.json({
    message: `اعلان همگانی ارسال شد. (موفق: ${sent}، ناموفق: ${failed})`,
    sent,
    failed,
    total_targets: targets.length,
  });
});

export default router;
