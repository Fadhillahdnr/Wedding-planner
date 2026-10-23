#!/usr/bin/env bash
set -e

cd /var/www/html

[ -f .env ] || cp .env.example .env

# Dependensi tinggal di volume (bukan di host) supaya biner Linux tidak bentrok dengan macOS.
if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist
fi

grep -q '^APP_KEY=base64' .env || php artisan key:generate --force

# Tunggu PostgreSQL siap, lalu migrasi (idempoten).
until php -r 'new PDO("pgsql:host=".getenv("DB_HOST").";port=".getenv("DB_PORT").";dbname=".getenv("DB_DATABASE"), getenv("DB_USERNAME"), getenv("DB_PASSWORD"));' 2>/dev/null; do
    echo "Menunggu database…"
    sleep 1
done
php artisan migrate --force

exec "$@"
