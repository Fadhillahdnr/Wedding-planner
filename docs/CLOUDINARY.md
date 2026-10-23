# Cloudinary

**Status: belum diimplementasikan di versi pribadi ini.** Tabel `media_assets` dan rate limiter `media-signature` sudah ada,
kredensial tersedia di `.env` (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_ROOT_FOLDER`), tetapi belum ada
`MediaStorage`/`CloudinaryService`, UI unggah, atau tautan bertanda tangan.

Rancangan (brief §5): aset `type=authenticated`, folder ditentukan server `{ROOT}/weddings/{wedding_id}/...`, URL bertanda tangan berumur pendek,
server memverifikasi ulang `public_id`/format/ukuran, bersihkan aset yatim, batas 30 permintaan/menit.
Jangan pernah mengirim `API_SECRET` ke browser.
