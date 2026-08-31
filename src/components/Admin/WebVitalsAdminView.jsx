import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Wifi, 
  Cpu, 
  Globe, 
  Play, 
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { api } from '../../services/api';
import { flushVitalsReport } from '../../services/vitals';

export function WebVitalsAdminView() {
  const [vitals, setVitals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const res = await api('/admin/vitals');
      setVitals(res.vitals || []);
      setStats(res.stats || null);
    } catch (err) {
      console.error('Failed to load Web Vitals:', err);
      setMessage({ type: 'error', text: err.message || 'خطا در بارگذاری معیارهای کارایی' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const handleTriggerSnapshot = () => {
    flushVitalsReport();
    setMessage({ type: 'success', text: 'معیارهای کارایی مرورگر فعلی ارسال و در فایل محلی ذخیره شد.' });
    setTimeout(fetchVitals, 500);
  };

  const handleClear = async () => {
    setActionLoading(true);
    try {
      await api('/admin/vitals/clear', { method: 'POST' });
      setVitals([]);
      if (stats) {
        setStats({
          total: 0,
          averages: { lcp: null, cls: null, fid: null, inp: null, fcp: null, ttfb: null },
          scoreCounts: { good: 0, needsImprovement: 0, poor: 0 },
        });
      }
      setMessage({ type: 'success', text: 'لاگ‌های پایش کارایی با موفقیت پاکسازی شدند.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'خطا در پاکسازی لاگ‌ها' });
    } finally {
      setActionLoading(false);
    }
  };

  const getMetricBadge = (val, type) => {
    if (val === undefined || val === null) return <span className="text-slate-400 font-mono text-[11px]">—</span>;

    let rating = 'good';
    let text = `${val}ms`;

    if (type === 'cls') {
      text = Number(val).toFixed(3);
      if (val > 0.25) rating = 'poor';
      else if (val > 0.1) rating = 'needs-improvement';
    } else if (type === 'lcp') {
      if (val > 4000) rating = 'poor';
      else if (val > 2500) rating = 'needs-improvement';
    } else if (type === 'fid') {
      if (val > 300) rating = 'poor';
      else if (val > 100) rating = 'needs-improvement';
    } else if (type === 'inp') {
      if (val > 500) rating = 'poor';
      else if (val > 200) rating = 'needs-improvement';
    } else if (type === 'fcp') {
      if (val > 3000) rating = 'poor';
      else if (val > 1800) rating = 'needs-improvement';
    } else if (type === 'ttfb') {
      if (val > 1800) rating = 'poor';
      else if (val > 800) rating = 'needs-improvement';
    }

    const badgeColors = {
      good: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'needs-improvement': 'bg-amber-100 text-amber-800 border-amber-200',
      poor: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold border ${badgeColors[rating]}`}>
        {text}
      </span>
    );
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

  return (
    <div className="space-y-6 text-slate-800" dir="rtl">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Zap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">پایش بلادرنگ کارایی و معیارهای حیاتی وب (Core Web Vitals)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ردیابی زمان‌های رندر، پاسخگویی و پایداری بصری کاربر با Performance API و ثبت دوره‌ای در <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[11px] font-mono">data/vitals_logs.json</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchVitals}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              بروزرسانی
            </button>

            <button
              onClick={handleTriggerSnapshot}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
            >
              <Play size={14} />
              ثبت اسنپ‌شات لحظه‌ای
            </button>

            <button
              onClick={handleClear}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition disabled:opacity-50"
            >
              <Trash2 size={14} />
              پاکسازی لاگ‌ها
            </button>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-xs font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Global Average Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">میانگین LCP (بزرگترین رندر)</span>
              <div className="mt-1">{getMetricBadge(stats.averages.lcp, 'lcp')}</div>
              <span className="text-[10px] text-slate-400 block mt-1">هدف: زیر ۲.۵ ثانیه</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">میانگین CLS (تغییر چیدمان)</span>
              <div className="mt-1">{getMetricBadge(stats.averages.cls, 'cls')}</div>
              <span className="text-[10px] text-slate-400 block mt-1">هدف: زیر ۰.۱</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">میانگین INP / FID (پاسخگویی)</span>
              <div className="mt-1">{getMetricBadge(stats.averages.inp || stats.averages.fid, 'inp')}</div>
              <span className="text-[10px] text-slate-400 block mt-1">هدف: زیر ۲۰۰ میلی‌ثانیه</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">میانگین FCP (اولین رندر)</span>
              <div className="mt-1">{getMetricBadge(stats.averages.fcp, 'fcp')}</div>
              <span className="text-[10px] text-slate-400 block mt-1">هدف: زیر ۱.۸ ثانیه</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">میانگین TTFB (پاسخ سرور)</span>
              <div className="mt-1">{getMetricBadge(stats.averages.ttfb, 'ttfb')}</div>
              <span className="text-[10px] text-slate-400 block mt-1">هدف: زیر ۸۰۰ میلی‌ثانیه</span>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <span className="text-[11px] font-medium text-emerald-700 block">کل گزارش‌های ثبت‌شده</span>
              <span className="text-lg font-extrabold text-emerald-800 mt-1 block">{stats.total?.toLocaleString('fa-IR')}</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">در فایل دیتای محلی</span>
            </div>
          </div>
        )}
      </div>

      {/* Vitals Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-500" />
            <span className="text-xs font-medium">در حال خواندن فایل معیارهای کارایی...</span>
          </div>
        ) : vitals.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Activity size={36} className="mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-bold text-slate-700">هنوز گزارشی از کارایی وب ثبت نشده است</p>
            <p className="text-xs text-slate-400 mt-1">معیارها به صورت خودکار هر ۳۰ ثانیه یا با کلیک روی «ثبت اسنپ‌شات لحظه‌ای» ذخیره می‌شوند.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">زمان ثبت</th>
                  <th className="py-3 px-4">صفحه / URL</th>
                  <th className="py-3 px-4 text-center">LCP</th>
                  <th className="py-3 px-4 text-center">CLS</th>
                  <th className="py-3 px-4 text-center">INP / FID</th>
                  <th className="py-3 px-4 text-center">FCP</th>
                  <th className="py-3 px-4 text-center">TTFB</th>
                  <th className="py-3 px-4">شبکه / حافظه</th>
                  <th className="py-3 px-4">کاربر / IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vitals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {formatDate(item.timestamp)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-700 font-medium">
                      {item.url || '/'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getMetricBadge(item.metrics.lcp, 'lcp')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getMetricBadge(item.metrics.cls, 'cls')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getMetricBadge(item.metrics.inp || item.metrics.fid, 'inp')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getMetricBadge(item.metrics.fcp, 'fcp')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getMetricBadge(item.metrics.ttfb, 'ttfb')}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {item.connection?.effectiveType && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded mr-1">
                          <Wifi size={10} />
                          {item.connection.effectiveType}
                        </span>
                      )}
                      {item.memory?.usedJSHeapSize && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          <Cpu size={10} />
                          {item.memory.usedJSHeapSize} MB
                        </span>
                      )}
                      {!item.connection?.effectiveType && !item.memory?.usedJSHeapSize && '—'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {item.user_mobile ? (
                        <span className="font-medium text-blue-700 block">{item.user_mobile}</span>
                      ) : (
                        <span className="text-slate-400 block text-[11px]">میهمان</span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">{item.ip_address}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebVitalsAdminView;
