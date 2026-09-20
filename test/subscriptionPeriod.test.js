import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateSubscriptionMonths as serverCalc, 
  getRawSubscriptionMonths as serverRaw, 
  DAYS_IN_MONTH as serverDaysInMonth 
} from '../server/subscriptionPeriod.ts';
import { 
  calculateSubscriptionMonths as clientCalc, 
  getRawSubscriptionMonths as clientRaw, 
  DAYS_IN_MONTH as clientDaysInMonth 
} from '../src/utils/subscriptionPeriod.js';

describe('Subscription Calendar Period Calculation (Server & Client)', () => {
  const implementations = [
    { name: 'Server (TypeScript)', calc: serverCalc, raw: serverRaw, daysInMonth: serverDaysInMonth },
    { name: 'Client (JavaScript)', calc: clientCalc, raw: clientRaw, daysInMonth: clientDaysInMonth }
  ];

  for (const impl of implementations) {
    describe(`Implementation: ${impl.name}`, () => {
      it('طول پایه هر ماه باید ۳۶۵ بر ۱۲ باشد', () => {
        assert.strictEqual(impl.daysInMonth, 365 / 12);
        assert.ok(Math.abs(impl.daysInMonth - 30.4167) < 0.001);
      });

      it('کسر اعشاری ماه باید به درستی محاسبه شود', () => {
        assert.strictEqual(impl.raw(365), 12);
        assert.strictEqual(impl.raw(0), 0);
      });

      // تست‌کیس‌های اجباری درخواست‌شده توسط کاربر:
      it('تست‌کیس اجباری ۱: ورودی ۱۵ روز -> خروجی ۱ ماه', () => {
        assert.strictEqual(impl.calc(15), 1);
      });

      it('تست‌کیس اجباری ۲: ورودی ۲۶ روز -> خروجی ۱ ماه', () => {
        assert.strictEqual(impl.calc(26), 1);
      });

      it('تست‌کیس اجباری ۳: ورودی ۴۰ روز -> خروجی ۲ ماه', () => {
        assert.strictEqual(impl.calc(40), 2);
      });

      it('تست‌کیس اجباری ۴: ورودی ۵۶ روز -> خروجی ۲ ماه', () => {
        assert.strictEqual(impl.calc(56), 2);
      });

      it('تست‌کیس اجباری ۵: ورودی ۳۶۵ روز -> خروجی ۱۲ ماه', () => {
        assert.strictEqual(impl.calc(365), 12);
      });

      // تست‌کیس‌های تکمیلی و Edge Caseها:
      it('ورودی‌های مرزی و مقادیر صفر یا منفی', () => {
        assert.strictEqual(impl.calc(0), 1);
        assert.strictEqual(impl.calc(-10), 1);
        assert.strictEqual(impl.calc(null), 1);
        assert.strictEqual(impl.calc(undefined), 1);
        assert.strictEqual(impl.calc(1), 1);
        assert.strictEqual(impl.calc(30), 1);
      });

      it('یک ماه ۳۱ روزه شمسی نباید به ماه دوم گرد شود', () => {
        assert.strictEqual(impl.calc(31), 1);
      });

      it('سال کبیسه ۳۶۶ روزه نباید ماه سیزدهم تولید کند و دقیقاً ۱۲ ماه بماند', () => {
        assert.strictEqual(impl.calc(366), 12);
      });

      it('اشتراک‌های استاندارد فصلی، شش‌ماهه و دو‌ساله', () => {
        assert.strictEqual(impl.calc(60), 2);
        assert.strictEqual(impl.calc(61), 2);
        assert.strictEqual(impl.calc(90), 3);
        assert.strictEqual(impl.calc(180), 6);
        assert.strictEqual(impl.calc(730), 24);
      });
    });
  }
});
