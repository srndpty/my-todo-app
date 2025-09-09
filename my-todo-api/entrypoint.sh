#!/bin/sh

# storage と bootstrap/cache ディレクトリの所有者をwww-dataに変更
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Supervisordを起動
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf