import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Enterprise Security Headers Middleware
 * Configures CSP, X-Content-Type-Options, Frame protection, Referrer Policy,
 * and permissions policies to protect against XSS, Clickjacking, MIME sniffing, and injection attacks.
 */
export function applySecurityHeaders() {
  return [
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", "https:", "data:", "blob:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: ["'self'", "https:", "wss:", "ws:", "https://*.mediana.ir", "https://api.kavenegar.com"],
          frameAncestors: ["'self'", "https://*.google.com", "https://*.run.app", "https://ai.studio", "https://aistudio.google.com"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Allows cross-origin assets like fonts & cdn images
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: false, // Handled via CSP frame-ancestors to allow AI Studio / Cloud Run preview iframe
      xContentTypeOptions: true, // X-Content-Type-Options: nosniff
      dnsPrefetchControl: { allow: false },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
    (req: Request, res: Response, next: NextFunction) => {
      // Extra explicit headers
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
      
      // Remove sensitive server disclosure headers
      res.removeHeader('X-Powered-By');
      next();
    },
  ];
}
