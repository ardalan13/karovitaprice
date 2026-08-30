import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  DollarSign, 
  Users, 
  Calendar, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Sliders, 
  Tag, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles,
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';

const money = n => Number(n || 0).toLocaleString('fa-IR') + ' تومان';

export function ERPAdminPricingManagement({ onOpenAddTabModal, refreshTrigger }) {
  const [activeSubTab, setActiveSubTab] = useState('presets'); // 'presets' | 'modules' | 'settings' | 'coupons'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Tab/Preset Modal State
  const [tabModalOpen, setTabModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [tabForm, setTabForm] = useState({ id: '', title: '', default_modules: [] });
  
  // Module Modal State (for both Add and Edit)
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null); // null = create new, object = edit existing
  const [moduleForm, setModuleForm] = useState({
    id: '',
    title: '',
    price: 250000,
    is_active: true,
    dependencies: [],
    add_to_presets: [],
  });
  const [moduleSearch, setModuleSearch] = useState('');
  
  // Global Settings State
  const [settingsForm, setSettingsForm] = useState({
    base_user_limit: 5,
    extra_user_price: 200000,
    yearly_multiplier: 10,
    step_users_enabled: true,
    step_modules_enabled: true,
  });
  
  // Coupon Modal State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: 20,
    min_order_amount: '',
    is_active: true,
  });

  // Quick module price inline edit state
  const [inlinePrices, setInlinePrices] = useState({});
  const [savingModuleId, setSavingModuleId] = useState(null);

  // Load all ERP configurator data
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api('/admin/erp/modules');
      setData(res);
      if (res.settings) {
        setSettingsForm({
          base_user_limit: res.settings.base_user_limit || 5,
          extra_user_price: res.settings.extra_user_price || 200000,
          yearly_multiplier: res.settings.yearly_multiplier || 10,
          step_users_enabled: res.settings.step_users_enabled ?? true,
          step_modules_enabled: res.settings.step_modules_enabled ?? true,
        });
      }
      // initialize inline prices map
      if (res.modules && Array.isArray(res.modules)) {
        const prices = {};
        res.modules.forEach(m => {
          prices[m.id] = m.price;
        });
        setInlinePrices(prices);
      }
    } catch (err) {
      setError(err.message || 'خطا در بارگذاری اطلاعات سیستم قیمت‌گذاری');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // -------------------------------------------------------------
  // Preset / Tab Handlers
  // -------------------------------------------------------------
  const openNewTabModal = () => {
    setEditingPreset(null);
    setTabForm({
      id: `tab_${Date.now()}`,
      title: '',
      default_modules: ['crm', 'sale'],
    });
    setTabModalOpen(true);
  };

  const openEditTabModal = (preset) => {
    setEditingPreset(preset);
    setTabForm({
      id: preset.id,
      title: preset.title,
      default_modules: [...(preset.default_modules || [])],
    });
    setTabModalOpen(true);
  };

  const toggleModuleInTabForm = (modId) => {
    setTabForm(prev => {
      const current = prev.default_modules || [];
      if (current.includes(modId)) {
        return { ...prev, default_modules: current.filter(id => id !== modId) };
      } else {
        return { ...prev, default_modules: [...current, modId] };
      }
    });
  };

  const selectAllModulesForTab = () => {
    if (!data?.modules) return;
    setTabForm(prev => ({
      ...prev,
      default_modules: data.modules.map(m => m.id),
    }));
  };

  const clearAllModulesForTab = () => {
    setTabForm(prev => ({ ...prev, default_modules: [] }));
  };

  const handleSaveTab = async (e) => {
    e.preventDefault();
    if (!tabForm.title.trim()) {
      alert('لطفاً عنوان تب را وارد کنید.');
      return;
    }
    try {
      await api('/admin/erp/presets', {
        method: 'POST',
        body: JSON.stringify(tabForm),
      });
      setTabModalOpen(false);
      showSuccess('تب جدید با موفقیت ذخیره و در سیستم قیمت‌گذاری اعمال شد.');
      loadData();
    } catch (err) {
      alert(err.message || 'خطا در ذخیره تب');
    }
  };

  const handleDeleteTab = async (presetId, presetTitle) => {
    if (!window.confirm(`آیا از حذف تب «${presetTitle}» اطمینان دارید؟`)) return;
    try {
      await api(`/admin/erp/presets/${presetId}`, { method: 'DELETE' });
      showSuccess(`تب «${presetTitle}» با موفقیت حذف شد.`);
      loadData();
    } catch (err) {
      alert(err.message || 'خطا در حذف تب');
    }
  };

  // -------------------------------------------------------------
  // Module Handlers (Add, Edit, Inline Price, Delete, Toggle)
  // -------------------------------------------------------------
  const openNewModuleModal = () => {
    setEditingModule(null);
    setModuleForm({
      id: `module_${Date.now()}`,
      title: '',
      price: 250000,
      is_active: true,
      dependencies: [],
      add_to_presets: [],
    });
    setModuleModalOpen(true);
  };

  const openEditModuleModal = (mod) => {
    setEditingModule(mod);
    // Find which presets currently have this module
    const currentPresets = (data?.presets || [])
      .filter(p => (p.default_modules || []).includes(mod.id))
      .map(p => p.id);

    setModuleForm({
      id: mod.id,
      title: mod.title,
      price: mod.price,
      is_active: mod.is_active !== false,
      dependencies: mod.dependencies || [],
      add_to_presets: currentPresets,
    });
    setModuleModalOpen(true);
  };

  const toggleDependencyInForm = (depId) => {
    setModuleForm(prev => {
      const current = prev.dependencies || [];
      if (current.includes(depId)) {
        return { ...prev, dependencies: current.filter(id => id !== depId) };
      } else {
        return { ...prev, dependencies: [...current, depId] };
      }
    });
  };

  const togglePresetInModuleForm = (presetId) => {
    setModuleForm(prev => {
      const current = prev.add_to_presets || [];
      if (current.includes(presetId)) {
        return { ...prev, add_to_presets: current.filter(id => id !== presetId) };
      } else {
        return { ...prev, add_to_presets: [...current, presetId] };
      }
    });
  };

  const handleSaveInlinePrice = async (moduleId) => {
    const newPrice = Number(inlinePrices[moduleId]);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('مبلغ وارد شده معتبر نیست.');
      return;
    }
    const targetModule = data?.modules?.find(m => m.id === moduleId);
    if (!targetModule) return;

    setSavingModuleId(moduleId);
    try {
      await api('/admin/erp/modules', {
        method: 'POST',
        body: JSON.stringify({
          ...targetModule,
          price: newPrice,
        }),
      });
      showSuccess(`قیمت ماژول «${targetModule.title}» بروزرسانی شد.`);
      loadData();
    } catch (err) {
      alert(err.message || 'خطا در بروزرسانی قیمت');
    } finally {
      setSavingModuleId(null);
    }
  };

  const handleToggleModuleActive = async (mod) => {
    try {
      await api(`/admin/erp/modules/${mod.id}/toggle`, { method: 'POST' });
      showSuccess(`وضعیت ماژول «${mod.title}» تغییر کرد.`);
      loadData();
    } catch (err) {
      alert(err.message || 'خطا در تغییر وضعیت ماژول');
    }
  };

  const handleDeleteModule = async (mod) => {
    if (!window.confirm(`آیا از حذف کامل ماژول «${mod.title}» اطمینان دارید؟ این ماژول از تمامی تب‌ها و وابستگی‌های سیستم نیز حذف خواهد شد.`)) return;
    try {
      await api(`/admin/erp/modules/${mod.id}`, { method: 'DELETE' });
      showSuccess(`ماژول «${mod.title}» با موفقیت حذف گردید.`);
      loadData();
    } catch (err) {
      alert(err.message || 'خطا در حذف ماژول');
    }
  };

  const handleSaveModuleModal = async (e) => {
    e.preventDefault();
    if (!moduleForm.title.trim() || Number(moduleForm.price) < 0) {
      alert('لطفاً عنوان و مبلغ ماژول را وارد کنید.');
      return;
    }
    if (!moduleForm.id.trim()) {
      alert('شناسه یکتای ماژول الزامی است.');
      return;
    }

    try {
      await api('/admin/erp/modules', {
        method: 'POST',
        body: JSON.stringify({
          id: moduleForm.id.trim().toLowerCase().replace(/\s+/g, '_'),
          title: moduleForm.title.trim(),
          price: Number(moduleForm.price),
          is_active: moduleForm.is_active,
          dependencies: moduleForm.dependencies,
          add_to_presets: moduleForm.add_to_presets,
        }),
      });
      setModuleModalOpen(false);
      showSuccess(editingModule ? 'مشخصات ماژول با موفقیت بروزرسانی شد.' : 'ماژول جدید با موفقیت به سیستم اضافه گردید.');
      loadData();
    } catch (err) {
      alert(err.message || 'خطا در ذخیره ماژول');
    }
  };

  // -------------------------------------------------------------
  // Settings Handlers
  // -------------------------------------------------------------
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/erp/settings', {
        method: 'POST',
        body: JSON.stringify({
          base_user_limit: Number(settingsForm.base_user_limit),
          extra_user_price: Number(settingsForm.extra_user_price),
          yearly_multiplier: Number(settingsForm.yearly_multiplier),
          step_users_enabled: !!settingsForm.step_users_enabled,
          step_modules_enabled: !!settingsForm.step_modules_enabled,
        }),
      });
      showSuccess('تنظیمات سراسری سیستم قیمت‌گذاری با موفقیت ذخیره گردید.');
      loadData();
    } catch (err) {
      alert(err.message || 'خطا در ذخیره تنظیمات');
    }
  };

  // -------------------------------------------------------------
  // Coupons Handlers
  // -------------------------------------------------------------
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim() || !couponForm.discount_value) {
      alert('اطلاعات کد تخفیف را کامل کنید.');
      return;
    }
    try {
      await api('/admin/erp/coupons', {
        method: 'POST',
        body: JSON.stringify(couponForm),
      });
      setCouponModalOpen(false);
      showSuccess('کد تخفیف با موفقیت ذخیره شد.');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCoupon = async (code) => {
    if (!window.confirm(`آیا از حذف کد تخفیف ${code} اطمینان دارید؟`)) return;
    try {
      await api(`/admin/erp/coupons/${code}`, { method: 'DELETE' });
      showSuccess('کد تخفیف حذف شد.');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="erp-admin-loading">
        <RefreshCw className="animate-spin" size={24} color="#0870d1" />
        <span>در حال بارگذاری سیستم قیمت‌گذاری و ماژول‌ها...</span>
      </div>
    );
  }

  const filteredModules = (data?.modules || []).filter(m => 
    m.title.toLowerCase().includes(moduleSearch.toLowerCase()) || 
    m.id.toLowerCase().includes(moduleSearch.toLowerCase())
  );

  return (
    <div className="erp-admin-pricing-container" dir="rtl">
      {/* Alert Banners */}
      {successMsg && (
        <div className="erp-admin-toast success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="erp-admin-toast error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Sub-Navigation Header */}
      <div className="erp-admin-subnav">
        <div className="erp-admin-tabs">
          <button 
            type="button"
            className={`erp-admin-tab-btn ${activeSubTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('presets')}
          >
            <Layers size={16} />
            <span>مدیریت تب‌ها و صنف‌ها (Presets)</span>
            <span className="badge">{data?.presets?.length || 0}</span>
          </button>

          <button 
            type="button"
            className={`erp-admin-tab-btn ${activeSubTab === 'modules' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('modules')}
          >
            <DollarSign size={16} />
            <span>قیمت و تعریف ماژول‌ها (ERP Modules)</span>
            <span className="badge">{data?.modules?.length || 0}</span>
          </button>

          <button 
            type="button"
            className={`erp-admin-tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('settings')}
          >
            <Sliders size={16} />
            <span>تنظیمات پایه سیستم و کاربران</span>
          </button>

          <button 
            type="button"
            className={`erp-admin-tab-btn ${activeSubTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('coupons')}
          >
            <Tag size={16} />
            <span>کدهای تخفیف</span>
            <span className="badge">{data?.coupons?.length || 0}</span>
          </button>
        </div>

        {activeSubTab === 'presets' && (
          <button type="button" className="btn-add-tab-action" onClick={openNewTabModal}>
            <Plus size={16} />
            <span>افزودن تب جدید</span>
          </button>
        )}

        {activeSubTab === 'modules' && (
          <button type="button" className="btn-add-tab-action btn-add-module" onClick={openNewModuleModal}>
            <Plus size={16} />
            <span>افزودن ماژول جدید</span>
          </button>
        )}

        {activeSubTab === 'coupons' && (
          <button type="button" className="btn-add-tab-action" onClick={() => {
            setCouponForm({ code: '', discount_type: 'percent', discount_value: 20, min_order_amount: '', is_active: true });
            setCouponModalOpen(true);
          }}>
            <Plus size={16} />
            <span>افزودن کد تخفیف جدید</span>
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. PRESETS / TABS MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'presets' && (
        <div className="erp-admin-section">
          <div className="erp-admin-intro-box">
            <Info size={20} color="#0870d1" />
            <div>
              <strong>نحوه عملکرد تب‌ها در صفحه قیمت‌گذاری کاربر:</strong>
              <p>هر تب نشان‌دهنده یک صنف یا پکیج پیشنهادی است. با انتخاب هر تب توسط کاربر در صفحه قیمت‌گذاری، ماژول‌های انتخابی ادمین برای آن تب به صورت پیش‌فرض فعال شده و هزینه لحظه‌ای محاسبه می‌شود.</p>
            </div>
          </div>

          <div className="erp-admin-presets-grid">
            {(data?.presets || []).map((preset, index) => {
              const assignedModules = (preset.default_modules || []).map(id => {
                const found = data?.modules?.find(m => m.id === id);
                return found ? found.title : id;
              });

              return (
                <article key={preset.id} className="erp-admin-preset-card">
                  <div className="preset-card-head">
                    <div className="preset-title-wrap">
                      <span className="preset-index-badge">{index + 1}</span>
                      <h3>{preset.title}</h3>
                    </div>
                    <div className="preset-card-actions">
                      <button 
                        type="button" 
                        className="btn-icon-action edit"
                        title="ویرایش تب و ماژول‌ها"
                        onClick={() => openEditTabModal(preset)}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        type="button" 
                        className="btn-icon-action delete"
                        title="حذف تب"
                        onClick={() => handleDeleteTab(preset.id, preset.title)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="preset-card-body">
                    <div className="preset-slug-tag">شناسه تب: <code>{preset.id}</code></div>
                    <div className="preset-modules-summary">
                      <span className="label">ماژول‌های پیش‌فرض ({assignedModules.length} ماژول):</span>
                      <div className="preset-chips-wrap">
                        {assignedModules.map((name, i) => (
                          <span key={i} className="module-pill-tag">
                            <Check size={11} />
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="preset-card-foot">
                    <button 
                      type="button" 
                      className="btn-edit-preset-full"
                      onClick={() => openEditTabModal(preset)}
                    >
                      <Edit3 size={14} />
                      <span>ویرایش ماژول‌های این تب</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MODULES PRICING & CREATION MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'modules' && (
        <div className="erp-admin-section">
          <div className="erp-admin-modules-topbar">
            <div className="search-wrap">
              <Search size={16} color="#64748b" />
              <input 
                type="text" 
                placeholder="جستجو بر اساس نام یا شناسه ماژول..."
                value={moduleSearch}
                onChange={e => setModuleSearch(e.target.value)}
              />
              {moduleSearch && (
                <button className="btn-clear" onClick={() => setModuleSearch('')}><X size={14} /></button>
              )}
            </div>

            <div className="modules-topbar-actions">
              <div className="module-stats-badge">
                <span>تعداد کل ماژول‌ها: <strong>{data?.modules?.length || 0} ماژول</strong></span>
              </div>
              <button type="button" className="btn-add-module-inner" onClick={openNewModuleModal}>
                <Plus size={15} />
                <span>افزودن ماژول جدید</span>
              </button>
            </div>
          </div>

          <div className="erp-admin-table-wrap">
            <table className="erp-admin-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>#</th>
                  <th>نام ماژول ERP</th>
                  <th>شناسه یکتا</th>
                  <th>پیش‌نیازها</th>
                  <th style={{ width: '220px' }}>قیمت ماهانه (تومان)</th>
                  <th style={{ width: '100px' }}>وضعیت</th>
                  <th style={{ width: '120px' }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredModules.map((mod, idx) => {
                  const isSaving = savingModuleId === mod.id;
                  const currentInlineVal = inlinePrices[mod.id] !== undefined ? inlinePrices[mod.id] : mod.price;
                  const isModified = Number(currentInlineVal) !== Number(mod.price);

                  return (
                    <tr key={mod.id} className={mod.is_active === false ? 'row-inactive' : ''}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="module-title-cell">
                          <strong>{mod.title}</strong>
                          {mod.dependencies && mod.dependencies.length > 0 && (
                            <span className="dep-notice">وابسته به {mod.dependencies.join(', ')}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <code className="slug-code">{mod.id}</code>
                      </td>
                      <td>
                        {mod.dependencies && mod.dependencies.length > 0 ? (
                          <div className="dep-chips">
                            {mod.dependencies.map(d => {
                              const foundDep = data?.modules?.find(m => m.id === d);
                              return (
                                <span key={d} className="dep-pill">
                                  {foundDep ? foundDep.title : d}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>مستقل</span>
                        )}
                      </td>
                      <td>
                        <div className="price-input-row">
                          <input 
                            type="number"
                            step="10000"
                            min="0"
                            className={`price-input ${isModified ? 'price-changed' : ''}`}
                            value={currentInlineVal}
                            onChange={e => setInlinePrices({ ...inlinePrices, [mod.id]: e.target.value })}
                          />
                          {isModified && (
                            <button 
                              type="button" 
                              className="btn-save-inline-price"
                              disabled={isSaving}
                              onClick={() => handleSaveInlinePrice(mod.id)}
                              title="ذخیره قیمت جدید"
                            >
                              {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                              <span>ذخیره</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${mod.is_active !== false ? 'active' : 'inactive'}`}>
                          {mod.is_active !== false ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td>
                        <div className="table-row-actions">
                          <button 
                            type="button" 
                            className="btn-action-small edit" 
                            title="ویرایش کامل مشخصات"
                            onClick={() => openEditModuleModal(mod)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            type="button" 
                            className={`btn-action-small toggle ${mod.is_active !== false ? 'deactivate' : 'activate'}`}
                            title={mod.is_active !== false ? 'غیرفعال کردن ماژول' : 'فعال کردن ماژول'}
                            onClick={() => handleToggleModuleActive(mod)}
                          >
                            {mod.is_active !== false ? <X size={14} /> : <Check size={14} />}
                          </button>
                          <button 
                            type="button" 
                            className="btn-action-small delete" 
                            title="حذف کامل ماژول"
                            onClick={() => handleDeleteModule(mod)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. GLOBAL SYSTEM & USERS SETTINGS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'settings' && (
        <div className="erp-admin-section">
          <form onSubmit={handleSaveSettings} className="erp-admin-settings-card">
            <div className="settings-header">
              <Sliders size={20} color="#0870d1" />
              <div>
                <h3>تنظیمات سیستم قیمت‌گذاری و کاربران ERP</h3>
                <p>این تنظیمات به صورت سراسری بر روی محاسبات لحظه‌ای صورتحساب کاربران اعمال می‌گردد.</p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="form-group">
                <label>
                  <Users size={16} />
                  <span>تعداد کاربران پایه رایگان:</span>
                </label>
                <input 
                  type="number"
                  min="1"
                  max="100"
                  value={settingsForm.base_user_limit}
                  onChange={e => setSettingsForm({ ...settingsForm, base_user_limit: Number(e.target.value) })}
                  required
                />
                <small className="help-text">تعداد کاربرانی که در قیمت پایه ماژول‌ها محاسبه شده و هزینه اضافی ندارند (پیش‌فرض: ۵ کاربر).</small>
              </div>

              <div className="form-group">
                <label>
                  <DollarSign size={16} />
                  <span>هزینه به ازای هر کاربر اضافه (ماهانه):</span>
                </label>
                <div className="input-with-unit">
                  <input 
                    type="number"
                    step="10000"
                    min="0"
                    value={settingsForm.extra_user_price}
                    onChange={e => setSettingsForm({ ...settingsForm, extra_user_price: Number(e.target.value) })}
                    required
                  />
                  <span className="unit">تومان / کاربر</span>
                </div>
                <small className="help-text">مبلغی که به ازای هر کاربر مازاد بر ظرفیت پایه به هزینه ماهانه افزوده می‌شود (پیش‌فرض: ۲۰۰,۰۰۰ تومان).</small>
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={16} />
                  <span>تعداد ماه‌های محاسبه اشتراک سالانه:</span>
                </label>
                <div className="input-with-unit">
                  <input 
                    type="number"
                    min="1"
                    max="12"
                    step="0.5"
                    value={settingsForm.yearly_multiplier}
                    onChange={e => setSettingsForm({ ...settingsForm, yearly_multiplier: Number(e.target.value) })}
                    required
                  />
                  <span className="unit">ماه (از ۱۲ ماه)</span>
                </div>
                <small className="help-text">برای تخفیف سالانه؛ مثلاً عدد ۱۰ یعنی پرداخت ۱۰ ماه به ازای ۱۲ ماه استفاده (۲ ماه رایگان / ۱۶.۶٪ تخفیف).</small>
              </div>
            </div>

            <div className="settings-card-foot">
              <button type="submit" className="btn-primary-save">
                <Save size={16} />
                <span>ذخیره تنظیمات سیستم قیمت‌گذاری</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. COUPONS MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'coupons' && (
        <div className="erp-admin-section">
          <div className="erp-admin-coupons-grid">
            {(data?.coupons || []).map(coupon => (
              <div key={coupon.code} className="erp-admin-coupon-card">
                <div className="coupon-code-banner">
                  <code>{coupon.code}</code>
                  <span className={`status-pill ${coupon.is_active ? 'active' : 'inactive'}`}>
                    {coupon.is_active ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                <div className="coupon-card-details">
                  <p>
                    <strong>میزان تخفیف:</strong>{' '}
                    {coupon.discount_type === 'percent' ? `${coupon.discount_value} درصد` : money(coupon.discount_value)}
                  </p>
                  {coupon.min_order_amount && (
                    <p><small>حداقل خرید: {money(coupon.min_order_amount)}</small></p>
                  )}
                </div>
                <div className="coupon-card-actions">
                  <button 
                    type="button" 
                    className="btn-icon-action delete"
                    onClick={() => handleDeleteCoupon(coupon.code)}
                    title="حذف کد تخفیف"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PRESET (TAB) */}
      {/* ------------------------------------------------------------- */}
      {tabModalOpen && (
        <div className="erp-modal-overlay" onClick={() => setTabModalOpen(false)}>
          <div className="erp-modal-box large" onClick={e => e.stopPropagation()}>
            <div className="erp-modal-head">
              <div className="head-title">
                <Layers size={20} color="#0870d1" />
                <h3>{editingPreset ? `ویرایش تب «${editingPreset.title}»` : 'افزودن تب و صنف جدید'}</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setTabModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTab}>
              <div className="erp-modal-body">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>عنوان نمایشی تب <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="مثلاً: خدماتی، تولیدی، پزشکی و کلینیک..."
                      value={tabForm.title}
                      onChange={e => setTabForm({ ...tabForm, title: e.target.value })}
                      required
                    />
                    <small className="help-text">این نام دقیقاً در ردیف تب‌های بالای صفحه قیمت‌گذاری برای کاربر نمایش داده می‌شود.</small>
                  </div>

                  <div className="form-group">
                    <label>شناسه یکتا (Slug)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. medical, contractor, retail"
                      value={tabForm.id}
                      onChange={e => setTabForm({ ...tabForm, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      disabled={!!editingPreset}
                      required
                    />
                    <small className="help-text">شناسه سیستمی برای ذخیره در پایگاه‌داده (فقط حروف انگلیسی و زیرخط).</small>
                  </div>
                </div>

                <div className="modal-modules-selector-section">
                  <div className="selector-head">
                    <div>
                      <strong>انتخاب ماژول‌های پیش‌فرض این تب:</strong>
                      <p>ماژول‌هایی که با انتخاب این تب توسط کاربر باید به صورت خودکار تیک بخورند را انتخاب کنید.</p>
                    </div>
                    <div className="selector-quick-actions">
                      <button type="button" className="btn-quick" onClick={selectAllModulesForTab}>انتخاب همه</button>
                      <button type="button" className="btn-quick" onClick={clearAllModulesForTab}>عدم انتخاب</button>
                    </div>
                  </div>

                  <div className="selected-count-bar">
                    <span>تعداد ماژول‌های انتخابی برای این تب: <strong>{tabForm.default_modules.length} از {data?.modules?.length || 0}</strong></span>
                  </div>

                  <div className="modules-checkbox-grid">
                    {(data?.modules || []).map(mod => {
                      const isChecked = tabForm.default_modules.includes(mod.id);
                      return (
                        <label 
                          key={mod.id} 
                          className={`mod-checkbox-card ${isChecked ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleModuleInTabForm(mod.id);
                          }}
                        >
                          <div className={`custom-check-box ${isChecked ? 'checked' : ''}`}>
                            {isChecked && <Check size={13} color="#fff" />}
                          </div>
                          <div className="mod-info">
                            <span className="mod-title">{mod.title}</span>
                            <span className="mod-price">{money(mod.price)}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="erp-modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setTabModalOpen(false)}>
                  انصراف
                </button>
                <button type="submit" className="btn-submit-save">
                  <Check size={16} />
                  <span>{editingPreset ? 'ذخیره تغییرات تب' : 'افزودن و انتشار تب'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT ERP MODULE */}
      {/* ------------------------------------------------------------- */}
      {moduleModalOpen && (
        <div className="erp-modal-overlay" onClick={() => setModuleModalOpen(false)}>
          <div className="erp-modal-box large" onClick={e => e.stopPropagation()}>
            <div className="erp-modal-head">
              <div className="head-title">
                <DollarSign size={20} color="#0870d1" />
                <h3>{editingModule ? `ویرایش ماژول «${editingModule.title}»` : 'افزودن ماژول جدید به سیستم ERP'}</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setModuleModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModuleModal}>
              <div className="erp-modal-body">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>نام و عنوان ماژول (فارسی) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="مثلاً: مدیریت حمل‌ونقل و باربری، سیستم باشگاه مشتریان..."
                      value={moduleForm.title}
                      onChange={e => {
                        const val = e.target.value;
                        setModuleForm(prev => ({
                          ...prev,
                          title: val,
                          // if creating new and ID was empty or default, suggest slug
                          id: (!editingModule && (!prev.id || prev.id.startsWith('module_'))) 
                            ? `mod_${Date.now().toString().slice(-4)}` 
                            : prev.id
                        }));
                      }}
                      required
                    />
                    <small className="help-text">عنوانی که در لیست ماژول‌ها و فاکتور کاربر نمایش داده می‌شود.</small>
                  </div>

                  <div className="form-group">
                    <label>شناسه یکتای سیستمی (Slug انگلیسی) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="مثلاً: logistics, loyalty, quality_control"
                      value={moduleForm.id}
                      onChange={e => setModuleForm({ ...moduleForm, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      disabled={!!editingModule}
                      required
                    />
                    <small className="help-text">شناسه منحصربه‌فرد لاتین برای ذخیره در پایگاه داده (غیرقابل تغییر پس از ساخت).</small>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>قیمت ماهانه ماژول (تومان) <span style={{ color: '#ef4444' }}>*</span></label>
                    <div className="input-with-unit">
                      <input 
                        type="number"
                        step="10000"
                        min="0"
                        placeholder="250000"
                        value={moduleForm.price}
                        onChange={e => setModuleForm({ ...moduleForm, price: e.target.value })}
                        required
                      />
                      <span className="unit">تومان / ماه</span>
                    </div>
                    <small className="help-text">معادل: <strong>{money(moduleForm.price)}</strong> در ماه</small>
                  </div>

                  <div className="form-group">
                    <label>وضعیت دسترسی ماژول</label>
                    <select 
                      value={moduleForm.is_active ? 'active' : 'inactive'}
                      onChange={e => setModuleForm({ ...moduleForm, is_active: e.target.value === 'active' })}
                    >
                      <option value="active">فعال (قابل مشاهده و خرید توسط کاربران)</option>
                      <option value="inactive">غیرفعال (مخفی موقت در سیستم)</option>
                    </select>
                    <small className="help-text">در صورت غیرفعال بودن، در لیست انتخاب کاربر ظاهر نمی‌شود.</small>
                  </div>
                </div>

                {/* Dependencies Multi-select */}
                <div className="modal-modules-selector-section">
                  <div className="selector-head">
                    <div>
                      <strong>پیش‌نیازها و وابستگی‌ها (اختیاری):</strong>
                      <p>اگر فعال‌سازی این ماژول مشروط به انتخاب ماژول‌های دیگر است، آن‌ها را علامت بزنید.</p>
                    </div>
                    {moduleForm.dependencies.length > 0 && (
                      <button 
                        type="button" 
                        className="btn-quick"
                        onClick={() => setModuleForm(prev => ({ ...prev, dependencies: [] }))}
                      >
                        پاک کردن پیش‌نیازها
                      </button>
                    )}
                  </div>

                  <div className="modules-checkbox-grid small">
                    {(data?.modules || [])
                      .filter(m => m.id !== moduleForm.id) // exclude itself
                      .map(mod => {
                        const isChecked = (moduleForm.dependencies || []).includes(mod.id);
                        return (
                          <label 
                            key={mod.id} 
                            className={`mod-checkbox-card ${isChecked ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleDependencyInForm(mod.id);
                            }}
                          >
                            <div className={`custom-check-box ${isChecked ? 'checked' : ''}`}>
                              {isChecked && <Check size={13} color="#fff" />}
                            </div>
                            <div className="mod-info">
                              <span className="mod-title">{mod.title}</span>
                              <span className="mod-price">{mod.id}</span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>

                {/* Preset Assignment */}
                <div className="modal-modules-selector-section">
                  <div className="selector-head">
                    <div>
                      <strong>افزودن خودکار به تب‌ها و صنف‌های پیش‌فرض:</strong>
                      <p>این ماژول به صورت پیش‌فرض در کدام تب‌های قیمت‌گذاری فعال باشد؟</p>
                    </div>
                  </div>

                  <div className="modules-checkbox-grid small">
                    {(data?.presets || []).map(preset => {
                      const isChecked = (moduleForm.add_to_presets || []).includes(preset.id);
                      return (
                        <label 
                          key={preset.id} 
                          className={`mod-checkbox-card ${isChecked ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            togglePresetInModuleForm(preset.id);
                          }}
                        >
                          <div className={`custom-check-box ${isChecked ? 'checked' : ''}`}>
                            {isChecked && <Check size={13} color="#fff" />}
                          </div>
                          <div className="mod-info">
                            <span className="mod-title">{preset.title}</span>
                            <span className="mod-price">تب صنف: {preset.id}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="erp-modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setModuleModalOpen(false)}>
                  انصراف
                </button>
                <button type="submit" className="btn-submit-save">
                  <Save size={16} />
                  <span>{editingModule ? 'ذخیره تغییرات ماژول' : 'افزودن و انتشار ماژول جدید'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD COUPON */}
      {/* ------------------------------------------------------------- */}
      {couponModalOpen && (
        <div className="erp-modal-overlay" onClick={() => setCouponModalOpen(false)}>
          <div className="erp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="erp-modal-head">
              <div className="head-title">
                <Tag size={18} color="#0870d1" />
                <h3>افزودن کد تخفیف جدید</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setCouponModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              <div className="erp-modal-body">
                <div className="form-group">
                  <label>کد تخفیف (لاتین و بدون فاصله)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SUMMER20, DISCOUNT50"
                    value={couponForm.code}
                    onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>نوع تخفیف</label>
                  <select 
                    value={couponForm.discount_type}
                    onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                  >
                    <option value="percent">درصدی (٪)</option>
                    <option value="fixed">مبلغ ثابت (تومان)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>مقدار تخفیف {couponForm.discount_type === 'percent' ? '(درصد)' : '(تومان)'}</label>
                  <input 
                    type="number"
                    min="1"
                    value={couponForm.discount_value}
                    onChange={e => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>حداقل مبلغ سفارش (اختیاری - به تومان)</label>
                  <input 
                    type="number"
                    placeholder="بدون محدودیت"
                    value={couponForm.min_order_amount}
                    onChange={e => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="erp-modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setCouponModalOpen(false)}>
                  انصراف
                </button>
                <button type="submit" className="btn-submit-save">
                  <Save size={16} />
                  <span>ذخیره کد تخفیف</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
