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
  Radio,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { api } from '../../services/api';

const SMS_FASTSEND_TEMPLATES = [
  {
    key: 'otp',
    label: 'کد ورود و اعتبارسنجی (OTP)',
    variables: ['CODE'],
    placeholderText: 'مثال: کد ورود شما به پنل کارویتا: #CODE#'
  },
  {
    key: 'invoice_issued',
    label: 'صدور پیش‌فاکتور جدید',
    variables: ['CUSTOMER', 'ORDER', 'AMOUNT', 'LINK'],
    placeholderText: 'مثال: کاربر گرامی #CUSTOMER#، پیش‌فاکتور سفارش ##ORDER# به مبلغ #AMOUNT# تومان صادر شد. لینک پرداخت: #LINK#'
  },
  {
    key: 'sub_expiring_7days',
    label: 'یادآوری ۷ روز مانده به انقضا',
    variables: ['CUSTOMER', 'DAYS', 'TITLE', 'LINK'],
    placeholderText: 'مثال: کاربر گرامی #CUSTOMER#، تنها #DAYS# روز از اشتراک #TITLE# شما باقی مانده است. جهت تمدید اقدام فرمایید.'
  },
  {
    key: 'sub_expiring_3days',
    label: 'یادآوری ۳ روز مانده به انقضا',
    variables: ['CUSTOMER', 'DAYS', 'TITLE', 'LINK'],
    placeholderText: 'مثال: هشدار مهم: کاربر گرامی #CUSTOMER#، اشتراک شما #TITLE# ظرف #DAYS# روز آینده منقضی می‌شود.'
  },
  {
    key: 'ticket_created',
    label: 'ثبت تیکت پشتیبانی جدید',
    variables: ['TICKET', 'SUBJECT', 'CUSTOMER'],
    placeholderText: 'مثال: کاربر گرامی #CUSTOMER#، تیکت پشتیبانی شما با شماره #TICKET# و موضوع «#SUBJECT#» با موفقیت ثبت شد.'
  },
  {
    key: 'payment_success',
    label: 'تایید پرداخت و تسویه فاکتور',
    variables: ['CUSTOMER', 'ORDER', 'AMOUNT', 'REF'],
    placeholderText: 'مثال: کاربر گرامی #CUSTOMER#، پرداخت فاکتور ##ORDER# به مبلغ #AMOUNT# تومان با شماره پیگیری #REF# با موفقیت تایید شد.'
  },
];

