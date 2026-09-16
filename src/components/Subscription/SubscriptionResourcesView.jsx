import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Layers, 
  Users, 
  Plus, 
  Minus, 
  Search, 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  Loader2, 
  ShieldCheck, 
  Calendar, 
  Sparkles,
  ShoppingCart
} from 'lucide-react';
import { api } from '../../services/api';
import { DEFAULT_MODULES } from '../PricingConfigurator/configuratorData';
import { getModulePersianTitle } from './SubscriptionDetailsModal';

function formatDate(d) {
  if (!d) return 'نامشخص';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(d));
  } catch {
    return new Date(d).toLocaleDateString('fa-IR');
  }
}

const PERIOD_CONFIG = {
  '1_month': { multiplier: 1, label: 'ماهانه', monthsDesc: '۱ ماه' },
  'monthly': { multiplier: 1, label: 'ماهانه', monthsDesc: '۱ ماه' },
  '3_months': { multiplier: 3, label: '۳ ماهه (فصلی)', monthsDesc: '۳ ماه' },
  'quarterly': { multiplier: 3, label: '۳ ماهه (فصلی)', monthsDesc: '۳ ماه' },
  '6_months': { multiplier: 6, label: '۶ ماهه (نیم‌سال)', monthsDesc: '۶ ماه' },
  'semiannual': { multiplier: 6, label: '۶ ماهه (نیم‌سال)', monthsDesc: '۶ ماه' },
  'yearly': { multiplier: 10, label: 'یک‌ساله (۱۲ ماهه)', monthsDesc: '۱۰ ماه با ۲ ماه هدیه کارویتا' }
};

