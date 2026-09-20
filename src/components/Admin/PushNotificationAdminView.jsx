import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Send,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Radio,
  Users,
  ShieldCheck,
  Headphones,
  Sparkles,
  ExternalLink,
  Laptop,
  Check,
  X,
  Info,
  Layers,
  Zap,
  Globe,
  HardDrive,
  CheckCheck,
  Search,
  MessageSquare,
  Power,
  PowerOff
} from 'lucide-react';
import {
  getPushNotificationStatus,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestPushNotification,
  unregisterAllServiceWorkers,
  registerServiceWorker,
  getPwaStatus
} from '../../services/pwa';
import { getAuthToken } from '../../services/authStorage';

export default function PushNotificationAdminView({ token, currentUser }) {
  const getActiveToken = () => token || getAuthToken() || localStorage.getItem('token');
  const [pwaEnabled, setPwaEnabled] = useState(true);
  const [isTogglingPwa, setIsTogglingPwa] = useState(false);
  const [localPushStatus, setLocalPushStatus] = useState({
    supported: true,
    permission: 'default',
    isSubscribed: false,
  });
  const [subscribersData, setSubscribersData] = useState({
    total: 0,
    stats: { admin_count: 0, support_count: 0, user_count: 0, guest_count: 0 },
    subscribers: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingSub, setIsTogglingSub] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchSubscriber, setSearchSubscriber] = useState('');

  // Broadcast Form State
  const [broadcastForm, setBroadcastForm] = useState({
    title: 'اطلاعیه جدید سامانه کارویتا',
    body: 'نسخه جدید سامانه یکپارچه ERP با امکانات و ماژول‌های ارتقایافته فعال گردید.',
    targetRole: 'all',
    url: '/',
  });

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const activeToken = getActiveToken();
      const res = await fetch(`/api/admin/push/subscribers?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          Authorization: activeToken ? `Bearer ${activeToken}` : '',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribersData(data);
        if (typeof data.enabled === 'boolean') {
          setPwaEnabled(data.enabled);
        } else if (data.pwaSettings?.enabled !== undefined) {
          setPwaEnabled(data.pwaSettings.enabled);
        }
      }
    } catch (err) {
      console.error('[Push Admin] Error fetching subscribers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePwaMaster = async () => {
    const willEnable = !pwaEnabled;
    if (!willEnable) {
      const confirmed = window.confirm(
        'آیا از غیرفعال‌سازی سراسری سرویس PWA، سرویس‌ورکر و اعلان‌های وب (Web Push) اطمینان دارید؟\n\n' +
        'با این اقدام، سرویس‌ورکر، دریافت نوتیفیکیشن‌ها و ارسال پیام‌های همگانی برای تمامی کاربران و مدیران متوقف خواهد شد.'
      );
      if (!confirmed) return;
    }

    setIsTogglingPwa(true);
    try {
      const activeToken = getActiveToken();
      const res = await fetch('/api/admin/pwa/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : '',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify({ enabled: willEnable }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'خطا در تغییر وضعیت سرویس PWA');
      }

      const nextEnabled = typeof data.enabled === 'boolean' ? data.enabled : willEnable;
      setPwaEnabled(nextEnabled);

      showToast(
        nextEnabled
          ? 'سرویس PWA، سرویس‌ورکر و اعلان‌های وب با موفقیت فعال گردید.'
          : 'سرویس PWA، سرویس‌ورکر و اعلان‌های وب با موفقیت غیرفعال شد.'
      );

      if (!nextEnabled) {
        await unregisterAllServiceWorkers();
      } else {
        await registerServiceWorker();
      }
      await checkLocalStatus();
      await fetchSubscribers();
    } catch (err) {
      showToast(err.message || 'خطا در تغییر وضعیت سرویس PWA', 'error');
    } finally {
      setIsTogglingPwa(false);
    }
  };

  const checkLocalStatus = async () => {
    const status = await getPushNotificationStatus();
    setLocalPushStatus(status);
  };

  useEffect(() => {
    getPwaStatus().then((status) => {
      if (status && typeof status.enabled === 'boolean') {
        setPwaEnabled(status.enabled);
      }
    });
    checkLocalStatus();
    fetchSubscribers();
  }, [token]);

  const handleToggleSubscription = async () => {
    setIsTogglingSub(true);
    try {
      const activeToken = getActiveToken();
      if (localPushStatus.isSubscribed) {
        await unsubscribeFromPushNotifications(activeToken);
        showToast('اشتراک اعلان این دستگاه با موفقیت لغو شد.');
      } else {
        await subscribeToPushNotifications(activeToken);
        showToast('اشتراک اعلان با موفقیت برای این دستگاه و مرورگر فعال شد! 🔔');
      }
      await checkLocalStatus();
      await fetchSubscribers();
    } catch (err) {
      showToast(err.message || 'خطا در تغییر وضعیت اشتراک', 'error');
    } finally {
      setIsTogglingSub(false);
    }
  };

  const handleSendTestPush = async () => {
    setIsTesting(true);
    try {
      const activeToken = getActiveToken();
      const res = await sendTestPushNotification(
        activeToken,
        'کارویتا | تست موفق اعلان PWA',
        'اتصال وب‌پوش و سرویس‌ورکر کارویتا در این دستگاه کاملاً پایدار، امن و فعال است! ✨'
      );
      showToast(res.message || 'اعلان آزمایشی به دستگاه ارسال گردید.');
    } catch (err) {
      showToast(err.message || 'خطا در ارسال اعلان آزمایشی', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) {
      showToast('لطفاً عنوان و متن اعلان را وارد نمایید.', 'error');
      return;
    }

    setIsBroadcasting(true);
    try {
      const activeToken = getActiveToken();
      const res = await fetch('/api/admin/push/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : '',
        },
        body: JSON.stringify(broadcastForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'خطا در ارسال اعلان همگانی');
      }

      showToast(data.message || 'اعلان همگانی با موفقیت ارسال شد.');
    } catch (err) {
      showToast(err.message || 'خطا در ارسال اعلان همگانی', 'error');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const setPresetBroadcast = (title, body, url = '/') => {
    setBroadcastForm(prev => ({
      ...prev,
      title,
      body,
      url,
    }));
  };

  const filteredSubscribers = (subscribersData.subscribers || []).filter(sub => {
    const q = searchSubscriber.trim().toLowerCase();
    if (!q) return true;
    return (
      (sub.user_mobile && sub.user_mobile.includes(q)) ||
      (sub.user_id && String(sub.user_id).includes(q)) ||
      (sub.user_agent && sub.user_agent.toLowerCase().includes(q)) ||
      (sub.role && sub.role.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} id="push-notification-admin-view">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            border: toastMessage.type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac',
            background: toastMessage.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: toastMessage.type === 'error' ? '#991b1b' : '#166534',
            fontSize: '13.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle size={18} color="#dc2626" />
          ) : (
            <CheckCircle2 size={18} color="#16a34a" />
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Header Banner & Main Controls */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        padding: '24px',
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
              background: '#eff6ff',
              color: '#0870d1',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Radio size={26} className="animate-pulse" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  مدیریت PWA، سرویس‌ورکر و اعلان‌های وب (Web Push)
                </h1>
                <span style={{
                  background: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  PWA Engine v2.5.0
                </span>
                <span style={{
                  background: pwaEnabled ? '#ecfdf5' : '#fef2f2',
                  color: pwaEnabled ? '#059669' : '#dc2626',
                  border: pwaEnabled ? '1px solid #a7f3d0' : '1px solid #fecaca',
                  padding: '2px 9px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: pwaEnabled ? '#10b981' : '#ef4444',
                    display: 'inline-block',
                    boxShadow: pwaEnabled ? '0 0 6px #10b981' : 'none'
                  }} />
                  {pwaEnabled ? 'سرویس آنلاین و فعال' : 'سرویس کاملاً غیرفعال'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                مرکز کنترل اپلیکیشن وب پیشرونده، دستگاه‌های مشترک، ارسال اعلان‌های همگانی بلادرنگ و پایش اتصال سرویس‌ورکر
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Master Service Toggle Button */}
            <button
              type="button"
              id="toggle-pwa-master-btn"
              onClick={handleTogglePwaMaster}
              disabled={isTogglingPwa}
              title={pwaEnabled ? 'کلیک جهت غیرفعال‌سازی کامل سرویس PWA و اعلان‌ها در سراسر سامانه' : 'کلیک جهت فعال‌سازی سراسری سرویس PWA و اعلان‌ها'}
              style={{
                background: pwaEnabled
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '9px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: isTogglingPwa ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: pwaEnabled
                  ? '0 3px 12px rgba(16, 185, 129, 0.35)'
                  : '0 3px 12px rgba(239, 68, 68, 0.35)',
                transition: 'all 0.15s'
              }}
            >
              {pwaEnabled ? <Power size={16} /> : <PowerOff size={16} />}
              <span>
                {isTogglingPwa
                  ? 'در حال اعمال تغییر...'
                  : pwaEnabled
                  ? 'کل سرویس فعال است (کلیک جهت غیرفعال‌سازی)'
                  : 'کل سرویس غیرفعال است (کلیک جهت فعال‌سازی)'}
              </span>
            </button>

            <button
              type="button"
              id="refresh-subscribers-btn"
              onClick={() => {
                checkLocalStatus();
                fetchSubscribers();
              }}
              disabled={isLoading}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '9px 14px',
                borderRadius: '9px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s'
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>تازه‌سازی داده‌ها</span>
            </button>

            <button
              type="button"
              id="toggle-local-push-btn"
              onClick={handleToggleSubscription}
              disabled={isTogglingSub || !pwaEnabled}
              title={!pwaEnabled ? 'سرویس اعلان‌ها به صورت کلی غیرفعال است.' : ''}
              style={{
                background: !pwaEnabled
                  ? '#e2e8f0'
                  : localPushStatus.isSubscribed
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #0870d1 0%, #0284c7 100%)',
                color: !pwaEnabled ? '#94a3b8' : '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '9px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: isTogglingSub || !pwaEnabled ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: !pwaEnabled
                  ? 'none'
                  : localPushStatus.isSubscribed
                  ? '0 3px 10px rgba(16, 185, 129, 0.3)'
                  : '0 3px 10px rgba(8, 112, 209, 0.3)',
                transition: 'all 0.15s'
              }}
            >
              {localPushStatus.isSubscribed ? <CheckCheck size={16} /> : <Bell size={16} />}
              <span>
                {isTogglingSub
                  ? 'در حال پردازش...'
                  : !pwaEnabled
                  ? 'اعلان مرورگر (سرویس غیرفعال)'
                  : localPushStatus.isSubscribed
                  ? 'اعلان این مرورگر فعال است (کلیک جهت لغو)'
                  : 'فعال‌سازی دریافت اعلان در این مرورگر'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Warning Banner when Service is Globally Disabled */}
      {!pwaEnabled && (
        <div style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 16px rgba(225, 29, 72, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#ffe4e6',
              color: '#e11d48',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#9f1239' }}>
                سرویس PWA، سرویس‌ورکر و ارسال اعلان‌های وب (Web Push) در حال حاضر در سراسر سیستم متوقف و غیرفعال است.
              </div>
              <div style={{ fontSize: '12px', color: '#be123c', marginTop: '3px' }}>
                تمامی عملکردهای نوتیفیکیشن، ارسال همگانی پیام‌ها و همگام‌سازی‌های محلی کلاینت‌ها موقتاً مسدود شده‌اند.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTogglePwaMaster}
            disabled={isTogglingPwa}
            style={{
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: isTogglingPwa ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(225, 29, 72, 0.35)'
            }}
          >
            <Power size={15} />
            <span>فعال‌سازی مجدد سرویس</span>
          </button>
        </div>
      )}

      {/* 2. Key Metric Cards (4 Bento Stats Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Devices */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>کل دستگاه‌های مشترک</span>
            <div style={{ background: '#eff6ff', color: '#0870d1', padding: '6px', borderRadius: '8px' }}>
              <Smartphone size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>
            {Number(subscribersData.total || 0).toLocaleString('fa-IR')}
          </div>
          <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
            تعداد کل اندپوینت‌های معتبر ثبت‌شده
          </div>
        </div>

        {/* Admins Devices */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>دستگاه‌های مدیران ارشد</span>
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#dc2626' }}>
            {Number(subscribersData.stats?.admin_count || 0).toLocaleString('fa-IR')}
          </div>
          <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
            دریافت فوری آلارم‌ها، خطاها و لاگ‌های امنیتی
          </div>
        </div>

        {/* Support Devices */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>دستگاه‌های پشتیبانی</span>
            <div style={{ background: '#fff7ed', color: '#ea580c', padding: '6px', borderRadius: '8px' }}>
              <Headphones size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#ea580c' }}>
            {Number(subscribersData.stats?.support_count || 0).toLocaleString('fa-IR')}
          </div>
          <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
            اطلاع‌رسانی بلادرنگ تیکت‌ها و پیام‌های کاربران
          </div>
        </div>

        {/* Users & Guests */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>کاربران و بازدیدکنندگان</span>
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '6px', borderRadius: '8px' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#16a34a' }}>
            {Number((subscribersData.stats?.user_count || 0) + (subscribersData.stats?.guest_count || 0)).toLocaleString('fa-IR')}
          </div>
          <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
            مشتریان فعال دریافت‌کننده اطلاعیه‌ها و فاکتورها
          </div>
        </div>
      </div>

      {/* 3. Main Split Grid (Broadcast & Table on Left, Diagnostics & Test on Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.9fr) minmax(320px, 1.1fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Broadcast Form & Subscribed Devices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Send Broadcast Push Box */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            overflow: 'hidden'
          }}>
            {/* Box Header */}
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#eff6ff', color: '#0870d1', padding: '6px', borderRadius: '8px' }}>
                  <Send size={18} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    ارسال اعلان همگانی (Web Push Broadcast)
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    ارسال آنی پیام اعلان به دستگاه‌های کاربران، مدیران و پرسنل از طریق Service Worker
                  </p>
                </div>
              </div>

              {/* Quick Template Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>قالب‌های سریع:</span>
                <button
                  type="button"
                  onClick={() => setPresetBroadcast('ارتقای سامانه ERP', 'ماژول‌های جدید به سامانه اضافه شدند. لطفاً وارد پنل شوید.', '/')}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  ارتقای سیستم
                </button>
                <button
                  type="button"
                  onClick={() => setPresetBroadcast('تخفیف تمدید اشتراک', 'تخفیف ویژه تمدید اشتراک برای شرکت شما فعال شد.', '/user/payments')}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  تخفیف
                </button>
              </div>
            </div>

            {/* Broadcast Form Body */}
            <form onSubmit={handleBroadcast} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                {/* Title Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    عنوان اعلان (Title):
                  </label>
                  <input
                    type="text"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    required
                    placeholder="مثال: بروزرسانی مهم در تعرفه‌های ERP"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    گروه دریافت‌کنندگان (Audience):
                  </label>
                  <select
                    value={broadcastForm.targetRole}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="all">همه دستگاه‌ها (عمومی)</option>
                    <option value="user">فقط کاربران ثبت‌نامی</option>
                    <option value="admin">فقط مدیران ارشد (Admins)</option>
                    <option value="support">فقط کارشناسان پشتیبانی (Support)</option>
                  </select>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  متن پیام اعلان (Body):
                </label>
                <textarea
                  rows={3}
                  value={broadcastForm.body}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                  required
                  placeholder="متن پیام نوتیفیکیشن که روی دسکتاپ یا گوشی کاربر نمایش داده می‌شود..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'flex-end' }}>
                {/* Target URL */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    لینک مقصد هنگام کلیک (Target URL):
                  </label>
                  <input
                    type="text"
                    value={broadcastForm.url}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, url: e.target.value })}
                    placeholder="/admin یا /user/payments یا /"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      direction: 'ltr',
                      textAlign: 'left',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Submit Broadcast Button */}
                <div>
                  <button
                    id="submit-broadcast-btn"
                    type="submit"
                    disabled={isBroadcasting || subscribersData.total === 0 || !pwaEnabled}
                    style={{
                      width: '100%',
                      padding: '11px 20px',
                      background: (!pwaEnabled || subscribersData.total === 0)
                        ? '#cbd5e1'
                        : 'linear-gradient(135deg, #0870d1 0%, #0284c7 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: isBroadcasting || subscribersData.total === 0 || !pwaEnabled ? 'not-allowed' : 'pointer',
                      opacity: isBroadcasting ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: (!pwaEnabled || subscribersData.total === 0) ? 'none' : '0 3px 10px rgba(8, 112, 209, 0.25)',
                      height: '42px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Send size={16} className={isBroadcasting ? 'animate-bounce' : ''} />
                    <span>
                      {isBroadcasting
                        ? 'در حال ارسال به تمام کلاینت‌ها...'
                        : !pwaEnabled
                        ? 'ارسال همگانی (سرویس غیرفعال)'
                        : 'ارسال فوری اعلان همگانی'}
                    </span>
                  </button>
                </div>
              </div>

              {!pwaEnabled && (
                <div style={{
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#9f1239',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={15} color="#e11d48" />
                  <span>کل سرویس PWA و اعلان‌های وب غیرفعال است. جهت ارسال پیام، ابتدا سرویس را از بالای صفحه فعال نمایید.</span>
                </div>
              )}

              {pwaEnabled && subscribersData.total === 0 && (
                <div style={{
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  color: '#92400e',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Info size={14} />
                  <span>هنوز هیچ دستگاهی اشتراک اعلان را فعال نکرده است. ابتدا با دکمه بالای صفحه اشتراک همین مرورگر را فعال نمایید.</span>
                </div>
              )}
            </form>
          </div>

          {/* Subscribed Devices Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Laptop size={18} color="#0870d1" />
                <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                  فهرست دستگاه‌ها و سابسکرایبرهای متصل به وب‌پوش
                </h3>
                <span style={{
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {subscribersData.subscribers.length} دستگاه فعال
                </span>
              </div>

              {/* Search in subscribers */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="جستجو در دستگاه‌ها..."
                  value={searchSubscriber}
                  onChange={(e) => setSearchSubscriber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 30px 6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px' }}>شناسه</th>
                    <th style={{ padding: '12px 16px' }}>کاربر / شماره موبایل</th>
                    <th style={{ padding: '12px 16px' }}>نقش کاربری</th>
                    <th style={{ padding: '12px 16px' }}>مشخصات مرورگر / سیستم‌عامل</th>
                    <th style={{ padding: '12px 16px' }}>تاریخ و زمان اتصال</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                        {searchSubscriber ? 'هیچ دستگاهی با این عبارت یافت نشد.' : 'هنوز هیچ دستگاهی ثبت نشده است.'}
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                          #{sub.id}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>
                            {sub.user_mobile || (sub.user_id ? `کاربر #${sub.user_id}` : 'بازدیدکننده / مهمان')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: sub.role === 'admin' ? '#fee2e2' : sub.role === 'support' ? '#ffedd5' : '#f0fdf4',
                            color: sub.role === 'admin' ? '#991b1b' : sub.role === 'support' ? '#9a3412' : '#166534',
                            border: `1px solid ${sub.role === 'admin' ? '#fecaca' : sub.role === 'support' ? '#fed7aa' : '#bbf7d0'}`
                          }}>
                            {sub.role === 'admin' ? 'مدیر سیستم' : sub.role === 'support' ? 'کارشناس پشتیبانی' : 'کاربر عادی'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: '280px', fontSize: '11.5px', color: '#64748b', direction: 'ltr', textAlign: 'right', fontFamily: 'monospace' }} title={sub.user_agent}>
                          {sub.user_agent ? (sub.user_agent.length > 40 ? sub.user_agent.substring(0, 40) + '...' : sub.user_agent) : 'Web Client'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '11.5px', color: '#64748b' }}>
                          {new Date(sub.created_at).toLocaleDateString('fa-IR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Instant Test & PWA Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Live Push Test Card */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
            borderRadius: '16px',
            border: '1px solid #fef3c7',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(217, 119, 6, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#fef3c7', color: '#b45309', padding: '8px', borderRadius: '10px' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#92400e' }}>
                  تست آنی اعلان در این مرورگر
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#b45309' }}>
                  ارسال نوتیفیکیشن تست از طریق پروتکل رسمی VAPID
                </p>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: '#78350f', lineHeight: 1.6, margin: 0 }}>
              با فشردن این دکمه، سرور کارویتا بلافاصله یک اعلان واقعی سیستمی به سرویس‌ورکر این مرورگر ارسال می‌کند تا از صحت عملکرد Web Push اطمینان حاصل کنید.
            </p>

            <button
              id="test-push-notification-btn"
              type="button"
              onClick={handleSendTestPush}
              disabled={isTesting || !localPushStatus.isSubscribed || !pwaEnabled}
              style={{
                background: (localPushStatus.isSubscribed && pwaEnabled)
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : '#e2e8f0',
                color: (localPushStatus.isSubscribed && pwaEnabled) ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '11px 16px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: isTesting || !localPushStatus.isSubscribed || !pwaEnabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: (localPushStatus.isSubscribed && pwaEnabled) ? '0 3px 10px rgba(217, 119, 6, 0.25)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <BellRing size={16} className={isTesting ? 'animate-bounce' : ''} />
              <span>
                {isTesting
                  ? 'در حال ارسال پیام تست...'
                  : !pwaEnabled
                  ? 'ارسال اعلان تست (سرویس غیرفعال)'
                  : 'ارسال اعلان تست به این دستگاه'}
              </span>
            </button>

            {!pwaEnabled ? (
              <div style={{ fontSize: '11.5px', color: '#b91c1c', textAlign: 'center', background: '#fef2f2', padding: '6px', borderRadius: '6px' }}>
                * به دلیل غیرفعال بودن سرویس سراسری PWA، ارسال اعلان آزمایشی مقدور نیست.
              </div>
            ) : !localPushStatus.isSubscribed ? (
              <div style={{ fontSize: '11.5px', color: '#b45309', textAlign: 'center', background: '#fffbeb', padding: '6px', borderRadius: '6px' }}>
                * ابتدا با دکمه «فعال‌سازی دریافت اعلان در این مرورگر» در بالای صفحه، مجوز را فعال کنید.
              </div>
            ) : null}
          </div>

          {/* Technical Diagnostics & PWA Status */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="#0870d1" />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  وضعیت سلامت فنی PWA و کش
                </h3>
              </div>
              <span style={{
                fontSize: '11px',
                color: pwaEnabled ? '#16a34a' : '#dc2626',
                fontWeight: 700,
                background: pwaEnabled ? '#f0fdf4' : '#fef2f2',
                border: pwaEnabled ? '1px solid #bbf7d0' : '1px solid #fecaca',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: pwaEnabled ? '#16a34a' : '#dc2626'
                }} />
                {pwaEnabled ? 'سیستم آنلاین و فعال' : 'سرویس غیرفعال (متوقف)'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
              {/* Service Worker */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>سرویس‌ورکر (Service Worker):</span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: pwaEnabled ? '#16a34a' : '#dc2626',
                  fontWeight: 700
                }}>
                  {pwaEnabled ? <Check size={14} /> : <X size={14} />}
                  {pwaEnabled ? 'فعال در دامنه' : 'غیرفعال در سامانه'}
                </span>
              </div>

              {/* Permission */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>مجوز اعلان مرورگر (Permission):</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  background: localPushStatus.permission === 'granted' ? '#f0fdf4' : localPushStatus.permission === 'denied' ? '#fef2f2' : '#fffbeb',
                  color: localPushStatus.permission === 'granted' ? '#166534' : localPushStatus.permission === 'denied' ? '#991b1b' : '#92400e',
                }}>
                  {localPushStatus.permission === 'granted'
                    ? 'مجاز (Granted)'
                    : localPushStatus.permission === 'denied'
                    ? 'مسدود (Denied)'
                    : 'در انتظار (Default)'}
                </span>
              </div>

              {/* VAPID Protocol */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>پروتکل امنیتی VAPID:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 700 }}>
                  <Check size={14} /> استاندارد RFC-8292
                </span>
              </div>

              {/* Manifest.json */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>مانیفست PWA (Manifest):</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0870d1', fontWeight: 700 }}>
                  <Check size={14} /> Standalone RTL
                </span>
              </div>

              {/* Offline Caching */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>کشینگ و دسترسی آفلاین:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 700 }}>
                  <Check size={14} /> Stale-While-Revalidate
                </span>
              </div>
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#94a3b8' }}>
              <span>نسخه کش استاتیک:</span>
              <span style={{ fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>karovita-static-v2.5.0</span>
            </div>
          </div>

          {/* Educational Info Card */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <Info size={16} color="#0870d1" />
              <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700 }}>قابلیت‌های سیستم PWA کارویتا</h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
              با قابلیت Progressive Web App (PWA)، کاربران و مدیران می‌توانند سامانه کارویتا را مستقیماً مانند یک اپلیکیشن بومی روی گوشی یا دسکتاپ خود نصب کنند، حتی در زمان بسته بودن مرورگر اعلان‌های مهم را دریافت نمایند و در زمان قطعی اینترنت نیز به بخش‌های ذخیره‌شده دسترسی داشته باشند.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
