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
  Activity
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
          ...stats,
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
        setMessage({ type: 'success', text: 'خطای آزمایشی کلاینت با موفقیت ارسال و ثبت گردید.' });
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
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">بحرانی (Fatal)</span>;
      case 'error':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">خطا (Error)</span>;
      case 'warn':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">هشدار (Warn)</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">اطلاع (Info)</span>;
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'server':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300"><Server size={12} /> سرور</span>;
      case 'client':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"><Smartphone size={12} /> کلاینت / UI</span>;
      case 'api':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200"><Globe size={12} /> API</span>;
      case 'database':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"><Database size={12} /> دیتابیس</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{source}</span>;
    }
  };

  return (
    <div className="space-y-6 text-slate-800" dir="rtl">
      {/* Sub-navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('errors')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeSubTab === 'errors'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Bug size={14} />
          مدیریت لاگ‌های خطای سامانه (Error Logs)
        </button>

        <button
          onClick={() => setActiveSubTab('vitals')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeSubTab === 'vitals'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Zap size={14} />
          پایش کارایی و Core Web Vitals (Performance)
        </button>
      </div>

      {activeSubTab === 'vitals' ? (
        <WebVitalsAdminView />
      ) : (
        <>
          {/* Top Header & Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
                <Bug size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">سامانه محلی مدیریت و ردیابی خطاهای نرم‌افزار</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ثبت مستقل و یکپارچه رویدادها، خطاهای کلاینت و سرور در فایل محلی <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[11px] font-mono">data/error_logs.json</code> بدون وابستگی به سرویس‌های ثالث
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
              title="بارگذاری مجدد لاگ‌ها"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              بروزرسانی
            </button>

            <button
              onClick={() => handleTriggerTest('server')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition disabled:opacity-50"
              title="تست ثبت لاگ سرور"
            >
              <Play size={14} />
              تست لاگ سرور
            </button>

            <button
              onClick={() => handleTriggerTest('client')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition disabled:opacity-50"
              title="تست ثبت لاگ کلاینت"
            >
              <Smartphone size={14} />
              تست لاگ کلاینت
            </button>

            <button
              onClick={() => handleDownload('text')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
              title="دانلود فایل فرمت‌شده log"
            >
              <FileText size={14} />
              دانلود .log
            </button>

            <button
              onClick={() => handleDownload('json')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
              title="دانلود فایل JSON"
            >
              <Download size={14} />
              خروجی JSON
            </button>

            <button
              onClick={() => setConfirmClearOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
              title="پاکسازی لاگ‌ها"
            >
              <Trash2 size={14} />
              پاکسازی
            </button>
          </div>
        </div>

        {/* Status Message Notification */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg flex items-center justify-between text-xs font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">کل رویدادها</span>
              <span className="text-lg font-extrabold text-slate-900 mt-1 block">{stats.total?.toLocaleString('fa-IR')}</span>
            </div>

            <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
              <span className="text-[11px] font-medium text-rose-600 block">در انتظار بررسی</span>
              <span className="text-lg font-extrabold text-rose-700 mt-1 block">{stats.unresolved?.toLocaleString('fa-IR')}</span>
            </div>

            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <span className="text-[11px] font-medium text-red-600 block">خطاهای سیستمی</span>
              <span className="text-lg font-extrabold text-red-700 mt-1 block">{stats.errors?.toLocaleString('fa-IR')}</span>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <span className="text-[11px] font-medium text-purple-600 block">خطاهای فرانت‌اند</span>
              <span className="text-lg font-extrabold text-purple-700 mt-1 block">{stats.clientErrors?.toLocaleString('fa-IR')}</span>
            </div>

            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <span className="text-[11px] font-medium text-indigo-600 block">خطاهای بک‌اند</span>
              <span className="text-lg font-extrabold text-indigo-700 mt-1 block">{stats.serverErrors?.toLocaleString('fa-IR')}</span>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="text-[11px] font-medium text-amber-600 block">خطاهای امروز</span>
              <span className="text-lg font-extrabold text-amber-700 mt-1 block">{stats.todayErrors?.toLocaleString('fa-IR')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="جستجو در پیام، نام خطا، آدرس URL، شماره موبایل کاربر، آدرس IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">همه مبداها (Sources)</option>
              <option value="server">سرور (Server)</option>
              <option value="client">کلاینت / UI</option>
              <option value="api">API Endpoints</option>
              <option value="database">پایگاه داده</option>
              <option value="unhandled">Unhandled</option>
            </select>

            <select
              value={resolvedFilter}
              onChange={(e) => setResolvedFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="false">در انتظار بررسی</option>
              <option value="true">بررسی و حل شده</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              اعمال فیلتر
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
            <span className="text-xs font-medium">در حال خواندن فایل لاگ‌های محلی...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-bold text-slate-700">هیچ خطایی در سیستم یافت نشد</p>
            <p className="text-xs text-slate-400 mt-1">کلیه اجزا و سرویس‌ها بدون ارور در حال فعالیت هستند.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">وضعیت</th>
                  <th className="py-3 px-4">زمان رخداد</th>
                  <th className="py-3 px-4">سطح / مبدأ</th>
                  <th className="py-3 px-4">شرح خطا</th>
                  <th className="py-3 px-4">مسیر / URL</th>
                  <th className="py-3 px-4">کاربر / IP</th>
                  <th className="py-3 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className={`hover:bg-slate-50 transition ${log.resolved ? 'opacity-60 bg-slate-50/50' : ''}`}>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleResolve(log)}
                        className={`p-1 rounded-full transition ${
                          log.resolved
                            ? 'text-emerald-600 hover:text-emerald-700 bg-emerald-50'
                            : 'text-slate-300 hover:text-emerald-500 bg-slate-100'
                        }`}
                        title={log.resolved ? 'علامت‌گذاری به عنوان حل‌نشده' : 'علامت‌گذاری به عنوان حل‌شده'}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {formatDate(log.timestamp)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getLevelBadge(log.level)}
                        {getSourceBadge(log.source)}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs md:max-w-md">
                      <div className="font-semibold text-slate-800 truncate" title={log.message}>
                        {log.name && <span className="text-slate-500 font-mono text-[11px] ml-1">{log.name}:</span>}
                        {log.message}
                      </div>
                      {log.stack && (
                        <span className="text-[10px] text-slate-400 block font-mono truncate mt-0.5">
                          {log.stack.split('\n')[1] || log.stack.split('\n')[0]}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {log.url ? (
                        <span className="truncate block max-w-[160px]" title={log.url}>
                          {log.method && <span className="font-bold text-slate-700 ml-1">{log.method}</span>}
                          {log.url}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {log.user_mobile ? (
                        <span className="font-medium text-blue-700 block">{log.user_mobile}</span>
                      ) : (
                        <span className="text-slate-400 block text-[11px]">میهمان</span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">{log.ip_address}</span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition"
                      >
                        جزئیات و استک
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">مشخصات و ردگیری کامل خطای محلی</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{selectedLog.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">سطح خطا:</span>
                  <div className="mt-1">{getLevelBadge(selectedLog.level)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">مبدأ خطا:</span>
                  <div className="mt-1">{getSourceBadge(selectedLog.source)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">وضعیت بررسی:</span>
                  <span className={`mt-1 inline-block font-semibold ${selectedLog.resolved ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedLog.resolved ? 'بررسی شده' : 'در انتظار بررسی'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">زمان وقوع:</span>
                  <span className="mt-1 inline-block font-mono text-slate-700">{formatDate(selectedLog.timestamp)}</span>
                </div>
              </div>

              {/* Message */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">پیام خطا (Message):</span>
                <div className="p-3 bg-red-50/60 border border-red-200 text-red-900 rounded-xl font-medium text-xs leading-relaxed">
                  {selectedLog.name && <span className="font-bold font-mono mr-1">[{selectedLog.name}]</span>}
                  {selectedLog.message}
                </div>
              </div>

              {/* URL & Request Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] mb-1">درخواست / آدرس:</span>
                  <div className="font-mono text-slate-800 break-all text-[11px]">
                    {selectedLog.method && <span className="font-bold text-blue-700 ml-1">[{selectedLog.method}]</span>}
                    {selectedLog.url || 'N/A'}
                  </div>
                  {selectedLog.status_code && (
                    <span className="text-slate-500 text-[10px] mt-1 block">کد وضعیت: {selectedLog.status_code}</span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] mb-1">اطلاعات کلاینت / کاربر:</span>
                  <div className="text-slate-800 text-[11px]">
                    <div>کاربر: {selectedLog.user_mobile || selectedLog.user_id || 'ناشناس'}</div>
                    <div className="font-mono text-slate-500 text-[10px] mt-0.5">IP: {selectedLog.ip_address}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5" title={selectedLog.user_agent}>
                      UA: {selectedLog.user_agent}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stack Trace */}
              {selectedLog.stack && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-700">ردپای پشته (Stack Trace):</span>
                    <button
                      onClick={() => copyToClipboard(selectedLog.stack, 'stack')}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800"
                    >
                      {copiedId === 'stack' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {copiedId === 'stack' ? 'کپی شد' : 'کپی استک'}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10.5px] overflow-x-auto max-h-48 leading-relaxed whitespace-pre-wrap dir-ltr text-left">
                    {selectedLog.stack}
                  </pre>
                </div>
              )}

              {/* Extra Context */}
              {selectedLog.context && Object.keys(selectedLog.context).length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">اطلاعات تکمیلی کانتکست (Context):</span>
                  <pre className="p-3 bg-slate-100 text-slate-800 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36 leading-relaxed dir-ltr text-left border border-slate-200">
                    {JSON.stringify(selectedLog.context, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleToggleResolve(selectedLog)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  selectedLog.resolved
                    ? 'text-slate-700 bg-slate-200 hover:bg-slate-300'
                    : 'text-white bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <CheckCircle2 size={14} />
                {selectedLog.resolved ? 'تغییر به حل‌نشده' : 'تأیید و نشانه‌گذاری به عنوان حل‌شده'}
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Clear Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">پاکسازی کلیه لاگ‌های خطای محلی</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              آیا از پاکسازی تمام رکوردهای ثبت‌شده در فایل <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">data/error_logs.json</code> اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleClearLogs}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-50"
              >
                {actionLoading ? 'در حال پاکسازی...' : 'بله، لاگ‌ها پاک شوند'}
              </button>
              <button
                onClick={() => setConfirmClearOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
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
