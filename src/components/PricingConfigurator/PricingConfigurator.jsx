import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IndustryPresets } from './IndustryPresets';
import { ModuleGrid } from './ModuleGrid';
import { SummarySidebar } from './SummarySidebar';
import {
  DEFAULT_MODULES,
  DEFAULT_PRESETS,
  resolveAllDependencies,
  getLockedDependenciesMap,
} from './configuratorData';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export function PricingConfigurator({
  onSelectPlan,
  onActivateTrial,
  user,
  isInsideDashboard = false,
  onBackToDashboard,
  hasActiveSubscription = false,
  hasUsedTrial = false,
  initialIndustryId,
  initialModuleIds,
  initialUserCount,
  initialBillingPeriod,
  fromTrial = false,
}) {
  const nav = useNavigate();
  const location = useLocation();


  const [modules, setModules] = useState(DEFAULT_MODULES);
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [settings, setSettings] = useState({
    base_user_limit: 1,
    extra_user_price: 150000,
    yearly_multiplier: 10,
    semiannual_multiplier: 6,
    quarterly_multiplier: 3,
  });

  // Helper to match preset ID or Title against a preset list
  const matchPresetId = (val, presetList) => {
    if (!val || !Array.isArray(presetList)) return null;
    const str = String(val).trim();
    const byId = presetList.find(p => p.id === str);
    if (byId) return byId.id;
    const byTitle = presetList.find(p => p.title === str);
    if (byTitle) return byTitle.id;
    const byPartial = presetList.find(p => p.title && (p.title.includes(str) || str.includes(p.title)));
    if (byPartial) return byPartial.id;
    return null;
  };

  // Resolve initial preset / industry ID from prop, router state, query, company profile, or localStorage
  const resolvedInitialPreset = useMemo(() => {
    if (initialIndustryId) return initialIndustryId;
    if (location.state?.initialIndustryId) return location.state.initialIndustryId;
    if (location.state?.initialIndustry) return location.state.initialIndustry;
    if (location.state?.industry) return location.state.industry;
    const q = new URLSearchParams(location.search);
    const qInd = q.get('industry') || q.get('preset');
    if (qInd) return qInd;
    if (user?.company?.industry) return user.company.industry;
    try {
      const draft = localStorage.getItem('draft_onboard_company');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.industry_id) return parsed.industry_id;
        if (parsed.industry) return parsed.industry;
      }
    } catch {}
    return null;
  }, [initialIndustryId, location.state, location.search, user?.company?.industry]);

  // 1. Resolve initial modules from props, location.state, or URL params
  const resolvedInitialModuleIds = useMemo(() => {
    if (Array.isArray(initialModuleIds) && initialModuleIds.length > 0) {
      return initialModuleIds;
    }
    if (Array.isArray(location.state?.selectedModules) && location.state.selectedModules.length > 0) {
      return location.state.selectedModules;
    }
    if (Array.isArray(location.state?.selectedModuleIds) && location.state.selectedModuleIds.length > 0) {
      return location.state.selectedModuleIds;
    }
    const q = new URLSearchParams(location.search);
    const qMods = q.get('modules');
    if (qMods) {
      const split = qMods.split(',').map(s => s.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
    return null;
  }, [initialModuleIds, location.state, location.search]);

  // 2. Resolve initial user count (use settings.base_user_limit as minimum)
  const resolvedInitialUserCount = useMemo(() => {
    const baseLimit = settings.base_user_limit || 1;
    if (initialUserCount && Number(initialUserCount) >= baseLimit) {
      return Number(initialUserCount);
    }
    if (location.state?.userCount && Number(location.state.userCount) >= baseLimit) {
      return Number(location.state.userCount);
    }
    const q = new URLSearchParams(location.search);
    const qUsers = q.get('users');
    if (qUsers && Number(qUsers) >= baseLimit) {
      return Number(qUsers);
    }
    return baseLimit;
  }, [initialUserCount, location.state, location.search, settings.base_user_limit]);

  const isFromTrial = fromTrial || location.state?.fromTrial || (new URLSearchParams(location.search).get('fromTrial') === '1');

  // Single-industry selection (strictly 1 active industry at a time - default to user chosen preset)
  const [selectedIndustryId, setSelectedIndustryId] = useState(() => {
    const matched = matchPresetId(resolvedInitialPreset, DEFAULT_PRESETS);
    return matched || 'manufacturing';
  });
  
  // Mandatory modules (active preset mandatory modules as defined in admin panel)
  const mandatoryModuleIds = useMemo(() => {
    const p = presets.find(item => item.id === selectedIndustryId);
    const presetMandatory = p && Array.isArray(p.mandatory_modules) ? p.mandatory_modules : [];
    return Array.from(new Set(presetMandatory));
  }, [presets, selectedIndustryId]);

  // Initialize user count from resolved value
  const [userCount, setUserCount] = useState(() => {
    const baseLimit = settings.base_user_limit || 1;
    return Math.max(resolvedInitialUserCount, baseLimit);
  });

  // Initialize module selection with trial modules if provided, otherwise default to chosen preset
  const [selectedModuleIds, setSelectedModuleIds] = useState(() => {
    if (resolvedInitialModuleIds && resolvedInitialModuleIds.length > 0) {
      return resolveAllDependencies(resolvedInitialModuleIds, DEFAULT_MODULES);
    }
    const initialKey = matchPresetId(resolvedInitialPreset, DEFAULT_PRESETS) || 'manufacturing';
    const defPreset = DEFAULT_PRESETS.find(p => p.id === initialKey) || DEFAULT_PRESETS[0];
    const defMandatory = defPreset && Array.isArray(defPreset.mandatory_modules) ? defPreset.mandatory_modules : [];
    const defMods = defPreset && Array.isArray(defPreset.default_modules) ? defPreset.default_modules : [
      'contacts',
      'calendar',
      'mail',
    ];
    const merged = Array.from(new Set([...defMandatory, ...defMods]));
    return resolveAllDependencies(merged, DEFAULT_MODULES);
  });

  // Sync if resolvedInitialModuleIds arrives asynchronously from parent
  const hasAppliedPropsRef = useRef(false);
  useEffect(() => {
    if (resolvedInitialModuleIds && resolvedInitialModuleIds.length > 0 && !hasAppliedPropsRef.current) {
      hasAppliedPropsRef.current = true;
      const merged = Array.from(new Set([...mandatoryModuleIds, ...resolvedInitialModuleIds]));
      setSelectedModuleIds(resolveAllDependencies(merged, modules));
    }
  }, [resolvedInitialModuleIds, mandatoryModuleIds, modules]);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Billing Period
  const [billingPeriod, setBillingPeriod] = useState(initialBillingPeriod || 'yearly');

  // Checkout State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  // Check if trial is allowed for this user
  const hasTrialAllowed = !hasActiveSubscription && !hasUsedTrial && !user?.has_used_trial && !isFromTrial;

  // Fetch initial configurator data and user status
  useEffect(() => {
    api('/configurator/data')
      .then(data => {
        if (data.modules && Array.isArray(data.modules) && data.modules.length > 0) {
          setModules(data.modules);
        }
        if (data.presets && Array.isArray(data.presets) && data.presets.length > 0) {
          setPresets(data.presets);
          if (resolvedInitialPreset) {
            const matchedId = matchPresetId(resolvedInitialPreset, data.presets);
            if (matchedId) {
              setSelectedIndustryId(matchedId);
              if (!resolvedInitialModuleIds) {
                const pObj = data.presets.find(p => p.id === matchedId);
                if (pObj) {
                  const pMand = Array.isArray(pObj.mandatory_modules) ? pObj.mandatory_modules : [];
                  const pDefs = Array.isArray(pObj.default_modules) ? pObj.default_modules : [];
                  const merged = Array.from(new Set([...pMand, ...pDefs]));
                  setSelectedModuleIds(resolveAllDependencies(merged, data.modules || modules));
                }
              }
            }
          }
        }
        if (data.settings) {
          const newBaseLimit = Number(data.settings.base_user_limit) || 1;
          setSettings(prev => ({
            ...prev,
            ...data.settings,
            base_user_limit: newBaseLimit,
            yearly_multiplier: data.settings.yearly_multiplier || 10,
          }));
          setUserCount(prev => {
            const hasExplicit = Boolean(initialUserCount || location.state?.userCount || new URLSearchParams(location.search).get('users'));
            if (!hasExplicit) {
              return newBaseLimit;
            }
            return Math.max(prev, newBaseLimit);
          });
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

  // Locked dependencies map (modules that cannot be unchecked because another selected module requires them)
  const lockedDependenciesMap = useMemo(() => {
    return getLockedDependenciesMap(selectedModuleIds, modules);
  }, [selectedModuleIds, modules]);

  // Single Industry Selection Handler
  function handleSelectIndustry(industryId) {
    setSelectedIndustryId(industryId);
    const p = presets.find(item => item.id === industryId);
    if (p) {
      const presetMandatory = Array.isArray(p.mandatory_modules) ? p.mandatory_modules : [];
      const presetDefaults = Array.isArray(p.default_modules) ? p.default_modules : [];
      const merged = Array.from(new Set([...presetMandatory, ...presetDefaults]));
      const resolved = resolveAllDependencies(merged, modules);
      setSelectedModuleIds(resolved);
    }
  }

  // Handle Manual Module Toggle (All non-mandatory modules can be activated/deactivated)
  function handleToggleModule(moduleId) {
    // 1. Mandatory modules for this preset cannot be deselected
    if (mandatoryModuleIds.includes(moduleId)) {
      return;
    }

    const isCurrentlySelected = selectedModuleIds.includes(moduleId);
    if (isCurrentlySelected) {
      // Find all dependent modules that would be broken if moduleId is removed
      const toRemove = new Set([moduleId]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const id of selectedModuleIds) {
          if (toRemove.has(id)) continue;
          const modObj = modules.find(m => m.id === id);
          if (modObj && Array.isArray(modObj.dependencies)) {
            if (modObj.dependencies.some(dep => toRemove.has(dep))) {
              toRemove.add(id);
              changed = true;
            }
          }
        }
      }

      // If any module in toRemove is an industry mandatory module, moduleId cannot be deselected
      const blocksMandatory = Array.from(toRemove).some(id => mandatoryModuleIds.includes(id));
      if (blocksMandatory) {
        return;
      }

      setSelectedModuleIds(prev => prev.filter(id => !toRemove.has(id)));
    } else {
      setSelectedModuleIds(prev => {
        const next = prev.includes(moduleId) ? prev : [...prev, moduleId];
        return resolveAllDependencies(next, modules);
      });
    }
  }

  // Selected module objects
  const selectedModules = useMemo(() => {
    return modules.filter(m => selectedModuleIds.includes(m.id));
  }, [modules, selectedModuleIds]);

  // Suggested module IDs based on the active industry
  const suggestedModuleIds = useMemo(() => {
    const set = new Set(mandatoryModuleIds);
    const p = presets.find(item => item.id === selectedIndustryId);
    if (p && Array.isArray(p.default_modules)) {
      p.default_modules.forEach(mId => set.add(mId));
    }
    return Array.from(set);
  }, [presets, selectedIndustryId]);

  // Real-time Pricing Calculations
  const calculations = useMemo(() => {
    const modulesTotal = selectedModules.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
    const baseLimit = Number(settings.base_user_limit) || 1;
    const extraPrice = typeof settings.extra_user_price === 'number' ? settings.extra_user_price : (Number(settings.extra_user_price) >= 0 ? Number(settings.extra_user_price) : 150000);
    // Extra user seat cost applies universally across all modules beyond base_user_limit
    const extraUsersCount = Math.max((Number(userCount) || 1) - baseLimit, 0);
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
    const multiplier = 
      billingPeriod === 'yearly' ? (settings.yearly_multiplier || 10) :
      billingPeriod === '6_months' ? (settings.semiannual_multiplier || 6) :
      billingPeriod === '3_months' ? (settings.quarterly_multiplier || 3) : 3;
    const finalAmount = Math.round(discountedBase * multiplier);

    return {
      modulesTotal,
      extraUsersCount,
      extraUsersCost,
      baseMonthlyTotal,
      discountAmount,
      multiplier,
      finalAmount,
    };
  }, [selectedModules, selectedModuleIds, userCount, billingPeriod, couponInfo, settings]);

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
        setCouponMessage(`کد تخفیف «${code.trim()}» با موفقیت اعمال شد.`);
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

  // Handle Order Submit
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
        user_count: Number(userCount) || (settings.base_user_limit || 1),
        billing_period: billingPeriod,
        coupon_code: couponCode || undefined,
        amount: calculations.finalAmount,
        final_amount: calculations.finalAmount,
        subtotal: calculations.baseMonthlyTotal,
        discount_amount: calculations.discountAmount,
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

  // Handle 5-Day Trial Activation
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
        user_count: Number(userCount) || (settings.base_user_limit || 1),
      };

      await api('/trial', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      nav('/dashboard?trial=activated');
    } catch (err) {
      setServerError(err.message || 'خطا در فعال‌سازی دوره آزمایشی.');
    } finally {
      setIsSubmitting(false);
    }
  }

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
      </div>

      {/* Trial to Commercial Upgrade Notice */}
      {isFromTrial && (
        <div style={{
          margin: '0 0 20px',
          padding: '14px 20px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1.5px solid #93c5fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 10px rgba(59, 130, 246, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <strong style={{ fontSize: '14px', color: '#1e3a8a', display: 'block', marginBottom: '2px' }}>
                پکیج انتخابی دوره ۵ روزه رایگان شما آماده خرید و ارتقا است
              </strong>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#1e40af' }}>
                کلیه ماژول‌ها ({selectedModuleIds.length.toLocaleString('fa-IR')} ماژول فعال) و تعداد کاربران ({userCount.toLocaleString('fa-IR')} کاربر) دقیقاً مطابق دوره ۵ روزه شما بارگذاری شده‌اند. می‌توانید همین پکیج را مستقیماً بخرید یا در صورت تمایل تغییر دهید.
              </p>
            </div>
          </div>
          <span style={{
            background: '#ffffff',
            color: '#2563eb',
            fontSize: '12px',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid #bfdbfe'
          }}>
            ✓ آماده صدور فاکتور
          </span>
        </div>
      )}

      {serverError && (
        <div className="erp-global-alert-error">
          <span>{serverError}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="erp-main-layout">
        {/* RIGHT COLUMN IN RTL: Industry Selection Card + Module Selection Card */}
        <div className="erp-config-column">
          {/* Card 1: صنف و حوزه تخصصی کسب‌وکار (تک انتخابی) */}
          <IndustryPresets
            presets={presets}
            activePresetId={selectedIndustryId}
            onSelectPreset={handleSelectIndustry}
          />

          {/* Card 2: ماژول‌های فعال و پیشنهادی */}
          <ModuleGrid
            modules={modules}
            selectedModuleIds={selectedModuleIds}
            suggestedModuleIds={suggestedModuleIds}
            mandatoryModuleIds={mandatoryModuleIds}
            lockedDependenciesMap={lockedDependenciesMap}
            onToggleModule={handleToggleModule}
          />
        </div>

        {/* LEFT COLUMN IN RTL: Sticky Real-time Summary & Calculations Sidebar */}
        <div className="erp-sidebar-column">
          <SummarySidebar
            selectedModules={selectedModules}
            userCount={userCount}
            onChangeUserCount={setUserCount}
            billingPeriod={billingPeriod}
            onChangeBillingPeriod={setBillingPeriod}
            baseUserLimit={settings.base_user_limit || 1}
            extraUserPrice={typeof settings.extra_user_price === 'number' ? settings.extra_user_price : (Number(settings.extra_user_price) >= 0 ? Number(settings.extra_user_price) : 150000)}
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
            onActivateTrial={hasTrialAllowed ? handleActivateTrialForModules : null}
            isSubmitting={isSubmitting}
            hasTrialAvailable={hasTrialAllowed}
          />
        </div>
      </div>
    </div>
  );
}


