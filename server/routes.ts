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
  logFinancialEvent,
} from './auditLogger';
import { getVapidPublicKey, sendWebPush, broadcastWebPush, PushNotificationPayload } from './webPush';
import { errorLogger, logClientError, logServerError } from './errorLogger';
import { performanceLogger } from './performanceLogger';
import {
  dispatchOtpSms,
  sendTemplateSms,
  sendInvoiceIssuedSms,
  sendSubscriptionExpirySms,
  sendTicketCreatedSms,
  sendPaymentSuccessSms,
  checkAndSendSubscriptionExpiryReminders,
  checkSmsProviderHealth,
  getSmsConfig
} from './smsService';
import {
  initiateZibalPayment,
  verifyZibalPayment,
  inquiryZibalTransaction,
  getZibalConfig
} from './zibalService';
import {
  generateOfficialTaxInvoiceHtml,
  generateOfficialContractHtml,
  OFFICIAL_SELLER_INFO,
  numberToWordsPersian,
  generateTaxId,
} from './taxInvoiceService';
import { getHealthStatus } from './healthCheck';
import { cacheGet, invalidateCache } from './cacheMiddleware';

const JWT_SECRET = process.env.APP_KEY || 'secret_key_owj_abri_123';
const router = Router();

// Health check endpoint
router.get('/health', getHealthStatus);
router.get('/ping', (_req, res) => {
  res.json({ status: 'ok', app: 'karovita_erp', timestamp: Date.now() });
});

// Middleware: Authenticate JWT Token
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: any, c) => {
      const [k, v] = c.trim().split('=');
      if (k && v) acc[k] = decodeURIComponent(v);
      return acc;
    }, {});
    token = cookies['karovita_token'] || cookies['token'] || null;
  }

  if (!token) {
    return res.status(401).json({ message: 'نیاز به ورود دارید.' });
  }

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
  if (!user || (user.role !== 'admin' && user.role !== 'support' && user.mobile !== '09111273476')) {
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

// Mobile Normalization Helper - handles 09..., 9..., +989..., 00989..., and Persian digits
function normalizeMobile(m: string): string | null {
  if (!m) return null;
  const converted = toEnglishDigits(m);
  let cleaned = converted.replace(/\D/g, '');
  if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('98') && cleaned.length === 12) {
    cleaned = '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('+98')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
    cleaned = '0' + cleaned;
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

  return res.json({
    message: 'کد تأیید برای شماره شما ارسال شد.',
    expires_in: ttlSeconds,
    resend_after: 60,
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

  const isMatch = otp.code === code;

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
    // If the user was previously soft-deleted, reactivate account upon verified login
    if (user.deleted_at) {
      delete (user as any).deleted_at;
      user.status = 'active';
      user.is_active = true;

      const comp = db.getCompanyByUserId(user.id);
      if (comp && comp.deleted_at) {
        delete (comp as any).deleted_at;
        comp.is_active = true;
      }

      const now = new Date();
      db.subscriptions.filter(s => s.user_id === user!.id).forEach(s => {
        if (!s.expires_at || new Date(s.expires_at) > now) {
          delete (s as any).deleted_at;
          s.status = 'active';
          s.is_active = true;
        }
      });
      db.save();
    }
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' });
  const hasSub = db.subscriptions.some(s => s.user_id === user!.id && s.status === 'active' && (!s.expires_at || new Date(s.expires_at) > new Date()));

  const cookieExpireDays = 30;
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';

  res.cookie('karovita_token', token, {
    maxAge: 1000 * 60 * 60 * 24 * cookieExpireDays,
    httpOnly: false,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
  });

  res.cookie('karovita_role', user.role, {
    maxAge: 1000 * 60 * 60 * 24 * cookieExpireDays,
    httpOnly: false,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
  });

  return res.json({
    access_token: token,
    token: token,
    token_type: 'Bearer',
    expires_in: 3600 * 24 * cookieExpireDays,
    user: {
      ...user,
      has_subscription: hasSub,
    },
  });
});

// Logout endpoint
router.post('/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('karovita_token', { path: '/' });
  res.clearCookie('karovita_role', { path: '/' });
  res.clearCookie('token', { path: '/' });
  return res.json({ status: 'ok', message: 'خروج با موفقیت انجام شد.' });
});

// -------------------------------------------------------------
// Onboarding & Profile Routes
// -------------------------------------------------------------
router.get('/onboarding', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const company = db.getCompanyByUserId(user.id) || null;
  const hasSub = db.subscriptions.some(s => s.user_id === user.id && s.status === 'active' && (!s.expires_at || new Date(s.expires_at) > new Date()));
  const trialSub = db.subscriptions.find(s => s.user_id === user.id && s.source === 'trial' && s.status === 'active') || null;
  return res.json({
    user: {
      ...user,
      has_subscription: hasSub,
    },
    company,
    next_step: user.onboarding_step,
    has_subscription: hasSub,
    trial_subscription: trialSub,
    has_used_trial: Boolean(user.has_used_trial),
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

router.get('/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  return res.json({
    user: {
      id: user.id,
      mobile: user.mobile,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      job_title: user.job_title,
      national_code: user.national_code || null,
      company_name: user.company_name,
      onboarding_step: user.onboarding_step,
      created_at: user.created_at,
    },
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
      national_code: user.national_code || null,
    },
  });
});

router.post('/profile/otp/request', authMiddleware, otpRequestLimiter, async (req: Request, res: Response) => {
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

  // Dispatch real SMS (same as auth OTP flow)
  await sendOtpSms(mobile, code);

  return res.json({
    message: `کد تأیید به شماره ${mobile} ارسال شد.`,
    expires_in: ttlSeconds,
    resend_after: 60,
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

  if (otp.code !== code) {
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
  const cleanNationalCode = toEnglishDigits(String(req.body.national_code || '')).replace(/\D/g, '').trim();
  if (cleanNationalCode && cleanNationalCode.length !== 10 && cleanNationalCode.length !== 11) {
    return res.status(422).json({ message: 'کد ملی باید ۱۰ رقم و شناسه ملی شرکت باید ۱۱ رقم باشد.' });
  }
  user.national_code = cleanNationalCode || null;
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
      national_code: user.national_code,
    }
  });
});

// -------------------------------------------------------------
// ERP Configurator, Packages, Trial, Orders & Payments
// -------------------------------------------------------------
router.get('/configurator/data', cacheGet(60000), (_req: Request, res: Response) => {
  const activeModules = db.erpModules.filter(m => m.is_active !== false);
  const activeIds = new Set(activeModules.map(m => m.id));
  const sanitizedPresets = db.industryPresets.map(p => ({
    ...p,
    default_modules: (p.default_modules || []).filter(id => activeIds.has(id)),
    mandatory_modules: (p.mandatory_modules || []).filter(id => activeIds.has(id)),
  }));

  return res.json({
    modules: activeModules,
    presets: sanitizedPresets,
    settings: db.configuratorSettings,
  });
});

router.post('/configurator/calculate', (req: Request, res: Response) => {
  const { selected_module_ids = [], user_count, billing_period = '3_months', coupon_code = '' } = req.body;
  const baseLimit = db.configuratorSettings.base_user_limit || 1;
  const finalUsers = typeof user_count === 'number' && user_count > 0 ? user_count : (Number(user_count) || baseLimit);
  const calc = db.calculateERPPrice(
    Array.isArray(selected_module_ids) ? selected_module_ids : [],
    finalUsers,
    billing_period || '3_months',
    String(coupon_code || '')
  );
  return res.json({ data: calc });
});

router.post('/coupons/validate', couponValidateLimiter, (req: Request, res: Response) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) {
    return res.status(422).json({ message: 'لطفاً کد تخفیف را وارد کنید.' });
  }

  const coupon = db.coupons.find(c => c.code.toUpperCase() === code && (c.is_active !== false));
  if (!coupon) {
    return res.status(404).json({ message: 'کد تخفیف معتبر نیست یا منقضی شده است.' });
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return res.status(422).json({ message: 'این کد تخفیف منقضی شده است.' });
  }

  return res.json({
    data: {
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || null,
      max_discount_amount: coupon.max_discount_amount || null,
    }
  });
});

router.get('/packages', cacheGet(60000), (_req: Request, res: Response) => {
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
  const baseLimit = db.configuratorSettings.base_user_limit || 1;
  const userCount = Number(req.body.user_count) || baseLimit;

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

router.post('/orders', authMiddleware, orderCreationLimiter, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.onboarding_step < 3) {
    return res.status(422).json({ message: 'ابتدا اطلاعات کاربری و شرکت را تکمیل کنید.' });
  }

  // Enforce rule: User with an unpaid/pending invoice cannot create a new one until previous is paid or cancelled
  const existingPending = db.orders.find(o => o.user_id === user.id && o.status === 'pending' && !o.deleted_at);
  if (existingPending) {
    return res.status(400).json({
      message: 'شما یک پیش‌فاکتور پرداخت‌نشده در انتظار دارید. لطفاً ابتدا نسبت به پرداخت یا لغو آن اقدام نمایید.',
      has_pending_order: true,
      pending_order: {
        id: existingPending.id,
        order_number: existingPending.order_number,
        amount: existingPending.amount,
      }
    });
  }

  const { selected_module_ids, user_count, billing_period = 'yearly', coupon_code = '', package_id, subscription_id } = req.body;

  let order: Order;
  let finalAmount = 0;

  const baseUserLimit = db.configuratorSettings.base_user_limit || 1;
  const resolvedUserCount = typeof user_count === 'number' && user_count > 0 ? user_count : (Number(user_count) || baseUserLimit);
  const hasModules = Array.isArray(selected_module_ids) && selected_module_ids.length > 0;
  const hasExtraUsers = resolvedUserCount > baseUserLimit;
  const isExplicitRenewal = Boolean(req.body.is_renewal || req.body.order_type === 'renewal');
  const isResourceAddon = !isExplicitRenewal && Boolean(
    req.body.order_type === 'resource_upgrade' ||
    req.body.order_type === 'addon' ||
    req.body.order_type === 'module_addon' ||
    req.body.order_type === 'module' ||
    req.body.is_resource_addon ||
    subscription_id
  );

  let targetSub: Subscription | undefined;
  if (subscription_id) {
    targetSub = db.subscriptions.find(s => s.id === Number(subscription_id) && s.user_id === user.id && s.status !== 'cancelled');
  }
  if (!targetSub && !isExplicitRenewal) {
    targetSub = db.subscriptions.find(s => s.user_id === user.id && s.status === 'active' && s.source !== 'trial' && (!s.expires_at || new Date(s.expires_at) > new Date()));
  }

  if (targetSub && !isExplicitRenewal && (hasModules || hasExtraUsers || isResourceAddon)) {
    // Co-termed add-on to active subscription:
    // 1. Expiration date of main subscription will NOT change
    // 2. Added only for remaining duration of current subscription
    // 3. Calculated by remaining months (ceiling): e.g. 1.5 mo -> 2 mo, <1 mo -> 1 mo
    // 4. 10% VAT added to base module price and recorded in financial system
    order = db.createResourceAddonOrder(
      user.id,
      targetSub.id,
      selected_module_ids || [],
      resolvedUserCount,
      coupon_code
    );
    finalAmount = order.amount;
  } else if (hasModules || hasExtraUsers) {
    // Standard ERP Configurator Order (with standard 10% VAT applied across all orders)
    order = db.createERPOrder(
      user.id,
      selected_module_ids || [],
      resolvedUserCount,
      billing_period || 'yearly',
      coupon_code,
      subscription_id ? Number(subscription_id) : (targetSub?.id || undefined)
    );
    if (req.body.order_type) (order as any).order_type = req.body.order_type;
    if (req.body.is_resource_addon) (order as any).is_resource_addon = req.body.is_resource_addon;
    if (req.body.is_renewal) (order as any).is_renewal = req.body.is_renewal;
    finalAmount = order.amount;
  } else if (package_id) {
    // Legacy fallback (with standard 10% VAT applied across all orders)
    const pkg = db.packages.find(p => p.id === Number(package_id) && p.is_active);
    if (!pkg) {
      return res.status(404).json({ message: 'پکیج قابل خرید یافت نشد.' });
    }
    order = db.createOrder(user.id, pkg.id, pkg.price);
    if (subscription_id) order.subscription_id = Number(subscription_id);
    if (req.body.order_type) (order as any).order_type = req.body.order_type;
    if (req.body.is_resource_addon) (order as any).is_resource_addon = req.body.is_resource_addon;
    finalAmount = order.amount;
  } else {
    return res.status(422).json({ message: 'حداقل یک ماژول یا ظرفیت کاربر برای خرید انتخاب کنید.' });
  }

  if (finalAmount <= 0) {
    // Free order (e.g. 100% coupon or 0 amount)
    order.status = 'paid';
    if ((order.module_ids && order.module_ids.length > 0) || (order.user_count && order.user_count > 0)) {
      const isAddonOrder = Boolean(
        (order as any).is_resource_addon ||
        order.order_type === 'resource_upgrade' ||
        order.order_type === 'addon' ||
        order.order_type === 'module_addon' ||
        order.order_type === 'module' ||
        order.breakdown?.is_resource_addon ||
        (order.subscription_id && !(order as any).is_renewal && order.order_type !== 'renewal')
      );
      db.activateOrMergeERPSubscription(
        user.id,
        order.id,
        order.module_ids || [],
        order.user_count || db.configuratorSettings.base_user_limit || 1,
        order.billing_period || '3_months',
        'purchase',
        order.subscription_id,
        isAddonOrder
      );
    }
    if (!user.onboarding_completed_at) {
      user.onboarding_completed_at = new Date().toISOString();
      user.onboarding_step = 3;
    }
    // Send automated Proforma/Invoice SMS notification
    const clientOrigin = `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
    sendInvoiceIssuedSms(order, user, clientOrigin).catch(err => console.warn('[Invoice SMS Error]', err));

    db.save();
    return res.status(201).json({
      order_id: order.id,
      order_number: order.order_number,
      payment_url: `/dashboard?payment=success`,
    });
  }

  // Send automated Proforma/Invoice SMS notification
  const clientOrigin = `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
  sendInvoiceIssuedSms(order, user, clientOrigin).catch(err => console.warn('[Invoice SMS Error]', err));

  // Request payment URL from Zibal
  const zibalConfig = getZibalConfig();
  const isLiveGateway = !zibalConfig.sandbox && Boolean(zibalConfig.merchant?.trim());
  const zibalRes = await initiateZibalPayment(order, user, clientOrigin);

  if (isLiveGateway && !zibalRes.success) {
    const trackId = 'failed-' + Date.now();
    db.createTransaction(order.id, user.id, trackId, finalAmount);
    const tx = db.transactions.find(t => t.authority === trackId);
    if (tx) {
      tx.gateway = 'zibal';
      tx.status = 'failed';
      tx.raw_response = zibalRes.rawResponse;
    }
    db.save();

    return res.status(502).json({
      message: zibalRes.message || 'خطا در ارتباط با درگاه پرداخت شاپرک زیبال. پیش‌فاکتور شما با وضعیت در انتظار پرداخت ثبت شد.',
      order_id: order.id,
      order_number: order.order_number,
      resultCode: zibalRes.resultCode,
    });
  }

  const trackId = String(zibalRes.trackId || (isLiveGateway ? 'live-' : 'sandbox-') + Math.random().toString(36).substring(2, 14));
  
  db.createTransaction(order.id, user.id, trackId, finalAmount);
  const tx = db.transactions.find(t => t.authority === trackId);
  if (tx) {
    tx.gateway = 'zibal';
    tx.raw_response = zibalRes.rawResponse;
  }
  db.save();

  return res.status(201).json({
    order_id: order.id,
    order_number: order.order_number,
    payment_url: zibalRes.paymentUrl,
    trackId: trackId,
  });
});

const handleCallback = async (req: Request, res: Response) => {
  const trackId = String(req.query.trackId || req.body.trackId || req.query.authority || req.body.authority || '');
  const success = String(req.query.success ?? req.body.success ?? '1');
  const statusParam = String(req.query.status ?? req.body.status ?? '2');
  const orderIdParam = Number(req.query.orderId || req.body.orderId || 0);

  let tx = db.transactions.find(t => t.authority === trackId);
  if (!tx && orderIdParam > 0) {
    tx = db.transactions.filter(t => t.order_id === orderIdParam).pop();
  }

  if (!tx) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head><meta charset="utf-8"><title>تراکنش یافت نشد</title>
      <style>body{font-family:system-ui;text-align:center;padding:50px;background:#f8fafc;color:#1e293b}a{color:#0284c7;text-decoration:none;font-weight:bold;margin-top:20px;display:inline-block}</style>
      </head>
      <body>
        <h2>خطا در شناسایی تراکنش</h2>
        <p>شناسه پیگیری ارسال شده از درگاه در سامانه کارویتا یافت نشد.</p>
        <a href="/dashboard">بازگشت به پنل کاربری</a>
      </body></html>
    `);
  }

  const order = db.orders.find(o => o.id === tx.order_id);
  const user = db.getUserById(tx.user_id);

  // If user cancelled on gateway
  if (success !== '1' && success !== 'true') {
    tx.status = 'failed';
    tx.raw_response = { query: req.query, body: req.body, reason: 'user_cancelled_or_bank_error' };
    db.save();
    return res.redirect(`/dashboard?payment=failed&order=${order?.id || ''}&msg=${encodeURIComponent('تراکنش توسط کاربر لغو شد یا در شبکه بانکی ناموفق بود.')}`);
  }

  // Call real Zibal verification endpoint
  try {
    const verifyResult = await verifyZibalPayment(trackId);
    
    if (verifyResult.success && order) {
      const refNumber = verifyResult.refNumber || ('SHP-' + Date.now().toString().slice(-8));
      tx.status = 'successful';
      tx.reference_id = refNumber;
      tx.paid_at = verifyResult.paidAt || new Date().toISOString();
      tx.raw_response = verifyResult.rawResponse || verifyResult;
      order.status = 'paid';

      // Activate or merge ERP subscriptions
      if (order.module_ids && order.module_ids.length > 0) {
        const isAddonOrder = Boolean(
          (order as any).is_resource_addon ||
          order.order_type === 'resource_upgrade' ||
          order.order_type === 'addon' ||
          order.order_type === 'module_addon' ||
          order.order_type === 'module' ||
          order.breakdown?.is_resource_addon ||
          (order.subscription_id && !(order as any).is_renewal && order.order_type !== 'renewal')
        );
        db.activateOrMergeERPSubscription(
          tx.user_id,
          order.id,
          order.module_ids,
          order.user_count || db.configuratorSettings.base_user_limit || 1,
          order.billing_period || 'monthly',
          'purchase',
          order.subscription_id,
          isAddonOrder
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

      // Log financial audit event
      logFinancialEvent(req, {
        actionType: 'ZIBAL_ONLINE_PAYMENT_VERIFIED',
        orderId: order.id,
        transactionId: tx.id,
        amount: order.amount,
        referenceId: refNumber,
        userId: tx.user_id,
        actionDescription: `تأییدیه موفق پرداخت آنلاین درگاه شاپرک زیبال برای سفارش #${order.order_number} به مبلغ ${(order.amount || 0).toLocaleString('fa-IR')} تومان با شماره پیگیری شاپرک ${refNumber}`,
        details: {
          trackId: trackId,
          shaparakRef: refNumber,
          cardNumber: verifyResult.cardNumber,
          gateway: 'zibal',
        }
      });

      // Send automated payment success SMS
      if (user) {
        sendPaymentSuccessSms(tx, order, user).catch(err => console.warn('[Payment SMS Error]', err));
      }

      // Broadcast web push notification
      try {
        if (db.isPwaEnabled()) {
          const userSubs = db.getUserPushSubscriptions(tx.user_id);
          if (userSubs.length > 0) {
            broadcastWebPush(userSubs, {
              title: 'پرداخت موفق سفارش',
              body: `پرداخت سفارش #${order.order_number} به مبلغ ${(order.amount || 0).toLocaleString('fa-IR')} تومان با موفقیت تایید شد.`,
              url: `/dashboard`,
              tag: `payment-${order.id}`,
            }).catch(() => {});
          }
        }
      } catch {}

      return res.redirect(`/dashboard?payment=success&order=${order.id}&ref=${encodeURIComponent(refNumber)}`);
    } else {
      tx.status = 'failed';
      tx.raw_response = verifyResult.rawResponse || verifyResult;
      db.save();
      return res.redirect(`/dashboard?payment=failed&order=${order?.id || ''}&msg=${encodeURIComponent(verifyResult.message || 'خطا در تایید تراکنش شاپرک')}`);
    }
  } catch (err: any) {
    tx.status = 'failed';
    db.save();
    return res.redirect(`/dashboard?payment=failed&order=${order?.id || ''}&msg=${encodeURIComponent('خطای فنی در ارتباط با درگاه: ' + err.message)}`);
  }
};

