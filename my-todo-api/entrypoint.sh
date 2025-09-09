#!/bin/sh

# storage と bootstrap/cache ディレクトリの所有者をwww-dataに変更
# chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# キャッシュをクリア
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Supervisordを起動
exec /usr/bin/supervisord -c /etc/supervisord.conf