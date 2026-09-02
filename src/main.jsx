import React, { useEffect, useState, useRef, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Receipt, User, LogOut, Building2, Clock3, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, Menu, X, Settings, Edit3, Save, ShieldCheck, Lock, Phone, RotateCw, AlertCircle, Headphones, Plus, Eye, LogIn, ExternalLink, FileText, BellRing, Bug, MessageSquare } from 'lucide-react';
import { api } from './services/api';
import { initClientLogger, logError } from './services/logger';
import { initPerformanceMonitoring } from './services/vitals';
import { registerServiceWorker } from './services/pwa';
import { UserTicketsView } from './components/Tickets/UserTicketsView';

// Initialize Unified Local Error Logger & Web Vitals Monitoring at application startup
initClientLogger();
initPerformanceMonitoring({ intervalMs: 30000 });

// Register PWA Service Worker
registerServiceWorker();

import { AdminTicketsView } from './components/Tickets/AdminTicketsView';
import { AuditLogsView } from './components/Admin/AuditLogsView';
import PushNotificationAdminView from './components/Admin/PushNotificationAdminView';
import { ErrorLogsAdminView } from './components/Admin/ErrorLogsAdminView';
import { GatewayAndSmsAdminView } from './components/Admin/GatewayAndSmsAdminView';
import OfflineBanner from './components/PWA/OfflineBanner';
import PwaInstallPrompt from './components/PWA/PwaInstallPrompt';
import { Welcome } from './components/Landing/Welcome';
import { PricingConfigurator } from './components/PricingConfigurator/PricingConfigurator';
import { SubscriptionDetailsModal } from './components/Subscription/SubscriptionDetailsModal';
import { ERPWorkspaceView } from './components/Subscription/ERPWorkspaceView';
import { UserPaymentsView } from './components/Payments/UserPaymentsView';
import { ERPAdminPricingManagement } from './components/Admin/ERPAdminPricingManagement';
import { AdminUsersManagement } from './components/Admin/AdminUsersManagement';
import { ThemeToggle } from './components/Common/ThemeToggle';
import { SalesPerformanceChart } from './components/Dashboard/SalesPerformanceChart';
import './styles/app.css';

const money = n => Number(n || 0).toLocaleString('fa-IR') + ' تومان';
const date = d => d ? new Date(d).toLocaleDateString('fa-IR') : '—';

function Logo() {
  return (
    <div className="logo-mark">
      <img src="/karovita-logo.svg" alt="کارویتا" />
    </div>
  );
}

function Steps({ active }) {
  return (
    <div className="steps">
      {['ورود', 'اطلاعات کاربری', 'مشخصات شرکت', 'انتخاب پکیج'].map((x, i) => (
        <div className={i <= active ? 'done' : ''} key={x}>
          <i>{i + 1}</i>
          <span>{x}</span>
        </div>
      ))}
    </div>
  );
}

function toEnDigits(str) {
  return String(str || '')
    .replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584));
}

