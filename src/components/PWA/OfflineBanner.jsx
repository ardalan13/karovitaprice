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
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#059669',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '12px',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
          fontSize: '13px',
          fontWeight: 600,
          direction: 'rtl',
          fontFamily: "'Vazirmatn', sans-serif"
        }}
      >
        <Wifi size={18} color="#a7f3d0" />
        <span>اتصال اینترنت شما مجدداً برقرار گردید.</span>
      </div>
    );
  }

  return (
    <div
      id="pwa-offline-banner"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        zIndex: 99999,
        background: '#0f172a',
        color: '#f8fafc',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(245, 158, 11, 0.35)',
        direction: 'rtl',
        fontFamily: "'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif",
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          padding: '8px',
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          borderRadius: '10px',
          flexShrink: 0
        }}>
          <WifiOff size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#fcd34d' }}>
            حالت آفلاین (Offline Mode)
          </h4>
          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.6' }}>
            ارتباط شما با اینترنت قطع شده است. قابلیت‌های کش‌شده PWA فعال بوده و می‌توانید به بخش‌های ذخیره‌شده دسترسی داشته باشید.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <button
              id="pwa-retry-btn"
              onClick={handleManualCheck}
              disabled={isChecking}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#f59e0b',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={isChecking ? 'spin' : ''} />
              <span>{isChecking ? 'بررسی مجدد...' : 'بررسی اتصال'}</span>
            </button>
            <button
              id="pwa-reload-btn"
              onClick={() => window.location.reload()}
              style={{
                padding: '6px 10px',
                background: 'transparent',
                color: '#cbd5e1',
                border: 'none',
                fontSize: '11.5px',
                cursor: 'pointer'
              }}
            >
              تازه‌سازی صفحه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
