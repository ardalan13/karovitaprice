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
  BarChart2,
  CheckCheck,
  X,
  Sparkles,
  Layers
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
    if (val === undefined || val === null) return <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}>—</span>;

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

    const badgeStyles = {
      good: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
      'needs-improvement': { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' },
      poor: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
    };

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '11.5px',
        fontFamily: 'monospace',
        fontWeight: 700,
        ...badgeStyles[rating]
      }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} dir="rtl" id="web-vitals-admin-view">
      {/* Top Header */}
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
              background: '#ecfdf5',
              color: '#059669',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  پایش بلادرنگ کارایی و معیارهای حیاتی وب (Core Web Vitals)
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
                  data/vitals_logs.json
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                ردیابی سرعت بارگذاری، زمان پاسخگویی و پایداری بصری رابط کاربری توسط Performance API استاندارد
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={fetchVitals}
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
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>بروزرسانی</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerSnapshot}
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
            >
              <Play size={14} />
              <span>ثبت اسنپ‌شات لحظه‌ای</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={actionLoading}
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
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
            >
              <Trash2 size={14} />
              <span>پاکسازی لاگ‌ها</span>
            </button>
          </div>
        </div>

        {/* Message Banner */}
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
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
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

        {/* Global Average Summary Cards */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginTop: '4px'
          }}>
            <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block' }}>میانگین LCP (بزرگترین رندر)</span>
              <div style={{ marginTop: '6px' }}>{getMetricBadge(stats.averages.lcp, 'lcp')}</div>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>هدف: زیر ۲.۵ ثانیه</span>
            </div>

            <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block' }}>میانگین CLS (تغییر چیدمان)</span>
              <div style={{ marginTop: '6px' }}>{getMetricBadge(stats.averages.cls, 'cls')}</div>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>هدف: زیر ۰.۱</span>
            </div>

            <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block' }}>میانگین INP / FID (پاسخگویی)</span>
              <div style={{ marginTop: '6px' }}>{getMetricBadge(stats.averages.inp || stats.averages.fid, 'inp')}</div>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>هدف: زیر ۲۰۰ms</span>
            </div>

            <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block' }}>میانگین FCP (اولین رندر)</span>
              <div style={{ marginTop: '6px' }}>{getMetricBadge(stats.averages.fcp, 'fcp')}</div>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>هدف: زیر ۱.۸ ثانیه</span>
            </div>

            <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block' }}>میانگین TTFB (پاسخ سرور)</span>
              <div style={{ marginTop: '6px' }}>{getMetricBadge(stats.averages.ttfb, 'ttfb')}</div>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>هدف: زیر ۸۰۰ms</span>
            </div>

            <div style={{ background: '#ecfdf5', padding: '14px 16px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', display: 'block' }}>کل اسنپ‌شات‌ها</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#065f46', marginTop: '4px', display: 'block' }}>
                {Number(stats.total || 0).toLocaleString('fa-IR')}
              </span>
              <span style={{ fontSize: '10.5px', color: '#059669', display: 'block', marginTop: '2px' }}>گزارش کارایی کلاینت‌ها</span>
            </div>
          </div>
        )}
      </div>

      {/* Vitals Log Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} color="#059669" className="spin" style={{ margin: '0 auto 8px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>در حال خواندن فایل معیارهای کارایی...</span>
          </div>
        ) : vitals.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <Activity size={42} color="#10b981" style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>هنوز گزارشی از کارایی وب ثبت نشده است</p>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
              معیارها به صورت خودکار یا با کلیک روی «ثبت اسنپ‌شات لحظه‌ای» ذخیره می‌شوند.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', fontWeight: 700 }}>
                  <th style={{ padding: '14px 16px' }}>زمان ثبت</th>
                  <th style={{ padding: '14px 16px' }}>صفحه / URL</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>LCP</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>CLS</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>INP / FID</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>FCP</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>TTFB</th>
                  <th style={{ padding: '14px 16px' }}>شبکه / حافظه</th>
                  <th style={{ padding: '14px 16px' }}>کاربر / IP</th>
                </tr>
              </thead>
              <tbody>
                {vitals.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#64748b', fontSize: '11.5px', fontFamily: 'monospace' }}>
                      {formatDate(item.timestamp)}
                    </td>

                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '12px', color: '#1e293b', fontWeight: 600 }}>
                      {item.url || '/'}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {getMetricBadge(item.metrics.lcp, 'lcp')}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {getMetricBadge(item.metrics.cls, 'cls')}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {getMetricBadge(item.metrics.inp || item.metrics.fid, 'inp')}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {getMetricBadge(item.metrics.fcp, 'fcp')}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {getMetricBadge(item.metrics.ttfb, 'ttfb')}
                    </td>

                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#64748b', fontSize: '11.5px' }}>
                      {item.connection?.effectiveType && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px', fontSize: '11px' }}>
                          <Wifi size={11} />
                          {item.connection.effectiveType}
                        </span>
                      )}
                      {item.memory?.usedJSHeapSize && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                          <Cpu size={11} />
                          {item.memory.usedJSHeapSize} MB
                        </span>
                      )}
                      {!item.connection?.effectiveType && !item.memory?.usedJSHeapSize && '—'}
                    </td>

                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {item.user_mobile ? (
                        <span style={{ fontWeight: 700, color: '#0870d1', display: 'block' }}>{item.user_mobile}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '11.5px', display: 'block' }}>مهمان</span>
                      )}
                      <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#94a3b8' }}>{item.ip_address}</span>
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
