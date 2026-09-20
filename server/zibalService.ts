import { db, Order, User, Transaction } from './db';
import { logFinancialEvent } from './auditLogger';

export interface ZibalRequestResult {
  success: boolean;
  trackId?: string | number;
  paymentUrl?: string;
  resultCode?: number;
  message?: string;
  simulated?: boolean;
  rawResponse?: any;
}

export interface ZibalVerifyResult {
  success: boolean;
  resultCode: number;
  message: string;
  refNumber?: string;
  cardNumber?: string;
  amount?: number;
  paidAt?: string;
  status?: number;
  rawResponse?: any;
}

/**
 * Helper to get active Zibal Gateway configuration
 */
export function getZibalConfig() {
  const settings = db.gatewaySettings?.zibal || {
    merchant: process.env.ZIBAL_MERCHANT || '',
    sandbox: process.env.ZIBAL_SANDBOX === 'true' || process.env.ZIBAL_SANDBOX === '1',
    callback_url: '/api/payments/zibal/callback',
    enabled: true,
    description_prefix: 'سامانه ابری کارویتا - سفارش #',
    auto_verify: true,
  };
  return settings;
}

/**
 * Standard Zibal API error codes mapping in Persian with detailed guidance
 */
export function getZibalErrorMessage(code: number, rawMessage?: string): string {
  switch (code) {
    case 100:
      return 'با موفقیت انجام شد';
    case 102:
      return 'شناسه مرچنت (merchant) در سیستم زیبال یافت نشد. لطفاً کد مرچنت را در پنل مدیریت بررسی و اصلاح نمایید.';
    case 103:
      return 'درگاه/مرچنت زیبال غیرفعال است. جهت فعال‌سازی، وضعیت درگاه را در پنل زیبال بررسی نمایید.';
    case 104:
      return 'شناسه مرچنت نامعتبر است.';
    case 105:
      return 'مبلغ پرداخت باید حداقل ۱٬۰۰۰ ریال (۱۰۰ تومان) باشد.';
    case 106:
      return 'آدرس بازگشت (callbackUrl) نامعتبر است (باید با http:// یا https:// شروع شود).';
    case 113:
      return 'مبلغ تراکنش بیش از سقف مجاز روزانه درگاه است.';
    case 114:
      return 'شماره کارت غیرمجاز است.';
    case 115:
      return 'آی‌پی سرور در پنل زیبال ثبت نشده است (کد ۱۱۵). لطفاً درگاه خود را در پنل کاربری زیبال بررسی کرده و آی‌پی سرور را ثبت نمایید یا محدودیت آی‌پی را بردارید.';
    case 201:
      return 'تراکنش قبلاً با موفقیت تایید شده است.';
    case 202:
      return 'سفارش پرداخت نشده یا توسط کاربر لغو شده است.';
    case 203:
      return 'شناسه پیگیری (trackId) در زیبال نامعتبر است.';
    default:
      return rawMessage || `خطای درگاه زیبال (کد وضعیت: ${code})`;
  }
}

/**
 * Initiate an online payment request via Zibal (زیبال - شبکه شاپرک)
 */
export async function initiateZibalPayment(
  order: Order,
  user: User,
  clientOrigin: string
): Promise<ZibalRequestResult> {
  const config = getZibalConfig();
  const merchant = (config.merchant || '').trim();
  const isSandbox = Boolean(config.sandbox);

  if (!merchant) {
    return {
      success: false,
      resultCode: 102,
      message: 'کد مرچنت زیبال در تنظیمات درگاه وارد نشده است. لطفاً از پنل مدیریت (بخش درگاه شاپرک)، کد مرچنت را ثبت و ذخیره نمایید.',
      simulated: false,
    };
  }

  // Iranian gateways accept amount in RIALS (KaroVita stores in TOMANS)
  const amountRials = Math.max(10000, (order.amount || 0) * 10);
  
  // Format callback URL
  let callbackUrl = config.callback_url || '/api/payments/zibal/callback';
  if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
    const origin = clientOrigin.replace(/\/+$/, '');
    callbackUrl = `${origin}${callbackUrl.startsWith('/') ? '' : '/'}${callbackUrl}`;
  }

  const payload = {
    merchant: merchant,
    amount: amountRials,
    callbackUrl: callbackUrl,
    description: `${config.description_prefix || 'سامانه ابری کارویتا - سفارش #'}${order.order_number || order.id}`,
    orderId: String(order.id),
    mobile: user.mobile || undefined,
  };

  console.log(`\n======================================================`);
  console.log(`[ZIBAL PAYMENT GATEWAY REQUEST]`);
  console.log(`Merchant: ${merchant} (Sandbox: ${isSandbox})`);
  console.log(`Order ID: ${order.id} (#${order.order_number})`);
  console.log(`Amount: ${(order.amount || 0).toLocaleString('fa-IR')} Toman (${amountRials} Rials)`);
  console.log(`Callback: ${callbackUrl}`);
  console.log(`Endpoint: POST https://gateway.zibal.ir/v1/request`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    const response = await fetch('https://gateway.zibal.ir/v1/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const resJson: any = await response.json().catch(() => ({}));
    console.log(`[ZIBAL RESPONSE] Status ${response.status}:`, JSON.stringify(resJson));

    if (response.ok && resJson.result === 100 && resJson.trackId) {
      const trackId = String(resJson.trackId);
      const paymentUrl = `https://gateway.zibal.ir/start/${trackId}`;

      return {
        success: true,
        trackId: trackId,
        paymentUrl: paymentUrl,
        resultCode: resJson.result,
        message: resJson.message || 'درخواست تراکنش با موفقیت در زیبال ثبت شد',
        simulated: false,
        rawResponse: resJson,
      };
    } else {
      const errorMsg = getZibalErrorMessage(resJson.result, resJson.message);
      console.warn(`[ZIBAL REQUEST ERROR] Code ${resJson.result}: ${errorMsg}`);

      // In real/production mode, NEVER fake success! Always report real gateway error
      return {
        success: false,
        resultCode: resJson.result,
        message: errorMsg,
        simulated: false,
        rawResponse: resJson,
      };
    }
  } catch (err: any) {
    console.error('[ZIBAL REQUEST EXCEPTION]', err.message);

    return {
      success: false,
      message: `خطای ارتباطی با سرورهای درگاه شاپرک زیبال: ${err.message}`,
      simulated: false,
    };
  }
}

