import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  ArrowRight, 
  Search, 
  Bell, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Users, 
  TrendingUp, 
  Package, 
  DollarSign, 
  FolderKanban, 
  Headphones, 
  FileText, 
  Calendar, 
  ShoppingCart, 
  Warehouse, 
  Briefcase, 
  Settings, 
  Layers,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  X,
  PieChart,
  BarChart3
} from 'lucide-react';

const MODULE_DEFINITIONS = {
  crm: { title: 'مدیریت مشتریان (CRM)', icon: Users, color: '#2563eb' },
  sale: { title: 'فروش و فاکتورها', icon: TrendingUp, color: '#059669' },
  accounting: { title: 'حسابداری و مالی', icon: DollarSign, color: '#7c3aed' },
  inventory: { title: 'انبار و موجودی کالا', icon: Warehouse, color: '#ea580c' },
  purchase: { title: 'خرید و تدارکات', icon: ShoppingCart, color: '#0891b2' },
  project: { title: 'مدیریت پروژه‌ها', icon: FolderKanban, color: '#4f46e5' },
  hr: { title: 'منابع انسانی و پرسنل', icon: Briefcase, color: '#db2777' },
  attendance: { title: 'حضور و غیاب', icon: Clock, color: '#0284c7' },
  helpdesk: { title: 'پشتیبانی و تیکت‌ها', icon: Headphones, color: '#ca8a04' },
  pos: { title: 'صندوق فروش حضوری (POS)', icon: Package, color: '#16a34a' },
  documents: { title: 'اتوماسیون اسناد', icon: FileText, color: '#475569' },
  calendar: { title: 'تقویم کاری و جلسات', icon: Calendar, color: '#0ea5e9' },
  mrp: { title: 'برنامه‌ریزی تولید (MRP)', icon: Settings, color: '#6366f1' },
  timesheet: { title: 'تایم‌شیت کاری', icon: Clock, color: '#3b82f6' },
  tax: { title: 'سامانه مودیان مالیاتی', icon: ShieldCheck, color: '#9333ea' },
  leaves: { title: 'مدیریت مرخصی‌ها', icon: Calendar, color: '#e11d48' },
  recruitment: { title: 'استخدام و کارگزینی', icon: Users, color: '#059669' },
  barcode: { title: 'بارکد و اسکن کالا', icon: Package, color: '#6b7280' },
  expenses: { title: 'مدیریت هزینه‌ها', icon: DollarSign, color: '#dc2626' },
  shift: { title: 'شیفت‌بندی پرسنل', icon: Clock, color: '#2563eb' },
  appointment: { title: 'نوبت‌دهی آنلاین', icon: Calendar, color: '#0891b2' },
  restaurant: { title: 'مدیریت سفارش رستوران', icon: ShoppingCart, color: '#ea580c' },
  knowledge: { title: 'دانشنامه سازمانی', icon: FileText, color: '#7c3aed' },
  survey: { title: 'نظرسنجی و فرم‌ساز', icon: PieChart, color: '#10b981' },
  sms: { title: 'سامانه پیامک هوشمند', icon: Bell, color: '#f59e0b' },
  im_livechat: { title: 'چت زنده و گفتگوی آنلاین', icon: Headphones, color: '#3b82f6' },
};

