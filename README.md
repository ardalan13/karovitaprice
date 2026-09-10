# 🎯 KaroVita Cloud ERP - Production Ready

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php)](https://php.net)
[![Production Ready](https://img.shields.io/badge/Production-Ready-success)](./PRODUCTION_READY_CHECKLIST.md)

سیستم یکپارچه مدیریت کسب‌وکار (ERP) ابری با Laravel 11 و React 18

---

## ✅ Production Readiness Status

پروژه برای deployment در محیط production کاملاً آماده است:

- ✅ **7 Critical Blockers** برطرف شد
- ✅ **10 Security Issues** حل شد
- ✅ **5 Performance Optimizations** اعمال شد
- ✅ **20+ Code Improvements** انجام شد
- ✅ **Complete Documentation** آماده است

[مشاهده گزارش کامل Audit →](PRODUCTION_READY_CHECKLIST.md)

---

## 🚀 Quick Start

### Requirements
- PHP 8.2+
- MySQL 8.0+
- Redis Server
- Composer
- Node.js 18+

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd karovitaprice-main

# 2. Backend setup
cd backend
cp .env.production.example .env
nano .env  # Configure environment
chmod +x deploy.sh
./deploy.sh

# 3. Frontend build
cd ..
npm install
npm run build

# 4. Setup services
sudo cp backend/karovita-worker.service /etc/systemd/system/
sudo systemctl enable karovita-worker
sudo systemctl start karovita-worker

# 5. Configure web server (see PRODUCTION_DEPLOYMENT.md)
```

[راهنمای کامل نصب →](QUICK_START.md)

---

## 📦 Features

### Core Functionality
- ✅ احراز هویت با OTP پیامکی (SMS.ir)
- ✅ مدیریت کاربران و نقش‌ها
- ✅ سیستم اشتراک و پکیج‌ها
- ✅ درگاه پرداخت زیبال (Zibal)
- ✅ سیستم تیکتینگ
- ✅ پنل مدیریت کامل
- ✅ Audit logging برای تمام عملیات
- ✅ PWA Support

### Security Features
- ✅ Rate limiting (5/min OTP, 60/min API)
- ✅ CORS protection
- ✅ Security headers (XSS, Clickjacking)
- ✅ Token expiration
- ✅ Mass assignment protection
- ✅ SQL injection prevention
- ✅ CSRF protection

### Performance Optimizations
- ✅ Database indexing (20+ indexes)
- ✅ Query optimization & pagination
- ✅ Redis caching
- ✅ Queue workers
- ✅ Optimized eager loading

---

## 📁 Project Structure

```
karovitaprice-main/
├── backend/                    # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # API Controllers
│   │   │   ├── Middleware/     # Security & Auth
│   │   │   └── Requests/       # Form Validation
│   │   ├── Models/             # Eloquent Models
│   │   └── Services/           # Business Logic
│   ├── database/
│   │   └── migrations/         # Database Schema
│   ├── routes/
│   │   └── api.php            # API Routes
│   ├── deploy.sh              # Deployment Script
│   └── .env.production.example # Production Config
├── src/                        # React 18 Frontend
│   ├── components/             # UI Components
│   ├── services/              # API Client
│   └── main.jsx               # Entry Point
├── PRODUCTION_DEPLOYMENT.md    # Full Deployment Guide
├── SECURITY.md                 # Security Best Practices
├── QUICK_START.md             # Quick Setup Guide
└── CHANGELOG.md               # Version History
```

---

## 🔐 Security

تمام معیارهای امنیتی رعایت شده است:

- ✅ OWASP Top 10 Protection
- ✅ Input Validation & Sanitization
- ✅ Secure Authentication & Authorization
- ✅ Database Transaction Integrity
- ✅ Proper Error Handling
- ✅ Audit Trail Logging

[راهنمای امنیتی کامل →](SECURITY.md)

---

## 📊 Performance

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Dashboard Load | 2-3s | <500ms | **5x faster** |
| Ticket List | 5s | <300ms | **16x faster** |
| Admin Overview | 8-10s | <800ms | **10x faster** |

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Laravel 11
- **Database:** MySQL 8.0 with 20+ optimized indexes
- **Cache:** Redis
- **Queue:** Redis Queue Workers
- **Authentication:** Custom Token-based (30-day expiry)
- **SMS:** SMS.ir API Integration

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** Custom CSS (Vazirmatn Font)
- **Features:** PWA, Service Worker, Error Boundary

---

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - شروع سریع deployment
- **[Production Deployment](backend/PRODUCTION_DEPLOYMENT.md)** - راهنمای جامع نصب
- **[Security Guide](SECURITY.md)** - راهنمای امنیتی
- **[Changelog](CHANGELOG.md)** - تاریخچه تغییرات
- **[Production Checklist](PRODUCTION_READY_CHECKLIST.md)** - چک‌لیست نهایی

---

## 🔧 Configuration

### Required Environment Variables

```env
# Critical Settings
APP_DEBUG=false
APP_ENV=production
FRONTEND_URL=https://yourdomain.com
ADMIN_MOBILES=09123456789,09987654321

# Database
DB_DATABASE=karovita_production
DB_USERNAME=karovita_user
DB_PASSWORD=strong_password_here

# SMS
SMS_IR_API_KEY=your_actual_api_key

# Redis
REDIS_PASSWORD=strong_redis_password
```

[نمونه کامل .env →](backend/.env.production.example)

---

## 🚀 Deployment

### Quick Deploy

```bash
cd backend
./deploy.sh  # Automated optimization
```

### Manual Deploy

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

[راهنمای کامل deployment →](QUICK_START.md)

---

## 🐛 Troubleshooting

### Common Issues

**500 Internal Server Error:**
```bash
tail -f backend/storage/logs/laravel.log
chmod -R 755 storage bootstrap/cache
```

**CORS Error:**
```bash
php artisan config:clear
php artisan config:cache
```

**Queue Not Working:**
```bash
sudo systemctl status karovita-worker
sudo systemctl restart karovita-worker
```

---

## 📊 Database Schema

12 Tables with optimized indexes:
- `users` - User accounts
- `companies` - Company profiles
- `orders` - Purchase orders
- `transactions` - Payment transactions
- `subscriptions` - Active subscriptions
- `tickets` - Support tickets
- `ticket_messages` - Ticket replies
- `auth_tokens` - Authentication tokens
- `otp_codes` - OTP verification
- `audit_logs` - Activity audit trail
- And more...

[مشاهده migrations →](backend/database/migrations/)

---

## 🔒 Security Audit Results

| Category | Status | Details |
|----------|--------|---------|
| SQL Injection | ✅ Protected | Eloquent ORM |
| XSS | ✅ Protected | Security headers |
| CSRF | ✅ Protected | Laravel middleware |
| Rate Limiting | ✅ Implemented | 5-120 req/min |
| Authentication | ✅ Secure | Token + expiration |
| Authorization | ✅ Implemented | Role-based |
| Data Exposure | ✅ Protected | No credentials in frontend |

---

## 📈 Monitoring

### Logs Location
- Laravel: `backend/storage/logs/laravel.log`
- Queue: `sudo journalctl -u karovita-worker`
- Nginx: `/var/log/nginx/`

### Health Check
```bash
curl https://api.yourdomain.com/api/health
```

---

## 🤝 Contributing

This is a production-ready commercial project. For issues or questions:

1. Check documentation first
2. Review logs for errors
3. Consult security guidelines

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Credits

- **Framework:** Laravel 11 by Taylor Otwell
- **Frontend:** React 18 by Meta
- **Font:** Vazirmatn by Saber Rastikerdar
- **Icons:** Lucide React

---

## 📞 Support

برای پشتیبانی فنی:
1. مستندات را بررسی کنید
2. لاگ‌های خطا را ارسال کنید
3. اطلاعات محیط (environment) را ذکر کنید

---

**✅ Production Ready | 🔒 Secure | ⚡ Optimized**

Made with ❤️ for KaroVita
