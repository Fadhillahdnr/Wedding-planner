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

## Docker Desktop (bind mount)
```bash
docker compose up -d --build        # sekali saja (build pertama ±3 menit: composer + npm)
docker compose exec app php artisan app:create-owner --name="Nama" --email=kamu@contoh.com --password="minimal-12-karakter"
```
Buka http://localhost:8000. Kode di folder ini di-bind-mount ke container: edit PHP → langsung aktif, edit React → HMR Vite (port 5173),
tanpa `compose up`/build ulang. Rebuild hanya perlu bila `Dockerfile` berubah. `vendor/` dan `node_modules/` disimpan di volume Docker (bukan di host).
Container selalu memakai PostgreSQL lokal (`db`, host port 5434), bukan Supabase di `.env`. Perintah lain: `docker compose exec app vendor/bin/pest`
(DB test `wedding_test` tersedia, tetapi `phpunit.xml` menunjuk 127.0.0.1:5433 — lihat catatan di bawah), `docker compose down` (tambah `-v` untuk menghapus data).

## Test & kualitas
```bash
docker run -d --name wp-test-pg -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=wedding_test -p 5433:5432 postgres:16-alpine
vendor/bin/pest && vendor/bin/pint --test && npx eslint resources/js && npx tsc --noEmit
```

Dokumen: `docs/ARCHITECTURE.md`, `DATABASE.md` (rumus), `DEPLOYMENT.md`, `DESIGN_SYSTEM.md`, `CLOUDINARY.md`, `STATUS.md`, `PROGRESS.md`.
