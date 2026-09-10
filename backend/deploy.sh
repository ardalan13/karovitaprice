#!/bin/bash

# KaroVita Production Optimization Script
# Run this script after deployment to optimize Laravel for production

echo "🚀 Starting KaroVita Production Optimization..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.production.example to .env and configure it first."
    exit 1
fi

# Check if APP_KEY is set
if grep -q "APP_KEY=$" .env || grep -q "APP_KEY=base64:GENERATE" .env; then
    echo "⚠️  APP_KEY not set. Generating..."
    php artisan key:generate --force
fi

echo "📦 Installing Composer dependencies (production mode)..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "🗄️  Running database migrations..."
php artisan migrate --force

echo "🔗 Creating storage symbolic link..."
php artisan storage:link

echo "⚡ Caching configuration..."
php artisan config:cache

echo "⚡ Caching routes..."
php artisan route:cache

echo "⚡ Caching views..."
php artisan view:cache

echo "⚡ Optimizing application..."
php artisan optimize

echo "🧹 Clearing old caches..."
php artisan cache:clear

echo "📝 Setting correct permissions..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || echo "⚠️  Could not set ownership (run with sudo if needed)"

echo ""
echo "✅ Production optimization complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your web server (Nginx/Apache)"
echo "2. Set up SSL certificates"
echo "3. Configure queue workers (systemd service)"
echo "4. Set up cron jobs for Laravel scheduler"
echo "5. Configure Redis for sessions and cache"
echo "6. Test the application thoroughly"
echo ""
echo "📖 See PRODUCTION_DEPLOYMENT.md for detailed instructions"