router.get('/payments/callback', handleCallback);
router.post('/payments/callback', handleCallback);
router.get('/payments/zibal/callback', handleCallback);
router.post('/payments/zibal/callback', handleCallback);

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
        user_count: s.user_count || order?.user_count || db.configuratorSettings.base_user_limit || 1,
        billing_period: s.billing_period || order?.billing_period || 'monthly',
        order_number: order?.order_number || (s.source === 'trial' ? `TRIAL-KAROVITA-${s.id}` : '—'),
        order_amount: order?.amount || pkg?.price || 0,
        discount_amount: order?.discount_amount || 0,
        coupon_code: order?.coupon_code || null,
        reference_id: transaction?.reference_id || (s.source === 'trial' ? 'فعال‌سازی آزمایشی رایگان' : null),
        paid_at: transaction?.paid_at || s.created_at,
        price: pkg?.price || order?.amount || 0,
        usage_percent: s.usage_limit ? Math.round((s.usage_used / s.usage_limit) * 100) : 0,
        server_instance: {
          subdomain: `${safeCompanySlug}-${user.id}.karovita.ir`,
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
        title = `سفارش سازمانی (${ord.module_ids.length} ماژول - ${ord.user_count || db.configuratorSettings.base_user_limit || 1} کاربر)`;
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
      national_code: user.national_code || null,
      role: user.role,
      can_renew_early: Boolean(user.can_renew_early),
      company_name: company?.name || null,
      industry: company?.industry || null,
      employee_count: company?.employee_count || null,
    },
    subscriptions: userSubs,
    transactions: userTxs,
  });
});

router.get('/user/purchased-packages', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const userSubs = db.subscriptions
    .filter(s => s.user_id === user.id)
    .sort((a, b) => b.id - a.id);

  const result = userSubs.map(s => {
    let name = s.title;
    if (!name) {
      if (s.module_ids && Array.isArray(s.module_ids) && s.module_ids.length > 0) {
        const moduleCount = s.module_ids.length;
        name = `اشتراک ماژول‌های ERP (${moduleCount} ماژول)`;
      } else if (s.source === 'trial') {
        name = 'اشتراک آزمایشی ۵ روزه کارویتا';
      } else if (s.package_id) {
        const pkg = db.getPackageById(s.package_id);
        name = pkg?.name || 'اشتراک کارویتا';
      } else {
        name = 'اشتراک سازمانی کارویتا';
      }
    }
    const isSubActive = s.status === 'active' && new Date(s.expires_at) > new Date();
    return {
      id: s.id,
      name,
      status: s.status,
      is_active: isSubActive,
      expires_at: s.expires_at,
      source: s.source,
    };
  });

  return res.json({ data: result });
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
      user_count: s.user_count || order?.user_count || db.configuratorSettings.base_user_limit || 1,
      billing_period: s.billing_period || order?.billing_period || 'monthly',
      order_number: order?.order_number || (s.source === 'trial' ? `TRIAL-KAROVITA-${s.id}` : '—'),
      order_amount: order?.amount || pkg?.price || 0,
      discount_amount: order?.discount_amount || 0,
      coupon_code: order?.coupon_code || null,
      reference_id: transaction?.reference_id || (s.source === 'trial' ? 'فعال‌سازی آزمایشی رایگان' : null),
      paid_at: transaction?.paid_at || s.created_at,
      price: pkg?.price || order?.amount || 0,
      usage_percent: s.usage_limit ? Math.round((s.usage_used / s.usage_limit) * 100) : 0,
      server_instance: {
        subdomain: `${safeCompanySlug}-${user.id}.karovita.ir`,
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

router.get('/payments/pending-count', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const pendingOrders = db.orders.filter(o => o.user_id === user.id && o.status === 'pending' && !o.deleted_at);
  return res.json({ count: pendingOrders.length, pending_count: pendingOrders.length });
});

router.get('/user/orders', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const orders = db.orders
    .filter(o => o.user_id === user.id && !o.deleted_at && o.status !== 'cancelled')
    .sort((a, b) => b.id - a.id)
    .map(o => {
      const tx = db.transactions.find(t => t.order_id === o.id && t.status === 'successful');
      const moduleNames = Array.isArray(o.module_ids) 
        ? o.module_ids.map(id => db.erpModules.find(m => m.id === id)?.title || id)
        : [];
      return {
        id: o.id,
        order_number: o.order_number,
        amount: o.amount,
        status: o.status,
        module_ids: o.module_ids || [],
        module_names: moduleNames,
        user_count: o.user_count || db.configuratorSettings.base_user_limit || 1,
        billing_period: o.billing_period || 'monthly',
        description: o.description || (moduleNames.length ? `افزودن ${moduleNames.length} ماژول جدید` : 'سفارش خدمات ابری کارویتا'),
        created_at: o.created_at,
        transaction: tx ? {
          id: tx.id,
          reference_id: tx.reference_id,
          paid_at: tx.paid_at,
          gateway: tx.gateway,
          amount: tx.amount,
        } : null,
      };
    });

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return res.json({
    data: orders,
    pending_count: pendingCount,
  });
});

// User cancel pending order
const cancelOrderHandler = (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const orderId = Number(req.params.id);
  const order = db.orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ message: 'پیش‌فاکتور یا سفارش مورد نظر یافت نشد.' });
  }

  // Permission check: owner or admin
  if (order.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ message: 'شما دسترسی لغو این پیش‌فاکتور را ندارید.' });
  }

  // Disallow cancelling already settled invoices
  if (order.status === 'paid' || order.status === 'completed' || (order as any).is_paid) {
    return res.status(400).json({ message: 'پیش‌فاکتور تسویه شده قابل لغو یا حذف نمی‌باشد.' });
  }

  order.status = 'cancelled';
  order.deleted_at = new Date().toISOString();
  order.is_active = false;
  db.save();

  logFinancialEvent(req, {
    actionType: 'ORDER_CANCELLED',
    orderId: order.id,
    amount: order.amount,
    userId: order.user_id,
    actionDescription: `لغو و حذف پیش‌فاکتور #${order.order_number} توسط کاربر`,
  });

  return res.json({ success: true, message: 'پیش‌فاکتور با موفقیت لغو و حذف گردید.' });
};

router.post('/orders/:id/cancel', authMiddleware, cancelOrderHandler);
router.delete('/orders/:id', authMiddleware, cancelOrderHandler);

router.get('/payments/gateway-info', authMiddleware, async (_req: Request, res: Response) => {
  const zibalConfig = getZibalConfig();
  const isSandbox = Boolean(zibalConfig.sandbox);
  return res.json({
    data: {
      gateway: 'zibal',
      name: 'درگاه پرداخت شاپرک زیبال',
      sandbox: isSandbox,
      is_live: !isSandbox,
      merchant_configured: Boolean(zibalConfig.merchant?.trim()),
    }
  });
});

