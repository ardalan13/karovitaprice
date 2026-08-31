/**
 * SMS Service Integration for KaroVita
 * Supports SMS.ir (Fast Send / Verify REST API) and other providers.
 */

export interface SmsIrVerifyParams {
  name: string;
  value: string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: number | string;
  cost?: number;
  error?: string;
  rawResponse?: any;
}

const SMS_IR_DEFAULT_KEY = 'ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z';
const SMS_IR_DEFAULT_TEMPLATE = 418155;
const SMS_IR_DEFAULT_PARAM_NAME = 'CODE';

/**
 * Send OTP Verification SMS via SMS.ir (Verify Pattern API)
 * Template: "کد ورود شما به پنل کارویتا: #CODE#"
 * 
 * @param mobile 11-digit Iranian mobile number (09xxxxxxxxx)
 * @param code The numeric OTP code
 */
export async function sendOtpViaSmsIr(mobile: string, code: string): Promise<SmsSendResult> {
  const apiKey = process.env.SMS_IR_API_KEY || SMS_IR_DEFAULT_KEY;
  const templateId = Number(process.env.SMS_IR_TEMPLATE_ID) || SMS_IR_DEFAULT_TEMPLATE;
  const paramName = process.env.SMS_IR_PARAM_NAME || SMS_IR_DEFAULT_PARAM_NAME;

  const payload = {
    mobile: mobile,
    templateId: templateId,
    parameters: [
      {
        name: paramName,
        value: String(code),
      },
    ],
  };

  console.log(`\n======================================================`);
  console.log(`[SMS.IR OTP DISPATCH]`);
  console.log(`To: ${mobile}`);
  console.log(`Template ID: ${templateId}`);
  console.log(`Parameter [${paramName}]: ${code}`);
  console.log(`Endpoint: POST https://api.sms.ir/v1/send/verify`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  try {
    const response = await fetch('https://api.sms.ir/v1/send/verify', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let resJson: any = {};
    try {
      resJson = JSON.parse(responseText);
    } catch {
      resJson = { raw: responseText };
    }

    console.log(`[SMS.IR RESPONSE] HTTP ${response.status}:`, JSON.stringify(resJson));

    // SMS.ir returns { status: 1, message: "موفق", data: { messageId: 123, cost: ... } }
    if (response.ok && (resJson.status === 1 || resJson.status === 200 || resJson.status === 201)) {
      return {
        success: true,
        messageId: resJson.data?.messageId,
        cost: resJson.data?.cost,
        rawResponse: resJson,
      };
    } else {
      const errMsg = resJson.message || `خطای ارسال پیامک از سرویس دهنده (Status: ${resJson.status || response.status})`;
      console.warn(`[SMS.IR WARNING] ${errMsg}`);
      return {
        success: false,
        error: errMsg,
        rawResponse: resJson,
      };
    }
  } catch (err: any) {
    console.error('[SMS.IR DISPATCH EXCEPTION]', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Unified OTP Dispatcher with SMS.ir as primary driver and fallbacks
 */
export async function dispatchOtpSms(mobile: string, code: string): Promise<SmsSendResult> {
  const driver = process.env.SMS_DRIVER || 'sms_ir';

  // Primary: SMS.ir
  if (driver === 'sms_ir' || !process.env.SMS_DRIVER) {
    const result = await sendOtpViaSmsIr(mobile, code);
    if (result.success) {
      return result;
    }
    console.warn('[SMS Driver] Primary SMS.ir failed, checking configured fallbacks...');
  }

  // Fallback 1: Mediana (if configured)
  const medianaApiKey = process.env.MEDIANA_API_KEY;
  const medianaBaseUrl = process.env.MEDIANA_BASE_URL;
  if (medianaApiKey && medianaBaseUrl) {
    try {
      console.log(`[Mediana SMS Fallback] Sending OTP to ${mobile}...`);
      const res = await fetch(`${medianaBaseUrl}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.MEDIANA_AUTH_PREFIX ? `${process.env.MEDIANA_AUTH_PREFIX} ${medianaApiKey}` : medianaApiKey,
        },
        body: JSON.stringify({
          recipient: mobile,
          message: `کد ورود شما به پنل کارویتا: ${code}`,
          pattern_code: process.env.MEDIANA_PATTERN_CODE,
          code,
        }),
      });
      if (res.ok) {
        return { success: true, rawResponse: await res.json().catch(() => ({})) };
      }
    } catch (e: any) {
      console.warn('[Mediana Fallback Error]', e.message);
    }
  }

  // Fallback 2: Kavenegar (if configured)
  const kavenegarKey = process.env.KAVENEGAR_API_KEY;
  if (kavenegarKey) {
    try {
      console.log(`[Kavenegar SMS Fallback] Sending OTP to ${mobile}...`);
      const res = await fetch(`https://api.kavenegar.com/v1/${kavenegarKey}/sms/send.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          receptor: mobile,
          message: `کد ورود شما به پنل کارویتا: ${code}`,
        }),
      });
      if (res.ok) {
        return { success: true, rawResponse: await res.json().catch(() => ({})) };
      }
    } catch (e: any) {
      console.warn('[Kavenegar Fallback Error]', e.message);
    }
  }

  return {
    success: false,
    error: 'امکان ارسال پیامک از طریق درگاه‌های فعال وجود ندارد.',
  };
}
