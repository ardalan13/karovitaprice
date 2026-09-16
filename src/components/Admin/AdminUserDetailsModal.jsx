import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  ShieldCheck,
  Crown,
  Headphones,
  Package,
  CreditCard,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  RefreshCw,
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Settings2,
  Receipt,
  Save,
  Zap,
  Key
} from 'lucide-react';
import { api } from '../../services/api';

export function AdminUserDetailsModal({ userId, onClose, onUserUpdated }) {
  const [activeTab, setActiveTab] = useState('subscriptions'); // 'profile' | 'subscriptions' | 'orders'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Module edit state: { [subId]: { moduleIds: string[], saving: boolean, isOpen: boolean, searchQuery: string } }
  const [subEditState, setSubEditState] = useState({});

  // New subscription modal state
  const [showNewSubForm, setShowNewSubForm] = useState(false);
  const [newSubModules, setNewSubModules] = useState([]);
  const [newSubDuration, setNewSubDuration] = useState(365);
  const [newSubUsers, setNewSubUsers] = useState(5);
  const [newSubPeriod, setNewSubPeriod] = useState('yearly');
  const [creatingSub, setCreatingSub] = useState(false);

  // User Identity & Profile Edit State
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    email: '',
    job_title: '',
    role: 'user',
    can_renew_early: false,
    company_name: '',
    industry: '',
    employee_count: '',
    national_id: '',
    registration_num: '',
    postal_code: '',
    address: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api(`/admin/users/${userId}/details`);
      const payload = res?.data || res;
      if (payload && (payload.user || payload.subscriptions || payload.orders)) {
        setData(payload);

        // Initialize profileForm from returned user & company
        const u = payload.user || {};
        const c = payload.company || u.company || {};
        setProfileForm({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          mobile: u.mobile || '',
          email: u.email || '',
          job_title: u.job_title || '',
          role: u.role || 'user',
          can_renew_early: Boolean(u.can_renew_early),
          company_name: c.company_name || c.name || '',
          industry: c.industry || '',
          employee_count: c.employee_count || '',
          national_id: c.national_id || c.economic_code || '',
          registration_num: c.registration_num || c.registration_number || '',
          postal_code: c.postal_code || '',
          address: c.address || ''
        });

        // Initialize subEditState
        const initialSubState = {};
        if (Array.isArray(payload.subscriptions)) {
          payload.subscriptions.forEach(sub => {
            initialSubState[sub.id] = {
              moduleIds: [...(sub.module_ids || [])],
              saving: false,
              isOpen: false,
              searchQuery: '',
              issueInvoice: true,
              customAmount: '',
            };
          });
        }
        setSubEditState(initialSubState);

        // Pre-select first 4 modules for new sub if empty
        if (payload.all_available_modules && payload.all_available_modules.length > 0) {
          setNewSubModules(payload.all_available_modules.slice(0, 4).map(m => m.id));
        }
      } else {
        setError('خطا در دریافت اطلاعات کاربر');
      }
    } catch (err) {
      setError(err.message || 'خطا در بارگذاری جزئیات کاربر');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModuleInSub = (subId, moduleId) => {
    setSubEditState(prev => {
      const current = prev[subId] || { moduleIds: [] };
      const exists = current.moduleIds.includes(moduleId);
      const updated = exists
        ? current.moduleIds.filter(id => id !== moduleId)
        : [...current.moduleIds, moduleId];

      const sub = data?.subscriptions?.find(s => s.id === subId);
      const originalModules = sub?.module_ids || [];
      const added = updated.filter(id => !originalModules.includes(id));
      
      const allModulesList = data?.all_available_modules || [];
      const newCalcPrice = added.reduce((acc, mId) => {
        const mod = allModulesList.find(x => x.id === mId);
        return acc + (Number(mod?.price) || 0);
      }, 0);

      return {
        ...prev,
        [subId]: {
          ...current,
          moduleIds: updated,
          // Always recalculate amount dynamically based on selected added modules unless user explicitly typed a custom amount and didn't clear it
          customAmount: current.isCustomAmountManuallyOverridden ? current.customAmount : (newCalcPrice > 0 ? newCalcPrice : ''),
        }
      };
    });
  };

  const handleSaveSubModules = async (subId) => {
    const currentState = subEditState[subId];
    if (!currentState) return;

    if (currentState.moduleIds.length === 0) {
      alert('حداقل یک ماژول باید برای اشتراک انتخاب شده باشد.');
      return;
    }

    setSubEditState(prev => ({
      ...prev,
      [subId]: { ...prev[subId], saving: true }
    }));
    setError('');
    setSuccessMsg('');

    try {
      const sub = data?.subscriptions?.find(s => s.id === subId);
      const originalModules = sub?.module_ids || [];
      const added = currentState.moduleIds.filter(id => !originalModules.includes(id));

      const calculatedPrice = added.reduce((acc, mId) => {
        const mod = data?.all_available_modules?.find(x => x.id === mId);
        return acc + (Number(mod?.price) || 0);
      }, 0);

      const invoiceAmount = (currentState.customAmount !== undefined && currentState.customAmount !== '' && Number(currentState.customAmount) > 0)
        ? Number(currentState.customAmount)
        : (calculatedPrice > 0 ? calculatedPrice : 100000);

      const res = await api(`/admin/users/${userId}/subscriptions/${subId}/modules`, {
        method: 'PUT',
        body: JSON.stringify({
          module_ids: currentState.moduleIds,
          issue_invoice: currentState.issueInvoice !== false && added.length > 0,
          invoice_amount: invoiceAmount,
        }),
      });

      setSuccessMsg(res.message || 'ماژول‌های اشتراک با موفقیت ویرایش شدند.');
      await loadUserDetails();
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      setError(err.message || 'خطا در ذخیره تغییرات ماژول‌ها');
    } finally {
      setSubEditState(prev => ({
        ...prev,
        [subId]: { ...prev[subId], saving: false }
      }));
    }
  };

  const handleCreateDirectSubscription = async (e) => {
    e.preventDefault();
    if (newSubModules.length === 0) {
      alert('لطفاً حداقل یک ماژول انتخاب کنید.');
      return;
    }

    setCreatingSub(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api(`/admin/users/${userId}/subscriptions`, {
        method: 'POST',
        body: JSON.stringify({
          module_ids: newSubModules,
          duration_days: newSubDuration,
          user_count: newSubUsers,
          billing_period: newSubPeriod,
        }),
      });

      setSuccessMsg(res.message || 'اشتراک جدید برای کاربر فعال گردید.');
      setShowNewSubForm(false);
      await loadUserDetails();
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      setError(err.message || 'خطا در ایجاد اشتراک');
    } finally {
      setCreatingSub(false);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const cleanDigits = (v) => String(v || '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, '');
    const cleanMobile = cleanDigits(profileForm.mobile);
    const cleanNationalId = cleanDigits(profileForm.national_id);
    const cleanPostalCode = cleanDigits(profileForm.postal_code);

    if (profileForm.mobile && (!/^09\d{9}$/.test(cleanMobile) || cleanMobile.length !== 11)) {
      return setProfileError('شماره همراه باید ۱۱ رقمی باشد و با ۰۹ شروع شود (مثال: ۰۹۱۲۳۴۵۶۷۸۹).');
    }

    if (cleanNationalId && cleanNationalId.length !== 10 && cleanNationalId.length !== 11) {
      return setProfileError('کد ملی باید ۱۰ رقم و شناسه ملی شرکت باید ۱۱ رقم باشد.');
    }

    if (cleanPostalCode && cleanPostalCode.length !== 10) {
      return setProfileError('کد پستی باید ۱۰ رقمی باشد.');
    }

    setSavingProfile(true);
    try {
      const payload = {
        ...profileForm,
        mobile: cleanMobile || profileForm.mobile,
        national_id: cleanNationalId || profileForm.national_id,
        postal_code: cleanPostalCode || profileForm.postal_code,
      };
      const res = await api(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res && res.error) {
        throw new Error(res.message || 'خطا در ذخیره مشخصات کاربر');
      }
      setProfileSuccess(res?.message || 'مشخصات و هویت کاربر با موفقیت ذخیره شد.');

      // Update local data with returned user if present
      if (res?.user) {
        setData(prev => ({
          ...prev,
          user: {
            ...prev?.user,
            ...res.user
          },
          company: res.user.company || prev?.company
        }));
      }

      if (typeof onUserUpdated === 'function') {
        onUserUpdated();
      }

      setTimeout(() => {
        setProfileSuccess('');
      }, 4000);
    } catch (err) {
      setProfileError(err.message || 'خطا در ذخیره مشخصات کاربر');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResetProfile = () => {
    const u = data?.user || {};
    const c = data?.company || u.company || {};
    setProfileForm({
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      mobile: u.mobile || '',
      email: u.email || '',
      job_title: u.job_title || '',
      role: u.role || 'user',
      can_renew_early: Boolean(u.can_renew_early),
      company_name: c.company_name || c.name || '',
      industry: c.industry || '',
      employee_count: c.employee_count || '',
      national_id: c.national_id || c.economic_code || '',
      registration_num: c.registration_num || c.registration_number || '',
      postal_code: c.postal_code || '',
      address: c.address || ''
    });
    setProfileError('');
    setProfileSuccess('');
  };

  const handleDownloadInvoice = (orderOrTxId) => {
    const url = `/api/invoices/${orderOrTxId}`;
    window.open(url, '_blank');
  };

  if (!userId) return null;

  const user = data?.user;
  const subscriptions = data?.subscriptions || [];
  const orders = data?.orders || [];
  const allModules = data?.all_available_modules || [];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        direction: 'rtl',
        fontFamily: 'inherit'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#0870d1',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
              boxShadow: '0 4px 10px rgba(8, 112, 209, 0.25)'
            }}>
              {user?.first_name ? user.first_name[0] : <User size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.mobile || 'اطلاعات و اشتراک کاربر'}
                </h2>
                {user?.is_owner && (
                  <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Crown size={12} color="#b45309" />
                    مالک و مدیر ارشد
                  </span>
                )}
                {user?.role === 'admin' && !user?.is_owner && (
                  <span style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={12} color="#dc2626" />
                    مدیر سیستم
                  </span>
                )}
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b', direction: 'ltr', textAlign: 'right' }}>
                {user?.mobile} {user?.company?.name ? `• شرکت: ${user.company.name}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '0 24px',
          gap: '8px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('subscriptions')}
            style={{
              padding: '13px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'subscriptions' ? '3px solid #0870d1' : '3px solid transparent',
              color: activeTab === 'subscriptions' ? '#0870d1' : '#64748b',
              fontWeight: activeTab === 'subscriptions' ? 800 : 600,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Package size={17} />
            <span>اشتراک‌ها و ماژول‌های ERP</span>
            <span style={{
              background: activeTab === 'subscriptions' ? '#eff6ff' : '#f1f5f9',
              color: activeTab === 'subscriptions' ? '#1d4ed8' : '#64748b',
              padding: '1px 7px',
              borderRadius: '10px',
              fontSize: '11.5px',
              fontWeight: 700
            }}>
              {subscriptions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '13px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'orders' ? '3px solid #0870d1' : '3px solid transparent',
              color: activeTab === 'orders' ? '#0870d1' : '#64748b',
              fontWeight: activeTab === 'orders' ? 800 : 600,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CreditCard size={17} />
            <span>سوابق خرید و پرداخت‌ها</span>
            <span style={{
              background: activeTab === 'orders' ? '#eff6ff' : '#f1f5f9',
              color: activeTab === 'orders' ? '#1d4ed8' : '#64748b',
              padding: '1px 7px',
              borderRadius: '10px',
              fontSize: '11.5px',
              fontWeight: 700
            }}>
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '13px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'profile' ? '3px solid #0870d1' : '3px solid transparent',
              color: activeTab === 'profile' ? '#0870d1' : '#64748b',
              fontWeight: activeTab === 'profile' ? 800 : 600,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <User size={17} />
            <span>شناسنامه و هویت کاربر</span>
          </button>
        </div>

        {/* Alert Notifications */}
        {error && (
          <div style={{
            margin: '16px 24px 0',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            margin: '16px 24px 0',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px', color: '#0870d1' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>در حال بارگذاری اطلاعات اشتراک و خریدها...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: SUBSCRIPTIONS & MODULES */}
              {activeTab === 'subscriptions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Top Action Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                        اشتراک‌های فعال و ماژول‌های منتسب
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                        امکان مشاهده، افزودن، حذف یا تغییر آنی ماژول‌های فعال در پنل ERP کاربر
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowNewSubForm(!showNewSubForm)}
                      style={{
                        background: showNewSubForm ? '#f1f5f9' : '#0870d1',
                        color: showNewSubForm ? '#334155' : '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {showNewSubForm ? <X size={15} /> : <Plus size={15} />}
                      <span>{showNewSubForm ? 'بستن فرم اشتراک جدید' : 'اعطای اشتراک جدید'}</span>
                    </button>
                  </div>

                  {/* New Subscription Form (Expandable) */}
                  {showNewSubForm && (
                    <form onSubmit={handleCreateDirectSubscription} style={{
                      background: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: '14px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0870d1', fontWeight: 700, fontSize: '13.5px' }}>
                        <Sparkles size={18} />
                        <span>ایجاد و فعال‌سازی مستقیم اشتراک سازمانی</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                            مدت اعتبار اشتراک:
                          </label>
                          <select
                            value={newSubDuration}
                            onChange={e => setNewSubDuration(Number(e.target.value))}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            <option value={30}>یک ماهه (۳۰ روز)</option>
                            <option value={90}>سه ماهه (۹۰ روز)</option>
                            <option value={180}>شش ماهه (۱۸۰ روز)</option>
                            <option value={365}>یک ساله (۳۶۵ روز)</option>
                            <option value={730}>دو ساله (۷۳۰ روز)</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                            تعداد کاربران مجاز:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={newSubUsers}
                            onChange={e => setNewSubUsers(Number(e.target.value))}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                            دوره صورت‌حساب:
                          </label>
                          <select
                            value={newSubPeriod}
                            onChange={e => setNewSubPeriod(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            <option value="3_months">۳ ماهه (فصلی - ۹۰ روز)</option>
                            <option value="6_months">۶ ماهه (نیم‌سال - ۱۸۰ روز)</option>
                            <option value="yearly">سالانه (پیش‌فرض - ۳۶۵ روز)</option>
                          </select>
                        </div>
                      </div>

                      {/* Module Selector for New Sub */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          انتخاب ماژول‌های فعال برای اشتراک ({newSubModules.length} ماژول انتخاب شده):
                        </label>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '8px',
                          maxHeight: '180px',
                          overflowY: 'auto',
                          background: '#ffffff',
                          padding: '10px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0'
                        }}>
                          {allModules.map(mod => {
                            const isChecked = newSubModules.includes(mod.id);
                            return (
                              <label
                                key={mod.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: isChecked ? '#eff6ff' : '#f8fafc',
                                  border: isChecked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                                  cursor: 'pointer',
                                  fontSize: '12.5px',
                                  fontWeight: isChecked ? 700 : 500,
                                  color: isChecked ? '#1d4ed8' : '#334155'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setNewSubModules(newSubModules.filter(id => id !== mod.id));
                                    } else {
                                      setNewSubModules([...newSubModules, mod.id]);
                                    }
                                  }}
                                />
                                <span>{mod.title}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setShowNewSubForm(false)}
                          style={{ padding: '7px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          انصراف
                        </button>
                        <button
                          type="submit"
                          disabled={creatingSub}
                          style={{
                            padding: '7px 20px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#0870d1',
                            color: '#ffffff',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: creatingSub ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {creatingSub ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                          <span>تأیید و صدور اشتراک</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Subscriptions List */}
                  {subscriptions.length === 0 ? (
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '36px 20px',
                      textAlign: 'center',
                      color: '#94a3b8'
                    }}>
                      <Package size={36} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#64748b' }}>
                        این کاربر هنوز اشتراک فعالی خریداری یا دریافت نکرده است.
                      </p>
                      <p style={{ margin: '4px 0 14px', fontSize: '12px', color: '#94a3b8' }}>
                        می‌توانید با استفاده از دکمه «اعطای اشتراک جدید» برای این کاربر مستقیماً اشتراک با ماژول‌های دلخواه صادر کنید.
                      </p>
                    </div>
                  ) : (
                    subscriptions.map(sub => {
                      const editState = subEditState[sub.id] || {
                        moduleIds: sub.module_ids || [],
                        saving: false,
                        isOpen: false,
                        searchQuery: '',
                      };
                      const isActive = sub.status === 'active';
                      const isExpired = sub.status === 'expired';

                      return (
                        <div
                          key={sub.id}
                          style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            border: isActive ? '1.5px solid #bfdbfe' : '1px solid #e2e8f0',
                            boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.05)' : 'none',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Subscription Card Header */}
                          <div style={{
                            padding: '16px 20px',
                            background: isActive ? '#f8fbff' : '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>
                                  {sub.title || `اشتراک سازمانی #${sub.id}`}
                                </strong>
                                <select
                                  value={sub.status || 'active'}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    try {
                                      await api('/admin/subscriptions', {
                                        method: 'PUT',
                                        body: JSON.stringify({ id: sub.id, status: newStatus })
                                      });
                                      sub.status = newStatus;
                                      setData({ ...data });
                                    } catch (err) {
                                      alert(err.message || 'خطا در بروزرسانی وضعیت اشتراک');
                                    }
                                  }}
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '11.5px',
                                    borderRadius: '6px',
                                    border: `1px solid ${sub.status === 'cancelled' ? '#fecaca' : sub.status === 'active' ? '#a7f3d0' : '#cbd5e1'}`,
                                    background: sub.status === 'cancelled' ? '#fef2f2' : sub.status === 'active' ? '#ecfdf5' : '#f8fafc',
                                    color: sub.status === 'cancelled' ? '#b91c1c' : sub.status === 'active' ? '#059669' : '#475569',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="active">✓ فعال</option>
                                  <option value="expired">⚠️ منقضی‌شده</option>
                                  <option value="cancelled">❌ لغو شده</option>
                                </select>
                                {sub.source === 'trial' && (
                                  <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                    نسخه آزمایشی
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                                <span>کد اشتراک: <strong style={{ fontFamily: 'monospace' }}>#{sub.id}</strong></span>
                                <span>کاربران مجاز: <strong>{(sub.user_count || 5).toLocaleString('fa-IR')} کاربر</strong></span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <span>دوره:</span>
                                  <select
                                    value={sub.billing_period || '3_months'}
                                    onChange={async (e) => {
                                      const newPeriod = e.target.value;
                                      try {
                                        await api('/admin/subscriptions', {
                                          method: 'PUT',
                                          body: JSON.stringify({ id: sub.id, billing_period: newPeriod })
                                        });
                                        sub.billing_period = newPeriod;
                                        setData({ ...data });
                                      } catch (err) {
                                        alert(err.message || 'خطا در بروزرسانی دوره اشتراک');
                                      }
                                    }}
                                    style={{
                                      padding: '2px 8px',
                                      fontSize: '11.5px',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      background: '#ffffff',
                                      fontWeight: 700,
                                      color: '#0f172a',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <option value="3_months">۳ ماهه (فصلی)</option>
                                    <option value="6_months">۶ ماهه (نیم‌سال)</option>
                                    <option value="yearly">سالانه (۳۶۵ روز)</option>
                                  </select>
                                </span>
                                <span>انقضا: <strong>{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('fa-IR') : '—'}</strong></span>
                              </div>
                            </div>

                            {/* Toggle Edit Modules Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSubEditState(prev => ({
                                  ...prev,
                                  [sub.id]: { ...editState, isOpen: !editState.isOpen }
                                }));
                              }}
                              style={{
                                background: editState.isOpen ? '#eff6ff' : '#ffffff',
                                border: '1px solid #cbd5e1',
                                color: editState.isOpen ? '#1d4ed8' : '#334155',
                                borderRadius: '8px',
                                padding: '6px 14px',
                                fontWeight: 700,
                                fontSize: '12.5px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s'
                              }}
                            >
                              <Settings2 size={15} />
                              <span>{editState.isOpen ? 'بستن پنل ویرایش ماژول‌ها' : 'افزودن / حذف ماژول‌های این اشتراک'}</span>
                              {editState.isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>

                          {/* Currently Active Modules Chips */}
                          <div style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>
                                ماژول‌های فعال در پنل کاربر ({(sub.modules?.length || sub.module_ids?.length || 0).toLocaleString('fa-IR')} ماژول):
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {(sub.modules && sub.modules.length > 0 ? sub.modules : (sub.module_ids || []).map(id => ({ id, title: id }))).map(m => (
                                <div
                                  key={m.id}
                                  style={{
                                    background: '#f0f9ff',
                                    border: '1px solid #bae6fd',
                                    color: '#0369a1',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <CheckCircle2 size={14} color="#0284c7" />
                                  <span>{m.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Expandable Module Manager (Add / Remove Modules) */}
                          {editState.isOpen && (
                            <div style={{
                              padding: '16px 20px',
                              background: '#f8fafc',
                              borderTop: '1px solid #e2e8f0',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                  <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                                    ویرایش ماژول‌های اشتراک #{sub.id}
                                  </strong>
                                  <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                                    با تیک زدن یا برداشتن تیک ماژول‌ها، دسترسی کاربر بلافاصله در ERP تنظیم می‌شود.
                                  </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ position: 'relative' }}>
                                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                      type="text"
                                      placeholder="جستجوی ماژول..."
                                      value={editState.searchQuery || ''}
                                      onChange={e => {
                                        const q = e.target.value;
                                        setSubEditState(prev => ({
                                          ...prev,
                                          [sub.id]: { ...editState, searchQuery: q }
                                        }));
                                      }}
                                      style={{
                                        padding: '5px 28px 5px 8px',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '12px',
                                        width: '140px'
                                      }}
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    disabled={editState.saving}
                                    onClick={() => handleSaveSubModules(sub.id)}
                                    style={{
                                      background: '#0870d1',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '6px 14px',
                                      fontWeight: 700,
                                      fontSize: '12px',
                                      cursor: editState.saving ? 'not-allowed' : 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                  >
                                    {editState.saving ? <RefreshCw size={13} className="spin" /> : <Check size={13} />}
                                    <span>ذخیره تغییرات ماژول‌ها</span>
                                  </button>
                                </div>
                              </div>

                               {/* Modules Checkbox Grid */}
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: '8px',
                                maxHeight: '230px',
                                overflowY: 'auto',
                                background: '#ffffff',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0'
                              }}>
                                {allModules
                                  .filter(m => !editState.searchQuery || m.title.toLowerCase().includes(editState.searchQuery.toLowerCase()))
                                  .map(mod => {
                                    const isChecked = editState.moduleIds.includes(mod.id);
                                    return (
                                      <label
                                        key={mod.id}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          padding: '8px 10px',
                                          borderRadius: '6px',
                                          background: isChecked ? '#eff6ff' : '#ffffff',
                                          border: isChecked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                                          cursor: 'pointer',
                                          fontSize: '12px',
                                          fontWeight: isChecked ? 700 : 500,
                                          color: isChecked ? '#1d4ed8' : '#334155',
                                          transition: 'all 0.1s'
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => handleToggleModuleInSub(sub.id, mod.id)}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{mod.title}</span>
                                            <span style={{ 
                                              fontSize: '10.5px', 
                                              fontWeight: 700, 
                                              color: isChecked ? '#2563eb' : '#059669',
                                              background: isChecked ? '#dbeafe' : '#f0fdf4',
                                              padding: '1px 6px',
                                              borderRadius: '4px',
                                              whiteSpace: 'nowrap'
                                            }}>
                                              {Number(mod.price || 0).toLocaleString('fa-IR')} ت
                                            </span>
                                          </div>
                                          {mod.category && <small style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{mod.category}</small>}
                                        </div>
                                      </label>
                                    );
                                  })}
                              </div>

                              {/* Invoice issuance setting for added modules */}
                              {(() => {
                                const origMods = sub.module_ids || [];
                                const addedMods = (editState.moduleIds || []).filter(id => !origMods.includes(id));
                                const addedModuleObjects = addedMods.map(mId => allModules.find(x => x.id === mId)).filter(Boolean);
                                const calcPrice = addedModuleObjects.reduce((acc, m) => acc + (Number(m.price) || 0), 0);

                                if (addedMods.length === 0) return null;

                                return (
                                  <div style={{
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '10px',
                                    padding: '14px 16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ background: '#2563eb', color: '#ffffff', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          <Receipt size={16} />
                                        </div>
                                        <div>
                                          <strong style={{ fontSize: '13px', color: '#1e40af', display: 'block' }}>
                                            صدور فاکتور برای {addedMods.length} ماژول جدید اضافه‌شده
                                          </strong>
                                          <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#3b82f6' }}>
                                            آیا مایلید برای ماژول‌های اضافه‌شده فاکتور صادر شود تا کاربر در پنل خود پرداخت کند؟
                                          </p>
                                        </div>
                                      </div>

                                      <label style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        background: editState.issueInvoice !== false ? '#dbeafe' : '#ffffff',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: editState.issueInvoice !== false ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                                        fontSize: '12.5px',
                                        fontWeight: 700,
                                        color: editState.issueInvoice !== false ? '#1d4ed8' : '#64748b'
                                      }}>
                                        <input
                                          type="checkbox"
                                          checked={editState.issueInvoice !== false}
                                          onChange={e => {
                                            const val = e.target.checked;
                                            setSubEditState(prev => ({
                                              ...prev,
                                              [sub.id]: {
                                                ...editState,
                                                issueInvoice: val,
                                                customAmount: editState.customAmount || calcPrice
                                              }
                                            }));
                                          }}
                                        />
                                        <span>بله، صدور فاکتور پرداخت</span>
                                      </label>
                                    </div>

                                    {/* Breakdown of added modules with prices */}
                                    <div style={{
                                      background: '#ffffff',
                                      border: '1px solid #dbeafe',
                                      borderRadius: '8px',
                                      padding: '10px 12px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '6px'
                                    }}>
                                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e40af', marginBottom: '2px' }}>
                                        ریز تعرفه ماژول‌های جدید اضافه شده:
                                      </div>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {addedModuleObjects.map(m => (
                                          <span key={m.id} style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            padding: '3px 8px',
                                            fontSize: '11px',
                                            color: '#334155',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}>
                                            <span>{m.title}:</span>
                                            <strong style={{ color: '#059669' }}>{Number(m.price || 0).toLocaleString('fa-IR')} تومان</strong>
                                          </span>
                                        ))}
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>مجموع تعرفه استاندارد ماژول‌ها:</span>
                                        <strong style={{ fontSize: '12.5px', color: '#1d4ed8' }}>{Number(calcPrice).toLocaleString('fa-IR')} تومان</strong>
                                      </div>
                                    </div>

                                    {editState.issueInvoice !== false && (
                                      <div style={{
                                        marginTop: '2px',
                                        paddingTop: '10px',
                                        borderTop: '1px dashed #bfdbfe',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 600 }}>مبلغ نهایی فاکتور:</span>
                                          <input
                                            type="number"
                                            value={editState.customAmount !== undefined && editState.customAmount !== '' ? editState.customAmount : calcPrice}
                                            onChange={e => {
                                              const val = e.target.value;
                                              setSubEditState(prev => ({
                                                ...prev,
                                                [sub.id]: {
                                                  ...editState,
                                                  customAmount: val,
                                                  isCustomAmountManuallyOverridden: true,
                                                }
                                              }));
                                            }}
                                            style={{
                                              padding: '5px 10px',
                                              borderRadius: '6px',
                                              border: '1px solid #60a5fa',
                                              fontSize: '13px',
                                              fontWeight: 800,
                                              width: '140px',
                                              textAlign: 'center',
                                              background: '#ffffff',
                                              color: '#1d4ed8'
                                            }}
                                          />
                                          <span style={{ fontSize: '12px', color: '#1e40af' }}>تومان</span>

                                          {editState.customAmount && Number(editState.customAmount) !== calcPrice && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setSubEditState(prev => ({
                                                  ...prev,
                                                  [sub.id]: {
                                                    ...editState,
                                                    customAmount: calcPrice,
                                                    isCustomAmountManuallyOverridden: false,
                                                  }
                                                }));
                                              }}
                                              style={{
                                                background: '#dbeafe',
                                                border: '1px solid #93c5fd',
                                                borderRadius: '6px',
                                                padding: '4px 8px',
                                                fontSize: '11px',
                                                color: '#1e40af',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                              }}
                                              title="تنظیم مجدد به مجموع استاندارد ماژول‌ها"
                                            >
                                              محاسبه خودکار
                                            </button>
                                          )}
                                        </div>

                                        <div style={{ fontSize: '11.5px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                          <Sparkles size={13} />
                                          <span>بج نوتیفیکیشن در بخش «پرداخت‌ها»ی پنل کاربر فعال شده و دکمه پرداخت آنلاین قرار می‌گیرد.</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748b' }}>
                                <span>تعداد ماژول‌های فعال انتخاب‌شده: <strong>{editState.moduleIds.length}</strong></span>
                                <span style={{ color: '#059669' }}>تغییرات پس از کلیک روی «ذخیره تغییرات ماژول‌ها» اعمال می‌شود.</span>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}

                </div>
              )}

              {/* TAB 2: ORDERS & INVOICES */}
              {activeTab === 'orders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                        سوابق خرید، پرداخت‌ها و فاکتورهای رسمی
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                        فهرست تراکنش‌های بانکی، شماره سفارش‌ها و دریافت فاکتور با ارزش استناد مالی
                      </p>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '36px 20px',
                      textAlign: 'center',
                      color: '#94a3b8'
                    }}>
                      <CreditCard size={36} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#64748b' }}>
                        هیچ سفارش یا فاکتور خریدی برای این کاربر ثبت نشده است.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {orders.map(order => {
                        const isPaid = order.status === 'completed' || order.status === 'successful' || order.transaction?.status === 'successful';
                        const amount = order.amount || order.transaction?.amount || 0;

                        return (
                          <div
                            key={order.id}
                            style={{
                              background: '#ffffff',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              padding: '16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: isPaid ? '#ecfdf5' : '#fff7ed',
                                color: isPaid ? '#059669' : '#ea580c',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <FileText size={20} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong style={{ fontSize: '14px', color: '#0f172a', fontFamily: 'monospace', direction: 'ltr' }}>
                                    {order.order_number || `ORD-${order.id}`}
                                  </strong>
                                  <select
                                    value={order.status === 'completed' || order.status === 'paid' ? 'paid' : order.status}
                                    onChange={async (e) => {
                                      const targetStatus = e.target.value;
                                      const ref = targetStatus === 'paid' ? `MAN-${Date.now().toString().slice(-8)}` : null;
                                      try {
                                        await api(`/admin/orders/${order.id}`, {
                                          method: 'PUT',
                                          body: JSON.stringify({ status: targetStatus, reference_id: ref })
                                        });
                                        fetchUserDetails();
                                      } catch (err) {
                                        alert(err.message || 'خطا در تغییر وضعیت سفارش');
                                      }
                                    }}
                                    style={{
                                      background: isPaid ? '#ecfdf5' : '#fff7ed',
                                      color: isPaid ? '#059669' : '#c2410c',
                                      border: `1.5px solid ${isPaid ? '#a7f3d0' : '#fed7aa'}`,
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                    title="تغییر وضعیت پرداخت فاکتور"
                                  >
                                    <option value="paid">پرداخت شده و فعال</option>
                                    <option value="pending">در انتظار پرداخت</option>
                                    <option value="cancelled">لغو شده</option>
                                    <option value="failed">ناموفق</option>
                                    <option value="refunded">مسترد شده</option>
                                  </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                                  <span>سرویس: <strong>{order.package_name}</strong></span>
                                  <span>تاریخ: <strong>{order.created_at ? new Date(order.created_at).toLocaleDateString('fa-IR') : '—'}</strong></span>
                                  {order.transaction?.reference_id && (
                                    <span>کد پیگیری: <strong style={{ fontFamily: 'monospace' }}>{order.transaction.reference_id}</strong></span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ textAlign: 'left' }}>
                                <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>مبلغ پرداختی:</span>
                                <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                                  {Number(amount).toLocaleString('fa-IR')} <small style={{ fontSize: '11px', fontWeight: 'normal' }}>تومان</small>
                                </strong>
                              </div>

                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadInvoice(order.id)}
                                  style={{
                                    background: '#0870d1',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '7px 12px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                  title="مشاهده، چاپ و دریافت PDF فاکتور رسمی استاندارد دارایی"
                                >
                                  <Download size={14} />
                                  <span>فاکتور دارایی (PDF)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => window.open(`/api/invoices/${order.id}/contract`, '_blank')}
                                  style={{
                                    background: '#f8fafc',
                                    color: '#334155',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    padding: '7px 10px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                  title="مشاهده و دریافت قرارداد رسمی لایسنس و SLA"
                                >
                                  <FileText size={14} />
                                  <span>قرارداد رسمی (PDF)</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: USER PROFILE & IDENTITY EDITABLE FORM */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Status Banners */}
                  {profileSuccess && (
                    <div style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#065f46',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 700
                    }}>
                      <CheckCircle2 size={18} color="#059669" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  {profileError && (
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 700
                    }}>
                      <AlertCircle size={18} color="#dc2626" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  {/* 1. مشخصات فردی و تماس */}
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <User size={18} color="#0870d1" />
                      <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                        مشخصات فردی و حساب کاربری
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '13px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          نام:
                        </label>
                        <input
                          type="text"
                          value={profileForm.first_name}
                          onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                          placeholder="مثلاً علی"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          نام خانوادگی:
                        </label>
                        <input
                          type="text"
                          value={profileForm.last_name}
                          onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                          placeholder="مثلاً رضایی"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          شماره همراه:
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={profileForm.mobile}
                          onChange={e => setProfileForm(p => ({ ...p, mobile: e.target.value }))}
                          placeholder="09123456789"
                          maxLength={11}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          آدرس ایمیل:
                        </label>
                        <input
                          type="email"
                          dir="ltr"
                          value={profileForm.email}
                          onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="name@company.com"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          سمت سازمانی:
                        </label>
                        <input
                          type="text"
                          value={profileForm.job_title}
                          onChange={e => setProfileForm(p => ({ ...p, job_title: e.target.value }))}
                          placeholder="مثلاً مدیرعامل / مدیر مالی"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          سطح دسترسی (نقش):
                        </label>
                        <select
                          value={profileForm.role}
                          disabled={user?.mobile === '09111273476' || user?.is_owner}
                          onChange={e => setProfileForm(p => ({ ...p, role: e.target.value }))}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            background: (user?.mobile === '09111273476' || user?.is_owner) ? '#f8fafc' : '#ffffff',
                            cursor: (user?.mobile === '09111273476' || user?.is_owner) ? 'not-allowed' : 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="user">کاربر عادی (مشتری)</option>
                          <option value="support">کارشناس پشتیبانی (Support)</option>
                          <option value="admin">مدیر سیستم (Admin)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px' }}>
                      <span>تاریخ عضویت در سامانه:</span>
                      <strong style={{ color: '#334155' }}>{user?.created_at ? new Date(user.created_at).toLocaleDateString('fa-IR') : '—'}</strong>
                    </div>
                  </div>

                  {/* 2. مجوز ویژه: فعال‌سازی زودهنگام باکس تمدید اشتراک */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%)',
                    borderRadius: '14px',
                    border: '1.5px solid #0284c7',
                    padding: '18px 20px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '640px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: profileForm.can_renew_early ? '#0284c7' : '#94a3b8',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: profileForm.can_renew_early ? '0 3px 10px rgba(2, 132, 199, 0.3)' : 'none',
                          transition: 'all 0.2s ease'
                        }}>
                          <Zap size={20} />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                            مجوز تمدید زودهنگام اشتراک توسط کاربر
                          </h4>
                          <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: 1.55 }}>
                            باکس نحوه تمدید اشتراک به طور خودکار فقط زمانی فعال می‌شود که ۱ ماه (۳۰ روز) از اشتراک کاربر باقی مانده باشد.
                            با <strong>فعال‌سازی این گزینه</strong>، کاربر مجاز می‌شود حتی زودتر از ۱ ماه باقی‌مانده، باکس تمدید و روش‌های پرداخت را مشاهده کرده و سرویس خود را پیش از موعد تمدید یا ارتقا دهد.
                          </p>
                        </div>
                      </div>

                      {/* Switch toggle */}
                      <button
                        type="button"
                        onClick={() => setProfileForm(p => ({ ...p, can_renew_early: !p.can_renew_early }))}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: profileForm.can_renew_early ? '#0284c7' : '#e2e8f0',
                          color: profileForm.can_renew_early ? '#ffffff' : '#475569',
                          border: 'none',
                          borderRadius: '30px',
                          padding: '8px 18px',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: profileForm.can_renew_early ? '0 3px 10px rgba(2, 132, 199, 0.35)' : 'none'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: profileForm.can_renew_early ? 'scale(1)' : 'scale(0.85)',
                          transition: 'all 0.2s ease'
                        }}>
                          {profileForm.can_renew_early ? <Check size={13} color="#0284c7" /> : <X size={13} color="#94a3b8" />}
                        </div>
                        <span>{profileForm.can_renew_early ? 'تمدید زودهنگام فعال است' : 'تمدید زودهنگام غیرفعال'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. اطلاعات شرکت و کسب‌وکار */}
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <Building2 size={18} color="#0870d1" />
                      <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                        اطلاعات شرکت و کسب‌وکار
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '13px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          نام شرکت / برند:
                        </label>
                        <input
                          type="text"
                          value={profileForm.company_name}
                          onChange={e => setProfileForm(p => ({ ...p, company_name: e.target.value }))}
                          placeholder="مثلاً شرکت تجارت نوین کارویتا"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          صنعت / رسته فعالیت:
                        </label>
                        <input
                          type="text"
                          value={profileForm.industry}
                          onChange={e => setProfileForm(p => ({ ...p, industry: e.target.value }))}
                          placeholder="مثلاً فناوری اطلاعات و تجارت الکترونیک"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          تعداد پرسنل:
                        </label>
                        <input
                          type="text"
                          value={profileForm.employee_count}
                          onChange={e => setProfileForm(p => ({ ...p, employee_count: e.target.value }))}
                          placeholder="مثلاً ۱۰ تا ۵۰ نفر"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          شناسه ملی شرکت (۱۱ رقم) / کد ملی (۱۰ رقم):
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={profileForm.national_id}
                          onChange={e => setProfileForm(p => ({ ...p, national_id: e.target.value }))}
                          placeholder="کد ملی ۱۰ رقمی یا شناسه ملی ۱۱ رقمی"
                          maxLength={11}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          شماره ثبت شرکت:
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={profileForm.registration_num}
                          onChange={e => setProfileForm(p => ({ ...p, registration_num: e.target.value }))}
                          placeholder="مثلاً ۱۲۳۴۵۶"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          کد پستی ۱۰ رقمی:
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={profileForm.postal_code}
                          onChange={e => setProfileForm(p => ({ ...p, postal_code: e.target.value }))}
                          placeholder="مثلاً ۱۹۸۵۷۱۴۱۱۱"
                          maxLength={10}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                          نشانی اقامتگاه قانونی شرکت:
                        </label>
                        <textarea
                          rows={2}
                          value={profileForm.address}
                          onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                          placeholder="آدرس دقیق استان، شهر، خیابان، پلاک، واحد..."
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            outline: 'none',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    paddingTop: '6px'
                  }}>
                    <button
                      type="button"
                      onClick={handleResetProfile}
                      disabled={savingProfile}
                      style={{
                        padding: '9px 18px',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>بازنشانی مقادیر</span>
                    </button>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      style={{
                        padding: '10px 24px',
                        background: 'linear-gradient(135deg, #0870d1 0%, #0284c7 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: savingProfile ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 3px 12px rgba(8, 112, 209, 0.28)',
                        opacity: savingProfile ? 0.75 : 1
                      }}
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                          <span>در حال ذخیره تغییرات...</span>
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          <span>ذخیره تغییرات هویت و دسترسی کاربر</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            شناسه داخلی کاربر: <strong style={{ fontFamily: 'monospace' }}>#{userId}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#0870d1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 22px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
}
