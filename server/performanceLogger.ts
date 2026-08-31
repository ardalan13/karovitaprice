import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import { getClientIp, getUserAgent } from './auditLogger';

export interface WebVitalsEntry {
  id: string;
  timestamp: string;
  url: string;
  metrics: {
    lcp?: number | null;   // Largest Contentful Paint (ms)
    cls?: number | null;   // Cumulative Layout Shift (score)
    fid?: number | null;   // First Input Delay (ms)
    inp?: number | null;   // Interaction to Next Paint (ms)
    fcp?: number | null;   // First Contentful Paint (ms)
    ttfb?: number | null;  // Time to First Byte (ms)
    domComplete?: number | null;
    loadTime?: number | null;
  };
  ratings?: {
    lcp?: 'good' | 'needs-improvement' | 'poor';
    cls?: 'good' | 'needs-improvement' | 'poor';
    fid?: 'good' | 'needs-improvement' | 'poor';
    inp?: 'good' | 'needs-improvement' | 'poor';
    fcp?: 'good' | 'needs-improvement' | 'poor';
    ttfb?: 'good' | 'needs-improvement' | 'poor';
  };
  connection?: {
    effectiveType?: string;
    rtt?: number;
    downlink?: number;
    saveData?: boolean;
  };
  memory?: {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };
  user_id?: number | null;
  user_mobile?: string | null;
  ip_address?: string;
  user_agent?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const VITALS_LOGS_FILE = path.join(DATA_DIR, 'vitals_logs.json');
const FORMATTED_VITALS_FILE = path.join(DATA_DIR, 'app_vitals.log');
const MAX_LOG_ENTRIES = 500;

class PerformanceLogger {
  private logs: WebVitalsEntry[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.isInitialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(VITALS_LOGS_FILE)) {
        const raw = fs.readFileSync(VITALS_LOGS_FILE, 'utf-8');
        if (raw && raw.trim()) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.logs = parsed;
          }
        }
      } else {
        this.saveToFile();
      }

      this.isInitialized = true;
      console.log(`[Performance Logger] Initialized successfully. Loaded ${this.logs.length} vitals entries from data/vitals_logs.json`);
    } catch (err) {
      console.error('[Performance Logger] Initialization error:', err);
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(VITALS_LOGS_FILE, JSON.stringify(this.logs, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Performance Logger] Error saving vitals to file:', err);
    }
  }

  private appendToTextLog(entry: WebVitalsEntry) {
    try {
      const metricsSummary = Object.entries(entry.metrics)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k.toUpperCase()}: ${typeof v === 'number' ? (k === 'cls' ? v.toFixed(3) : Math.round(v) + 'ms') : v}`)
        .join(' | ');

      const line = `[${entry.timestamp}] [VITALS] URL: ${entry.url || '/'} | ${metricsSummary} | IP: ${entry.ip_address || 'N/A'}\n`;
      fs.appendFileSync(FORMATTED_VITALS_FILE, line, 'utf-8');
    } catch (err) {
      console.error('[Performance Logger] Error appending to text log:', err);
    }
  }

  private calculateRatings(metrics: WebVitalsEntry['metrics']): WebVitalsEntry['ratings'] {
    const ratings: WebVitalsEntry['ratings'] = {};

    if (metrics.lcp !== undefined && metrics.lcp !== null) {
      ratings.lcp = metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor';
    }
    if (metrics.cls !== undefined && metrics.cls !== null) {
      ratings.cls = metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor';
    }
    if (metrics.fid !== undefined && metrics.fid !== null) {
      ratings.fid = metrics.fid <= 100 ? 'good' : metrics.fid <= 300 ? 'needs-improvement' : 'poor';
    }
    if (metrics.inp !== undefined && metrics.inp !== null) {
      ratings.inp = metrics.inp <= 200 ? 'good' : metrics.inp <= 500 ? 'needs-improvement' : 'poor';
    }
    if (metrics.fcp !== undefined && metrics.fcp !== null) {
      ratings.fcp = metrics.fcp <= 1800 ? 'good' : metrics.fcp <= 3000 ? 'needs-improvement' : 'poor';
    }
    if (metrics.ttfb !== undefined && metrics.ttfb !== null) {
      ratings.ttfb = metrics.ttfb <= 800 ? 'good' : metrics.ttfb <= 1800 ? 'needs-improvement' : 'poor';
    }

    return ratings;
  }

  public logVitals(payload: {
    url?: string;
    metrics: WebVitalsEntry['metrics'];
    connection?: WebVitalsEntry['connection'];
    memory?: WebVitalsEntry['memory'];
  }, req?: Request): WebVitalsEntry {
    const timestamp = new Date().toISOString();
    const id = `vit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user = (req as any)?.user;

    const ratings = this.calculateRatings(payload.metrics);

    const entry: WebVitalsEntry = {
      id,
      timestamp,
      url: payload.url || (req ? req.originalUrl : '/'),
      metrics: payload.metrics,
      ratings,
      connection: payload.connection,
      memory: payload.memory,
      user_id: user?.id ?? null,
      user_mobile: user?.mobile ?? null,
      ip_address: req ? getClientIp(req) : '127.0.0.1',
      user_agent: req ? getUserAgent(req) : 'Browser Client',
    };

    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs = this.logs.slice(0, MAX_LOG_ENTRIES);
    }

    this.saveToFile();
    this.appendToTextLog(entry);

    return entry;
  }

  public getVitals(limit = 100): WebVitalsEntry[] {
    return this.logs.slice(0, limit);
  }

  public getStats() {
    const total = this.logs.length;
    if (total === 0) {
      return {
        total: 0,
        averages: { lcp: null, cls: null, fid: null, inp: null, fcp: null, ttfb: null },
        scoreCounts: { good: 0, needsImprovement: 0, poor: 0 },
        logFilePath: 'data/vitals_logs.json',
        textLogFilePath: 'data/app_vitals.log',
      };
    }

    const calcAvg = (key: keyof WebVitalsEntry['metrics']) => {
      const valid = this.logs
        .map((l) => l.metrics[key])
        .filter((v): v is number => typeof v === 'number' && !isNaN(v));
      if (valid.length === 0) return null;
      const sum = valid.reduce((a, b) => a + b, 0);
      return Math.round((sum / valid.length) * 100) / 100;
    };

    let good = 0;
    let needsImprovement = 0;
    let poor = 0;

    this.logs.forEach((l) => {
      if (l.ratings) {
        Object.values(l.ratings).forEach((r) => {
          if (r === 'good') good++;
          else if (r === 'needs-improvement') needsImprovement++;
          else if (r === 'poor') poor++;
        });
      }
    });

    return {
      total,
      averages: {
        lcp: calcAvg('lcp'),
        cls: calcAvg('cls'),
        fid: calcAvg('fid'),
        inp: calcAvg('inp'),
        fcp: calcAvg('fcp'),
        ttfb: calcAvg('ttfb'),
      },
      scoreCounts: { good, needsImprovement, poor },
      logFilePath: 'data/vitals_logs.json',
      textLogFilePath: 'data/app_vitals.log',
    };
  }

  public clearLogs() {
    this.logs = [];
    this.saveToFile();
    try {
      if (fs.existsSync(FORMATTED_VITALS_FILE)) {
        fs.writeFileSync(FORMATTED_VITALS_FILE, `--- Vitals Log Cleared at ${new Date().toISOString()} ---\n`, 'utf-8');
      }
    } catch {
      // ignore
    }
  }
}

export const performanceLogger = new PerformanceLogger();