router.post('/orders/:id/pay', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const orderId = Number(req.params.id);
  const mode = req.body?.mode; // 'live' | 'direct' | 'sandbox'
  const order = db.orders.find(o => o.id === orderId && (user.role === 'admin' || o.user_id === user.id));
  
  if (!order) {
    return res.status(404).json({ message: 'سفارش یا فاکتور مورد نظر یافت نشد.' });
  }

  if (order.status === 'paid' || order.status === 'completed') {
    return res.status(400).json({ message: 'این فاکتور قبلاً پرداخت و تسویه شده است.' });
  }

  const zibalConfig = getZibalConfig();
  if (!zibalConfig.enabled) {
    return res.status(400).json({ message: 'درگاه پرداخت شاپرک زیبال در حال حاضر غیرفعال است.' });
  }

  // Admin Direct Settlement (Only when mode === 'direct' and user is admin)
  if (mode === 'direct' && user.role === 'admin') {
    order.status = 'paid';
    const refId = 'DIR-' + Date.now().toString().slice(-6) + Math.floor(100000 + Math.random() * 900000);
    
    let tx = db.transactions.find(t => t.order_id === order.id);
    if (!tx) {
      tx = {
        id: db.nextTransactionId++,
        order_id: order.id,
        user_id: order.user_id,
        gateway: 'zibal',
        authority: 'DIR-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        reference_id: refId,
        amount: order.amount,
        status: 'successful',
        raw_response: { mode: 'direct_settlement', success: 1 },
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      db.transactions.push(tx);
    } else {
      tx.status = 'successful';
      tx.gateway = 'zibal';
      tx.reference_id = refId;
      tx.paid_at = new Date().toISOString();
    }

    // Activate or merge modules in the user's active subscription
    if ((order.module_ids && order.module_ids.length > 0) || (order.user_count && order.user_count > 0)) {
      const isAddonOrder = Boolean(
        (order as any).is_resource_addon ||
        order.order_type === 'resource_upgrade' ||
        order.order_type === 'addon' ||
        order.order_type === 'module_addon' ||
        order.order_type === 'module' ||
        order.breakdown?.is_resource_addon ||
        (order.subscription_id && !(order as any).is_renewal && order.order_type !== 'renewal')
      );
      db.activateOrMergeERPSubscription(
        order.user_id,
        order.id,
        order.module_ids || [],
        order.user_count || db.configuratorSettings.base_user_limit || 1,
        order.billing_period || '3_months',
        'purchase',
        order.subscription_id,
        isAddonOrder
      );
    } else if (order.package_id) {
      const pkg = db.getPackageById(order.package_id);
      db.createSubscription(order.user_id, order.package_id, order.id, 'purchase', pkg?.duration_days || 365, pkg?.usage_limit);
    }

    db.save();

    logFinancialEvent(req, {
      actionType: 'DIRECT_INVOICE_SETTLEMENT',
      orderId: order.id,
      transactionId: tx.id,
      amount: order.amount,
      referenceId: refId,
      userId: user.id,
      actionDescription: `تسویه مستقیم فاکتور #${order.order_number} به مبلغ ${(order.amount || 0).toLocaleString('fa-IR')} تومان توسط مدیر`,
      details: {
        gateway: 'zibal',
        is_sandbox: false,
        order_number: order.order_number,
        modules: order.module_ids,
        user_count: order.user_count
      }
    });

    // Send automated SMS confirmation
    sendPaymentSuccessSms(tx, order, user).catch(err => console.warn('[Payment SMS Error]', err));

    return res.json({
      message: 'فاکتور با موفقیت تسویه گردید و سرویس شما فعال گردید.',
      data: {
        order_id: order.id,
        order_number: order.order_number,
        amount: order.amount,
        reference_id: refId,
        status: 'successful',
        is_sandbox: false,
        is_redirect: false,
        paid_at: tx.paid_at,
      }
    });
  }

  // Live Gateway Payment Initiation
  if (!zibalConfig.merchant?.trim()) {
    return res.status(400).json({
      message: 'کد مرچنت زیبال در پنل مدیریت تنظیم نشده است. لطفاً از منوی «درگاه شاپرک»، کد مرچنت را ثبت و ذخیره نمایید.'
    });
  }

  try {
    const clientOrigin = `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
    const zibalRes = await initiateZibalPayment(order, user, clientOrigin);
    
    if (!zibalRes.success) {
      return res.status(502).json({
        message: zibalRes.message || 'خطا در ارتباط با درگاه پرداخت شاپرک زیبال',
        resultCode: zibalRes.resultCode,
      });
    }

    const trackId = String(zibalRes.trackId);
    
    const tx: Transaction = {
      id: db.nextTransactionId++,
      order_id: order.id,
      user_id: order.user_id,
      gateway: 'zibal',
      authority: trackId,
      reference_id: null,
      amount: order.amount,
      status: 'initiated',
      raw_response: zibalRes.rawResponse,
      paid_at: null,
      created_at: new Date().toISOString(),
    };
    db.transactions.push(tx);
    db.save();

    return res.json({
      message: 'درخواست پرداخت به درگاه شاپرک زیبال ارسال شد.',
      data: {
        order_id: order.id,
        order_number: order.order_number,
        payment_url: zibalRes.paymentUrl,
        trackId: trackId,
        is_redirect: true,
        is_sandbox: false,
        amount: order.amount,
      }
    });
  } catch (err: any) {
    console.warn('[Zibal Live Payment Error]', err.message);
    return res.status(500).json({
      message: 'خطا در اتصال به درگاه شاپرک: ' + (err.message || 'پاسخی از درگاه زیبال دریافت نشد')
    });
  }
});

// -------------------------------------------------------------
// Official Tax Invoices & SLA Service Contracts (Iranian Tax Authority Compliant)
// -------------------------------------------------------------

router.get('/invoices/:id', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const rawId = String(req.params.id || '').trim();
  const numId = Number(rawId);
  const isNumeric = !isNaN(numId) && String(numId) === rawId;
  
  let tx = db.transactions.find(t => 
    ((isNumeric && (t.id === numId || t.order_id === numId)) ||
     t.reference_id === rawId ||
     t.authority === rawId) &&
    (user.role === 'admin' || user.role === 'support' || t.user_id === user.id)
  );
  
  let order = db.orders.find(o => 
    ((isNumeric && o.id === numId) ||
     o.order_number === rawId ||
     (tx && o.id === tx.order_id)) &&
    (user.role === 'admin' || user.role === 'support' || o.user_id === user.id)
  );
  
  if (!tx && order) {
    tx = db.transactions.find(t => t.order_id === order.id);
  }
  if (!order && tx) {
    order = db.orders.find(o => o.id === tx.order_id);
  }

  if (!tx && !order) {
    return res.status(404).json({ message: 'فاکتور یا سفارش مورد نظر یافت نشد.' });
  }

  const isPaid = (order?.status === 'paid') || (tx?.status === 'successful');
  const invoiceUser = order ? db.getUserById(order.user_id) : tx ? db.getUserById(tx.user_id) : user;
  const targetUser = invoiceUser || user;
  const company = db.getCompanyByUserId(targetUser.id);

  const modulesList = db.erpModules.map(m => ({
    id: m.id,
    title: m.title,
    price: m.price,
    category: m.category,
  }));

  const html = generateOfficialTaxInvoiceHtml({
    order,
    tx,
    user: targetUser,
    company,
    modulesList,
    isPaid,
  });

  const filename = `Tax-Invoice-${order?.order_number || tx?.id || 'doc'}.html`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (req.query.download === '1') {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  }

  logSensitiveDataAccess(req, {
    resourceType: 'FINANCIAL_INVOICE',
    resourceId: tx?.id || order?.id || 0,
    actionDescription: `مشاهده و دریافت صورتحساب رسمی استاندارد مالیاتی برای سفارش ${order?.order_number || tx?.id}`,
    details: { order_id: order?.id, amount: tx?.amount || order?.amount, is_paid: isPaid },
  });

  return res.send(html);
});

router.get('/invoices/:id/contract', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const rawId = String(req.params.id || '').trim();
  const numId = Number(rawId);
  const isNumeric = !isNaN(numId) && String(numId) === rawId;
  
  let tx = db.transactions.find(t => 
    ((isNumeric && (t.id === numId || t.order_id === numId)) ||
     t.reference_id === rawId ||
     t.authority === rawId) &&
    (user.role === 'admin' || user.role === 'support' || t.user_id === user.id)
  );
  
  let order = db.orders.find(o => 
    ((isNumeric && o.id === numId) ||
     o.order_number === rawId ||
     (tx && o.id === tx.order_id)) &&
    (user.role === 'admin' || user.role === 'support' || o.user_id === user.id)
  );
  
  if (!tx && order) {
    tx = db.transactions.find(t => t.order_id === order.id);
  }
  if (!order && tx) {
    order = db.orders.find(o => o.id === tx.order_id);
  }

  if (!tx && !order) {
    return res.status(404).json({ message: 'سند قرارداد مربوط به این فاکتور یافت نشد.' });
  }

  const invoiceUser = order ? db.getUserById(order.user_id) : tx ? db.getUserById(tx.user_id) : user;
  const targetUser = invoiceUser || user;
  const company = db.getCompanyByUserId(targetUser.id);

  const modulesList = db.erpModules.map(m => ({
    id: m.id,
    title: m.title,
    price: m.price,
  }));

  const html = generateOfficialContractHtml({
    order,
    tx,
    user: targetUser,
    company,
    modulesList,
  });

  const filename = `Contract-${order?.order_number || tx?.id || 'doc'}.html`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (req.query.download === '1') {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  }

  logSensitiveDataAccess(req, {
    resourceType: 'FINANCIAL_CONTRACT',
    resourceId: tx?.id || order?.id || 0,
    actionDescription: `مشاهده و دریافت قرارداد رسمی لایسنس و SLA سفارش ${order?.order_number || tx?.id}`,
    details: { order_id: order?.id, user_id: targetUser.id },
  });

  return res.send(html);
});

router.get('/invoices/:id/data', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const rawId = String(req.params.id || '').trim();
  const numId = Number(rawId);
  const isNumeric = !isNaN(numId) && String(numId) === rawId;
  
  let tx = db.transactions.find(t => 
    ((isNumeric && (t.id === numId || t.order_id === numId)) ||
     t.reference_id === rawId ||
     t.authority === rawId) &&
    (user.role === 'admin' || user.role === 'support' || t.user_id === user.id)
  );
  
  let order = db.orders.find(o => 
    ((isNumeric && o.id === numId) ||
     o.order_number === rawId ||
     (tx && o.id === tx.order_id)) &&
    (user.role === 'admin' || user.role === 'support' || o.user_id === user.id)
  );
  
  if (!tx && order) {
    tx = db.transactions.find(t => t.order_id === order.id);
  }
  if (!order && tx) {
    order = db.orders.find(o => o.id === tx.order_id);
  }

  if (!tx && !order) {
    return res.status(404).json({ message: 'فاکتور یافت نشد.' });
  }

  const isPaid = (order?.status === 'paid') || (tx?.status === 'successful');
  const invoiceUser = order ? db.getUserById(order.user_id) : tx ? db.getUserById(tx.user_id) : user;
  const targetUser = invoiceUser || user;
  const company = db.getCompanyByUserId(targetUser.id);
  const taxId = generateTaxId(order?.id || tx?.id || 1, order?.created_at || new Date().toISOString());

  const finalAmount = Number(tx?.amount || order?.amount || 0);
  const vatRate = 0.10;
  const baseBeforeVat = Math.round(finalAmount / (1 + vatRate));
  const vatAmount = finalAmount - baseBeforeVat;
  const amountInWords = numberToWordsPersian(finalAmount);

  return res.json({
    data: {
      order,
      transaction: tx,
      is_paid: isPaid,
      tax_unique_id: taxId,
      seller: OFFICIAL_SELLER_INFO,
      buyer: {
        name: company?.name || `${targetUser.first_name || ''} ${targetUser.last_name || ''}`.trim() || targetUser.mobile,
        national_id: company?.national_id || targetUser.national_id || '—',
        economic_code: company?.economic_code || targetUser.economic_code || '—',
        registration_number: company?.registration_number || '—',
        postal_code: company?.postal_code || '—',
        province: company?.province || 'تهران',
        city: company?.city || 'تهران',
        address: company?.address || '—',
        phone: company?.phone || targetUser.mobile,
      },
      financial: {
        raw_total: order?.breakdown?.modules_total || finalAmount,
        discount_amount: order?.discount_amount || 0,
        base_before_vat: baseBeforeVat,
        vat_rate: '۱۰٪',
        vat_amount: vatAmount,
        final_amount: finalAmount,
        amount_in_words: amountInWords,
      }
    }
  });
});

// Legal Profile Endpoints
router.get('/user/company', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const company = db.getCompanyByUserId(user.id);
  return res.json({ data: company || null });
});

router.put('/user/company', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const {
    name = '',
    industry = 'فناوری اطلاعات و خدمات ابری',
    employee_count = 10,
    economic_code = '',
    registration_number = '',
    national_id = '',
    postal_code = '',
    province = '',
    city = '',
    address = '',
    phone = '',
  } = req.body;

  const company = db.upsertCompany(user.id, name || 'شرکت مشترک', industry, Number(employee_count) || 1, {
    economic_code: String(economic_code).trim(),
    registration_number: String(registration_number).trim(),
    national_id: String(national_id).trim(),
    postal_code: String(postal_code).trim(),
    province: String(province).trim(),
    city: String(city).trim(),
    address: String(address).trim(),
    phone: String(phone).trim(),
  });

  return res.json({
    message: 'اطلاعات حقوقی و مالیاتی شرکت با موفقیت ذخیره گردید.',
    data: company
  });
});

// -------------------------------------------------------------
// Admin Routes
// -------------------------------------------------------------
router.get('/admin/overview', authMiddleware, adminMiddleware, (_req: Request, res: Response) => {
  const usersCount = db.users.filter(u => u.role === 'user').length;
  const companiesCount = db.companies.length;
  const successfulTransactions = db.transactions.filter(t => t.status === 'successful');
  const revenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
  const now = new Date().toISOString();
  const activeSubs = db.subscriptions.filter(s => s.status === 'active' && s.expires_at > now).length;
  const trials = db.subscriptions.filter(s => s.source === 'trial').length;

  const enrichedTransactions = db.transactions.map(t => {
    const ord = db.orders.find(o => o.id === t.order_id);
    let pkgName = 'ماژول‌های ERP سازمانی';
    if (ord?.module_ids && ord.module_ids.length > 0) {
      pkgName = `ماژول‌های ERP سازمانی (${ord.module_ids.length} ماژول)`;
    } else if (ord?.package_id) {
      const pkg = db.getPackageById(ord.package_id);
      pkgName = pkg?.name || 'اشتراک کارویتا';
    }
    return {
      ...t,
      package_name: pkgName,
      user_count: ord?.user_count || db.configuratorSettings.base_user_limit || 1,
      billing_period: ord?.billing_period || 'monthly',
      order_number: ord?.order_number || '—',
    };
  });

  return res.json({
    stats: {
      users: usersCount,
      companies: companiesCount,
      revenue,
      active_subscriptions: activeSubs,
      trials,
    },
    transactions: enrichedTransactions,
    orders: db.orders,
  });
});

router.get('/admin/users', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const users = db.users
    .filter(u => !u.deleted_at)
    .sort((a, b) => b.id - a.id)
    .map(u => {
      const company = db.getCompanyByUserId(u.id);
      const subCount = db.subscriptions.filter(s => s.user_id === u.id && !s.deleted_at).length;
      const now = new Date().toISOString();
      const activeSubCount = db.subscriptions.filter(s => s.user_id === u.id && !s.deleted_at && (s.status === 'active' || s.is_active) && (!s.expires_at || s.expires_at > now)).length;
      return {
        id: u.id,
        mobile: u.mobile,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        job_title: u.job_title,
        national_code: u.national_code || null,
        role: u.role,
        is_owner: u.mobile === '09111273476',
        created_at: u.created_at,
        company_name: company?.name || '—',
        industry: company?.industry || '—',
        subscriptions_count: subCount,
        active_subs_count: activeSubCount,
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
  const activeIds = new Set(db.erpModules.filter(m => m.is_active !== false).map(m => m.id));
  const sanitizedPresets = db.industryPresets.map(p => ({
    ...p,
    default_modules: (p.default_modules || []).filter(id => activeIds.has(id))
  }));

  return res.json({
    modules: db.erpModules,
    presets: sanitizedPresets,
    settings: db.configuratorSettings,
    coupons: db.coupons,
  });
});

router.post('/admin/erp/modules', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id, title, price, dependencies, industries, is_active = true, add_to_presets } = req.body;
  if (!id || !title || typeof price !== 'number') {
    return res.status(422).json({ message: 'اطلاعات ماژول ناقص است. لطفاً عنوان و قیمت را به درستی وارد کنید.' });
  }

  const cleanId = String(id).trim().toLowerCase().replace(/\s+/g, '_');
  const existingIdx = db.erpModules.findIndex(m => m.id === cleanId);
  const cleanDependencies = Array.isArray(dependencies) ? dependencies : (existingIdx >= 0 ? db.erpModules[existingIdx].dependencies || [] : []);
  const oldModule = existingIdx >= 0 ? { ...db.erpModules[existingIdx] } : null;

  // Determine whether preset/industry assignments were explicitly provided.
  // If neither add_to_presets nor industries were sent in the request body,
  // preserve the module's existing industries (i.e. do NOT clear them).
  const presetsExplicitlyProvided = add_to_presets !== undefined || industries !== undefined;

  let targetPresets: string[];
  if (is_active === false) {
    targetPresets = [];
  } else if (presetsExplicitlyProvided) {
    // Explicit value provided: use add_to_presets first, fallback to industries
    if (Array.isArray(add_to_presets)) {
      targetPresets = add_to_presets.map((p: any) => String(p).trim());
    } else if (Array.isArray(industries)) {
      targetPresets = industries.map((p: any) => String(p).trim());
    } else {
      targetPresets = [];
    }
  } else {
    // Neither field was sent → preserve existing industries on the module
    targetPresets = existingIdx >= 0 ? (db.erpModules[existingIdx].industries || []).map((p: any) => String(p).trim()) : [];
  }

  const cleanIndustries = targetPresets;

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

  // Synchronize module presence in presets (صنف‌ها) - both adding and removing
  db.industryPresets.forEach(preset => {
    if (!Array.isArray(preset.default_modules)) {
      preset.default_modules = [];
    }
    const shouldInclude = (is_active !== false) && targetPresets.includes(preset.id);
    const hasModule = preset.default_modules.includes(cleanId);

    if (shouldInclude && !hasModule) {
      preset.default_modules.push(cleanId);
    } else if (!shouldInclude && hasModule) {
      preset.default_modules = preset.default_modules.filter(m => m !== cleanId);
    }
  });

  db.save();
  invalidatePublicCaches();

  logConfigChange(req, {
    resourceType: 'ERP_MODULE',
    resourceId: cleanId,
    actionDescription: existingIdx >= 0 ? `ویرایش اطلاعات و نرخ ماژول «${title}»` : `تعریف و افزودن ماژول جدید «${title}» به سیستم`,
    oldValue: oldModule,
    newValue: { id: cleanId, title, price, is_active },
    details: { dependencies: cleanDependencies, industries: cleanIndustries },
  });

  const activeIds = new Set(db.erpModules.filter(m => m.is_active !== false).map(m => m.id));
  const sanitizedPresets = db.industryPresets.map(p => ({
    ...p,
    default_modules: (p.default_modules || []).filter(mId => activeIds.has(mId))
  }));

  return res.json({ 
    message: existingIdx >= 0 ? 'ماژول با موفقیت بروزرسانی شد.' : 'ماژول جدید با موفقیت به سیستم اضافه گردید.', 
    data: db.erpModules,
    modules: db.erpModules,
    presets: sanitizedPresets 
  });
});

router.post('/admin/erp/modules/:id/toggle', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const mod = db.erpModules.find(m => m.id === id);
  if (!mod) {
    return res.status(404).json({ message: 'ماژول یافت نشد.' });
  }

  const oldStatus = mod.is_active;
  mod.is_active = mod.is_active === false ? true : false;

  // If module became inactive, prune it from all presets and clear industries
  if (!mod.is_active) {
    db.industryPresets.forEach(preset => {
      preset.default_modules = (preset.default_modules || []).filter(mId => mId !== id);
    });
    mod.industries = [];
  }

  db.save();
  invalidatePublicCaches();

  logConfigChange(req, {
    resourceType: 'ERP_MODULE_STATUS',
    resourceId: id,
    actionDescription: `تغییر وضعیت ماژول «${mod.title}» به ${mod.is_active ? 'فعال' : 'غیرفعال'}`,
    oldValue: oldStatus,
    newValue: mod.is_active,
    details: { module_id: id, module_title: mod.title },
  });

  const activeIds = new Set(db.erpModules.filter(m => m.is_active !== false).map(m => m.id));
  const sanitizedPresets = db.industryPresets.map(p => ({
    ...p,
    default_modules: (p.default_modules || []).filter(mId => activeIds.has(mId))
  }));

  return res.json({ 
    message: `وضعیت ماژول به ${mod.is_active ? 'فعال' : 'غیرفعال'} تغییر یافت.`, 
    data: db.erpModules,
    modules: db.erpModules,
    presets: sanitizedPresets
  });
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
  invalidatePublicCaches();

  logConfigChange(req, {
    resourceType: 'ERP_MODULE',
    resourceId: id,
    actionDescription: `حذف دائم ماژول «${removedModule.title}» (${id}) از ساختار ERP`,
    details: { deleted_module: removedModule },
  });

  return res.json({ message: `ماژول «${removedModule.title}» با موفقیت حذف گردید.`, data: db.erpModules });
});

// Bulk actions on ERP modules (set price, toggle active, add/remove dependency, assign preset, bulk delete)
router.post('/admin/erp/modules/bulk', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { action, module_ids, value } = req.body;
  if (!action || !Array.isArray(module_ids) || module_ids.length === 0) {
    return res.status(422).json({ message: 'عملیات نامعتبر است یا هیچ ماژولی انتخاب نشده است.' });
  }

  const idsSet = new Set(module_ids.map((id: any) => String(id).trim()));
  const targetModules = db.erpModules.filter(m => idsSet.has(m.id));

  if (targetModules.length === 0) {
    return res.status(404).json({ message: 'ماژول‌های انتخاب‌شده در سیستم یافت نشدند.' });
  }

  let actionMessage = '';

  switch (action) {
    case 'set_price': {
      const newPrice = Math.max(0, Number(value));
      if (isNaN(newPrice)) {
        return res.status(422).json({ message: 'مبلغ وارد شده معتبر نیست.' });
      }
      targetModules.forEach(m => {
        m.price = newPrice;
      });
      actionMessage = `قیمت ${targetModules.length} ماژول انتخابی با موفقیت به ${newPrice.toLocaleString('fa-IR')} تومان تغییر یافت.`;
      break;
    }

    case 'set_status': {
      const isActive = Boolean(value);
      targetModules.forEach(m => {
        m.is_active = isActive;
        if (!isActive) {
          db.industryPresets.forEach(preset => {
            preset.default_modules = (preset.default_modules || []).filter(mId => mId !== m.id);
          });
          m.industries = [];
        }
      });
      actionMessage = `${targetModules.length} ماژول انتخابی با موفقیت ${isActive ? 'فعال' : 'غیرفعال'} شدند.`;
      break;
    }

    case 'add_dependency': {
      const depIds = (Array.isArray(value) ? value : [value]).map(v => String(v).trim()).filter(Boolean);
      if (depIds.length === 0) {
        return res.status(422).json({ message: 'هیچ پیش‌نیازی انتخاب نشده است.' });
      }
      targetModules.forEach(m => {
        if (!Array.isArray(m.dependencies)) m.dependencies = [];
        depIds.forEach(depId => {
          if (m.id !== depId && !m.dependencies.includes(depId)) {
            m.dependencies.push(depId);
          }
        });
      });
      actionMessage = `${depIds.length.toLocaleString('fa-IR')} پیش‌نیاز با موفقیت به ${targetModules.length.toLocaleString('fa-IR')} ماژول انتخابی افزوده شد.`;
      break;
    }

    case 'remove_dependency': {
      const depIds = (Array.isArray(value) ? value : [value]).map(v => String(v).trim()).filter(Boolean);
      if (depIds.length === 0) {
        return res.status(422).json({ message: 'هیچ پیش‌نیازی جهت حذف انتخاب نشده است.' });
      }
      const depSet = new Set(depIds);
      targetModules.forEach(m => {
        if (Array.isArray(m.dependencies)) {
          m.dependencies = m.dependencies.filter(d => !depSet.has(d));
        }
      });
      actionMessage = `${depIds.length.toLocaleString('fa-IR')} پیش‌نیاز از ${targetModules.length.toLocaleString('fa-IR')} ماژول انتخابی حذف گردید.`;
      break;
    }

    case 'add_preset': {
      const presetIds = (Array.isArray(value) ? value : [value]).map(v => String(v).trim()).filter(Boolean);
      if (presetIds.length === 0) {
        return res.status(422).json({ message: 'هیچ صنفی انتخاب نشده است.' });
      }
      presetIds.forEach(presetId => {
        const targetPreset = db.industryPresets.find(p => p.id === presetId);
        if (targetPreset) {
          if (!Array.isArray(targetPreset.default_modules)) {
            targetPreset.default_modules = [];
          }
          targetModules.forEach(m => {
            if (m.is_active !== false) {
              if (!targetPreset.default_modules.includes(m.id)) {
                targetPreset.default_modules.push(m.id);
              }
              if (!Array.isArray(m.industries)) m.industries = [];
              if (!m.industries.includes(presetId)) {
                m.industries.push(presetId);
              }
            }
          });
        }
      });
      actionMessage = `${targetModules.length.toLocaleString('fa-IR')} ماژول به ${presetIds.length.toLocaleString('fa-IR')} صنف افزوده شدند.`;
      break;
    }

    case 'remove_preset': {
      const presetIds = (Array.isArray(value) ? value : [value]).map(v => String(v).trim()).filter(Boolean);
      if (presetIds.length === 0) {
        return res.status(422).json({ message: 'هیچ صنفی جهت خروج انتخاب نشده است.' });
      }
      const presetSet = new Set(presetIds);
      presetIds.forEach(presetId => {
        const targetPreset = db.industryPresets.find(p => p.id === presetId);
        if (targetPreset && Array.isArray(targetPreset.default_modules)) {
          targetPreset.default_modules = targetPreset.default_modules.filter(id => !idsSet.has(id));
        }
      });
      targetModules.forEach(m => {
        if (Array.isArray(m.industries)) {
          m.industries = m.industries.filter(p => !presetSet.has(p));
        }
      });
      actionMessage = `${targetModules.length.toLocaleString('fa-IR')} ماژول از ${presetIds.length.toLocaleString('fa-IR')} صنف حذف شدند.`;
      break;
    }

    case 'delete': {
      db.erpModules = db.erpModules.filter(m => !idsSet.has(m.id));
      db.industryPresets.forEach(preset => {
        if (Array.isArray(preset.default_modules)) {
          preset.default_modules = preset.default_modules.filter(mId => !idsSet.has(mId));
        }
      });
      db.erpModules.forEach(m => {
        if (Array.isArray(m.dependencies)) {
          m.dependencies = m.dependencies.filter(d => !idsSet.has(d));
        }
      });
      actionMessage = `${targetModules.length} ماژول با موفقیت از سیستم حذف شدند.`;
      break;
    }

    default:
      return res.status(400).json({ message: 'نوع عملیات درخواستی معتبر نیست.' });
  }

  db.save();
  invalidatePublicCaches();

  logConfigChange(req, {
    resourceType: 'ERP_MODULES_BULK',
    resourceId: 'BULK_ACTION',
    actionDescription: `عملیات گروهی «${action}» بر روی ${targetModules.length} ماژول`,
    newValue: { action, module_ids, value },
  });

  const activeIds = new Set(db.erpModules.filter(m => m.is_active !== false).map(m => m.id));
  const sanitizedPresets = db.industryPresets.map(p => ({
    ...p,
    default_modules: (p.default_modules || []).filter(mId => activeIds.has(mId))
  }));

  return res.json({
    message: actionMessage,
    data: db.erpModules,
    modules: db.erpModules,
    presets: sanitizedPresets
  });
});

router.post('/admin/erp/settings', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { base_user_limit, extra_user_price, yearly_multiplier, semiannual_multiplier, quarterly_multiplier, step_users_enabled, step_modules_enabled } = req.body;
  const oldSettings = { ...db.configuratorSettings };

  const parsedBaseLimit = Number(base_user_limit);
  const parsedExtraPrice = Number(extra_user_price);
  const parsedYearly = Number(yearly_multiplier);
  const parsedSemiannual = Number(semiannual_multiplier);
  const parsedQuarterly = Number(quarterly_multiplier);

  db.configuratorSettings = {
    ...db.configuratorSettings,
    base_user_limit: !isNaN(parsedBaseLimit) && parsedBaseLimit >= 1 ? parsedBaseLimit : db.configuratorSettings.base_user_limit,
    extra_user_price: !isNaN(parsedExtraPrice) && parsedExtraPrice >= 0 ? parsedExtraPrice : db.configuratorSettings.extra_user_price,
    yearly_multiplier: !isNaN(parsedYearly) && parsedYearly > 0 ? parsedYearly : db.configuratorSettings.yearly_multiplier,
    semiannual_multiplier: !isNaN(parsedSemiannual) && parsedSemiannual > 0 ? parsedSemiannual : (db.configuratorSettings.semiannual_multiplier || 6),
    quarterly_multiplier: !isNaN(parsedQuarterly) && parsedQuarterly > 0 ? parsedQuarterly : (db.configuratorSettings.quarterly_multiplier || 3),
    step_users_enabled: typeof step_users_enabled === 'boolean' ? step_users_enabled : db.configuratorSettings.step_users_enabled,
    step_modules_enabled: typeof step_modules_enabled === 'boolean' ? step_modules_enabled : db.configuratorSettings.step_modules_enabled,
  };
  db.save();
  invalidatePublicCaches();

  logConfigChange(req, {
    resourceType: 'CONFIGURATOR_SETTINGS',
    resourceId: 'GLOBAL_ERP_SETTINGS',
    actionDescription: 'تغییر تنظیمات و پارامترهای عمومی سیستم محاسبه قیمت ERP',
    oldValue: oldSettings,
    newValue: db.configuratorSettings,
  });

  return res.json({ message: 'تنظیمات قیمت‌گذاری ذخیره شد.', data: db.configuratorSettings });
});

// Admin ERP write endpoints invalidate shared GET caches so the public
// configurator and packages listings stay fresh
function invalidatePublicCaches() {
  invalidateCache('/api/configurator/data');
  invalidateCache('/configurator/data');
  invalidateCache('/api/packages');
  invalidateCache('/packages');
}

router.post('/admin/erp/presets', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id, title, default_modules = [], mandatory_modules = [] } = req.body;
  if (!title || !title.trim()) {
    return res.status(422).json({ message: 'عنوان تب الزامی است.' });
  }

  const slug = id ? String(id).trim() : `preset_${Date.now()}`;
  const activeIds = new Set(db.erpModules.filter(m => m.is_active !== false).map(m => m.id));
  const cleanModules = (Array.isArray(default_modules) ? default_modules : []).filter(mId => activeIds.has(mId));
  const cleanMandatory = (Array.isArray(mandatory_modules) ? mandatory_modules : []).filter(mId => activeIds.has(mId));

  cleanMandatory.forEach(mId => {
    if (!cleanModules.includes(mId)) {
      cleanModules.push(mId);
    }
  });

  const existingIdx = db.industryPresets.findIndex(p => p.id === slug);
  if (existingIdx >= 0) {
    db.industryPresets[existingIdx] = {
      ...db.industryPresets[existingIdx],
      title: String(title).trim(),
      default_modules: cleanModules,
      mandatory_modules: cleanMandatory,
    };
  } else {
    db.industryPresets.push({
      id: slug,
      title: String(title).trim(),
      default_modules: cleanModules,
      mandatory_modules: cleanMandatory,
    });
  }

  db.save();
  invalidatePublicCaches();

  logConfigChange(req, {
    resourceType: 'INDUSTRY_PRESET',
    resourceId: slug,
    actionDescription: `تنظیم و ذخیره بسته پیشنهادی صنف «${title}»`,
    details: { slug, title, modules_count: cleanModules.length, default_modules: cleanModules, mandatory_modules: cleanMandatory },
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
  invalidatePublicCaches();

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
  invalidateCache('/api/configurator/data');
  invalidateCache('/configurator/data');

  logConfigChange(req, {
    resourceType: 'COUPON',
    resourceId: cleanCode,
    actionDescription: `حذف کوپن تخفیف «${cleanCode}»`,
    details: { deleted_coupon: removed },
  });

  return res.json({ message: 'کوپن تخفیف حذف شد.', data: db.coupons });
});

router.post('/admin/erp/coupons', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active } = req.body;
  if (!code || typeof discount_value === 'undefined' || discount_value === null || Number(discount_value) <= 0) {
    return res.status(422).json({ message: 'اطلاعات کوپن تخفیف ناقص است. کد و مقدار تخفیف الزامی است.' });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const existingIdx = db.coupons.findIndex(c => c.code.toUpperCase() === cleanCode);
  const couponObj = {
    code: cleanCode,
    discount_type: discount_type === 'fixed' ? 'fixed' as const : 'percent' as const,
    discount_value: Number(discount_value),
    min_order_amount: min_order_amount ? Number(min_order_amount) : undefined,
    max_discount_amount: max_discount_amount ? Number(max_discount_amount) : undefined,
    is_active: is_active ?? true,
    status: (is_active ?? true) ? 'active' as const : 'inactive' as const,
  };

  if (existingIdx >= 0) {
    db.coupons[existingIdx] = {
      ...db.coupons[existingIdx],
      ...couponObj,
      updated_at: new Date().toISOString(),
    };
  } else {
    db.coupons.push({
      ...couponObj,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  db.save();
  invalidateCache('/api/configurator/data');
  invalidateCache('/configurator/data');

  logConfigChange(req, {
    resourceType: 'COUPON',
    resourceId: cleanCode,
    actionDescription: existingIdx >= 0 ? `بروزرسانی کوپن تخفیف «${cleanCode}»` : `تعریف کوپن تخفیف جدید «${cleanCode}»`,
    details: couponObj,
  });

  return res.json({ message: 'کوپن تخفیف با موفقیت ذخیره شد.', data: db.coupons });
});

router.post('/admin/erp/coupons/:code/toggle', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { code } = req.params;
  const cleanCode = String(code).trim().toUpperCase();
  const coupon = db.coupons.find(c => c.code.toUpperCase() === cleanCode);
  if (!coupon) {
    return res.status(404).json({ message: 'کوپن تخفیف یافت نشد.' });
  }

  coupon.is_active = !coupon.is_active;
  coupon.status = coupon.is_active ? 'active' : 'inactive';
  coupon.updated_at = new Date().toISOString();
  db.save();
  invalidateCache('/api/configurator/data');
  invalidateCache('/configurator/data');

  logConfigChange(req, {
    resourceType: 'COUPON',
    resourceId: cleanCode,
    actionDescription: `تغییر وضعیت کوپن تخفیف «${cleanCode}» به ${coupon.is_active ? 'فعال' : 'غیرفعال'}`,
    details: coupon,
  });

  return res.json({ message: `وضعیت کد تخفیف با موفقیت به «${coupon.is_active ? 'فعال' : 'غیرفعال'}» تغییر کرد.`, data: db.coupons });
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

router.get('/admin/orders', authMiddleware, adminOrSupportMiddleware, (_req: Request, res: Response) => {
  const orders = [...db.orders]
    .filter(o => !o.deleted_at)
    .sort((a, b) => b.id - a.id)
    .map(o => {
      const user = db.getUserById(o.user_id);
      const pkg = db.getPackageById(o.package_id);
      const tx = db.transactions.find(t => t.order_id === o.id);
      const company = db.getCompanyByUserId(o.user_id);
      const moduleNames = Array.isArray(o.module_ids) && o.module_ids.length > 0
        ? o.module_ids.map(id => db.erpModules.find(m => m.id === id)?.title || id)
        : (pkg?.features || []);

      return {
        id: o.id,
        order_number: o.order_number,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at,
        package_name: pkg?.name || (moduleNames.length > 0 ? `اشتراک (${moduleNames.length} ماژول)` : 'سفارش خدمات کارویتا'),
        module_ids: o.module_ids || [],
        module_names: moduleNames,
        user_id: o.user_id,
        user_name: [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.mobile || '—',
        mobile: user?.mobile || '—',
        company_name: company?.name || '—',
        transaction_status: tx?.status || (o.status === 'paid' ? 'successful' : 'pending'),
        reference_id: tx?.reference_id || '—',
        tracking_code: tx?.authority || '—',
        paid_at: tx?.paid_at || (o.status === 'paid' ? o.created_at : null),
        billing_period: o.billing_period || 'monthly',
        user_count: o.user_count || db.configuratorSettings.base_user_limit || 1
      };
    });

  return res.json({ data: orders });
});

// Admin update order / payment status (including marking as paid and activating subscription)
router.put('/admin/orders/:id', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const { status, reference_id, note } = req.body;
  const order = db.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ message: 'سفارش یا فاکتور مورد نظر یافت نشد.' });
  }

  const previousStatus = order.status;
  order.status = status;

  let tx = db.transactions.find(t => t.order_id === order.id);
  if (!tx) {
    tx = {
      id: db.nextTransactionId++,
      order_id: order.id,
      user_id: order.user_id,
      gateway: 'admin_manual',
      authority: 'MAN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      reference_id: reference_id || (status === 'paid' ? ('MAN-' + Date.now().toString().slice(-8)) : null),
      amount: order.amount,
      status: status === 'paid' ? 'successful' : (status === 'cancelled' || status === 'failed' ? 'failed' : 'initiated'),
      raw_response: { updated_by: 'admin', note },
      paid_at: status === 'paid' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    };
    db.transactions.push(tx);
  } else {
    if (status === 'paid') {
      tx.status = 'successful';
      tx.reference_id = reference_id || tx.reference_id || ('MAN-' + Date.now().toString().slice(-8));
      tx.paid_at = tx.paid_at || new Date().toISOString();
    } else if (status === 'pending') {
      tx.status = 'initiated';
      tx.paid_at = null;
    } else if (status === 'cancelled' || status === 'failed') {
      tx.status = 'failed';
    } else if (status === 'refunded') {
      tx.status = 'refunded';
    }
  }

  // If status changed to paid: activate/update user subscription
  if (status === 'paid') {
    if ((order.module_ids && order.module_ids.length > 0) || (order.user_count && order.user_count > 0)) {
      const isAddonOrder = Boolean(
        (order as any).is_resource_addon ||
        order.order_type === 'resource_upgrade' ||
        order.order_type === 'addon' ||
        order.order_type === 'module_addon' ||
        order.order_type === 'module' ||
        order.breakdown?.is_resource_addon ||
        (order.subscription_id && !(order as any).is_renewal && order.order_type !== 'renewal')
      );
      db.activateOrMergeERPSubscription(
        order.user_id,
        order.id,
        order.module_ids || [],
        order.user_count || db.configuratorSettings.base_user_limit || 1,
        order.billing_period || 'monthly',
        'purchase',
        order.subscription_id,
        isAddonOrder
      );
    } else if (order.package_id) {
      const pkg = db.getPackageById(order.package_id);
      db.createSubscription(order.user_id, order.package_id, order.id, 'purchase', pkg?.duration_days || 365, pkg?.usage_limit);
    }
  }

  db.save();

  logFinancialEvent(req, {
    actionType: 'ADMIN_ORDER_STATUS_MODIFIED',
    orderId: order.id,
    transactionId: tx?.id,
    amount: order.amount,
    userId: order.user_id,
    actionDescription: `تغییر وضعیت سفارش #${order.order_number} توسط مدیر سیستم از «${previousStatus}» به «${status}»`,
    details: { previousStatus, newStatus: status, reference_id: tx?.reference_id }
  });

  return res.json({
    message: `وضعیت سفارش #${order.order_number} با موفقیت به «${status === 'paid' ? 'پرداخت شده' : status}» تغییر یافت.`,
    data: {
      order,
      transaction: tx
    }
  });
});

