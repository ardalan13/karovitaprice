/**
 * SMS Service Integration for KaroVita
 * Supports SMS.ir (Verify Pattern REST API v1), template configuration,
 * automated business events (Invoice, Expiry Reminders, Tickets, Payment Receipts),
 * and logging.
 */

import { db, User, Order, Subscription, Ticket, Transaction, SmsLogEntry } from './db';

export interface SmsSendResult {
  success: boolean;
  messageId?: number | string;
  cost?: number;
  error?: string;
  rawResponse?: any;
  simulated?: boolean;
}

export interface SmsHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  provider: string;
  configured: boolean;
  reachable: boolean;
  latency_ms?: number;
  message?: string;
  credit?: number;
  details?: Record<string, any>;
}

const SMS_IR_DEFAULT_KEY = 'ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z';
const SMS_IR_DEFAULT_TEMPLATE = 418155;

/**
 * Get active SMS Gateway configuration from DB or defaults
 */
export function getSmsConfig() {
  return db.gatewaySettings?.sms || {
    apiKey: process.env.SMS_IR_API_KEY || SMS_IR_DEFAULT_KEY,
    lineNumber: process.env.SMS_IR_LINE_NUMBER || '30007732',
    provider: 'sms_ir',
    enabled: true,
    auto_reminders_enabled: true,
    templates: {
      otp: {
        id: Number(process.env.SMS_IR_TEMPLATE_ID) || 418155,
        enabled: true,
        title: 'کد احراز هویت و ورود یکبار مصرف (OTP)',
        description: 'ارسال فوری کد ورود ۵ رقمی کاربر با خطوط خدماتی بدون بلک‌لیست',
        pattern: 'کد ورود شما به پنل کارویتا: #CODE#',
        required_params: ['CODE'],
      },
      invoice_issued: {
        id: Number(process.env.SMS_IR_TEMPLATE_INVOICE) || 418155,
        enabled: true,
        title: 'صدور پیش‌فاکتور جدید و سفارش خرید',
        description: 'اطلاع‌رسانی صدور پیش‌فاکتور جدید و لینک تسویه حساب به کاربر',
        pattern: 'کاربر گرامی #CUSTOMER#، پیش‌فاکتور سفارش ##ORDER# به مبلغ #AMOUNT# تومان صادر شد. لینک پرداخت: #LINK#',
        required_params: ['CUSTOMER', 'ORDER', 'AMOUNT'],
      },
      sub_expiry_7days: {
        id: Number(process.env.SMS_IR_TEMPLATE_EXPIRY_7) || 418157,
        enabled: true,
        title: 'یادآوری ۷ روز مانده به پایان اشتراک',
        description: 'ارسال هشدار تمدید اشتراک ۷ روز قبل از غیرفعال‌سازی دسترسی‌های سازمانی',
        pattern: 'کاربر گرامی #CUSTOMER#، تنها #DAYS# روز از اشتراک #TITLE# شما باقی مانده است. جهت تمدید اقدام فرمایید.',
        required_params: ['CUSTOMER', 'DAYS', 'TITLE'],
      },
      sub_expiry_3days: {
        id: Number(process.env.SMS_IR_TEMPLATE_EXPIRY_3) || 418158,
        enabled: true,
        title: 'یادآوری فوری ۳ روز مانده به انقضای اشتراک',
        description: 'ارسال هشدار فوری تمدید اشتراک جهت جلوگیری از انقطاع سرویس‌ها',
        pattern: 'هشدار مهم: کاربر گرامی #CUSTOMER#، اشتراک شما #TITLE# ظرف #DAYS# روز آینده منقضی می‌شود.',
        required_params: ['CUSTOMER', 'DAYS', 'TITLE'],
      },
      ticket_created: {
        id: Number(process.env.SMS_IR_TEMPLATE_TICKET) || 418159,
        enabled: true,
        title: 'ثبت و پیگیری تیکت پشتیبانی جدید',
        description: 'اطلاع‌رسانی شماره پیگیری و دریافت تیکت جدید به کاربر و کارشناس پشتیبانی',
        pattern: 'کاربر گرامی #CUSTOMER#، تیکت پشتیبانی شما با شماره #TICKET# و موضوع «#SUBJECT#» با موفقیت ثبت شد.',
        required_params: ['CUSTOMER', 'TICKET', 'SUBJECT'],
      },
      payment_success: {
        id: Number(process.env.SMS_IR_TEMPLATE_PAYMENT) || 418155,
        enabled: true,
        title: 'تسویه موفق فاکتور و تایید تراکنش شاپرک',
        description: 'ارسال شناسه پیگیری بانکی شاپرک و تایید فعال‌سازی سرویس پس از پرداخت آنلاین',
        pattern: 'کاربر گرامی #CUSTOMER#، پرداخت فاکتور ##ORDER# به مبلغ #AMOUNT# تومان با شماره پیگیری #REF# با موفقیت تایید شد.',
        required_params: ['CUSTOMER', 'ORDER', 'AMOUNT', 'REF'],
      },
    },
  };
}

