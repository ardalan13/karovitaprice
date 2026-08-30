import React from 'react';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { toPersianDigits } from './configuratorData';

export function UserBillingControls({
  stepNumber = 1,
  userCount = 5,
  onChangeUserCount,
  billingPeriod = 'monthly',
  onChangeBillingPeriod,
}) {
  function handleDecrement() {
    if (userCount > 1) {
      onChangeUserCount(userCount - 1);
    }
  }

  function handleIncrement() {
    onChangeUserCount(userCount + 1);
  }

  function handleInputChange(e) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      onChangeUserCount(val);
    } else if (e.target.value === '') {
      onChangeUserCount(1);
    }
  }

  return (
    <section className="erp-config-card erp-step-card" id="step-users-billing">
      <div className="erp-card-header">
        <div className="erp-step-indicator">
          <span className="erp-step-badge">{toPersianDigits(stepNumber)}</span>
          <h3 className="erp-step-title">کاربران و دوره پرداخت</h3>
        </div>
      </div>

      <div className="erp-step-body erp-users-billing-grid">
        {/* RIGHT: User Count Stepper in RTL */}
        <div className="erp-control-group erp-user-stepper-group">
          <label className="erp-control-label" htmlFor="erp-user-count-input">
            تعداد کاربران
          </label>
          <div className="erp-stepper-box">
            <button
              type="button"
              className="erp-stepper-btn"
              onClick={handleDecrement}
              disabled={userCount <= 1}
              aria-label="کاهش تعداد کاربر"
            >
              <Minus size={16} />
            </button>

            <input
              id="erp-user-count-input"
              type="number"
              min="1"
              max="999"
              className="erp-stepper-input"
              value={userCount}
              onChange={handleInputChange}
            />

            <button
              type="button"
              className="erp-stepper-btn"
              onClick={handleIncrement}
              aria-label="افزایش تعداد کاربر"
            >
              <Plus size={16} />
            </button>
          </div>
          <span className="erp-help-text">تا ۵ کاربر در قیمت پایه لحاظ شده است.</span>
        </div>

        {/* LEFT: Billing Period Dropdown in RTL */}
        <div className="erp-control-group erp-billing-period-group">
          <label className="erp-control-label" htmlFor="erp-billing-period-select">
            دوره پرداخت
          </label>
          <div className="erp-select-wrapper">
            <select
              id="erp-billing-period-select"
              className="erp-select-control"
              value={billingPeriod}
              onChange={e => onChangeBillingPeriod(e.target.value)}
            >
              <option value="monthly">ماهانه</option>
              <option value="yearly">سالانه (معادل ۲ ماه هدیه)</option>
            </select>
            <ChevronDown size={18} className="erp-select-chevron" />
          </div>
        </div>
      </div>
    </section>
  );
}