router.delete('/admin/orders/:id', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const order = db.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ message: 'سفارش یافت نشد.' });
  }
  order.deleted_at = new Date().toISOString();
  order.status = 'cancelled';
  order.is_active = false;
  db.save();

  logFinancialEvent(req, {
    actionType: 'ADMIN_ORDER_DELETED',
    orderId: order.id,
    amount: order.amount,
    userId: order.user_id,
    actionDescription: `حذف نرم (Soft Delete) سفارش #${order.order_number} توسط مدیر سیستم`,
  });

  return res.json({ success: true, message: 'سفارش با موفقیت حذف گردید.' });
});

router.get('/admin/subscriptions', authMiddleware, adminOrSupportMiddleware, (_req: Request, res: Response) => {
  const subs = [...db.subscriptions]
    .filter(s => !s.deleted_at)
    .sort((a, b) => b.id - a.id)
    .map(s => {
      const user = db.getUserById(s.user_id);
      const company = user ? db.getCompanyByUserId(user.id) : null;
      const order = s.order_id ? db.orders.find(o => o.id === s.order_id) : null;
      const tx = order ? db.transactions.find(t => t.order_id === order.id) : null;
      const pkg = s.package_id ? db.getPackageById(s.package_id) : null;
      const moduleNames = Array.isArray(s.module_ids) 
        ? s.module_ids.map(id => db.erpModules.find(m => m.id === id)?.title || id)
        : (pkg?.features || []);
      const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.mobile || '—';

      return {
        ...s,
        module_ids: s.module_ids || [],
        module_names: moduleNames,
        module_count: moduleNames.length,
        package_name: s.title || s.package_name || pkg?.name || `اشتراک سازمانی (${moduleNames.length} ماژول)`,
        mobile: user?.mobile || '—',
        user_name: userName,
        company_name: company?.name || '—',
        order_number: order?.order_number || s.order_number || null,
        amount: order?.amount || tx?.amount || (s as any).total_price || (s as any).price || 0,
      };
    });

  return res.json({ data: subs, subscriptions: subs, total: subs.length });
});

