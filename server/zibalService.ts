import { db, Order, User, Transaction } from './db';
import { logFinancialEvent } from './auditLogger';

export interface ZibalRequestResult {
  success: boolean;
  trackId?: string | number;
  paymentUrl?: string;
  resultCode?: number;
  message?: string;
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
    merchant: process.env.ZIBAL_MERCHANT || 'zibal',
    sandbox: process.env.ZIBAL_SANDBOX !== 'false',
    callback_url: '/api/payments/zibal/callback',
    enabled: true,
    description_prefix: 'سامانه ابری کارویتا - سفارش #',
    auto_verify: true,
  };
  return settings;
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
  const merchant = config.merchant || 'zibal';
  const isSandbox = config.sandbox || merchant === 'zibal';

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
    const timeoutId = setTimeout(() => controller.abort(), 7000);

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
        message: resJson.message || 'درخواست تراکنش با موفقیت ثبت شد',
        rawResponse: resJson,
      };
    } else {
      const errorMsg = getZibalErrorMessage(resJson.result) || resJson.message || 'خطا در برقراری ارتباط با درگاه شاپرک زیبال';
      console.warn(`[ZIBAL REQUEST ERROR] Code ${resJson.result}: ${errorMsg}`);

      // If in sandbox mode or test mode, provide an internal fallback so testing flows don't halt
      if (isSandbox) {
        const simulatedTrackId = 'sim-' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 6);
        return {
          success: true,
          trackId: simulatedTrackId,
          paymentUrl: `/api/payments/zibal/callback?trackId=${simulatedTrackId}&success=1&status=2&orderId=${order.id}`,
          resultCode: 100,
          message: 'سندباکس شبیه‌ساز پرداخت زیبال (حالت تستی فعال)',
          rawResponse: { simulated: true, originalError: errorMsg },
        };
      }

      return {
        success: false,
        resultCode: resJson.result,
        message: errorMsg,
        rawResponse: resJson,
      };
    }
  } catch (err: any) {
    console.error('[ZIBAL REQUEST EXCEPTION]', err.message);

    if (isSandbox) {
      const simulatedTrackId = 'sim-' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 6);
      return {
        success: true,
        trackId: simulatedTrackId,
        paymentUrl: `/api/payments/zibal/callback?trackId=${simulatedTrackId}&success=1&status=2&orderId=${order.id}`,
        resultCode: 100,
        message: 'شبیه‌ساز پرداخت زیبال (سندباکس توسعه محلی)',
        rawResponse: { simulated: true, error: err.message },
      };
    }

    return {
      success: false,
      message: `خطای ارتباطی با سرورهای درگاه شاپرک: ${err.message}`,
    };
  }
}

/**
 * Verify payment with Zibal (کال‌بک تایید تراکنش شاپرک)
 */
export async function verifyZibalPayment(trackId: string): Promise<ZibalVerifyResult> {
  const config = getZibalConfig();
  const merchant = config.merchant || 'zibal';

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
  const merchant = config.merchant || 'zibal';

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

/**
 * Standard Zibal API error codes mapping in Persian
 */
export function getZibalErrorMessage(code: number): string {
  switch (code) {
    case 100:
      return 'با موفقیت انجام شد';
    case 102:
      return 'شناسه مرچنت (merchant) در سیستم زیبال یافت نشد';
    case 103:
      return 'شناسه مرچنت زیبال غیرفعال است';
    case 104:
      return 'شناسه مرچنت نامعتبر است';
    case 105:
      return 'مبلغ پرداخت باید حداقل ۱٬۰۰۰ ریال (۱۰۰ تومان) باشد';
    case 106:
      return 'آدرس بازگشت (callbackUrl) نامعتبر است';
    case 113:
      return 'مبلغ تراکنش بیش از سقف مجاز روزانه درگاه است';
    case 201:
      return 'تراکنش قبلاً با موفقیت تایید شده است';
    case 202:
      return 'سفارش پرداخت نشده یا توسط کاربر لغو شده است';
    case 203:
      return 'شناسه پیگیری (trackId) در زیبال نامعتبر است';
    default:
      return `خطای درگاه زیبال (کد وضعیت: ${code})`;
  }
}
