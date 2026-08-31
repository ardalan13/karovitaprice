# 🚀 سامانه جامع کارویتا (Karovita Cloud ERP & Customer Portal)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

یک پلتفرم کامل و مدرن فول‌استک برای **محاسبه هوشمند قیمت و تعرفه ماژول‌های ERP**، **خرید و مدیریت اشتراک‌های سازمانی**، **ورود مستقیم به پنل ERP با ساب‌دامین اختصاصی (`crm.karovita.ir`)**، **وب‌اپلیکیشن پیش‌رونده (PWA)**، **سیستم جامع تیکتینگ و پشتیبانی دپارتمانی**، **پنل مدیریت ارشد ماژولار**، **درگاه پیامک سریع OTP با SMS.ir**، و **سامانه امنیتی و حسابرسی لاگ‌ها (Audit Logger)**.

---

## 📑 فهرست مطالب
1. [معرفی و امکانات کلیدی](#-امکانات-و-قابلیت‌های-کلیدی)
2. [معماری و پشته فناوری (Tech Stack)](#-معماری-و-پشته-فناوری-tech-stack)
3. [پیش‌نیازهای سیستمی](#-پیش‌نیازهای-سیستمی-prerequisites)
4. [راهنمای نصب در محیط ویندوز (Windows Setup)](#-راهنمای-نصب-و-راه‌اندازی-در-ویندوز-windows-setup)
5. [راهنمای استقرار در محیط پروداکشن / سرور لینوکس (Production Deployment)](#-راهنمای-استقرار-در-محیط-عملیاتی-و-سرور-لینوکس-production)
   - [روش اول: استقرار با PM2 و Nginx](#روش-اول-استقرار-با-pm2-و-وبسرور-nginx-پیشنهادی)
   - [روش دوم: استقرار با Docker و Docker Compose](#روش-دوم-استقرار-با-docker-و-docker-compose)
6. [تنظیم متغیرهای محیطی (.env) و توضیح VAPID](#-تنظیم-متغیرهای-محیطی-environment-variables)
7. [ساختار پوشه‌ها و فایل‌های پروژه](#-ساختار-پروژه-project-structure)
8. [اطلاعات مدیر ارشد و حساب پیش‌فرض](#-اطلاعات-مدیر-ارشد-و-حساب-پیشفرض)
9. [دستورات کاربردی و اسکریپت‌ها](#-دستورات-کاربردی-scripts)

---

## 🌟 امکانات و قابلیت‌های کلیدی

### ۱. پورتال مشتریان و مدیریت اشتراک
* 🧮 **محاسبه‌گر داینامیک تعرفه ERP:** انتخاب ماژولار ماژول‌ها (CRM، انبار، حسابداری، فروش، پرسنلی و...) با بررسی پیش‌نیازهای هوشمند و بسته‌های اصناف.
* 📦 **خرید و فعال‌سازی اشتراک:** انتخاب دوره‌های ماهانه و سالانه با اعمال تخفیف و فعال‌سازی دوره ۵ روزه رایگان.
* 🔗 **دسترسی سریع به پنل سازمانی:** اتصال دکمه «ورود به پنل شخصی ERP» مستقیماً به پرتال سامانه (`https://crm.karovita.ir`).
* 🌓 **پشتیبانی کامل از تم روشن و تاریک (Dark/Light Mode):** همراه با دکمه تغییر حالت و ذخیره‌سازی خودکار در مرورگر.

### ۲. سیستم پیامک OTP و احراز هویت
* 📲 **درگاه پیامک SMS.ir (Fast Send / Verify REST API):** ارسال آنی کدهای یکبارمصرف با شناسه قالب اختصاصی (`418155`) و پارامتر `#CODE#`.
* 🛡️ **کنترل امنیتی Rate Limiting:** جلوگیری از ارسال رگباری پیامک و حملات اسپم به مسیرهای لاگین.

### ۳. سیستم جامع پشتیبانی و تیکتینگ (Ticketing System)
* 🎫 **ثبت و پیگیری تیکت:** تفکیک دپارتمان‌ها (فروش، فنی، مالی، مدیریت)، وضعیت‌ها و اولویت‌ها.
* 🔍 **جستجو و فیلتر پیشرفته:** امکان جستجوی سریع شماره تیکت (مانند `#58900157`)، موضوع، دپارتمان و نام کاربر با تبدیل خودکار ارقام فارسی/انگلیسی.
* 👨‍💼 **پنل ادمین تیکت‌ها:** پاسخگویی، ارجاع تیکت به کارشناس، تغییر وضعیت و ابزار اختصاصی پاک‌سازی تیکت‌های تستی.

### ۴. پنل مدیریت ارشد و امنیت
* ⚙️ **مدیریت کامل قیمت‌گذاری و ماژول‌ها:** افزودن، ویرایش قیمت ماژول‌ها، تعریف اصناف و کدهای تخفیف.
* 👥 **مدیریت کاربران و نقش‌ها:** مشاهده لیست کاربران و تخصیص نقش‌های Admin / User / Support.
* 📈 **گزارشات و نمودارهای تحلیلی فروش با Recharts:** نمودارهای عملکرد فروش هفتگی، روزانه و تفکیک پکیج‌ها در داشبورد مدیریت.
* 🛡️ **ثبت لاگ‌های حسابرسی (Audit Logging) و خطای محلی (Local Error Logger):** مانیتورینگ کلیه رخدادهای حساس و ثبت خطاها در فایل‌های محلی بدون نیاز به ابزارهای خارجی.

---

## 🛠️ معماری و پشته فناوری (Tech Stack)

| بخش | تکنولوژی |
| :--- | :--- |
| **فرانت‌اند (Frontend)** | React 18، Vite 5، Lucide React، Recharts، CSS Variables (Dark/Light) |
| **بک‌اند (Backend)** | Node.js (v20+)، Express 4.21، TypeScript، tsx |
| **بانک اطلاعاتی محلی** | Flat JSON Database (`data/db.json`) با اعتبارسنجی کامل شیوه ذخیره‌سازی |
| **درگاه پیامک OTP** | SMS.ir REST API (Verify Endpoint) |
| **وب‌پوش و اعلان** | Web Push API (پروتکل VAPID / RFC-8292) |
| **کامپایل سرور** | esbuild (تولید خروجی تک‌فایلی بهینه `dist/server.cjs`) |

---

## 📋 پیش‌نیازهای سیستمی (Prerequisites)

پیش از شروع نصب، موارد زیر را روی سیستم خود بررسی کنید:
1. **Node.js**: نسخه `20.x` یا بالاتر (توصیه: `v20.18.0` یا `v22.x LTS`) — [دانلود Node.js](https://nodejs.org/)
2. **npm** (نسخه `10.x` یا بالاتر) یا **pnpm / yarn**
3. **Git**: برای کلون کردن سورس‌کد پروژه — [دانلود Git](https://git-scm.com/)

---

## 💻 راهنمای نصب و راه‌اندازی در ویندوز (Windows Setup)

برای توسعه محلی یا اجرای پروژه در محیط سیستم‌عامل ویندوز (Windows 10 / 11 / Server):

### مرحله ۱: دریافت سورس پروژه
برنامه **PowerShell** یا **Command Prompt (cmd)** را باز کنید و دستورات زیر را وارد کنید:
```powershell
git clone https://github.com/your-username/karovita.git
cd karovita
```

### مرحله ۲: نصب پکیج‌ها و وابستگی‌ها
```powershell
npm install
```

### مرحله ۳: ساخت فایل تنظیمات محیطی (.env)
یک نسخه از فایل `.env.example` با نام `.env` ایجاد کنید:
```powershell
Copy-Item .env.example .env
```
*(برای محیط تستی محلی، تنظیمات پیش‌فرض به صورت خودکار کار می‌کنند و نیاز به تغییر فوری ندارند)*

### مرحله ۴: اجرای پروژه در محیط لوکال ویندوز
```powershell
npm run dev
```
برنامه در آدرس **`http://localhost:3000`** در دسترس خواهد بود.

---

## 🚀 راهنمای استقرار در محیط عملیاتی و سرور لینوکس (Production)

### آماده‌سازی بیلد نهایی پروژه
ابتدا روی سرور یا سیستم، دستور بیلد را اجرا کنید تا فرانت‌اند با Vite و سرور بک‌اند با esbuild کامپایل شوند:
```bash
npm run build
```
این دستور فایل‌های استاتیک را در پوشه `dist/` و سرور اجرایی را در `dist/server.cjs` ایجاد می‌کند.

---

### روش اول: استقرار با PM2 و وب‌سرور Nginx (پیشنهادی)

#### ۱. اجرای پروسه سرور با PM2
```bash
# نصب سراسری PM2
npm install -g pm2

# راه‌اندازی برنامه با محیط پروداکشن
pm2 start dist/server.cjs --name "karovita-app" --env NODE_ENV=production

# ذخیره وضعیت برای استارت خودکار پس از ریبوت سرور
pm2 save
pm2 startup
```

#### ۲. تنظیم وب‌سرور Nginx به عنوان Reverse Proxy و فعال‌سازی SSL
یک فایل کانفیگ در مسیر `/etc/nginx/sites-available/karovita.conf` ایجاد نمایید:

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

    # سرویس‌ورکر بدون کش برای دریافت آنی آپدیت‌ها
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

فعال‌سازی کانفیگ و ری‌استارت Nginx:
```bash
ln -s /etc/nginx/sites-available/karovita.conf /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

### روش دوم: استقرار با Docker و Docker Compose

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

## ⚙️ تنظیم متغیرهای محیطی (.env)

| نام متغیر | توضیح | مقدار پیشنهادی |
| :--- | :--- | :--- |
| `NODE_ENV` | حالت اجرای سرور (`development` یا `production`) | `production` |
| `APP_KEY` | کلید محرمانه رمزنگاری توکن‌های ورود JWT | یک رشته تصادفی و امن ۶۴ کاراکتری |
| `FRONTEND_URL` | دامنه دسترسی وب‌سایت | `https://yourdomain.com` |
| `SMS_DRIVER` | درایور ارسال پیامک (`sms_ir` یا `mediana` یا `log`) | `sms_ir` |
| `SMS_IR_API_KEY` | کلید API درگاه SMS.ir | `ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z` |
| `SMS_IR_TEMPLATE_ID` | شناسه قالب پیامک تأیید در SMS.ir | `418155` |
| `SMS_IR_PARAM_NAME` | نام متغیر داخل قالب SMS.ir | `CODE` |
| `VAPID_PUBLIC_KEY` | کلید عمومی وب‌پوش (اختیاری) | *در صورت خالی بودن خودکار تولید می‌شود* |
| `VAPID_PRIVATE_KEY` | کلید خصوصی وب‌پوش (اختیاری) | *در صورت خالی بودن خودکار تولید می‌شود* |
| `VAPID_SUBJECT` | ایمیل یا آدرس تماس صاحب وب‌پوش | `mailto:admin@karovita.ir` |

> ℹ️ **توضیح کلیدهای VAPID چیست؟**  
> کلیدهای `VAPID_PUBLIC_KEY` و `VAPID_PRIVATE_KEY` برای استاندارد **ارسال نوتیفیکیشن مرورگر (Web Push Notifications)** به کار می‌روند. این کلیدها به سرور اجازه می‌دهند پیام‌های اعلان تیکت و سیستم را بدون واسطه به مرورگر کاربران بفرستد.  
> **آیا نیاز است حتماً این کلیدها را وارد کنید؟ خیر!** اگر این متغیرها در فایل `.env` خالی بمانند، پروژه به صورت کاملاً خودکار در اولین اجرا یک جفت کلید معتبر استاندارد تولید کرده و در فایل `data/vapid.json` ذخیره می‌کند. بنابراین نیازی به پر کردن دستی آن‌ها ندارید.

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
│   ├── db.json                # پایگاه داده JSON
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

کلیه داده‌های تستی پاک‌سازی شده و تنها حساب مدیر ارشد در دیتابیس فعال است:

| نقش | شماره موبایل | توضیحات دسترسی |
| :--- | :--- | :--- |
| **مدیر ارشد و مالک سامانه (Super Admin)** | `09111273476` | دسترسی نامحدود به مدیریت تعرفه‌ها، کاربران، لاگ‌ها و تیکت‌ها |

---

## ⚡ دستورات کاربردی (Scripts)

| دستور | عملکرد |
| :--- | :--- |
| `npm run dev` | اجرای همزمان کلاینت و سرور با ری‌لود سریع برای محیط توسعه |
| `npm run build` | کامپایل کامل فرانت‌اند و ایجاد سرور تک‌فایلی پروداکشن در `dist/` |
| `npm start` | اجرای نسخه بیلدشده پروداکشن (`node dist/server.cjs`) |

---

**توسعه‌یافته برای سامانه کارویتا (KaroVita)**  
جهت انتقال به مخزن گیت‌هاب، کافیست مخزن را ایجاد نموده و دستورات `git remote add origin` و `git push -u origin main` را اجرا فرمایید.
