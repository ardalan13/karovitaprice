import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  UserCheck, 
  KeyRound, 
  Sliders, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Server, 
  ChevronDown, 
  ChevronUp,
  UserCog
} from 'lucide-react';
import { api } from '../../services/api';

const ACTION_LABELS = {
  PRIVILEGE_ESCALATION: { label: 'ارتقای دسترسی / نقش', color: '#dc2626', bg: '#fef2f2', icon: KeyRound },
  SENSITIVE_DATA_ACCESS: { label: 'دسترسی به داده‌های حساس', color: '#d97706', bg: '#fffbeb', icon: Eye },
  CONFIGURATION_CHANGE: { label: 'تغییر در پیکربندی و تنظیمات', color: '#2563eb', bg: '#eff6ff', icon: Sliders },
  SECURITY_EVENT: { label: 'رخداد امنیتی و خطا', color: '#b91c1c', bg: '#fef2f2', icon: ShieldAlert },
  SUBSCRIPTION_CHANGE: { label: 'تغییر وضعیت اشتراک', color: '#059669', bg: '#ecfdf5', icon: UserCheck },
  TICKET_MANAGEMENT: { label: 'مدیریت و ارجاع تیکت', color: '#7c3aed', bg: '#f5f3ff', icon: Server },
  SYSTEM_ACTION: { label: 'عملیات سیستمی', color: '#475569', bg: '#f8fafc', icon: Server },
};

function formatPersianDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('fa-IR')} - ${d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}

