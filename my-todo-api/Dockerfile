# ステップ1: PHPのベースイメージと拡張機能のインストール
FROM php:8.3-fpm-alpine AS php

# Alpine Linuxのパッケージをインストール
RUN apk add --no-cache \
    curl \
    nginx \
    supervisor \
    git \
    libzip-dev \
    zip \
    libpng-dev \
    jpeg-dev \
    freetype-dev \
    postgresql-dev

# PHP拡張機能をインストール
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo pdo_mysql pdo_pgsql \
    zip

# Composerをインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# NginxとPHP-FPMの設定ファイルをコピー
COPY nginx.conf /etc/nginx/nginx.conf
COPY www.conf /usr/local/etc/php-fpm.d/www.conf
COPY supervisord.conf /etc/supervisord.conf

WORKDIR /var/www/html

# ステップ2: アプリケーションのコードと依存関係のインストール
FROM php AS app

# アプリケーションのコードをコピー
COPY --chown=www-data:www-data . .

# Composerの依存関係をインストール
RUN composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist --optimize-autoloader

# Laravelのキャッシュを作成
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

# パーミッションの設定
RUN chown -R www-data:www-data storage bootstrap/cache

# 最終的なイメージ
FROM app as final

# 必要なファイルだけをコピー
COPY --from=app /var/www/html /var/www/html
COPY --from=php /etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=php /usr/local/etc/php-fpm.d/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY --from=php /etc/supervisord.conf /etc/supervisord.conf
COPY --from=php /usr/local/bin/docker-php-entrypoint /usr/local/bin/docker-php-entrypoint
COPY --from=php /usr/sbin/nginx /usr/sbin/nginx
COPY --from=php /usr/local/sbin/php-fpm /usr/local/sbin/php-fpm
COPY --from=php /usr/bin/supervisorctl /usr/bin/supervisorctl
COPY --from=php /usr/bin/supervisord /usr/bin/supervisord

# ポートを開放
EXPOSE 80

# Supervisorを起動
# CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# ↓↓↓ 上のCMDの行を、以下の3行に置き換えてください ↓↓↓
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]