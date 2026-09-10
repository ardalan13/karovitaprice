import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bug, 
  RefreshCw, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Server, 
  Smartphone, 
  Globe, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ShieldAlert, 
  Play, 
  X,
  Database,
  Zap,
  Activity,
  CheckCheck,
  AlertCircle,
  Laptop,
  Radio,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { logError } from '../../services/logger';
import { WebVitalsAdminView } from './WebVitalsAdminView';

export function ErrorLogsAdminView() {
  const [activeSubTab, setActiveSubTab] = useState('errors');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [resolvedFilter, setResolvedFilter] = useState('all');

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (levelFilter !== 'all') params.append('level', levelFilter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      if (resolvedFilter !== 'all') params.append('resolved', resolvedFilter);

      const res = await api(`/admin/error-logs?${params.toString()}`);
      setLogs(res.logs || []);
      setStats(res.stats || null);
    } catch (err) {
      console.error('Failed to fetch error logs:', err);
      setMessage({ type: 'error', text: err.message || 'خطا در بارگذاری لاگ‌ها' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [levelFilter, sourceFilter, resolvedFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleToggleResolve = async (log) => {
    try {
      const newStatus = !log.resolved;
      await api(`/admin/error-logs/${log.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolved: newStatus }),
      });

      // Update state locally
      setLogs((prev) =>
        prev.map((item) => (item.id === log.id ? { ...item, resolved: newStatus } : item))
      );
      if (selectedLog && selectedLog.id === log.id) {
        setSelectedLog({ ...selectedLog, resolved: newStatus });
      }
      if (stats) {
        setStats({
          ...stats,
          unresolved: newStatus ? Math.max(0, stats.unresolved - 1) : stats.unresolved + 1,
        });
      }
      setMessage({
        type: 'success',
        text: newStatus ? 'خطا به عنوان «بررسی و حل‌شده» ثبت گردید.' : 'خطا به وضعیت «در انتظار بررسی» تغییر یافت.'
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'خطا در تغییر وضعیت خطا' });
    }
  };

  const handleClearLogs = async () => {
    setActionLoading(true);
    try {
      await api('/admin/error-logs/clear', { method: 'POST' });
      setLogs([]);
      if (stats) {
        setStats({
          total: 0,
          errors: 0,
          warnings: 0,
          clientErrors: 0,
          serverErrors: 0,
          unresolved: 0,
          todayErrors: 0,
        });
      }
      setConfirmClearOpen(false);
      setMessage({ type: 'success', text: 'کلیه لاگ‌های خطای محلی با موفقیت پاکسازی شدند.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'خطا در پاکسازی لاگ‌ها' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerTest = async (type = 'server') => {
    setActionLoading(true);
    try {
      if (type === 'client') {
        // Trigger client logger directly
        logError(new Error('خطای آزمایشی سمت کلاینت (ثبت‌شده از پنل مدیریت)'), {
          source: 'admin_test_trigger',
          simulated: true,
        });
        setTimeout(fetchLogs, 400);
        setMessage({ type: 'success', text: 'خطای آزمایشی کلاینت با موفقیت ثبت گردید.' });
      } else {
        const res = await api('/admin/error-logs/test', {
          method: 'POST',
          body: JSON.stringify({
            type,
            message: `خطای شبیه‌سازی‌شده آزمایشی ${type === 'database' ? 'پایگاه داده' : 'سرور'}`,
          }),
        });
        setMessage({ type: 'success', text: res.message || 'خطای آزمایشی ثبت شد.' });
        fetchLogs();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'خطا در اجرای تست' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (format = 'json') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/error-logs/export?format=${format}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error('خطا در دانلود فایل لاگ');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `karovita-errors-${new Date().toISOString().slice(0, 10)}.${format === 'text' ? 'log' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'خطا در دریافت فایل' });
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('fa-IR')} ساعت ${d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    } catch {
      return isoString;
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'fatal':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca'
          }}>
            <ShieldAlert size={12} /> بحرانی (Fatal)
          </span>
        );
      case 'error':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            background: '#fff1f2',
            color: '#be123c',
            border: '1px solid #fecdd3'
          }}>
            <AlertCircle size={12} /> خطا (Error)
          </span>
        );
      case 'warn':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            background: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fde68a'
          }}>
            <AlertTriangle size={12} /> هشدار (Warn)
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe'
          }}>
            اطلاع (Info)
          </span>
        );
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'server':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            background: '#f1f5f9',
            color: '#334155',
            border: '1px solid #e2e8f0'
          }}>
            <Server size={12} /> سرور
          </span>
        );
      case 'client':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            background: '#f5f3ff',
            color: '#6d28d9',
            border: '1px solid #ddd6fe'
          }}>
            <Smartphone size={12} /> کلاینت / UI
          </span>
        );
      case 'api':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            background: '#eef2ff',
            color: '#4338ca',
            border: '1px solid #c7d2fe'
          }}>
            <Globe size={12} /> API
          </span>
        );
      case 'database':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0'
          }}>
            <Database size={12} /> دیتابیس
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            background: '#f8fafc',
            color: '#64748b',
            border: '1px solid #e2e8f0'
          }}>
            {source}
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} dir="rtl" id="error-logs-admin-view">
      
      {/* Sub-navigation Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        paddingBottom: '4px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('errors')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            border: activeSubTab === 'errors' ? '1px solid #f43f5e' : '1px solid #e2e8f0',
            background: activeSubTab === 'errors' ? 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' : '#ffffff',
            color: activeSubTab === 'errors' ? '#ffffff' : '#64748b',
            boxShadow: activeSubTab === 'errors' ? '0 4px 12px rgba(225, 29, 72, 0.25)' : 'none'
          }}
        >
          <Bug size={16} />
          <span>مدیریت لاگ‌های خطای محلی (Error Tracking)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('vitals')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            border: activeSubTab === 'vitals' ? '1px solid #10b981' : '1px solid #e2e8f0',
            background: activeSubTab === 'vitals' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#ffffff',
            color: activeSubTab === 'vitals' ? '#ffffff' : '#64748b',
            boxShadow: activeSubTab === 'vitals' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
          }}
        >
          <Zap size={16} />
          <span>پایش کارایی و Core Web Vitals (Performance)</span>
        </button>
      </div>

      {activeSubTab === 'vitals' ? (
        <WebVitalsAdminView />
      ) : (
        <>
          {/* Top Header & Overview */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: '22px 24px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  background: '#ffe4e6',
                  color: '#e11d48',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #fecdd3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bug size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                      سامانه محلی مدیریت و ردیابی خطاهای نرم‌افزار
                    </h1>
                    <span style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'monospace'
                    }}>
                      data/error_logs.json
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                    ثبت مستقل و پایدار رویدادها و استک‌تریس خطاهای کلاینت و سرور بدون وابستگی به سرویس‌های ابری خارجی
                  </p>
                </div>
              </div>

              {/* Quick Actions Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={fetchLogs}
                  disabled={loading}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s'
                  }}
                  title="بارگذاری مجدد لاگ‌ها"
                >
                  <RefreshCw size={14} className={loading ? 'spin' : ''} />
                  <span>بروزرسانی</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerTest('server')}
                  disabled={actionLoading}
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#b45309',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                  title="تست ثبت لاگ سرور"
                >
                  <Play size={14} />
                  <span>تست لاگ سرور</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerTest('client')}
                  disabled={actionLoading}
                  style={{
                    background: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    color: '#6d28d9',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                  title="تست ثبت لاگ کلاینت"
                >
                  <Smartphone size={14} />
                  <span>تست لاگ کلاینت</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload('text')}
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#047857',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                  title="دانلود فایل فرمت‌شده log"
                >
                  <FileText size={14} />
                  <span>دانلود .log</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload('json')}
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                  title="دانلود فایل JSON"
                >
                  <Download size={14} />
                  <span>خروجی JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  style={{
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    color: '#be123c',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                  title="پاکسازی کلیه لاگ‌ها"
                >
                  <Trash2 size={14} />
                  <span>پاکسازی</span>
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {message && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                fontWeight: 600,
                background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                color: message.type === 'success' ? '#166534' : '#991b1b',
                border: message.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{message.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMessage(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Statistics Cards */}
            {stats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginTop: '4px'
              }}>
                <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', display: 'block' }}>کل رویدادها</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '4px', display: 'block' }}>
                    {Number(stats.total || 0).toLocaleString('fa-IR')}
                  </span>
                </div>

                <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#e11d48', display: 'block' }}>در انتظار بررسی</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#be123c', marginTop: '4px', display: 'block' }}>
                    {Number(stats.unresolved || 0).toLocaleString('fa-IR')}
                  </span>
                </div>

                <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#dc2626', display: 'block' }}>خطاهای سیستمی</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#991b1b', marginTop: '4px', display: 'block' }}>
                    {Number(stats.errors || 0).toLocaleString('fa-IR')}
                  </span>
                </div>

                <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#6d28d9', display: 'block' }}>خطاهای فرانت‌اند</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#5b21b6', marginTop: '4px', display: 'block' }}>
                    {Number(stats.clientErrors || 0).toLocaleString('fa-IR')}
                  </span>
                </div>

                <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#4338ca', display: 'block' }}>خطاهای بک‌اند</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#3730a3', marginTop: '4px', display: 'block' }}>
                    {Number(stats.serverErrors || 0).toLocaleString('fa-IR')}
                  </span>
                </div>

                <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#b45309', display: 'block' }}>خطاهای امروز</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#92400e', marginTop: '4px', display: 'block' }}>
                    {Number(stats.todayErrors || 0).toLocaleString('fa-IR')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Filter and Search Bar */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
          }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="جستجو در پیام خطا، نام تابع، مسیر URL، شماره کاربر، آدرس IP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 38px 9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    background: '#ffffff',
                    color: '#334155',
                    outline: 'none'
                  }}
                >
                  <option value="all">همه سطوح (Levels)</option>
                  <option value="fatal">بحرانی (Fatal)</option>
                  <option value="error">خطا (Error)</option>
                  <option value="warn">هشدار (Warn)</option>
                  <option value="info">اطلاع (Info)</option>
                </select>

                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    background: '#ffffff',
                    color: '#334155',
                    outline: 'none'
                  }}
                >
                  <option value="all">همه مبدأها (Sources)</option>
                  <option value="server">سرور (Server)</option>
                  <option value="client">کلاینت / UI</option>
                  <option value="api">API Endpoints</option>
                  <option value="database">پایگاه داده</option>
                  <option value="unhandled">Unhandled</option>
                </select>

                <select
                  value={resolvedFilter}
                  onChange={(e) => setResolvedFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    background: '#ffffff',
                    color: '#334155',
                    outline: 'none'
                  }}
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="false">در انتظار بررسی</option>
                  <option value="true">بررسی و حل شده</option>
                </select>

                <button
                  type="submit"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0870d1 0%, #0284c7 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(8, 112, 209, 0.25)'
                  }}
                >
                  اعمال فیلتر
                </button>
              </div>
            </form>
          </div>

          {/* Logs Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw size={28} color="#0870d1" className="spin" style={{ margin: '0 auto 8px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>در حال خواندن فایل لاگ‌های محلی...</span>
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                <CheckCircle2 size={42} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>هیچ خطایی در سیستم ثبت نشده است</p>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>کلیه سرویس‌ها و کلاینت‌ها بدون ارور در حال فعالیت هستند.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', fontWeight: 700 }}>
                      <th style={{ padding: '14px 16px', width: '50px', textAlign: 'center' }}>وضعیت</th>
                      <th style={{ padding: '14px 16px' }}>زمان رخداد</th>
                      <th style={{ padding: '14px 16px' }}>سطح / مبدأ</th>
                      <th style={{ padding: '14px 16px' }}>شرح و عنوان خطا</th>
                      <th style={{ padding: '14px 16px' }}>مسیر / URL</th>
                      <th style={{ padding: '14px 16px' }}>کاربر / IP</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center' }}>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: log.resolved ? '#f8fafc' : '#ffffff',
                          opacity: log.resolved ? 0.75 : 1,
                          transition: 'background 0.15s'
                        }}
                      >
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleResolve(log)}
                            style={{
                              border: 'none',
                              background: log.resolved ? '#dcfce7' : '#f1f5f9',
                              color: log.resolved ? '#15803d' : '#94a3b8',
                              padding: '6px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s'
                            }}
                            title={log.resolved ? 'علامت‌گذاری به عنوان حل‌نشده' : 'علامت‌گذاری به عنوان بررسی و حل‌شده'}
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        </td>

                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#64748b', fontSize: '11.5px', fontFamily: 'monospace' }}>
                          {formatDate(log.timestamp)}
                        </td>

                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getLevelBadge(log.level)}
                            {getSourceBadge(log.source)}
                          </div>
                        </td>

                        <td style={{ padding: '12px 16px', maxWidth: '340px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.message}>
                            {log.name && <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '11px', marginLeft: '4px' }}>[{log.name}]</span>}
                            {log.message}
                          </div>
                          {log.stack && (
                            <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px', direction: 'ltr', textAlign: 'right' }}>
                              {log.stack.split('\n')[1] || log.stack.split('\n')[0]}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '11.5px', color: '#475569' }}>
                          {log.url ? (
                            <span style={{ display: 'inline-block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.url}>
                              {log.method && <strong style={{ color: '#0870d1', marginLeft: '4px' }}>{log.method}</strong>}
                              {log.url}
                            </span>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          {log.user_mobile ? (
                            <span style={{ fontWeight: 700, color: '#0870d1', display: 'block' }}>{log.user_mobile}</span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11.5px', display: 'block' }}>مهمان / ناشناس</span>
                          )}
                          <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#94a3b8' }}>{log.ip_address}</span>
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            مشاهده و استک
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail Modal */}
          {selectedLog && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                border: '1px solid #e2e8f0',
                maxWidth: '680px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Modal Header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px', borderRadius: '8px' }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        مشخصات و ردگیری کامل خطای محلی
                      </h3>
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>شناسه: {selectedLog.id}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLog(null)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12.5px' }}>
                  {/* Metadata Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '10px',
                    background: '#f8fafc',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block' }}>سطح خطا:</span>
                      <div style={{ marginTop: '4px' }}>{getLevelBadge(selectedLog.level)}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block' }}>مبدأ خطا:</span>
                      <div style={{ marginTop: '4px' }}>{getSourceBadge(selectedLog.source)}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block' }}>وضعیت بررسی:</span>
                      <span style={{ marginTop: '4px', display: 'inline-block', fontWeight: 700, color: selectedLog.resolved ? '#15803d' : '#be123c' }}>
                        {selectedLog.resolved ? 'بررسی و حل‌شده' : 'در انتظار بررسی'}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block' }}>زمان وقوع:</span>
                      <span style={{ marginTop: '4px', display: 'inline-block', fontFamily: 'monospace', color: '#334155' }}>
                        {formatDate(selectedLog.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <span style={{ fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>متن پیام خطا (Message):</span>
                    <div style={{
                      padding: '12px 14px',
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      color: '#9f1239',
                      borderRadius: '10px',
                      fontWeight: 600,
                      lineHeight: 1.6
                    }}>
                      {selectedLog.name && <strong style={{ fontFamily: 'monospace', marginLeft: '6px' }}>[{selectedLog.name}]</strong>}
                      {selectedLog.message}
                    </div>
                  </div>

                  {/* URL & Request Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>درخواست / آدرس URL:</span>
                      <div style={{ fontFamily: 'monospace', color: '#1e293b', wordBreak: 'break-all' }}>
                        {selectedLog.method && <strong style={{ color: '#0870d1', marginLeft: '4px' }}>[{selectedLog.method}]</strong>}
                        {selectedLog.url || 'N/A'}
                      </div>
                      {selectedLog.status_code && (
                        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                          کد وضعیت HTTP: {selectedLog.status_code}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>اطلاعات کاربر و کلاینت:</span>
                      <div style={{ color: '#1e293b' }}>
                        <div>کاربر: {selectedLog.user_mobile || selectedLog.user_id || 'ناشناس / مهمان'}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>IP: {selectedLog.ip_address}</div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedLog.user_agent}>
                          UA: {selectedLog.user_agent}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stack Trace */}
                  {selectedLog.stack && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#334155' }}>ردپای پشته (Stack Trace):</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedLog.stack, 'stack')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#0870d1',
                            fontSize: '11.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
                          }}
                        >
                          {copiedId === 'stack' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                          <span>{copiedId === 'stack' ? 'کپی شد!' : 'کپی استک‌تریس'}</span>
                        </button>
                      </div>
                      <pre style={{
                        padding: '12px',
                        background: '#0f172a',
                        color: '#f8fafc',
                        borderRadius: '10px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        overflowX: 'auto',
                        maxHeight: '180px',
                        lineHeight: 1.5,
                        direction: 'ltr',
                        textAlign: 'left',
                        margin: 0
                      }}>
                        {selectedLog.stack}
                      </pre>
                    </div>
                  )}

                  {/* Extra Context */}
                  {selectedLog.context && Object.keys(selectedLog.context).length > 0 && (
                    <div>
                      <span style={{ fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>کانتکست تکمیلی (Context):</span>
                      <pre style={{
                        padding: '10px',
                        background: '#f1f5f9',
                        color: '#1e293b',
                        borderRadius: '10px',
                        fontFamily: 'monospace',
                        fontSize: '11.5px',
                        overflowX: 'auto',
                        maxHeight: '140px',
                        direction: 'ltr',
                        textAlign: 'left',
                        margin: 0,
                        border: '1px solid #e2e8f0'
                      }}>
                        {JSON.stringify(selectedLog.context, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div style={{
                  padding: '14px 20px',
                  borderTop: '1px solid #f1f5f9',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <button
                    type="button"
                    onClick={() => handleToggleResolve(selectedLog)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedLog.resolved ? '#f1f5f9' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: selectedLog.resolved ? '#475569' : '#ffffff',
                      boxShadow: selectedLog.resolved ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{selectedLog.resolved ? 'تغییر به حل‌نشده' : 'تأیید و نشانه‌گذاری به عنوان حل‌شده'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLog(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    بستن
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Clear Modal */}
          {confirmClearOpen && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                border: '1px solid #e2e8f0',
                maxWidth: '400px',
                width: '100%',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#ffe4e6',
                  color: '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Trash2 size={24} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  پاکسازی کلیه لاگ‌های خطای محلی
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: '12.5px', color: '#64748b', lineHeight: 1.6 }}>
                  آیا از پاکسازی تمام رکوردهای ثبت‌شده در فایل <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>data/error_logs.json</code> اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    disabled={actionLoading}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: actionLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {actionLoading ? 'در حال پاکسازی...' : 'بله، لاگ‌ها پاک شوند'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(false)}
                    disabled={actionLoading}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '8px',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ErrorLogsAdminView;
