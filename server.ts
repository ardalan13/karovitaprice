import express from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import apiRoutes from './server/routes';
import { initServerLogger, logServerError } from './server/errorLogger';
import { applySecurityHeaders } from './server/securityHeaders';
import { globalApiLimiter } from './server/rateLimiters';
import { getHealthStatus } from './server/healthCheck';

async function startServer() {
  initServerLogger();

  const app = express();
  const PORT = 3000;

  // Gzip/Brotli compression for all responses (reduces payload size by ~70%)
  app.use(compression({
    level: 6,                   // balanced speed vs compression ratio
    threshold: 1024,            // only compress responses > 1KB
    filter: (req, res) => {
      // Don't compress server-sent events
      if (req.headers['accept'] === 'text/event-stream') return false;
      return compression.filter(req, res);
    },
  }));

  // Apply enterprise security headers (CSP, X-Content-Type-Options, Permissions-Policy, etc.)
  app.use(applySecurityHeaders());

  // Trust proxy for accurate client IP detection behind load balancers/reverse proxies
  app.set('trust proxy', 1);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global rate limiter for API endpoints
  app.use('/api', globalApiLimiter);

  // Health check route with full database, SMS, and cache status
  app.get('/api/health', getHealthStatus);
  app.get('/health', getHealthStatus);
  app.get('/api/ping', (_req, res) => {
    res.json({ status: 'ok', app: 'karovita_erp', timestamp: Date.now() });
  });
  app.get('/ping', (_req, res) => {
    res.json({ status: 'ok', app: 'karovita_erp', timestamp: Date.now() });
  });

  // API routes FIRST
  app.use('/api', apiRoutes);
  // Direct admin API fallback for requests made without /api prefix
  app.use('/admin', apiRoutes);

  // Global Error Handler for API
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logServerError(err, { url: req.originalUrl, method: req.method, body: req.body }, req, 'error', 'api');
    res.status(err.status || 500).json({
      message: err.message || 'خطای داخلی سرور رخ داده است.',
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Hashed assets (JS, CSS, images) — immutable cache for 1 year
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '365d',
      immutable: true,
    }));
    // Font files — cache for 30 days (they rarely change)
    app.use('/fonts', express.static(path.join(distPath, 'fonts'), {
      maxAge: '30d',
    }));
    // Remaining static files (manifest, icons, sw.js) — short cache with revalidation
    app.use(express.static(distPath, {
      maxAge: '1h',
      etag: true,
      lastModified: true,
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

