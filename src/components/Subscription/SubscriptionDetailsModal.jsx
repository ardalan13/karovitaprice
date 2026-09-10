import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  LogIn, 
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
  Search, 
  Receipt, 
  Check, 
  Loader2, 
  Calendar,
  RotateCw,
  ShieldCheck,
  ShoppingCart
} from 'lucide-react';
import { api } from '../../services/api';
import { OnlinePaymentModal } from '../Payments/OnlinePaymentModal';
import { DEFAULT_MODULES } from '../PricingConfigurator/configuratorData';

const ERP_PORTAL_URL = 'https://crm.karovita.ir';

export const MODULE_NAMES_FA = {
  accounting: 'حسابداری و مالی',
  account: 'حسابداری و مالی',
  finance: 'مدیریت مالی و اسناد',
  crm: 'ارتباط با مشتریان (CRM)',
  sale: 'فروش و پیش‌فاکتور',
  sales: 'فروش و بازرگانی',
  mail: 'گفتگو و پیام‌رسان سازمانی',
  calendar: 'گاهشمار و تقویم کاری',
  activities: 'اقدامات و پیگیری‌ها',
  survey: 'فرم‌ساز و نظرسنجی',
  contacts: 'مخاطبان و دفترچه تلفن',
  project: 'مدیریت پروژه و وظایف',
  hr: 'کارمندان و پرسنلی',
  stock: 'انبارداری و لجستیک',
  inventory: 'انبارداری و موجودی کالا',
  purchase: 'خرید و تدارکات',
  manufacturing: 'تولید و ساخت (MRP)',
  mrp: 'تولید و برنامه‌ریزی ساخت',
  website: 'وب‌سایت ساز',
  ecommerce: 'فروشگاه اینترنتی',
  point_of_sale: 'صندوق فروشگاهی (POS)',
  pos: 'صندوق فروشگاهی (POS)',
  timesheet: 'ثبت کارکرد و تایم‌شیت',
  helpdesk: 'پشتیبانی و تیکتینگ',
  expense: 'هزینه‌ها و تنخواه‌گردان',
  hr_expense: 'هزینه‌ها و تنخواه‌گردان',
  leaves: 'مرخصی‌ها و تعطیلات',
  recruitment: 'استخدام و جذب نیرو',
  appraisal: 'ارزیابی عملکرد',
  payroll: 'حقوق و دستمزد',
  sign: 'امضای دیجیتال و الکترونیک',
  documents: 'مدیریت اسناد و بایگانی',
  planning: 'برنامه‌ریزی شیفت‌ها',
  maintenance: 'نگهداری و تعمیرات (نت)',
  fleet: 'مدیریت خودروها و ناوگان',
  quality: 'کنترل و تضمین کیفیت (QC)',
  voip: 'تلفن ابری (VOIP)',
  mass_mailing: 'ایمیل مارکتینگ',
  sms: 'پیامک انبوه و هوشمند',
  whatsapp: 'ارتباطات و مارکتینگ واتساپ',
  social: 'شبکه‌های اجتماعی',
  event: 'رویدادها و همایش‌ها',
  approvals: 'کارتابل تاییدات',
  knowledge: 'پایگاه دانش سازمانی',
  dashboard: 'داشبورد هوش تجاری (BI)',
  bi: 'داشبورد هوش تجاری (BI)',
  marketing_automation: 'اتوماسیون بازاریابی',
  base: 'هسته پایه سیستم ERP'
};

export function getModulePersianTitle(id, title) {
  if (id && MODULE_NAMES_FA[id.toLowerCase()]) {
    return MODULE_NAMES_FA[id.toLowerCase()];
  }
  const cleanTitle = (title || '').trim().toLowerCase();
  if (cleanTitle && MODULE_NAMES_FA[cleanTitle]) {
    return MODULE_NAMES_FA[cleanTitle];
  }
  if (!title || title === id) {
    const found = DEFAULT_MODULES.find(m => m.id === id);
    if (found && found.title) return found.title;
  }
  return title || id || 'ماژول سازمانی';
}

const CATEGORY_MAP = {
  all: 'همه ماژول‌ها',
  sales: 'فروش و ارتباط با مشتری',
  management: 'مدیریت و پروژه‌ها',
  productivity: 'بهره‌وری و ابزارها',
  finance: 'مالی و حسابداری',
  inventory: 'انبار و تدارکات',
  marketing: 'بازاریابی',
  hr: 'منابع انسانی',
};

