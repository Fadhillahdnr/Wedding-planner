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

## Docker Desktop (bind mount + link publik)
```bash
docker compose up -d --build        # sekali saja (build pertama ±3 menit: composer + npm)
./docker/url.sh                     # cetak link publik https://<acak>.trycloudflare.com
docker compose exec app php artisan app:create-owner --name="Nama" --email=kamu@contoh.com --password="minimal-12-karakter"
```
Lokal: http://localhost:8000. Link publik dibuat otomatis oleh service `tunnel` (Cloudflare quick tunnel) setiap `docker compose up`;
URL-nya **berubah tiap start** dan tidak butuh akun Cloudflare. Untuk URL tetap, pakai named tunnel (butuh akun + domain).

- Kode di-bind-mount: edit PHP langsung aktif; aset React dibangun ulang otomatis (`vite build --watch`) — muat ulang browser. Tanpa `compose up`/build ulang; rebuild hanya bila `Dockerfile` berubah.
- Aplikasi privat (tanpa pendaftaran, `noindex`), tetapi halaman login ikut terbuka untuk siapa pun yang tahu link. Pakai kata sandi kuat; `docker compose stop tunnel` untuk menutup akses publik.
- Container selalu memakai PostgreSQL lokal (`db`, host port 5434), bukan Supabase di `.env`.
- `vendor/` dan `node_modules/` ada di volume Docker. `docker compose down -v` menghapus data DB.
- Test belum bisa di container (`phpunit.xml` menunjuk 127.0.0.1:5433); jalankan dari host seperti di bawah.

## Test & kualitas
```bash
docker run -d --name wp-test-pg -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=wedding_test -p 5433:5432 postgres:16-alpine
vendor/bin/pest && vendor/bin/pint --test && npx eslint resources/js && npx tsc --noEmit
```

Dokumen: `docs/ARCHITECTURE.md`, `DATABASE.md` (rumus), `DEPLOYMENT.md`, `DESIGN_SYSTEM.md`, `CLOUDINARY.md`, `STATUS.md`, `PROGRESS.md`.
