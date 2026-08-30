import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import apiRoutes from './server/routes';
import { initServerSentry, logServerError } from './server/sentry';
import { applySecurityHeaders } from './server/securityHeaders';
import { globalApiLimiter } from './server/rateLimiters';

async function startServer() {
  initServerSentry();

  const app = express();
  const PORT = 3000;

  // Apply enterprise security headers (CSP, X-Content-Type-Options, Permissions-Policy, etc.)
  app.use(applySecurityHeaders());

  // Trust proxy for accurate client IP detection behind load balancers/reverse proxies
  app.set('trust proxy', 1);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global rate limiter for API endpoints
  app.use('/api', globalApiLimiter);

  // Health check route
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'karovita_erp' });
  });

  // API routes FIRST
  app.use('/api', apiRoutes);

  // Global Error Handler for API
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logServerError(err, { url: req.originalUrl, method: req.method, body: req.body });
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
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

