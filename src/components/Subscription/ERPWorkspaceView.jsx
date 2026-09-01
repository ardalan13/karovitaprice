import React from 'react';
import { 
  ArrowRight, 
  ExternalLink, 
  LogIn, 
  Layers, 
  Users, 
  Clock, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Headphones, 
  Sparkles,
  LayoutDashboard,
  Calendar,
  CreditCard
} from 'lucide-react';

const ERP_PORTAL_URL = 'https://crm.karovita.ir';

export function ERPWorkspaceView({ subscription, user, onBackToDashboard }) {
  if (!subscription) return null;

  const isExpired = new Date(subscription.expires_at) < new Date();
  const isTrial = subscription.source === 'trial';
  const modules = Array.isArray(subscription.modules_detail) && subscription.modules_detail.length > 0
    ? subscription.modules_detail
    : (subscription.module_names || []).map(name => ({ name, id: name, title: name, category: 'ماژول فعال' }));

  const remainingDays = getRemainingDays(subscription.expires_at);

  function formatDate(d) {
    if (!d) return '—';
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(d));
    } catch {
      return new Date(d).toLocaleDateString('fa-IR');
    }
  }

  function getRemainingDays(expiresAt) {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const handleOpenErpPortal = () => {
    window.open(ERP_PORTAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="workspace-view-container" dir="rtl" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Breadcrumb & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button 
          type="button" 
          className="btn-secondary" 
          onClick={onBackToDashboard}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowRight size={17} />
          <span>بازگشت به داشبورد</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`pill ${isExpired ? 'expired' : isTrial ? 'trial' : 'active'}`}>
            {isTrial ? '⭐️ ۵ روز آزمایشی' : isExpired ? '⚠️ منقضی شده' : '✓ اشتراک فعال'}
          </span>
          {remainingDays > 0 && !isExpired && (
            <span style={{ fontSize: 13, color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
              {remainingDays.toLocaleString('fa-IR')} روز باقیمانده
            </span>
          )}
        </div>
      </div>

      {/* Hero Card for ERP Access */}
      <div style={{
        background: 'linear-gradient(135deg, #075985 0%, #0369a1 50%, #0284c7 100%)',
        color: '#ffffff',
        borderRadius: 16,
        padding: '32px 28px',
        boxShadow: '0 12px 30px rgba(3, 105, 161, 0.25)',
        marginBottom: 24,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20
      }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, opacity: 0.9, fontSize: 13.5, fontWeight: 600 }}>
            <Sparkles size={16} />
            <span>پرتال اختصاصی ابری کارویتا</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.4 }}>
            {subscription.package_name || 'سرویس یکپارچه ERP سازمانی'}
          </h1>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.92, lineHeight: 1.7 }}>
            کلیه ماژول‌های فعال، پایگاه داده و اسناد ابری شما در پرتال اختصاصی کارویتا مستقر است. برای شروع کار روی دکمه ورود کلیک کنید.
          </p>
        </div>

        <div>
          <button 
            type="button" 
            onClick={handleOpenErpPortal}
            style={{
              background: '#ffffff',
              color: '#0369a1',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <LogIn size={18} />
            <span>ورود به سامانه ERP کارویتا</span>
            <ExternalLink size={15} style={{ opacity: 0.7 }} />
          </button>
        </div>
      </div>

      {/* Info Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13, marginBottom: 6 }}>
            <Users size={18} color="#2563eb" />
            <span>ظرفیت کاربران</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
            {Number(subscription.user_count || subscription.user_limit || 5).toLocaleString('fa-IR')} کاربر همزمان
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13, marginBottom: 6 }}>
            <Calendar size={18} color="#0891b2" />
            <span>تاریخ انقضای پلن</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
            {formatDate(subscription.expires_at)}
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13, marginBottom: 6 }}>
            <Layers size={18} color="#16a34a" />
            <span>تعداد ماژول‌های فعال</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
            {Number(modules.length).toLocaleString('fa-IR')} ماژول عملیاتی
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13, marginBottom: 6 }}>
            <Building2 size={18} color="#8b5cf6" />
            <span>شرکت / مجموعه</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
            {user?.company_name || 'ثبت‌شده'}
          </div>
        </div>
      </div>

      {/* Modules List Panel */}
      <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color="#0284c7" />
            <span>ماژول‌های نصب‌شده روی این اشتراک</span>
          </h3>
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, background: '#f0fdf4', padding: '4px 10px', borderRadius: 12 }}>
            وضعیت: همگام‌سازی ابری کامل
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 12
        }}>
          {modules.map((m, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}
            >
              <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: 13.5, color: '#1e293b' }}>
                  {typeof m === 'object' ? (m.title || m.name || m.id) : m}
                </strong>
                {typeof m === 'object' && m.category && (
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>{m.category}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