function Auth() {
  const nav = useNavigate();
  const [stage, setStage] = useState('mobile');
  const [mobile, setMobile] = useState(() => localStorage.getItem('draft_mobile') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const codeInputRef = useRef(null);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (stage === 'code' && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [stage]);

  async function send() {
    const cleanMobile = toEnDigits(mobile).trim();
    if (!cleanMobile) {
      return setError('لطفاً شماره موبایل خود را وارد کنید.');
    }
    if (cleanMobile.length < 10) {
      return setError('شماره موبایل باید حداقل ۱۰ یا ۱۱ رقم باشد.');
    }
    try {
      setLoading(true);
      setError('');
      setHint('');
      setDebugCode('');
      const res = await api('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ mobile: cleanMobile }),
      });
      localStorage.setItem('draft_mobile', cleanMobile);
      if (res.message) {
        setHint(res.message);
      }
      setCountdown(res.resend_after || 60);
      setCode('');
      setStage('code');
    } catch (e) {
      setError(e.message || 'خطا در ارسال کد تأیید');
    } finally {
      setLoading(false);
    }
  }

  async function verify(codeArg) {
    const targetCode = typeof codeArg === 'string' ? codeArg : code;
    const cleanCode = toEnDigits(targetCode).trim().replace(/\D/g, '');
    const cleanMobile = toEnDigits(mobile).trim();
    if (!cleanCode || cleanCode.length !== 5) {
      return setError('لطفاً کد ۵ رقمی تأیید را وارد کنید.');
    }
    try {
      setLoading(true);
      setError('');
      const r = await api('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ mobile: cleanMobile, code: cleanCode }),
      });
      localStorage.setItem('token', r.access_token);
      localStorage.setItem('draft_mobile', cleanMobile);
      if (r.user.role === 'admin') return nav('/admin');

      // If existing user already has a package / subscription, go directly to dashboard
      if (r.user.has_subscription) {
        localStorage.removeItem('intent');
        return nav('/dashboard');
      }

      if (Number(r.user.onboarding_step) < 2) return nav('/onboarding/user');
      if (Number(r.user.onboarding_step) < 3) return nav('/onboarding/company');

      const intent = localStorage.getItem('intent');
      if (intent === 'login') {
        localStorage.removeItem('intent');
        return nav('/dashboard');
      }
      if (intent === 'trial' || intent === 'buy') {
        return nav('/plans');
      }
      nav('/dashboard');
    } catch (e) {
      setError(e.message || 'کد وارد شده صحیح نیست یا منقضی شده است.');
      // Keep input focused so user can correct or re-enter
      if (codeInputRef.current) {
        codeInputRef.current.focus();
        codeInputRef.current.select();
      }
    } finally {
      setLoading(false);
    }
  }

  const handleCodeChange = (e) => {
    const rawVal = e.target.value;
    const converted = toEnDigits(rawVal).replace(/\D/g, '').slice(0, 5);
    setCode(converted);
    if (error) setError('');
    
    // Auto-verify when 5 digits are entered!
    if (converted.length === 5 && !loading) {
      verify(converted);
    }
  };

  return (
    <Onboard active={0}>
      <h1>{stage === 'mobile' ? 'ورود یا ثبت‌نام' : 'تأیید شماره همراه'}</h1>
      <p>
        {stage === 'mobile' 
          ? 'برای ادامه شماره موبایل خود را وارد کنید.' 
          : `کد تأیید ۵ رقمی پیامک‌شده به شماره ${mobile} را وارد کنید.`}
      </p>
      
      <div className="single-form">
        {stage === 'mobile' ? (
          <label>
            شماره موبایل
            <input
              dir="ltr"
              value={mobile}
              maxLength={11}
              disabled={loading}
              autoFocus
              onChange={e => {
                const converted = toEnDigits(e.target.value);
                setMobile(converted);
                localStorage.setItem('draft_mobile', converted);
                if (error) setError('');
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="09123456789"
            />
          </label>
        ) : (
          <label>
            کد تأیید پیامکی (۵ رقم)
            <div style={{ position: 'relative' }}>
              <input
                ref={codeInputRef}
                dir="ltr"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                maxLength={5}
                disabled={loading}
                className="otp-input"
                style={{
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: '800',
                  borderColor: error ? '#ef4444' : loading ? '#3b82f6' : undefined,
                  background: error ? '#fff5f5' : undefined,
                }}
                onChange={handleCodeChange}
                placeholder="• • • • •"
              />
              {loading && (
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#2563eb'
                }}>
                  <RotateCw size={18} className="spin-animate" />
                </div>
              )}
            </div>
          </label>
        )}

        {/* Info hint */}
        {hint && (
          <div 
            className="alert" 
            style={{ 
              background: '#f0fdf4', 
              color: '#166534', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              border: '1px solid #bbf7d0'
            }}
          >
            <span>{hint}</span>
          </div>
        )}

        {error && (
          <div className="alert error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {stage === 'code' && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            fontSize: '13px', 
            color: '#64748b',
            margin: '4px 0'
          }}>
            <span>زمان باقی‌مانده:</span>
            {countdown > 0 ? (
              <span style={{ direction: 'ltr', fontWeight: 700, color: '#0870d1' }}>{countdown} ثانیه</span>
            ) : (
              <button 
                type="button" 
                className="resend-btn"
                onClick={send}
                disabled={loading}
              >
                ارسال مجدد کد
              </button>
            )}
          </div>
        )}

        <button 
          type="button" 
          className="btn-primary" 
          disabled={loading || (stage === 'code' && code.length !== 5)} 
          onClick={stage === 'mobile' ? send : () => verify()}
        >
          {loading ? (
            <>
              <RotateCw size={18} className="spin-animate" />
              <span>{stage === 'mobile' ? 'در حال ارسال کد…' : 'در حال بررسی خودکار کد…'}</span>
            </>
          ) : stage === 'mobile' ? (
            <>
              <span>دریافت کد ورود</span>
              <ArrowLeft size={18} />
            </>
          ) : (
            <>
              <span>تأیید و ورود</span>
              <ArrowLeft size={18} />
            </>
          )}
        </button>

        {stage === 'code' && (
          <button 
            type="button" 
            className="text btn-text" 
            disabled={loading} 
            onClick={() => {
              setStage('mobile');
              setError('');
            }}
          >
            ویرایش شماره موبایل
          </button>
        )}
      </div>
    </Onboard>
  );
}

function Onboard({ active, children }) {
  return (
    <main className="onboard">
      <header>
        <Logo />
      </header>
      <Steps active={active} />
      <section className="form-card">{children}</section>
    </main>
  );
}

