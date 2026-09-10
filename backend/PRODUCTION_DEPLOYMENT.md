# 🚀 دستورالعمل نصب و راه‌اندازی Production

## پیش‌نیازها
- PHP 8.2 یا بالاتر
- MySQL 8.0 یا بالاتر
- Redis Server
- Composer
- Node.js 18+ و npm

## مراحل راه‌اندازی Backend (Laravel)

### 1. نصب و پیکربندی اولیه

```bash
cd backend

# نصب dependencies
composer install --no-dev --optimize-autoloader

# کپی فایل environment
cp .env.production.example .env

# ویرایش .env و تنظیم موارد زیر:
# - APP_KEY (با php artisan key:generate تولید شود)
# - APP_DEBUG=false
# - APP_URL
# - DB_* (اطلاعات دیتابیس)
# - FRONTEND_URL (دامنه‌های مجاز)
# - ADMIN_MOBILES (شماره موبایل مدیران)
# - SMS_IR_API_KEY (کلید API پیامک)
# - REDIS_* (تنظیمات Redis)

# تولید کلید برنامه
php artisan key:generate

# اجرای migrations
php artisan migrate --force

# بهینه‌سازی Laravel برای production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# ایجاد symbolic link برای storage
php artisan storage:link
```

### 2. تنظیمات دسترسی فایل‌ها

```bash
# تنظیم مجوزها
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 3. راه‌اندازی Queue Workers

```bash
# ایجاد systemd service برای queue worker
sudo nano /etc/systemd/system/karovita-worker.service
```

محتوای فایل:
```ini
[Unit]
Description=KaroVita Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/php /path/to/backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# فعال‌سازی و اجرای service
sudo systemctl daemon-reload
sudo systemctl enable karovita-worker
sudo systemctl start karovita-worker
```

### 4. تنظیم Cron برای Laravel Scheduler

```bash
crontab -e
```

اضافه کردن این خط:
```
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

## مراحل راه‌اندازی Frontend (React + Vite)

### 1. Build Production

```bash
cd ..  # برگشت به root پروژه

# نصب dependencies
npm install

# ویرایش تنظیمات محیط (در صورت نیاز)
# - بررسی API endpoints در src/services/api.js

# Build برای production
npm run build

# فایل‌های build شده در پوشه dist قرار می‌گیرند
```

### 2. تنظیمات Nginx

```nginx
# Frontend (React SPA)
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /path/to/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing - redirect all to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API (Laravel)
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /path/to/backend/public;
    index index.php;

    # Security headers (additional to Laravel middleware)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=60r/m;
    limit_req zone=api_limit burst=10 nodelay;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Timeout settings
        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
    }

    # Deny access to sensitive files
    location ~ /\.(?!well-known).* {
        deny all;
    }

    location ~ /\.env {
        deny all;
    }
}
```

```bash
# تست و reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

## چک‌لیست امنیتی Final

- [ ] `APP_DEBUG=false` در `.env`
- [ ] `APP_KEY` تولید شده و منحصر به فرد
- [ ] `FRONTEND_URL` به دامنه‌های واقعی تنظیم شده
- [ ] `ADMIN_MOBILES` تنظیم شده (حذف شماره پیش‌فرض)
- [ ] `DB_PASSWORD` پسورد قوی
- [ ] `SMS_IR_API_KEY` کلید واقعی API
- [ ] SSL certificates نصب شده
- [ ] Firewall تنظیم شده (فقط پورت‌های 80, 443, 22)
- [ ] Redis password تنظیم شده
- [ ] Backup خودکار دیتابیس راه‌اندازی شده
- [ ] Log rotation تنظیم شده
- [ ] Monitoring راه‌اندازی شده

## دستورات مفید

```bash
# مشاهده لاگ‌های Laravel
tail -f backend/storage/logs/laravel.log

# مشاهده وضعیت queue worker
sudo systemctl status karovita-worker

# Restart queue worker بعد از تغییرات
sudo systemctl restart karovita-worker

# پاک کردن cache
cd backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# بازگشت cache برای production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

## Monitoring و Maintenance

### لاگ‌ها
- Laravel logs: `backend/storage/logs/`
- Nginx logs: `/var/log/nginx/`
- PHP-FPM logs: `/var/log/php8.2-fpm.log`

### Performance Monitoring
- نصب Laravel Telescope (فقط برای environment غیر production):
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

### Backup دیتابیس
```bash
# Script backup خودکار
#!/bin/bash
mysqldump -u karovita_user -p'PASSWORD' karovita_production | gzip > /backups/karovita_$(date +%Y%m%d_%H%M%S).sql.gz

# اضافه کردن به crontab برای backup روزانه
0 2 * * * /path/to/backup-script.sh
```

## مشکلات رایج و راه‌حل

### خطای 500 Internal Server Error
1. بررسی لاگ Laravel: `tail -f storage/logs/laravel.log`
2. بررسی مجوز فایل‌ها: `chmod -R 755 storage bootstrap/cache`
3. پاک کردن cache: `php artisan cache:clear && php artisan config:clear`

### خطای CORS
1. بررسی `FRONTEND_URL` در `.env`
2. Clear config cache: `php artisan config:clear`

### Queue jobs اجرا نمی‌شوند
1. بررسی وضعیت worker: `systemctl status karovita-worker`
2. Restart worker: `systemctl restart karovita-worker`
3. بررسی Redis connection

---

## پشتیبانی
برای مشکلات فنی، لاگ‌های خطا و اطلاعات سیستم را ارسال کنید.