export function ERPWorkspaceView({ subscription, user, onBackToDashboard }) {
  const [activeModuleId, setActiveModuleId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString('fa-IR'));
  const [quickNotice, setQuickNotice] = useState(null);

  // Live time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('fa-IR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine active module IDs from subscription
  const moduleIds = subscription?.module_ids && subscription.module_ids.length > 0
    ? subscription.module_ids
    : ['crm', 'sale', 'accounting', 'inventory'];

  useEffect(() => {
    if (moduleIds.length > 0 && !activeModuleId) {
      setActiveModuleId(moduleIds[0]);
    }
  }, [moduleIds, activeModuleId]);

  const activeModuleMeta = MODULE_DEFINITIONS[activeModuleId] || {
    title: activeModuleId ? `ماژول ${activeModuleId}` : 'داشبورد ERP',
    icon: Layers,
    color: '#2563eb'
  };

  const handleAction = (msg) => {
    setQuickNotice(msg);
    setTimeout(() => setQuickNotice(null), 3000);
  };

  return (
    <div className="erp-workspace-root" dir="rtl">
      {/* Top Application Bar */}
      <header className="erp-workspace-topbar">
        <div className="erp-topbar-right">
          <button 
            type="button" 
            className="erp-ws-btn-back"
            onClick={onBackToDashboard}
            title="بازگشت به پنل مدیریت کارویتا"
          >
            <ArrowRight size={18} />
            <span>داشبورد کارویتا</span>
          </button>
          
          <div className="erp-ws-brand-divider" />

          <div className="erp-ws-brand">
            <div className="erp-ws-logo-pill">ERP</div>
            <div className="erp-ws-brand-text">
              <span className="erp-ws-brand-name">کارویتا ابری</span>
              <span className="erp-ws-company-name">
                {user?.company_name || 'فضای کاری سازمانی شما'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="erp-topbar-center">
          <div className="erp-ws-search-box">
            <Search size={16} className="erp-ws-search-icon" />
            <input 
              type="text" 
              placeholder="جستجو در فاکتورها، مخاطبین، اسناد، کالاها..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Topbar Left (Status, Clock, User) */}
        <div className="erp-topbar-left">
          <div className="erp-ws-status-chip">
            <span className="erp-ws-live-pulse" />
            <span>سرور ابری اختصاصی: آنلاین</span>
          </div>

          <div className="erp-ws-clock">
            <Clock size={15} />
            <span>{time}</span>
          </div>

          <div className="erp-ws-user-badge">
            <div className="erp-ws-user-avatar">
              {(user?.first_name?.[0] || 'ک') + (user?.last_name?.[0] || '')}
            </div>
            <div className="erp-ws-user-info">
              <span className="erp-ws-user-name">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'مدیر سیستم'}
              </span>
              <span className="erp-ws-user-role">دسترسی ادمین کل</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Action Toast */}
      {quickNotice && (
        <div className="erp-ws-toast">
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{quickNotice}</span>
        </div>
      )}

      {/* Main ERP Layout: Sidebar + Canvas */}
      <div className="erp-workspace-layout">
        {/* Right Sidebar: Active Modules */}
        <aside className="erp-workspace-sidebar">
          <div className="erp-sidebar-heading">
            <span>ماژول‌های فعال شما ({moduleIds.length})</span>
          </div>

          <nav className="erp-sidebar-nav">
            {moduleIds.map(modId => {
              const meta = MODULE_DEFINITIONS[modId] || { title: modId, icon: Layers, color: '#2563eb' };
              const IconComp = meta.icon;
              const isActive = activeModuleId === modId;
              return (
                <button
                  key={modId}
                  type="button"
                  className={`erp-sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveModuleId(modId)}
                >
                  <div 
                    className="erp-sidebar-item-icon" 
                    style={{ background: isActive ? meta.color : '#f1f5f9', color: isActive ? '#ffffff' : meta.color }}
                  >
                    <IconComp size={18} />
                  </div>
                  <span className="erp-sidebar-item-title">{meta.title}</span>
                  {isActive && <ChevronLeft size={16} className="erp-active-chevron" />}
                </button>
              );
            })}
          </nav>

          {/* User Limits Info Footer */}
          <div className="erp-sidebar-footer-card">
            <div className="erp-sb-foot-row">
              <Users size={15} color="#2563eb" />
              <span>ظرفیت: <strong>{Number(subscription?.user_count || 5).toLocaleString('fa-IR')} کاربر</strong></span>
            </div>
            <div className="erp-sb-foot-row" style={{ marginTop: 6 }}>
              <ShieldCheck size={15} color="#16a34a" />
              <span>پایگاه داده: <strong>ایزوله امن</strong></span>
            </div>
          </div>
        </aside>

        {/* Main Work Area */}
        <main className="erp-workspace-main">
          {/* Module Header */}
          <div className="erp-module-hero-header">
            <div className="erp-module-hero-title-group">
              <div 
                className="erp-module-hero-icon"
                style={{ background: `${activeModuleMeta.color}15`, color: activeModuleMeta.color }}
              >
                <activeModuleMeta.icon size={26} />
              </div>
              <div>
                <h2>{activeModuleMeta.title}</h2>
                <p>سامانه جامع و یکپارچه سازمانی کارویتا • دیتای ابری بلادرنگ</p>
              </div>
            </div>

            <div className="erp-module-hero-actions">
              <button 
                type="button" 
                className="erp-btn-primary-action"
                onClick={() => handleAction(`رکورد جدید در ${activeModuleMeta.title} با موفقیت ایجاد شد.`)}
              >
                <Plus size={16} />
                <span>ثبت آیتم / رکورد جدید</span>
              </button>
            </div>
          </div>

          {/* Module Dynamic Content */}
          <div className="erp-module-workspace-content">
            {activeModuleId === 'crm' && (
              <CRMWorkspace onAction={handleAction} />
            )}

            {activeModuleId === 'sale' && (
              <SalesWorkspace onAction={handleAction} />
            )}

            {activeModuleId === 'accounting' && (
              <AccountingWorkspace onAction={handleAction} />
            )}

            {activeModuleId === 'inventory' && (
              <InventoryWorkspace onAction={handleAction} />
            )}

            {activeModuleId === 'project' && (
              <ProjectsWorkspace onAction={handleAction} />
            )}

            {activeModuleId === 'hr' && (
              <HRWorkspace onAction={handleAction} />
            )}

            {/* Generic fallback for other modules */}
            {!['crm', 'sale', 'accounting', 'inventory', 'project', 'hr'].includes(activeModuleId) && (
              <GenericModuleWorkspace meta={activeModuleMeta} onAction={handleAction} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Sub-workspace: CRM
function CRMWorkspace({ onAction }) {
  const customers = [
    { id: 1, name: 'شرکت پترو تجهیز نوین', contact: 'مهندس حسینی', mobile: '۰۹۱۲۳۴۵۶۷۸۹', status: 'مشتری بالقوه', deal: '۸۵,۰۰۰,۰۰۰ تومان', stage: 'ارسال پیش‌فاکتور' },
    { id: 2, name: 'بازرگانی امید فردا', contact: 'خانم دکتر رضایی', mobile: '۰۹۱۹۸۷۶۵۴۳۲', status: 'مشتری وفادار', deal: '۱۴۰,۰۰۰,۰۰۰ تومان', stage: 'مذاکره نهایی' },
    { id: 3, name: 'صنایع غذایی بهاران', contact: 'آقای صادقی', mobile: '۰۹۳۵۱۲۳۴۵۶۷', status: 'سرنخ جدید', deal: '۳۵,۰۰۰,۰۰۰ تومان', stage: 'تماس اولیه' },
    { id: 4, name: 'مجموعه مهندسی پارس', contact: 'مهندس کاظمی', mobile: '۰۹۱۲۹۹۹۸۸۷۷', status: 'مشتری رسمی', deal: '۲۱۰,۰۰۰,۰۰۰ تومان', stage: 'عقد قرارداد' },
  ];

  return (
    <div className="erp-subview-container">
      {/* Metric Cards */}
      <div className="erp-ws-metrics-grid">
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">کل سرنخ‌ها و مخاطبین</span>
          <strong className="erp-metric-num">۱۲۸ مخاطب</strong>
          <span className="erp-metric-sub green">↑ ۱۲٪ رشد این ماه</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">ارزش معاملات در جریان</span>
          <strong className="erp-metric-num">۴۷۰,۰۰۰,۰۰۰ تومان</strong>
          <span className="erp-metric-sub blue">۸ فرصت باز</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">نرخ تبدیل سرنخ به مشتری</span>
          <strong className="erp-metric-num">۶۸.۵٪</strong>
          <span className="erp-metric-sub green">عملکرد عالی تیم</span>
        </div>
      </div>

      {/* Table of Leads/Customers */}
      <div className="erp-ws-card">
        <div className="erp-ws-card-head">
          <h3>لیست مخاطبین و فرصت‌های فروش CRM</h3>
          <button type="button" className="erp-btn-sm" onClick={() => onAction('مشتری جدید اضافه شد.')}>
            <Plus size={14} />
            <span>مخاطب جدید</span>
          </button>
        </div>
        <div className="erp-ws-table-wrap">
          <table className="erp-ws-table">
            <thead>
              <tr>
                <th>نام شرکت / مشتری</th>
                <th>شخص رابط</th>
                <th>شماره تماس</th>
                <th>مرحله فرصت</th>
                <th>ارزش تخمینی</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.contact}</td>
                  <td className="font-mono">{c.mobile}</td>
                  <td><span className="erp-table-badge blue">{c.stage}</span></td>
                  <td className="font-bold">{c.deal}</td>
                  <td><span className="erp-table-badge green">{c.status}</span></td>
                  <td>
                    <button type="button" className="erp-btn-table-action" onClick={() => onAction(`پرونده ${c.name} باز شد.`)}>
                      مشاهده پرونده
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-workspace: Sales
function SalesWorkspace({ onAction }) {
  const invoices = [
    { id: 'INV-40301', customer: 'شرکت پترو تجهیز نوین', date: '۱۴۰۳/۰۶/۱۰', amount: '۸۵,۰۰۰,۰۰۰ تومان', status: 'پرداخت شده' },
    { id: 'INV-40302', customer: 'بازرگانی امید فردا', date: '۱۴۰۳/۰۶/۱۲', amount: '۱۴۰,۰۰۰,۰۰۰ تومان', status: 'در انتظار پرداخت' },
    { id: 'INV-40303', customer: 'مجموعه مهندسی پارس', date: '۱۴۰۳/۰۶/۱۴', amount: '۲۱۰,۰۰۰,۰۰۰ تومان', status: 'پیش‌فاکتور' },
  ];

  return (
    <div className="erp-subview-container">
      <div className="erp-ws-metrics-grid">
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">فروش ناخالص این ماه</span>
          <strong className="erp-metric-num">۴۳۵,۰۰۰,۰۰۰ تومان</strong>
          <span className="erp-metric-sub green">↑ ۲۴٪ بیشتر از ماه قبل</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">فاکتورهای تایید شده</span>
          <strong className="erp-metric-num">۲۴ فقره</strong>
          <span className="erp-metric-sub blue">میانگین صدور: ۱۸ دقیقه</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">مطالبات وصول نشده</span>
          <strong className="erp-metric-num">۶۲,۰۰۰,۰۰۰ تومان</strong>
          <span className="erp-metric-sub orange">۳ پیش‌فاکتور منقضی</span>
        </div>
      </div>

      <div className="erp-ws-card">
        <div className="erp-ws-card-head">
          <h3>فاکتورها و پیش‌فاکتورهای اخیر</h3>
          <button type="button" className="erp-btn-sm" onClick={() => onAction('پیش‌فاکتور جدید صادر شد.')}>
            <Plus size={14} />
            <span>صدور فاکتور</span>
          </button>
        </div>
        <div className="erp-ws-table-wrap">
          <table className="erp-ws-table">
            <thead>
              <tr>
                <th>شماره فاکتور</th>
                <th>خریدار</th>
                <th>تاریخ ثبت</th>
                <th>مبلغ کل</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="font-mono font-bold">{inv.id}</td>
                  <td>{inv.customer}</td>
                  <td>{inv.date}</td>
                  <td className="font-bold">{inv.amount}</td>
                  <td>
                    <span className={`erp-table-badge ${inv.status === 'پرداخت شده' ? 'green' : inv.status === 'پیش‌فاکتور' ? 'blue' : 'orange'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="erp-btn-table-action" onClick={() => onAction(`فاکتور ${inv.id} چاپ شد.`)}>
                      چاپ و ارسال
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-workspace: Accounting
function AccountingWorkspace({ onAction }) {
  return (
    <div className="erp-subview-container">
      <div className="erp-ws-metrics-grid">
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">تراز کل دارایی‌ها</span>
          <strong className="erp-metric-num">۱,۲۸۰,۰۰۰,۰۰۰ تومان</strong>
          <span className="erp-metric-sub green">سود خالص: ۳۴٪</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">اسناد ثبت‌شده این ماه</span>
          <strong className="erp-metric-num">۱۴۲ سند</strong>
          <span className="erp-metric-sub blue">تراز بدهکار/بستانکار: متوازن</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">مالیات ارزش افزوده دوره</span>
          <strong className="erp-metric-num">۳۸,۵۰۰,۰۰۰ تومان</strong>
          <span className="erp-metric-sub purple">ارسال به سامانه مودیان: آماده</span>
        </div>
      </div>

      <div className="erp-ws-card">
        <div className="erp-ws-card-head">
          <h3>دفتر روزنامه و اسناد حسابداری اخیر</h3>
          <button type="button" className="erp-btn-sm" onClick={() => onAction('سند دوبل حسابداری ثبت گردید.')}>
            <Plus size={14} />
            <span>ثبت سند حسابداری</span>
          </button>
        </div>
        <div className="erp-ws-table-wrap">
          <table className="erp-ws-table">
            <thead>
              <tr>
                <th>شماره سند</th>
                <th>شرح سند</th>
                <th>کد حساب</th>
                <th>بدهکار</th>
                <th>بستانکار</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">DOC-981</td>
                <td>واریز وجه فاکتور فروش شماره INV-40301 به بانک ملت</td>
                <td>۱۰۱-۰۱ (بانک‌ها)</td>
                <td className="font-bold">۸۵,۰۰۰,۰۰۰ تومان</td>
                <td>۰ تومان</td>
                <td><span className="erp-table-badge green">تأیید نهایی</span></td>
              </tr>
              <tr>
                <td className="font-mono">DOC-980</td>
                <td>ثبت هزینه اجاره دفتر مرکزی و شارژ ساختمان</td>
                <td>۵۰۲-۰۴ (هزینه‌های جاری)</td>
                <td className="font-bold">۳۲,۰۰۰,۰۰۰ تومان</td>
                <td>۰ تومان</td>
                <td><span className="erp-table-badge green">تأیید نهایی</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-workspace: Inventory
function InventoryWorkspace({ onAction }) {
  const items = [
    { code: 'PRD-101', name: 'سرور رکمونت ابری Proliant', category: 'تجهیزات شبکه', stock: '۱۴ عدد', min: '۴ عدد', unitPrice: '۶۵,۰۰۰,۰۰۰ تومان', status: 'موجود' },
    { code: 'PRD-102', name: 'روتر برد میکروتیک صنعتی', category: 'سخت‌افزار', stock: '۳۲ عدد', min: '۱۰ عدد', unitPrice: '۱۴,۵۰۰,۰۰۰ تومان', status: 'موجود' },
    { code: 'PRD-103', name: 'سوئیچ ۲۴ پورت مدیریتی سیسکو', category: 'سخت‌افزار', stock: '۲ عدد', min: '۵ عدد', unitPrice: '۲۸,۰۰۰,۰۰۰ تومان', status: 'کمبود موجودی' },
  ];

  return (
    <div className="erp-subview-container">
      <div className="erp-ws-metrics-grid">
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">ارزش کل موجودی انبار</span>
          <strong className="erp-metric-num">۸۴۰,۰۰۰,۰۰۰ تومان</strong>
          <span className="erp-metric-sub blue">۳ انبار فعال</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">اقلام با نقطه سفارش بحرانی</span>
          <strong className="erp-metric-num">۱ قلم کالا</strong>
          <span className="erp-metric-sub orange">هشدار تامین خودکار</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">حواله‌های خروج این هفته</span>
          <strong className="erp-metric-num">۱۸ حواله</strong>
          <span className="erp-metric-sub green">تحویل بموقع: ۱۰۰٪</span>
        </div>
      </div>

      <div className="erp-ws-card">
        <div className="erp-ws-card-head">
          <h3>لیست موجودی کالاها و انبار مرکزی</h3>
          <button type="button" className="erp-btn-sm" onClick={() => onAction('حواله ورود کالا ثبت شد.')}>
            <Plus size={14} />
            <span>رسید ورود به انبار</span>
          </button>
        </div>
        <div className="erp-ws-table-wrap">
          <table className="erp-ws-table">
            <thead>
              <tr>
                <th>کد کالا</th>
                <th>نام کالا</th>
                <th>دسته‌بندی</th>
                <th>موجودی فعلی</th>
                <th>قیمت واحد</th>
                <th>وضعیت انبار</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.code}>
                  <td className="font-mono">{item.code}</td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td className="font-bold">{item.stock}</td>
                  <td>{item.unitPrice}</td>
                  <td>
                    <span className={`erp-table-badge ${item.status === 'موجود' ? 'green' : 'orange'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="erp-btn-table-action" onClick={() => onAction(`کاردکس کالا ${item.code} نمایش داده شد.`)}>
                      مشاهده کاردکس
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-workspace: Projects
function ProjectsWorkspace({ onAction }) {
  return (
    <div className="erp-subview-container">
      <div className="erp-ws-metrics-grid">
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">پروژه‌های فعال</span>
          <strong className="erp-metric-num">۶ پروژه</strong>
          <span className="erp-metric-sub green">۲ پروژه در فاز تحویل</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">تسک‌های تکمیل‌شده این ماه</span>
          <strong className="erp-metric-num">۸۴ وظیفه</strong>
          <span className="erp-metric-sub blue">راندمان تیم: ۹۲٪</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">ساعت کار ثبت‌شده (تایم‌شیت)</span>
          <strong className="erp-metric-num">۵۴۰ ساعت</strong>
          <span className="erp-metric-sub purple">محاسبه خودکار در حقوق</span>
        </div>
      </div>

      <div className="erp-ws-card">
        <div className="erp-ws-card-head">
          <h3>پروژه‌های سازمانی در دست اجرا</h3>
          <button type="button" className="erp-btn-sm" onClick={() => onAction('پروژه جدید تعریف گردید.')}>
            <Plus size={14} />
            <span>تعریف پروژه جدید</span>
          </button>
        </div>
        <div className="erp-ws-table-wrap">
          <table className="erp-ws-table">
            <thead>
              <tr>
                <th>نام پروژه</th>
                <th>مدیر پروژه</th>
                <th>پیشرفت فیزیکی</th>
                <th>مهلت تحویل</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>پیاده‌سازی پرتال ابری کارویتا</strong></td>
                <td>مهندس عباسی</td>
                <td>
                  <div className="erp-progress-bar-wrap">
                    <div className="erp-progress-fill" style={{ width: '85%' }} />
                    <span>۸۵٪</span>
                  </div>
                </td>
                <td>۱۴۰۳/۰۶/۳۰</td>
                <td><span className="erp-table-badge green">در حال اجرا</span></td>
              </tr>
              <tr>
                <td><strong>یکپارچه‌سازی سیستم انبار و مالی</strong></td>
                <td>خانم مهندس مرادی</td>
                <td>
                  <div className="erp-progress-bar-wrap">
                    <div className="erp-progress-fill" style={{ width: '60%' }} />
                    <span>۶۰٪</span>
                  </div>
                </td>
                <td>۱۴۰۳/۰۷/۱۵</td>
                <td><span className="erp-table-badge blue">توسعه نرم‌افزاری</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-workspace: HR
function HRWorkspace({ onAction }) {
  return (
    <div className="erp-subview-container">
      <div className="erp-ws-metrics-grid">
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">تعداد کل پرسنل فعال</span>
          <strong className="erp-metric-num">۱۸ نفر</strong>
          <span className="erp-metric-sub green">۱۰۰٪ قرارداد معتبر</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">حاضرین امروز در سامانه</span>
          <strong className="erp-metric-num">۱۶ نفر</strong>
          <span className="erp-metric-sub blue">۲ نفر در مرخصی استحقاقی</span>
        </div>
        <div className="erp-ws-metric-box">
          <span className="erp-metric-label">حقوق و دستمزد این دوره</span>
          <strong className="erp-metric-num">محاسبه‌شده</strong>
          <span className="erp-metric-sub green">فیش‌های حقوقی صادر شد</span>
        </div>
      </div>

      <div className="erp-ws-card">
        <div className="erp-ws-card-head">
          <h3>دایرکتوری پرسنل و همکاران</h3>
          <button type="button" className="erp-btn-sm" onClick={() => onAction('پرسنل جدید به لیست افزوده شد.')}>
            <Plus size={14} />
            <span>افزودن همکار جدید</span>
          </button>
        </div>
        <div className="erp-ws-table-wrap">
          <table className="erp-ws-table">
            <thead>
              <tr>
                <th>نام و نام خانوادگی</th>
                <th>سمت سازمانی</th>
                <th>واحد</th>
                <th>شماره تماس</th>
                <th>وضعیت تردد</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>مهندس آرش طاهری</strong></td>
                <td>مدیر ارشد فنی</td>
                <td>توسعه محصول</td>
                <td className="font-mono">۰۹۱۲۱۱۱۰۰۲۲</td>
                <td><span className="erp-table-badge green">حاضر در شرکت</span></td>
              </tr>
              <tr>
                <td><strong>خانم سارا رستمی</strong></td>
                <td>کارشناس ارشد حسابداری</td>
                <td>مالی و اداری</td>
                <td className="font-mono">۰۹۱۹۲۲۲۳۳۴۴</td>
                <td><span className="erp-table-badge green">حاضر در شرکت</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-workspace: Generic for other modules
function GenericModuleWorkspace({ meta, onAction }) {
  return (
    <div className="erp-subview-container">
      <div className="erp-ws-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: `${meta.color}15`, color: meta.color, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <meta.icon size={32} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          فضای کاری {meta.title}
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.7 }}>
          این ماژول در بسته اشتراک سازمانی شما فعال و متصل به سرور ابری اختصاصی است. می‌توانید رکوردها، تنظیمات و داده‌های مربوط به {meta.title} را مدیریت کنید.
        </p>
        <button 
          type="button" 
          className="erp-btn-primary-action"
          style={{ margin: '0 auto' }}
          onClick={() => onAction(`داده‌های نمونه در ${meta.title} بارگذاری گردید.`)}
        >
          <Plus size={16} />
          <span>شروع کار با ماژول {meta.title}</span>
        </button>
      </div>
    </div>
  );
}
