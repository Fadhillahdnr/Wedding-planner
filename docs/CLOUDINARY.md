# Cloudinary

Fitur: foto pada catatan pertemuan vendor (JPG/PNG/WebP) dan dokumen penawaran pada kandidat (PDF + gambar). Maks. 10 MB, 20 berkas per item.

## Konfigurasi
`.env` (jangan di-commit; lihat `.env.example`): `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_ROOT_FOLDER`,
`MEDIA_MAX_BYTES`, `MEDIA_MAX_PER_ITEM`. Semua dibaca lewat `config/media.php`. Tanpa kredensial, `POST /media/tanda-tangan` → 503.
`API_SECRET` hanya dipakai di server dan tidak pernah dikirim ke browser.

## Alur
1. `POST /media/tanda-tangan` `{target, target_id}` — server memuat model target (scope `wedding_id` → ID workspace lain = 404), membuat
   `public_id` = `{ROOT}/weddings/{wedding_id}/{target}/{id}/{acak}`, menyimpan baris `media_assets` berstatus `pending`, dan mengembalikan
   parameter unggah bertanda tangan (`type=authenticated`, `allowed_formats`). Klien **tidak** memilih folder atau public_id.
2. Browser mengunggah langsung ke Cloudinary.
3. `POST /media/{asset}/konfirmasi` — server memeriksa ulang aset lewat Admin API (ada? format diizinkan? ukuran ≤ batas?). Bila tidak, aset dan baris dihapus. Bila ya → `ready`.
4. `GET /media/{asset}` — hanya anggota workspace pemilik; mengalihkan (302) ke URL bertanda tangan (`s--sig--`). Aset `pending` → 404.
5. `DELETE /media/{asset}` — hapus di Cloudinary **dulu**; baris DB hanya dihapus bila itu berhasil (gagal → 502, baris dipertahankan).

Menghapus pertemuan/kandidat ikut menghapus medianya. Slot yang dihapus (cascade DB) bisa meninggalkan yatim; `php artisan media:prune`
(terjadwal harian) menghapus unggahan `pending` > 24 jam dan aset yang induknya sudah hilang. Rate limit 30/menit pada tanda tangan dan konfirmasi.

## Kode
`app/Services/Media/{MediaStorage,CloudinaryService,MediaLibrary}.php`, `app/Http/Controllers/MediaController.php`,
`resources/js/components/planner/media-gallery.tsx`. Test memakai `tests/Support/FakeMediaStorage.php`.

## Verifikasi
Test Pest memakai fake, **bukan** Cloudinary sungguhan. Jalankan uji nyata dari mesin yang bisa menjangkau Cloudinary:

    php artisan media:check

(unggah PNG 1×1, inspect, URL bertanda tangan terbuka, URL tanpa tanda tangan ditolak, hapus). Perintah ini belum pernah dijalankan oleh
pengembang awal karena `api.cloudinary.com` tidak terjangkau dari lingkungan pengembangannya.

## Batasan
- URL bertanda tangan Cloudinary bersifat tetap (tidak kedaluwarsa) kecuali fitur token Akamai diaktifkan; URL hanya diberikan lewat rute yang diotorisasi, dan tidak bisa ditebak.
- Pratinjau PDF memakai tautan buka-di-tab-baru, bukan penampil bawaan.
- Moodboard, dokumen umum, dan ekspor belum ada.
