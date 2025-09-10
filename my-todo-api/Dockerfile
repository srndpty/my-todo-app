# -- PHPのベースイメージ --
# Alpine Linuxベースで軽量なPHP-FPMイメージを使用
FROM php:8.3-fpm-alpine

# 必要なツールとPHP拡張機能をインストール
# supervisorはアプリケーションの実行に必要なので残す
RUN apk add --no-cache \
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
    pdo pdo_pgsql \
    zip

# Composerをグローバルにインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 作業ディレクトリを設定
WORKDIR /var/www/html

# NginxとSupervisorの設定ファイルをコピー
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# アプリケーションのコードをコピー
# この時点ではvendorディレクトリは含まない
COPY . .

# パーミッションを設定
# storageとbootstrap/cacheの所有者をwww-dataに変更
RUN chown -R www-data:www-data storage bootstrap/cache

# ポートを開放
EXPOSE 80

# コンテナ起動時にSupervisorを実行
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]