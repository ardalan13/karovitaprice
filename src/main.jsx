import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Receipt, User, LogOut, Building2, Clock3, CreditCard, CheckCircle2, ArrowLeft, Menu, X, Settings } from 'lucide-react';
import { api } from './services/api';
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

function Welcome() {
  const nav = useNavigate();
  function go(intent) {
    localStorage.setItem('intent', intent);
    nav('/auth');
  }
  return (
    <main className="welcome">
      <section className="welcome-copy">
        <Logo />
        <div>
          <span className="eyebrow">نرم‌افزار مدیریت یکپارچه</span>
          <h1>یک فضای کاری ساده، سریع و قابل توسعه</h1>
          <p>از مدیریت مشتریان تا فروش و گزارش‌ها، همه‌چیز را در یک داشبورد حرفه‌ای کنترل کنید.</p>
          <div className="hero-actions">
            <button onClick={() => go('trial')}>۵ روز استفاده رایگان</button>
            <button className="outline" onClick={() => go('buy')}>مشاهده و خرید پکیج</button>
          </div>
          <button className="text" onClick={() => go('login')}>قبلاً ثبت‌نام کرده‌ام؛ ورود به حساب</button>
        </div>
      </section>
      <section className="welcome-art">
        <div className="mock">
          <div />
          <div />
          <div />
        </div>
      </section>
    </main>
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
  const [mobile, setMobile] = useState('');
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
      if (r.user.role === 'admin') return nav('/admin');
      if (Number(r.user.onboarding_step) < 2) return nav('/onboarding/user');
      if (Number(r.user.onboarding_step) < 3) return nav('/onboarding/company');
      if (localStorage.getItem('intent') === 'trial') return activateTrial(nav);
      if (localStorage.getItem('intent') === 'buy') return nav('/plans');
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
              } else {
                setCode(converted.replace(/\D/g, ''));
              }
            }}
            placeholder={stage === 'mobile' ? '09123456789' : '•••••'}
          />
        </label>
        {hint && <div className="alert" style={{ background: '#eef6ff', color: '#0759a8' }}>{hint}</div>}
        {error && <div className="alert error">{error}</div>}
        <button disabled={loading} onClick={stage === 'mobile' ? send : verify}>
          {loading ? 'در حال ارسال…' : stage === 'mobile' ? 'دریافت کد' : 'تأیید و ادامه'} <ArrowLeft />
        </button>
        {stage === 'code' && (
          <button className="text" disabled={loading} onClick={() => setStage('mobile')}>
            ویرایش شماره
          </button>
        )}
      </div>
    </Onboard>
  );
}

async function activateTrial(nav) {
  try {
    await api('/trial', { method: 'POST' });
    localStorage.removeItem('intent');
    nav('/dashboard?trial=active');
  } catch (e) {
    if (e.message.includes('قبلاً')) nav('/dashboard');
    else throw e;
  }
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
  const [f, setF] = useState({ first_name: '', last_name: '', email: '' });
  const [error, setError] = useState('');

  async function submit() {
    try {
      await api('/onboarding/user', {
        method: 'POST',
        body: JSON.stringify(f),
      });
      nav('/onboarding/company');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Onboard active={1}>
      <h1>اطلاعات کاربری</h1>
      <p>اطلاعات پایه حساب خود را وارد کنید.</p>
      <div className="form-grid">
        <Field label="نام" value={f.first_name} set={v => setF({ ...f, first_name: v })} />
        <Field label="نام خانوادگی" value={f.last_name} set={v => setF({ ...f, last_name: v })} />
        <Field wide label="ایمیل (اختیاری)" value={f.email} set={v => setF({ ...f, email: v })} />
      </div>
      {error && <div className="alert error">{error}</div>}
      <button onClick={submit}>ادامه <ArrowLeft /></button>
    </Onboard>
  );
}

function Company() {
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', industry: '', employee_count: '', job_title: '' });
  const [error, setError] = useState('');

  async function submit() {
    try {
      await api('/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(f),
      });
      if (localStorage.getItem('intent') === 'trial') await activateTrial(nav);
      else nav('/plans');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Onboard active={2}>
      <h1>مشخصات شرکت</h1>
      <p>برای پیشنهاد بهترین پکیج، کسب‌وکار خود را معرفی کنید.</p>
      <div className="form-grid">
        <Field label="نام شرکت" value={f.name} set={v => setF({ ...f, name: v })} />
        <Field label="تعداد کارکنان" type="number" value={f.employee_count} set={v => setF({ ...f, employee_count: v })} />
        <label>
          حوزه فعالیت
          <select value={f.industry} onChange={e => setF({ ...f, industry: e.target.value })}>
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
          <select value={f.job_title} onChange={e => setF({ ...f, job_title: e.target.value })}>
            <option value="">انتخاب کنید</option>
            <option>مدیرعامل</option>
            <option>مدیر فروش</option>
            <option>مدیر بازاریابی</option>
            <option>کارشناس</option>
          </select>
        </label>
      </div>
      {error && <div className="alert error">{error}</div>}
      <button onClick={submit}>ادامه <ArrowLeft /></button>
    </Onboard>
  );
}

function Field({ label, value, set, type = 'text', wide }) {
  return (
    <label className={wide ? 'wide' : ''}>
      {label}
      <input type={type} value={value} onChange={e => set(e.target.value)} />
    </label>
  );
}

function Plans() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/packages')
      .then(r => setItems(r.data.filter(x => Number(x.price) > 0)))
      .catch(e => setError(e.message));
  }, []);

  async function buy() {
    try {
      const r = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({ package_id: selected }),
      });
      location.href = r.payment_url;
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Onboard active={3}>
      <div className="title-row">
        <div>
          <h1>پکیج پیشنهادی برای شما</h1>
          <p>پکیج را انتخاب یا قبل از پرداخت تغییر دهید.</p>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="plan-grid">
        {items.map(p => (
          <article
            key={p.id}
            className={(selected === p.id ? 'selected ' : '') + (p.is_featured ? 'featured' : '')}
            onClick={() => setSelected(p.id)}
          >
            {p.is_featured && <em>پیشنهاد ما</em>}
            <h2>{p.name}</h2>
            <strong>{money(p.price)}</strong>
            <span>برای {p.duration_days} روز</span>
            <p>{p.description}</p>
            <ul>
              {p.features.map(x => (
                <li key={x}><CheckCircle2 /> {x}</li>
              ))}
            </ul>
            <button>{selected === p.id ? 'انتخاب شد' : 'انتخاب پکیج'}</button>
          </article>
        ))}
      </div>
      <div className="checkout">
        <button disabled={!selected} onClick={buy}>پرداخت و فعال‌سازی</button>
        <button className="outline" onClick={() => nav('/dashboard')}>فعلاً بعداً</button>
      </div>
    </Onboard>
  );
}

