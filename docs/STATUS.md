# STATUS (jujur)

## Selesai
Login tanpa pendaftaran publik; onboarding; undangan pasangan; anggaran (kategori, item, pembayaran, dana, tabungan);
timeline + template + ubah Hari H dengan pratinjau; vendor (slot, kandidat, skor, pertemuan, perbandingan, pilih vendor);
dashboard; pengaturan; seeder demo (dev saja); 102 test Pest di PostgreSQL (termasuk IDOR); CI PostgreSQL; `composer audit` & `npm audit` bersih.

## Our Little World (docs/OUR_LITTLE_WORLD.md)
Selesai & diuji (Pest, 128 lulus): landing publik `/`, Kenangan (foto lewat Cloudinary privat), Catatan (privat/bersama + tanggal buka, dipaksa di server), countdown hidup, hero dashboard.
Kode selesai tetapi **belum dilihat di browser**: dunia 3D (lihat `docs/WORLD_3D.md`).
Keputusan: Hari H tetap `date` (aturan AGENTS.md), bukan datetime; palet pastel hanya untuk landing & dunia 3D, halaman fungsional tetap memakai token MASTER.md.
Belum: video/audio di Kenangan, tag/kategori kenangan, notifikasi, sidebar (navigasi tetap top bar + bottom bar), Vitest/axe.

## Landing sinematik (docs/LANDING_CINEMATIC.md)
Selesai dan dilihat di browser (desktop + mobile 390): video `public/videos/our-little-world.mp4` sebagai stage sticky, scroll ber-scrub (GSAP ScrollTrigger), 6 adegan.
Belum: optimasi/poster video (FFmpeg tidak ada), uji reduced motion/tablet/Safari.

## Sebagian
- Cloudinary: foto pertemuan + dokumen kandidat selesai dan diuji dengan fake (14 test); **belum diverifikasi ke Cloudinary sungguhan** — jalankan `php artisan media:check`.
- Satu Playwright smoke test (`tests/e2e/smoke.spec.ts`) lulus lokal terhadap server dev + Chromium yang sudah ada (`E2E_CHROMIUM`); **belum masuk CI**. Belum ada Vitest/axe.
- Tinjauan visual dilakukan (lihat PROGRESS.md); pemeriksaan keyboard/axe belum otomatis.

## Belum
- Moodboard dan dokumen umum (selain penawaran kandidat).
- Fase 2/3: pengingat pembayaran, ekspor `.ics`/CSV/PDF, PWA, daftar tamu, ekspor semua data, hapus workspace.
- 2FA (starter kit tanpa Fortify); header keamanan/CSP.
- Template tabel `task_templates` diganti konstanta PHP.

## Risiko
Kredensial DB & Cloudinary sempat terekspos di chat → rotasi. Belum diuji terhadap Supabase sungguhan selain `migrate:fresh`.
