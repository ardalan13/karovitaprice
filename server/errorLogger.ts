import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import { getClientIp, getUserAgent } from './auditLogger';

export interface SystemErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'fatal' | 'info';
  source: 'server' | 'client' | 'api' | 'unhandled' | 'database';
  message: string;
  name?: string;
  stack?: string;
  url?: string;
  method?: string;
  status_code?: number;
  user_id?: number | null;
  user_mobile?: string | null;
  user_role?: string | null;
  ip_address?: string;
  user_agent?: string;
  context?: Record<string, any>;
  resolved: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ERROR_LOGS_FILE = path.join(DATA_DIR, 'error_logs.json');
const FORMATTED_LOG_FILE = path.join(DATA_DIR, 'app_errors.log');
const MAX_LOG_ENTRIES = 1000;

class LocalErrorLogger {
  private logs: SystemErrorLog[] = [];
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

      if (fs.existsSync(ERROR_LOGS_FILE)) {
        const raw = fs.readFileSync(ERROR_LOGS_FILE, 'utf-8');
        if (raw && raw.trim()) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.logs = parsed;
          }
        }
      } else {
        this.saveToFile();
      }

      // Capture unhandled node errors
      process.on('uncaughtException', (err: Error) => {
        this.logServerError(err, { type: 'uncaughtException' }, undefined, 'fatal', 'unhandled');
      });

      process.on('unhandledRejection', (reason: any) => {
        const err = reason instanceof Error ? reason : new Error(String(reason));
        this.logServerError(err, { type: 'unhandledRejection', raw: reason }, undefined, 'error', 'unhandled');
      });

      this.isInitialized = true;
      console.log(`[Diagnostics Service] Initialized successfully. Processed ${this.logs.length} records.`);
    } catch (err) {
      console.error('[Diagnostics Service] Initialization issue:', err);
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(ERROR_LOGS_FILE, JSON.stringify(this.logs, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Local Error Logger] Error saving logs to JSON:', err);
    }
  }

  private appendToTextLog(log: SystemErrorLog) {
    try {
      const line = `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source.toUpperCase()}] ${log.name || 'Error'}: ${log.message} | URL: ${log.method || ''} ${log.url || 'N/A'} | IP: ${log.ip_address || 'N/A'} | User: ${log.user_mobile || log.user_id || 'Guest'}\n${log.stack ? log.stack + '\n' : ''}------------------------------------------------------------\n`;
      fs.appendFileSync(FORMATTED_LOG_FILE, line, 'utf-8');
    } catch (err) {
      console.error('[Local Error Logger] Error appending to text log:', err);
    }
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context || typeof context !== 'object') return context;
    const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'otp', 'code', 'apikey', 'cookie'];
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  public logServerError(
    error: any,
    context: Record<string, any> = {},
    req?: Request,
    level: 'error' | 'warn' | 'fatal' | 'info' = 'error',
    source: 'server' | 'api' | 'unhandled' | 'database' = 'server'
  ): SystemErrorLog {
    const timestamp = new Date().toISOString();
    const id = `err_srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const message = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
    const name = error instanceof Error ? error.name : 'ServerError';
    const stack = error instanceof Error ? error.stack : undefined;

    const user = (req as any)?.user;
    const url = req ? req.originalUrl || req.url : context.url;
    const method = req ? req.method : context.method;
    const statusCode = context.status || (error as any)?.status || (error as any)?.statusCode || (req ? 500 : undefined);

    const logEntry: SystemErrorLog = {
      id,
      timestamp,
      level,
      source,
      message,
      name,
      stack,
      url,
      method,
      status_code: statusCode,
      user_id: user?.id ?? null,
      user_mobile: user?.mobile ?? null,
      user_role: user?.role ?? null,
      ip_address: req ? getClientIp(req) : 'localhost',
      user_agent: req ? getUserAgent(req) : 'Server-Internal',
      context: this.sanitizeContext(context),
      resolved: false,
    };

    // Keep memory & JSON file bounded
    this.logs.unshift(logEntry);
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs = this.logs.slice(0, MAX_LOG_ENTRIES);
    }

    this.saveToFile();
    this.appendToTextLog(logEntry);

    // Console output for immediate developer visibility
    console.error(`🔴 [Local Logger] ${level.toUpperCase()} (${source}): ${message}`, {
      url,
      method,
      user: user?.mobile || 'anonymous',
    });

    return logEntry;
  }

  public logClientError(payload: {
    message: string;
    name?: string;
    stack?: string;
    url?: string;
    context?: Record<string, any>;
    level?: 'error' | 'warn' | 'info';
  }, req?: Request): SystemErrorLog {
    const timestamp = new Date().toISOString();
    const id = `err_cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const user = (req as any)?.user;
    const logEntry: SystemErrorLog = {
      id,
      timestamp,
      level: payload.level || 'error',
      source: 'client',
      message: payload.message || 'Unknown Client Error',
      name: payload.name || 'ClientError',
      stack: payload.stack,
      url: payload.url,
      user_id: user?.id ?? null,
      user_mobile: user?.mobile ?? null,
      user_role: user?.role ?? null,
      ip_address: req ? getClientIp(req) : 'localhost',
      user_agent: req ? getUserAgent(req) : 'Browser Client',
      context: this.sanitizeContext(payload.context),
      resolved: false,
    };

    this.logs.unshift(logEntry);
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs = this.logs.slice(0, MAX_LOG_ENTRIES);
    }

    this.saveToFile();
    this.appendToTextLog(logEntry);

    console.warn(`🟡 [Local Logger] Client Error logged: ${payload.message} (from ${logEntry.ip_address})`);
    return logEntry;
  }

  public getLogs(filters: {
    level?: string;
    source?: string;
    search?: string;
    resolved?: boolean | 'all';
    limit?: number;
  } = {}): SystemErrorLog[] {
    let result = [...this.logs];

    if (filters.level && filters.level !== 'all') {
      result = result.filter((l) => l.level === filters.level);
    }

    if (filters.source && filters.source !== 'all') {
      result = result.filter((l) => l.source === filters.source);
    }

    if (filters.resolved !== undefined && filters.resolved !== 'all') {
      const isResolved = filters.resolved === true || filters.resolved === 'true';
      result = result.filter((l) => l.resolved === isResolved);
    }

    if (filters.search && filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      result = result.filter((l) =>
        l.message?.toLowerCase().includes(query) ||
        l.name?.toLowerCase().includes(query) ||
        l.url?.toLowerCase().includes(query) ||
        l.user_mobile?.includes(query) ||
        l.ip_address?.includes(query)
      );
    }

    const limit = filters.limit || 200;
    return result.slice(0, limit);
  }

  public getStats() {
    const total = this.logs.length;
    const errors = this.logs.filter((l) => l.level === 'error' || l.level === 'fatal').length;
    const warnings = this.logs.filter((l) => l.level === 'warn').length;
    const clientErrors = this.logs.filter((l) => l.source === 'client').length;
    const serverErrors = this.logs.filter((l) => l.source === 'server' || l.source === 'api' || l.source === 'unhandled').length;
    const unresolved = this.logs.filter((l) => !l.resolved).length;

    // Today's errors
    const todayStr = new Date().toISOString().split('T')[0];
    const todayErrors = this.logs.filter((l) => l.timestamp.startsWith(todayStr)).length;

    return {
      total,
      errors,
      warnings,
      clientErrors,
      serverErrors,
      unresolved,
      todayErrors,
      logFilePath: 'data/error_logs.json',
      textLogFilePath: 'data/app_errors.log',
    };
  }

  public markResolved(id: string, resolved = true): boolean {
    const item = this.logs.find((l) => l.id === id);
    if (item) {
      item.resolved = resolved;
      this.saveToFile();
      return true;
    }
    return false;
  }

  public clearLogs(): boolean {
    this.logs = [];
    this.saveToFile();
    try {
      if (fs.existsSync(FORMATTED_LOG_FILE)) {
        fs.writeFileSync(FORMATTED_LOG_FILE, `--- Error Log Cleared at ${new Date().toISOString()} ---\n`, 'utf-8');
      }
    } catch {
      // ignore
    }
    return true;
  }

  public getRawLogText(): string {
    try {
      if (fs.existsSync(FORMATTED_LOG_FILE)) {
        return fs.readFileSync(FORMATTED_LOG_FILE, 'utf-8');
      }
    } catch {
      // ignore
    }
    return '';
  }
}

export const errorLogger = new LocalErrorLogger();

export function initServerLogger() {
  errorLogger.init();
}

export function logServerError(
  error: any,
  context: Record<string, any> = {},
  req?: Request,
  level: 'error' | 'warn' | 'fatal' | 'info' = 'error',
  source: 'server' | 'api' | 'unhandled' | 'database' = 'server'
) {
  return errorLogger.logServerError(error, context, req, level, source);
}

export function logClientError(
  payload: {
    message: string;
    name?: string;
    stack?: string;
    url?: string;
    context?: Record<string, any>;
    level?: 'error' | 'warn' | 'info';
  },
  req?: Request
) {
  return errorLogger.logClientError(payload, req);
}
