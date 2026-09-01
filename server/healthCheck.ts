import { Request, Response } from 'express';
import { db } from './db';
import { checkSmsProviderHealth } from './smsService';
import fs from 'fs';
import path from 'path';

/**
 * Health check handler for monitoring and uptime probes.
 * Reports status of Database, SMS provider connectivity, Cache drivers, and server metrics.
 */
export async function getHealthStatus(req: Request, res: Response) {
  const startTime = Date.now();

  // 1. Database Check
  const dbStart = Date.now();
  let dbStatus: any = { status: 'healthy' };
  try {
    const userCount = db.users.length;
    const orderCount = db.orders.length;
    const ticketCount = db.tickets.length;
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    const fileExists = fs.existsSync(dbPath);
    const dbLatency = Date.now() - dbStart;

    dbStatus = {
      status: 'healthy',
      driver: 'json_file_store',
      file_exists: fileExists,
      latency_ms: dbLatency,
      table_records: {
        users: userCount,
        orders: orderCount,
        tickets: ticketCount,
        audit_logs: db.auditLogs.length,
      },
      message: 'بانک اطلاعاتی فعال و پاسخگو می‌باشد.',
    };
  } catch (err: any) {
    dbStatus = {
      status: 'unhealthy',
      driver: 'json_file_store',
      latency_ms: Date.now() - dbStart,
      error: err.message,
      message: 'خطا در دسترسی به فایل پایگاه داده.',
    };
  }

  // 2. SMS Provider Connectivity Check
  const smsStatus = await checkSmsProviderHealth();

  // 3. Cache Driver Check
  const cacheStart = Date.now();
  let cacheStatus: any = { status: 'healthy' };
  try {
    const probeKey = `health_probe_${Date.now()}`;
    const testMap = new Map<string, number>();
    testMap.set(probeKey, Date.now());
    const val = testMap.get(probeKey);
    testMap.delete(probeKey);
    const cacheLatency = Date.now() - cacheStart;

    cacheStatus = {
      status: val ? 'healthy' : 'unhealthy',
      driver: process.env.CACHE_DRIVER || 'memory',
      latency_ms: cacheLatency,
      message: 'درایور کش فعال بوده و عملیات خواندن/نوشتن با موفقیت انجام شد.',
    };
  } catch (err: any) {
    cacheStatus = {
      status: 'unhealthy',
      driver: process.env.CACHE_DRIVER || 'memory',
      latency_ms: Date.now() - cacheStart,
      error: err.message,
      message: 'خطا در عملیات کش.',
    };
  }

  // 4. Server & System Metrics
  const memoryUsage = process.memoryUsage();
  const formatMb = (bytes: number) => `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`;

  const totalDuration = Date.now() - startTime;
  const isHealthy = dbStatus.status === 'healthy' && cacheStatus.status === 'healthy' && smsStatus.status !== 'unhealthy';
  const overallStatus = isHealthy ? (smsStatus.status === 'degraded' ? 'degraded' : 'healthy') : 'unhealthy';
  const httpCode = overallStatus === 'unhealthy' ? 503 : 200;

  const response = {
    status: overallStatus,
    app: 'KaroVita ERP Server',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    response_time_ms: totalDuration,
    services: {
      database: dbStatus,
      sms_provider: smsStatus,
      cache: cacheStatus,
    },
    system: {
      node_version: process.version,
      platform: process.platform,
      uptime_seconds: Math.floor(process.uptime()),
      memory: {
        rss: formatMb(memoryUsage.rss),
        heap_used: formatMb(memoryUsage.heapUsed),
        heap_total: formatMb(memoryUsage.heapTotal),
      },
    },
  };

  return res.status(httpCode).json(response);
}