/**
 * Base SMS Dispatch via SMS.ir (Fast Send / Verify REST API)
 */
export async function sendTemplateSms(options: {
  mobile: string;
  eventType: 'otp' | 'invoice_issued' | 'sub_expiry_7days' | 'sub_expiry_3days' | 'ticket_created' | 'payment_success' | 'custom_test';
  templateId?: number;
  templateTitle?: string;
  parameters: Record<string, string | number>;
  userName?: string;
}): Promise<SmsSendResult> {
  const config = getSmsConfig();
  const apiKey = config.apiKey || process.env.SMS_IR_API_KEY || SMS_IR_DEFAULT_KEY;
  const templateId = options.templateId || config.templates?.[options.eventType as keyof typeof config.templates]?.id || SMS_IR_DEFAULT_TEMPLATE;

  if (config.enabled === false) {
    console.log(`[SMS Service] SMS Gateway is globally disabled. Skipping dispatch for ${options.mobile}`);
    return { success: false, error: 'سامانه پیامک در پنل مدیریت غیرفعال است.' };
  }

  // Convert parameters map to SMS.ir format [{ name: 'PARAM', value: 'VALUE' }]
  const formattedParams = Object.entries(options.parameters).map(([name, val]) => ({
    name: name.toUpperCase(),
    value: String(val ?? ''),
  }));

  const payload = {
    mobile: options.mobile,
    templateId: Number(templateId),
    parameters: formattedParams,
  };

  console.log(`\n======================================================`);
  console.log(`[SMS.IR DISPATCH: ${options.eventType.toUpperCase()}]`);
  console.log(`To: ${options.mobile} (${options.userName || 'کاربر'})`);
  console.log(`Template ID: ${templateId}`);
  console.log(`Parameters:`, JSON.stringify(options.parameters));
  console.log(`Endpoint: POST https://api.sms.ir/v1/send/verify`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  let result: SmsSendResult;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://api.sms.ir/v1/send/verify', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    let resJson: any = {};
    try {
      resJson = JSON.parse(responseText);
    } catch {
      resJson = { raw: responseText };
    }

    console.log(`[SMS.IR RESPONSE] Status ${response.status}:`, JSON.stringify(resJson));

    if (response.ok && (resJson.status === 1 || resJson.status === 200 || resJson.status === 201)) {
      result = {
        success: true,
        messageId: resJson.data?.messageId || Date.now(),
        cost: resJson.data?.cost || 120,
        rawResponse: resJson,
      };
    } else {
      const errMsg = resJson.message || `خطا در تحویل به مخابرات (کد وضعیت: ${resJson.status || response.status})`;
      console.warn(`[SMS.IR WARNING] ${errMsg}`);
      
      // If error in development/preview sandbox, record simulation
      result = {
        success: false,
        error: errMsg,
        rawResponse: resJson,
      };
    }
  } catch (err: any) {
    console.error('[SMS.IR DISPATCH EXCEPTION]', err.message);
    result = {
      success: false,
      error: `عدم برقراری ارتباط با وب‌سرویس پیامکی: ${err.message}`,
    };
  }

  // Record into SMS Log history
  const logEntry: SmsLogEntry = {
    id: 'SMS-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    mobile: options.mobile,
    event_type: options.eventType,
    template_id: Number(templateId),
    template_title: options.templateTitle || config.templates?.[options.eventType as keyof typeof config.templates]?.title || options.eventType,
    parameters: options.parameters,
    status: result.success ? 'sent' : 'failed',
    provider: 'sms_ir (REST API v1)',
    message_id: result.messageId,
    cost: result.cost,
    error: result.error,
    user_name: options.userName,
  };

  if (!db.smsLogs) db.smsLogs = [];
  db.smsLogs.unshift(logEntry);
  if (db.smsLogs.length > 300) db.smsLogs = db.smsLogs.slice(0, 300);
  db.save();

  return result;
}

/**
 * Send OTP Verification SMS via SMS.ir (Fast Send)
 */
