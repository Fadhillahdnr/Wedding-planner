# Lumière Wedding — Wedding Planner (demo)

Situs wedding planner berbasis Laravel 12 + React (TypeScript) + Inertia, dengan katalog paket/vendor, form konsultasi (lead), booking, dashboard pelanggan (checklist & anggaran), dashboard admin/staff, dan fondasi integrasi Cloudinary. Seluruh konten seed adalah **data demo**.

## Stack
Laravel 12 · PHP 8.2+ · Inertia 2 · React 19 · TypeScript · Vite · Tailwind 4 · shadcn/ui (Radix) · Motion · Pest · Cloudinary PHP SDK.
Database target produksi: **PostgreSQL**. Lokal default: SQLite (skema memakai tipe yang kompatibel dengan PostgreSQL; **belum diuji pada PostgreSQL** karena server tidak tersedia saat pengembangan).

## Menjalankan
```bash
composer install && npm install
cp .env.example .env && php artisan key:generate
touch database/database.sqlite          # atau atur DB_* ke PostgreSQL
php artisan migrate --seed
composer dev                             # server + queue + vite
```
Akun demo (hanya lokal, password `password`): `admin@demo.test`, `staff@demo.test`, `customer@demo.test`.

## Perintah kualitas
```bash
php artisan test        # Pest
npx tsc --noEmit        # typecheck
npm run lint && npm run format:check
./vendor/bin/pint --test
npm run build           # produksi
```

## Konfigurasi
Lihat `.env.example`. Identitas brand/kontak: `SITE_*` (dibaca `config/site.php`). Cloudinary: `CLOUDINARY_*` — lihat `docs/CLOUDINARY.md`. Email memakai `MAIL_MAILER=log` secara default (belum ada provider; tidak ada email terkirim).

## Status fitur
**Selesai & diuji (backend):** halaman publik (beranda, paket, detail paket, vendor + filter/pagination, portofolio), form konsultasi (validasi, honeypot, rate limit, simpan lead), sitemap/robots/meta SEO, auth (starter kit), role `admin/staff/customer`, booking dengan transisi status + riwayat + cegah duplikasi, dashboard pelanggan (detail acara, checklist, anggaran), admin (ringkasan, lead, booking, CRUD paket), endpoint media Cloudinary (signature, catat metadata, hapus, akses privat) dengan test memakai fake gateway.

**Belum selesai:** CRUD admin untuk vendor/portofolio/FAQ/kategori; modul vendor (login & kelola profil sendiri); UI upload media (endpoint siap, belum ada komponen uploader/lightbox/pemutar musik); favorit vendor (tabel ada, belum ada UI); edit/hapus detail checklist; notifikasi email; SSR belum diaktifkan di server (build SSR berhasil, proses `inertia:start-ssr` belum diverifikasi); tes frontend otomatis & audit Lighthouse belum dijalankan.

**Butuh kredensial/keputusan bisnis:** akun Cloudinary, provider email, payment gateway (pembayaran saat ini manual, tanpa integrasi), nama brand/logo/kontak final, foto nyata.
