/**
 * ماژول محاسبه دوره و ماه‌های اشتراک بر اساس روزهای تقویمی واقعی
 * 
 * منطق محاسبه اشتراک:
 * ۱. طول پایه هر ماه: میانگین دقیق تقویمی سال DAYS_IN_MONTH = 365 / 12 (~30.4167 روز)
 * ۲. محاسبه نسبت اعشاری ماه: rawMonths = days / DAYS_IN_MONTH
 * ۳. حداقل پرداخت: برای روزهای کمتر یا مساوی یک ماه کامل (days <= DAYS_IN_MONTH یا ورودی کمتر از ۳۰ روز)، حداقل ۱ ماه است.
 * ۴. گرد کردن بخش اعشاری:
 *    - برای روزهای اضافه نزدیک به شروع ماه جدید (تقریباً بین ۶ تا ۲۵ روز بعد از ماه کامل)، ماه به بالا گرد می‌شود.
 *    - برای مقادیر بسیار جزئی ناشی از باقیمانده تقویمی سالانه (مانند ۳۶۵ روز یا ۳۶۶ روز کبیسه)، ماه سیزدهم تولید نشده و خروجی دقیقاً ۱۲ ماه باقی می‌ماند.
 *    - برای روزهای انتهای ماه (مانند ۲۶ روز اضافه در ۵۶ روز) که به ماه بعد سرریز نمی‌شود، گرد به بالا صورت نمی‌گیرد.
 */

export const DAYS_IN_MONTH = 365 / 12; // 30.416666666666668

export const ROUND_UP_EXTRA_DAYS_THRESHOLD = 5.0; // آستانه ورود معنادار به ماه جدید (~۵ تا ۶ روز)

/**
 * محاسبه نسبت اعشاری ماه
 * @param {number|string} days - تعداد روز
 * @returns {number} نسبت اعشاری
 */
export function getRawSubscriptionMonths(days) {
  const d = Math.max(0, Number(days) || 0);
  return d / DAYS_IN_MONTH;
}

/**
 * محاسبه تعداد ماه‌های اشتراک بر اساس روزهای باقیمانده
 * @param {number|string} days - تعداد روزهای باقیمانده یا مدت پکیج
 * @returns {number} تعداد ماه‌ها به صورت عدد صحیح
 */
export function calculateSubscriptionMonths(days) {
  const d = Math.max(0, Number(days) || 0);

  // حداقل پرداخت: برای روزهای کمتر یا مساوی یک ماه کامل، خروجی همیشه حداقل ۱ ماه است
  if (d <= DAYS_IN_MONTH) {
    return 1;
  }

  const rawMonths = d / DAYS_IN_MONTH;
  const baseMonths = Math.floor(rawMonths);
  const extraDays = d - (baseMonths * DAYS_IN_MONTH);

  // روزهای اضافه معنادار نزدیک به شروع ماه جدید: گرد به بالا
  // روزهای بسیار جزئی (مانند باقیمانده تقویمی ۳۶۵ یا ۳۶۶ روز سالانه): گرد به بالا صورت نمی‌گیرد
  if (extraDays >= ROUND_UP_EXTRA_DAYS_THRESHOLD) {
    return baseMonths + 1;
  }

  return Math.max(1, baseMonths);
}
