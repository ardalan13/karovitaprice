import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Headphones, 
  User as UserIcon, 
  Crown, 
  Search, 
  Trash2, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  X, 
  Check, 
  AlertCircle,
  RefreshCw,
  Copy,
  SlidersHorizontal,
  ChevronDown,
  Info,
  ExternalLink,
  ArrowRightLeft,
  Package,
  CreditCard
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminUserDetailsModal } from './AdminUserDetailsModal';

export function AdminUsersManagement({ data = [], reload }) {
  const list = Array.isArray(data) ? data : [];
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all | admin | support | user
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Quick Mobile Role Switcher State
  const [quickMobile, setQuickMobile] = useState('');
  const [quickRole, setQuickRole] = useState('admin'); // admin | support | user
  const [quickLookupUser, setQuickLookupUser] = useState(null);
  const [quickLookupLoading, setQuickLookupLoading] = useState(false);
  const [quickLookupSearched, setQuickLookupSearched] = useState(false);
  const [quickActionLoading, setQuickActionLoading] = useState(false);

  // New admin / user form state
  const [formData, setFormData] = useState({
    mobile: '',
    first_name: '',
    last_name: '',
    email: '',
    job_title: '',
    role: 'admin',
  });

  // Convert digits helper
  const toEnDigits = (str) => {
    return String(str || '')
      .replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728))
      .replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584));
  };

  // Quick Lookup when mobile number is entered
  const handleQuickLookup = async (mobileToSearch) => {
    const raw = mobileToSearch !== undefined ? mobileToSearch : quickMobile;
    const clean = toEnDigits(raw).replace(/\D/g, '').trim();
    if (!clean || clean.length < 10) {
      setQuickLookupUser(null);
      setQuickLookupSearched(false);
      return;
    }

    setQuickLookupLoading(true);
    setError('');
    try {
      const res = await api(`/admin/users/lookup?mobile=${encodeURIComponent(clean)}`);
      setQuickLookupSearched(true);
      if (res.exists && res.user) {
        setQuickLookupUser(res.user);
        // Pre-select current role or switch target
        setQuickRole(res.user.role || 'admin');
      } else {
        setQuickLookupUser(null);
      }
    } catch (err) {
      setQuickLookupUser(null);
      setQuickLookupSearched(true);
    } finally {
      setQuickLookupLoading(false);
    }
  };

  // Handle Quick Role Toggle
  const handleQuickRoleToggle = async () => {
    const clean = toEnDigits(quickMobile).replace(/\D/g, '').trim();
    if (!clean || clean.length < 10) {
      setError('لطفاً شماره موبایل معتبر (۱۱ رقم) وارد نمایید.');
      return;
    }

    if (clean === '09111273476' && quickRole !== 'admin') {
      setError('شماره 09111273476 متعلق به مالک و مدیر ارشد سامانه است و امکان تغییر یا خلع دسترسی آن وجود ندارد.');
      return;
    }

    setQuickActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api('/admin/users/toggle-role', {
        method: 'POST',
        body: JSON.stringify({
          mobile: clean,
          role: quickRole,
        }),
      });

      setSuccessMsg(res.message || 'سطح دسترسی با موفقیت ذخیره گردید.');
      setQuickMobile('');
      setQuickLookupUser(null);
      setQuickLookupSearched(false);
      if (reload) reload();
    } catch (err) {
      setError(err.message || 'خطا در تغییر سطح دسترسی');
    } finally {
      setQuickActionLoading(false);
    }
  };

  const filteredUsers = list.filter(u => {
    const matchesRole = 
      roleFilter === 'all' ? true :
      roleFilter === 'admin' ? u.role === 'admin' :
      roleFilter === 'support' ? u.role === 'support' :
      u.role === 'user' || !u.role;

    const q = search.trim().toLowerCase();
    if (!q) return matchesRole;

    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const matchesSearch = 
      (u.mobile && u.mobile.includes(q)) ||
      fullName.includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.company_name && u.company_name.toLowerCase().includes(q)) ||
      (u.job_title && u.job_title.toLowerCase().includes(q));

    return matchesRole && matchesSearch;
  });

  const adminsCount = list.filter(u => u.role === 'admin').length;
  const supportCount = list.filter(u => u.role === 'support').length;
  const regularUsersCount = list.filter(u => u.role !== 'admin' && u.role !== 'support').length;

  async function handleAddUser(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanMobile = toEnDigits(formData.mobile || '').replace(/\D/g, '').trim();
    if (!cleanMobile) {
      setError('شماره موبایل الزامی است.');
      return;
    }
    if (cleanMobile.length < 10) {
      setError('شماره موبایل باید معتبر باشد (مثلاً 09123456789).');
      return;
    }

    setLoading(true);
    try {
      const res = await api('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          mobile: cleanMobile,
        }),
      });

      setSuccessMsg(res.message || 'کاربر با موفقیت ثبت و سطح دسترسی اعمال گردید.');
      setShowAddModal(false);
      setFormData({
        mobile: '',
        first_name: '',
        last_name: '',
        email: '',
        job_title: '',
        role: 'admin',
      });
      if (reload) reload();
    } catch (err) {
      setError(err.message || 'خطا در ثبت و اعطای دسترسی به کاربر');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(user, newRole) {
    if (user.is_owner || user.mobile === '09111273476') {
      alert('امکان تغییر سطح دسترسی مالک اصلی و مدیر ارشد سامانه وجود ندارد.');
      return;
    }

    const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile;
    const roleLabels = {
      admin: 'مدیر سیستم (Admin)',
      support: 'کارشناس پشتیبانی (Support)',
      user: 'کاربر عادی (User)',
    };

    const confirmMsg = `آیا از تغییر نقش کاربر «${userName}» به «${roleLabels[newRole] || newRole}» اطمینان دارید؟`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await api(`/admin/users/${user.id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      setSuccessMsg(res.message || `نقش کاربر «${userName}» با موفقیت به «${roleLabels[newRole]}» تغییر یافت.`);
      if (reload) reload();
    } catch (err) {
      alert(err.message || 'خطا در ویرایش سطح دسترسی');
    }
  }

  async function handleDeleteUser(user) {
    if (user.is_owner || user.mobile === '09111273476') {
      alert('امکان حذف حساب مالک اصلی و مدیر ارشد سامانه وجود ندارد.');
      return;
    }

    const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile;
    if (!confirm(`آیا از حذف کامل حساب کاربر «${userName}» (${user.mobile}) اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`)) {
      return;
    }

    try {
      const res = await api(`/admin/users/${user.id}`, { method: 'DELETE' });
      setSuccessMsg(res.message || `کاربر ${userName} با موفقیت حذف گردید.`);
      if (reload) reload();
    } catch (err) {
      alert(err.message || 'خطا در حذف کاربر');
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg(`شماره ${text} در حافظه موقت کپی شد.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Quick Mobile Role Switcher Card (Super Admin Feature) */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '8px', borderRadius: '10px' }}>
              <ArrowRightLeft size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
                تغییر سریع سطح دسترسی با شماره موبایل
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                تغییر فوری نقش کاربر به <strong style={{ color: '#b91c1c' }}>مدیر (Admin)</strong>، <strong style={{ color: '#c2410c' }}>پشتیبان (Support)</strong> یا <strong style={{ color: '#0369a1' }}>کاربر عادی (User)</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setShowAddModal(true); setError(''); }}
            style={{
              background: '#0870d1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(8, 112, 209, 0.25)'
            }}
          >
            <UserPlus size={16} />
            <span>افزودن کاربر یا مدیر با اطلاعات کامل</span>
          </button>
        </div>

        {/* Quick Action Input & Role Toggles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(320px, 1.8fr) auto',
          gap: '16px',
          alignItems: 'flex-end',
          background: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          {/* Mobile Input */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              شماره موبایل کاربر مورد نظر:
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="tel"
                placeholder="مثال: 09121112233"
                value={quickMobile}
                onChange={e => {
                  const val = e.target.value;
                  setQuickMobile(val);
                  const clean = toEnDigits(val).replace(/\D/g, '').trim();
                  if (clean.length === 11) {
                    handleQuickLookup(clean);
                  } else {
                    setQuickLookupUser(null);
                    setQuickLookupSearched(false);
                  }
                }}
                onBlur={() => handleQuickLookup()}
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  direction: 'ltr',
                  textAlign: 'right',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              {quickLookupLoading && (
                <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                  <RefreshCw size={14} className="spin" color="#0870d1" />
                </div>
              )}
            </div>
          </div>

          {/* 3 Role Choices Toggle Buttons */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              انتخاب نقش جدید:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => setQuickRole('admin')}
                style={{
                  border: quickRole === 'admin' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  background: quickRole === 'admin' ? '#fef2f2' : '#ffffff',
                  color: quickRole === 'admin' ? '#991b1b' : '#64748b',
                  fontWeight: quickRole === 'admin' ? 800 : 600,
                  padding: '9px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
              >
                <ShieldCheck size={16} color={quickRole === 'admin' ? '#dc2626' : '#94a3b8'} />
                <span>مدیر (Admin)</span>
              </button>

              {/* Support Button */}
              <button
                type="button"
                onClick={() => setQuickRole('support')}
                style={{
                  border: quickRole === 'support' ? '2px solid #f97316' : '1px solid #e2e8f0',
                  background: quickRole === 'support' ? '#fff7ed' : '#ffffff',
                  color: quickRole === 'support' ? '#9a3412' : '#64748b',
                  fontWeight: quickRole === 'support' ? 800 : 600,
                  padding: '9px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
              >
                <Headphones size={16} color={quickRole === 'support' ? '#ea580c' : '#94a3b8'} />
                <span>پشتیبان (Support)</span>
              </button>

              {/* User Button */}
              <button
                type="button"
                onClick={() => setQuickRole('user')}
                style={{
                  border: quickRole === 'user' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  background: quickRole === 'user' ? '#f0f9ff' : '#ffffff',
                  color: quickRole === 'user' ? '#075985' : '#64748b',
                  fontWeight: quickRole === 'user' ? 800 : 600,
                  padding: '9px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
              >
                <UserIcon size={16} color={quickRole === 'user' ? '#0284c7' : '#94a3b8'} />
                <span>کاربر عادی (User)</span>
              </button>
            </div>
          </div>

          {/* Action Submit Button */}
          <div>
            <button
              type="button"
              disabled={quickActionLoading || !quickMobile.trim()}
              onClick={handleQuickRoleToggle}
              style={{
                background: quickRole === 'admin' ? '#dc2626' : quickRole === 'support' ? '#ea580c' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: quickActionLoading || !quickMobile.trim() ? 'not-allowed' : 'pointer',
                opacity: quickActionLoading || !quickMobile.trim() ? 0.6 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                height: '42px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {quickActionLoading ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>در حال اعمال...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>اعمال و ذخیره نقش</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Lookup User Badge preview */}
        {quickLookupSearched && (
          <div style={{
            background: quickLookupUser ? '#f8fafc' : '#fffbeb',
            border: quickLookupUser ? '1px solid #e2e8f0' : '1px solid #fef3c7',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {quickLookupUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#1e293b' }}>
                  کاربر شناسایی شد: <strong>{quickLookupUser.full_name}</strong> ({quickLookupUser.mobile})
                </span>
                <span style={{ color: '#64748b' }}>
                  شرکت: <strong>{quickLookupUser.company_name}</strong>
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  background: quickLookupUser.role === 'admin' ? '#fee2e2' : quickLookupUser.role === 'support' ? '#ffedd5' : '#e0f2fe',
                  color: quickLookupUser.role === 'admin' ? '#991b1b' : quickLookupUser.role === 'support' ? '#9a3412' : '#0369a1',
                }}>
                  نقش فعلی: {quickLookupUser.role === 'admin' ? 'مدیر سیستم' : quickLookupUser.role === 'support' ? 'کارشناس پشتیبانی' : 'کاربر عادی'}
                </span>
              </div>
            ) : (
              <div style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={16} />
                <span>کاربری با این شماره ثبت نشده است؛ با ثبت نقش، این کاربر پیش‌تعریف می‌شود و با اولین ورود، دسترسی انتخابی را خواهد داشت.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          color: '#15803d',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13.5px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessMsg('')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13.5px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setError('')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Top Search & Filter Bar */}
      <div style={{
        background: '#ffffff',
        padding: '18px 20px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="جستجو با شماره موبایل، نام کاربر، ایمیل، شرکت یا سمت..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 38px 9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            style={{
              border: 'none',
              background: roleFilter === 'all' ? '#ffffff' : 'transparent',
              color: roleFilter === 'all' ? '#0f172a' : '#64748b',
              fontWeight: roleFilter === 'all' ? 700 : 500,
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: roleFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            همه کاربران ({list.length})
          </button>
          
          <button
            type="button"
            onClick={() => setRoleFilter('admin')}
            style={{
              border: 'none',
              background: roleFilter === 'admin' ? '#ffffff' : 'transparent',
              color: roleFilter === 'admin' ? '#b91c1c' : '#64748b',
              fontWeight: roleFilter === 'admin' ? 700 : 500,
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: roleFilter === 'admin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ShieldCheck size={14} color="#b91c1c" />
            مدیران ({adminsCount})
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('support')}
            style={{
              border: 'none',
              background: roleFilter === 'support' ? '#ffffff' : 'transparent',
              color: roleFilter === 'support' ? '#c2410c' : '#64748b',
              fontWeight: roleFilter === 'support' ? 700 : 500,
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: roleFilter === 'support' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Headphones size={14} color="#ea580c" />
            پشتیبان‌ها ({supportCount})
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('user')}
            style={{
              border: 'none',
              background: roleFilter === 'user' ? '#ffffff' : 'transparent',
              color: roleFilter === 'user' ? '#0369a1' : '#64748b',
              fontWeight: roleFilter === 'user' ? 700 : 500,
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: roleFilter === 'user' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            کاربران عادی ({regularUsersCount})
          </button>
        </div>
      </div>

      {/* 3. Comprehensive Users & Staff Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12.5px', fontWeight: 700 }}>
                <th style={{ padding: '14px 16px' }}>شماره موبایل کاربر</th>
                <th style={{ padding: '14px 16px' }}>نام و سمت سازمانی</th>
                <th style={{ padding: '14px 16px' }}>شرکت / حوزه فعالیت</th>
                <th style={{ padding: '14px 16px' }}>نقش و سطح دسترسی فعلی</th>
                <th style={{ padding: '14px 16px' }}>تغییر مستقیم نقش</th>
                <th style={{ padding: '14px 16px' }}>اشتراک‌ها</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    هیچ کاربری با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isOwner = user.is_owner || user.mobile === '09111273476';
                  const isAdmin = user.role === 'admin';
                  const isSupport = user.role === 'support';
                  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || '—';

                  return (
                    <tr 
                      key={user.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        background: isOwner ? '#fffbeb' : isAdmin ? '#fafafa' : '#ffffff',
                        transition: 'background 0.15s'
                      }}
                    >
                      {/* Mobile + Owner Tag + Copy */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px', color: '#0f172a', direction: 'ltr' }}>
                            {user.mobile}
                          </span>
                          <button
                            type="button"
                            title="کپی شماره موبایل"
                            onClick={() => copyToClipboard(user.mobile)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Copy size={13} />
                          </button>
                          {isOwner && (
                            <span style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <Crown size={12} color="#b45309" />
                              مالک و مدیر ارشد
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Name & Job Title */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <strong style={{ color: '#1e293b' }}>{fullName}</strong>
                          {user.job_title && (
                            <span style={{ fontSize: '11.5px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Briefcase size={11} />
                              {user.job_title}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Company & Industry */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ color: '#1e293b', fontWeight: 600 }}>{user.company_name || '—'}</span>
                          {user.industry && user.industry !== '—' && (
                            <small style={{ color: '#64748b' }}>{user.industry}</small>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        {isOwner ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            <Crown size={13} color="#dc2626" />
                            <span>مدیر ارشد و مالک</span>
                          </div>
                        ) : isAdmin ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            <ShieldCheck size={14} color="#dc2626" />
                            <span>مدیر سیستم (Admin)</span>
                          </div>
                        ) : isSupport ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#fff7ed',
                            color: '#c2410c',
                            border: '1px solid #fed7aa',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            <Headphones size={14} color="#ea580c" />
                            <span>کارشناس پشتیبانی</span>
                          </div>
                        ) : (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#f0f9ff',
                            color: '#0369a1',
                            border: '1px solid #bae6fd',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '12px'
                          }}>
                            <UserIcon size={14} color="#0284c7" />
                            <span>کاربر عادی (User)</span>
                          </div>
                        )}
                      </td>

                      {/* Interactive Role Toggle */}
                      <td style={{ padding: '14px 16px' }}>
                        {isOwner ? (
                          <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>غیرقابل تغییر</span>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                            <button
                              type="button"
                              title="تبدیل به مدیر سیستم"
                              onClick={() => handleRoleChange(user, 'admin')}
                              style={{
                                border: 'none',
                                background: user.role === 'admin' ? '#ef4444' : 'transparent',
                                color: user.role === 'admin' ? '#ffffff' : '#64748b',
                                fontWeight: user.role === 'admin' ? 700 : 500,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              Admin
                            </button>

                            <button
                              type="button"
                              title="تبدیل به کارشناس پشتیبانی"
                              onClick={() => handleRoleChange(user, 'support')}
                              style={{
                                border: 'none',
                                background: user.role === 'support' ? '#f97316' : 'transparent',
                                color: user.role === 'support' ? '#ffffff' : '#64748b',
                                fontWeight: user.role === 'support' ? 700 : 500,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              Support
                            </button>

                            <button
                              type="button"
                              title="تبدیل به کاربر عادی"
                              onClick={() => handleRoleChange(user, 'user')}
                              style={{
                                border: 'none',
                                background: user.role === 'user' || !user.role ? '#0284c7' : 'transparent',
                                color: user.role === 'user' || !user.role ? '#ffffff' : '#64748b',
                                fontWeight: user.role === 'user' || !user.role ? 700 : 500,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              User
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Subscriptions Count (Non-clickable) */}
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        <div
                          style={{
                            background: user.subscriptions_count > 0 ? '#eff6ff' : '#f8fafc',
                            color: user.subscriptions_count > 0 ? '#1d4ed8' : '#64748b',
                            border: `1px solid ${user.subscriptions_count > 0 ? '#bfdbfe' : '#e2e8f0'}`,
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            userSelect: 'none',
                            width: 'fit-content'
                          }}
                          title={`تعداد کل اشتراک‌های ثبت‌شده برای این کاربر: ${(user.subscriptions_count || 0).toLocaleString('fa-IR')}`}
                        >
                          <Package size={13} color={user.subscriptions_count > 0 ? '#2563eb' : '#94a3b8'} />
                          <span>
                            {(user.subscriptions_count || 0) > 0 
                              ? `${Number(user.subscriptions_count).toLocaleString('fa-IR')} اشتراک` 
                              : 'بدون اشتراک'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            title="مشاهده جزئیات، اشتراک‌ها و خریدهای کاربر"
                            onClick={() => setShowDetailsModal(user)}
                            style={{
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              color: '#0284c7',
                              cursor: 'pointer',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f0f9ff'}
                          >
                            <Info size={14} />
                            <span>جزئیات و اشتراک</span>
                          </button>

                          {!isOwner && (
                            <button
                              type="button"
                              title="حذف کاربر از سامانه"
                              onClick={() => handleDeleteUser(user)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '5px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal: Add New Staff / Admin / User */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '540px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            direction: 'rtl',
            fontFamily: 'inherit'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '6px', borderRadius: '8px' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    افزودن کاربر، مدیر یا پشتیبان جدید
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    ثبت مشخصات و اعطای دسترسی مستقیم با شماره موبایل
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddUser} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Mobile Input */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  شماره موبایل کاربر <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 09121112233"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      direction: 'ltr',
                      textAlign: 'right',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Role Selection Cards */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  سطح دسترسی مورد نظر:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div
                    onClick={() => setFormData({ ...formData, role: 'admin', job_title: formData.job_title || 'مدیر سیستم' })}
                    style={{
                      border: formData.role === 'admin' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      background: formData.role === 'admin' ? '#fef2f2' : '#ffffff',
                      padding: '12px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <ShieldCheck size={20} color={formData.role === 'admin' ? '#dc2626' : '#94a3b8'} style={{ margin: '0 auto 4px' }} />
                    <strong style={{ display: 'block', fontSize: '12.5px', color: formData.role === 'admin' ? '#991b1b' : '#334155' }}>مدیر سیستم</strong>
                    <small style={{ fontSize: '10.5px', color: '#64748b' }}>دسترسی کامل</small>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, role: 'support', job_title: formData.job_title || 'کارشناس پشتیبانی' })}
                    style={{
                      border: formData.role === 'support' ? '2px solid #f97316' : '1px solid #e2e8f0',
                      background: formData.role === 'support' ? '#fff7ed' : '#ffffff',
                      padding: '12px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <Headphones size={20} color={formData.role === 'support' ? '#ea580c' : '#94a3b8'} style={{ margin: '0 auto 4px' }} />
                    <strong style={{ display: 'block', fontSize: '12.5px', color: formData.role === 'support' ? '#9a3412' : '#334155' }}>کارشناس پشتیبان</strong>
                    <small style={{ fontSize: '10.5px', color: '#64748b' }}>مدیریت تیکت‌ها</small>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, role: 'user', job_title: formData.job_title || 'مشتری' })}
                    style={{
                      border: formData.role === 'user' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: formData.role === 'user' ? '#f0f9ff' : '#ffffff',
                      padding: '12px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <UserIcon size={20} color={formData.role === 'user' ? '#0284c7' : '#94a3b8'} style={{ margin: '0 auto 4px' }} />
                    <strong style={{ display: 'block', fontSize: '12.5px', color: formData.role === 'user' ? '#075985' : '#334155' }}>کاربر عادی</strong>
                    <small style={{ fontSize: '10.5px', color: '#64748b' }}>پورتال خرید</small>
                  </div>
                </div>
              </div>

              {/* First & Last Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    نام
                  </label>
                  <input
                    type="text"
                    placeholder="نام کاربر"
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13.5px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    نام خانوادگی
                  </label>
                  <input
                    type="text"
                    placeholder="نام خانوادگی"
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13.5px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Email & Job Title */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    ایمیل سازمانی (اختیاری)
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      direction: 'ltr',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    سمت سازمانی
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مدیر فنی / کارشناس IT"
                    value={formData.job_title}
                    onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#0870d1',
                    border: 'none',
                    color: '#ffffff',
                    padding: '9px 24px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="spin" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>تأیید و ثبت کاربر</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: View Full User Details, Subscriptions & Order/Module Management */}
      {showDetailsModal && (
        <AdminUserDetailsModal
          userId={showDetailsModal.id}
          onClose={() => setShowDetailsModal(null)}
          onUserUpdated={reload}
        />
      )}

    </div>
  );
}
