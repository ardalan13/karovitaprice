# 🚀 سامانه جامع کارویتا (KaroVita Cloud ERP & Customer Portal)

[![PHP Version](https://img.shields.io/badge/PHP-%3E%3D8.1-777BB4.svg)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-10.x%20%2F%2011.x-FF2D20.svg)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7%2B%20%2F%208.0-4479A1.svg)](https://www.mysql.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

یک پلتفرم کامل و مدرن سازمانی با **بک‌اند PHP Laravel (REST API)** و **فرانت‌اند مدرن React** برای **محاسبه هوشمند قیمت و تعرفه ماژول‌های ERP**، **خرید و مدیریت اشتراک‌های سازمانی**، **ورود مستقیم به پنل ERP با ساب‌دامین اختصاصی (`crm.karovita.ir`)**، **وب‌اپلیکیشن پیش‌رونده (PWA)**، **سیستم جامع تیکتینگ و پشتیبانی دپارتمانی**، **پنل مدیریت ارشد ماژولار با نمودارهای زنده مالی**، **درگاه پیامک سریع OTP با SMS.ir**، و **سامانه امنیتی و حسابرسی لاگ‌ها (Audit Logger)**.

---

## 📑 فهرست مطالب
1. [معرفی و امکانات کلیدی](#-امکانات-و-قابلیت‌های-کلیدی)
2. [معماری و پشته فناوری (Tech Stack)](#-معماری-و-پشته-فناوری-tech-stack)
3. [پیش‌نیازهای سرور و هاست](#-پیش‌نیازهای-سرور-و-هاست-prerequisites)
4. [راهنمای جامع نصب و استقرار روی هاست اشتراکی DirectAdmin (پیشنهادی)](#-راهنمای-استقرار-روی-هاست-اشتراکی-directadmin-پیشنهادی)
5. [راهنمای استقرار روی هاست اشتراکی cPanel](#-راهنمای-استقرار-روی-هاست-اشتراکی-cpanel)
6. [راهنمای نصب روی سرور لینوکس اختصاصی / VPS (Nginx / Apache + PHP-FPM)](#-راهنمای-استقرار-روی-سرور-لینوکس-vps--اختصاصی)
7. [معماری روت‌ها و کنترلرهای Laravel](#-معماری-روت‌ها-و-کنترلرهای-laravel)
8. [تنظیم متغیرهای محیطی لاراول (.env)](#-تنظیم-متغیرهای-محیطی-laravel-env)
9. [ساختار فایل‌ها و پوشه‌های پروژه](#-ساختار-پروژه-project-structure)
10. [اطلاعات مدیر ارشد و حساب پیش‌فرض](#-اطلاعات-مدیر-ارشد-و-حساب-پیشفرض)
11. [دستورات کاربردی Artisan و Composer](#-دستورات-کاربردی-artisan-و-composer)

---

## 🌟 امکانات و قابلیت‌های کلیدی

### ۱. پورتال مشتریان و مدیریت اشتراک
* 🧮 **محاسبه‌گر داینامیک تعرفه ERP:** انتخاب ماژولار ماژول‌ها (CRM، انبار، حسابداری، فروش، پرسنلی و...) با بررسی پیش‌نیازهای هوشمند و بسته‌های اصناف.
* 📦 **خرید و فعال‌سازی اشتراک:** انتخاب دوره‌های ماهانه و سالانه با اعمال تخفیف و فعال‌سازی دوره ۵ روزه رایگان.
* 🔗 **دسترسی سریع به پنل سازمانی:** اتصال دکمه «ورود به پنل شخصی ERP» مستقیماً به پرتال سامانه (`https://crm.karovita.ir`).
* 🌓 **پشتیبانی کامل از تم روشن و تاریک (Dark/Light Mode):** با لود پیش‌فرض در حالت روز (Light Mode) و دکمه تغییر وضعیت.

### ۲. سیستم پیامک OTP و احراز هویت سریع
* 📲 **درگاه پیامک SMS.ir (Fast Send / Verify REST API):** ارسال آنی کدهای یکبارمصرف با شناسه قالب اختصاصی (`418155`) و پارامتر `#CODE#`.
* 🛡️ **کنترل امنیتی و صدور توکن Bearer:** احراز هویت بدون سشن سنتی از طریق جدول `auth_tokens` سازگار با SPA و PWA.

### ۳. سیستم جامع پشتیبانی و تیکتینگ (Ticketing System)
* 🎫 **ثبت و پیگیری تیکت:** تفکیک دپارتمان‌ها (فروش، فنی، مالی، مدیریت)، وضعیت‌ها و اولویت‌ها.
* 📦 **اتصال هوشمند به خریدهای واقعی کاربر:** نمایش اختصاصی پکیج‌ها و اشتراک‌های خریداری‌شده کاربر در فرم ثبت تیکت.
* 🔍 **جستجو و فیلتر پیشرفته:** امکان جستجوی سریع شماره تیکت، موضوع، دپارتمان و نام کاربر با تبدیل خودکار ارقام فارسی/انگلیسی.
* 👨‍💼 **پنل ادمین تیکت‌ها:** پاسخگویی، تغییر وضعیت و ابزار اختصاصی پاک‌سازی تیکت‌های تستی.

### ۴. پنل مدیریت ارشد و آمار مالی زنده
* 📈 **نمودار روند عملکرد فروش و درآمد ماهانه (`SalesPerformanceChart`):** نمودار مقایسه‌ای و تحلیلی با قابلیت سوئیچ بین حالت‌های هفتگی، روزانه و تفکیک ماژول‌ها، متصل به دیتابیس تراکنش‌های لاراول.
* ⚙️ **مدیریت کامل قیمت‌گذاری و ماژول‌ها:** افزودن، ویرایش قیمت ماژول‌ها، تعریف اصناف و کدهای تخفیف.
* 👥 **مدیریت کاربران و نقش‌ها:** مشاهده لیست کاربران و تخصیص نقش‌های Admin / User.
* 🛡️ **ثبت لاگ‌های حسابرسی (Audit Logging):** مانیتورینگ کلیه رخدادهای حساس و ثبت در جدول `audit_logs`.

---

## 🛠️ معماری و پشته فناوری (Tech Stack)

| بخش | تکنولوژی | توضیحات |
| :--- | :--- | :--- |
| **بک‌اند (Backend)** | **PHP 8.1+ / 8.2+ & Laravel (10.x / 11.x)** | توسعه‌یافته بر پایه معماری ماژولار MVC و RESTful API |
| **فرانت‌اند (Frontend)** | **React 18.3 & Vite 5.4** | کامپوننت‌های ماژولار، Lucide React، Recharts و PWA |
| **پایگاه داده (Database)** | **MySQL 5.7+ / MariaDB 10.3+** | مایگریشن‌های استاندارد Eloquent ORM |
| **احراز هویت (Auth)** | **Bearer API Token Authentication** | جدول اختصاصی `auth_tokens` با تاریخ انقضا |
| **درگاه پیامک OTP** | **SMS.ir REST API (Verify Endpoint)** | ارسال فوق سریع پترنی با قالب ۴۱۸۱۵۵ |
| **وب‌سرور پشتیبانی‌شده** | **Apache (mod_rewrite) / Nginx / LiteSpeed** | کاملاً سازگار با DirectAdmin و cPanel |

---

## 📋 پیش‌نیازهای سرور و هاست (Prerequisites)

پیش از نصب، از فعال بودن موارد زیر در هاست یا سرور اطمینان حاصل کنید:
1. **PHP:** نسخه `8.1` یا `8.2` یا `8.3` (قابل انتخاب از منوی Select PHP Version در دایرکت‌ادمین یا سی‌پنل)
2. **اکستنشن‌های PHP فعال:**
   - `pdo_mysql`
   - `mbstring`
   - `openssl`
   - `tokenizer`
   - `xml`
   - `ctype`
   - `json`
   - `bcmath`
   - `curl`
3. **دیتابیس:** MySQL 5.7+ یا MariaDB 10.3+
4. **Composer** (برای نصب وابستگی‌های PHP در صورت دسترسی به SSH یا ترمینال)

---

## 🚀 راهنمای استقرار روی هاست اشتراکی DirectAdmin (پیشنهادی)

در هاست‌های اشتراکی با کنترل پنل DirectAdmin، به دلیل ساختار امنیتی استاندارد، کدهای لاراول در خارج از وب‌روت قرار می‌گیرند و فرانت‌اند React در `public_html` قرار می‌گیرد.

### ساختار پوشه‌بندی در هاست دایرکت‌ادمین:

```text
/home/username/
├── backend/                  <-- کدهای کامل پروژه لاراول (پشت وب‌روت جهت امنیت)
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── .env                  <-- متصل به دیتابیس MySQL
│   └── ...
└── public_html/              <-- پوشه در دسترس عموم
    ├── index.html            <-- فایل خروجی بیلد React
    ├── assets/               <-- فایل‌های CSS و JS فرانت‌اند React
    ├── .htaccess             <-- ریدایرکت خودکار SPA Routing و هدایت /api/ به لاراول
    └── api/                  <-- پوشه فایل ایندکس لاراول
        ├── index.php         <-- اشاره به ../backend/public/index.php
        └── .htaccess
```

### مراحل گام‌به‌گام نصب در DirectAdmin:

#### گام ۱: ساخت پایگاه داده MySQL
1. وارد کنترل پنل **DirectAdmin** شوید.
2. از منوی **MySQL Management** (یا Database Management) گزینه **Create New Database** را بزنید.
3. یک دیتابیس، نام کاربری و رمز عبور قوی ایجاد نمایید (مثال: `user_karovita`).

#### گام ۲: آپلود کدهای لاراول (Backend)
1. وارد **File Manager** شوید.
2. در مسیر `/home/username/` (یک مرحله قبل از `public_html`) یک پوشه با نام `backend` بسازید.
3. محتویات پوشه `backend/` پروژه را داخل این پوشه آپلود و اکسترکت کنید.
4. فایل `.env` را در پوشه `backend` ایجاد کرده و مشخصات دیتابیس را وارد نمایید:
   ```env
   APP_NAME=KaroVita
   APP_ENV=production
   APP_KEY=base64:XyZ...GeneratedKey...
   APP_DEBUG=false
   APP_URL=https://your-domain.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=user_karovita
   DB_USERNAME=user_dbuser
   DB_PASSWORD=YourSecurePassword123!

   SMS_DRIVER=sms_ir
   SMS_IR_API_KEY=ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z
   SMS_IR_TEMPLATE_ID=418155
   SMS_IR_PARAM_NAME=CODE
   ```

#### گام ۳: اجرای مایگریشن‌ها و سیدر پیش‌فرض
از طریق ترمینال یا SSH (و یا اجرای اسکریپت PHP):
```bash
cd /home/username/backend
php artisan migrate --seed --force
```
*(تمامی ۱۰ جدول پایگاه داده به همراه اطلاعات کاربر مدیر ارشد و ماژول‌های تعرفه ساخته می‌شوند)*

#### گام ۴: راه‌اندازی نقطه ورود API در `public_html/api`
1. در پوشه `public_html`، یک ساب‌فولدر با نام `api` بسازید.
2. یک فایل با نام `index.php` در داخل `public_html/api/` ایجاد کرده و محتوای زیر را در آن قرار دهید:
   ```php
   <?php
   use Illuminate\Contracts\Http\Kernel;
   use Illuminate\Http\Request;

   define('LARAVEL_START', microtime(true));

   require __DIR__.'/../../backend/vendor/autoload.php';
   $app = require_once __DIR__.'/../../backend/bootstrap/app.php';

   $kernel = $app->make(Kernel::class);

   $response = $kernel->handle(
       $request = Request::capture()
   )->send();

   $kernel->terminate($request, $response);
   ```
3. فایل `public_html/api/.htaccess` را بسازید:
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteRule ^ index.php [L]
   </IfModule>
   ```

#### گام ۵: آپلود فرانت‌اند React در `public_html`
1. فایل‌های حاصل از بیلد فرانت‌اند React (شامل `index.html`، پوشه `assets/`، `manifest.json` و `sw.js`) را مستقیماً داخل `public_html` قرار دهید.
2. فایل `.htaccess` اصلی در `public_html` را به این صورت تنظیم نمایید تا مسیریابی React Router بدون خطا کار کند:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /

     # مسیرهای API را به پوشه لاراول هدایت کن
     RewriteRule ^api/(.*)$ api/index.php [QSA,L]

     # فرانت‌اند تک‌صفحه‌ای React (SPA)
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## 🌐 راهنمای استقرار روی هاست اشتراکی cPanel

1. از بخش **MySQL Databases** دیتابیس و یوزر مربوطه را بسازید.
2. پوشه `backend/` را در شاخه ریشه اکانت (`/home/username/backend`) قرار دهید.
3. در فایل `.env` لاراول مقادیر `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` را تنظیم کنید.
4. در **Terminal** داخل cPanel دستور زیر را اجرا کنید:
   ```bash
   php artisan migrate --seed --force
   ```
5. فایل‌های بیلدشده React را در `public_html` آپلود کرده و فایل `public_html/.htaccess` را مطابق بخش DirectAdmin قرار دهید.

---

## 🖥️ راهنمای استقرار روی سرور لینوکس (VPS / اختصاصی)

کانفیگ وب‌سرور **Nginx** به همراه **PHP-FPM**:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/karovita/public_html;
    index index.html index.php;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # هدرهای امنیتی
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # روت‌های API لاراول
    location /api {
        alias /var/www/karovita/backend/public;
        try_files $uri $uri/ @laravel;
        
        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME /var/www/karovita/backend/public/index.php;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        }
    }

    location @laravel {
        rewrite /api/(.*)$ /api/index.php?/$1 last;
    }

    # فرانت‌اند React (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # عدم کش شدن سرویس‌ورکر PWA
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }
}
```

---

## 🏛️ معماری روت‌ها و کنترلرهای Laravel

تمامی اندپوینت‌های پروژه در فایل `backend/routes/api.php` تعریف شده و با کنترلرهای اختصاصی زیر مدیریت می‌شوند:

| متد HTTP | آدرس روت (Route) | کنترلر و اکشن | توضیحات |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/send-otp` | `AuthController@sendOtp` | ارسال پیامک کد یکبارمصرف با درگاه SMS.ir |
| `POST` | `/api/auth/verify-otp` | `AuthController@verifyOtp` | تایید کد ۵ رقمی و صدور توکن ورود ۶۴ بیتی |
| `GET` | `/api/auth/me` | `AuthController@me` | دریافت مشخصات کاربر احرازهویت‌شده |
| `POST` | `/api/auth/logout` | `AuthController@logout` | ابطال و حذف توکن کاربر |
| `GET` | `/api/user/profile` | `UserController@getProfile` | پروفایل کاربر |
| `PUT` | `/api/user/profile` | `UserController@updateProfile` | ویرایش نام و مشخصات کاربر |
| `GET` | `/api/user/company` | `UserController@getCompany` | دریافت اطلاعات حقوقی شرکت |
| `POST` | `/api/user/company` | `UserController@saveCompany` | ثبت یا ذخیره مشخصات شرکت |
| `GET` | `/api/user/purchased-packages` | `UserController@getPurchasedPackages` | اشتراک‌ها و پکیج‌های خریداری‌شده کاربر |
| `GET` | `/api/departments` | `TicketController@getDepartments` | لیست دپارتمان‌های پشتیبانی |
| `GET` | `/api/tickets` | `TicketController@index` | لیست تیکت‌های کاربر |
| `POST` | `/api/tickets` | `TicketController@store` | ثبت تیکت جدید |
| `GET` | `/api/tickets/{id}` | `TicketController@show` | مشاهده پیام‌های تیکت |
| `POST` | `/api/tickets/{id}/reply` | `TicketController@reply` | ارسال پاسخ در تیکت |
| `PATCH` | `/api/tickets/{id}/close` | `TicketController@close` | بستن تیکت توسط کاربر |
| `POST` | `/api/orders/create` | `OrderController@create` | صدور فاکتور و ایجاد سفارش خرید |
| `POST` | `/api/transactions/verify` | `OrderController@verifyTransaction` | تایید پرداخت و فعال‌سازی آنی اشتراک |
| `GET` | `/api/admin/overview` | `AdminController@overview` | آمار کلان، درآمد و داده‌های زنده نمودار فروش |
| `GET` | `/api/admin/users` | `AdminController@users` | لیست کاربران با امکان تغییر وضعیت/نقش |
| `GET` | `/api/admin/tickets` | `AdminController@tickets` | تیکت‌های پشتیبانی در پنل مدیریت |
| `GET` | `/api/admin/audit-logs` | `AdminController@auditLogs` | مشاهده لاگ‌های حسابرسی و امنیتی |
| `GET` | `/api/pricing/modules` | `PricingController@getModules` | لیست ماژول‌های فعال برای محاسبه‌گر |
| `POST` | `/api/admin/pricing/save` | `PricingController@saveAdminPricing` | ذخیره قیمت و ماژول‌ها توسط مدیر |

---

## ⚙️ تنظیم متغیرهای محیطی Laravel (.env)

| نام متغیر | توضیح | مقدار پیشنهادی |
| :--- | :--- | :--- |
| `APP_NAME` | نام اپلیکیشن | `KaroVita` |
| `APP_ENV` | محیط اجرا | `production` |
| `APP_KEY` | کلید رمزنگاری لاراول | تولید خودکار با `php artisan key:generate` |
| `APP_DEBUG` | نمایش خطاهای سیستمی | `false` (در محیط عملیاتی) |
| `APP_URL` | دامنه اصلی سایت | `https://yourdomain.com` |
| `DB_CONNECTION` | درایور پایگاه داده | `mysql` |
| `DB_HOST` | آدرس سرور دیتابیس | `127.0.0.1` |
| `DB_PORT` | پورت دیتابیس | `3306` |
| `DB_DATABASE` | نام دیتابیس در هاست | `your_db_name` |
| `DB_USERNAME` | نام کاربری دیتابیس | `your_db_user` |
| `DB_PASSWORD` | کلمه عبور دیتابیس | `your_db_password` |
| `SMS_DRIVER` | درایور ارسال پیامک | `sms_ir` |
| `SMS_IR_API_KEY` | کلید درگاه SMS.ir | `ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z` |
| `SMS_IR_TEMPLATE_ID` | شناسه قالب تایید SMS.ir | `418155` |
| `SMS_IR_PARAM_NAME` | نام پارامتر متغیر در قالب | `CODE` |

---

## 📁 ساختار پروژه (Project Structure)

```text
karovita/
├── backend/                       # بک‌اند کامل فریم‌ورک PHP Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/       # کنترلرهای Auth, User, Ticket, Order, Admin, Pricing
│   │   │   └── Middleware/        # میدل‌ور احراز هویت توکن (TokenAuth) و ادمین
│   │   └── Models/                # مدل‌های Eloquent (User, Order, Ticket, Subscription, ...)
│   ├── database/
│   │   ├── migrations/            # مایگریشن‌های ساخت جداول دیتابیس MySQL
│   │   └── seeders/               # سیدر اطلاعات اولیه و حساب مدیر ارشد
│   ├── routes/
│   │   └── api.php                # تمام مسیرهای استاندارد RESTful API
│   ├── .env.example               # نمونه تنظیمات محیطی لاراول
│   └── composer.json              # نیازمندی‌ها و وابستگی‌های پکیج‌های PHP
├── src/                           # فرانت‌اند مدرن React 18
│   ├── components/                # کامپوننت‌های رابط کاربری
│   │   ├── Admin/                 # پنل‌های مدیریت تعرفه، تیکت‌ها، کاربران و لاگ‌ها
│   │   ├── Common/                # دکمه تم روشن/تاریک و ابزارهای عمومی
│   │   ├── Dashboard/             # نمودار تحلیلی روند فروش ماهانه با Recharts
│   │   ├── Landing/               # صفحه نخست (Welcome) با دکمه ورود
│   │   ├── PricingConfigurator/   # محاسبه‌گر تعرفه ماژول‌های ERP
│   │   ├── Subscription/          # جزئیات پکیج‌ها و پلن‌ها
│   │   └── Tickets/               # سیستم تیکتینگ کاربران و کارشناسان
│   ├── styles/                    # استایل‌های سراسری، تم روز/شب و PWA
│   ├── App.jsx                    # روتینگ اصلی فرانت‌اند
│   └── main.jsx                   # نقطه ورود React
├── public/                        # فایل‌های استاتیک، مانیفست PWA و لوگوها
├── package.json                   # اسکریپت‌های بیلد فرانت‌اند
└── README.md                      # مستندات جامع پروژه
```

---

## 👑 اطلاعات مدیر ارشد و حساب پیش‌فرض

کلیه داده‌های تستی پاک‌سازی شده و پایگاه داده با اجرای Seeder لاراول حاوی تنها حساب مدیر ارشد فعال است:

| نقش | شماره موبایل | نام مدیر ارشد | سطح دسترسی |
| :--- | :--- | :--- | :--- |
| **مدیر ارشد سامانه (Super Admin)** | `09111273476` | اردلان داوودی | دسترسی نامحدود به داشبورد، مدیریت تعرفه‌ها، تیکت‌ها، کاربران و لاگ‌ها |

---

## ⚡ دستورات کاربردی Artisan و Composer

| دستور | عملکرد |
| :--- | :--- |
| `composer install --no-dev --optimize-autoloader` | نصب و بهینه‌سازی وابستگی‌های PHP برای پروداکشن |
| `php artisan key:generate` | تولید کلید رمزنگاری امن `APP_KEY` در فایل `.env` |
| `php artisan migrate --force` | اجرای مایگریشن‌ها و ایجاد جداول دیتابیس MySQL |
| `php artisan db:seed --force` | ایجاد اطلاعات پایه (حساب مدیر ارشد، دپارتمان‌ها و تعرفه‌ها) |
| `php artisan config:cache` | کش کردن کانفیگ‌ها جهت افزایش سرعت در هاست |
| `php artisan route:cache` | کش کردن روت‌های API جهت بیشترین سرعت پاسخ‌دهی |

---

**توسعه‌یافته برای سامانه کارویتا (KaroVita Cloud ERP)**  
جهت ارسال تغییرات به مخزن گیت‌هاب:
```bash
git add .
git commit -m "feat: complete PHP Laravel backend transition and directadmin deployment docs"
git push -u origin main
```
