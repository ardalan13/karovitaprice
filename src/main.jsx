import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Receipt, User, LogOut, Building2, Clock3, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, Menu, X, Settings, Edit3, Save, ShieldCheck, Lock, Phone, RotateCw, AlertCircle, Headphones, Plus } from 'lucide-react';
import { api } from './services/api';
import { UserTicketsView } from './components/Tickets/UserTicketsView';
import { AdminTicketsView } from './components/Tickets/AdminTicketsView';
import { Welcome } from './components/Landing/Welcome';
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

  async function send() {
    const cleanMobile = toEnDigits(mobile).trim();
    if (!cleanMobile) {
      return setError('لطفاً شماره موبایل خود را وارد کنید.');
    }
    try {
      setLoading(true);
      setError('');
      setHint('');
      const res = await api('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ mobile: cleanMobile }),
      });
      localStorage.setItem('draft_mobile', cleanMobile);
      if (res.debug_code) {
        setHint(`کد تستی جهت ورود سریع: ${res.debug_code}`);
      }
      setStage('code');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    const cleanCode = toEnDigits(code).trim();
    const cleanMobile = toEnDigits(mobile).trim();
    if (!cleanCode) {
      return setError('لطفاً کد تأیید را وارد کنید.');
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
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Onboard active={0}>
      <h1>{stage === 'mobile' ? 'ورود یا ثبت‌نام' : 'تأیید شماره همراه'}</h1>
      <p>{stage === 'mobile' ? 'برای ادامه شماره موبایل خود را وارد کنید (مثلاً 09120000000 برای ادمین یا شماره شخصی).' : `کد ارسال‌شده به ${mobile} را وارد کنید.`}</p>
      <div className="single-form">
        <label>
          {stage === 'mobile' ? 'شماره موبایل' : 'کد تأیید'}
          <input
            dir="ltr"
            value={stage === 'mobile' ? mobile : code}
            maxLength={stage === 'mobile' ? 11 : 5}
            disabled={loading}
            onChange={e => {
              const converted = toEnDigits(e.target.value);
              if (stage === 'mobile') {
                setMobile(converted);
                localStorage.setItem('draft_mobile', converted);
              } else {
                setCode(converted.replace(/\D/g, ''));
              }
            }}
            placeholder={stage === 'mobile' ? '09123456789' : '•••••'}
          />
        </label>
        {hint && <div className="alert" style={{ background: '#eef6ff', color: '#0759a8' }}>{hint}</div>}
        {error && <div className="alert error">{error}</div>}
        <button className="btn-primary" disabled={loading} onClick={stage === 'mobile' ? send : verify}>
          <span>{loading ? 'در حال ارسال…' : stage === 'mobile' ? 'دریافت کد' : 'تأیید و ادامه'}</span>
          <ArrowLeft size={18} />
        </button>
        {stage === 'code' && (
          <button className="text btn-text" disabled={loading} onClick={() => setStage('mobile')}>
            ویرایش شماره
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

  async function handleVerifyOtp(e) {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length < 5) {
      setOtpError('لطفاً کد ۵ رقمی را کامل وارد نمایید.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      await api('/profile/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ code: otpCode }),
      });
      // Verification success
      setBackup({ ...profile });
      setIsModalOpen(false);
      setIsEditing(true);
      setOtpCode('');
      setOtpDebug('');
      setMsg('احراز هویت موفقیت‌آمیز بود. اکنون می‌توانید اطلاعات حساب را ویرایش و ذخیره کنید.');
    } catch (e) {
      setOtpError(e.message || 'کد وارد شده صحیح نیست.');
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

              {otpDebug && (
                <div className="alert" style={{ background: '#eef6ff', color: '#0759a8', fontSize: '13px', marginBottom: '14px' }}>
                  کد پیامک‌شده: <strong>{otpDebug}</strong>
                </div>
              )}

              {otpError && <div className="alert error">{otpError}</div>}

              <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '12px' }}>
                <input 
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  autoFocus
                  placeholder="• • • • •"
                  className="otp-input"
                  value={otpCode}
                  onChange={e => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setOtpCode(val);
                    if (otpError) setOtpError('');
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
                  <span>زمان باقی‌مانده:</span>
                  {countdown > 0 ? (
                    <span style={{ direction: 'ltr', fontWeight: 600 }}>{countdown} ثانیه</span>
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
                    disabled={otpLoading || otpCode.length < 5}
                  >
                    <span>{otpLoading ? 'در حال بررسی…' : 'تأیید و فعال‌سازی ویرایش'}</span>
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
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    api('/onboarding')
      .then(r => {
        if (r && r.user && (r.user.onboarding_step >= 3 || r.user.onboarding_completed_at)) {
          setHasCompletedOnboarding(true);
        }
      })
      .catch(() => {});

    api('/packages')
      .then(r => {
        const pkgs = r.data || [];
        setItems(pkgs);
        const intent = localStorage.getItem('intent');
        if (intent === 'trial') {
          const trial = pkgs.find(p => p.slug === 'trial' || Number(p.price) === 0);
          if (trial) {
            setSelected(trial.id);
            return;
          }
        }
        // Default to featured or first package
        const defaultChoice = pkgs.find(p => p.is_featured) || pkgs.find(p => Number(p.price) > 0) || pkgs[0];
        if (defaultChoice) setSelected(defaultChoice.id);
      })
      .catch(e => setError(e.message));
  }, []);

  const currentPkg = items.find(p => p.id === selected);
  const isTrial = currentPkg && (currentPkg.slug === 'trial' || Number(currentPkg.price) === 0);

  async function submit() {
    if (!selected) return;
    try {
      setLoading(true);
      setError('');
      if (isTrial) {
        await api('/trial', { method: 'POST' });
        localStorage.removeItem('intent');
        nav('/dashboard?trial=active');
      } else {
        const r = await api('/orders', {
          method: 'POST',
          body: JSON.stringify({ package_id: selected }),
        });
        localStorage.removeItem('intent');
        location.href = r.payment_url;
      }
    } catch (e) {
      if (isTrial && e.message.includes('قبلاً')) {
        localStorage.removeItem('intent');
        nav('/dashboard');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Onboard active={3}>
      <div className="title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'right' }}>
          <h1>{hasCompletedOnboarding ? 'خرید و ارتقای پکیج کارویتا' : 'انتخاب پکیج نرم‌افزار کارویتا'}</h1>
          <p>{hasCompletedOnboarding ? 'پکیج مد نظر خود را برای تمدید یا ارتقای دسترسی انتخاب نمایید.' : 'پکیج مد نظر خود را انتخاب کرده یا دوره رایگان ۵ روزه را فعال نمایید.'}</p>
        </div>
        {hasCompletedOnboarding && (
          <button 
            type="button" 
            className="btn-secondary outline" 
            onClick={() => nav('/dashboard')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowRight size={18} />
            <span>بازگشت به داشبورد</span>
          </button>
        )}
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="plan-grid">
        {items.map(p => {
          const isPkgTrial = p.slug === 'trial' || Number(p.price) === 0;
          return (
            <article
              key={p.id}
              className={(selected === p.id ? 'selected ' : '') + (p.is_featured ? 'featured' : '')}
              onClick={() => setSelected(p.id)}
            >
              {p.is_featured && <em>پیشنهاد ما</em>}
              {!p.is_featured && isPkgTrial && <em className="trial-badge">۵ روز رایگان</em>}
              <h2>{p.name}</h2>
              <strong>{Number(p.price) === 0 ? 'رایگان (۰ تومان)' : money(p.price)}</strong>
              <span>برای {p.duration_days} روز</span>
              <p>{p.description}</p>
              <ul>
                {(p.features || []).map(x => (
                  <li key={x}><CheckCircle2 /> {x}</li>
                ))}
              </ul>
              <button type="button">{selected === p.id ? '✓ انتخاب شد' : 'انتخاب پکیج'}</button>
            </article>
          );
        })}
      </div>
      <div className="step-actions checkout">
        {hasCompletedOnboarding ? (
          <button 
            type="button" 
            className="btn-secondary outline" 
            disabled={loading} 
            onClick={() => nav('/dashboard')}
          >
            <ArrowRight size={18} />
            <span>بازگشت به داشبورد</span>
          </button>
        ) : (
          <button 
            type="button" 
            className="btn-secondary" 
            disabled={loading} 
            onClick={() => nav('/onboarding/company')}
          >
            <ArrowRight size={18} />
            <span>قبلی</span>
          </button>
        )}
        <button type="button" className="btn-primary" disabled={!selected || loading} onClick={submit}>
          <CheckCircle2 size={18} />
          <span>{loading ? 'در حال ثبت…' : isTrial ? 'شروع ۵ روز رایگان' : hasCompletedOnboarding ? 'تأیید و پرداخت آنلاین' : 'ثبت‌نام و پرداخت'}</span>
        </button>
      </div>
    </Onboard>
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

  const fetchBadge = () => {
    api('/tickets/badge')
      .then(res => setBadgeCount(res.count || 0))
      .catch(() => {});
  };

  useEffect(() => {
    fetchBadge();
    const timer = setInterval(fetchBadge, 8000);
    window.addEventListener('ticket-updated', fetchBadge);
    return () => {
      clearInterval(timer);
      window.removeEventListener('ticket-updated', fetchBadge);
    };
  }, [tab]);

  const nav = admin ? [
    ['overview', 'نمای کلی', LayoutDashboard],
    ['users', 'کاربران و شرکت‌ها', Users],
    ['packages', 'پکیج‌ها و قیمت‌ها', Package],
    ['orders', 'خرید و تراکنش‌ها', CreditCard],
    ['subscriptions', 'اشتراک‌ها و آزمایشی', Clock3],
    ['tickets', 'تیکت‌های پشتیبانی', Headphones],
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
            const hasBadge = (id === 'support' || id === 'tickets') && badgeCount > 0;
            return (
              <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setOpen(false); }}>
                <Icon />
                <span style={{ flex: 1, textAlign: 'right' }}>{label}</span>
                {hasBadge && (
                  <span className="nav-badge" title={`${Number(badgeCount).toLocaleString('fa-IR')} تیکت باز یا پاسخ‌داده‌نشده`}>
                    {Number(badgeCount).toLocaleString('fa-IR')}
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
          <div className="avatar">{(name || 'ا').slice(0, 1)}</div>
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

  useEffect(() => {
    api('/dashboard')
      .then(r => {
        if (r.user.role === 'admin') return location.href = '/admin';
        setD(r);
      })
      .catch(() => location.href = '/');
  }, []);

  if (!d) return <Loader />;
  const active = d.subscriptions.filter(x => x.status === 'active' && new Date(x.expires_at) > new Date());

  return (
    <Shell tab={tab} setTab={setTab} name={d.user.first_name}>
      {tab !== 'support' && (
        <div className="page-head">
          <div>
            <h1>سلام {d.user.first_name || 'کاربر عزیز'} 👋</h1>
            <p>وضعیت حساب و سرویس‌های خود را از اینجا مدیریت کنید.</p>
          </div>
          <button className="btn-primary" onClick={() => nav('/plans')}>
            <Plus size={16} />
            <span>خرید پکیج جدید</span>
          </button>
        </div>
      )}
      {tab === 'overview' && (
        <>
          <div className="stats">
            <Stat icon={Package} n={active.length} label="اشتراک فعال" />
            <Stat icon={Receipt} n={d.transactions.length} label="کل پرداخت‌ها" />
            <Stat icon={Building2} n={d.user.company_name || '—'} label="شرکت" />
          </div>
          <Panel title="آخرین اشتراک‌ها">
            <Subscriptions data={d.subscriptions} />
          </Panel>
        </>
      )}
      {tab === 'packages' && (
        <Panel title="پکیج‌های من">
          <Subscriptions data={d.subscriptions} />
        </Panel>
      )}
      {tab === 'payments' && (
        <Panel title="خریدها و فاکتورها">
          <Table 
            headers={['شماره سفارش', 'نام پکیج', 'مبلغ', 'وضعیت', 'عملیات']}
            rows={d.transactions.map(x => [
              x.order_number,
              x.package_name,
              money(x.amount),
              status(x.status),
              <button key={x.id} className="link" onClick={() => invoice(x.id)}>دانلود فاکتور</button>
            ])} 
          />
        </Panel>
      )}
      {tab === 'support' && (
        <UserTicketsView />
      )}
      {tab === 'profile' && (
        <ProfileSettings 
          user={d.user} 
          onUpdateUser={u => setD({ ...d, user: u })} 
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

function Subscriptions({ data }) {
  const list = Array.isArray(data) ? data : [];
  return (
    <div className="cards">
      {list.length ? list.map(x => {
        const isExpired = new Date(x.expires_at) < new Date();
        return (
          <article className="sub" key={x.id}>
            <div className="sub-head">
              <span className={'pill ' + (isExpired ? 'expired' : x.status)}>
                {x.source === 'trial' ? 'آزمایشی' : isExpired ? 'منقضی شده' : x.status === 'active' ? 'فعال' : 'غیرفعال'}
              </span>
              <span className="sub-date">
                <Clock3 />
                {getRemainingDaysText(x.expires_at)}
              </span>
            </div>
            <h3>{x.package_name || 'اشتراک'}</h3>
            <p><strong>تاریخ انقضا:</strong> {date(x.expires_at)}</p>
            <p><small style={{ color: '#8898aa' }}>شروع: {date(x.starts_at)}</small></p>
            <div className="progress">
              <i style={{ width: Math.min(100, Math.max(0, x.usage_percent || 0)) + '%' }} />
            </div>
            <small>{x.usage_limit ? `${x.usage_used || 0} از ${x.usage_limit}` : 'استفاده نامحدود'}</small>
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
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', direction: 'rtl', fontFamily: 'inherit' }}>
          <h2 style={{ color: '#e63946' }}>خطایی در نمایش صفحه رخ داد</h2>
          <p style={{ color: '#666', marginTop: 10 }}>{this.state.error?.message || 'مشکل غیرمنتظره‌ای رخ داده است.'}</p>
          <button 
            style={{ marginTop: 20, padding: '10px 24px', background: '#0870d1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
          >
            تلاش مجدد
          </button>
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
    if (currentTab === 'tickets') {
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
      {tab !== 'tickets' && (
        <div className="page-head">
          <div>
            <h1>{adminTitle(tab)}</h1>
            <p>مدیریت یکپارچه کاربران، فروش و سرویس‌ها</p>
          </div>
          {tab === 'packages' && (
            <button className="btn-primary" onClick={() => editPackage(null, () => load('packages'))}>
              <Plus size={16} />
              <span>افزودن پکیج</span>
            </button>
          )}
        </div>
      )}
      {error && <div className="alert error">{error}</div>}
      {tab === 'tickets' ? (
        <AdminTicketsView />
      ) : loading ? (
        <Loader />
      ) : !data ? (
        <Empty />
      ) : tab === 'overview' ? (
        <div className="stats admin-stats">
          <Stat icon={Users} n={data.stats?.users || 0} label="کاربران" />
          <Stat icon={Building2} n={data.stats?.companies || 0} label="شرکت‌ها" />
          <Stat icon={CreditCard} n={money(data.stats?.revenue || 0)} label="درآمد" />
          <Stat icon={Package} n={data.stats?.active_subscriptions || 0} label="اشتراک فعال" />
          <Stat icon={Clock3} n={data.stats?.trials || 0} label="دوره آزمایشی" />
        </div>
      ) : (
        <AdminContent tab={tab} data={data.data || []} reload={() => load(tab)} />
      )}
    </Shell>
  );
}

function AdminContent({ tab, data, reload }) {
  const list = Array.isArray(data) ? data : [];

  if (tab === 'users') {
    if (!list.length) return <Panel><Empty /></Panel>;
    return (
      <Panel>
        <Table 
          headers={['شماره موبایل', 'نام و نام خانوادگی', 'نام شرکت', 'حوزه فعالیت', 'تعداد اشتراک']}
          rows={list.map(x => [
            x.mobile,
            [x.first_name, x.last_name].filter(Boolean).join(' ') || '—',
            x.company_name || '—',
            x.industry || '—',
            (x.subscriptions_count || 0) + ' اشتراک'
          ])} 
        />
      </Panel>
    );
  }
  if (tab === 'packages') {
    if (!list.length) return <Panel><Empty /></Panel>;
    return (
      <div className="cards">
        {list.map(x => (
          <article className="admin-card" key={x.id}>
            <span className={'pill ' + (x.is_active ? 'active' : 'cancelled')}>
              {x.is_active ? 'فعال' : 'غیرفعال'}
            </span>
            <h3>{x.name}</h3>
            <strong>{money(x.price)}</strong>
            <p>{x.duration_days} روز · {(x.features || []).length} قابلیت</p>
            <button className="outline" onClick={() => editPackage(x, reload)}>ویرایش</button>
          </article>
        ))}
      </div>
    );
  }
  if (tab === 'orders') {
    if (!list.length) return <Panel><Empty /></Panel>;
    return (
      <Panel>
        <Table 
          headers={['شماره سفارش', 'کاربر', 'پکیج', 'مبلغ', 'وضعیت']}
          rows={list.map(x => [
            x.order_number || '—',
            x.user_name || x.mobile || '—',
            x.package_name || '—',
            money(x.amount),
            status(x.transaction_status || x.status)
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
    packages: 'پکیج‌ها و قیمت‌ها',
    orders: 'خریدها و تراکنش‌ها',
    subscriptions: 'اشتراک‌ها و دوره‌های آزمایشی',
    tickets: 'تیکت‌های پشتیبانی'
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding/user" element={<Guard><UserInfo /></Guard>} />
        <Route path="/onboarding/company" element={<Guard><Company /></Guard>} />
        <Route path="/plans" element={<Guard><Plans /></Guard>} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/admin" element={<Guard><Admin /></Guard>} />
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
