# چک‌لیست و مستندات جامع استقرار در محیط پروداکشن (Production Deployment Checklist)
### سامانه مدیریت و محاسبه تعرفه ابری کارویتا (Karovita Cloud ERP)

این سند راهنمای عملیاتی و گام‌به‌گام برای آماده‌سازی، ایمن‌سازی و استقرار نهایی پروژه در سرورهای پروداکشن است. رعایت تمامی بندهای این چک‌لیست پیش از انتشار عمومی الزامی می‌باشد.

---

## فهرست سرفصل‌ها

1. [بخش اول: پشتیبان‌گیری و بازیابی پایگاه داده (Database Backups & Disaster Recovery)](#۱-پشتیبان‌گیری-و-بازیابی-پایگاه-داده-database-backups--disaster-recovery)
2. [بخش دوم: پاک‌سازی و مدیریت متغیرهای محیطی و کلیدهای محرمانه (Environment Variables & Secrets Sanitization)](#۲-پاک‌سازی-و-مدیریت-متغیرهای-محیطی-و-کلیدهای-محرمانه-environment-variables--secrets-sanitization)
3. [بخش سوم: پیکربندی پیشرفته پروتکل امنیتی SSL / TLS](#۳-پیکربندی-پیشرفته-پروتکل-امنیتی-ssl--tls)
4. [بخش چهارم: ایمن‌سازی و مقاوم‌سازی سیستم‌عامل و سرور (Server Hardening & Infrastructure Security)](#۴-ایمن‌سازی-و-مقاوم‌سازی-سیستم‌عامل-و-سرور-server-hardening--infrastructure-security)
5. [بخش پنجم: گام‌های تاییدیه نهایی پیش از لانچ (Pre-Launch Verification Checklist)](#۵-گام‌های-تاییدیه-نهایی-پیش-از-لانچ-pre-launch-verification-checklist)

---

## ۱. پشتیبان‌گیری و بازیابی پایگاه داده (Database Backups & Disaster Recovery)

### ۱.۱ استراتژی و زمان‌بندی پشتیبان‌گیری خودکار (Automated Backup Schedule)
- [ ] **پشتیبان‌گیری ساعتی (Incremental / WAL / Transaction Logs):** فعال‌سازی ثبت لاگ‌های تراکنشی برای امکان بازیابی نقطه‌ای در زمان (Point-in-Time Recovery - PITR).
- [ ] **پشتیبان‌گیری روزانه (Daily Full Backup):** اجرای روزانه در ساعات کم‌ترافیک (مثلاً ساعت ۰۳:۳۰ بامداد) به همراه فشرده‌سازی خودکار (`gzip` یا `zstd`).
- [ ] **پشتیبان‌گیری هفتگی و ماهانه (Cold Storage):** نگهداری نسخه‌های Snapshot پایان هفته و پایان ماه در ذخیره‌سازهای ابری مجزا (مانند S3 Object Storage / ArvanCloud / Backblaze).

### ۱.۲ سیاست نگهداری داده‌ها (Retention Policy - 3-2-1 Rule)
- [ ] **قانون ۳-۲-۱:** نگهداری ۳ نسخه از داده‌ها روی ۲ نوع رسانه مختلف و حداقل ۱ نسخه در خارج از سرور اصلی (Off-site / Remote Cloud).
- [ ] نگهداری لاگ‌های ساعتی: حداقل ۷ روز.
- [ ] نگهداری بک‌آپ‌های روزانه: ۳۰ روز.
- [ ] نگهداری بک‌آپ‌های ماهانه: ۱۲ ماه.

### ۱.۳ رمزنگاری و یکپارچگی فایل‌های پشتیبان (Encryption & Integrity Check)
- [ ] فعال‌سازی رمزنگاری نامتقارن (مانند GPG یا AES-256) پیش از ارسال فایل بک‌آپ به ذخیره‌ساز ابری:
  ```bash
  # نمونه دستور فشرده‌سازی و رمزنگاری دیتابیس با GPG
  pg_dump -U dbuser karovita_db | gzip | gpg --encrypt --recipient admin@karovita.ir -o /backups/db_$(date +%F_%H%M).sql.gz.gpg
  ```
- [ ] بررسی هش (SHA-256 Checksum) فایل‌های پشتیبان پس از اتمام فرآیند انتقال.

### ۱.۴ مانور بازیابی و آزمون تاب‌آوری (Disaster Recovery Drill)
- [ ] تعریف اسکریپت آزمایشی خودکار هفتگی برای Restore کردن فایل بک‌آپ روی محیط Staging و اجرای کوئری اعتبارسنجی (Smoke Test).
- [ ] اندازه‌گیری شاخص **RTO** (حداکثر زمان مجاز بازیابی سرویس < ۳۰ دقیقه) و **RPO** (حداکثر حجم داده قابل از دست رفتن < ۱۵ دقیقه).

---

## ۲. پاک‌سازی و مدیریت متغیرهای محیطی و کلیدهای محرمانه (Environment Variables & Secrets Sanitization)

### ۲.۱ پاک‌سازی کلیدها و حذف مقادیر پیش‌فرض (Sanitization Checklist)
- [ ] **تغییر `APP_KEY` و کلیدهای JWT:** تولید کلید تصادفی ۶۴ بیتی با انتروپی بالا:
  ```bash
  openssl rand -base64 48
  ```
- [ ] **تغییر درگاه پرداخت (`PAYMENT_DRIVER`):** سوئیچ از درگاه شبیه‌ساز (`sandbox` / `mock`) به درگاه واقعی بانکی (شاپرک / زرین‌پال / سداد) و تنظیم مرچنت کد واقعی پروداکشن.
- [ ] **پنل پیامکی (`SMS_DRIVER`):** تغییر از حالت `log` به درایور رسمی (Mediana / کاوه‌نگار / مگفا) و قرار دادن `MEDIANA_API_KEY` ও `MEDIANA_PATTERN_CODE` معتبر.
- [ ] **غیرفعال‌سازی حالت دیباگ و تستی:**
  - `APP_ENV=production`
  - `NODE_ENV=production`
  - حذف شماره موبایل مدیر پیش‌فرض تستی (`09120000000`) و تعیین مدیران رسمی با احراز هویت دوعاملی.

### ۲.۲ دسترسی‌ها و ذخیره‌سازی امن فایل‌های کانفیگ
- [ ] اطمینان از قرار داشتن فایل‌های محرمانه (`.env`, `.env.production`, `*.pem`, `*.key`) در فایل `.gitignore`.
- [ ] محدودسازی سطح دسترسی فایل `.env` بر روی سرور فقط به کاربر اجراکننده سرویس:
  ```bash
  chmod 600 /var/www/karovita/.env
  chown www-data:www-data /var/www/karovita/.env
  ```
- [ ] استفاده از Vault یا Secret Manager (مانند HashiCorp Vault, Doppler, یا Docker Secrets) در معماری‌های مبتنی بر Container/CI-CD.

---

## ۳. پیکربندی پیشرفته پروتکل امنیتی SSL / TLS

### ۳.۱ گواهی‌نامه دیجیتال و تمدید خودکار (Automated Certificate Lifecycle)
- [ ] دریافت گواهی‌نامه معتبر SSL/TLS (Let's Encrypt یا گواهی تجاری سازمانی EV/OV).
- [ ] فعال‌سازی تمدید خودکار دوره‌ای با Certbot:
  ```bash
  certbot certonly --nginx -d karovita.ir -d app.karovita.ir --agree-tos --email ops@karovita.ir
  systemctl enable certbot.timer
  ```
- [ ] بررسی لاگ اجرای Dry-run تمدید: `certbot renew --dry-run`.

### ۳.۲ سخت‌گیری پروتکل و رمزها (TLS 1.2 / TLS 1.3 & Strong Ciphers)
- [ ] غیرفعال‌سازی کامل پروتکل‌های منسوخ و ناامن (SSLv2, SSLv3, TLS 1.0, TLS 1.1).
- [ ] فعال‌سازی انحصاری **TLSv1.2** و **TLSv1.3**.
- [ ] تنظیم Cipher Suiteهای قدرتمند مبتنی بر Forward Secrecy (ECDHE-ECDSA / ECDHE-RSA).
- [ ] فعال‌سازی **OCSP Stapling** جهت بهبود سرعت هندشیک و حفظ حریم خصوصی کاربران.

### ۳.۳ هدرهای امنیتی انتقال و ریدایرکت اجباری HTTPS
- [ ] ریدایرکت ۳۰۱ تمام درخواست‌های پورت ۸۰ (HTTP) به پورت ۴۴۳ (HTTPS).
- [ ] فعال‌سازی هدر **HSTS** با مدت زمان حداقل ۱ سال به همراه Preload:
  ```nginx
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
  ```

---

## ۴. ایمن‌سازی و مقاوم‌سازی سیستم‌عامل و سرور (Server Hardening & Infrastructure Security)

### ۴.۱ پیکربندی Nginx Reverse Proxy و هدرهای امنیتی
- [ ] مخفی‌سازی نسخه سرور و بنرها:
  ```nginx
  server_tokens off;
  ```
- [ ] فعال‌سازی هدرهای دفاعی در برابر حملات تزریق و سرقت سشن:
  ```nginx
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://browser.sentry-cdn.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.sentry.io;" always;
  ```

### ۴.۲ محدودسازی نرخ درخواست‌ها در سطح سرور (Nginx Rate Limiting)
- [ ] تعریف Zoneهای محدودسازی درخواست برای جلوگیری از حملات Brute Force و Denial of Service:
  ```nginx
  # محدودسازی نرخ ورود و ارسال OTP
  limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
  
  location /api/auth/ {
      limit_req zone=auth_limit burst=3 nodelay;
      proxy_pass http://127.0.0.1:3000;
  }
  
  location /api/ {
      limit_req zone=api_limit burst=20 nodelay;
      proxy_pass http://127.0.0.1:3000;
  }
  ```

### ۴.۳ سخت‌سازی دسترسی‌های SSH و کاربران سرور
- [ ] **غیرفعال‌سازی ورود با کلمه عبور:** اجبار به استفاده انحصاری از کلید عمومی SSH (Ed25519 یا RSA 4096).
- [ ] **تغییر پورت پیش‌فرض SSH:** تغییر از پورت ۲۲ به پورت دلخواه غیرمتعارف (مانند ۲۲۴۴).
- [ ] **غیرفعال‌سازی ورود مستقیم کاربر ریشه (Root):**
  ```sshd_config
  PermitRootLogin no
  PasswordAuthentication no
  X11Forwarding no
  MaxAuthTries 3
  ```
- [ ] اجرای پردازه‌های Node.js / Express تحت کاربر غیرریشه اختصاصی (مانند `karovita-app` یا `www-data`).

### ۴.۴ فایروال سیستم‌عامل (UFW / Iptables) و سیستم جلوگیری از نفوذ (Fail2ban)
- [ ] مسدودسازی تمامی پورت‌های ورودی به جز پورت‌های مجاز (HTTPS:443, HTTP:80, Custom SSH):
  ```bash
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow 2244/tcp # SSH پورت اختصاصی
  ufw enable
  ```
- [ ] نصب و فعال‌سازی **Fail2ban** جهت بن کردن خودکار IPهای مشکوک بعد از ۳ تلاش ناموفق.

### ۴.۵ پایش لحظه‌ای و ثبت وقایع (Monitoring, Sentry & Alerting)
- [ ] اتصال گزارش‌گیری خطاهای فرانت‌اند و بک‌اند به سامانه پایش پایداری Sentry (`SENTRY_DSN` و `VITE_SENTRY_DSN`).
- [ ] اتصال لاگ‌های سیستمی و Audit Logs به ابزار لاگ سرور متمرکز (مانند Grafana Loki / ELK / Promtail).
- [ ] فعال‌سازی هشدارهای تلگرام/ایمیل/پیامک برای قطعی سرویس (Uptime Robot / Health Check endpoint `/api/health`).

---

## ۵. گام‌های تاییدیه نهایی پیش از لانچ (Pre-Launch Verification Checklist)

| ردیف | شرح اقدام | وضعیت | مسئول |
| :--- | :--- | :---: | :---: |
| ۱ | اجرای موفق `npm run build` بدون هیچ‌گونه خطا یا Warning حیاتی | 🔲 | DevOps / Frontend |
| ۲ | صحت‌سنجی عملکرد کامل درگاه پرداخت واقعی با یک تراکنش تست ریالی | 🔲 | QA / Backend |
| ۳ | دریافت موفق پیامک‌های کد تأیید ورود OTP روی شماره‌های مختلف اپراتورها | 🔲 | QA |
| ۴ | بررسی گرید A یا A+ در آزمون امنیتی [SSL Labs](https://www.ssllabs.com/ssltest/) | 🔲 | Security Lead |
| ۵ | بررسی گرید A در آزمون هدرهای امنیتی [SecurityHeaders.com](https://securityheaders.com/) | 🔲 | Security Lead |
| ۶ | فعال بودن لاگین دوعاملی (2FA) برای حساب‌های دارای سطح دسترسی ادمین | 🔲 | Admin / Ops |
| ۷ | تست موفقیت‌آمیز سناریوی بازگردانی بک‌آپ دیتابیس (Disaster Recovery Test) | 🔲 | Database Admin |
| ۸ | فعال بودن سیستم چرخش و فشرده‌سازی لاگ‌ها (`logrotate`) | 🔲 | SysAdmin |

---
**تأییدیه نهایی استقرار:**
- تاریخ بازبینی و استقرار: `....................`
- نام و امضای مدیر فنی / امنیت: `....................`
