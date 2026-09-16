import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  Users, 
  Layers, 
  CreditCard, 
  Sparkles, 
  AlertCircle, 
  Activity, 
  Plus, 
  Minus, 
  Receipt, 
  Loader2, 
  Calendar, 
  LogIn, 
  ExternalLink,
  Edit3,
  ShieldCheck,
  Check,
  Lock,
  ShoppingCart,
  Zap,
  X,
  Search,
  Package
} from 'lucide-react';
import { api } from '../../services/api';
import { DEFAULT_MODULES } from '../PricingConfigurator/configuratorData';
import { getModulePersianTitle } from './SubscriptionDetailsModal';

const ERP_PORTAL_URL = 'https://crm.karovita.ir';

const PERIOD_CONFIG = {
  '3_months': {
    id: '3_months',
    label: '۳ ماهه (فصلی)',
    shortLabel: '۳ ماهه',
    tag: 'شروع کار',
    desc: 'پرداخت فصلی با قابلیت ارتقای منابع در هر زمان',
    multiplier: 3,
    highlight: false
  },
  '6_months': {
    id: '6_months',
    label: '۶ ماهه (نیم‌سال)',
    shortLabel: '۶ ماهه',
    tag: 'محبوب',
    desc: 'پرداخت دوره‌ای با تخفیف و ثبات عملکرد',
    multiplier: 6,
    highlight: false
  },
  'yearly': {
    id: 'yearly',
    label: 'یک‌ساله (۱۲ ماهه)',
    shortLabel: 'یک‌ساله',
    tag: '۲ ماه رایگان',
    desc: '۱۰ ماه هزینه پرداخت کنید و ۱۲ ماه استفاده فرمایید (۲ ماه رایگان هدیه کارویتا)',
    multiplier: 10,
    highlight: true
  }
};

