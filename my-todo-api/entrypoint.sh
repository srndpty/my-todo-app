#!/bin/sh

# 本番環境では、まずマイグレーションを実行する
# （マイグレーションジョブを別に作らない、よりシンプルな方法）
php artisan migrate --force

# キャッシュをクリアし、再生成する
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Supervisordを起動して、Webサーバを開始
exec /usr/bin/supervisord -c /etc/supervisord.conf