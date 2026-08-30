import React, { useState } from 'react';
import { Tag, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatPrice, toPersianDigits } from './configuratorData';

export function SummarySidebar({
  selectedModules = [],
  userCount = 5,
  billingPeriod = 'monthly',
  extraUsersCount = 0,
  extraUsersCost = 0,
  modulesTotal = 0,
  discountAmount = 0,
  finalAmount = 0,
  couponCode = '',
  onApplyCoupon,
  isApplyingCoupon = false,
  couponMessage = null,
  couponSuccess = false,
  onSubmitOrder,
  onActivateTrial,
  isSubmitting = false,
  hasTrialAvailable = true,
  isFirstPurchase = true,
}) {
  const [couponInput, setCouponInput] = useState(couponCode || '');

  function handleCouponSubmit(e) {
    e.preventDefault();
    if (couponInput.trim()) {
      onApplyCoupon(couponInput.trim());
    }
  }

  return (
    <aside className="erp-summary-sidebar" id="erp-pricing-summary">
      <div className="erp-summary-card">
        {/* Header */}
        <div className="erp-summary-header">
          <h3 className="erp-summary-title">برآورد هزینه</h3>
          <span className="erp-live-badge">
            <span className="erp-live-dot" />
            برآورد لحظه‌ای
          </span>
        </div>

        {/* Selected Modules List */}
        <div className="erp-summary-section">
          <div className="erp-section-title-row">
            <span className="erp-section-label">ماژول‌های انتخابی</span>
            <span className="erp-count-badge">{toPersianDigits(selectedModules.length)} ماژول</span>
          </div>

          {selectedModules.length === 0 ? (
            <div className="erp-empty-selection">
              <AlertCircle size={16} />
              <span>هیچ ماژولی انتخاب نشده است.</span>
            </div>
          ) : (
            <ul className="erp-selected-modules-list">
              {selectedModules.map(mod => (
                <li key={mod.id} className="erp-selected-module-item">
                  <span className="erp-module-name">{mod.title}</span>
                  <span className="erp-module-price">{formatPrice(mod.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="erp-summary-breakdown">
          <div className="erp-breakdown-row">
            <span className="erp-breakdown-label">هزینه ماژول‌ها:</span>
            <span className="erp-breakdown-value">{formatPrice(modulesTotal)}</span>
          </div>

          <div className="erp-breakdown-row">
            <span className="erp-breakdown-label">
              کاربران اضافه
              {extraUsersCount > 0 && ` (${toPersianDigits(extraUsersCount)} کاربر)`}:
            </span>
            <span className={`erp-breakdown-value ${extraUsersCount === 0 ? 'erp-text-free' : ''}`}>
              {extraUsersCount === 0 ? 'رایگان' : formatPrice(extraUsersCost)}
            </span>
          </div>

          {billingPeriod === 'yearly' && (
            <div className="erp-breakdown-row erp-text-green">
              <span className="erp-breakdown-label">تخفیف پرداخت سالانه:</span>
              <span className="erp-breakdown-value">معادل ۲ ماه رایگان</span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className="erp-breakdown-row erp-text-green">
              <span className="erp-breakdown-label">کد تخفیف:</span>
              <span className="erp-breakdown-value">- {formatPrice(discountAmount)}</span>
            </div>
          )}
        </div>

        {/* Highlighted Payable Box */}
        <div className="erp-payable-box">
          <div className="erp-payable-header">
            <span className="erp-payable-label">مبلغ قابل پرداخت</span>
            <span className="erp-payable-period">
              {billingPeriod === 'yearly' ? 'سالانه (۱۰ ماه محاسبه)' : 'ماهانه'}
            </span>
          </div>
          <div className="erp-payable-amount">
            {formatPrice(finalAmount)}
          </div>
        </div>

        {/* Notice */}
        <p className="erp-disclaimer-text">
          مبلغ نهایی پس از بررسی نیازهای فنی و سطح سفارشی‌سازی در پیش‌فاکتور قطعی می‌شود.
        </p>

        {/* Coupon Form */}
        <form onSubmit={handleCouponSubmit} className="erp-coupon-form">
          <div className="erp-coupon-input-group">
            <input
              type="text"
              className="erp-coupon-input"
              placeholder="کد تخفیف را وارد کنید"
              value={couponInput}
              onChange={e => setCouponInput(e.target.value)}
              disabled={isApplyingCoupon}
            />
            <button
              type="submit"
              className="erp-coupon-btn"
              disabled={isApplyingCoupon || !couponInput.trim()}
            >
              {isApplyingCoupon ? 'بررسی...' : 'اعمال'}
            </button>
          </div>
          {couponMessage && (
            <div className={`erp-coupon-msg ${couponSuccess ? 'success' : 'error'}`}>
              {couponSuccess ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{couponMessage}</span>
            </div>
          )}
        </form>

        {/* Action Buttons */}
        <div className="erp-actions-group">
          <button
            type="button"
            className="erp-submit-order-btn"
            onClick={onSubmitOrder}
            disabled={isSubmitting || selectedModules.length === 0}
            id="erp-submit-order-button"
          >
            {isSubmitting ? (
              <span className="erp-spinner-text">در حال پردازش سفارش...</span>
            ) : (
              <span>ثبت درخواست و ادامه خرید</span>
            )}
          </button>

          {hasTrialAvailable && onActivateTrial && (
            <button
              type="button"
              className="erp-trial-alt-btn"
              onClick={onActivateTrial}
              disabled={isSubmitting || selectedModules.length === 0}
            >
              <Sparkles size={16} />
              <span>تست ۵ روزه رایگان همین ماژول‌ها</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