const userNav = [
  ['overview', 'داشبورد', LayoutDashboard],
  ['packages', 'پکیج‌های من', Package],
  ['payments', 'پرداخت‌ها', Receipt],
  ['profile', 'تنظیمات حساب', Settings],
];

function Shell({ admin = false, tab, setTab, children, name }) {
  const [open, setOpen] = useState(false);
  const nav = admin ? [
    ['overview', 'نمای کلی', LayoutDashboard],
    ['users', 'کاربران و شرکت‌ها', Users],
    ['packages', 'پکیج‌ها و قیمت‌ها', Package],
    ['orders', 'خرید و تراکنش‌ها', CreditCard],
    ['subscriptions', 'اشتراک‌ها و آزمایشی', Clock3],
  ] : userNav;

  return (
    <div className="app-shell">
      <aside className={open ? 'open' : ''}>
        <div className="aside-head">
          <Logo />
          <button onClick={() => setOpen(false)}><X /></button>
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setOpen(false); }}>
              <Icon />
              {label}
            </button>
          ))}
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
  const [d, setD] = useState(null);
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/dashboard')
      .then(r => {
        if (r.user.role === 'admin') return location.href = '/admin';
        setD(r);
        setProfile(r.user);
      })
      .catch(() => location.href = '/');
  }, []);

  if (!d) return <Loader />;
  const active = d.subscriptions.filter(x => x.status === 'active' && new Date(x.expires_at) > new Date());

  return (
    <Shell tab={tab} setTab={setTab} name={d.user.first_name}>
      <div className="page-head">
        <div>
          <h1>سلام {d.user.first_name || 'کاربر عزیز'} 👋</h1>
          <p>وضعیت حساب و سرویس‌های خود را از اینجا مدیریت کنید.</p>
        </div>
        <button onClick={() => location.href = '/plans'}>خرید پکیج جدید</button>
      </div>
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
      {tab === 'profile' && (
        <Panel title="تنظیمات حساب">
          <div className="form-grid profile">
            <Field label="نام" value={profile.first_name || ''} set={v => setProfile({ ...profile, first_name: v })} />
            <Field label="نام خانوادگی" value={profile.last_name || ''} set={v => setProfile({ ...profile, last_name: v })} />
            <Field label="ایمیل" value={profile.email || ''} set={v => setProfile({ ...profile, email: v })} />
            <Field label="سمت" value={profile.job_title || ''} set={v => setProfile({ ...profile, job_title: v })} />
            <button onClick={async () => {
              try {
                const res = await api('/profile', { method: 'PUT', body: JSON.stringify(profile) });
                setMsg(res.message);
              } catch (e) {
                setMsg(e.message);
              }
            }}>
              ذخیره تغییرات
            </button>
            {msg && <div className="alert">{msg}</div>}
          </div>
        </Panel>
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
      <div className="page-head">
        <div>
          <h1>{adminTitle(tab)}</h1>
          <p>مدیریت یکپارچه کاربران، فروش و سرویس‌ها</p>
        </div>
        {tab === 'packages' && <button onClick={() => editPackage(null, () => load('packages'))}>افزودن پکیج</button>}
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
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
    subscriptions: 'اشتراک‌ها و دوره‌های آزمایشی'
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
