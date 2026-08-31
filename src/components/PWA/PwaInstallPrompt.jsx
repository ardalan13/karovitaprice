import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Bell, Wifi } from 'lucide-react';
import { onInstallPromptChange, promptPwaInstall } from '../../services/pwa';

export default function PwaInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check local storage dismissal
    const wasDismissed = sessionStorage.getItem('karovita_pwa_prompt_dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }

    const unsubscribe = onInstallPromptChange((available) => {
      setCanInstall(available);
    });

    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const result = await promptPwaInstall();
      if (result.outcome === 'accepted') {
        setCanInstall(false);
      }
    } catch (err) {
      console.warn('[PWA Install Error]', err);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('karovita_pwa_prompt_dismissed', 'true');
  };

  if (!canInstall || dismissed) {
    return null;
  }

  return (
    <div
      id="pwa-install-prompt-banner"
      className="fixed bottom-5 right-5 left-5 sm:right-6 sm:left-auto sm:max-w-md z-40 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-sky-500/30 backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <button
        id="pwa-close-prompt-btn"
        onClick={handleDismiss}
        aria-label="بستن اعلان نصب"
        className="absolute top-3 left-3 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3.5 pr-1">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 p-2 shrink-0 flex items-center justify-center shadow-md shadow-sky-500/20 border border-sky-400/30">
          <img src="/karovita-logo.svg" alt="کارویتا" className="w-full h-full object-contain filter drop-shadow brightness-0 invert" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm text-white">نصب اپلیکیشن کارویتا</h3>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/20">
              <Sparkles className="w-2.5 h-2.5" /> PWA
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            برای دسترسی سریع‌تر، عملکرد آفلاین و دریافت اعلان‌های لحظه‌ای، نسخه وب‌اپ را روی دستگاه خود نصب کنید.
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-sky-400" /> آفلاین
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Bell className="w-3 h-3 text-sky-400" /> اعلان‌ها
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-sky-400" /> تمام‌صفحه
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <button
              id="pwa-confirm-install-btn"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalling ? 'در حال نصب...' : 'نصب روی دستگاه'}</span>
            </button>
            <button
              id="pwa-dismiss-btn"
              onClick={handleDismiss}
              className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              بعداً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
