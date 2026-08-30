import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndustryPresets } from './IndustryPresets';
import { UserBillingControls } from './UserBillingControls';
import { ModuleGrid } from './ModuleGrid';
import { SummarySidebar } from './SummarySidebar';
import {
  DEFAULT_MODULES,
  DEFAULT_PRESETS,
  resolveAllDependencies,
  getLockedDependenciesMap,
} from './configuratorData';
import { ArrowRight, LayoutDashboard, ShieldCheck, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';

export function PricingConfigurator({
  onSelectPlan,
  onActivateTrial,
  user,
  isInsideDashboard = false,
  onBackToDashboard,
  hasActiveSubscription = false,
}) {
  const nav = useNavigate();
  const [modules, setModules] = useState(DEFAULT_MODULES);
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [settings, setSettings] = useState({
    base_user_limit: 5,
    extra_user_price: 200000,
    yearly_multiplier: 10,
    step_users_enabled: true,
    step_modules_enabled: true,
  });

  const [activePreset, setActivePreset] = useState('full_integration');
  const [selectedModuleIds, setSelectedModuleIds] = useState(['crm', 'sale', 'accounting', 'inventory']);
  const [userCount, setUserCount] = useState(5);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  // Fetch initial configurator data and user status
  useEffect(() => {
    api('/configurator/data')
      .then(data => {
        if (data.modules && Array.isArray(data.modules) && data.modules.length > 0) {
          setModules(data.modules);
        }
        if (data.presets && Array.isArray(data.presets) && data.presets.length > 0) {
          setPresets(data.presets);
        }
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      })
      .catch(err => {
        console.warn('Using default configurator data:', err);
      });

    api('/onboarding')
      .then(r => {
        if (r && r.user && (r.user.onboarding_step >= 3 || r.user.onboarding_completed_at)) {
          setHasOnboarded(true);
        }
      })
      .catch(() => {});
  }, []);

  // Handle Preset Switching
  function handleSelectPreset(presetId) {
    setActivePreset(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset && Array.isArray(preset.default_modules)) {
      const resolved = resolveAllDependencies(preset.default_modules, modules);
      setSelectedModuleIds(resolved);
    }
  }

  // Handle Manual Module Toggle
  function handleToggleModule(moduleId) {
    const isCurrentlySelected = selectedModuleIds.includes(moduleId);
    if (isCurrentlySelected) {
      // Remove module
      const nextDirect = selectedModuleIds.filter(id => id !== moduleId);
      // Re-resolve dependencies for the remaining items
      const resolved = resolveAllDependencies(nextDirect, modules);
      setSelectedModuleIds(resolved);
    } else {
      // Add module + auto-resolve its dependencies
      const nextDirect = [...selectedModuleIds, moduleId];
      const resolved = resolveAllDependencies(nextDirect, modules);
      setSelectedModuleIds(resolved);
    }
  }

  // Calculate locked dependencies map (modules that cannot be unchecked because another selected module requires them)
  const lockedDependenciesMap = useMemo(() => {
    return getLockedDependenciesMap(selectedModuleIds, modules);
  }, [selectedModuleIds, modules]);

  // Selected module objects
  const selectedModules = useMemo(() => {
    return modules.filter(m => selectedModuleIds.includes(m.id));
  }, [modules, selectedModuleIds]);

  // Real-time Pricing Calculations
  const calculations = useMemo(() => {
    const modulesTotal = selectedModules.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
    const baseLimit = settings.base_user_limit || 5;
    const extraPrice = settings.extra_user_price || 200000;
    const extraUsersCount = Math.max((Number(userCount) || 5) - baseLimit, 0);
    const extraUsersCost = extraUsersCount * extraPrice;
    const baseMonthlyTotal = modulesTotal + extraUsersCost;

    let discountAmount = 0;
    if (couponInfo) {
      if (couponInfo.discount_type === 'percent') {
        discountAmount = Math.round((baseMonthlyTotal * couponInfo.discount_value) / 100);
        if (couponInfo.max_discount_amount) {
          discountAmount = Math.min(discountAmount, couponInfo.max_discount_amount);
        }
      } else if (couponInfo.discount_type === 'fixed') {
        discountAmount = couponInfo.discount_value;
      }
    }

    const discountedBase = Math.max(baseMonthlyTotal - discountAmount, 0);
    const multiplier = billingPeriod === 'yearly' ? (settings.yearly_multiplier || 10) : 1;
    const finalAmount = discountedBase * multiplier;

    return {
      modulesTotal,
      extraUsersCount,
      extraUsersCost,
      baseMonthlyTotal,
      discountAmount,
      multiplier,
      finalAmount,
    };
  }, [selectedModules, userCount, billingPeriod, couponInfo, settings]);

  // Validate coupon
  async function handleApplyCoupon(code) {
    if (!code || !code.trim()) {
      setCouponInfo(null);
      setCouponSuccess(false);
      setCouponMessage('لطفاً کد تخفیف را وارد نمایید.');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage(null);
    setCouponSuccess(false);

    try {
      const res = await api('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.data) {
        setCouponCode(code.trim());
        setCouponInfo(res.data);
        setCouponSuccess(true);
        setCouponMessage(`کد تخفیف «${code.trim()}» با موفقیت اعمال گردید.`);
      } else {
        setCouponInfo(null);
        setCouponSuccess(false);
        setCouponMessage('کد تخفیف نامعتبر است.');
      }
    } catch (err) {
      setCouponInfo(null);
      setCouponSuccess(false);
      setCouponMessage(err.message || 'خطا در بررسی کد تخفیف.');
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  // Handle Order Submit (Redirect to Gateway / Callback)
  async function handleSubmitOrder() {
    if (selectedModuleIds.length === 0) {
      setServerError('لطفاً حداقل یک ماژول انتخاب کنید.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        selected_module_ids: selectedModuleIds,
        user_count: Number(userCount) || 5,
        billing_period: billingPeriod,
        coupon_code: couponCode || undefined,
      };

      const res = await api('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        setServerError('خطا در انتقال به درگاه پرداخت.');
      }
    } catch (err) {
      setServerError(err.message || 'خطای غیرمنتظره ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle 5-Day Trial Activation for this configuration
  async function handleActivateTrialForModules() {
    if (selectedModuleIds.length === 0) {
      setServerError('لطفاً حداقل یک ماژول انتخاب کنید.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        selected_module_ids: selectedModuleIds,
        user_count: Number(userCount) || 5,
      };

      await api('/trial', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      nav('/dashboard?trial=activated');
    } catch (err) {
      if (err.message && err.message.includes('قبلاً')) {
        nav('/dashboard');
      } else {
        setServerError(err.message || 'خطا در فعال‌سازی دوره آزمایشی.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Calculate Step Numbers dynamically
  let currentStep = 1;
  const userBillingStepNum = settings.step_users_enabled !== false ? currentStep++ : null;
  const moduleGridStepNum = settings.step_modules_enabled !== false ? currentStep++ : null;

  const showBackButton = isInsideDashboard || onBackToDashboard || hasOnboarded;

  return (
    <div className="erp-configurator-container" dir="rtl">
      {/* Top Bar / Header */}
      <div className="erp-configurator-header">
        <div className="erp-header-content">
          <div className="erp-header-titles">
            <h1 className="erp-main-heading">پیکربندی هوشمند قیمت‌گذاری ERP کارویتا</h1>
            <p className="erp-sub-heading">
              ماژول‌های مورد نیاز کسب‌وکار خود را انتخاب کنید و هزینه نهایی را به صورت شفاف و لحظه‌ای مشاهده نمایید.
            </p>
          </div>

          {/* Return to Dashboard Button */}
          {showBackButton && (
            <div className="erp-header-actions">
              <button
                type="button"
                className="erp-back-dashboard-btn"
                onClick={onBackToDashboard ? onBackToDashboard : () => nav('/dashboard')}
                id="btn-back-to-dashboard"
              >
                <ArrowRight size={18} />
                <span>بازگشت به داشبورد</span>
              </button>
            </div>
          )}
        </div>

        {/* Industry Presets Tabs */}
        <IndustryPresets
          presets={presets}
          activePreset={activePreset}
          onSelectPreset={handleSelectPreset}
        />
      </div>

      {serverError && (
        <div className="erp-global-alert-error">
          <span>{serverError}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="erp-main-layout">
        {/* RIGHT COLUMN: Interactive Configuration Cards (Step 1 & Step 2) */}
        <div className="erp-config-column">
          {settings.step_users_enabled !== false && (
            <UserBillingControls
              stepNumber={userBillingStepNum}
              userCount={userCount}
              onChangeUserCount={setUserCount}
              billingPeriod={billingPeriod}
              onChangeBillingPeriod={setBillingPeriod}
            />
          )}

          {settings.step_modules_enabled !== false && (
            <ModuleGrid
              stepNumber={moduleGridStepNum}
              modules={modules}
              selectedModuleIds={selectedModuleIds}
              lockedDependenciesMap={lockedDependenciesMap}
              onToggleModule={handleToggleModule}
            />
          )}
        </div>

        {/* LEFT COLUMN: Summary & Realtime Calculation Sidebar */}
        <div className="erp-sidebar-column">
          <SummarySidebar
            selectedModules={selectedModules}
            userCount={userCount}
            billingPeriod={billingPeriod}
            extraUsersCount={calculations.extraUsersCount}
            extraUsersCost={calculations.extraUsersCost}
            modulesTotal={calculations.modulesTotal}
            discountAmount={calculations.discountAmount}
            finalAmount={calculations.finalAmount}
            couponCode={couponCode}
            onApplyCoupon={handleApplyCoupon}
            isApplyingCoupon={isApplyingCoupon}
            couponMessage={couponMessage}
            couponSuccess={couponSuccess}
            onSubmitOrder={handleSubmitOrder}
            onActivateTrial={!hasActiveSubscription ? handleActivateTrialForModules : null}
            isSubmitting={isSubmitting}
            hasTrialAvailable={!hasActiveSubscription}
          />
        </div>
      </div>
    </div>
  );
}