function UserInfo() {
  const nav = useNavigate();
  const [f, setF] = useState(() => {
    try {
      const saved = localStorage.getItem('draft_onboard_user');
      return saved ? JSON.parse(saved) : { first_name: '', last_name: '', email: '' };
    } catch {
      return { first_name: '', last_name: '', email: '' };
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/onboarding')
      .then(r => {
        if (r && r.user) {
          setF(prev => {
            const next = {
              first_name: prev.first_name || r.user.first_name || '',
              last_name: prev.last_name || r.user.last_name || '',
              email: prev.email || r.user.email || '',
            };
            localStorage.setItem('draft_onboard_user', JSON.stringify(next));
            return next;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (key, val) => {
    const next = { ...f, [key]: val };
    setF(next);
    localStorage.setItem('draft_onboard_user', JSON.stringify(next));
  };

  async function submit() {
    if (!f.first_name?.trim() || !f.last_name?.trim()) {
      return setError('لطفاً نام و نام خانوادگی را وارد کنید.');
    }
    try {
      setLoading(true);
      setError('');
      await api('/onboarding/user', {
        method: 'POST',
        body: JSON.stringify(f),
      });
      localStorage.setItem('draft_onboard_user', JSON.stringify(f));
      nav('/onboarding/company');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    localStorage.setItem('draft_onboard_user', JSON.stringify(f));
    nav('/auth');
  }

  return (
    <Onboard active={1}>
      <h1>اطلاعات کاربری</h1>
      <p>اطلاعات پایه حساب خود را وارد کنید.</p>
      <div className="form-grid">
        <Field label="نام" value={f.first_name} set={v => handleChange('first_name', v)} />
        <Field label="نام خانوادگی" value={f.last_name} set={v => handleChange('last_name', v)} />
        <Field wide label="ایمیل (اختیاری)" type="email" value={f.email} set={v => handleChange('email', v)} />
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={goBack} disabled={loading}>
          <ArrowRight size={18} />
          <span>قبلی</span>
        </button>
        <button type="button" className="btn-primary" onClick={submit} disabled={loading}>
          <span>{loading ? 'در حال ذخیره…' : 'ادامه'}</span>
          <ArrowLeft size={18} />
        </button>
      </div>
    </Onboard>
  );
}

function Company() {
  const nav = useNavigate();
  const [f, setF] = useState(() => {
    try {
      const saved = localStorage.getItem('draft_onboard_company');
      return saved ? JSON.parse(saved) : { name: '', industry: '', employee_count: '', job_title: '' };
    } catch {
      return { name: '', industry: '', employee_count: '', job_title: '' };
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/onboarding')
      .then(r => {
        if (r && (r.company || r.user)) {
          setF(prev => {
            const next = {
              name: prev.name || r.company?.name || '',
              industry: prev.industry || r.company?.industry || '',
              employee_count: prev.employee_count || r.company?.employee_count || '',
              job_title: prev.job_title || r.user?.job_title || '',
            };
            localStorage.setItem('draft_onboard_company', JSON.stringify(next));
            return next;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (key, val) => {
    const next = { ...f, [key]: val };
    setF(next);
    localStorage.setItem('draft_onboard_company', JSON.stringify(next));
  };

  async function submit() {
    if (!f.name?.trim() || !f.industry || !f.employee_count || !f.job_title) {
      return setError('لطفاً مشخصات شرکت و سمت خود را به طور کامل وارد کنید.');
    }
    try {
      setLoading(true);
      setError('');
      await api('/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(f),
      });
      localStorage.setItem('draft_onboard_company', JSON.stringify(f));
      nav('/plans');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    localStorage.setItem('draft_onboard_company', JSON.stringify(f));
    nav('/onboarding/user');
  }

  return (
    <Onboard active={2}>
      <h1>مشخصات شرکت</h1>
      <p>برای پیشنهاد بهترین پکیج، کسب‌وکار خود را معرفی کنید.</p>
      <div className="form-grid">
        <Field label="نام شرکت" value={f.name} set={v => handleChange('name', v)} />
        <Field label="تعداد کارکنان" type="number" value={f.employee_count} set={v => handleChange('employee_count', v)} />
        <label>
          حوزه فعالیت
          <select value={f.industry} onChange={e => handleChange('industry', e.target.value)}>
            <option value="">انتخاب کنید</option>
            <option>فروش و بازرگانی</option>
            <option>خدمات حرفه‌ای</option>
            <option>فناوری اطلاعات</option>
            <option>ساخت‌وساز</option>
            <option>سلامت و درمان</option>
          </select>
        </label>
        <label>
          سمت شما
          <select value={f.job_title} onChange={e => handleChange('job_title', e.target.value)}>
            <option value="">انتخاب کنید</option>
            {JOB_TITLE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={goBack} disabled={loading}>
          <ArrowRight size={18} />
          <span>قبلی</span>
        </button>
        <button type="button" className="btn-primary" onClick={submit} disabled={loading}>
          <span>{loading ? 'در حال ذخیره…' : 'ادامه'}</span>
          <ArrowLeft size={18} />
        </button>
      </div>
    </Onboard>
  );
}

function Field({ label, value, set, type = 'text', wide, disabled = false, placeholder = '' }) {
  return (
    <label className={wide ? 'wide' : ''}>
      {label}
      <input 
        type={type} 
        value={value ?? ''} 
        disabled={disabled}
        placeholder={placeholder}
        onChange={e => set && set(e.target.value)} 
      />
    </label>
  );
}

const JOB_TITLE_OPTIONS = [
  'مدیرعامل',
  'مدیر فروش',
  'مدیر بازاریابی',
  'مدیر مالی',
  'مدیر فنی / IT',
  'مدیر منابع انسانی',
  'کارشناس فروش',
  'کارشناس پشتیبانی',
  'کارشناس مالی',
  'کارشناس بازاریابی',
  'مشاور',
  'سایر'
];

function ProfileSettings({ user, onUpdateUser }) {
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    job_title: user?.job_title || '',
  });
  const [backup, setBackup] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Modal & OTP states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpDebug, setOtpDebug] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        job_title: user.job_title || '',
      });
    }
  }, [user]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  async function requestOtp() {
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await api('/profile/otp/request', { method: 'POST' });
      if (res.debug_code) setOtpDebug(res.debug_code);
      setCountdown(res.resend_after || 60);
      setIsModalOpen(true);
      setOtpCode('');
    } catch (e) {
      setError(e.message);
    } finally {
      setOtpLoading(false);
    }
  }

  function handleStartEdit() {
    setMsg('');
    setError('');
    requestOtp();
  }

  async function handleVerifyOtp(e, overrideCode) {
    if (e) e.preventDefault();
    const targetCode = typeof overrideCode === 'string' ? overrideCode : otpCode;
    const cleanCode = toEnDigits(targetCode).trim().replace(/\D/g, '');
    if (!cleanCode || cleanCode.length < 5) {
      setOtpError('لطفاً کد ۵ رقمی را کامل وارد نمایید.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      await api('/profile/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ code: cleanCode }),
      });
      // Verification success
      setBackup({ ...profile });
      setIsModalOpen(false);
      setIsEditing(true);
      setOtpCode('');
      setOtpDebug('');
      setMsg('احراز هویت موفقیت‌آمیز بود. اکنون می‌توانید اطلاعات حساب را ویرایش و ذخیره کنید.');
    } catch (e) {
      setOtpError(e.message || 'کد وارد شده صحیح نیست یا منقضی شده است.');
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!profile.first_name?.trim() || !profile.last_name?.trim()) {
      setError('نام و نام خانوادگی الزامی است.');
      return;
    }
    setSaving(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          job_title: profile.job_title,
        }),
      });
      setMsg(res.message || 'اطلاعات حساب با موفقیت ذخیره شد.');
      setIsEditing(false);
      setBackup(null);
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          ...profile,
        });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    if (backup) {
      setProfile({ ...backup });
    }
    setIsEditing(false);
    setBackup(null);
    setMsg('');
    setError('');
  }

  return (
    <Panel title="تنظیمات حساب کاربری">
      {msg && <div className="alert success">{msg}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="form-grid profile" style={{ marginTop: '16px' }}>
        <Field 
          label="نام" 
          value={profile.first_name} 
          disabled={!isEditing}
          set={v => setProfile({ ...profile, first_name: v })} 
        />
        <Field 
          label="نام خانوادگی" 
          value={profile.last_name} 
          disabled={!isEditing}
          set={v => setProfile({ ...profile, last_name: v })} 
        />
        <Field 
          label="شماره تلفن همراه (شناسه حساب)" 
          value={profile.mobile} 
          disabled={true}
          placeholder="09xxxxxxxxx"
        />
        <Field 
          label="ایمیل" 
          type="email"
          value={profile.email} 
          disabled={!isEditing}
          placeholder="example@domain.com"
          set={v => setProfile({ ...profile, email: v })} 
        />

        <label>
          سمت سازمانی
          <select 
            value={profile.job_title || ''} 
            disabled={!isEditing}
            onChange={e => setProfile({ ...profile, job_title: e.target.value })}
          >
            <option value="">انتخاب سمت...</option>
            {JOB_TITLE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            {profile.job_title && !JOB_TITLE_OPTIONS.includes(profile.job_title) && (
              <option value={profile.job_title}>{profile.job_title}</option>
            )}
          </select>
        </label>

        <div className="wide" style={{ marginTop: '10px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isEditing ? (
            <button type="button" className="btn-primary" onClick={handleStartEdit} disabled={otpLoading}>
              <Edit3 size={18} />
              <span>{otpLoading ? 'در حال ارسال کد…' : 'ویرایش اطلاعات'}</span>
            </button>
          ) : (
            <>
              <button type="button" className="btn-primary" onClick={handleSaveProfile} disabled={saving}>
                <Save size={18} />
                <span>{saving ? 'در حال ذخیره‌سازی…' : 'ذخیره اطلاعات'}</span>
              </button>
              <button type="button" className="btn-secondary outline" onClick={handleCancelEdit} disabled={saving}>
                <span>انصراف</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* OTP Authentication Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => !otpLoading && setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>تأیید ویرایش اطلاعات</h3>
              <button 
                type="button"
                className="modal-close" 
                onClick={() => !otpLoading && setIsModalOpen(false)}
                title="بستن"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                جهت حفظ امنیت حساب کاربری و تأیید هویت شما، کد تأیید ۵ رقمی به شماره همراه <strong>{profile.mobile}</strong> ارسال گردید. لطفاً کد را در کادر زیر وارد نمایید.
              </p>

              {/* Error Alert */}

              {otpError && (
                <div className="alert error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={17} style={{ flexShrink: 0 }} />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={5}
                    autoFocus
                    placeholder="• • • • •"
                    className="otp-input"
                    value={otpCode}
                    disabled={otpLoading}
                    style={{
                      letterSpacing: '8px',
                      textAlign: 'center',
                      fontSize: '24px',
                      fontWeight: '800',
                      borderColor: otpError ? '#ef4444' : otpLoading ? '#3b82f6' : undefined,
                      background: otpError ? '#fff5f5' : undefined,
                    }}
                    onChange={e => {
                      const val = toEnDigits(e.target.value).replace(/[^\d]/g, '').slice(0, 5);
                      setOtpCode(val);
                      if (otpError) setOtpError('');
                      if (val.length === 5 && !otpLoading) {
                        handleVerifyOtp(null, val);
                      }
                    }}
                  />
                  {otpLoading && (
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#2563eb'
                    }}>
                      <RotateCw size={18} className="spin-animate" />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
                  <span>زمان باقی‌مانده:</span>
                  {countdown > 0 ? (
                    <span style={{ direction: 'ltr', fontWeight: 700, color: '#0870d1' }}>{countdown} ثانیه</span>
                  ) : (
                    <button 
                      type="button" 
                      className="resend-btn"
                      onClick={requestOtp}
                      disabled={otpLoading}
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                </div>

                <div className="modal-foot">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={otpLoading || otpCode.length !== 5}
                  >
                    {otpLoading ? (
                      <>
                        <RotateCw size={16} className="spin-animate" />
                        <span>در حال بررسی خودکار…</span>
                      </>
                    ) : (
                      <span>تأیید و فعال‌سازی ویرایش</span>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary outline" 
                    disabled={otpLoading}
                    onClick={() => setIsModalOpen(false)}
                  >
                    <span>انصراف</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

function Plans() {
  const nav = useNavigate();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [user, setUser] = useState(null);
  const [hasActiveSub, setHasActiveSub] = useState(false);

  useEffect(() => {
    api('/onboarding')
      .then(r => {
        if (r && r.user) {
          setUser(r.user);
          if (r.user.onboarding_step >= 3 || r.user.onboarding_completed_at) {
            setHasCompletedOnboarding(true);
          }
          if (r.user.has_subscription) {
            setHasActiveSub(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="plans-configurator-page" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {!hasCompletedOnboarding && (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '16px 20px 0' }}>
          <header style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <Logo />
          </header>
          <Steps active={3} />
        </div>
      )}
      <PricingConfigurator 
        user={user}
        isInsideDashboard={hasCompletedOnboarding}
        hasActiveSubscription={hasActiveSub}
        onBackToDashboard={() => nav('/dashboard')}
      />
    </div>
  );
}

const userNav = [
  ['overview', 'داشبورد', LayoutDashboard],
  ['packages', 'پکیج‌های من', Package],
  ['payments', 'پرداخت‌ها', Receipt],
  ['support', 'پشتیبانی', Headphones],
  ['profile', 'تنظیمات حساب', Settings],
];

function Shell({ admin = false, tab, setTab, children, name }) {
  const [open, setOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  const fetchBadge = () => {
    api('/tickets/badge')
      .then(res => setBadgeCount(res.count || 0))
      .catch(() => {});

    if (!admin) {
      api('/payments/pending-count')
        .then(res => setPendingPaymentsCount(res.count || 0))
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchBadge();
    const timer = setInterval(fetchBadge, 8000);
    window.addEventListener('ticket-updated', fetchBadge);
    window.addEventListener('payment-completed', fetchBadge);
    window.addEventListener('order-updated', fetchBadge);
    return () => {
      clearInterval(timer);
      window.removeEventListener('ticket-updated', fetchBadge);
      window.removeEventListener('payment-completed', fetchBadge);
      window.removeEventListener('order-updated', fetchBadge);
    };
  }, [tab, admin]);

  const nav = admin ? [
    ['overview', 'نمای کلی', LayoutDashboard],
    ['users', 'کاربران و شرکت‌ها', Users],
    ['packages', 'سیستم قیمت‌گذاری و تب‌ها', Package],
    ['orders', 'خرید و تراکنش‌ها', CreditCard],
    ['subscriptions', 'اشتراک‌ها و آزمایشی', Clock3],
    ['tickets', 'تیکت‌های پشتیبانی', Headphones],
    ['gateways', 'درگاه شاپرک و SMS.ir', MessageSquare],
    ['audit', 'لاگ‌های امنیتی (Audit)', ShieldCheck],
    ['push', 'مدیریت PWA و اعلان‌ها', BellRing],
    ['errors', 'لاگ‌های خطای محلی (Errors)', Bug],
  ] : userNav;

  return (
    <div className="app-shell">
      <aside className={open ? 'open' : ''}>
        <div className="aside-head">
          <Logo />
          <button onClick={() => setOpen(false)}><X /></button>
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => {
            const hasTicketBadge = (id === 'support' || id === 'tickets') && badgeCount > 0;
            const hasPaymentBadge = id === 'payments' && pendingPaymentsCount > 0;
            return (
              <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setOpen(false); }}>
                <Icon />
                <span style={{ flex: 1, textAlign: 'right' }}>{label}</span>
                {hasTicketBadge && (
                  <span className="nav-badge" title={`${Number(badgeCount).toLocaleString('fa-IR')} تیکت باز یا پاسخ‌داده‌نشده`}>
                    {Number(badgeCount).toLocaleString('fa-IR')}
                  </span>
                )}
                {hasPaymentBadge && (
                  <span 
                    className="nav-badge" 
                    style={{ background: '#f59e0b', color: '#ffffff', animation: 'pulse 2s infinite' }}
                    title={`${Number(pendingPaymentsCount).toLocaleString('fa-IR')} پیش‌فاکتور در انتظار پرداخت`}
                  >
                    {Number(pendingPaymentsCount).toLocaleString('fa-IR')}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <button className="logout" onClick={() => { localStorage.clear(); location.href = '/'; }}>
          <LogOut />
          خروج
        </button>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <button className="menu" onClick={() => setOpen(true)}><Menu /></button>
          <div>
            <b>{admin ? 'پنل مدیریت' : 'پنل کاربری'}</b>
            <span>{name || 'کارویتا'}</span>
          </div>
          <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function Dashboard() {
  const nav = useNavigate();
  const [d, setD] = useState(null);
  const [tab, setTab] = useState('overview');
  const [selectedSubForDetails, setSelectedSubForDetails] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const [paymentAlert, setPaymentAlert] = useState(null);

  const refreshData = () => {
    api('/dashboard')
      .then(r => {
        if (r.user.role === 'admin') return location.href = '/admin';
        setD(r);
      })
      .catch(() => {});

    api('/payments/pending-count')
      .then(r => setPendingCount(r.count || 0))
      .catch(() => {});
  };

  useEffect(() => {
    // Check if returning from bank gateway with payment success query params
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus = searchParams.get('payment');
    const trackId = searchParams.get('trackId') || searchParams.get('ref') || searchParams.get('reference_id');

    if (paymentStatus === 'success') {
      setPaymentAlert({
        type: 'success',
        message: `پرداخت با موفقیت انجام شد و فاکتور تسویه گردید.${trackId ? ` (کد پیگیری شاپرک: ${trackId})` : ''}`,
      });
      // Clean up URL search params without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed') {
      setPaymentAlert({
        type: 'error',
        message: 'تراکنش پرداخت ناموفق بود یا توسط کاربر لغو گردید.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    refreshData();

    window.addEventListener('payment-completed', refreshData);
    window.addEventListener('order-updated', refreshData);
    return () => {
      window.removeEventListener('payment-completed', refreshData);
      window.removeEventListener('order-updated', refreshData);
    };
  }, []);

  if (!d) return <Loader />;

  const subsList = Array.isArray(d.subscriptions) ? d.subscriptions : [];
  const transList = Array.isArray(d.transactions) ? d.transactions : [];
  const currentUser = d.user || {};
  const active = subsList.filter(x => x && x.status === 'active' && (!x.expires_at || new Date(x.expires_at) > new Date()));

  return (
    <Shell tab={tab} setTab={setTab} name={currentUser.first_name || 'کاربر'}>
      {tab !== 'support' && (
        <div className="page-head">
          <div>
            <h1>سلام {currentUser.first_name || 'کاربر عزیز'} 👋</h1>
            <p>وضعیت حساب و سرویس‌های خود را از اینجا مدیریت کنید.</p>
          </div>
          <button className="btn-primary" onClick={() => nav('/plans')}>
            <Plus size={16} />
            <span>خرید پکیج جدید</span>
          </button>
        </div>
      )}

      {/* Payment Gateway Callback Feedback Banner */}
      {paymentAlert && (
        <div style={{
          background: paymentAlert.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: paymentAlert.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
          color: paymentAlert.type === 'error' ? '#991b1b' : '#166534',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {paymentAlert.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span style={{ fontSize: '13.5px', fontWeight: 700 }}>{paymentAlert.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setPaymentAlert(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Pending invoice alert banner in overview */}
      {tab === 'overview' && pendingCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#f59e0b', color: '#ffffff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={16} />
            </div>
            <div>
              <strong style={{ fontSize: '13.5px', color: '#92400e' }}>
                شما {Number(pendingCount).toLocaleString('fa-IR')} فاکتور در انتظار پرداخت دارید!
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b45309' }}>
                برای فعال‌سازی کامل ماژول‌های افزوده شده، لطفاً نسبت به تسویه فاکتور خود اقدام فرمایید.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTab('payments')}
            style={{
              background: '#b45309',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CreditCard size={14} />
            <span>مشاهده و پرداخت فاکتور</span>
          </button>
        </div>
      )}

      {tab === 'overview' && (
        <>
          <div className="stats">
            <Stat icon={Package} n={active.length} label="اشتراک فعال" />
            <Stat icon={Receipt} n={transList.length} label="کل پرداخت‌ها" />
            <Stat icon={Building2} n={currentUser.company_name || d?.company?.name || '—'} label="شرکت" />
          </div>
          <Panel title="آخرین اشتراک‌ها">
            <Subscriptions 
              data={subsList} 
              onOpenDetails={s => setSelectedSubForDetails(s)}
            />
          </Panel>
        </>
      )}
      {tab === 'packages' && (
        <Panel title="پکیج‌های من">
          <Subscriptions 
            data={subsList} 
            onOpenDetails={s => setSelectedSubForDetails(s)}
          />
        </Panel>
      )}
      {tab === 'payments' && (
        <UserPaymentsView />
      )}
      {tab === 'support' && (
        <UserTicketsView />
      )}
      {tab === 'profile' && (
        <ProfileSettings 
          user={currentUser} 
          onUpdateUser={u => setD({ ...d, user: u })} 
        />
      )}

      {selectedSubForDetails && (
        <SubscriptionDetailsModal 
          subscription={selectedSubForDetails}
          user={d.user}
          onClose={() => setSelectedSubForDetails(null)}
        />
      )}
    </Shell>
  );
}

function getRemainingDaysText(expiresAt) {
  if (!expiresAt) return '—';
  const diff = new Date(expiresAt).getTime() - new Date().getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'منقضی شده';
  if (days === 0) return 'امروز منقضی می‌شود';
  return `${days} روز تا انقضا`;
}

function Subscriptions({ data, onOpenDetails }) {
  const list = Array.isArray(data) ? data : [];
  return (
    <div className="cards">
      {list.length ? list.map(x => {
        const isExpired = new Date(x.expires_at) < new Date();
        const modulesList = Array.isArray(x.module_names) && x.module_names.length > 0 
          ? x.module_names 
          : Array.isArray(x.modules) ? x.modules : [];
        const userCount = x.user_count || x.user_limit || 5;

        return (
          <article className="sub" key={x.id}>
            <div className="sub-head">
              <span className={'pill ' + (isExpired ? 'expired' : x.source === 'trial' ? 'trial' : x.status)}>
                {x.source === 'trial' ? '⭐️ ۵ روز آزمایشی' : isExpired ? '⚠️ منقضی شده' : x.status === 'active' ? '✓ فعال' : 'غیرفعال'}
              </span>
              <span className="sub-date">
                <Clock3 size={14} />
                {getRemainingDaysText(x.expires_at)}
              </span>
            </div>
            
            <h3>{x.package_name || 'سرویس ERP سازمانی کارویتا'}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '8px 0', fontSize: '13px' }}>
              <p style={{ margin: 0 }}><strong>تاریخ انقضا:</strong> {date(x.expires_at)}</p>
              <p style={{ margin: 0 }}><small style={{ color: '#64748b' }}>تاریخ فعال‌سازی: {date(x.starts_at)}</small></p>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={14} color="#2563eb" />
                <span>ظرفیت کاربران: <strong>{Number(userCount).toLocaleString('fa-IR')} کاربر همزمان</strong></span>
              </p>
            </div>

            {modulesList.length > 0 && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #edf2f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700 }}>ماژول‌های فعال ({modulesList.length}):</span>
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <span className="erp-pulse-dot" style={{ width: 6, height: 6 }} />
                    آنلاین
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {modulesList.slice(0, 5).map((m, i) => (
                    <span key={i} style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '5px', fontWeight: 600 }}>
                      {typeof m === 'object' ? (m.name || m.title || m.id) : m}
                    </span>
                  ))}
                  {modulesList.length > 5 && (
                    <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 7px', borderRadius: '5px', fontWeight: 600 }}>
                      +{modulesList.length - 5} ماژول دیگر
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Two Distinct Action Buttons */}
            <div className="sub-actions-row">
              <button 
                type="button" 
                className="btn-sub-enter-portal"
                onClick={() => window.open('https://crm.karovita.ir', '_blank', 'noopener,noreferrer')}
              >
                <LogIn size={15} />
                <span>ورود به پنل شخصی ERP</span>
              </button>
              
              <button 
                type="button" 
                className="btn-sub-view-details"
                onClick={() => onOpenDetails ? onOpenDetails(x) : null}
              >
                <FileText size={15} />
                <span>جزئیات پکیج</span>
              </button>
            </div>
          </article>
        );
      }) : <Empty />}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("UI Error caught by boundary:", error, errorInfo);
    logError(error, { componentStack: errorInfo?.componentStack });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          direction: 'rtl',
          fontFamily: 'Vazirmatn, sans-serif',
          background: '#f8fafc',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            padding: '36px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
            maxWidth: '500px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ color: '#ef4444', marginBottom: '16px' }}>
              <AlertCircle size={48} style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              خطایی غیرمنتظره در سامانه رخ داد
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.7', marginBottom: '24px' }}>
              این رخداد به‌صورت خودکار در سامانه ثبت لاگ محلی کارویتا ثبت گردید و تیم فنی در حال بررسی آن است.
            </p>
            <button 
              style={{
                background: '#0870d1',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Admin() {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(currentTab = tab) {
    if (currentTab === 'tickets' || currentTab === 'audit' || currentTab === 'push' || currentTab === 'errors') {
      setLoading(false);
      setData({});
      return;
    }
    setLoading(true);
    setError('');
    try {
      const path = currentTab === 'overview' ? '/admin/overview' : '/admin/' + currentTab;
      const res = await api(path);
      setData(res);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab);
  }, [tab]);

  return (
    <Shell admin tab={tab} setTab={setTab} name="مدیر سیستم">
      {tab !== 'tickets' && tab !== 'audit' && tab !== 'push' && tab !== 'errors' && (
        <div className="page-head">
          <div>
            <h1>{adminTitle(tab)}</h1>
            <p>
              {tab === 'packages' 
                ? 'مدیریت تب‌های پیش‌فرض، قیمت ماژول‌ها و تنظیمات محاسباتی سیستم قیمت‌گذاری' 
                : 'مدیریت یکپارچه کاربران، فروش و سرویس‌ها'}
            </p>
          </div>
        </div>
      )}
      {error && <div className="alert error">{error}</div>}
      {tab === 'tickets' ? (
        <AdminTicketsView />
      ) : tab === 'gateways' ? (
        <GatewayAndSmsAdminView />
      ) : tab === 'audit' ? (
        <AuditLogsView />
      ) : tab === 'push' ? (
        <PushNotificationAdminView token={localStorage.getItem('token')} />
      ) : tab === 'errors' ? (
        <ErrorLogsAdminView />
      ) : loading ? (
        <Loader />
      ) : !data ? (
        <Empty />
      ) : tab === 'overview' ? (
        <>
          <div className="stats admin-stats">
            <Stat icon={Users} n={data.stats?.users || 0} label="کاربران" />
            <Stat icon={Building2} n={data.stats?.companies || 0} label="شرکت‌ها" />
            <Stat icon={CreditCard} n={money(data.stats?.revenue || 0)} label="درآمد کل" />
            <Stat icon={Package} n={data.stats?.active_subscriptions || 0} label="اشتراک فعال" />
            <Stat icon={Clock3} n={data.stats?.trials || 0} label="دوره آزمایشی" />
          </div>
          <SalesPerformanceChart transactions={data.transactions || []} title="روند عملکرد فروش و درآمد ماهانه سامانه" />
        </>
      ) : (
        <AdminContent tab={tab} data={data.data || []} reload={() => load(tab)} />
      )}
    </Shell>
  );
}

function AdminContent({ tab, data, reload }) {
  const list = Array.isArray(data) ? data : [];

  if (tab === 'users') {
    return <AdminUsersManagement data={data} reload={reload} />;
  }
  if (tab === 'packages') {
    return <ERPAdminPricingManagement />;
  }
  if (tab === 'orders') {
    if (!list.length) return <Panel><Empty /></Panel>;
    return (
      <Panel>
        <Table 
          headers={['شماره سفارش', 'کاربر', 'پکیج', 'مبلغ', 'وضعیت', 'اسناد رسمی مالیاتی و قرارداد']}
          rows={list.map(x => [
            x.order_number || '—',
            x.user_name || x.mobile || '—',
            x.package_name || '—',
            money(x.amount),
            status(x.transaction_status || x.status),
            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => window.open(`/api/invoices/${x.id}`, '_blank')}
                style={{
                  background: '#0870d1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="مشاهده، چاپ و دریافت PDF فاکتور رسمی استاندارد دارایی"
              >
                فاکتور دارایی (PDF)
              </button>
              <button
                type="button"
                onClick={() => window.open(`/api/invoices/${x.id}/contract`, '_blank')}
                style={{
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="مشاهده و دریافت قرارداد رسمی لایسنس و SLA"
              >
                قرارداد (PDF)
              </button>
            </div>
          ])} 
        />
      </Panel>
    );
  }
  if (tab === 'subscriptions') {
    if (!list.length) return <Panel><Empty /></Panel>;
    return (
      <Panel>
        <Table 
          headers={['کاربر', 'پکیج', 'نوع', 'تاریخ انقضا', 'وضعیت اشتراک']}
          rows={list.map(x => [
            x.user_name || x.mobile || '—',
            x.package_name || '—',
            x.source === 'trial' ? 'آزمایشی' : 'خرید',
            `${date(x.expires_at)} (${getRemainingDaysText(x.expires_at)})`,
            <select
              key={x.id}
              value={x.status || 'active'}
              onChange={async e => {
                await api('/admin/subscriptions', {
                  method: 'PUT',
                  body: JSON.stringify({ id: x.id, status: e.target.value })
                });
                reload();
              }}
            >
              <option value="active">فعال</option>
              <option value="expired">منقضی</option>
              <option value="cancelled">لغو شده</option>
            </select>
          ])} 
        />
      </Panel>
    );
  }
  return null;
}

function editPackage(p, reload) {
  const name = prompt('نام پکیج', p?.name || '');
  if (!name) return;
  const price = prompt('قیمت به تومان', p?.price || 0);
  if (price === null) return;
  api('/admin/packages', {
    method: 'POST',
    body: JSON.stringify({
      ...p,
      name,
      price: Number(price),
      slug: p?.slug || ('package-' + Date.now()),
      description: p?.description || '',
      duration_days: p?.duration_days || 30,
      features: p?.features || ['امکانات پیش‌فرض'],
      is_active: p?.is_active ?? true
    })
  }).then(reload).catch(e => alert(e.message));
}

function Stat({ icon: Icon, n, label }) {
  return (
    <article className="stat">
      <span><Icon /></span>
      <div>
        <b>{n}</b>
        <small>{label}</small>
      </div>
    </article>
  );
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="data-table">
      {headers && (
        <div className="data-table-head">
          {headers.map((h, i) => (
            <span key={i}>{h}</span>
          ))}
        </div>
      )}
      {rows.map((r, i) => (
        <div key={i}>
          {r.map((x, j) => (
            <span key={j}>{x}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return <div className="empty">هنوز اطلاعاتی برای نمایش وجود ندارد.</div>;
}

function Loader() {
  return <div className="loader">در حال بارگذاری…</div>;
}

function status(s) {
  return (
    <span className={'pill ' + s}>
      {s === 'successful' || s === 'paid' ? 'موفق' : s === 'active' ? 'فعال' : 'در انتظار'}
    </span>
  );
}

function adminTitle(t) {
  return ({
    overview: 'نمای کلی',
    users: 'کاربران و شرکت‌ها',
    packages: 'سیستم قیمت‌گذاری، ماژول‌ها و تب‌های پیش‌فرض ERP',
    orders: 'خریدها و تراکنش‌ها',
    subscriptions: 'اشتراک‌ها و دوره‌های آزمایشی',
    tickets: 'تیکت‌های پشتیبانی',
    audit: 'لاگ‌های امنیتی و حسابرسی سامانه (Audit Logs)',
    push: 'مدیریت PWA، سرویس‌ورکر و اعلان‌های وب (Web Push)',
    errors: 'مدیریت و ردگیری لاگ‌های خطای محلی سامانه (Error Logs)',
  })[t] || '';
}

function invoice(id) {
  fetch('/api/invoices/' + id, {
    headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
  })
    .then(r => {
      if (!r.ok) throw new Error('دانلود فاکتور با خطا مواجه شد');
      return r.blob();
    })
    .then(x => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(x);
      a.download = 'invoice-' + id + '.html';
      a.click();
    })
    .catch(e => alert(e.message));
}

function Guard({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/" />;
}

function AdminGuard({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAdmin(false);
      return;
    }
    api('/dashboard')
      .then(r => {
        if (r && r.user && r.user.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          nav('/dashboard', { replace: true });
        }
      })
      .catch(() => {
        setIsAdmin(false);
        nav('/', { replace: true });
      });
  }, [nav]);

  if (isAdmin === null) return <Loader />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function WorkspaceRoute() {
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard')
      .then(res => {
        setUser(res.user);
        const subs = Array.isArray(res?.subscriptions) ? res.subscriptions : [];
        const found = subs.find(s => String(s.id) === String(id));
        if (found) {
          setSub(found);
        } else if (subs.length > 0) {
          setSub(subs[0]);
        } else {
          setError('اشتراک یافت نشد.');
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error || !sub) {
    return (
      <div style={{ padding: 40, textAlign: 'center', direction: 'rtl', fontFamily: 'Vazirmatn' }}>
        <h3>{error || 'اشتراک فعالی یافت نشد.'}</h3>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/dashboard')}>
          بازگشت به داشبورد
        </button>
      </div>
    );
  }

  return (
    <ERPWorkspaceView 
      subscription={sub} 
      user={user} 
      onBackToDashboard={() => nav('/dashboard')} 
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <PwaInstallPrompt />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding/user" element={<Guard><UserInfo /></Guard>} />
        <Route path="/onboarding/company" element={<Guard><Company /></Guard>} />
        <Route path="/plans" element={<Guard><Plans /></Guard>} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/workspace/:id" element={<Guard><WorkspaceRoute /></Guard>} />
        <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);


