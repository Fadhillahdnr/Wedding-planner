# Wedding Planner Pribadi

Aplikasi privat untuk dua orang (owner + pasangan) merencanakan pernikahan: anggaran, timeline/tugas, dan vendor. Tanpa pendaftaran publik.

Stack: Laravel 12 · Inertia v2 · React 19 · TypeScript · Tailwind v4 · PostgreSQL.

## Menjalankan dari nol
```bash
composer install && npm ci
cp .env.example .env && php artisan key:generate   # isi DB_* (PostgreSQL)
php artisan migrate
php artisan app:create-owner --name="Nama" --email=kamu@contoh.com --password="minimal-12-karakter"
npm run build && php artisan serve
```
Login → onboarding → undang pasangan dari Pengaturan. Data contoh (dev saja): `php artisan db:seed --class=DemoSeeder`.

## Test & kualitas
```bash
docker run -d --name wp-test-pg -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=wedding_test -p 5433:5432 postgres:16-alpine
vendor/bin/pest && vendor/bin/pint --test && npx eslint resources/js && npx tsc --noEmit
```

Dokumen: `docs/ARCHITECTURE.md`, `DATABASE.md` (rumus), `DEPLOYMENT.md`, `DESIGN_SYSTEM.md`, `CLOUDINARY.md`, `STATUS.md`, `PROGRESS.md`.
