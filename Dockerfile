# Image pengembangan: kode TIDAK disalin ke image, tapi di-bind-mount lewat compose.
# Ubah kode di host → langsung terlihat di container, tanpa build ulang.
FROM php:8.4-cli-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libpq-dev libzip-dev libicu-dev \
    && docker-php-ext-install pdo_pgsql pgsql zip intl pcntl bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

WORKDIR /var/www/html
EXPOSE 8000
ENTRYPOINT ["entrypoint"]
# Bukan `artisan serve`: perintah itu membuang env container sehingga .env (Supabase) yang menang.
CMD ["sh", "-c", "cd public && exec php -S 0.0.0.0:8000 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php"]