function FastSendTemplateCard({ tmpl, smsForm, setSmsForm }) {
  const hasId = !!smsForm.templates[tmpl.key] && Number(smsForm.templates[tmpl.key]) > 0;
  const hasText = !!smsForm.templateTexts?.[tmpl.key] && String(smsForm.templateTexts[tmpl.key]).trim() !== '';
  const isActive = hasId && hasText;

  const handleAppendVar = (v) => {
    const cur = smsForm.templateTexts?.[tmpl.key] || '';
    const tag = `#${v}#`;
    setSmsForm({
      ...smsForm,
      templateTexts: {
        ...smsForm.templateTexts,
        [tmpl.key]: cur ? `${cur} ${tag}` : tag
      }
    });
  };

  return (
    <div
      style={{
        background: '#f8fafc',
        padding: '14px 16px',
        borderRadius: '12px',
        border: isActive ? '1.5px solid #0870d1' : '1px solid #e2e8f0',
        boxShadow: isActive ? '0 2px 8px rgba(8, 112, 209, 0.08)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{tmpl.label}</strong>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '16px',
            background: isActive ? '#dcfce7' : '#fef3c7',
            color: isActive ? '#15803d' : '#b45309',
            border: isActive ? '1px solid #bbf7d0' : '1px solid #fde68a'
          }}
        >
          {isActive ? '✓ فعال و آماده ارسال' : '✕ غیرفعال (عدم ارسال پیامک)'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 140px) 1fr', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
            شناسه قالب:
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={smsForm.templates[tmpl.key] ?? ''}
            onChange={e => {
              const cleanDigits = e.target.value.replace(/\D/g, '');
              setSmsForm({
                ...smsForm,
                templates: { ...smsForm.templates, [tmpl.key]: cleanDigits }
              });
            }}
            dir="ltr"
            placeholder="Template ID"
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontFamily: 'monospace',
              background: '#ffffff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
            متن پیامک این قالب:
          </label>
          <textarea
            rows={2}
            value={smsForm.templateTexts?.[tmpl.key] ?? ''}
            onChange={e => {
              setSmsForm({
                ...smsForm,
                templateTexts: { ...smsForm.templateTexts, [tmpl.key]: e.target.value }
              });
            }}
            dir="rtl"
            placeholder={tmpl.placeholderText}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              lineHeight: '1.55',
              background: '#ffffff',
              boxSizing: 'border-box',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10.5px', color: '#64748b' }}>متغیرها:</span>
          {tmpl.variables.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => handleAppendVar(v)}
              title={`افزودن متغیر #${v}# به متن پیامک`}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '1px 5px',
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#0870d1',
                cursor: 'pointer'
              }}
            >
              +{v}
            </button>
          ))}
        </div>
        <small style={{ color: isActive ? '#64748b' : '#b45309', fontSize: '10.5px' }}>
          {isActive
            ? 'قالب و متن فعال است و هنگام رخداد این رویداد پیامک ارسال می‌شود.'
            : 'در صورت خالی بودن شناسه قالب یا متن، هیچ پیامکی برای این رویداد ارسال نخواهد شد.'}
        </small>
      </div>
    </div>
  );
}



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
  const [zibalTestResult, setZibalTestResult] = useState(null);

  // Form states
  const [zibalForm, setZibalForm] = useState({
    merchant: '',
    sandbox: false,
    enabled: true,
  });

  const [smsForm, setSmsForm] = useState({
    apiKey: '',
    lineNumber: '30007732',
    sandbox: true,
    enabled: true,
    templates: {
      otp: '',
      invoice_issued: '',
      sub_expiring_7days: '',
      sub_expiring_3days: '',
      ticket_created: '',
      payment_success: '',
    },
    templateTexts: {
      otp: '',
      invoice_issued: '',
      sub_expiring_7days: '',
      sub_expiring_3days: '',
      ticket_created: '',
      payment_success: '',
    }
  });

  // Helper to extract clean numeric template ID or empty string
  const extractTplValue = (val, altVal) => {
    const target = (val !== undefined && val !== null) ? val : altVal;
    if (target === undefined || target === null || target === '') return '';
    if (typeof target === 'object' && target !== null) {
      const id = target.id;
      return (id && Number(id) > 0) ? String(id) : '';
    }
    const num = Number(target);
    return num > 0 ? String(num) : '';
  };

  // Helper to extract template message text
  const extractTplText = (val, altVal, defaultText = '') => {
    const target = (val !== undefined && val !== null) ? val : altVal;
    if (target === undefined || target === null) return defaultText;
    if (typeof target === 'object' && target !== null) {
      return target.pattern || target.text || defaultText;
    }
    const str = String(target).trim();
    return str !== '' ? str : defaultText;
  };

  // Helper to extract verification code & message details for SMS logs
  const extractSmsCodeAndDetails = (log) => {
    let code = null;
    let details = '';
    const extraParams = [];

    // 1. Check parameters object (if present as object or parsed JSON)
    let paramsObj = log.parameters;
    if (typeof paramsObj === 'string') {
      try { paramsObj = JSON.parse(paramsObj); } catch (e) {}
    }
    if (paramsObj && typeof paramsObj === 'object') {
      Object.entries(paramsObj).forEach(([k, v]) => {
        const lowerKey = String(k).toLowerCase();
        if (['code', 'otp', 'passcode', 'verification_code'].includes(lowerKey)) {
          code = String(v);
        } else {
          extraParams.push({ key: k, value: String(v) });
        }
      });
    }

    // 2. Check direct code property
    if (!code && log.code) {
      code = String(log.code);
    }

    // 3. Extract code from message if not found yet
    const rawMsg = String(log.message || '').trim();
    if (!code && rawMsg) {
      const match = rawMsg.match(/(?:CODE|Code|کد تایید|کد|رمز)\s*[:=]\s*([0-9]{4,8})/i);
      if (match) {
        code = match[1];
      }
    }

    // 4. Formulate clean details text
    if (rawMsg) {
      if (rawMsg.includes('ارسال پیامک با الگو')) {
        const tplMatch = rawMsg.match(/قالب\s*(\d+)/);
        const tplId = tplMatch ? tplMatch[1] : log.template_id;
        details = tplId ? `ارسال با الگوی خدماتی SMS.ir (قالب #${tplId})` : 'ارسال با الگوی خدماتی SMS.ir';
      } else {
        details = rawMsg;
      }
    } else if (log.template_title) {
      details = log.template_title + (log.template_id ? ` (قالب #${log.template_id})` : '');
    } else if (log.template_id) {
      details = `الگوی خدماتی (قالب #${log.template_id})`;
    }

    return { code, details, extraParams };
  };

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
            merchant: settingsRes.data.zibal.merchant || '',
            sandbox: Boolean(settingsRes.data.zibal.sandbox),
            enabled: settingsRes.data.zibal.enabled !== false,
          });
        }
        if (settingsRes.data.sms) {
          const rawTpls = settingsRes.data.sms.templates || {};
          const rawTexts = settingsRes.data.sms.template_texts || settingsRes.data.sms.patterns || {};
          const rawDetails = settingsRes.data.sms.template_details || {};

          setSmsForm({
            apiKey: settingsRes.data.sms.apiKey || '',
            lineNumber: settingsRes.data.sms.lineNumber || '30007732',
            sandbox: !!settingsRes.data.sms.sandbox,
            enabled: settingsRes.data.sms.enabled !== false,
            templates: {
              otp: extractTplValue(rawTpls.otp, rawDetails.otp),
              invoice_issued: extractTplValue(rawTpls.invoice_issued, rawDetails.invoice_issued),
              sub_expiring_7days: extractTplValue(rawTpls.sub_expiring_7days, rawTpls.sub_expiry_7days || rawDetails.sub_expiring_7days),
              sub_expiring_3days: extractTplValue(rawTpls.sub_expiring_3days, rawTpls.sub_expiry_3days || rawDetails.sub_expiring_3days),
              ticket_created: extractTplValue(rawTpls.ticket_created, rawDetails.ticket_created),
              payment_success: extractTplValue(rawTpls.payment_success, rawDetails.payment_success),
            },
            templateTexts: {
              otp: extractTplText(rawTexts.otp, rawDetails.otp?.pattern, 'کد ورود شما به پنل کارویتا: #CODE#'),
              invoice_issued: extractTplText(rawTexts.invoice_issued, rawDetails.invoice_issued?.pattern, 'کاربر گرامی #CUSTOMER#، پیش‌فاکتور سفارش ##ORDER# به مبلغ #AMOUNT# تومان صادر شد. لینک پرداخت: #LINK#'),
              sub_expiring_7days: extractTplText(rawTexts.sub_expiring_7days, rawTexts.sub_expiry_7days || rawDetails.sub_expiring_7days?.pattern, 'کاربر گرامی #CUSTOMER#، تنها #DAYS# روز از اشتراک #TITLE# شما باقی مانده است. جهت تمدید اقدام فرمایید.'),
              sub_expiring_3days: extractTplText(rawTexts.sub_expiring_3days, rawTexts.sub_expiry_3days || rawDetails.sub_expiring_3days?.pattern, 'هشدار مهم: کاربر گرامی #CUSTOMER#، اشتراک شما #TITLE# ظرف #DAYS# روز آینده منقضی می‌شود.'),
              ticket_created: extractTplText(rawTexts.ticket_created, rawDetails.ticket_created?.pattern, 'کاربر گرامی #CUSTOMER#، تیکت پشتیبانی شما با شماره #TICKET# و موضوع «#SUBJECT#» با موفقیت ثبت شد.'),
              payment_success: extractTplText(rawTexts.payment_success, rawDetails.payment_success?.pattern, 'کاربر گرامی #CUSTOMER#، پرداخت فاکتور ##ORDER# به مبلغ #AMOUNT# تومان با شماره پیگیری #REF# با موفقیت تایید شد.'),
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
      // Normalize templates: empty strings or 0 explicitly become null
      const cleanedTemplates = {};
      const cleanedTexts = {};
      Object.keys(smsForm.templates).forEach(k => {
        const v = smsForm.templates[k];
        cleanedTemplates[k] = (v && String(v).trim() !== '' && Number(v) > 0) ? Number(v) : null;
        cleanedTexts[k] = (smsForm.templateTexts && smsForm.templateTexts[k] !== undefined)
          ? String(smsForm.templateTexts[k]).trim()
          : '';
      });

      const res = await api('/admin/gateways/settings', {
        method: 'PUT',
        body: JSON.stringify({
          zibal: zibalForm,
          sms: {
            ...smsForm,
            templates: cleanedTemplates,
            template_texts: cleanedTexts,
          },
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
    setZibalTestResult(null);
    try {
      const res = await api('/admin/gateways/zibal/test', {
        method: 'POST',
        body: JSON.stringify({ amount: 10000 })
      });
      showToast(res.message || 'تست درگاه پرداخت شاپرک زیبال موفقیت‌آمیز بود.');
      setZibalTestResult({
        success: true,
        message: res.message,
        data: res.data,
      });
      await loadData();
    } catch (err) {
      const errMsg = err.message || 'خطا در ارتباط با وب‌سرویس زیبال';
      showToast(errMsg, 'error');
      setZibalTestResult({
        success: false,
        message: errMsg,
        data: err.data?.data || err.data,
      });
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

    const tplId = smsForm.templates[testEventType];
    const tplText = smsForm.templateTexts?.[testEventType];
    if (!tplId || Number(tplId) <= 0 || !tplText || String(tplText).trim() === '') {
      showToast('شناسه قالب یا متن پیامک برای رویداد انتخابی ثبت نشده است. ابتدا در تب تنظیمات قالب و متن را ثبت و ذخیره فرمایید.', 'error');
      return;
    }

    setTestLoading(true);
    try {
      const res = await api('/admin/gateways/sms/test', {
        method: 'POST',
        body: JSON.stringify({
          mobile: testMobile.replace(/\D/g, ''),
          event_type: testEventType,
          template_id: tplId,
        })
      });
      showToast(res.message || 'پیامک تست ارسال شد.');
      setTestResult({ type: 'sms', data: res.data });
      // Reload logs
      const logsRes = await api('/admin/gateways/sms/logs?limit=50');
      if (logsRes && logsRes.data) setSmsLogs(logsRes.data);
    } catch (err) {
      showToast(err.message || 'خطا در ارسال پیامک تست', 'error');
      setTestResult({ type: 'sms', data: { error: err.message, details: err.data } });
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
                  <strong style={{ fontFamily: 'monospace' }}>{zibalForm.merchant || '(تنظیم نشده)'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>کال‌بک تأیید تراکنش:</span>
                  <strong style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#0284c7' }}>/api/payments/zibal/callback</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleTestZibal}
                  disabled={testLoading}
                  style={{
                    width: '100%',
                    background: testLoading ? '#f1f5f9' : '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: testLoading ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} color="#0870d1" />
                  <span>{testLoading ? 'در حال برقراری ارتباط با درگاه زیبال…' : 'تست اتصال درگاه'}</span>
                </button>

                {zibalTestResult && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    background: zibalTestResult.success ? '#f0fdf4' : '#fff1f2',
                    border: `1px solid ${zibalTestResult.success ? '#bbf7d0' : '#fecdd3'}`,
                    color: zibalTestResult.success ? '#166534' : '#9f1239',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      {zibalTestResult.success ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>{zibalTestResult.message}</div>
                        {zibalTestResult.data?.trackId && (
                          <div style={{ marginTop: '4px', fontFamily: 'monospace' }}>
                            شناسه رهگیری شاپرک: <strong>{zibalTestResult.data.trackId}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                {(() => {
                  const tId = smsForm.templates[testEventType];
                  const tText = smsForm.templateTexts?.[testEventType];
                  const isOk = !!tId && Number(tId) > 0 && !!tText && String(tText).trim() !== '';
                  return (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: isOk ? '#166534' : '#b45309' }}>
                      {isOk
                        ? `✓ شناسه: ${tId} | متن پیامک آماده ارسال`
                        : `✕ شناسه یا متن تنظیم نیست (عدم ارسال)`}
                    </div>
                  );
                })()}
              </div>

              <button
                type="submit"
                disabled={testLoading || !smsForm.templates[testEventType] || Number(smsForm.templates[testEventType]) <= 0 || !smsForm.templateTexts?.[testEventType] || String(smsForm.templateTexts[testEventType]).trim() === ''}
                title={(!smsForm.templates[testEventType] || Number(smsForm.templates[testEventType]) <= 0 || !smsForm.templateTexts?.[testEventType] || String(smsForm.templateTexts[testEventType]).trim() === '') ? 'شناسه قالب یا متن پیامک ست نشده است' : 'ارسال پیامک آزمایشی'}
                style={{
                  background: (!smsForm.templates[testEventType] || Number(smsForm.templates[testEventType]) <= 0 || !smsForm.templateTexts?.[testEventType] || String(smsForm.templateTexts[testEventType]).trim() === '') ? '#94a3b8' : '#0870d1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: (!smsForm.templates[testEventType] || Number(smsForm.templates[testEventType]) <= 0 || !smsForm.templateTexts?.[testEventType] || String(smsForm.templateTexts[testEventType]).trim() === '') ? 'not-allowed' : 'pointer',
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
                placeholder="کد مرچنت اختصاصی دریافتی از پنل زیبال"
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
                کد مرچنت اختصاصی دریافتی از پنل درگاه پرداخت زیبال را وارد نمایید.
              </small>
            </div>

            <div style={{ marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
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

              <button
                type="button"
                onClick={handleTestZibal}
                disabled={testLoading}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: testLoading ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={16} color="#0870d1" />
                <span>{testLoading ? 'در حال برقراری ارتباط با زیبال…' : 'تست اتصال زنده درگاه زیبال'}</span>
              </button>
            </div>

            {zibalTestResult && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '10px',
                fontSize: '13px',
                lineHeight: '1.6',
                background: zibalTestResult.success ? '#f0fdf4' : '#fff1f2',
                border: `1px solid ${zibalTestResult.success ? '#86efac' : '#fecdd3'}`,
                color: zibalTestResult.success ? '#166534' : '#9f1239',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  {zibalTestResult.success ? <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>{zibalTestResult.message}</div>
                    {zibalTestResult.data?.trackId && (
                      <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '13px' }}>
                        شناسه رهگیری شاپرک (Track ID): <strong>{zibalTestResult.data.trackId}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  شناسه‌های قالب FastSend و متن الگوهای تأییدشده در SMS.ir:
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  برای هر رویداد، شناسه قالب FastSend و متن پیامک آن را مشخص فرمایید. در صورت خالی بودن شناسه یا متن هر باکس، ارسال پیامک برای آن رویداد غیرفعال خواهد بود.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '14px' }}>
                {SMS_FASTSEND_TEMPLATES.map(tmpl => (
                  <FastSendTemplateCard
                    key={tmpl.key}
                    tmpl={tmpl}
                    smsForm={smsForm}
                    setSmsForm={setSmsForm}
                  />
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
          {/* Header & Quick Refresh */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
                آرشیو و تاریخچه پیامک‌های ارسال‌شده ({smsLogs.length} پیامک)
              </h2>
              <small style={{ color: '#64748b', display: 'block', marginTop: '2px' }}>
                پایش لحظه‌ای وضعیت ارسال، استعلام از وب‌سرویس SMS.ir، پارامترهای ارسالی و شناسه‌های رهگیری
              </small>
            </div>

            <button
              type="button"
              onClick={loadData}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>تازه‌سازی لاگ‌ها</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>تعداد کل پیامک‌های ثبت‌شده</span>
              <strong style={{ display: 'block', fontSize: '18px', color: '#0f172a', marginTop: '4px' }}>
                {smsLogs.length.toLocaleString('fa-IR')}
              </strong>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px' }}>
              <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: 600 }}>ارسال‌های موفق و تحویل‌شده</span>
              <strong style={{ display: 'block', fontSize: '18px', color: '#15803d', marginTop: '4px' }}>
                {smsLogs.filter(l => l.status === 'sent' || l.status === 'delivered' || l.status === 'success').length.toLocaleString('fa-IR')}
              </strong>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px' }}>
              <span style={{ fontSize: '11.5px', color: '#991b1b', fontWeight: 600 }}>ارسال‌های ناموفق / خطای قالب</span>
              <strong style={{ display: 'block', fontSize: '18px', color: '#dc2626', marginTop: '4px' }}>
                {smsLogs.filter(l => l.status === 'failed').length.toLocaleString('fa-IR')}
              </strong>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px' }}>
              <span style={{ fontSize: '11.5px', color: '#1d4ed8', fontWeight: 600 }}>وب‌سرویس فعال</span>
              <strong style={{ display: 'block', fontSize: '14px', color: '#1e40af', marginTop: '6px' }}>
                SMS.ir (Verify Pattern)
              </strong>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px' }}>
                  <th style={{ padding: '11px 14px' }}>زمان ارسال</th>
                  <th style={{ padding: '11px 14px' }}>شماره گیرنده</th>
                  <th style={{ padding: '11px 14px' }}>نام کاربر</th>
                  <th style={{ padding: '11px 14px' }}>نوع رویداد</th>
                  <th style={{ padding: '11px 14px' }}>کد و جزئیات پیامک ارسالی</th>
                  <th style={{ padding: '11px 14px' }}>وضعیت ارسال</th>
                </tr>
              </thead>
              <tbody>
                {smsLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      هنوز پیامکی در سامانه ثبت نگردیده است.
                    </td>
                  </tr>
                ) : (
                  smsLogs.map(log => {
                    const rawDate = log.timestamp || log.created_at || log.date;
                    let formattedDate = '—';
                    if (rawDate) {
                      try {
                        const dt = new Date(rawDate);
                        if (!isNaN(dt.getTime())) {
                          formattedDate = `${dt.toLocaleDateString('fa-IR')} | ${dt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
                        }
                      } catch (e) {}
                    }

                    const eventLabels = {
                      otp: { label: 'کد ورود OTP', bg: '#eff6ff', color: '#1d4ed8' },
                      invoice_issued: { label: 'صدور پیش‌فاکتور', bg: '#f5f3ff', color: '#7c3aed' },
                      sub_expiry_7days: { label: 'یادآوری ۷ روز اشتراک', bg: '#fffbeb', color: '#b45309' },
                      sub_expiry_3days: { label: 'هشدار ۳ روز اشتراک', bg: '#fff7ed', color: '#c2410c' },
                      ticket_created: { label: 'ثبت تیکت پشتیبانی', bg: '#f0f9ff', color: '#0369a1' },
                      payment_success: { label: 'تسویه پرداخت شاپرک', bg: '#f0fdf4', color: '#15803d' },
                      custom_test: { label: 'تست دستی پیامک', bg: '#f1f5f9', color: '#475569' },
                    };
                    const evt = eventLabels[log.event_type] || { label: log.event_type || 'پیامک سیستم', bg: '#f1f5f9', color: '#475569' };

                    const statusStr = String(log.status || '').toLowerCase();
                    const isSuccess = statusStr === 'sent' || statusStr === 'delivered' || statusStr === 'success';
                    const isSimulated = statusStr === 'simulated';

                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '11px 14px', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={13} color="#94a3b8" />
                            <span>{formattedDate}</span>
                          </div>
                        </td>

                        <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontWeight: 700, direction: 'ltr', textAlign: 'right' }}>
                          {log.mobile}
                        </td>

                        <td style={{ padding: '11px 14px', color: '#0f172a', fontWeight: 600 }}>
                          {log.user_name || (log.mobile === '09111273476' ? 'اردلان داوودی (مدیر)' : 'کاربر سیستم')}
                        </td>

                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            background: evt.bg,
                            color: evt.color,
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            display: 'inline-block'
                          }}>
                            {evt.label}
                          </span>
                        </td>

                        <td style={{ padding: '11px 14px', color: '#334155' }}>
                          {(() => {
                            const { code, details, extraParams } = extractSmsCodeAndDetails(log);
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {code && (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                      background: '#eff6ff',
                                      color: '#1d4ed8',
                                      border: '1px solid #bfdbfe',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontWeight: 800,
                                      fontSize: '13px',
                                      fontFamily: 'monospace',
                                      letterSpacing: '1.2px',
                                      direction: 'ltr',
                                      display: 'inline-block'
                                    }}>
                                      {code}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
                                      کد تأیید ارسالی
                                    </span>
                                  </div>
                                )}
                                {details && (
                                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                    {details}
                                  </div>
                                )}
                                {extraParams.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                                    {extraParams.map(p => (
                                      <span key={p.key} style={{
                                        fontSize: '11px',
                                        background: '#f8fafc',
                                        color: '#334155',
                                        border: '1px solid #e2e8f0',
                                        padding: '1px 6px',
                                        borderRadius: '4px'
                                      }}>
                                        <strong style={{ color: '#0284c7' }}>{p.key}:</strong> {p.value}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {!code && !details && extraParams.length === 0 && (
                                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        <td style={{ padding: '11px 14px' }}>
                          {isSuccess ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                width: 'fit-content'
                              }}>
                                <CheckCircle2 size={13} />
                                <span>ارسال موفق</span>
                              </span>
                              {log.message_id && (
                                <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }} title="شناسه پیامک ارسالی در سرور SMS.ir">
                                  پیگیری: {log.message_id}
                                </span>
                              )}
                            </div>
                          ) : isSimulated ? (
                            <span style={{
                              background: '#e0f2fe',
                              color: '#0369a1',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle2 size={13} />
                              <span>✓ شبیه‌سازی تست</span>
                            </span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{
                                background: '#fee2e2',
                                color: '#991b1b',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                width: 'fit-content'
                              }}>
                                <AlertCircle size={13} />
                                <span>ناموفق</span>
                              </span>
                              {log.error && (
                                <span style={{ fontSize: '10.5px', color: '#dc2626' }}>
                                  {log.error}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
