# 🚀 سامانه جامع کارویتا (Karovita Cloud ERP & Customer Portal)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Laravel Ready](https://img.shields.io/badge/Laravel-10.x%20%2F%2011.x-red.svg)](https://laravel.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

یک پلتفرم کامل و مدرن فول‌استک برای **محاسبه هوشمند قیمت و تعرفه ماژول‌های ERP**، **خرید و مدیریت اشتراک‌های سازمانی**، **ورود مستقیم به پنل ERP با ساب‌دامین اختصاصی (`crm.karovita.ir`)**، **وب‌اپلیکیشن پیش‌رونده (PWA)**، **سیستم جامع تیکتینگ و پشتیبانی دپارتمانی**، **پنل مدیریت ارشد ماژولار با نمودارهای زنده مالی**، **درگاه پیامک سریع OTP با SMS.ir**، و **سامانه امنیتی و حسابرسی لاگ‌ها (Audit Logger)**.

---

## 📑 فهرست مطالب
1. [معرفی و امکانات کلیدی](#-امکانات-و-قابلیت‌های-کلیدی)
2. [تغییرات و به‌روزرسانی‌های اخیر پروژه (Changelog)](#-تغییرات-و-به‌روزرسانی‌های-اخیر-پروژه)
3. [معماری و پشته فناوری (Tech Stack)](#-معماری-و-پشته-فناوری-tech-stack)
4. [پیش‌نیازهای سیستمی](#-پیش‌نیازهای-سیستمی-prerequisites)
5. [راهنمای نصب محلی در ویندوز (Windows Setup)](#-راهنمای-نصب-و-راه‌اندازی-در-ویندوز-windows-setup)
6. [راهنمای جامع استقرار در محیط پروداکشن (Production Deployment)](#-راهنمای-جامع-استقرار-در-محیط-پروداکشن-production)
   - [بخش الف: نصب روی هاست اشتراکی DirectAdmin (پشتیبانی از Laravel + React و Node.js)](#بخش-الف-راهنمای-استقرار-روی-هاست-اشتراکی-directadmin-پیشنهادی)
   - [بخش ب: نصب روی هاست اشتراکی cPanel](#بخش-ب-راهنمای-استقرار-روی-هاست-اشتراکی-cpanel)
   - [بخش ج: استقرار روی سرور لینوکس VPS / اختصاصی با PM2 و Nginx](#بخش-ج-استقرار-روی-سرور-لینوکس-vps--اختصاصی-با-pm2-و-وبسرور-nginx)
   - [بخش د: استقرار با Docker و Docker Compose](#بخش-د-استقرار-با-docker-و-docker-compose)
7. [معماری و ساختار تبدیل به لاراول (Laravel Backend Architecture)](#-معماری-و-ساختار-تبدیل-به-لاراول-laravel-backend)
8. [تنظیم متغیرهای محیطی (.env)](#-تنظیم-متغیرهای-محیطی-environment-variables)
9. [ساختار پوشه‌ها و فایل‌های پروژه](#-ساختار-پروژه-project-structure)
10. [اطلاعات مدیر ارشد و حساب پیش‌فرض](#-اطلاعات-مدیر-ارشد-و-حساب-پیشفرض)
11. [دستورات کاربردی و اسکریپت‌ها](#-دستورات-کاربردی-scripts)

---

## 🌟 امکانات و قابلیت‌های کلیدی

### ۱. پورتال مشتریان و مدیریت اشتراک
* 🧮 **محاسبه‌گر داینامیک تعرفه ERP:** انتخاب ماژولار ماژول‌ها (CRM، انبار، حسابداری، فروش، پرسنلی و...) با بررسی پیش‌نیازهای هوشمند و بسته‌های اصناف.
* 📦 **خرید و فعال‌سازی اشتراک:** انتخاب دوره‌های ماهانه و سالانه با اعمال تخفیف و فعال‌سازی دوره ۵ روزه رایگان.
* 🔗 **دسترسی سریع به پنل سازمانی:** اتصال دکمه «ورود به پنل شخصی ERP» مستقیماً به پرتال سامانه (`https://crm.karovita.ir`).
* 🌓 **پشتیبانی کامل از تم روشن و تاریک (Dark/Light Mode):** با لود پیش‌فرض در حالت روز (Light Mode) و دکمه تغییر وضعیت.

### ۲. سیستم پیامک OTP و احراز هویت
* 📲 **درگاه پیامک SMS.ir (Fast Send / Verify REST API):** ارسال آنی کدهای یکبارمصرف با شناسه قالب اختصاصی (`418155`) و پارامتر `#CODE#`.
* 🛡️ **کنترل امنیتی Rate Limiting:** جلوگیری از ارسال رگباری پیامک و حملات اسپم به مسیرهای لاگین.

### ۳. سیستم جامع پشتیبانی و تیکتینگ (Ticketing System)
* 🎫 **ثبت و پیگیری تیکت:** تفکیک دپارتمان‌ها (فروش، فنی، مالی، مدیریت)، وضعیت‌ها و اولویت‌ها.
* 📦 **اتصال هوشمند به خریدهای واقعی کاربر:** نمایش اختصاصی پکیج‌ها و اشتراک‌های خریداری‌شده کاربر در فرم ثبت تیکت و حذف نام‌های تستی قدیمی.
* 🔍 **جستجو و فیلتر پیشرفته:** امکان جستجوی سریع شماره تیکت، موضوع، دپارتمان و نام کاربر با تبدیل خودکار ارقام فارسی/انگلیسی.
* 👨‍💼 **پنل ادمین تیکت‌ها:** پاسخگویی، تغییر وضعیت و ابزار اختصاصی پاک‌سازی تیکت‌های تستی.

### ۴. پنل مدیریت ارشد و آمار مالی زنده
* 📈 **نمودار روند عملکرد فروش و درآمد ماهانه (`SalesPerformanceChart`):** نمودار مقایسه‌ای و تحلیلی با قابلیت سوئیچ بین حالت‌های هفتگی، روزانه و تفکیک ماژول‌ها، متصل به دیتابیس تراکنش‌ها و نمایش وضعیت خام تا زمان ثبت اولین خرید.
* ⚙️ **مدیریت کامل قیمت‌گذاری و ماژول‌ها:** افزودن، ویرایش قیمت ماژول‌ها، تعریف اصناف و کدهای تخفیف.
* 👥 **مدیریت کاربران و نقش‌ها:** مشاهده لیست کاربران و تخصیص نقش‌های Admin / User.
* 🛡️ **ثبت لاگ‌های حسابرسی (Audit Logging) و خطای محلی:** مانیتورینگ کلیه رخدادهای حساس و ثبت خطاها در فایل‌های محلی.

---

## 🔄 تغییرات و به‌روزرسانی‌های اخیر پروژه

در آخرین نسخه، تغییرات و بهینه‌سازی‌های اساسی زیر در سامانه اعمال شده است:

1. **حذف دیتای قدیمی پکیج‌ها در تیکتینگ:**
   - اسامی آزمایشی قدیمی (نظیر تیک‌آف، پرواز، صعود) حذف و اندپوینت `/user/purchased-packages` برای دریافت اختصاصی اشتراک‌های واقعیِ کاربر خریدار پیاده‌سازی شد.
2. **یکپارچه‌سازی و اتصال زنده نمودار فروش ماهانه در پنل مدیریت:**
   - کامپوننت `SalesPerformanceChart` با کتابخانه Recharts بازطراحی شد و به صورت زنده از جدول `transactions` دیتابیس تغذیه می‌شود.
3. **بهبود صفحه نخست (لندینگ):**
   - دکمه «مشاهده پلن‌ها» جای خود را به دکمه مستقیم و سریع **«ورود به حساب»** داد.
4. **تنظیم پیش‌فرض رابط کاربری روی حالت روز (Light Mode):**
   - تم سامانه به صورت پیش‌فرض در حالت روشن و استاندارد بارگذاری می‌شود.
5. **بهینه‌سازی هدر و حذف نماد تستی «م»:**
   - بخش کاراکتر اضافی در کنار دکمه تم حذف و هدر مدیریت مینیمال شد.
6. **آماده‌سازی معماری تبدیل به Laravel جهت هاست‌های اشتراکی DirectAdmin.**

---

## 🛠️ معماری و پشته فناوری (Tech Stack)

| بخش | تکنولوژی |
| :--- | :--- |
| **فرانت‌اند (Frontend)** | React 18.3، Vite 5.4، Lucide React، Recharts، Tailwind & Custom CSS Variables |
| **بک‌اند پیش‌فرض (Node.js)** | Node.js (v20+)، Express 4.21، TypeScript، tsx |
| **بک‌اند جایگزین (Laravel)** | PHP 8.1+ / 8.2، Laravel 10.x / 11.x، MySQL / MariaDB |
| **بانک اطلاعاتی** | Flat JSON Database (`data/db.json`) یا MySQL پروداکشن |
| **درگاه پیامک OTP** | SMS.ir REST API (Verify Endpoint) با قالب ۴۱۸۱۵۵ |
| **وب‌پوش و اعلان** | Web Push API (پروتکل VAPID / RFC-8292) |
| **کامپایل سرور** | esbuild (تولید خروجی تک‌فایلی بهینه `dist/server.cjs`) |

---

## 📋 پیش‌نیازهای سیستمی (Prerequisites)

1. **Node.js**: نسخه `20.x` یا بالاتر — [دانلود Node.js](https://nodejs.org/)
2. **npm** (نسخه `10.x` یا بالاتر)
3. **Git**
4. *(در صورت استفاده از لاراول)*: **PHP 8.1+** به همراه Composer و اکستنشن‌های `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `curl`.

---

## 💻 راهنمای نصب و راه‌اندازی در ویندوز (Windows Setup)

```powershell
# ۱. دریافت سورس
git clone https://github.com/your-username/karovita.git
cd karovita

# ۲. نصب وابستگی‌ها
npm install

# ۳. ایجاد فایل تنظیمات محیطی
Copy-Item .env.example .env

# ۴. اجرای سرور توسعه
npm run dev
```
برنامه در آدرس `http://localhost:3000` در دسترس خواهد بود.

---

## 🚀 راهنمای جامع استقرار در محیط پروداکشن (Production)

### آماده‌سازی فایل‌های نهایی (Build)
پیش از هرگونه استقرار، در ریشه پروژه دستور زیر را اجرا کنید:
```bash
npm run build
```
این دستور:
- فرانت‌اند React را داخل پوشه `dist/` بیلد می‌کند (حاوی `index.html`، فایل‌های JS و CSS و Assets).
- بک‌اند Node.js را به عنوان یک فایل مستقل در `dist/server.cjs` کامپایل می‌کند.

---

### بخش الف: راهنمای استقرار روی هاست اشتراکی DirectAdmin (پیشنهادی)

هاست‌های اشتراکی DirectAdmin امکان اجرای فرانت‌اند React در کنار بک‌اند (چه نسخه **Laravel** و چه نسخه **Node.js**) را فراهم می‌کنند.

#### سناریو ۱: استقرار با بک‌اند لاراول (Laravel) و فرانت‌اند React

1. **آپلود کدهای لاراول:**
   - یک پوشه خارج از وب‌روت (مثلاً در `/home/username/laravel_api`) ایجاد کنید و فایل‌های پروژه لاراول را داخل آن قرار دهید.
   - دیتابیس MySQL را از بخش **MySQL Management** دایرکت‌ادمین بسازید و اطلاعات آن را در فایل `.env` لاراول وارد نمایید:
     ```env
     APP_ENV=production
     APP_DEBUG=false
     APP_URL=https://yourdomain.com
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_DATABASE=your_db_name
     DB_USERNAME=your_db_user
     DB_PASSWORD=your_db_password
     ```
   - دستورات مایگریشن را اجرا کنید:
     ```bash
     php artisan migrate --force
     ```

2. **تنظیم پوشه `public_html`:**
   - محتویات پوشه `dist/` حاصل از بیلد React را داخل `public_html` آپلود کنید.
   - پوشه `public` لاراول را در مسیری مثل `public_html/api` کپی کرده و فایل `index.php` آن را طوری تنظیم کنید که به مسیر `/home/username/laravel_api/vendor/autoload.php` و `/home/username/laravel_api/bootstrap/app.php` اشاره کند:
     ```php
     require __DIR__.'/../../laravel_api/vendor/autoload.php';
     $app = require_once __DIR__.'/../../laravel_api/bootstrap/app.php';
     ```

3. **تنظیم فایل `.htaccess` در `public_html` برای React (SPA Routing):**
   یک فایل `.htaccess` در ریشه `public_html` با محتوای زیر ایجاد کنید:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     
     # مسیرهای API را مستقیماً به پوشه api/ لاراول هدایت کن
     RewriteRule ^api/(.*)$ api/index.php [QSA,L]

     # سایر مسیرها را به index.html فرانت‌اند بفرست (SPA)
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

#### سناریو ۲: استقرار با Node.js در DirectAdmin (از طریق Setup Node.js App)

1. در پنل DirectAdmin به بخش **Setup Node.js App** (یا CloudLinux NodeJS Selector) بروید.
2. روی **Create Application** کلیک کنید:
   - **Node.js version:** نسخه `20.x` یا بالاتر را انتخاب کنید.
   - **Application mode:** روی `Production` قرار دهید.
   - **Application root:** مسیر پوشه پروژه (مثلاً `karovita_app`).
   - **Application startup file:** مقدار `dist/server.cjs` را وارد کنید.
3. فایل‌های بیلدشده پروژه (`package.json`, `dist/`, `data/`) را داخل پوشه مشخص‌شده آپلود کنید.
4. روی دکمه **Run NPM Install** کلیک کرده و سپس **Restart** را بزنید.

---

### بخش ب: راهنمای استقرار روی هاست اشتراکی cPanel

1. **ساخت برنامه Node.js:**
   - از بخش Software وارد **Setup Node.js App** شوید.
   - مشخصات: Node.js 20+، Startup file: `dist/server.cjs`.
2. **انتقال فایل‌ها:**
   - فایل‌های `dist/`, `data/`, `package.json`, `.env` را به پوشه اپلیکیشن انتقال دهید.
3. **تنظیم SSL:**
   - از بخش **Let's Encrypt SSL** یا **AutoSSL** گواهی رایگان دامنه را فعال نمایید.

---

### بخش ج: استقرار روی سرور لینوکس (VPS / اختصاصی) با PM2 و وب‌سرور Nginx

#### ۱. اجرای سرور با PM2
```bash
# نصب سراسری PM2
npm install -g pm2

# راه‌اندازی سرور پروداکشن
pm2 start dist/server.cjs --name "karovita-app" --env NODE_ENV=production

# ذخیره پروسه جهت اجرای خودکار پس از ریبوت
pm2 save
pm2 startup
```

#### ۲. کانفیگ Nginx به همراه SSL و کش‌لس کردن سرویس‌ورکر PWA
فایل کانفیگ در `/etc/nginx/sites-available/karovita.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # هدرهای امنیتی
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # جلوگیری از کش شدن سرویس‌ورکر PWA
    location = /sw.js {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
اجرای دستورات فعال‌سازی:
```bash
ln -s /etc/nginx/sites-available/karovita.conf /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

### بخش د: استقرار با Docker و Docker Compose

#### فایل `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

#### اجرای کانتینر:
```bash
docker build -t karovita-app .
docker run -d -p 3000:3000 --name karovita-container -v $(pwd)/data:/app/data karovita-app
```

---

## 🏛️ معماری و ساختار تبدیل به لاراول (Laravel Backend)

جهت تبدیل بک‌اند به Laravel بدون تغییر در فرانت‌اند React، روت‌های زیر در `routes/api.php` پیاده‌سازی شده‌اند:

### نگاشت روت‌های API (Route Mappings)

| متد | مسیر روت (Route URL) | کنترلر لاراول | توضیحات |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/send-otp` | `AuthController@sendOtp` | ارسال پیامک کد یکبارمصرف با SMS.ir |
| `POST` | `/api/auth/verify-otp` | `AuthController@verifyOtp` | بررسی کد و صدور توکن ورود (Bearer) |
| `GET` | `/api/auth/me` | `AuthController@me` | دریافت اطلاعات کاربر جاری |
| `GET` | `/api/user/profile` | `UserController@getProfile` | دریافت پروفایل کاربر |
| `GET` | `/api/user/company` | `UserController@getCompany` | دریافت اطلاعات شرکت کاربر |
| `POST` | `/api/user/company` | `UserController@saveCompany` | ثبت یا ویرایش مشخصات شرکت |
| `GET` | `/api/user/purchased-packages` | `UserController@getPurchasedPackages` | لیست اشتراک‌ها و پکیج‌های خریداری‌شده کاربر |
| `GET` | `/api/departments` | `TicketController@getDepartments` | لیست دپارتمان‌های پشتیبانی |
| `GET` | `/api/tickets` | `TicketController@index` | لیست تیکت‌های کاربر |
| `POST` | `/api/tickets` | `TicketController@store` | ثبت تیکت جدید |
| `GET` | `/api/tickets/{id}` | `TicketController@show` | دریافت پیام‌های یک تیکت |
| `POST` | `/api/tickets/{id}/reply` | `TicketController@reply` | ارسال پاسخ در تیکت |
| `POST` | `/api/orders/create` | `OrderController@create` | صدور فاکتور و ایجاد سفارش خرید |
| `GET` | `/api/admin/overview` | `AdminController@overview` | آمار کلان داشبورد و تراکنش‌های زنده |
| `GET` | `/api/admin/users` | `AdminController@users` | مدیریت کاربران و تغییر نقش‌ها |
| `GET` | `/api/admin/audit-logs` | `AdminController@auditLogs` | مشاهده لاگ‌های امنیتی و حسابرسی |

---

## ⚙️ تنظیم متغیرهای محیطی (.env)

| نام متغیر | توضیح | مقدار پیشنهادی |
| :--- | :--- | :--- |
| `NODE_ENV` | حالت اجرای سرور (`development` یا `production`) | `production` |
| `APP_KEY` | کلید محرمانه رمزنگاری توکن‌های ورود JWT | یک رشته تصادفی ۶۴ کاراکتری |
| `FRONTEND_URL` | دامنه دسترسی وب‌سایت | `https://yourdomain.com` |
| `SMS_DRIVER` | درایور ارسال پیامک (`sms_ir` یا `mediana` یا `log`) | `sms_ir` |
| `SMS_IR_API_KEY` | کلید API درگاه SMS.ir | `ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z` |
| `SMS_IR_TEMPLATE_ID` | شناسه قالب پیامک تأیید در SMS.ir | `418155` |
| `SMS_IR_PARAM_NAME` | نام متغیر داخل قالب SMS.ir | `CODE` |
| `VAPID_PUBLIC_KEY` | کلید عمومی وب‌پوش (اختیاری) | *تولید خودکار در صورت خالی بودن* |
| `VAPID_PRIVATE_KEY` | کلید خصوصی وب‌پوش (اختیاری) | *تولید خودکار در صورت خالی بودن* |
| `VAPID_SUBJECT` | ایمیل یا آدرس تماس صاحب وب‌پوش | `mailto:admin@karovita.ir` |

---

## 📁 ساختار پروژه (Project Structure)

```text
karovita/
├── server/                    # کدهای بک‌اند و API سرور (Node.js & Express)
│   ├── routes.ts              # مسیرهای اصلی API، احراز هویت، تیکت‌ها و سفارشات
│   ├── db.ts                  # لایه اتصال و مدیریت بانک داده
│   ├── smsService.ts          # سرویس ارسال پیامک OTP (SMS.ir / Mediana)
│   ├── webPush.ts             # ماژول ارسال اعلان وب (Web Push VAPID)
│   ├── errorLogger.ts         # سامانه ثبت محلی خطاهای برنامه
│   ├── auditLogger.ts         # سیستم ثبت لاگ‌های امنیتی و حسابرسی
│   └── rateLimiters.ts        # میدل‌ورهای جلوگیری از حملات Brute-Force
├── src/                       # کدهای فرانت‌اند (React 18 + Vite)
│   ├── components/            # کامپوننت‌های ماژولار رابط کاربری
│   │   ├── Admin/             # پنل‌های مدیریتی (قیمت‌گذاری، تیکت‌ها، لاگ‌ها، کاربران)
│   │   ├── Common/            # کامپوننت‌های مشترک (دکمه تم Dark/Light، بنر آفلاین و...)
│   │   ├── Dashboard/         # نمودارهای تحلیلی فروش با Recharts و آمارها
│   │   ├── PricingConfigurator/# فرم هوشمند محاسبه و انتخاب ماژول‌های ERP
│   │   ├── Subscription/      # پنجره جزئیات پکیج و کارت‌های اشتراک
│   │   └── Tickets/           # رابط تیکتینگ مشتریان و کارشناسان پشتیبانی
│   ├── styles/                # استایل‌های سراسری، تم تاریک/روشن و PWA
│   ├── App.jsx                # کامپوننت اصلی و مسیریابی
│   └── main.jsx               # نقطه ورود React و رندر برنامه
├── data/                      # ذخیره‌سازی داده‌های محلی و فایل‌های لاگ
│   ├── db.json                # پایگاه داده JSON در حالت خام
│   ├── vapid.json             # کلیدهای وب‌پوش
│   └── error_logs.json        # لاگ‌های خطای سامانه
├── public/                    # فایل‌های استاتیک، مانیفست PWA، سرویس‌ورکر (sw.js)
├── .env.example               # فایل نمونه متغیرهای محیطی
├── package.json               # اطلاعات پکیج‌ها و اسکریپت‌های پروژه
├── tsx / vite.config.js       # کانفیگ‌های کامپایل و بیلد
└── README.md                  # مستندات کامل پروژه
```

---

## 👑 اطلاعات مدیر ارشد و حساب پیش‌فرض

کلیه داده‌های تستی و ساختگی پاک‌سازی شده و پایگاه داده در وضعیت خام با تنها کاربر مدیر ارشد فعال است:

| نقش | شماره موبایل | نام مدیر | دسترسی‌ها |
| :--- | :--- | :--- | :--- |
| **مدیر ارشد (Super Admin)** | `09111273476` | اردلان داوودی | دسترسی کامل به داشبورد، مدیریت تعرفه‌ها، تیکت‌ها، کاربران و لاگ‌ها |

---

## ⚡ دستورات کاربردی (Scripts)

| دستور | عملکرد |
| :--- | :--- |
| `npm run dev` | اجرای همزمان کلاینت و سرور با Hot-Reload برای محیط توسعه |
| `npm run build` | کامپایل کامل فرانت‌اند و ایجاد سرور تک‌فایلی پروداکشن در `dist/` |
| `npm start` | اجرای نسخه بیلدشده پروداکشن (`node dist/server.cjs`) |

---

**توسعه‌یافته برای سامانه کارویتا (KaroVita Cloud ERP)**  
جهت انتقال به مخزن گیت‌هاب:
```bash
git add .
git commit -m "docs: update production deployment guides and changelog"
git push -u origin main
```
