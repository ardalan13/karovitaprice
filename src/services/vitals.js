/**
 * Lightweight Client-Side Performance & Core Web Vitals Monitor
 * Uses standard browser Performance API & PerformanceObserver to track
 * LCP, CLS, FID/INP, FCP, TTFB, and periodically logs them to the local server file.
 */

let isMonitoring = false;
let flushIntervalTimer = null;
let initialTimeoutTimer = null;

// Metric buffers
const currentMetrics = {
  lcp: null,
  cls: 0,
  fid: null,
  inp: null,
  fcp: null,
  ttfb: null,
  domComplete: null,
  loadTime: null,
};

let hasNewData = false;

/**
 * Initializes Core Web Vitals observation via standard PerformanceObserver API
 */
export function initPerformanceMonitoring(options = {}) {
  if (isMonitoring || typeof window === 'undefined') return;
  const flushIntervalMs = options.intervalMs || 30000; // Default: every 30 seconds

  try {
    // 1. Observe FCP (First Contentful Paint)
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('paint')) {
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            currentMetrics.fcp = Math.round(entry.startTime);
            hasNewData = true;
          }
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });
    }

    // 2. Observe LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          currentMetrics.lcp = Math.round(lastEntry.startTime);
          hasNewData = true;
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    }

    // 3. Observe CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            currentMetrics.cls = Math.round(clsValue * 1000) / 1000;
            hasNewData = true;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    }

    // 4. Observe FID (First Input Delay)
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('first-input')) {
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          currentMetrics.fid = Math.round(entry.processingStart - entry.startTime);
          hasNewData = true;
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    }

    // 5. Observe INP / Long Interactions (Interaction to Next Paint)
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('event')) {
      let maxInteractionDuration = 0;
      try {
        const inpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.duration > maxInteractionDuration) {
              maxInteractionDuration = entry.duration;
              currentMetrics.inp = Math.round(maxInteractionDuration);
              hasNewData = true;
            }
          }
        });
        inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 });
      } catch {
        // 'event' observer with durationThreshold might not be supported on older engines
      }
    }

    // 6. Collect Navigation Timing (TTFB, DOM Complete, Load Time)
    const collectNavigationTiming = () => {
      if (typeof performance === 'undefined') return;
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries && navEntries.length > 0) {
        const nav = navEntries[0];
        if (nav.responseStart > 0) {
          currentMetrics.ttfb = Math.round(nav.responseStart - (nav.requestStart || 0));
        }
        if (nav.domComplete > 0) {
          currentMetrics.domComplete = Math.round(nav.domComplete);
        }
        if (nav.loadEventEnd > 0) {
          currentMetrics.loadTime = Math.round(nav.loadEventEnd);
        }
        hasNewData = true;
      } else if (performance.timing) {
        // Fallback for legacy timing
        const t = performance.timing;
        if (t.responseStart > 0 && t.requestStart > 0) {
          currentMetrics.ttfb = Math.max(0, t.responseStart - t.requestStart);
        }
        if (t.loadEventEnd > 0 && t.navigationStart > 0) {
          currentMetrics.loadTime = Math.max(0, t.loadEventEnd - t.navigationStart);
        }
        hasNewData = true;
      }
    };

    if (document.readyState === 'complete') {
      collectNavigationTiming();
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectNavigationTiming, 0);
      });
    }

    // Send initial snapshot after 4 seconds (giving time for initial paint / LCP / FCP)
    initialTimeoutTimer = setTimeout(() => {
      collectNavigationTiming();
      flushVitalsReport();
    }, 4000);

    // Setup periodic flush interval
    flushIntervalTimer = setInterval(() => {
      if (hasNewData) {
        flushVitalsReport();
      }
    }, flushIntervalMs);

    // Flush on page visibility change (when tab is hidden / navigated away)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && hasNewData) {
        flushVitalsReport();
      }
    });

    window.addEventListener('pagehide', () => {
      if (hasNewData) {
        flushVitalsReport();
      }
    });

    isMonitoring = true;
    console.log('⚡ [Karovita Vitals] Core Web Vitals performance monitoring initialized');
  } catch (err) {
    console.error('Failed to initialize performance observer:', err);
  }
}

/**
 * Gathers current device / network metadata
 */
function getSystemContext() {
  const context = {
    connection: {},
    memory: {},
  };

  if (typeof navigator !== 'undefined' && navigator.connection) {
    const conn = navigator.connection;
    context.connection = {
      effectiveType: conn.effectiveType,
      rtt: conn.rtt,
      downlink: conn.downlink,
      saveData: conn.saveData,
    };
  }

  if (typeof performance !== 'undefined' && performance.memory) {
    const mem = performance.memory;
    context.memory = {
      usedJSHeapSize: Math.round(mem.usedJSHeapSize / 1048576 * 100) / 100, // MB
      totalJSHeapSize: Math.round(mem.totalJSHeapSize / 1048576 * 100) / 100, // MB
      jsHeapSizeLimit: Math.round(mem.jsHeapSizeLimit / 1048576 * 100) / 100, // MB
    };
  }

  return context;
}

/**
 * Flushes collected metrics snapshot to backend local file storage
 */
export function flushVitalsReport() {
  if (typeof window === 'undefined') return;

  const context = getSystemContext();
  const payload = {
    url: window.location.pathname || '/',
    metrics: { ...currentMetrics },
    connection: context.connection,
    memory: context.memory,
  };

  try {
    const jsonStr = JSON.stringify(payload);
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      navigator.sendBeacon('/api/logs/vitals', blob);
      hasNewData = false;
    } else {
      fetch('/api/logs/vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: jsonStr,
        keepalive: true,
      }).then(() => {
        hasNewData = false;
      }).catch(() => {});
    }
  } catch {
    // Fail silently
  }
}

/**
 * Returns current in-memory metrics for debugging / UI inspection
 */
export function getCurrentMetrics() {
  return { ...currentMetrics };
}