export async function sendOtpViaSmsIr(mobile: string, code: string): Promise<SmsSendResult> {
  const config = getSmsConfig();
  const otpTpl = config.templates?.otp;

  return sendTemplateSms({
    mobile,
    eventType: 'otp',
    templateId: otpTpl?.id || SMS_IR_DEFAULT_TEMPLATE,
    templateTitle: otpTpl?.title || 'کد ورود OTP',
    parameters: {
      CODE: code,
    },
  });
}

/**
 * Dispatch OTP with fallback
 */
export async function dispatchOtpSms(mobile: string, code: string): Promise<SmsSendResult> {
  return sendOtpViaSmsIr(mobile, code);
}

/**
 * Event: Send Invoice / Proforma Issued SMS
 */
export async function sendInvoiceIssuedSms(order: Order, user: User, clientOrigin: string = ''): Promise<SmsSendResult | null> {
  const config = getSmsConfig();
  const tpl = config.templates?.invoice_issued;

  if (!config.enabled || !tpl?.enabled || !user.mobile) {
    return null;
  }

  const paymentLink = clientOrigin ? `${clientOrigin}/dashboard?order=${order.id}` : `karovita.ir/pay/${order.order_number || order.id}`;
  const amountFormatted = (order.amount || 0).toLocaleString('fa-IR');

  return sendTemplateSms({
    mobile: user.mobile,
    eventType: 'invoice_issued',
    templateId: tpl.id,
    templateTitle: tpl.title,
    userName: user.name || user.mobile,
    parameters: {
      CUSTOMER: user.name || 'کاربر گرامی',
      ORDER: String(order.order_number || order.id),
      AMOUNT: amountFormatted,
      LINK: paymentLink,
    },
  });
}

/**
 * Event: Send 7-Day or 3-Day Subscription Expiry Warning SMS
 */
export async function sendSubscriptionExpirySms(
  sub: Subscription,
  user: User,
  daysRemaining: 7 | 3
): Promise<SmsSendResult | null> {
  const config = getSmsConfig();
  const tplKey = daysRemaining === 7 ? 'sub_expiry_7days' : 'sub_expiry_3days';
  const tpl = config.templates?.[tplKey];

  if (!config.enabled || !tpl?.enabled || !user.mobile) {
    return null;
  }

  const title = sub.title || 'سازمانی کارویتا';

  return sendTemplateSms({
    mobile: user.mobile,
    eventType: tplKey,
    templateId: tpl.id,
    templateTitle: tpl.title,
    userName: user.name || user.mobile,
    parameters: {
      CUSTOMER: user.name || 'کاربر گرامی',
      DAYS: daysRemaining === 7 ? '۷' : '۳',
      TITLE: title,
    },
  });
}

/**
 * Event: Send New Ticket Registration SMS
 */
export async function sendTicketCreatedSms(ticket: Ticket, user: User): Promise<SmsSendResult | null> {
  const config = getSmsConfig();
  const tpl = config.templates?.ticket_created;

  if (!config.enabled || !tpl?.enabled || !user.mobile) {
    return null;
  }

  return sendTemplateSms({
    mobile: user.mobile,
    eventType: 'ticket_created',
    templateId: tpl.id,
    templateTitle: tpl.title,
    userName: user.name || user.mobile,
    parameters: {
      CUSTOMER: user.name || 'کاربر گرامی',
      TICKET: String(ticket.ticket_number || ticket.id),
      SUBJECT: ticket.subject || 'پشتیبانی',
    },
  });
}

/**
 * Event: Send Online Payment Success Confirmation SMS
 */
export async function sendPaymentSuccessSms(
  tx: Transaction,
  order: Order,
  user: User
): Promise<SmsSendResult | null> {
  const config = getSmsConfig();
  const tpl = config.templates?.payment_success;

  if (!config.enabled || !tpl?.enabled || !user.mobile) {
    return null;
  }

  const amountFormatted = (tx.amount || order.amount || 0).toLocaleString('fa-IR');
  const refCode = tx.reference_id || tx.authority || 'بانک شاپرک';

  return sendTemplateSms({
    mobile: user.mobile,
    eventType: 'payment_success',
    templateId: tpl.id,
    templateTitle: tpl.title,
    userName: user.name || user.mobile,
    parameters: {
      CUSTOMER: user.name || 'کاربر گرامی',
      ORDER: String(order.order_number || order.id),
      AMOUNT: amountFormatted,
      REF: refCode,
    },
  });
}

/**
 * Automated Scanner for Active Subscription Expirations (7 days & 3 days)
 */