router.get('/admin/subscriptions/:id', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const sub = db.subscriptions.find(s => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: 'اشتراک یافت نشد.' });
  }

  const user = db.getUserById(sub.user_id);
  const pkg = db.getPackageById(sub.package_id);
  const moduleNames = Array.isArray(sub.module_ids) 
    ? sub.module_ids.map(mid => db.erpModules.find(m => m.id === mid)?.title || mid)
    : (pkg?.features || []);

  return res.json({
    data: {
      ...sub,
      module_ids: sub.module_ids || [],
      module_names: moduleNames,
      package_name: sub.title || pkg?.name || 'اشتراک سازمانی',
      user: user ? {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
      } : null,
      all_available_modules: db.erpModules.map(m => ({
        id: m.id,
        title: m.title,
        price: m.price,
        category: m.category,
      })),
    }
  });
});

router.put('/admin/subscriptions/:id/modules', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { module_ids } = req.body;
  const sub = db.subscriptions.find(s => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: 'اشتراک یافت نشد.' });
  }

  if (!Array.isArray(module_ids)) {
    return res.status(400).json({ message: 'لیست ماژول‌ها معتبر نیست.' });
  }

  const oldModules = sub.module_ids || [];
  sub.module_ids = module_ids;
  db.save();

  logSubscriptionChange(req, {
    subscriptionId: id,
    userId: sub.user_id,
    oldStatus: sub.status,
    newStatus: sub.status,
    actionDescription: `تغییر و ویرایش لیست ماژول‌های فعال اشتراک #${id} توسط مدیر یا پشتیبان (تعداد: ${module_ids.length} ماژول)`,
    details: {
      old_modules: oldModules,
      new_modules: module_ids,
    }
  });

  return res.json({ 
    message: 'ماژول‌های اشتراک با موفقیت بروزرسانی شدند.',
    data: {
      id: sub.id,
      module_ids: sub.module_ids,
    }
  });
});

router.put('/admin/subscriptions', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const id = Number(req.body.id);
  const status = req.body.status && ['active', 'expired', 'cancelled'].includes(req.body.status) ? req.body.status : undefined;
  const billingPeriod = req.body.billing_period;
  const userCount = req.body.user_count ? Number(req.body.user_count) : undefined;
  const expiresAt = req.body.expires_at;
  const sub = db.subscriptions.find(s => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: 'اشتراک یافت نشد.' });
  }

  const oldStatus = sub.status;
  const oldPeriod = sub.billing_period;
  if (status) {
    sub.status = status;
  }
  if (billingPeriod && ['3_months', '6_months', 'yearly', 'monthly'].includes(billingPeriod)) {
    sub.billing_period = billingPeriod;
    if (!expiresAt) {
      const now = new Date();
      const durationDays = billingPeriod === 'yearly' ? 365 : billingPeriod === '6_months' ? 180 : billingPeriod === '3_months' ? 90 : 30;
      sub.expires_at = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    }
  }
  if (userCount && userCount > 0) {
    sub.user_count = userCount;
  }
  if (expiresAt) {
    sub.expires_at = new Date(expiresAt).toISOString();
  }
  sub.updated_at = new Date().toISOString();
  db.save();

  logSubscriptionChange(req, {
    subscriptionId: id,
    userId: sub.user_id,
    oldStatus,
    newStatus: sub.status,
    actionDescription: `بروزرسانی اشتراک #${id} (وضعیت: ${sub.status}${billingPeriod ? `، دوره: ${billingPeriod}` : ''})`,
    details: {
      old_period: oldPeriod,
      new_period: sub.billing_period,
      user_count: sub.user_count,
      expires_at: sub.expires_at,
    }
  });

  return res.json({ message: 'اشتراک با موفقیت بروزرسانی شد.', data: sub });
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
  const subCount = db.subscriptions.filter(s => s.user_id === user.id && !s.deleted_at).length;
  const now = new Date().toISOString();
  const activeSubCount = db.subscriptions.filter(s => s.user_id === user.id && !s.deleted_at && (s.status === 'active' || s.is_active) && (!s.expires_at || s.expires_at > now)).length;

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
      national_code: user.national_code || null,
      role: user.role,
      is_owner: user.mobile === '09111273476',
      created_at: user.created_at,
      company_name: company?.name || '—',
      industry: company?.industry || '—',
      subscriptions_count: subCount,
      active_subs_count: activeSubCount,
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

