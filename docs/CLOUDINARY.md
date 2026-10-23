# Cloudinary

Fitur: foto pada catatan pertemuan vendor, dokumen penawaran pada kandidat (PDF + gambar), dan **foto + video pada Kenangan**.
Format gambar: JPG, PNG, WebP, **HEIC/HEIF**. Format video (hanya Kenangan): **MOV**, MP4, WebM. 20 berkas per item.
Batas dihitung **setelah dikompres**: gambar/PDF 10 MB (`MEDIA_MAX_BYTES`), video 100 MB (`MEDIA_VIDEO_MAX_BYTES`), sama dengan batas paket gratis Cloudinary.

## Kompresi di browser (sebelum unggah)
Server tidak memproses berkas (container tidak punya ffmpeg, dan tunnel membatasi ukuran request), jadi `resources/js/lib/compress-media.ts` mengompres di browser:
- **Gambar**: HEIC di-decode dengan `heic-to` (dimuat hanya bila perlu, ±3 MB), orientasi EXIF diterapkan, sisi terpanjang ≤ 2560 px, JPEG kualitas 0,86. Gambar non-HEIC ≤ 1,2 MB yang sudah ≤ 2560 px dikirim apa adanya; hasil yang tidak lebih kecil dibuang. Bila masih di atas batas, kualitas/ukuran diturunkan bertahap seperlunya.
- **Video**: transcode lewat WebCodecs (`mediabunny`) ke MP4 H.264 + AAC, maks. 1080p dan 30 fps, bitrate ±0,085 bit/piksel/frame (±5 Mbps untuk 1080p30) lalu dibatasi agar hasil pasti di bawah batas ukuran menurut durasi. Video yang sudah hemat tidak diproses ulang. Contoh uji: MOV 4K HEVC 40 MB → MP4 1080p 4,4 MB dengan audio utuh.
- **Tanpa dukungan browser** (mis. tanpa WebCodecs atau codec HEVC): berkas asli dikirim hanya bila masih muat dalam batas; jika tidak, pengguna diberi pesan agar memakai Chrome/Edge/Safari terbaru.
- Berkas mentah maksimal 60 MB (gambar) / 1 GB (video) sebelum dikompres. Batas hasil akhir dibagikan ke klien lewat shared prop Inertia `media`; server tetap memverifikasi ulang saat konfirmasi.

Penayangan: HEIC dikirim sebagai JPEG, video sebagai MP4 (`.mov`/`.webm` sumber ditranskode Cloudinary saat diminta). Sampul video: `GET /media/{asset}/poster` (bingkai pertama, 960 px).

## Konfigurasi
`.env` (jangan di-commit; lihat `.env.example`): `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_ROOT_FOLDER`,
`MEDIA_MAX_BYTES`, `MEDIA_MAX_PER_ITEM`. Semua dibaca lewat `config/media.php`. Tanpa kredensial, `POST /media/tanda-tangan` → 503.
`API_SECRET` hanya dipakai di server dan tidak pernah dikirim ke browser.

## Alur
1. `POST /media/tanda-tangan` `{target, target_id, resource_type?: image|video}` — server memuat model target (scope `wedding_id` → ID workspace lain = 404), membuat
   `public_id` = `{ROOT}/weddings/{wedding_id}/{target}/{id}/{acak}`, menyimpan baris `media_assets` berstatus `pending`, dan mengembalikan
   parameter unggah bertanda tangan (`type=authenticated`, `allowed_formats`). Klien **tidak** memilih folder atau public_id.
2. Browser mengompres berkas, lalu mengunggah langsung ke Cloudinary (`/image/upload` atau `/video/upload` sesuai `resource_type` yang diminta; video hanya untuk target yang punya `video_formats` di `config/media.php`).
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
- Alur video/HEIC **belum diuji ke Cloudinary sungguhan** (hanya fake di test dan kompresi di Chrome). Jalankan `php artisan media:check` lalu coba unggah satu MOV dan satu HEIC dari UI.
- Transkode `.mov` → MP4 saat penayangan dilakukan Cloudinary; video HEVC yang tidak bisa dikompres di browser (mis. Firefox) tetap diunggah asli bila ≤ 100 MB.
