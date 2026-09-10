import React, { useState } from 'react';
import { Minus, Plus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatPrice, toPersianDigits } from './configuratorData';

export function SummarySidebar({
  selectedModules = [],
  userCount = 5,
  onChangeUserCount,
  billingPeriod = 'yearly',
  onChangeBillingPeriod,
  baseUserLimit = 1,
  hasCrm = false,
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
}) {
  const [couponInput, setCouponInput] = useState(couponCode || '');
  const isCrmActive = hasCrm || selectedModules.some(m => m.id === 'crm');

  function handleDecrement() {
    if (userCount > 1 && onChangeUserCount) {
      onChangeUserCount(userCount - 1);
    }
  }

  function handleIncrement() {
    if (onChangeUserCount) {
      onChangeUserCount(userCount + 1);
    }
  }

  function handleCouponSubmit(e) {
    e.preventDefault();
    if (couponInput.trim() && onApplyCoupon) {
      onApplyCoupon(couponInput.trim());
    }
  }

  const periodLabelMap = {
    yearly: '۱ ساله (معادل ۱۰ ماه + ۲ ماه رایگان)',
    '6_months': '۶ ماهه',
    '3_months': '۳ ماهه',
  };

  return (
    <aside className="erp-summary-sidebar" id="erp-pricing-summary">
      <div className="erp-summary-card">
        {/* Header */}
        <div className="erp-summary-header">
          <h3 className="erp-summary-title">برآورد زنده هزینه</h3>
          <span className="erp-live-badge">
            <span className="erp-live-dot" />
            محاسبه لحظه‌ای
          </span>
        </div>

        {/* 1. User Stepper */}
        <div className="erp-sidebar-control-section">
          <label className="erp-sidebar-label" htmlFor="sidebar-user-stepper">
            تعداد کاربران مجاز
          </label>
          <div className="erp-sidebar-stepper" id="sidebar-user-stepper">
            <button
              type="button"
              className="erp-sidebar-stepper-btn"
              onClick={handleDecrement}
              disabled={userCount <= 1}
              aria-label="کاهش کاربر"
            >
              <Minus size={16} />
            </button>

            <span className="erp-sidebar-stepper-val">
              {toPersianDigits(userCount)} کاربر
            </span>

            <button
              type="button"
              className="erp-sidebar-stepper-btn"
              onClick={handleIncrement}
              aria-label="افزایش کاربر"
            >
              <Plus size={16} />
            </button>
          </div>
          {isCrmActive ? (
            <p className="erp-sidebar-help-text" style={{ color: '#0369a1' }}>
              ۱ کاربر پایه در CRM لحاظ شده است (کاربران مازاد CRM: ۸۰۰,۰۰۰ ت/ماه)
            </p>
          ) : (
            <p className="erp-sidebar-help-text" style={{ color: '#16a34a' }}>
              کاربران نامحدود و رایگان در تمامی ماژول‌های انتخابی
            </p>
          )}
        </div>

        {/* 2. Billing Period Tabs */}
        <div className="erp-sidebar-control-section">
          <label className="erp-sidebar-label">دوره اشتراک و پرداخت</label>
          <div className="erp-sidebar-period-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={billingPeriod === '3_months'}
              className={`erp-sidebar-period-btn ${billingPeriod === '3_months' ? 'is-active' : ''}`}
              onClick={() => onChangeBillingPeriod && onChangeBillingPeriod('3_months')}
            >
              ۳ ماهه
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billingPeriod === '6_months'}
              className={`erp-sidebar-period-btn ${billingPeriod === '6_months' ? 'is-active' : ''}`}
              onClick={() => onChangeBillingPeriod && onChangeBillingPeriod('6_months')}
            >
              ۶ ماهه
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billingPeriod === 'yearly'}
              className={`erp-sidebar-period-btn ${billingPeriod === 'yearly' ? 'is-active' : ''}`}
              onClick={() => onChangeBillingPeriod && onChangeBillingPeriod('yearly')}
              style={{ position: 'relative' }}
            >
              <span>۱ ساله</span>
              <span style={{
                position: 'absolute',
                top: '-9px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#10b981',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(16,185,129,0.3)'
              }}>
                ۲ ماه هدیه
              </span>
            </button>
          </div>
        </div>

        {/* 3. Selected Active Modules List */}
        <div className="erp-summary-section">
          <div className="erp-section-title-row">
            <span className="erp-section-label">ماژول‌های فعال شما</span>
            <span className="erp-count-badge">
              {toPersianDigits(selectedModules.length)} ماژول
            </span>
          </div>

          {selectedModules.length === 0 ? (
            <div className="erp-empty-selection">
              <AlertCircle size={15} />
              <span>هیچ ماژولی انتخاب نشده است.</span>
            </div>
          ) : (
            <div className="erp-selected-modules-scroll-box">
              <ul className="erp-selected-modules-list">
                {selectedModules.map((mod) => (
                  <li key={mod.id} className="erp-selected-module-item">
                    <span className="erp-module-name">{mod.title}</span>
                    <span className="erp-module-price">{formatPrice(mod.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 4. Cost Breakdown */}
        <div className="erp-summary-breakdown">
          <div className="erp-breakdown-row">
            <span className="erp-breakdown-label">هزینه ماهیانه ماژول‌ها:</span>
            <span className="erp-breakdown-value">{formatPrice(modulesTotal)}</span>
          </div>

          <div className="erp-breakdown-row">
            <span className="erp-breakdown-label">
              {isCrmActive ? (
                extraUsersCount === 0 
                  ? 'کاربر پایه CRM (۱ کاربر):' 
                  : `${toPersianDigits(extraUsersCount)} کاربر مازاد CRM:`
              ) : (
                'کاربران ماژول‌ها:'
              )}
            </span>
            <span className={`erp-breakdown-value ${(!isCrmActive || extraUsersCount === 0) ? 'erp-text-free' : ''}`}>
              {!isCrmActive ? 'نامحدود (رایگان)' : (extraUsersCount === 0 ? 'رایگان' : formatPrice(extraUsersCost))}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="erp-breakdown-row erp-text-green">
              <span className="erp-breakdown-label">کد تخفیف:</span>
              <span className="erp-breakdown-value">- {formatPrice(discountAmount)}</span>
            </div>
          )}
        </div>

        {/* 5. Highlighted Blue Payable Box */}
        <div className="erp-payable-box">
          <div className="erp-payable-header">
            مبلغ کل قابل پرداخت ({periodLabelMap[billingPeriod] || '۱ ساله'})
          </div>
          <div className="erp-payable-amount">
            {formatPrice(finalAmount)}
          </div>
          {billingPeriod === 'yearly' && (
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>
              ✓ محاسبه بر پایه ۱۰ ماه هزینه (۲ ماه هدیه رایگان کارویتا)
            </div>
          )}
          <div className="erp-payable-subtitle">
            قیمت نهایی پس از تایید نیازهای فنی قطعی خواهد شد.
          </div>
        </div>

        {/* 6. Coupon Form */}
        <form onSubmit={handleCouponSubmit} className="erp-coupon-form">
          <div className="erp-coupon-input-group">
            <input
              type="text"
              className="erp-coupon-input"
              placeholder="کد تخفیف را وارد کنید"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              disabled={isApplyingCoupon}
            />
            <button
              type="submit"
              className="erp-coupon-btn"
              disabled={isApplyingCoupon || !couponInput.trim()}
            >
              {isApplyingCoupon ? '...' : 'اعمال'}
            </button>
          </div>
          {couponMessage && (
            <div className={`erp-coupon-msg ${couponSuccess ? 'success' : 'error'}`}>
              {couponSuccess ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{couponMessage}</span>
            </div>
          )}
        </form>

        {/* 7. Action Buttons */}
        <div className="erp-actions-group">
          <button
            type="button"
            className="erp-submit-order-btn"
            onClick={onSubmitOrder}
            disabled={isSubmitting || selectedModules.length === 0}
            id="erp-submit-order-button"
          >
            {isSubmitting ? (
              <span className="erp-spinner-text">در حال انتقال به پرداخت...</span>
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