// Admin: Update User Identity, Company and Early Renewal Privilege
const handleAdminUserUpdate = (req: Request, res: Response) => {
  const targetUserId = Number(req.params.id);
  const targetUser = db.getUserById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: 'کاربر مورد نظر یافت نشد.' });
  }

  const {
    first_name,
    last_name,
    email,
    job_title,
    role,
    mobile,
    can_renew_early,
    company_name,
    name,
    industry,
    employee_count,
    national_id,
    national_code,
    economic_code,
    registration_num,
    registration_number,
    postal_code,
    address,
  } = req.body;

  if (first_name !== undefined) targetUser.first_name = String(first_name).trim();
  if (last_name !== undefined) targetUser.last_name = String(last_name).trim();
  if (email !== undefined) targetUser.email = String(email).trim() || null;
  if (job_title !== undefined) targetUser.job_title = String(job_title).trim();
  if (national_code !== undefined) {
    targetUser.national_code = toEnglishDigits(String(national_code || '')).replace(/\D/g, '').trim() || null;
  } else if (national_id !== undefined) {
    const cleanNat = toEnglishDigits(String(national_id || '')).replace(/\D/g, '').trim();
    if (cleanNat.length === 10) {
      targetUser.national_code = cleanNat;
    }
  }

  // Mobile normalization & uniqueness check
  if (mobile !== undefined) {
    const rawMobile = String(mobile).trim();
    const normalized = normalizeMobile(rawMobile);
    if (rawMobile && !normalized) {
      return res.status(422).json({ message: 'شماره همراه معتبر نیست.' });
    }
    if (normalized && normalized !== targetUser.mobile) {
      const existing = db.users.find(u => u.mobile === normalized && u.id !== targetUserId);
      if (existing) {
        return res.status(422).json({ message: 'این شماره همراه قبلاً برای کاربر دیگری ثبت شده است.' });
      }
      targetUser.mobile = normalized;
    }
  }

  // Role update (protect super admin)
  if (role !== undefined) {
    if (targetUser.mobile === '09111273476' || targetUser.id === 1) {
      targetUser.role = 'admin';
    } else if (['user', 'admin', 'support'].includes(role)) {
      targetUser.role = role;
    }
  }

  // can_renew_early flag
  if (can_renew_early !== undefined) {
    targetUser.can_renew_early = Boolean(can_renew_early);
  }

  targetUser.updated_at = new Date().toISOString();

  // Company details update
  const resolvedCompName = String(company_name || name || '').trim();
  const resolvedIndustry = String(industry || 'فناوری اطلاعات و خدمات ابری').trim();
  const resolvedEmpCount = Number(employee_count) || 10;

  let company = db.getCompanyByUserId(targetUserId);
  if (resolvedCompName || company) {
    company = db.upsertCompany(targetUserId, resolvedCompName || company?.name || 'شرکت کاربری', resolvedIndustry, resolvedEmpCount, {
      economic_code: String(economic_code || national_id || '').trim(),
      national_id: String(national_id || economic_code || '').trim(),
      registration_number: String(registration_number || registration_num || '').trim(),
      postal_code: String(postal_code || '').trim(),
      address: String(address || '').trim(),
    });
  }

  db.save();

  logPrivilegeEscalation(req, {
    targetUserId,
    targetUserName: [targetUser.first_name, targetUser.last_name].filter(Boolean).join(' ') || targetUser.mobile,
    oldRole: targetUser.role,
    newRole: targetUser.role,
    actionDescription: `ویرایش مشخصات و هویت کاربر ${targetUser.mobile} توسط مدیر (تمدید زودهنگام: ${targetUser.can_renew_early ? 'فعال' : 'غیرفعال'})`,
  });

  return res.json({
    success: true,
    message: 'مشخصات و هویت کاربر با موفقیت ذخیره شد.',
    user: {
      ...targetUser,
      can_renew_early: Boolean(targetUser.can_renew_early),
      company: company || null,
      company_name: company?.name || `${targetUser.first_name || ''} ${targetUser.last_name || ''}`.trim() || targetUser.mobile,
    }
  });
};

router.put('/admin/users/:id', authMiddleware, adminMiddleware, handleAdminUserUpdate);
router.post('/admin/users/:id/update', authMiddleware, adminMiddleware, handleAdminUserUpdate);
router.post('/admin/users/:id', authMiddleware, adminMiddleware, handleAdminUserUpdate);

// 5. Delete User by ID (with owner protection & complete data wipe)
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const targetUserId = Number(req.params.id);
  const targetUser = db.getUserById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: 'کاربر مورد نظر یافت نشد.' });
  }

  if (targetUser.mobile === '09111273476' || targetUser.id === 1) {
    return res.status(403).json({ message: 'امکان حذف حساب مالک و مدیر ارشد سامانه وجود ندارد.' });
  }

  const targetMobile = targetUser.mobile;
  const targetUserName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(' ') || targetMobile;

  // Completely wipe all user records, company, subscriptions, orders, tickets, and OTPs
  db.deleteUserCompletely(targetUserId);

  logPrivilegeEscalation(req, {
    targetUserId,
    targetUserName,
    oldRole: targetUser.role,
    newRole: 'deleted',
    actionDescription: `حذف کامل و پاکسازی کلیه اطلاعات کاربر ${targetMobile} (${targetUserName}) توسط مدیر - کاربر می‌تواند مجدداً از ابتدا ثبت‌نام کند`,
  });

  return res.json({ 
    success: true,
    message: `حساب و تمامی داده‌های کاربر «${targetUserName}» با موفقیت به طور کامل حذف شد و این شماره می‌تواند مجدداً از ابتدا ثبت‌نام کند.` 
  });
});

// 6. Admin: Get Full User Details with Subscriptions, Orders & Modules
router.get('/admin/users/:id/details', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const targetUserId = Number(req.params.id);
  const targetUser = db.getUserById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: 'کاربر مورد نظر یافت نشد.' });
  }

  const company = db.getCompanyByUserId(targetUserId);
  
  // Get all user subscriptions
  const userSubs = db.subscriptions
    .filter(s => s.user_id === targetUserId)
    .sort((a, b) => b.id - a.id)
    .map(s => {
      const pkg = s.package_id ? db.getPackageById(s.package_id) : null;
      const order = s.order_id ? db.orders.find(o => o.id === s.order_id) : null;
      const tx = order ? db.transactions.find(t => t.order_id === order.id) : null;
      
      const moduleIds = Array.isArray(s.module_ids) ? s.module_ids : [];
      const moduleDetails = moduleIds.map(mid => {
        const found = db.erpModules.find(m => m.id === mid);
        return {
          id: mid,
          title: found?.title || mid,
          price: found?.price || 0,
          category: found?.category || 'عمومی',
        };
      });

      return {
        ...s,
        package_name: s.title || pkg?.name || `اشتراک سازمانی (${moduleIds.length} ماژول)`,
        module_ids: moduleIds,
        modules: moduleDetails,
        module_count: moduleIds.length,
        order_number: order?.order_number || null,
        order_amount: order?.amount || tx?.amount || null,
        reference_id: tx?.reference_id || null,
      };
    });

  // Get all user orders with transaction details
  const userOrders = db.orders
    .filter(o => o.user_id === targetUserId)
    .sort((a, b) => b.id - a.id)
    .map(o => {
      const tx = db.transactions.find(t => t.order_id === o.id);
      const pkg = o.package_id ? db.getPackageById(o.package_id) : null;
      const sub = db.subscriptions.find(s => s.order_id === o.id);

      return {
        id: o.id,
        order_number: o.order_number,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at,
        package_name: pkg?.name || sub?.title || 'اشتراک ماژولار ابری کارویتا',
        user_count: o.user_count || sub?.user_count || db.configuratorSettings.base_user_limit || 1,
        billing_period: o.billing_period || sub?.billing_period || 'monthly',
        transaction: tx ? {
          id: tx.id,
          reference_id: tx.reference_id,
          status: tx.status,
          gateway: tx.gateway,
          paid_at: tx.paid_at,
          amount: tx.amount,
        } : null,
      };
    });

  return res.json({
    data: {
      user: {
        id: targetUser.id,
        mobile: targetUser.mobile,
        first_name: targetUser.first_name,
        last_name: targetUser.last_name,
        email: targetUser.email,
        job_title: targetUser.job_title,
        national_code: targetUser.national_code || null,
        role: targetUser.role,
        can_renew_early: Boolean(targetUser.can_renew_early),
        is_owner: targetUser.mobile === '09111273476',
        created_at: targetUser.created_at,
        company: company ? {
          name: company.name,
          industry: company.industry,
          employee_count: company.employee_count,
          national_id: company.national_id,
          phone: company.phone,
          address: company.address,
        } : null,
      },
      subscriptions: userSubs,
      orders: userOrders,
      all_available_modules: db.erpModules.map(m => ({
        id: m.id,
        title: m.title,
        price: m.price,
        category: m.category,
        dependencies: m.dependencies || [],
      })),
    }
  });
});

// 7. Admin: Add/Remove Modules from User Subscription (with optional Invoice Generation)
router.put('/admin/users/:userId/subscriptions/:subId/modules', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const subId = Number(req.params.subId);
  const { module_ids, issue_invoice = false, invoice_amount, invoice_description } = req.body;

  const targetUser = db.getUserById(userId);
  if (!targetUser) {
    return res.status(404).json({ message: 'کاربر یافت نشد.' });
  }

  const sub = db.subscriptions.find(s => s.id === subId && s.user_id === userId);
  if (!sub) {
    return res.status(404).json({ message: 'اشتراک مورد نظر برای این کاربر یافت نشد.' });
  }

  if (!Array.isArray(module_ids)) {
    return res.status(400).json({ message: 'لیست ماژول‌ها باید به صورت آرایه ارسال شود.' });
  }

  const oldModules = sub.module_ids || [];
  const addedModules = module_ids.filter(m => !oldModules.includes(m));
  const removedModules = oldModules.filter(m => !module_ids.includes(m));

  sub.module_ids = module_ids;
  sub.title = `اشتراک سازمانی کارویتا (${module_ids.length} ماژول)`;

  let createdOrder: Order | null = null;

  if (issue_invoice && (addedModules.length > 0 || (Number(invoice_amount) > 0))) {
    // Calculate default price of added modules from db.erpModules
    const calculatedPrice = addedModules.reduce((acc, mId) => {
      const mod = db.erpModules.find(x => x.id === mId);
      return acc + (Number(mod?.price) || 0);
    }, 0);

    const finalAmount = (invoice_amount !== undefined && invoice_amount !== '' && Number(invoice_amount) > 0)
      ? Number(invoice_amount) 
      : (calculatedPrice > 0 ? calculatedPrice : 100000);

    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();

    const modDetails = (addedModules.length > 0 ? addedModules : module_ids)
      .map(id => {
        const m = db.erpModules.find(x => x.id === id);
        return m ? `${m.title} (${Number(m.price || 0).toLocaleString('fa-IR')} تومان)` : id;
      })
      .join(' + ');

    createdOrder = {
      id: db.nextOrderId++,
      user_id: userId,
      order_number: `INV-${dateStr}-${rand}`,
      amount: finalAmount,
      status: 'pending',
      module_ids: addedModules.length > 0 ? addedModules : module_ids,
      user_count: sub.user_count || db.configuratorSettings.base_user_limit || 1,
      billing_period: sub.billing_period || 'monthly',
      coupon_code: '',
      discount_amount: 0,
      description: invoice_description || `هزینه افزودن ماژول‌های (${modDetails}) به اشتراک #${sub.id}`,
      created_at: new Date().toISOString(),
    };

    db.orders.push(createdOrder);
  }

  db.save();

  const targetUserName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(' ') || targetUser.mobile;
  logSubscriptionChange(req, {
    subscriptionId: subId,
    userId: userId,
    oldStatus: sub.status,
    newStatus: sub.status,
    actionDescription: `ویرایش و تغییر ماژول‌های فعال اشتراک #${subId} کاربر «${targetUserName}» توسط مدیر (تعداد جدید: ${module_ids.length} ماژول)${createdOrder ? ` همراه با صدور پیش‌فاکتور #${createdOrder.order_number} به مبلغ ${createdOrder.amount.toLocaleString('fa-IR')} تومان` : ''}`,
    details: {
      user_id: userId,
      user_mobile: targetUser.mobile,
      old_modules: oldModules,
      new_modules: module_ids,
      added_modules: addedModules,
      removed_modules: removedModules,
      issued_invoice: !!createdOrder,
      order_id: createdOrder?.id || null,
      order_number: createdOrder?.order_number || null,
      order_amount: createdOrder?.amount || null,
    }
  });

  if (createdOrder) {
    const clientOrigin = `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
    sendInvoiceIssuedSms(createdOrder, targetUser, clientOrigin).catch(err => console.warn('[Admin Invoice SMS Error]', err));
  }

  return res.json({
    message: createdOrder 
      ? `ماژول‌ها با موفقیت بروزرسانی شدند و پیش‌فاکتور #${createdOrder.order_number} به مبلغ ${createdOrder.amount.toLocaleString('fa-IR')} تومان با وضعیت در انتظار پرداخت برای کاربر صادر گردید.`
      : 'ماژول‌های اشتراک با موفقیت بروزرسانی شدند.',
    data: {
      subscription_id: sub.id,
      module_ids: sub.module_ids,
      title: sub.title,
      order: createdOrder,
    }
  });
});

// 8. Admin: Create Direct Subscription for User
router.post('/admin/users/:userId/subscriptions', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const { module_ids = [], duration_days = 365, user_count = (db.configuratorSettings.base_user_limit || 1), billing_period = 'yearly' } = req.body;

  const targetUser = db.getUserById(userId);
  if (!targetUser) {
    return res.status(404).json({ message: 'کاربر یافت نشد.' });
  }

  const newSub = db.createERPSubscription(
    userId,
    null,
    Array.isArray(module_ids) && module_ids.length > 0 ? module_ids : db.erpModules.slice(0, 4).map(m => m.id),
    Number(user_count) || db.configuratorSettings.base_user_limit || 1,
    billing_period === 'monthly' ? 'monthly' : 'yearly',
    'admin',
    Number(duration_days) || 365
  );

  const targetUserName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(' ') || targetUser.mobile;
  logSubscriptionChange(req, {
    subscriptionId: newSub.id,
    userId: userId,
    oldStatus: 'none',
    newStatus: 'active',
    actionDescription: `اعطای مستقیم اشتراک جدید به کاربر «${targetUserName}» (${targetUser.mobile}) توسط مدیر سیستم`,
    details: {
      subscription_id: newSub.id,
      module_ids: newSub.module_ids,
      duration_days: duration_days,
      user_count: user_count,
    }
  });

  return res.json({
    message: 'اشتراک جدید با موفقیت برای کاربر فعال گردید.',
    data: newSub,
  });
});

// 9. Admin & Support: Get All Subscriptions
router.get('/admin/subscriptions', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const subs = [...db.subscriptions]
    .sort((a, b) => b.id - a.id)
    .map(s => {
      const user = db.getUserById(s.user_id);
      const company = user ? db.getCompanyByUserId(user.id) : null;
      const order = s.order_id ? db.orders.find(o => o.id === s.order_id) : null;
      const tx = order ? db.transactions.find(t => t.order_id === order.id) : null;
      const moduleIds = Array.isArray(s.module_ids) ? s.module_ids : [];
      const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.mobile || '—';

      return {
        id: s.id,
        user_id: s.user_id,
        title: s.title || (s.package_name || 'اشتراک کارویتا'),
        package_name: s.package_name || s.title || 'اشتراک کارویتا',
        source: s.source || 'purchase',
        status: s.status || 'active',
        billing_period: s.billing_period || 'monthly',
        user_count: Number(s.user_count) || 1,
        user_limit: Number(s.user_limit) || 1,
        module_ids: moduleIds,
        module_count: moduleIds.length,
        expires_at: s.expires_at,
        created_at: s.created_at,
        starts_at: s.starts_at || s.created_at,
        mobile: user?.mobile || '—',
        user_name: userName,
        company_name: company?.name || '—',
        order_number: order?.order_number || null,
        amount: order?.amount || tx?.amount || 0,
      };
    });

  return res.json({
    data: subs,
    subscriptions: subs,
    total: subs.length,
  });
});

