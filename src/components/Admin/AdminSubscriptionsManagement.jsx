import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock3,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Phone,
  Building2,
  Package,
  RefreshCw,
  Edit3,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';

const date = d => d ? new Date(d).toLocaleDateString('fa-IR') : '—';

function getRemainingDays(expiresAt, status) {
  if (status === 'cancelled') return { text: 'اشتراک لغو شده', days: -9999, type: 'cancelled' };
  if (!expiresAt) return { text: '—', days: 0, type: 'none' };
  const diff = new Date(expiresAt).getTime() - new Date().getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: `${Math.abs(days)} روز گذشته (منقضی)`, days, type: 'expired' };
  if (days === 0) return { text: 'امروز منقضی می‌شود', days, type: 'today' };
  return { text: `${days} روز باقی‌مانده`, days, type: 'active' };
}

export function AdminSubscriptionsManagement({ onReloadParent }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const [selectedSub, setSelectedSub] = useState(null);
  const [editStatus, setEditStatus] = useState('active');
  const [editPeriod, setEditPeriod] = useState('3_months');
  const [editUserCount, setEditUserCount] = useState(1);
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api('/admin/subscriptions');
      const list = res?.data || res?.subscriptions || [];
      setSubscriptions(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'خطا در دریافت لیست اشتراک‌ها و دوره‌های آزمایشی');
    } finally {
      setLoading(false);
    }
  };

  const handleInlineUpdate = async (id, field, value) => {
    try {
      const payload = { id, [field]: value };
      await api('/admin/subscriptions', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setSubscriptions(prev =>
        prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
      );

      showToast(
        field === 'status' 
          ? `وضعیت اشتراک #${id} با موفقیت تغییر یافت.`
          : `دوره اشتراک #${id} با موفقیت تغییر یافت.`
      );

      if (onReloadParent) onReloadParent();
    } catch (err) {
      showToast(err.message || 'خطا در بروزرسانی اشتراک', 'error');
    }
  };

  const handleOpenEdit = (sub) => {
    setSelectedSub(sub);
    setEditStatus(sub.status || 'active');
    setEditPeriod(sub.billing_period || '3_months');
    setEditUserCount(sub.user_count || 1);
    const dateVal = sub.expires_at ? new Date(sub.expires_at).toISOString().split('T')[0] : '';
    setEditExpiresAt(dateVal);
  };

  const handleQuickExtend = (days) => {
    const base = editExpiresAt ? new Date(editExpiresAt) : new Date();
    const target = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    setEditExpiresAt(target.toISOString().split('T')[0]);
  };

  const handleSaveModal = async () => {
    if (!selectedSub) return;
    setSavingEdit(true);
    try {
      const payload = {
        id: selectedSub.id,
        status: editStatus,
        billing_period: editPeriod,
        user_count: Number(editUserCount) || 1,
        expires_at: editExpiresAt ? new Date(editExpiresAt).toISOString() : undefined,
      };

      const res = await api('/admin/subscriptions', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const updated = res.data || {};
      setSubscriptions(prev =>
        prev.map(s => (s.id === selectedSub.id ? { ...s, ...updated, status: editStatus, billing_period: editPeriod, user_count: Number(editUserCount), expires_at: payload.expires_at || s.expires_at } : s))
      );

      showToast(`تغییرات اشتراک #${selectedSub.id} با موفقیت اعمال شد.`);
      setSelectedSub(null);
      if (onReloadParent) onReloadParent();
    } catch (err) {
      showToast(err.message || 'خطا در ذخیره تغییرات اشتراک', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const stats = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter(s => s.status === 'active').length;
    const trials = subscriptions.filter(s => s.source === 'trial').length;
    const expiredOrCancelled = subscriptions.filter(s => s.status === 'expired' || s.status === 'cancelled').length;
    return { total, active, trials, expiredOrCancelled };
  }, [subscriptions]);

  const filteredList = useMemo(() => {
    return subscriptions.filter(item => {
      if (typeFilter !== 'all' && item.source !== typeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (periodFilter !== 'all' && item.billing_period !== periodFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const userName = (item.user_name || '').toLowerCase();
        const mobile = (item.mobile || '').toLowerCase();
        const company = (item.company_name || '').toLowerCase();
        const pkg = (item.package_name || item.title || '').toLowerCase();
        const orderNum = (item.order_number || '').toLowerCase();
        const idStr = String(item.id);

        const match =
          userName.includes(q) ||
          mobile.includes(q) ||
          company.includes(q) ||
          pkg.includes(q) ||
          orderNum.includes(q) ||
          idStr.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [subscriptions, typeFilter, statusFilter, periodFilter, searchQuery]);

  const handleSort = (columnKey) => {
    setSortConfig(prev => {
      if (prev.key === columnKey) {
        return { key: columnKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const sortedList = useMemo(() => {
    let result = [...filteredList];
    if (!sortConfig.key) return result;

    return result.sort((a, b) => {
      let comp = 0;
      switch (sortConfig.key) {
        case 'id':
          comp = Number(a.id) - Number(b.id);
          break;

        case 'user': {
          const aStr = (a.user_name || a.mobile || '').toLowerCase();
          const bStr = (b.user_name || b.mobile || '').toLowerCase();
          comp = aStr.localeCompare(bStr, 'fa');
          break;
        }

        case 'package': {
          const aPkg = (a.package_name || a.title || '').toLowerCase();
          const bPkg = (b.package_name || b.title || '').toLowerCase();
          comp = aPkg.localeCompare(bPkg, 'fa');
          break;
        }

        case 'source': {
          const aSrc = a.source === 'trial' ? 'آزمایشی' : 'خرید';
          const bSrc = b.source === 'trial' ? 'آزمایشی' : 'خرید';
          comp = aSrc.localeCompare(bSrc, 'fa');
          break;
        }

        case 'period': {
          const periodWeights = { monthly: 1, '3_months': 3, '6_months': 6, yearly: 12 };
          const wA = periodWeights[a.billing_period] || 0;
          const wB = periodWeights[b.billing_period] || 0;
          comp = wA - wB;
          break;
        }

        case 'expires_at': {
          const tA = a.expires_at ? new Date(a.expires_at).getTime() : 0;
          const tB = b.expires_at ? new Date(b.expires_at).getTime() : 0;
          comp = tA - tB;
          break;
        }

        case 'status': {
          const statusWeights = { active: 3, expired: 2, cancelled: 1 };
          const sA = statusWeights[a.status] || 0;
          const sB = statusWeights[b.status] || 0;
          comp = sA - sB;
          break;
        }

        default:
          comp = 0;
      }
      return sortConfig.direction === 'asc' ? comp : -comp;
    });
  }, [filteredList, sortConfig]);

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={14} style={{ opacity: 0.45, marginRight: '4px' }} />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={14} style={{ color: '#0870d1', marginRight: '4px' }} />
    ) : (
      <ArrowDown size={14} style={{ color: '#0870d1', marginRight: '4px' }} />
    );
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || periodFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setPeriodFilter('all');
  };

  return (
    <div className="admin-subscriptions-management" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 9999,
          background: toastMsg.type === 'error' ? '#991b1b' : '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '13.5px',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {toastMsg.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock3 size={22} color="#0870d1" />
            <span>مدیریت اشتراک‌ها و دوره‌های آزمایشی کاربران</span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted, #64748b)' }}>
            نظارت بر وضعیت دوره‌های فعال، تمدید دستی، تغییر دوره صورت‌حساب و تخصیص سقف کاربران
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSubscriptions}
          disabled={loading}
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1.5px solid var(--border-color, #cbd5e1)',
            borderRadius: '10px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-main, #334155)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>بروزرسانی داده‌ها</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px'
      }}>
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
        }}>
          <div style={{ width: '44px', height: '44px', background: 'rgba(8, 112, 209, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} color="#0870d1" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', display: 'block' }}>کل اشتراک‌ها و دوره‌ها</span>
            <strong style={{ fontSize: '18px', color: 'var(--text-main, #0f172a)', fontWeight: 800 }}>
              {Number(stats.total).toLocaleString('fa-IR')} <small style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted, #64748b)' }}>مورد</small>
            </strong>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
        }}>
          <div style={{ width: '44px', height: '44px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} color="#10b981" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', display: 'block' }}>اشتراک‌های فعال</span>
            <strong style={{ fontSize: '18px', color: '#10b981', fontWeight: 800 }}>
              {Number(stats.active).toLocaleString('fa-IR')} <small style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted, #64748b)' }}>فعال</small>
            </strong>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
        }}>
          <div style={{ width: '44px', height: '44px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock3 size={22} color="#f59e0b" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', display: 'block' }}>دوره‌های آزمایشی (Trial)</span>
            <strong style={{ fontSize: '18px', color: '#f59e0b', fontWeight: 800 }}>
              {Number(stats.trials).toLocaleString('fa-IR')} <small style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted, #64748b)' }}>آزمایشی</small>
            </strong>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
        }}>
          <div style={{ width: '44px', height: '44px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} color="#ef4444" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', display: 'block' }}>منقضی یا لغو شده</span>
            <strong style={{ fontSize: '18px', color: '#ef4444', fontWeight: 800 }}>
              {Number(stats.expiredOrCancelled).toLocaleString('fa-IR')} <small style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted, #64748b)' }}>مورد</small>
            </strong>
          </div>
        </div>
      </div>
      {/* Filter and Search Toolbar */}
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}>
        
        {/* Search Box */}
        <div style={{
          position: 'relative',
          flex: '1 1 280px',
          maxWidth: '460px',
          minWidth: '220px'
        }}>
          <Search size={17} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="جستجو با نام کاربر، شماره موبایل، شرکت، نام اشتراک..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 38px 9px 34px',
              border: '1.5px solid var(--border-color, #cbd5e1)',
              borderRadius: '10px',
              fontSize: '13px',
              background: 'var(--bg-card, #ffffff)',
              color: 'var(--text-main, #0f172a)',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '2px'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>نوع:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                background: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #334155)',
                fontSize: '12.5px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">همه انواع</option>
              <option value="purchase">خرید شده (سفارش)</option>
              <option value="trial">دوره آزمایشی (Trial)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>وضعیت:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                background: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #334155)',
                fontSize: '12.5px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="expired">منقضی شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>دوره:</span>
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                background: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #334155)',
                fontSize: '12.5px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">همه دوره‌ها</option>
              <option value="monthly">ماهانه</option>
              <option value="3_months">۳ ماهه</option>
              <option value="6_months">۶ ماهه</option>
              <option value="yearly">سالانه</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#ef4444',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <X size={13} />
              <span>پاکسازی فیلترها</span>
            </button>
          )}

        </div>

      </div>

      {/* Main Subscriptions Table */}
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block', color: '#0870d1' }} />
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>در حال دریافت اطلاعات اشتراک‌ها و دوره‌ها…</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#ef4444' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
            <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700 }}>{error}</p>
            <button
              type="button"
              onClick={fetchSubscriptions}
              style={{
                padding: '8px 16px',
                background: '#0870d1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              تلاش مجدد
            </button>
          </div>
        ) : sortedList.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
            <Clock3 size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
              اشتراکی مطابق با معیارهای جستجو یافت نشد
            </p>
            <p style={{ margin: '0 0 16px', fontSize: '13px' }}>
              لطفاً فیلترها را تغییر داده یا عبارت جستجوی دیگری را وارد کنید.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  padding: '8px 16px',
                  background: 'var(--bg-main, #f1f5f9)',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                حذف تمام فیلترها
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'right',
              fontSize: '13px'
            }}>
              <thead>
                <tr style={{
                  background: 'var(--bg-hover, #f8fafc)',
                  borderBottom: '1.5px solid var(--border-color, #e2e8f0)',
                  color: 'var(--text-muted, #475569)',
                  fontSize: '12.5px',
                  fontWeight: 700
                }}>
                  <th 
                    onClick={() => handleSort('id')}
                    style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none', width: '70px' }}
                    title="مرتب‌سازی بر اساس شناسه اشتراک"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span>#</span>
                      {renderSortIcon('id')}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('user')}
                    style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                    title="مرتب‌سازی بر اساس نام کاربر"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span>کاربر و شرکت</span>
                      {renderSortIcon('user')}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('package')}
                    style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                    title="مرتب‌سازی بر اساس نام بسته یا اشتراک"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span>اشتراک و ماژول‌ها</span>
                      {renderSortIcon('package')}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('source')}
                    style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                    title="مرتب‌سازی بر اساس نوع دوره"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span>نوع دوره</span>
                      {renderSortIcon('source')}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('period')}
                    style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                    title="مرتب‌سازی بر اساس دوره صورت‌حساب"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span>دوره خرید</span>
                      {renderSortIcon('period')}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('expires_at')}
                    style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                    title="مرتب‌سازی بر اساس تاریخ انقضا"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span>تاریخ انقضا</span>
                      {renderSortIcon('expires_at')}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('status')}
                    style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                    title="مرتب‌سازی بر اساس وضعیت اشتراک"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span>وضعیت اشتراک</span>
                      {renderSortIcon('status')}
                    </div>
                  </th>

                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '130px' }}>
                    <span>عملیات و تمدید</span>
                  </th>
                </tr>
              </thead>
              <tbody>

                {sortedList.map((item, index) => {
                  const rem = getRemainingDays(item.expires_at, item.status);
                  const isTrial = item.source === 'trial';
                  const modulesCount = Array.isArray(item.module_ids) ? item.module_ids.length : (item.module_count || 0);

                  return (
                    <tr 
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border-color, #f1f5f9)',
                        background: index % 2 === 1 ? 'var(--bg-hover, rgba(248, 250, 252, 0.5))' : 'transparent',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                        #{item.id}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                            {item.user_name || '—'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Phone size={11} />
                              {item.mobile || '—'}
                            </span>
                            {item.company_name && item.company_name !== '—' && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Building2 size={11} />
                                {item.company_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main, #1e293b)' }}>
                            {item.package_name || item.title || 'اشتراک کارویتا'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>
                            <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '6px', fontWeight: 600 }}>
                              {modulesCount} ماژول ERP
                            </span>
                            <span>•</span>
                            <span>سقف {Number(item.user_count || 1).toLocaleString('fa-IR')} کاربر</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {isTrial ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: '#b45309',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            padding: '3px 9px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 700
                          }}>
                            <Clock3 size={12} />
                            دوره آزمایشی
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'rgba(8, 112, 209, 0.08)',
                            color: '#0870d1',
                            border: '1px solid rgba(8, 112, 209, 0.2)',
                            padding: '3px 9px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 700
                          }}>
                            <Package size={12} />
                            خرید رسمی
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={item.billing_period || '3_months'}
                          onChange={e => handleInlineUpdate(item.id, 'billing_period', e.target.value)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '8px',
                            border: '1.5px solid var(--border-color, #cbd5e1)',
                            background: 'var(--bg-card, #ffffff)',
                            color: 'var(--text-main, #334155)',
                            fontSize: '12px',
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="monthly">ماهانه</option>
                          <option value="3_months">۳ ماهه</option>
                          <option value="6_months">۶ ماهه</option>
                          <option value="yearly">سالانه</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                            {date(item.expires_at)}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: rem.type === 'expired' || rem.type === 'cancelled' ? '#ef4444' : rem.type === 'today' ? '#f59e0b' : '#10b981'
                          }}>
                            {rem.text}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={item.status || 'active'}
                          onChange={e => handleInlineUpdate(item.id, 'status', e.target.value)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer',
                            border: item.status === 'active' 
                              ? '1.5px solid rgba(16, 185, 129, 0.4)' 
                              : item.status === 'expired' 
                              ? '1.5px solid rgba(239, 68, 68, 0.4)' 
                              : '1.5px solid #cbd5e1',
                            background: item.status === 'active' 
                              ? 'rgba(16, 185, 129, 0.08)' 
                              : item.status === 'expired' 
                              ? 'rgba(239, 68, 68, 0.08)' 
                              : '#f8fafc',
                            color: item.status === 'active' 
                              ? '#065f46' 
                              : item.status === 'expired' 
                              ? '#991b1b' 
                              : '#64748b'
                          }}
                        >
                          <option value="active">فعال</option>
                          <option value="expired">منقضی</option>
                          <option value="cancelled">لغو شده</option>
                        </select>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'rgba(8, 112, 209, 0.08)',
                            color: '#0870d1',
                            border: '1px solid rgba(8, 112, 209, 0.25)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <Edit3 size={13} />
                          <span>تمدید و ویرایش</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && sortedList.length > 0 && (
          <div style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            background: 'var(--bg-hover, #f8fafc)',
            fontSize: '12px',
            color: 'var(--text-muted, #64748b)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span>
              نمایش <b>{Number(sortedList.length).toLocaleString('fa-IR')}</b> از کل <b>{Number(subscriptions.length).toLocaleString('fa-IR')}</b> اشتراک
            </span>
            <span>
              برای مرتب‌سازی بر روی عنوان هر ستون کلیک کنید. تغییر وضعیت یا دوره به صورت آنی ذخیره می‌شود.
            </span>
          </div>
        )}
      </div>

      {/* Extension & Edit Modal */}
      {selectedSub && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color, #e2e8f0)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-hover, #f8fafc)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock3 size={22} color="#0870d1" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                    ویرایش و تمدید اشتراک #{selectedSub.id}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
                    {selectedSub.user_name} ({selectedSub.mobile})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{
                background: 'rgba(8, 112, 209, 0.05)',
                border: '1px solid rgba(8, 112, 209, 0.15)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '13px',
                color: '#1e3a8a',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <span style={{ color: '#64748b' }}>عنوان بسته: </span>
                  <b>{selectedSub.package_name || selectedSub.title || 'اشتراک کارویتا'}</b>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>نوع: </span>
                  <b>{selectedSub.source === 'trial' ? 'دوره آزمایشی (Trial)' : 'خرید رسمی'}</b>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    وضعیت اشتراک:
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <option value="active">فعال</option>
                    <option value="expired">منقضی شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    دوره صورت‌حساب:
                  </label>
                  <select
                    value={editPeriod}
                    onChange={e => setEditPeriod(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <option value="monthly">ماهانه</option>
                    <option value="3_months">۳ ماهه</option>
                    <option value="6_months">۶ ماهه</option>
                    <option value="yearly">سالانه</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  سقف تعداد کاربر مجاز:
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={editUserCount}
                  onChange={e => setEditUserCount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  تاریخ انقضای جدید:
                </label>
                <input
                  type="date"
                  value={editExpiresAt}
                  onChange={e => setEditExpiresAt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
                
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', alignSelf: 'center' }}>افزایش سریع:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(30)}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    +۳۰ روز
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(90)}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    +۹۰ روز
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(180)}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    +۱۸۰ روز
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(365)}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    +۱ سال
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px 22px',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              background: 'var(--bg-hover, #f8fafc)'
            }}>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                disabled={savingEdit}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleSaveModal}
                disabled={savingEdit}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0870d1',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: savingEdit ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {savingEdit ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>در حال ذخیره…</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>ثبت تغییرات</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}





