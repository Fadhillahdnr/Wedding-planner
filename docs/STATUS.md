# STATUS (jujur)

## Selesai
Login tanpa pendaftaran publik; onboarding; undangan pasangan; anggaran (kategori, item, pembayaran, dana, tabungan);
timeline + template + ubah Hari H dengan pratinjau; vendor (slot, kandidat, skor, pertemuan, perbandingan, pilih vendor);
dashboard; pengaturan; seeder demo (dev saja); 102 test Pest di PostgreSQL (termasuk IDOR); CI PostgreSQL; `composer audit` & `npm audit` bersih.

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
