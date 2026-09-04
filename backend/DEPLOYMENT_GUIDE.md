# راهنمای جامع استقرار بک‌اند لاراول کارویتا (KaroVita Cloud ERP - Laravel Deployment)

این پوشه شامل ساختار استاندارد و کامل فریم‌ورک **Laravel** برای مدیریت کامل APIها، پایگاه‌داده، مدل‌ها، کنترلرها و درخواست‌های سیستم ابری کارویتا است.

---

## 📂 ساختار پوشه‌بندی لاراول (Directory Structure)

```text
backend/
├── app/
│   ├── Console/             # فرامین زمان‌بندی‌شده و پشتیبان‌گیری
│   ├── Http/
│   │   ├── Controllers/     # کنترلرهای احراز هویت، تیکت، سفارش، مدیر و قیمت‌گذاری
│   │   ├── Middleware/      # احراز هویت با توکن و اعتبارسنجی نقش مدیر
│   │   └── Requests/        # اعتبارسنجی فرم‌ها و پارامترهای ورودی (Form Requests)
│   ├── Models/              # مدل‌های Eloquent (User, Order, Transaction, Ticket, ...)
│   ├── Providers/           # ارائه‌دهندگان سرویس (App, Route, Auth, Event)
│   └── Services/            # لاگر رخدادها و ارسال پیامک
├── bootstrap/
│   ├── app.php              # مقداردهی اولیه هسته لاراول
│   └── cache/               # کش تنظیمات و پکیج‌ها
├── config/                  # پیکربندی‌های کامل لاراول (database, auth, cors, services, ...)
├── database/
│   ├── migrations/          # مایگریشن‌های ساخت جداول دیتابیس
│   └── seeders/             # اطلاعات اولیه سیستم
├── public/                  # روت وب‌سرور (Document Root)
│   ├── index.php            # نقطه ورود درخواست‌های HTTP
│   ├── .htaccess            # بازنویسی مسیرها در Apache / LiteSpeed
│   └── robots.txt
├── routes/
│   ├── api.php              # کلیه روت‌های وب‌سرویس RESTful
│   ├── web.php              # روت‌های وب
│   └── console.php          # روت‌های خط فرمان
├── storage/                 # فضای نگهداری فایل‌ها، جلسات، کش و لاگ‌ها
│   ├── app/
│   ├── framework/
│   └── logs/
├── artisan                  # رابط خط فرمان لاراول
├── composer.json            # مدیریت پکیج‌ها و وابستگی‌ها
└── .env.example             # نمونه متغیرهای محیطی
```

---

## 💡 چرا پوشه `vendor` به صورت پیش‌فرض در مخزن قرار ندارد؟

در استاندارد جهانی توسعه نرم‌افزار با PHP و لاراول:
- پوشه `vendor/` شامل هزاران فایل پکیج‌های خارجی است و هیچ‌گاه در مخازن کد قرار داده نمی‌شود (در `.gitignore` است).
- پوشه `vendor/` توسط دستور `composer install` بر اساس فایل `composer.json` تولید می‌شود.

---

## 🚀 مراحل راه‌اندازی و استقرار روی هاست (سی‌پنل، دایرکت‌ادمین یا VPS)

### روش اول: استقرار در هاست دارای دسترسی SSH یا سرور مجازی (VPS)

۱. محتویات پوشه `backend` را در مسیر پروژه آپلود نمایید.
۲. فایل `.env.example` را به `.env` کپی کنید:
   ```bash
   cp .env.example .env
   ```
۳. اطلاعات دیتابیس MySQL و درگاه‌ها را در فایل `.env` وارد کنید.
۴. دستور نصب وابستگی‌ها را اجرا کنید تا پوشه `vendor/` ایجاد شود:
   ```bash
   composer install --no-dev --optimize-autoloader
   ```
۵. کلید اختصاصی اپلیکیشن را ایجاد کنید:
   ```bash
   php artisan key:generate
   ```
۶. مایگریشن‌های پایگاه‌داده را اجرا کنید:
   ```bash
   php artisan migrate --force
   ```
۷. دسترسی‌های پوشه‌های ذخیره‌سازی را تنظیم کنید:
   ```bash
   chmod -R 775 storage bootstrap/cache
   ```
۸. مسیر روت دامین یا ساب‌دامین خود (Document Root) را به پوشه `backend/public` متصل کنید.

---

### روش دوم: هاست اشتراکی بدون دسترسی SSH (cPanel / DirectAdmin)

۱. در سیستم لوکال خود یا سیستمی که PHP و Composer دارد، وارد پوشه `backend` شده و دستور زیر را اجرا کنید:
   ```bash
   composer install --no-dev --optimize-autoloader
   ```
   این دستور پوشه کامل `vendor/` را در سیستم شما می‌سازد.
۲. اکنون کل پوشه `backend` (شامل پوشه `vendor/` تولید شده) را Zip کرده و در هاست خود آپلود و Extract نمایید.
۳. در بخش **Domains** یا **Subdomains** هاست، مسیر **Document Root** را روی پوشه `backend/public` قرار دهید.
۴. سطح دسترسی (Permissions) پوشه‌های `storage` و `bootstrap/cache` را روی `775` یا `777` بگذارید.
۵. دیتابیس را ساخته و فایل SQL دیتابیس اولیه را در phpMyAdmin ایمپورت کنید.