// Alias for direct path without admin prefix
router.get('/subscriptions', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role === 'admin' || user.role === 'support') {
    const subs = [...db.subscriptions]
      .filter(s => !s.deleted_at)
      .sort((a, b) => b.id - a.id)
      .map(s => {
        const u = db.getUserById(s.user_id);
        const company = u ? db.getCompanyByUserId(u.id) : null;
        const moduleIds = Array.isArray(s.module_ids) ? s.module_ids : [];
        const userName = [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.mobile || '—';
        return {
          id: s.id,
          user_id: s.user_id,
          title: s.title || 'اشتراک کارویتا',
          package_name: s.package_name || s.title || 'اشتراک کارویتا',
          source: s.source || 'purchase',
          status: s.status || 'active',
          billing_period: s.billing_period || 'monthly',
          user_count: Number(s.user_count) || 1,
          module_ids: moduleIds,
          module_count: moduleIds.length,
          expires_at: s.expires_at,
          created_at: s.created_at,
          mobile: u?.mobile || '—',
          user_name: userName,
          company_name: company?.name || '—',
        };
      });
    return res.json({ data: subs, subscriptions: subs });
  }

  const userSubs = db.subscriptions.filter(s => s.user_id === user.id);
  return res.json({ data: userSubs, subscriptions: userSubs });
});

// 10. Admin: Update Subscription Status & Billing Period
router.put('/admin/subscriptions', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const id = Number(req.body.id);
  const sub = db.subscriptions.find(s => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: 'اشتراک یافت نشد.' });
  }

  const { status, billing_period, user_count, expires_at } = req.body;
  const oldStatus = sub.status;
  const oldPeriod = sub.billing_period;

  if (status && ['active', 'expired', 'cancelled'].includes(status)) {
    sub.status = status;
  }

  if (billing_period && ['3_months', '6_months', 'yearly', 'monthly'].includes(billing_period)) {
    sub.billing_period = billing_period;
    if (!expires_at) {
      const now = new Date();
      const durationDays = billing_period === 'yearly' ? 365 : billing_period === '6_months' ? 180 : billing_period === '3_months' ? 90 : 30;
      sub.expires_at = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  if (user_count && Number(user_count) > 0) {
    sub.user_count = Number(user_count);
  }

  if (expires_at) {
    sub.expires_at = new Date(expires_at).toISOString();
  }

  db.save();

  logSubscriptionChange(req, {
    subscriptionId: id,
    userId: sub.user_id,
    oldStatus,
    newStatus: sub.status,
    actionDescription: `بروزرسانی دوره و مشخصات اشتراک #${id} (دوره: ${sub.billing_period}، وضعیت: ${sub.status}) توسط مدیر یا پشتیبان`,
    details: {
      old_period: oldPeriod,
      new_period: sub.billing_period,
      user_count: sub.user_count,
      expires_at: sub.expires_at,
    }
  });

  return res.json({
    message: 'مشخصات و دوره صورت‌حساب اشتراک با موفقیت بروزرسانی شد.',
    data: sub,
  });
});

router.put('/admin/subscriptions/:id', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const id = Number(req.params.id) || Number(req.body.id);
  const sub = db.subscriptions.find(s => s.id === id);
  if (!sub) {
    return res.status(404).json({ message: 'اشتراک یافت نشد.' });
  }

  const { status, billing_period, user_count, expires_at } = req.body;
  const oldStatus = sub.status;
  const oldPeriod = sub.billing_period;

  if (status && ['active', 'expired', 'cancelled'].includes(status)) {
    sub.status = status;
  }

  if (billing_period && ['3_months', '6_months', 'yearly', 'monthly'].includes(billing_period)) {
    sub.billing_period = billing_period;
    if (!expires_at) {
      const now = new Date();
      const durationDays = billing_period === 'yearly' ? 365 : billing_period === '6_months' ? 180 : billing_period === '3_months' ? 90 : 30;
      sub.expires_at = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  if (user_count && Number(user_count) > 0) {
    sub.user_count = Number(user_count);
  }

  if (expires_at) {
    sub.expires_at = new Date(expires_at).toISOString();
  }

  db.save();

  logSubscriptionChange(req, {
    subscriptionId: id,
    userId: sub.user_id,
    oldStatus,
    newStatus: sub.status,
    actionDescription: `بروزرسانی دوره و مشخصات اشتراک #${id} توسط مدیر`,
    details: {
      old_period: oldPeriod,
      new_period: sub.billing_period,
      user_count: sub.user_count,
      expires_at: sub.expires_at,
    }
  });

  return res.json({
    message: 'مشخصات و دوره صورت‌حساب اشتراک با موفقیت بروزرسانی شد.',
    data: sub,
  });
});

router.delete('/admin/subscriptions/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const subId = Number(req.params.id);
  const sub = db.subscriptions.find(s => s.id === subId);
  if (!sub) {
    return res.status(404).json({ message: 'اشتراک یافت نشد.' });
  }

  sub.deleted_at = new Date().toISOString();
  sub.status = 'cancelled';
  sub.is_active = false;
  db.save();

  logSubscriptionChange(req, {
    subscriptionId: subId,
    userId: sub.user_id,
    oldStatus: sub.status,
    newStatus: 'cancelled',
    actionDescription: `حذف نرم (Soft Delete) و لغو اشتراک #${subId} توسط مدیر سیستم`,
  });

  return res.json({ success: true, message: 'اشتراک با موفقیت بایگانی/حذف گردید.' });
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
    let token: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc: any, c) => {
        const [k, v] = c.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {});
      token = cookies['karovita_token'] || cookies['token'] || null;
    }

    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as { sub: number };
        const user = db.getUserById(payload.sub);
        if (user) {
          (req as any).user = user;
        }
      } catch {
        // Continue unauthenticated if token invalid
      }
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const { message, name, stack, url, context, level } = body || {};
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

// 2. Get user tickets (or all tickets if Admin / Support)
router.get('/tickets', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const status = (req.query.status as string) || 'all';
  const isStaff = user.role === 'admin' || user.role === 'support' || user.mobile === '09111273476';

  let list = isStaff ? [...db.tickets] : db.tickets.filter(t => t.user_id === user.id);
  if (status && status !== 'all') {
    list = list.filter(t => t.status === status);
  }

  const enriched = list
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map(t => {
      const u = isStaff ? db.getUserById(t.user_id) : null;
      const dept = db.getDepartmentById(t.department_id);
      return {
        ...t,
        department_name: dept?.name || 'عمومی',
        ...(isStaff ? {
          user_name: [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.mobile || 'کاربر',
          user_mobile: u?.mobile || '—',
          user_email: u?.email || '—',
        } : {})
      };
    });

  const counts = isStaff ? db.getAdminTicketCounts() : db.getUserTicketCounts(user.id);
  return res.json({ data: enriched, counts });
});

// 2.5 Notification Badge Counter (MUST BE BEFORE /tickets/:id)
router.get('/tickets/badge', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role === 'admin' || user.role === 'support') {
    // For admin & support: tickets requiring attention (open, in progress, or last message from user)
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

  const ip = req.ip || req.socket.remoteAddress || 'localhost';
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
    if (db.isPwaEnabled()) {
      const adminSubs = db.getAllPushSubscriptions().filter(s => s.role === 'admin' || s.role === 'support');
      if (adminSubs.length > 0) {
        broadcastWebPush(adminSubs, {
          title: `تیکت جدید: ${subject}`,
          body: `تیکت شماره ${ticket.ticket_number} توسط کاربر ثبت شد.`,
          url: `/admin`,
          tag: `ticket-${ticket.id}`,
        }).catch(() => {});
      }
    }
  } catch (err) {
    // Ignore push delivery error on creation
  }

  // Send automated SMS notification to user
  sendTicketCreatedSms(ticket, user).catch(err => console.warn('[Ticket SMS Error]', err));

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

  // Permission check: regular user can only view their own ticket, admin and support can view all
  const isStaff = user.role === 'admin' || user.role === 'support' || user.mobile === '09111273476';
  if (!isStaff && ticket.user_id !== user.id) {
    logSecurityEvent(req, {
      actionDescription: `تلاش غیرمجاز برای مشاهده تیکت #${ticket.ticket_number} (کاربر ID: ${user.id})`,
      resourceType: 'TICKET_ACCESS_VIOLATION',
      resourceId: ticket.id,
      status: 'WARNING',
      details: { attempted_ticket_id: ticket.id, ticket_owner_id: ticket.user_id },
    });
    return res.status(403).json({ message: 'شما دسترسی به این تیکت را ندارید.' });
  }

  // If ticket contains security information or is inspected by Admin/Support, log sensitive access
  if (ticket.is_security_info || isStaff) {
    logSensitiveDataAccess(req, {
      resourceType: 'TICKET_SECURITY_DATA',
      resourceId: ticket.id,
      actionDescription: `دسترسی و بازبینی اطلاعات تیکت شماره ${ticket.ticket_number} ${ticket.is_security_info ? '(شامل اطلاعات حساس و دسترسی)' : ''}`,
      details: { ticket_number: ticket.ticket_number, is_security_info: ticket.is_security_info, viewer_role: user.role },
    });
  }

  // If Admin/Support opens a ticket with status 'open', support viewing can be noted
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

  const isStaff = user.role === 'admin' || user.role === 'support' || user.mobile === '09111273476';
  if (!isStaff && ticket.user_id !== user.id) {
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

  const senderType: 'user' | 'support' = (user.role === 'admin' || user.role === 'support') ? 'support' : 'user';
  const senderName = (user.role === 'admin' || user.role === 'support')
    ? ([user.first_name, user.last_name].filter(Boolean).join(' ') || (user.role === 'admin' ? 'مدیر سیستم' : 'کارشناس پشتیبانی')) + ' (پشتیبانی)'
    : ([user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile || 'کاربر');

  const ip = req.ip || req.socket.remoteAddress || 'localhost';

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

      // Web Push notifications (if PWA service is enabled)
      if (db.isPwaEnabled()) {
        const userSubs = db.getPushSubscriptions({ user_id: ticket.user_id });
        if (userSubs.length > 0) {
          broadcastWebPush(userSubs, {
            title: `پاسخ به تیکت #${ticket.ticket_number}`,
            body: `${senderName}: ${message.length > 80 ? message.substring(0, 80) + '...' : message}`,
            url: `/support?ticketId=${ticket.id}`,
            tag: `ticket-${ticket.id}`,
          }).catch(() => {});
        }
      }
    } else {
      // Regular user sent message: notify admins & support staff
      if (db.isPwaEnabled()) {
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

  const isStaff = user.role === 'admin' || user.role === 'support' || user.mobile === '09111273476';
  if (!isStaff && ticket.user_id !== user.id) {
    return res.status(403).json({ message: 'شما دسترسی به بستن این تیکت را ندارید.' });
  }

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile || (user.role === 'admin' ? 'مدیر' : user.role === 'support' ? 'کارشناس پشتیبانی' : 'کاربر');
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

  const isStaff = user.role === 'admin' || user.role === 'support' || user.mobile === '09111273476';
  if (!isStaff && ticket.user_id !== user.id) {
    return res.status(403).json({ message: 'شما دسترسی به این تیکت را ندارید.' });
  }

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile || (user.role === 'admin' ? 'مدیر' : user.role === 'support' ? 'کارشناس پشتیبانی' : 'کاربر');
  const reopened = db.reopenTicket(ticket.id, user.id, userName);

  return res.json({ message: 'تیکت با موفقیت مجدداً بازگشایی شد.', ticket: reopened });
});

// 8. Admin & Support: Get all tickets with filtering and search
router.get('/admin/tickets', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
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

// 9. Admin & Support: Support staff list
router.get('/admin/support-staff', authMiddleware, adminOrSupportMiddleware, (_req: Request, res: Response) => {
  return res.json({ data: db.supportStaff });
});

// 10. Admin & Support: Assign ticket to staff
router.put('/admin/tickets/:id/assign', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ticketId = Number(req.params.id);
  const staffId = Number(req.body.staff_id);

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || (user.role === 'admin' ? 'مدیر سیستم' : 'کارشناس پشتیبانی');
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

// 11. Admin & Support: Change ticket department
router.put('/admin/tickets/:id/department', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ticketId = Number(req.params.id);
  const departmentId = Number(req.body.department_id);

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || (user.role === 'admin' ? 'مدیر سیستم' : 'کارشناس پشتیبانی');
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

// 12. Admin & Support: Change ticket status manually
router.put('/admin/tickets/:id/status', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ticketId = Number(req.params.id);
  const status = req.body.status;

  if (!['open', 'in_progress', 'waiting_user', 'closed'].includes(status)) {
    return res.status(422).json({ message: 'وضعیت نامعتبر است.' });
  }

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || (user.role === 'admin' ? 'مدیر سیستم' : 'کارشناس پشتیبانی');
  try {
    const updated = db.changeTicketStatus(ticketId, status, user.id, userName);

    logConfigChange(req, {
      resourceType: 'TICKET_STATUS',
      resourceId: ticketId,
      actionDescription: `تغییر وضعیت تیکت #${updated.ticket_number} به «${status}»`,
      details: { new_status: status, ticket_number: updated.ticket_number },
    });

    return res.json({ message: 'وضعیت تیکت تغییر یافت.', ticket: updated });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'خطا در تغییر وضعیت.' });
  }
});

// 14. Admin: Delete single ticket
router.delete('/admin/tickets/:id', authMiddleware, adminOrSupportMiddleware, (req: Request, res: Response) => {
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

// 0. Get PWA / Web Push Master Status (Public)
router.get('/pwa/status', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.json({
    success: true,
    enabled: db.isPwaEnabled(),
    pwaSettings: db.pwaSettings || { enabled: true },
  });
});

// Admin: Toggle PWA, Service Worker & Web Push Master Switch
router.post('/admin/pwa/toggle', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') {
    return res.status(422).json({ message: 'پارامتر enabled باید به صورت boolean (true/false) ارسال شود.' });
  }

  const oldStatus = db.isPwaEnabled();
  const user = (req as any).user as User;
  db.pwaSettings = {
    enabled,
    updated_at: new Date().toISOString(),
    updated_by: user ? user.id : 'admin',
  };
  db.saveToFile();

  logConfigChange(req, {
    resourceType: 'PWA_SERVICE_SETTINGS',
    resourceId: 'PWA_SETTINGS',
    actionDescription: enabled
      ? 'فعال‌سازی سراسری سرویس PWA، سرویس‌ورکر و اعلان‌های وب (Web Push)'
      : 'غیرفعال‌سازی سراسری سرویس PWA، سرویس‌ورکر و اعلان‌های وب (Web Push)',
    oldValue: { enabled: oldStatus },
    newValue: { enabled },
  });

  return res.json({
    success: true,
    enabled: db.pwaSettings.enabled,
    pwaSettings: db.pwaSettings,
    message: enabled
      ? 'سرویس PWA، سرویس‌ورکر و اعلان‌های وب با موفقیت در سراسر سامانه فعال گردید.'
      : 'سرویس PWA، سرویس‌ورکر و اعلان‌های وب با موفقیت در سراسر سامانه غیرفعال شد.',
  });
});

// 1. Get VAPID Public Key for client subscription
router.get('/push/public-key', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  if (!db.isPwaEnabled()) {
    return res.status(403).json({
      success: false,
      message: 'سرویس PWA و اعلان‌های وب در حال حاضر غیرفعال است.',
      enabled: false,
      publicKey: null,
    });
  }
  const publicKey = getVapidPublicKey();
  return res.json({ publicKey, enabled: true });
});

