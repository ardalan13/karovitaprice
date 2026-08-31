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
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Laptop,
  Check,
  X
} from 'lucide-react';
import {
  getPushNotificationStatus,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestPushNotification
} from '../../services/pwa';

export default function PushNotificationAdminView({ token, currentUser }) {
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

  // Broadcast Form State
  const [broadcastForm, setBroadcastForm] = useState({
    title: 'اطلاعیه جدید کارویتا',
    body: 'سامانه یکپارچه ERP با امکانات و ماژول‌های جدید بروزرسانی شد.',
    targetRole: 'all',
    url: '/',
  });

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/push/subscribers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribersData(data);
      }
    } catch (err) {
      console.error('[Push Admin] Error fetching subscribers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLocalStatus = async () => {
    const status = await getPushNotificationStatus();
    setLocalPushStatus(status);
  };

  useEffect(() => {
    checkLocalStatus();
    fetchSubscribers();
  }, [token]);

  const handleToggleSubscription = async () => {
    setIsTogglingSub(true);
    try {
      if (localPushStatus.isSubscribed) {
        await unsubscribeFromPushNotifications(token);
        showToast('اشتراک اعلان این دستگاه غیرفعال شد.');
      } else {
        await subscribeToPushNotifications(token);
        showToast('اشتراک اعلان با موفقیت برای این دستگاه فعال شد!');
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
      const res = await sendTestPushNotification(
        token,
        'کارویتا | تست موفق اعلان PWA',
        'اتصال وب‌پوش و سرویس‌ورکر کارویتا در این دستگاه کاملاً پایدار و فعال است! ✨'
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
      const res = await fetch('/api/admin/push/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

  return (
    <div className="space-y-6" id="push-notification-admin-view">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-xl border text-sm font-medium flex items-center gap-2 transition-all animate-in fade-in slide-in-from-top-3 ${
            toastMessage.type === 'error'
              ? 'bg-rose-900/90 text-rose-100 border-rose-700/50'
              : 'bg-emerald-900/90 text-emerald-100 border-emerald-700/50'
          }`}
        >
          {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900/40 via-indigo-900/40 to-slate-900/60 rounded-2xl p-6 border border-sky-500/20 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-sky-500/20 border border-sky-400/30 rounded-2xl text-sky-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                مدیریت PWA و اعلان‌های وب (Web Push)
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-normal">
                  سرویس‌ورکر v2.5.0
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                مدیریت دستگاه‌های متصل، تست ارسال نوتیفیکیشن لحظه‌ای و اطلاع‌رسانی همگانی به کاربران و پرسنل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="refresh-subscribers-btn"
              onClick={() => {
                checkLocalStatus();
                fetchSubscribers();
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تازه‌سازی</span>
            </button>

            <button
              id="toggle-local-push-btn"
              onClick={handleToggleSubscription}
              disabled={isTogglingSub}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 ${
                localPushStatus.isSubscribed
                  ? 'bg-emerald-600/30 hover:bg-rose-600/30 text-emerald-300 hover:text-rose-300 border border-emerald-500/40 hover:border-rose-500/40'
                  : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>
                {isTogglingSub
                  ? 'در حال پردازش...'
                  : localPushStatus.isSubscribed
                  ? 'اعلان این مرورگر فعال است (کلیک جهت لغو)'
                  : 'فعال‌سازی اعلان در این دستگاه'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>کل دستگاه‌های مشترک</span>
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{subscribersData.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">تعداد اندپوینت‌های ثبت‌شده</div>
        </div>

        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>دستگاه‌های مدیران</span>
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300">{subscribersData.stats.admin_count}</div>
          <div className="text-[11px] text-indigo-400/70 mt-1">دریافت سریع تیکت‌ها و آلارم‌ها</div>
        </div>

        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>دستگاه‌های پشتیبانی</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">{subscribersData.stats.support_count}</div>
          <div className="text-[11px] text-emerald-400/70 mt-1">اطلاع‌رسانی پیام‌های کاربران</div>
        </div>

        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>کاربران و بازدیدکنندگان</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {subscribersData.stats.user_count + subscribersData.stats.guest_count}
          </div>
          <div className="text-[11px] text-amber-400/70 mt-1">مشتریان فعال سامانه</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Broadcast & Test Box */}
        <div className="lg:col-span-2 space-y-6">
          {/* Send Broadcast Box */}
          <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                ارسال اعلان همگانی (Push Broadcast)
              </h3>
              <span className="text-xs text-slate-400">تحویل فوری به سرویس‌ورکر کلاینت‌ها</span>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">عنوان اعلان (Title)</label>
                  <input
                    type="text"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    required
                    placeholder="مثال: بروزرسانی مهم در تعرفه‌های ERP"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">گروه دریافت‌کنندگان (Audience)</label>
                  <select
                    value={broadcastForm.targetRole}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="all">همه دستگاه‌ها (عمومی)</option>
                    <option value="user">فقط کاربران ثبت‌نامی</option>
                    <option value="admin">فقط مدیران ارشد (Admins)</option>
                    <option value="support">فقط کارشناسان پشتیبانی (Support)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">متن پیام اعلان (Body)</label>
                <textarea
                  rows={3}
                  value={broadcastForm.body}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                  required
                  placeholder="متن پیام نوتیفیکیشن که روی دستگاه کاربر نمایش داده می‌شود..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">لینک مقصد هنگام کلیک (Target URL)</label>
                  <input
                    type="text"
                    value={broadcastForm.url}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, url: e.target.value })}
                    placeholder="/admin یا /support یا /"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-left dir-ltr"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    id="submit-broadcast-btn"
                    type="submit"
                    disabled={isBroadcasting || subscribersData.total === 0}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                  >
                    <Send className={`w-4 h-4 ${isBroadcasting ? 'animate-bounce' : ''}`} />
                    <span>{isBroadcasting ? 'در حال ارسال به تمام دستگاه‌ها...' : 'ارسال اعلان همگانی'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Subscribed Devices Table */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Laptop className="w-4 h-4 text-sky-400" />
                فهرست دستگاه‌های متصل به وب‌پوش
              </h3>
              <span className="text-xs text-slate-400">{subscribersData.subscribers.length} مشترک فعال</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">شناسه</th>
                    <th className="py-3 px-4">کاربر / شماره</th>
                    <th className="py-3 px-4">نقش</th>
                    <th className="py-3 px-4">مشخصات مرورگر / دستگاه</th>
                    <th className="py-3 px-4">تاریخ ثبت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {subscribersData.subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        هنوز هیچ دستگاهی برای دریافت نوتیفیکیشن ثبت نشده است. با دکمه بالا می‌توانید این دستگاه را ثبت کنید.
                      </td>
                    </tr>
                  ) : (
                    subscribersData.subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">#{sub.id}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-white">
                            {sub.user_mobile || (sub.user_id ? `کاربر #${sub.user_id}` : 'بازدیدکننده مهمان')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              sub.role === 'admin'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : sub.role === 'support'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-700/40 text-slate-300 border-slate-600/30'
                            }`}
                          >
                            {sub.role === 'admin' ? 'مدیر ارشد' : sub.role === 'support' ? 'پشتیبان' : 'کاربر'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-400 font-mono" title={sub.user_agent}>
                          {sub.user_agent ? sub.user_agent.split(') ')[0] + ')' : 'Web Browser'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
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

        {/* Right Col: Diagnostics & Test */}
        <div className="space-y-6">
          {/* Quick Test Box */}
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              تست اعلان در مرورگر شما
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              با فشردن این دکمه، سرور بلافاصله یک اعلان واقعی از طریق پروتکل استاندارد VAPID به سرویس‌ورکر مرورگر ارسال می‌کند.
            </p>

            <button
              id="test-push-notification-btn"
              onClick={handleSendTestPush}
              disabled={isTesting || !localPushStatus.isSubscribed}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <BellRing className={`w-4 h-4 ${isTesting ? 'animate-bounce' : ''}`} />
              <span>{isTesting ? 'در حال ارسال تست...' : 'ارسال اعلان تست به این مرورگر'}</span>
            </button>

            {!localPushStatus.isSubscribed && (
              <p className="text-[11px] text-amber-400/80 mt-2 text-center">
                * ابتدا دکمه «فعال‌سازی اعلان در این دستگاه» را در بالای صفحه بزنید.
              </p>
            )}
          </div>

          {/* Diagnostics Card */}
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 space-y-3.5">
            <h3 className="font-bold text-white text-sm pb-2 border-b border-slate-800">
              وضعیت فنی PWA و کشینگ
            </h3>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">پشتیبانی از Service Worker:</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5" /> فعال
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">مجوز دسترسی مرورگر (Permission):</span>
              <span
                className={`font-semibold ${
                  localPushStatus.permission === 'granted'
                    ? 'text-emerald-400'
                    : localPushStatus.permission === 'denied'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {localPushStatus.permission === 'granted'
                  ? 'مجاز (Granted)'
                  : localPushStatus.permission === 'denied'
                  ? 'مسدود (Denied)'
                  : 'در انتظار (Default)'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">پیکربندی کلیدهای امنیتی VAPID:</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5" /> استاندارد RFC-8292
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">فایل مانیفست (Manifest.json):</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5" /> Standalone / RTL
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>نسخه کش استاتیک:</span>
                <span className="font-mono text-slate-300">karovita-static-v2.5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