export function SubscriptionResourcesView({ subscription, user, onBack, onUpdated }) {
  const nav = useNavigate();

  if (!subscription || subscription.status === 'cancelled') {
    const isCancelled = subscription?.status === 'cancelled';
    return (
      <div style={{ padding: '40px', textAlign: 'center', direction: 'rtl', fontFamily: 'Vazirmatn' }}>
        <AlertCircle size={48} color={isCancelled ? '#ea580c' : '#ef4444'} style={{ margin: '0 auto 16px' }} />
        <h3>{isCancelled ? 'این اشتراک لغو شده است' : 'اشتراک فعالی یافت نشد.'}</h3>
        <p style={{ color: '#64748b', maxWidth: '440px', margin: '8px auto 0', lineHeight: 1.6 }}>
          {isCancelled
            ? 'این اشتراک توسط مدیریت لغو شده است و امکان افزودن ماژول یا کاربر به آن وجود ندارد. لطفاً جهت استفاده از خدمات، یک اشتراک جدید تهیه فرمایید.'
            : 'جهت افزودن ماژول یا کاربر، ابتدا باید یک اشتراک فعال داشته باشید.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
          <button type="button" className="btn-secondary" onClick={onBack}>
            بازگشت به داشبورد
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => nav('/plans')}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderColor: '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShoppingCart size={16} />
            <span>خرید اشتراک جدید</span>
          </button>
        </div>
      </div>
    );
  }

  // Active module IDs in current subscription
  const currentActiveModuleIds = useMemo(() => {
    if (Array.isArray(subscription.module_ids)) {
      return subscription.module_ids;
    }
    if (typeof subscription.module_ids === 'string') {
      try {
        const parsed = JSON.parse(subscription.module_ids);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return ['accounting', 'crm', 'sales', 'warehouse'];
  }, [subscription]);

  // Current active user seats
  const initialUserCount = Math.max(Number(subscription.user_count) || 1, 1);
  const [targetUserCount, setTargetUserCount] = useState(initialUserCount);

  // System catalog & settings
  const [allModules, setAllModules] = useState(DEFAULT_MODULES);
  const [configSettings, setConfigSettings] = useState({
    base_user_limit: 1,
    extra_user_price: 800000
  });

  // Selected NEW module IDs to purchase
  const [selectedNewModuleIds, setSelectedNewModuleIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Review & Checkout section visibility
  const [showReviewSection, setShowReviewSection] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  // Fetch catalog from server
  useEffect(() => {
    api('/configurator/data')
      .then(res => {
        if (res) {
          if (Array.isArray(res.modules) && res.modules.length > 0) {
            setAllModules(res.modules);
          }
          if (res.settings) {
            setConfigSettings({
              base_user_limit: Number(res.settings.base_user_limit) || 1,
              extra_user_price: Number(res.settings.extra_user_price) || 800000
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  // Available new modules (not yet in active subscription)
  const availableNewModules = useMemo(() => {
    return allModules.filter(m => !currentActiveModuleIds.includes(m.id) && m.is_active !== false);
  }, [allModules, currentActiveModuleIds]);

  // Filtered list of all modules in system (searchable, sorted: selectable first, already owned second)
  const filteredAllModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = allModules.filter(m => {
      if (m.is_active === false) return false;
      if (!q) return true;
      const pTitle = getModulePersianTitle(m.id, m.title);
      return pTitle.toLowerCase().includes(q) || 
        (m.title && m.title.toLowerCase().includes(q)) || 
        (m.description && m.description.toLowerCase().includes(q));
    });

    return list.sort((a, b) => {
      const aOwned = currentActiveModuleIds.includes(a.id);
      const bOwned = currentActiveModuleIds.includes(b.id);
      if (!aOwned && bOwned) return -1;
      if (aOwned && !bOwned) return 1;
      return 0;
    });
  }, [allModules, currentActiveModuleIds, searchQuery]);

  // Selected module objects
  const selectedModulesObjects = useMemo(() => {
    return availableNewModules.filter(m => selectedNewModuleIds.includes(m.id));
  }, [availableNewModules, selectedNewModuleIds]);

  // Pricing calculations
  const newModulesMonthlySum = useMemo(() => {
    return selectedModulesObjects.reduce((acc, m) => {
      const p = Number(m.price);
      return acc + (isNaN(p) ? 0 : p);
    }, 0);
  }, [selectedModulesObjects]);

  const extraUserPrice = configSettings.extra_user_price || 800000;
  const newlyAddedUserSeats = Math.max(targetUserCount - initialUserCount, 0);
  // Extra user seats cost applies universally across the ERP system
  const newlyAddedUsersMonthlyCost = newlyAddedUserSeats * extraUserPrice;

  // Normalized billing period of current subscription
  const subPeriod = useMemo(() => {
    const p = subscription?.billing_period;
    if (p === 'yearly') return 'yearly';
    if (p === '6_months' || p === 'semiannual') return '6_months';
    if (p === '3_months' || p === 'quarterly') return '3_months';
    if (p === 'monthly' || p === '1_month') return 'monthly';
    return 'yearly';
  }, [subscription?.billing_period]);

  const currentPeriodConfig = PERIOD_CONFIG[subPeriod] || PERIOD_CONFIG['yearly'];
  const periodMultiplier = currentPeriodConfig.multiplier;

  const additionMonthlyBase = newModulesMonthlySum + newlyAddedUsersMonthlyCost;
  const finalCalculatedAmount = Math.round(additionMonthlyBase * periodMultiplier);

  const hasChanges = selectedNewModuleIds.length > 0 || newlyAddedUserSeats > 0;

  // Toggle selection with dependency satisfaction
  const handleToggleModule = (moduleId) => {
    if (currentActiveModuleIds.includes(moduleId)) return; // already active on current subscription
    setSelectedNewModuleIds(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        const targetMod = availableNewModules.find(m => m.id === moduleId);
        const deps = targetMod?.dependencies || [];
        const newDepsToAdd = deps.filter(d => !currentActiveModuleIds.includes(d) && !prev.includes(d));
        return [...prev, moduleId, ...newDepsToAdd];
      }
    });
  };

  // Submit Order and Redirect to Payment Gateway
  const handleProceedToOnlinePayment = async () => {
    if (!hasChanges || finalCalculatedAmount <= 0) return;
    setIsCreatingOrder(true);
    setErrorBanner(null);

    try {
      const res = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          selected_module_ids: selectedNewModuleIds,
          user_count: targetUserCount,
          billing_period: subPeriod,
          amount: finalCalculatedAmount,
          final_amount: finalCalculatedAmount,
          subtotal: additionMonthlyBase,
          order_type: 'resource_upgrade',
          is_resource_addon: true,
          subscription_id: subscription.id
        })
      });

      if (res && res.payment_url) {
        window.location.href = res.payment_url;
      } else if (res && (res.order_id || res.id)) {
        window.location.href = `/api/payments/zibal/callback?orderId=${res.order_id || res.id}&success=1&status=2`;
      } else {
        throw new Error(res.message || 'خطا در ایجاد پیش‌فاکتور پرداخت.');
      }
    } catch (err) {
      setErrorBanner(err.message || 'خطا در برقراری ارتباط با درگاه پرداخت.');
      setIsCreatingOrder(false);
    }
  };

  return (
    <div className="erp-sub-page-container" dir="rtl" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          >
            <ArrowRight size={16} />
            <span>بازگشت به داشبورد</span>
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              مدیریت منابع: افزودن ماژول و کاربر
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              منابع جدید بلافاصله پس از پرداخت به همین اشتراک فعال شما افزوده می‌شوند و دوره زمانی دست‌نخورده باقی می‌ماند.
            </p>
          </div>
        </div>
      </div>

      {errorBanner && (
        <div className="erp-sub-alert-banner error" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{errorBanner}</span>
          </div>
        </div>
      )}

      {/* Current Active Status Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          border: '1px solid #bae6fd', 
          borderRadius: '16px', 
          padding: '20px', 
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Layers size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#0369a1' }}>ماژول‌های فعال فعلی:</span>
            <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a' }}>
              {currentActiveModuleIds.length.toLocaleString('fa-IR')} ماژول تخصصی
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#0369a1' }}>کاربران همزمان فعلی:</span>
            <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a' }}>
              {initialUserCount.toLocaleString('fa-IR')} کاربر مجاز
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Calendar size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#047857' }}>تاریخ انقضای اشتراک:</span>
            <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
              {formatDate(subscription.expires_at)}
            </strong>
            <span style={{ fontSize: '11px', color: '#059669', display: 'block', marginTop: '2px' }}>
              (حفظ تاریخ انقضا و دوره زمانی فعلی)
            </span>
          </div>
        </div>
      </div>

      {/* 1. User Capacity Increase Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#2563eb" />
              <span>افزایش تعداد کاربر همزمان</span>
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              ظرفیت فعلی: {initialUserCount.toLocaleString('fa-IR')} کاربر (هزینه هر کاربر مازاد: {extraUserPrice.toLocaleString('fa-IR')} تومان/ماه)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="erp-stepper-btn"
              disabled={targetUserCount <= initialUserCount}
              onClick={() => setTargetUserCount(prev => Math.max(prev - 1, initialUserCount))}
              title="کاهش کاربر"
            >
              <Minus size={14} />
            </button>
            <div style={{ textAlign: 'center', minWidth: '90px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', display: 'block' }}>
                {targetUserCount.toLocaleString('fa-IR')} کاربر
              </span>
              {newlyAddedUserSeats > 0 && (
                <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>
                  (+{newlyAddedUserSeats.toLocaleString('fa-IR')} صندلی جدید)
                </span>
              )}
            </div>
            <button
              type="button"
              className="erp-stepper-btn"
              onClick={() => setTargetUserCount(prev => prev + 1)}
              title="افزایش کاربر"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Choose New Modules */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="#2563eb" />
              <span>انتخاب و افزودن ماژول‌های سازمانی جدید</span>
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              ماژول‌های مد نظر خود را برای اتصال به سیستم انتخاب کنید ({selectedNewModuleIds.length.toLocaleString('fa-IR')} ماژول انتخاب شده)
            </span>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="جستجوی نام یا امکانات ماژول…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 36px 8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* All Modules Grid without categories */}
        {filteredAllModules.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', maxHeight: '480px', overflowY: 'auto', padding: '4px' }}>
            {filteredAllModules.map(mod => {
              const isAlreadyActive = currentActiveModuleIds.includes(mod.id);
              const isSelected = selectedNewModuleIds.includes(mod.id);

              return (
                <div
                  key={mod.id}
                  onClick={() => !isAlreadyActive && handleToggleModule(mod.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isAlreadyActive 
                      ? '1px solid #bbf7d0' 
                      : isSelected 
                      ? '2px solid #2563eb' 
                      : '1px solid #e2e8f0',
                    background: isAlreadyActive 
                      ? '#f0fdf4' 
                      : isSelected 
                      ? '#eff6ff' 
                      : '#ffffff',
                    cursor: isAlreadyActive ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none',
                    transition: 'all 0.15s ease',
                    opacity: isAlreadyActive ? 0.92 : 1
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: isAlreadyActive ? '#15803d' : isSelected ? '#1e40af' : '#0f172a' }}>
                        {getModulePersianTitle(mod.id, mod.title)}
                      </strong>

                      {isAlreadyActive ? (
                        <span style={{ 
                          fontSize: '10.5px', 
                          fontWeight: 700, 
                          color: '#166534', 
                          background: '#dcfce7', 
                          padding: '2px 8px', 
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap'
                        }}>
                          <Check size={12} />
                          <span>فعال در اشتراک</span>
                        </span>
                      ) : (
                        <div 
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                            background: isSelected ? '#2563eb' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} />}
                        </div>
                      )}
                    </div>

                    {mod.description && (
                      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                        {mod.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid ' + (isAlreadyActive ? '#dcfce7' : '#f1f5f9'), paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: isAlreadyActive ? '#15803d' : '#94a3b8' }}>
                      {isAlreadyActive ? 'وضعیت:' : 'تعرفه ماهانه:'}
                    </span>
                    <strong style={{ fontSize: '13px', color: isAlreadyActive ? '#166534' : '#0f172a' }}>
                      {isAlreadyActive ? 'موجود در بسته' : (Number(mod.price || 0) === 0 ? 'رایگان' : `${Number(mod.price || 0).toLocaleString('fa-IR')} تومان`)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            ماژولی متناسب با فیلتر انتخابی یافت نشد.
          </div>
        )}
      </div>

      {/* 3. Bottom Action & Final Review Section */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        {!showReviewSection ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#475569' }}>
                خلاصه انتخاب‌ها: <strong>{selectedNewModuleIds.length.toLocaleString('fa-IR')} ماژول جدید</strong>
                {newlyAddedUserSeats > 0 && (
                  <span> + <strong>{newlyAddedUserSeats.toLocaleString('fa-IR')} کاربر اضافی ({newlyAddedUsersMonthlyCost.toLocaleString('fa-IR')} ت/ماه)</strong></span>
                )}
              </span>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                مبلغ محاسبه‌شده دوره جاری ({currentPeriodConfig.label}): <strong style={{ color: '#16a34a', fontSize: '16px' }}>{finalCalculatedAmount.toLocaleString('fa-IR')} تومان</strong>
                <span style={{ fontSize: '11.5px', color: '#64748b', marginRight: '6px' }}>
                  ({additionMonthlyBase.toLocaleString('fa-IR')} ت ماهانه × ضریب {periodMultiplier.toLocaleString('fa-IR')})
                </span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={onBack}>
                انصراف
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!hasChanges}
                onClick={() => setShowReviewSection(true)}
                style={{ minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>افزودن و بررسی نهایی</span>
                <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </div>
        ) : (
          /* Final Review and Invoice Breakdown */
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} color="#2563eb" />
                <span>پیش‌فاکتور نهایی ارتقای منابع</span>
              </h3>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 12px', fontSize: '12px' }}
                onClick={() => setShowReviewSection(false)}
              >
                ویرایش انتخاب‌ها
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              {selectedModulesObjects.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>ماژول‌های جدید اضافه شونده:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedModulesObjects.map(m => (
                      <span key={m.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>
                        ✓ {getModulePersianTitle(m.id, m.title)} ({Number(m.price || 0).toLocaleString('fa-IR')} ت)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {newlyAddedUserSeats > 0 && (
                <div style={{ marginBottom: '12px', fontSize: '13px', color: '#334155' }}>
                  <span>ظرفیت کاربران جدید:</span>
                  <strong style={{ marginRight: '6px', color: '#0f172a' }}>
                    +{newlyAddedUserSeats.toLocaleString('fa-IR')} کاربر مازاد ({newlyAddedUsersMonthlyCost.toLocaleString('fa-IR')} تومان ماهانه)
                  </strong>
                </div>
              )}

              <div style={{ height: '1px', background: '#e2e8f0', margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>مبلغ کل قابل پرداخت نهایی:</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a' }}>
                  {finalCalculatedAmount.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowReviewSection(false)}>
                بازگشت
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={isCreatingOrder || finalCalculatedAmount <= 0}
                onClick={handleProceedToOnlinePayment}
                style={{ 
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                  minWidth: '220px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px' 
                }}
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>در حال اتصال به درگاه پرداخت…</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>پرداخت آنلاین</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}