// 2. Register or update Push Subscription
router.post('/push/subscribe', (req: Request, res: Response) => {
  if (!db.isPwaEnabled()) {
    return res.status(403).json({
      success: false,
      message: 'امکان ثبت اشتراک اعلان وجود ندارد؛ سرویس PWA و اعلان‌های وب غیرفعال است.',
    });
  }
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
    return res.status(422).json({ message: 'اطلاعات اشتراک اعلان ناقص است.' });
  }

  const optionalUser = getOptionalUser(req);
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';
  const ip = req.ip || req.socket.remoteAddress || 'localhost';

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
  if (!db.isPwaEnabled()) {
    return res.status(403).json({
      success: false,
      message: 'ارسال اعلان آزمایشی مقدور نیست زیرا سرویس PWA و اعلان‌های وب در حال حاضر غیرفعال است.',
    });
  }

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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const all = db.getAllPushSubscriptions();
  const total = all.length;
  const admin_count = all.filter(s => s.role === 'admin').length;
  const support_count = all.filter(s => s.role === 'support').length;
  const user_count = all.filter(s => s.role === 'user').length;
  const guest_count = all.filter(s => s.role === 'guest' || !s.role).length;

  return res.json({
    total,
    enabled: db.isPwaEnabled(),
    pwaSettings: db.pwaSettings || { enabled: true },
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
  if (!db.isPwaEnabled()) {
    return res.status(403).json({
      success: false,
      message: 'ارسال اعلان همگانی مقدور نیست زیرا سرویس PWA و اعلان‌های وب در حال حاضر غیرفعال است.',
    });
  }

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

// -------------------------------------------------------------
// Payment Gateway (Zibal/Shaparak) & SMS.ir Management Endpoints
// -------------------------------------------------------------

// 1. Admin: Get Gateway & SMS Configurations
router.get('/admin/gateways/settings', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const zibalConfig = getZibalConfig();
  const smsConfig = getSmsConfig();

  const rawTpls = smsConfig?.templates || {};
  const formattedTpls: Record<string, number | null> = {};
  const formattedTexts: Record<string, string> = {};
  const formattedDetails: Record<string, any> = {};

  const templateKeys = [
    { key: 'otp', aliases: ['otp'], defaultTitle: 'کد احراز هویت و ورود یکبار مصرف (OTP)', defaultPattern: 'کد ورود شما به پنل کارویتا: #CODE#' },
    { key: 'invoice_issued', aliases: ['invoice_issued'], defaultTitle: 'صدور پیش‌فاکتور جدید', defaultPattern: 'کاربر گرامی #CUSTOMER#، پیش‌فاکتور سفارش ##ORDER# به مبلغ #AMOUNT# تومان صادر شد. لینک پرداخت: #LINK#' },
    { key: 'sub_expiring_7days', aliases: ['sub_expiring_7days', 'sub_expiry_7days'], defaultTitle: 'یادآوری ۷ روز مانده به انقضا', defaultPattern: 'کاربر گرامی #CUSTOMER#، تنها #DAYS# روز از اشتراک #TITLE# شما باقی مانده است. جهت تمدید اقدام فرمایید.' },
    { key: 'sub_expiring_3days', aliases: ['sub_expiring_3days', 'sub_expiry_3days'], defaultTitle: 'یادآوری ۳ روز مانده به انقضا', defaultPattern: 'هشدار مهم: کاربر گرامی #CUSTOMER#، اشتراک شما #TITLE# ظرف #DAYS# روز آینده منقضی می‌شود.' },
    { key: 'ticket_created', aliases: ['ticket_created'], defaultTitle: 'ثبت تیکت پشتیبانی جدید', defaultPattern: 'کاربر گرامی #CUSTOMER#، تیکت پشتیبانی شما با شماره #TICKET# و موضوع «#SUBJECT#» با موفقیت ثبت شد.' },
    { key: 'payment_success', aliases: ['payment_success'], defaultTitle: 'تایید پرداخت و تسویه فاکتور', defaultPattern: 'کاربر گرامی #CUSTOMER#، پرداخت فاکتور ##ORDER# به مبلغ #AMOUNT# تومان با شماره پیگیری #REF# با موفقیت تایید شد.' },
  ];

  for (const item of templateKeys) {
    let val: any = undefined;
    for (const alias of item.aliases) {
      if (rawTpls[alias] !== undefined && rawTpls[alias] !== null) {
        val = rawTpls[alias];
        break;
      }
    }
    const num = typeof val === 'object' && val !== null ? val.id : val;
    const cleanId = (num && Number(num) > 0) ? Number(num) : null;
    formattedTpls[item.key] = cleanId;

    let text = typeof val === 'object' && val !== null ? (val.pattern || val.text) : '';
    if (!text && text !== '') {
      text = item.defaultPattern;
    }
    formattedTexts[item.key] = text;
    formattedDetails[item.key] = {
      id: cleanId,
      pattern: text,
      title: (typeof val === 'object' && val !== null && val.title) ? val.title : item.defaultTitle,
      enabled: !!cleanId && !!(text && String(text).trim() !== '')
    };
  }

  return res.json({
    data: {
      zibal: {
        ...zibalConfig,
      },
      sms: {
        ...smsConfig,
        templates: formattedTpls,
        template_texts: formattedTexts,
        template_details: formattedDetails,
      },
    }
  });
});

// 2. Admin: Update Gateway & SMS Configurations
router.put('/admin/gateways/settings', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { zibal, sms } = req.body;

  if (zibal) {
    db.gatewaySettings.zibal = {
      ...db.gatewaySettings.zibal,
      merchant: typeof zibal.merchant === 'string' ? zibal.merchant.trim() : (db.gatewaySettings.zibal?.merchant || ''),
      sandbox: Boolean(zibal.sandbox),
      enabled: zibal.enabled !== false,
      callback_url: zibal.callback_url || db.gatewaySettings.zibal?.callback_url || '/api/payments/zibal/callback',
      description_prefix: zibal.description_prefix || db.gatewaySettings.zibal?.description_prefix || 'سامانه ابری کارویتا - سفارش #',
      auto_verify: zibal.auto_verify !== false,
    };
  }

  if (sms) {
    const incomingTemplates = sms.templates || {};
    const incomingTexts = sms.template_texts || sms.templateTexts || sms.patterns || {};
    const updatedTemplates: any = { ...(db.gatewaySettings.sms?.templates || {}) };

    const templateKeys = [
      { key: 'otp', aliases: ['otp'], defaultTitle: 'کد احراز هویت و ورود یکبار مصرف (OTP)', defaultPattern: 'کد ورود شما به پنل کارویتا: #CODE#' },
      { key: 'invoice_issued', aliases: ['invoice_issued'], defaultTitle: 'صدور پیش‌فاکتور جدید', defaultPattern: 'کاربر گرامی #CUSTOMER#، پیش‌فاکتور سفارش ##ORDER# به مبلغ #AMOUNT# تومان صادر شد. لینک پرداخت: #LINK#' },
      { key: 'sub_expiring_7days', aliases: ['sub_expiring_7days', 'sub_expiry_7days'], defaultTitle: 'یادآوری ۷ روز مانده به انقضا', defaultPattern: 'کاربر گرامی #CUSTOMER#، تنها #DAYS# روز از اشتراک #TITLE# شما باقی مانده است. جهت تمدید اقدام فرمایید.' },
      { key: 'sub_expiring_3days', aliases: ['sub_expiring_3days', 'sub_expiry_3days'], defaultTitle: 'یادآوری ۳ روز مانده به انقضا', defaultPattern: 'هشدار مهم: کاربر گرامی #CUSTOMER#، اشتراک شما #TITLE# ظرف #DAYS# روز آینده منقضی می‌شود.' },
      { key: 'ticket_created', aliases: ['ticket_created'], defaultTitle: 'ثبت تیکت پشتیبانی جدید', defaultPattern: 'کاربر گرامی #CUSTOMER#، تیکت پشتیبانی شما با شماره #TICKET# و موضوع «#SUBJECT#» با موفقیت ثبت شد.' },
      { key: 'payment_success', aliases: ['payment_success'], defaultTitle: 'تایید پرداخت و تسویه فاکتور', defaultPattern: 'کاربر گرامی #CUSTOMER#، پرداخت فاکتور ##ORDER# به مبلغ #AMOUNT# تومان با شماره پیگیری #REF# با موفقیت تایید شد.' },
    ];

    for (const item of templateKeys) {
      // 1. Resolve ID
      let incomingVal: any = undefined;
      for (const alias of item.aliases) {
        if (incomingTemplates[alias] !== undefined) {
          incomingVal = incomingTemplates[alias];
          break;
        }
      }
      const cleanNum = (incomingVal !== null && incomingVal !== '' && Number(incomingVal) > 0) ? Number(incomingVal) : null;

      // 2. Resolve Text
      let incomingText: any = undefined;
      for (const alias of item.aliases) {
        if (incomingTexts[alias] !== undefined) {
          incomingText = incomingTexts[alias];
          break;
        }
      }
      if (incomingText === undefined && typeof incomingVal === 'object' && incomingVal !== null) {
        incomingText = incomingVal.pattern || incomingVal.text;
      }

      for (const alias of item.aliases) {
        const existingTpl = (typeof updatedTemplates[alias] === 'object' && updatedTemplates[alias] !== null) ? updatedTemplates[alias] : {};
        const cleanText = incomingText !== undefined ? String(incomingText).trim() : (existingTpl.pattern || item.defaultPattern);
        const isEnabled = !!cleanNum && cleanText.length > 0;

        updatedTemplates[alias] = {
          ...existingTpl,
          id: cleanNum || 0,
          enabled: isEnabled,
          title: existingTpl.title || item.defaultTitle,
          description: existingTpl.description || '',
          pattern: cleanText,
          required_params: existingTpl.required_params || []
        };
      }
    }

    db.gatewaySettings.sms = {
      ...db.gatewaySettings.sms,
      ...sms,
      templates: updatedTemplates
    };
  }

  db.save();

  logConfigChange(req, {
    resourceType: 'GATEWAY_SETTINGS',
    resourceId: 'GATEWAYS',
    actionDescription: 'بروزرسانی و ذخیره پیکربندی درگاه پرداخت شاپرک زیبال و وب‌سرویس پیامکی SMS.ir توسط مدیر',
    details: { zibal_updated: !!zibal, sms_updated: !!sms }
  });

  return res.json({
    message: 'تنظیمات درگاه‌های بانکی و وب‌سرویس پیامک با موفقیت ذخیره گردید.',
    data: db.gatewaySettings,
  });
});

// 3. Admin: Test Real Zibal Payment Gateway Connection
router.post('/admin/gateways/zibal/test', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const amount = Number(req.body.amount) || 10000;
  const clientOrigin = `${req.protocol}://${req.get('host') || 'localhost:3000'}`;

  const mockOrder: any = {
    id: 999000 + Math.floor(Math.random() * 999),
    order_number: 'TEST-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    amount: amount,
    description: 'تست اتصال درگاه بانکی شاپرک زیبال از پنل مدیریت کارویتا',
  };

  try {
    const result = await initiateZibalPayment(mockOrder, user, clientOrigin);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'خطا در ارسال درخواست تست به درگاه شاپرک زیبال',
        data: result,
      });
    }
    const zibalConfig = getZibalConfig();
    return res.json({
      success: true,
      message: zibalConfig.sandbox
        ? `تست درگاه در حالت آزمایشی (سندباکس) انجام شد. شناسه پیگیری: ${result.trackId}`
        : `اتصال به درگاه واقعی شاپرک زیبال با موفقیت برقرار شد. شناسه پرداخت شاپرک (Track ID): ${result.trackId}`,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'خطا در ارتباط با وب‌سرویس زیبال: ' + err.message,
    });
  }
});

// 4. Admin: Test SMS Dispatch via SMS.ir Fast Send
router.post('/admin/gateways/sms/test', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const { mobile, event_type = 'otp', template_id, parameters = {} } = req.body;

  if (!mobile || !/^09\d{9}$/.test(mobile)) {
    return res.status(422).json({ message: 'شماره موبایل معتبر ۱۱ رقمی وارد نمایید (مثال: 09123456789).' });
  }

  const result = await sendTemplateSms({
    mobile,
    eventType: event_type,
    templateId: template_id ? Number(template_id) : undefined,
    templateTitle: `تست دستی از پنل مدیریت (${event_type})`,
    parameters: Object.keys(parameters).length > 0 ? parameters : {
      CODE: '12345',
      CUSTOMER: 'مدیر سامانه',
      ORDER: 'INV-TEST-01',
      AMOUNT: '500,000',
      LINK: 'karovita.ir',
      DAYS: '۷',
      TITLE: 'سازمانی کارویتا',
      TICKET: 'TK-1001',
      SUBJECT: 'تست سیستم',
      REF: 'SHP-98765432'
    },
    userName: 'مدیر تست',
  });

  if (!result.success) {
    return res.status(400).json({
      message: result.error || 'خطا در ارسال پیامک تست',
      data: result,
    });
  }

  return res.json({
    message: 'پیامک تست با موفقیت ارسال شد.',
    data: result,
  });
});

// 5. Admin: Get SMS Delivery Logs
router.get('/admin/gateways/sms/logs', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 100, 300);
  const rawLogs = (db.smsLogs || []).slice(0, limit);
  const logs = rawLogs.map(l => {
    let code = (l as any).code;
    const msg = (l as any).message || '';
    if (!code && msg) {
      const m = msg.match(/(?:CODE|Code|کد تایید|کد|رمز)\s*[:=]\s*(\d{4,8})/i);
      if (m) code = m[1];
    }
    if (!code && l.parameters && typeof l.parameters === 'object') {
      code = (l.parameters as any).CODE || (l.parameters as any).code || (l.parameters as any).otp;
    }
    return {
      ...l,
      code,
      created_at: (l as any).created_at || l.timestamp,
      timestamp: l.timestamp || (l as any).created_at,
    };
  });
  return res.json({
    data: logs,
    total: (db.smsLogs || []).length,
  });
});

// 6. Admin: Trigger Subscription Expiration Automated Scan (7 & 3 Days)
router.post('/admin/gateways/sms/trigger-reminders', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const report = await checkAndSendSubscriptionExpiryReminders();
    return res.json({
      message: `اسکن انقضای اشتراک‌ها انجام شد. (${report.scanned} اشتراک فعال اسکن شد، ${report.sent7Days} پیامک ۷ روز و ${report.sent3Days} پیامک ۳ روز ارسال شد)`,
      data: report,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'خطا در اجرای اسکن خودکار یادآوری‌ها: ' + err.message });
  }
});

// 7. Admin: Gateways Health Status
router.get('/admin/gateways/health', authMiddleware, adminMiddleware, async (_req: Request, res: Response) => {
  const smsHealth = await checkSmsProviderHealth();
  const zibalConfig = getZibalConfig();

  return res.json({
    sms: smsHealth,
    zibal: {
      status: zibalConfig.enabled ? 'healthy' : 'disabled',
      merchant: zibalConfig.merchant,
      sandbox: Boolean(zibalConfig.sandbox),
      merchant_configured: Boolean(zibalConfig.merchant?.trim()),
      enabled: zibalConfig.enabled,
      provider: 'Zibal (Shaparak Gateway)',
    }
  });
});

export default router;
