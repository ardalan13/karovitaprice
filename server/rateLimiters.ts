import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Standard Persian Error Response for Rate Limits
 */
const rateLimitHandler = (customMessage: string) => {
  return (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: customMessage,
      retry_after_seconds: res.getHeader('Retry-After') || 60,
    });
  };
};

/**
 * Global API Rate Limiter
 * Applied across all /api/* routes to prevent massive DDoS and bot scraping.
 * Limit: 180 requests per 1 minute per IP.
 */
export const globalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً یک دقیقه دیگر مجدداً تلاش کنید.'),
});

/**
 * Strict Rate Limiter for OTP Generation & SMS Dispatch (/api/auth/otp/request)
 * Prevents SMS pumping, billing exhaustion, and spam flooding.
 * Limit: 5 requests per 10 minutes per IP/Client.
 */
export const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('تعداد درخواست‌های ارسال کد تأیید بیش از حد مجاز است. به منظور حفظ امنیت، لطفاً ۱۰ دقیقه بعد تلاش نمایید.'),
});

/**
 * Strict Rate Limiter for OTP Verification (/api/auth/otp/verify)
 * Prevents Brute-Force code guessing attacks.
 * Limit: 10 verification attempts per 10 minutes per IP/Client.
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('تعداد دفعات بررسی کد بیش از حد مجاز است. لطفاً ۱۰ دقیقه دیگر مجدداً تلاش کنید.'),
});

/**
 * Rate Limiter for Ticket Submissions (/api/tickets)
 * Prevents spam ticket flooding and database exhaustion.
 * Limit: 10 tickets per 15 minutes.
 */
export const ticketSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('تعداد تیکت‌های ارسالی بیش از سقف مجاز در این بازه زمانی است. لطفاً ۱۵ دقیقه دیگر تلاش نمایید.'),
});

/**
 * Rate Limiter for Ticket Messages & Replies (/api/tickets/:id/messages)
 * Limit: 25 messages per 10 minutes.
 */
export const ticketMessageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('ارسال پیام‌های متوالی بیش از حد مجاز است. لطفاً کمی صبر کرده و مجدداً ارسال نمایید.'),
});

/**
 * Rate Limiter for Coupon Verification (/api/coupons/validate)
 * Prevents automated coupon brute-forcing and dictionary attacks.
 * Limit: 12 checks per 5 minutes.
 */
export const couponValidateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('تعداد دفعات بررسی کد تخفیف بیش از حد مجاز است. لطفاً ۵ دقیقه دیگر امتحان کنید.'),
});

/**
 * Rate Limiter for Order Creation & Checkout (/api/orders)
 * Limit: 20 orders per 10 minutes.
 */
export const orderCreationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('تعداد سفارش‌های ارسالی بیش از حد مجاز است. لطفاً چند دقیقه بعد مجدداً اقدام فرمایید.'),
});