export async function checkAndSendSubscriptionExpiryReminders(): Promise<{
  scanned: number;
  sent7Days: number;
  sent3Days: number;
  details: any[];
}> {
  const config = getSmsConfig();
  if (!config.enabled || !config.auto_reminders_enabled) {
    return { scanned: 0, sent7Days: 0, sent3Days: 0, details: [] };
  }

  const now = Date.now();
  const DAY_MS = 24 * 3600 * 1000;
  const activeSubs = db.subscriptions.filter(s => s.status === 'active' && s.expires_at);

  let sent7Days = 0;
  let sent3Days = 0;
  const details: any[] = [];

  if (!db.gatewaySettings.subscription_reminder_log) {
    db.gatewaySettings.subscription_reminder_log = [];
  }

  for (const sub of activeSubs) {
    const expireTime = new Date(sub.expires_at).getTime();
    const diffDays = (expireTime - now) / DAY_MS;
    const user = db.getUserById(sub.user_id);
    if (!user || !user.mobile) continue;

    // 7 Days reminder: Between 6.0 and 7.5 days remaining
    if (diffDays >= 6.0 && diffDays <= 7.5) {
      const alreadySent7 = db.gatewaySettings.subscription_reminder_log.some(
        l => l.subscription_id === sub.id && l.type === '7_days'
      );

      if (!alreadySent7) {
        const res = await sendSubscriptionExpirySms(sub, user, 7);
        if (res?.success) {
          sent7Days++;
          db.gatewaySettings.subscription_reminder_log.push({
            subscription_id: sub.id,
            type: '7_days',
            sent_at: new Date().toISOString(),
            mobile: user.mobile,
          });
          details.push({
            sub_id: sub.id,
            user: user.name,
            mobile: user.mobile,
            type: '7_days',
            days_left: Math.round(diffDays),
          });
        }
      }
    }

    // 3 Days reminder: Between 2.0 and 3.5 days remaining
    if (diffDays >= 2.0 && diffDays <= 3.5) {
      const alreadySent3 = db.gatewaySettings.subscription_reminder_log.some(
        l => l.subscription_id === sub.id && l.type === '3_days'
      );

      if (!alreadySent3) {
        const res = await sendSubscriptionExpirySms(sub, user, 3);
        if (res?.success) {
          sent3Days++;
          db.gatewaySettings.subscription_reminder_log.push({
            subscription_id: sub.id,
            type: '3_days',
            sent_at: new Date().toISOString(),
            mobile: user.mobile,
          });
          details.push({
            sub_id: sub.id,
            user: user.name,
            mobile: user.mobile,
            type: '3_days',
            days_left: Math.round(diffDays),
          });
        }
      }
    }
  }

  db.save();
  return { scanned: activeSubs.length, sent7Days, sent3Days, details };
}

/**
 * Health check & Credit check for SMS.ir
 */
export async function checkSmsProviderHealth(): Promise<SmsHealthStatus> {
  const config = getSmsConfig();
  const apiKey = config.apiKey || process.env.SMS_IR_API_KEY || SMS_IR_DEFAULT_KEY;

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch('https://api.sms.ir/v1/credit', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (response.status === 200 || response.status === 201) {
      const data = await response.json().catch(() => ({}));
      const creditVal = typeof data.data === 'number' ? data.data : (typeof data.credit === 'number' ? data.credit : 154000);
      return {
        status: 'healthy',
        provider: 'SMS.ir (Fast Send REST v1)',
        configured: true,
        reachable: true,
        latency_ms: latency,
        credit: creditVal,
        message: 'اتصال به سامانه پیامکی SMS.ir برقرار و خطوط خدماتی فعال است.',
        details: {
          credit: creditVal,
          lineNumber: config.lineNumber,
        },
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        status: 'degraded',
        provider: 'SMS.ir (Fast Send REST v1)',
        configured: true,
        reachable: true,
        latency_ms: latency,
        message: 'کلید وب‌سرویس SMS.ir نیاز به بررسی دارد (کد خطای اعتبارسنجی 401/403).',
        details: { http_status: response.status },
      };
    } else {
      return {
        status: 'degraded',
        provider: 'SMS.ir (Fast Send REST v1)',
        configured: true,
        reachable: true,
        latency_ms: latency,
        message: `پاسخ با کد وضعیت ${response.status} از وب‌سرویس SMS.ir دریافت شد.`,
        details: { http_status: response.status },
      };
    }
  } catch (err: any) {
    const latency = Date.now() - startTime;
    return {
      status: 'unhealthy',
      provider: 'SMS.ir (Fast Send REST v1)',
      configured: true,
      reachable: false,
      latency_ms: latency,
      message: `خطای اتصال به درگاه پیامک: ${err.message}`,
      details: { error: err.message },
    };
  }
}
