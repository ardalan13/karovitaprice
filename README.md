# 🚀 سامانه یکپارچه مدیریت کسب‌وکار کارویتا (KaroVita Cloud ERP Platform)

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0-339933.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com/)
[![Laravel](https://img.shields.io/badge/Laravel-10.x%20%2F%2011.x-FF2D20.svg)](https://laravel.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Enabled-orange.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

یک پلتفرم مدرن، جامع و پرسرعت برای **محاسبه هوشمند تعرفه و شخصی‌سازی ماژول‌های ERP**، **صدور صورتحساب‌های رسمی الکترونیکی مطابق استانداردهای سازمان امور مالیاتی کشور و سامانه مودیان**، **انعقاد و صدور قراردادهای رسمی لایسنس و سطح خدمات ابری (SLA)**، **درگاه پرداخت آنلاین زیبال و شاپرک با صدور رسید تراکنش**، **سیستم جامع تیکتینگ و پشتیبانی دپارتمانی**، **احراز هویت پیامکی OTP با SMS.ir و مدیانا**، **وب‌اپلیکیشن پیش‌رونده (PWA) به همراه پوش نوتیفیکیشن بلادرنگ (Web-Push)**، و **پنل مدیریت ارشد مالی با نمودارهای تحلیلی زنده**.

---

## 📑 فهرست مطالب
1. [ویژگی‌ها و قابلیت‌های کلیدی](#-ویژگی‌ها-و-قابلیت‌های-کلیدی)
2. [پشته فناوری و معماری سیستم](#-پشته-فناوری-و-معماری-سیستم-tech-stack)
3. [پیش‌نیازهای اجرا و نصب](#-پیش‌نیازهای-سیستم-prerequisites)
4. [راهنمای راه‌اندازی سریع در محیط توسعه (Quick Start)](#-راهنمای-راه‌اندازی-سریع-در-محیط-توسعه-quick-start)
5. [راهنمای استقرار در سرور عملیاتی (Production Deployment)](#-راهنمای-استقرار-در-سرور-عملیاتی-production)
   - [استقرار فول‌استک Node.js + Vite با Nginx و PM2](#۱-استقرار-فول‌استک-nodejs--pm2--nginx-پیشنهادی)
   - [استقرار روی هاست اشتراکی DirectAdmin (با بک‌اند لاراول)](#۲-استقرار-روی-هاست-اشتراکی-directadmin-با-backend-لاراول)
   - [استقرار روی هاست اشتراکی cPanel](#۳-استقرار-روی-هاست-اشتراکی-cpanel)
6. [تنظیم متغیرهای محیطی (.env)](#-تنظیم-متغیرهای-محیطی-environment-variables)
7. [مستندات روت‌ها و اندپوینت‌های API](#-مستندات-کامل-اندپوینت‌های-api)
8. [ساختار فایل‌ها و پوشه‌بندی پروژه](#-ساختار-فایل‌ها-و-پوشه‌بندی-پروژه)
9. [دستورات کاربردی گیت برای انتشار](#-دستورات-کاربردی-گیت-برای-انتشار)

---

## 🌟 ویژگی‌ها و قابلیت‌های کلیدی

### ۱. محاسبه‌گر داینامیک و سفارش‌سازی ماژول‌های ERP
- انتخاب ماژولار ماژول‌ها (CRM، انبارداری، حسابداری، فروش، پرسنلی، اتوماسیون اداری و...).
- سیستم هوشمند بررسی پیش‌نیازها و وابستگی ماژول‌ها.
- پشتیبانی از پکیج‌های پیش‌فرض اصناف و محاسبه تخفیف‌های دوره‌ای ماهانه و سالانه.
- دکمه هدایت مستقیم به پرتال اختصاصی ERP (`https://crm.karovita.ir`).

### ۲. فاکتورهای رسمی الکترونیکی دارایی و قراردادهای SLA
- **انطباق با ماده ۱۶۹ م.م و سامانه مودیان:** صدور صورتحساب با سربرگ استاندارد دارایی، شناسه یکتای مالیاتی ۲۲ کاراکتری، کد اقتصادی ۱۲ رقمی، شماره ثبت، شناسه ملی و کد پستی ده‌رقمی طرفین.
- **محاسبه ۱۰٪ مالیات بر ارزش افزوده و عوارض:** تفکیک دقیق مبلغ پایه، تخفیف، مالیات و تبدیل خودکار ارقام نهایی به حروف فارسی.
- **قرارداد رسمی لایسنس و سطح خدمات (SLA):** تولید هوشمند متن قرارداد با مفاد تعهدات، لایسنس، پایداری ۹۹.۵٪ ابری و شرایط پشتیبانی.
- **خروجی آماده چاپ و PDF:** سازگار با قطع A4 و دارای استایل اختصاصی پرینت، QR Code و بارکد استعلام.
- **مدیریت اطلاعات حقوقی خریدار:** امکان ثبت و ویرایش مشخصات ثبتی و اقامتگاه قانونی شرکت توسط مشتری.

### ۳. درگاه پرداخت آنلاین زیبال و شاپرک (Zibal Payment Gateway)
- اتصال مستقیم به درگاه پرداخت اینترنتی زیبال (شاپرک) با قابلیت سوئیچ بین حالت تستی (Sandbox) و عملیاتی.
- فرآیند بررسی و استعلام مجدد وضعیت تراکنش (Inquiry & Verification).
- صفحه رسید پرداخت با ریز جزییات، شماره پیگیری بانکی، کد مرجع و امکان چاپ رسید آنلاین.

### ۴. احراز هویت پیامکی سریع (OTP Authentication)
- درگاه پیامک سریع SMS.ir با قالب اختصاصی (`418155`) و پترن `#CODE#`.
- درگاه پشتیبان پیامک مدیانا / IPPanel Pattern.
- کنترل هوشمند تعداد تلاش‌ها (Rate Limiting)، انقضای زمان کد (TTL) و صدور توکن امنیتی Bearer.

### ۵. سیستم تیکتینگ و پشتیبانی دپارتمانی
- ثبت تیکت با تفکیک دپارتمان‌ها (فروش، فنی، مالی، مدیریت) و اولویت‌بندی.
- اتصال مستقیم تیکت به سفارش‌ها و پکیج‌های خریداری‌شده واقعی کاربر.
- جستجوی پیشرفته، تغییر وضعیت و ابزار پاسخگویی کارشناسان پشتیبانی.

### ۶. وب‌اپلیکیشن پیش‌رونده (PWA) و اعلان‌های بلادرنگ (Web-Push)
- امکان نصب روی گوشی‌های همراه (Android / iOS) و دسکتاپ.
- دریافت اعلان‌های فوری تیکت، تایید تراکنش و رویدادهای مالی از طریق VAPID Push API.

### ۷. پنل مدیریت ارشد با آمار و نمودارهای مالی زنده
- داشبورد جامع با نمودارهای تعاملی Recharts برای نمایش درآمد، تعداد تراکنش‌ها و روند عملکرد ماژول‌ها.
- مدیریت کاربران، تخصیص نقش‌های Admin / User و فعال/مسدودسازی حساب‌ها.
- ثبت لاگ‌های حسابرسی (Audit Logging) و مانیتورینگ امنیتی.

---

## 🛠️ پشته فناوری و معماری سیستم (Tech Stack)

| بخش | ابزار و کتابخانه‌ها | توضیحات |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18.3, Vite 5.4, Lucide Icons, Recharts** | فرانت‌اند مدرن، کامپوننت‌محور، سبک و فوق‌سریع |
| **Node.js Backend** | **Express 4.21, TypeScript 5, Helmet, Rate-Limit** | سرور فول‌استک پیش‌فرض با قابلیت بیلد یکپارچه CJS |
| **PHP Backend** | **PHP 8.1+ / Laravel 10.x & 11.x (REST API)** | بک‌اند جایگزین برای هاست‌های سنتی اشتراکی |
| **Database** | **SQLite / MySQL 5.7+ / MariaDB** | ذخیره‌سازی اطلاعات، سفارش‌ها، تیکت‌ها و لاگ‌ها |
| **Payment Gateway** | **Zibal API (Rest & Webhook Verified)** | پرداخت شاپرک با پشتیبانی از سندباکس و استعلام |
| **SMS Gateway** | **SMS.ir Verify API & Mediana IPPanel** | ارسال فوق‌سریع OTP بر پایه الگو |
| **Security & Auth** | **JWT / Bearer Token & Audit Logger** | احراز هویت توکن‌محور همراه با ثبت لاگ عملیات حساس |

---

## 📋 پیش‌نیازهای سیستم (Prerequisites)

- **Node.js:** نسخه `18.0.0` یا بالاتر (`node -v`)
- **NPM:** نسخه `9.0.0` یا بالاتر (`npm -v`)
- *(اختیاری)* **PHP 8.1+ & Composer:** در صورت تمایل به استفاده از سورس لاراول در پوشه `backend/`

---

## ⚡ راهنمای راه‌اندازی سریع در محیط توسعه (Quick Start)

### ۱. کلون کردن مخزن گیت
```bash
git clone https://github.com/your-username/karovita-cloud-erp.git
cd karovita-cloud-erp
```

### ۲. نصب وابستگی‌های Node.js
```bash
npm install
```

### ۳. آماده‌سازی فایل تنظیمات محیطی (.env)
یک نسخه از فایل `.env.example` با نام `.env` ایجاد کنید:
```bash
cp .env.example .env
```
*(مقادیر دلخواه مانند کلید SMS.ir، کلید زیبال و پورت را در صورت نیاز ویرایش نمایید)*

### ۴. اجرای سرور توسعه (Dev Server)
```bash
npm run dev
```
سامانه بلافاصله روی پورت ۳۰۰۰ در آدرس زیر در دسترس خواهد بود:  
👉 **http://localhost:3000**

---

## 🚀 راهنمای استقرار در سرور عملیاتی (Production)

### ۱. استقرار فول‌استک Node.js + PM2 + Nginx (پیشنهادی)

#### الف) ایجاد خروجی بهینه‌شده بیلد (Production Build):
```bash
npm run build
```
این دستور کدهای React را بیلد کرده و سرور TypeScript را در یک فایل فشرده `dist/server.cjs` خروجی می‌گیرد.

#### ب) مدیریت فرآیند با PM2:
```bash
npm install -g pm2
pm2 start dist/server.cjs --name "karovita-erp"
pm2 save
pm2 startup
```

#### ج) نمونه تنظیمات وب‌سرور Nginx (Reverse Proxy + SSL):
```nginx
server {
    listen 80;
    server_name yourdomain.ir www.yourdomain.ir;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.ir www.yourdomain.ir;

    ssl_certificate /etc/letsencrypt/live/yourdomain.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.ir/privkey.pem;

    # امنیت و هدرها
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # عدم کش شدن فایل سرویس ورکر PWA
    location = /sw.js {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }
}
```

---

### ۲. استقرار روی هاست اشتراکی DirectAdmin (با Backend لاراول)

اگر می‌خواهید از بک‌اند PHP لاراول موجود در پوشه `backend/` استفاده کنید:

1. دیتابیس MySQL جدیدی در دایرکت‌ادمین بسازید.
2. محتوای پوشه `backend/` را در شاخه ریشه اکانت (`/home/username/backend`) آپلود کنید.
3. فایل `.env` لاراول را تنظیم کرده و دستور مایگریشن را اجرا کنید:
   ```bash
   cd /home/username/backend
   php artisan migrate --seed --force
   ```
4. با دستور `npm run build` فرانت‌اند را بیلد کنید و محتوای پوشه `dist/` را داخل `public_html` قرار دهید.
5. فایل `public_html/.htaccess` را به شکل زیر تنظیم کنید تا روت‌های `/api` به لاراول هدایت شوند:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^api/(.*)$ api/index.php [QSA,L]
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

### ۳. استقرار روی هاست اشتراکی cPanel

1. از بخش **Setup Node.js App** نسخه Node 18+ را انتخاب کنید.
2. دستور `npm run build` را اجرا کرده و فایل `dist/server.cjs` را به عنوان Application Startup File تعیین کنید.
3. پورت اجرای برنامه را مشخص نموده و دکمه **Restart App** را بزنید.

---

## ⚙️ تنظیم متغیرهای محیطی (Environment Variables)

تمامی پارامترهای قابل تنظیم در فایل `.env.example` درج گردیده‌اند:

| نام متغیر | نوع | مقدار پیش‌فرض | توضیحات |
| :--- | :--- | :--- | :--- |
| `APP_ENV` | String | `production` | محیط اجرای برنامه (`development` / `production`) |
| `APP_KEY` | String | *کلید اختصاصی* | کلید محرمانه جهت تولید و اعتبارسنجی توکن‌های JWT |
| `PORT` | Number | `3000` | پورت گوش دادن وب‌سرور |
| `PAYMENT_DRIVER` | String | `zibal` | درایور پرداخت آنلاین فعال |
| `ZIBAL_MERCHANT_KEY` | String | `zibal` | مرچنت‌کد اختصاصی درگاه پرداخت زیبال (برای تست: `zibal`) |
| `ZIBAL_CALLBACK_URL` | String | `/api/payment/zibal/callback` | آدرس کال‌بک بازگشت تراکنش از شاپرک |
| `ZIBAL_SANDBOX` | Boolean | `true` | فعال‌سازی حالت سندباکس و شبیه‌ساز پرداخت |
| `SMS_DRIVER` | String | `sms_ir` | درایور پیامک (`sms_ir` یا `mediana`) |
| `SMS_IR_API_KEY` | String | *کلید درگاه* | کلید وب‌سرویس سریع SMS.ir |
| `SMS_IR_TEMPLATE_ID` | String | `418155` | شناسه پترن تایید کد در SMS.ir |
| `SMS_IR_PARAM_NAME` | String | `CODE` | متغیر حاوی کد OTP در الگو |
| `VAPID_PUBLIC_KEY` | String | *کلید عمومی* | کلید عمومی VAPID برای اعلان‌های وب |
| `VAPID_PRIVATE_KEY` | String | *کلید خصوصی* | کلید خصوصی VAPID وب‌پوش |

---

## 🏛️ مستندات کامل اندپوینت‌های API

### 🔑 احراز هویت و کاربران (Auth & Profile)
- `POST /api/auth/send-otp` : ارسال کد یکبار مصرف پیامکی
- `POST /api/auth/verify-otp` : اعتبارسنجی کد ۵ رقمی و صدور توکن ورود
- `GET /api/auth/me` : مشخصات کاربر لاگین‌شده
- `GET /api/user/profile` : دریافت اطلاعات کاربری
- `PUT /api/user/profile` : ویرایش مشخصات و ایمیل
- `GET /api/user/company` : دریافت اطلاعات حقوقی و اقتصادی شرکت
- `PUT /api/user/company` : ثبت و ذخیره مشخصات ثبتی، کد اقتصادی و شناسه ملی خریدار
- `GET /api/user/orders` : لیست سفارش‌ها و فاکتورهای کاربر

### 📑 فاکتورهای رسمی دارایی و قراردادها (Tax Invoices & Contracts)
- `GET /api/invoices/:id` : مشاهده و چاپ استاندارد صورتحساب رسمی الکترونیکی دارایی (با ارزش افزوده، شناسه مالیاتی، QR)
- `GET /api/invoices/:id/contract` : مشاهده و دریافت رسمی قرارداد خدمات ابری و لایسنس (SLA)
- `GET /api/invoices/:id/data` : دریافت ساختار JSON جزییات مالیاتی و محاسبات به تفکیک ارزش افزوده

### 💳 درگاه پرداخت آنلاین زیبال (Zibal Payment)
- `POST /api/payment/zibal/init` : ایجاد تراکنش جدید و دریافت آدرس هدایت به درگاه شاپرک
- `GET /api/payment/zibal/callback` : پردازش بازگشت از درگاه، اعتبارسنجی شاپرک و تسویه سفارش
- `GET /api/payment/zibal/inquiry/:trackId` : استعلام وضعیت تراکنش از سرور زیبال
- `GET /api/payment/online-receipt` : صفحه رسمی رسید پرداخت اینترنتی با کد پیگیری بانکی

### 🎫 سیستم تیکتینگ (Support Ticketing)
- `GET /api/departments` : لیست دپارتمان‌های پشتیبانی (فروش، فنی، مالی، ...)
- `GET /api/tickets` : تیکت‌های ثبت‌شده کاربر
- `POST /api/tickets` : ایجاد تیکت جدید متصل به پکیج/سفارش
- `GET /api/tickets/:id` : مشاهده پیام‌های تیکت
- `POST /api/tickets/:id/reply` : ارسال پاسخ جدید
- `PATCH /api/tickets/:id/close` : بستن تیکت

### 📊 پنل مدیریت ارشد (Admin Portal)
- `GET /api/admin/overview` : آمار کلان سیستم و داده‌های آماری نمودار فروش ماهانه
- `GET /api/admin/users` : مدیریت و لیست کامل کاربران با کنترل دسترسی
- `PUT /api/admin/users/:id/role` : تغییر نقش کاربر (ادمین / کاربر عادی)
- `PUT /api/admin/users/:id/status` : مسدود یا فعال‌سازی کاربر
- `GET /api/admin/tickets` : مدیریت و پاسخگویی به کلیه تیکت‌های پشتیبانی
- `GET /api/admin/audit-logs` : گزارش لاگ‌های حسابرسی و دسترسی‌های حساس
- `POST /api/admin/pricing/save` : بروزرسانی تعرفه‌ها و قیمت ماژول‌ها

---

## 📁 ساختار فایل‌ها و پوشه‌بندی پروژه

```text
karovita-cloud-erp/
├── server/                          # ماژول‌های سرور فول‌استک
│   ├── routes.ts                    # روت‌ها و کنترلرهای Express
│   ├── taxInvoiceService.ts         # موتور تولید فاکتور رسمی دارایی و قرارداد SLA
│   ├── zibalService.ts              # سرویس یکپارچه‌سازی درگاه پرداخت زیبال
│   ├── smsService.ts                # سرویس ارسال پیامک OTP (SMS.ir و مدیانا)
│   ├── memoryDb.ts                  # پایگاه داده ساختاریافته و ماژول‌ها
│   ├── auditLogger.ts               # سیستم ثبت رویدادها و مانیتورینگ امنیتی
│   └── healthCheck.ts               # ناظر سلامت سرور و سرویس‌ها
├── src/                             # فرانت‌اند مدرن React 18 + Vite
│   ├── components/
│   │   ├── Admin/                   # ماژول‌های پنل مدیریت، کاربران و لاگ‌ها
│   │   ├── Dashboard/               # نمودارهای تحلیلی فروش (Recharts)
│   │   ├── Landing/                 # صفحه اصلی و معرفی پلتفرم
│   │   ├── Payments/                # فاکتورها، مودال پرداخت زیبال و اطلاعات حقوقی
│   │   ├── PricingConfigurator/     # محاسبه‌گر پویا و انتخاب ماژول‌های ERP
│   │   ├── Subscription/            # مدیریت پکیج‌ها و اشتراک‌ها
│   │   └── Tickets/                 # سیستم پشتیبانی و تیکتینگ دپارتمانی
│   ├── services/                    # لایه کلاینت API و ارتباط با سرور
│   ├── App.jsx                      # روتینگ اصلی اپلیکیشن
│   └── main.jsx                     # نقطه ورودی کلاینت
├── backend/                         # سورس بک‌اند جایگزین لاراول (PHP Laravel 10/11)
├── public/                          # لوگوها، مانیفست PWA، سرویس‌ورکر و آیکون‌ها
├── .env.example                     # راهنمای متغیرهای محیطی
├── .gitignore                       # فایل عدم ثبت فایل‌های حساس و بیلد در گیت
├── package.json                     # اسکریپت‌ها و وابستگی‌های پروژه
├── server.ts                        # نقطه ورود سرور Node.js Express
└── README.md                        # مستندات و راهنمای جامع پروژه
```

---

## 🐙 دستورات کاربردی گیت برای انتشار

برای انتشار تغییرات در مخزن Git (GitHub / GitLab):

```bash
# ۱. بررسی وضعیت فایل‌ها
git status

# ۲. افزودن فایل‌ها به استیج
git add .

# ۳. ثبت کامیت استاندارد
git commit -m "feat: release v2.0.0 with tax invoice system, zibal gateway, SLA contracts and updated documentation"

# ۴. ارسال به شاخه اصلی مخزن
git push -u origin main
```

---

**توسعه‌یافته با ❤️ برای سامانه ابری کارویتا (KaroVita Cloud ERP)**  
📧 پشتیبانی و ارتباط: `ardalan.davodi@gmail.com`