export function SubscriptionRenewView({ subscription, user, onBack, onUpdated }) {
  const nav = useNavigate();

  if (!subscription || subscription.status === 'cancelled') {
    const isCancelled = subscription?.status === 'cancelled';
    return (
      <div style={{ padding: '40px', textAlign: 'center', direction: 'rtl', fontFamily: 'Vazirmatn' }}>
        <AlertCircle size={48} color={isCancelled ? '#ea580c' : '#ef4444'} style={{ margin: '0 auto 16px' }} />
        <h3>{isCancelled ? 'این اشتراک لغو شده است' : 'اشتراک فعالی یافت نشد.'}</h3>
        <p style={{ color: '#64748b', maxWidth: '440px', margin: '8px auto 0', lineHeight: 1.6 }}>
          {isCancelled 
            ? 'این اشتراک توسط مدیریت لغو شده است و امکان تمدید آن وجود ندارد. لطفاً جهت فعال‌سازی مجدد خدمات، یک اشتراک جدید تهیه فرمایید.'
            : 'شما در حال حاضر اشتراک فعالی برای تمدید ندارید.'}
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

  // Determine if this is a 5-day trial subscription
  const isTrial = subscription.source === 'trial' || subscription.package_name?.includes('آزمایشی') || subscription.title?.includes('آزمایشی') || Number(subscription.price || 0) === 0;

  // Radio Card Mode: 'same' (Card A - Default) or 'custom' (Card B)
  const [renewalMode, setRenewalMode] = useState(() => isTrial ? 'custom' : 'same');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const originalPeriod = useMemo(() => {
    const p = subscription?.billing_period;
    if (p === 'yearly') return 'yearly';
    if (p === '6_months' || p === 'semiannual') return '6_months';
    if (p === '3_months' || p === 'quarterly') return '3_months';
    return 'yearly';
  }, [subscription?.billing_period]);

  // Selected billing period for renewal (defaults to yearly with 2 months free)
  const [renewPeriod, setRenewPeriod] = useState(() => originalPeriod || 'yearly');

  // Base user seats
  const initialUserCount = Math.max(Number(subscription.user_count) || 1, 1);
  const [userCount, setUserCount] = useState(initialUserCount);

  // Active modules from current subscription
  const [activeModules, setActiveModules] = useState(() => {
    if (subscription.modules_detail && Array.isArray(subscription.modules_detail) && subscription.modules_detail.length > 0) {
      return subscription.modules_detail.map(m => ({
        ...m,
        title: getModulePersianTitle(m.id, m.title)
      }));
    }
    if (subscription.module_ids && Array.isArray(subscription.module_ids)) {
      return subscription.module_ids.map(id => {
        const found = DEFAULT_MODULES.find(m => m.id === id);
        return found 
          ? { id: found.id, title: getModulePersianTitle(found.id, found.title), price: found.price, description: found.description, category: found.category }
          : { id, title: getModulePersianTitle(id, id), price: 250000 };
      });
    }
    return [];
  });

  // Comprehensive catalog for edit mode
  const [allModules, setAllModules] = useState(DEFAULT_MODULES);
  const [configSettings, setConfigSettings] = useState({
    base_user_limit: 1,
    extra_user_price: 800000
  });

  // Selected module IDs in edit mode
  const [selectedModuleIds, setSelectedModuleIds] = useState(() => {
    return activeModules.map(m => m.id);
  });

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  const isExpired = new Date(subscription.expires_at) < new Date();
  const remainingDays = getRemainingDays(subscription.expires_at);
  const canRenewEarly = Boolean(user?.can_renew_early || subscription?.can_renew_early);
  const isRenewalSectionActive = isExpired || remainingDays <= 30 || isTrial || canRenewEarly;

  // Fetch updated catalog and pricing settings
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

  function formatDate(d) {
    if (!d) return '—';
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(d));
    } catch {
      return new Date(d).toLocaleDateString('fa-IR');
    }
  }

  function getRemainingDays(expiresAt) {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const baseUserLimit = configSettings.base_user_limit || 1;
  const extraUserPrice = configSettings.extra_user_price || 800000;
  const currentPeriodConfig = PERIOD_CONFIG[renewPeriod] || PERIOD_CONFIG['yearly'];
  const billingMultiplier = currentPeriodConfig.multiplier;

  // 1. Calculation for Same-Specification Renewal (Card A: Default Yearly with 2 Months Free)
  const sameSpecModulesObjects = useMemo(() => {
    const activeIds = activeModules.map(m => m.id);
    return activeIds.map(id => {
      const found = allModules.find(m => m.id === id);
      if (found) return found;
      const def = DEFAULT_MODULES.find(m => m.id === id);
      if (def) return def;
      const activeObj = activeModules.find(m => m.id === id);
      return activeObj || { id, price: 0 };
    });
  }, [activeModules, allModules]);

  const sameSpecModulesSum = useMemo(() => {
    return sameSpecModulesObjects.reduce((sum, m) => {
      const p = Number(m.price);
      return sum + (isNaN(p) ? 0 : p);
    }, 0);
  }, [sameSpecModulesObjects]);

  // Extra user fee applies universally across all modules beyond baseUserLimit
  const sameSpecExtraUsers = Math.max(initialUserCount - baseUserLimit, 0);
  const sameSpecExtraCost = sameSpecExtraUsers * extraUserPrice;
  const sameSpecMonthlyTotal = sameSpecModulesSum + sameSpecExtraCost;
  const sameSpecYearlyTotal = Math.round(sameSpecMonthlyTotal * (PERIOD_CONFIG['yearly']?.multiplier || 10));

  // 2. Calculation for Customized Edit Mode Renewal (Card B)
  const editedModulesObjects = useMemo(() => {
    return selectedModuleIds.map(id => {
      const found = allModules.find(m => m.id === id);
      if (found) return found;
      const def = DEFAULT_MODULES.find(m => m.id === id);
      if (def) return def;
      return { id, price: 0 };
    });
  }, [allModules, selectedModuleIds]);

  const editedModulesSum = useMemo(() => {
    return editedModulesObjects.reduce((sum, m) => {
      const p = Number(m.price);
      return sum + (isNaN(p) ? 0 : p);
    }, 0);
  }, [editedModulesObjects]);

  // Extra user fee applies universally across all modules beyond baseUserLimit
  const editedExtraUsers = Math.max(userCount - baseUserLimit, 0);
  const editedExtraCost = editedExtraUsers * extraUserPrice;
  const editedMonthlyTotal = editedModulesSum + editedExtraCost;
  const editedFinalAmount = Math.round(editedMonthlyTotal * billingMultiplier);

  // Toggle module selection in edit mode
  const handleToggleModule = (moduleId) => {
    if (moduleId === 'account' || moduleId === 'hr') return;
    setSelectedModuleIds(prev => {
      if (prev.includes(moduleId)) {
        if (prev.length <= 1) return prev;
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  // Trigger Order and Payment (maintaining exact subscription record)
  const handleProceedToPayment = async (isCustom = false) => {
    setIsCreatingOrder(true);
    setErrorBanner(null);
    try {
      const activeMods = isCustom ? selectedModuleIds : activeModules.map(m => m.id);
      const activeUsers = isCustom ? userCount : initialUserCount;
      const activePeriod = isCustom ? renewPeriod : 'yearly';
      const activeAmount = isCustom ? editedFinalAmount : sameSpecYearlyTotal;
      const activeMonthly = isCustom ? editedMonthlyTotal : sameSpecMonthlyTotal;

      const res = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          selected_module_ids: activeMods,
          user_count: activeUsers,
          billing_period: activePeriod,
          amount: activeAmount,
          final_amount: activeAmount,
          subtotal: activeMonthly,
          is_renewal: true,
          subscription_id: subscription.id,
          order_type: 'renewal'
        })
      });

      if (res && res.payment_url) {
        window.location.href = res.payment_url;
      } else if (res && (res.order_id || res.id)) {
        window.location.href = `/api/payments/zibal/callback?orderId=${res.order_id || res.id}&success=1&status=2`;
      } else {
        throw new Error(res.message || 'خطا در صدور پیش‌فاکتور پرداخت.');
      }
    } catch (err) {
      setErrorBanner(err.message || 'خطا در برقراری ارتباط با سرور.');
      setIsCreatingOrder(false);
    }
  };

  // --- Addon Single/Multi Module Purchase Logic ---
  const [selectedAddonModuleIds, setSelectedAddonModuleIds] = useState([]);
  const [addonSearchQuery, setAddonSearchQuery] = useState('');
  const [addonSelectedCategory, setAddonSelectedCategory] = useState('all');
  const [isCreatingAddonOrder, setIsCreatingAddonOrder] = useState(false);
  const [addonError, setAddonError] = useState(null);

  // Active module IDs list
  const activeModuleIds = useMemo(() => {
    return activeModules.map(m => m.id);
  }, [activeModules]);

  // Available addon modules (all system modules minus those already in activeModules)
  const availableAddonModules = useMemo(() => {
    return allModules.filter(m => !activeModuleIds.includes(m.id) && m.is_active !== false);
  }, [allModules, activeModuleIds]);

  // Unique categories of available addon modules
  const addonCategories = useMemo(() => {
    const cats = new Set();
    availableAddonModules.forEach(m => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats);
  }, [availableAddonModules]);

  // Filtered available addon modules based on search and category
  const filteredAddonModules = useMemo(() => {
    return availableAddonModules.filter(m => {
      const pTitle = getModulePersianTitle(m.id, m.title || '');
      const matchSearch = !addonSearchQuery.trim() || 
        pTitle.toLowerCase().includes(addonSearchQuery.toLowerCase().trim()) ||
        (m.description && m.description.toLowerCase().includes(addonSearchQuery.toLowerCase().trim())) ||
        (m.category && m.category.toLowerCase().includes(addonSearchQuery.toLowerCase().trim()));
      
      const matchCategory = addonSelectedCategory === 'all' || m.category === addonSelectedCategory;
      return matchSearch && matchCategory;
    });
  }, [availableAddonModules, addonSearchQuery, addonSelectedCategory]);

  // Selected addon module objects
  const selectedAddonObjects = useMemo(() => {
    return selectedAddonModuleIds.map(id => {
      const found = allModules.find(m => m.id === id) || DEFAULT_MODULES.find(m => m.id === id);
      return found ? { ...found, title: getModulePersianTitle(found.id, found.title) } : { id, title: id, price: 250000 };
    });
  }, [selectedAddonModuleIds, allModules]);

  // Addon period and pricing calculation
  const addonBillingPeriod = subscription?.billing_period || 'yearly';
  const addonPeriodMultiplier = (PERIOD_CONFIG[addonBillingPeriod] || PERIOD_CONFIG['yearly']).multiplier;
  const addonMonthlyBase = useMemo(() => {
    return selectedAddonObjects.reduce((acc, m) => acc + (Number(m.price) || 0), 0);
  }, [selectedAddonObjects]);
  const finalAddonAmount = Math.round(addonMonthlyBase * addonPeriodMultiplier);

  // Toggle selection of addon module (with automatic dependency addition)
  const handleToggleAddonModule = (moduleId) => {
    setSelectedAddonModuleIds(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        const toAdd = [moduleId];
        const target = allModules.find(m => m.id === moduleId) || DEFAULT_MODULES.find(m => m.id === moduleId);
        if (target && Array.isArray(target.dependencies)) {
          target.dependencies.forEach(depId => {
            if (!activeModuleIds.includes(depId) && !prev.includes(depId) && !toAdd.includes(depId)) {
              toAdd.push(depId);
            }
          });
        }
        return [...prev, ...toAdd];
      }
    });
  };

  const handleRemoveAddonModule = (moduleId) => {
    setSelectedAddonModuleIds(prev => prev.filter(id => id !== moduleId));
  };

  // Payment for Addon Modules
  const handleProceedToAddonPayment = async () => {
    if (selectedAddonModuleIds.length === 0) return;
    setIsCreatingAddonOrder(true);
    setAddonError(null);
    try {
      const res = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          selected_module_ids: selectedAddonModuleIds,
          user_count: initialUserCount,
          billing_period: addonBillingPeriod,
          amount: finalAddonAmount,
          final_amount: finalAddonAmount,
          subtotal: addonMonthlyBase,
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
        throw new Error(res.message || 'خطا در صدور سفارش ماژول‌ها.');
      }
    } catch (err) {
      setAddonError(err.message || 'خطا در برقراری ارتباط با درگاه پرداخت.');
      setIsCreatingAddonOrder(false);
    }
  };


  return (
    <div className="erp-sub-page-container" dir="rtl" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* Top Header & Breadcrumb */}
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
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
            جزئیات و تمدید اشتراک ابری
          </h2>
        </div>

        {/* Status badges */}
        <div className="erp-sub-badge-row" style={{ margin: 0 }}>
          <span className={`erp-status-chip ${isExpired ? 'expired' : isTrial ? 'trial' : 'active'}`}>
            {isTrial ? '⭐️ دوره آزمایشی ۵ روزه' : isExpired ? '⚠️ منقضی شده' : '✓ اشتراک فعال سازمانی'}
          </span>
          <span className="erp-period-chip">
            {currentPeriodConfig.label}
          </span>
          {remainingDays > 0 && !isExpired && (
            <span className="erp-remaining-chip">
              <Clock size={13} />
              <span>{remainingDays.toLocaleString('fa-IR')} روز باقیمانده</span>
            </span>
          )}
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

      {/* 1. Subscription Overview Details Grid */}
      <div className="erp-sub-details-grid" style={{ marginBottom: '24px' }}>
        {/* Purchase & Invoice Details */}
        <div className="erp-sub-info-card">
          <div className="erp-info-card-header">
            <CreditCard size={18} className="erp-card-icon" />
            <h4>اطلاعات خرید و صورت‌حساب</h4>
          </div>
          <div className="erp-info-list">
            <div className="erp-info-item">
              <span className="erp-item-label">شماره سفارش:</span>
              <span className="erp-item-val font-mono">{subscription.order_number || ('ORD-' + subscription.id)}</span>
            </div>
            <div className="erp-info-item">
              <span className="erp-item-label">کد پیگیری / شناسه پرداخت:</span>
              <span className="erp-item-val font-mono">{subscription.reference_id || '—'}</span>
            </div>
            <div className="erp-info-item">
              <span className="erp-item-label">مبلغ اشتراک فعلی:</span>
              <span className="erp-item-val font-bold">
                {Number(subscription.price || 0) === 0 
                  ? 'رایگان (آزمایشی)' 
                  : `${Number(subscription.price || 0).toLocaleString('fa-IR')} تومان`}
              </span>
            </div>
            <div className="erp-info-item">
              <span className="erp-item-label">تاریخ فعال‌سازی:</span>
              <span className="erp-item-val">{formatDate(subscription.starts_at || subscription.created_at)}</span>
            </div>
            <div className="erp-info-item">
              <span className="erp-item-label">تاریخ پایان و انقضا:</span>
              <span className="erp-item-val font-bold" style={{ color: isExpired ? '#ef4444' : '#059669' }}>
                {formatDate(subscription.expires_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Technical & Service Details */}
        <div className="erp-sub-info-card">
          <div className="erp-info-card-header">
            <Activity size={18} className="erp-card-icon" />
            <h4>مشخصات و دسترسی‌های سامانه</h4>
          </div>
          <div className="erp-info-list">
            <div className="erp-info-item">
              <span className="erp-item-label">ظرفیت کاربران فعال:</span>
              <span className="erp-item-val font-bold">
                <Users size={14} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }} />
                {Number(subscription.user_count || 5).toLocaleString('fa-IR')} کاربر همزمان
              </span>
            </div>
            <div className="erp-info-item">
              <span className="erp-item-label">وضعیت سرویس ابری:</span>
              <span className="erp-item-val erp-val-online">
                <span className="erp-pulse-dot" />
                {isExpired ? 'منقضی شده / نیازمند تمدید' : 'فعال و آنلاین'}
              </span>
            </div>
            <div className="erp-info-item">
              <span className="erp-item-label">پشتیبان‌گیری خودکار:</span>
              <span className="erp-item-val">روزانه در دو نقطه مجزا</span>
            </div>
            <div className="erp-info-item" style={{ paddingTop: '8px' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '9px 16px' }}
                onClick={() => window.open(ERP_PORTAL_URL, '_blank', 'noopener,noreferrer')}
              >
                <LogIn size={16} />
                <span>ورود به پرتال اختصاصی ERP کارویتا</span>
                <ExternalLink size={13} style={{ opacity: 0.7 }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Modules Section */}
      <div className="erp-sub-modules-section" style={{ marginBottom: '24px' }}>
        <div className="erp-sub-modules-head">
          <div className="erp-sub-modules-title">
            <Layers size={18} color="#2563eb" />
            <h3>لیست ماژول‌های فعال اشتراک</h3>
            <span className="erp-sub-count-badge">
              {activeModules.length.toLocaleString('fa-IR')} ماژول فعال
            </span>
          </div>
        </div>

        <div className="erp-sub-modules-grid">
          {activeModules.map((m, idx) => (
            <div key={m.id || idx} className="erp-sub-module-badge-card">
              <div className="erp-sub-mod-top">
                <div className="erp-sub-mod-icon-wrap">
                  <CheckCircle2 size={16} color="#0284c7" />
                </div>
                <span className="erp-sub-mod-name">{m.title}</span>
                <span className="erp-sub-mod-active-tag">فعال</span>
              </div>
              {m.description && (
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                  {m.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2.5 Addon Modules Section: افزودن ماژول‌های جدید به اشتراک فعلی (خرید تک یا چند ماژول) */}
      <div 
        id="addon-modules-section"
        style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          padding: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          marginBottom: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: '#2563eb',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Package size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                افزودن ماژول‌های جدید به اشتراک فعال (خرید تک یا چند ماژول)
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              ماژول‌های مورد نیاز خود را به صورت تکی یا گروهی انتخاب کنید تا بلافاصله به اشتراک فعلی شما افزوده شوند. تاریخ انقضای اشتراک جاری شما تغییری نخواهد کرد.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              background: availableAddonModules.length > 0 ? '#eff6ff' : '#f0fdf4', 
              color: availableAddonModules.length > 0 ? '#1d4ed8' : '#166534', 
              fontSize: '12px', 
              fontWeight: 700, 
              padding: '6px 14px', 
              borderRadius: '20px',
              border: `1px solid ${availableAddonModules.length > 0 ? '#bfdbfe' : '#bbf7d0'}`
            }}>
              {availableAddonModules.length > 0 
                ? `${availableAddonModules.length.toLocaleString('fa-IR')} ماژول جدید قابل افزودن`
                : 'تمام ماژول‌ها فعال هستند'}
            </span>
          </div>
        </div>

        {addonError && (
          <div className="erp-sub-alert-banner error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{addonError}</span>
            <button type="button" onClick={() => setAddonError(null)} style={{ marginRight: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {availableAddonModules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Sparkles size={32} color="#10b981" style={{ marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>
              تمامی ماژول‌های سامانه در اشتراک شما فعال هستند
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              شما هم‌اکنون به تمامی ماژول‌ها و ابزارهای سیستم جامع ERP کارویتا دسترسی کامل دارید.
            </p>
          </div>
        ) : (
          <>
            {/* Search & Category Filter Bar */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '18px', 
              flexWrap: 'wrap',
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  placeholder="جستجوی سریع در ماژول‌ها (نام ماژول، توضیح، کارکرد)..."
                  value={addonSearchQuery}
                  onChange={(e) => setAddonSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 36px 8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#ffffff',
                    fontFamily: 'inherit'
                  }}
                />
                {addonSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAddonSearchQuery('')}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              {addonCategories.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setAddonSelectedCategory('all')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: addonSelectedCategory === 'all' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      background: addonSelectedCategory === 'all' ? '#eff6ff' : '#ffffff',
                      color: addonSelectedCategory === 'all' ? '#1d4ed8' : '#64748b'
                    }}
                  >
                    همه دسته‌ها ({availableAddonModules.length})
                  </button>
                  {addonCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAddonSelectedCategory(cat)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: addonSelectedCategory === cat ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        background: addonSelectedCategory === cat ? '#eff6ff' : '#ffffff',
                        color: addonSelectedCategory === cat ? '#1d4ed8' : '#64748b'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid of Available Addon Modules */}
            {filteredAddonModules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
                هیچ ماژولی با عبارت جستجو شده یافت نشد.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {filteredAddonModules.map(m => {
                  const isSelected = selectedAddonModuleIds.includes(m.id);
                  const pTitle = getModulePersianTitle(m.id, m.title);
                  const price = Number(m.price) || 250000;
                  const hasDeps = Array.isArray(m.dependencies) && m.dependencies.length > 0;
                  const unownedDeps = hasDeps ? m.dependencies.filter(depId => !activeModuleIds.includes(depId)) : [];

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleAddonModule(m.id)}
                      style={{
                        background: isSelected ? '#f0fdf4' : '#ffffff',
                        border: isSelected ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease-in-out',
                        boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.12)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            color: isSelected ? '#047857' : '#64748b',
                            background: isSelected ? '#d1fae5' : '#f1f5f9',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            {m.category || 'ماژول تخصصی'}
                          </span>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                            background: isSelected ? '#10b981' : 'transparent',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            flexShrink: 0
                          }}>
                            {isSelected ? <Check size={13} strokeWidth={3} /> : null}
                          </span>
                        </div>

                        <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
                          {pTitle}
                        </h4>

                        {m.description && (
                          <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: 1.45, minHeight: '34px' }}>
                            {m.description}
                          </p>
                        )}

                        {unownedDeps.length > 0 && (
                          <div style={{ marginTop: '8px', fontSize: '10.5px', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            <span>نیازمند: {unownedDeps.map(d => getModulePersianTitle(d, d)).join('، ')}</span>
                          </div>
                        )}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px dashed #e2e8f0',
                        marginTop: '4px'
                      }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#047857' : '#0f172a' }}>
                            {price.toLocaleString('fa-IR')}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#64748b', marginRight: '3px' }}>
                            تومان/ماه
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAddonModule(m.id);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '7px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: isSelected ? '1px solid #10b981' : '1px solid #cbd5e1',
                            background: isSelected ? '#10b981' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#334155',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check size={12} />
                              <span>انتخاب شد</span>
                            </>
                          ) : (
                            <>
                              <Plus size={12} />
                              <span>انتخاب ماژول</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Checkout Action Bar (when 1 or more modules are selected) */}
            {selectedAddonModuleIds.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                border: '1.5px solid #bfdbfe',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.08)',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#2563eb', color: '#ffffff', fontSize: '11.5px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
                      {selectedAddonModuleIds.length.toLocaleString('fa-IR')} ماژول انتخاب شده
                    </span>
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                      دوره محاسبه: {currentPeriodConfig.label} ({addonPeriodMultiplier.toLocaleString('fa-IR')} ماه)
                    </span>
                  </div>

                  {/* Selected Module Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedAddonObjects.map(mod => (
                      <span
                        key={mod.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          color: '#1e293b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 600
                        }}
                      >
                        {mod.title}
                        <button
                          type="button"
                          onClick={() => handleRemoveAddonModule(mod.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="حذف"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amount and Pay Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      مبلغ نهایی قابل پرداخت:
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a' }}>
                      {finalAddonAmount.toLocaleString('fa-IR')}{' '}
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>تومان</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isCreatingAddonOrder}
                    onClick={handleProceedToAddonPayment}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: isCreatingAddonOrder ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                      opacity: isCreatingAddonOrder ? 0.7 : 1
                    }}
                  >
                    {isCreatingAddonOrder ? (
                      <>
                        <Loader2 size={16} className="erp-spin" />
                        <span>در حال صدور سفارش...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        <span>پرداخت و افزودن آنی به اشتراک</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAddonModuleIds([])}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    لغو انتخاب
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Renewal Section: نحوه تمدید اشتراک (یا باکس پایداری اشتراک در صورت بیش از ۳۰ روز) */}
      {isRenewalSectionActive ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          
          {/* بنر تمدید زودهنگام در صورت داشتن مجوز از مدیریت */}
          {canRenewEarly && remainingDays > 30 && !isExpired && !isTrial && (
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #86efac',
              borderRadius: '12px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#16a34a', color: '#ffffff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={16} />
                </div>
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#166534', display: 'block' }}>
                    مجوز تمدید زودهنگام توسط مدیریت برای شما فعال گردیده است
                  </strong>
                  <span style={{ fontSize: '12px', color: '#15803d' }}>
                    با وجود اینکه {remainingDays.toLocaleString('fa-IR')} روز تا پایان دوره اشتراک باقی است، شما می‌توانید هم‌اکنون نسبت به تمدید یا ارتقا اقدام فرمایید. مدت اعتبار جدید به انتهای اشتراک فعلی شما افزوده خواهد شد.
                  </span>
                </div>
              </div>
              <span style={{ background: '#15803d', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
                ⚡ تمدید زودهنگام مجاز
              </span>
            </div>
          )}

          {/* 1. عنوان بخش: نحوه تمدید اشتراک */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <RotateCw size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                نحوه تمدید اشتراک
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {isTrial 
              ? 'دوره ۵ روزه آزمایشی رایگان قابل تمدید مستقیم نیست. جهت خرید اشتراک تجاری، روی کارت «تمدید +تغییر نوع اشتراک» کلیک فرمایید.'
              : 'روش مورد نظر خود را جهت تمدید یا ارتقای سرویس انتخاب فرمایید:'}
          </p>
        </div>

        {/* 2. دو کارت انتخابگر افقی (Radio Cards / Toggle Cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* کارت الف (انتخاب پیش‌فرض): تمدید اشتراک فعلی با کادر ۲ ماه رایگان در بالای کارت */}
          <div
            id="radio-card-same"
            onClick={() => {
              if (isTrial) return;
              setRenewalMode('same');
              setShowCustomModal(false);
            }}
            style={{
              position: 'relative',
              padding: '22px 20px 20px',
              borderRadius: '14px',
              border: renewalMode === 'same' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
              background: renewalMode === 'same' ? '#f8faff' : '#ffffff',
              cursor: isTrial ? 'not-allowed' : 'pointer',
              opacity: isTrial ? 0.6 : 1,
              transition: 'all 0.2s ease',
              boxShadow: renewalMode === 'same' ? '0 4px 14px rgba(37, 99, 235, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)'
            }}
          >
            {/* کادر بالای کارت الف: ۲ ماه رایگان */}
            <div style={{
              position: 'absolute',
              top: '-11px',
              right: '20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 12px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles size={11} />
              <span>۲ ماه رایگان</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: renewalMode === 'same' ? '6px solid #2563eb' : '2px solid #cbd5e1',
                  background: '#ffffff',
                  marginTop: '2px',
                  flexShrink: 0
                }} />
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '15.5px', fontWeight: 800, color: renewalMode === 'same' ? '#1e40af' : '#0f172a' }}>
                    تمدید اشتراک فعلی
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
                    تمدید سریع با حفظ شرایط، ماژول‌ها و کاربران فعلی (دوره سالانه با ۲ ماه هدیه رایگان)
                  </p>
                </div>
              </div>

              {isTrial && (
                <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#94a3b8', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                  غیرفعال در آزمایشی
                </span>
              )}
            </div>
          </div>

          {/* کارت ب: تمدید +تغییر نوع اشتراک به همراه آیکون ویرایش */}
          <div
            id="radio-card-custom"
            onClick={() => {
              setRenewalMode('custom');
              setShowCustomModal(true);
            }}
            style={{
              position: 'relative',
              padding: '22px 20px 20px',
              borderRadius: '14px',
              border: renewalMode === 'custom' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
              background: renewalMode === 'custom' ? '#f8faff' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: renewalMode === 'custom' ? '0 4px 14px rgba(37, 99, 235, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: renewalMode === 'custom' ? '6px solid #2563eb' : '2px solid #cbd5e1',
                  background: '#ffffff',
                  marginTop: '2px',
                  flexShrink: 0
                }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: renewalMode === 'custom' ? '#1e40af' : '#0f172a' }}>
                      تمدید +تغییر نوع اشتراک
                    </h4>
                    <Edit3 size={15} color="#2563eb" />
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
                    ویرایش مدت زمان، تنظیم تعداد کاربران و انتخاب ماژول‌های دلخواه قبل از پرداخت
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setRenewalMode('custom');
                  setShowCustomModal(true);
                }}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  whiteSpace: 'nowrap'
                }}
              >
                <Edit3 size={13} />
                <span>تنظیم و ویرایش</span>
              </button>
            </div>
          </div>
        </div>

        {/* نمای پیش‌فرض زیر کارت الف (تمدید با شرایط فعلی) */}
        {renewalMode === 'same' && !isTrial && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                  مبلغ نهایی قابل پرداخت تمدید با شرایط فعلی ({PERIOD_CONFIG['yearly'].label}):
                </span>
                <strong style={{ fontSize: '22px', color: '#16a34a', fontWeight: 900 }}>
                  {sameSpecYearlyTotal.toLocaleString('fa-IR')} تومان
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b', marginRight: '8px' }}>
                  (محاسبه شده برای {activeModules.length.toLocaleString('fa-IR')} ماژول و {initialUserCount.toLocaleString('fa-IR')} کاربر با ۲ ماه رایگان)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onBack}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={isCreatingOrder}
                  onClick={() => handleProceedToPayment(false)}
                  style={{ 
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    minWidth: '200px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    padding: '10px 20px',
                    fontWeight: 700
                  }}
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>در حال اتصال به درگاه…</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      <span>ادامه و پرداخت آنلاین</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* اگر کاربر روی کارت ب باشد، دکمه باز کردن مجدد پاپ‌آپ در صفحه اصلی نمایش داده می‌شود */}
        {renewalMode === 'custom' && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                  مبلغ نهایی قابل پرداخت با تغییرات جدید ({PERIOD_CONFIG[renewPeriod]?.label || 'سالانه'}):
                </span>
                <strong style={{ fontSize: '22px', color: '#16a34a', fontWeight: 900 }}>
                  {editedFinalAmount.toLocaleString('fa-IR')} تومان
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b', marginRight: '8px' }}>
                  (شامل {selectedModuleIds.length.toLocaleString('fa-IR')} ماژول انتخابی و {userCount.toLocaleString('fa-IR')} کاربر)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (!isTrial) setRenewalMode('same');
                    else onBack();
                  }}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowCustomModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    fontWeight: 700
                  }}
                >
                  <Edit3 size={16} />
                  <span>مشاهده و ویرایش در پاپ‌آپ</span>
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={isCreatingOrder}
                  onClick={() => handleProceedToPayment(true)}
                  style={{ 
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    minWidth: '200px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    padding: '10px 20px',
                    fontWeight: 700
                  }}
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>در حال اتصال به درگاه…</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      <span>ادامه و پرداخت آنلاین</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      ) : (
        /* کارت وضعیت پایداری اشتراک برای مواردی که بیش از ۳۰ روز مانده و تمدید زودهنگام فعال نیست */
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1.5px solid #cbd5e1',
          borderRadius: '16px',
          padding: '32px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.15)'
          }}>
            <ShieldCheck size={32} />
          </div>

          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            اشتراک ابری شما فعال و کاملاً پایدار است
          </h3>

          <p style={{ margin: '0 auto 20px', maxWidth: '580px', fontSize: '13.5px', color: '#64748b', lineHeight: 1.65 }}>
            از دوره اشتراک جاری شما <strong style={{ color: '#0284c7', fontSize: '15px' }}>{remainingDays.toLocaleString('fa-IR')} روز</strong> باقی مانده است.
            باکس نحوه تمدید اشتراک و روش‌های پرداخت به صورت خودکار از <strong style={{ color: '#0f172a' }}>۳۰ روز مانده به پایان اعتبار</strong> برای شما فعال خواهد شد.
          </p>

          {/* Timeline details pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '16px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '12.5px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} color="#64748b" />
              <span style={{ color: '#64748b' }}>تاریخ پایان اعتبار:</span>
              <strong style={{ color: '#1e293b' }}>{formatDate(subscription.expires_at)}</strong>
            </div>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="#0284c7" />
              <span style={{ color: '#64748b' }}>زمان باقی‌مانده:</span>
              <strong style={{ color: '#0284c7' }}>{remainingDays.toLocaleString('fa-IR')} روز</strong>
            </div>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} color="#10b981" />
              <span style={{ color: '#10b981', fontWeight: 700 }}>وضعیت سرویس: فعال و آنلاین</span>
            </div>
          </div>

          {/* Support hint & actions */}
          <div style={{
            borderTop: '1px solid #f1f5f9',
            paddingTop: '20px',
            maxWidth: '540px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            alignItems: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.6 }}>
              در صورتی که قصد دارید زودتر از موعد ۳۰ روزه اشتراک خود را تمدید فرمایید، می‌توانید درخواست خود را با پشتیبانی در میان بگذارید تا مجوز تمدید زودهنگام توسط مدیریت برای حساب کاربری شما فعال گردد.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  borderRadius: '8px'
                }}
              >
                <ArrowRight size={15} />
                <span>بازگشت به داشبورد</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => nav('/plans')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  borderColor: '#0284c7'
                }}
              >
                <Users size={15} />
                <span>ارتقا و افزایش منابع</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Modal for Card B: تمدید +تغییر نوع اشتراک */}
      {showCustomModal && isRenewalSectionActive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            direction: 'rtl'
          }}
          onClick={() => {
            setShowCustomModal(false);
            if (!isTrial) setRenewalMode('same');
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '840px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* هدر پاپ‌آپ */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
                    تمدید + تغییر نوع اشتراک
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    مشخصات مورد نظر خود را ویرایش کرده و اشتراک فعلی را ارتقا دهید
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCustomModal(false);
                  if (!isTrial) setRenewalMode('same');
                }}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* بدنه پاپ‌آپ (Scrollable) */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* ۱. اطلاعات اشتراک فعلی (Current Subscription Summary Banner) */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, display: 'block' }}>
                    مشخصات اشتراک فعلی شما:
                  </span>
                  <strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    {subscription.title || subscription.package_name || 'اشتراک سازمانی کارویتا'}
                  </strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12.5px', color: '#334155' }}>
                    <Layers size={13} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle', color: '#2563eb' }} />
                    {activeModules.length.toLocaleString('fa-IR')} ماژول فعال
                  </span>
                  <span style={{ fontSize: '12.5px', color: '#334155' }}>
                    <Users size={13} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle', color: '#059669' }} />
                    {initialUserCount.toLocaleString('fa-IR')} کاربر همزمان
                  </span>
                  <span style={{ fontSize: '12.5px', color: '#334155' }}>
                    <Calendar size={13} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle', color: '#d97706' }} />
                    انقضا: {formatDate(subscription.expires_at)}
                  </span>
                </div>
              </div>

              {/* ۲. انتخاب دوره صورت‌حساب جدید */}
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '10px' }}>
                  انتخاب دوره صورت‌حساب جدید:
                </span>
                <div className="erp-buy-period-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
                  {Object.values(PERIOD_CONFIG).map((p) => {
                    const isSelected = renewPeriod === p.id;
                    return (
                      <div 
                        key={p.id}
                        className={`erp-buy-period-card ${isSelected ? 'active' : ''}`}
                        onClick={() => setRenewPeriod(p.id)}
                        style={{ cursor: 'pointer', padding: '12px 14px' }}
                      >
                        <div className="erp-buy-period-top">
                          <span className="erp-buy-period-name" style={{ fontSize: '13.5px' }}>{p.label}</span>
                          <span className={`erp-buy-period-tag ${p.highlight ? 'highlight' : ''}`}>
                            {p.tag}
                          </span>
                        </div>
                        <p className="erp-buy-period-desc" style={{ fontSize: '11px', marginTop: '4px' }}>{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ۳. تعداد کاربران همزمان */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>تعداد کاربران همزمان:</strong>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    تا {baseUserLimit.toLocaleString('fa-IR')} کاربر در اشتراک پایه رایگان لحاظ شده است (کاربران مازاد: {extraUserPrice.toLocaleString('fa-IR')} تومان در ماه)
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="erp-stepper-btn"
                    disabled={userCount <= 1}
                    onClick={() => setUserCount(prev => Math.max(prev - 1, 1))}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '15px', minWidth: '70px', textAlign: 'center' }}>
                    {userCount.toLocaleString('fa-IR')} کاربر
                  </span>
                  <button
                    type="button"
                    className="erp-stepper-btn"
                    onClick={() => setUserCount(prev => prev + 1)}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* ۴. ماژول‌ها و قیمت‌های هر ماژول */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    انتخاب ماژول‌های اشتراک ({selectedModuleIds.length.toLocaleString('fa-IR')} ماژول انتخاب شده):
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    جهت افزودن یا حذف هر ماژول روی آن کلیک فرمایید
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '10px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  padding: '4px'
                }}>
                  {allModules.map(mod => {
                    const isSelected = selectedModuleIds.includes(mod.id);
                    const isCore = mod.id === 'account' || mod.id === 'hr';
                    const p = Number(mod.price) || 0;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => {
                          if (isCore) return;
                          handleToggleModule(mod.id);
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: isCore ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1e40af' : '#334155' }}>
                            {getModulePersianTitle(mod.id, mod.title)}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                            {p > 0 ? `${p.toLocaleString('fa-IR')} ت/ماه` : 'رایگان'}
                          </span>
                        </div>
                        {isCore ? (
                          <span style={{ fontSize: '10px', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                            الزامی
                          </span>
                        ) : isSelected ? (
                          <Check size={16} color="#2563eb" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* فوتر پاپ‌آپ: نمایش مبلغ نهایی قابل پرداخت با فونت درشت و دکمه‌های ادامه و پرداخت / انصراف */}
            <div style={{
              padding: '18px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* سمت راست: نمایش مبلغ نهایی با فونت درشت، خوانا و واضح */}
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                  مبلغ نهایی قابل پرداخت ({PERIOD_CONFIG[renewPeriod]?.label || 'سالانه'}):
                </span>
                <strong style={{ fontSize: '24px', color: '#16a34a', fontWeight: 900, letterSpacing: '-0.5px', display: 'inline-block' }}>
                  {editedFinalAmount.toLocaleString('fa-IR')} تومان
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b', marginRight: '8px' }}>
                  (شامل {selectedModuleIds.length.toLocaleString('fa-IR')} ماژول و {userCount.toLocaleString('fa-IR')} کاربر)
                </span>
              </div>

              {/* سمت چپ: دکمه برجسته و واحد «ادامه و پرداخت آنلاین» در کنار دکمه کوچک‌تر «انصراف» */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowCustomModal(false);
                    if (!isTrial) setRenewalMode('same');
                  }}
                  style={{ padding: '9px 18px', fontSize: '13px' }}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={isCreatingOrder}
                  onClick={() => handleProceedToPayment(true)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    padding: '10px 22px',
                    fontSize: '14px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>در حال اتصال به درگاه…</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={17} />
                      <span>ادامه و پرداخت آنلاین</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}