import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  LogIn, 
  CheckCircle2, 
  Clock, 
  Users, 
  ShieldCheck, 
  Database, 
  Server, 
  FileText, 
  Layers, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  ArrowLeft,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

export function SubscriptionDetailsModal({ subscription, user, onClose, onOpenWorkspace }) {
  const [copied, setCopied] = useState(false);

  if (!subscription) return null;

  const isExpired = new Date(subscription.expires_at) < new Date();
  const isTrial = subscription.source === 'trial';
  const modules = subscription.modules_detail || [];
  const moduleNames = subscription.module_names || [];
  const instance = subscription.server_instance || {
    subdomain: `app-${user?.id || 1}.karvita.ir`,
    status: isExpired ? 'paused' : 'online',
    ssl: true,
    database: 'PostgreSQL 16 Enterprise (اختصاصی)',
    backup_status: 'روزانه خودکار (ساعت ۰۲:۰۰ بامداد)',
    datacenter: 'دیتاسنتر ابری تهران - برج میلاد',
    dedicated_ip: '185.143.232.45'
  };

  const remainingDays = getRemainingDays(subscription.expires_at);

  function formatDate(d) {
    if (!d) return '—';
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  const handleCopySubdomain = () => {
    navigator.clipboard.writeText(`https://${instance.subdomain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadInvoice = () => {
    if (subscription.order_id) {
      window.open(`/api/invoices/${subscription.id}`, '_blank');
    } else {
      alert('فاکتور تنها برای سفارش‌های پرداختی رسمی صادر می‌شود.');
    }
  };

  return (
    <div className="erp-sub-modal-backdrop" onClick={onClose} dir="rtl">
      <div className="erp-sub-modal-card" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="erp-sub-modal-header">
          <div className="erp-sub-modal-header-info">
            <div className="erp-sub-badge-row">
              <span className={`erp-status-chip ${isExpired ? 'expired' : isTrial ? 'trial' : 'active'}`}>
                {isTrial ? '⭐️ دوره آزمایشی ۵ روزه' : isExpired ? '⚠️ منقضی شده' : '✓ اشتراک فعال سازمانی'}
              </span>
              <span className="erp-period-chip">
                {subscription.billing_period === 'yearly' ? 'دوره سالانه (تخفیف ویژه)' : 'دوره ماهانه'}
              </span>
              {remainingDays > 0 && !isExpired && (
                <span className="erp-remaining-chip">
                  <Clock size={13} />
                  <span>{remainingDays.toLocaleString('fa-IR')} روز باقیمانده</span>
                </span>
              )}
            </div>
            <h2 className="erp-sub-modal-title">{subscription.package_name || 'سرویس یکپارچه ERP کارویتا'}</h2>
          </div>
          <button type="button" className="erp-sub-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="erp-sub-modal-body">
          {/* Quick Portal Launch Hero Banner */}
          <div className="erp-portal-launch-banner">
            <div className="erp-launch-banner-content">
              <div className="erp-launch-banner-icon">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="erp-launch-banner-title">ورود به پنل شخصی ERP سازمانی</h3>
                <p className="erp-launch-banner-desc">
                  زیرساخت اختصاصی شما آماده استفاده است. می‌توانید مستقیماً وارد محیط نرم‌افزار شوید و با ماژول‌های فعال خود کار کنید.
                </p>
                <div className="erp-subdomain-row">
                  <span className="erp-subdomain-label">آدرس دسترسی اختصاصی:</span>
                  <code className="erp-subdomain-url">https://{instance.subdomain}</code>
                  <button type="button" className="erp-copy-btn" onClick={handleCopySubdomain}>
                    {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    <span>{copied ? 'کپی شد' : 'کپی لینک'}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="erp-launch-actions">
              <button 
                type="button" 
                className="erp-btn-enter-portal"
                onClick={() => {
                  onClose();
                  onOpenWorkspace(subscription);
                }}
              >
                <LogIn size={18} />
                <span>ورود به حساب کاربری ERP</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>

          {/* 2-Column Info Grid */}
          <div className="erp-sub-details-grid">
            {/* Purchase & Financial Details */}
            <div className="erp-sub-info-card">
              <div className="erp-info-card-header">
                <CreditCard size={18} className="erp-card-icon" />
                <h4>اطلاعات خرید و صورت‌حساب</h4>
              </div>
              <div className="erp-info-list">
                <div className="erp-info-item">
                  <span className="erp-item-label">شماره سفارش:</span>
                  <span className="erp-item-val font-mono">{subscription.order_number || '—'}</span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-item-label">کد پیگیری / شناسه پرداخت:</span>
                  <span className="erp-item-val font-mono">{subscription.reference_id || '—'}</span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-item-label">مبلغ اشتراک:</span>
                  <span className="erp-item-val font-bold">
                    {Number(subscription.price || subscription.order_amount || 0) === 0 ? 'رایگان (دوره آزمایشی)' : `${Number(subscription.price || subscription.order_amount || 0).toLocaleString('fa-IR')} تومان`}
                  </span>
                </div>
                {subscription.coupon_code && (
                  <div className="erp-info-item">
                    <span className="erp-item-label">کد تخفیف اعمال‌شده:</span>
                    <span className="erp-item-val erp-coupon-applied">{subscription.coupon_code}</span>
                  </div>
                )}
                <div className="erp-info-item">
                  <span className="erp-item-label">تاریخ خرید و فعال‌سازی:</span>
                  <span className="erp-item-val">{formatDate(subscription.starts_at)}</span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-item-label">تاریخ پایان اشتراک:</span>
                  <span className="erp-item-val">{formatDate(subscription.expires_at)}</span>
                </div>
              </div>
            </div>

            {/* Cloud Infrastructure & System Status */}
            <div className="erp-sub-info-card">
              <div className="erp-info-card-header">
                <Server size={18} className="erp-card-icon" />
                <h4>مشخصات سرور و زیرساخت ابری</h4>
              </div>
              <div className="erp-info-list">
                <div className="erp-info-item">
                  <span className="erp-item-label">ظرفیت مجاز کاربران:</span>
                  <span className="erp-item-val font-bold">
                    <Users size={14} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }} />
                    {Number(subscription.user_count || 5).toLocaleString('fa-IR')} کاربر همزمان
                  </span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-item-label">وضعیت سرویس:</span>
                  <span className="erp-item-val erp-val-online">
                    <span className="erp-pulse-dot" />
                    {instance.status === 'online' ? 'آنلاین و پایدار' : 'متوقف / در انتظار تمدید'}
                  </span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-item-label">دیتابیس اختصاصی:</span>
                  <span className="erp-item-val">{instance.database}</span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-item-label">پروتکل امنیتی:</span>
                  <span className="erp-item-val">
                    <ShieldCheck size={14} color="#16a34a" style={{ display: 'inline', marginLeft: 4 }} />
                    رمزنگاری ۲۵۶ بیتی SSL/TLS
                  </span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-item-label">پشتیبان‌گیری (Backup):</span>
                  <span className="erp-item-val">{instance.backup_status}</span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-item-label">موقعیت دیتاسنتر:</span>
                  <span className="erp-item-val">{instance.datacenter}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active ERP Modules Section */}
          <div className="erp-sub-modules-section">
            <div className="erp-modules-section-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#2563eb" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  ماژول‌های فعال در این اشتراک ({modules.length || moduleNames.length})
                </h4>
              </div>
              <span className="erp-modules-count-badge">
                {modules.length || moduleNames.length} ماژول نصب و فعال‌شده
              </span>
            </div>

            {modules.length > 0 ? (
              <div className="erp-sub-modules-grid">
                {modules.map((m, idx) => (
                  <div key={m.id || idx} className="erp-sub-module-badge-card">
                    <div className="erp-sub-mod-top">
                      <div className="erp-sub-mod-icon-wrap">
                        <CheckCircle2 size={16} color="#2563eb" />
                      </div>
                      <span className="erp-sub-mod-name">{m.title}</span>
                    </div>
                    <div className="erp-sub-mod-meta">
                      <span className="erp-sub-mod-active-tag">فعال در پنل</span>
                      {m.price > 0 && (
                        <span className="erp-sub-mod-price">{Number(m.price).toLocaleString('fa-IR')} ت/ماه</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : moduleNames.length > 0 ? (
              <div className="erp-sub-modules-grid">
                {moduleNames.map((name, idx) => (
                  <div key={idx} className="erp-sub-module-badge-card">
                    <div className="erp-sub-mod-top">
                      <div className="erp-sub-mod-icon-wrap">
                        <CheckCircle2 size={16} color="#2563eb" />
                      </div>
                      <span className="erp-sub-mod-name">{name}</span>
                    </div>
                    <div className="erp-sub-mod-meta">
                      <span className="erp-sub-mod-active-tag">فعال در پنل</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="erp-empty-modules-notice">
                <AlertCircle size={18} />
                <span>تمامی دسترسی‌های پایه و ماژول‌های پیش‌فرض در این پکیج فعال است.</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="erp-sub-modal-footer">
          <button type="button" className="erp-btn-modal-cancel" onClick={onClose}>
            بستن پنجره
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="erp-btn-modal-primary"
              onClick={() => {
                onClose();
                onOpenWorkspace(subscription);
              }}
            >
              <LogIn size={18} />
              <span>ورود به پنل شخصی ERP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