export function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Selected Log for detail modal
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const offset = (page - 1) * limit;
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.append('action_type', actionFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());
      params.append('limit', limit);
      params.append('offset', offset);

      const [logsRes, statsRes] = await Promise.all([
        api(`/admin/audit-logs?${params.toString()}`),
        api('/admin/audit-logs/stats')
      ]);

      setLogs(logsRes.logs || []);
      setTotal(logsRes.total || 0);
      setStats(statsRes.stats || null);
    } catch (err) {
      setError(err.message || 'خطا در دریافت لاگ‌های امنیتی و حسابرسی');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs/export', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('خطا در دانلود گزارش');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `karovita-audit-report-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (err) {
      alert(err.message || 'خطا در دانلود لاگ‌ها');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="audit-logs-container" style={{ direction: 'rtl', fontFamily: 'Vazirmatn, sans-serif' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} color="#2563eb" />
            <span>سرویس یکپارچه لاگ حسابرسی و مانیتورینگ امنیتی (Audit Logging)</span>
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            ثبت و ردیابی بلادرنگ تغییرات حساس، ارتقای دسترسی، بازبینی داده‌های محرمانه و رخدادهای امنیتی
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={fetchLogs} 
            disabled={loading}
            className="btn-text"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#f1f5f9', 
              padding: '8px 14px', 
              borderRadius: '8px', 
              fontSize: '13px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            <RefreshCw size={15} className={loading ? 'spin-animate' : ''} />
            <span>بروزرسانی</span>
          </button>

          <button 
            type="button" 
            onClick={handleExport}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#0870d1', 
              color: '#fff', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <Download size={15} />
            <span>دانلود خروجی کامل JSON</span>
          </button>
        </div>
      </div>

      {/* Metric Stats Cards */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>
              <span>کل رویدادهای ثبت‌شده</span>
              <ShieldCheck size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
              {Number(stats.total_logs || 0).toLocaleString('fa-IR')}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#991b1b', fontSize: '12px', marginBottom: '8px' }}>
              <span>ارتقای دسترسی / نقش</span>
              <KeyRound size={18} color="#dc2626" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626' }}>
              {Number(stats.by_action?.PRIVILEGE_ESCALATION || 0).toLocaleString('fa-IR')}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#92400e', fontSize: '12px', marginBottom: '8px' }}>
              <span>دسترسی به داده‌های حساس</span>
              <Eye size={18} color="#d97706" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#d97706' }}>
              {Number(stats.by_action?.SENSITIVE_DATA_ACCESS || 0).toLocaleString('fa-IR')}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1e40af', fontSize: '12px', marginBottom: '8px' }}>
              <span>تغییرات پیکربندی</span>
              <Sliders size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb' }}>
              {Number(stats.by_action?.CONFIGURATION_CHANGE || 0).toLocaleString('fa-IR')}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b91c1c', fontSize: '12px', marginBottom: '8px' }}>
              <span>هشدارهای امنیتی</span>
              <AlertTriangle size={18} color="#b91c1c" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#b91c1c' }}>
              {Number(stats.by_status?.WARNING || 0).toLocaleString('fa-IR')}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '12px', 
        padding: '16px', 
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 240px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              placeholder="جستجو در شرح عملیات، شناسه منبع یا کاربر..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 36px 8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px'
              }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button 
            type="submit" 
            style={{ 
              background: '#2563eb', 
              color: '#fff', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            جستجو
          </button>
        </form>

        {/* Action Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>نوع عملیات:</span>
          <select 
            value={actionFilter} 
            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
            style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="all">همه عملیات‌ها</option>
            <option value="PRIVILEGE_ESCALATION">ارتقای دسترسی / نقش</option>
            <option value="SENSITIVE_DATA_ACCESS">دسترسی به داده‌های حساس</option>
            <option value="CONFIGURATION_CHANGE">تغییرات پیکربندی</option>
            <option value="SECURITY_EVENT">رخدادهای امنیتی</option>
            <option value="SUBSCRIPTION_CHANGE">تغییر اشتراک</option>
            <option value="TICKET_MANAGEMENT">مدیریت تیکت</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>وضعیت:</span>
          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="SUCCESS">موفق (SUCCESS)</option>
            <option value="WARNING">هشدار امنیتی (WARNING)</option>
            <option value="FAILURE">ناموفق (FAILURE)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="spin-animate" style={{ margin: '0 auto 8px' }} />
            <div>در حال بارگذاری وقایع حسابرسی...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            لاگ یا رخدادی با فیلترهای انتخابی یافت نشد.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>شناسه</th>
                  <th style={{ padding: '12px 16px' }}>زمان رخداد</th>
                  <th style={{ padding: '12px 16px' }}>نوع عملیات</th>
                  <th style={{ padding: '12px 16px' }}>کاربر اقدام‌کننده</th>
                  <th style={{ padding: '12px 16px' }}>شرح و جزئیات اقدام</th>
                  <th style={{ padding: '12px 16px' }}>نوع منبع</th>
                  <th style={{ padding: '12px 16px' }}>وضعیت</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>جزئیات</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const meta = ACTION_LABELS[log.action_type] || ACTION_LABELS.SYSTEM_ACTION;
                  const Icon = meta.icon;
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        style={{ 
                          borderBottom: '1px solid #f1f5f9',
                          background: isExpanded ? '#f8fafc' : undefined,
                          transition: 'background 0.15s'
                        }}
                      >
                        <td style={{ padding: '12px 16px', color: '#94a3b8', fontFamily: 'monospace' }}>
                          #{log.id}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                          {formatPersianDate(log.timestamp)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            background: meta.bg, 
                            color: meta.color, 
                            padding: '3px 8px', 
                            borderRadius: '6px', 
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            <Icon size={13} />
                            {meta.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: '#0f172a' }}>{log.user_name || 'سیستم'}</strong>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {log.user_role === 'admin' ? '🛡️ مدیر' : log.user_role === 'user' ? '👤 کاربر' : '⚙️ سیستم'}
                              {log.user_id ? ` (ID: ${log.user_id})` : ''}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#1e293b', maxWidth: '300px' }}>
                          <div>{log.action_description}</div>
                          {log.ip_address && (
                            <small style={{ color: '#94a3b8', direction: 'ltr', display: 'inline-block' }}>
                              IP: {log.ip_address}
                            </small>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: '#334155' }}>
                            {log.resource_type || 'SYSTEM'}
                          </code>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {log.status === 'SUCCESS' ? (
                            <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600 }}>
                              <CheckCircle2 size={14} />
                              موفق
                            </span>
                          ) : log.status === 'WARNING' ? (
                            <span style={{ color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600 }}>
                              <AlertTriangle size={14} />
                              هشدار
                            </span>
                          ) : (
                            <span style={{ color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600 }}>
                              <XCircle size={14} />
                              خطا
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            style={{
                              background: 'none',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11.5px',
                              color: '#475569'
                            }}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            <span>{isExpanded ? 'بستن' : 'مشاهده'}</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <td colSpan={8} style={{ padding: '16px 20px' }}>
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                              <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#1e293b' }}>
                                مشخصات و مقادیر ذخیره‌شده در لاگ حسابرسی:
                              </h4>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '12px', fontSize: '12.5px' }}>
                                <div><strong>شناسه منبع (Resource ID):</strong> {String(log.resource_id || '—')}</div>
                                <div><strong>آدرس IP کلاینت:</strong> <span dir="ltr">{log.ip_address || '—'}</span></div>
                                <div><strong>عامل کاربر (User Agent):</strong> <span dir="ltr" style={{ wordBreak: 'break-all', fontSize: '11px', color: '#64748b' }}>{log.user_agent || '—'}</span></div>
                              </div>

                              {log.old_value !== undefined && (
                                <div style={{ marginBottom: '8px' }}>
                                  <strong style={{ fontSize: '12px', color: '#64748b' }}>مقدار قبلی (Old Value):</strong>
                                  <pre style={{ direction: 'ltr', background: '#f1f5f9', padding: '8px', borderRadius: '6px', fontSize: '11px', overflowX: 'auto', margin: '4px 0' }}>
                                    {JSON.stringify(log.old_value, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {log.new_value !== undefined && (
                                <div style={{ marginBottom: '8px' }}>
                                  <strong style={{ fontSize: '12px', color: '#64748b' }}>مقدار جدید (New Value):</strong>
                                  <pre style={{ direction: 'ltr', background: '#eff6ff', padding: '8px', borderRadius: '6px', fontSize: '11px', overflowX: 'auto', margin: '4px 0' }}>
                                    {JSON.stringify(log.new_value, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {log.details && (
                                <div>
                                  <strong style={{ fontSize: '12px', color: '#64748b' }}>متادیتای کامل (Details Payload):</strong>
                                  <pre style={{ direction: 'ltr', background: '#0f172a', color: '#e2e8f0', padding: '10px', borderRadius: '6px', fontSize: '11px', overflowX: 'auto', margin: '4px 0' }}>
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {total > limit && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 16px', 
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: '13px'
          }}>
            <span style={{ color: '#64748b' }}>
              نمایش صفحه {Number(page).toLocaleString('fa-IR')} از {Number(totalPages).toLocaleString('fa-IR')} (مجموعاً {Number(total).toLocaleString('fa-IR')} رویداد)
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                type="button" 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
                style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                قبلی
              </button>
              <button 
                type="button" 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
