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
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        left: 'auto',
        maxWidth: '390px',
        width: 'calc(100vw - 48px)',
        zIndex: 99999,
        background: 'linear-gradient(135deg, #0b1329 0%, #172554 100%)',
        color: '#ffffff',
        padding: '16px 18px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 189, 248, 0.25)',
        direction: 'rtl',
        fontFamily: "'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif",
        boxSizing: 'border-box'
      }}
    >
      <button
        id="pwa-close-prompt-btn"
        onClick={handleDismiss}
        aria-label="بستن اعلان نصب"
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: 'none',
          color: '#94a3b8',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      >
        <X size={14} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingLeft: '24px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          background: '#0b172a'
        }}>
          <img
            src="/icon-192.svg"
            alt="کارویتا"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#f8fafc' }}>
              نصب اپلیکیشن کارویتا
            </h3>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              padding: '1px 6px',
              borderRadius: '20px',
              fontSize: '10px',
              fontWeight: 700,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.25)'
            }}>
              <Sparkles size={10} /> PWA
            </span>
          </div>

          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.6' }}>
            برای دسترسی سریع‌تر، عملکرد آفلاین و دریافت اعلان‌های لحظه‌ای، نسخه وب‌اپ را روی دستگاه خود نصب کنید.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            fontSize: '11px',
            color: '#94a3b8'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Wifi size={12} color="#38bdf8" /> آفلاین
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Bell size={12} color="#38bdf8" /> اعلان‌ها
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Smartphone size={12} color="#38bdf8" /> تمام‌صفحه
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <button
              id="pwa-confirm-install-btn"
              onClick={handleInstallClick}
              disabled={isInstalling}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.35)',
                transition: 'all 0.15s'
              }}
            >
              <Download size={14} />
              <span>{isInstalling ? 'در حال نصب...' : 'نصب روی دستگاه'}</span>
            </button>

            <button
              id="pwa-dismiss-btn"
              onClick={handleDismiss}
              style={{
                padding: '7px 12px',
                background: 'transparent',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              بعداً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