const PERIOD_CONFIG = {
  '3_months': {
    id: '3_months',
    label: '۳ ماهه (فصلی)',
    shortLabel: '۳ ماهه',
    multiplier: 3,
    tag: 'استاندارد',
    highlight: false,
    desc: 'تسویه هر فصل یک‌بار با هزینه بهینه'
  },
  '6_months': {
    id: '6_months',
    label: '۶ ماهه (نیم‌سال)',
    shortLabel: '۶ ماهه',
    multiplier: 6,
    tag: 'محبوب',
    highlight: false,
    desc: 'تسویه هر ۶ ماه یک‌بار برای ثبات سازمانی'
  },
  'yearly': {
    id: 'yearly',
    label: 'سالانه',
    shortLabel: 'سالانه',
    multiplier: 10,
    tag: '۲ ماه هدیه رایگان',
    highlight: true,
    desc: 'معادل ۱۰ ماه هزینه (۲ ماه اشتراک هدیه)'
  }
};

export function SubscriptionDetailsModal({ subscription, user, onClose, onUpdated, initialTab = 'overview' }) {
  if (!subscription) return null;

  // Active navigation tab: 'overview' | 'renew' | 'buy'
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Selected billing period for purchasing new modules
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const p = subscription.billing_period;
    if (p === 'yearly') return 'yearly';
    if (p === '6_months') return '6_months';
    return '3_months';
  });

  // Base subscription user count and current state for user capacity
  const initialUserCount = Math.max(Number(subscription.user_count) || 5, 5);
  const [userCount, setUserCount] = useState(initialUserCount);

  // Local active modules state (allows instant real-time updates upon purchase)
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
          : { id, title: getModulePersianTitle(id, id), price: 0 };
      });
    }
    if (subscription.module_names && Array.isArray(subscription.module_names)) {
      return subscription.module_names.map((name, i) => ({
        id: `mod_${i}`,
        title: getModulePersianTitle(`mod_${i}`, name),
        price: 0
      }));
    }
    return [];
  });

  // System-wide ERP modules & settings catalog
  const [allModules, setAllModules] = useState(DEFAULT_MODULES);
  const [configSettings, setConfigSettings] = useState({
    base_user_limit: 1,
    extra_user_price: 800000
  });

  const [selectedNewModuleIds, setSelectedNewModuleIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Checkout / Payment Modal state
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);

  const isExpired = new Date(subscription.expires_at) < new Date();
  const isTrial = subscription.source === 'trial';
  const remainingDays = getRemainingDays(subscription.expires_at);

  // Fetch updated catalog and pricing settings from server
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
      .catch(err => {
        console.warn('Could not fetch latest modules catalog, using defaults:', err);
      });
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

  const handleOpenErpPortal = () => {
    window.open(ERP_PORTAL_URL, '_blank', 'noopener,noreferrer');
  };

  // Set of IDs already active in this subscription
  const activeIds = useMemo(() => {
    return activeModules.map(m => m.id);
  }, [activeModules]);

  // Unpurchased modules available for addition
  const availableNewModules = useMemo(() => {
    return allModules.filter(m => {
      const isIdActive = activeIds.includes(m.id);
      const isTitleActive = activeModules.some(
        am => am.title && am.title.trim().toLowerCase() === m.title?.trim().toLowerCase()
      );
      return !isIdActive && !isTitleActive && m.is_active !== false;
    });
  }, [allModules, activeIds, activeModules]);

  // Filtered unpurchased modules by search and category
  const filteredNewModules = useMemo(() => {
    return availableNewModules.filter(m => {
      const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const persianTitle = getModulePersianTitle(m.id, m.title);
      const matchesSearch = !q || 
        persianTitle.toLowerCase().includes(q) ||
        (m.title && m.title.toLowerCase().includes(q)) || 
        (m.description && m.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [availableNewModules, activeCategory, searchQuery]);

  // Selected module objects
  const selectedModulesObjects = useMemo(() => {
    return availableNewModules.filter(m => selectedNewModuleIds.includes(m.id));
  }, [availableNewModules, selectedNewModuleIds]);

  // Price calculations for selected modules and extra users
  const monthlyModulesSum = useMemo(() => {
    return selectedModulesObjects.reduce((acc, m) => acc + (Number(m.price) || 0), 0);
  }, [selectedModulesObjects]);

  const baseUserLimit = configSettings.base_user_limit || 1;
  const extraUserPrice = configSettings.extra_user_price || 800000;
  const hasCrmInCart = selectedModulesObjects.some(m => m.id === 'crm') || activeIds.includes('crm');
  const extraUsersCount = hasCrmInCart ? Math.max(userCount - baseUserLimit, 0) : 0;
  const extraUsersMonthlyCost = extraUsersCount * extraUserPrice;

  const currentPeriodConfig = PERIOD_CONFIG[selectedPeriod] || PERIOD_CONFIG['3_months'];
  const billingMultiplier = currentPeriodConfig.multiplier;
  
  const baseMonthlyTotal = monthlyModulesSum + extraUsersMonthlyCost;
  const finalCalculatedAmount = baseMonthlyTotal * billingMultiplier;

  // ---------------------------------------------------------------------------
  // Subscription Renewal Calculations & State
  // ---------------------------------------------------------------------------
  const [renewPeriod, setRenewPeriod] = useState('yearly');
  const renewPeriodConfig = PERIOD_CONFIG[renewPeriod] || PERIOD_CONFIG['yearly'];

  const activeModulesMonthlySum = useMemo(() => {
    return activeModules.reduce((sum, m) => {
      const p = Number(m.price);
      if (!isNaN(p) && p > 0) return sum + p;
      const found = allModules.find(am => am.id === m.id);
      return sum + (found ? (Number(found.price) || 250000) : 250000);
    }, 0);
  }, [activeModules, allModules]);

  const renewHasCrm = activeModules.some(m => m.id === 'crm');
  const renewExtraUsersCount = renewHasCrm ? Math.max(initialUserCount - baseUserLimit, 0) : 0;
  const renewExtraUsersMonthlyCost = renewExtraUsersCount * extraUserPrice;
  const renewBaseMonthlyTotal = activeModulesMonthlySum + renewExtraUsersMonthlyCost;
  const renewMultiplier = renewPeriodConfig.multiplier;
  const renewFinalAmount = Math.round(renewBaseMonthlyTotal * renewMultiplier);

  // Has items in cart to invoice (either modules or extra user seats)
  const hasOrderItems = selectedNewModuleIds.length > 0 || (userCount > initialUserCount);

  // Toggle selection with dependency satisfaction
  const handleToggleModule = (moduleId) => {
    setSelectedNewModuleIds(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        const targetMod = availableNewModules.find(m => m.id === moduleId);
        const deps = targetMod?.dependencies || [];
        const newDepsToAdd = deps.filter(d => !activeIds.includes(d) && !prev.includes(d));
        return [...prev, moduleId, ...newDepsToAdd];
      }
    });
  };

  // Create ERP Order for New Modules / Users and trigger payment modal
  const handleCreateInvoiceAndPay = async () => {
    if (!hasOrderItems) return;
    setIsCreatingOrder(true);
    setErrorBanner(null);
    try {
      const res = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          selected_module_ids: selectedNewModuleIds,
          user_count: userCount,
          billing_period: selectedPeriod,
          amount: finalCalculatedAmount,
          final_amount: finalCalculatedAmount,
          subtotal: baseMonthlyTotal,
        })
      });

      if (res && (res.order_id || res.id)) {
        const orderId = res.order_id || res.id;
        setCheckoutOrder({
          id: orderId,
          order_number: res.order_number,
          amount: finalCalculatedAmount,
          selected_modules: selectedModulesObjects,
          user_count: userCount,
          billing_period: selectedPeriod,
          payment_url: res.payment_url
        });
      } else {
        throw new Error(res.message || 'خطا در صدور پیش‌فاکتور سفارش.');
      }
    } catch (err) {
      setErrorBanner(err.message || 'خطا در برقراری ارتباط با سرور جهت صدور فاکتور.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Create ERP Order for Subscription Renewal and trigger payment modal
  const handleRenewSubscriptionAndPay = async () => {
    setIsCreatingOrder(true);
    setErrorBanner(null);
    try {
      const activeIdsList = activeModules.map(m => m.id);
      const res = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          selected_module_ids: activeIdsList.length > 0 ? activeIdsList : ['accounting', 'crm', 'sales', 'warehouse'],
          user_count: initialUserCount,
          billing_period: renewPeriod,
          amount: renewFinalAmount,
          final_amount: renewFinalAmount,
          subtotal: renewBaseMonthlyTotal,
          is_renewal: true
        })
      });

      if (res && (res.order_id || res.id)) {
        const orderId = res.order_id || res.id;
        setCheckoutOrder({
          id: orderId,
          order_number: res.order_number,
          amount: renewFinalAmount,
          selected_modules: activeModules,
          user_count: initialUserCount,
          billing_period: renewPeriod,
          payment_url: res.payment_url,
          is_renewal: true
        });
      } else {
        throw new Error(res.message || 'خطا در صدور فاکتور تمدید اشتراک.');
      }
    } catch (err) {
      setErrorBanner(err.message || 'خطا در برقراری ارتباط با سرور جهت تمدید اشتراک.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Handle successful payment completion
  const handlePaymentSuccess = (paymentResult) => {
    if (paymentResult?.is_renewal || activeTab === 'renew') {
      setSuccessBanner('✓ اشتراک شما با موفقیت تمدید شد و مدت زمان جدید به دوره اشتراک سازمانی شما افزوده گردید.');
      setActiveTab('overview');
      if (onUpdated) onUpdated();
    } else {
      const newlyAdded = selectedModulesObjects.map(m => ({
        ...m,
        title: getModulePersianTitle(m.id, m.title)
      }));
      setActiveModules(prev => [...prev, ...newlyAdded]);
      setSelectedNewModuleIds([]);
      setActiveTab('overview');
      setSuccessBanner(
        `✓ سفارش شما با موفقیت تسویه شد. ${newlyAdded.length > 0 ? `ماژول‌های جدید (${newlyAdded.map(m => m.title).join('، ')})` : ''} و ظرفیت ${userCount.toLocaleString('fa-IR')} کاربر به اشتراک سازمانی شما اعمال گردید.`
      );
      if (onUpdated) onUpdated();
    }
    window.dispatchEvent(new CustomEvent('payment-completed', { detail: paymentResult }));
    window.dispatchEvent(new CustomEvent('order-updated', { detail: paymentResult }));
  };

  const getSubPeriodLabel = (bp) => {
    if (PERIOD_CONFIG[bp]) return PERIOD_CONFIG[bp].label;
    if (bp === 'yearly') return 'دوره سالانه';
    if (bp === '6_months') return 'دوره ۶ ماهه (نیم‌سال)';
    return 'دوره ۳ ماهه (فصلی)';
  };

  return (
    <>
      <div className="erp-sub-modal-backdrop" onClick={onClose} dir="rtl">
        <div className="erp-sub-modal-card" onClick={e => e.stopPropagation()}>
          
          {/* Modal Header */}
          <div className="erp-sub-modal-header">
            <div className="erp-sub-modal-header-info">
              <div className="erp-sub-badge-row">
                <span className={`erp-status-chip ${isExpired ? 'expired' : isTrial ? 'trial' : 'active'}`}>
                  {isTrial ? '⭐️ دوره آزمایشی ۵ روزه' : isExpired ? '⚠️ منقضی شده' : '✓ اشتراک فعال سازمانی'}
                </span>
                <span className="erp-period-chip">
                  {getSubPeriodLabel(subscription.billing_period)}
                </span>
                {remainingDays > 0 && !isExpired && (
                  <span className="erp-remaining-chip">
                    <Clock size={13} />
                    <span>{remainingDays.toLocaleString('fa-IR')} روز باقیمانده</span>
                  </span>
                )}
              </div>
              <h2 className="erp-sub-modal-title">{subscription.package_name || 'سرویس یکپارچه ERP کارویتا'}</h2>
            </div>
            <button type="button" className="erp-sub-modal-close-btn" onClick={onClose} title="بستن">
              <X size={20} />
            </button>
          </div>

          {/* Nav Tabs for Clean UX */}
          <div className="erp-sub-modal-nav-tabs">
            <button
              type="button"
              className={`erp-sub-modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Layers size={16} />
              <span>مشخصات و ماژول‌های فعال</span>
              <span className="erp-sub-modal-tab-badge">{activeModules.length.toLocaleString('fa-IR')}</span>
            </button>
            <button
              type="button"
              className={`erp-sub-modal-tab-btn ${activeTab === 'renew' ? 'active' : ''}`}
              onClick={() => setActiveTab('renew')}
              style={{ position: 'relative' }}
            >
              {isTrial ? <ShoppingCart size={16} /> : <RotateCw size={16} />}
              <span>{isTrial ? 'خرید اشتراک تجاری' : 'تمدید اشتراک'}</span>
              <span 
                className="erp-sub-modal-tab-badge"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', fontWeight: 800 }}
              >
                🎁 ۲ ماه رایگان
              </span>
            </button>
            {!isTrial && (
              <button
                type="button"
                className={`erp-sub-modal-tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
                onClick={() => setActiveTab('buy')}
              >
                <Plus size={16} />
                <span>افزودن ماژول/کاربر</span>
                {availableNewModules.length > 0 && (
                  <span 
                    className="erp-sub-modal-tab-badge"
                    style={selectedNewModuleIds.length > 0 ? { background: '#2563eb', color: '#ffffff' } : {}}
                  >
                    {selectedNewModuleIds.length > 0 
                      ? `${selectedNewModuleIds.length.toLocaleString('fa-IR')} انتخاب شده` 
                      : `${availableNewModules.length.toLocaleString('fa-IR')} ماژول`}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="erp-sub-modal-body">
            {/* Feedback Banners */}
            {successBanner && (
              <div className="erp-sub-alert-banner success">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} />
                  <span>{successBanner}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSuccessBanner(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {errorBanner && (
              <div className="erp-sub-alert-banner error">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} />
                  <span>{errorBanner}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setErrorBanner(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* TAB 1: OVERVIEW & ACTIVE MODULES */}
            {activeTab === 'overview' && (
              <div className="erp-sub-tab-content">
                {/* Quick Portal Launch Hero Banner */}
                <div className="erp-portal-launch-banner">
                  <div className="erp-launch-banner-content">
                    <div className="erp-launch-banner-icon">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="erp-launch-banner-title">ورود به پنل شخصی ERP کارویتا</h3>
                      <p className="erp-launch-banner-desc">
                        جهت دسترسی به سیستم، مدیریت اسناد، صدور فاکتور و استفاده از ماژول‌های فعال، می‌توانید مستقیماً وارد پرتال سامانه شوید.
                      </p>
                    </div>
                  </div>
                  <div className="erp-launch-actions">
                    <button 
                      type="button" 
                      className="erp-btn-enter-portal"
                      onClick={handleOpenErpPortal}
                    >
                      <LogIn size={18} />
                      <span>ورود به پنل شخصی ERP</span>
                    </button>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="erp-sub-details-grid">
                  {/* Purchase & Financial Details */}
                  <div className="erp-sub-info-card">
                    <div className="erp-info-card-header">
                      <CreditCard size={18} className="erp-card-icon" />
                      <h4>اطلاعات خرید و صورت‌حساب</h4>
                    </div>
                    <div className="erp-info-list">
                      <div className="erp-info-item">
                        <span className="erp-item-label">شماره سفارش:</span>
                        <span className="erp-item-val font-mono">{subscription.order_number || '—'}</span>
                      </div>
                      <div className="erp-info-item">
                        <span className="erp-item-label">کد پیگیری / شناسه پرداخت:</span>
                        <span className="erp-item-val font-mono">{subscription.reference_id || '—'}</span>
                      </div>
                      <div className="erp-info-item">
                        <span className="erp-item-label">مبلغ اشتراک:</span>
                        <span className="erp-item-val font-bold">
                          {Number(subscription.price || subscription.order_amount || 0) === 0 
                            ? 'رایگان (دوره آزمایشی)' 
                            : `${Number(subscription.price || subscription.order_amount || 0).toLocaleString('fa-IR')} تومان`}
                        </span>
                      </div>
                      {subscription.coupon_code && (
                        <div className="erp-info-item">
                          <span className="erp-item-label">کد تخفیف اعمال‌شده:</span>
                          <span className="erp-item-val erp-coupon-applied">{subscription.coupon_code}</span>
                        </div>
                      )}
                      <div className="erp-info-item">
                        <span className="erp-item-label">تاریخ خرید و فعال‌سازی:</span>
                        <span className="erp-item-val">{formatDate(subscription.starts_at)}</span>
                      </div>
                      <div className="erp-info-item">
                        <span className="erp-item-label">تاریخ پایان اشتراک:</span>
                        <span className="erp-item-val">{formatDate(subscription.expires_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Status & Limits */}
                  <div className="erp-sub-info-card">
                    <div className="erp-info-card-header">
                      <Activity size={18} className="erp-card-icon" />
                      <h4>مشخصات و وضعیت اشتراک</h4>
                    </div>
                    <div className="erp-info-list">
                      <div className="erp-info-item">
                        <span className="erp-item-label">ظرفیت مجاز کاربران:</span>
                        <span className="erp-item-val font-bold">
                          <Users size={14} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }} />
                          {Number(subscription.user_count || 5).toLocaleString('fa-IR')} کاربر همزمان
                        </span>
                      </div>
                      <div className="erp-info-item">
                        <span className="erp-item-label">وضعیت سرویس:</span>
                        <span className="erp-item-val erp-val-online">
                          <span className="erp-pulse-dot" />
                          {isExpired ? 'منقضی شده / نیازمند تمدید' : 'فعال و در دسترس'}
                        </span>
                      </div>
                      <div className="erp-info-item">
                        <span className="erp-item-label">دوره صورت‌حساب:</span>
                        <span className="erp-item-val font-bold">
                          {getSubPeriodLabel(subscription.billing_period)}
                        </span>
                      </div>
                      <div className="erp-info-item">
                        <span className="erp-item-label">نوع طرح:</span>
                        <span className="erp-item-val font-bold">
                          {subscription.package_name || 'طرح استاندارد سازمانی'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active ERP Modules Section */}
                <div className="erp-sub-modules-section">
                  <div className="erp-modules-section-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} color="#2563eb" />
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        ماژول‌های فعال در این اشتراک ({activeModules.length.toLocaleString('fa-IR')})
                      </h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="erp-modules-count-badge">
                        {activeModules.length.toLocaleString('fa-IR')} ماژول فعال
                      </span>
                      {availableNewModules.length > 0 && (
                        <button
                          type="button"
                          className="erp-btn-add-modules"
                          onClick={() => setActiveTab('buy')}
                        >
                          <Plus size={15} />
                          <span>+ خرید ماژول جدید</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Modules Grid */}
                  {activeModules.length > 0 ? (
                    <div className="erp-sub-modules-grid">
                      {activeModules.map((m, idx) => (
                        <div key={m.id || idx} className="erp-sub-module-badge-card">
                          <div className="erp-sub-mod-top">
                            <div className="erp-sub-mod-icon-wrap">
                              <CheckCircle2 size={16} color="#2563eb" />
                            </div>
                            <span className="erp-sub-mod-name">{getModulePersianTitle(m.id, m.title)}</span>
                            <span className="erp-sub-mod-active-tag">فعال در پنل</span>
                          </div>
                          {m.description && (
                            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                              {m.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="erp-empty-modules-notice">
                      <AlertCircle size={18} />
                      <span>تمامی دسترسی‌های پایه و ماژول‌های پیش‌فرض در این اشتراک فعال است.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: RENEW SUBSCRIPTION */}
            {activeTab === 'renew' && (
              <div className="erp-sub-tab-content">
                {/* Promo Header Banner */}
                <div 
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div 
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                      }}
                    >
                      <RotateCw size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                          تمدید اشتراک فعال ابری
                        </h3>
                        <span 
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}
                        >
                          🎁 ۲ ماه رایگان با پلن سالانه
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                        با تمدید اشتراک، مدت زمان جدید مستقیماً به انتهای تاریخ انقضای فعلی شما اضافه می‌شود و کلیه ماژول‌ها و اطلاعات بدون هیچ وقفه‌ای فعال باقی می‌مانند.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Period Selector */}
                <div className="erp-buy-period-section">
                  <div className="erp-buy-period-header">
                    <h4>
                      <Calendar size={16} color="#2563eb" />
                      <span>انتخاب مدت زمان تمدید</span>
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      تاریخ انقضای فعلی: <strong style={{ color: '#0f172a' }}>{formatDate(subscription.expires_at)}</strong>
                    </span>
                  </div>

                  <div className="erp-buy-period-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    {Object.values(PERIOD_CONFIG).map((p) => {
                      const isSelected = renewPeriod === p.id;
                      return (
                        <div 
                          key={p.id}
                          className={`erp-buy-period-card ${isSelected ? 'active' : ''}`}
                          onClick={() => setRenewPeriod(p.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="erp-buy-period-top">
                            <span className="erp-buy-period-name">{p.label}</span>
                            <span className={`erp-buy-period-tag ${p.highlight ? 'highlight' : ''}`}>
                              {p.tag}
                            </span>
                          </div>
                          <p className="erp-buy-period-desc">{p.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Renewal Summary & Calculation Card */}
                <div 
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    marginTop: '20px'
                  }}
                >
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt size={17} color="#2563eb" />
                    <span>خلاصه پیش‌فاکتور تمدید</span>
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                      <span>تعداد ماژول‌های فعال تحت پوشش:</span>
                      <strong style={{ color: '#0f172a' }}>{activeModules.length.toLocaleString('fa-IR')} ماژول</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                      <span>ظرفیت کاربران فعال:</span>
                      <strong style={{ color: '#0f172a' }}>{initialUserCount.toLocaleString('fa-IR')} کاربر</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                      <span>دوره انتخابی:</span>
                      <strong style={{ color: '#0f172a' }}>{renewPeriodConfig.label} ({renewPeriodConfig.tag})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                      <span>ضریب اعمال دوره:</span>
                      <strong style={{ color: '#0f172a' }}>معادل {renewMultiplier.toLocaleString('fa-IR')} ماه</strong>
                    </div>
                    
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '6px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', fontWeight: 800 }}>
                      <span style={{ color: '#0f172a' }}>مبلغ کل قابل پرداخت تمدید:</span>
                      <span style={{ color: '#16a34a', fontSize: '18px' }}>
                        {renewFinalAmount.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BUY & ADD NEW MODULES */}
            {activeTab === 'buy' && (
              <div className="erp-sub-tab-content">
                
                {/* Billing Period Selector & User Capacity Section */}
                <div className="erp-buy-period-section">
                  <div className="erp-buy-period-header">
                    <h4>
                      <Calendar size={16} color="#2563eb" />
                      <span>انتخاب دوره صورت‌حساب و ظرفیت کاربران</span>
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      دوره فعلی اشتراک شما: <strong style={{ color: '#0f172a' }}>{getSubPeriodLabel(subscription.billing_period)}</strong>
                    </span>
                  </div>

                  <div className="erp-buy-period-grid">
                    {/* 3 Period Cards */}
                    {Object.values(PERIOD_CONFIG).map((p) => {
                      const isSelected = selectedPeriod === p.id;
                      return (
                        <div 
                          key={p.id}
                          className={`erp-buy-period-card ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedPeriod(p.id)}
                        >
                          <div className="erp-buy-period-top">
                            <span className="erp-buy-period-name">{p.label}</span>
                            <span className={`erp-buy-period-tag ${p.highlight ? 'highlight' : ''}`}>
                              {p.tag}
                            </span>
                          </div>
                          <p className="erp-buy-period-desc">{p.desc}</p>
                        </div>
                      );
                    })}

                    {/* 4th Card: User Count / Capacity Stepper */}
                    <div className={`erp-user-count-card ${extraUsersCount > 0 ? 'has-extra' : ''}`}>
                      <div className="erp-buy-period-top">
                        <span className="erp-buy-period-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Users size={15} color="#2563eb" />
                          <span>تعداد کاربران</span>
                        </span>
                        <span className={`erp-buy-period-tag ${extraUsersCount > 0 ? 'highlight' : ''}`}>
                          {extraUsersCount > 0 ? `+${extraUsersCount} کاربر اضافی` : 'ظرفیت پایه'}
                        </span>
                      </div>

                      <div className="erp-user-stepper-row">
                        <button
                          type="button"
                          className="erp-stepper-btn"
                          disabled={userCount <= initialUserCount}
                          onClick={() => setUserCount(prev => Math.max(prev - 1, initialUserCount))}
                          title="کاهش کاربر"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="erp-stepper-display">
                          {userCount.toLocaleString('fa-IR')} کاربر
                        </span>
                        <button
                          type="button"
                          className="erp-stepper-btn"
                          onClick={() => setUserCount(prev => prev + 1)}
                          title="افزایش کاربر"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <p className="erp-buy-period-desc" style={{ fontSize: '11px', margin: 0 }}>
                        {extraUsersCount > 0 
                          ? `+${(extraUsersMonthlyCost * billingMultiplier).toLocaleString('fa-IR')} ت برای دوره ${currentPeriodConfig.shortLabel}`
                          : `حداقل ${initialUserCount.toLocaleString('fa-IR')} کاربر (هر کاربر اضافه: ${extraUserPrice.toLocaleString('fa-IR')} ت/ماه)`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="erp-add-filter-bar">
                  <div className="erp-add-search-input">
                    <Search size={15} color="#94a3b8" />
                    <input 
                      type="text" 
                      placeholder="جستجوی عنوان ماژول جدید…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button 
                        type="button" 
                        onClick={() => setSearchQuery('')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="erp-add-category-tabs">
                    {Object.entries(CATEGORY_MAP).map(([catKey, catLabel]) => (
                      <button
                        key={catKey}
                        type="button"
                        className={`erp-add-cat-btn ${activeCategory === catKey ? 'active' : ''}`}
                        onClick={() => setActiveCategory(catKey)}
                      >
                        {catLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available New Modules List */}
                {filteredNewModules.length > 0 ? (
                  <div className="erp-new-modules-list" style={{ maxHeight: '360px' }}>
                    {filteredNewModules.map((m) => {
                      const isSelected = selectedNewModuleIds.includes(m.id);
                      const persianTitle = getModulePersianTitle(m.id, m.title);
                      const monthlyPrice = Number(m.price || 0);
                      const periodPrice = monthlyPrice * billingMultiplier;

                      return (
                        <div 
                          key={m.id} 
                          className={`erp-new-module-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleToggleModule(m.id)}
                        >
                          <div className="erp-new-mod-header">
                            <span className="erp-new-mod-title">{persianTitle}</span>
                            <div className="erp-new-mod-check">
                              {isSelected && <Check size={14} />}
                            </div>
                          </div>
                          <p className="erp-new-mod-desc">{m.description || 'ماژول تخصصی سامانه ابری کارویتا'}</p>
                          <div className="erp-new-mod-footer">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span className="erp-new-mod-price">
                                {periodPrice.toLocaleString('fa-IR')} تومان
                              </span>
                              <small style={{ fontSize: '10.5px', color: '#64748b' }}>
                                ({monthlyPrice.toLocaleString('fa-IR')} ت / ماه × {billingMultiplier})
                              </small>
                            </div>
                            <span className="erp-new-mod-category">
                              {CATEGORY_MAP[m.category] || 'سایر'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="erp-empty-modules-notice">
                    <AlertCircle size={16} />
                    <span>هیچ ماژول جدیدی متناسب با جستجو یا دسته‌بندی انتخابی یافت نشد.</span>
                  </div>
                )}

                {/* Live Proforma Invoice Summary Box */}
                {hasOrderItems ? (
                  <div className="erp-proforma-box">
                    <div className="erp-proforma-head">
                      <h5>
                        <Receipt size={16} />
                        <span>
                          پیش‌فاکتور سفارش 
                          {selectedNewModuleIds.length > 0 && ` (${selectedNewModuleIds.length.toLocaleString('fa-IR')} ماژول جدید)`}
                          {extraUsersCount > 0 && ` (+${extraUsersCount.toLocaleString('fa-IR')} کاربر اضافی)`}
                        </span>
                      </h5>
                      <div className="erp-proforma-chips">
                        {selectedModulesObjects.map(m => (
                          <span key={m.id} className="erp-proforma-chip">
                            ✓ {getModulePersianTitle(m.id, m.title)}
                          </span>
                        ))}
                        {extraUsersCount > 0 && (
                          <span className="erp-proforma-chip" style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#92400e' }}>
                            👥 {extraUsersCount.toLocaleString('fa-IR')} کاربر مازاد
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="erp-proforma-summary-grid">
                      <div className="erp-proforma-stat-item">
                        <span className="erp-proforma-stat-label">تعداد ماژول‌های جدید:</span>
                        <span className="erp-proforma-stat-val">
                          {selectedNewModuleIds.length > 0 
                            ? `${selectedNewModuleIds.length.toLocaleString('fa-IR')} ماژول (${(monthlyModulesSum * billingMultiplier).toLocaleString('fa-IR')} ت)`
                            : '—'}
                        </span>
                      </div>
                      <div className="erp-proforma-stat-item">
                        <span className="erp-proforma-stat-label">ظرفیت کاربران:</span>
                        <span className="erp-proforma-stat-val">
                          {userCount.toLocaleString('fa-IR')} کاربر مجاز
                          {extraUsersCount > 0 && (
                            <small style={{ color: '#2563eb', display: 'block', fontSize: '11px' }}>
                              (+{(extraUsersMonthlyCost * billingMultiplier).toLocaleString('fa-IR')} تومان)
                            </small>
                          )}
                        </span>
                      </div>
                      <div className="erp-proforma-stat-item">
                        <span className="erp-proforma-stat-label">دوره صورت‌حساب:</span>
                        <span className="erp-proforma-stat-val">
                          {currentPeriodConfig.label}
                        </span>
                      </div>
                      <div className="erp-proforma-stat-item">
                        <span className="erp-proforma-stat-label">مبلغ کل فاکتور:</span>
                        <span className="erp-proforma-stat-val" style={{ color: '#0284c7', fontSize: '15px' }}>
                          {finalCalculatedAmount.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>

                    <div className="erp-proforma-actions">
                      <button
                        type="button"
                        className="erp-btn-modal-cancel"
                        style={{ height: '38px', padding: '0 14px', fontSize: '12px' }}
                        onClick={() => {
                          setSelectedNewModuleIds([]);
                          setUserCount(initialUserCount);
                        }}
                      >
                        بازنشانی
                      </button>
                      <button
                        type="button"
                        className="erp-btn-proforma-pay"
                        disabled={isCreatingOrder}
                        onClick={handleCreateInvoiceAndPay}
                      >
                        {isCreatingOrder ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>در حال صدور فاکتور…</span>
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} />
                            <span>صدور پیش‌فاکتور و پرداخت آنلاین</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    جهت صدور پیش‌فاکتور، ماژول‌های مورد نظر خود را انتخاب کنید یا تعداد کاربران را افزایش دهید.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="erp-sub-modal-footer">
            <button type="button" className="erp-btn-modal-cancel" onClick={onClose}>
              بستن پنجره
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              {activeTab === 'overview' ? (
                <>
                  <button 
                    type="button" 
                    className="erp-btn-add-modules"
                    style={{ 
                      padding: '0 18px', 
                      height: '44px', 
                      fontSize: '13px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      borderColor: '#10b981'
                    }}
                    onClick={() => setActiveTab('renew')}
                  >
                    {isTrial ? <ShoppingCart size={15} /> : <RotateCw size={15} />}
                    <span>{isTrial ? 'خرید اشتراک تجاری' : 'تمدید اشتراک (۲ ماه رایگان)'}</span>
                  </button>
                  {!isTrial && availableNewModules.length > 0 && (
                    <button 
                      type="button" 
                      className="erp-btn-add-modules"
                      style={{ padding: '0 18px', height: '44px', fontSize: '13px' }}
                      onClick={() => setActiveTab('buy')}
                    >
                      <Plus size={16} />
                      <span>افزودن ماژول/کاربر</span>
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="erp-btn-modal-primary"
                    onClick={handleOpenErpPortal}
                  >
                    <LogIn size={18} />
                    <span>ورود به پنل شخصی ERP</span>
                  </button>
                </>
              ) : activeTab === 'renew' ? (
                <>
                  <button
                    type="button"
                    className="erp-btn-modal-cancel"
                    onClick={() => setActiveTab('overview')}
                  >
                    بازگشت به مشخصات اشتراک
                  </button>
                  <button 
                    type="button" 
                    className="erp-btn-modal-primary"
                    disabled={isCreatingOrder}
                    onClick={handleRenewSubscriptionAndPay}
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#10b981' }}
                  >
                    {isCreatingOrder ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>در حال صدور فاکتور…</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>پرداخت آنلاین و تمدید ({renewFinalAmount.toLocaleString('fa-IR')} تومان)</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="erp-btn-modal-cancel"
                    onClick={() => setActiveTab('overview')}
                  >
                    بازگشت به مشخصات اشتراک
                  </button>
                  {hasOrderItems && (
                    <button 
                      type="button" 
                      className="erp-btn-modal-primary"
                      disabled={isCreatingOrder}
                      onClick={handleCreateInvoiceAndPay}
                    >
                      {isCreatingOrder ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>در حال صدور فاکتور…</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          <span>پرداخت آنلاین ({finalCalculatedAmount.toLocaleString('fa-IR')} تومان)</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Online Payment & Instant Settlement Modal */}
      {checkoutOrder && (
        <OnlinePaymentModal
          order={checkoutOrder}
          onClose={() => setCheckoutOrder(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