/**
 * Verify payment with Zibal (کال‌بک تایید تراکنش شاپرک)
 */
export async function verifyZibalPayment(trackId: string): Promise<ZibalVerifyResult> {
  const config = getZibalConfig();
  const merchant = (config.merchant || '').trim();

  // Check if simulated
  if (trackId.startsWith('sim-') || trackId.startsWith('sandbox-')) {
    const fakeShaparakRef = 'SHP' + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000);
    return {
      success: true,
      resultCode: 100,
      message: 'تراکنش در محیط شبیه‌ساز با موفقیت تایید شد.',
      refNumber: fakeShaparakRef,
      cardNumber: '603799******' + Math.floor(1000 + Math.random() * 9000),
      paidAt: new Date().toISOString(),
      status: 1,
      rawResponse: { simulated: true },
    };
  }

  if (!merchant) {
    return {
      success: false,
      resultCode: 102,
      message: 'شناسه مرچنت زیبال در تنظیمات سیستم یافت نشد.',
    };
  }

  console.log(`\n======================================================`);
  console.log(`[ZIBAL VERIFICATION REQUEST]`);
  console.log(`Merchant: ${merchant}`);
  console.log(`TrackId: ${trackId}`);
  console.log(`Endpoint: POST https://gateway.zibal.ir/v1/verify`);
  console.log(`======================================================\n`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch('https://gateway.zibal.ir/v1/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        merchant: merchant,
        trackId: trackId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const resJson: any = await response.json().catch(() => ({}));
    console.log(`[ZIBAL VERIFY RESPONSE] Code ${resJson.result}:`, JSON.stringify(resJson));

    // result: 100 = success, 201 = previously confirmed
    if (resJson.result === 100 || resJson.result === 201) {
      return {
        success: true,
        resultCode: resJson.result,
        message: resJson.result === 100 ? 'تراکنش بانکی با موفقیت تایید شد' : 'تراکنش قبلاً تایید شده است',
        refNumber: String(resJson.refNumber || resJson.shaparakRef || trackId),
        cardNumber: resJson.cardNumber || undefined,
        amount: resJson.amount ? Math.round(resJson.amount / 10) : undefined, // Convert back to Toman
        paidAt: resJson.paidAt || new Date().toISOString(),
        status: resJson.status || 1,
        rawResponse: resJson,
      };
    } else {
      const errorMsg = getZibalErrorMessage(resJson.result) || resJson.message || 'تراکنش توسط بانک تایید نشد';
      return {
        success: false,
        resultCode: resJson.result || -1,
        message: errorMsg,
        rawResponse: resJson,
      };
    }
  } catch (err: any) {
    console.error('[ZIBAL VERIFY EXCEPTION]', err.message);
    return {
      success: false,
      resultCode: -1,
      message: `خطا در استعلام تاییدیه از درگاه: ${err.message}`,
    };
  }
}

/**
 * Inquiry transaction status from Zibal
 */
export async function inquiryZibalTransaction(trackId: string): Promise<any> {
  const config = getZibalConfig();
  const merchant = (config.merchant || '').trim();

  try {
    const response = await fetch('https://gateway.zibal.ir/v1/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant, trackId }),
    });
    return await response.json();
  } catch (err: any) {
    return { result: -1, message: err.message };
  }
}


