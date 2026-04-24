#!/bin/sh

set -e

echo "Starting production entrypoint..."

# Storage link
echo "Creating storage link..."
php artisan storage:link --force 2>/dev/null || true

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Cache for production
echo "Caching config, routes, views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "Production setup complete. Starting php-fpm..."

exec "$@"
