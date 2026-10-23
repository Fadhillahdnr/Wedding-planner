# Deployment

Env produksi: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` (HTTPS), `DB_*` (PostgreSQL), `CLOUDINARY_*`, `MAIL_*`.
Langkah: `composer install --no-dev -o`, `npm ci && npm run build`, `php artisan migrate --force`, `php artisan config:cache route:cache view:cache`.
Owner pertama: `php artisan app:create-owner`. Jangan jalankan `DemoSeeder` (melempar error di produksi).
Queue: `php artisan queue:work` (driver `database`). Health check: `/up`.

## Backup & restore
- Backup: `pg_dump --format=custom --no-owner "$DATABASE_URL" -f wedding-$(date +%F).dump` (terjadwal; simpan di luar server).
- Restore: `pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" wedding-YYYY-MM-DD.dump`. Uji restore ke DB kosong sebelum diandalkan.
- Supabase pooler (port 6543, transaction mode) cocok untuk aplikasi; untuk `pg_dump`/migrasi besar pakai koneksi langsung/session pooler.

## Rahasia
Kata sandi DB dan secret Cloudinary pernah tertempel di percakapan pengembangan — **putar (rotate) keduanya** sebelum produksi.
