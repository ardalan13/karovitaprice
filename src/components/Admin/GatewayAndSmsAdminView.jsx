import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Settings,
  Zap,
  Phone,
  Layers,
  Clock,
  FileText,
  Key,
  Globe,
  Radio,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export function GatewayAndSmsAdminView() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'zibal' | 'sms' | 'logs'
  const [settings, setSettings] = useState(null);
  const [health, setHealth] = useState(null);
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [zibalForm, setZibalForm] = useState({
    merchant: 'zibal',
    sandbox: true,
    enabled: true,
  });

  const [smsForm, setSmsForm] = useState({
    apiKey: '',
    lineNumber: '30007732',
    sandbox: true,
    enabled: true,
    templates: {
      otp: 100001,
      invoice_issued: 100002,
      sub_expiring_7days: 100003,
      sub_expiring_3days: 100004,
      ticket_created: 100005,
      payment_success: 100006,
    }
  });

  // Test states
  const [testMobile, setTestMobile] = useState('');
  const [testEventType, setTestEventType] = useState('otp');
  const [testResult, setTestResult] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, healthRes, logsRes] = await Promise.all([
        api('/admin/gateways/settings'),
        api('/admin/gateways/health'),
        api('/admin/gateways/sms/logs?limit=50')
      ]);

      if (settingsRes && settingsRes.data) {
        setSettings(settingsRes.data);
        if (settingsRes.data.zibal) {
          setZibalForm({
            merchant: settingsRes.data.zibal.merchant || 'zibal',
            sandbox: !!settingsRes.data.zibal.sandbox,
            enabled: settingsRes.data.zibal.enabled !== false,
          });
        }
        if (settingsRes.data.sms) {
          setSmsForm({
            apiKey: settingsRes.data.sms.apiKey || '',
            lineNumber: settingsRes.data.sms.lineNumber || '30007732',
            sandbox: !!settingsRes.data.sms.sandbox,
            enabled: settingsRes.data.sms.enabled !== false,
            templates: {
              otp: settingsRes.data.sms.templates?.otp || 100001,
              invoice_issued: settingsRes.data.sms.templates?.invoice_issued || 100002,
              sub_expiring_7days: settingsRes.data.sms.templates?.sub_expiring_7days || 100003,
              sub_expiring_3days: settingsRes.data.sms.templates?.sub_expiring_3days || 100004,
              ticket_created: settingsRes.data.sms.templates?.ticket_created || 100005,
              payment_success: settingsRes.data.sms.templates?.payment_success || 100006,
            }
          });
        }
      }

      if (healthRes) setHealth(healthRes);
      if (logsRes && logsRes.data) setSmsLogs(logsRes.data);
    } catch (err) {
      showToast(err.message || 'خطا در بارگذاری تنظیمات درگاه‌ها', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await api('/admin/gateways/settings', {
        method: 'PUT',
        body: JSON.stringify({
          zibal: zibalForm,
          sms: smsForm,
        })
      });
      showToast(res.message || 'تنظیمات درگاه‌ها با موفقیت ذخیره شد.');
      await loadData();
    } catch (err) {
      showToast(err.message || 'خطا در ذخیره تنظیمات', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestZibal = async () => {
    setTestLoading(true);
    try {
      const res = await api('/admin/gateways/zibal/test', {
        method: 'POST',
        body: JSON.stringify({ amount: 10000 })
      });
      showToast(res.message || 'تست درگاه پرداخت شاپرک زیبال موفقیت‌آمیز بود.');
      setTestResult({ type: 'zibal', data: res.data });
    } catch (err) {
      showToast(err.message || 'خطا در تست زیبال', 'error');
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestSms = async (e) => {
    e.preventDefault();
    if (!testMobile || !/^09\d{9}$/.test(testMobile.replace(/\D/g, ''))) {
      showToast('شماره موبایل ۱۱ رقمی معتبر وارد نمایید (مثال: 09123456789)', 'error');
      return;
    }

    setTestLoading(true);
    try {
      const res = await api('/admin/gateways/sms/test', {
        method: 'POST',
        body: JSON.stringify({
          mobile: testMobile.replace(/\D/g, ''),
          event_type: testEventType,
          template_id: smsForm.templates[testEventType] || undefined,
        })
      });
      showToast(res.message || 'پیامک تست ارسال شد.');
      setTestResult({ type: 'sms', data: res.data });
      // Reload logs
      const logsRes = await api('/admin/gateways/sms/logs?limit=50');
      if (logsRes && logsRes.data) setSmsLogs(logsRes.data);
    } catch (err) {
      showToast(err.message || 'خطا در ارسال پیامک تست', 'error');
    } finally {
      setTestLoading(false);
    }
  };

  const handleTriggerReminders = async () => {
    setScanLoading(true);
    try {
      const res = await api('/admin/gateways/sms/trigger-reminders', {
        method: 'POST'
      });
      showToast(res.message || 'اسکن انقضای اشتراک‌ها انجام شد.');
      // Reload logs
      const logsRes = await api('/admin/gateways/sms/logs?limit=50');
      if (logsRes && logsRes.data) setSmsLogs(logsRes.data);
    } catch (err) {
      showToast(err.message || 'خطا در اجرای اسکن انقضا', 'error');
    } finally {
      setScanLoading(false);
    }
  };

  if (loading && !settings) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px', color: '#0870d1' }} />
        <p>در حال دریافت پیکربندی درگاه‌های بانکی و وب‌سرویس پیامکی…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} dir="rtl" id="gateway-sms-admin-view">
      
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          border: toast.type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac',
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#991b1b' : '#166534',
          fontSize: '13.5px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.text}</span>
          <button type="button" onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0870d1 0%, #0284c7 100%)',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <CreditCard size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                مدیریت درگاه‌های پرداخت بانکی شاپرک و پیامک خدماتی SMS.ir
              </h1>
              <span style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                شاپرک زیبال + SMS.ir v2.0
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              پیکربندی مرچنت کد واقعی بانکی، وب‌سرویس ارسال سریع الگوهای پیامکی، اطلاع‌رسانی خودکار و آرشیو لاگ‌های تحویل
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>بروزرسانی</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            style={{
              background: '#0870d1',
              border: 'none',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(8, 112, 209, 0.4)'
            }}
          >
            <Check size={16} />
            <span>{saving ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
        {[
          { id: 'overview', label: 'وضعیت سلامت و داشبورد', icon: Zap },
          { id: 'zibal', label: 'درگاه پرداخت شاپرک زیبال', icon: CreditCard },
          { id: 'sms', label: 'وب‌سرویس پیامکی SMS.ir و قالب‌ها', icon: MessageSquare },
          { id: 'logs', label: `لاگ‌های تحویل پیامک (${smsLogs.length})`, icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#0870d1' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '13px',
                padding: '9px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & HEALTH */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Health Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* Zibal Status Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#eff6ff', color: '#0870d1', padding: '8px', borderRadius: '10px' }}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>درگاه شاپرک زیبال</h3>
                    <small style={{ color: '#64748b' }}>پروتکل پرداخت اینترنتی شاپرک</small>
                  </div>
                </div>
                <span style={{
                  background: zibalForm.enabled ? '#dcfce7' : '#fee2e2',
                  color: zibalForm.enabled ? '#166534' : '#991b1b',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  {zibalForm.enabled ? 'فعال و عملیاتی' : 'غیرفعال'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px' }}>
                  <span>حالت عملیاتی:</span>
                  <strong style={{ color: zibalForm.sandbox ? '#b45309' : '#166534' }}>
                    {zibalForm.sandbox ? 'سندباکس / شبیه‌ساز تست' : 'محیط واقعی شاپرک (Production)'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px' }}>
                  <span>کد مرچنت:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{zibalForm.merchant}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>کال‌بک تأیید تراکنش:</span>
                  <strong style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#0284c7' }}>/api/payments/zibal/callback</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleTestZibal}
                  disabled={testLoading}
                  style={{
                    flex: 1,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} color="#0870d1" />
                  <span>تست اتصال درگاه</span>
                </button>
              </div>
            </div>

            {/* SMS.ir Status Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '8px', borderRadius: '10px' }}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>سامانه پیامک SMS.ir</h3>
                    <small style={{ color: '#64748b' }}>وب‌سرویس FastSend خطوط خدماتی</small>
                  </div>
                </div>
                <span style={{
                  background: smsForm.enabled ? '#dcfce7' : '#fee2e2',
                  color: smsForm.enabled ? '#166534' : '#991b1b',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  {smsForm.enabled ? 'فعال و عملیاتی' : 'غیرفعال'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px' }}>
                  <span>وضعیت اتصال:</span>
                  <strong style={{ color: health?.sms?.status === 'healthy' ? '#166534' : '#b45309' }}>
                    {health?.sms?.status === 'healthy' ? 'اتصال برقرار (اعتبار سنجی شد)' : (health?.sms?.status === 'sandbox' ? 'حالت شبیه‌ساز امن' : 'نیازمند تنظیم')}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px' }}>
                  <span>شماره خط خدماتی:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{smsForm.lineNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>تعداد رویدادهای خودکار:</span>
                  <strong style={{ color: '#1d4ed8' }}>۶ قالب اختصاصی</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleTriggerReminders}
                  disabled={scanLoading}
                  style={{
                    flex: 1,
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Clock size={14} className={scanLoading ? 'spin' : ''} />
                  <span>اجرای اسکن انقضای اشتراک (۷ و ۳ روز)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Manual SMS Dispatcher Form */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '22px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} color="#0870d1" />
              <span>ارسال سریع پیامک آزمایشی به شماره همراه</span>
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b' }}>
              تست فوری کارکرد وب‌سرویس SMS.ir و الگوهای تاییدشده با شماره موبایل کاربری
            </p>

            <form onSubmit={handleTestSms} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  شماره موبایل گیرنده:
                </label>
                <input
                  type="tel"
                  placeholder="09123456789"
                  value={testMobile}
                  onChange={e => setTestMobile(e.target.value)}
                  dir="ltr"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  نوع رویداد و الگو:
                </label>
                <select
                  value={testEventType}
                  onChange={e => setTestEventType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="otp">کد تایید ورود (OTP)</option>
                  <option value="invoice_issued">صدور پیش‌فاکتور جدید</option>
                  <option value="sub_expiring_7days">یادآوری ۷ روز مانده به انقضا</option>
                  <option value="sub_expiring_3days">یادآوری ۳ روز مانده به انقضا</option>
                  <option value="ticket_created">ثبت تیکت پشتیبانی جدید</option>
                  <option value="payment_success">تراکنش و پرداخت موفق</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={testLoading}
                style={{
                  background: '#0870d1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '40px'
                }}
              >
                <Send size={15} />
                <span>{testLoading ? 'در حال ارسال…' : 'ارسال تست پیامک'}</span>
              </button>
            </form>

            {testResult && (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12.5px' }}>
                <strong style={{ color: '#0f172a' }}>نتیجه آخرین تست:</strong>
                <pre style={{ margin: '6px 0 0', direction: 'ltr', textAlign: 'left', background: '#ffffff', padding: '10px', borderRadius: '6px', overflowX: 'auto', border: '1px solid #e2e8f0' }}>
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ZIBAL PAYMENT SETTINGS */}
      {activeTab === 'zibal' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            پیکربندی درگاه پرداخت اینترنتی شاپرک زیبال (Zibal)
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
            اتصال به سوئیچ مرکزی شاپرک برای پرداخت الکترونیکی کلیه کارت‌های عضو شتاب
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '650px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={zibalForm.enabled}
                onChange={e => setZibalForm({ ...zibalForm, enabled: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                فعال‌سازی درگاه زیبال در فرآیند تسویه فاکتورها
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={zibalForm.sandbox}
                onChange={e => setZibalForm({ ...zibalForm, sandbox: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                  حالت سندباکس و شبیه‌ساز تست (Sandbox)
                </span>
                <small style={{ display: 'block', color: '#64748b', fontSize: '11.5px' }}>
                  در این حالت بدون کسر موجودی از کارت بانکی، تراکنش‌ها با کد پیگیری معتبر شبیه‌سازی می‌شوند.
                </small>
              </div>
            </label>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                کد مرچنت زیبال (Merchant ID):
              </label>
              <input
                type="text"
                placeholder="zibal یا کد اختصاصی دریافتی از پنل زیبال"
                value={zibalForm.merchant}
                onChange={e => setZibalForm({ ...zibalForm, merchant: e.target.value })}
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ color: '#64748b', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>
                برای تست سندباکس مقدار <code>zibal</code> را قرار دهید. برای اتصال واقعی، مرچنت کد ۳۲ کاراکتری خود را وارد نمایید.
              </small>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                style={{
                  background: '#0870d1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {saving ? 'در حال ذخیره‌سازی…' : 'ذخیره تنظیمات درگاه زیبال'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMS.IR SETTINGS */}
      {activeTab === 'sms' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            پیکربندی وب‌سرویس پیامکی SMS.ir و شناسه‌های قالب (Templates)
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
            ارسال فوق‌سریع پیامک‌های تراکنشی و اطلاع‌رسانی از طریق خطوط خدماتی (حتی به شماره‌های بلک‌لیست)
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '750px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  کلید دسترسی وب‌سرویس (API Key):
                </label>
                <input
                  type="password"
                  placeholder="کلید دریافتی از پنل SMS.ir"
                  value={smsForm.apiKey}
                  onChange={e => setSmsForm({ ...smsForm, apiKey: e.target.value })}
                  dir="ltr"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  شماره خط فرستنده:
                </label>
                <input
                  type="text"
                  placeholder="30007732"
                  value={smsForm.lineNumber}
                  onChange={e => setSmsForm({ ...smsForm, lineNumber: e.target.value })}
                  dir="ltr"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                شناسه‌های قالب FastSend تأییدشده در پنل SMS.ir:
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {[
                  { key: 'otp', label: 'کد ورود و اعتبارسنجی (OTP)', desc: 'متغیر: CODE' },
                  { key: 'invoice_issued', label: 'صدور پیش‌فاکتور جدید', desc: 'متغیرها: CUSTOMER, ORDER, AMOUNT, LINK' },
                  { key: 'sub_expiring_7days', label: 'یادآوری ۷ روز مانده به انقضا', desc: 'متغیرها: CUSTOMER, DAYS, TITLE, LINK' },
                  { key: 'sub_expiring_3days', label: 'یادآوری ۳ روز مانده به انقضا', desc: 'متغیرها: CUSTOMER, DAYS, TITLE, LINK' },
                  { key: 'ticket_created', label: 'ثبت تیکت پشتیبانی جدید', desc: 'متغیرها: TICKET, SUBJECT, CUSTOMER' },
                  { key: 'payment_success', label: 'تایید پرداخت و تسویه فاکتور', desc: 'متغیرها: CUSTOMER, ORDER, AMOUNT, REF' },
                ].map(tmpl => (
                  <div key={tmpl.key} style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      {tmpl.label}
                    </label>
                    <input
                      type="number"
                      value={smsForm.templates[tmpl.key] || ''}
                      onChange={e => setSmsForm({
                        ...smsForm,
                        templates: {
                          ...smsForm.templates,
                          [tmpl.key]: Number(e.target.value) || 0
                        }
                      })}
                      dir="ltr"
                      placeholder="Template ID"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                    />
                    <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                      {tmpl.desc}
                    </small>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                style={{
                  background: '#0870d1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {saving ? 'در حال ذخیره‌سازی…' : 'ذخیره تنظیمات پیامک SMS.ir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SMS LOGS */}
      {activeTab === 'logs' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                آرشیو و تاریخچه پیامک‌های ارسال‌شده ({smsLogs.length} پیامک)
              </h2>
              <small style={{ color: '#64748b' }}>پایش لحظه‌ای وضعیت تحویل و پارامترهای ارسالی</small>
            </div>

            <button
              type="button"
              onClick={loadData}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={13} />
              <span>تازه‌سازی لاگ‌ها</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px' }}>
                  <th style={{ padding: '10px 12px' }}>زمان ارسال</th>
                  <th style={{ padding: '10px 12px' }}>شماره گیرنده</th>
                  <th style={{ padding: '10px 12px' }}>نام کاربر</th>
                  <th style={{ padding: '10px 12px' }}>نوع رویداد</th>
                  <th style={{ padding: '10px 12px' }}>قالب</th>
                  <th style={{ padding: '10px 12px' }}>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {smsLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      هنوز پیامکی در سامانه ثبت نگردیده است.
                    </td>
                  </tr>
                ) : (
                  smsLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '12px' }}>
                        {new Date(log.created_at).toLocaleDateString('fa-IR')} {new Date(log.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, direction: 'ltr', textAlign: 'right' }}>
                        {log.mobile}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#0f172a' }}>
                        {log.user_name || 'کاربر سیستم'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                          {log.event_type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569', fontSize: '12px' }}>
                        {log.template_title || log.template_id || '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          background: log.status === 'delivered' || log.status === 'simulated' ? '#dcfce7' : '#fee2e2',
                          color: log.status === 'delivered' || log.status === 'simulated' ? '#166534' : '#991b1b',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 700
                        }}>
                          {log.status === 'delivered' ? '✓ تحویل شد' : (log.status === 'simulated' ? '✓ شبیه‌سازی موفق' : 'خطا')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
