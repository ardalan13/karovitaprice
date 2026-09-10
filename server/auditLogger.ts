import { Request, Response, NextFunction } from 'express';
import { db, AuditActionType, AuditLog } from './db';

/**
 * Extracts client IP address safely considering proxy headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'localhost';
}

/**
 * Extracts User-Agent string from request headers
 */
export function getUserAgent(req: Request): string {
  const ua = req.headers['user-agent'];
  if (Array.isArray(ua)) return ua.join(' ');
  return ua || 'Unknown User-Agent';
}

export interface LogAuditOptions {
  userId?: number | null;
  userName?: string;
  userMobile?: string | null;
  userRole?: 'admin' | 'user' | 'system';
  actionType: AuditActionType;
  actionDescription: string;
  resourceType: string;
  resourceId?: string | number | null;
  status?: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: Record<string, any>;
  req?: Request;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Unified function to create and persist an audit log
 */
export function logAudit(options: LogAuditOptions): AuditLog {
  const req = options.req;
  const user = (req as any)?.user;

  const userId = options.userId !== undefined ? options.userId : (user?.id ?? null);
  const userName = options.userName || (user ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.mobile : 'سیستم');
  const userMobile = options.userMobile !== undefined ? options.userMobile : (user?.mobile ?? null);
  const userRole = options.userRole || (user?.role === 'admin' ? 'admin' : user ? 'user' : 'system');

  const ipAddress = options.ipAddress || (req ? getClientIp(req) : 'localhost');
  const userAgent = options.userAgent || (req ? getUserAgent(req) : 'Karovita-Audit/1.0');

  const auditEntry = db.addAuditLog({
    user_id: userId,
    user_name: userName,
    user_mobile: userMobile,
    user_role: userRole,
    action_type: options.actionType,
    action_description: options.actionDescription,
    resource_type: options.resourceType,
    resource_id: options.resourceId ?? null,
    ip_address: ipAddress,
    user_agent: userAgent,
    status: options.status || 'SUCCESS',
    details: options.details || {},
  });

  return auditEntry;
}

/**
 * Log Privilege Escalation (e.g. promoting user to admin, changing permissions)
 */
export function logPrivilegeEscalation(
  req: Request,
  params: {
    targetUserId: number;
    targetUserName?: string;
    oldRole: string;
    newRole: string;
    actionDescription?: string;
    details?: Record<string, any>;
  }
): AuditLog {
  const description =
    params.actionDescription ||
    `تغییر سطح دسترسی کاربر #${params.targetUserId} (${params.targetUserName || 'ناشناس'}) از "${params.oldRole}" به "${params.newRole}"`;

  return logAudit({
    req,
    actionType: 'PRIVILEGE_ESCALATION',
    actionDescription: description,
    resourceType: 'USER_ROLE',
    resourceId: params.targetUserId,
    status: 'SUCCESS',
    details: {
      target_user_id: params.targetUserId,
      target_user_name: params.targetUserName,
      old_role: params.oldRole,
      new_role: params.newRole,
      ...params.details,
    },
  });
}

/**
 * Log Sensitive Data Access (e.g. viewing user PII, downloading invoice, viewing credentials)
 */
export function logSensitiveDataAccess(
  req: Request,
  params: {
    resourceType: string;
    resourceId?: string | number | null;
    actionDescription: string;
    details?: Record<string, any>;
  }
): AuditLog {
  return logAudit({
    req,
    actionType: 'SENSITIVE_DATA_ACCESS',
    actionDescription: params.actionDescription,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    status: 'SUCCESS',
    details: params.details || {},
  });
}

/**
 * Log Configuration Changes (e.g. ERP modules, pricing formulas, presets, coupons)
 */
export function logConfigChange(
  req: Request,
  params: {
    resourceType: string;
    resourceId?: string | number | null;
    actionDescription: string;
    oldValue?: any;
    newValue?: any;
    details?: Record<string, any>;
  }
): AuditLog {
  return logAudit({
    req,
    actionType: 'CONFIGURATION_CHANGE',
    actionDescription: params.actionDescription,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    status: 'SUCCESS',
    details: {
      ...(params.oldValue !== undefined ? { old_value: params.oldValue } : {}),
      ...(params.newValue !== undefined ? { new_value: params.newValue } : {}),
      ...params.details,
    },
  });
}

/**
 * Log Security Events (e.g. failed OTP, rate limit triggers, suspicious access)
 */
export function logSecurityEvent(
  req: Request,
  params: {
    actionDescription: string;
    resourceType?: string;
    resourceId?: string | number | null;
    status?: 'SUCCESS' | 'FAILURE' | 'WARNING';
    details?: Record<string, any>;
  }
): AuditLog {
  return logAudit({
    req,
    actionType: 'SECURITY_EVENT',
    actionDescription: params.actionDescription,
    resourceType: params.resourceType || 'AUTH_SECURITY',
    resourceId: params.resourceId,
    status: params.status || 'WARNING',
    details: params.details || {},
  });
}

/**
 * Log Subscription Changes (e.g. status changes, manual activation or cancellation)
 */
export function logSubscriptionChange(
  req: Request,
  params: {
    subscriptionId: number;
    userId?: number;
    actionDescription: string;
    oldStatus?: string;
    newStatus?: string;
    details?: Record<string, any>;
  }
): AuditLog {
  return logAudit({
    req,
    actionType: 'SUBSCRIPTION_CHANGE',
    actionDescription: params.actionDescription,
    resourceType: 'SUBSCRIPTION',
    resourceId: params.subscriptionId,
    status: 'SUCCESS',
    details: {
      subscription_id: params.subscriptionId,
      ...(params.oldStatus ? { old_status: params.oldStatus } : {}),
      ...(params.newStatus ? { new_status: params.newStatus } : {}),
      ...params.details,
    },
  });
}

/**
 * Log Financial Events (e.g. online invoice payments, orders, transactions)
 */
export function logFinancialEvent(
  req: Request,
  params: {
    actionType?: string;
    orderId?: number;
    transactionId?: number;
    amount?: number;
    referenceId?: string;
    userId?: number;
    actionDescription: string;
    details?: Record<string, any>;
  }
): AuditLog {
  return logAudit({
    req,
    actionType: 'FINANCIAL_TRANSACTION',
    actionDescription: params.actionDescription,
    resourceType: 'ORDER_INVOICE',
    resourceId: params.orderId || params.transactionId || null,
    status: 'SUCCESS',
    details: {
      action_type: params.actionType || 'PAYMENT',
      order_id: params.orderId,
      transaction_id: params.transactionId,
      amount: params.amount,
      reference_id: params.referenceId,
      user_id: params.userId,
      ...params.details,
    },
  });
}

/**
 * Express middleware to automatically audit access to sensitive endpoints
 */
export function auditSensitiveAccessMiddleware(
  actionDescription: string,
  resourceType: string,
  getResourceId?: (req: Request) => string | number | null
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Audit on response finish
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        logSensitiveDataAccess(req, {
          actionDescription,
          resourceType,
          resourceId: getResourceId ? getResourceId(req) : null,
          details: {
            method: req.method,
            path: req.originalUrl || req.url,
            statusCode: res.statusCode,
          },
        });
      }
    });
    next();
  };
}
