import React, { useState, useEffect, useMemo } from 'react';
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
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  CheckCircle,
  XCircle,
  Link2,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';

const money = n => Number(n || 0).toLocaleString('fa-IR') + ' تومان';

function HoverBadgesList({ 
  items = [], 
  type = 'dep', 
  maxVisible = 2, 
  emptyText = '—', 
  isTopRow = false 
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (!items || items.length === 0) {
    return <span style={{ color: '#94a3b8', fontSize: '11.5px', fontStyle: 'italic' }}>{emptyText}</span>;
  }

  const isDep = type === 'dep';
  const hasMore = items.length > maxVisible;
  const visibleItems = hasMore ? items.slice(0, maxVisible) : items;
  const remainingCount = items.length - maxVisible;

  return (
    <div 
      className="hover-expand-wrap"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        {visibleItems.map((item, idx) => {
          const label = typeof item === 'object' ? item.title : item;
          return (
            <span 
              key={idx}
              className={isDep ? 'dep-pill' : 'preset-pill-tag'}
            >
              {label}
            </span>
          );
        })}

        {hasMore && (
          <span className={`hover-expand-trigger-badge ${type}`}>
            +{remainingCount} {isDep ? 'پیش‌نیاز دیگر' : 'صنف دیگر'}
          </span>
        )}
      </div>

      {isHovered && hasMore && (
        <div 
          className={`hover-popover-card ${isTopRow ? 'pos-bottom' : 'pos-top'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="hover-popover-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isDep ? <Link2 size={13} color="#2563eb" /> : <Tag size={13} color="#16a34a" />}
              <span>{isDep ? 'تمام ماژول‌های پیش‌نیاز' : 'تمام اصناف شامل این ماژول'}</span>
            </div>
            <span className="hover-popover-count">
              {items.length} {isDep ? 'ماژول' : 'صنف'}
            </span>
          </div>

          <div className="hover-popover-list">
            {items.map((item, idx) => {
              const label = typeof item === 'object' ? item.title : item;
              const subId = typeof item === 'object' ? item.id : null;
              return (
                <span key={idx} className={`hover-popover-pill ${type}`}>
                  <CheckCircle2 size={11} color={isDep ? "#0284c7" : "#16a34a"} style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{label}</span>
                  {subId && subId !== label && (
                    <code className="hover-popover-code">{subId}</code>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ERPAdminPricingManagement({ onOpenAddTabModal, refreshTrigger }) {
  const [activeSubTab, setActiveSubTab] = useState('presets'); // 'presets' | 'modules' | 'settings' | 'coupons'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Tab/Preset Modal State
  const [tabModalOpen, setTabModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [tabForm, setTabForm] = useState({ id: '', title: '', default_modules: [], mandatory_modules: [] });
  
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
  const [sortField, setSortField] = useState('none'); // 'none' | 'name' | 'price' | 'status' | 'presets'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  
  // Global Settings State
  const [settingsForm, setSettingsForm] = useState({
    base_user_limit: 1,
    extra_user_price: 800000,
    yearly_multiplier: 10,
    step_users_enabled: true,
    step_modules_enabled: true,
  });
  
  // Coupon Modal State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: 20,
    min_order_amount: '',
    max_discount_amount: '',
    is_active: true,
  });

  // Quick module price inline edit state
  const [inlinePrices, setInlinePrices] = useState({});
  const [savingModuleId, setSavingModuleId] = useState(null);

  // Bulk Actions State
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [bulkModal, setBulkModal] = useState(null); // null | 'price' | 'dependency' | 'preset' | 'delete'
  const [bulkPriceVal, setBulkPriceVal] = useState('');
  const [bulkDepVal, setBulkDepVal] = useState('');
  const [bulkPresetVal, setBulkPresetVal] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Multi-select states for bulk dependency & preset assignment
  const [bulkSelectedDeps, setBulkSelectedDeps] = useState([]);
  const [bulkDepSearch, setBulkDepSearch] = useState('');
  const [bulkSelectedPresets, setBulkSelectedPresets] = useState([]);
  const [bulkPresetSearch, setBulkPresetSearch] = useState('');

  const toggleBulkDep = (id) => {
    setBulkSelectedDeps(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleBulkPreset = (id) => {
    setBulkSelectedPresets(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectModule = (id) => {
    setSelectedModuleIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredList) => {
    const filteredIds = filteredList.map(m => m.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedModuleIds.includes(id));
    if (allSelected) {
      setSelectedModuleIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedModuleIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleBulkAction = async (action, value) => {
    if (!selectedModuleIds.length) return;
    setBulkSubmitting(true);
    try {
      const res = await api('/admin/erp/modules/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action,
          module_ids: selectedModuleIds,
          value,
        }),
      });
      if (res.modules) {
        setData(prev => ({
          ...prev,
          modules: res.modules,
          presets: res.presets || prev.presets,
        }));
        const prices = {};
        res.modules.forEach(m => {
          prices[m.id] = m.price;
        });
        setInlinePrices(prices);
      } else {
        await loadData();
      }
      showSuccess(res.message || 'عملیات گروهی با موفقیت انجام گردید.');
      if (action === 'delete') {
        setSelectedModuleIds([]);
      }
      setBulkModal(null);
    } catch (err) {
      alert(err.message || 'خطا در اجرای عملیات گروهی');
    } finally {
      setBulkSubmitting(false);
    }
  };

  // Load all ERP configurator data
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api('/admin/erp/modules');
      setData(res);
      if (res.settings) {
        setSettingsForm({
          base_user_limit: res.settings.base_user_limit || 1,
          extra_user_price: res.settings.extra_user_price || 800000,
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
  }, [refreshTrigger, activeSubTab]);

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
      default_modules: ['account', 'hr', 'crm', 'sale'],
      mandatory_modules: ['account', 'hr'],
    });
    setTabModalOpen(true);
  };

  const openEditTabModal = (preset) => {
    setEditingPreset(preset);
    const activeModuleIds = new Set((data?.modules || []).filter(m => m.is_active !== false).map(m => m.id));
    setTabForm({
      id: preset.id,
      title: preset.title,
      default_modules: (preset.default_modules || []).filter(id => activeModuleIds.has(id)),
      mandatory_modules: (preset.mandatory_modules || []).filter(id => activeModuleIds.has(id)),
    });
    setTabModalOpen(true);
  };

  const toggleModuleInTabForm = (modId) => {
    setTabForm(prev => {
      const currentDefs = prev.default_modules || [];
      const currentMands = prev.mandatory_modules || [];
      if (currentDefs.includes(modId)) {
        return {
          ...prev,
          default_modules: currentDefs.filter(id => id !== modId),
          mandatory_modules: currentMands.filter(id => id !== modId),
        };
      } else {
        return {
          ...prev,
          default_modules: [...currentDefs, modId],
        };
      }
    });
  };

  const toggleMandatoryInTabForm = (modId) => {
    setTabForm(prev => {
      const currentDefs = prev.default_modules || [];
      const currentMands = prev.mandatory_modules || [];
      const isMandatory = currentMands.includes(modId);
      if (isMandatory) {
        return {
          ...prev,
          mandatory_modules: currentMands.filter(id => id !== modId),
        };
      } else {
        const nextDefs = currentDefs.includes(modId) ? currentDefs : [...currentDefs, modId];
        return {
          ...prev,
          default_modules: nextDefs,
          mandatory_modules: [...currentMands, modId],
        };
      }
    });
  };

  const selectAllModulesForTab = () => {
    if (!data?.modules) return;
    setTabForm(prev => ({
      ...prev,
      default_modules: data.modules.filter(m => m.is_active !== false).map(m => m.id),
    }));
  };

  const clearAllModulesForTab = () => {
    setTabForm(prev => ({ ...prev, default_modules: [], mandatory_modules: [] }));
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
    const targetId = String(mod.id || '').trim().toLowerCase();
    const currentPresets = (data?.presets || [])
      .filter(p => {
        let pMods = [];
        if (Array.isArray(p.default_modules)) {
          pMods = p.default_modules;
        } else if (typeof p.default_modules === 'string') {
          try { pMods = JSON.parse(p.default_modules || '[]'); } catch { pMods = []; }
        }
        return pMods.map(m => String(m).trim().toLowerCase()).includes(targetId);
      })
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

    // Resolve which presets currently include this module so preset
    // assignments are preserved when only the price is being changed.
    const currentPresets = (data?.presets || [])
      .filter(p => {
        const pMods = Array.isArray(p.default_modules) ? p.default_modules : [];
        return pMods.includes(moduleId);
      })
      .map(p => p.id);

    setSavingModuleId(moduleId);
    try {
      await api('/admin/erp/modules', {
        method: 'POST',
        body: JSON.stringify({
          id: targetModule.id,
          title: targetModule.title,
          price: newPrice,
          is_active: targetModule.is_active,
          dependencies: targetModule.dependencies || [],
          add_to_presets: currentPresets,
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
      const res = await api(`/admin/erp/modules/${mod.id}/toggle`, { method: 'POST' });
      if (res?.presets && Array.isArray(res.presets)) {
        setData(prev => ({
          ...prev,
          modules: res.modules || prev?.modules,
          presets: res.presets
        }));
      }
      showSuccess(`وضعیت ماژول «${mod.title}» تغییر کرد.`);
      await loadData();
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
      const cleanId = moduleForm.id.trim().toLowerCase().replace(/\s+/g, '_');
      const targetPresets = moduleForm.add_to_presets || [];

      const saveRes = await api('/admin/erp/modules', {
        method: 'POST',
        body: JSON.stringify({
          id: cleanId,
          title: moduleForm.title.trim(),
          price: Number(moduleForm.price),
          is_active: moduleForm.is_active,
          dependencies: moduleForm.dependencies,
          add_to_presets: targetPresets,
        }),
      });

      // Synchronize immediately in local React state so reopening the modal reflects the changes right away
      if (saveRes?.presets && Array.isArray(saveRes.presets)) {
        setData(prev => ({
          ...prev,
          presets: saveRes.presets,
          modules: saveRes.modules || prev?.modules
        }));
      } else {
        setData(prev => {
          if (!prev?.presets) return prev;
          const updatedPresets = prev.presets.map(p => {
            let pMods = Array.isArray(p.default_modules) ? [...p.default_modules] : [];
            const shouldInclude = targetPresets.includes(p.id);
            const hasMod = pMods.includes(cleanId);
            if (shouldInclude && !hasMod) {
              pMods.push(cleanId);
            } else if (!shouldInclude && hasMod) {
              pMods = pMods.filter(m => m !== cleanId);
            }
            return { ...p, default_modules: pMods };
          });
          return { ...prev, presets: updatedPresets };
        });
      }

      setModuleModalOpen(false);
      showSuccess(editingModule ? 'مشخصات ماژول با موفقیت بروزرسانی شد.' : 'ماژول جدید با موفقیت به سیستم اضافه گردید.');
      await loadData();
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
  const openNewCouponModal = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      discount_type: 'percent',
      discount_value: 20,
      min_order_amount: '',
      max_discount_amount: '',
      is_active: true,
    });
    setCouponModalOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discount_type: coupon.discount_type || 'percent',
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || '',
      max_discount_amount: coupon.max_discount_amount || '',
      is_active: coupon.is_active !== false,
    });
    setCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim() || !couponForm.discount_value) {
      alert('اطلاعات کد تخفیف را کامل کنید.');
      return;
    }
    try {
      await api('/admin/erp/coupons', {
        method: 'POST',
        body: JSON.stringify({
          ...couponForm,
          code: couponForm.code.trim().toUpperCase(),
          discount_value: Number(couponForm.discount_value),
          min_order_amount: couponForm.min_order_amount ? Number(couponForm.min_order_amount) : null,
          max_discount_amount: couponForm.max_discount_amount ? Number(couponForm.max_discount_amount) : null,
          is_active: couponForm.is_active ?? true,
        }),
      });
      setCouponModalOpen(false);
      showSuccess(editingCoupon ? `کد تخفیف «${couponForm.code.toUpperCase()}» با موفقیت بروزرسانی شد.` : `کد تخفیف «${couponForm.code.toUpperCase()}» با موفقیت ذخیره شد.`);
      loadData();
    } catch (err) {
      alert(err.message || 'خطا در ذخیره کد تخفیف');
    }
  };

  const handleToggleCouponActive = async (coupon) => {
    try {
      await api(`/admin/erp/coupons/${coupon.code}/toggle`, { method: 'POST' });
      showSuccess(`وضعیت کد تخفیف «${coupon.code}» تغییر کرد.`);
      loadData();
    } catch (err) {
      try {
        await api('/admin/erp/coupons', {
          method: 'POST',
          body: JSON.stringify({
            ...coupon,
            is_active: !coupon.is_active,
          }),
        });
        showSuccess(`وضعیت کد تخفیف «${coupon.code}» تغییر کرد.`);
        loadData();
      } catch (err2) {
        alert(err2.message || 'خطا در تغییر وضعیت کد تخفیف');
      }
    }
  };

  const handleDeleteCoupon = async (code) => {
    if (!window.confirm(`آیا از حذف کد تخفیف «${code}» اطمینان دارید؟`)) return;
    try {
      await api(`/admin/erp/coupons/${code}`, { method: 'DELETE' });
      showSuccess(`کد تخفیف «${code}» با موفقیت حذف شد.`);
      loadData();
    } catch (err) {
      alert(err.message || 'خطا در حذف کد تخفیف');
    }
  };

  // Map each module to the presets (صنف‌ها) it belongs to
  const modulePresetsMap = useMemo(() => {
    const map = {};
    (data?.presets || []).forEach(p => {
      let pMods = [];
      if (Array.isArray(p.default_modules)) {
        pMods = p.default_modules;
      } else if (typeof p.default_modules === 'string') {
        try {
          pMods = JSON.parse(p.default_modules || '[]');
        } catch {
          pMods = [];
        }
      }
      pMods.forEach(modId => {
        if (!map[modId]) map[modId] = [];
        if (!map[modId].includes(p.title)) {
          map[modId].push(p.title);
        }
      });
    });
    return map;
  }, [data?.presets]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const processedModules = useMemo(() => {
    let list = (data?.modules || []).filter(m => 
      (m.title || '').toLowerCase().includes(moduleSearch.toLowerCase()) || 
      (m.id || '').toLowerCase().includes(moduleSearch.toLowerCase())
    );

    if (sortField === 'name') {
      list = [...list].sort((a, b) => {
        const titleA = a.title || '';
        const titleB = b.title || '';
        const cmp = titleA.localeCompare(titleB, 'fa');
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    } else if (sortField === 'price') {
      list = [...list].sort((a, b) => {
        const priceA = Number(inlinePrices[a.id] !== undefined ? inlinePrices[a.id] : a.price) || 0;
        const priceB = Number(inlinePrices[b.id] !== undefined ? inlinePrices[b.id] : b.price) || 0;
        return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
      });
    } else if (sortField === 'status') {
      list = [...list].sort((a, b) => {
        const activeA = a.is_active !== false ? 1 : 0;
        const activeB = b.is_active !== false ? 1 : 0;
        return sortDirection === 'asc' ? activeB - activeA : activeA - activeB;
      });
    } else if (sortField === 'presets') {
      list = [...list].sort((a, b) => {
        const countA = (modulePresetsMap[a.id] || []).length;
        const countB = (modulePresetsMap[b.id] || []).length;
        return sortDirection === 'asc' ? countA - countB : countB - countA;
      });
    }

    return list;
  }, [data?.modules, moduleSearch, sortField, sortDirection, inlinePrices, modulePresetsMap]);

  const filteredModules = processedModules;

  if (loading) {
    return (
      <div className="erp-admin-loading">
        <RefreshCw className="animate-spin" size={24} color="#0870d1" />
        <span>در حال بارگذاری سیستم قیمت‌گذاری و ماژول‌ها...</span>
      </div>
    );
  }

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
          <button type="button" className="btn-add-tab-action" onClick={openNewCouponModal}>
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
              <p>هر تب نشان‌دهنده یک صنف یا اشتراک پیشنهادی است. با انتخاب هر تب توسط کاربر در صفحه قیمت‌گذاری، ماژول‌های انتخابی ادمین برای آن تب به صورت پیش‌فرض فعال شده و هزینه لحظه‌ای محاسبه می‌شود.</p>
            </div>
          </div>

          <div className="erp-admin-presets-grid">
            {(data?.presets || []).map((preset, index) => {
              const assignedModules = (preset.default_modules || [])
                .map(id => data?.modules?.find(m => m.id === id))
                .filter(m => m && m.is_active !== false);
              const mandatoryIds = new Set(preset.mandatory_modules || []);
              const mandatoryCount = assignedModules.filter(m => mandatoryIds.has(m.id)).length;

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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span className="label">ماژول‌های پیش‌فرض ({assignedModules.length} ماژول):</span>
                        {mandatoryCount > 0 && (
                          <span className="preset-mand-count-badge">
                            <Lock size={11} />
                            {mandatoryCount.toLocaleString('fa-IR')} الزامی
                          </span>
                        )}
                      </div>
                      <div className="preset-chips-wrap">
                        {assignedModules.map((mod, i) => {
                          const isMand = mandatoryIds.has(mod.id);
                          return (
                            <span key={i} className={`module-pill-tag ${isMand ? 'mandatory' : ''}`}>
                              {isMand ? <Lock size={11} /> : <Check size={11} />}
                              {mod.title}
                              {isMand && <span className="mand-tag-suffix"> (الزامی)</span>}
                            </span>
                          );
                        })}
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
              {/* Quick Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 10px' }}>
                <ArrowUpDown size={14} color="#64748b" />
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>مرتب‌سازی:</span>
                <select 
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, dir] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(dir || 'asc');
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12.5px',
                    color: '#1e293b',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="none-asc">پیش‌فرض</option>
                  <option value="name-asc">نام ماژول (الف به ی)</option>
                  <option value="name-desc">نام ماژول (ی به الف)</option>
                  <option value="price-asc">قیمت: کم به زیاد</option>
                  <option value="price-desc">قیمت: زیاد به کم</option>
                  <option value="status-asc">وضعیت: فعال‌ها در ابتدا</option>
                  <option value="status-desc">وضعیت: غیرفعال‌ها در ابتدا</option>
                  <option value="presets-desc">تعداد صنف‌ها (بیشترین)</option>
                </select>
              </div>

              <div className="module-stats-badge">
                <span>تعداد کل ماژول‌ها: <strong>{data?.modules?.length || 0} ماژول</strong></span>
              </div>
              <button 
                type="button" 
                className="btn-refresh-data" 
                onClick={loadData} 
                disabled={loading}
                title="تازه‌سازی لیست ماژول‌ها"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#475569',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>بروزرسانی داده‌ها</span>
              </button>
              <button type="button" className="btn-add-module-inner" onClick={openNewModuleModal}>
                <Plus size={15} />
                <span>افزودن ماژول جدید</span>
              </button>
            </div>
          </div>

          {selectedModuleIds.length > 0 && (
            <div className="erp-bulk-bar">
              <div className="bulk-bar-info">
                <span className="bulk-count-badge">
                  <CheckSquare size={16} />
                  <strong>{selectedModuleIds.length.toLocaleString('fa-IR')}</strong> ماژول انتخاب شده
                </span>
                <button type="button" className="btn-bulk-text" onClick={() => setSelectedModuleIds([])}>
                  لغو انتخاب
                </button>
              </div>
              <div className="bulk-bar-actions">
                <button 
                  type="button" 
                  className="btn-bulk-action price" 
                  disabled={bulkSubmitting}
                  onClick={() => { setBulkPriceVal(''); setBulkModal('price'); }}
                  title="تعیین یک قیمت مشخص برای همه ماژول‌های انتخابی"
                >
                  <DollarSign size={14} />
                  <span>قیمت‌گذاری یکسان</span>
                </button>

                <button 
                  type="button" 
                  className="btn-bulk-action activate" 
                  disabled={bulkSubmitting}
                  onClick={() => handleBulkAction('set_status', true)}
                  title="فعال‌سازی تمامی ماژول‌های انتخاب‌شده"
                >
                  <CheckCircle size={14} />
                  <span>فعال‌سازی همه</span>
                </button>

                <button 
                  type="button" 
                  className="btn-bulk-action deactivate" 
                  disabled={bulkSubmitting}
                  onClick={() => handleBulkAction('set_status', false)}
                  title="غیرفعال‌سازی تمامی ماژول‌های انتخاب‌شده"
                >
                  <XCircle size={14} />
                  <span>غیرفعال‌سازی همه</span>
                </button>

                <button 
                  type="button" 
                  className="btn-bulk-action dep" 
                  disabled={bulkSubmitting}
                  onClick={() => { 
                    setBulkSelectedDeps([]); 
                    setBulkDepSearch(''); 
                    setBulkModal('dependency'); 
                  }}
                  title="مدیریت و انتساب پیش‌نیاز به ماژول‌های انتخابی"
                >
                  <Link2 size={14} />
                  <span>انتساب پیش‌نیاز</span>
                </button>

                <button 
                  type="button" 
                  className="btn-bulk-action preset" 
                  disabled={bulkSubmitting}
                  onClick={() => { 
                    setBulkSelectedPresets([]); 
                    setBulkPresetSearch(''); 
                    setBulkModal('preset'); 
                  }}
                  title="افزودن ماژول‌های انتخابی به صنف‌ها و تب‌های پیش‌فرض"
                >
                  <Layers size={14} />
                  <span>انتساب صنف / تب</span>
                </button>

                <button 
                  type="button" 
                  className="btn-bulk-action delete" 
                  disabled={bulkSubmitting}
                  onClick={() => setBulkModal('delete')}
                  title="حذف کامل ماژول‌های انتخاب‌شده از سیستم"
                >
                  <Trash2 size={14} />
                  <span>حذف گروهی</span>
                </button>
              </div>
            </div>
          )}

          <div className="erp-admin-table-wrap">
            <table className="erp-admin-table">
              <thead>
                <tr>
                  <th style={{ width: '42px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={filteredModules.length > 0 && filteredModules.every(m => selectedModuleIds.includes(m.id))}
                      ref={el => {
                        if (el) {
                          const isAll = filteredModules.length > 0 && filteredModules.every(m => selectedModuleIds.includes(m.id));
                          const isSome = filteredModules.some(m => selectedModuleIds.includes(m.id));
                          el.indeterminate = isSome && !isAll;
                        }
                      }}
                      onChange={() => toggleSelectAll(filteredModules)}
                      title="انتخاب یا لغو انتخاب تمام ماژول‌های فیلتر شده"
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                  </th>
                  <th style={{ width: '45px' }}>#</th>
                  <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('name')}
                    title="کلیک برای مرتب‌سازی بر اساس نام ماژول"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>نام ماژول ERP</span>
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ArrowUp size={14} color="#0284c7" /> : <ArrowDown size={14} color="#0284c7" />
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" />
                      )}
                    </div>
                  </th>
                  <th style={{ width: '90px' }}>شناسه یکتا</th>
                  <th>پیش‌نیازها</th>
                  <th 
                    style={{ minWidth: '180px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('presets')}
                    title="کلیک برای مرتب‌سازی بر اساس صنف‌ها"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>صنف‌های این ماژول</span>
                      {sortField === 'presets' ? (
                        sortDirection === 'asc' ? <ArrowUp size={14} color="#0284c7" /> : <ArrowDown size={14} color="#0284c7" />
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" />
                      )}
                    </div>
                  </th>
                  <th 
                    style={{ width: '220px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('price')}
                    title="کلیک برای مرتب‌سازی بر اساس قیمت (کم به زیاد / زیاد به کم)"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>قیمت ماهانه (تومان)</span>
                      {sortField === 'price' ? (
                        sortDirection === 'asc' ? <ArrowUp size={14} color="#0284c7" /> : <ArrowDown size={14} color="#0284c7" />
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" />
                      )}
                    </div>
                  </th>
                  <th 
                    style={{ width: '100px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('status')}
                    title="کلیک برای مرتب‌سازی بر اساس وضعیت (فعال / غیرفعال)"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>وضعیت</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? <ArrowUp size={14} color="#0284c7" /> : <ArrowDown size={14} color="#0284c7" />
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" />
                      )}
                    </div>
                  </th>
                  <th style={{ width: '120px' }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredModules.map((mod, idx) => {
                  const isSaving = savingModuleId === mod.id;
                  const currentInlineVal = inlinePrices[mod.id] !== undefined ? inlinePrices[mod.id] : mod.price;
                  const isModified = Number(currentInlineVal) !== Number(mod.price);
                  const isSelected = selectedModuleIds.includes(mod.id);

                  return (
                    <tr 
                      key={mod.id} 
                      className={`${mod.is_active === false ? 'row-inactive' : ''} ${isSelected ? 'row-selected' : ''}`}
                    >
                      <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelectModule(mod.id)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                        />
                      </td>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="module-title-cell">
                          <strong>{mod.title}</strong>
                          {mod.dependencies && mod.dependencies.length > 0 && (
                            <span 
                              className="dep-notice" 
                              title={`وابسته به: ${mod.dependencies.join(', ')}`}
                            >
                              وابسته به {mod.dependencies.length <= 2 
                                ? mod.dependencies.join(', ') 
                                : `${mod.dependencies.slice(0, 2).join(', ')} و ${mod.dependencies.length - 2} ماژول دیگر`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <code className="slug-code">{mod.id}</code>
                      </td>
                      <td>
                        <HoverBadgesList 
                          items={(mod.dependencies || []).map(d => {
                            const foundDep = data?.modules?.find(m => m.id === d);
                            return { id: d, title: foundDep ? foundDep.title : d };
                          })}
                          type="dep"
                          maxVisible={2}
                          emptyText="مستقل"
                          isTopRow={idx < 2}
                        />
                      </td>
                      {/* صنف‌های درج شده در این ماژول */}
                      <td>
                        <HoverBadgesList 
                          items={(modulePresetsMap[mod.id] || []).map(p => ({ id: p, title: p }))}
                          type="preset"
                          maxVisible={3}
                          emptyText="عمومی / فاقد صنف"
                          isTopRow={idx < 2}
                        />
                      </td>
                      <td>
                        <div className="price-input-row">
                          <input 
                            type="number"
                            step="any"
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
                  onChange={e => setSettingsForm({ ...settingsForm, base_user_limit: e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  required
                />
                <small className="help-text">تعداد کاربرانی که در اشتراک پایه محاسبه شده و هزینه اضافی ندارند (پیش‌فرض: ۱ کاربر). این سقف برای تمامی ماژول‌های سیستم اعمال می‌گردد.</small>
              </div>

              <div className="form-group">
                <label>
                  <DollarSign size={16} />
                  <span>هزینه به ازای هر کاربر اضافه (ماهانه):</span>
                </label>
                <div className="input-with-unit">
                  <input 
                    type="number"
                    step="any"
                    min="0"
                    value={settingsForm.extra_user_price}
                    onChange={e => setSettingsForm({ ...settingsForm, extra_user_price: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    required
                  />
                  <span className="unit">تومان / کاربر</span>
                </div>
                {settingsForm.extra_user_price !== '' && !isNaN(Number(settingsForm.extra_user_price)) && (
                  <div style={{ marginTop: '6px', fontSize: '12.5px', color: '#0284c7', fontWeight: 700 }}>
                    معادل ماهانه: {money(settingsForm.extra_user_price)} | سالانه (۱۰ ماه محاسبه + ۲ ماه رایگان): {money(Number(settingsForm.extra_user_price) * (Number(settingsForm.yearly_multiplier) || 10))}
                  </div>
                )}
                <small className="help-text">مبلغی که به ازای هر کاربر مازاد بر سقف پایه به هزینه ماهانه اشتراک افزوده می‌شود (مثلاً: ۱۵۰,۰۰۰ تومان).</small>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: '۱۵۰ هزار تومان (استاندارد)', val: 150000 },
                    { label: '۳۰۰ هزار تومان', val: 300000 },
                    { label: '۵۰۰ هزار تومان', val: 500000 },
                    { label: '۸۰۰ هزار تومان', val: 800000 },
                  ].map(chip => (
                    <button
                      key={chip.val}
                      type="button"
                      className="chip-btn"
                      style={{ fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', color: '#334155' }}
                      onClick={() => setSettingsForm(prev => ({ ...prev, extra_user_price: chip.val }))}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
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
          <div className="erp-admin-intro-box">
            <Tag size={20} color="#0870d1" />
            <div>
              <strong>مدیریت کدهای تخفیف سیستم:</strong>
              <p>شما می‌توانید کدهای تخفیف درصدی یا مبلغ ثابت تعریف نمایید، حداقل مبلغ سفارش یا سقف تخفیف مشخص کنید و وضعیت فعال/غیرفعال بودن هر کد را به سادگی کنترل نمایید.</p>
            </div>
          </div>

          {(!data?.coupons || data.coupons.length === 0) ? (
            <div className="erp-admin-empty-coupons">
              <Tag size={44} color="#94a3b8" />
              <h4>هیچ کد تخفیفی یافت نشد</h4>
              <p>در حال حاضر کد تخفیفی در سامانه تعریف نشده است. جهت ساخت اولین کد تخفیف روی دکمه زیر کلیک نمایید.</p>
              <button type="button" className="btn-add-tab-action" onClick={openNewCouponModal}>
                <Plus size={16} />
                <span>افزودن کد تخفیف جدید</span>
              </button>
            </div>
          ) : (
            <div className="erp-admin-coupons-grid">
              {data.coupons.map(coupon => (
                <div key={coupon.code} className="erp-admin-coupon-card">
                  <div className="coupon-code-banner">
                    <code>{coupon.code}</code>
                    <button
                      type="button"
                      className={`status-pill clickable ${coupon.is_active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleCouponActive(coupon)}
                      title="برای تغییر وضعیت کلیک کنید"
                    >
                      {coupon.is_active ? '✓ فعال' : '✕ غیرفعال'}
                    </button>
                  </div>
                  <div className="coupon-card-details">
                    <p>
                      <strong>میزان تخفیف:</strong>{' '}
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>
                        {coupon.discount_type === 'percent' ? `${coupon.discount_value} درصد` : money(coupon.discount_value)}
                      </span>
                    </p>
                    {coupon.max_discount_amount && coupon.discount_type === 'percent' && (
                      <p><small>حداکثر تخفیف: {money(coupon.max_discount_amount)}</small></p>
                    )}
                    {coupon.min_order_amount && (
                      <p><small>حداقل سفارش: {money(coupon.min_order_amount)}</small></p>
                    )}
                  </div>
                  <div className="coupon-card-actions">
                    <button 
                      type="button" 
                      className="btn-icon-action edit"
                      onClick={() => handleEditCoupon(coupon)}
                      title="ویرایش کد تخفیف"
                      style={{ marginLeft: '6px' }}
                    >
                      <Edit3 size={15} />
                    </button>
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
          )}
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
                      <strong>انتخاب ماژول‌های این صنف و تعیین ماژول‌های الزامی:</strong>
                      <p>ماژول‌های مورد نظر را انتخاب کنید. همچنین با فعال کردن دکمه <strong>«🔒 الزامی»</strong>، خرید آن ماژول برای این صنف اجباری و قفل خواهد شد.</p>
                    </div>
                    <div className="selector-quick-actions">
                      <button type="button" className="btn-quick" onClick={selectAllModulesForTab}>انتخاب همه</button>
                      <button type="button" className="btn-quick" onClick={clearAllModulesForTab}>عدم انتخاب</button>
                    </div>
                  </div>

                  {(() => {
                    const activeModsList = (data?.modules || []).filter(mod => mod.is_active !== false);
                    const selectedCount = (tabForm.default_modules || []).filter(id => activeModsList.some(m => m.id === id)).length;
                    const mandatoryCount = (tabForm.mandatory_modules || []).filter(id => activeModsList.some(m => m.id === id)).length;
                    return (
                      <>
                        <div className="selected-count-bar">
                          <span>تعداد ماژول‌های انتخابی: <strong>{selectedCount} از {activeModsList.length}</strong></span>
                          {mandatoryCount > 0 && (
                            <span style={{ marginRight: '16px', color: '#b45309', fontWeight: 600 }}>
                              (🔒 {mandatoryCount} ماژول الزامی برای این صنف)
                            </span>
                          )}
                        </div>

                        <div className="modules-checkbox-grid">
                          {activeModsList.map(mod => {
                            const isChecked = (tabForm.default_modules || []).includes(mod.id);
                            const isMandatory = (tabForm.mandatory_modules || []).includes(mod.id);
                            return (
                              <div 
                                key={mod.id} 
                                className={`mod-checkbox-card ${isChecked ? 'selected' : ''} ${isMandatory ? 'mandatory-active' : ''}`}
                                onClick={() => toggleModuleInTabForm(mod.id)}
                              >
                                <div className={`custom-check-box ${isChecked ? 'checked' : ''}`}>
                                  {isChecked && <Check size={13} color="#fff" />}
                                </div>
                                <div className="mod-info" style={{ flex: 1, minWidth: 0 }}>
                                  <span className="mod-title">{mod.title}</span>
                                  <span className="mod-price">{money(mod.price)}</span>
                                </div>
                                <button
                                  type="button"
                                  className={`btn-mod-mandatory-toggle ${isMandatory ? 'active' : ''}`}
                                  title={isMandatory ? 'این ماژول برای این صنف الزامی و غیرقابل حذف است. برای تبدیل به اختیاری کلیک کنید.' : 'کلیک کنید تا این ماژول برای این صنف الزامی (قفل شده) شود'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMandatoryInTabForm(mod.id);
                                  }}
                                >
                                  <Lock size={12} />
                                  <span>{isMandatory ? 'الزامی' : 'اختیاری'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
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
                        step="any"
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
      {/* MODAL: ADD / EDIT COUPON */}
      {/* ------------------------------------------------------------- */}
      {couponModalOpen && (
        <div className="erp-modal-overlay" onClick={() => setCouponModalOpen(false)}>
          <div className="erp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="erp-modal-head">
              <div className="head-title">
                <Tag size={18} color="#0870d1" />
                <h3>{editingCoupon ? `ویرایش کد تخفیف «${editingCoupon.code}»` : 'افزودن کد تخفیف جدید'}</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setCouponModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              <div className="erp-modal-body">
                <div className="form-group">
                  <label>کد تخفیف (لاتین و بدون فاصله) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. SUMMER20, DISCOUNT50"
                    value={couponForm.code}
                    onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                    disabled={!!editingCoupon}
                    required
                  />
                  {editingCoupon && <small className="help-text">شناسه کد تخفیف قابل تغییر نیست.</small>}
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
                  <label>مقدار تخفیف {couponForm.discount_type === 'percent' ? '(درصد)' : '(تومان)'} <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="number"
                    min="1"
                    value={couponForm.discount_value}
                    onChange={e => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                    required
                  />
                </div>

                {couponForm.discount_type === 'percent' && (
                  <div className="form-group">
                    <label>حداکثر مبلغ تخفیف (اختیاری - به تومان)</label>
                    <input 
                      type="number"
                      placeholder="بدون سقف"
                      value={couponForm.max_discount_amount}
                      onChange={e => setCouponForm({ ...couponForm, max_discount_amount: e.target.value })}
                    />
                    <small className="help-text">سقف تخفیف برای سفارش‌های بزرگ.</small>
                  </div>
                )}

                <div className="form-group">
                  <label>حداقل مبلغ سفارش (اختیاری - به تومان)</label>
                  <input 
                    type="number"
                    placeholder="بدون محدودیت"
                    value={couponForm.min_order_amount}
                    onChange={e => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
                  />
                  <small className="help-text">حداقل مبلغ کل فاکتور برای فعال شدن این کد تخفیف.</small>
                </div>

                <div className="form-group" style={{ marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={couponForm.is_active}
                      onChange={e => setCouponForm({ ...couponForm, is_active: e.target.checked })}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      این کد تخفیف فعال و قابل استفاده باشد
                    </span>
                  </label>
                </div>
              </div>

              <div className="erp-modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setCouponModalOpen(false)}>
                  انصراف
                </button>
                <button type="submit" className="btn-submit-save">
                  <Save size={16} />
                  <span>{editingCoupon ? 'بروزرسانی کد تخفیف' : 'ذخیره کد تخفیف'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* BULK ACTION MODALS */}
      {/* ============================================================= */}

      {/* 1. Bulk Price Modal */}
      {bulkModal === 'price' && (
        <div className="erp-modal-overlay" onClick={() => !bulkSubmitting && setBulkModal(null)}>
          <div className="erp-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="erp-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={20} color="#2563eb" />
                <h3>قیمت‌گذاری یکسان ({selectedModuleIds.length.toLocaleString('fa-IR')} ماژول)</h3>
              </div>
              <button 
                type="button" 
                className="btn-close-modal" 
                disabled={bulkSubmitting}
                onClick={() => setBulkModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (bulkPriceVal === '' || isNaN(Number(bulkPriceVal))) {
                alert('لطفاً مبلغ معتبری وارد کنید.');
                return;
              }
              handleBulkAction('set_price', Number(bulkPriceVal));
            }}>
              <div className="erp-modal-body">
                <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.6 }}>
                  مبلغ ماهانه مورد نظر خود را وارد کنید. این قیمت به عنوان نرخ پایه ماهانه بر روی تمامی <strong>{selectedModuleIds.length.toLocaleString('fa-IR')}</strong> ماژول انتخاب‌شده اعمال خواهد شد.
                </p>

                <div className="form-group">
                  <label>قیمت ماهانه جدید (تومان)</label>
                  <input 
                    type="number"
                    step="any"
                    min="0"
                    placeholder="مثلاً ۲,۵۰۰,۰۰۰"
                    value={bulkPriceVal}
                    onChange={e => setBulkPriceVal(e.target.value)}
                    autoFocus
                    required
                    style={{ fontSize: '15px', fontWeight: 'bold' }}
                  />
                  {bulkPriceVal !== '' && !isNaN(Number(bulkPriceVal)) && (
                    <small style={{ color: '#0284c7', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      معادل: {money(bulkPriceVal)}
                    </small>
                  )}
                </div>

                <div style={{ marginTop: '14px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>مبالغ پیشنهادی و استاندارد:</span>
                  <div className="bulk-presets-chips">
                    {[
                      { label: '۲۵۰ هزار تومان (پایه سیستم)', val: 250000 },
                      { label: '۸۰۰ هزار تومان (تعرفه متوسط)', val: 800000 },
                      { label: '۱ میلیون تومان (تعرفه پروژه)', val: 1000000 },
                      { label: '۲.۵ میلیون تومان (ماژول‌های پیشرفته)', val: 2500000 },
                    ].map(chip => (
                      <button 
                        key={chip.val}
                        type="button" 
                        className="chip-btn"
                        onClick={() => setBulkPriceVal(chip.val)}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="erp-modal-foot">
                <button type="button" className="btn-cancel" disabled={bulkSubmitting} onClick={() => setBulkModal(null)}>
                  انصراف
                </button>
                <button type="submit" className="btn-submit-save" disabled={bulkSubmitting}>
                  {bulkSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>اعمال قیمت برای {selectedModuleIds.length.toLocaleString('fa-IR')} ماژول</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Bulk Prerequisite / Dependency Modal */}
      {bulkModal === 'dependency' && (
        <div className="erp-modal-overlay" onClick={() => !bulkSubmitting && setBulkModal(null)}>
          <div className="erp-modal-card medium" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="erp-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link2 size={20} color="#8b5cf6" />
                <h3>مدیریت و انتساب پیش‌نیاز گروهی ({selectedModuleIds.length.toLocaleString('fa-IR')} ماژول انتخابی)</h3>
              </div>
              <button 
                type="button" 
                className="btn-close-modal" 
                disabled={bulkSubmitting}
                onClick={() => setBulkModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="erp-modal-body">
              <p style={{ color: '#475569', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                می‌توانید یک یا چند ماژول را با تیک زدن انتخاب نمایید تا به عنوان پیش‌نیاز به تمامی <strong>{selectedModuleIds.length.toLocaleString('fa-IR')}</strong> ماژول منتخب افزوده شده یا از پیش‌نیازهای آن‌ها حذف گردند:
              </p>

              <div className="modal-modules-selector-section">
                <div className="selector-head">
                  <div>
                    <strong>فهرست ماژول‌های پیش‌نیاز:</strong>
                    <p>ماژول‌هایی که برای فعال‌سازی ماژول‌های انتخاب‌شده ضروری خواهند بود</p>
                  </div>
                  <div className="selector-quick-actions">
                    <button 
                      type="button" 
                      className="btn-quick"
                      onClick={() => {
                        const availableIds = (data?.modules || [])
                          .filter(m => !selectedModuleIds.includes(m.id) || selectedModuleIds.length > 1)
                          .map(m => m.id);
                        setBulkSelectedDeps(availableIds);
                      }}
                    >
                      انتخاب همه
                    </button>
                    <button 
                      type="button" 
                      className="btn-quick"
                      onClick={() => setBulkSelectedDeps([])}
                    >
                      لغو انتخاب
                    </button>
                  </div>
                </div>

                {/* Quick Search */}
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', right: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="جستجوی عنوان یا شناسه ماژول..."
                    value={bulkDepSearch}
                    onChange={e => setBulkDepSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 36px 8px 12px',
                      fontSize: '12.5px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  />
                  {bulkDepSearch && (
                    <button
                      type="button"
                      onClick={() => setBulkDepSearch('')}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                  <span>
                    تعداد پیش‌نیازهای تیک‌خورده: <strong style={{ color: '#8b5cf6' }}>{bulkSelectedDeps.length.toLocaleString('fa-IR')}</strong> مورد
                  </span>
                </div>

                <div className="modules-checkbox-grid" style={{ maxHeight: '250px' }}>
                  {(data?.modules || [])
                    .filter(m => !selectedModuleIds.includes(m.id) || selectedModuleIds.length > 1)
                    .filter(m => {
                      if (!bulkDepSearch.trim()) return true;
                      const q = bulkDepSearch.toLowerCase();
                      return (m.title && m.title.toLowerCase().includes(q)) || (m.id && m.id.toLowerCase().includes(q));
                    })
                    .map(mod => {
                      const isChecked = bulkSelectedDeps.includes(mod.id);
                      return (
                        <label 
                          key={mod.id} 
                          className={`mod-checkbox-card ${isChecked ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleBulkDep(mod.id);
                          }}
                        >
                          <div className={`custom-check-box ${isChecked ? 'checked' : ''}`} style={isChecked ? { background: '#8b5cf6', borderColor: '#8b5cf6' } : {}}>
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
            </div>

            <div className="erp-modal-foot" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn-cancel" disabled={bulkSubmitting} onClick={() => setBulkModal(null)}>
                انصراف
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn-cancel" 
                  style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                  disabled={bulkSubmitting || bulkSelectedDeps.length === 0}
                  onClick={() => handleBulkAction('remove_dependency', bulkSelectedDeps)}
                >
                  حذف این ({bulkSelectedDeps.length.toLocaleString('fa-IR')}) پیش‌نیاز
                </button>
                <button 
                  type="button" 
                  className="btn-submit-save" 
                  style={{ background: '#8b5cf6' }}
                  disabled={bulkSubmitting || bulkSelectedDeps.length === 0}
                  onClick={() => handleBulkAction('add_dependency', bulkSelectedDeps)}
                >
                  {bulkSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Link2 size={16} />}
                  <span>افزودن ({bulkSelectedDeps.length.toLocaleString('fa-IR')}) پیش‌نیاز</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bulk Preset / Industry Modal */}
      {bulkModal === 'preset' && (
        <div className="erp-modal-overlay" onClick={() => !bulkSubmitting && setBulkModal(null)}>
          <div className="erp-modal-card medium" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="erp-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="#0284c7" />
                <h3>انتساب گروهی صنف و تب ({selectedModuleIds.length.toLocaleString('fa-IR')} ماژول انتخابی)</h3>
              </div>
              <button 
                type="button" 
                className="btn-close-modal" 
                disabled={bulkSubmitting}
                onClick={() => setBulkModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="erp-modal-body">
              <p style={{ color: '#475569', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                صنف‌ها و تب‌های پیش‌فرض مورد نظر خود را با تیک زدن انتخاب فرمایید تا تمامی <strong>{selectedModuleIds.length.toLocaleString('fa-IR')}</strong> ماژول منتخب به آن‌ها متصل شوند یا از آن‌ها خارج گردند:
              </p>

              <div className="modal-modules-selector-section">
                <div className="selector-head">
                  <div>
                    <strong>فهرست صنف‌ها و تب‌های پیش‌فرض:</strong>
                    <p>صنف‌هایی که ماژول‌های انتخابی در تب آن‌ها قرار می‌گیرند</p>
                  </div>
                  <div className="selector-quick-actions">
                    <button 
                      type="button" 
                      className="btn-quick"
                      onClick={() => {
                        const allPresetIds = (data?.presets || []).map(p => p.id);
                        setBulkSelectedPresets(allPresetIds);
                      }}
                    >
                      انتخاب همه صنف‌ها
                    </button>
                    <button 
                      type="button" 
                      className="btn-quick"
                      onClick={() => setBulkSelectedPresets([])}
                    >
                      لغو انتخاب
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                  <span>
                    تعداد صنف‌های تیک‌خورده: <strong style={{ color: '#0284c7' }}>{bulkSelectedPresets.length.toLocaleString('fa-IR')}</strong> صنف
                  </span>
                </div>

                <div className="modules-checkbox-grid" style={{ maxHeight: '250px' }}>
                  {(data?.presets || []).map(preset => {
                    const isChecked = bulkSelectedPresets.includes(preset.id);
                    return (
                      <label 
                        key={preset.id} 
                        className={`mod-checkbox-card ${isChecked ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleBulkPreset(preset.id);
                        }}
                      >
                        <div className={`custom-check-box ${isChecked ? 'checked' : ''}`} style={isChecked ? { background: '#0284c7', borderColor: '#0284c7' } : {}}>
                          {isChecked && <Check size={13} color="#fff" />}
                        </div>
                        <div className="mod-info">
                          <span className="mod-title">{preset.title}</span>
                          <span className="mod-price">شناسه صنف: {preset.id}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="erp-modal-foot" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn-cancel" disabled={bulkSubmitting} onClick={() => setBulkModal(null)}>
                انصراف
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn-cancel" 
                  style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                  disabled={bulkSubmitting || bulkSelectedPresets.length === 0}
                  onClick={() => handleBulkAction('remove_preset', bulkSelectedPresets)}
                >
                  خروج از این ({bulkSelectedPresets.length.toLocaleString('fa-IR')}) صنف
                </button>
                <button 
                  type="button" 
                  className="btn-submit-save" 
                  style={{ background: '#0284c7' }}
                  disabled={bulkSubmitting || bulkSelectedPresets.length === 0}
                  onClick={() => handleBulkAction('add_preset', bulkSelectedPresets)}
                >
                  {bulkSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Layers size={16} />}
                  <span>افزودن به ({bulkSelectedPresets.length.toLocaleString('fa-IR')}) صنف</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bulk Delete Confirmation Modal */}
      {bulkModal === 'delete' && (
        <div className="erp-modal-overlay" onClick={() => !bulkSubmitting && setBulkModal(null)}>
          <div className="erp-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="erp-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={22} color="#ef4444" />
                <h3 style={{ color: '#dc2626' }}>تأیید حذف گروهی ماژول‌ها</h3>
              </div>
              <button 
                type="button" 
                className="btn-close-modal" 
                disabled={bulkSubmitting}
                onClick={() => setBulkModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="erp-modal-body">
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '14px',
                borderRadius: '8px',
                color: '#991b1b',
                fontSize: '13px',
                lineHeight: 1.6,
                marginBottom: '14px'
              }}>
                <strong>هشدار امنیتی و حذفی:</strong> شما در حال حذف دائم <strong>{selectedModuleIds.length.toLocaleString('fa-IR')}</strong> ماژول از ساختار سیستم ERP کارویتا هستید. تمامی ارجاعات این ماژول‌ها در صنف‌ها و پیش‌نیازها نیز پاک خواهند شد. این عملیات غیرقابل بازگشت است.
              </div>

              <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {selectedModuleIds.map(id => {
                  const m = data?.modules?.find(item => item.id === id);
                  return (
                    <span 
                      key={id}
                      style={{
                        fontSize: '11.5px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        color: '#334155'
                      }}
                    >
                      {m ? m.title : id}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="erp-modal-foot">
              <button type="button" className="btn-cancel" disabled={bulkSubmitting} onClick={() => setBulkModal(null)}>
                انصراف
              </button>
              <button 
                type="button" 
                className="btn-submit-save" 
                style={{ background: '#dc2626' }}
                disabled={bulkSubmitting}
                onClick={() => handleBulkAction('delete', null)}
              >
                {bulkSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                <span>بله، تمام {selectedModuleIds.length.toLocaleString('fa-IR')} ماژول را حذف کن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
