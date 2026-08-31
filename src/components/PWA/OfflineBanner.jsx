import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { onNetworkStatusChange, isOnline } from '../../services/pwa';

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setOnline(isOnline());

    const unsubscribe = onNetworkStatusChange((status) => {
      setOnline(status);
      if (status) {
        setJustReconnected(true);
        const timer = setTimeout(() => {
          setJustReconnected(false);
        }, 4000);
        return () => clearTimeout(timer);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleManualCheck = () => {
    setIsChecking(true);
    fetch('/api/health?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => {
        if (res.ok) {
          setOnline(true);
          setJustReconnected(true);
          setTimeout(() => setJustReconnected(false), 4000);
        }
      })
      .catch(() => {
        setOnline(false);
      })
      .finally(() => {
        setTimeout(() => setIsChecking(false), 600);
      });
  };

  if (online && !justReconnected) {
    return null;
  }

  if (justReconnected) {
    return (
      <div
        id="pwa-online-toast"
        className="fixed bottom-5 left-5 right-5 sm:right-auto sm:left-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg border border-emerald-500/30 text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
      >
        <Wifi className="w-5 h-5 shrink-0 text-emerald-200" />
        <span>اتصال اینترنت شما مجدداً برقرار گردید.</span>
      </div>
    );
  }

  return (
    <div
      id="pwa-offline-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900/95 text-slate-100 p-4 rounded-2xl shadow-2xl border border-amber-500/40 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
          <WifiOff className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            حالت آفلاین (Offline Mode)
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            ارتباط شما با اینترنت قطع شده است. قابلیت‌های کش‌شده PWA فعال بوده و می‌توانید به بخش‌های ذخیره‌شده دسترسی داشته باشید.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              id="pwa-retry-btn"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'بررسی مجدد...' : 'بررسی اتصال'}</span>
            </button>
            <button
              id="pwa-reload-btn"
              onClick={() => window.location.reload()}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              تازه‌سازی صفحه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
